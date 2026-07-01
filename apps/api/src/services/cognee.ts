/**
 * Cognee HTTP client — memory lifecycle for Consilium team brain.
 *
 * Wraps Cognee v1 REST API (remember / recall / improve / forget).
 * Postgres remains the UI source of truth; Cognee is the memory engine.
 *
 * @see .agent/cognee-integration.md
 */

import { getNodesByIds, updateNodeMetadata } from '../db/queries';
import type { RagContext } from './rag';

const NODE_ID_MARKER = /CONSILIUM_NODE_ID:([0-9a-f-]{36})/i;

const DEFAULT_TIMEOUT_MS = 60_000;
const RECALL_TIMEOUT_MS = 15_000;

export interface CogneeRememberResult {
  dataId: string | null;
}

export interface CogneeRecallOptions {
  sessionId?: string;
  searchType?: string;
  topK?: number;
}

function baseUrl(): string {
  return (process.env.COGNEE_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '');
}

function datasetName(): string {
  return process.env.COGNEE_DATASET ?? 'acme-litigation';
}

export function isCogneeEnabled(): boolean {
  return process.env.COGNEE_ENABLED !== 'false' && !!process.env.COGNEE_BASE_URL;
}

export function cogneeFallbackEnabled(): boolean {
  return process.env.COGNEE_FALLBACK_TO_PGVECTOR !== 'false';
}

function buildHeaders(contentType?: string): Record<string, string> {
  const headers: Record<string, string> = {};
  if (contentType) headers['Content-Type'] = contentType;
  const apiKey = process.env.COGNEE_API_KEY;
  if (apiKey) headers['X-Api-Key'] = apiKey;
  return headers;
}

async function cogneeFetch(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchInit } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${baseUrl()}${path}`, {
      ...fetchInit,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/** Format text payload with Postgres UUID marker for recall mapping. */
export function formatRememberPayload(params: {
  nodeId: string;
  title: string;
  nodeType: string;
  body: string;
  contributorName?: string;
  summary?: string;
}): string {
  const lines = [
    `CONSILIUM_NODE_ID:${params.nodeId}`,
    `Title: ${params.title}`,
    `Type: ${params.nodeType}`,
  ];
  if (params.contributorName) lines.push(`Contributor: ${params.contributorName}`);
  if (params.summary) lines.push(`Summary: ${params.summary}`);
  lines.push('', params.body);
  return lines.join('\n');
}

export function parseNodeIdFromText(text: string): string | null {
  const match = text.match(NODE_ID_MARKER);
  return match ? match[1] : null;
}

function extractDataId(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const obj = payload as Record<string, unknown>;
  const candidates = [
    obj.data_id,
    obj.dataId,
    obj.id,
    (obj.data as Record<string, unknown> | undefined)?.id,
    (Array.isArray(obj) ? obj[0] : undefined) as Record<string, unknown> | undefined,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.length > 0) return c;
    if (c && typeof c === 'object' && typeof (c as Record<string, unknown>).id === 'string') {
      return (c as Record<string, unknown>).id as string;
    }
  }
  return null;
}

function extractRecallTexts(payload: unknown): string[] {
  const texts: string[] = [];
  if (!payload) return texts;

  const items = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as Record<string, unknown>).results)
      ? ((payload as Record<string, unknown>).results as unknown[])
      : Array.isArray((payload as Record<string, unknown>).data)
        ? ((payload as Record<string, unknown>).data as unknown[])
        : [payload];

  for (const item of items) {
    if (typeof item === 'string') {
      texts.push(item);
      continue;
    }
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const text =
      (typeof row.text === 'string' && row.text) ||
      (typeof row.content === 'string' && row.content) ||
      (typeof row.answer === 'string' && row.answer) ||
      (row.raw && typeof (row.raw as Record<string, unknown>).text === 'string'
        ? ((row.raw as Record<string, unknown>).text as string)
        : null);
    if (text) texts.push(text);
    if (typeof row.question === 'string' && typeof row.answer === 'string') {
      texts.push(`${row.question}\n${row.answer}`);
    }
  }
  return texts;
}

function extractRecallScores(payload: unknown): number[] {
  const scores: number[] = [];
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as Record<string, unknown>)?.results)
      ? ((payload as Record<string, unknown>).results as unknown[])
      : [];
  for (const item of items) {
    if (item && typeof item === 'object') {
      const score = (item as Record<string, unknown>).score;
      if (typeof score === 'number') scores.push(score);
    }
  }
  return scores;
}

/**
 * Ingest a published insight into Cognee permanent memory.
 */
export async function rememberInsight(params: {
  nodeId: string;
  title: string;
  nodeType: string;
  body: string;
  contributorName?: string;
  summary?: string;
}): Promise<CogneeRememberResult> {
  if (!isCogneeEnabled()) return { dataId: null };

  const text = formatRememberPayload(params);
  const dataset = datasetName();

  const form = new FormData();
  form.append('datasetName', dataset);
  form.append('data', new Blob([text], { type: 'text/plain' }), 'insight.txt');

  const response = await cogneeFetch('/api/v1/remember', {
    method: 'POST',
    headers: buildHeaders(),
    body: form,
    timeoutMs: 120_000,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Cognee remember failed (${response.status}): ${errText.slice(0, 500)}`);
  }

  const json = await response.json().catch(() => null);
  const dataId = extractDataId(json);
  if (dataId) {
    await updateNodeMetadata(params.nodeId, {
      cognee_data_id: dataId,
      cognee_dataset: dataset,
    });
  }
  return { dataId };
}

