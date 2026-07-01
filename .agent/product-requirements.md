# Consilium · Product Requirements Document

**Document type:** Product Requirements Document (PRD)
**Audience:** Engineering, design, product
**Status:** v1 · Hackathon stage
**Companion documents:** `product-brief.md`, `project-architecture.md`, `design-guidelines.md`

---

## How to read this document

Every feature in this PRD is tagged with a scope marker:

- **[MVP]** — must ship for the 6-day hackathon. No exceptions.
- **[V1]** — first paying customers, post-hackathon. Document scope, do not build now.
- **[V2]** — mature product. Document for vision only.
- **[OUT]** — explicitly out of scope, even for V1. Listed so engineers don't speculatively build.

**If a feature is not tagged [MVP], do not build it for the hackathon.** The MVP is the demo. The demo wins or loses the hackathon. Anything beyond MVP is scope creep.

---

## 1. Users and Roles

### 1.1 Personas

**Persona 1 · The Litigator (primary user)**
A 4–8 year litigation associate or senior associate at a mid-size firm (50–300 lawyers). Bills 1,900+ hours annually. Works across 4–6 active matters. Cares about: efficient prep for repeat scenarios (similar matter types, same opposing counsel), better recall of past reasoning, faster ramp-up on inherited matters. Resistant to anything that adds documentation friction without clear personal payoff.

**Persona 2 · The Practice Group Lead (validator)**
A partner leading the litigation practice group. Cares about: team productivity, associate development, knowledge retention, competitive differentiation in the firm's litigation offering. Approves what becomes "firm-endorsed" knowledge in V1. In MVP, this role exists in the data model but has the same permissions as Lawyer (no admin dashboard yet).

**Persona 3 · The Knowledge Admin (V1 buyer-aligned)**
The KM Partner or KM Director. Cares about: governance, audit, knowledge quality, demonstrating ROI to firm leadership. **[V1]** Will approve published insights, curate the team graph, and own analytics. **[MVP]** Role exists; admin dashboard does not (published knowledge auto-flows to team graph).

### 1.2 Role Definitions

| Role | MVP Permissions | V1 Permissions |
|---|---|---|
| **Lawyer** | Capture personal notes; view personal graph; publish to team graph (auto-approved); query team brain; view team graph structure (read-only) | Same as MVP, but publishing requires Knowledge Admin approval |
| **Practice Group Lead** | Same as Lawyer | Same as Lawyer + ability to flag insights for promotion |
| **Knowledge Admin** | Same as Lawyer | Approve/reject publications; edit and remove team graph nodes; access admin dashboard; manage team membership; view audit logs |

---

## 2. Hackathon MVP Feature Specification

### 2.1 Authentication and Tenancy [MVP]

**Scope:** username + password auth against a pre-seeded user database. Three demo accounts.

**Pre-seeded accounts:**
- `litigator@acme.law` / `demo` — role: Lawyer
- `lead@acme.law` / `demo` — role: Practice Group Lead
- `admin@acme.law` / `demo` — role: Knowledge Admin

**Tenancy:** single hard-coded firm (`Acme Litigation Partners`) with one practice group (`Commercial Litigation`). No firm signup flow. No tenant management UI.

**Session handling:** JWT-based session, 24-hour expiry. No password reset. No MFA.

**Acceptance criteria:**
- Each account can log in with the seeded credentials
- Logged-in user sees role-appropriate UI elements
- Logout returns to login screen
- Switching accounts demonstrates the role differences cleanly during the demo

**Out of MVP:** signup flow, password reset, MFA, SSO, multi-firm support, organization settings.

---

### 2.2 Personal Note Capture [MVP]

#### 2.2.1 Text capture

A lawyer can create a text note. A clean editor with title and body. Optional manual tags. Auto-save on every keystroke (debounced 500ms).

**Acceptance criteria:**
- New note button visible on the personal graph view and from the main nav
- Editor opens with focus on title field
- Body supports basic formatting (bold, italic, lists, headings) via markdown shortcuts
- Note auto-saves and persists in IndexedDB
- After save, note is processed by the AI organization pipeline (section 2.3)

#### 2.2.2 Audio capture

A lawyer can record audio via the browser's MediaRecorder API. Audio is transcribed via Whisper (see Architecture). The transcript becomes the body of a new note; the audio file is retained alongside.

