---
title: Gemini (Google AI)
type: entity
status: active
tags: [ai-model, llm, vendor, google]
sources: [consilium-project-architecture, consilium-product-requirements, consilium-context-dump, consilium-seed-data-analysis, consilium-implementation-plan]
created: 2026-05-12
updated: 2026-05-15
---

# Gemini

Google's frontier LLM family. Consilium MVP uses three variants plus an embedding model, **called directly via the Gemini API** (not via Google AI Studio — the WeMakeDevs Cognee Hackathon organizers relaxed the AI Studio requirement mid-build, so Consilium uses the direct API path).

## Key facts

- **Access path (MVP)**: **Gemini API directly**. The WeMakeDevs Cognee Hackathon's earlier "via Google AI Studio" requirement was relaxed during the session. (see [[consilium-context-dump]] §10 update)
- **Gemini 2.5 Pro** — entity extraction, classification, [[redaction-pipeline|redaction Pass 2 generalization]], [[rag-query-pipeline|RAG synthesis]]. (see [[consilium-project-architecture]])
- **Gemini 2.5 Flash** — lower-stakes/faster ops: confidence scoring, summary generation, [[insight-preservation-score]].
- **Gemini Vision** — image-to-text for [[consilium|image capture]] (PNG/JPG/WebP up to 10MB).
- **Embedding model** (as shipped): **`gemini-embedding-001`** with `outputDimensionality: 768` to match the `vector(768)` column with HNSW + `vector_cosine_ops` in [[postgres-pgvector]]. The architecture spec called for `text-embedding-004`, but that model is not exposed by the `@google/generative-ai` SDK; the implementation switched to `gemini-embedding-001` in commits `0164277` + `b522b13` and uses a type-assertion workaround because `@google/generative-ai@0.24.1` types omit the `outputDimensionality` field (the API accepts it).
- **In V1**: cloud Gemini Pro continues to receive **only sanitized content**; on-device extraction shifts to [[gemma]].

## Role in pipelines

- **[[auto-organization-pipeline]]**: single structured-output Gemini Pro call returns `{ entities, classification, isPrivileged }`.
- **[[redaction-pipeline]]**: Pass 2 generalization rewrites specifics to legal-principle level. Pass 4 (preservation) at V1 is a dedicated Gemini call.
- **[[rag-query-pipeline]]**: streams the response with system-prompt-enforced grounding and inline `[node_id]` citations; refuses below the recalibrated thresholds (no nodes ≥0.60).
- **[[chat-query-classifier]]** (added 2026-05-15): Gemini Flash routes every chat message to either the knowledge pipeline or the [[conversational-chat-path]]. Structured output with `format: 'enum'`, tight 8 s timeout, fails safe to `knowledge`.
- **[[conversational-chat-path]]** (added 2026-05-15): Gemini Flash streaming reply with no retrieval, used for greetings / capability questions / prior-turn follow-ups.
- **Audio transcription** (added 2026-05-14): Gemini 2.5 Flash via `inlineData` (base64 WebM/Opus) on `POST /api/transcribe`. Replaced [[whisper|OpenAI Whisper]] to consolidate on a single API key.
- **Vision OCR** (revised 2026-05-15): `POST /api/vision` now uses `responseMimeType: 'application/json'` + `responseSchema` for `{ text, description }` — matches the structured-output discipline already used by organize and the classifier (replaces the older prompt-only "return ONLY JSON" pattern).

## Reliability — retry wrapper (added 2026-05-15)

Every Gemini SDK call in the API service now routes through **`withGeminiRetry`** ([[gemini-retry-backoff]]). Exponential backoff with full jitter, per-attempt SDK `timeout`, retryable-error classification (`GoogleGenerativeAIFetchError` 408/425/429/5xx, abort errors, network-layer failures, status codes in message strings). This lifts the prior "no retry, no timeout, transient 5xx surfaces as 500" fragility. Streaming calls retry the initial connect only — mid-stream chunks aren't safely resumable.

## Cost envelope (MVP demo period)

- $20–$50 across Pro + Flash + Vision + embedding for the hackathon period. (see [[consilium-project-architecture]] §12)
- Recommend using GCP's $300 free credit for new accounts.

## Hackathon award eligibility

Consilium qualifies for the **Gemini Award**: Gemini powers extraction, redaction, and synthesis throughout the product. (see [[hackathon-judging-fit]])

## Relations

- **Used by**: [[consilium]] across all three AI pipelines
- **Complement (V1)**: [[gemma]] for on-device personal-layer extraction
- **Sees only sanitized content** after [[redaction-pipeline]] for published content
- **Replaced** [[whisper]] for MVP audio transcription (2026-05-14)

## Open questions

- If Google migrates customers to a newer embedding model, what is the rebuild path for the existing 768-d HNSW index?
- Structured-output reliability in [[auto-organization-pipeline]]: what's the fallback when JSON schema validation fails?

## Sources

- [[consilium-project-architecture]]
- [[consilium-product-requirements]]
- [[consilium-context-dump]]
- [[consilium-seed-data-analysis]]
- [[consilium-implementation-plan]]
