---
title: Hero moments
type: concept
status: active
tags: [design, demo, consilium]
sources: [consilium-design-guidelines, consilium-product-requirements]
created: 2026-05-12
updated: 2026-05-12
---

# Hero moments

The three UI surfaces in [[consilium|Consilium]] where design effort **must concentrate**. Per [[consilium-design-guidelines]] §8: *"These are the UI surfaces that must feel especially polished. Most design effort concentrates here."*

## The three

### 1. Publish flow with redaction

The most consequential surface. Makes legal AI legally defensible, and judges (and customers) need to **see** it working.

- Side-by-side diff modal: left pane original (read-only), right pane redacted (editable).
- Colored underlines per redaction (`accent-primary` for PII tokens; distinct softer hue for generalizations).
- Hovering a redaction in either pane highlights its match in the other pane with a **faint connecting curve**.
- [[insight-preservation-score]] bar at the top: 5 dots, green/amber/red by threshold.
- Publish disabled until score > 40% or lawyer manually edits.
- Disclosure: list of every redaction with type, original, replacement, reason.

See [[redaction-pipeline]] for the pipeline backing this surface.

### 2. Chat with citations

The retrieval payoff — where Consilium "stops looking like a notes app and becomes the firm's brain."

- Inline monospace `[1]` citation chips; click opens summary panel from the right.
- Streaming response with chips appearing as the segment streams.
- Confidence badge (green/amber/red pill) — High/Medium/Low.
- Sources section collapsed by default for High, expanded for Medium/Low.
- Refusal state fully designed — no fake sources, subtle suggestion to capture related personal note.

See [[citation-grounding]] for the discipline behind this surface.

### 3. Query-overlay graph animation

The signature visual moment. The thing judges remember.

- Chat dims to 30% within 150ms; full-screen overlay fades in with backdrop blur over 400ms.
- Team graph centroid aligned to viewport center, all nodes at 15% opacity.
- Cited nodes pulse to full opacity in waves — one per 150ms in rank order; edges illuminate to `accent-primary`.
- Hold ~1 second; fade overlay back over 600ms as response streams.

See [[query-overlay-animation]] for full choreography.

## Why three, not five or ten

The product surfaces — login, capture, personal graph, publish modal, team graph, chat — are roughly six. Three of them are signature; the rest are competent but not transformative. Design effort is finite at hackathon scale; concentrating on three is how the demo lands. (Out-of-scope-for-design list is in [[consilium-design-guidelines]] §12.)

## Sources

- [[consilium-design-guidelines]]
- [[consilium-product-requirements]]
