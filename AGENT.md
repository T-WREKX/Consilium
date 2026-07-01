# AGENT.md — Consilium Agent Entry Point

**Read this file first.** It orients any AI agent working on the Consilium project — what Consilium is, where to find information, and how the knowledge is organized.

---

## What is Consilium?

Consilium is a privacy-first knowledge fabric for law firms. It captures individual lawyer expertise locally, governs its publication into a shared team knowledge graph with AI-assisted redaction, and makes the accumulated intelligence queryable via a citation-grounded chatbot. The target market is litigation practice groups at mid-size firms (50–300 lawyers).

**One-sentence pitch:** Consilium is the substrate that finally makes legal AI work — the privacy-architected knowledge layer that turns scattered firm expertise into a queryable, governable, pluggable intelligence layer.

---

## Project Knowledge Architecture

Consilium documentation is organized in two complementary systems:

### 1. `.agent/` — Specification Documents

The `.agent/` directory contains the canonical product and engineering specifications. These are the authoritative source for what Consilium is, what it does, and how it's built.

| File | Purpose | Read when... |
|---|---|---|
| [product-brief.md](.agent/product-brief.md) | Product vision, problem, market, competitive positioning, business model, demo narrative | You need to understand what Consilium is and why it exists |
| [product-requirements.md](.agent/product-requirements.md) | Full PRD: user roles, MVP feature specs, acceptance criteria, V1/V2 scope | You're building features or need to know exact requirements |
| [project-architecture.md](.agent/project-architecture.md) | System architecture, tech stack, data model, AI pipelines, API surface, deployment | You're making technical decisions or writing code |
| [design-guidelines.md](.agent/design-guidelines.md) | Brand personality, color system, typography, motion, component patterns, hero moments | You're working on UI/UX or frontend code |
| [context-dump.md](.agent/context-dump.md) | Complete decision history — why every choice was made, what was rejected and why | You need to understand rationale behind a decision, or are tempted to revisit a settled question |
| [llm-wiki-pattern.md](.agent/llm-wiki-pattern.md) | The LLM Wiki pattern (Karpathy) that the vault implements | You need to understand the vault's architecture |
| [consilium-vault-assistant.md](.agent/consilium-vault-assistant.md) | System prompt for a vault-grounded Q&A assistant | You want to answer questions strictly from vault content |
| [cognee-integration.md](.agent/cognee-integration.md) | Cognee memory lifecycle integration — HTTP sidecar, dual-write, session improve | You're working on remember/recall/improve/forget or Cognee infra |

**Scope tags** used throughout these documents:
- `[MVP]` — Must ship for the 6-day hackathon. No exceptions.
- `[V1]` — First paying customers, post-hackathon.
- `[V2]` — Mature product. Vision only.
- `[OUT]` — Explicitly out of scope.

### 2. `vault/` — LLM-Maintained Knowledge Wiki

The `vault/` directory is a structured, interlinked knowledge wiki maintained using the LLM Wiki pattern. It contains synthesized, cross-referenced knowledge derived from the specification documents.

**Start with:**
- [`vault/CLAUDE.md`](vault/CLAUDE.md) — Schema, conventions, and workflows for the wiki
- [`vault/index.md`](vault/index.md) — Complete catalog of every page in the wiki
- [`vault/log.md`](vault/log.md) — Chronological activity log

**Wiki directories:**

| Directory | Contents | Page count |
|---|---|---|
| `vault/sources/` | One summary page per source document ingested | 6 |
| `vault/entities/` | Named things: products, tools, companies, roles, personas | 26 |
| `vault/concepts/` | Atomic ideas, patterns, and techniques in Consilium context | 21 |
| `vault/topics/` | Broader synthesis pages spanning multiple sources | 15 |
| `vault/raw/` | Immutable source documents (do not modify) | 6 |
| `vault/templates/` | Page templates for creating new wiki entries | 5 |

**Wiki conventions:**
- Every page has YAML frontmatter (`title`, `type`, `status`, `tags`, `sources`, dates)
- Cross-references use `[[wikilinks]]` (Obsidian-compatible)
- Sources are cited inline
- The wiki is the LLM's layer — the LLM writes and maintains it; the human curates sources

---

## How to Navigate: Quick Reference

### "I need to understand what Consilium is"
→ Read [`.agent/product-brief.md`](.agent/product-brief.md)

### "I need to build a specific feature"
→ Read [`.agent/product-requirements.md`](.agent/product-requirements.md) for specs and acceptance criteria

### "I need to make a technical decision"
→ Read [`.agent/project-architecture.md`](.agent/project-architecture.md) for stack, data model, and pipelines

### "I need to work on the UI"
→ Read [`.agent/design-guidelines.md`](.agent/design-guidelines.md) for brand, colors, typography, and components

### "Why was X decided?"
→ Read [`.agent/context-dump.md`](.agent/context-dump.md) — especially the Decisions Index (§13) and Rejected Ideas Index (§14)

