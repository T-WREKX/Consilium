---
title: Gemini retry / backoff wrapper
type: concept
status: active
tags: [reliability, ai, consilium, infrastructure]
sources: [consilium-implementation-plan]
created: 2026-05-15
updated: 2026-05-15
---

# Gemini retry / backoff wrapper

A small reliability primitive that wraps every Gemini SDK call in the API service. Lifted the "no retry, no timeout" fragility flagged earlier in [[gemini]] — a single transient hiccup (429, 503, socket reset, DNS blip) used to surface as a 500 to the user, especially painful at demo time. Now every Gemini caller goes through `withGeminiRetry(...)` which retries retryable failures with exponential backoff + full jitter and enforces a per-attempt timeout via the SDK's native `timeout` option.

## File

`apps/api/src/services/gemini-retry.ts`. Pure helper, no module-level state.

## Signature

```ts
withGeminiRetry<T>(
  operation: (opts: { timeout: number }) => Promise<T>,
  options: {
    label: string;          // log tag, e.g. "rag.stream", "chat.classifier"
    maxAttempts?: number;   // default 3
    timeoutMs?: number;     // default 30_000 (per attempt)
    baseBackoffMs?: number; // default 400
    maxBackoffMs?: number;  // default 4_000
  }
): Promise<T>
```

The callback receives `{ timeout }` to pass through to the SDK — `model.generateContent(prompt, opts)`, `model.generateContentStream(prompt, opts)`, `model.embedContent({ ..., timeout })`, etc.

## Retryable error classification

`isRetryable(err)` returns true for:

- **SDK abort** — `GoogleGenerativeAIAbortError` or generic `AbortError` (the SDK fired its own timeout). Always retry.
- **`GoogleGenerativeAIFetchError`** with `status` in `{ 408, 425, 429, 500–599 }`. 4xx other than those is **not** retried (auth/validation problems don't get better on retry).
- **Fetch errors without a status** — almost always network-layer; retried.
- **Message-string fallback** — `fetch failed`, `ECONNRESET`, `ETIMEDOUT`, `socket hang up`, `network`, `unavailable`, `overloaded`, `deadline`, or any of the numeric status codes embedded in the message.

Anything else (auth failure, validation error, schema rejection) throws on the first attempt without retry.

## Backoff curve

Exponential with **full jitter**: `delay ∈ [exp/2, exp]` where `exp = min(baseBackoffMs × 2^(attempt-1), maxBackoffMs)`. Defaults give roughly `200–400 ms`, `400–800 ms`, `800–1600 ms` across three attempts, capped at 4 s. Full jitter (not equal jitter) is deliberate — when many calls retry simultaneously, full jitter avoids retry stampedes better than half-jitter.

## Logging

Two warn-level log lines per failed attempt: `[gemini:{label}] attempt N/M failed (Error: …); retrying in Xms`. After exhausting attempts: `[gemini:{label}] exhausted M attempts: ...`. The `label` is what makes the log readable — every call site passes a stable string.

## Where it's used

All Gemini callers now route through this helper:

| Call site | File | Label | Notes |
|---|---|---|---|
| Audio transcription (Gemini Flash) | `routes/capture.ts` | (inline) | per-attempt timeout from helper default |
| Vision OCR (Gemini Pro structured) | `routes/capture.ts` | (inline) | now with `responseSchema` instead of prompt-only JSON |
| Auto-organize (Gemini Pro structured) | `services/organize.ts` | `organize` | |
| Redaction Pass 2 generalization (Gemini Pro) | `services/redaction.ts` | (inline) | |
| Preservation score (Gemini Flash) | `services/redaction.ts` | (inline) | |
| Embedding (gemini-embedding-001) | `services/embedding.ts` | (inline) | |
| Chat **classifier** (Gemini Flash) | `services/classifier.ts` | `chat.classifier` | `maxAttempts: 2`, `timeoutMs: 8_000` — must fail fast |
| Chat **knowledge stream** (Gemini Pro) | `services/rag.ts` | `rag.stream` | retries connect only; mid-stream chunks can't be retried |
| Chat **conversational stream** (Gemini Flash) | `services/conversational.ts` | `chat.conversational` | `maxAttempts: 2`, `timeoutMs: 30_000` |

The classifier uses `maxAttempts: 2` and an 8 s timeout because **chat latency is a hero-moment risk** — a slow classifier delays every chat reply by 8 s minimum on a bad day; better to fail fast and default to the knowledge path.

## Mid-stream retry rule

Streaming Gemini calls (`generateContentStream`) **only retry the initial connect**. Once chunks start flowing, the helper exits — partial output may already have reached the user, and retrying would either re-stream the prefix or skip context-dependent continuations. This is by design; the RAG stream comment in `services/rag.ts:173–174` captures the rationale explicitly.

## Relations

- **Lifts fragility from**: [[gemini]] (the prior "no retry, no timeout" note)
- **Used by**: [[auto-organization-pipeline]], [[redaction-pipeline]], [[rag-query-pipeline]], [[chat-query-classifier]], [[conversational-chat-path]]
- **Indirectly improves**: every hero moment that depends on a Gemini call — capture organize, publish redaction, chat synthesis, query overlay

## Open questions

- **Circuit breaker** — three retries × 30 s timeout = 90 s worst-case before the user sees an error. At firm scale, a sustained Gemini outage would still serialize one slow failure per user. A short-window circuit breaker (fail-fast after N consecutive failures) is the next reliability layer if we see real outages.
- **Demo-time cost** — retries multiply API spend on a bad day. Probably negligible at MVP/demo scale; worth instrumenting at firm scale.
- **Streaming continuation** — true mid-stream resumption would need server-side checkpointing of the streamed text plus a Gemini "continue from here" path. Out of scope for MVP.

## Sources

- [[consilium-implementation-plan]]
