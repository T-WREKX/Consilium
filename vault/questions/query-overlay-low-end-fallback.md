---
title: Query-overlay animation — fallback for low-end machines beyond `prefers-reduced-motion`?
type: question
status: open
tags: [performance, ux, animation]
sources: [consilium-design-guidelines, consilium-product-requirements]
raised-on: [consilium-design-guidelines]
created: 2026-05-12
updated: 2026-05-12
---

# Query-overlay animation — fallback for low-end machines beyond `prefers-reduced-motion`?

## Status

**Open** — awaiting team decision.

## Why it matters

The [[query-overlay-animation|signature visual moment]] runs a 60fps pulse over the full team graph. `prefers-reduced-motion` handles users who explicitly opt out, but it does **not** handle devices that *can* animate but stutter — the worst case visually. A stuttering hero animation is worse than no animation. (see [[query-overlay-animation]])

## What we know so far

- `prefers-reduced-motion`: skip pulse, set final state directly, no fade.
- 60fps target via `requestAnimationFrame`.
- No frame-rate detection or auto-fallback.

## What would resolve it

- Decide whether to measure first-frame timing and switch to a simplified animation if a target FPS isn't met.
- Or: ship the full animation and accept that some demo laptops may stutter; rely on rehearsal hardware.
- Confirm the rehearsal hardware matches the demo-day hardware.

## Answer

_(pending)_

## Related

- [[query-overlay-animation]]
- [[consilium-design-guidelines]]
- [[cytoscape-webgl-vs-canvas]]
