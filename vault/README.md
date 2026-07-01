---
title: README
type: index
status: active
updated: 2026-05-12
---

# Consilium Wiki

A personal knowledge base maintained using the [LLM Wiki pattern](concepts/llm-wiki-pattern.md). The human curates sources and asks questions; the LLM writes and maintains everything else.

## Start here

1. Read `CLAUDE.md` — the schema and workflows
2. Read `index.md` — the catalog of every page
3. Browse `sources/`, `entities/`, `concepts/`, `topics/`

## Working with this wiki

Open `vault/` as an Obsidian vault. The graph view shows the shape of the knowledge; wikilinks resolve automatically.

For LLM sessions (Claude Code or similar agent), `CLAUDE.md` is loaded first and tells the agent how to ingest sources, answer queries, and lint the wiki.

## Conventions in one paragraph

`raw/` is immutable source documents. Every other folder is LLM-maintained markdown. Each page begins with YAML frontmatter (title, type, status, tags, sources, dates). Cross-references use `[[wikilinks]]`. Sources are cited inline. The `index.md` catalog and the chronological `log.md` are updated on every ingest and lint.
