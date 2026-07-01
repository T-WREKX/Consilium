---
title: Consilium capture domain — implementation
type: topic
status: active
tags: [consilium, capture, implementation]
sources: [consilium-implementation-plan, consilium-project-architecture, consilium-product-requirements]
created: 2026-05-13
updated: 2026-05-15
---

# Consilium capture domain — implementation

The CAPTURE domain (the team's vertical slice) is fully implemented. Tickets K-1 through K-8 are complete, plus a substantial post-K8 refinement (commit `d799477`, 2026-05-15) that rebuilt the TextCapture surface around a structured **Organize panel**, a **wikilinks**-based note-to-note linking system (see [[note-wikilinks]]), and a **soft-delete** model. This page documents what was actually built — implementation choices, data shapes, and deviations from spec.

## What's shipped

| Ticket | File(s) | Status |
|---|---|---|
| K-1: IndexedDB layer | `apps/web/src/lib/idb.ts` | Done |
| K-2: Text capture view | `apps/web/src/views/capture/TextCapture.tsx`, `CaptureView.tsx` | Done |
| K-3: Audio capture | `apps/web/src/views/capture/AudioCapture.tsx`, `lib/audio.ts` | Done |
| K-4: Image capture | `apps/web/src/views/capture/ImageCapture.tsx` | Done |
| K-5: Organize backend routes | `apps/api/src/routes/capture.ts`, `services/organize.ts`, `prompts/organize.md` | Done |
| K-6: Personal graph view | `apps/web/src/views/graph/PersonalGraphView.tsx`, `lib/graphUtils.ts` | Done |
| K-7: Personal note pre-seeding | `apps/web/src/lib/seedPersonal.ts` | Done |
| K-8: Polish + tests | All capture/graph files | Done |

## TypeScript interfaces (`apps/web/src/types/index.ts`)

`types/index.ts` is append-only — each developer section is separated by a comment. the team's section defines the capture domain:

- **`NoteClassification`** union: `strategy | observation | lesson_learned | action_item | research | meeting_summary`
- **`Entity`**: `{ id, type, name, confidence }` — type is one of 8 values: `matter | party | lawyer | judge | witness | concept | precedent | statute`
- **`NoteLink`** (added 2026-05-15): `{ targetNoteId, displayLabel, position? }` — stable-UUID reference to another note, with the original `[[label]]` and char-offset for backlink snippets. See [[note-wikilinks]].
- **`OrganizeFieldProvenance`** (added 2026-05-15): `'unset' | 'ai' | 'user'`.
- **`OrganizeProvenance`** (added 2026-05-15): per-field provenance for `entities`, `classification`, `privilege`.
- **`NoteFolder`**: `{ id, name, createdAt, updatedAt }` — used by the SideNav folder UI.
- **`PersonalNote`**: full shape including `audioBlob?`, `imageBlob?`, `audioTranscript?`, `extractedEntities`, `classification`, `isPrivileged`, `isPublished`, `publishedNodeId?`, `folderId?`, `createdAt` (epoch ms), `updatedAt` (epoch ms), plus the new fields: `links?: NoteLink[]`, `deletedAt?: number` (soft-delete tombstone), `organizeProvenance?: OrganizeProvenance`, `dismissedEntityKeys?: string[]`.
- **`OrganizeResponse`**: `{ entities, classification, isPrivileged }`
- **`ApiError`**: `{ code, message, retryable }`
- **`ApiResponse<T>`**: `{ data?, error? }`

Note on Blob fields: IDB structured-clone stores Blobs but they may return as empty after a page reload — reconstruct with `new Blob([arrayBuffer])` if needed. Documented in type comments.

## IndexedDB layer (`apps/web/src/lib/idb.ts`)

- **Database name**: `consilium-personal`, version 1
- **Object stores**: `notes` (key: `id`), `entities` (key: `id`), `personalGraph` (key: `id`), plus a `folders` store added with the SideNav refactor.
- **CRUD for PersonalNote**: `createNote`, `getNote`, `getAllNotes(options?)`, `updateNote`, `deleteNote`.
- **Soft delete (added 2026-05-15)**: `deleteNote(id)` writes `deletedAt = Date.now()` rather than removing the row. `getAllNotes()` filters out tombstones by default; `getAllNotes({ includeDeleted: true })` is the escape hatch for a future trash/restore UI.
- **Entity ops**: `saveEntity`, `getAllEntities`.
- **ID generation**: `crypto.randomUUID()` client-side.
- **Test isolation**: `_resetDB()` resets the singleton `dbPromise` to `null`; called in `beforeEach` with `fake-indexeddb`.
- **Library**: `idb` (`IDBPDatabase<ConsiliumDB>` typed).

## Zustand note store (`apps/web/src/store/noteStore.ts`)

IDB-backed save, load, and organization update. Sits between views and IDB; views never call IDB directly.

**Core actions:**
- `saveNote(data, existingId?)` — on every save, parses `[[wikilinks]]` from the body and resolves them via `lib/wikilinks.ts` before persisting. Only resolved links are written to `note.links`; unresolved labels stay in the body and re-resolve next save (so creating the target heals the link automatically).
- `setActiveNote(id)`, `deleteNote(id)` (soft delete), `markNotePublished(noteId, publishedNodeId)`.

**Organize-panel actions (added 2026-05-15):**
- `setEntities(noteId, entities, provenance)` — full replace; flips entities provenance.
- `setClassification(noteId, value, provenance)`, `setPrivilege(noteId, value, provenance)` — per-field setters with provenance flip.
- `dismissEntity(noteId, entityId)` — removes the entity and records its `type:name` key in `dismissedEntityKeys` so subsequent AI passes do not re-add it.
- `applyAiOrganize(noteId, response)` — delegates to `lib/organizeMerge.ts`, returns `{ suggestions }` for user-set fields where AI disagrees (see [[auto-organization-pipeline]] provenance table).
- `restoreOrganizeSnapshot(noteId, snapshot)` (added 2026-05-15, working tree): atomically writes back all five organize-relevant fields from an `OrganizeSnapshot` (`extractedEntities`, `classification`, `isPrivileged`, `organizeProvenance`, `dismissedEntityKeys`). Backs the **Revert button** in the Organize panel — TextCapture snapshots state right before each Gemini call and clears the snapshot on note switch / revert / next successful organize.
- `removeEntity(noteId, entityId)` — older direct-remove API retained.

**Folder actions:** `createFolder`, `deleteFolder` (unfiles all member notes), `moveNoteToFolder`.

## Fetch client (`apps/web/src/api/client.ts`)

Shared fetch wrapper with JWT injection from `authStore`. Typed error envelope `{ data?, error? }`. Supports JSON and `FormData` (for audio/image upload). Guards JSON.parse on error responses.

## Auto-organization service (backend, `apps/api/src/services/organize.ts`)

See [[auto-organization-pipeline]] for the full spec. Implementation specifics:
- **Model**: `gemini-2.5-pro` via `@google/generative-ai` SDK
- **Structured output**: `responseMimeType: 'application/json'` + typed `responseSchema` (Gemini native structured output, not prompt-only)
- **System prompt**: loaded from `apps/api/src/prompts/organize.md` at server start
- **Error handling**: guards `JSON.parse` on Gemini response; throws on non-JSON

## Capture routes (`apps/api/src/routes/capture.ts`)

Three routes, all require valid JWT, validated with Zod. All three Gemini callers route through [[gemini-retry-backoff|withGeminiRetry]] (added 2026-05-15) for transient-error resilience:

- `POST /api/organize` → `organizeNote(content)` → `{ entities, classification, isPrivileged }`. Wrapped in retry; see [[auto-organization-pipeline]].
- `POST /api/transcribe` → `multer` audio upload (field: `audio`, uses `originalname`) → `gemini-2.5-flash` inline audio transcription → `{ data: { transcript: string } }`. **Note**: spec called for OpenAI Whisper (`whisper-1`); migrated to Gemini Flash (2026-05-14) to consolidate on a single API key. The `openai` npm package has been removed. (see [[whisper]])
- `POST /api/vision` → `multer` image upload → `gemini-2.5-pro` with **structured output** (revised 2026-05-15): `responseMimeType: 'application/json'` + `responseSchema` for `{ text, description }`. Replaces the older prompt-only "return ONLY JSON" pattern, matching the structured-output discipline used by `/api/organize` and the [[chat-query-classifier]].

## Capture UI

- **CaptureView**: tab shell (Write / Record / Upload), design-token styling.
- **TextCapture** (rebuilt 2026-05-15): two-column layout — editor column on the left (`capture-main`) with title input, body textarea, **read-only `NotePreview`** below the editor that renders the body with `[[wikilinks]]` resolved as interactive chips, and the **`BacklinksPanel`** beneath the preview. Right column hosts the collapsible **`OrganizePanel`** (collapsed state persisted in `localStorage` under `organize-panel-collapsed`). Body save uses a 400 ms debounce (`SAVE_DEBOUNCE_MS`); wikilink resolution happens inside `saveNote`. **Auto-organize on save was removed** — the AI pipeline now runs only when the user clicks the "Organize with Gemini" button in the panel (body must be ≥20 chars). Cursor-aware `[[Title]]` insertion via `bodyRef.current.selectionStart` from the LinkQuickPick affordance. See [[note-wikilinks]] for syntax and resolution rules.
- **AudioCapture**: state machine (idle → recording → processing → done); WaveSurfer.js waveform; max 5 minutes (constant in `lib/audio.ts`); auto-stop moved to a dedicated effect (not inside `setDuration` updater — stale closure fix); editable transcript before save. On save, calls `organizeNote(transcript)` if transcript length > 20 chars; updates the saved note with extracted entities.
- **ImageCapture**: drag-drop + file picker; PNG/JPG/WebP validation; 10MB limit; Gemini Vision extraction; URL cleanup on unmount (object URL leak prevention); race condition guard on concurrent uploads. On save, calls `organizeNote(visionText)` if extracted text length > 20 chars.

## Organize panel and supporting components (added 2026-05-15, commit `d799477`)

New files under `apps/web/src/views/capture/` and `apps/web/src/components/`:

| File | Role |
|---|---|
| `views/capture/OrganizePanel.tsx` | Right-rail surface: Entities / Classification / Privilege / Links sections + "Organize with Gemini" footer. Collapsible. |
| `views/capture/AddEntityForm.tsx` | "+ Add entity" inline form. User-provenance entities. |
| `views/capture/LinkQuickPick.tsx` | Title autocomplete for "+ Add link" (inserts `[[Title]]` at cursor). |
| `views/capture/NotePreview.tsx` | Read-only render of the body with `WikilinkChip`s interpolated at link positions. |
| `views/capture/BacklinksPanel.tsx` | Lists inbound `linked_to` notes with ±75-char snippet around the link position. |
| `components/WikilinkChip.tsx` | Chip rendering of a `NoteLink` — resolved (filled) opens target, unresolved (dashed) creates a stub note on click. |
| `lib/wikilinks.ts` | `parseWikilinks(body)` + `resolveWikilinks(tokens, notes, sourceNoteId)`. |
| `lib/organizeMerge.ts` | Pure merge function for AI ↔ user state with the provenance rules in [[auto-organization-pipeline]]. |
| `views/capture/organize-panel.css` | Styles for the panel surface, chips, suggestion hints, empty states. |

The previous "silent auto-organize on debounced body change" model is gone. The user is now the trigger; AI is a suggestion source with explicit accept/dismiss semantics.

## Personal graph (`apps/web/src/lib/graphUtils.ts` + `views/graph/PersonalGraphView.tsx`)

- **Transform**: `notesToCytoscapeElements(notes)` converts `PersonalNote[]` → Cytoscape elements
- **Node types**: `insight` nodes (one per note) + entity nodes (one per unique `type:name` pair)
- **Edge IDs**: `edge-{noteId}-entity-{type}:{name}`
- **Deduplication**: shared entities across notes → single entity node with multiple edges in
- **Layout (post-polish)**: switched from `cose` to **`cola`** continuous force-directed physics (`infinite: true`, `nodeSpacing: 25`, `edgeLength: 120`) for Obsidian-style organic positioning. Direct `cytoscape` instance built in `useEffect` instead of the `react-cytoscapejs` wrapper.
- **Interactivity**: search filter (non-matching nodes fade to 20% opacity), node click handlers per type, empty state CTA (uses the new [[consilium-logo|Logo]] component at size 64), hover-to-highlight neighbors (node expands 14→18px; connected edges brighten 0.35→0.6 opacity), tap-to-open detail. (see [[cytoscape-js]])
- **Rest state — color, not grey (revised 2026-05-15, working tree)**: previously stylesheet `background-color: #3a3f47` with per-type color restored inline only on the hovered/selected node + neighbors. **Inverted**: stylesheet now reads `background-color: data(color)` (per-type at rest, opacity 0.9, colored shadow blur 6 / opacity 0.5). The **spotlight handler greys-out non-spotlight nodes** inline (`background-color: #3a3f47`, `shadow-color: #3a3f47`, `text-opacity: 0`), leaving the spotlight + neighbors with their stylesheet-default per-type color. The personal graph at rest now reads as a vibrant constellation, not a flat grey grid.
- **Degree-scaled sizes via node data, not style (revised 2026-05-15)**: `recomputeNodeRadii(cy)` in `lib/graphDiff.ts` now writes `size` as **node data** (`n.data('size', r * 2)`), not inline style. The stylesheet reads it via `el.data('size') ?? 32`. Why: `removeStyle()` calls during hover-spotlight cleanup wiped inline width/height, collapsing every node back to the 32 px default. Hub nodes get a fixed 44 px (previously skipped entirely); insights/entities interpolate 32–80 px by degree.
- **Zoom control** (post-polish, commit `ad3e14c`): persistent [[graph-zoom-control|GraphZoomControl]] widget anchored bottom-right; range 20–150%, step 5; fit-to-view reset. `baseZoomRef` captures the fit-all zoom after layout settles so the slider's percent reads against that baseline.
- **Adaptive labels**: entity-node labels suppress below 75% of base zoom (`LABEL_ZOOM_THRESHOLD = 0.75`) but always show on hover/selection.
- **Classification hubs**: synthetic `classification`-type nodes (`isHub: true`) appear as diamond-shaped, muted-color scaffolding — one per classification value across all notes. See [[derived-edges]] (Phase 2).
- **Author-stated `linked_to` edges** (added 2026-05-15): for every `[[wikilink]]` resolved on a note, `graphUtils.ts` emits a `linked_to` edge from source to target. Styled **solid `#9d4edd` (insight purple), opacity 0.7, width 1.2** — visually louder than the derived `related_to` (dashed) and `about` (dotted) edges to communicate explicit authorship. See [[note-wikilinks]].

## Personal seed data (`apps/web/src/lib/seedPersonal.ts`)

6 notes, Philippine litigation context, idempotent (no-op if notes already exist):

1. **Judge Reyes — cross-examination latitude on expert testimony** (`observation`, not privileged)
2. **Damages calculation cross — Garcia & Partners expert pattern** (`strategy`, privileged)
3. **Motion practice — RTC Makati Branch 147 under Judge Soriano** (`observation`, not privileged)
4. **Lesson learned — Dela Cruz v. Multinational Corp timeline failure** (`lesson_learned`, privileged)
5. **Opposing counsel — Atty. Bautista (Tan & Reyes) patterns** (`observation`, not privileged)
6. **Settlement dynamics — commercial disputes above PHP 50M** (`strategy`, privileged)

3 privileged, 3 non-privileged. Topics 1 and 2 directly answer the canonical demo query on expert witness cross-examination on damages. See [[acme-litigation-partners]] for the full entity breakdown.

## Test coverage

Every module has a co-located test file in `apps/web/src/__tests__/` (and `apps/api/src/__tests__/`). Test isolation: `fake-indexeddb` + `_resetDB()` in `beforeEach` for all IDB-dependent tests.

## Relations

- [[auto-organization-pipeline]] — the AI pipeline this domain calls (manual trigger as of 2026-05-15)
- [[note-wikilinks]] — author-stated `[[Title]]` linking added in commit `d799477`
- [[derived-edges]] — AI-inferred edges this surface complements
- [[acme-litigation-partners]] — the demo firm whose data this domain populates
- [[consilium-implementation-plan]] — K-1 through K-8 (all complete)
- [[consilium-data-model]] — IndexedDB schema for personal notes
- [[node-color-coding]] — palette implemented in `graphUtils.ts`
- [[cytoscape-js]] — `cola` continuous force layout confirmed here

## Sources

- [[consilium-implementation-plan]]
- [[consilium-project-architecture]]
- [[consilium-product-requirements]]
