---
title: Cognee
type: entity
status: active
tags: [cognee, hackathon, memory, ai]
sources: [cognee-integration]
created: 2026-07-01
updated: 2026-07-01
---

# Cognee

Open-source hybrid graph-vector **memory layer for AI agents**. Powers Consilium's team-brain ingestion and retrieval for the [[wemakedevs-cognee-hackathon|WeMakeDevs Cognee Hackathon]].

## Role in Consilium

Consilium uses a **hybrid architecture**: Postgres + pgvector remains the UI source of truth (Cytoscape graph, citation overlay); Cognee is the memory engine behind publish and chat.

| Cognee API | Consilium hook |
|---|---|
| `remember` | Dual-write after governed publish |
| `recall` | Knowledge-path chat retrieval |
| `improve` | Bridge session Q&A into permanent graph |
| `forget` | Surgical deletion on node retraction |

## Deployment

Self-hosted Docker sidecar (`cognee/cognee:main` on port 8000) via [`infra/docker-compose.yml`](../../infra/docker-compose.yml). Dataset: `acme-litigation`.

## Key facts

- Every ingest includes `CONSILIUM_NODE_ID:{uuid}` for recall → Postgres mapping. (see [[cognee-integration-journey]])
- `COGNEE_FALLBACK_TO_PGVECTOR=true` keeps demo working if sidecar is down.
- Gemini still synthesizes chat answers; Cognee retrieves context.

## Relations

- **Hackathon**: [[wemakedevs-cognee-hackathon]]
- **Competes with (partial)**: custom pgvector RAG in [[rag-query-pipeline]] — now hybrid
- **Integrates with**: [[gemini]] (LLM + embeddings for Cognee sidecar)

## Sources

- `.agent/cognee-integration.md`
- `docs/build-journey/`