**Acceptance criteria:**
- Record button visible on capture screen
- Recording shows duration counter and waveform indicator
- Stop button finalizes recording and triggers transcription
- Transcribed text is editable before save
- Original audio is stored in IndexedDB (Blob) and accessible from the note

**Constraints:**
- Maximum recording duration: 5 minutes (MVP demo simplification)
- Audio format: WebM/Opus (browser default)
- Transcription happens via Whisper API call (not on-device for MVP; sold as "local-first architecture" with on-device promised for V1)

#### 2.2.3 Image capture

A lawyer can upload an image. Gemini Vision extracts text content (whiteboards, handwritten notes, exhibits, diagrams) and generates a structured interpretation as note body.

**Acceptance criteria:**
- Image upload button accepts PNG, JPG, WebP up to 10MB
- Uploaded image preview shown in capture screen
- Gemini Vision call produces extracted text and a brief structural description
- Result is editable as a text note before save
- Original image stored in IndexedDB and displayed inline in the note

**Out of MVP:** browser extension capture, calendar integration, email forward capture, mobile native capture.

---

### 2.3 AI Auto-Organization Pipeline [MVP]

After any note is saved, the system runs the AI organization pipeline. This is the "intelligent layer" that distinguishes Consilium from generic note-taking.

**Pipeline steps:**

1. **Entity extraction (Gemini Pro):** identify named entities relevant to legal context:
   - Matters (case names, matter numbers)
   - Parties (clients, opposing parties)
   - Lawyers (firm lawyers, opposing counsel, judges)
   - Witnesses (expert and fact)
   - Legal concepts (claims, defenses, motion types, doctrines)
   - Statutes and precedents (with citation parsing)

2. **Classification:** categorize the note by type:
   - Strategy note
   - Observation (about person/process)
   - Lesson learned
   - Action item
   - Research finding
   - Meeting summary

3. **Graph integration:** create or update nodes for extracted entities in the personal graph; create edges from the note node to entity nodes; suggest edges to existing notes that share entities.

4. **Sensitivity flagging:** detect privileged content patterns and tag the note as `privileged: true` if any pass triggers. This flag governs the redaction pipeline during publish (section 2.5).

**Acceptance criteria:**
- Pipeline runs within 5 seconds of save (acceptable demo latency)
- Extracted entities appear as clickable chips on the note
- Personal graph updates to show new nodes and edges
- Note is searchable by any extracted entity name
- Lawyer can manually correct any extraction error (edit chips, add/remove entities)

**Edge cases:**
- If entity extraction fails (API error), note is saved without enrichment; retry button visible
- Duplicate entities (same name, different casing) are merged at the graph level
- Entities below confidence threshold (0.6) are suggested but not auto-added

---

### 2.4 Personal Graph View [MVP]

The lawyer's primary navigation surface. Obsidian-style force-directed graph of all their personal notes and extracted entities.

**Specification:**

- **Layout:** force-directed (D3 or Cytoscape.js implementation). Nodes repel; edges attract.
- **Node types and colors:** see Design Guidelines, section on node color coding.
- **Node click:** opens the note (if note node) or filters graph to entity neighborhood (if entity node).
- **Node hover:** shows tooltip with title and 1-line summary; highlights connected edges.
- **Zoom and pan:** mouse wheel and drag.
- **Search:** filter graph by query; matching nodes remain colored, others fade to 20% opacity.
- **Empty state:** if no notes yet, show large "Capture your first note" CTA centered.

**Acceptance criteria:**
- Renders cleanly with 100+ nodes (demo seed will hit this)
- All nodes clickable; click action correct for type
- Search filter works in real time
- Layout settles within 2 seconds of load
- No performance regression up to 500 nodes (graceful degradation beyond)

**Out of MVP:** custom layouts, node grouping, clustering algorithms, manual node positioning.

---

### 2.5 Publish Flow with AI-Assisted Redaction [MVP]

**This is the wow moment of the demo. It must be visually polished.**

#### 2.5.1 Trigger

From any personal note, a "Publish to team graph" button is visible. Clicking it opens the redaction preview modal.

#### 2.5.2 Redaction pipeline (two-pass MVP)

**Pass 1 — Microsoft Presidio (regex + NER):** detects and tokenizes:
- Person names → `[PERSON_A]`, `[PERSON_B]` (consistent within a note)
- Organizations → `[ORG_A]`
- Monetary amounts → `[AMOUNT]`
- Dates → `[DATE]` (or `[DATE_OFFSET_FROM_FILING]` if a filing date is detected)
- Email addresses, phone numbers, addresses → respective tokens

