import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { withGeminiRetry } from './gemini-retry';

dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

// Gemini's free tier caps embedContent at 100 requests/min. Callers (seed script
// especially) issue many embeddings back-to-back with no pacing of their own, which
// blows through the quota in seconds and burns the retry budget on 429s. Serialize
// all embedding calls through one queue with a floor interval between request starts
// so a single caller — or several concurrent ones — never exceeds the quota.
const MIN_INTERVAL_MS = 650; // ~92 req/min, under the 100/min free-tier ceiling
let nextSlotAt = 0;
let throttleChain: Promise<unknown> = Promise.resolve();

function throttled<T>(fn: () => Promise<T>): Promise<T> {
  const run = throttleChain.then(async () => {
    const wait = Math.max(0, nextSlotAt - Date.now());
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    nextSlotAt = Date.now() + MIN_INTERVAL_MS;
    return fn();
  });
  // Keep the chain alive even if this call ultimately rejects.
  throttleChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

/**
 * Generate a 768-dimensional embedding for the given text using Gemini gemini-embedding-001.
 * Output pinned to 768 dims to match the existing vector(768) pgvector column.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await throttled(() =>
    withGeminiRetry(
      (opts) =>
        // outputDimensionality is supported by the API but missing from @google/generative-ai@0.24.1 types
        model.embedContent(
          {
            content: { role: 'user', parts: [{ text }] },
            outputDimensionality: 768,
          } as Parameters<typeof model.embedContent>[0],
          opts
        ),
      { label: 'embed', timeoutMs: 15_000, maxAttempts: 4, maxBackoffMs: 12_000 }
    )
  );
  return result.embedding.values;
}

/**
 * Generate embeddings for multiple texts in batch.
 * generateEmbedding() itself is throttled/queued, so this just awaits each in turn.
 */
export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const embeddings: number[][] = [];
  for (const text of texts) {
    embeddings.push(await generateEmbedding(text));
  }
  return embeddings;
}
