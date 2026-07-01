---
name: cognee-quickstart
description: Help set up and troubleshoot Cognee for Consilium — Docker sidecar, Gemini providers, remember/recall/improve/forget smoke tests, and Windows PowerShell workflows.
---

# Cognee Quickstart (Consilium)

Use when setting up Cognee, debugging the sidecar, or integrating memory lifecycle APIs.

## Consilium-specific defaults

- **Sidecar**: `docker compose up -d cognee` from `infra/` (port 8000)
- **MCP (dev agents)**: `docker compose --profile mcp up -d cognee-mcp` (port 8001 SSE)
- **Dataset (app)**: `acme-litigation`
- **Dataset (dev MCP)**: `consilium-dev`
- **LLM**: Gemini (matches Consilium stack)

```dotenv
# infra/cognee.env (copy from cognee.env.example)
LLM_PROVIDER=gemini
LLM_MODEL=gemini/gemini-2.5-flash
LLM_API_KEY=<same as GEMINI_API_KEY>
EMBEDDING_PROVIDER=gemini
EMBEDDING_MODEL=gemini/gemini-embedding-001
EMBEDDING_API_KEY=<same as GEMINI_API_KEY>
```

```dotenv
# apps/api/.env
COGNEE_BASE_URL=http://localhost:8000
COGNEE_DATASET=acme-litigation
COGNEE_ENABLED=true
COGNEE_FALLBACK_TO_PGVECTOR=true
```

## Windows smoke test

```powershell
cd infra
copy cognee.env.example cognee.env
# Edit cognee.env — set LLM_API_KEY
docker compose up -d cognee
cd ..
.\scripts\cognee-smoke.ps1
```

## HTTP API (v1)

| Operation | Endpoint | Notes |
|---|---|---|
| Remember | `POST /api/v1/remember` | `datasetName` + text data |
| Recall | `POST /api/v1/recall` | `query`, `datasets`, `search_type`, `session_id`, `scope` |
| Remember entry | `POST /api/v1/remember/entry` | QA/trace for session memory |
| Improve | `POST /api/v1/improve` | Bridge session → permanent graph |
| Forget item | `DELETE /api/v1/datasets/{id}/data/{dataId}` | Requires stored `cognee_data_id` |

## Consilium mapping convention

Every remember payload must include:

```
CONSILIUM_NODE_ID:{postgres-uuid}
Title: ...
Type: ...
Body: ...
```

Parse this marker on recall to map Cognee chunks back to Postgres nodes for the graph overlay.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Connection refused :8000 | `docker compose up -d cognee` in `infra/` |
| Empty recall | Run seed + Cognee sync; call `improve()` after session Q&A |
| 401 on local | Local Docker usually has no auth; check `REQUIRE_AUTHENTICATION` |
| Slow remember | Normal on first ingest (graph build); run in background on publish |
| Demo broken | Set `COGNEE_FALLBACK_TO_PGVECTOR=true` |

## Finish criteria

- `GET /health` returns OK
- Smoke script completes remember + recall
- Publish dual-writes with `metadata.cognee_data_id`
- Chat knowledge path uses Cognee recall with pgvector fallback
