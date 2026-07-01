---
title: Adoption strategy (two pillars + exception + reinforcing dynamic)
type: concept
status: active
tags: [adoption, behavior, consilium]
sources: [consilium-context-dump]
created: 2026-05-12
updated: 2026-05-12
---

# Adoption strategy

How [[consilium|Consilium]] expects to get adopted within a law firm. The current canonical model is **two pillars + one mandatory exception + one reinforcing dynamic** — replacing an earlier five-layer model that included coercive mechanisms.

## The current model

### Pillar 1 — Personal Utility (the foundation)

The personal brain has to be useful **for the lawyer's own work, independent of any firm benefit**.

> If a lawyer wouldn't use Consilium even if the firm brain didn't exist, the product has failed. (see [[consilium-context-dump]])

Translation: every feature that asks the lawyer to do work must pay them back within their own personal-graph experience. Capture pays back in retrieval ("it remembered"). Auto-organization pays back in personal navigability.

### Pillar 2 — Friction-Free Publishing (the mechanism)

Once they're using the personal brain, **publishing has to be so easy that the question becomes "why would I not?"**

- AI suggests publishable insights with sanitization already done.
- One tap to approve.
- The [[redaction-pipeline]] removes the privilege concern *before* the lawyer is asked to decide.
- The [[insight-preservation-score]] tells the lawyer at a glance whether the published version still says what they meant.

### The one mandatory exception — Departure Capture

When a lawyer leaves, structured knowledge extraction is part of offboarding. **The firm has legitimate interest and leverage; the lawyer has neutral or aligned interest** (they've already chosen to leave).

- This is the **only place** mandates work; everywhere else they backfire.
- Mechanics are V1+; not specified in MVP.

### The reinforcing dynamic — Experienced Reciprocity

When a lawyer queries the firm brain and gets a useful answer, they trust it more and want to contribute back. **Wikipedia-style / Stack-Overflow-style natural reciprocity.**

- **Precondition**: the firm brain has to deliver useful answers from day one. Pre-seeded with public legal knowledge, anonymized industry patterns, existing firm KM content.
- The [[consilium-mvp-scope|MVP seed]] (15–30 published insights) is the demo-scale version of this.

## What was rejected

The earlier five-layer model included:

1. Personal Utility ✓ (kept as Pillar 1)
2. **Reciprocity Gates** — "can't query firm brain without contributing." **Rejected**: punishes new hires, feels coercive, creates gaming behavior.
3. **Career Capital** — attribution, citations, performance review integration. *Soft and slow*; doesn't carry the strategy.
4. **Firm-Level Mandates** — matter-closing memos, structured contribution policies. **Rejected** in the broad form: only works if leadership commits, and only departure-capture is robust.
5. Compounding Defaults ✓ (good tech, absorbed into Pillar 2)

The cleaner model is what shipped to the docs. (see [[consilium-rejected-ideas]])

## Why this matters

A common KM failure mode is "we built the system; why won't anyone use it?" The most rigorous version of that question is: *"Why would someone working at a firm freely provide knowledge to a firm-managed knowledge graph for free?"* If the answer is "because we made them," adoption will fail. If the answer is "because the personal brain is useful and publishing is one tap and the firm brain returns useful answers," adoption can compound.

## Open questions

- **Departure-capture mechanics** — what does the offboarding extraction surface actually look like? Not designed.
- **Pre-seeding strategy at firm onboarding** — for V1, do firms get the same 15–30 demo insights, a public-legal-corpus seed, an [[imanage]]/[[netdocuments]] backfill, or all three?
- **Performance-review integration** is mentioned as part of the rejected layer 3 but reappears as a soft consideration. Does it ever ship?

## Sources

- [[consilium-context-dump]]
