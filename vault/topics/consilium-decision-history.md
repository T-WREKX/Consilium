---
title: Consilium decision history (how we got here)
type: topic
status: active
tags: [consilium, history, decisions]
sources: [consilium-context-dump]
created: 2026-05-12
updated: 2026-05-12
---

# Consilium decision history

The reasoning chain that produced [[consilium|Consilium]] — distilled from [[consilium-context-dump]]. Use this page to answer questions like *"why is Consilium legal and not healthcare?"* or *"why did the three-layer architecture become two?"* without re-reading the entire context dump.

## The arc, in ten phases

### Phase 0 — Obsidian curiosity

The seed question: *"is Obsidian mainly for personal use? are there other use cases for the 2nd brain?"* This exposed the **personal-to-team handoff** as the structural gap in the [[obsidian]]/Notion/Roam space.

### Phase 1 — Surveying the KM landscape

[[notion|Notion]], Tana, Capacities, AFFiNE, Anytype; Mem, Reflect, Saga; Logseq, AppFlowy, SiYuan, Trilium; [[glean|Glean]], Hebbia, Guru, Slab. **The fundamental tension**: personal note-taking thrives on idiosyncratic structure; team brains need consistency and shared vocabulary. Force one into the other and adoption breaks.

### Phase 2 — Identifying the market gap

Eight leverage points named. The strongest combination: **AI-native + local-first/private + vertical + solving the personal-to-shared handoff**. *Distribution and habit are the real moats.*

### Phase 3 — From vague idea to initial thesis

First concrete thesis. Therapists named as a candidate vertical. Several pieces stress-tested:

- "Therapists and medicine" is two markets, pick one.
- Pure local-only AI loses to cloud frontier models on capability; hybrid is the realistic shape.
- "Publish to team" with PHI-stripping is the **hardest technical piece**.
- HIPAA is a moat and a tax.

### Phase 4 — The healthcare detour

A four-tier architecture was drafted (personal clinical → care team → organizational → cross-institutional). **Course-correction**: "where is the 2nd brain functionality here?" — what had been described was an AI scribe with PHI scrubbing (Abridge, Suki, Nuance DAX), not a second brain. Memory and retrieval became mandatory. The bigger split surfaced: **Product A** (privacy-first regulated) vs **Product B** (team-intelligence enterprise) are different products.

### Phase 5 — Reframing for enterprise (the hackathon pivot)

Context arrived: [[wemakedevs-cognee-hackathon|WeMakeDevs Cognee Hackathon]] AI & Big Data Expo, theme "Transforming Enterprise through AI." Enterprise reframe:

- The pain is **organizational knowledge walking out the door** when employees leave.
- The product is "the AI layer that turns scattered enterprise tribal knowledge into a queryable, governed, living organizational memory."
- The **[[pluggable-brain|pluggable brain]] concept** emerged: the team's accumulated knowledge becomes infrastructure other AI tools plug into.

[[rewind-ai|Rewind-style screen capture]] was rejected: enterprise procurement blocker, two-party consent legal hazard, easier capture creates more noise rather than solving knowledge sharing.

### Phase 6 — Picking the vertical: legal wins

Rigorous evaluation of verticals:

| Tier | Verticals |
|---|---|
| Strong | Healthcare, **Legal**, Defense |
| Strong with caveats | Financial services, Pharma R&D, Government |
| Weak | Wealth management, Insurance, HR, Education |

**Legal wins** because: [[harvey|Harvey]] at $3B (2025) validates, [[attorney-client-privilege|privilege]] structurally blocks generic AI, legal knowledge is inherently relational (cases cite cases), buyers have money, demoable in five minutes. Healthcare was crowded with AI scribes; defense needed FedRAMP/IL4-IL6 + clearances.

### Phase 7 — Defining the product (Stratum → Consilium)

First proposal named **[[stratum|Stratum]]** (layered architecture). Renamed to **Consilium** (lattice of growth). Product definition stabilized:

- **Two layers** (collapsed from three): personal brain + team-managed knowledge graph
- **Three graph views**: personal, team admin, query overlay
- **Three signature moments**: capture with auto-organization, publish with redaction, retrieval with overlay

