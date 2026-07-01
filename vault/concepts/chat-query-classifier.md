---
title: Chat query classifier (knowledge vs. conversational)
type: concept
status: active
tags: [chat, ai, consilium, retrieval]
sources: [consilium-implementation-plan]
created: 2026-05-15
updated: 2026-05-15
---

# Chat query classifier (knowledge vs. conversational)

Every chat message now routes through a lightweight Gemini Flash classifier that decides whether the message needs **retrieval** (the firm brain) or just a **conversational reply** (no retrieval). The two paths share a single SSE protocol; the first event tells the frontend which path is active. This unblocks greetings, capability questions, and follow-up operations ("summarize that") without dragging them through RAG and triggering refusals.

## File

`apps/api/src/services/classifier.ts`. Pure module-level model + one `classifyQuery(query, recentTurns)` export.

## What gets routed where

| Path | When | Examples |
|---|---|---|
| `conversational` | Greetings / acknowledgments | "hi", "thanks", "good morning" |
| `conversational` | Meta / capability questions | "what can you do?", "how does this work?", "what's in the firm brain?" |
| `conversational` | Operations on the prior assistant turn | "summarize that", "shorter please", "what was the second source?", "rephrase that" |
| `knowledge` | Facts / opinions / strategy from firm work | "what's our approach to cross-examining experts?" |
| `knowledge` | **Substantive follow-ups** | "tell me more about that judge", "what else have we tried on cross?" |
| `knowledge` | Anything ambiguous | classifier system prompt: *"When in doubt, return knowledge."* |

The asymmetry is intentional: misrouting a greeting to `knowledge` produces an awkward-but-safe refusal-with-invite (see [[rag-query-pipeline]]); misrouting a substantive query to `conversational` skips retrieval and could result in unsupported claims. Safety lies on the knowledge side.

## Model setup

- **Model**: `gemini-2.5-flash` (fast + cheap; classification is latency-critical).
- **System prompt**: embedded as a const in `classifier.ts` (not loaded from `prompts/`, since it's tightly coupled to the binary classification output).
- **Structured output**: `responseMimeType: 'application/json'` + `responseSchema` with `kind: enum['knowledge', 'conversational']`. Format-`enum` is supported by the Gemini structured-output API and gives a much tighter guarantee than free-form JSON parsing.

## History-aware classification

`classifyQuery(query, recentTurns)` accepts the recent conversation turns from the API request. It builds a small context block:

```
Prior assistant turn (truncated):
{first 400 chars of last assistant content, ellipsized}

Current user message:
{current query}
```

The truncation is deliberate — sending the full prior turn would balloon classifier latency and tokens, and 400 chars is enough to disambiguate "summarize that" (clearly a follow-up) from a substantive query that happens to be short.

## Failure handling

`classifyQuery` is wrapped in [[gemini-retry-backoff|withGeminiRetry]] with **`maxAttempts: 2` and `timeoutMs: 8_000`** — much tighter than the global defaults. Reasoning:

- Chat latency is a hero moment. A slow classifier would delay every reply by up to 8 s on a bad day.
- The fallback (`return 'knowledge'`) is safe — RAG handles thin context gracefully via refusal-with-invite.
- A third retry would push worst-case latency to ~24 s, which is unusable.

On any exception (including parse errors): warn log, return `'knowledge'`. The classifier never blocks the chat path; the worst case is a missed conversational routing.

## Why a classifier, not a regex or prompt-side decision

Earlier sketches considered: (a) regex on greetings / "?" / etc.; (b) letting the RAG prompt itself decide ("if conversational, answer briefly"). Both were rejected:

- **Regex** can't handle the operational follow-ups ("summarize that") without becoming a maintenance liability, and it can't see the prior turn.
- **Single-prompt routing** loses the SSE-protocol clarity — the frontend needs to know up front whether to expect a `cited-nodes` event so it can decide whether to activate the [[query-overlay-animation]]. A separate classifier call lets the protocol emit `kind` as its first event, which is the cleanest contract.

The cost of the extra round-trip (Flash, ~300–800 ms typical) is hidden under the user's send animation; the perceptual cost is small versus the architectural clarity.

## Relations

- **Routes to**: [[rag-query-pipeline]] (knowledge) or [[conversational-chat-path]] (conversational)
- **Uses**: [[gemini-retry-backoff]] with tight `maxAttempts: 2 / timeoutMs: 8_000`
- **Visible in**: [[consilium-retrieval-implementation]] chat SSE protocol — the new `kind` event is emitted by the classifier's decision

## Open questions

- **Classifier latency budget under load** — measured at demo scale only. At firm scale, parallel chat requests could expose contention if Flash slows down.
- **Calibration of failure default** — defaulting to `knowledge` is correct for safety, but if classifier reliability dropped meaningfully, the rate of "awkward refusal on a greeting" would rise. Worth a periodic spot-check at firm scale.
- **Beyond MVP**: a tri-classification with `meta` as its own path (capability questions answered from a static product spec rather than free-form Flash output) would be more deterministic.

## Sources

- [[consilium-implementation-plan]]
