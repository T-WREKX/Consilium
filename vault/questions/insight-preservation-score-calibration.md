---
title: How is the insight-preservation score calibrated?
type: question
status: open
tags: [redaction, metric, calibration]
sources: [consilium-product-requirements, consilium-design-guidelines]
raised-on: [insight-preservation-score]
created: 2026-05-12
updated: 2026-05-12
---

# How is the insight-preservation score calibrated?

## Status

**Open** — awaiting team decision.

## Why it matters

The [[insight-preservation-score|preservation score]] (0–100%) gates the Publish button (disabled below 40%) and shapes the lawyer's confidence ("73% preservation, OK to publish"). Without a calibration source, the score is essentially a single Gemini Flash call's vibe-rating — and a vibe-rating that disables Publish is a UX failure mode waiting to happen. (see [[insight-preservation-score]], [[redaction-pipeline]])

## What we know so far

- Single Gemini Flash call rates the sanitized version against the original.
- Returns a 0–100 number.
- Threshold rules: <60% yellow, <40% red, Publish disabled below 40% (or after manual edit).
- No calibration source named in the docs.

## What would resolve it

- A small held-out set of human-rated (original, sanitized) pairs labeled "preservation good / partial / lost."
- A prompt that produces scores correlating with those human labels.
- A periodic re-calibration when the Gemini model version changes.

## Answer

_(pending)_

## Related

- [[insight-preservation-score]]
- [[redaction-pipeline]]
- [[hero-moments]]
