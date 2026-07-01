---
title: Cytoscape.js
type: entity
status: active
tags: [library, visualization, frontend]
sources: [consilium-project-architecture, consilium-product-requirements]
created: 2026-05-12
updated: 2026-05-12
---

# Cytoscape.js

JavaScript graph theory library for visualization and analysis. Chosen over D3 for the [[consilium|Consilium]] MVP because it has better out-of-the-box performance for 100+ nodes and a built-in force-directed layout.

## Key facts

- **Why chosen**: "Better performance than D3 for 100+ nodes; force-directed built-in." (see [[consilium-project-architecture]])
- **Renderer**: **canvas** (default). Chosen over WebGL for MVP because canvas is well-trodden, sufficient for the node-count budget, and lower-risk for the 60fps overlay animation than swapping renderers mid-build. Revisit at V1 if a firm graph grows beyond a few thousand nodes. (see [[cytoscape-webgl-vs-canvas]])
- **Layout algorithm**: **`cose`** (Compound Spring Embedder) on the team graph; **`cola`** continuous force-directed physics on the personal graph (post-polish, commit `1c836dd`) — `infinite: true`, `animate: true`, `nodeSpacing: 25`, `edgeLength: 120`. The personal graph also dropped the `react-cytoscapejs` wrapper in favor of constructing the `cytoscape` instance directly inside a `useEffect`, so hover + neighbor highlighting and tap-to-open are wired with raw `cy.on(...)` handlers. (see [[force-directed-graph]])
- **Hover + neighbor highlight** (personal graph): on `mouseover` of a node, the node expands 14→18px and connected edges brighten from 0.35 to 0.6 opacity; reset on `mouseout` unless the node is selected. Borrowed from Obsidian's neighbor-highlight pattern.
- **Classification hub nodes** (`isHub: true`, type `classification`): diamond-shaped, muted-color, uppercase 10px font, `background-opacity: 0.4`, `shadow-opacity: 0.3`, `shadow-blur: 8` — read as structural scaffolding rather than content. (see [[derived-edges]])
- **Zoom control**: both graph views own a persistent [[graph-zoom-control|GraphZoomControl]] widget (bottom-right, 20–150% range, fit-to-view reset). Wheel-zoom is clamped to the same bounds via `cy.minZoom` / `cy.maxZoom`. Adaptive label visibility: entity labels suppress below 75% of base zoom.
- **Used in**: personal graph view (`views/graph/PersonalGraphView.tsx`) and team graph view; underlies the [[query-overlay-animation|query-overlay graph]].
- **Performance budget**: clean rendering at 100+ nodes (the demo seed will hit this), graceful degradation up to 500. Layout settles within 2 seconds of load.
- **Render style**: see [[node-color-coding]] for the strict palette rules.
- **Lazy-loaded**: Cytoscape.js loads only when the user navigates to a graph view. (see [[react-vite-bundle-size-budget]])

## Component pattern

Per [[consilium-design-guidelines]], graph node visual is a 24px circle (32px when selected), fill by node type, 1px `border-default` at rest, `text-primary` on hover, `accent-primary` when selected, soft drop-shadow on hover. Label below node, `ui-xs` size, `text-secondary` color.

## Relations

- **Used by**: [[consilium]] (personal graph, team graph, query overlay)
- **Underlies**: [[query-overlay-animation]], [[force-directed-graph]], [[node-color-coding]]
- **Alternative considered**: D3 (rejected for performance at scale)

## Open questions

- (none — renderer mode resolved; see [[cytoscape-webgl-vs-canvas]])

## Sources

- [[consilium-project-architecture]]
- [[consilium-product-requirements]]
