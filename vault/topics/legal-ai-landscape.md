---
title: Legal AI landscape (as Consilium sees it)
type: topic
status: active
tags: [market, competitive, consilium]
sources: [consilium-product-brief, consilium-context-dump]
created: 2026-05-12
updated: 2026-05-12
---

# Legal AI landscape

How [[consilium|Consilium]] frames the competitive map. Five categories, each with a distinct relationship to Consilium. Some are competitors, some are complements, some are integration targets.

## Synthesis

Legal AI in 2026 is dominated by **point tools** that solve narrow workflows (contract review, research, drafting) and **incumbent infrastructure** (DMS, enterprise search) that predates the AI wave. None of them solve the underlying problem: the firm has **no living, queryable layer of its own accumulated intelligence**. Consilium is positioned as the missing layer — *not a competitor to point tools, but the substrate that makes them firm-aware* via the V1 [[mcp-server]] endpoint and the [[pluggable-brain]] story.

## The five categories

### 1. Legal AI point tools

- Examples: [[harvey]] ($3B reference comp), [[spellbook]] (drafting), [[cocounsel]] (research), Eve, Paxton.
- **Consilium differs**: it is the firm's knowledge substrate that plugs *into* these tools, not against them. V1 MCP integration is the channel.

### 2. Document management systems (DMS)

- Examples: [[imanage]], [[netdocuments]].
- **What they store**: finished work product.
- **What they miss**: the reasoning, the strategy, the why — that stays in human heads.
- **Consilium differs**: captures the reasoning DMS systems never see; integrates with them rather than replacing.

### 3. Enterprise search

- Examples: [[glean]], Hebbia.
- **What they do**: index the firm's data and answer questions over it.
- **Why it doesn't fit law firms**: cloud-first models are incompatible with [[attorney-client-privilege|privilege]]. Consilium is **privacy-architected from day one**.

### 4. Personal knowledge tools

- Examples: [[obsidian|Obsidian]], Roam, [[notion|Notion]] (personal use).
- **What they do**: capture and organize personal knowledge with markdown + links.
- **Consilium differs**: adds a **firm-level governed publishing layer** these tools lack; built for legal compliance from day one.
- **Rejected reference**: [[rewind-ai|Rewind.ai]] (always-on screen+audio capture) was explicitly considered and **rejected** as a model — procurement-blocked in enterprise; two-party consent legal hazard; easier capture creates more noise rather than solving knowledge sharing. (see [[consilium-rejected-ideas]])

### 5. Generic team knowledge

- Examples: [[notion|Notion]] (team use), Confluence.
- **What they do**: store team documentation.
- **Consilium differs**: purpose-built for legal — privilege protection, ethical walls, audit logs, citation-grounded retrieval.

## The Consilium claim in one line

*"Consilium is not another AI wrapper. It is the missing layer that makes every other AI tool the firm uses actually work."* — see [[consilium-product-brief]] closing.

## Tensions and open questions

- **Are point tools really not competitors?** Strategically Consilium claims complementarity. Commercially, every AI dollar a firm spends on Harvey is a dollar not spent on Consilium. The honest answer: Consilium competes for *budget attention* even where it does not compete on *workflow*.
- **What if Glean ships single-tenant on-prem for legal?** The architectural distinction narrows; Consilium would need to lean harder on legal-vertical depth (redaction posture, schema, audit).
- **Who occupies the long tail of mid-size firms?** Many firms outsource KM to consultants. Channel-partner go-to-market is mentioned but not detailed.

## Sources

- [[consilium-product-brief]]
- [[consilium-context-dump]]
