---
title: Consilium AI pipelines
type: topic
status: active
tags: [consilium, ai, pipelines]
sources: [consilium-project-architecture, consilium-product-requirements]
created: 2026-05-12
updated: 2026-05-12
---

# Consilium AI pipelines

The three AI pipelines that make [[consilium|Consilium]] more than a notes app. All three depend on [[gemini]] (with [[whisper]] for audio and [[microsoft-presidio]] for redaction Pass 1).

## The three pipelines

| Pipeline | Trigger | Output |
|---|---|---|
| [[auto-organization-pipeline]] | Note saved | Entities, classification, privilege flag |
| [[redaction-pipeline]] | Lawyer clicks Publish | Sanitized version + redaction map + preservation score |
| [[rag-query-pipeline]] | Lawyer submits chat query | Streamed answer with inline citations |

## Auto-organization (after every note save)

Single structured-output Gemini Pro call returns `{ entities, classification, isPrivileged }` in under 5 seconds. Frontend updates the personal graph and renders entity chips on the note. See [[auto-organization-pipeline]] for the full spec.

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant IDB as IndexedDB
    participant BE as Backend
    participant G as Gemini Pro

    U->>FE: Save note
    FE->>IDB: Store note (initial)
    FE->>BE: POST /api/organize
    BE->>G: Extract + classify + privilege (one prompt)
    G-->>BE: { entities, classification, isPrivileged }
    BE-->>FE: Organization result
    FE->>IDB: Update note with entities, flags
    FE->>FE: Update personal graph view
```

## Redaction (on publish)

Two-pass MVP: [[microsoft-presidio|Presidio]] tokenization → Gemini generalization → preservation score (Flash). The frontend renders a side-by-side diff modal with hoverable connecting curves between matched redaction pairs. On approval, the sanitized version is embedded and inserted into the team graph.

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Backend
    participant P as Presidio
    participant G as Gemini Pro

    U->>FE: Click "Publish to team graph"
    FE->>BE: POST /api/redact
    BE->>P: Detect + tokenize PII
    P-->>BE: Tokenized content + map
    BE->>G: Generalize specifics (Pass 2)
    G-->>BE: Sanitized text
    BE->>G: Preservation score (Flash)
    G-->>BE: Confidence 0–100
    BE-->>FE: { original, sanitized, redactions[], confidence }
    FE->>U: Side-by-side diff modal
    U->>FE: Approve
    FE->>BE: POST /api/publish
    BE->>G: Generate embedding
    G-->>BE: Vector
    BE->>BE: Insert into team_graph_nodes + edges
    BE-->>FE: Publish success + new node ID
```

See [[redaction-pipeline]] for the full spec including V1 four-pass.

## RAG query (on chat submit)

Embed query → top-8 cosine similarity in [[postgres-pgvector]] → 1-hop graph expansion → filter > 0.55 → stream Gemini Pro with grounding prompt. In parallel, frontend triggers [[query-overlay-animation]] using the returned cited node IDs.

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Backend
    participant DB as Postgres
    participant G as Gemini Pro

    U->>FE: Submit query
    FE->>BE: POST /api/chat
    BE->>G: Embed query
    G-->>BE: Vector
    BE->>DB: Top-8 cosine similarity
    DB-->>BE: Node IDs + scores
    BE->>DB: 1-hop expansion
    DB-->>BE: Context nodes
    BE-->>FE: Cited node IDs (overlay trigger)
    BE->>G: Stream response (grounding prompt)
    G-->>BE: Streamed tokens
    BE-->>FE: Streamed response
    FE->>U: Render with citation chips
```

See [[rag-query-pipeline]] for retrieval thresholds, confidence buckets, and refusal rules.

## Latency budget

- Auto-organization: **under 5 seconds**.
- Redaction: **two passes complete within 5 seconds**; modal opens within 3.
- Chat: **streaming begins within 3 seconds**; cited node IDs arrive in 1–2.

## Cost (MVP)

Total Gemini + Whisper for the hackathon window: **$25–$60** (covered by GCP $300 free credit). (see [[consilium-project-architecture]] §12)

## Sources

- [[consilium-project-architecture]]
- [[consilium-product-requirements]]
