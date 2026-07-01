---
title: Force-directed graph
type: concept
status: active
tags: [visualization, ui, consilium]
sources: [consilium-product-requirements, consilium-design-guidelines, consilium-project-architecture]
created: 2026-05-12
updated: 2026-05-12
---

# Force-directed graph

The layout algorithm behind all three [[three-graph-views|graph views]] in [[consilium|Consilium]]. Nodes repel each other (Coulomb-like); edges pull connected nodes together (Hooke-like spring). The system settles into a configuration where related nodes cluster and unrelated nodes drift apart. Visually equivalent to [[obsidian|Obsidian]]'s graph view.

## Key parameters (per [[consilium-product-requirements]] §2.4)

- **Library**: [[cytoscape-js]] (chosen over D3 for performance at 100+ nodes).
- **Renders cleanly with 100+ nodes** (the demo seed will hit this).
- **Graceful degradation up to 500 nodes** — no performance regression in that range.
- **Layout settles within 2 seconds of load.**
- **No performance regression up to 500 nodes**; graceful degradation beyond.

## Interactivity

- **Zoom and pan**: mouse wheel + drag.
- **Node click**: opens the note (if note node) or filters graph to entity neighborhood (if entity node).
- **Node hover**: tooltip with title + 1-line summary; highlights connected edges.
- **Search**: filter graph by query; matching nodes remain colored, others fade to 20% opacity.

## Visual rules

- Nodes are 24px circles, scaling to 32px when selected.
- Fill color by node type (see [[node-color-coding]]).
- Stroke 1px `border-default` at rest, `text-primary` on hover, `accent-primary` when selected.
- Label below node, `ui-xs` size, `text-secondary` color.
- Hovered nodes get a soft glow via `drop-shadow`.

## Why force-directed (rather than tree or grid)

The team graph is **not hierarchical**. Insights link to many matters, many parties, many concepts; matters link to multiple lawyers, etc. A force-directed layout makes the **hub-and-spoke** structure visible: insights with many connections become visual hubs; orphans drift to the edges. This is also why graph traversal (1-hop expansion in [[rag-query-pipeline]]) returns useful neighbors — the visual structure matches the retrieval semantics.

## Out of scope (MVP)

Custom layouts, node grouping, clustering algorithms, manual node positioning. (see [[consilium-product-requirements]] §2.4)

## Sources

- [[consilium-product-requirements]]
- [[consilium-design-guidelines]]
- [[consilium-project-architecture]]
