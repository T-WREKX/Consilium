# 000 — Integration scaffold

**Date:** 2026-07-01  
**Phase:** Planning → Phase 0

## Context

Consilium was built for the WeMakeDevs Cognee Hackathon (Track 4: Data & Intelligence) as a privacy-first legal knowledge platform. The MVP already had:

- Personal brain (IndexedDB, local)
- Team graph (Postgres + pgvector + Cytoscape)
- Custom RAG in `rag.ts` (embed → vector search → 1-hop expand → Gemini synthesis)
- Publish flow with Presidio + Gemini redaction

**Zero Cognee runtime code existed** — only hackathon branding in README and vault.

Goal: integrate the full Cognee memory lifecycle without breaking the signature demo (query overlay, citation panel, redaction diff).

## Decision

**Hybrid architecture** — Postgres remains UI source of truth; Cognee is the memory engine behind publish + chat.

| Choice | Rationale |
|---|---|
| Self-hosted Docker sidecar (`cognee/cognee:main`) | Matches privacy story; competes for Best Use of Open Source |
| HTTP client from Express (not embedded `@cognee/cognee-ts`) | Same pattern as official integrations; avoids Windows native binding risk |
| Dual-write on publish | Keeps Cytoscape + citation UUIDs working |
| `CONSILIUM_NODE_ID:{uuid}` marker in remember payloads | Maps Cognee recall chunks back to Postgres for overlay |
| `COGNEE_FALLBACK_TO_PGVECTOR=true` | Demo never breaks if sidecar is down |
| Separate MCP dataset (`consilium-dev`) vs app dataset (`acme-litigation`) | Dev agent memory must not pollute demo corpus |

## Alternatives rejected

| Alternative | Why not |
|---|---|
| Replace Postgres graph entirely with Cognee | Breaks Cytoscape demo and citation overlay |
| Cognee Cloud only | Weaker open-source track story; self-host fits legal privacy pitch |
| Embedded TypeScript SDK | Native Rust bindings risky on Windows; integrations repo uses HTTP |
| LangGraph Python sidecar | Stack fragmentation — Consilium is Express/Gemini |
| Remove Gemini synthesis | Loses Gemini Award + existing grounding prompts |

## Mistakes / surprises

*(None yet at scaffold time — filled in during implementation entries.)*

## Outcome

Plan locked. Implementation order:

1. Phase 0 — Docker, MCP, skills, journey docs  
2. Phase 1 — `cognee.ts` service layer  
3. Phase 2 — `remember()` on publish + seed sync  
4. Phase 3 — `recall()` + session `improve()` in chat  
5. Phase 4 — `forget()` on retraction  
6. Phase 6 — Blog draft compilation  

## Cognee API used

Planned full lifecycle:

- **remember** — ingest published insights after redaction  
- **recall** — replace pgvector retrieval in knowledge-path chat  
- **improve** — bridge session Q&A into permanent graph (cross-session demo beat)  
- **forget** — surgical deletion on node retraction  

## Next

Phase 0: add Docker sidecar to `infra/docker-compose.yml`, env vars, smoke script, Cursor MCP + skills.