**Pass 2 — Gemini Pro generalization:** reads the tokenized note and rewrites specific facts to legal-principle level. Example:
- *Input:* "Our client's 2019 acquisition of a competitor in the medical device space"
- *Output:* "An acquisition of a horizontal competitor in a regulated industry"

The system prompt for Pass 2 instructs Gemini to preserve strategic insight while generalizing specifics.

#### 2.5.3 Side-by-side diff UI

The redaction preview modal shows:
- **Left pane:** original note (read-only)
- **Right pane:** redacted version (editable text)
- **Highlights:** each redaction is visually marked on both sides with matching colors and connecting lines on hover
- **Per-redaction controls:** accept (default), modify (inline edit), or reject (restore original)
- **Insight preservation indicator:** a single confidence score (0–100%) shown at the top, computed by a follow-up Gemini call evaluating whether the sanitized version retains the strategic point. Below 60% triggers a yellow warning; below 40% triggers a red warning. (This replaces the explicit "Pass 4" preservation check from the full V1 pipeline.)

#### 2.5.4 Approval

The lawyer reviews and clicks "Publish." The sanitized version is committed to the team graph; the original stays only in the lawyer's personal storage. Confirmation toast: *"Published. 12 colleagues can now see this insight."*

**Acceptance criteria:**
- Modal opens within 3 seconds of clicking publish
- Both passes complete and render within 5 seconds total
- Every redaction is visible and reversible
- Lawyer can edit the sanitized version freely before publishing
- After publish, the new insight node appears in the team graph
- Lawyer's personal graph shows the original note tagged with a "published" indicator

**MVP simplification:** the **Knowledge Admin approval step is skipped**. Published knowledge auto-flows to the team graph. The Knowledge Admin role still exists in the data model; the admin dashboard is documented in V1 (section 4.1).

**Out of MVP:** four-pass full pipeline (privilege detection, identifier scrubbing, generalization, preservation), Knowledge Admin approval workflow, supervisor escalation rules, configurable redaction policies per firm.

---

### 2.6 Team Graph View [MVP]

A read-only structural view of the team-managed knowledge graph available to all team members.

**Specification:**

- **Layout:** identical force-directed style to personal graph (same visual language; see Design Guidelines).
- **Node click behavior in MVP:** opens a brief summary panel showing the insight title, type, and contributor attribution. **Full node detail is not clickable for non-admin users** (this distinction matters in V1 when the Knowledge Admin alone has full clickability; MVP simulates this by showing summary only).
- **Empty state:** "No published insights yet. Be the first to publish."
- **Search and filter:** same controls as personal graph.

**Acceptance criteria:**
- Renders the seeded team graph (15–30 nodes minimum) on load
- All nodes display correctly with color coding
- Click on a node opens summary panel (not full note)
- Available to all three role accounts

---

### 2.7 Chat with Team Brain [MVP]

**The retrieval moment of the demo. Must be polished.**

#### 2.7.1 Interface

A chat screen accessible from main nav. Standard messaging UI: input at bottom, message history above. User messages right-aligned; AI responses left-aligned with citations.

#### 2.7.2 Query handling

When the user submits a query, the system:

1. Embeds the query and retrieves top-k (default: 8) most relevant nodes from the team graph using a combination of vector similarity (pgvector) and graph traversal (1-hop expansion from top vector hits to include connected context).

2. **Trigger the query-overlay graph animation:**
   - Chat window dims to 30% opacity and disables interaction
   - Full-screen overlay fades in showing the team graph at center
   - Retrieved nodes pulse to maximum brightness; their connecting edges illuminate
   - Other nodes and edges fade to 15% opacity
   - Overlay holds for 1.5 seconds while context loads

3. Sends retrieved context to Gemini Pro with the query and a system prompt enforcing:
   - Ground every claim in the provided context
   - Cite every claim with a node ID
   - If no relevant context, respond: *"I don't have enough firm knowledge to answer this confidently."*
   - Output structured response with inline citations

4. As Gemini streams the response, the overlay graph **gradually fades out** while the chat window comes back into focus, with the response streaming in. Cited node IDs in the response are clickable chips that open the summary panel for that node.

#### 2.7.3 Citation rendering

