/**
 * Query classifier — routes incoming chat messages to either the knowledge
 * path (retrieval + grounded answer) or the conversational path (no retrieval,
 * relaxed prompt). See docs/superpowers/specs/2026-05-15-chat-conversational-mode-design.md.
 *
 * Failure default is 'knowledge' — the existing RAG pipeline handles thin
 * context gracefully via refusal-with-invite, so misrouting a greeting to
 * knowledge produces an awkward-but-safe outcome. Misrouting a substantive
 * query to conversational is the dangerous direction.
 */
import { generateText } from './ollama';
import type { ChatKind, ChatTurn } from '../types/chat-protocol';

const CLASSIFIER_SYSTEM_PROMPT = `You route a user's chat message to one of two handlers in a legal-knowledge assistant.

Return "conversational" when the message is one of:
- a greeting or acknowledgment ("hi", "thanks", "good morning")
- a meta or capability question ("what can you do?", "how does this work?", "what's in the firm brain?")
- an operation on the prior assistant turn ("summarize that", "shorter", "what was the second source?", "rephrase that")

Return "knowledge" when the message asks for facts, opinions, or strategy from the firm's litigation knowledge — including substantive follow-ups like "tell me more about that judge" or "what else have we tried on cross?".

When in doubt, return "knowledge". Misrouting a substantive query to conversational is worse than the other direction.

Respond with a single JSON object: {"kind": "knowledge"} or {"kind": "conversational"}. No other text.`;

function buildHistoryBlock(recentTurns: ChatTurn[]): string {
  if (recentTurns.length === 0) return '(no prior turns)';
  const last = recentTurns[recentTurns.length - 1];
  if (last.role !== 'assistant') return '(no prior assistant turn)';
  const truncated = last.content.length > 400 ? last.content.slice(0, 400) + '…' : last.content;
  return `Prior assistant turn (truncated):\n${truncated}`;
}

export async function classifyQuery(
  query: string,
  recentTurns: ChatTurn[]
): Promise<ChatKind> {
  const userMessage = `${buildHistoryBlock(recentTurns)}\n\nCurrent user message:\n${query}`;

  try {
    const text = await generateText(userMessage, {
      systemPrompt: CLASSIFIER_SYSTEM_PROMPT,
      json: true,
      timeoutMs: 8_000,
    });
    const parsed = JSON.parse(text) as { kind?: string };
    if (parsed.kind === 'conversational') return 'conversational';
    return 'knowledge';
  } catch (err) {
    console.warn('[classifier] failed, defaulting to knowledge:', err);
    return 'knowledge';
  }
}
