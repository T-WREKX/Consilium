---
title: Consilium · Project Architecture
type: source
status: mature
tags: [consilium, architecture, stack, data-model]
raw: raw/project-architecture.md
author: Consilium team
publication: Internal architecture doc
published: 2026 (v1, hackathon stage)
ingested: 2026-05-12
re-ingested: 2026-05-12
created: 2026-05-12
updated: 2026-05-12
---

# Consilium · Project Architecture

> Source file: [`raw/project-architecture.md`](../raw/project-architecture.md)

## One-line summary

How Consilium is built. MVP stack is intentionally pragmatic (React+Vite SPA, single Express backend, single Postgres with pgvector, Gemini cloud, IndexedDB for personal notes). V1 evolves into native apps with on-device [[gemma]], single-tenant cloud per firm, full SSO/audit/MCP.

## Why it's here

The build sheet. When choosing libraries, when picking schemas, when wiring an endpoint — this is the spec.

## Re-ingest note (2026-05-12)

Architecture document was refreshed. The only meaningful diff: §2.4 (AI Services) — the [[gemini]] row changed from "Google AI Studio / Gemini API" to **just "Gemini API"**. This matches the [[consilium-context-dump|context dump]]'s §10 update: the WeMakeDevs Cognee Hackathon organizers relaxed the Google AI Studio requirement; Consilium calls the Gemini API directly. Gemini Award eligibility is unchanged. Otherwise the document is identical to the initial ingest below.

## Key claims

- **AI access path**: **[[gemini|Gemini API directly]]** (no longer "via Google AI Studio"). (refreshed 2026-05-12)
- **MVP architecture**: [[react-vite|React + Vite]] SPA, Node.js + Express backend, single [[postgres-pgvector|Postgres 16 with pgvector + uuid-ossp]], browser IndexedDB for personal notes, self-hosted [[microsoft-presidio]] in Docker, all AI via [[gemini]] + [[whisper]].
- **No microservices**, no graph database. Postgres relational tables modeling nodes/edges + pgvector for similarity is sufficient under 10k nodes.
- **Why pgvector + relational, not Neo4j**: 1-hop neighborhood queries and filtered retrieval are straightforward SQL. Operational complexity savings outweigh graph-DB benefits at this scale.
- **Embedding model**: `text-embedding-004` (768 dimensions). HNSW index with `vector_cosine_ops`.
- **MVP frontend stack**: React 18, Vite, TypeScript, React Router, Zustand, React Hook Form, Tailwind, [[cytoscape-js]] for graph, `react-markdown` + `remark-gfm`, MediaRecorder API + WaveSurfer.js, `idb` library, TanStack Query.
- **MVP backend stack**: Node 20, Express, TypeScript, `jsonwebtoken` + `bcrypt`, `pg` (no ORM), Zod, multer for uploads.
- **Auth**: JWT in `Authorization: Bearer`, 24h expiry, bcrypt cost factor 10, 60 req/min rate limit per user.
- **[[auto-organization-pipeline]]**: single structured-output Gemini call returns `{ entities, classification, isPrivileged }`.
- **[[redaction-pipeline]]**: two-pass MVP (Presidio → Gemini generalization → preservation score with Flash). Redaction map is array of `{ original, replacement, type, position }` for diff highlighting.
- **[[rag-query-pipeline]]**: embed query → top-8 cosine similarity → 1-hop graph expansion → filter > 0.55 similarity to query → construct context → stream Gemini Pro response with inline `[node_id]` citations.
- **Confidence buckets**: High (3+ nodes > 0.80, same cluster), Medium (2+ > 0.70, mixed), Low (1 > 0.75), Refuse (zero > 0.75).
- **API surface**: 12 endpoints, REST, `{ data, error? }` envelope.
- **Deployment**: Vercel (frontend), Railway/Render (backend + Postgres + Presidio). Single public URL. Free tiers cover the demo period.
- **Cost**: under $100 for the hackathon window; $300 GCP free credit covers Gemini.
- **V1 stack additions**: [[tauri]] for desktop, React Native for mobile, [[gemma]] 2B/3B on-device, SQLite + `sqlite-vec` for local index, WorkOS or Auth0, OpenTelemetry → Datadog/Honeycomb, per-firm KMS.
- **V1 deployment**: single-tenant per firm, US-East default, EU at V2 for GDPR.
- **[[mcp-server]] (V1)**: `query`, `get_node`, `list_topics` over the team graph; OAuth 2.0 client-credentials; rate limits per firm default 1000/hour per integration.
- **Repo structure**: pnpm workspace with `apps/web`, `apps/api`, `infra/`, `docs/`.
- **Six-day build plan**: day 1 scaffolding/auth/seed/design tokens; day 2 capture+AI organization+personal graph foundation; day 3 graph polish + redaction; day 4 team graph + RAG backend; day 5 query-overlay + chat UI + citations; day 6 hardening + dry runs + submission.
- **Risk register**: Pass 2 generalization quality (fallback: Pass 1 only with manual review), query-overlay animation (fallback: simplified animation), image capture (drop entirely if needed), graph perf (cap seed at 50 nodes).

## Sections / structure of the source

1. System Architecture Overview (MVP and V1 with mermaid diagrams)
2. Technology Stack (frontend, backend, database, AI, deployment)
3. Data Model (Postgres SQL, IndexedDB TypeScript)
4. AI Pipelines (sequence diagrams for organize, redact, RAG)
5. API Surface
6. Auth and Security
7. The Pluggable Brain (MCP) — V1
8. Integration Strategy
9. Observability and Audit
10. Repository Structure
11. Build Plan Summary (6 days, 3 devs)
12. Cost Estimate

## Pages this source materially changed

- [[consilium-tech-stack]], [[consilium-data-model]], [[consilium-ai-pipelines]], [[consilium-api-surface]] — created
- [[postgres-pgvector]], [[react-vite]], [[tauri]], [[microsoft-presidio]], [[cytoscape-js]], [[gemma]], [[whisper]], [[gemini]] — created
- [[auto-organization-pipeline]], [[rag-query-pipeline]] — created with full pipeline specs
- [[mcp-server]] — created with V1 endpoint shape
- [[local-first-architecture]] — created (sold externally as local-first, MVP runs cloud AI; honest internally)

## Contradictions or tensions

> ⚠ Local-first marketing vs MVP reality: architecture document admits "for the MVP we are honest internally that AI runs in the cloud, but the architecture supports the local-first story we present externally." V1 is where on-device [[gemma]] makes it real. Anyone reading external Consilium materials should verify which version is being described.

> ⚠ Single-tenant in V1: the brief implies a uniform product; architecture clarifies V1 is **per-firm isolated stacks**, not multi-tenant. This is a meaningful operational and pricing constraint.

## Open questions raised

- Embedding dimension `vector(768)` matches `text-embedding-004`; if Google migrates customers to a newer embedding model, what is the rebuild path?
- HNSW recall/latency trade-off at single-firm scale (under 10k nodes) is fine; what is the V1 plan if a firm graph crosses 100k nodes?
- Per-firm KMS: AWS KMS or GCP KMS? V1 stack table lists both; choice is unresolved.

## Related

- [[consilium-product-requirements]] — every acceptance criterion in the PRD maps to a piece of this architecture
- [[consilium-design-guidelines]] — UI side of the same system
