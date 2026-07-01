# Consilium · Cognee Integration

**Document type:** Engineering spec  
**Status:** MVP · Hackathon  
**Companion:** [`project-architecture.md`](project-architecture.md), [`cognee-integration plan`](../docs/build-journey/000-scaffold.md)

---

## Overview

Consilium uses a **hybrid memory architecture**:

| Layer | Role |
|---|---|
| **Postgres + pgvector** | UI source of truth — Cytoscape graph, citation panels, node UUIDs |
| **Cognee sidecar** | Hybrid graph-vector memory engine — remember/recall/improve/forget |

Cognee does **not** replace the personal brain (IndexedDB) or the redaction gate. It powers team-brain ingestion and retrieval after governance.

---

## Architecture

```
Publish (redacted) ──► insertNode(Postgres) ──► remember(Cognee)
Chat (knowledge)   ──► recall(Cognee) ──► map CONSILIUM_NODE_ID ──► RagContext[]
                     ──► streamRagResponse(Gemini)  [unchanged]
Session end        ──► improve(sessionIds) ──► bridge Q&A to graph
Retraction         ──► forget(cognee_data_id) + deleteNode(Postgres)
```

---

## ID mapping

Every Cognee ingest includes a marker in the text body:

```
CONSILIUM_NODE_ID:{uuid}
Title: {title}
Type: {nodeType}
Contributor: {name}
Body: {sanitized body}
```

On recall, parse `CONSILIUM_NODE_ID:` from chunk text → load full node from Postgres for overlay/citations.

Metadata on Postgres nodes:

```json
{
  "cognee_data_id": "<cognee-uuid>",
  "cognee_dataset": "acme-litigation"
}
```

---

## HTTP API mapping

Implemented in [`apps/api/src/services/cognee.ts`](../apps/api/src/services/cognee.ts):

| Service method | Cognee endpoint | Purpose |
|---|---|---|
| `rememberInsight()` | `POST /api/v1/remember` | Publish dual-write |
| `recallForQuery()` | `POST /api/v1/recall` | Chat retrieval (`CHUNKS`, `scope: auto`) |
| `rememberChatTurn()` | `POST /api/v1/remember/entry` | Session Q&A |
| `improveSession()` | `POST /api/v1/improve` | Session → graph bridge |
| `forgetNode()` | `DELETE .../data/{id}` | Governance retraction |

---

## Feature flags

| Variable | Default | Behavior |
|---|---|---|
| `COGNEE_ENABLED` | `true` | Master switch |
| `COGNEE_FALLBACK_TO_PGVECTOR` | `true` | Fall back to existing pgvector RAG if Cognee fails |
| `COGNEE_BASE_URL` | `http://localhost:8000` | Sidecar URL |
| `COGNEE_DATASET` | `acme-litigation` | Firm dataset name |

---

## Demo script (Cognee beats)

1. **Capture → Publish** — show redaction, then "remembered into firm memory"
2. **Query overlay** — recall from Cognee-mapped Postgres nodes
3. **Session Q&A** — chat stores QA via remember/entry
4. **Improve** — call improve on session end
5. **Cross-session** — new session recalls bridged memory ("It remembered")

---

## Local setup

```bash
cd infra
cp cognee.env.example cognee.env   # set LLM_API_KEY = GEMINI_API_KEY
docker compose up -d cognee
```

Optional MCP for Cursor dev agents:

```bash
docker compose --profile mcp up -d cognee-mcp
# Cursor: .cursor/mcp.json → http://localhost:8001/sse
```

Smoke test: `.\scripts\cognee-smoke.ps1`

---

## What we deliberately did NOT do

- Replace IndexedDB personal storage with Cognee
- Remove Postgres team graph or pgvector fallback
- Embed `@cognee/cognee-ts` natively (Windows/Docker sidecar is safer)
- Remove Gemini synthesis (Gemini Award + grounding prompts)
