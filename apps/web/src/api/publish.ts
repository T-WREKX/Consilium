// apps/web/src/api/publish.ts
import type { ApiResponse, RedactResponse, PublishResponse } from '../types/index';

const BASE_URL = typeof import.meta !== 'undefined'
  ? (import.meta.env?.VITE_API_URL ?? 'http://localhost:3000')
  : 'http://localhost:3000';

async function apiFetch<T>(path: string, body: unknown, token: string): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      return { error: { code: json.error?.code ?? String(res.status), message: json.error?.message ?? 'Request failed', retryable: res.status >= 500 } };
    }
    return { data: json.data };
  } catch (err) {
    return { error: { code: 'NETWORK_ERROR', message: err instanceof Error ? err.message : 'Network error', retryable: true } };
  }
}

export function redactContent(content: string, token: string): Promise<ApiResponse<RedactResponse>> {
  return apiFetch<RedactResponse>('/api/redact', { content }, token);
}

export function publishNote(
  payload: { title: string; body: string; summary?: string; nodeType?: string; sourcePersonalNoteId?: string },
  token: string
): Promise<ApiResponse<PublishResponse>> {
  return apiFetch<PublishResponse>('/api/publish', payload, token);
}
