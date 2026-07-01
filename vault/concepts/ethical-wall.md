---
title: Ethical wall (Chinese wall)
type: concept
status: active
tags: [legal, compliance, doctrine, v1]
sources: [consilium-context-dump, consilium-product-brief, consilium-product-requirements]
created: 2026-05-12
updated: 2026-05-12
---

# Ethical wall

The screening mechanism by which a law firm represents conflicting clients without breaching conflict-of-interest rules. When the firm represents Client A and a different partner takes a matter adverse to Client A, certain lawyers must not see information about the conflicting matter. Also called a "Chinese wall" (older term).

## Definition

A combination of policy, access controls, and physical or digital separation that prevents a conflicted lawyer from accessing materials related to the conflict. Required by professional-conduct rules in every US state and most common-law jurisdictions.

## Why it matters for Consilium

[[consilium|Consilium]]'s team graph **must respect ethical walls** to be usable in any firm. A retrieved-and-cited insight that violates an ethical wall is worse than no retrieval — it is a professional-responsibility incident.

- **MVP**: not enforced. The MVP single firm has no conflicts.
- **V1+**: **ethical wall enforcement** is on the V2 roadmap as "ethical wall automation (inherited from connected systems)." Walls are inherited from the conflicts database, not authored from scratch. (see [[consilium-product-brief]] V2 section)
- **The retrieval surface** ([[rag-query-pipeline]]) needs to filter nodes by the querier's wall membership; that filter does not exist in MVP.

## Contrast with adjacent concepts

- **Not the same as [[attorney-client-privilege|attorney-client privilege]]** — privilege protects communications from compelled disclosure; an ethical wall prevents *intra-firm* information flow between conflicted matters.
- **Distinct from RBAC**: ethical walls are matter-scoped and lawyer-scoped, not role-scoped. A lawyer might be allowed to see most of the team graph but blocked from a specific matter's nodes.

## Open questions

- **Which conflicts databases** does Consilium's V1+ wall inheritance connect to? Not specified.
- **What is the retrieval-time behavior** when a query would otherwise cite a walled node? Refuse, redact-and-cite-anonymously, or silently drop?
- **Audit trail** — the V1 audit log captures reads; an ethical-wall enforcement layer adds another dimension (denied reads) that needs separate logging.

## Sources

- [[consilium-context-dump]]
- [[consilium-product-brief]]
- [[consilium-product-requirements]]
