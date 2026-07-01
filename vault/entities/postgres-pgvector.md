---
title: Postgres + pgvector
type: entity
status: active
tags: [database, vector, infra, oss]
sources: [consilium-project-architecture]
created: 2026-05-12
updated: 2026-05-12
---

# Postgres + pgvector

Consilium MVP runs a **single Postgres 16 instance** holding users, the team graph (nodes + edges), and vector embeddings via the `pgvector` extension. No separate vector DB, no graph DB.

## Key facts

- **Image**: `pgvector/pgvector:pg16` (Postgres 16 with pgvector preinstalled). (see [[consilium-project-architecture]])
- **Extensions enabled**: `vector` (pgvector similarity), `uuid-ossp` (UUID generation).
- **Tables (as shipped)**: `users`, `team_graph_nodes`, `team_graph_edges`. Sessions are stateless (JWT); `seed_data` was rolled into the seed script itself rather than a table.
- **Embedding column**: `embedding vector(768)` on `team_graph_nodes`, matching [[gemini|`text-embedding-004`]] output dimension.
- **Index**: `CREATE INDEX idx_embedding ON team_graph_nodes USING hnsw (embedding vector_cosine_ops)`.
- **Edge typing**: `edge_type IN ('mentions','involves','cites','authored_by','about','concerns','related_to')`.
- **Node typing**: `node_type IN ('insight','matter','party','lawyer','judge','witness','concept','precedent','statute')`.
- **Edge uniqueness**: `UNIQUE (source_node_id, target_node_id, edge_type)` — prevents duplicate edges of the same type between the same pair.
- **Cascade**: `team_graph_edges` has `ON DELETE CASCADE` from both `source_node_id` and `target_node_id` — deleting a node sweeps its incident edges.
- **Health check**: `pg_isready -U consilium` in `docker-compose.yml`.

## Why pgvector + relational rather than a dedicated graph DB

Postgres relational tables modeling nodes/edges plus pgvector for similarity is sufficient at MVP scale (under 10k nodes). Adding Neo4j or Apache AGE adds operational complexity without proportional benefit. The graph queries Consilium needs (1-hop neighborhood expansion, filtered retrieval) are straightforward SQL with recursive CTEs where needed. V1 can re-evaluate at scale.

## Retrieval flow

[[rag-query-pipeline]] uses:

```sql
SELECT id, title, summary
FROM team_graph_nodes
ORDER BY embedding <=> $query_embedding
LIMIT 8;
```

Followed by 1-hop expansion via `team_graph_edges`, deduplicated, then filtered to nodes with cosine similarity > 0.55 to the query.

## Relations

- **Used by**: [[consilium]] backend
- **Stores**: [[consilium-data-model|team graph schema]]
- **Receives embeddings from**: [[gemini]] (`text-embedding-004`)
- **Personal notes do NOT live here**: those live in browser IndexedDB; this DB only sees sanitized published nodes.

## Open questions

- HNSW recall/latency at single-firm scale (under 10k nodes) is fine; what's the V1 plan if a firm graph crosses 100k nodes?
- Migration path if the embedding model changes dimension.

## Sources

- [[consilium-project-architecture]]
