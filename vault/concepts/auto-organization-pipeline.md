---
title: Auto-organization pipeline
type: concept
status: active
tags: [pipeline, ai, consilium, extraction]
sources: [consilium-product-requirements, consilium-project-architecture, consilium-implementation-plan]
created: 2026-05-12
updated: 2026-05-15
---

# Auto-organization pipeline

A **single structured-output [[gemini|Gemini Pro]] call** that returns extracted entities, a classification, and a privilege flag for a personal note. Sub-5-second latency budget. This is the "intelligent layer" that distinguishes Consilium from a generic note-taking app.

**Trigger model (revised 2026-05-15)**: the pipeline runs on **explicit user request** — the "Organize with Gemini" button in the [[consilium-capture-implementation|Organize panel]] — not on debounced auto-save. The earlier auto-trigger model produced surprising overwrites and burned API calls on incomplete drafts; the manual model gives the lawyer authorship over when the AI looks at a note. AudioCapture and ImageCapture continue to call the pipeline once on save (after their respective transcription / vision passes complete) since those flows have a clear "done" moment.

## Pipeline steps (single Gemini call returns all of this)

1. **Entity extraction** — identify named entities relevant to legal context. Eight exact types:

   | Type | When to use |
   |---|---|
   | `matter` | A case, lawsuit, or legal matter |
   | `party` | A client, opposing party, corporation, or individual involved in a matter |
   | `lawyer` | A specific attorney (firm lawyer or opposing counsel) |
   | `judge` | A specific judge or magistrate |
   | `witness` | An expert witness, fact witness, or deponent |
   | `concept` | A legal concept, doctrine, or legal principle |
   | `precedent` | A cited case or legal authority |
   | `statute` | A statute, regulation, or rule |

2. **Classification** — categorize the note by type (pick exactly one):
   - `strategy` — tactical or strategic decisions, approach notes
   - `observation` — observations about courts, judges, opposing counsel, proceedings
   - `lesson_learned` — post-matter retrospectives, what worked or did not work
   - `action_item` — tasks, follow-ups, deadlines
   - `research` — legal research findings, doctrine summaries
   - `meeting_summary` — notes from meetings, calls, or conferences

3. **Privilege flagging** — detect privileged content. Set `isPrivileged: true` if the note contains: direct attorney-client communications; work product (mental impressions, legal theories, litigation strategy); settlement discussions or negotiation positions; or internal case assessments or risk evaluations. **Conservative threshold: when in doubt, flag as privileged.** False positives are far preferable to false negatives in a law firm context. This governs the [[redaction-pipeline]] later during publish.

4. **Graph integration** (post-call, frontend) — create or update nodes for extracted entities in the personal graph; create edges from the note node to entity nodes.

## Implementation (as shipped — `apps/api/src/services/organize.ts`)

- **Model**: `gemini-2.5-pro`
- **SDK**: `@google/generative-ai` with `responseMimeType: 'application/json'` + typed `responseSchema`
- **System prompt**: `apps/api/src/prompts/organize.md`
- **Confidence threshold**: entities below **0.5** confidence are excluded
- **Max entities per note**: 0–10; do not force-extract if entities are not clearly present
- **Normalization**: canonical entity names (`"Judge Cruz"`, not `"the judge"`)
- **Route**: `POST /api/organize` — accepts note content (string), returns `{ entities, classification, isPrivileged }`; requires valid JWT
- **Reliability** (added 2026-05-15): wrapped in [[gemini-retry-backoff|withGeminiRetry]]. Default 3 attempts, 30 s per-attempt timeout, exponential backoff with full jitter. Transient 429/5xx hiccups no longer surface to the user as a 500.

## Frontend integration — the Organize panel

Surface: `apps/web/src/views/capture/OrganizePanel.tsx` (right rail on TextCapture, collapsible, state persisted to `localStorage` under `organize-panel-collapsed`). The pipeline call is gated to bodies of ≥20 characters and runs through `noteStore.applyAiOrganize(noteId, response)`, which delegates the merge to `apps/web/src/lib/organizeMerge.ts`.

**Provenance model.** Each of the three organize fields (entities, classification, privilege) carries a provenance flag: `'unset' | 'ai' | 'user'`. The merge rules:

| Current provenance | AI returns | Behavior |
|---|---|---|
| `unset` or `ai` | any value | Apply AI value; flip provenance to `ai`. |
| `user` | same value as user | No-op. |
| `user` | different value | **Do not overwrite.** Surface as inline `Suggested: X (Accept / Dismiss)` hint; user explicitly accepts to apply. |

