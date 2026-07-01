---
title: Consilium · Product Requirements Document
type: source
status: mature
tags: [consilium, prd, mvp, scope]
raw: raw/product-requirements.md
author: Consilium team
publication: Internal PRD
published: 2026 (v1, hackathon stage)
ingested: 2026-05-12
created: 2026-05-12
updated: 2026-05-12
---

# Consilium · Product Requirements Document

> Source file: [`raw/product-requirements.md`](../raw/product-requirements.md)

## One-line summary

Tags every feature **[MVP] / [V1] / [V2] / [OUT]** so engineers know exactly what to build for the six-day hackathon and what not to.

## Why it's here

The authoritative scope document. When the brief is ambiguous, the PRD wins. When implementation is uncertain, the PRD provides acceptance criteria. The "Do Not Build" list is load-bearing.

## Key claims

- **Three personas**: [[litigator|Litigator]] (primary), [[practice-group-lead|Practice Group Lead]] (validator), [[knowledge-admin|Knowledge Admin]] (V1 buyer-aligned). In MVP, Lead and Lawyer have the same permissions; the admin dashboard ships in V1.
- **Three demo accounts**: `litigator@acme.law`, `lead@acme.law`, `admin@acme.law` — password `demo`. Single hard-coded firm: [[acme-litigation-partners]].
- **Capture surfaces**: text, audio ([[whisper]], 5-minute cap, WebM/Opus), image ([[gemini|Gemini Vision]], 10MB PNG/JPG/WebP).
- **[[auto-organization-pipeline]]**: single Gemini Pro call doing entity extraction + classification + privilege flagging in under 5 seconds.
- **Personal graph view**: Obsidian-style force-directed, [[cytoscape-js]], supports 100+ nodes cleanly, 500-node graceful degradation, sub-2s settle.
- **[[redaction-pipeline]]** is the "wow moment of the demo. It must be visually polished." Two-pass MVP: [[microsoft-presidio|Presidio]] (Pass 1) → Gemini Pro generalization (Pass 2) → [[insight-preservation-score]] (single Gemini Flash call).
- **MVP simplification**: Knowledge Admin approval step is **skipped**. Published knowledge auto-flows to the team graph. Admin role exists in the data model; admin dashboard is V1.
- **Chat with team brain**: ChatGPT-style with citations. Refusal triggers when no nodes above 0.75 similarity. Streaming response begins within 3 seconds.
- **[[query-overlay-animation]]**: chat dims to 30%, team graph fades in at viewport center, cited nodes pulse to full opacity (one per 150ms in rank order), connecting edges illuminate to `accent-primary`, overlay fades back as response streams.
- **Confidence indicator**: high / medium / low based on count and similarity of retrieved nodes.
- **Seed data is mandatory**: 15–30 published insights spanning judge tendencies, opposing counsel, motion practice, expert witness handling, settlement, procedural lessons. The seeded query *"What has our firm learned about cross-examining expert witnesses on damages calculations?"* MUST work.
- **The "Do Not Build" list** explicitly excludes MCP server, SSO, mobile native, on-device LLM, multi-firm tenancy, approval workflows, browser/calendar/email capture, audit-log UI from MVP.
- **V1 spec**: documented but not built — Knowledge Admin approval workflow, [[redaction-pipeline|four-pass redaction]], on-device [[gemma]], [[imanage]]/[[netdocuments]] integration, [[mcp-server]], audit logs, 7-year retention, SOC 2 in progress.
- **Hackathon "done"** = a 12-item checklist from logged-in accounts to "demo can be executed in under 5 minutes."

## Sections / structure of the source

1. How to read (scope tag conventions)
2. Users and Roles
3. Hackathon MVP Feature Specification (auth, capture, AI organization, personal graph, publish/redact, team graph, chat, seed data)
4. Out of MVP Scope (explicit "Do Not Build" list)
5. V1 Specification
6. Success Metrics
7. Demo Script (5 minutes)
8. Acceptance Criteria Summary

## Pages this source materially changed

- [[consilium-mvp-scope]], [[consilium-v1-roadmap]], [[consilium-v2-vision]] — created
- [[consilium-demo-narrative]] — refined with 30-second-per-beat timing
- [[litigator]], [[practice-group-lead]], [[knowledge-admin]] — filled in
- [[redaction-pipeline]] — two-pass spec with side-by-side diff and preservation score
- [[auto-organization-pipeline]] — single-call structured-output spec
- [[query-overlay-animation]] — visual choreography
- [[citation-grounding]], [[insight-preservation-score]] — created

## Contradictions or tensions

> ⚠ Tension with the brief: brief mentions "AI-assisted redaction strips privileged content and client identifiers before publication" implying redaction is automatic. PRD makes lawyer approval explicit and required.

## Open questions raised

- What does the Practice Group Lead actually *do* in MVP beyond using the same UI as Lawyer? PRD says "same permissions"; the demo accordingly does not exercise this role meaningfully.
- The seeded canonical query is hardcoded; what happens when judges ask a different question? Refusal path is specified but not rehearsed.

## Related

- [[consilium-product-brief]] — what the PRD implements
- [[consilium-project-architecture]] — how each acceptance criterion is realized in code
- [[consilium-design-guidelines]] — what each acceptance criterion looks like
