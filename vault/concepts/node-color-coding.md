---
title: Node color coding
type: concept
status: active
tags: [design, color, consilium]
sources: [consilium-design-guidelines]
created: 2026-05-12
updated: 2026-05-15
---

# Node color coding

The palette assigned to each node type in [[consilium|Consilium]]'s graph views. Governed by a **strict rule**: no graph node color may overlap with the accent palette (orange `#fb8500`) or the semantic palette (success/warning/danger/info). This keeps **UI signals visually distinct from data**.

## Palette (per [[consilium-design-guidelines]] §2.5)

| Node Type | Hex | Visual |
|---|---|---|
| `insight` | `#9d4edd` | Purple — primary user-generated content type |
| `matter` | `#06d6a0` | Teal — case/matter container |
| `party` | `#ef476f` | Magenta — clients, opposing parties |
| `lawyer` | `#118ab2` | Steel blue — firm lawyers, opposing counsel |
| `judge` | `#073b4c` (with outline) | Deep slate with white outline — judicial figures |
| `witness` | `#ff9f1c` | Orange — expert and fact witnesses |
| `concept` | `#8338ec` | Violet — legal concepts, doctrines |
| `precedent` | `#3a86ff` | Sky blue — case law |
| `statute` | `#fb5607` | Vermillion — statutory authority |

## Edges

- At rest: neutral `#30363d` (`border-default`).
- On hover: brighten to `#7d8590` (`text-secondary`).
- **Cited edges during [[query-overlay-animation|query overlay]]**: illuminate to `accent-primary` (orange `#fb8500`). This is the **only** place an accent color appears in graph visualization — it signals "active cited path."

## The strict rule in plain terms

If a user sees orange in the graph, they should know it means *"this is part of the answer being cited right now."* Not *"this is a node type."* That separation is what makes the [[query-overlay-animation]] readable without legend.

## Implementation

Palette is implemented in `apps/web/src/lib/graphUtils.ts` as `NODE_COLORS` (a `Record<string, string>`). The hex values match [[consilium-design-guidelines]] §2.5 exactly. Edge defaults are also defined there: `EDGE_COLOR_DEFAULT = '#30363d'`, `EDGE_COLOR_HOVER = '#7d8590'`. Tokens are also pre-defined in `tokens.css` as `--node-insight`, `--node-matter`, etc., for direct use in [[cytoscape-js]] style sheets.

Note: `judge` uses `#073b4c` (deep slate) and is rendered **with a white outline** in the graph to maintain legibility against dark backgrounds.

**2026-05-14 palette revisions** (alongside the accent-color rebrand):

| Node type | Before | After | Reason |
|---|---|---|---|
| `witness` | `#ff9f1c` (orange) | `#ffd60a` (saffron) | Avoid overlap with the new orange accent `#fb8500` |
| `statute` | `#fb5607` (vermillion) | `#d62828` (crimson) | Same — vermillion was too close to the new accent |

The strict no-overlap rule did the work here: the two node colors closest to the new accent migrated to maintain the data-vs-UI-signal separation.

## Rest-state philosophy — color, not grey (revised 2026-05-15)

Both graph views ([[consilium-capture-implementation|personal]] and [[consilium-govern-implementation|team]]) render **per-type colors at rest, not uniform grey**. The spotlight handler on hover/selection inverts the relationship: non-spotlight nodes get an inline grey override, spotlight + neighbors keep their stylesheet-default per-type color.

### What changed

| | Before (≤ 2026-05-14) | After (2026-05-15 →) |
|---|---|---|
| Rest state | All nodes uniform `#3a3f47` grey | Per-type color from `NODE_COLORS`, opacity 0.9, colored shadow blur 6 / opacity 0.5 |
| On hover/select | Restore per-type color on spotlight + neighbors inline; everything else stays grey at low opacity | Apply grey override (`#3a3f47`, opacity 0.5, hidden label) inline to non-spotlight nodes; spotlight + neighbors keep stylesheet-default per-type color |
| Visual feel | Clean grey constellation that activates on hover | Vibrant per-type-colored map that focuses on hover |

### Why

The grey-at-rest model treated color as a *reward* — the graph only became legible after the user moved a pointer over it. That made the graph feel like a flat grid until activated, which under-sold the **per-type structure** the palette was designed to communicate. The most important thing about a Consilium graph view, at a glance, is "this is a map of nine distinct kinds of things." The new rest state communicates that immediately; the spotlight mechanism still gives the same focus payoff because **grey is now the focus contrast**, not the baseline.

This also aligns the personal and team graphs visually — both now read as colored maps at rest, with identical spotlight grey-out behavior. Visual parity makes the cognitive transition between capture and chat surfaces lighter.

### What did NOT change

The **strict UI-vs-data color separation rule** is unaffected. Accent orange (`#fb8500`) is still reserved for cited edges during the [[query-overlay-animation]], and the semantic palette (success/warning/danger/info) is still reserved for UI signals. The grey override applied during spotlight (`#3a3f47`) is `border-default`-adjacent — distinct from every node color and from the accent. A user seeing orange in the graph still means *"this is part of the answer being cited."*

### Where it lives

- `apps/web/src/lib/graphStyles.ts` — personal-graph stylesheet's `background-color: data(color)`, `shadow-color: data(color)`.
- `apps/web/src/views/team/TeamGraphView.tsx` — inline stylesheet's `background-color` reads `NODE_COLORS[el.data('nodeType')]`.
- `apps/web/src/views/graph/PersonalGraphView.tsx` `applySpotlight` and the equivalent in TeamGraphView — apply the grey override to `cy.nodes().not(node).not(nbNodes)` inline; spotlight + neighbors get only opacity / shadow / label boosts, never an explicit color (they inherit the stylesheet color).

### Tradeoff

A fully colored graph at rest is busier than a grey constellation. At MVP node counts (~50–100 nodes for personal, ~20 seed insights + entities + hubs for team) this reads as energetic rather than noisy. At firm scale (V1, 10k+ nodes) we'd likely need an additional zoom-based desaturation pass to keep the "fully zoomed out" view legible — captured as a future consideration, not a blocking concern.

## Sources

- [[consilium-design-guidelines]]
- [[consilium-implementation-plan]]
