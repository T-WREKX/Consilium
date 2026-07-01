# Consilium — Implementation Plan & Ticket Board

**Hackathon:** 6 days · 3 developers · AI-assisted development
**Goal:** Deployed MVP at a public URL that executes the 5-minute demo script end-to-end

---

## Division Strategy

**Principle: Vertical slices with strict file ownership.** Each developer owns complete features from database queries through API routes to frontend views. No two developers ever edit the same file. AI agents generate code fast — the bottleneck is merge conflicts, not velocity.

### Developer Assignments

| Developer | Codename | Domain | Primary Directories |
|---|---|---|---|
| **Capture domain** | CAPTURE | Note capture + personal graph + IndexedDB | `views/capture/`, `views/graph/`, `lib/idb.ts`, `routes/capture.ts`, `services/organize.ts` |
| **Govern domain** | GOVERN | Auth + redaction + publish + team graph view | `views/auth/`, `views/publish/`, `views/team/`, `routes/auth.ts`, `routes/publish.ts`, `services/redaction.ts` |
| **Retrieval domain** | RETRIEVAL | Chat + RAG + seed data + query overlay + deployment | `views/chat/`, `components/CitationChip.tsx`, `routes/chat.ts`, `services/rag.ts`, `seed/`, `infra/` |

### Shared Files (Locked After Day 0)

These files are created once on Day 0 and should not be modified without coordinating:

| File | Owner | Contents |
|---|---|---|
| `apps/web/src/styles/tokens.css` | Govern domain | Design tokens from `.agent/design-guidelines.md` §13 |
| `apps/web/src/App.tsx` | Govern domain | Router setup with lazy-loaded view imports |
| `apps/web/src/components/Layout.tsx` | Govern domain | Shell: top nav (56px) + side nav (240px) + content area |
| `apps/api/src/index.ts` | Govern domain | Express app + middleware + router mounts |
| `apps/api/src/db/pool.ts` | Retrieval domain | Postgres connection pool (`pg`) |
| `apps/api/src/db/schema.sql` | Retrieval domain | Full DDL from `.agent/project-architecture.md` §3 |
| `apps/api/src/middleware/auth.ts` | Govern domain | JWT verification middleware |
| `apps/web/src/api/client.ts` | Capture domain | Shared fetch wrapper with JWT header injection |
| `apps/web/src/store/authStore.ts` | Govern domain | Zustand auth store (token, user, login/logout) |
| `apps/web/src/types/index.ts` | All (append-only) | Shared TypeScript interfaces — each dev appends, never edits others' types |

---

## Day 0 — Bootstrap (All 3 Together, ~2 Hours)

Before splitting up, do this together on a call:

- [ ] **Retrieval domain:** Initialize `apps/web/` with Vite + React + TypeScript + Tailwind
- [ ] **Retrieval domain:** Initialize `apps/api/` with Express + TypeScript
- [ ] **Retrieval domain:** Create `infra/docker-compose.yml` (Postgres 16 + pgvector + Presidio containers)
- [ ] **Retrieval domain:** Run `schema.sql` against local Postgres
- [ ] **Govern domain:** Create `tokens.css`, `App.tsx` (router skeleton), `Layout.tsx` (nav shell)
- [ ] **Govern domain:** Create `apps/api/src/index.ts` with router mount points for all route files
- [ ] **Govern domain:** Create `middleware/auth.ts` and `authStore.ts`
- [ ] **Capture domain:** Create `api/client.ts` (fetch wrapper) and `types/index.ts` (shared interfaces)
- [ ] **All:** Commit to `main`, branch into `feat/capture`, `feat/govern`, `feat/retrieval`

After Day 0, each developer works on their own branch. Merge to `main` at end of each day.

---

## Tickets

### Capture — Capture & Personal Graph

---

#### K-1: IndexedDB Storage Layer
**Day:** 1
**Priority:** P0 — blocking everything else in Capture
**Files:**
- `apps/web/src/lib/idb.ts`
- `apps/web/src/types/index.ts` (append PersonalNote, Entity, NoteClassification)

