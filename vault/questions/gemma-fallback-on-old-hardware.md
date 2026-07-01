---
title: V1 fallback when on-device Gemma inference is unavailable?
type: question
status: open
tags: [v1, on-device, gemma, ux]
sources: [consilium-project-architecture]
raised-on: [gemma]
created: 2026-05-12
updated: 2026-05-12
---

# V1 fallback when on-device Gemma inference is unavailable?

## Status

**Open** — awaiting team decision.

## Why it matters

Some lawyer machines won't run [[gemma|Gemma]] at acceptable speed (older laptops, low-RAM machines, locked-down corporate-IT configurations). The product must decide: degrade to cloud inference with explicit user consent, block the feature, or run in a degraded "extraction-light" mode? Each choice has [[attorney-client-privilege|privilege]] implications. (see [[gemma]], [[local-first-architecture]])

## What we know so far

- V1 promise: personal-layer extraction runs on-device.
- Hardware floor not specified.
- Cloud-fallback would re-expose the local-first claim to scrutiny.

## What would resolve it

- A hardware detection check at install time that picks a tier ("full local", "cloud-with-consent", "block").
- An opt-in consent flow that names exactly what content is sent to the cloud.
- A documented stance for firms whose IT policy forbids cloud inference: block the feature on that machine and tell the user.

## Answer

_(pending)_

## Related

- [[gemma]]
- [[local-first-architecture]]
- [[attorney-client-privilege]]
