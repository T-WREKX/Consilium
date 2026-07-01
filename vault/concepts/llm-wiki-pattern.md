---
title: LLM Wiki pattern
type: concept
status: mature
tags: [pattern, knowledge-management, llm]
sources: [karpathy-llm-wiki-pattern]
created: 2026-05-12
updated: 2026-05-12
---

# LLM Wiki pattern

A pattern for building personal knowledge bases where the LLM incrementally builds and maintains a persistent, interlinked markdown wiki **between** the human and the raw sources — instead of re-deriving knowledge on every query (as standard [[rag|RAG]] does). The wiki is a compounding artifact; the LLM does all the bookkeeping; the human curates sources and asks questions.

## Definition

A knowledge-management pattern with three layers and three operations.

**Three layers:**

1. **Raw sources** — immutable. The LLM reads but never writes. Articles, papers, transcripts, gists.
2. **The wiki** — LLM-generated markdown files. Summaries, entity pages, concept pages, topic pages, an index, a log. The LLM owns this layer entirely.
3. **The schema** (`CLAUDE.md` / `AGENTS.md`) — configuration that turns the LLM into a disciplined maintainer rather than a generic chatbot.

**Three operations:**

1. **Ingest** — process a new source: read it, summarize it, update existing entity/concept pages, flag contradictions, append to the index and log.
2. **Query** — search the wiki for relevant pages, synthesize an answer with citations, and (when the answer is novel) file it back into the wiki.
3. **Lint** — periodic health check: contradictions, stale claims, orphans, missing cross-references, dangling links, frontmatter drift.

## Key claims

- **The wiki is persistent and compounding.** Cross-references already exist; contradictions are already flagged; synthesis already reflects everything read. (see [[karpathy-llm-wiki-pattern]])
- **The human never writes the wiki.** The LLM does. The human's job is to curate sources, direct the analysis, ask good questions, and think about what it all means.
- **The pattern works at moderate scale (~100 sources, hundreds of pages) without embedding-based RAG infrastructure.** An `index.md` catalog plus markdown links is enough.
- **Obsidian is the IDE; the LLM is the programmer; the wiki is the codebase.** Two-pane workflow: agent on one side, Obsidian on the other.
- **Why it works**: maintenance is the tedious part. Humans abandon wikis because maintenance grows faster than value. LLMs don't get bored, don't forget cross-refs, can touch 15 files in one pass. Maintenance cost approaches zero.
- The wiki is just a **git repo of markdown files** — version history, branching, collaboration come free.

## How it shows up in this vault

This vault **is** an instantiation of the pattern, applied to the Consilium product documentation set. See [[CLAUDE.md]] for the schema, [[index.md]] for the catalog, [[log.md]] for the chronological record.

## Contrast with adjacent concepts

- **Not the same as [[rag]]** — RAG retrieves at query time and forgets. The wiki pattern compiles once and keeps current. RAG over the wiki is fine; RAG over raw documents alone is the thing this pattern improves on.
- **Spiritually descends from [[memex]]** (Vannevar Bush, 1945) — private, curated, with associative trails. Bush couldn't solve "who does the maintenance"; the LLM solves it.
- **Different from a NotebookLM-style upload-and-query workflow** — those re-derive on every question.

## Scaling notes

- The source asserts "moderate scale (~100 sources, hundreds of pages)" works with index-only retrieval. Beyond that, **qmd** (local search engine for markdown with hybrid BM25/vector + LLM re-ranking, CLI + MCP server) is a reasonable next step. So is a custom vibe-coded search script.

## Use cases

- Personal: goals, health, psychology, self-improvement.
- Research: deep topic over weeks/months — papers, articles, reports with an evolving thesis.
- Reading a book: per-chapter ingests build a companion wiki (Tolkien-Gateway-style).
- Business/team: Slack threads, meeting transcripts, customer calls; humans in the loop reviewing updates.
- Competitive analysis, due diligence, trip planning, course notes, hobby deep-dives.

## Open questions

- How does this scale to a team (multiple humans curating into one wiki)?
- When does index-only retrieval stop being enough, in practice?
- What's the right balance between silent updates and explicit `> ⚠ Contradiction:` flags?

## Sources

- [[karpathy-llm-wiki-pattern]]
