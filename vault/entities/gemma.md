---
title: Gemma (on-device, V1)
type: entity
status: active
tags: [ai-model, on-device, v1, google]
sources: [consilium-project-architecture, consilium-product-brief]
created: 2026-05-12
updated: 2026-05-12
---

# Gemma

Google's open-weight small LLM family. In Consilium **V1**, Gemma runs **on-device** for personal-layer entity extraction and basic classification. The on-device path is what turns Consilium's [[local-first-architecture|local-first story]] from architectural marketing (MVP) into reality (V1).

## Key facts

- **Model size**: 2B or 3B parameters, chosen for runtime fit on consumer hardware. (see [[consilium-project-architecture]])
- **Role**: handles [[auto-organization-pipeline|extraction and classification]] for personal notes inside the native desktop ([[tauri]]) and mobile apps.
- **Privacy outcome**: privileged content never leaves the device; only sanitized content reaches the cloud [[gemini]] API.
- **Not in MVP**: hackathon stage runs all AI in the cloud via [[gemini]]; the local-first claim is supported by the architecture (personal notes stay in IndexedDB) but not by the inference path.

## Relations

- **V1 replacement for**: [[gemini]] in the personal-layer pipeline
- **Runs inside**: [[tauri]] desktop shell + native mobile apps
- **Local store**: SQLite with `sqlite-vec` extension for the local vector index
- **Cloud counterpart**: [[gemini]] continues to handle the team-layer (sanitized) workload

## Open questions

- Quantization strategy and target throughput (notes/min) on a typical lawyer's laptop are not specified.
- Fallback path when on-device inference is unavailable (e.g., older hardware) — degrade to cloud with explicit user consent, or block the feature?

## Sources

- [[consilium-project-architecture]]
- [[consilium-product-brief]]
