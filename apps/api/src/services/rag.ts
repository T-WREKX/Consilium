/**
 * RAG Service — Retrieval-Augmented Generation for Team Brain queries
 *
 * Pipeline (from architecture §4.3):
 *   1. Embed query → text-embedding-004 (768 dim)
 *   2. Vector similarity search → top-8 by cosine distance
 *   3. 1-hop graph expansion from top hits
 *   4. Filter expanded set → keep cosine > 0.55
 *   5. Construct context array
 *   6. Stream response via Gemini Pro with grounding prompt
 *   7. Calculate confidence level
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateEmbedding } from './embedding';
import { vectorSearch, expandOneHop } from '../db/queries';
import { withGeminiRetry } from './gemini-retry';
import { loadPrompt } from './promptLoader';
import {
  cogneeFallbackEnabled,
  isCogneeEnabled,
  recallForQuery,
} from './cognee';

const chatSystemPrompt = loadPrompt('chat.md');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'refuse';

/**
 * Refusal-message variants emitted when retrieval confidence is 'refuse'.
 * One is selected at random per refused query so the demo doesn't feel scripted.
 * Each variant carries the same product intent: acknowledge the gap, invite a capture.
 */
const REFUSAL_VARIANTS: readonly string[] = [
  "I don't have firm knowledge that directly addresses this. You may want to capture your own thinking on this topic as a starting point.",
  "The firm brain doesn't have material covering this question. Consider opening a capture and starting the record yourself — your notes today become tomorrow's institutional memory.",
  "No published insights in the team graph speak to this directly. This looks like an open area for the firm's knowledge — your capture could be the first entry.",
  "I couldn't find firm knowledge on this. Rather than synthesize from general legal training, I'd rather defer — this is a good prompt for a fresh personal capture.",
];

function pickRefusalMessage(): string {
  return REFUSAL_VARIANTS[Math.floor(Math.random() * REFUSAL_VARIANTS.length)];
}

export interface RagContext {
  id: string;
  title: string;
  body: string | null;
  summary: string | null;
  type: string;
  similarity: number;
}

export interface RagResult {
  citedNodeIds: string[];
  confidence: ConfidenceLevel;
  contexts: RagContext[];
}

/**
 * Calculate confidence level based on retrieval quality.
 *
 * Thresholds calibrated against text-embedding-004 actual distributions on
 * the seeded corpus (see diagnostics-similarity.ts). Even tightly-matched
 * queries (e.g., "How does Judge Buenaventura handle motions" against 6
 * dedicated Buenaventura insights) cap around 0.80 cosine similarity — the
 * older 0.80 threshold for "high" was unreachable in practice. Empirical
 * calibration:
 *   High:   3+ nodes ≥ 0.75 — multiple strongly-on-topic hits
 *   Medium: 2+ nodes ≥ 0.70 — solid but thinner hits, or one strong + adjacent
 *   Low:    1+ node  ≥ 0.60 — a single weakly-related hit
 *   Refuse: zero nodes ≥ 0.60
 */
function calculateConfidence(contexts: RagContext[]): ConfidenceLevel {
  const above075 = contexts.filter((c) => c.similarity >= 0.75).length;
  const above070 = contexts.filter((c) => c.similarity >= 0.70).length;
  const above060 = contexts.filter((c) => c.similarity >= 0.60).length;

  if (above075 >= 3) return 'high';
  if (above070 >= 2) return 'medium';
  if (above060 >= 1) return 'low';
  return 'refuse';
}

/**
 * Retrieve relevant context for a query.
 * Uses Cognee recall when enabled, with pgvector fallback.
 */
export async function retrieveContext(
  query: string,
  sessionId?: string
): Promise<RagResult> {
  if (isCogneeEnabled()) {
    try {
      const { contexts, nodeIds } = await recallForQuery(query, { sessionId });
      if (contexts.length > 0) {
        const confidence = calculateConfidence(contexts);
        return { citedNodeIds: nodeIds, confidence, contexts };
      }
    } catch (err) {
      console.warn('[rag] Cognee recall failed:', err);
      if (!cogneeFallbackEnabled()) {
        return { citedNodeIds: [], confidence: 'refuse', contexts: [] };
      }
    }
  }

  return retrieveContextPgVector(query);
}

/** Legacy pgvector + 1-hop graph retrieval (fallback when Cognee unavailable). */
async function retrieveContextPgVector(query: string): Promise<RagResult> {
  // Step 1: Embed query
  const queryEmbedding = await generateEmbedding(query);

  // Step 2: Vector similarity search (top-8)
  const topHits = await vectorSearch(queryEmbedding, 8);

  if (topHits.length === 0) {
    return { citedNodeIds: [], confidence: 'refuse', contexts: [] };
  }

  // Step 3: 1-hop graph expansion
  const seedNodeIds = topHits.map((h: any) => h.id);
  const expanded = await expandOneHop(seedNodeIds);

  // Step 4: Filter — keep nodes with similarity > 0.55
  // Top hits already have similarity computed; neighbors need recomputing
  const contexts: RagContext[] = topHits
    .filter((h: any) => h.similarity > 0.55)
    .map((h: any) => ({
      id: h.id,
      title: h.title,
      body: h.body,
      summary: h.summary,
      type: h.node_type,
      similarity: h.similarity,
    }));

  // Add neighbor nodes that are insights (for richer context)
  for (const neighbor of expanded.nodes) {
    if (
      neighbor.node_type === 'insight' &&
      !contexts.find((c) => c.id === neighbor.id)
    ) {
      contexts.push({
        id: neighbor.id,
        title: neighbor.title,
        body: neighbor.body,
        summary: neighbor.summary,
        type: neighbor.node_type,
        similarity: 0.55, // Mark as graph-expanded
      });
    }
  }

  // Sort by similarity descending
  contexts.sort((a, b) => b.similarity - a.similarity);

  // Calculate confidence
  const confidence = calculateConfidence(contexts);
  const citedNodeIds = contexts.map((c) => c.id);

  return { citedNodeIds, confidence, contexts };
}

/**
 * Stream a RAG response for a query.
 * Yields text chunks as they arrive from Gemini.
 */
export async function* streamRagResponse(
  query: string,
  contexts: RagContext[],
  confidence: ConfidenceLevel
): AsyncGenerator<string> {
  // Refuse if no relevant context
  if (confidence === 'refuse' || contexts.length === 0) {
    yield pickRefusalMessage();
    return;
  }

  // Build context payload for the LLM
  const contextPayload = contexts.map((c) => ({
    id: c.id,
    title: c.title,
    body: c.body,
    summary: c.summary,
    type: c.type,
  }));

  const userMessage = `Context:\n${JSON.stringify(contextPayload, null, 2)}\n\nQuestion: ${query}`;

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-pro',
    systemInstruction: chatSystemPrompt,
  });

  // Retry the initial stream connect only. Once chunks start flowing we can't
  // safely retry mid-stream — partial output may already have reached the user.
  const result = await withGeminiRetry(
    (opts) => model.generateContentStream(userMessage, opts),
    { label: 'rag.stream', timeoutMs: 30_000 }
  );

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
}
