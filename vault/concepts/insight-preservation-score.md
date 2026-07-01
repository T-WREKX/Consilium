---
title: Insight preservation score
type: concept
status: active
tags: [redaction, metric, consilium]
sources: [consilium-product-requirements, consilium-design-guidelines, consilium-implementation-plan]
created: 2026-05-12
updated: 2026-05-14
---

# Insight preservation score

A 0–100% confidence metric attached to every redacted note. Computed by a single [[gemini|Gemini Flash]] call that reads both the original and the sanitized version and rates whether the **strategic insight is retained**. Replaces the explicit "Pass 4 preservation check" of the V1 [[redaction-pipeline|four-pass pipeline]] in MVP.

## How it works

- After Pass 1 (Presidio) and Pass 2 (Gemini generalization), a separate Gemini Flash call rates the sanitized version against the original.
- Returns a single numeric score 0–100.
- **Threshold rules** (per [[consilium-product-requirements]] §2.5.3):
  - **Below 60%**: yellow warning
  - **Below 40%**: red warning
  - The **Publish button is disabled** until the score is above 40% **or** the lawyer has manually edited the right pane (`data-edited="true"`).

## Visual treatment

Per [[consilium-design-guidelines]] §8.1, the score is rendered at the top of the redaction modal as a **5-dot bar filling left-to-right**: green (`success #3fb950`) at high, **amber** (`warning #d29922`) at medium, red (`danger #f85149`) at low. The medium-tier color is drawn from the *semantic* palette, not the accent palette — so the 2026-05-14 accent revision from amber-gold to orange does not affect this surface.

```
Insight preservation: ●●●○○ 73%   ▼ details
```

## Why it's load-bearing

The [[redaction-pipeline]] has two competing goals:

1. Strip privileged content.
2. Preserve the strategic insight that makes the note worth publishing.

Without a preservation check, the pipeline can succeed at goal 1 while quietly defeating goal 2 — leaving the team graph full of sanitized fragments that lawyers stop trusting. The score gives the lawyer (and the future Admin) a **legible signal** of when the system has over-redacted.

## Implementation (as shipped — `apps/api/src/services/redaction.ts` + `views/publish/PreservationScore.tsx`)

- **Model**: `gemini-2.5-flash`
- **System prompt**: `apps/api/src/prompts/preserve.md`
- **Return shape**: JSON `{ score: 0–100, reason: string }`
- **Parse-failure fallback**: returns `50` (neither green nor red — keeps the publish flow alive without falsely encouraging or blocking)
- **Visual**: 5 `.score-dot` elements, filled count `= Math.round((score / 100) * 5)`; thresholds **High ≥60 green**, **Medium 40–59 orange**, **Low <40 red**. Percentage shown beside dots.
- **Publish gate**: `confidence > 40 || hasManualEdit` (gate logic lives in `RedactionModal.tsx`, not in the score itself)

## Evolution

- **MVP**: single Flash call, single score.
- **V1**: a dedicated LLM call as **Pass 4** of the full four-pass pipeline, likely with explanation text per dimension (insight clarity, generalization integrity, action-ability).

## Open questions

- Calibration: 73% on what scale? The PRD does not commit to a calibration source. Risk of the score becoming "vibes-based."

## Sources

- [[consilium-product-requirements]]
- [[consilium-design-guidelines]]
- [[consilium-implementation-plan]]
