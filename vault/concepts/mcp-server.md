---
title: MCP server (Consilium V1)
type: concept
status: active
tags: [v1, integration, mcp, consilium]
sources: [consilium-project-architecture, consilium-product-brief, consilium-product-requirements]
created: 2026-05-12
updated: 2026-05-12
---

# MCP server (Consilium V1)

The Model Context Protocol endpoint that turns [[consilium|Consilium]] into the [[pluggable-brain|pluggable brain]] for the firm's AI stack. External AI tools ([[harvey]], [[cocounsel]], [[spellbook]], Microsoft Copilot, internal builds) authenticate and query the firm's accumulated knowledge.

**V1 only.** Documented in the architecture but **explicitly not built for MVP** (see [[consilium-product-requirements]] §3 "Do Not Build" list).

## Endpoint shape

```
mcp://consilium.firm.com/

Resources:
  - team-graph                        (full firm knowledge corpus)
  - team-graph/topics                 (clusters and themes)
  - team-graph/recent-insights        (most recent published)

Tools:
  - query(question, max_results=10)   → ranked nodes with grounding citations
  - get_node(id)                      → single node detail + neighbors
  - list_topics()                     → topical cluster summary
```

(see [[consilium-project-architecture]] §7)

## Auth

OAuth 2.0 **client-credentials flow** with scoped tokens per integration. Tokens expire in **24 hours**. Rate limits configurable per firm; default **1000 queries/hour per integration**.

## Why MCP, not REST

MCP is becoming the de-facto standard for tool-side LLM context exposure. Choosing MCP positions Consilium to be consumed natively by future-versioned Claude, ChatGPT, Copilot, Harvey, and internal builds without per-integration glue.

## Strategic role

The MCP endpoint is the **commercial substrate** behind the [[pluggable-brain]] positioning. Every additional AI tool the firm adopts increases the value of having Consilium under it — a within-firm network effect.

## Out of MVP

The MVP demo can claim the pluggable-brain story as part of the V1 vision, but no MCP code ships. See [[consilium-demo-narrative]] §4 ("close") for the framing.

## Open questions

- Has any of the named consumers (Harvey, CoCounsel, Copilot) published MCP client support that Consilium can target at V1 launch?
- Full SDK and public docs ship at V1 — what is the docs surface (developer portal, hosted reference, both)?

## Sources

- [[consilium-project-architecture]]
- [[consilium-product-brief]]
- [[consilium-product-requirements]]
