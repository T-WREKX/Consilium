---
title: Lobster Trap — does the DPI ruleset ship with sensible defaults for legal?
type: question
status: open
tags: [hackathon, integration, policy]
sources: [consilium-context-dump]
raised-on: [lobster-trap]
created: 2026-05-12
updated: 2026-05-12
---

# Lobster Trap — does the DPI ruleset ship with sensible defaults for legal?

## Status

**Open** — awaiting team decision.

## Why it matters

If [[lobster-trap|Lobster Trap]] ships with legal-friendly defaults out of the box, the integration story is "Consilium routes every redaction call through Veea's DPI for additional policy enforcement." If it requires Consilium to author its own rules, the integration is meaningfully more work for marginal demo benefit. (see [[lobster-trap]])

## What we know so far

- Lobster Trap is policy-driven.
- Default rulesets are not documented in our notes.
- Consilium would need to write rules covering at least: PII patterns, privilege markers, client-identifier patterns.

## What would resolve it

- Skim Lobster Trap's documentation for shipped rule libraries.
- If defaults are weak: write the minimal Consilium ruleset (15-30 rules covering the [[microsoft-presidio|Presidio]] categories) before deciding to integrate.

## Answer

_(pending)_

## Related

- [[lobster-trap]]
- [[microsoft-presidio]]
- [[redaction-pipeline]]
- [[lobster-trap-day-5-go-no-go]]
