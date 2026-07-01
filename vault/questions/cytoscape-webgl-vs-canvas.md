---
title: Cytoscape.js — WebGL renderer or canvas at MVP scale?
type: question
status: answered
tags: [frontend, graph, performance]
sources: [consilium-project-architecture, consilium-product-requirements]
raised-on: [cytoscape-js]
created: 2026-05-12
updated: 2026-05-12
answered: 2026-05-12
---

# Cytoscape.js — WebGL renderer or canvas at MVP scale?

## Status

**Answered** (2026-05-12).

## Why it matters

[[cytoscape-js]] supports both canvas (default) and a WebGL renderer mode. The acceptance criterion is "no performance regression up to 500 nodes (graceful degradation beyond)." Canvas is simpler and well-trodden; WebGL handles thousands of nodes smoothly but adds setup complexity and edge-case rendering quirks. The choice also affects the [[query-overlay-animation|signature overlay animation]]'s 60fps pulse target. (see [[cytoscape-js]], [[force-directed-graph]])

## What we know so far

- 100+ nodes is required to render cleanly (demo seed will hit this).
- Up to 500 nodes is the graceful-degradation budget.
- 60fps pulse animation must hold during query overlay.
- No renderer mode has been committed.

## What would resolve it

- Run a quick perf test at 200 and 500 nodes on a typical demo laptop.
- Pick canvas (probably fine at MVP scale) and document a "switch to WebGL at V1 if firm graph grows past N nodes" trigger.

## Answer

**Canvas** (Cytoscape.js default renderer).

Canvas is well-trodden, sufficient for the MVP node-count budget (100+ clean, 500 graceful degradation), and lower-risk for the 60fps overlay animation than swapping to WebGL mid-build. Re-evaluate at V1 if a firm graph grows beyond a few thousand nodes — see [[firm-graph-scale-beyond-10k-nodes]] for the related scale question.

## Related

- [[cytoscape-js]]
- [[force-directed-graph]]
- [[query-overlay-animation]]