- Inline citations appear as superscript chips: *"Our firm has successfully argued similar fact patterns under Rule 403 [1] in three previous matters [2,3]."*
- Citations resolve to clickable summary panels
- A "Sources" section at the bottom of the response lists all cited nodes with one-line summaries

#### 2.7.4 Confidence and refusal

Each response carries a confidence indicator (high/medium/low) based on:
- Number of source nodes retrieved above similarity threshold (0.75)
- Coherence of retrieved context (heuristic on vector spread)

Low confidence + sources: response is given with a clear caveat.
No sources above threshold: response refuses to answer rather than hallucinate. Example refusal: *"I don't have firm knowledge that directly addresses this. You may want to capture your own thinking on this topic as a starting point."*

**Acceptance criteria:**
- Query submission triggers overlay within 500ms
- Overlay pulse animation runs smoothly at 60fps
- Retrieved nodes are correctly identified and highlighted
- Streaming response begins within 3 seconds of query submission
- Citations are clickable and resolve to correct nodes
- Refusal triggers correctly when no sources match
- Confidence indicator visibly differs across high/medium/low cases (test all three during demo prep)

**Out of MVP:** multi-turn conversation memory beyond current session, response export, query history persistence, feedback thumbs up/down (this is a useful V1 telemetry feature).

---

### 2.8 Seed Data [MVP]

**Without seed data the demo fails.** The retrieval moment requires accumulated knowledge to retrieve from.

The team graph must be pre-seeded with:

- **15–30 published insights** representative of litigation knowledge, covering:
  - Judge tendencies (3–5 insights about judge behavior, scheduling, ruling patterns)
  - Opposing counsel patterns (2–3 insights about firms or individual lawyers)
  - Motion practice (3–5 insights on motion strategy, e.g., motions in limine, summary judgment patterns)
  - Expert witness handling (2–3 insights on cross-examination strategies)
  - Settlement dynamics (2–3 insights on negotiation patterns)
  - Procedural lessons (2–3 insights on local rules, court protocols)

- **Entity nodes** referenced by those insights (matters, parties, judges, statutes, etc.) — generated as a byproduct.

- **The Lawyer account** should additionally have **5–8 personal notes pre-seeded** showing the personal graph populated rather than empty on first login.

Seed content is written as fictional but realistic. Avoid recognizable real cases or real lawyer names.

**Acceptance criteria:**
- Seed data is created via a deterministic seed script run during deployment
- All three demo accounts can log in and see appropriate populated state
- At least one specific seeded query is known to produce a strong demo response: *"What has our firm learned about cross-examining expert witnesses on damages calculations?"* — this query MUST work for the demo

---

## 3. Out of MVP Scope · Explicit "Do Not Build" List

The following are not in MVP. If you have time for them, you have time you should be using on polish for MVP features.

