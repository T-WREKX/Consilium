import type { ChatKind, ChatMessage, ConfidenceLevel } from '../types';

const BASE_URL = typeof import.meta !== 'undefined'
  ? (import.meta.env?.VITE_API_URL ?? '')
  : '';

export type ChatHistoryTurn = {
  role: 'user' | 'assistant';
  content: string;
  citedNodeIds?: string[];
};

interface ChatSSECallbacks {
  onKind: (kind: ChatKind) => void;
  onCitedNodes: (nodeIds: string[], confidence: ConfidenceLevel) => void;
  onToken: (text: string) => void;
  onDone: (payload: { kind: ChatKind; confidence?: ConfidenceLevel; sourceCount?: number }) => void;
  onError: (message: string) => void;
}

/**
 * Build the history payload to send with a chat request — last 4 messages
 * (typically 2 user/assistant pairs). Server caps at 8.
 */
export function buildHistoryPayload(messages: ChatMessage[]): ChatHistoryTurn[] {
  return messages.slice(-4).map((m) => ({
    role: m.role,
    content: m.content,
    citedNodeIds: m.role === 'assistant' ? m.citedNodeIds : undefined,
  }));
}

/**
 * Send a chat query and consume the SSE stream.
 * Uses fetch + ReadableStream (not EventSource) because we need POST.
 */
export async function streamChat(
  query: string,
  history: ChatHistoryTurn[],
  token: string | null,
  callbacks: ChatSSECallbacks
): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, history }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = (errorData as any)?.error?.message ?? 'Chat request failed';
    callbacks.onError(message);
    return;
  }

  if (!response.body) {
    callbacks.onError('No response stream');
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    let eventType = '';
    let eventData = '';

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventType = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        eventData = line.slice(6);
      } else if (line === '' && eventType && eventData) {
        try {
          const parsed = JSON.parse(eventData);
          switch (eventType) {
            case 'kind':
              callbacks.onKind(parsed.kind);
              break;
            case 'cited-nodes':
              callbacks.onCitedNodes(parsed.nodeIds, parsed.confidence);
              break;
            case 'token':
              callbacks.onToken(parsed.text);
              break;
            case 'done':
              callbacks.onDone({
                kind: parsed.kind,
                confidence: parsed.confidence,
                sourceCount: parsed.sourceCount,
              });
              break;
            case 'error':
              callbacks.onError(parsed.message);
              break;
          }
        } catch {
          // Skip malformed events
        }
        eventType = '';
        eventData = '';
      }
    }
  }
}

/**
 * Fetch a single team graph node by ID (for citation panels).
 */
export async function fetchNodeSummary(nodeId: string, token: string | null) {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/api/team-graph/nodes/${nodeId}`, {
    headers,
  });

  if (!response.ok) return null;
  const json = await response.json();
  return json.data;
}

/**
 * Fetch full team graph (for overlay rendering).
 */
export async function fetchTeamGraph(token: string | null) {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/api/team-graph`, { headers });
  if (!response.ok) return null;
  const json = await response.json();
  return json.data;
}
