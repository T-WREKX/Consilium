---
title: Which conflicts database does Consilium's V1+ ethical-wall layer inherit from?
type: question
status: open
tags: [v1, ethical-wall, integration, compliance]
sources: [consilium-product-brief]
raised-on: [ethical-wall]
created: 2026-05-12
updated: 2026-05-12
---

# Which conflicts database does Consilium's V1+ ethical-wall layer inherit from?

## Status

**Open** — awaiting team decision.

## Why it matters

The V2 ethical-wall automation "inherits from connected systems" — meaning Consilium does **not** maintain its own conflicts/walls authority. That requires a defined integration source. Common candidates: Intapp Walls, LegalKEY, ProLaw, Aderant Expert Sierra, [[imanage]]'s Security Policy Manager, NetDocuments equivalents. (see [[ethical-wall]])

## What we know so far

- Consilium does not produce conflicts data; it consumes it.
- V1+ feature, not MVP.
- No specific integration partner named.

## What would resolve it

- Pick a primary conflicts-system target (likely Intapp Walls given market share at the SAM segment).
- Define a sync model (pull on schedule, push-on-update, on-demand-at-query-time).
- Confirm the on-disk model for wall membership inside the team graph.

## Answer

_(pending)_

## Related

- [[ethical-wall]]
- [[consilium-v2-vision]]
- [[imanage]]
- [[netdocuments]]
