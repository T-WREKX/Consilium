---
title: Consilium rejected ideas (don't regress)
type: topic
status: active
tags: [consilium, decisions, anti-patterns]
sources: [consilium-context-dump]
created: 2026-05-12
updated: 2026-05-12
---

# Consilium rejected ideas

A queryable surface of ideas [[consilium|Consilium]] considered and explicitly chose **not** to do. This page exists to **prevent regression** — when a "good idea" comes up that already lost the argument, this is where it's named so the same debate doesn't have to happen twice.

Source of record: [[consilium-context-dump]] §13.

## Architectural rejections

| Rejected | Why |
|---|---|
| Pure local-only AI | Can't compete on capability with cloud frontier models; users will resent the limitation. Hybrid (local-first sensitive + cloud-escalation) is the realistic shape. |
| Three knowledge layers (personal → practice → firm) | Collapsed to **two** for MVP clarity; firm-wide super-layer added complexity without demo value. See [[two-layer-architecture]]. |
| Neo4j or dedicated graph DB | Operational complexity not justified at MVP scale (<10k nodes). Postgres relational + pgvector is sufficient. See [[postgres-pgvector]]. |
| Full 4-pass redaction pipeline in MVP | 2-pass produces the same wow moment in ~¼ the build time. Full pipeline is V1. See [[redaction-pipeline]]. |
| Mobile-first capture for MVP | Browser limits make this hard; V1 native apps deliver this honestly. |

## Vertical / market rejections

| Rejected | Why |
|---|---|
| Healthcare as the hackathon vertical | Crowded AI-scribe space (Abridge, Suki, Nuance DAX); EHR integration complexity; longer sales cycles than legal. |
| Horizontal consulting/ops manager target | Local-first architecture mismatched with their actual needs — they have compliant cloud, not regulatory blocks. |
| Defense / aerospace as hackathon vertical | FedRAMP/IL4-IL6, clearances, multi-year sales cycles — incompatible with hackathon-demoability. |
| Multiple competitor verticals simultaneously | "Picking one and going deep beats two poorly." |
| "Therapists and medicine" together | Two different markets with different sales cycles and regulatory profiles. Pick one. |

## Capture / ingestion rejections

| Rejected | Why |
|---|---|
| Screen capture / always-on capture ([[rewind-ai\|Rewind-style]]) | Procurement killer in enterprise; consulting firms won't allow it; legal liability around recordings. |
| Audio capture of meetings without consent flow | Two-party consent state laws; fireable offense at most professional services firms. |
| "One-button capture" as a thesis | Doesn't reduce friction in the way that matters; user still has to decide *what* is worth capturing. Easier capture creates more noise, not better knowledge sharing. |

## Business / commercial rejections

| Rejected | Why |
|---|---|
| Per-seat pricing | Creates wrong incentive — firms gate access to control cost, killing network effects. Practice-group license aligns incentives. See [[consilium-business-model]]. |
| **Firm-wide license as primary business model** (2026-05-12) | Mismatched with what we actually sell (one practice group at a time); created procurement friction (every other practice group lead would have to weigh in on a tool they don't share the pain about). **Replaced with [[consilium-business-model\|practice-group license + land-and-expand]]**. See [[consilium-decision-history]] Phase 11. |
| Repositioning to Track 1 (Agent Security) | Crowded track; Consilium's positioning is naturally Track 4. Lobster Trap deferred as optional integration, not a reposition. See [[hackathon-judging-fit]]. |
| Mandatory firm-wide contribution policies | Coercive; would destroy adoption. **Only [[adoption-strategy|departure capture]] is robust.** |
| Reciprocity gates (can't query unless you contribute) | Punishes new hires, feels coercive, creates gaming behavior. |
| [[knowledge-admin\|Knowledge Admin]] approval in MVP | Adds friction to demo without adding wow moment. V1 ships it. |

## Out-of-scope (these are not problems we solve)

| Rejected | Why |
|---|---|
| Real-time collaborative editing | Not the problem we're solving. |
| Built-in document drafting | We integrate with [[spellbook]] / drafting tools; we don't replace them. |
| Time tracking and billing | Adjacent but not our problem. |
| Conflict-checking automation | Respect existing conflicts databases; don't compete with them. The [[ethical-wall]] V1+ surface *consumes* conflicts data, doesn't produce it. |
| Client portals | Different product entirely. |
| Court filing integration | Different product entirely. |

## Design / polish rejections (for MVP)

| Rejected for MVP | Status |
|---|---|
| Built-in onboarding tour | V1 |
| Settings / preferences page | V1 |
| Light theme | V2 |
| Account switcher UI | V1 (MVP uses logout/login) |
| Search across personal + team graphs | V1+ |

## How to use this page

- **Before proposing a feature**, search this page for it. If it lost the argument, find the *why* and update this page only if the why has changed.
- **During code review**, if a PR drifts toward a rejected pattern (e.g., adding always-on capture, switching to per-seat metering), this page is the citation.
- **When pitching**, anticipate "have you considered X?" — most of them are here, with a one-line reason.

## Sources

- [[consilium-context-dump]]