### "What's the current state of the knowledge base?"
→ Read [`vault/index.md`](vault/index.md) for the full catalog, then drill into specific pages

### "I want to look up a specific concept, entity, or topic"
→ Browse `vault/index.md` or search within `vault/concepts/`, `vault/entities/`, or `vault/topics/`

### "I want to answer a question strictly grounded in project knowledge"
→ Use the system prompt in [`.agent/consilium-vault-assistant.md`](.agent/consilium-vault-assistant.md) and follow its retrieval priority: `sources/` → `concepts/` → `entities/` → `topics/` → `questions/` → `raw/`

### "I'm integrating or debugging Cognee memory"
→ Read [`.agent/cognee-integration.md`](.agent/cognee-integration.md), [`.cursor/rules/cognee.md`](.cursor/rules/cognee.md), and the build journal in [`docs/build-journey/`](docs/build-journey/)

---

## Cognee integration

Consilium uses a **self-hosted Cognee Docker sidecar** for the hackathon memory lifecycle:

| Operation | When |
|---|---|
| `remember` | After governed publish (`POST /api/publish`) |
| `recall` | Knowledge-path chat retrieval (`retrieveContext` in `rag.ts`) |
| `improve` | Session end — `POST /api/chat/improve` or leaving chat view |
| `forget` | Node retraction — `DELETE /api/team-graph/nodes/:id` |

**Local setup:** `cd infra && cp cognee.env.example cognee.env` (set `LLM_API_KEY`), then `docker compose up -d cognee`. Smoke test: `.\scripts\cognee-smoke.ps1`.

Postgres remains the UI source of truth for Cytoscape and citations; Cognee is the hybrid graph-vector memory engine. See [`docs/build-journey/`](docs/build-journey/) for the implementation journal.

## Key Concepts (Quick Glossary)

| Term | Meaning |
|---|---|
| **Personal Brain** | Lawyer's local, private knowledge store (IndexedDB in MVP, markdown files in V1) |
| **Team Graph** | Governed, cloud-hosted knowledge graph populated from published personal notes |
| **Publish** | Moving a personal note to the team graph after AI-assisted redaction and lawyer approval |
| **Redaction Pipeline** | Two-pass MVP (Presidio PII tokenization + Gemini generalization); four-pass in V1 |
| **Query Overlay** | Signature visual: chat dims, team graph fades in, cited nodes pulse as response streams |
| **Pluggable Brain** | V1 MCP server endpoint allowing external AI tools to query the team graph |
| **Knowledge Admin** | Role that governs the team graph (exists in data model; admin dashboard ships in V1) |
| **Seed Data** | 15–30 pre-loaded fictional insights ensuring the demo works on day one |

---

## Developers

- **Abdul Hosain** — [github.com/T-WREKX](https://github.com/T-WREKX)
- **Hatif Osmani** — [github.com/hatif03](https://github.com/hatif03)
- **Azim Warsi** — [github.com/azimwarsii](https://github.com/azimwarsii)

---

## Rules for Agents

1. **Read before writing.** Check `.agent/` specs and `vault/` wiki before making assumptions.
2. **Respect scope tags.** Do not build `[V1]` or `[V2]` features unless explicitly asked.
3. **Check rejected ideas.** Before proposing something, scan `.agent/context-dump.md` §14 and `vault/topics/consilium-rejected-ideas.md` to ensure it hasn't already been considered and ruled out.
4. **Cite sources.** When answering questions about the project, reference the specific file where the information lives.
5. **Don't modify `vault/raw/`.** Source documents in `vault/raw/` are immutable.
6. **Follow design guidelines.** All UI work must follow `.agent/design-guidelines.md` — dark mode primary, amber/gold accents, no emoji in microcopy.
7. **Preserve documentation.** Do not remove or alter existing comments, docstrings, or documentation that are unrelated to your changes.
8. **Confirm scope before cross-cutting changes.** When a task touches multiple domains (capture, governance, retrieval), state which areas will be affected before making edits.
9. **Maintain a linear Git history.** Always rebase feature branches instead of merging `main` into them. Follow the Git Rebase Guide below to prevent merge commits and keep history clean.

---

## Git Rebase Guide

To prevent merge commits and maintain a strictly linear Git history during parallel AI-assisted development, follow this workflow when syncing with `main`:

### 1. Update your local main branch
```bash
git checkout main
git pull origin main
```

### 2. Rebase your feature branch onto main
```bash
git checkout <your-feature-branch>
git rebase main
```

### 3. Resolve conflicts if they arise
If two agents modified overlapping imports or shared contracts, Git will pause the rebase.
- Resolve the conflicts directly in your affected files.
- Stage the resolved files:
```bash
git add <resolved-file>
```
- Continue the rebase (do not commit):
```bash
git rebase --continue
```

### 4. Force-push to your remote feature branch
Because rebasing rewrites commit history, you must push with lease to update the remote branch safely:
```bash
git push origin <your-feature-branch> --force-with-lease
```
