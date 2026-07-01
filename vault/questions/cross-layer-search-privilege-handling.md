---
title: Cross-layer search (personal + team) — privilege handling?
type: question
status: open
tags: [v1, privilege, retrieval, search]
sources: [consilium-product-brief, consilium-product-requirements]
raised-on: [two-layer-architecture, attorney-client-privilege]
created: 2026-05-12
updated: 2026-05-12
---

# Cross-layer search (personal + team) — privilege handling?

## Status

**Open** — awaiting team decision.

## Why it matters

V1+ surface: **"search across personal + team graphs simultaneously"**. The personal layer holds [[attorney-client-privilege|privileged]] raw content; the team layer holds sanitized published insights. A unified search has to keep these populations distinct in the response — otherwise the system creates an inference channel where a query touching privileged content might leak its existence into a team-layer-only response. (see [[two-layer-architecture]])

## What we know so far

- V1+ feature, not MVP.
- Two layers have different privacy properties.
- The retrieval pipeline today is team-graph only.
- No unified-search design exists.

## What would resolve it

- Decide whether unified search keeps results visually segregated ("Your notes" vs "Firm knowledge") or interleaves them.
- Decide whether the personal-layer half goes through any sanitization before display in unified results (probably not, but worth deciding).
- Confirm that the cloud RAG endpoint **never** sees personal-layer content even in unified search — the personal half stays local.

## Answer

_(pending)_

## Related

- [[two-layer-architecture]]
- [[attorney-client-privilege]]
- [[rag-query-pipeline]]
- [[local-first-architecture]]
