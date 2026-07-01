---
title: Contradiction handling — explicit ⚠ flags or silent merge?
type: question
status: open
tags: [vault-meta, llm-wiki-pattern, workflow]
sources: [karpathy-llm-wiki-pattern]
raised-on: [llm-wiki-pattern, karpathy-llm-wiki-pattern]
created: 2026-05-12
updated: 2026-05-12
---

# Contradiction handling — explicit ⚠ flags or silent merge?

## Status

**Open** — awaiting team decision.

## Why it matters

When a new source disagrees with an existing claim, the wiki maintainer has to decide: surface the contradiction with a `> ⚠ Contradiction:` blockquote (visible, auditable, requires resolution) or silently update the page to match the newer source (clean, but loses the history of what changed and why). The current [[CLAUDE.md]] schema encodes explicit flagging, but the bar for what counts as "a contradiction" is fuzzy. (see [[llm-wiki-pattern]])

## What we know so far

- Current convention: `> ⚠ Contradiction:` blockquotes for explicit flags.
- A handful exist in the vault already (local-first marketing vs MVP reality; single-tenant V1 framing).
- Bar for "what counts as a contradiction" is fuzzy.

## What would resolve it

- Define a rule: a contradiction is flagged when (a) two sources make conflicting factual claims about the same thing, OR (b) a newer source supersedes an older one in a way that future readers need to know about. Otherwise: silent update.
- Add this rule to [[CLAUDE.md]] §4.3 (lint).

## Answer

_(pending)_

## Related

- [[llm-wiki-pattern]]
- [[karpathy-llm-wiki-pattern]]
- [[CLAUDE.md]]
