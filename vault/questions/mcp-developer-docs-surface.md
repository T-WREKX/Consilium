---
title: MCP server — developer docs surface at V1 launch?
type: question
status: open
tags: [v1, mcp, developer-experience, docs]
sources: [consilium-project-architecture]
raised-on: [mcp-server]
created: 2026-05-12
updated: 2026-05-12
---

# MCP server — developer docs surface at V1 launch?

## Status

**Open** — awaiting team decision.

## Why it matters

[[mcp-server|MCP server]] "Full SDK and public docs ship at V1." The form matters: a hosted developer portal (Mintlify, ReadMe, Stripe-style) signals enterprise readiness; a GitHub-only README signals startup. The choice also shapes the API-key issuance flow and the customer-success path. (see [[mcp-server]], [[pluggable-brain]])

## What we know so far

- V1 promise: full SDK + public docs.
- No platform commitment.
- OAuth 2.0 client-credentials flow is decided.

## What would resolve it

- Pick a docs hosting (Mintlify / ReadMe / docs site in Next.js / hosted GitHub Pages).
- Decide whether the SDK ships in TypeScript only or also Python / Go for internal firm builds.
- Define the API-key issuance flow (self-serve in admin dashboard vs ticket-based).

## Answer

_(pending)_

## Related

- [[mcp-server]]
- [[pluggable-brain]]
- [[consilium-v1-roadmap]]
