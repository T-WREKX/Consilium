---
title: Query-overlay graph animation
type: concept
status: active
tags: [ui, motion, consilium, hero]
sources: [consilium-product-requirements, consilium-design-guidelines, consilium-product-brief, consilium-implementation-plan]
created: 2026-05-12
updated: 2026-05-14
---

# Query-overlay graph animation

The **signature visual moment of [[consilium|Consilium]]**. The thing judges (and customers) remember. When any team member submits a query in the chat, the chat dims, the team graph fades in at viewport center, cited nodes pulse to full opacity in rank order, then the overlay fades back as the response streams.

## Choreography (frame by frame)

1. User submits the query in the chat input.
2. **Chat window dims to 30% opacity within 150ms**; input disabled.
3. A new full-screen overlay (`bg-canvas` at 95% with **backdrop blur**) fades in over **400ms**.
4. The team graph **fades in at center over 400ms**, positioned with the graph's centroid aligned to the viewport center. All nodes start at **15% opacity**.
5. As the backend returns the cited node IDs (typically 1–2 seconds), **cited nodes pulse to full opacity in waves** — **one node every 150ms**, in order of relevance rank. Connecting edges between cited nodes illuminate to `accent-primary` as their endpoint nodes light up.
6. The overlay **holds full state for ~1 second** after all cited nodes are lit — the eye needs time to register the network.
7. As Gemini streams the response, **the overlay fades back over 600ms**; chat un-dims. Cited node IDs in the streaming text are clickable chips referencing the same node IDs.

## Design requirements (per [[consilium-design-guidelines]] §8.3)

- Use `requestAnimationFrame` for the pulse waves to keep **60fps**.
- Each pulse is a brief scale (1.0 → 1.15 → 1.0) over **300ms** paired with opacity (15% → 100%).
- Edges illuminate via `stroke` and `stroke-width` transitions; **no flash**.
- Honor `prefers-reduced-motion`: skip pulse, set final state directly, no fade.
- During the overlay, the chat input is non-interactive; the user can press **Escape** to dismiss.

## Why it matters

Three things land simultaneously in this animation:

1. **"The answer is grounded in firm knowledge"** — visible because the graph is on screen.
2. **"These specific insights, not generic AI"** — visible because the cited nodes are the ones that pulse.
3. **"This firm has a brain"** — visible because the graph has shape.

The animation **converts an architectural claim into a perceptual moment**. This is why [[consilium-design-guidelines]] reserves the `deliberate` motion duration (600–800ms) specifically for this surface.

## Risks and fallbacks (per [[consilium-project-architecture]] §11)

- **The most likely thing to slip after Pass 2 generalization.** Fallback: simplified animation — just dim the chat, no graph fly-in.
- Performance on lower-end machines is an open concern; the `prefers-reduced-motion` fallback exists but does not address devices that *can* animate but stutter.

## Relation to [[hero-moments]]

This is Hero Moment 3 of three. The other two are the publish-with-redaction modal (Hero 1) and the chat-with-citations surface (Hero 2). Most design effort concentrates on these three.

## Implementation (as shipped — `apps/web/src/views/chat/QueryOverlay.tsx`)

- **Renderer**: a `<canvas>` element with `requestAnimationFrame`, **not Cytoscape** — the chat-time graph is a separate visual layer from the persistent team graph view. Deviation from "team graph fades in" if read literally; the perceptual effect is the same.
- **Trigger**: SSE `cited-nodes` event (fires before the first `token` event)
- **Timing**: fade-in **400ms**, hold **~800ms**, fade-out **600ms**
- **Pulse implementation**: not a per-node scale wave; instead, all nodes render at **15% opacity** simultaneously, cited nodes render at **100%** with a glow effect when opacity > 0.5, and edges between cited nodes illuminate to `accent-primary` (orange `#fb8500`) as their endpoints light up
- **HiDPI**: canvas scaled by `devicePixelRatio`
- **Reduced motion**: rAF loops skipped; opacity set directly to 1, holds ~800ms, then collapses instantly
- **Determinism fix**: an early implementation had `Math.random()` inside the render loop causing per-frame jitter; replaced with `stableJitter()` (see [[consilium-retrieval-implementation|audit fixes]])
- **Refinements (commit `ad3e14c`)**:
  - Explicit phase tracking (`'in' | 'hold' | 'out'`) with envelope math `min(elapsed / FADE_IN_MS, 1)` ramping in, then steady, then decaying
  - **Status label** "Searching firm knowledge" with three animated dots (1.2s cycle, 0.18s stagger) fills the perceptual gap before the first `cited-nodes` event arrives
  - **Escape hint** "ESC to dismiss" fades in top-right after 1.2s
  - **Edge reveal** is gated on both endpoints — `edgeProgress = min(srcProgress, tgtProgress)`; stroke width scales `1 + 1.4 × progress`, glow scales with progress; no edge lights before its nodes
  - **Halo glow** on cited nodes at progress > 0.4: outer arc at `size + 6` radius, 22% opacity — the "this is the answer" deepening cue
  - **Dim cascade isolation**: the chat content wrapper carries `opacity: 0.32; filter: saturate(0.5); pointer-events: none`; the overlay sits as a sibling so it escapes the cascade and renders at full opacity above the dimmed chat

> ⚠ Deviation from spec: the spec described a per-node scale pulse (1.0 → 1.15 → 1.0) with edges illuminating via `stroke` transitions; the canvas implementation achieves the same perceptual effect via opacity + glow without per-node scale animation.

## Sources

- [[consilium-product-requirements]]
- [[consilium-design-guidelines]]
- [[consilium-product-brief]]
- [[consilium-implementation-plan]]