- Knowledge Admin approval dashboard (V1)
- Supervisor escalation workflows (V1)
- Browser extension (V1)
- Calendar integration (V1)
- Email forward capture (V1)
- Mobile native apps (V1)
- True on-device LLM inference (V1)
- True local filesystem storage of markdown files (V1)
- SSO / SAML / OIDC (V1)
- iManage / NetDocuments integration (V1)
- MCP server endpoint (V1 — document as architecture, don't build)
- Multi-firm tenancy (V1)
- Audit log UI (V1)
- Per-user access logs (V1)
- Promotion from team to firm-wide graph (collapsed into single team layer; no firm-wide layer exists)
- Ethical wall enforcement (V1+)
- Real-time collaboration on notes (OUT)
- Built-in document drafting (OUT — we integrate with drafting tools, don't build one)
- Time tracking and billing (OUT)
- Conflict checking automation (OUT)
- Client portals (OUT)
- Court filing integration (OUT)

---

## 4. V1 Specification (Documented, Not Built for Hackathon)

### 4.1 Knowledge Admin Approval Workflow [V1]

When a lawyer publishes, the redacted version enters a queue visible to Knowledge Admins. Admin dashboard shows: pending approvals (count badge), each item with original (with privilege markers), redacted version, contributor, timestamp. Admin can approve (commits to team graph), reject (returns to lawyer with optional comment), or edit-and-approve.

### 4.2 Four-Pass Redaction Pipeline [V1]

- Pass 1: Privileged content detection (fine-tuned legal model + Presidio)
- Pass 2: Client identifier scrubbing (current MVP Pass 1)
- Pass 3: Generalization (current MVP Pass 2)
- Pass 4: Preservation check (dedicated LLM call evaluating insight retention)

### 4.3 True Local-First Architecture [V1]

Native desktop and mobile apps with markdown file storage on device. Gemma model runs on-device for entity extraction and basic classification. Only sanitized content reaches the cloud.

### 4.4 Integrations [V1]

| Integration | Purpose | V1 Priority |
|---|---|---|
| iManage / NetDocuments | Read firm document corpus to seed team graph | Critical |
| Microsoft 365 / Google Workspace | Calendar prompts, email forward, identity (SSO) | Critical |
| Slack / Teams | Capture from messages, notifications | Important |
| Zoom / Teams meetings | Meeting transcript ingestion | Important |
| Harvey / CoCounsel / Spellbook | Outbound: query team graph via MCP server for firm-specific grounding | Important |
| Westlaw / LexisNexis | Browser extension for research capture | Nice-to-have |
| PracticePanther / Clio | Practice management matter context | V2 |

### 4.5 Audit and Compliance [V1]

- Every read/write of team graph logged with user, timestamp, action
- 7-year audit log retention (legal industry standard)
- Per-user access log: any lawyer can see who has viewed their published insights
- Admin compliance dashboard for ethics reviews
- SOC 2 Type II in progress at V1 launch
- ABA Formal Opinion 477R compliance baseline

### 4.6 MCP Server [V1]

External AI tools authenticate via OAuth 2.0 with scoped tokens. Schema is proprietary but documented, exposing:
- `query(question, max_results)` — natural language query, returns ranked nodes with citations
- `get_node(id)` — fetch node detail and connected nodes
- `list_topics()` — surface topical clusters

Rate limits configurable per firm. Full SDK and public docs ship at V1.

---

## 5. Success Metrics

### 5.1 User-level metrics [V1+]

- Team-managed KQ queries per lawyer per week
- Query satisfaction (thumbs up/down on responses)
- Cross-matter insight reuse: count of queries where the AI cites an insight from a different matter than the user's current active matter (tracked via matter-association on user session)
- Time saved per onboarding (vs. baseline, self-reported)

### 5.2 Firm-level metrics [V1+]

- Adoption rate: % of practice group lawyers active weekly
- Knowledge coverage: % of active matters with at least one captured insight
- Time-to-productivity for new associates (vs. firm's historical baseline)
- Knowledge retention impact: correlation with departures (longitudinal)

### 5.3 Hackathon demo metrics [MVP]

- All three demo accounts log in successfully
- All three intake methods (text, audio, image) demonstrably produce structured notes
- Personal graph renders with 5+ pre-seeded nodes
- Publish flow completes end-to-end in under 30 seconds (clock-able on stage)
- The known seeded query *"What has our firm learned about cross-examining expert witnesses on damages calculations?"* produces a coherent, cited response in under 10 seconds
- Query-overlay graph animation runs smoothly without dropped frames

---

## 6. Demo Script (5 minutes)

**0:00–0:30 — Setup.** Brief framing: legal AI is blocked by privilege; firms lose billions to knowledge loss; Consilium is the privacy-architected knowledge fabric.

**0:30–1:30 — Capture moment.** Logged in as Lawyer. Open capture screen. Record a 30-second audio note about a deposition observation. Audio transcribes. AI auto-organizes; entities appear as chips. Personal graph updates live.

**1:30–3:00 — Publish moment.** From the new note, click "Publish to team graph." Redaction modal opens. Show the side-by-side diff with redactions visibly applied. Walk through one or two redactions. Approve. Confirmation toast.

**3:00–4:30 — Retrieval moment (the climax).** Switch accounts to a second lawyer (logout/login is acceptable for MVP; account switcher would be cleaner). Open chat. Submit the seeded query about cross-examining expert witnesses. **The chat dims. The team graph fades in at center. Cited nodes pulse and light up. The graph fades back as the streaming response begins. Citations are clickable.**

**4:30–5:00 — Close.** Frame what just happened: privacy-protected capture, governed publishing, citation-grounded retrieval with visible reasoning. Mention V1: native apps, on-device AI, MCP integration with the rest of the legal AI stack.

---

## 7. Acceptance Criteria Summary (Hackathon "Done")

The MVP is considered done when all of the following are true:

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
- [ ] The demo script (section 6) can be executed end-to-end without errors in under 5 minutes
