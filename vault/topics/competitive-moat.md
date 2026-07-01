---
title: Competitive moat
type: topic
status: active
tags: [consilium, strategy, moat]
sources: [consilium-product-brief]
created: 2026-05-12
updated: 2026-05-12
---

# Competitive moat

The defensible advantages [[consilium|Consilium]] claims, as articulated in the brief. Four pillars: vertical depth, privacy architecture, pluggable positioning, network effects.

## The four pillars

### 1. Vertical depth in legal

Consilium is **purpose-built for legal**: privilege protection, ethical walls (V1+), audit logs, the [[redaction-pipeline]], the legal-typed [[consilium-data-model|node and edge taxonomy]] (matters, parties, judges, statutes, precedents). Generic team-knowledge tools ([[notion]], Confluence) cannot easily retrofit this — schema and compliance posture are foundational, not features.

### 2. Privacy architecture cloud-first competitors cannot easily replicate

The [[two-layer-architecture]] and the [[local-first-architecture]] are not bolt-ons. They are foundational. [[glean|Glean]]'s cloud-first model is **incompatible with most firm policies** around [[attorney-client-privilege|privilege]]. Replicating Consilium's posture would require Glean to rebuild large portions of its stack.

### 3. Pluggable-brain positioning grows in value as enterprise AI proliferates

Every additional AI tool the firm adopts increases the value of having Consilium under it. The [[mcp-server]] turns Consilium from "one more AI app" into the **substrate** every other AI tool consumes. This **inverts the AI sprawl problem** for firms: more tools, not more silos.

### 4. Within-firm network effects (and switching cost)

Every captured insight makes the team graph more valuable. Every additional connected AI tool (Harvey, CoCounsel, Copilot, internal builds) increases the dependency. By the time a firm has 18 months of accumulated team-graph content and three external tools grounded against it, the cost of switching to a competitor includes losing the graph and re-grounding every tool.

## Risks to the moat

- **A regulated cloud-first competitor** (Glean ships single-tenant on-prem-equivalent for legal) narrows the architectural distinction. Consilium would lean harder on vertical depth.
- **A point-tool consolidator** (Harvey acquires a knowledge layer) compresses the pluggable-brain story.
- **MCP commoditizes** — every legal-tech vendor exposes an MCP endpoint. Consilium's moat shifts from "we have the endpoint" to "we have the graph the endpoint surfaces."

## Why Consilium wins the hackathon (related, not the moat itself)

- **Clearly enterprise**, clearly AI-native.
- **Real, urgent, expensive problem** with cited $15M–$40M annual cost per AmLaw 200 firm.
- **Technically substantive** ([[knowledge-graph-extraction]], graph-augmented RAG, two-layer privacy).
- **Demoable in five minutes** ([[consilium-demo-narrative]]).
- **Hits every focus area of Track 4 (Data & Intelligence)**. (see [[hackathon-judging-fit]])
- **Qualifies for the Gemini Award**.
- **Hot, well-funded vertical** ([[harvey|Harvey]] at $3B).

## Sources

- [[consilium-product-brief]]
