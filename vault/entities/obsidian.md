---
title: Obsidian
type: entity
status: active
tags: [tool, knowledge-management, markdown, ide]
sources: [karpathy-llm-wiki-pattern, consilium-design-guidelines]
created: 2026-05-12
updated: 2026-05-12
---

# Obsidian

A markdown-first personal-knowledge-management application. A vault is a directory of plain `.md` files with `[[wikilinks]]` between them; Obsidian renders the resulting graph, indexes the content, and supports a plugin ecosystem.

## Key facts

- **In the [[llm-wiki-pattern]]**: Obsidian is the "IDE." The LLM is the programmer; the wiki is the codebase. The human browses, follows links, checks the graph view; the LLM writes. (see [[karpathy-llm-wiki-pattern]])
- **Graph view**: the canonical way to see the shape of a wiki — what's connected to what, which pages are hubs, which are orphans.
- **Web Clipper**: browser extension that converts web articles to markdown. Lets the human get sources into `raw/` quickly.
- **Image download hotkey**: `Settings → Files and links → Attachment folder path = raw/assets/`, then bind "Download attachments for current file" to `Ctrl+Shift+D`. After clipping, hit the hotkey and all images land on disk so the LLM can view them directly.
- **Useful plugins**: **Marp** (markdown slide decks), **Dataview** (queries over page frontmatter — works because this vault uses YAML frontmatter).
- **The vault is just a git repo** of markdown files. Version history, branching, collaboration come free.

## In Consilium (product reference)

[[consilium-design-guidelines]] lists Obsidian as one of three brand reference points — specifically for "the graph aesthetic that is central to Consilium." [[consilium|Consilium]]'s personal graph view borrows the Obsidian force-directed look and behavior.

## Relations

- **Hosts (literally)**: this vault
- **Reference for**: [[consilium]] personal graph UX
- **Adjacent tool**: qmd (local search engine over markdown files with BM25/vector + LLM re-ranking; both CLI and MCP server)
- **Adjacent products in different category**: [[notion]] (heavier, team-default, hosted), Roam (graph + outliner)

## Open questions

- For team use of an Obsidian vault, what's the conflict resolution discipline? Karpathy's gist doesn't address multi-curator vaults.

## Sources

- [[karpathy-llm-wiki-pattern]]
- [[consilium-design-guidelines]]