### Phase 8 — The adoption strategy problem

The genuinely hard question: *"why would someone freely provide knowledge to a firm-managed graph?"* Initial five-layer model rejected as partly coercive. Final shape: **two pillars + one mandatory exception + one reinforcing dynamic** — see [[adoption-strategy]].

### Phase 9 — Hackathon-specific strategy

- **Track 4 (Data & Intelligence)** chosen as home track.
- **Gemini Award** eligibility confirmed (relaxed mid-session: Gemini API direct, no longer requires AI Studio).
- **Path A vs Path B** debate on [[veea|Veea]]'s [[lobster-trap|Lobster Trap]]: stay Track 4 with optional integration, or reposition to Track 1. **Path A** chosen.
- **Time split**: 4 days build, 2 days pitch/video/slides.

### Phase 10 — Locking the MVP

The structured Q&A that produced the [[consilium-product-brief|four spec documents]]. Key locked decisions: documents cover full vision with MVP scope marked, target = mid-size litigation practice groups, buyer = [[knowledge-admin|KM Partner/Director]], 6 days × 3 devs, live deployed demo. (Full list in [[consilium-context-dump]] §11.)

### Phase 11 — Refining business model and market positioning (2026-05-12)

After the MVP scope was locked, two structural pieces of the pitch got revisited under harder scrutiny — the kind investors and judges actually apply.

**Business model shift: firm-wide → practice-group license.** Original plan was a firm-wide license tiered by firm size ($50K–$150K ARR across 50–300 lawyers). Reasoning was sound — knowledge value compounds with participation, per-seat creates wrong incentives, single SKU keeps sales simple. *All still true.* But the model **did not match what was actually being sold**. The product enters a firm through **one practice group** (litigation), not the whole firm. Asking a firm to commit firm-wide on day one means asking every other practice group lead — corporate, IP, regulatory — to weigh in on a tool they haven't seen and don't share the pain about. That's firm-level procurement, the slowest motion in legal-services sales.

The revised model: **practice-group license** ($25K / $50K / $85K ARR for 10–25 / 25–50 / 50–100 litigators), with **[[consilium-business-model|land-and-expand]]** to adjacent groups (corporate, IP, regulatory). Full firm deployment at maturity reaches ~$200K ARR — **meaningfully better than the original $150K ceiling**. Per-seat is still rejected for the same reason.

**Target customer reframe: wedge, not the only market.** The original "primary target = mid-size firms" framing was technically accurate but strategically incomplete. A judge or investor would ask *"why not BigLaw? Your single-tenant deployments, audit logs, SSO, ethical-wall enforcement obviously fit BigLaw — are you under-shooting your market?"* And they'd be right. The product fits BigLaw; the hesitation is about GTM motion, not product. The honest reframe: mid-size firms are the **wedge**, not the ceiling. From there the expansion path is structural — other practice groups within target firms, then up-market to BigLaw / AmLaw 200, then in-house legal teams, then adjacent professional services.

**Neither change alters the product, the architecture, or the demo.** They sharpen the story the documents tell about what Consilium sells, who it sells to, and where it goes next.

(see [[consilium-context-dump]] §12, [[consilium-business-model]], [[consilium-rejected-ideas]])

## The decisions index

A compact decision table is in [[consilium-context-dump]] §12. It is the most useful single artifact for fast lookup of "why did we decide X?"

## The conceptual through-line (one paragraph)

> Consilium emerged from curiosity about whether Obsidian-style personal knowledge tools could work for teams. The answer was no — not because the tools couldn't be adapted, but because the structural needs are different. Personal knowledge wants to be messy and idiosyncratic; team knowledge needs governance, privacy, and shared vocabulary. The market gap was the personal-to-team handoff. After considering healthcare, consulting, and other verticals, **legal** emerged as the optimal target — privilege concerns structurally block existing AI tools, the market is hot and well-funded, and the knowledge graph model fits the relational nature of legal reasoning. Consilium is the privacy-first knowledge fabric for law firms: a personal brain that lives locally, a team brain that's governed and queryable, and a "pluggable brain" architecture exposing the firm's accumulated knowledge to any AI tool the firm uses.

## Sources

- [[consilium-context-dump]]
