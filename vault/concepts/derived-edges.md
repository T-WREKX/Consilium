---
title: Derived edges (Obsidian-style connections)
type: concept
status: active
tags: [graph, retrieval, consilium, ui]
sources: [consilium-implementation-plan, consilium-seed-data-analysis]
created: 2026-05-14
updated: 2026-05-15
---

# Derived edges (Obsidian-style connections)

After explicit edges are written by the [[auto-organization-pipeline]] and the publish flow, [[consilium|Consilium]] computes a second tier of **derived edges** that surface latent connections in the team graph — analogous to Obsidian's automatic backlinks and unlinked-mention panes. All derived edges use `edge_type = 'related_to'` and are weighted on a 0–1 scale.

## The four phases

Implementation: `apps/api/src/seed/deriveEdges.ts` (commit `0ceced8`), called from `seed/seed.ts` after team-graph insertion.

| Phase | Signal | Threshold | Weight |
|---|---|---|---|
| **Phase 1** — shared-entity insight↔insight | Two insight nodes mention ≥2 of the same entity nodes | shared ≥ 2 | `min(shared / 3, 1.0)` |
| **Phase 2** — classification hub | Insight ↔ a synthetic "classification" hub node (one per classification value) | every insight | constant |
| **Phase 3** — embedding-similarity insight↔insight | Cosine similarity between insight embeddings | similarity > **0.80** | similarity (direct) |
| **Phase 4** — entity co-occurrence entity↔entity | Two entity nodes appear together in ≥2 insights | co-occurrence ≥ 2 | `min(cooccurrences / 4, 1.0)` |

Phase 3 explicitly **skips** any pair that Phase 1 already connected, to avoid duplicate `related_to` edges between the same insights.

## Phase 2 — classification hub nodes

A new synthetic node type **`classification`** (not in the original [[consilium-data-model|9-type taxonomy]]) is created, one per classification value: `strategy`, `observation`, `lesson_learned`, `action_item`, `research`, `meeting_summary`. Each insight gets an `about` edge to its classification hub. These nodes carry `isHub: true` in their data; the UI renders them as **diamond-shaped, muted-color nodes** so they read as structural scaffolding rather than content.

## Visual differentiation in graph views

Implemented in `apps/web/src/lib/graphUtils.ts` and the two graph views. Same treatment in both [[consilium-capture-implementation|personal]] and [[consilium-govern-implementation|team]] graphs:

| Edge type | Provenance | Style | Opacity | Width | Color |
|---|---|---|---|---|---|
| `linked_to` (author-stated wikilink) | **human** — see [[note-wikilinks]] | **solid** | **0.7** | **1.2** | **`#9d4edd` (insight purple)** |
| `mentions` (explicit, from auto-organize) | AI extraction | solid | 0.35 | 0.75 | `#21262d` |
| `related_to` (Phases 1, 3, 4) | derived | dashed `[4, 3]` | 0.25 | 0.50 | `#30363d` |
| `about` (Phase 2 hub) | derived | dotted | 0.15 | 0.40 | `#21262d` |

Strict hierarchy: **author-stated > AI-extracted > AI-derived > scaffolding**. `linked_to` (the wikilink edge, added 2026-05-15 alongside this concept — not itself a *derived* edge but shares the visual layer) is the loudest because it's the only edge a human explicitly authored. `about` is the quietest because it's pure structural scaffolding. On node hover, connected edges brighten to opacity 0.6 — borrowed from Obsidian's neighbor-highlight pattern.

## Why it exists

The explicit edge set ([[knowledge-graph-extraction|extraction]] + manual publish links) is *correct but sparse*. A team graph with only explicit edges shows individual insights but not the latent **clusters of topical relatedness** that make the graph feel like a brain. Derived edges convert the embedding space and the entity-mention matrix into visible connective tissue without polluting the canonical `mentions` / `involves` / `cites` semantic edges.

## When derived edges run

- **At seed time** — `deriveAllEdges()` runs after `team_graph_nodes` is fully populated.
- **At publish time** — not yet; new published nodes do not retroactively re-run derivation. This is a known gap for V1 (the derivation is a single SQL pass over the whole table and could be incrementalized).

## Weight semantics

All weights normalize to 0–1 so the same column means the same thing across phases. Phase 1 caps at 3 shared entities (any more does not increase the weight further) on the assumption that 3 shared entities is already a strong signal. Phase 4 caps at 4 co-occurrences with the same reasoning. Phase 3 uses similarity directly because >0.80 is itself a high-confidence threshold.

## Relations

- **Builds on**: [[postgres-pgvector]] (`<=>` cosine operator), [[knowledge-graph-extraction]] (the explicit edges this overlays)
- **Used by**: [[consilium-retrieval-implementation]] (visible in team graph), [[consilium-capture-implementation]] (visible in personal graph)
- **Distinct from**: [[rag-query-pipeline|RAG 1-hop expansion]] — the RAG pipeline walks edges at query time using explicit + derived together; the derivation here is a write-time precomputation
- **Visualized in**: [[cytoscape-js]] with style-tier differentiation

## Open questions

- **Incremental derivation at publish time** — the seed-time approach is fine for the demo but won't scale to V1 firm onboarding where insights stream in.
- **Edge pruning** — at firm scale, Phase 4 could fan out arbitrarily; needs a cap or a periodic vacuum.

## Sources

- [[consilium-implementation-plan]]
- [[consilium-seed-data-analysis]]
