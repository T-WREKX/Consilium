---
title: iManage V1 integration — which API surface?
type: question
status: open
tags: [v1, integration, dms]
sources: [consilium-project-architecture, consilium-product-brief]
raised-on: [imanage]
created: 2026-05-12
updated: 2026-05-12
---

# iManage V1 integration — which API surface?

## Status

**Open** — awaiting team decision.

## Why it matters

[[imanage|iManage]] exposes multiple connectivity surfaces (REST API, MFAPI, custom plugins, the Work product line's GraphQL). Each has different auth, throughput, and feature coverage. Picking the wrong one means rewriting the integration mid-V1. (see [[imanage]])

## What we know so far

- V1 priority: **Critical** inbound.
- Direction: read firm document corpus into team graph seed.
- Volume: hundreds of thousands of documents per firm at the low end.
- API surface: unchosen.

## What would resolve it

- Pick a path (REST API is the modern, documented default; MFAPI is legacy but more featured).
- Confirm the auth model the firm's IT will accept (service account vs delegated OAuth).
- Define the read batch size and rate-limit posture.

## Answer

_(pending)_

## Related

- [[imanage]]
- [[netdocuments]]
- [[dms-ingest-volume-strategy]]
- [[consilium-v1-roadmap]]
