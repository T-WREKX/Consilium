---
title: Consilium · Product Brief
type: source
status: mature
tags: [consilium, product, market, hackathon]
raw: raw/product-brief.md
author: Consilium team
publication: Internal product document
published: 2026 (v1, hackathon stage)
ingested: 2026-05-12
re-ingested: 2026-05-12
created: 2026-05-12
updated: 2026-05-12
---

# Consilium · Product Brief

> Source file: [`raw/product-brief.md`](../raw/product-brief.md)

## Re-ingest note (2026-05-12)

Two meaningful diffs from the original brief:

1. **Business model section rewritten**: from *"Firm-wide license, tiered by firm size"* ($50K/$90K/$150K for 50–100 / 100–200 / 200–300 lawyers) → to *"**Practice-group license**, tiered by practice-group size"* ($25K/$50K/$85K for 10–25 / 25–50 / 50–100 litigators). Adds explicit **land-and-expand** framing with ~$200K ARR per firm at maturity. See [[consilium-business-model]].
2. **Target customer section reframed**: from *"Primary target: mid-size firms"* → to *"**Initial wedge**: mid-size firms"*, with an explicit expansion path (other practice groups → BigLaw → in-house legal → adjacent professional services) and a candid note on BigLaw fit (architecture supports it; GTM motion is what changes).

SAM math updated accordingly: ~$50K initial ACV per practice group → **$150M–$250M wedge SAM**.

The rest of the brief is identical to the original ingest. The product, architecture, and demo are unchanged.

## One-line summary

The canonical pitch for [[consilium]]: a privacy-first knowledge fabric for law firms that turns accumulated expertise into a queryable, governable, pluggable intelligence layer.

## Why it's here

Defines what Consilium is, who it's for, and why it wins. Anchors every entity and concept page that derives from product positioning.

## Key claims

- **The problem**: law firms lose institutional intelligence when lawyers leave; lawyers don't document because they bill in six-minute increments; [[attorney-client-privilege]] blocks public AI tools; existing legal AI is point solutions.
- **Estimated cost**: an AmLaw 200 firm loses **$15M–$40M annually** to knowledge fragmentation; senior partner departures can cost 5–10% of practice revenue.
- **The product**: a two-layer platform — **personal brain (local, private)** and **team-managed knowledge graph (governed cloud)** — surfaced through three graph views: personal, team-admin, and query-overlay.
- **The two-layer split**: privileged content never leaves the device unsanitized; the team layer holds only sanitized published insights.
- **The pluggable brain (V1)**: an MCP server endpoint exposes the team graph to Harvey, internal builds, Microsoft Copilot. *Consilium is the substrate that makes the rest of the firm's AI stack work.*
- **Scope discipline**: hackathon MVP vs V1 vs V2 is the most important section of the document.
- **Target customer (wedge, not ceiling)**: litigation practice groups in mid-size firms (50–300 lawyers). Buyer is the **[[knowledge-admin|KM Partner / KM Director]]**. Expansion path is structural: other practice groups → BigLaw → in-house legal → adjacent professional services. (revised 2026-05-12)
- **Market sizing**: TAM 175,000+ firms globally; **wedge SAM** at ~$50K initial ACV per practice group = **$150M–$250M**; SOM 2–5% of SAM in 3–5 years = $3M–$37M ARR. Full-firm penetration over years pushes meaningfully higher.
- **Business model**: **practice-group license**, tiered by practice-group size; **land-and-expand** to adjacent groups within firms; no per-seat. (revised 2026-05-12 from firm-wide license — see [[consilium-business-model]] and [[consilium-decision-history]] Phase 11)
- **Demo narrative**: capture → privacy/redaction → retrieval with graph overlay → preservation framing. Five minutes.
- **Why it wins the hackathon**: clearly enterprise, clearly AI-native, hits all four focus areas of Track 4 (Data & Intelligence), qualifies for the Gemini Award, demoable in five minutes.

## Sections / structure of the source

1. One-sentence pitch
2. The Problem
3. The Product (two layers, three graph views, pluggable brain)
4. MVP / V1 / V2 scope
5. Target Customer
6. The Buyer (and market sizing)
7. Business Model
8. Competitive Positioning
9. Why Consilium Wins the Hackathon
10. Demo Narrative
11. Closing

## Pages this source materially changed

- [[consilium]] — created as the canonical entity
- [[two-layer-architecture]], [[three-graph-views]], [[pluggable-brain]] — created
- [[attorney-client-privilege]] — created (framed as structural blocker for legal AI)
- [[harvey]], [[spellbook]], [[cocounsel]], [[glean]], [[notion]], [[imanage]], [[netdocuments]] — created in competitive map
- [[litigator]], [[practice-group-lead]], [[knowledge-admin]] — initial drafts
- [[acme-litigation-partners]] — created (demo firm)
- [[legal-ai-landscape]], [[competitive-moat]], [[consilium-business-model]], [[hackathon-judging-fit]], [[consilium-demo-narrative]] — created

## Contradictions or tensions

> ⚠ MVP simplification: the brief states published knowledge "auto-flows into the team graph (no Knowledge Admin approval step)" in MVP, while the [[knowledge-admin]] role exists in the data model. The PRD ([[consilium-product-requirements]]) reconciles this: the role exists but has the same permissions as Lawyer in MVP.

## Open questions raised

- Honest read on TAM: "Not a billion-dollar standalone market in three years by itself." Adjacent verticals (corporate legal, in-house teams, expert services) extend the trajectory — but at what timeline and capital cost?
- Sales cycles of 3–9 months for mid-size firms; partnership channels needed for the bottom end of SAM. Which partners?

## Related

- [[consilium-product-requirements]] — translates this brief into testable specs
- [[consilium-project-architecture]] — translates this brief into the system that ships
- [[consilium-design-guidelines]] — translates this brief into UI
