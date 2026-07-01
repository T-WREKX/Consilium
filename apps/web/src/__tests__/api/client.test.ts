import { describe, it, expect, vi, beforeEach } from 'vitest';
import { organizeNote, transcribeAudio, analyzeImage } from '../../api/client';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockOk(data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data }),
  });
}

function mockError(status: number, message: string) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    statusText: 'Error',
    json: async () => ({ error: { message } }),
  });
}

function mockNetworkFailure() {
  mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));
}

beforeEach(() => { mockFetch.mockReset(); });

describe('organizeNote', () => {
  it('returns data on success', async () => {
    const expected = { entities: [], classification: 'observation', isPrivileged: false };
    mockOk(expected);
    const res = await organizeNote('some content', 'token-123');
    expect(res.data).toEqual(expected);
    expect(res.error).toBeUndefined();
  });

  it('sends Authorization header with token', async () => {
    mockOk({});
    await organizeNote('content', 'my-jwt');
    const [, options] = mockFetch.mock.calls[0];
    expect((options.headers as Record<string, string>)['Authorization']).toBe('Bearer my-jwt');
  });

  it('returns error on 500 with retryable: true', async () => {
    mockError(500, 'Internal error');
    const res = await organizeNote('content', 'token');
    expect(res.error?.code).toBe('500');
    expect(res.error?.retryable).toBe(true);
  });

  it('returns error on 400 with retryable: false', async () => {
    mockError(400, 'Bad request');
    const res = await organizeNote('content', 'token');
    expect(res.error?.retryable).toBe(false);
  });

  it('returns NETWORK_ERROR on fetch failure', async () => {
    mockNetworkFailure();
    const res = await organizeNote('content', 'token');
    expect(res.error?.code).toBe('NETWORK_ERROR');
    expect(res.error?.retryable).toBe(true);
  });
});

describe('transcribeAudio', () => {
  it('does not set Content-Type header (browser sets multipart boundary)', async () => {
    mockOk({ transcript: 'hello' });
    await transcribeAudio(new Blob(['audio'], { type: 'audio/webm' }), 'token');
    const [, options] = mockFetch.mock.calls[0];
    const headers = options.headers as Record<string, string>;
    expect(headers['Content-Type']).toBeUndefined();
    expect(headers['Authorization']).toBe('Bearer token');
  });
});
