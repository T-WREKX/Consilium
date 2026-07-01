---
title: What does the Practice Group Lead actually do in MVP?
type: question
status: answered
tags: [mvp, personas, demo]
sources: [consilium-product-requirements, consilium-product-brief]
raised-on: [practice-group-lead, consilium-product-requirements, consilium-context-dump]
created: 2026-05-12
updated: 2026-05-12
answered: 2026-05-12
---

# What does the Practice Group Lead actually do in MVP?

## Status

**Answered** (2026-05-12).

## Why it matters

The Lead account exists in the data model and is one of the three demo accounts, but the PRD says "same permissions as Lawyer" in MVP. If a judge asks "what's the difference between the Lawyer and the Lead in this demo?" the honest answer is "nothing functional yet." Either find a small but real MVP distinction or rehearse the honest answer so it lands as scope discipline rather than missing-feature. (see [[practice-group-lead]])

## What we know so far

- Three demo accounts: lawyer / lead / admin at [[acme-litigation-partners]].
- Lead permissions = Lawyer permissions in MVP.
- V1 adds "flag for promotion" affordance.
- Demo narrative does not currently switch to the Lead account.

## What would resolve it

- **Option A**: rehearse the "same as Lawyer in MVP, distinct in V1" answer as scope-discipline language.
- **Option B**: ship a small MVP differentiator (e.g. a "Lead's view" tab showing the team's recent published insights pre-seeded).
- **Option C**: drop the Lead account from the demo, keep only Lawyer and Admin role demonstrations.

## Answer

**Option A**: same access as Lawyer in MVP. No new MVP differentiator is built; the Lead role exists in the data model and gains its dashboard in V1.

**Rehearsed talk-track when judges ask "what does the Lead do?"**:

> *"In the MVP, the Lead has the same access as a lawyer — the role exists in our data model and gets its own dashboard in V1 where they flag insights for promotion to firm-wide. We chose to scope down so we could nail the privacy and retrieval moments."*

The line lands the answer as **scope discipline**, not as a missing feature. It also previews the V1 [[lead-flag-for-promotion-ui|flag-for-promotion]] surface naturally.

## Related

- [[practice-group-lead]]
- [[litigator]]
- [[knowledge-admin]]
- [[consilium-demo-narrative]]
