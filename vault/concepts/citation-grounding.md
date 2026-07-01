---
title: Citation grounding
type: concept
status: active
tags: [retrieval, trust, consilium, ai]
sources: [consilium-product-requirements, consilium-design-guidelines]
created: 2026-05-12
updated: 2026-05-12
---

# Citation grounding

The discipline that every chat response **cites every claim** with a node ID from the team graph, and that the system **refuses to answer** rather than hallucinate when no relevant nodes are found. This is the difference between *firm-aware AI* and *AI that sounds confident about your firm*.

## Definition

- **Inline citations** in the response, rendered as monospace superscript-style chips: *"Our firm has successfully argued similar fact patterns under Rule 403 [1] in three previous matters [2,3]."* (see [[consilium-product-requirements]] §2.7.3)
- **Citations resolve to clickable summary panels** that slide in from the right.
- A **Sources section** at the bottom of the response lists all cited nodes with one-line summaries.
- **Refusal is a first-class outcome**, not a fallback. If no nodes are above 0.75 similarity, the system says so plainly.

## Why it matters

For lawyers, an answer is only useful if its source can be inspected. A confident hallucination is **worse than no answer** — it erodes trust in the system and creates downstream professional-responsibility risk. The system prompt that drives the [[rag-query-pipeline]] enforces:

- Cite every claim with a node ID.
- Output structured response with inline `[node_id]` markers.
- Refuse if no nodes above similarity 0.75.

## Refusal voice

From [[consilium-design-guidelines]] §5: **"matter-of-fact and respectful, never apologetic-cute."**

> *"I don't have firm knowledge that directly addresses this. You may want to capture your own thinking on this topic as a starting point."*

The refusal also doubles as a **product feedback loop**: it nudges the lawyer toward capture, which feeds the next person who asks the same question.

## Confidence signaling

Beyond binary cite/refuse, Consilium exposes **High / Medium / Low** confidence buckets to the user (see [[rag-query-pipeline]] for the rules). Sources section is **collapsed by default for high-confidence**, expanded by default for medium/low.

## Component pattern

Citation chip (per [[consilium-design-guidelines]] §9.6):

- Inline element, monospace (JetBrains Mono).
- Background `accent-primary-bg`, text `accent-primary`.
- Format `[1]`, `[2,3]` (comma-separated for multi-citation).
- Hover: background brightening, cursor pointer.
- Click: opens summary panel.

## Sources

- [[consilium-product-requirements]]
- [[consilium-design-guidelines]]
