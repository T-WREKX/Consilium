# Consilium · End-to-End Testing Guide

**Document type:** Manual E2E test plan
**Audience:** Anyone signing off on the hackathon MVP demo
**Status:** v1
**Companion documents:** [.agent/product-requirements.md](.agent/product-requirements.md), [.agent/project-architecture.md](.agent/project-architecture.md), [.agent/design-guidelines.md](.agent/design-guidelines.md)

---

## 0. How to use this guide

This is the **demo-readiness gate**. The MVP is "done" when every checkbox in **§9 Master acceptance checklist** is ticked. Any unchecked box blocks the demo.

**Conventions**

- Every test names its **failure mode** explicitly — if the failure-mode happens, the test fails even if no explicit assertion mentions it.
- Steps are written in the imperative ("Click X"). The reviewer performs the step.
- Every test ends with a sub-list of `- [ ]` acceptance criteria. Tick them as you verify.
- File path links point to the code that implements the behavior. If a test fails, open that file first.
- `[MVP]` features MUST pass for the hackathon demo. `[Shipped]` are extras that exist in code but were not in the PRD — they must still work, since users will encounter them.
- A blocked test (e.g. backend not running, no Gemini key) is **not** a pass. Mark it `[ ] BLOCKED — reason` and treat it as a fail until resolved.

**Time budget for a full pass:** roughly 60–90 minutes for one reviewer.

---

## 1. Pre-flight setup

Run this section once before the test pass. If any item fails, fix it before going further.

### 1.1 Required services

| Service | Where | How to confirm |
|---|---|---|
| Postgres 16 + pgvector + uuid-ossp | local Docker or hosted | `psql $DATABASE_URL -c "SELECT extname FROM pg_extension"` shows `vector` and `uuid-ossp` |
| Microsoft Presidio (analyzer + anonymizer) | `infra/docker-compose.yml` | `curl http://localhost:5001/health` → 200 |
| API server | `cd apps/api && npm run dev` | `curl http://localhost:3000/api/health` → `{"data":{"status":"healthy", ...}}` |
| Web app | `cd apps/web && npm run dev` | `http://localhost:5173` loads the login page |

### 1.2 Required environment variables

`apps/api/.env` must contain:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
GEMINI_API_KEY=<real key — needed for organize, vision, redact, embeddings, chat>
OPENAI_API_KEY=<real key — for /api/transcribe if Whisper is enabled>
PRESIDIO_ANALYZER_URL=http://localhost:5001
PRESIDIO_ANONYMIZER_URL=http://localhost:5002
NODE_ENV=development
```

**Failure mode:** if `GEMINI_API_KEY` is missing or invalid, `/api/organize`, `/api/vision`, `/api/redact`, `/api/publish` (needs embedding), and `/api/chat` all return 500. The seed script also fails. The Presidio fallback regex still works without a key.

`apps/web/.env` (or `.env.local`):

```env
VITE_API_URL=http://localhost:3000
```

### 1.3 Seed verification

After running `cd apps/api && npm run seed` (idempotent):

```bash
# 3 demo users
psql $DATABASE_URL -c "SELECT email, role FROM users ORDER BY email"
# Expect: admin@acme.law (knowledge_admin), lead@acme.law (practice_group_lead), litigator@acme.law (lawyer)

# 15+ insights with embeddings
psql $DATABASE_URL -c "SELECT COUNT(*) AS insights, COUNT(embedding) AS with_embedding FROM team_graph_nodes WHERE node_type='insight'"
# Expect: both columns ≥ 15