**Description:**
Set up IndexedDB using the `idb` library with three object stores: `notes` (key: id), `entities` (key: id), `personalGraph`. Implement CRUD operations for PersonalNote. Use the PersonalNote interface from `.agent/project-architecture.md` §3.2.

**Acceptance Criteria:**
- `createNote()`, `getNote()`, `updateNote()`, `deleteNote()`, `getAllNotes()` working
- Notes persist across page refreshes
- Auto-generates UUIDs client-side

---

#### K-2: Text Note Capture View
**Day:** 1–2
**Priority:** P0
**Files:**
- `apps/web/src/views/capture/CaptureView.tsx`
- `apps/web/src/views/capture/TextCapture.tsx`
- `apps/web/src/store/noteStore.ts`

**Description:**
Build the capture screen with a tabbed interface (Write / Record / Upload). Text capture: title input + markdown body editor. Auto-save on keystroke (debounced 500ms) to IndexedDB. After save, call `POST /api/organize` and update note with returned entities/classification.

**Acceptance Criteria:**
- New note button visible from capture view
- Editor opens with focus on title
- Body supports bold, italic, lists, headings via markdown
- Auto-saves to IndexedDB
- Entity chips appear on note after AI organization returns

---

#### K-3: Audio Capture
**Day:** 2
**Priority:** P0
**Files:**
- `apps/web/src/views/capture/AudioCapture.tsx`
- `apps/web/src/lib/audio.ts`

**Description:**
MediaRecorder API integration. Record button → duration counter + WaveSurfer.js waveform → stop → call `POST /api/transcribe` → editable transcript becomes note body. Store audio Blob in IndexedDB. Max 5 minutes.

**Acceptance Criteria:**
- Recording shows duration counter and waveform
- Stop finalizes and triggers Whisper transcription
- Transcript is editable before save
- Original audio stored in IndexedDB and playable from note

---

#### K-4: Image Capture
**Day:** 2
**Priority:** P1 (droppable per contingency plan)
**Files:**
- `apps/web/src/views/capture/ImageCapture.tsx`

**Description:**
Image upload (PNG, JPG, WebP, max 10MB). Preview shown. Call `POST /api/vision` → Gemini Vision extracts text → result editable as note body. Store original image in IndexedDB.

**Acceptance Criteria:**
- Upload accepts PNG/JPG/WebP up to 10MB
- Preview displayed
- Extracted text editable before save
- Original image stored and displayed inline

---

#### K-5: Auto-Organization Backend Routes
**Day:** 2
**Priority:** P0
**Files:**
- `apps/api/src/routes/capture.ts`
- `apps/api/src/services/organize.ts`
- `apps/api/src/prompts/organize.md`

**Description:**
Three routes: `POST /api/organize` (Gemini Pro structured output → entities + classification + privilege flag), `POST /api/transcribe` (Whisper API proxy), `POST /api/vision` (Gemini Vision proxy). Write the organization system prompt as a structured JSON output schema.

**Acceptance Criteria:**
- `/api/organize` returns `{ entities, classification, isPrivileged }` in <5s
- `/api/transcribe` returns transcript text
- `/api/vision` returns extracted text + structural description
- All routes require valid JWT

---

#### K-6: Personal Graph View (Cytoscape.js)
**Day:** 3–4
**Priority:** P0
**Files:**
- `apps/web/src/views/graph/PersonalGraphView.tsx`
- `apps/web/src/lib/graphUtils.ts`

**Description:**
Force-directed graph rendering all personal notes + extracted entities from IndexedDB. Node types color-coded per design-guidelines §2.5. Click note node → open note. Click entity node → filter to neighborhood. Hover → tooltip. Search filter: matching nodes stay colored, others fade to 20%. Empty state: "Capture your first note" CTA.

**Acceptance Criteria:**
- Renders cleanly with 100+ nodes
- Node clicks work correctly per type
- Search filter works in real time
- Layout settles within 2 seconds
- Color coding matches design tokens

---

#### K-7: Personal Note Pre-Seeding
**Day:** 4
**Priority:** P0
**Files:**
- `apps/web/src/lib/seedPersonal.ts`

