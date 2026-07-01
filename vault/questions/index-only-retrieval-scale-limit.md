---
title: When does index-only retrieval stop being enough for this vault?
type: question
status: open
tags: [vault-meta, llm-wiki-pattern, scale]
sources: [karpathy-llm-wiki-pattern]
raised-on: [llm-wiki-pattern, karpathy-llm-wiki-pattern]
created: 2026-05-12
updated: 2026-05-12
---

# When does index-only retrieval stop being enough for this vault?

## Status

**Open** — awaiting team decision.

## Why it matters

The [[llm-wiki-pattern|pattern]] asserts that index-only retrieval (reading `index.md` first to find candidate pages, then drilling in) works at "~100 sources, hundreds of pages." This vault has 6 sources and ~80 pages today. The threshold matters because once it's crossed, the agent needs a proper search tool (qmd, pgvector, or vibe-coded) and the workflow changes. (see [[llm-wiki-pattern]])

## What we know so far

- Karpathy's heuristic: ~100 sources, hundreds of pages.
- This vault: 6 sources, ~80 pages.
- Plenty of headroom; not a near-term concern.

## What would resolve it

- A pragmatic trigger: "when index.md exceeds ~200 entries OR when the agent's response time on a query becomes noticeable, install qmd."
- Note the threshold and revisit when it's hit.

## Answer

_(pending)_

## Related

- [[llm-wiki-pattern]]
- [[karpathy-llm-wiki-pattern]]
- [[CLAUDE.md]]
