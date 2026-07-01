# Consilium — API Backend

Node.js + Express REST API. Handles authentication, AI orchestration, redaction, RAG retrieval, and team graph management.

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express |
| Language | TypeScript |
| Auth | `jsonwebtoken` + `bcrypt` |
| DB client | `pg` (node-postgres) |
| Validation | Zod |
| Environment | `dotenv` |
| File upload | `multer` |

## Directory Structure

```
src/
├── routes/         # Express route handlers
├── services/       # AI orchestration, redaction, RAG
├── db/             # Postgres client, queries, migrations
├── prompts/        # System prompts for Gemini (extraction, redaction, chat)
└── seed/           # Seed data scripts and content
```

## API Surface

All endpoints require valid JWT except `/api/auth/login`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Email + password → JWT |
| POST | `/api/auth/logout` | Invalidate session |
| GET | `/api/me` | Current user info |
| POST | `/api/organize` | AI organization pipeline (entities, classification, flags) |
| POST | `/api/transcribe` | Audio → text via Whisper |
| POST | `/api/vision` | Image → structured text via Gemini Vision |
| POST | `/api/redact` | Note → sanitized version + redaction map + confidence |
| POST | `/api/publish` | Commit sanitized note to team graph |
| GET | `/api/team-graph` | All team graph nodes and edges |
| GET | `/api/team-graph/nodes/:id` | Single node summary |
| POST | `/api/chat` | RAG query with streaming response and citations |
| POST | `/api/seed` | Re-run seed data load (dev only) |

## Architecture Reference

See [`.agent/project-architecture.md`](../../.agent/project-architecture.md) for:
- §4 AI Pipelines (auto-organization, redaction, RAG query)
- §5 API Surface (response shapes, error format)
- §6 Auth and Security (JWT, CORS, rate limiting)
