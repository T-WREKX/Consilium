---
title: Practice Group Lead (persona)
type: entity
status: active
tags: [persona, user, consilium]
sources: [consilium-product-requirements, consilium-product-brief]
created: 2026-05-12
updated: 2026-05-12
---

# Practice Group Lead (persona)

A partner leading the litigation practice group. The **validator** persona for [[consilium]] — cares about team productivity, associate development, knowledge retention, and competitive differentiation in the firm's litigation offering.

## Key facts

- **Cares about**: team productivity, associate development, knowledge retention, competitive differentiation. (see [[consilium-product-brief]])
- **V1 power**: approves what becomes "firm-endorsed" knowledge; can flag insights for promotion.
- **MVP power**: role exists in the data model but has the **same permissions as [[litigator|Lawyer]]** — no admin dashboard. (see [[consilium-product-requirements]])
- **MVP demo account**: `lead@acme.law` / `demo` at [[acme-litigation-partners]].

## Why this persona exists in the brief but not the demo

The brief and PRD list the Practice Group Lead among the three demo accounts to make the **role model legible** to judges and to fix the data shape. In MVP the role does not exercise distinct UI; the demo does not meaningfully switch to this account.

**Decided**: no MVP differentiator. Same access as Lawyer. The role earns its dashboard in V1 where it flags insights for promotion to firm-wide. (see [[practice-group-lead-mvp-distinctiveness]])

**Rehearsed Q&A talk-track** for judges who ask "what does the Lead actually do?":

> *"In the MVP, the Lead has the same access as a lawyer — the role exists in our data model and gets its own dashboard in V1 where they flag insights for promotion to firm-wide. We chose to scope down so we could nail the privacy and retrieval moments."*

## Relations

- **Manages**: [[litigator]]
- **Coordinates with**: [[knowledge-admin]] (V1 approval workflow)
- **Role contrast**: [[litigator]] (user), [[knowledge-admin]] (governor)

## Open questions

- "Flag for promotion" (V1) — what does the surface look like? Not designed.

## Sources

- [[consilium-product-requirements]]
- [[consilium-product-brief]]
