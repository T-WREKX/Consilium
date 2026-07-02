/**
 * Conversational chat path — no retrieval. Used when the classifier routes a
 * query to 'conversational'. See docs/superpowers/specs/2026-05-15-chat-conversational-mode-design.md.
 */
import { streamText } from './ollama';
import { loadPrompt } from './promptLoader';
import type { ChatTurn } from '../types/chat-protocol';

const conversationalSystemPrompt = loadPrompt('conversational.md');

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

  yield* streamText(userMessage, {
    systemPrompt: conversationalSystemPrompt,
    timeoutMs: 30_000,
  });
}
