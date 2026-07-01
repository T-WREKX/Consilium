---
title: Does graph-augmented RAG generalize beyond Consilium's small team graph?
type: question
status: open
tags: [retrieval, rag, research]
sources: [consilium-project-architecture]
raised-on: [rag]
created: 2026-05-12
updated: 2026-05-12
---

# Does graph-augmented RAG generalize beyond Consilium's small team graph?

## Status

**Open** — awaiting team decision.

## Why it matters

[[rag-query-pipeline|Consilium's RAG]] does vector top-k followed by 1-hop graph expansion over typed edges. The choice is sensible at MVP scale (homogeneous schema, <10k nodes, narrow vertical) but the broader empirical question — *does graph augmentation reliably improve retrieval at production scale across diverse domains?* — is unresolved in the literature and in the docs. (see [[rag]], [[rag-query-pipeline]])

## What we know so far

- Graph augmentation pays off when relational structure carries semantic signal that pure embeddings flatten.
- Legal knowledge has strong relational structure (cases cite cases; matters involve parties).
- Whether the 1-hop expansion specifically improves Consilium's retrieval has not been measured.

## What would resolve it

- A small A/B benchmark: vector-only top-8 vs vector + 1-hop expansion, on a held-out evaluation set of seeded queries.
- Honest framing in the brief: "graph augmentation is a thesis; we'll validate at V1 scale."

## Answer

_(pending)_

## Related

- [[rag]]
- [[rag-query-pipeline]]
- [[knowledge-graph-extraction]]
