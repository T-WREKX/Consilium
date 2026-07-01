---
title: Cognee integration journey
type: topic
status: active
tags: [consilium, cognee, hackathon, build-journey]
sources: [cognee-integration]
created: 2026-07-01
updated: 2026-07-01
---

# Cognee integration journey

Chronological record of integrating [[cognee|Cognee]] into [[consilium|Consilium]] for the [[wemakedevs-cognee-hackathon|hackathon]]. Full entries live in [`docs/build-journey/`](../../docs/build-journey/).

## Architecture decision

**Hybrid dual-write**: Postgres for UI/citations; Cognee for graph-vector memory lifecycle. Rejected full replacement of Postgres (breaks query overlay demo) and embedded `@cognee/cognee-ts` (Windows native binding risk).

## Demo beats enabled by Cognee

1. Publish → `remember()` into firm memory
2. Chat → `recall()` with existing graph overlay
3. Save session → `improve()` bridges Q&A to permanent graph
4. New session → cross-session recall ("It remembered")

## Judging fit

Strengthens **Best Use of Cognee** and **Track 4** (RAG, KG extraction, NL querying) without changing the privacy/redaction story.

## Sources

- `docs/build-journey/BLOG-draft.md`
- `.agent/cognee-integration.md`
