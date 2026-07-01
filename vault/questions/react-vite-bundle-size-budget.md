---
title: React + Vite — bundle-size budget for the demo URL?
type: question
status: answered
tags: [frontend, performance]
sources: [consilium-project-architecture]
raised-on: [react-vite]
created: 2026-05-12
updated: 2026-05-12
answered: 2026-05-12
---

# React + Vite — bundle-size budget for the demo URL?

## Status

**Answered** (2026-05-12).

## Why it matters

Judges will hit the demo URL. Time-to-interactive matters; a 3MB main bundle on a hotel-WiFi connection is a memorable first impression in the wrong direction. The stack includes [[cytoscape-js]] (heavy), `react-markdown` + `remark-gfm`, WaveSurfer.js, and `idb` — each non-trivial. (see [[react-vite]])

## What we know so far

- Vite + Vercel free tier deployment.
- Multiple heavy libraries (graph viz, markdown, audio waveform, IndexedDB wrapper).
- No bundle-size budget asserted.

## What would resolve it

- A target (e.g. "main bundle under 500KB gzipped; lazy-load capture/audio routes").
- Code-splitting boundaries: at least chat, capture, and graph views should be separate chunks.
- A check-in step in the day-5 polish window to verify.

## Answer

**Targets**:

- **Main bundle**: under **500KB gzipped**.
- **Time-to-interactive**: under **2 seconds** on typical broadband.

**Code-splitting boundaries** — each as a separate chunk:

- `chat` view
- `capture` view
- `graph` view (personal + team)

Users hit login first, then the home view — they don't need the chat code until they navigate there.

**Lazy-load heavy libraries**:

- [[cytoscape-js|Cytoscape.js]] — only when navigating to a graph view
- WaveSurfer.js — only when audio capture starts

All achievable with **Vite's dynamic imports**. Add a check-in step in the day-5 polish window to verify against the budget (Vite produces a bundle-size report by default; cross-check with `rollup-plugin-visualizer` if needed).

## Related

- [[react-vite]]
- [[consilium-tech-stack]]
