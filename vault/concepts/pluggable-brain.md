---
title: Pluggable brain
type: concept
status: active
tags: [positioning, mcp, consilium, v1]
sources: [consilium-product-brief, consilium-project-architecture]
created: 2026-05-12
updated: 2026-05-12
---

# Pluggable brain

[[consilium|Consilium]]'s strategic positioning: **not another AI app to add to the firm's stack — the substrate that makes the rest of the stack actually work**. The team-managed graph exposes an [[mcp-server|MCP server]] endpoint so any AI tool the firm uses (Harvey, internal builds, Microsoft Copilot) can plug in for grounded, firm-specific responses.

## Definition

"Pluggable brain" = the team graph as a firm-specific knowledge endpoint that other AI tools consume via MCP, becoming firm-aware without each tool maintaining its own firm corpus.

## Key claims

- **V1, not MVP.** The MCP endpoint is documented but not built for the hackathon. (see [[consilium-product-requirements]] §3 "Do Not Build" list)
- **Why this matters for sales**: enterprise AI proliferation is the dominant trend; firms don't want yet another silo. The pluggable positioning grows in value as the firm adopts more AI tools. (see [[competitive-moat]])
- **Closing line of the [[consilium-product-brief|brief]]**: *"Consilium is not another AI wrapper. It is the missing layer that makes every other AI tool the firm uses actually work."*

## How it works (V1)

[[mcp-server]] exposes three tools and three resources:

- **Tools**: `query(question, max_results)`, `get_node(id)`, `list_topics()`.
- **Resources**: `team-graph`, `team-graph/topics`, `team-graph/recent-insights`.
- **Auth**: OAuth 2.0 client-credentials with scoped tokens per integration; tokens expire in 24 hours.
- **Rate limits**: configurable per firm, default 1000 queries/hour per integration.

## Likely consumers (V1)

- [[harvey]] — first-listed candidate
- [[cocounsel]] — research workflows
- [[spellbook]] — drafting workflows
- **Microsoft Copilot** — generic enterprise assistance, firm-grounded
- **Internal firm AI builds** — any custom RAG the firm builds against its own data

## Why this is a moat

- **Vertical depth** (legal-specific schema and redaction posture) cloud-first competitors cannot easily replicate.
- **Within-firm network effects** — every captured insight makes the team graph more valuable to every connected tool; switching cost rises.
- **Inverts the "AI sprawl" problem** — firms multiply AI tools without multiplying knowledge silos.

## Open questions

- Has any of the named consumer products (Harvey, CoCounsel, Copilot) published MCP client support? The pluggable story depends on it.

## Sources

- [[consilium-product-brief]]
- [[consilium-project-architecture]]