/**
 * Recall from Cognee and map results to Postgres RagContext entries.
 */
export async function recallForQuery(
  query: string,
  options: CogneeRecallOptions = {}
): Promise<{ contexts: RagContext[]; nodeIds: string[] }> {
  if (!isCogneeEnabled()) {
    return { contexts: [], nodeIds: [] };
  }

  const body: Record<string, unknown> = {
    query,
    datasets: [datasetName()],
    search_type: options.searchType ?? 'CHUNKS',
    top_k: options.topK ?? 8,
    scope: 'auto',
    only_context: true,
  };
  if (options.sessionId) body.session_id = options.sessionId;

  const response = await cogneeFetch('/api/v1/recall', {
    method: 'POST',
    headers: buildHeaders('application/json'),
    body: JSON.stringify(body),
    timeoutMs: RECALL_TIMEOUT_MS,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Cognee recall failed (${response.status}): ${errText.slice(0, 500)}`);
  }

  const json = await response.json();
  const texts = extractRecallTexts(json);
  const scores = extractRecallScores(json);

  const nodeIdOrder: string[] = [];
  const seen = new Set<string>();
  for (const text of texts) {
    const nodeId = parseNodeIdFromText(text);
    if (nodeId && !seen.has(nodeId)) {
      seen.add(nodeId);
      nodeIdOrder.push(nodeId);
    }
  }

  if (nodeIdOrder.length === 0) {
    return { contexts: [], nodeIds: [] };
  }

  const rows = await getNodesByIds(nodeIdOrder);
  const rowMap = new Map(rows.map((r) => [r.id as string, r]));

  const contexts: RagContext[] = [];
  for (let i = 0; i < nodeIdOrder.length; i++) {
    const id = nodeIdOrder[i];
    const row = rowMap.get(id);
    if (!row) continue;
    const score = scores[i] ?? 0.7 - i * 0.02;
    contexts.push({
      id: row.id,
      title: row.title,
      body: row.body,
      summary: row.summary,
      type: row.node_type,
      similarity: Math.min(0.95, Math.max(0.55, score)),
    });
  }

  return { contexts, nodeIds: contexts.map((c) => c.id) };
}

/**
 * Store a Q&A turn in Cognee session memory.
 */
export async function rememberChatTurn(params: {
  sessionId: string;
  question: string;
  answer: string;
  citedNodeIds?: string[];
}): Promise<void> {
  if (!isCogneeEnabled()) return;

  const context =
    params.citedNodeIds && params.citedNodeIds.length > 0
      ? `Cited nodes: ${params.citedNodeIds.join(', ')}`
      : undefined;

  const body = {
    entry: {
      type: 'qa',
      question: params.question,
      answer: params.answer,
      ...(context ? { context } : {}),
    },
    dataset_name: datasetName(),
    session_id: params.sessionId,
  };

  const response = await cogneeFetch('/api/v1/remember/entry', {
    method: 'POST',
    headers: buildHeaders('application/json'),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    console.warn(`[cognee] remember/entry failed (${response.status}): ${errText.slice(0, 300)}`);
  }
}

/**
 * Bridge session memory into the permanent graph (improve / memify).
 */
export async function improveSession(sessionId: string): Promise<void> {
  if (!isCogneeEnabled()) return;

  const body = {
    dataset: datasetName(),
    session_ids: [sessionId],
  };

  const response = await cogneeFetch('/api/v1/improve', {
    method: 'POST',
    headers: buildHeaders('application/json'),
    body: JSON.stringify(body),
    timeoutMs: 120_000,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Cognee improve failed (${response.status}): ${errText.slice(0, 500)}`);
  }
}

