---
title: Consilium implementation plan (6-day sprint)
type: topic
status: active
tags: [consilium, hackathon, sprint, implementation]
sources: [consilium-implementation-plan]
created: 2026-05-13
updated: 2026-05-13
---

# Consilium implementation plan (6-day sprint)

The canonical ticket board and sprint structure for the [[consilium]] hackathon MVP. 3 developers, 6 days, 25 tickets, 1 deployed demo URL. (see [[consilium-implementation-plan]])

## Principle

**Vertical slices with strict file ownership.** Each developer owns complete features from database query through API route to frontend view. No two developers edit the same file. The bottleneck in AI-assisted development is merge conflicts, not velocity.

## Developer assignments

| Developer | Codename | Domain |
|---|---|---|
| Capture domain | CAPTURE | Note capture, personal graph, IndexedDB |
| Govern domain | GOVERN | Auth, redaction, publish, team graph view |
| Retrieval domain | RETRIEVAL | Chat, RAG, seed data, query overlay, deployment |

Branches: `feat/capture`, `feat/govern`, `feat/retrieval` off `main`.

## Day 0 — Bootstrap (~2 hours, all together)

Before splitting:

- **Retrieval domain**: Vite + React + TypeScript + Tailwind init; Express + TypeScript init; `docker-compose.yml` (Postgres 16 + pgvector + Presidio); run `schema.sql`.
- **Govern domain**: `tokens.css`, `App.tsx` (router skeleton), `Layout.tsx` (nav shell), `apps/api/src/index.ts` (Express mount points), `middleware/auth.ts`, `authStore.ts`.
- **Capture domain**: `api/client.ts` (shared fetch wrapper), `types/index.ts` (shared interfaces).
- All commit to `main`, branch into feature branches.

## Shared files (locked after Day 0)

These files are created once and should not be modified without coordination:

