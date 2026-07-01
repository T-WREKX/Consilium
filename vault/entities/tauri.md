---
title: Tauri (V1)
type: entity
status: active
tags: [framework, desktop, v1, rust]
sources: [consilium-project-architecture]
created: 2026-05-12
updated: 2026-05-12
---

# Tauri

Cross-platform desktop application shell with a Rust core and a webview frontend. Smaller than Electron. Chosen for [[consilium]] **V1** native desktop (macOS, Windows, Linux).

## Key facts

- **Why chosen**: cross-platform, smaller than Electron, Rust core. (see [[consilium-project-architecture]])
- **Reuses**: the existing React frontend (same TypeScript codebase) inside the Tauri webview — the team does not rewrite UI for desktop.
- **Pairs with**: native mobile via React Native (V1 path).
- **Hosts**: on-device storage of personal notes as markdown files, local SQLite + vector index, [[gemma]] on-device inference.

## Why a native shell in V1

The [[local-first-architecture]] story becomes real only when:

1. Personal notes live as **markdown files on disk** (not in browser IndexedDB).
2. A **local LLM** (Gemma) handles personal-layer extraction without a network call.
3. Only **sanitized content** is sent to the cloud [[gemini]] API.

A native shell is the precondition for #1 and the platform for #2.

## Relations

- **Hosts**: [[gemma]] (on-device extraction), local SQLite vector index, markdown vault
- **Pairs with**: React Native for mobile (V1)
- **Replaces (V1)**: the [[react-vite|browser SPA]] + IndexedDB pattern of MVP

## Open questions

- Auto-update channel and signing strategy for V1.
- Bridge between Tauri webview and on-device Gemma inference — direct shell, sidecar process, or something else.

## Sources

- [[consilium-project-architecture]]
