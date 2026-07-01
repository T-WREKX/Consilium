# Consilium — Web Frontend

React 18 + Vite single-page application. The primary interface for lawyers interacting with Consilium.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 |
| Build tool | Vite |
| Language | TypeScript |
| Routing | React Router |
| State | Zustand |
| Styling | Tailwind CSS |
| Graph viz | Cytoscape.js |
| Local storage | IndexedDB via `idb` |
| HTTP | TanStack Query + fetch |

## Directory Structure

```
src/
├── api/            # Backend client (fetch wrappers, TanStack Query hooks)
├── components/     # Reusable UI components
├── lib/            # IndexedDB wrappers, graph utilities, helpers
├── store/          # Zustand stores (auth, notes, graph state)
├── styles/         # Design tokens, global CSS
└── views/          # Page-level views
    ├── auth/       # Login screen
    ├── capture/    # Text, audio, image note capture
    ├── chat/       # Chat with team brain + query overlay
    ├── graph/      # Personal graph view
    ├── publish/    # Redaction modal + publish flow
    └── team/       # Team graph view
```

## Design Reference

All UI must follow [`.agent/design-guidelines.md`](../../.agent/design-guidelines.md):
- Dark mode primary (`#0d1117` canvas)
- Orange accents (`#fb8500`)
- Source Serif Pro (body), Inter (UI), JetBrains Mono (technical)
- No emoji in microcopy
