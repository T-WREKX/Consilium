# 2026-07-01 — Integration implementation

**Date:** 2026-07-01  
**Phase:** Phases 1–4

## Context

Wire the full Cognee memory lifecycle into Consilium without breaking the citation-grounded chat demo or Cytoscape graph overlay.

## Decision

| Area | Implementation |
|---|---|
| Service layer | `apps/api/src/services/cognee.ts` — HTTP v1 client |
| ID mapping | `CONSILIUM_NODE_ID:{uuid}` in remember payloads; `metadata.cognee_data_id` on Postgres nodes |
| Publish | Dual-write after `insertNode`; Cognee failure is logged, publish still succeeds |
| Chat retrieval | `retrieveContext()` tries Cognee recall first, falls back to pgvector |
| Session memory | `sessionId` in chatStore (sessionStorage); `remember/entry` after knowledge answers |
| Improve | `POST /api/chat/improve` + UI "Save session" / "New session" + unmount hook |
| Forget | `DELETE /api/team-graph/nodes/:id` calls Cognee forget when `cognee_data_id` present |
| Seed | `syncInsightsToCognee()` after team graph seed |

## Alternatives rejected

| Alternative | Why not |
|---|---|
| Cognee-only graph (no Postgres) | Breaks query overlay node UUIDs |
| Replace Gemini synthesis with Cognee completion | Loses Gemini Award + grounding prompts |
| Synchronous improve on every message | Too slow; batch on session end |

## Mistakes / surprises

- Cognee remember may expect multipart form — service uses FormData with text blob.
- Recall response shape varies — parser handles multiple JSON shapes and extracts `CONSILIUM_NODE_ID` markers.
- Empty Cognee recall before seed sync — mitigated by `syncInsightsToCognee()` on seed and pgvector fallback.

## Outcome

Full lifecycle integrated with feature flags:

```dotenv
COGNEE_ENABLED=true
COGNEE_FALLBACK_TO_PGVECTOR=true
```

Health endpoint reports Cognee sidecar status.

## Cognee API used

All four: **remember**, **recall**, **improve**, **forget**.

## Next

Run smoke test with live sidecar; record demo video with cross-session beat.
