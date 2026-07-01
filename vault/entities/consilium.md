---
title: Consilium
type: entity
status: active
tags: [product, legal-ai, knowledge-management]
sources: [consilium-product-brief, consilium-product-requirements, consilium-project-architecture, consilium-design-guidelines, consilium-context-dump]
created: 2026-05-12
updated: 2026-05-12
---

# Consilium

Consilium is a privacy-first knowledge fabric for law firms that turns each firm's accumulated expertise into a queryable, governable, pluggable intelligence layer. It is **not another AI wrapper** — it is the substrate that makes every other AI tool a firm uses actually work for that firm.

**Codename history**: the product was originally called **[[stratum|Stratum]]** during the proposal phase. Renamed to Consilium before any user-facing material was published. The internal mental model is still "stratum" (layered architecture); the product is "Consilium." See [[consilium-decision-history]] for the full reasoning chain.

## Key facts

- **Category**: vertical legal AI — firm-level knowledge platform. (see [[consilium-product-brief]])
- **Two layers**: [[two-layer-architecture|personal brain (local, private) + team-managed knowledge graph (governed cloud)]]. Privileged content never leaves the device unsanitized.
- **Three surfaces**: [[three-graph-views|personal graph, team-admin graph, query-overlay graph]].
- **Hackathon stage** (six-day MVP): React + Vite SPA, single Express backend, single Postgres with pgvector, Gemini cloud APIs, IndexedDB for personal notes. (see [[consilium-project-architecture]])
- **V1 stage** (first paying customers, post-hackathon): native desktop ([[tauri]]) + native mobile, on-device [[gemma]] for personal-layer extraction, per-firm single-tenant cloud, [[mcp-server|MCP server]] endpoint, SSO, audit logs, four-pass [[redaction-pipeline]].
- **Target customer (wedge, not ceiling)**: litigation practice groups in mid-size firms (50–300 lawyers). Expansion path goes structurally to other practice groups within firm → BigLaw → in-house legal → adjacent professional services. (see [[consilium-product-brief]])
- **Buyer**: [[knowledge-admin|KM Partner / KM Director]]; validator is the [[practice-group-lead|Practice Group Lead]].
- **Business model**: [[consilium-business-model|practice-group license, tiered by practice-group size]] — $25K/$50K/$85K ARR for 10–25 / 25–50 / 50–100 litigators at V1. Land-and-expand; full firm deployment at maturity reaches ~$200K ARR per firm. (Revised 2026-05-12 from a firm-wide license — see [[consilium-decision-history]] Phase 11.)
- **Brand personality**: modern, sleek, minimal, confident, institutional, intelligent — not playful, no emoji in microcopy. (see [[consilium-design-guidelines]])
- **Hackathon competitive fit**: Track 4 (Data & Intelligence) on all four focus areas; Gemini Award eligible. (see [[hackathon-judging-fit]])

## What Consilium is, in one paragraph

A senior litigator at a 200-lawyer firm has spent fifteen years building intuition about judges, opposing counsel, case strategies, settlement patterns. When they retire, that institutional intelligence vanishes overnight. Consilium is the layer that captures it. Lawyers dictate observations between meetings; an AI pipeline structures them into a personal knowledge graph linked to matters, parties, issues, precedents. When the lawyer publishes, a [[redaction-pipeline|redaction pipeline]] strips client identifiers and generalizes specifics so the strategic insight reaches the team graph without exposing privileged content. The team graph is queryable by anyone on the team via a chat that grounds every answer in cited nodes, with a [[query-overlay-animation|signature visual moment]] where the graph fades in and cited nodes pulse as the answer streams. In V1, an [[mcp-server|MCP endpoint]] makes the team graph available to [[harvey|Harvey]], [[cocounsel|CoCounsel]], Microsoft Copilot, and any AI tool the firm uses.

## Demo firm and accounts

Single hard-coded firm [[acme-litigation-partners]] with one practice group, three demo accounts:

- `litigator@acme.law` / `demo` — [[litigator]]
- `lead@acme.law` / `demo` — [[practice-group-lead]]
- `admin@acme.law` / `demo` — [[knowledge-admin]]

## Capture surfaces (MVP)

- **Text** — clean editor, markdown shortcuts, autosave every 500ms.
- **Audio** — MediaRecorder, 5-minute cap, WebM/Opus; transcribed by [[whisper]].
- **Image** — PNG/JPG/WebP up to 10MB; [[gemini|Gemini Vision]] extracts text and structural description.

Out of MVP: browser extension, calendar prompts, email forward, mobile native.

## AI pipelines

- [[auto-organization-pipeline]] — single Gemini Pro call returning entities + classification + privilege flag. Sub-5-second latency budget.
- [[redaction-pipeline]] — two-pass MVP ([[microsoft-presidio|Presidio]] tokenization → Gemini generalization) plus a [[insight-preservation-score|preservation score]]. Four-pass at V1.
- [[rag-query-pipeline]] — embed query → top-8 vector search ([[postgres-pgvector]]) → 1-hop graph expansion → grounded synthesis with inline node-ID citations.

## Relations

- **Built on**: [[gemini]], [[whisper]], [[microsoft-presidio]], [[postgres-pgvector]], [[react-vite]], [[cytoscape-js]]; (V1) [[gemma]], [[tauri]]
- **Demo firm**: [[acme-litigation-partners]]
- **Personas**: [[litigator]], [[practice-group-lead]], [[knowledge-admin]]
- **Competes with (positioning, not 1:1)**: see [[legal-ai-landscape]] — [[harvey]], [[spellbook]], [[cocounsel]], [[glean]], [[notion]]
- **Integrates with (V1)**: [[imanage]], [[netdocuments]], Microsoft 365, Slack/Teams, Westlaw/LexisNexis
- **Inspired in spirit by**: [[obsidian]] (graph aesthetic), [[harvey|Harvey]] (legal credibility), [[notion]] (density and structured editing)

## Open questions

- TAM honest read: not a billion-dollar standalone market in three years; adjacent verticals (corporate legal, in-house teams) extend the trajectory — timeline and capital path unspecified.
- Which channel partners reach the long tail of mid-size firms that outsource KM to consultants?

## Sources

- [[consilium-product-brief]]
- [[consilium-product-requirements]]
- [[consilium-project-architecture]]
- [[consilium-design-guidelines]]
- [[consilium-context-dump]] — the reasoning chain and decision history
