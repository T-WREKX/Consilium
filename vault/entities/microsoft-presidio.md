---
title: Microsoft Presidio
type: entity
status: active
tags: [pii, redaction, oss, microsoft]
sources: [consilium-project-architecture, consilium-product-requirements, consilium-implementation-plan]
created: 2026-05-12
updated: 2026-05-14
---

# Microsoft Presidio

Open-source PII (Personally Identifiable Information) detection and anonymization framework from Microsoft. Self-hosted in a Docker container; provides regex + NER tokenization. In Consilium it powers **Pass 1** of the [[redaction-pipeline]].

## Key facts

- **Self-hosted**: Docker container deployed alongside the backend. (see [[consilium-project-architecture]])
- **Detection types tokenized in Pass 1**:
  - Person names → `[PERSON_A]`, `[PERSON_B]` (consistent within a note)
  - Organizations → `[ORG_A]`
  - Monetary amounts → `[AMOUNT]`
  - Dates → `[DATE]` (or `[DATE_OFFSET_FROM_FILING]` if a filing date is detected)
  - Email addresses, phone numbers, addresses → respective tokens
- **Output**: tokenized content + redaction map (`{ original, replacement, type, position }` array used by the diff UI).
- **Why it's chosen**: hybrid regex + NER coverage, self-hosted (privilege-compatible), free.

## Role in the redaction pipeline

- **MVP**: Pass 1 only (Presidio); Pass 2 generalization runs on [[gemini]]; preservation score (the simplified V1 Pass 4) is a Gemini Flash call.
- **V1**: full four-pass pipeline — privilege detection (fine-tuned legal model + Presidio), client identifier scrubbing, generalization, preservation check.

## Deployment (as shipped)

- **Two sidecar containers** in `infra/docker-compose.yml`:
  - `presidio-analyzer` — image `mcr.microsoft.com/presidio-analyzer:latest`, port **5001**
  - `presidio-anonymizer` — image `mcr.microsoft.com/presidio-anonymizer:latest`, port **5002**
- **Backend integration** (`apps/api/src/services/redaction.ts`): the API calls `POST /analyze` then `POST /anonymize` against these services; URLs are env-overridable via `PRESIDIO_ANALYZER_URL` / `PRESIDIO_ANONYMIZER_URL`.
- **Failure fallback**: if either Presidio service is unreachable, the API drops to a regex-only fallback covering three patterns (PERSON / EMAIL / PHONE). The coarser fallback keeps publish flows working but skips ORG / AMOUNT / DATE detection. (see [[consilium-govern-implementation]])

## Relations

- **Used by**: [[consilium]] [[redaction-pipeline]] (Pass 1 in MVP, Passes 1–2 in V1)
- **Complement**: [[gemini]] (generalization and preservation)

## Open questions

- Out-of-the-box Presidio recognizers vs. custom legal recognizers — the V1 spec implies a fine-tuned legal model is layered on top; what's its training data and provenance?

## Sources

- [[consilium-project-architecture]]
- [[consilium-product-requirements]]
- [[consilium-implementation-plan]]
