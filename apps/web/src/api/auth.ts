// apps/web/src/api/auth.ts
import type { ApiResponse, LoginResponse } from '../types/index';

const BASE_URL = typeof import.meta !== 'undefined'
  ? (import.meta.env?.VITE_API_URL ?? 'http://localhost:3000')
  : 'http://localhost:3000';

export async function loginRequest(
  email: string,
  password: string
): Promise<ApiResponse<LoginResponse>> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) {
      return {
        error: {
          code: json.error?.code ?? String(res.status),
          message: json.error?.message ?? 'Login failed',
          retryable: false,
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

export async function logoutRequest(token: string): Promise<void> {
  await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}
