---
title: Acme Litigation Partners — what's the "voice" of seeded insights?
type: question
status: answered
tags: [mvp, seed, content, demo]
sources: [consilium-product-requirements]
raised-on: [acme-litigation-partners]
created: 2026-05-12
updated: 2026-05-12
answered: 2026-05-12
---

# Acme Litigation Partners — what's the "voice" of seeded insights?

## Status

**Answered** (2026-05-12).

## Why it matters

The 15–30 seeded insights at [[acme-litigation-partners]] are what the [[redaction-pipeline|publish flow]] generalizes from and what the [[rag-query-pipeline|RAG]] retrieves from. The voice affects how the side-by-side diff reads on stage. **Terse and conclusory** insights ("Judge Hartford grants summary judgment on 6/7 occasions when…") read like institutional knowledge. **Narrative** insights ("In the Acme v. Beta matter we tried this and what we learned was…") read like war stories. They feel different to the lawyer-reader. (see [[acme-litigation-partners]])

## What we know so far

- Seed insights are fictional but realistic.
- Avoid recognizable real cases or real lawyer names.
- 15–30 insights spanning judges, opposing counsel, motions, experts, settlement, procedure.
- No voice/tone direction.

## What would resolve it

- Pick a voice (recommend: **conclusory + brief narrative justification**, ~2-3 sentences each, the kind of insight a senior partner would dictate in 30 seconds).
- Write 3 prototype insights and check they feel right on the redaction modal.

## Answer

**Conclusory with brief narrative justification, 2–3 sentences each.** The voice is a senior partner dictating a quick note — a one-line conclusion, followed by a sentence or two of justification or context.

Example shape:

> *"Judge Hartford grants summary judgment on damages-expert testimony when assumption-supplied-by-counsel is established on cross. Two recent matters confirmed the pattern; the cross typically takes under 20 minutes if the expert's report names the assumption source."*

Not a war-story narrative ("In the Acme v. Beta matter we tried…"), not a one-liner ("Judge X grants SJ"). The 2–3 sentence shape gives the [[redaction-pipeline|side-by-side diff]] enough content to **show generalization happening** without making the modal read like a textbook page.

## Related

- [[acme-litigation-partners]]
- [[redaction-pipeline]]
- [[consilium-demo-narrative]]
