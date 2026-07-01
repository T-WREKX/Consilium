---
title: What is the fallback when Gemini structured-output JSON validation fails?
type: question
status: open
tags: [pipeline, ai, reliability]
sources: [consilium-project-architecture, consilium-product-requirements]
raised-on: [auto-organization-pipeline, gemini]
created: 2026-05-12
updated: 2026-05-12
---

# What is the fallback when Gemini structured-output JSON validation fails?

## Status

**Open** — awaiting team decision.

## Why it matters

The [[auto-organization-pipeline]] is a **single Gemini Pro call** that returns `{ entities, classification, isPrivileged }` as structured JSON in under 5 seconds. If the JSON fails schema validation (malformed, missing field, hallucinated enum), the pipeline either retries, degrades, or fails the user-visible action. The PRD says "if entity extraction fails (API error), note is saved without enrichment; retry button visible" — but that addresses transport errors, not schema-validation failures. (see [[auto-organization-pipeline]], [[gemini]])

## What we know so far

- Single structured-output call is the chosen design.
- Transport-error path: save without enrichment, surface retry.
- Schema-validation-failure path: not explicitly defined.
- Acceptance criterion: pipeline runs within 5 seconds.

## What would resolve it

- A retry-with-stricter-prompt policy (one retry, then fall through), OR
- A salvage-what-you-can policy (parse partial fields with Zod, ignore the rest), OR
- An accepted "treat schema fail like transport fail" stance (save raw, show retry).

## Answer

_(pending)_

## Related

- [[auto-organization-pipeline]]
- [[gemini]]
- [[consilium-ai-pipelines]]