**Description:**
Pre-seed 5–8 personal notes into IndexedDB for the Lawyer demo account on first login. Notes should cover litigation topics matching the team graph seed data. Include extracted entities so the personal graph renders populated.

**Acceptance Criteria:**
- Lawyer account sees populated personal graph on first login
- Notes have realistic litigation content
- Entity chips present on each note

---

#### K-8: Capture Polish & Demo Prep
**Day:** 5
**Priority:** P0
**Files:** All capture/graph files (polish only)

**Description:**
Polish pass: loading states, error handling with retry buttons, transitions between capture tabs, entity chip styling, graph performance tuning. Verify all three capture methods work for the demo script.

**Acceptance Criteria:**
- All three capture methods demo-ready
- Entity extraction failure shows retry button
- Smooth transitions throughout capture flow

---

### Govern — Auth, Redaction & Governance

---

#### G-1: Auth Backend + Login View
**Day:** 1
**Priority:** P0 — blocking all authenticated routes
**Files:**
- `apps/api/src/routes/auth.ts`
- `apps/api/src/services/auth.ts`
- `apps/web/src/views/auth/LoginView.tsx`
- `apps/web/src/store/authStore.ts`

**Description:**
`POST /api/auth/login` — validate email+password against bcrypt hash, return JWT (24h expiry). `POST /api/auth/logout`. `GET /api/me`. Three pre-seeded accounts: `litigator@acme.law`, `lead@acme.law`, `admin@acme.law` (all password: `demo`). Login UI: "Sign in to Consilium", email + password fields, "Continue" button.

**Acceptance Criteria:**
- All three demo accounts log in successfully
- JWT stored in Zustand + localStorage
- Logout clears state and returns to login
- Login page follows design tokens (dark, amber accent)

---

#### G-2: App Shell & Navigation
**Day:** 1
**Priority:** P0
**Files:**
- `apps/web/src/App.tsx` (update routes)
- `apps/web/src/components/Layout.tsx`
- `apps/web/src/components/TopNav.tsx`
- `apps/web/src/components/SideNav.tsx`

**Description:**
Top nav (56px sticky, `bg-surface`) with Consilium wordmark + user display name + logout. Side nav (240px) with Lucide icons: Personal Graph, Capture, Team Graph, Chat. Active state uses `accent-primary`. Protected route wrapper redirecting to login.

**Acceptance Criteria:**
- Navigation between all views works
- Active nav item highlighted with amber accent
- User name displayed in top nav
- Unauthenticated users redirected to login

---

#### G-3: Express Server Foundation
**Day:** 1
**Priority:** P0
**Files:**
- `apps/api/src/index.ts` (finalize)
- `apps/api/src/middleware/auth.ts` (finalize)
- `apps/api/src/middleware/rateLimit.ts`

**Description:**
Express server with CORS (frontend origin only), JSON body parsing, JWT auth middleware, rate limiting (60 req/min per user). Mount all route files: `auth`, `capture`, `publish`, `chat`. Response envelope: `{ data, error? }`.

**Acceptance Criteria:**
- Server starts and mounts all routes
- Auth middleware correctly validates JWT on protected routes
- CORS configured for frontend origin
- Rate limiting active

---

#### G-4: Redaction Backend Service
**Day:** 2–3
**Priority:** P0
**Files:**
- `apps/api/src/routes/publish.ts`
- `apps/api/src/services/redaction.ts`
- `apps/api/src/prompts/redact.md`
- `apps/api/src/prompts/preserve.md`

**Description:**
`POST /api/redact`: receives note content → Pass 1 (call Presidio container for PII tokenization) → Pass 2 (call Gemini Pro for generalization) → call Gemini Flash for preservation score → return `{ original, sanitized, redactions[], confidence }`. Redaction map: `{ original, replacement, type: 'PII'|'GENERALIZATION', position: [start, end] }[]`.

`POST /api/publish`: receives sanitized content → generate embedding via `text-embedding-004` → insert into `team_graph_nodes` + create edges → return new node ID.

