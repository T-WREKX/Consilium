/**
 * Conversational chat path — no retrieval. Used when the classifier routes a
 * query to 'conversational'. See docs/superpowers/specs/2026-05-15-chat-conversational-mode-design.md.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { withGeminiRetry } from './gemini-retry';
import { loadPrompt } from './promptLoader';
import type { ChatTurn } from '../types/chat-protocol';

const conversationalSystemPrompt = loadPrompt('conversational.md');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: conversationalSystemPrompt,
});

function formatHistory(history: ChatTurn[]): string {
  if (history.length === 0) return '(no prior turns)';
  return history
    .map((t) => {
      const tag = t.role === 'user' ? 'USER' : 'ASSISTANT';
      const citedSuffix =
        t.role === 'assistant' && t.citedNodeIds && t.citedNodeIds.length > 0
          ? `\n[citedNodeIds: ${t.citedNodeIds.join(', ')}]`
          : '';
      return `${tag}: ${t.content}${citedSuffix}`;
    })
    .join('\n\n');
}

export async function* streamConversationalResponse(
  query: string,
  history: ChatTurn[]
): AsyncGenerator<string> {
  const userMessage = `Recent conversation:\n${formatHistory(history)}\n\nCurrent user message: ${query}`;

  const result = await withGeminiRetry(
    (opts) => model.generateContentStream(userMessage, opts),
    { label: 'chat.conversational', timeoutMs: 30_000, maxAttempts: 2 }
  );

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}
