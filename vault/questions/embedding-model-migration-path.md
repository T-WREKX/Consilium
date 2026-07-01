---
title: What is the migration path if Gemini's embedding model changes dimension?
type: question
status: open
tags: [architecture, embeddings, postgres, gemini]
sources: [consilium-project-architecture]
raised-on: [gemini, postgres-pgvector, consilium-project-architecture, consilium-data-model]
created: 2026-05-12
updated: 2026-05-12
---

# What is the migration path if Gemini's embedding model changes dimension?

## Status

**Open**, but with a real-world data point — see Addendum below.

## Why it matters

The `team_graph_nodes.embedding` column is typed `vector(768)` to match `text-embedding-004`. If Google ships a successor model with a different dimension (e.g. 1024 or 3072), every embedded node has to be rebuilt and the HNSW index has to be rebuilt with it. Without a documented strategy, a model rev would block production until a one-off migration is hand-rolled. (see [[consilium-project-architecture]], [[postgres-pgvector]], [[gemini]], [[consilium-data-model]])

## What we know so far

- Dimension is fixed at 768 in the schema.
- HNSW index uses `vector_cosine_ops`.
- No re-embedding job exists; embeddings are written once at publish time.
- The architecture admits this is unresolved.

## What would resolve it

- A documented dual-write + reindex window strategy (write to old + new column, switch, drop), OR
- A versioned embedding column (`embedding_v1`, `embedding_v2`) with retrieval reading the active version, OR
- An accepted policy that an embedding-model change triggers a per-firm offline migration with a maintenance window.

## Answer

_(pending — the canonical strategy is still unwritten)_

## Addendum — 2026-05-14

The architecture spec called for `text-embedding-004`, but the implementation moved to **`gemini-embedding-001`** (commits `0164277` + `b522b13`) because the SDK doesn't expose `text-embedding-004`. The migration preserved the 768-dim schema by passing `outputDimensionality: 768` on every `embedContent` call. So:

- A model rev that **supports `outputDimensionality`** is a drop-in swap with no schema change and no re-embedding.
- A model rev that **does not** support `outputDimensionality`, or that ships at a different native dimension, still blocks production — the original question is open for that case.

The implementation lesson: pinning `outputDimensionality` to the schema column is a cheap insurance policy. The question above remains the *full* migration strategy; this is a partial mitigation, not an answer.

## Related

- [[postgres-pgvector]]
- [[gemini]]
- [[consilium-data-model]]
- [[consilium-project-architecture]]
