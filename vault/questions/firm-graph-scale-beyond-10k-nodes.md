---
title: What is the V1 plan if a firm's team graph crosses 100k nodes?
type: question
status: open
tags: [architecture, scale, postgres, pgvector]
sources: [consilium-project-architecture]
raised-on: [postgres-pgvector, consilium-data-model, consilium-project-architecture]
created: 2026-05-12
updated: 2026-05-12
---

# What is the V1 plan if a firm's team graph crosses 100k nodes?

## Status

**Open** — awaiting team decision.

## Why it matters

The architecture's "Postgres relational + pgvector, no graph DB" choice is justified at MVP scale (<10k nodes). V1 firms backfilled from [[imanage]]/[[netdocuments]] DMS corpora will likely exceed 100k nodes. HNSW recall/latency, 1-hop expansion query plans, and the single-instance Postgres deployment all need a revisit at that scale. (see [[postgres-pgvector]], [[consilium-data-model]])

## What we know so far

- MVP scale assumption: under 10k nodes per firm.
- HNSW + cosine is fine in that range.
- Architecture explicitly notes "V1 can re-evaluate at scale."
- No threshold trigger is defined.

## What would resolve it

- A measured benchmark at 100k synthetic nodes on the V1 single-tenant deployment shape.
- A documented threshold (e.g. ">N nodes triggers index tuning / partition / move to dedicated vector store").
- An honest answer about whether a dedicated graph DB ([[consilium-rejected-ideas|Neo4j was rejected at MVP scale]]) is reconsidered at V1+ scale.

## Answer

_(pending)_

## Related

- [[postgres-pgvector]]
- [[consilium-data-model]]
- [[imanage]] — likely V1 source of large node counts
- [[netdocuments]] — same