/**
 * Remove an item from Cognee memory (governance retraction).
 */
export async function forgetNode(cogneeDataId: string, dataset?: string): Promise<void> {
  if (!isCogneeEnabled() || !cogneeDataId) return;

  const ds = dataset ?? datasetName();

  // Try v1 forget endpoint first
  const forgetBody = {
    kind: 'item',
    data_id: cogneeDataId,
    dataset: { name: ds },
  };

  let response = await cogneeFetch('/api/v1/forget', {
    method: 'POST',
    headers: buildHeaders('application/json'),
    body: JSON.stringify(forgetBody),
  });

  if (response.ok) return;

  // Fallback: list datasets and delete by data id
  const listResp = await cogneeFetch('/api/v1/datasets', {
    method: 'GET',
    headers: buildHeaders(),
  });
  if (!listResp.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Cognee forget failed: ${errText.slice(0, 300)}`);
  }

  const datasets = (await listResp.json()) as unknown;
  const items = Array.isArray(datasets) ? datasets : [];
  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const name = row.name ?? row.dataset_name;
    const id = row.id ?? row.dataset_id;
    if (name !== ds && name !== datasetName()) continue;
    if (typeof id !== 'string') continue;
    response = await cogneeFetch(`/api/v1/datasets/${id}/data/${cogneeDataId}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    });
    if (response.ok) return;
  }

  console.warn(`[cognee] forget: could not remove data id ${cogneeDataId}`);
}

/**
 * Sync Postgres insight nodes missing cognee_data_id into Cognee (seed / backfill).
 */
export async function syncInsightsToCognee(): Promise<{ synced: number; skipped: number }> {
  if (!isCogneeEnabled()) return { synced: 0, skipped: 0 };

  const { default: pool } = await import('../db/pool');
  const result = await pool.query<{
    id: string;
    node_type: string;
    title: string;
    body: string | null;
    summary: string | null;
    metadata: Record<string, unknown>;
  }>(
    `SELECT id, node_type, title, body, summary, metadata
     FROM team_graph_nodes
     WHERE node_type = 'insight'
     ORDER BY created_at ASC`
  );

  let synced = 0;
  let skipped = 0;

  for (const row of result.rows) {
    const meta = row.metadata ?? {};
    if (meta.cognee_data_id) {
      skipped++;
      continue;
    }
    if (!row.body) {
      skipped++;
      continue;
    }
    try {
      await rememberInsight({
        nodeId: row.id,
        title: row.title,
        nodeType: row.node_type,
        body: row.body,
        summary: row.summary ?? undefined,
      });
      synced++;
      if (synced % 5 === 0) {
        console.log(`[cognee] sync progress: ${synced} insights ingested`);
      }
    } catch (err) {
      console.warn(`[cognee] sync failed for node ${row.id}:`, err);
    }
  }

  return { synced, skipped };
}

/** Health check for sidecar (used by smoke script / health route). */
export async function checkCogneeHealth(): Promise<boolean> {
  try {
    const response = await cogneeFetch('/health', { method: 'GET', timeoutMs: 5000 });
    return response.ok;
  } catch {
    return false;
  }
}