**Acceptance Criteria:**
- Presidio integration detects and tokenizes PII correctly
- Gemini generalizes specifics while preserving insight
- Preservation score returns 0–100
- Both passes complete within 5 seconds
- Publish inserts node + edges into Postgres

---

#### G-5: Redaction Modal UI (Hero Moment 1)
**Day:** 3–4
**Priority:** P0
**Files:**
- `apps/web/src/views/publish/RedactionModal.tsx`
- `apps/web/src/views/publish/DiffPane.tsx`
- `apps/web/src/views/publish/PreservationScore.tsx`
- `apps/web/src/components/Toast.tsx`

**Description:**
Full-screen modal (max 960px). Left pane: original (read-only). Right pane: sanitized (editable). Redaction highlights on both sides with matching colors. Hover connecting curves between matched pairs. Preservation score bar (5 dots, green/amber/red). Per-redaction accept/modify/reject. Publish button disabled until score >40% or manual edit. Toast on success: "Published. {N} colleagues can now see this."

**Acceptance Criteria:**
- Modal opens within 3 seconds of clicking publish
- Side-by-side diff renders with color-coded highlights
- Hover shows connecting curve between original↔redacted
- Preservation score visually correct (green >60%, amber 40–60%, red <40%)
- Lawyer can edit sanitized version before publishing
- Published node appears in team graph

---

#### G-6: Team Graph View
**Day:** 4
**Priority:** P0
**Files:**
- `apps/web/src/views/team/TeamGraphView.tsx`
- `apps/web/src/views/team/NodeSummaryPanel.tsx`

**Description:**
Read-only force-directed graph of team knowledge (same Cytoscape.js visual language as personal graph). Fetches from `GET /api/team-graph`. Click node → slide-in summary panel (title, type, contributor, created date). Empty state: "No published insights yet. Be the first to publish." Search/filter same controls as personal graph.

**Acceptance Criteria:**
- Renders seeded team graph (15–30 nodes) on load
- Color coding matches design tokens
- Click opens summary panel (not full note body)
- Available to all three role accounts

---

#### G-7: Team Graph API Route
**Day:** 2
**Priority:** P0
**Files:**
- `apps/api/src/routes/teamGraph.ts`

**Description:**
`GET /api/team-graph` — returns all nodes and edges from Postgres. `GET /api/team-graph/nodes/:id` — returns single node summary for citation panel.

**Acceptance Criteria:**
- Returns complete node and edge data for Cytoscape rendering
- Single node endpoint returns title, body, summary, type, contributor

---

#### G-8: Governance Polish & Demo Prep
**Day:** 5
**Priority:** P0
**Files:** All auth/publish/team files (polish only)

**Description:**
Polish: login error states, redaction modal animations (400ms entry), toast styling, team graph loading skeleton, role-appropriate UI differences between accounts. Verify publish flow completes end-to-end in under 30 seconds.

**Acceptance Criteria:**
- Login → publish → team graph flow is seamless
- Account switching (logout/login) takes <5 seconds
- Redaction modal entry animation smooth
- No visual regressions

---

### Retrieval — Retrieval, Seed Data & Deployment

---

#### N-1: Database Setup & Schema
**Day:** 1
**Priority:** P0 — blocking all backend work
**Files:**
- `apps/api/src/db/pool.ts`
- `apps/api/src/db/schema.sql`
- `apps/api/src/db/queries.ts`
- `infra/docker-compose.yml`

**Description:**
Postgres connection pool via `pg`. Run schema DDL (users, team_graph_nodes, team_graph_edges) with pgvector and uuid-ossp extensions. Docker Compose for local dev: Postgres 16 + Presidio analyzer + Presidio anonymizer. Common query helpers (insertNode, insertEdge, getNodeById, getAllNodesAndEdges, vectorSearch).

**Acceptance Criteria:**
- `docker-compose up` brings up Postgres + Presidio
- Schema creates all tables with correct constraints
- pgvector HNSW index created
- Query helpers working

---

