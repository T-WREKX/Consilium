---
title: DMS ingest — strategy and cost envelope for hundreds of thousands of documents?
type: question
status: open
tags: [v1, integration, scale, cost]
sources: [consilium-project-architecture, consilium-product-brief]
raised-on: [imanage, netdocuments]
created: 2026-05-12
updated: 2026-05-12
---

# DMS ingest — strategy and cost envelope for hundreds of thousands of documents?

## Status

**Open** — awaiting team decision.

## Why it matters

A typical mid-size firm has hundreds of thousands of documents in [[imanage]] or [[netdocuments]]. Naively running each through the [[auto-organization-pipeline]] = hundreds of thousands of Gemini Pro calls. At MVP-era pricing that's roughly $0.05–0.20 per doc → **$15K–$100K per firm just for the seed**, which probably exceeds first-year ACV. (see [[imanage]], [[netdocuments]])

## What we know so far

- V1 imports full DMS corpus to seed the team graph.
- No batching, filtering, or cost-modeling described.
- Acceptable seed quality is presumably "good enough to make retrieval useful on day one," not "every document processed."

## What would resolve it

- Decide a filtering strategy: only documents touched in last N years, only documents tagged as work product, only documents above a quality threshold.
- Decide a cheaper extraction path for bulk: Gemma in batch mode? Smaller/cheaper Gemini Flash? Embedding-only without entity extraction?
- Build a cost model per firm and check it fits within the ARR.

## Answer

_(pending)_

## Related

- [[imanage]]
- [[netdocuments]]
- [[auto-organization-pipeline]]
- [[v1-seed-strategy-at-firm-onboarding]]
- [[consilium-business-model]]