**Entity merge.** Union by `${type}:${name.toLowerCase()}` key. User-added entities are preserved. AI-suggested entities the user has explicitly removed are tracked in `dismissedEntityKeys` and **filtered out of subsequent AI passes** before merge — so re-running organize does not silently re-add what the user just dismissed. The "×" remove button on an AI-provenance chip dismisses; on a user-provenance chip it simply deletes.

**User-overridable controls in the panel:**

- Classification dropdown (6 values) — flips provenance to `user` on change.
- Privilege checkbox — flips provenance to `user` on change.
- "+ Add entity" form — user-provenance entity, never displaced by AI.
- "× Remove" on any entity chip — drops the entity; AI-provenance entities are also added to `dismissedEntityKeys`.
- "+ Add link" → opens `LinkQuickPick`, inserts `[[Title]]` at cursor (see [[note-wikilinks]]).

**Revert button (added 2026-05-15)**: TextCapture snapshots the organize-relevant fields (`extractedEntities`, `classification`, `isPrivileged`, `organizeProvenance`, `dismissedEntityKeys`) **right before** every Gemini call. While that snapshot exists, the panel footer swaps the primary button from "Organize with Gemini" → **"Revert"** (Undo2 icon). Click restores all five fields atomically via `noteStore.restoreOrganizeSnapshot(noteId, snapshot)` and clears the snapshot. Switching to a different note clears the snapshot too. This gives the user a one-click undo for "I didn't want what Gemini just did" without per-field accept/reject choreography.

The panel footer displays the last-organized timestamp ("3 min ago") when no revert is available, and a disabled state below the 20-char threshold so the budget reason is visible.

## Acceptance criteria (per [[consilium-product-requirements]] §2.3)

- Pipeline runs within 5 seconds of trigger (acceptable demo latency).
- Extracted entities appear as **clickable chips** on the note.
- Personal graph updates to show new nodes and edges.
- Note is searchable by any extracted entity name.
- Lawyer can manually correct any extraction error (edit chips, add/remove entities). Satisfied via the Organize panel: per-field provenance + dismiss-and-don't-resurface behavior.

## Edge cases

- **Extraction failure (transient API error)**: [[gemini-retry-backoff|withGeminiRetry]] handles transient 429/5xx with exponential backoff before surfacing the error. Only after exhausted attempts does the error surface inline in the panel footer; "Organize with Gemini" can be re-clicked.
- **Duplicate entities** (same type + name): deduplicated by `type:name` key in both `organizeMerge.ts` and `graphUtils.ts`.
- **Low-confidence entities** (below 0.5): excluded entirely (not suggested).
- **User has edited fields manually before clicking organize**: AI value is held in suggestions, never silently overwrites — see provenance table above.
- **User regrets the AI pass after the fact**: one click on Revert restores the exact pre-call state (entities + classification + privilege + provenance + dismissed-keys), atomically.

## Why a single call

[[consilium-project-architecture]] specifies "single Gemini Pro call with a structured JSON output schema doing extraction + classification + privilege detection in one shot." Multiple round-trips would blow the 5-second budget.

## Deviation from spec — explicit trigger

[[consilium-product-requirements]] §2.3 reads "pipeline runs within 5 seconds **of save**." As shipped, TextCapture runs on **button press**, not auto-save. Rationale recorded in [[consilium-decision-history]]: auto-organize on debounced save (1) caused jarring overwrites mid-draft, (2) burned Gemini calls on incomplete content, and (3) implicitly fought the new provenance model (since "user-set" needed to defeat "ai-suggested"). The button is more honest about cost and authorship. AudioCapture and ImageCapture keep the on-save trigger because their inputs have a clear terminal moment (recording stop, file upload).

## Relation to other pipelines

- **Feeds** the personal graph view and the per-note chip UI.
- **Upstream of** the [[redaction-pipeline]] (which runs only when the lawyer clicks publish).
- **Distinct from** the [[rag-query-pipeline]] (which retrieves over the team graph at query time).

## Open questions

- Schema validation reliability of structured outputs across Gemini versions — fallback path when JSON validation fails. (see [[auto-organization-json-validation-fallback]])

## Sources

- [[consilium-product-requirements]]
- [[consilium-project-architecture]]
- [[consilium-implementation-plan]]
