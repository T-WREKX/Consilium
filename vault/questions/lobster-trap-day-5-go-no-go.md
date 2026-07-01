---
title: Lobster Trap — day-5 go/no-go decision?
type: question
status: open
tags: [hackathon, integration, optional]
sources: [consilium-context-dump]
raised-on: [lobster-trap, consilium-context-dump]
created: 2026-05-12
updated: 2026-05-12
---

# Lobster Trap — day-5 go/no-go decision?

## Status

**Open** — awaiting team decision.

## Why it matters

[[lobster-trap|Lobster Trap]] integration was deferred as optional under [[hackathon-judging-fit|Path A]]. If day 5 of the build has slack, the integration adds an enterprise-security talking point and potentially Veea Award visibility. If day 5 has no slack, integrating mid-flight introduces risk to demo stability for ambiguous reward. (see [[lobster-trap]])

## What we know so far

- MIT licensed, OpenAI-compatible drop-in proxy.
- Would sit between Consilium backend and Gemini API for the redaction flow.
- Latency cost unmeasured.
- Demo doesn't currently need it.

## What would resolve it

- A small checklist for day-5 morning: build is green, demo is rehearsed, redaction pass-2 quality holds → integrate.
- A cut-line: any one of (build red / demo not solid / Gemini latency tight) → skip.
- A pre-tested "drop-in" branch on standby so the integration is mechanical if green-lit.

## Answer

_(pending)_

## Related

- [[lobster-trap]]
- [[veea]]
- [[hackathon-judging-fit]]
- [[lobster-trap-latency-cost-measurement]]
- [[lobster-trap-legal-policy-defaults]]
