// apps/web/src/api/teamGraph.ts
import type { ApiResponse, TeamGraph, TeamGraphNode } from '../types/index';

const BASE_URL = typeof import.meta !== 'undefined'
  ? (import.meta.env?.VITE_API_URL ?? 'http://localhost:3000')
  : 'http://localhost:3000';

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function fetchTeamGraph(token: string): Promise<ApiResponse<TeamGraph>> {
  try {
    const res = await fetch(`${BASE_URL}/api/team-graph`, { headers: authHeader(token) });
    const json = await res.json();
    if (!res.ok) return { error: { code: String(res.status), message: json.error?.message ?? 'Failed', retryable: true } };
    return { data: json.data };
  } catch (err) {
    return { error: { code: 'NETWORK_ERROR', message: err instanceof Error ? err.message : 'Network error', retryable: true } };
  }
}

export async function fetchNodeById(id: string, token: string): Promise<ApiResponse<TeamGraphNode & { connections: unknown[] }>> {
  try {
    const res = await fetch(`${BASE_URL}/api/team-graph/nodes/${id}`, { headers: authHeader(token) });
    const json = await res.json();
    if (!res.ok) return { error: { code: String(res.status), message: json.error?.message ?? 'Failed', retryable: false } };
    return { data: json.data };
  } catch (err) {
    return { error: { code: 'NETWORK_ERROR', message: err instanceof Error ? err.message : 'Network error', retryable: true } };
  }
}

export async function deleteTeamGraphNode(id: string, token: string): Promise<ApiResponse<{ id: string }>> {
  try {
    const res = await fetch(`${BASE_URL}/api/team-graph/nodes/${id}`, {
      method: 'DELETE',
      headers: authHeader(token),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        error: {
          code: String(res.status),
          message: json.error?.message ?? 'Failed to delete',
          retryable: res.status >= 500,
        },
      };
    }
    return { data: json.data };
  } catch (err) {
    return {
      error: {
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Network error',
        retryable: true,
      },
    };
  }
}