| File | Owner |
|---|---|
| `apps/web/src/styles/tokens.css` | Govern domain |
| `apps/web/src/App.tsx` | Govern domain |
| `apps/web/src/components/Layout.tsx` | Govern domain |
| `apps/api/src/index.ts` | Govern domain |
| `apps/api/src/db/pool.ts` | Retrieval domain |
| `apps/api/src/db/schema.sql` | Retrieval domain |
| `apps/api/src/middleware/auth.ts` | Govern domain |
| `apps/web/src/api/client.ts` | Capture domain |
| `apps/web/src/store/authStore.ts` | Govern domain |
| `apps/web/src/types/index.ts` | All (append-only — each dev appends, never edits others' types) |

## Tickets

### Capture domain — CAPTURE ✓ Complete (as of 2026-05-13)

| Ticket | Day | Priority | Status | Description |
|---|---|---|---|---|
| K-1 | 1 | P0 | ✓ | IndexedDB storage layer (`idb` library, 3 stores: notes / entities / personalGraph, CRUD for PersonalNote) |
| K-2 | 1–2 | P0 | ✓ | Text note capture view (tabbed: Write / Record / Upload; markdown editor; 500ms auto-save to IDB; `POST /api/organize` → entity chips) |
| K-3 | 2 | P0 | ✓ | Audio capture (MediaRecorder + WaveSurfer.js; `POST /api/transcribe`; editable transcript; max 5 min; audio Blob stored in IDB) |
| K-4 | 2 | P1 | ✓ | Image capture (PNG/JPG/WebP max 10MB; `POST /api/vision`; Gemini Vision → editable text; image stored in IDB) — contingency not needed, shipped |
| K-5 | 2 | P0 | ✓ | Auto-organization backend routes (`POST /api/organize`, `/api/transcribe`, `/api/vision`; Gemini Pro structured output → `{entities, classification, isPrivileged}`) |
| K-6 | 3–4 | P0 | ✓ | Personal graph view (Cytoscape.js; **cose layout**; color-coded node types per design tokens; click/hover/search; settles in <2s) |
| K-7 | 4 | P0 | ✓ | Personal note pre-seeding (**6** PH litigation notes with extracted entities seeded into IDB for Lawyer on first login) |
| K-8 | 5 | P0 | ✓ | Capture polish + demo prep (loading states, error handling, entity chip styling, transitions, full test coverage) |

### Govern domain — GOVERN ✓ Complete (as of 2026-05-14)

| Ticket | Day | Priority | Status | Description |
|---|---|---|---|---|
| G-1 | 1 | P0 | ✓ | Auth backend + login view (`POST /api/auth/login` → JWT 24h; bcrypt 10 rounds; 3 pre-seeded accounts: Ana Mendoza / Carlos Reyes / Diana Santos at `litigator|lead|admin@acme.law`, password `demo`) |
| G-2 | 1 | P0 | ✓ | App shell + navigation (top nav 56px + side nav 240px; Lucide icons; orange `#fb8500` active state; ProtectedRoute wrapper) |
| G-3 | 1 | P0 | ✓ | Express server foundation (CORS; JWT middleware; rate limit 60 req/60s in-memory; 429 `{ code: 'RATE_LIMITED' }`) |
| G-4 | 2–3 | P0 | ✓ | Redaction backend service (`POST /api/redact`: Presidio :5001/:5002 → Gemini 2.5 Pro → preservation score; regex fallback on Presidio failure; `POST /api/publish`: embed via `gemini-embedding-001` (768-dim) → insert team_graph_nodes + edges) |
| G-5 | 3–4 | P0 | ✓ | Redaction modal UI — hero moment 1 (full-screen split pane; **5-dot preservation score** (not 0–100% bar); contentEditable right pane; publish gated by `confidence > 40 \|\| hasManualEdit`; connecting curves not implemented — intentional cost trim) |
| G-6 | 4 | P0 | ✓ | Team graph view (read-only Cytoscape.js cose layout; click → 340px slide-in node summary panel; opacity-based search filter) |
| G-7 | 2 | P0 | ✓ | Team graph API route (`GET /api/team-graph`; `GET /api/team-graph/nodes/:id`) |
| G-8 | 5 | P0 | ✓ | Governance polish + demo prep (login error states, modal animations, Toast 3s auto-dismiss, reduced-motion handling, a11y, nav active states) |

### Retrieval domain — RETRIEVAL ✓ Complete (as of 2026-05-14)

| Ticket | Day | Priority | Status | Description |
|---|---|---|---|---|
| N-1 | 1 | P0 | ✓ | Database setup + schema (Postgres 16 via `pgvector/pgvector:pg16`; pool via `pg`; DDL for users / team_graph_nodes / team_graph_edges; pgvector HNSW `vector_cosine_ops`; `docker-compose.yml` with postgres + presidio-analyzer + presidio-anonymizer) |
| N-2 | 1–2 | P0 | ✓ | Seed data — **20 published insights** (5 judge tendencies / 3 opposing counsel / 4 motion practice / 3 expert witness / 3 settlement / 2 procedural); entity nodes auto-extracted and deduplicated; embeddings computed at seed time; `POST /api/seed` idempotent |
| N-3 | 2–3 | P0 | ✓ | RAG service (embed → top-8 cosine → 1-hop expansion **insights only** → filter >0.55 → Gemini 2.5 Pro streaming; confidence: High 3+×≥0.80, Medium 2+×≥0.70, Low 1×≥0.75, Refuse 0×≥0.75) |
| N-4 | 3 | P0 | ✓ | Chat SSE — events: `cited-nodes` (first), `token` (streaming), `done` (final with confidence + sourceCount) |
| N-5 | 3–4 | P0 | ✓ | Chat view UI (streaming response; inline `[id]` citations parsed to chips; refusal state with explicit message; auto-scroll) |
| N-6 | 4–5 | P0 | ✓ | Query overlay — **canvas-based** (deviation from spec — not Cytoscape-rendered): 15% base opacity, 100% cited + glow; fade-in 400ms / hold ~800ms / fade-out 600ms; `prefers-reduced-motion` skips rAF; HiDPI scaled |
| N-7 | 4–5 | P0 | ✓ | Deployment (Vercel for frontend with SPA rewrites + asset caching; Railway for backend via Dockerfile; `GET /api/health` health check; env vars enumerated in `.env.example` files) |
| N-8 | 5–6 | P0 | ✓ | Integration + audit (4 bugs caught in `4e69206` commit: package.json `type: module` regression, Zustand re-render bug, canvas jitter, prompt path resolution; postbuild `shx cp` for prompts + schema.sql to dist) |

## Day-by-day summary

| Day | Capture domain (CAPTURE) | Govern domain (GOVERN) | Retrieval domain (RETRIEVAL) |
|---|---|---|---|
| 0 | Shared types, fetch client | Tokens, App shell, auth middleware, server init | Vite+Express init, Docker, schema |
| 1 | K-1: IndexedDB layer | G-1: Auth backend + login UI | N-1: DB setup, N-2: Seed data |
| 2 | K-2: Text capture, K-3: Audio | G-2: Nav shell, G-3: Server, G-7: Team graph API | N-2: Seed content + embeddings |
| 3 | K-4: Image capture, K-5: Organize backend | G-4: Redaction backend | N-3: RAG service, N-4: Chat API |
| 4 | K-6: Personal graph view | G-5: Redaction modal UI, G-6: Team graph view | N-5: Chat UI, N-6: Query overlay |
| 5 | K-7: Personal seed, K-8: Polish | G-8: Governance polish | N-6: Overlay polish, N-7: Deploy |
| 6 | Demo prep | Demo prep | N-8: Integration test, demo prep |

## Merge strategy

- Daily merge to `main` in order: **Retrieval domain first** (infra), **Govern domain second** (auth/shell), **Capture domain last** (features).
- `types/index.ts` is append-only — each developer adds interfaces at the bottom, never edits existing ones.
- Conflicts on shared files: resolved by the designated file owner (see table above).

## Contingency plans

| Risk | Fallback | Owner |
|---|---|---|
| Presidio container issues | Mock PII detection with regex fallback | Govern domain |
| Query-overlay animation | Simplified: dim chat only, no graph fly-in | Retrieval domain |
| Image capture (K-4) | Drop entirely, demo text + audio only | Capture domain |
| Personal graph >100 nodes | Cap seed at 50 personal nodes | Capture domain |
| Pass 2 generalization quality | Ship Pass 1 only + manual review | Govern domain |
| Whisper API latency | Pre-record a demo audio clip, cache transcript | Capture domain |

## Relations

- **Implements**: [[consilium-mvp-scope]], [[consilium-demo-narrative]]
- **Allocates**: K-2/K-3/K-5 (capture feature), G-4/G-5 (redaction + [[redaction-pipeline]]), N-2 (seed, [[acme-litigation-partners]]), N-3/N-4/N-5/N-6 ([[rag-query-pipeline]], [[query-overlay-animation]])
- **Structure lives in**: [[consilium-codebase-structure]]

## Sources

- [[consilium-implementation-plan]]
