# Cognee integration rules (Consilium)

When working on memory, retrieval, publish, or chat features:

## Deployment

- **Runtime app memory**: self-hosted Cognee sidecar at `COGNEE_BASE_URL` (default `http://localhost:8000`), dataset `acme-litigation`.
- **Dev agent memory**: separate MCP dataset `consilium-dev` via Cognee MCP on port 8001 — never mix with demo data.
- Start locally: `cd infra && docker compose up -d cognee` (copy `cognee.env.example` → `cognee.env` first).

## Memory lifecycle (use all four for hackathon depth)

| API | When | Consilium hook |
|---|---|---|
| `remember` | After governed publish | `POST /api/publish` → dual-write to Cognee |
| `recall` | Knowledge-path chat | `retrieveContext()` in `rag.ts` |
| `improve` | End of chat session | `POST /api/chat/improve` or idle hook |
| `forget` | Node retraction | `DELETE /api/team-graph/nodes/:id` |

## Non-negotiables

1. **Never** send unredacted personal notes to Cognee — only post-redaction publish content.
2. **Never** remove Postgres team graph — it powers Cytoscape UI and citation overlay node IDs.
3. Embed `CONSILIUM_NODE_ID:{uuid}` in every `remember` payload for recall → Postgres mapping.
4. Keep `COGNEE_FALLBACK_TO_PGVECTOR=true` so demo works if sidecar is down.
5. Gemini still synthesizes chat answers — Cognee retrieves; do not remove grounding prompts.

## Key files

- Service: `apps/api/src/services/cognee.ts`
- Spec: `.agent/cognee-integration.md`
- Infra: `infra/docker-compose.yml`, `infra/cognee.env.example`
- Journey log: `docs/build-journey/`

## Env vars

```
COGNEE_BASE_URL=http://localhost:8000
COGNEE_DATASET=acme-litigation
COGNEE_ENABLED=true
COGNEE_FALLBACK_TO_PGVECTOR=true
```
