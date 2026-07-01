---
title: Demo — what if judges ask a different question than the seeded canonical one?
type: question
status: answered
tags: [mvp, demo, hackathon, risk]
sources: [consilium-product-requirements]
raised-on: [consilium-product-requirements, consilium-demo-narrative]
created: 2026-05-12
updated: 2026-05-12
answered: 2026-05-12
---

# Demo — what if judges ask a different question than the seeded canonical one?

## Status

**Answered** (2026-05-12).

## Why it matters

The canonical demo query — *"What has our firm learned about cross-examining expert witnesses on damages calculations?"* — is what the seed data is designed to answer. If a judge interrupts with a different query, the refusal path triggers ("I don't have firm knowledge that directly addresses this"). The refusal is **designed**, but if it triggers unexpectedly mid-demo without rehearsal, it reads as a failure rather than a feature. (see [[consilium-demo-narrative]], [[citation-grounding]])

## What we know so far

- The canonical query MUST work.
- Refusal is the designed off-script behavior.
- Acceptance criteria require testing refusal "during demo prep."
- No rehearsed talk-track exists for when refusal triggers live.

## What would resolve it

- A rehearsed one-sentence response to off-script queries: *"Notice what just happened — when our firm hasn't captured knowledge on a topic, the system refuses rather than hallucinating. That's the privilege guarantee made visible."*
- A small library of 2–3 alternate seeded queries that also work, in case a judge happens to ask one.
- An explicit "we are about to trigger a refusal — watch for it" segment in the demo if Q&A goes there.

## Answer

Three-part approach:

### 1. Rehearsed refusal talk-track

When refusal triggers — whether deliberately or by accident — say this:

> *"Watch what happens when we ask something the firm hasn't captured knowledge about — the system refuses rather than fabricating. That's the privilege guarantee made visible. A lawyer would never want a hallucinated answer they might cite in a brief."*

### 2. Backup query library

Seed the team-managed KQ such that **2–3 additional questions beyond the canonical one** also produce strong cited answers. This gives headroom if a judge happens to ask off-script and that question happens to match one of the backups. Choose backups that hit different parts of the seeded corpus (judge tendencies, motion practice, settlement) so coverage is broad.

### 3. Explicit refusal segment in the demo

Trigger a refusal **on purpose** during the demo. ~15 seconds. Show it as a feature, not as a failure. This converts the refusal path from a risk into a deliberate beat in the narrative.

### Related seed-strategy decision (side-bar)

The MVP team-managed KQ is **pre-seeded with Philippine laws, articles, and previous cases**, so the firm brain delivers useful answers from day one. This matches [[adoption-strategy]] Pillar 2 ("firm brain has to deliver useful answers from day one — pre-seeded with public legal knowledge"). The decision also partially answers [[v1-seed-strategy-at-firm-onboarding]] for the MVP-demo scope; the V1-customer-onboarding strategy (DMS backfill via [[imanage]]/[[netdocuments]]) is still the canonical path for real firms.

## Related

- [[consilium-demo-narrative]]
- [[citation-grounding]]
- [[rag-query-pipeline]]
- [[hackathon-judging-fit]]
