---
title: Hackathon judging fit (Track 4 + Gemini Award)
type: topic
status: active
tags: [consilium, hackathon, judging]
sources: [consilium-product-brief, consilium-context-dump]
created: 2026-05-12
updated: 2026-05-12
---

# Hackathon judging fit

How [[consilium|Consilium]] maps to **Track 4 (Data & Intelligence)** focus areas and qualifies for the **Gemini Award** at the [[wemakedevs-cognee-hackathon|WeMakeDevs Cognee Hackathon]] AI & Big Data Expo. The argument from the [[consilium-product-brief|brief]] is that Consilium hits all four Track 4 focus areas, not just one.

## Track 4 mapping

| Track 4 focus area | Consilium surface |
|---|---|
| RAG systems over proprietary or multi-source data | The team graph with [[citation-grounding|citation-grounded retrieval]] |
| AI-powered data pipelines and validation | The capture-to-structured-graph pipeline ([[auto-organization-pipeline]]) |
| Analytics agents for natural language querying | Conversational query of the team brain ([[rag-query-pipeline]]) |
| Knowledge graph extraction from documents | [[knowledge-graph-extraction|The technical core]] |

## Gemini Award

[[gemini|Gemini]] powers extraction, redaction, and synthesis throughout Consilium:

- **Pro**: entity extraction, classification, [[redaction-pipeline|redaction Pass 2 generalization]], [[rag-query-pipeline|RAG synthesis]].
- **Flash**: confidence scoring, [[insight-preservation-score]].
- **Vision**: image-to-text for image capture.
- **`text-embedding-004`**: embeddings stored in [[postgres-pgvector]].

Award fit is strong.

> Access path note: Consilium calls the **Gemini API directly**, not via Google AI Studio — the AI-Studio requirement was relaxed by WeMakeDevs Cognee Hackathon organizers mid-session. Eligibility unchanged. (see [[consilium-context-dump]] §10 update)

## Track decision: Path A (Track 4) vs Path B (Track 1)

A live debate during planning. [[veea|Veea]]'s [[lobster-trap|Lobster Trap]] is an MIT-licensed DPI proxy that could either:

- **Path A — stay Track 4**, integrate Lobster Trap as the policy-enforcement layer for the publish-to-team flow (optional component).
- **Path B — reposition to Track 1** (Agent Security & AI Governance), frame the entire product as "AI governance infrastructure for law firms."

**Path A chosen.** Track 4 is the more natural fit; Track 1 would be crowded with pure security/governance tools and Consilium is most naturally a knowledge layer, not a governance layer. Lobster Trap integration is deferred as optional. If a sliver of day 5 time appears, the integration adds an enterprise-security talking point. (see [[consilium-context-dump]] §9)

## Time budget

**4 days build, 2 days pitch/video/slides.** Balanced rather than build-heavy, because WeMakeDevs Cognee Hackathon judges via async submission with video and slides — submission assets carry weight comparable to the demo URL itself. (see [[consilium-context-dump]] §9)

## What makes the demo land

- **It is clearly enterprise.** Not a consumer app, not a developer tool — a vertical SaaS targeting law firms with named buyers and concrete ARR.
- **It is clearly AI-native.** AI is not bolted on; it is the product. Remove it and the product does nothing.
- **It solves a real, urgent, expensive problem.** $15M–$40M per AmLaw 200 firm; senior-partner departures cost 5–10% of practice revenue.
- **It is technically substantive.** Graph extraction + graph-augmented RAG + privacy-preserving redaction + on-device V1 path. Multiple non-trivial pieces working together.
- **It is demoable in five minutes.** Four-beat narrative with a [[query-overlay-animation|signature visual moment]] as the climax.
- **It targets a hot, well-funded vertical.** [[harvey|Harvey]] at $3B validates the space.

## Pre-empt likely judge questions

- *"What stops [[harvey]] from building this?"* → vertical depth + pluggable positioning. Harvey is a consumer of the MCP endpoint, not a competitor. (Practiced answer.)
- *"What about [[glean]]?"* → privilege architecture is foundational, not retrofittable. Glean's cloud-first model is incompatible with firm policy.
- *"What's the moat after 2 years?"* → [[competitive-moat|four pillars]]: vertical depth, privacy architecture, pluggable positioning, within-firm network effects.
- *"Is the local-first claim real?"* → architecturally yes (notes in IndexedDB; redaction before any cloud call); inference-path no in MVP, yes in V1 with [[gemma]] on-device. **Honesty wins.**

## Sources

- [[consilium-product-brief]]
- [[consilium-context-dump]]
