---
title: Consilium · Full Context Dump
type: source
status: mature
tags: [consilium, history, decisions, rationale]
raw: raw/context-dump.md
author: Consilium team (session capture)
publication: Internal context document
published: 2026 (hackathon stage)
ingested: 2026-05-12
re-ingested: 2026-05-12
created: 2026-05-12
updated: 2026-05-12
---

# Consilium · Full Context Dump

> Source file: [`raw/context-dump.md`](../raw/context-dump.md)

## Re-ingest note (2026-05-12)

Phase 11 added: **"Refining Business Model and Market Positioning."** Documents the post-MVP-lock revision from firm-wide license to **practice-group license + land-and-expand**, and the reframe of mid-size firms from "primary target" to **"wedge, not the only market"** with an explicit expansion path. The Decisions Index and Rejected Ideas Index were updated correspondingly. Pages updated downstream: [[consilium-business-model]] (major rewrite), [[consilium-v1-roadmap]] (pricing tiers), [[consilium]] (business-model line), [[knowledge-admin]] (economic-decision section), [[consilium-decision-history]] (Phase 11 added), [[consilium-rejected-ideas]] (firm-wide license entry added), [[consilium-product-brief]] (re-ingest note).

## One-line summary

The complete chronological record of how [[consilium|Consilium]] was conceptualized — from "is Obsidian mainly for personal use?" through **eleven** phases to the locked MVP plus a business-model refinement — capturing not just *what* was decided but *why every decision was made the way it was*, including the [[consilium-rejected-ideas|ideas explicitly rejected]] and the [[stratum|original codename]].

## Why it's here

The four specification documents (brief, PRD, architecture, design) describe **what** Consilium is. This document describes **why**. It is the source of truth for the reasoning chain behind every load-bearing decision, and the place to look when execution details threaten to crowd out strategy.

## Key claims

- **Business model is now practice-group license with land-and-expand** (revised 2026-05-12 from firm-wide license). $25K/$50K/$85K ARR for 10–25 / 25–50 / 50–100 litigators; ~$200K at maturity per firm across multiple practice groups. The model **matches what is actually sold** (one practice group at a time, starting with litigation); firm-wide procurement is too slow. See [[consilium-business-model]].
- **Mid-size firms are the wedge, not the only market.** Expansion path is structural: other practice groups (corporate, IP, regulatory) → BigLaw / AmLaw 200 → in-house legal teams → adjacent professional services. The product fits BigLaw architecturally; what changes is GTM motion.
- **Consilium began as curiosity about [[obsidian|Obsidian]]** — specifically: "is Obsidian mainly for personal use? are there other use cases for the 2nd brain?" — which exposed the unsolved personal-to-team handoff problem.
- **There are really two products being conflated** in the broader KM space: **Product A** (privacy-first for regulated industries, defensible moat, smaller market) and **Product B** (team-intelligence for consulting/ops, larger market, more competitive). Mixing them makes the thesis fuzzy.
- **Healthcare was the original Product A target**; was abandoned after the four-tier architecture turned out to be an "AI scribe with PHI scrubbing" rather than a second brain (Abridge, Suki, Nuance DAX competitors). Resurrected after the legal pivot in two-layer form.
- **The hackathon pivot** (WeMakeDevs Cognee Hackathon, theme "Transforming Enterprise through AI") reframed everything for enterprise. The user agreed: "horizontal enterprise" with the team graph as a **[[pluggable-brain|pluggable brain]]**.
- **Vertical evaluation** ranked Legal > Healthcare > Defense for the hackathon. Legal wins because: [[harvey|Harvey]] at $3B (2025) validates the space, [[attorney-client-privilege|privilege]] structurally blocks generic AI, knowledge is inherently relational, buyers have money, sales cycles are tractable. Healthcare was crowded with AI scribes; defense required FedRAMP/IL4-IL6 + clearances.
- **The name Stratum became Consilium** — Stratum (layered architecture) was the codename; Consilium (lattice of growth) became the user-facing name. See [[stratum]].
- **Three layers collapsed to two for MVP clarity** — original was personal → practice-group → firm-wide; current is personal → team. The firm-wide super-layer added complexity without demo value.
- **The adoption strategy went through one major revision** — initial five-layer model (Personal Utility, Reciprocity Gates, Career Capital, Firm-Level Mandates, Compounding Defaults) was rejected as partly coercive. Final shape: **two pillars + one mandatory exception + one reinforcing dynamic**. See [[adoption-strategy]].
- **[[veea|Veea]]'s [[lobster-trap|Lobster Trap]]** (deep prompt-inspection DPI proxy) was considered as either a Track 1 reposition or a Track 4 integration component. **Path A chosen**: stay in Track 4, defer Lobster Trap integration as optional.
- **Gemini API path changed mid-session**: the WeMakeDevs Cognee Hackathon organizers relaxed the Google AI Studio requirement. Consilium uses the **Gemini API directly**. Gemini Award eligibility unchanged.
- **Hackathon time split**: 4 days build, 2 days pitch/video/slides. Balanced rather than build-heavy because WeMakeDevs Cognee Hackathon judges via async submission with video and slides.
- **Rewind.ai and screen-capture-style ideas were explicitly rejected** — Rewind is struggling commercially despite huge funding; consulting firms won't allow always-on screen capture; two-party consent laws make audio capture of meetings a legal hazard.
- **Per-seat pricing rejected** — it creates wrong incentives (firms gate access to control cost), killing network effects.
- **The MVP simplifications** are all documented: 2-pass redaction instead of 4, IndexedDB instead of markdown files, cloud Gemini instead of on-device Gemma, Knowledge Admin auto-approve instead of approval workflow, single hardcoded firm.