#### N-2: Seed Data Script & Content
**Day:** 1–2
**Priority:** P0 — demo fails without this
**Files:**
- `apps/api/src/seed/seedData.ts`
- `apps/api/src/seed/insights.json`
- `apps/api/src/seed/users.json`
- `apps/api/src/routes/seed.ts`

**Description:**
`POST /api/seed` (dev only, idempotent). Seeds three demo users with bcrypt-hashed passwords. Seeds 15–30 published insights covering: judge tendencies (3–5), opposing counsel patterns (2–3), motion practice (3–5), expert witness handling (2–3), settlement dynamics (2–3), procedural lessons (2–3). Generate embeddings for each via `text-embedding-004`. Create entity nodes and edges. Content uses Philippine law context. Seed voice: conclusory + brief narrative, 2–3 sentences, senior-partner tone.

**Must ensure:** the canonical query "What has our firm learned about cross-examining expert witnesses on damages calculations?" produces a strong, cited response.

**Acceptance Criteria:**
- Seed script is idempotent (safe to re-run)
- Three demo accounts created
- 15–30 insights with embeddings in team_graph_nodes
- Entity nodes and edges populated
- Canonical demo query returns strong results

---

#### N-3: RAG Service Backend
**Day:** 2–3
**Priority:** P0
**Files:**
- `apps/api/src/services/rag.ts`
- `apps/api/src/prompts/chat.md`

**Description:**
Implement the full RAG pipeline: embed query via `text-embedding-004` → top-8 cosine similarity search via pgvector → 1-hop graph expansion via edges → filter expanded set >0.55 similarity → construct context JSON → stream Gemini Pro response with grounding system prompt. System prompt enforces: cite every claim with node ID, refuse if no nodes above 0.75, output inline `[node_id]` markers.

Confidence calculation: High (3+ nodes >0.80), Medium (2+ nodes >0.70), Low (1 node >0.75), Refuse (0 nodes >0.75).

**Acceptance Criteria:**
- Vector similarity search returns ranked results
- 1-hop expansion includes connected context
- Streaming response includes inline citations
- Refusal triggers correctly when no sources match
- Confidence indicator computed correctly

---

#### N-4: Chat API Route (Streaming)
**Day:** 3
**Priority:** P0
**Files:**
- `apps/api/src/routes/chat.ts`

**Description:**
`POST /api/chat` — accepts query string, returns Server-Sent Events stream. First event: cited node IDs (for overlay trigger). Subsequent events: streamed response tokens. Include confidence level in metadata.

**Acceptance Criteria:**
- SSE stream established correctly
- Cited node IDs emitted first
- Response tokens stream progressively
- Confidence metadata included

---

#### N-5: Chat View UI
**Day:** 3–4
**Priority:** P0
**Files:**
- `apps/web/src/views/chat/ChatView.tsx`
- `apps/web/src/views/chat/MessageBubble.tsx`
- `apps/web/src/components/CitationChip.tsx`
- `apps/web/src/store/chatStore.ts`

