---
title: Ethical wall — what happens when a query would cite a walled node?
type: question
status: open
tags: [v1, ethical-wall, retrieval, ux]
sources: [consilium-product-brief]
raised-on: [ethical-wall, attorney-client-privilege]
created: 2026-05-12
updated: 2026-05-12
---

# Ethical wall — what happens when a query would cite a walled node?

## Status

**Open** — awaiting team decision.

## Why it matters

The [[rag-query-pipeline]] retrieves top-k nodes by cosine similarity then expands 1 hop. If one of those nodes is walled off from the querying lawyer, the system has to decide between three behaviors — each with different UX, audit, and inference-leak properties: (see [[ethical-wall]], [[attorney-client-privilege]])

- **Refuse**: respond as if no node existed for this lawyer.
- **Redact-and-cite-anonymously**: include the insight, hide identifying details, log the suppression.
- **Silently drop**: filter the walled node out of context before synthesis; lawyer never sees it referenced.

Each choice has audit and inference-leak implications (e.g. silent drop is auditable but could leak "something exists here" via retrieval timing).

## What we know so far

- Walls are inherited from external conflicts systems (V2 spec).
- The retrieval pipeline currently has no filter step.
- No UX has been designed for the walled-cite case.

## What would resolve it

- A documented behavior (likely "silent drop, log denied read") with audit-log support.
- A UI affordance for the case where retrieval comes back empty after wall filtering.

## Answer

_(pending)_

## Related

- [[ethical-wall]]
- [[attorney-client-privilege]]
- [[rag-query-pipeline]]
- [[citation-grounding]]
