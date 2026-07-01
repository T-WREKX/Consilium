---
title: Graph zoom control
type: concept
status: active
tags: [ui, graph, control, consilium]
sources: [consilium-implementation-plan]
created: 2026-05-14
updated: 2026-05-14
---

# Graph zoom control

A persistent zoom widget anchored to the bottom-right of both graph views (personal and team). Replaces implicit wheel-scroll zoom with a deliberate, labeled control. Implementation: `apps/web/src/components/GraphZoomControl.tsx` + `graph-zoom-control.css` (commit `ad3e14c`).

## Anatomy

| Element | Behavior |
|---|---|
| Zoom-out button | Decrements by 5 percentage points |
| Range slider | Gradient-filled bar driven by a `--fill` CSS variable; thumb is a 14px orange (`accent-primary`) disc with a soft glow shadow |
| Percent readout | Mono-style number beside the slider; e.g., `60%` |
| Zoom-in button | Increments by 5 percentage points |
| Reset / fit | `Maximize2` Lucide icon; hover tinted `accent-primary`; calls `cy.fit(undefined, 60)` and resets `baseZoomRef` |

## Range and clamping

- Range: **20% – 150%**, step 5
- Parent components set `cy.minZoom` / `cy.maxZoom` so wheel-zoom matches the slider's bounds
- `baseZoomRef` stores the fit-all zoom level captured after the first layout settles; the slider's `pct` is read as `baseZoom × (pct / 100)`

## Adaptive label visibility

Tied into the zoom value: labels on entity nodes become visible at `≥ 75%` of base zoom (`LABEL_ZOOM_THRESHOLD = 0.75`). Below that, labels suppress to reduce visual clutter; they always show on hover or selection regardless of zoom.

## Positioning

- `.graph-zoom-control { position: absolute; right: 16px; bottom: 16px; z-index: 20; }`
- Pill container with `backdrop-filter: blur(10px)`, `rgba(22,27,34,0.82)` background — reads as a floating utility, not a panel
- 26px circular buttons; transparent background; hover → `bg-surface-raised`; active → `bg-overlay`

## Props (from the component contract)

```ts
interface Props {
  zoomPercent: number;
  onChange: (pct: number) => void;
  onReset?: () => void;
}
```

Parent owns the Cytoscape instance and pipes the slider value back into `cy.zoom(...)`. The control has no direct Cytoscape dependency — it's a dumb input.

## Wiring

- [[consilium-capture-implementation|Personal graph]] — `PersonalGraphView.tsx:369–373`
- [[consilium-govern-implementation|Team graph]] — `TeamGraphView.tsx:354–359`

## Why a control, not just scroll-zoom

Wheel-zoom is ambient and prone to accidental triggering, especially with trackpads. A visible widget makes zoom a deliberate user act, surfaces the current zoom % at all times, and gives keyboard / pointer users a uniform affordance. The fit-to-view reset is the headline action — one click recovers a lost graph.

## Relations

- **Used by**: [[cytoscape-js]] in both graph views
- **Tied to**: adaptive label visibility (a side-effect of the zoom value, not a control of its own)

## Sources

- [[consilium-implementation-plan]]
