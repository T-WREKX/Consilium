---
title: React + Vite
type: entity
status: active
tags: [framework, frontend, build-tool]
sources: [consilium-project-architecture]
created: 2026-05-12
updated: 2026-05-12
---

# React + Vite

Frontend stack for the [[consilium]] MVP single-page app. React 18 for the UI; Vite for the build; TypeScript throughout.

## Key facts

- **Why chosen**: team familiarity, ecosystem (React) and fast dev loop (Vite). (see [[consilium-project-architecture]])
- **Routing**: React Router.
- **State**: Zustand or React Context — "lightweight; no Redux needed."
- **Forms**: React Hook Form.
- **Styling**: Tailwind CSS for speed of iteration.
- **Graph viz**: [[cytoscape-js]].
- **Markdown**: `react-markdown` + `remark-gfm`.
- **Audio**: MediaRecorder API + WaveSurfer.js.
- **Local storage**: IndexedDB via the `idb` library (better DX than raw IndexedDB).
- **HTTP**: TanStack Query + fetch (caching, retries, mutations).
- **Deployed on**: Vercel free tier.

## Bundle-size budget

- **Main bundle**: under **500KB gzipped**.
- **Time-to-interactive**: under **2 seconds** on typical broadband.
- **Code-split boundaries**: `chat`, `capture`, and `graph` views each as a separate chunk (users hit login → home; they don't need chat code until navigating there).
- **Lazy-load heavy libraries**:
  - [[cytoscape-js|Cytoscape.js]] — only when navigating to a graph view
  - WaveSurfer.js — only when audio capture starts
- Achievable with Vite's dynamic imports. Day-5 polish step: cross-check against budget with the default Vite bundle report (or `rollup-plugin-visualizer`).

(see [[react-vite-bundle-size-budget]])

## What lives in IndexedDB

Personal notes — including audio Blobs and image Blobs — never leave the browser unsanitized. The schema is documented in [[consilium-data-model]] and the [[two-layer-architecture]] enforces this boundary.

## Relations

- **Used by**: [[consilium]] frontend
- **V1 replacement direction**: [[tauri]] desktop shell + React Native mobile (the React layer is portable)
- **Talks to**: [[postgres-pgvector|backend API]] over HTTPS

## Open questions

- (none — bundle budget resolved; see [[react-vite-bundle-size-budget]])

## Sources

- [[consilium-project-architecture]]
