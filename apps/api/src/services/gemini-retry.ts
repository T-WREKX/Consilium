/**
 * Retry / timeout wrapper for Gemini SDK calls.
 *
 * The @google/generative-ai SDK has no built-in retry. A single transient
 * upstream hiccup (429, 503, socket reset, DNS blip) surfaces as a 500 to the
 * caller — which is especially painful at demo time. This helper retries
 * retryable failures with exponential backoff + jitter and enforces a
 * per-attempt timeout via the SDK's native `timeout` option.
 *
 * Pass the SingleRequestOptions handed to your callback straight through to
 * the SDK method, e.g. `model.generateContent(prompt, opts)`.
 */
import { GoogleGenerativeAIFetchError } from '@google/generative-ai';

export interface GeminiRetryOptions {
  /** Total attempts including the first try. Default 3. */
  maxAttempts?: number;
  /** Per-attempt timeout, passed to the SDK as `timeout`. Default 30_000. */
  timeoutMs?: number;
  /** Base for exponential backoff in ms. Default 400. */
  baseBackoffMs?: number;
  /** Cap for backoff in ms. Default 4_000. */
  maxBackoffMs?: number;
  /** Short label used in warn logs (e.g. "rag.stream", "embed"). */
  label: string;
}

type SdkRequestOptions = { timeout: number };

export async function withGeminiRetry<T>(
  operation: (opts: SdkRequestOptions) => Promise<T>,
  options: GeminiRetryOptions
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const timeoutMs = options.timeoutMs ?? 30_000;
  const baseBackoffMs = options.baseBackoffMs ?? 400;
  const maxBackoffMs = options.maxBackoffMs ?? 4_000;
  const { label } = options;

  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation({ timeout: timeoutMs });
    } catch (err) {
      lastErr = err;
      const retryable = isRetryable(err);
      if (!retryable || attempt === maxAttempts) {
        if (retryable) {
          console.warn(
            `[gemini:${label}] exhausted ${maxAttempts} attempts: ${describeError(err)}`
          );
        }
        throw err;
      }
      const delay = jitteredBackoff(attempt, baseBackoffMs, maxBackoffMs);
      console.warn(
        `[gemini:${label}] attempt ${attempt}/${maxAttempts} failed (${describeError(err)}); retrying in ${Math.round(delay)}ms`
      );
      await sleep(delay);
    }
  }
  throw lastErr;
}

function isRetryable(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;

  // SDK aborted the request (its own timeout fired) — retry.
  const name = (err as { name?: string }).name;
  if (name === 'GoogleGenerativeAIAbortError' || name === 'AbortError') return true;

  if (err instanceof GoogleGenerativeAIFetchError) {
    const status = err.status;
    if (typeof status === 'number') {
      if (status === 408 || status === 425 || status === 429) return true;
      if (status >= 500 && status < 600) return true;
      return false;
    }
    // Fetch error without a status is almost always a network failure.
    return true;
  }

  const message = String((err as { message?: unknown }).message ?? '').toLowerCase();
  if (!message) return false;
  if (
    message.includes('fetch failed') ||
    message.includes('econnreset') ||
    message.includes('etimedout') ||
    message.includes('socket hang up') ||
    message.includes('network') ||
    message.includes('unavailable') ||
    message.includes('overloaded') ||
    message.includes('deadline')
  ) {
    return true;
  }
  // SDK sometimes embeds the status in the message string.
  return /\b(408|425|429|500|502|503|504)\b/.test(message);
}

function jitteredBackoff(attempt: number, base: number, cap: number): number {
  const exp = Math.min(base * 2 ** (attempt - 1), cap);
  // Full jitter: random value in [exp/2, exp].
  return exp / 2 + Math.random() * (exp / 2);
}

function describeError(err: unknown): string {
  if (err instanceof GoogleGenerativeAIFetchError) {
    return `${err.name} status=${err.status ?? 'n/a'} ${err.message}`;
  }
  const e = err as { name?: string; message?: string };
  return `${e.name ?? 'Error'}: ${e.message ?? String(err)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
