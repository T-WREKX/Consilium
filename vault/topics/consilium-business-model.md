---
title: Consilium business model and market sizing
type: topic
status: active
tags: [consilium, business, pricing, tam-sam-som, land-and-expand]
sources: [consilium-product-brief, consilium-context-dump]
created: 2026-05-12
updated: 2026-05-12
---

# Consilium business model and market sizing

How [[consilium|Consilium]] charges, what the market looks like, and the honest read on near-term ARR potential.

> **Model change (2026-05-12)**: the business model was revised from **firm-wide license** to **practice-group license with land-and-expand**. The reasoning is in [[consilium-decision-history]] Phase 11. This page reflects the current model; the superseded firm-wide license is on the [[consilium-rejected-ideas]] list.

## Pricing (indicative, V1)

**Practice-group license, tiered by practice-group size.** The unit of value sold is one litigation practice group, not the whole firm.

| Practice-group size (litigators) | ARR |
|---|---|
| 10–25 | **$25K** |
| 25–50 | **$50K** |
| 50–100 | **$85K** |

**Full firm deployment at maturity**: ~**$200K ARR per firm** across multiple practice groups (corporate, IP, regulatory adopted after litigation).

(Cited only for TAM/SAM math; pricing not finalized.)

## Why practice-group, not firm-wide

The product **enters a firm through one practice group** — litigation — not through firm-level procurement. The [[knowledge-admin|KM Partner]] is the champion, the [[practice-group-lead|Practice Group Lead]] is the validator, the [[litigator|litigators]] are the users. Asking a firm to commit firm-wide on day one means asking every other practice group lead (corporate, IP, regulatory) to weigh in on a tool they haven't seen and don't share the same pain about. That is a firm-level procurement decision, and firm-level procurement is the slowest motion in legal-services sales. (see [[consilium-context-dump]] Phase 11)

A practice-group license matches the sales reality:

- The litigation group signs first.
- Pricing scales with that group's size.
- Once the litigation group produces visible value, expansion is the natural next motion.
- Per-customer ACV **compounds** as adjacent practice groups adopt.

## Land-and-expand mechanics

**Expansion happens by adding other practice groups** within the same firm:

1. Land litigation ($25K–$85K depending on group size).
2. Visible value to the rest of the firm (the [[query-overlay-animation|retrieval moment]] is observable; KM Partner cites adoption metrics).
3. Expand to corporate, IP, regulatory practice groups.
4. At maturity: ~$200K ARR per firm.
5. Further expansion paths beyond a single firm: BigLaw / AmLaw 200, in-house legal teams at large corporations, eventually adjacent professional services.

## Why not per-seat (unchanged)

- Knowledge value **compounds with participation**.
- Per-seat creates the wrong incentive: firms gate access to control cost, which strangles the value of the product.
- A practice-group license aligns the incentives: get every litigator in the group using it.
- (Per-seat is on the [[consilium-rejected-ideas]] list.)

## Market sizing

| | Definition | Estimate |
|---|---|---|
| **TAM** | All law firms globally with KM needs | 175,000+ firms; legal tech ~$30B and growing 9% YoY |
| **SAM (wedge)** | US/UK/CA/AU firms, 50–300 lawyers, active litigation, KM function | ~3,000–5,000 firms · ~$50K initial ACV per practice group → **$150M–$250M wedge SAM**. Full firm penetration over years pushes meaningfully higher (multiple practice groups per firm). |
| **SOM** | Realistically obtainable in 3–5 years (2–5% of SAM) | **$3M–$37M ARR** |

## Target customer reframe: wedge, not the only market

The current positioning calls mid-size firms (50–300 lawyers) **the wedge**, not the ceiling. Mid-size wins as the **first** target for reasons that are about **market entry** rather than **product limits**: (see [[consilium-product-brief]] and [[consilium-context-dump]] Phase 11)

- **Faster sales cycles** (months vs. years for BigLaw)
- **Less locked into incumbent contracts** (Microsoft, [[imanage]], [[glean]], [[harvey]], internal builds)
- **More acute pain** — mid-size lacks BigLaw's institutional knowledge infrastructure
- **Lower internal-build risk** — BigLaw increasingly has in-house AI teams building competing tools
- **Better champion access for a startup** — warm intros to KM Partners at mid-size firms are reachable; AmLaw 100 KM Partners are not
- **Lower initial compliance burden** — mid-size accepts standard SOC 2; BigLaw demands custom security reviews, on-prem options, escrow agreements

## Expansion path

From the wedge, the path is **structural** (same product, same architecture):

1. **Within target firms** — other practice groups: corporate, IP, regulatory.
2. **Up-market** — BigLaw / AmLaw 200. The product **does** fit BigLaw; what changes is the *motion* (enterprise sales reps, longer cycles, custom security reviews, multi-year deals). **Anchor logo value is asymmetric**: one AmLaw 100 firm is worth more marketing-wise than five mid-size firms.
3. **Adjacent (vertical)** — in-house legal teams at large corporations.
4. **Adjacent (horizontal)** — other professional services (consulting, accounting). Legal first, prove the model.

## A note on BigLaw fit

Architecturally, **nothing changes for BigLaw**. The single-tenant deployments, audit logs, SSO, and ethical wall enforcement already on the V1 roadmap are what BigLaw demands. The hesitation about BigLaw isn't about product fit — it is about go-to-market velocity. BigLaw is a **deliberate later phase**, not a market Consilium fails to address.

## Sales motion

- **Primary buyer**: [[knowledge-admin|KM Partner / KM Director]] — owns the problem, holds (or strongly influences) the budget.
- **Validator**: [[practice-group-lead|Litigation Practice Group Lead]] — confirms the tool works for their team.
- **Economic decision**: **practice-group license** signed by Managing Partner / COO / CFO on the KM Partner's recommendation, with the Lead as validator.
- **Cycle length**: 3–9 months for mid-size firms.
- **Channel partners needed** for the bottom end of SAM (firms that outsource KM to consultants).

## Why this segment is optimal (unchanged)

- Mid-size firms feel knowledge loss acutely — smaller than BigLaw's institutional infrastructure, larger than boutiques where everyone already knows everything.
- **Litigation has the densest pattern-matching value**: recurring judges, repeat opposing counsel, motion practice patterns.
- These firms have budget but aren't locked into deep enterprise contracts → **faster sales cycles**.
- Litigation insights lend themselves naturally to **graph structure**.

## Honest read

From the [[consilium-product-brief]]: *"Strong wedge into a recognized, growing category ([[harvey]] at $3B validates the space). Not a billion-dollar standalone market in three years by itself, but the natural expansion path into adjacent verticals (corporate legal, in-house teams, expert services) extends the trajectory meaningfully."*

The practice-group framing **strengthens** this read versus the prior firm-wide framing:

- Initial wedge ACV is modest ($25K–$50K), but **per-customer ACV compounds as expansion happens within each firm**.
- The expansion path is **structural rather than aspirational** — it is the same product sold to the next practice group.
- Sales-cycle math improves: a litigation-group-only decision is a faster procurement than a firm-wide commit.

## Tensions

- **Investor expectations vs. wedge ACV**: $25K initial ACV is a smaller-looking metric than $50K firm-wide, even though full-firm-deployed maturity ($200K) exceeds the old firm-wide ceiling ($150K). The narrative needs to **lead with the expansion curve**, not the initial wedge.
- **Channel sales for the long tail**: SAM math still requires partnership channels for firms that outsource KM to consultants — partners named as necessary, not chosen.

## Sources

- [[consilium-product-brief]]
- [[consilium-context-dump]]
