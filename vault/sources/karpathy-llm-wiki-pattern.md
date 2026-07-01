---
title: LLM Wiki — Andrej Karpathy
type: source
status: mature
tags: [pattern, knowledge-management, llm, methodology]
raw: raw/llm-wiki-pattern.md
author: Andrej Karpathy
publication: Personal gist / idea file
published: unknown
ingested: 2026-05-12
created: 2026-05-12
updated: 2026-05-12
---

# LLM Wiki — Andrej Karpathy

> Source file: [`raw/llm-wiki-pattern.md`](../raw/llm-wiki-pattern.md)

## One-line summary

A pattern for building a persistent, compounding personal knowledge base where the LLM continuously maintains an interlinked markdown wiki between the human and the raw sources, rather than re-deriving knowledge on every query as in standard RAG.

## Why it's here

This is the foundational source for this vault. The vault itself is an instantiation of the pattern described here, applied to the Consilium product documentation set.

## Key claims

- **Most LLM+document workflows are RAG**: retrieve at query time, generate, forget. Nothing accumulates.
- The wiki pattern is different: the LLM **incrementally builds and maintains** a structured, interlinked markdown wiki. Knowledge is compiled once and kept current, not re-derived on every query.
- The wiki is a **persistent, compounding artifact** — cross-references already exist, contradictions are already flagged, synthesis already reflects everything read.
- **The human never writes the wiki**; the LLM does. The human curates sources, explores, asks questions. The LLM does the summarizing, cross-referencing, filing, bookkeeping.
- **Three layers**: raw sources (immutable), the wiki (LLM-owned markdown), the schema (CLAUDE.md / AGENTS.md — the configuration that turns the LLM into a disciplined maintainer).
- **Three operations**: ingest (process a new source into the wiki), query (answer questions; file good answers back), lint (health-check for contradictions, stale claims, orphans, gaps).
- **Two special files**: `index.md` (content-oriented catalog) and `log.md` (chronological, append-only with a parseable prefix).
- The pattern works at moderate scale (~100 sources, hundreds of pages) **without embedding-based RAG infrastructure** — the index plus markdown links is enough.
- **Obsidian is the IDE**, the LLM is the programmer, the wiki is the codebase.
- Use cases: personal life tracking, deep research, reading a book (Tolkien-Gateway-style companion wiki), business/team wikis fed by Slack and meetings, competitive analysis, due diligence, course notes.
- **Why this works**: humans abandon wikis because maintenance cost grows faster than value. LLMs don't get bored, don't forget cross-refs, and can touch 15 files in one pass. Maintenance cost approaches zero.
- Spiritually descends from Vannevar Bush's **[[memex]]** (1945) — private, curated, with associative trails between documents. Bush couldn't solve "who does the maintenance"; the LLM solves it.

## Sections / structure of the source

1. Core idea (contrast with RAG)
2. Architecture (three layers)
3. Operations (ingest, query, lint)
4. Indexing and logging (`index.md` vs `log.md`)
5. Optional: CLI tools (qmd)
6. Tips and tricks (Obsidian Web Clipper, image download, graph view, Marp, Dataview, git)
7. Why this works (maintenance burden argument)
8. Memex connection
9. Note (the document is intentionally abstract)

## Pages this source materially changed

- [[llm-wiki-pattern]] — created as the canonical concept page
- [[memex]] — created with historical lineage
- [[rag]] — created with contrast framing
- [[obsidian]] — created as the IDE for this pattern
- [[CLAUDE.md]] (the vault schema) — instantiated from the architecture section
- [[index.md]] and [[log.md]] — instantiated from §4 of the source

## Contradictions or tensions

None internal to the source. The source is deliberately abstract ("describes the idea, not a specific implementation") so the only tension is between the abstract pattern and any concrete instantiation. That tension is resolved here by the [[CLAUDE.md]] schema, which fixes the conventions for this specific vault.

## Open questions raised

- At what wiki size does index-only retrieval stop working and proper search (qmd / pgvector) become necessary? The source says "~100 sources, hundreds of pages" works.
- How aggressively should the LLM flag contradictions vs. silently update? The source recommends explicit flagging; this vault encodes that as `> ⚠ Contradiction:` blockquotes.
- How does this scale to a team (multiple humans curating into one wiki)?

## Related

- [[llm-wiki-pattern]] — the concept page distilled from this source
- [[memex]] — historical precursor
- [[rag]] — the pattern this is differentiated against
- [[obsidian]] — the recommended browser/IDE
