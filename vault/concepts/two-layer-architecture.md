---
title: Two-layer architecture
type: concept
status: active
tags: [architecture, privacy, consilium]
sources: [consilium-product-brief, consilium-project-architecture, consilium-context-dump]
created: 2026-05-12
updated: 2026-05-12
---

# Two-layer architecture

The defining architectural choice of [[consilium|Consilium]]. **Layer 1** is the personal brain (local, private, holds privileged content). **Layer 2** is the team-managed knowledge graph (governed cloud, holds only sanitized published insights). The boundary between them is enforced by the [[redaction-pipeline]] and by the lawyer's explicit approval gate.

**Historical note**: an earlier proposal had **three** layers — personal → practice-group → firm-wide. The middle and outer layers were collapsed into a single "team" layer for MVP clarity; *the firm-wide super-layer added complexity without demo value*. See [[consilium-decision-history]] Phase 7. (see [[consilium-context-dump]])

## Definition

- **Layer 1 — Personal Brain (local, private)**: each lawyer captures observations throughout the day (voice memos, text, images). AI auto-organizes captures into a personal knowledge graph linked to matters, parties, issues, precedents, concepts. Privileged content never leaves the device unsanitized. (see [[consilium-product-brief]])

- **Layer 2 — Team-Managed Knowledge Graph (governed cloud)**: when lawyers identify learnings worth sharing, they publish. AI-assisted redaction strips privileged content and client identifiers before publication. The shared graph becomes the team's collective intelligence — queryable by anyone on the team via a chatbot that grounds every answer in cited team-graph nodes.

## Key claims

- **The split is the privacy story.** [[attorney-client-privilege|Privilege]] is structurally compatible because privileged content never reaches Layer 2. (see [[consilium-product-brief]])
- **MVP storage**: Layer 1 lives in browser IndexedDB; Layer 2 lives in [[postgres-pgvector]]. (see [[consilium-project-architecture]])
- **V1 storage**: Layer 1 becomes markdown files on device + on-device [[gemma]] inference; Layer 2 is a per-firm single-tenant cloud.
- **The lawyer is the gatekeeper.** Side-by-side diff with manual approval. Auto-flow to Layer 2 without explicit approval would defeat the purpose.
- **MVP simplification**: in MVP the [[knowledge-admin|Knowledge Admin]] approval step is skipped; published knowledge auto-flows. V1 adds the admin approval queue between Layer 2 commit and team-graph publication.

## How Layer 1 and Layer 2 interact

```
Layer 1 (local, private)
    │
    │  capture
    ▼
[ Personal note ] ──── auto-organize ──── [ Personal graph node + edges ]
    │
    │  Lawyer clicks "Publish"
    ▼
[[redaction-pipeline]]   ←── two-pass MVP, four-pass V1
    │
    │  Lawyer approves
    ▼
Layer 2 (cloud, sanitized)
    │
[ Team graph node + edges ] ── retrievable by [[rag-query-pipeline]] ── chat answer
```

## Contrast with adjacent concepts

- **Not the same as on-prem vs cloud** — Consilium V1 is **per-firm single-tenant cloud** for Layer 2, not on-prem. The two-layer split is about *what content lives where*, not infrastructure ownership.
- **Distinct from data classification labels alone** — Consilium enforces the boundary architecturally, not by policy tags.

## Open questions

- Cross-Layer-1 queries (lawyer searches their own personal graph) vs cross-Layer-2 queries (lawyer asks the team graph) are unified at MVP; V1 documented but not built. How do "search across personal + team graphs simultaneously" work for [[attorney-client-privilege|privilege]] purposes?

## Sources

- [[consilium-product-brief]]
- [[consilium-project-architecture]]
- [[consilium-context-dump]]
