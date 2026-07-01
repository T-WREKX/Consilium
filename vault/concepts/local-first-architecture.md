---
title: Local-first architecture
type: concept
status: active
tags: [architecture, privacy, consilium]
sources: [consilium-product-brief, consilium-project-architecture]
created: 2026-05-12
updated: 2026-05-12
---

# Local-first architecture

[[consilium|Consilium]]'s claim that **personal notes never leave the device unsanitized**. In MVP, this is supported architecturally (notes live in browser IndexedDB; redaction runs before any cloud call sees published content) but **AI inference is cloud** ([[gemini]] + [[whisper]]). In V1, on-device [[gemma]] makes the inference path local as well.

## Definition

- **Layer 1 (personal) is local-first**: storage on device; AI inference moves to on-device at V1.
- **Layer 2 (team) is cloud** — per-firm single-tenant in V1.
- **The boundary**: the [[redaction-pipeline]] and the lawyer's manual approval.

## Honest distinction: MVP vs V1

> ⚠ From [[consilium-project-architecture]] §2.4: *"For the MVP we are honest internally that AI runs in the cloud, but the architecture (personal notes never leaving IndexedDB unsanitized; redaction happening before any cloud call sees published content) supports the local-first story we present externally. V1 makes it real with Gemma on-device."*

Anyone repeating the local-first claim should specify which version they mean.

## What "local-first" enforces

- **Privileged content** ([[attorney-client-privilege]]) stays in the user's possession.
- **Cloud calls** see only sanitized published content (after [[redaction-pipeline]]) — never raw personal notes.
- **Audio Blobs and image Blobs** stay in IndexedDB (MVP) or on disk (V1).
- **Personal graph state** is derived from local data; no server-side personal-graph store exists.

## V1 mechanism

- Native shell ([[tauri]] for desktop, React Native for mobile)
- **Markdown files on disk** as the personal vault (the [[obsidian|Obsidian]]-compatible layout)
- **Local SQLite + `sqlite-vec`** for personal vector index
- **[[gemma]] on-device** for personal-layer extraction and classification
- **[[gemini]] cloud** continues to handle the sanitized team-layer workload

## Why this matters commercially

- **Privilege-compatible** — most firms have banned cloud AI for client work. (see [[attorney-client-privilege]])
- **Defensible moat** — cloud-first competitors ([[glean]]) can't easily replicate this architecture. (see [[competitive-moat]])

## Sources

- [[consilium-product-brief]]
- [[consilium-project-architecture]]