## Sections / structure of the source

1. Starting point: curiosity about Obsidian
2. Phase 1 — Surveying the KM landscape
3. Phase 2 — Identifying the market gap
4. Phase 3 — From vague idea to initial thesis
5. Phase 4 — The healthcare detour
6. Phase 5 — Reframing for enterprise (hackathon pivot)
7. Phase 6 — Picking the vertical: legal wins
8. Phase 7 — Defining the product (Stratum → Consilium)
9. Phase 8 — The adoption strategy problem
10. Phase 9 — Hackathon-specific strategy
11. Phase 10 — Locking the MVP
12. **Phase 11 — Refining Business Model and Market Positioning** *(new 2026-05-12)*
13. Decisions Index (table)
14. Rejected Ideas Index (table)
15. Glossary of Concepts
16. The Conceptual Through-Line
17. What This Document Is For

## Pages this source materially changed

- **Created**: [[stratum]] (original codename), [[lobster-trap]], [[veea]], [[rewind-ai]], [[wemakedevs-cognee-hackathon]] (entities); [[adoption-strategy]], [[ethical-wall]] (concepts); [[consilium-decision-history]], [[consilium-rejected-ideas]] (topics)
- **Updated**: [[consilium]] (codename history, $3B Harvey 2025 reference, decision-history backlink), [[harvey]] (2025 valuation note), [[gemini]] (Gemini API direct, not via AI Studio), [[two-layer-architecture]] (collapse from three layers historical note), [[legal-ai-landscape]] (Rewind.ai rejected-reference note), [[hackathon-judging-fit]] (Path A vs Path B decision), [[consilium-mvp-scope]] (4/2 day split)

## Contradictions or tensions

> ⚠ **Local-first**: the dump is candid that the local-first claim is "partly a marketing story" in MVP (data in IndexedDB, AI in cloud) and "literal" only in V1 (Gemma on-device, markdown files on disk). This matches [[local-first-architecture]]'s existing tension note; the dump strengthens it by quoting the internal framing.

> ⚠ **Glossary self-reference**: the Glossary defines `Pluggable brain` twice (once mid-list, once at the end). Cosmetic in source; does not affect the wiki.

> ⚠ **Adoption strategy vs PRD silence**: the dump's two-pillar adoption strategy (and the departure-capture exception) is the canonical adoption position, but the [[consilium-product-requirements|PRD]] does not specify departure-capture mechanics for MVP. Treated as V1+ here.

## Open questions raised

- **Practice Group Lead role in MVP**: the dump says "only Lawyer is functionally distinct in MVP," reaffirming that the Lead account does not exercise unique UI. [[practice-group-lead]] already flags this.
- **Departure-capture mechanics**: when does the structured offboarding extraction actually happen, and what does it look like? Not specified.
- **WeMakeDevs Cognee Hackathon judging weights**: 4-day build vs 2-day pitch is asserted, but the judging-criteria weight between live working demo and submitted video is not pinned down.
- **Lobster Trap deferral**: the optional integration is Path A's deferred work; if time appears at day 5, is the demo cost worth the security-positioning value?

## Related

- [[consilium-product-brief]] — what this dump's reasoning produced
- [[consilium-product-requirements]] — the spec the reasoning landed on
- [[consilium-project-architecture]] — the build sheet the reasoning landed on
- [[consilium-design-guidelines]] — the look-and-feel the reasoning landed on
- [[consilium-decision-history]] — the topic-level synthesis of the phases
- [[consilium-rejected-ideas]] — the explicit "don't regress" list
