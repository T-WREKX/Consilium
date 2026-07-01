---
title: Redaction pipeline
type: concept
status: active
tags: [pipeline, privacy, consilium, ai]
sources: [consilium-product-requirements, consilium-project-architecture, consilium-design-guidelines, consilium-implementation-plan]
created: 2026-05-12
updated: 2026-05-14
---

# Redaction pipeline

The mechanism that enforces the [[two-layer-architecture]] boundary. When a lawyer clicks "Publish to team graph," the redaction pipeline runs **before** any content reaches Layer 2. **Two-pass at MVP, four-pass at V1.** This surface is the "**wow moment of the demo**" — it must be visually polished. (see [[consilium-product-requirements]])

## Definition (MVP — two passes)

**Pass 1 — [[microsoft-presidio|Microsoft Presidio]] (regex + NER):** detects and tokenizes:

- Person names → `[PERSON_A]`, `[PERSON_B]` (consistent within a note)
- Organizations → `[ORG_A]`
- Monetary amounts → `[AMOUNT]`
- Dates → `[DATE]` (or `[DATE_OFFSET_FROM_FILING]` if a filing date is detected)
- Email addresses, phone numbers, addresses → respective tokens

**Pass 2 — [[gemini|Gemini Pro]] generalization:** reads the tokenized note and rewrites specific facts to legal-principle level. Example:

> *Input:* "Our client's 2019 acquisition of a competitor in the medical device space"
> *Output:* "An acquisition of a horizontal competitor in a regulated industry"

The system prompt instructs Gemini to **preserve strategic insight while generalizing specifics**.

**Plus — [[insight-preservation-score]]**: a single Gemini Flash call returns a 0–100 confidence score evaluating whether the sanitized version retains the strategic point. This replaces the explicit "Pass 4" preservation check from the full V1 pipeline.

## Implementation (as shipped — `apps/api/src/services/redaction.ts`)

- **Presidio endpoints**: analyzer at `:5001`, anonymizer at `:5002` (env-overridable via `PRESIDIO_ANALYZER_URL` / `PRESIDIO_ANONYMIZER_URL`)
- **Docker images**: `mcr.microsoft.com/presidio-analyzer:latest`, `mcr.microsoft.com/presidio-anonymizer:latest`
- **Pass 1 sequence**: `POST /analyze` → `POST /anonymize`
- **Pass 2 model**: `gemini-2.5-pro`, system prompt at `apps/api/src/prompts/redact.md`
- **Preservation score model**: `gemini-2.5-flash`, system prompt at `prompts/preserve.md`, output `{ score: 0–100, reason }`, **fallback `50` on JSON parse error**
- **Embedding for publish**: `text-embedding-004` (768 dim)
- **Routes**: `POST /api/redact` (input `{ content }` max 50,000 chars) and `POST /api/publish` (writes sanitized body to `team_graph_nodes`); both require JWT + rate limit
- **Presidio failure fallback**: regex-based, three patterns only — `[A-Z][a-z]+ [A-Z][a-z]+` → `[PERSON]`, an email pattern → `[EMAIL]`, a phone pattern → `[PHONE]`. The fine-grained token vocabulary above (`[PERSON_A]`, `[ORG_A]`, `[AMOUNT]`, `[DATE]`, `[DATE_OFFSET_FROM_FILING]`) is the **Presidio-driven** path; the fallback collapses to a coarser set if Presidio is unreachable.

See [[consilium-govern-implementation]] for the full breakdown.

## Definition (V1 — four passes)

1. **Privileged content detection** — fine-tuned legal model + Presidio
2. **Client identifier scrubbing** (current MVP Pass 1)
3. **Generalization** (current MVP Pass 2)
4. **Preservation check** — dedicated LLM call evaluating insight retention

## The side-by-side diff UI

The modal shows:

- **Left pane**: original note (read-only) with highlighted redaction spans
- **Right pane**: redacted version, `contentEditable`, free-form edits supported
- **Highlights**: type-coded (`PII` vs `GENERALIZATION`) underline + background color
- **Per-redaction controls**: a "Details" accordion below the diff lists each redaction with a **Restore / Re-apply** toggle. Toggling rebuilds the sanitized text from `(original, redactions, rejectedSet)`. Free-form "modify" is supported via direct edits to the right pane (no inline per-redaction edit affordance).
- **[[insight-preservation-score|Insight preservation indicator]]**: **5 dots, color-coded** (High ≥60 green, Medium 40–59 orange, Low <40 red), with percentage displayed beside. Publish gated by `confidence > 40 || hasManualEdit || hasRejections`.

> ⚠ Deviation from spec — partially closed: per-redaction **reject** is implemented (Restore / Re-apply) and per-redaction **modify** is reached via free-form edits to the right pane; there is no inline modify affordance. Connecting curves between original/redacted spans on hover are **not implemented** — the match is shown via shared color coding only. The 0–100% bar in the original spec became a 5-dot indicator in implementation. The remaining deviations are intentional cost trims, not regressions.

See [[hero-moments]] §1 for the full design spec.

## The redaction map

The data structure returned to the frontend is an array of:

```ts
{ original: string, replacement: string, type: 'PII' | 'GENERALIZATION', position: [start, end] }
```

The frontend uses it to render highlights with hover-linked pairs.

## Approval

The lawyer reviews and clicks "Publish." The sanitized version commits to the team graph; the original stays only in the lawyer's personal storage. Confirmation toast: *"Published. 12 colleagues can now see this insight."*

**MVP simplification**: the [[knowledge-admin|Knowledge Admin]] approval step is **skipped** in MVP. Published knowledge auto-flows to the team graph. V1 adds the admin approval queue.

## Risks and fallbacks (per [[consilium-project-architecture]] §11)

- **Pass 2 generalization quality** is the most likely thing to slip. Fallback: ship Pass 1 only with a manual-review UI.

## Why "the wow moment"

[[attorney-client-privilege|Privilege]] is invisible to the eye — until you watch it being enforced in real time. The side-by-side diff makes the privacy guarantee **legible** to lawyers, KM partners, and hackathon judges in one screen.

## Contrast with adjacent concepts

- **Not the same as standard DLP (data loss prevention)** — Consilium preserves the *insight* and generalizes the *specifics*, which DLP does not.
- **Distinct from anonymization for analytics** — Consilium's goal is to publish useful knowledge, not to release a statistical dataset.

## Sources

- [[consilium-product-requirements]]
- [[consilium-project-architecture]]
- [[consilium-design-guidelines]]
- [[consilium-implementation-plan]]
