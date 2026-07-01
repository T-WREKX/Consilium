import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { withGeminiRetry } from './gemini-retry';

dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

/**
 * Generate a 768-dimensional embedding for the given text using Gemini gemini-embedding-001.
 * Output pinned to 768 dims to match the existing vector(768) pgvector column.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await withGeminiRetry(
    (opts) =>
      // outputDimensionality is supported by the API but missing from @google/generative-ai@0.24.1 types
      model.embedContent(
        {
          content: { role: 'user', parts: [{ text }] },
          outputDimensionality: 768,
        } as Parameters<typeof model.embedContent>[0],
        opts
      ),
    { label: 'embed', timeoutMs: 15_000 }
  );
  return result.embedding.values;
}

/**
 * Generate embeddings for multiple texts in batch.
 * Processes sequentially to respect rate limits.
 */
export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const embeddings: number[][] = [];
  for (const text of texts) {
    const embedding = await generateEmbedding(text);
    embeddings.push(embedding);
    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 100));
  }
  return embeddings;
}
