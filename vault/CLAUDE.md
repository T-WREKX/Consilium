---
name: consilium-wiki-schema
description: Schema and conventions for the Consilium personal knowledge wiki, maintained using the LLM Wiki pattern. Read this file first in every session.
---

# Consilium Wiki — Schema and Conventions

This vault is a personal knowledge base maintained using the [LLM Wiki pattern](concepts/llm-wiki-pattern.md) (Karpathy, 2026). The human curates sources and asks questions; the LLM does all writing, cross-referencing, and bookkeeping. This file is the configuration that makes the LLM a disciplined wiki maintainer rather than a generic chatbot.

**Open this file at the start of every session.** Treat it as authoritative. When workflows or conventions evolve, update this file first, then propagate.

---

## 1. The three layers

1. **`raw/`** — source documents. Immutable. The LLM reads from `raw/` but never writes to it. This is the source of truth. If a source is updated, replace the file but never edit it in place; treat each version as a new source.
2. **The wiki** — everything else under `vault/`. Summaries, entity pages, concept pages, topic pages, the index, the log. The LLM owns this layer entirely.
3. **`CLAUDE.md`** — this file. Co-evolved by the human and the LLM as conventions mature.

---

## 2. Directory structure

```
vault/
├── CLAUDE.md                # This file
├── index.md                 # Content catalog (every page listed once)
├── log.md                   # Chronological append-only log
├── raw/                     # Immutable source documents
├── sources/                 # One summary page per source in raw/
├── entities/                # People, organizations, products, tools, roles
├── concepts/                # Ideas, patterns, doctrines, techniques
├── topics/                  # Synthesis pages spanning multiple sources
├── questions/               # Open questions for future investigation
└── templates/               # Templates for new pages
```

A page belongs to exactly one folder. If a page could plausibly live in two folders, pick the more specific one and link from the other.

- **Entity vs concept:** if it has a proper noun or a vendor/maintainer (Harvey, Gemini, Obsidian), it's an entity. If it's an idea or pattern (RAG, attorney-client privilege, force-directed layout), it's a concept.
- **Concept vs topic:** a concept is a single named idea; a topic synthesizes multiple sources into a comparative or thematic view.

---

## 3. Page conventions

### 3.1 Frontmatter (YAML)

Every page begins with frontmatter:

```yaml
---
title: Human-readable title
type: source | entity | concept | topic | question | index | log
status: stub | active | mature
tags: [tag1, tag2]
sources: [karpathy-llm-wiki-pattern, consilium-product-brief]   # source slugs cited
created: 2026-05-12
updated: 2026-05-12
---
```

- `sources:` is the list of `sources/<slug>` pages cited on this page. Keep it accurate — it powers cross-reference checks during lint.
- `status: stub` means the page exists as a link target but is mostly empty. `active` means there is real content. `mature` means it has been reviewed and is unlikely to change without new input.
- `created` and `updated` are ISO dates.

### 3.2 Filenames

- Kebab-case, no spaces, no punctuation other than hyphens.
- Match the slug in `sources:` and in `[[wikilinks]]`.
- Avoid renaming once a page is linked from elsewhere; if a rename is necessary, update every inbound link.

### 3.3 Linking

- Use `[[wikilinks]]` for every internal cross-reference. Obsidian resolves them automatically and the graph view depends on them.
- Use the slug only (no `.md`): `[[consilium]]`, not `[[entities/consilium.md]]`.
- Link liberally — a `[[name]]` that does not match an existing page is not an error; it marks a page worth writing later. Periodic lint converts those into stub pages.
- Cite sources inline with `(see [[karpathy-llm-wiki-pattern]])` at the end of the sentence or paragraph the claim came from.

### 3.4 Page body structure

A typical page has these sections, in order. Omit a section if empty rather than leaving a placeholder.

- **Lead** — one or two sentences defining the subject. The reader should know what this page is about without scrolling.
- **Key facts** — bullet list of the most important claims. Each bullet ends with a source citation.
- **Detail sections** — H2 headings as needed. Keep each section focused on one aspect.
- **Relations** — wikilinks to neighbors organized by relationship type (e.g., "Competes with," "Built on," "Cited by"). This is the substrate for the graph view.
- **Open questions** — bullet list of things this page does not yet answer. Link to `[[questions/...]]` pages where helpful.
- **Sources** — the canonical citation list, mirroring frontmatter `sources:`.

---

## 4. Workflows

### 4.1 Ingest — adding a new source

When the human drops a new file into `raw/` and asks to ingest it:

