---
title: Per-firm KMS — AWS KMS or GCP KMS?
type: question
status: open
tags: [v1, security, infrastructure]
sources: [consilium-project-architecture]
raised-on: [consilium-project-architecture, consilium-tech-stack]
created: 2026-05-12
updated: 2026-05-12
---

# Per-firm KMS — AWS KMS or GCP KMS?

## Status

**Open** — awaiting team decision.

## Why it matters

V1 ships **per-firm single-tenant** deployments with **per-firm encryption keys via cloud KMS**. The V1 stack table lists both AWS KMS and GCP KMS as options. The choice cascades into deployment topology, customer security review answers, and the operational runbook for key rotation. (see [[consilium-project-architecture]] §2.6 and §6.2)

## What we know so far

- V1 deploys per-firm single-tenant.
- Per-firm encryption keys are required.
- AWS KMS and GCP KMS both listed as viable.
- Consilium is already on GCP for [[gemini]] usage, which is a soft lean toward GCP.

## What would resolve it

- A pick (with rationale: cost, customer preference, operational fit) — or a deliberate "per-firm-choice" stance where each firm picks based on their cloud footprint.

## Answer

_(pending)_

## Related

- [[consilium-tech-stack]]
- [[consilium-project-architecture]]
