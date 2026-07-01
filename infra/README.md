# Consilium — Infrastructure

Local development and deployment configuration.

## Contents

```
infra/
├── docker-compose.yml    # Local dev: Postgres 16 + Presidio
└── deploy/               # Vercel + Railway/Render deployment configs
```

## Local Development

`docker-compose.yml` brings up:
- **PostgreSQL 16** with `pgvector` and `uuid-ossp` extensions enabled
- **Microsoft Presidio** analyzer and anonymizer containers for PII detection (redaction Pass 1)

## Deployment Targets

| Component | Platform |
|---|---|
| Frontend (SPA) | Vercel (free tier, static hosting) |
| Backend (Express) | Railway (preferred) or Render |
| PostgreSQL | Railway managed Postgres add-on |
| Presidio | Railway Docker deployment (sidecar) |

## Cost Estimate (MVP / Hackathon)

Total budget: under $100 for the hackathon window. See [`.agent/project-architecture.md`](../.agent/project-architecture.md) §12 for breakdown.
