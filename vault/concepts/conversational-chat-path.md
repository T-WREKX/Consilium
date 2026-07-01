---
title: Conversational chat path
type: concept
status: active
tags: [chat, ai, consilium, ux]
sources: [consilium-implementation-plan, consilium-product-requirements]
created: 2026-05-15
updated: 2026-05-15
---

# Conversational chat path

The "no retrieval" branch of the chat protocol. When the [[chat-query-classifier]] routes a message to `conversational`, the API skips the embedding + pgvector + 1-hop expansion pipeline entirely and streams a free-form reply from Gemini Flash under a relaxed prompt. Used for greetings, capability questions, and follow-up operations on the prior assistant turn ("summarize that", "shorter please", "what was the second source?").

## Why it exists

Before this path landed, every chat message went through [[rag-query-pipeline|RAG]]. A user typing "hi" would hit vector search, get nothing above the 0.60 threshold, and receive a refusal-with-invite — technically correct, conversationally absurd. The conversational path is the second hero-moment compromise (alongside [[citation-grounding]]) — substance still demands retrieval, but social glue and operational follow-ups don't.

This is also the path that finally enables **multi-turn conversation memory** at the chat surface, which the PRD §2.7 had listed as **out of MVP**. The MVP scope page [[consilium-mvp-scope]] notes this as a beyond-spec addition.

## File

`apps/api/src/services/conversational.ts`. Async generator `streamConversationalResponse(query, history)`. Prompt loaded from `apps/api/src/prompts/conversational.md` via the shared `loadPrompt` helper.

## Model setup

- **Model**: `gemini-2.5-flash`. Faster + cheaper than Pro, and the answers are short by design.
- **System prompt**: `apps/api/src/prompts/conversational.md` (loaded once at module scope).
- **No structured output** — free-form prose, tone-matched to the [[rag-query-pipeline|knowledge prompt]].
- **Streaming**: `model.generateContentStream(...)`, yielded chunk-by-chunk through the same SSE `token` events as the knowledge path.

## Conversation history

The frontend sends up to **8 turns** (server cap; client typically sends last 4 — 2 user/assistant pairs) on every chat request. The conversational path formats them as:

```
Recent conversation:
USER: hello
ASSISTANT: Hi — what can I help you find?

Current user message: summarize that
```

For assistant turns, any `citedNodeIds` from the prior knowledge response are appended as `[citedNodeIds: id1, id2, ...]` so the model can re-quote them when the user asks "what was the second source?". The system prompt forbids fabricating new citations — only verbatim re-quotes from the prior turn are allowed.

## System prompt rules (`prompts/conversational.md`)

| # | Rule | Why |
|---|---|---|
| 1 | Professional tone, no emoji, no exclamation points, no "I'm happy to help" filler | Match knowledge-path voice |
| 2 | Brief — 1–2 sentences for greetings, short paragraph for capability questions | Don't pad |
| 3 | Greetings: respond naturally, gently orient toward what Consilium does (one sentence) | First impression |
| 4 | Capability questions: explain Consilium grounded in product facts (citations, no general legal advice, gaps become captures) | Don't invent features |
| 5 | Follow-ups: operate on the prior turn only; may re-quote `[node_id]` from the prior turn | Memory, but bounded |
| 6 | **Hard rule** — no substantive legal claims from training data. Redirect with: *"That's the kind of question the firm brain is built to answer — try rephrasing it as a question about the firm's work, or capture your own thinking to start the record."* | Privilege boundary survives the conversational path |
| 7 | Never fabricate citations — re-quote only what was already in the prior turn | Citation integrity |

Rule 6 is the load-bearing one. Without it, the conversational path would become a back-door for "ChatGPT for legal advice," undoing the [[citation-grounding]] discipline that makes Consilium trustworthy.

## Frontend integration

The chat SSE protocol's first event is now `kind`. On `kind: 'conversational'`:

- `chatStore.startStreaming([], null, 'conversational')` — empty citations, no confidence level.
- **Overlay stays off** — `overlayActive` is gated to `kind === 'knowledge' && confidence !== 'refuse' && citedNodeIds.length > 0`. Conversational replies and refusals share the plain loading state (thinking dots) without triggering the [[query-overlay-animation]].
- **SourcesPanel suppressed** — only renders when `msg.kind === 'knowledge'` and there are citations.
- **Citation chips still work** — the `allCitedNodeIds` resolution set in [ChatView](apps/web/src/views/chat/ChatView.tsx) unions every citation ever made in this conversation, so a conversational follow-up re-quoting `[abc12345]` from the prior turn renders as a clickable chip and opens the [`NodeSummaryPanel`](apps/web/src/views/chat/NodeSummaryPanel.tsx) as usual.

## Failure handling

Wrapped in [[gemini-retry-backoff|withGeminiRetry]] with `maxAttempts: 2` and `timeoutMs: 30_000`. Like RAG streaming, only the initial connect is retried — mid-stream chunks can't be safely resumed.

If the stream errors after starting, the frontend's stream error handler **does not stamp `'refuse'` confidence** on the partial conversational message — confidence is a knowledge-path concept. The message stays as-is with whatever content arrived (commit `a8b4eb3`, "don't stamp 'refuse' confidence on conversational stream errors").

## What the user perceives

- Type "hi" → ~1 s later: *"Hi — what would you like to explore in the firm brain?"* No overlay, no sources panel.
- Type "what can you do?" → short paragraph explaining Consilium, no citations.
- After a knowledge answer with `[abc12345]` cited, type "summarize that" → 2-sentence summary that may re-quote `[abc12345]` as a clickable chip; the chip opens the NodeSummaryPanel as expected.
- Try to slip in legal substance ("what's the rule on hearsay exceptions?") → polite redirect to "that's what the firm brain is for; try rephrasing or capture."

## Relations

- **Routed in by**: [[chat-query-classifier]]
- **Alternative to**: [[rag-query-pipeline]] (the knowledge path)
- **Uses**: [[gemini-retry-backoff]]
- **Loosens but doesn't break**: [[citation-grounding]] (re-quote only; no fabrication; hard rule 6)
- **Beyond-MVP**: [[consilium-mvp-scope]] explicitly listed multi-turn memory as V1; landing it for MVP demo polish

## Open questions

- **History eviction strategy at firm scale** — last-4 sliding window is fine for short demos. A real product surface needs either summarization-of-older-turns or a different ranking.
- **Cross-path follow-ups** — if a user asks "what about Judge Reyes specifically?" right after a knowledge answer about expert witnesses, that's a substantive follow-up that the classifier should route to `knowledge` and run real retrieval against, not to `conversational` with re-quoted prior context. Calibration depends on the classifier's substantive-follow-up coverage.
- **Refusal phrasing variance** — the knowledge path now picks a refusal at random from 4 variants; the conversational redirect on rule-6 violations is single-string. Worth testing whether the redirect feels canned at scale.

## Sources

- [[consilium-implementation-plan]]
- [[consilium-product-requirements]]
