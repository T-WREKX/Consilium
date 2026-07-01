---
title: Gemma on-device — quantization and target throughput?
type: question
status: open
tags: [v1, on-device, gemma, performance]
sources: [consilium-project-architecture]
raised-on: [gemma]
created: 2026-05-12
updated: 2026-05-12
---

# Gemma on-device — quantization and target throughput?

## Status

**Open** — awaiting team decision.

## Why it matters

[[gemma|Gemma]] 2B or 3B running on a lawyer's laptop must hit the 5-second [[auto-organization-pipeline]] budget for personal-note extraction. Quantization (Q4_0, Q4_K_M, Q5_K_M, Q8_0) trades quality for throughput; the right choice depends on the worst-case target laptop (e.g. a 2021 M1 MacBook Air, a mid-tier Dell with no discrete GPU). (see [[gemma]])

## What we know so far

- V1 target: Gemma 2B or 3B, on-device.
- Acceptance latency carried over from MVP: under 5 seconds per note.
- No quantization commitment, no target hardware spec.

## What would resolve it

- Pick a worst-case target machine (e.g. "8GB RAM, 4-core CPU, no GPU").
- Benchmark Q4_K_M and Q5_K_M on that machine with a representative legal-note prompt.
- Commit to a throughput target (notes/min and tokens/sec).

## Answer

_(pending)_

## Related

- [[gemma]]
- [[auto-organization-pipeline]]
- [[local-first-architecture]]
