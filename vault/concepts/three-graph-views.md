---
title: Three graph views
type: concept
status: active
tags: [ui, graph, consilium]
sources: [consilium-product-brief, consilium-product-requirements, consilium-design-guidelines]
created: 2026-05-12
updated: 2026-05-12
---

# Three graph views

The three distinct graph surfaces in [[consilium|Consilium]]. Each uses the same [[force-directed-graph|force-directed layout]] and [[node-color-coding|node palette]] (visual consistency), but differs in scope and interactivity.

## The three views

1. **Personal graph** — the lawyer's own captured knowledge, fully clickable, Obsidian-style. Click a note node → opens the note. Click an entity node → filters graph to the entity's neighborhood. Search filters in real time. (see [[consilium-product-requirements]] §2.4)

2. **Team graph (admin view)** — the [[knowledge-admin|Knowledge Admin]]'s full view of the team-managed graph, **fully clickable**. In MVP, all roles see a **read-only structural view** with summary-only click behavior (full node detail is V1 admin-only). (see [[consilium-product-requirements]] §2.6)

3. **Query overlay graph** — the **signature visual moment**. Appears when any team member queries the chatbot. The chat dims, the team graph fades in at center, cited nodes pulse and light up in real time as the answer streams. See [[query-overlay-animation]] for the full choreography. (see [[consilium-product-brief]], [[consilium-design-guidelines]])

## Visual consistency

All three views share:

- Force-directed layout via [[cytoscape-js]] (nodes repel, edges attract).
- The [[node-color-coding]] palette — strictly non-overlapping with accent and semantic UI palettes.
- 24px circle nodes (32px on selection), 1px `border-default` at rest, `text-primary` on hover, `accent-primary` when selected.
- Soft drop-shadow on hover.

## Why three, not one

Each view answers a different question:

- **Personal**: "What have *I* captured?"
- **Team admin**: "What does the firm *know*?"
- **Query overlay**: "Where in firm knowledge did *this answer* come from?"

The third view is what turns the abstract claim "grounded in firm knowledge" into a **visible, demoable artifact** during the query moment.

## Sources

- [[consilium-product-brief]]
- [[consilium-product-requirements]]
- [[consilium-design-guidelines]]
