---
title: Consilium tech stack (MVP and V1)
type: topic
status: active
tags: [consilium, stack, architecture]
sources: [consilium-project-architecture]
created: 2026-05-12
updated: 2026-05-12
---

# Consilium tech stack

The full ladder of choices, MVP and V1, mapped from [[consilium-project-architecture]] §2.

## Synthesis

MVP is **intentionally pragmatic**: one SPA, one backend, one database, cloud AI. No microservices, no graph DB. The goal is build speed, demo quality, and clarity over production correctness. V1 adds native shells, on-device LLM, per-firm single-tenant cloud, SSO and audit — and only then does the stack take on the operational complexity that real customers require.

## MVP frontend

| Layer | Choice | Reason |
|---|---|---|
| Framework | React 18 | Team familiarity, ecosystem |
| Build tool | Vite | Fast dev loop |
| Language | TypeScript | Type safety |
| Routing | React Router | Standard |
| State | Zustand or React Context | Lightweight; no Redux |
| Forms | React Hook Form | Performance, ergonomics |
| Styling | Tailwind CSS | Speed of iteration |
| Graph viz | [[cytoscape-js]] | Better than D3 for 100+ nodes; built-in force-directed |
| Markdown | `react-markdown` + `remark-gfm` | Rendering notes |
| Audio | MediaRecorder API + WaveSurfer.js | Native browser APIs |
| Local storage | IndexedDB via `idb` library | Better DX than raw IDB |
| HTTP | TanStack Query + fetch | Caching, retries, mutations |

## MVP backend

| Layer | Choice | Reason |
|---|---|---|
| Runtime | Node.js 20 | Team familiarity |
| Framework | Express | Minimal, well-known |
| Language | TypeScript | Type safety |
| Auth | `jsonwebtoken` + `bcrypt` | JWT sessions, password hashing |
| DB client | `pg` (node-postgres) | Direct, no ORM |
| Validation | Zod | Runtime + type safety |
| Environment | `dotenv` | Standard config |
| File upload | `multer` | Image upload handling |

## MVP database

Single **[[postgres-pgvector|Postgres 16]]** instance with extensions `pgvector` and `uuid-ossp`. Tables: `users`, `sessions`, `team_graph_nodes`, `team_graph_edges`, `node_embeddings` (pgvector column), `seed_data`.

Personal notes live in **browser IndexedDB** only.

**Why not a graph database**: 1-hop expansion and filtered retrieval are straightforward SQL under 10k nodes. Neo4j / Apache AGE add operational complexity without proportional benefit.

## MVP AI

| Service | Used for |
|---|---|
| [[gemini\|Gemini 2.5 Pro]] | Entity extraction, classification, Pass 2 generalization, RAG synthesis |
| [[gemini\|Gemini 2.5 Flash]] | Confidence scoring, summary generation, [[insight-preservation-score]] |
| [[gemini\|Gemini Vision]] | Image-to-text capture |
| [[whisper\|Whisper]] | Audio transcription |
| [[microsoft-presidio\|Microsoft Presidio]] | Pass 1 PII tokenization (self-hosted Docker) |
| `text-embedding-004` | 768-d embeddings (pgvector column) |

## MVP deployment

- **Frontend**: Vercel (free tier)
- **Backend**: Railway or Render (free tier)
- **Postgres**: same provider as backend (managed add-on)
- **Presidio**: same provider, Docker
- **Demo URL**: single public URL fronting the SPA
- **Cost**: under $100 for the hackathon window

## V1 stack additions

| Concern | V1 choice |
|---|---|
| Desktop app shell | [[tauri\|Tauri]] (Rust, cross-platform, smaller than Electron) |
| Mobile | React Native (faster velocity than dual-native) |
| On-device model | [[gemma\|Gemma]] 2B or 3B |
| Local vector index | SQLite with `sqlite-vec` extension |
| Identity | WorkOS or Auth0 (SSO and identity management) |
| Object storage | S3-compatible for shared assets |
| Logging | OpenTelemetry → Datadog or Honeycomb |
| Per-firm KMS | AWS KMS or GCP KMS (unresolved) |

## V1 deployment

- **Per-firm single-tenant** cloud — each firm gets its own isolated stack
- **US-East default**; EU regions added at V2 for GDPR
- **Customer-initiated deletion** within 30 days

## Cross-references

- [[consilium-codebase-structure]] — monorepo layout, directory ownership per developer
- [[consilium-implementation-plan]] — ticket-to-file mapping and build schedule
- [[consilium-data-model]] — schemas in detail
- [[consilium-ai-pipelines]] — sequence diagrams
- [[consilium-api-surface]] — REST endpoints

## Sources

- [[consilium-project-architecture]]
