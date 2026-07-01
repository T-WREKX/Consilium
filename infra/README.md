# Consilium — Infrastructure

Local development and deployment configuration.

## Contents

```
infra/
├── docker-compose.yml    # Local dev: Postgres 16 + Presidio + Cognee
├── cognee.env.example    # Cognee sidecar env (copy to cognee.env)
└── deploy/               # Vercel + Railway/Render deployment configs
```

## Local Development

`docker-compose.yml` brings up:
- **PostgreSQL 16** with `pgvector` and `uuid-ossp` extensions enabled
- **Microsoft Presidio** analyzer and anonymizer containers for PII detection (redaction Pass 1)
- **Cognee** (`cognee/cognee:main` on port 8000) — hybrid graph-vector memory sidecar

### Cognee setup

```powershell
cd infra
copy cognee.env.example cognee.env
# Edit cognee.env — set LLM_API_KEY to your Gemini API key
docker compose up -d cognee
cd ..
.\scripts\cognee-smoke.ps1
```

Optional Cursor MCP (dev agent memory, port 8001):

```powershell
docker compose --profile mcp up -d cognee-mcp
```

Configure API env in `apps/api/.env`:

```dotenv
COGNEE_BASE_URL=http://localhost:8000
COGNEE_DATASET=acme-litigation
COGNEE_ENABLED=true
COGNEE_FALLBACK_TO_PGVECTOR=true
```

## Deployment Targets

| Component | Platform |
|---|---|
| Frontend (SPA) | Vercel (free tier, static hosting) |
| Backend (Express) | Railway (preferred) or Render |
| PostgreSQL | Railway managed Postgres add-on |
| Presidio | Railway Docker deployment (sidecar) |

## Cost Estimate (MVP / Hackathon)

Total budget: under $100 for the hackathon window. See [`.agent/project-architecture.md`](../.agent/project-architecture.md) §12 for breakdown.
