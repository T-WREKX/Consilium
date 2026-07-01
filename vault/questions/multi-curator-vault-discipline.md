---
title: How does the LLM-wiki pattern scale to a team of curators?
type: question
status: open
tags: [vault-meta, llm-wiki-pattern, knowledge-management]
sources: [karpathy-llm-wiki-pattern]
raised-on: [obsidian, llm-wiki-pattern, karpathy-llm-wiki-pattern]
created: 2026-05-12
updated: 2026-05-12
---

# How does the LLM-wiki pattern scale to a team of curators?

## Status

**Open** — awaiting team decision.

## Why it matters

Karpathy's [[llm-wiki-pattern|gist]] is written for a single human + single agent collaborating on one vault. The pattern's bookkeeping discipline (index, log, lint workflows) assumes a single source of truth. Multiple humans curating sources into the same vault introduces merge conflicts in `index.md` and `log.md`, contradictory edits to entity pages, and questions about who arbitrates a contradiction. (see [[obsidian]], [[llm-wiki-pattern]])

## What we know so far

- The pattern is described as personal.
- The Consilium-product equivalent (team graph) is a different artifact with different governance.
- This vault is single-curator today.

## What would resolve it

- Decide if this vault ever needs multiple curators (probably no; it's the team's vault).
- If yes: define a branching/merging discipline, a contradiction-arbitration rule, and a way for the log to absorb concurrent writes (per-curator log files? distinct entry prefixes?).
- Note this as future work for the Karpathy pattern itself.

## Answer

_(pending)_

## Related

- [[obsidian]]
- [[llm-wiki-pattern]]
- [[karpathy-llm-wiki-pattern]]
