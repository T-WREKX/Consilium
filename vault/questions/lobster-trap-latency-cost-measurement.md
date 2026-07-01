---
title: Lobster Trap — latency cost on a redaction round-trip?
type: question
status: open
tags: [hackathon, performance, integration]
sources: [consilium-context-dump]
raised-on: [lobster-trap]
created: 2026-05-12
updated: 2026-05-12
---

# Lobster Trap — latency cost on a redaction round-trip?

## Status

**Open** — awaiting team decision.

## Why it matters

The [[redaction-pipeline]] has a 5-second budget end-to-end (modal opens within 3, two passes complete within 5). Inserting [[lobster-trap|Lobster Trap]] DPI in front of every Gemini call adds an unknown number of milliseconds per call. If it adds 500ms, the integration is invisible; if it adds 2 seconds, the demo timing breaks. (see [[lobster-trap]])

## What we know so far

- DPI inspects every prompt before it reaches the LLM.
- Self-hosted, latency dominated by inspection rule depth.
- No measurement has been taken in a Consilium context.

## What would resolve it

- A 30-minute test: stand up Lobster Trap locally, route one redaction call through it, measure delta vs direct Gemini call.
- A pass/fail threshold (e.g. "under 500ms added latency = ship; over 1s = drop").

## Answer

_(pending)_

## Related

- [[lobster-trap]]
- [[redaction-pipeline]]
- [[lobster-trap-day-5-go-no-go]]
