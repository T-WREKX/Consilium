# 2026-07-01 — Phase 0 tooling

**Date:** 2026-07-01  
**Phase:** Phase 0

## Context

Before wiring Cognee into publish/chat, we needed local infra, agent guidance, and a journal scaffold for the hackathon blog side track.

## Decision

- Added `cognee` + optional `cognee-mcp` services to `infra/docker-compose.yml`
- Created `infra/cognee.env.example` with Gemini provider config (matches Consilium stack)
- Added `COGNEE_*` env vars to `apps/api/.env.example`
- Created `scripts/cognee-smoke.ps1` for Windows health + remember/recall check
- Added `.cursor/mcp.json`, `.cursor/rules/cognee.md`, `.cursor/skills/cognee-quickstart/SKILL.md`
- Scaffolded `docs/build-journey/` with template and index
- Updated `AGENT.md` and `infra/README.md`

## Alternatives rejected

| Alternative | Why not |
|---|---|
| Cognee Cloud only for dev | Self-host aligns with privacy pitch + Open Source track |
| User-level MCP only | Project `.cursor/mcp.json` keeps team consistent |

## Mistakes / surprises

- Cognee MCP quickstart doc fetch timed out during planning — used GitHub/docker docs instead.
- `cognee.env` must be created manually (not committed); documented in README.

## Outcome

Developers and agents can start Cognee with one compose command and find integration rules in-repo.

## Cognee API used

Smoke script exercises **remember** + **recall** against a throwaway dataset.

## Next

Implement `apps/api/src/services/cognee.ts` and dual-write on publish.
