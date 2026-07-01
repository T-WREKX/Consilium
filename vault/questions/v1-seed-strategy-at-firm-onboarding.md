---
title: V1 — how is a new firm's team graph seeded on day one?
type: question
status: partially-answered
tags: [v1, onboarding, seed, adoption]
sources: [consilium-product-brief, consilium-product-requirements, consilium-context-dump]
raised-on: [adoption-strategy]
created: 2026-05-12
updated: 2026-05-12
partially-answered: 2026-05-12
---

# V1 — how is a new firm's team graph seeded on day one?

## Status

**Partially answered** (2026-05-12) — MVP seed strategy is resolved; V1 customer-onboarding strategy is still open.

## Why it matters

The [[adoption-strategy]] requires that **"the firm brain has to deliver useful answers from day one"** — otherwise the reinforcing-reciprocity dynamic never starts. The hackathon MVP seeds with 15–30 fictional published insights, but that approach doesn't scale to a real firm. Without a defined onboarding-seed strategy, V1 customers face an empty team graph and the retrieval surface produces refusals until enough captures accumulate. (see [[adoption-strategy]])

## What we know so far

- MVP: 15–30 fictional seeded insights, hand-written.
- V1 [[imanage]] / [[netdocuments]] integration is listed as "Critical" inbound for seeding the team graph from the firm's existing corpus.
- Open question whether public-legal-corpus or anonymized-industry-pattern seeds are also part of the strategy.

## What would resolve it

- Decide on the V1 onboarding-seed package: DMS backfill (primary), public-legal-corpus (secondary), anonymized cross-firm patterns ([[consilium-v2-vision|V2]]).
- Define a "minimum viable seed volume" before the firm goes live with internal users.
- Decide whether seed-generation runs as a one-off ETL or a continuous sync.

## Answer

### MVP scope (answered)

The MVP team-managed KQ is **pre-seeded with Philippine laws, articles, and previous cases**, so the firm brain delivers useful answers from day one. This is **public legal knowledge**, not firm-specific work product, and matches [[adoption-strategy]] Pillar 2 explicitly ("pre-seeded with public legal knowledge"). The PH corpus also implicitly answers what jurisdiction the demo firm [[acme-litigation-partners]] operates in. (see [[demo-off-script-query-handling]], [[acme-litigation-partners]])

### V1 customer-onboarding scope (still open)

For real V1 customers, the canonical inbound path is the **[[imanage]]/[[netdocuments]] DMS backfill** (V1 Critical integration). Still unresolved:

- Whether the public-legal-corpus seed (the MVP path) also ships as a "starter pack" to bridge firms during DMS integration setup.
- Minimum viable seed volume before the firm goes live with internal users.
- Whether seed-generation runs as a one-off ETL or a continuous sync.
- Cost envelope of running every DMS document through the [[auto-organization-pipeline]] — see [[dms-ingest-volume-strategy]].

## Related

- [[adoption-strategy]]
- [[imanage]]
- [[netdocuments]]
- [[consilium-v1-roadmap]]
