---
title: Knowledge Admin (persona / KM Partner / KM Director)
type: entity
status: active
tags: [persona, buyer, consilium]
sources: [consilium-product-brief, consilium-product-requirements]
created: 2026-05-12
updated: 2026-05-12
---

# Knowledge Admin (persona)

The **buyer-aligned** persona for [[consilium]]. Typically a **KM Partner** or **KM Director** at a mid-size firm. Holds budget authority for KM-specific tools or strong influence over the COO/CIO who does.

## Key facts

- **Buyer role**: holds budget authority or influences the economic decision-maker (Managing Partner / COO / CFO). (see [[consilium-product-brief]])
- **Often a former lawyer** — has credibility with practitioners.
- **Has career incentive** to champion a successful KM tool.
- **Cares about**: governance, audit, knowledge quality, demonstrating ROI to firm leadership.
- **V1 power**: approve/reject publications; edit and remove team graph nodes; access admin dashboard; manage team membership; view audit logs. (see [[consilium-product-requirements]])
- **MVP power**: role exists in data model; **admin dashboard does not ship**; published knowledge auto-flows to the team graph.
- **MVP demo account**: `admin@acme.law` / `demo`.

## Why this persona is the buyer wedge

Mid-size firms typically have an existing KM function (KM Partner, KM Director, or equivalent) but no living, queryable layer of firm intelligence. The KM Admin **owns the problem Consilium solves**, which is unusual — most enterprise software targets buyers whose pain is one step removed. Here, the buyer is the pain owner.

## Economic decision

A **practice-group license** is signed by Managing Partner / COO / CFO on the KM Admin's recommendation. Validator is the [[practice-group-lead|Litigation Practice Group Lead]]. The initial decision is the litigation group only; firm-wide adoption happens through [[consilium-business-model|land-and-expand]] as adjacent practice groups join over time.

> Revised 2026-05-12 from a firm-wide license; reasoning in [[consilium-decision-history]] Phase 11.

## Relations

- **Governs**: [[litigator]] publication workflow (V1)
- **Validates with**: [[practice-group-lead]]
- **Buyer**: signs (or recommends) the [[consilium-business-model|practice-group license]]

## Open questions

- Admin dashboard surfaces (V1): approval queue, audit log UI, analytics — none are designed. (see [[consilium-design-guidelines]] §12)
- For firms without a dedicated KM function, who is the buyer? Brief notes the bottom end of SAM "outsources KM to consultants" and needs partnership channels.

## Sources

- [[consilium-product-brief]]
- [[consilium-product-requirements]]
