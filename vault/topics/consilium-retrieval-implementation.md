---
title: Consilium retrieval domain — implementation
type: topic
status: active
tags: [consilium, retrieval, implementation, nicolo, rag, chat, deployment]
sources: [consilium-implementation-plan, consilium-project-architecture]
created: 2026-05-14
updated: 2026-05-15
---

# Consilium retrieval domain — implementation

The RETRIEVAL domain (the team's vertical slice) is fully implemented and merged to `main`. Tickets N-1 through N-8 are complete. This page documents what was actually built — implementation choices, data shapes, and deviations from spec.

## What's shipped

| Ticket | File(s) | Status |
|---|---|---|
| N-1: DB setup + schema | `apps/api/src/db/pool.ts`, `db/schema.sql`, `db/queries.ts`, `infra/docker-compose.yml` | ✓ |
| N-2: Seed data | `apps/api/src/seed/seed.ts`, `seed/insights.ts` | ✓ |
| N-3: RAG service | `apps/api/src/services/rag.ts`, `prompts/chat.md` | ✓ |
| N-4: Chat API route | `apps/api/src/routes/chat.ts`, `routes/teamGraph.ts` (cross-domain assist) | ✓ |
| N-5: Chat view UI | `apps/web/src/views/chat/ChatView.tsx`, `store/chatStore.ts` | ✓ |
| N-6: Query-overlay animation | `apps/web/src/views/chat/QueryOverlay.tsx` | ✓ |
| N-7: Deployment | `infra/deploy/vercel.json`, `apps/api/Dockerfile`, health-check endpoint | ✓ |
| N-8: Integration + audit fixes | `4e69206` audit commit (see below) | ✓ |

## Database

- **Image**: `pgvector/pgvector:pg16` (Postgres 16 with pgvector preinstalled)
- **Extensions**: `uuid-ossp`, `vector`
- **Tables**:
  - `users` — `id`, `email UNIQUE`, `password_hash`, `display_name`, `role CHECK IN (lawyer, practice_group_lead, knowledge_admin)`, `created_at`
  - `team_graph_nodes` — `id`, `node_type CHECK IN (9 values)`, `title`, `body`, `summary`, `contributor_id REFERENCES users(id)`, `source_personal_note_id`, `embedding vector(768)`, `metadata JSONB`, `created_at`, `updated_at`
  - `team_graph_edges` — `id`, `source_node_id`, `target_node_id` (both REFERENCES team_graph_nodes ON DELETE CASCADE), `edge_type CHECK IN (7 values)`, `weight DEFAULT 1.0`, `created_at`; **unique constraint on `(source_node_id, target_node_id, edge_type)`**
- **Node types** (9): `insight`, `matter`, `party`, `lawyer`, `judge`, `witness`, `concept`, `precedent`, `statute`
- **Edge types** (7): `mentions`, `involves`, `cites`, `authored_by`, `about`, `concerns`, `related_to`
- **Indexes**:
  - `idx_node_type` on `team_graph_nodes(node_type)`
  - `idx_embedding` — **HNSW** on `embedding vector_cosine_ops`
  - source/target indexes on `team_graph_edges`
- **Connection**: `pg` pool, configured via `DATABASE_URL`
- **Health check**: `pg_isready -U consilium` (docker-compose health)

## Team graph seed (`seed/seed.ts` + `seed/insights.ts`)

- **20 seed insights** covering: judge tendencies (5), opposing counsel patterns (3), motion practice (4), expert witness handling (3), settlement dynamics (3), procedural lessons (2)
- **3 demo users** (real fictional names, not generic role labels):
  - `litigator@acme.law` — **Ana Mendoza** (role `lawyer`)
  - `lead@acme.law` — **Carlos Reyes** (role `practice_group_lead`)
  - `admin@acme.law` — **Diana Santos** (role `knowledge_admin`)
- **Entity nodes** are created on the fly from entities found in insights (one per unique `(node_type, LOWER(title))`)
- **Embeddings computed at seed time** using `gemini-embedding-001` (768-dim, output-dimensionality-pinned — corrected from the spec's `text-embedding-004`, which isn't exposed by the SDK) (768 dim); stored directly in the `embedding` column
- **Entity deduplication**: case-insensitive match on `(node_type, LOWER(title))`
- **Endpoint**: `POST /api/seed` (idempotent dev-only)

## RAG service (`services/rag.ts`)

- **Top-k**: **8** nodes via pgvector cosine similarity
- **Cosine threshold** for context inclusion: **0.55**
- **Graph expansion**: 1-hop from top-k hits; **only `insight`-type neighbors are added to the context** (deviation worth noting — entity neighbors are not included, keeping context focused on synthesizable claims)
- **Confidence buckets** (computed from the top-k similarity distribution):

  | Level | Rule |
  |---|---|
  | `high` | ≥3 nodes with similarity ≥0.80 |
  | `medium` | ≥2 nodes with similarity ≥0.70 |
  | `low` | ≥1 node with similarity ≥0.75 |
  | `refuse` | 0 nodes ≥0.75 |

- **Synthesis model**: `gemini-2.5-pro`, streaming
- **System prompt**: `apps/api/src/prompts/chat.md` (grounding rules, citation format, refusal language)
- **Refusal message** (exact): *"I don't have firm knowledge that directly addresses this. You may want to capture your own thinking on this topic as a starting point."*
- **Citation format**: inline `[node_id]` in response text; Sources section lists `[id] Title` after `---` separator

## Chat API (`routes/chat.ts`)

Streaming via Server-Sent Events. The chat route is now a **two-path router** (revised 2026-05-15): every incoming message is classified by [[chat-query-classifier]] (Gemini Flash, 2 attempts, 8 s timeout), and the path branches based on the result.

### SSE event protocol (revised)

| Order | Event | Payload | Path |
|---|---|---|---|
| 1 | `kind` | `{ kind: 'knowledge' \| 'conversational' }` | both |
| 2 | `cited-nodes` | `{ nodeIds, confidence }` | knowledge only |
| 3..N | `token` | `{ text }` (incremental) | both |
| Final | `done` | `{ kind: 'knowledge', confidence, sourceCount }` or `{ kind: 'conversational' }` | both |
| On error mid-stream | `error` | `{ message }` | both |

The `kind` event fires **before everything else** so the frontend can decide whether to expect a `cited-nodes` event and gate the [[query-overlay-animation]] accordingly. Request body now also accepts `history: ChatTurn[]` (≤8) — see "Conversation history" below.

### Knowledge path

Existing [[rag-query-pipeline]]: query embedding → top-8 cosine search → 1-hop expansion → Gemini Pro streaming synthesis with grounding prompt. **Confidence thresholds re-calibrated**: high ≥3 nodes ≥ 0.75, medium ≥2 nodes ≥ 0.70, low ≥1 node ≥ 0.60, refuse 0 ≥ 0.60. Refusal message now randomized across **4 variants** so the demo doesn't feel scripted.

### Conversational path

`apps/api/src/services/conversational.ts` + `apps/api/src/prompts/conversational.md`. Gemini Flash, no retrieval, free-form streaming under a hard rule against substantive legal claims from training data. See [[conversational-chat-path]].

### Reliability

Every Gemini SDK call (classifier + RAG stream + conversational stream + transcribe + vision + organize + redaction passes + embedding) now goes through [[gemini-retry-backoff|withGeminiRetry]] — exponential backoff + jitter + per-attempt timeout, with retryable-error classification. Streaming connect retries only; mid-stream chunks are not safely retryable.

### Conversation history

`buildHistoryPayload(messages)` in `apps/web/src/api/chat.ts` sends the last 4 turns (≤2 user/assistant pairs). Server schema caps at 8. For assistant turns, `citedNodeIds` are included so the classifier can detect follow-up operations and the conversational prompt can re-quote prior citations. See [[conversational-chat-path]] for the prompt-level history format.

### New supporting files (2026-05-15)

| File | Role |
|---|---|
| `services/classifier.ts` | The Gemini Flash classifier — [[chat-query-classifier]] |
| `services/conversational.ts` | No-retrieval streaming generator — [[conversational-chat-path]] |
| `services/gemini-retry.ts` | The shared retry/backoff wrapper — [[gemini-retry-backoff]] |
| `services/promptLoader.ts` | Two-path resolver for `prompts/*.md` (dev tsx vs prod dist) — replaces the inline `readFileSync` previously in `rag.ts` |
| `prompts/conversational.md` | Conversational system prompt with the hard "no substantive legal claims" rule |
| `types/chat-protocol.ts` | `ChatKind`, `ChatTurn`, SSE event payload types — shared across classifier + conversational + protocol |

## Derived edges (Obsidian-style connections)

Implemented in `apps/api/src/seed/deriveEdges.ts` (commit `0ceced8`), called from `seed.ts` after team-graph insertion. Four phases:

1. **Shared-entity insight↔insight** — two insights mentioning ≥2 shared entities; weight `min(shared / 3, 1.0)`
2. **Classification hubs** — synthetic `classification`-type hub nodes (one per classification value); each insight gets an `about` edge to its hub
3. **Embedding-similarity insight↔insight** — cosine `<=>` similarity > 0.80; weight = similarity; skips pairs already linked by Phase 1
4. **Entity co-occurrence entity↔entity** — entity pairs appearing in ≥2 insights together; weight `min(cooccurrences / 4, 1.0)`

Phases 1, 3, 4 use `edge_type = 'related_to'`; Phase 2 uses `about`. Visual differentiation lives in `apps/web/src/lib/graphUtils.ts`: `mentions` solid 0.35, `about` dotted 0.15, `related_to` dashed `[4,3]` 0.25. See [[derived-edges]] for the full concept page.

## Chat view (`views/chat/ChatView.tsx` + `store/chatStore.ts`)

**Revised 2026-05-15 to support the two-path architecture and multi-turn history:**

- **Two-phase send**: on submit, set `isPending = true` (shows thinking dots). On `kind`: if `conversational`, immediately call `startStreaming([], null, 'conversational')`. If `knowledge`, **wait** for `cited-nodes` and then call `startStreaming(nodeIds, confidence, 'knowledge')` — this avoids activating the overlay until we have real node IDs.
- **Overlay gate**: `overlayActive` in `chatStore` is set to true only when `kind === 'knowledge' && confidence !== 'refuse' && citedNodeIds.length > 0`. Conversational replies and knowledge refusals share the plain thinking-dots loading state without the [[query-overlay-animation]].
- **History on send**: `buildHistoryPayload(messages)` slices the last 4 turns and includes `citedNodeIds` on assistant turns. Sent as `{ query, history }` on every chat request.
- **`ChatMessage.kind` field** (added 2026-05-15) — every assistant message now carries `kind: 'knowledge' | 'conversational'` so the renderer can gate UI affordances per-message (SourcesPanel only shows for knowledge, refusal CTA only shows for knowledge refusals).
- **Stream-error compensation** (commit `a8b4eb3`): if the SSE errors during a `conversational` stream, the error handler **does not stamp `'refuse'` confidence** on the partial message — confidence is a knowledge-path concept. The message stays as-is with whatever content arrived.
- **Conversation-wide citation resolution** (commit `f971bd0`): the `citedNodeIds` prop passed to `ChatMessage` is a union of every citation ever made in the conversation (`allCitedNodeIds` memo) plus the live streaming set. This lets a conversational follow-up re-quote `[abc12345]` from an earlier knowledge turn and have it resolve to a clickable chip.
- **Citation chips**: inline `[id]` markers in text are parsed into clickable `CitationChip`s that open the `NodeSummaryPanel`. Parser accepts full UUIDs or 8–12 char hex prefix IDs.
- **Refusal state**: when `confidence === 'refuse'` on a `knowledge`-kind message, the refusal CTA "Capture your thinking on this" routes to `/capture`. Conversational replies never enter refusal state.
- **Reset chat button** (working tree, 2026-05-15): header now shows a `Trash2`-iconed pill ("Reset chat") next to the title when `messages.length > 0`. Confirms via `window.confirm`, then calls `chatStore.clearMessages()` which wipes messages + isStreaming + isPending + citedNodeIds + confidence + overlayActive, plus clears selected-node and sources-expanded local state. Hover state turns the pill `#ef476f` (danger red) to telegraph destructive intent. Disabled while `isStreaming || isPending`.
- **Dim-on-overlay-only fix** (working tree, 2026-05-15): the chat dim cascade was previously gated on `overlayActive || isPending`, which dimmed the chat even for conversational replies (which skip the overlay entirely). Revised to `dimChat = overlayActive` alone — conversational replies and thinking-dots now keep the chat fully readable; only the knowledge-path overlay reveal dims the cascade.
- **Empty-streaming-bubble suppression** (working tree, 2026-05-15): the assistant message starts with `content === ''`, and the thinking-dots indicator renders separately. Without this fix both rendered, producing two stacked empty bubbles. The new `isEmptyStreamingAssistant` check skips rendering the placeholder bubble when content is empty and streaming is active; the message slot fills in as tokens arrive.
- **Welcome state** (post-polish, commit `1c836dd`): shown when `messages.length === 0`; greets the lawyer by first name (`Welcome, ${user.displayName.split(' ')[0]}`) and offers 4 suggested queries that auto-submit:
  - "What strategies work for cross-examining expert witnesses?"
  - "How do we handle summary judgment motions?"
  - "What are our deposition timeline strategies?"
  - "How should we approach settlement negotiations?"
- **Thinking indicator**: three animated dots render while the assistant message is streaming with empty content
- **Per-message timestamp**: `formatTime(timestamp)` → "HH:MM" beside each message
- **Avatars**: user shows "You" text label; assistant shows a geometric SVG icon (three interlocking diamonds)
- **Header subtitle**: "Ask questions grounded in your firm's knowledge graph"
- **Citation chips** (`views/chat/CitationChip.tsx`, commit `54120e7`): inline mono badge `[1]` / `[1,2,3]`, 11px size, vertical-align super; background `accent-primary-bg` (#2d1a06), text `accent-primary` (#fb8500), border `accent-primary-muted` (#8a4900); hover spring `scale: 1.06, y: -1` (stiffness 420, damping 22); Enter/Space trigger onClick; `role="button"`, `tabIndex={0}`, `aria-label="Citation X, Y, Z"`. Click routes to the first cited node.
- **Confidence badge** (`views/chat/ConfidenceBadge.tsx`, ~67 lines): per-message pill with dot-fill metaphor showing 4 states:

  | State | Dots | Color | Label |
  |---|---|---|---|
  | `high` | 3 filled | `success` `#3fb950` | "High" |
  | `medium` | 2 filled | `warning` `#d29922` | "Medium" |
  | `low` | 1 filled | `danger` `#f85149` | "Low" |
  | `refuse` | 0 filled | `text-muted` `#484f58` | "Insufficient" |

  Optional `sourceCount` prop renders `· N source(s)` in secondary text. 12px font, 500 weight, `border-radius: 999px`.

- **Refusal CTA** (commit `ad3e14c`): when the last assistant message has `confidence === 'refuse'`, a "Capture your thinking on this" button fades in (0.2s delay) and routes the user to `/capture` — converts a dead-end refusal into a usable next step.
- **Dim cascade isolation**: `.chat-content` wrapper now carries the dim state (`opacity: 0.32; filter: saturate(0.5); pointer-events: none`); QueryOverlay and NodeSummaryPanel are siblings of `.chat-content`, so they escape the dim cascade and render at full opacity above the dimmed chat.
- **Assistant avatar** (commit `54120e7`): uses the new [[consilium-logo|Logo]] component (`size={20}`) tinted `accent-primary` inside a pill — replaces the prior 3-diamonds SVG icon and reinforces brand in the conversation.
- **Message width**: `max-width: 880px` per message for readability on wide displays.
- **Citation parsing** (revised commit `6d38070`, 2026-05-15): regex now accepts **both full UUIDs and 8–12 char hex prefix IDs** — `/\[([a-f0-9]{4,12}(?:-[a-f0-9-]{0,31})?(?:\s*,\s*[a-f0-9]{4,12}(?:-[a-f0-9-]{0,31})?)*)\]/g`. A `resolveId(rawId, citedNodeIds)` helper strips hyphens and matches either by exact UUID or by prefix against the message's `citedNodeIds` list (the API returns first-8-hex-char IDs to keep streamed payloads compact). Indices that fail to resolve are emitted as plain text rather than broken chips.
- **Clickable citations**: each `CitationChip` index click invokes `onCitationClick(nodeId)` which opens the `NodeSummaryPanel` for the cited node. Previously some prefix-ID citations rendered as plain text because the regex required full UUIDs; the 2026-05-15 fix closes that gap.
- **Centering fix** (commit `6d38070`): chat-message column and both graph views had off-center root containers; corrected so the chat conversation and the graph canvas center within the available width on standard viewports.

## Query overlay (`views/chat/QueryOverlay.tsx`)

- **Implementation: canvas-based**, not Cytoscape-driven (deviation from spec). The chat-time graph is a separate visual layer rendered to a `<canvas>` with `requestAnimationFrame`.
- **Timing**: fade-in **400ms**, hold ~**800ms**, fade-out **600ms**
- **All nodes render at 15% opacity**; cited nodes (by ID) render at **100%** with a glow when opacity > 0.5
- **Edges between cited nodes** illuminate in `accent-primary` (orange `#fb8500`, revised from amber-gold on 2026-05-14) as their endpoint nodes light up — edges only light when **both endpoints are lit** (`min(srcProgress, tgtProgress)`); stroke width scales `1 + 1.4 × edgeProgress`, glow shadow scales with progress
- **Halo glow** (post-rewrite, commit `ad3e14c`): cited nodes at progress > 0.4 render an outer arc (`size + 6` radius) at 22% opacity, deepening the "this node is the answer" perception
- **Phase tracking**: explicit `phaseRef.current: 'in' | 'hold' | 'out'`; `in` runs envelope = `min(elapsed / FADE_IN_MS, 1)`, `hold` keeps envelope at 1 until `active === false`, `out` decays envelope to 0 over FADE_OUT_MS
- **Status label**: "Searching firm knowledge" with three animated dots (1.2s cycle, 0.18s stagger) — fills the perceptual gap between query submit and first `cited-nodes` event
- **Escape hint**: "ESC to dismiss" fades in top-right after 1.2s
- **Constants**: `FADE_IN_MS = 400`, `PULSE_STAGGER_MS = 150`, `PULSE_DURATION_MS = 300`, `FADE_OUT_MS = 600`, `ACCENT_RGB = '251, 133, 0'`
- **`prefers-reduced-motion`**: skips the rAF fade loops; sets opacity directly to 1, holds ~800ms, then collapses instantly
- **HiDPI**: `devicePixelRatio` canvas scaling
- **Stability fix**: `Math.random()` was originally inside the render loop causing per-frame node jitter; replaced with deterministic `stableJitter()` (see audit fixes below)

## Deployment

- **Frontend**: Vercel, config at `infra/deploy/vercel.json`. SPA rewrite **scoped to non-asset paths** (revised commit `84dcb23`, 2026-05-15): `/((?!assets/|favicon\.png).*)` → `/index.html`. Pre-fix the rewrite was `/(.*) → /index.html`, which caught hashed CSS/JS 404s and served them as `text/html`; browsers refused to apply them due to MIME strictness, breaking production builds with no obvious error. `/assets/(.*)` cache `max-age=31536000, immutable`.
- **Index.html cleanup** (commit `84dcb23`): removed a stray dev-only `<link rel="stylesheet" href="/src/styles/tokens.css">` that 404'd in production; `tokens.css` is already bundled via `main.tsx`'s import graph.
- **Backend**: Railway, Docker via `apps/api/Dockerfile`
- **Health check**: `GET /api/health` → `{ status: 'healthy' }`
- **Environment variables**:

  **API (`apps/api/.env.example`)**:
  ```
  DATABASE_URL, PORT (3000), NODE_ENV,
  JWT_SECRET, GEMINI_API_KEY, OPENAI_API_KEY,
  PRESIDIO_ANALYZER_URL, PRESIDIO_ANONYMIZER_URL,
  FRONTEND_ORIGIN
  ```

  **Web (`apps/web/.env.example`)**:
  ```
  VITE_API_URL  (empty in dev; Vite proxies /api/* to http://localhost:3000)
  ```

- **Build-time deps fix** (commit `6184a87`, 2026-05-15): `motion` (Framer Motion's modular package) was previously hoisted from a root install but Vercel installs deps from `apps/web/` only, so `tsc` failed on `import { motion } from 'motion/react'`. Added `motion` as an explicit dependency in `apps/web/package.json`. Same pattern to watch for on any new monorepo-shared dep that's actually used in `apps/web/`.

## Types added (`apps/web/src/types/index.ts`)

```ts
interface TeamGraphNode {
  id: string;
  nodeType: 'insight' | 'matter' | 'party' | 'lawyer' | 'judge' | 'witness' | 'concept' | 'precedent' | 'statute';
  title: string;
  body?: string;
  summary?: string;
  contributorId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface TeamGraphEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  edgeType: 'mentions' | 'involves' | 'cites' | 'authored_by' | 'about' | 'concerns' | 'related_to';
  weight: number;
}

interface TeamGraph { nodes: TeamGraphNode[]; edges: TeamGraphEdge[]; }

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  confidence?: ConfidenceLevel;
  sourceCount?: number;
  citedNodeIds?: string[];
  timestamp: number;
}

interface Citation {
  index: number;
  nodeId: string;
  title: string;
  summary?: string;
  nodeType: TeamGraphNode['nodeType'];
}

type ConfidenceLevel = 'high' | 'medium' | 'low' | 'refuse';
```

## Audit fixes (commit `4e69206`)

Four bugs caught during pre-merge audit. Worth recording — these are the failure modes for AI-assisted code:

1. **`apps/web/package.json`** — duplicate `"type": "commonjs"` overrode the correct `"type": "module"`, which would have broken every Vite ESM import.
2. **`store/chatStore.ts`** — `appendToken()` and `finishStreaming()` shallow-spread the array then mutated the original message object. Zustand uses referential equality, so React would skip re-renders. Fixed with immutable `.map()` producing new objects.
3. **`views/chat/QueryOverlay.tsx`** — `Math.random()` inside the canvas render loop caused node-position jitter every frame. Replaced with deterministic `stableJitter()`. Also fixed a stale-`phase` closure inside the rAF callback and added `devicePixelRatio` scaling.
4. **`services/rag.ts`** — `__dirname`-relative path to `chat.md` fails after tsc compilation because `.md` files aren't copied to `dist/`. Added `resolvePromptPath()` with fallback chain for dev / production / Docker. (This is also why the `postbuild` step exists — see below.)

## Postbuild step (commit `a23e4e8`)

`tsc` only emits `.js` files. The API reads prompt `.md` files and `schema.sql` at runtime via `__dirname` paths; without copying these to `dist/`, the API crashes on startup in production with `Cannot find prompts/organize.md`.

```jsonc
// apps/api/package.json
"build": "tsc && npm run postbuild",
"postbuild": "npx shx cp -r src/prompts dist/prompts && npx shx cp src/db/schema.sql dist/db/schema.sql"
```

`shx` is used for cross-platform `cp` (Windows + Railway Linux).

## Wire-up fix (commit `d424df2`)

Cross-cutting integration commit that finalized the merge:

- Replaced `STUB_TOKEN` with `useAuthStore().token` in `TextCapture.tsx`, `AudioCapture.tsx`, `ImageCapture.tsx`, and `ChatView.tsx`
- Wired `seedPersonalNotes()` into `LoginView.tsx` on lawyer login (was previously dead code)
- Added "Publish to team graph" button + `RedactionModal` invocation to `TextCapture.tsx`
- Installed Tailwind CSS v4 via `@tailwindcss/vite` plugin (corrected `vite.config.ts` and `package.json`)
- Fixed CSS `@import` order in `tokens.css` (Google Fonts must precede Tailwind)

## Relations

- [[rag-query-pipeline]] — spec; this page documents its implementation
- [[query-overlay-animation]] — spec; canvas-based implementation here
- [[postgres-pgvector]] — DB engine + extensions
- [[consilium-data-model]] — schema implemented here
- [[consilium-api-surface]] — endpoints implemented here
- [[acme-litigation-partners]] — demo users seeded here
- [[consilium-implementation-plan]] — N-1 through N-8 (all complete)

## Sources

- [[consilium-implementation-plan]]
- [[consilium-project-architecture]]
