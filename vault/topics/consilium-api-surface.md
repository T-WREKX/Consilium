---
title: Consilium API surface (MVP)
type: topic
status: active
tags: [consilium, api, backend]
sources: [consilium-project-architecture]
created: 2026-05-12
updated: 2026-05-12
---

# Consilium API surface (MVP)

REST. JWT in `Authorization: Bearer`. All endpoints require auth except `/api/auth/login`. Response envelope `{ data, error? }`; errors are `{ code, message, retryable }`.

## Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Email + password → JWT |
| POST | `/api/auth/logout` | Invalidate session |
| GET  | `/api/me` | Current user info |
| POST | `/api/organize` | Run [[auto-organization-pipeline]] on a note |
| POST | `/api/transcribe` | Audio → text via [[whisper]] |
| POST | `/api/vision` | Image → structured text via [[gemini\|Gemini Vision]] |
| POST | `/api/redact` | Note content → sanitized version + redaction map + confidence |
| POST | `/api/publish` | Commit sanitized note to team graph; returns new node ID |
| GET  | `/api/team-graph` | All team graph nodes + edges (for rendering) |
| GET  | `/api/team-graph/nodes/:id` | Single node summary (citation panels) |
| POST | `/api/chat` | [[rag-query-pipeline]]; streams response + cited node IDs |
| POST | `/api/seed` | Re-run seed data load (dev only, idempotent) |

(see [[consilium-project-architecture]] §5)

## Auth and rate limiting

- JWT 24h expiry; bcrypt cost factor 10.
- 60 req/min per user.
- CORS configured for the frontend origin only.
- HTTPS enforced (provider-managed certs).
- No CSRF concerns (JWT in header, not cookies).

## Streaming

`/api/chat` streams tokens. Cited node IDs are emitted **first** so the frontend can trigger the [[query-overlay-animation]] before the body of the response arrives.

## Out of MVP

- No GraphQL.
- No WebSocket / push channel (would be needed for V1 admin approval notifications).
- No `/api/admin/*` surface — admin dashboard is V1.

## Sources

- [[consilium-project-architecture]]
