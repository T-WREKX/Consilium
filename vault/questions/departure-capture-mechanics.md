---
title: Departure-capture — what does the offboarding extraction surface look like?
type: question
status: open
tags: [v1, adoption, offboarding]
sources: [consilium-context-dump]
raised-on: [adoption-strategy, consilium-context-dump]
created: 2026-05-12
updated: 2026-05-12
---

# Departure-capture — what does the offboarding extraction surface look like?

## Status

**Open** — awaiting team decision.

## Why it matters

The [[adoption-strategy]] hinges on **departure capture** as the *one mandatory exception* — the only place a firm-level mandate is robust because the lawyer's interests are aligned or neutral. But neither the PRD, architecture, nor design docs describe the actual surface: when does it run, what does it ask the departing lawyer to do, who supervises it, what gets published vs archived. (see [[adoption-strategy]])

## What we know so far

- Triggered by offboarding.
- Firm has legitimate interest and leverage.
- Lawyer has neutral or aligned interest (already chosen to leave).
- No mechanics designed.

## What would resolve it

- A flow design: triggered by HR offboarding event → AI generates "candidate knowledge to publish" from the personal graph → departing lawyer reviews and approves → KM Admin reviews → committed to team graph.
- Decide what happens to unapproved personal-graph content at departure (deleted? archived in a quarantined firm vault?).
- Confirm consent and labor-law fit (in some jurisdictions, knowledge extraction at departure is contractually fraught).

## Answer

_(pending)_

## Related

- [[adoption-strategy]]
- [[knowledge-admin]]
- [[consilium-v1-roadmap]]
