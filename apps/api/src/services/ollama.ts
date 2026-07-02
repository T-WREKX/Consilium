/**
 * Local Ollama client — OpenAI-compatible chat completions.
 *
 * Used for redaction, query classification, and chat-answer synthesis so
 * these features run with zero external API quota (the free-tier Gemini
 * quota gemini-2.5-pro/-flash previously used here is far too small for
 * real usage — see .agent/cognee-integration.md history).
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'llama3.1:8b';

export interface OllamaChatOptions {
  systemPrompt?: string;
  /** Ask the model to emit a single JSON object (no schema constraint, just JSON mode). */
  json?: boolean;
  timeoutMs?: number;
}

function buildMessages(userMessage: string, systemPrompt?: string) {
  const messages: Array<{ role: string; content: string }> = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: userMessage });
  return messages;
}

async function chatRequest(
  userMessage: string,
  opts: OllamaChatOptions,
  stream: boolean
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 60_000);
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: buildMessages(userMessage, opts.systemPrompt),
        stream,
        ...(opts.json ? { response_format: { type: 'json_object' } } : {}),
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Ollama chat failed (${response.status}): ${errText.slice(0, 300)}`);
    }
    return response;
  } finally {
    clearTimeout(timer);
  }
}

/** Non-streaming completion — returns the full response text. */
export async function generateText(
  userMessage: string,
  opts: OllamaChatOptions = {}
): Promise<string> {
  const response = await chatRequest(userMessage, opts, false);
  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return json.choices?.[0]?.message?.content?.trim() ?? '';
}

/** Streaming completion — yields text chunks as they arrive (OpenAI-style SSE). */
export async function* streamText(
  userMessage: string,
  opts: OllamaChatOptions = {}
): AsyncGenerator<string> {
  const response = await chatRequest(userMessage, opts, true);
  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        // Ignore a malformed/partial SSE chunk — next line may complete it.
      }
    }
  }
}
