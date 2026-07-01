---
title: Consilium Implementation Plan
type: source
status: active
tags: [consilium, hackathon, implementation, sprint]
sources: []
created: 2026-05-13
updated: 2026-05-13
---

# Consilium Implementation Plan

Source: `.agent/consilium_implementation_plan.md` — 557 lines. The canonical hackathon sprint plan and ticket board.

## What this source covers

- Developer assignment strategy: vertical slices with strict file ownership
- Day 0 bootstrap tasks (shared, ~2 hours)
- 25 tickets across 3 developers (K-1–K-8, G-1–G-8, N-1–N-8)
- Day-by-day summary table
- Shared files locked after Day 0
- Merge strategy and branch order
- Contingency plans for 6 risk scenarios

## Key claims

- **Principle**: vertical slices with strict file ownership; no two developers edit the same file. AI agents are fast generators; the bottleneck is merge conflicts, not velocity.
- **Developers**: Capture domain (CAPTURE), Govern domain (GOVERN), Retrieval domain (RETRIEVAL)
- **Scope**: 25 tickets, 6 days, 1 deployed demo URL
- **Merge order**: Retrieval domain first (infra), Govern domain second (auth/shell), Capture domain last (features)
- **Seed data guarantee**: N-2 explicitly ensures the canonical demo query produces a strong, cited response.
- **Contingency plans**: pre-defined fallbacks for 6 risks (Presidio failure, overlay animation, image capture, Whisper latency, Pass 2 quality, personal graph scale).

## Pages touched / created

- Created [[consilium-implementation-plan]] (topic)
- Created [[consilium-codebase-structure]] (topic)

## Re-ingest notes

*(None — initial ingest, 2026-05-13)*

## Related

- [[consilium-project-architecture]] — architecture that the tickets implement
- [[consilium-demo-narrative]] — the 5-minute demo script the tickets are built around
- [[consilium-mvp-scope]] — scope boundaries reflected in ticket phasing

## Sources

*(This is a source page; no upstream sources.)*
