---
title: Consilium Seed Data Analysis
type: source
status: active
tags: [consilium, seed, analysis, mvp]
sources: []
created: 2026-05-14
updated: 2026-05-14
---

# Consilium Seed Data Analysis

Source: `.agent/seed_data_analysis.md` — 205 lines. Executive summary of the complete Consilium seeding system across all three layers (auth, team graph, personal notes). Ingested 2026-05-14.

## What this source covers

- The three seeded surfaces and their contents:
  - **Auth**: 3 demo users (Ana Mendoza, Carlos Reyes, Diana Santos) at `litigator|lead|admin@acme.law`, password `demo`, bcrypt 10 rounds, stateless JWT
  - **Team graph**: 20 published insight nodes with real `gemini-embedding-001` 768-dim vectors, plus auto-extracted entity nodes deduplicated case-insensitively on `(node_type, LOWER(title))`
  - **Personal layer**: 6 PH-litigation notes seeded into IndexedDB on first lawyer login (idempotent — no-op if notes already exist)
- Insight distribution: 5 judge tendencies, 3 opposing counsel patterns, 4 motion practice, 3 expert witness handling, 3 settlement dynamics, 2 procedural lessons
- Canonical demo query (confirmed): *"What has our firm learned about cross-examining expert witnesses on damages calculations?"* — targets the 3 expert-witness insights
- Idempotency guarantees at every layer (auth seed, team-graph seed, frontend personal seed)

## Key claims

- **All seeding is production-ready and idempotent.** Replaying the seed against an already-seeded DB or IDB does not duplicate data.
- **No signup flow at MVP.** The Acme firm is hard-coded; auth is stateless JWT; no session table.
- **Frontend personal seed runs in `LoginView.tsx` on lawyer login** (was previously documented as "on first lawyer login" — confirmed as triggered from the login flow, not an app-init hook).
- **Distribution chosen so the canonical query has 3 strong hits** plus 2–3 adjacent backups that produce credible responses if a judge asks off-script.

## Pages touched / created

- Created: this source page
- Cross-referenced: [[acme-litigation-partners]], [[consilium-retrieval-implementation]], [[consilium-capture-implementation]]

## Re-ingest notes

*(None — initial ingest, 2026-05-14)*

## Contradictions

- The analysis document specifies `gemini-embedding-001` as the embedding model. This contradicts earlier vault claims of `text-embedding-004`, derived from an outdated reading of `.agent/project-architecture.md`. Implementation pages have been updated accordingly. See [[gemini]] and [[consilium-retrieval-implementation]].

## Related

- [[acme-litigation-partners]] — the demo firm whose data is described here
- [[consilium-retrieval-implementation]] — implementation of the team-graph seed
- [[consilium-capture-implementation]] — implementation of the personal-notes seed
- [[derived-edges]] — Obsidian-style connections built on top of the seeded graph

## Sources

*(Source page; no upstream sources.)*