# Canonical-query insights present
psql $DATABASE_URL -c "SELECT title FROM team_graph_nodes WHERE title ILIKE '%damages expert%' OR title ILIKE '%counsel-supplied%'"
# Expect: ≥ 2 rows
```

**Acceptance**
- [ ] All three demo accounts seeded with correct emails and roles
- [ ] ≥ 15 insights in `team_graph_nodes` with non-NULL `embedding`
- [ ] ≥ 2 insights matching the canonical damages-expert query
- [ ] Personal sidebar shows 5–8 pre-seeded notes after first lawyer login ([seedPersonal.ts](apps/web/src/lib/seedPersonal.ts))

### 1.4 Known environment blockers

| Blocker | Symptom | Workaround |
|---|---|---|
| Node < 20.19 | `vite build` errors with "Vite requires Node.js version 20.19+ or 22.12+" | Upgrade Node; dev server still runs on 20.16 |
| Missing rolldown native binding (win32-x64) | `vite build` errors with "Cannot find native binding" | Delete `apps/web/node_modules` + `package-lock.json`, then `npm install` |
| Missing `GEMINI_API_KEY` | All organize / chat / redact / publish endpoints 500 | Required — get a key from Google AI Studio |
| Presidio not running | Redaction Pass 1 silently falls back to a basic regex (works, but is less accurate) | Start Presidio via `docker-compose up` in `infra/` |

---

## 2. Feature inventory

| # | Feature | Scope | Tested in |
|---|---|---|---|
| 1 | Login with seeded accounts | MVP · PRD §2.1 | §4.1 |
| 2 | Role differences in UI (lawyer / lead / admin) | MVP · PRD §2.1 | §4.1 |
| 3 | JWT 24h session + logout | MVP · PRD §2.1 | §4.1 |
| 4 | Text note: title + body + auto-save (500ms debounce) | MVP · PRD §2.2.1 | §4.2 |
| 5 | Audio capture: MediaRecorder + waveform + 5 min cap | MVP · PRD §2.2.2 | §4.3 |
| 6 | Audio transcription | MVP · PRD §2.2.2 | §4.3 |
| 7 | Image upload: PNG/JPG/WebP ≤ 10 MB + Gemini Vision | MVP · PRD §2.2.3 | §4.4 |
| 8 | AI auto-organization (entity extraction + classification + privilege) | MVP · PRD §2.3 | §4.2 / §4.3 / §4.4 |
| 9 | Manual entity remove / add / dismiss | MVP · PRD §2.3 | §4.5 |
| 10 | Personal graph (force-directed, node coloring, search filter, empty state) | MVP · PRD §2.4 | §4.6 |
| 11 | Publish flow + 2-pass redaction + preservation score | MVP · PRD §2.5 | §4.7 |
| 12 | Side-by-side diff with hover-paired highlights | MVP · design §8.1 | §4.7 |
| 13 | Per-redaction restore + redaction details disclosure | MVP · PRD §2.5.3 + design §8.1 | §4.7 |
| 14 | Team graph view (read-only summary panel) | MVP · PRD §2.6 | §4.8 |
| 15 | Chat: stream, citations, confidence, sources, refusal | MVP · PRD §2.7 | §4.9 |
| 16 | Query-overlay graph animation | MVP · PRD §2.7 + design §8.3 | §4.10 |
| 17 | Seed data: 3 accounts + 15+ insights + canonical query | MVP · PRD §2.8 | §4.11 |
| 18 | Folder create / expand / move notes | Shipped | §5.1 |
| 19 | Right-click delete (note + folder) with team-graph cascade | Shipped | §5.2 |
| 20 | `[[Wikilinks]]` in note bodies + stub-on-click | Shipped | §5.3 |
| 21 | Backlinks panel | Shipped | §5.3 |
| 22 | Organize panel: Apply AI / revert snapshot / accept suggestions | Shipped | §5.4 |
| 23 | Reset-chat button | Shipped | §5.5 |
| 24 | Knowledge Admin approval dashboard | V1 — **not built** | §10 |
| 25 | 4-pass redaction pipeline | V1 — **not built** | §10 |
| 26 | MCP server endpoint | V1 — **not built** | §10 |
| 27 | SSO / SAML / OIDC | V1 — **not built** | §10 |
| 28 | iManage / NetDocuments integration | V1 — **not built** | §10 |
| 29 | Native desktop / mobile apps | V1 — **not built** | §10 |
| 30 | Audit log UI | V1 — **not built** | §10 |
| 31 | Multi-firm tenancy | V1 — **not built** | §10 |
| 32 | Real-time collaboration, doc drafting, billing | OUT | §10 |

---

## 4. MVP feature tests

### 4.1 Authentication & roles  [MVP · PRD §2.1]

**Preconditions**
- API running, seed loaded (§1.3)
- Browser opened on `/` — login page visible

**Steps**
1. Submit empty form → confirm a validation message shows.
2. Submit `litigator@acme.law` / `wrong-password` → confirm an "invalid credentials" error.
3. Submit `litigator@acme.law` / `demo` → confirm redirect to `/capture` (or the personal default route).
4. In DevTools → Application → Local Storage, confirm a JWT token is stored.
5. Open Network tab → make any action → confirm requests carry `Authorization: Bearer <jwt>`.
6. Click logout → confirm return to login screen and JWT cleared.
7. Repeat 3–6 with `lead@acme.law` / `demo` and `admin@acme.law` / `demo`.
8. Decode the JWT (jwt.io) → confirm `exp - iat ≈ 86400` (24 hours).

**Expected**
- Each account logs in successfully.
- The TopNav shows the user's display name and role pill (Lawyer / Practice Group Lead / Knowledge Admin) for the matching account.
- All three accounts can navigate Capture, Personal Graph, Team Graph, Chat in MVP — role differences are visual only (PRD §1.2 MVP row).

**Failure mode:** wrong password succeeds, JWT missing from request headers, or logout leaves user signed in.

**Acceptance** (PRD §2.1)
- [ ] `litigator@acme.law` / `demo` logs in
- [ ] `lead@acme.law` / `demo` logs in
- [ ] `admin@acme.law` / `demo` logs in
- [ ] Logged-in user sees role-appropriate UI elements (display name + role pill in TopNav)
- [ ] Logout returns to login screen and clears JWT
- [ ] JWT expiry is 24 hours
- [ ] Wrong password rejected with a clear error
- [ ] All API requests carry `Authorization: Bearer <jwt>`

---

### 4.2 Text capture + auto-save + organize  [MVP · PRD §2.2.1 + §2.3]

**Preconditions**
- Signed in as `litigator@acme.law`
- On `/capture` with the **Write** tab active ([CaptureView.tsx](apps/web/src/views/capture/CaptureView.tsx))

**Steps**
1. Title focus is on the title field on mount.
2. Type a title: "Cross-exam tactics — Smith v Jones".
3. Tab to the body field.
4. Type ~3 sentences mentioning a judge name, a client party, and a damages dollar figure.
5. Stop typing for ~600ms. Open DevTools → Application → IndexedDB → `consilium-personal` → `notes` and confirm a record is present.
6. Watch for "Organizing..." indicator. Wait up to 10s.
7. After organize completes:
   - Entity chips appear with color-coded dots ([organize-panel chips](apps/web/src/views/capture/OrganizePanel.tsx)).
   - If the AI flagged it privileged, a banner reads "Attorney-client privileged content detected" ([TextCapture.tsx](apps/web/src/views/capture/TextCapture.tsx)).
8. Edit the title slightly → confirm auto-save fires again (debounced).
9. **Force a failure path:** stop the API server. Edit body → confirm "Organization failed" pill + **Retry** button. Restart API, click Retry → confirm pill clears and entities populate.
10. Reload the page → confirm the note is still in the sidebar and the body is intact.

**Failure mode:** auto-save never fires; body lost on reload; organize errors silently (no retry control).

**Acceptance** (PRD §2.2.1 + §2.3)
- [ ] Capture-tab editor opens with focus on the title field
- [ ] Note auto-saves to IndexedDB within ~500ms after typing stops
- [ ] After save, organize pipeline runs (Gemini Pro single call) and entities + classification + privilege flag populate
- [ ] Extracted entities render as color-coded chips (PRD §2.3)
- [ ] Privilege banner shows when `isPrivileged: true`
- [ ] On organize failure, "Organization failed" + Retry button visible (PRD §2.3 edge cases)
- [ ] Retry recovers cleanly
- [ ] Page reload preserves the note

---

### 4.3 Audio capture + transcription + organize  [MVP · PRD §2.2.2 + §2.3]

**Preconditions**
- Signed in, on `/capture` → **Record** tab ([AudioCapture.tsx](apps/web/src/views/capture/AudioCapture.tsx))
- Microphone permission granted in the browser

**Steps**
1. Click the round record button. If permission was not yet granted, accept the browser prompt.
2. Confirm: recording-state UI shows a duration counter and a waveform (WaveSurfer) animating ([AudioCapture.tsx:25-34](apps/web/src/views/capture/AudioCapture.tsx#L25-L34)).
3. Speak for ~10–20 seconds — include a judge name, an opposing-counsel firm, and a procedural term ("motion in limine", "Rule 403", etc.).
4. Click **Stop recording**.
5. Confirm "Transcribing..." state.
6. When transcript appears, confirm it is editable (textarea).
7. Click **Save note**.
8. Confirm the note appears in the sidebar and the organize pipeline runs (entity chips populate inside the note view).
9. Verify the audio blob is retained — DevTools → IndexedDB → `notes` → find the new note → `audioBlob` is present and `contentType === 'audio'`.
10. **Cap test:** start a new recording, leave it running until the counter approaches 5:00. Confirm recording auto-stops within 1 second of 5:00 ([AudioCapture.tsx:39-43](apps/web/src/views/capture/AudioCapture.tsx#L39-L43)).

**Failure mode:** transcript is empty or hallucinated, audio blob not stored, no organize pipeline run after save, recording exceeds 5 min cap.

**Acceptance** (PRD §2.2.2 + §2.3)
- [ ] Record button is visible on the Record tab
- [ ] Recording shows duration counter and waveform indicator
- [ ] Stop finalizes recording and triggers transcription
- [ ] Transcribed text is editable before save
- [ ] Original audio is stored in IndexedDB (`audioBlob` non-empty) and the note has `contentType: 'audio'`
- [ ] Maximum recording is capped at 5 minutes (auto-stops)
- [ ] After save, the organize pipeline runs and entities populate
- [ ] On organize failure, an error pill is shown and dismissable

---

### 4.4 Image capture + vision + organize  [MVP · PRD §2.2.3 + §2.3]

**Preconditions**
- Signed in, on `/capture` → **Upload** tab ([ImageCapture.tsx](apps/web/src/views/capture/ImageCapture.tsx))
- A PNG/JPG of a whiteboard or handwritten note, ≤ 10 MB, on hand

**Steps**
1. **Drag** the file onto the drop zone. Confirm the file is accepted.
2. Repeat using the **Click to upload** path with the keyboard (focus the zone, press Enter or Space → file picker opens, then select).
3. Confirm preview image appears, then "Analyzing image..." state.
4. When extracted text appears, confirm it is editable.
5. Click **Save note**. Confirm:
   - Note saves with `contentType: 'image'` and `imageBlob` present in IndexedDB.
   - Organize pipeline runs on the extracted text (entities populate).
6. **Negative paths:**
   - Try uploading a `.gif` → error "Only PNG, JPG, and WebP files are accepted."
   - Try uploading an 11 MB file → error "File must be under 10MB."
   - Try uploading while still in `analyzing` state → second upload is ignored ([ImageCapture.tsx:27-29](apps/web/src/views/capture/ImageCapture.tsx#L27-L29)).
7. After upload, click **Dismiss** on the error pill → confirm it clears.

**Failure mode:** non-accepted MIME passes; oversize file passes; analysis result not editable; image blob not retained.

**Acceptance** (PRD §2.2.3 + §2.3)
- [ ] Drop zone accepts PNG, JPG, WebP
- [ ] Files > 10 MB rejected with a clear error
- [ ] Non-image files rejected with a clear error
- [ ] Uploaded image preview is shown
- [ ] Gemini Vision call produces extracted text and a brief structural description
- [ ] Result is editable before save
- [ ] Original image is stored in IndexedDB and displayed inline
- [ ] After save, the organize pipeline runs and entities populate
- [ ] Keyboard accessibility on drop zone (Enter / Space opens file picker)

---

### 4.5 Entity chips — AI extraction, manual remove, manual add  [MVP · PRD §2.3 acceptance]

**Preconditions**
- A saved text note with body ≥ 20 chars exists and has been organized (entity chips visible)

**Steps**
1. In the in-note chip list ([TextCapture.tsx](apps/web/src/views/capture/TextCapture.tsx)), hover one chip → "×" button visible.
2. Click "×" → chip disappears immediately and the note in IndexedDB no longer lists that entity.
3. In the **Organize panel** ([OrganizePanel.tsx](apps/web/src/views/capture/OrganizePanel.tsx)) click **Add** → fill in the AddEntityForm with a new entity (e.g., a witness) → submit.
4. Confirm:
   - New chip appears in the panel.
   - Note's `organizeProvenance.entities === 'user'` (DevTools → IndexedDB).
5. Click "×" on the new chip in the panel → confirm it is removed AND its dedup key is added to `dismissedEntityKeys` so the next organize run doesn't re-add it ([noteStore.dismissEntity](apps/web/src/store/noteStore.ts)).
6. Re-trigger organize (edit the body) → confirm the dismissed entity does NOT come back.

**Failure mode:** chip removal does not persist; dismissed entities re-appear after re-organize; manual add fails silently.

**Acceptance** (PRD §2.3 acceptance)
- [ ] Each entity chip has a working "×" remove control
- [ ] Removal persists to IndexedDB
- [ ] Lawyer can manually add a new entity via the Organize panel
- [ ] Dismissed entities do not reappear on next organize run (`dismissedEntityKeys` honored)
- [ ] Privilege flag toggle (Organize panel) persists with provenance `'user'`

---

### 4.6 Personal graph view  [MVP · PRD §2.4]

**Preconditions**
- Signed in as `litigator@acme.law` (seeded notes present, plus any notes created during the test pass)
- Navigate to `/graph` ([PersonalGraphView.tsx](apps/web/src/views/graph/PersonalGraphView.tsx))

**Steps**
1. Confirm graph renders within 2 seconds.
2. Visually count: there should be a node for each note and entity. Colors match design §2.5 (insight purple, matter teal, party magenta, lawyer steel-blue, etc.).
3. **Hover** any node → tooltip shows title/summary, connected edges brighten.
4. **Click** a note node → routes to `/capture` with that note active.
5. **Click** an entity node → graph filters to that entity's neighborhood (other nodes fade to 20% opacity).
6. Type in the search box → matching nodes stay opaque, non-matching fade.
7. Clear the search → all nodes return to full opacity.
8. **Empty state:** sign in as a fresh user (no seed) — confirm "Capture your first note" CTA centered.
9. **Performance:** with seed (~10–20 nodes), zoom and pan freely with mouse wheel and drag — no jank.

**Failure mode:** render takes > 2 s; click on node does nothing; search filter mis-matches; empty state missing.

**Acceptance** (PRD §2.4)
- [ ] Force-directed layout renders within 2 seconds of load
- [ ] Node coloring matches design-guidelines §2.5
- [ ] Click on a note node opens the note in `/capture`
- [ ] Click on an entity node filters to that entity's neighborhood
- [ ] Hover shows tooltip and highlights connected edges
- [ ] Real-time search filter fades non-matching nodes to ~20% opacity
- [ ] Zoom and pan work via mouse wheel and drag
- [ ] Empty state shows "Capture your first note" CTA when no notes exist

---

### 4.7 Publish flow + redaction + details disclosure + per-redaction restore  [MVP · PRD §2.5 + design §8.1]

**Preconditions**
- Signed in as `litigator@acme.law`
- A personal note exists with body ≥ 1 sentence containing: a real-sounding client name, an opposing party, a dollar amount, and a year
- Presidio is running (otherwise tests should still pass but with weaker PII detection)

**Steps**
1. Open the note in the sidebar → click **Publish to team graph** (sidebar action button or in-note button).
2. Confirm redaction modal opens within 3 seconds.
3. Wait for "Analyzing for redaction..." to disappear and content to load (within 5 s of modal open).
4. Confirm header shows:
   - Title "Publish to team graph"
   - Preservation score: 5-dot bar + percentage + tier color (green ≥60, amber 40–59, red <40)
5. Confirm **left pane** shows the original (read-only) with PII tokens visibly highlighted (amber underline for PII, blue for generalization).
6. Confirm **right pane** shows the sanitized version, editable (contenteditable).
7. **Hover** one PII highlight in the right pane → confirm matching highlight emphasizes in the left pane (hover-paired).
8. Click the **Details** disclosure ([RedactionModal.tsx](apps/web/src/views/publish/RedactionModal.tsx)).
9. Confirm list shows every redaction with:
   - Type badge (PII or Generalized)
   - `original → replacement` shown in monospace
   - Reason line (e.g., "Personally identifying or client-confidential token replaced")
10. Click **Restore** on one PII row → confirm:
    - Row gets dashed border + Re-apply label
    - Right pane re-renders with the original text in that position
11. Click **Re-apply** → confirm the redaction is reinstated.
12. Manually edit a word in the right pane → confirm the **Publish** button remains enabled even if score < 40%.
13. **Threshold test:** if score > 40% and you have not edited or rejected, Publish is enabled. If score ≤ 40% and you have not edited or rejected, Publish is disabled. Verify both conditions.
14. Click **Publish**.
15. Confirm:
    - Toast: "Published. Your colleagues can now see this."
    - The personal note's sidebar row shows a "Published" indicator.
    - Navigating to `/team` shows a new insight node.
16. Press Escape on a fresh redaction modal — confirm it closes.

**Failure mode:** modal does not open within 3 s; details disclosure missing or wrong shape; Restore does not actually restore the text; Publish enabled below threshold with no edit + no rejection; published note does not appear in team graph.

**Acceptance** (PRD §2.5 + design §8.1)
- [ ] Modal opens within 3 seconds of clicking Publish
- [ ] Both passes (Presidio + Gemini generalization) complete within 5 seconds total
- [ ] Side-by-side diff: left read-only original, right editable sanitized
- [ ] PII redactions visually marked on both sides with paired colors
- [ ] Hovering one highlight emphasizes its pair on the other side
- [ ] Preservation score visible with green/amber/red tier and percentage
- [ ] Details disclosure lists every redaction with type, original, replacement, reason
- [ ] Per-redaction Restore button reverts that redaction in the right pane
- [ ] Re-apply re-tokenizes that redaction
- [ ] Publish disabled when score ≤ 40% AND no edits AND no rejections
- [ ] Manual edit OR rejection unlocks Publish even below 40%
- [ ] After publish, new insight node appears in team graph
- [ ] Toast confirmation displayed
- [ ] Personal note marked `isPublished: true` in IndexedDB
- [ ] Escape key closes the modal

---

### 4.8 Team graph view  [MVP · PRD §2.6]

**Preconditions**
- Signed in as any of the three demo accounts
- Navigate to `/team` ([TeamGraphView.tsx](apps/web/src/views/team/TeamGraphView.tsx))

**Steps**
1. Confirm graph renders with all seeded insights + their connected entities.
2. Visual: same color palette as personal graph (design §2.5).
3. **Click** any node → summary panel slides in showing title, type badge, summary, and connected nodes.
4. Confirm the panel shows **summary only** for non-admin (no full body / no edit affordance) — MVP simulates the V1 admin-only full-clickability rule.
5. Close panel (× or click outside).
6. Search filter works as in personal graph.
7. **Empty-state test (requires fresh DB):** drop the seed → confirm "No published insights yet. Be the first to publish."

**Failure mode:** click on node opens full editor (V1 leakage); search filter does not work; empty state missing or wrong copy.

**Acceptance** (PRD §2.6)
- [ ] Force-directed layout renders the seeded team graph (≥ 15 nodes)
- [ ] Node coloring matches design-guidelines §2.5
- [ ] Click on a node opens a summary panel (not full note)
- [ ] All three role accounts can view the team graph
- [ ] Search filter behaves identically to personal graph
- [ ] Empty-state copy: "No published insights yet. Be the first to publish."

---

### 4.9 Chat with team brain — stream, citations, confidence, sources, refusal  [MVP · PRD §2.7]

**Preconditions**
- Signed in
- Navigate to `/chat` ([ChatView.tsx](apps/web/src/views/chat/ChatView.tsx))

**Steps**
1. **Welcome state:** confirm welcome heading + 4 suggested-query buttons render.
2. Click a suggested query → it is submitted as if typed.
3. **Normal query:** type "What strategies work for cross-examining expert witnesses on damages?" → press Enter.
4. Within 500 ms, confirm:
   - Input disabled
   - Chat content dims to ~30% opacity
   - Query-overlay graph fades in (see §4.10 for full overlay test)
5. Within 3 seconds, streaming response begins. Confirm:
   - Streaming cursor visible at the end of the partial text
   - Citation chips appear inline as segments stream in (monospace `[1]`, `[2,3]` form, [CitationChip.tsx](apps/web/src/views/chat/CitationChip.tsx))
6. After streaming completes:
   - Confidence badge pill below the assistant bubble (High / Medium / Low / Insufficient)
   - For High-confidence: Sources panel collapsed by default. For Medium/Low: expanded by default ([SourcesPanel.tsx](apps/web/src/views/chat/SourcesPanel.tsx)).
7. **Click a citation chip** → NodeSummaryPanel slides in from the right with the cited node's summary.
8. Close panel.
9. **Refusal test:** type a query that has no chance of matching the seed, e.g. "What's our firm's stance on maritime salvage tariffs?" → submit.
10. Confirm:
    - Response renders the exact refusal copy: *"I don't have firm knowledge that directly addresses this. You may want to capture your own thinking on this topic as a starting point."*
    - Refusal bubble is styled distinctly (solid bubble + italic muted text, no dashed border)
    - Confidence pill reads "Insufficient"
    - Sources panel is NOT shown (refusal has no fake sources)
    - A "Capture your thinking on this" CTA button appears

**Failure mode:** streaming never starts; citations don't link to nodes; refusal includes fake sources; confidence pill missing.

**Acceptance** (PRD §2.7)
- [ ] Query submission triggers overlay within 500 ms
- [ ] Streaming response begins within 3 seconds of query submission
- [ ] Citation chips render inline in monospace `[n]` form and resolve to correct nodes
- [ ] Clicking a citation chip opens NodeSummaryPanel for that node
- [ ] Confidence badge displays High / Medium / Low / Insufficient
- [ ] Sources section is collapsed for high-confidence answers, expanded for medium/low
- [ ] Refusal triggers when no nodes match above the similarity threshold
- [ ] Refusal text matches PRD §2.7.4 exactly
- [ ] Refusal has NO sources panel
- [ ] Refusal shows the "Capture your thinking on this" CTA
- [ ] Suggested queries on welcome state submit correctly

---

### 4.10 Query-overlay graph animation — Hero Moment 3  [MVP · PRD §2.7 + design §8.3]

**Preconditions**
- Signed in, on `/chat`
- Team graph populated (seed loaded)

**Steps**
1. Submit a query that will match seeded insights (e.g., the canonical damages-expert query).
2. Within 150 ms, confirm chat content dims to ~30 % opacity and input is disabled.
3. Within 400 ms, confirm a full-screen overlay fades in with backdrop blur. The team graph renders centered.
4. Within 1–2 seconds, confirm cited nodes pulse to full opacity one by one, ~150 ms apart, in order of relevance ([QueryOverlay.tsx](apps/web/src/views/chat/QueryOverlay.tsx)).
5. Confirm edges between cited nodes illuminate to `accent-primary` (orange).
6. Overlay holds for ~1 second after all cited nodes are lit.
7. As Gemini begins streaming the response, confirm the overlay fades out over ~600 ms and chat un-dims.
8. **Reduced-motion test:** in OS settings, enable "reduce motion". Reload, re-run a query → confirm pulse animation is replaced with an instant set-to-final-state and the overlay fades but does not blur.
9. **Escape dismissal:** during the overlay, press Escape → confirm overlay dismisses early.

**Failure mode:** overlay does not appear; pulse waves drop frames; reduced-motion preference ignored; Escape does not dismiss.

**Acceptance** (PRD §2.7 + design §8.3)
- [ ] Chat dims to ~30 % opacity within 150 ms
- [ ] Overlay backdrop fades in over ~400 ms with blur
- [ ] Team graph renders centered with cited nodes initially at low opacity
- [ ] Cited nodes pulse to full opacity at ~150 ms intervals in relevance order
- [ ] Pulse animation runs smoothly (visually 60 fps)
- [ ] Edges between cited nodes illuminate to accent-primary
- [ ] Overlay holds ~1 second after all cited nodes are lit
- [ ] Overlay fades out over ~600 ms as response streams in
- [ ] `prefers-reduced-motion` honored — pulse/blur skipped, final state shown
- [ ] Escape key dismisses overlay during reveal

---

### 4.11 Seed data integrity + canonical demo query  [MVP · PRD §2.8]

**Preconditions**
- Fresh seed run completed (§1.3 passed)

**Steps**
1. Run §1.3 SQL checks — all must pass.
2. Sign in as `litigator@acme.law`.
3. Confirm 5–8 pre-seeded personal notes appear in the sidebar ([seedPersonal.ts](apps/web/src/lib/seedPersonal.ts)).
4. Go to `/team` — confirm ≥ 15 nodes render.
5. Go to `/chat` — submit **exactly** this query:

   > **What has our firm learned about cross-examining expert witnesses on damages calculations?**

6. Confirm:
   - The query-overlay animation pulses 3+ cited nodes.
   - The streaming response cites at least one of: "Cross-examining damages experts on counsel-supplied assumptions", "Daubert-style challenge to damages expert methodology", "Preparing for expert rebuttal on damages calculations" ([seed/insights.ts:177-211](apps/api/src/seed/insights.ts#L177-L211)).
   - Confidence reads **High** (3+ sources above 0.80).
   - Response is coherent and grounded — no obvious hallucinations.
   - Total time from submit to streaming complete is under 10 seconds.

**Failure mode:** canonical query returns Insufficient; no damages-expert insights cited; response cites hallucinated content.

**Acceptance** (PRD §2.8)
- [ ] Seed script is idempotent (re-running does not duplicate)
- [ ] All three demo accounts can log in and see appropriate populated state
- [ ] Lawyer account has 5–8 personal notes pre-seeded
- [ ] Team graph has 15–30 insights covering judge tendencies, opposing counsel, motion practice, expert witness, settlement, procedural
- [ ] The canonical damages-expert query produces a strong, cited, grounded response
- [ ] Canonical query end-to-end completes in < 10 seconds

---

## 5. Shipped-beyond-spec tests

These features are in the codebase but not in the PRD. Users will touch them during the demo, so they must work.

### 5.1 Folder create / expand / move notes  [Shipped]

**Preconditions**
- Signed in, sidebar expanded

**Steps**
1. Click **+ New** → **New Folder** ([SideNav.tsx](apps/web/src/components/SideNav.tsx)).
2. Type a folder name, press Enter → confirm folder appears in sidebar.
3. Press Escape on the input mid-type → confirm folder is NOT created.
4. Click a folder header → confirm chevron toggles between right and down; expanded state shows child notes.
5. Click **+ New** → **New Note** → confirm a blank note opens in `/capture`.
6. Use `moveNoteToFolder` programmatically or drag-and-drop (if implemented) to file the note. (If only programmatic API exists, verify via DevTools console: `useNoteStore.getState().moveNoteToFolder(noteId, folderId)`.)
7. Reload → folder + filed note persist.

**Acceptance**
- [ ] Create-folder inline input appears and accepts a name
- [ ] Pressing Enter commits the folder
- [ ] Pressing Escape cancels without creating
- [ ] Folders persist across reload (`folders` object store)
- [ ] Expanded/collapsed state toggles by header click
- [ ] Folder shows child-note count when expanded

---

### 5.2 Right-click delete (note + folder) with team-graph cascade  [Shipped]

**Preconditions**
- A personal note exists that has been published (so it has `publishedNodeId`)
- A folder exists with ≥ 1 child note

**Steps**
1. **Right-click the published note** in the sidebar.
2. Confirm context menu appears at cursor with a single **Delete** entry (red destructive styling) ([ContextMenu.tsx](apps/web/src/components/ContextMenu.tsx)).
3. Click outside the menu → confirm it closes.
4. Right-click again → click **Delete**.
5. Confirm modal opens with title "Delete this note?" and the message includes the warning *"This note was published to the team graph — its team-graph entry will also be removed."* ([ConfirmModal.tsx](apps/web/src/components/ConfirmModal.tsx)).
6. Press Escape → confirm modal closes without deleting.
7. Right-click → Delete → click **Delete** in the modal.
8. Confirm:
   - Note removed from sidebar
   - Toast: "Note deleted and removed from team graph."
   - In `/team` view, the corresponding node is gone (and its edges, via the `ON DELETE CASCADE` constraint).
9. **Unpublished note path:** delete an unpublished note → confirm message has no "team graph" warning; toast is just "Note deleted."
10. **Folder delete:** right-click a folder with N child notes → Delete → modal copy mentions "The N notes inside will be kept and moved to Unfiled." → confirm.
    - Folder removed from sidebar.
    - Child notes still present in sidebar at the unfiled level.

**Forbidden-cross-tenant test (optional, advanced):**
1. Sign in as `litigator@acme.law` → publish a note → confirm node owner is the litigator.
2. Sign out, sign in as `lead@acme.law`.
3. Open DevTools and call `fetch(\`/api/team-graph/nodes/<litigator-node-id>\`, { method: 'DELETE', headers: { Authorization: \`Bearer \${jwt}\` } })`.
4. Confirm 403 Forbidden — non-admin cannot delete others' nodes ([routes/teamGraph.ts](apps/api/src/routes/teamGraph.ts)).
5. Repeat as `admin@acme.law` → confirm 200 OK.

**Failure mode:** Delete leaves the team-graph node behind; folder delete also deletes children unexpectedly; lawyer can delete another lawyer's node.

**Acceptance**
- [ ] Right-click on a note row opens a portal-rendered context menu at cursor position
- [ ] Right-click on a folder header opens the same menu
- [ ] Context menu auto-closes on outside click, Escape, or scroll
- [ ] Clicking Delete opens a confirmation modal
- [ ] Confirmation modal warns when a note was published to the team graph
- [ ] Confirming deletes from IndexedDB
- [ ] When the note was published, the team-graph node is also deleted (cascading its edges)
- [ ] Folder delete keeps child notes and unfiles them; modal copy explains this
- [ ] Lawyer/Practice Group Lead can only DELETE team-graph nodes they contributed (403 otherwise)
- [ ] Knowledge Admin can DELETE any team-graph node

---

### 5.3 `[[Wikilinks]]` + Backlinks panel  [Shipped]

**Preconditions**
- Two notes exist: A ("Judge Reyes — cross-exam style") and B ("Daubert challenges")

**Steps**
1. Open note A.
2. In the body, type: `See related [[Daubert challenges]]`.
3. Save (auto-save).
4. Reload the note → confirm the `[[Daubert challenges]]` text renders as a clickable WikilinkChip ([WikilinkChip.tsx](apps/web/src/components/WikilinkChip.tsx)).
5. Click the chip → confirm navigation to note B.
6. **Backlinks panel:** while on note B, confirm a "Backlinks (1)" panel shows ([BacklinksPanel.tsx](apps/web/src/views/capture/BacklinksPanel.tsx)) with a snippet of note A.
7. Click the backlink card → return to note A.
8. **Stub creation:** in note A, type `[[Brand new concept]]` → save → click the unresolved chip → confirm a new stub note titled "Brand new concept" is created and opened.
9. Rename note B's title to "Daubert Standard" → confirm note A's wikilink chip now displays the updated label ("Daubert Standard") on next render.

**Failure mode:** wikilink doesn't resolve after rename; click on unresolved chip does nothing; backlinks panel doesn't update when a wikilink is added.

**Acceptance**
- [ ] `[[X]]` syntax in note body is parsed and rendered as a chip
- [ ] Clicking a resolved chip navigates to the target note
- [ ] Clicking an unresolved chip creates a stub note and navigates to it
- [ ] Backlinks panel lists notes that link to the current note
- [ ] Backlinks panel shows a contextual snippet (±75 chars around the link)
- [ ] Rename of the target note updates the chip label

---

### 5.4 Organize panel — Apply AI, accept suggestions, revert snapshot  [Shipped]

**Preconditions**
- An organized note exists with at least one entity, a classification, and a privilege flag

**Steps**
1. Open the note → confirm the right-side Organize panel ([OrganizePanel.tsx](apps/web/src/views/capture/OrganizePanel.tsx)) is visible (or expand it from collapsed state).
2. Click **Add** entity → fill the form → submit → confirm the chip appears with `provenance: 'user'`.
3. In the Classification section, click an alternative classification → confirm it updates with `provenance: 'user'`.
4. Toggle the privilege flag → confirm it persists.
5. Edit the body significantly → click **Apply AI** (or the panel's organize trigger).
6. Confirm AI may suggest a different classification / privilege — those appear as accept/dismiss controls.
7. Click **Accept** on a suggestion → confirm it applies.
8. Click **Dismiss** on another → confirm it stays at user value.
9. Click **Revert** (snapshot revert) → confirm prior organize state is restored (`restoreOrganizeSnapshot` in [noteStore.ts](apps/web/src/store/noteStore.ts)).
10. Use the panel's **Insert link** action — open LinkQuickPick, select a note → confirm `[[Note title]]` is inserted into the note body at cursor.

**Failure mode:** suggestions never appear; revert does not actually restore; manual changes get overwritten by AI run.

**Acceptance**
- [ ] Manual entity add via AddEntityForm works and is marked `provenance: 'user'`
- [ ] Manual classification change persists with user provenance
- [ ] Manual privilege toggle persists with user provenance
- [ ] Apply AI surfaces suggestions (classification / privilege) when AI disagrees with user
- [ ] Accept suggestion replaces the user value
- [ ] Dismiss suggestion keeps the user value
- [ ] Revert restores the prior organize snapshot
- [ ] LinkQuickPick inserts a `[[wikilink]]` at cursor

---

### 5.5 Reset-chat button  [Shipped]

**Preconditions**
- On `/chat` with at least one message exchange in history

**Steps**
1. Locate the **reset** chip in the chat header ([chat.css:95](apps/web/src/views/chat/chat.css#L95) — `chat-reset-btn`).
2. Hover → confirm it turns danger-red.
3. Click → confirm chat clears to the welcome state, citations and overlay state reset.
4. Confirm the button is disabled while streaming.

**Acceptance**
- [ ] Reset button visible on `/chat` when messages exist
- [ ] Click clears messages, citations, sources panel
- [ ] Button is disabled during streaming
- [ ] Welcome state + suggested queries re-render after reset

---

## 6. End-to-end demo dry-run (PRD §6)

Time this run with a stopwatch. Total target: < 5 minutes. Any step exceeding its budget fails the demo gate.

**0:00–0:30 — Setup**
1. Open the deployed URL in a fresh window.
2. Sign in as `litigator@acme.law`.

**0:30–1:30 — Capture moment**
3. Navigate to `/capture` → **Record** tab.
4. Record a 30-second audio note about cross-examining a damages expert.
5. Stop → wait for transcription.
6. Save → confirm:
   - Transcript saved as a note in the sidebar.
   - Entity chips populate within 5–10 s of save (organize pipeline).
   - Personal graph (open in a new tab if needed) reflects the new node.

**1:30–3:00 — Publish moment**
7. From the new note, click **Publish to team graph**.
8. Modal opens within 3 s.
9. Walk through 1–2 redactions: hover-pair check, click Details, show one Restore.
10. Click **Publish**.
11. Confirmation toast appears.
12. Switch to `/team` → new node visible.

**3:00–4:30 — Retrieval moment**
13. Sign out, sign in as `lead@acme.law` (or in MVP, just keep the same session and switch tabs).
14. Navigate to `/chat`.
15. Submit: *"What has our firm learned about cross-examining expert witnesses on damages calculations?"*
16. Confirm overlay animation runs (chat dims, team graph fades in, cited nodes pulse).
17. Streaming response begins within 3 s.
18. Inline citations appear; click one → NodeSummaryPanel.
19. Confidence reads **High**.

**4:30–5:00 — Close**
20. Frame: privacy-protected capture, governed publish, citation-grounded retrieval with visible reasoning.

**Acceptance**
- [ ] Full demo executes without errors
- [ ] Each phase fits its time budget
- [ ] Capture → Publish → Retrieval all show their hero animations
- [ ] No console errors during the run
- [ ] No browser warning toasts unrelated to the demo

---

## 7. Negative & edge cases

### 7.1 AI organize failure path
Stop the API mid-typing on the **Write** tab.
- [ ] "Organization failed" pill appears with Retry
- [ ] Retry after restart succeeds
- [ ] Note body and title are not lost during failure

### 7.2 Whisper/audio transcribe failure
Disconnect from internet, stop a recording.
- [ ] User-visible error: "Transcription failed. Try again."
- [ ] App returns to idle state, recording blob is discarded
- [ ] No half-saved note appears in sidebar

### 7.3 Image vision failure
Upload a corrupt image or kill the API mid-analysis.
- [ ] "Image analysis failed. Try again." pill
- [ ] Dismiss returns to idle
- [ ] No half-saved note appears

### 7.4 Presidio down — fallback regex
Stop Presidio containers, attempt a publish.
- [ ] Modal still opens and redaction still produces a result
- [ ] PII tokens detected by regex (person names, emails, phone) are still tokenized
- [ ] No exception thrown; publish completes

### 7.5 Missing API keys
Remove `GEMINI_API_KEY` and restart API.
- [ ] `/api/health` still returns 200
- [ ] `/api/organize`, `/api/redact`, `/api/chat`, `/api/publish` return 500 with a clear `error.message`
- [ ] Frontend shows user-visible error pills (not silent failure)

### 7.6 Empty seed
Drop the DB and start API without seeding.
- [ ] Login still works (no users — login fails clearly, but doesn't crash)
- [ ] Team graph empty state: "No published insights yet. Be the first to publish."
- [ ] Chat refusal triggers on any query

### 7.7 Reduced motion
OS-level `prefers-reduced-motion: reduce` enabled.
- [ ] Pulse waves on query overlay skipped (instant set to final state)
- [ ] Overlay fade still happens (it's a fade, not a transform)
- [ ] Chat fadeIn animations replaced with instant state

### 7.8 Role permission on delete
Lawyer A publishes a node. Lawyer B attempts to DELETE it via the API.
- [ ] 403 Forbidden with `error.code: 'FORBIDDEN'`
- [ ] Node remains in team graph

### 7.9 Confirmation-modal Escape
On the delete confirmation modal, press Escape.
- [ ] Modal closes without deleting

### 7.10 Long content
Paste a 10,000-character body into a text note.
- [ ] Auto-save still completes
- [ ] Organize call validates within `max(50_000)` limit ([capture route schema](apps/api/src/routes/capture.ts))
- [ ] Entity extraction completes (may be slower but does not error)

### 7.11 Refusal precision
Query: "What is the capital of France?"
- [ ] Refusal triggers (clearly outside firm knowledge)
- [ ] No hallucinated sources cited

### 7.12 Concurrent organize
Type quickly across multiple debounced auto-saves; ensure the latest organize result wins (no flicker between stale and fresh entity sets).
- [ ] Only the latest organize result is applied
- [ ] No "ghost" entities from a stale call

---

## 8. API smoke tests (curl)

Run with API server up. Replace `$JWT` with a token from a successful login.

### 8.1 Health
```bash
curl -s http://localhost:3000/api/health
```
- [ ] Status 200
- [ ] Body matches `{"data":{"status":"healthy","timestamp":"...","version":"..."}}`

### 8.2 Login
```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"litigator@acme.law","password":"demo"}'
```
- [ ] Status 200
- [ ] Body contains `data.token` (JWT) and `data.user.{id,email,role,displayName}`
- [ ] `data.user.role === 'lawyer'`

```bash
# Bad password
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"litigator@acme.law","password":"wrong"}'
```
- [ ] Status 401

### 8.3 Me
```bash
curl -s http://localhost:3000/api/me -H "Authorization: Bearer $JWT"
```
- [ ] Status 200
- [ ] Body contains the same user as login
- [ ] Without header → 401

### 8.4 Team graph
```bash
curl -s http://localhost:3000/api/team-graph -H "Authorization: Bearer $JWT" | jq '.data | {nodeCount: (.nodes | length), edgeCount: (.edges | length)}'
```
- [ ] Status 200
- [ ] `nodeCount ≥ 15`
- [ ] `edgeCount > 0`
- [ ] Each node has `node_type` from the 9 allowed values

### 8.5 Organize
```bash
curl -s -X POST http://localhost:3000/api/organize \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"content":"Met with Judge Reyes today regarding the Smith v Jones matter. Discussed Daubert challenges to the damages expert."}'
```
- [ ] Status 200
- [ ] Body contains `data.entities`, `data.classification`, `data.isPrivileged`
- [ ] At least one entity extracted

### 8.6 Chat (SSE)
```bash
curl -N -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"query":"What has our firm learned about cross-examining expert witnesses on damages?"}'
```
- [ ] Status 200 with `Content-Type: text/event-stream`
- [ ] Emits a `cited-nodes` event with `nodeIds` array
- [ ] Emits multiple `token` events
- [ ] Emits a final `done` event with `confidence` and `sourceCount`

### 8.7 Delete team-graph node (authorization)
Get a node ID from §8.4 that you contributed:
```bash
NODE_ID=<your-uuid>
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE \
  http://localhost:3000/api/team-graph/nodes/$NODE_ID \
  -H "Authorization: Bearer $JWT_LITIGATOR"
```
- [ ] Status 200 when JWT belongs to the contributor or to a Knowledge Admin
- [ ] Status 403 when JWT belongs to a different non-admin user

---

## 9. Master acceptance checklist

This is the demo gate. Tick boxes as you verify in the test pass. The MVP is "done" when every box below is ticked.

### 9.0 PRD §7 — MVP "Done" gate (the minimum demo bar)

These mirror PRD §7 verbatim — do not edit wording.

- [ ] Three demo accounts work; role differences visible
- [ ] Text, audio, and image capture all functional
- [ ] AI auto-organization produces structured notes with extracted entities
- [ ] Personal graph renders Obsidian-style with seeded and newly-captured nodes
- [ ] Publish flow shows two-pass redaction with side-by-side diff
- [ ] Team graph renders with seeded insights
- [ ] Chat query produces cited, grounded response
- [ ] Query-overlay graph animation triggers correctly and runs smoothly
- [ ] Refusal case ("not enough firm knowledge") triggers correctly when tested
- [ ] Seed data loads on every fresh deployment
- [ ] App is deployed at a public URL
- [ ] The demo script (§6) can be executed end-to-end without errors in under 5 minutes

### 9.1 Pre-flight (§1)

- [ ] Postgres + pgvector + uuid-ossp present
- [ ] Presidio analyzer + anonymizer reachable
- [ ] API `GET /api/health` returns 200
- [ ] Web app loads on `http://localhost:5173`
- [ ] `GEMINI_API_KEY` set
- [ ] Seed verification SQL all pass
- [ ] No environment blockers (Node version, rolldown binding)

### 9.2 Authentication (§4.1)

- [ ] `litigator@acme.law` / `demo` logs in
- [ ] `lead@acme.law` / `demo` logs in
- [ ] `admin@acme.law` / `demo` logs in
- [ ] Role pill visible per account
- [ ] Logout returns to login and clears JWT
- [ ] JWT expiry is 24 hours
- [ ] Wrong password rejected with clear error
- [ ] All API requests carry `Authorization: Bearer <jwt>`

### 9.3 Text capture (§4.2)

- [ ] Editor opens with focus on title field
- [ ] Note auto-saves to IndexedDB ~500 ms after typing stops
- [ ] Organize pipeline runs after save (single Gemini Pro call)
- [ ] Entities render as color-coded chips
- [ ] Privilege banner shows when `isPrivileged: true`
- [ ] Organize failure shows pill + Retry button
- [ ] Retry recovers cleanly
- [ ] Page reload preserves the note

### 9.4 Audio capture (§4.3)

- [ ] Record button visible on Record tab
- [ ] Recording shows duration counter + waveform
- [ ] Stop finalizes recording and triggers transcription
- [ ] Transcribed text is editable before save
- [ ] `audioBlob` stored with `contentType: 'audio'`
- [ ] Auto-stop at 5 minutes
- [ ] Organize pipeline runs after save
- [ ] Organize-failure pill dismissable

### 9.5 Image capture (§4.4)

- [ ] PNG / JPG / WebP accepted
- [ ] Files > 10 MB rejected with clear error
- [ ] Non-image files rejected with clear error
- [ ] Image preview shown
- [ ] Gemini Vision produces extracted text + description
- [ ] Result editable before save
- [ ] `imageBlob` stored with `contentType: 'image'`
- [ ] Organize pipeline runs after save
- [ ] Drop zone keyboard accessible (Enter/Space)

### 9.6 Entity chips (§4.5)

- [ ] Each chip has working `×` remove
- [ ] Removal persists to IndexedDB
- [ ] Manual add via Organize panel works
- [ ] Dismissed entities do not reappear on re-organize
- [ ] Privilege toggle persists with `provenance: 'user'`

### 9.7 Personal graph (§4.6)

- [ ] Force-directed layout renders within 2 seconds
- [ ] Node coloring matches design §2.5
- [ ] Click on a note node opens the note
- [ ] Click on an entity node filters its neighborhood
- [ ] Hover shows tooltip + highlights edges
- [ ] Real-time search filter works
- [ ] Zoom + pan work
- [ ] Empty state CTA: "Capture your first note"

### 9.8 Publish flow + redaction (§4.7)

- [ ] Modal opens within 3 seconds
- [ ] Both passes complete within 5 seconds total
- [ ] Diff: left read-only, right editable
- [ ] PII redactions visually marked + paired
- [ ] Hover-paired highlights work
- [ ] Preservation score visible with tier color
- [ ] Details disclosure shows type / original / replacement / reason for each redaction
- [ ] Per-redaction Restore reverts the text
- [ ] Re-apply re-tokenizes
- [ ] Publish disabled when score ≤ 40% AND no edits AND no rejections
- [ ] Manual edit OR rejection unlocks Publish
- [ ] After publish: insight node appears in team graph
- [ ] Confirmation toast shown
- [ ] Note marked `isPublished: true`
- [ ] Escape closes the modal

### 9.9 Team graph (§4.8)

- [ ] Renders seeded team graph (≥ 15 nodes)
- [ ] Node coloring matches design §2.5
- [ ] Click opens summary panel (not full note)
- [ ] All three role accounts can view
- [ ] Search filter works
- [ ] Empty state copy: "No published insights yet. Be the first to publish."

### 9.10 Chat (§4.9)

- [ ] Welcome state + 4 suggested queries
- [ ] Suggested queries submit on click
- [ ] Overlay triggers within 500 ms of submit
- [ ] Streaming begins within 3 seconds
- [ ] Citation chips inline, monospace `[n]` form
- [ ] Citations resolve to correct nodes
- [ ] Click on chip opens NodeSummaryPanel
- [ ] Confidence badge: High / Medium / Low / Insufficient
- [ ] Sources panel collapsed for High, expanded for Medium/Low
- [ ] Refusal text matches PRD §2.7.4 exactly
- [ ] Refusal has NO sources panel
- [ ] Refusal shows "Capture your thinking on this" CTA

### 9.11 Query overlay animation (§4.10)

- [ ] Chat dims to ~30 % within 150 ms
- [ ] Overlay backdrop fades in over ~400 ms with blur
- [ ] Cited nodes pulse one-by-one at ~150 ms intervals
- [ ] Animation visually 60 fps
- [ ] Edges illuminate to accent-primary
- [ ] Overlay holds ~1 second after all nodes lit
- [ ] Overlay fades out over ~600 ms
- [ ] `prefers-reduced-motion` honored
- [ ] Escape dismisses overlay early

### 9.12 Seed data (§4.11)

- [ ] Seed script idempotent
- [ ] All three demo accounts seeded
- [ ] Lawyer has 5–8 personal notes pre-seeded
- [ ] Team graph has 15–30 insights across all six categories
- [ ] Canonical damages-expert query returns a strong, cited, grounded response
- [ ] Canonical query end-to-end completes in < 10 seconds

### 9.13 Folder management (§5.1)

- [ ] Create-folder inline input works
- [ ] Enter commits, Escape cancels
- [ ] Folders persist across reload
- [ ] Expand / collapse via header click
- [ ] Child-note count shown when expanded

### 9.14 Right-click delete (§5.2)

- [ ] Right-click on note row opens context menu
- [ ] Right-click on folder header opens context menu
- [ ] Menu auto-closes on outside click, Escape, or scroll
- [ ] Click Delete opens confirmation modal
- [ ] Modal warns when note was published
- [ ] Confirm deletes from IndexedDB
- [ ] Confirm deletes the team-graph node when published (cascading edges)
- [ ] Folder delete unfiles child notes (does NOT delete them)
- [ ] Modal copy explains the unfile behavior
- [ ] Lawyer/Lead cannot DELETE another lawyer's team node (403)
- [ ] Knowledge Admin can DELETE any team node

### 9.15 Wikilinks + backlinks (§5.3)

- [ ] `[[X]]` parsed and rendered as a chip
- [ ] Resolved chip click navigates to target
- [ ] Unresolved chip click creates a stub note
- [ ] Backlinks panel lists incoming links
- [ ] Backlinks panel shows snippet context
- [ ] Rename of target updates chip label

### 9.16 Organize panel (§5.4)

- [ ] Manual entity add works with `provenance: 'user'`
- [ ] Manual classification change persists
- [ ] Manual privilege toggle persists
- [ ] Apply AI surfaces classification/privilege suggestions when AI disagrees
- [ ] Accept suggestion replaces user value
- [ ] Dismiss suggestion keeps user value
- [ ] Revert restores prior snapshot
- [ ] LinkQuickPick inserts `[[wikilink]]` at cursor

### 9.17 Reset chat (§5.5)

- [ ] Reset button visible when messages exist
- [ ] Click clears messages, citations, sources panel
- [ ] Button disabled during streaming
- [ ] Welcome state re-renders after reset

### 9.18 Negative & edge cases (§7)

- [ ] AI organize failure surfaces Retry, recovers cleanly
- [ ] Whisper/audio transcribe failure surfaces error, no half-save
- [ ] Image vision failure surfaces error, no half-save
- [ ] Presidio down: redaction still runs via regex fallback
- [ ] Missing API keys: clear errors, no silent failure
- [ ] Empty seed: team graph empty state + chat refuses any query
- [ ] Reduced motion honored
- [ ] Role permission on delete: 403 for non-contributor non-admin
- [ ] Delete-confirm Escape closes without deleting
- [ ] Long content (~10k chars) auto-saves and organizes
- [ ] Out-of-domain query refuses cleanly
- [ ] Concurrent organize calls: latest wins, no ghost entities

### 9.19 API smoke (§8)

- [ ] `/api/health` returns healthy
- [ ] Login returns JWT + user
- [ ] Bad password → 401
- [ ] `/api/me` returns user; 401 without bearer
- [ ] `/api/team-graph` returns ≥ 15 nodes
- [ ] `/api/organize` returns entities + classification + privilege
- [ ] `/api/chat` streams SSE with `cited-nodes`, `token`, `done` events
- [ ] `DELETE /api/team-graph/nodes/:id` enforces ownership / admin

### 9.20 Demo dry-run (§6)

- [ ] Full demo executes without errors
- [ ] Each phase fits its time budget
- [ ] All three hero animations visible
- [ ] No console errors during run
- [ ] Total time under 5 minutes

---

## 10. V1 / V2 / OUT — not tested

These items are documented for traceability but are **not** under test. Reviewers should verify the items in the "Expected absence" column to confirm they have NOT leaked into MVP.

| Feature | Scope | Expected absence in MVP |
|---|---|---|
| Knowledge Admin approval workflow | V1 | No "Pending Approvals" inbox; admin account has no admin dashboard |
| 4-pass redaction (privilege detection, identifier scrub, generalization, preservation) | V1 | Publish modal does Pass 1 (Presidio) + Pass 2 (Gemini gen) + preservation score only |
| Native desktop (Tauri) / mobile apps | V1 | Web SPA only |
| On-device Gemma model | V1 | All AI runs in cloud (Gemini API) |
| Markdown file storage on local FS | V1 | Personal notes only in IndexedDB |
| SSO via SAML/OIDC | V1 | Username/password only |
| MFA | V1 | No MFA prompt for any account |
| iManage / NetDocuments integration | V1 | No DMS connectors |
| Microsoft 365 / Google Workspace integration | V1 | No calendar prompts or email forward |
| Slack / Teams capture | V2 | Not present |
| Zoom / Teams meeting ingestion | V1 | Not present |
| Harvey / CoCounsel / Spellbook outbound MCP | V1 | No MCP server endpoint |
| Westlaw / LexisNexis browser extension | V1 | Not present |
| PracticePanther / Clio matter context | V2 | Not present |
| Audit log UI | V1 | No "who viewed my insights" surface |
| Per-user access log surface | V1 | Not present |
| Multi-firm tenancy | V1 | Single hard-coded firm `Acme Litigation Partners` |
| Cross-firm anonymized benchmarks | V2 | Not present |
| Advanced analytics for KM leadership | V2 | Not present |
| Ethical wall automation | V2 | Not present |
| Light theme | V1 | Dark theme only |
| Onboarding tour | V1 | Not present |
| Settings / preferences page | V1 | Not present |
| Real-time collaboration on notes | OUT | Not present |
| Built-in document drafting | OUT | Not present |
| Time tracking and billing | OUT | Not present |
| Conflict checking automation | OUT | Not present |
| Client portals | OUT | Not present |
| Court filing integration | OUT | Not present |

**Acceptance**
- [ ] No V1/V2/OUT feature listed above is visible or reachable in the MVP build

---

## Sign-off

| Role | Name | Date | Initials |
|---|---|---|---|
| Reviewer (filled in by tester) | | | |
| Demo lead approval | | | |
| Architecture lead approval | | | |

The MVP is approved for demo when all boxes in §9 are ticked and the three signatures above are recorded.