1. **Read** the full source. Discuss key takeaways with the human if interactive.
2. **Create** `sources/<slug>.md` from `templates/source.md`. Slug = kebab-cased filename without extension.
3. **Extract** entities, concepts, and notable topics. For each:
   - If the page exists, **update** it: add new claims, refine wording, flag contradictions explicitly, and append the new source slug to frontmatter `sources:`.
   - If it does not exist, **create** it from the matching template at `status: stub` or `active` depending on how much content is available.
4. **Update** `index.md`: add the new source under "Sources" and any newly created pages under their section.
5. **Update** `log.md`: append `## [YYYY-MM-DD] ingest | <Source Title>` followed by a one-paragraph summary of what was touched.
6. **Lint inbound**: scan pages that cite the new source; ensure any contradictions are surfaced with an explicit `> ⚠ Contradiction:` blockquote linking the conflicting source.

A single source typically touches 8–15 wiki pages. That is normal and good.

### 4.2 Query — answering a question against the wiki

1. **Read** `index.md` first to identify candidate pages.
2. **Read** the candidates. Cite every claim with a wikilink to the page (and through to its sources).
3. **If the answer is novel or synthetic**, offer to file it back into the wiki as a new `topics/<slug>.md` page. Good answers should not disappear into chat history.
4. **If a question cannot be answered from the wiki**, do not hallucinate. Either say so plainly or open a `questions/<slug>.md` page describing the gap.

### 4.3 Lint — periodic health check

Run when asked, or proactively after every ~10 ingests:

- **Orphans** — pages with no inbound links. List them and propose where to link them in.
- **Stubs** — pages still at `status: stub`. Decide: promote to active (fill in), demote to a link inside a parent page (delete the stub), or leave for later (note in log).
- **Contradictions** — pages where two sources make conflicting claims. Surface each as a `> ⚠ Contradiction:` block with both citations.
- **Stale claims** — pages whose newest source is older than a page that supersedes them. Suggest updates.
- **Missing cross-references** — pages that mention an entity or concept without linking to its page.
- **Dangling wikilinks** — `[[targets]]` with no file. Either create the stub or remove the link.
- **Index drift** — entries in `index.md` whose file no longer exists, or files not listed in `index.md`.
- **Frontmatter drift** — `sources:` lists that do not match the citations in the body.

Append a `## [YYYY-MM-DD] lint` entry to `log.md` summarizing what was fixed and what was deferred.

---

## 5. Indexing

`index.md` is **content-oriented**. It is the catalog. Organized by section: Sources, Entities, Concepts, Topics, Questions. Every page in the wiki appears exactly once. Each entry is a single line:

```
- [[slug]] — one-line summary
```

Update on every ingest and every lint. Keep entries sorted alphabetically within each section.

---

## 6. Logging

`log.md` is **chronological**, append-only. Each entry starts with a consistent prefix so the log is parseable:

```
## [YYYY-MM-DD] <op> | <Subject>
```

Where `<op>` is one of `ingest`, `query`, `lint`, `note`. Append the latest entry to the **top** of the log so the most recent activity is immediately visible. Body of an entry is 1–4 sentences describing what happened and what pages were touched.

---

## 7. Templates

See `templates/`. When creating a new page, copy from the matching template and fill in. Do not invent new page shapes ad hoc; if a recurring pattern emerges that the existing templates don't cover, propose a new template and update this file.

- `templates/source.md` — for `sources/`
- `templates/entity.md` — for `entities/`
- `templates/concept.md` — for `concepts/`
- `templates/topic.md` — for `topics/`
- `templates/question.md` — for `questions/`

---

## 8. Tone

Match the wiki's content tone to the source domain. For Consilium material that means: professional, precise, no marketing language, no emoji, no exclamation points. State facts; cite sources; flag uncertainty explicitly. (This matches the [[consilium-design-guidelines]] voice and tone rules, applied to the wiki itself.)

---

## 9. What this wiki is not

- **Not a chat log.** The conversation is ephemeral; the wiki is the artifact.
- **Not a verbatim copy of sources.** Summaries compress; entity pages synthesize across many sources; the raw is in `raw/` if the original wording matters.
- **Not exhaustive.** Coverage grows with curation. Gaps are surfaced via `questions/` and the lint workflow, not papered over.

---

## 10. Maintenance of this file

Treat `CLAUDE.md` as living configuration. When a workflow needs to change, change it here first, then propagate. When new page types or conventions emerge, document them here. Append a `## [YYYY-MM-DD] note | schema change` log entry whenever this file is meaningfully edited.
