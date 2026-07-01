---
title: Audit logging for ethical-wall denied reads — separate channel?
type: question
status: open
tags: [v1, ethical-wall, audit, compliance]
sources: [consilium-product-brief]
raised-on: [ethical-wall]
created: 2026-05-12
updated: 2026-05-12
---

# Audit logging for ethical-wall denied reads — separate channel?

## Status

**Open** — awaiting team decision.

## Why it matters

The V1 audit log captures every team-graph read with user/timestamp/action/target node. An ethical-wall enforcement layer adds **denied reads** — a distinct dimension (the lawyer queried, the wall blocked, no data was returned). Whether this is in the same log or a separate channel changes both the data model and the access patterns (compliance dashboards vs incident review). (see [[ethical-wall]])

## What we know so far

- V1 audit log: append-only, separate database, 7-year retention.
- Per-user access log: any lawyer can query who viewed their published insights.
- Wall-denied reads: not mentioned in the architecture.

## What would resolve it

- Decide: same audit-log table with a `denied=true` discriminator, OR a separate `denied_reads` table.
- Confirm who can query denied-read logs (KM Admin only? Conflicts partner?).
- Confirm whether the denying wall identifier is logged.

## Answer

_(pending)_

## Related

- [[ethical-wall]]
- [[consilium-v1-roadmap]]