**Description:**
Chat interface: input at bottom ("Ask the firm..."), messages above. User right-aligned, AI left-aligned. Streaming response renders progressively. Citation chips: inline monospace `[1]`, `[2,3]` format, `accent-primary-bg` background, clickable → opens NodeSummaryPanel (reuse the team's component). Confidence badge: green/amber/red pill. Sources section collapsed for high confidence, expanded for medium/low. Refusal state fully styled.

**Acceptance Criteria:**
- Query submission works
- Streaming response renders token-by-token
- Citation chips clickable and resolve to correct nodes
- Confidence indicator visually differs across levels
- Refusal message styled correctly

---

#### N-6: Query-Overlay Animation (Hero Moment 3)
**Day:** 4–5
**Priority:** P0 (fallback: simplified dim-only version)
**Files:**
- `apps/web/src/views/chat/QueryOverlay.tsx`
- `apps/web/src/lib/overlayAnimation.ts`

**Description:**
The signature visual moment. On query submit: chat dims to 30% (150ms) → full-screen overlay with backdrop blur fades in (400ms) → team graph fades in at center, all nodes 15% opacity (400ms) → cited nodes pulse to 100% in waves (one per 150ms, rank order), edges illuminate to `accent-primary` → hold 1s → fade out (600ms) as response streams. Use `requestAnimationFrame` for 60fps. Each pulse: scale 1.0→1.15→1.0 over 300ms + opacity 15%→100%. Escape to dismiss. Honor `prefers-reduced-motion`.

**Acceptance Criteria:**
- Overlay triggers within 500ms of query submit
- Pulse animation runs at 60fps
- Cited nodes correctly identified and highlighted
- Overlay fades as streaming begins
- Escape key dismisses overlay
- Reduced motion: instant state, no animation

---

#### N-7: Deployment Pipeline
**Day:** 4–5
**Priority:** P0
**Files:**
- `infra/deploy/` (all files)
- `apps/web/vercel.json` or equivalent
- `apps/api/Dockerfile`

**Description:**
Deploy frontend to Vercel (free tier). Deploy backend + Postgres + Presidio to Railway. Configure environment variables (Gemini API key, Whisper API key, DB connection string, JWT secret). Run seed script on first deploy. Verify single public demo URL works.

**Acceptance Criteria:**
- Frontend deployed and accessible at public URL
- Backend deployed with Postgres + Presidio running
- Seed data loaded on deployed environment
- All three demo accounts functional on deployed app
- HTTPS enforced

---

#### N-8: Integration Testing & Demo Hardening
**Day:** 5–6
**Priority:** P0
**Files:** Cross-cutting (read-only verification)

**Description:**
Execute full demo script end-to-end on the deployed URL. Verify: all three accounts login → text/audio/image capture → auto-organization → personal graph → publish with redaction → team graph update → chat query with overlay → citation click-through → refusal case. Time the full demo — must complete in under 5 minutes. Document any cached/backup queries.

**Acceptance Criteria:**
- Demo script executes without errors
- Canonical query produces coherent cited response in <10 seconds
- Publish flow completes in <30 seconds
- Overlay animation smooth
- Refusal case works correctly

---

## Day-by-Day Summary

| Day | Capture domain (CAPTURE) | Govern domain (GOVERN) | Retrieval domain (RETRIEVAL) |
|---|---|---|---|
| 0 | Shared types, fetch client | Tokens, App shell, auth middleware, server init | Vite+Express init, Docker, schema |
| 1 | K-1: IndexedDB layer | G-1: Auth backend + login UI | N-1: DB setup, N-2: Seed data |
| 2 | K-2: Text capture, K-3: Audio | G-2: Nav shell, G-3: Server, G-7: Team graph API | N-2: Seed content + embeddings |
| 3 | K-4: Image capture, K-5: Organize backend | G-4: Redaction backend | N-3: RAG service, N-4: Chat API |
| 4 | K-6: Personal graph view | G-5: Redaction modal UI, G-6: Team graph view | N-5: Chat UI, N-6: Query overlay |
| 5 | K-7: Personal seed, K-8: Polish | G-8: Governance polish | N-6: Overlay polish, N-7: Deploy |
| 6 | Demo prep | Demo prep | N-8: Integration test, demo prep |

---

## Merge Strategy

1. Each developer works on their own feature branch (`feat/capture`, `feat/govern`, `feat/retrieval`)
2. End of each day: merge to `main` in order — Retrieval domain first (infra), Govern domain second (auth/shell), Capture domain last (features)
3. If a conflict arises on a shared file, the file's designated owner (see Shared Files table) resolves it
4. `types/index.ts` is append-only — each dev adds their interfaces at the bottom, never edits existing ones

---

## Contingency Plans

| Risk | Fallback | Owner |
|---|---|---|
| Pass 2 generalization quality | Ship Pass 1 only + manual review | Govern domain |
| Query-overlay animation | Simplified: dim chat only, no graph fly-in | Retrieval domain |
| Image capture | Drop entirely, demo text + audio only | Capture domain |
| Personal graph >100 nodes | Cap seed at 50 personal nodes | Capture domain |
| Presidio container issues | Mock PII detection with regex fallback | Govern domain |
| Whisper API latency | Pre-record a demo audio clip, cache transcript | Capture domain |
