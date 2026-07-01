---
title: Attorney-Client Privilege
type: concept
status: active
tags: [legal, compliance, doctrine]
sources: [consilium-product-brief]
created: 2026-05-12
updated: 2026-05-12
---

# Attorney-Client Privilege

A legally binding doctrine protecting communications between a lawyer and client from compelled disclosure. **The structural reason generic AI adoption is blocked in law firms** and the central design constraint of [[consilium|Consilium]].

## Definition

Communications made in confidence between a lawyer and a client for the purpose of obtaining or providing legal advice cannot be compelled into discovery. The privilege is held by the client and waived only by the client (or by inadvertent disclosure that breaks confidentiality).

## Why it matters for AI

- **Privileged communications cannot go to ChatGPT, Notion AI, [[glean|Glean]], or any provider** that might be compelled to disclose. (see [[consilium-product-brief]])
- **Most major firms have explicitly banned public AI tools for client work.**
- Result: **shadow IT** (lawyers using personal ChatGPT anyway) or **paralysis** (no AI at all).
- The doctrine is **load-bearing** for Consilium: every architectural decision — [[two-layer-architecture|two-layer split]], [[local-first-architecture|local-first personal layer]], [[redaction-pipeline|redaction pipeline]] before any cloud call — exists because of it.

## How Consilium is structured around it

- **Personal layer is local and private.** Privileged content never leaves the device unsanitized.
- **The [[redaction-pipeline]]** runs *before* any content reaches the team layer; client identifiers and specifics are stripped or generalized.
- **The lawyer is the gatekeeper.** Side-by-side diff with manual approval is mandatory. (No "auto-publish" of unredacted content.)
- **The team layer holds only sanitized published insights** — the strategic insight survives; the privilege-bearing specifics do not.

## Contrast with adjacent concepts

- **Not the same as "confidential."** Privilege is a stronger, legally enforceable bar; confidentiality can be policy-only.
- **Distinct from work-product doctrine** (protection of attorney mental impressions and trial-prep materials), though they often overlap in practice.

## Compliance posture for Consilium V1

- **ABA Formal Opinion 477R** compliance baseline. (see [[consilium-product-brief]])
- **SOC 2 Type II in progress** at V1 launch.
- **7-year audit log retention** (legal industry standard). (see [[consilium-product-requirements]])

## Open questions

- Ethical-wall enforcement is V1+; how does Consilium handle conflicts where one matter's published insight could leak into another matter's queries?

## Sources

- [[consilium-product-brief]]
