---
title: Consilium · Design Guidelines
type: source
status: mature
tags: [consilium, design, brand, ui]
raw: raw/design-guidelines.md
author: Consilium team
publication: Internal design doc
published: 2026 (v1, hackathon stage)
ingested: 2026-05-12
created: 2026-05-12
updated: 2026-05-14
---

# Consilium · Design Guidelines

> Source file: [`raw/design-guidelines.md`](../raw/design-guidelines.md)

## One-line summary

How Consilium looks, reads, and moves. Dark mode primary, GitHub-classic neutrals with **orange `#fb8500`** accent (revised from amber-gold `#d4a72c` on 2026-05-14), Source Serif Pro for body and Inter for UI, force-directed graphs as the spine, motion subtle except for the [[query-overlay-animation]] which is deliberately slow.

## Why it's here

The visual and verbal language of the product. Anchors [[consilium-design-system]] and the three [[hero-moments]] pages.

## Key claims

- **Brand personality**: modern, sleek, minimal, confident, institutional, intelligent. Not playful. No emoji in microcopy. No exclamation points.
- **Reference points (in priority order)**: [[harvey|Harvey]] (legal credibility, dark restrained), [[notion|Notion]] (density, structured editing), [[obsidian|Obsidian]] (graph aesthetic).
- **Theme**: dark mode primary. Light mode is V2.
- **Palette**: GitHub-classic dark neutrals + **orange accent (`#fb8500`)**, hover `#ff9d2a`, muted `#8a4900`, bg-tint `#2d1a06`. Semantic palette: success `#3fb950`, warning `#d29922`, danger `#f85149`, info `#58a6ff`. (Accent revised from amber-gold `#d4a72c` on 2026-05-14 — see [[log]].)
- **Strict rule**: [[node-color-coding|graph node colors]] never overlap with accent or semantic palettes. Keeps data distinct from UI signals.
- **Typography**: Source Serif Pro (body, headings), Inter (UI/nav/labels), JetBrains Mono (citation IDs, metadata). Avoid 800/900 weights.
- **Spacing**: 4px scale; Tailwind defaults. Density philosophy: spacious when consuming, dense when producing/scanning.
- **Primary breakpoint**: 1280px (typical lawyer's laptop).
- **Voice**: direct, clear, no apology-cute, no marketing exuberance. "Note saved" not "Yay!"
- **Iconography**: Lucide outlined; sizes 16/20/24px, no fractional scaling.
- **Motion durations**: fast 150ms, default 250ms, slow 400ms, deliberate 600–800ms (only for [[query-overlay-animation]]). Honor `prefers-reduced-motion`.
- **Three [[hero-moments]]**:
  1. **Publish flow with redaction** — side-by-side diff modal, preservation score bar, hoverable connecting curves between matched redaction pairs.
  2. **Chat with citations** — inline monospace `[1]` chips, sources section collapsed for high-confidence answers, refusal state fully designed.
  3. **Query-overlay graph animation** — chat dims, full-screen graph overlay, cited nodes pulse in rank order, then overlay fades back as response streams.
- **Component patterns**: buttons (primary/secondary/tertiary/destructive/icon-only), inputs (focus ring `accent-primary`), cards (`bg-surface`, 6px radius), modals (no blur for standard; blur reserved for query overlay), toasts (slide in bottom-right), citation chip (monospace, `accent-primary-bg` background), graph node (24px → 32px on selection).
- **Accessibility**: WCAG 2.1 AA baseline; voice control as first-class.
- **Out of scope for design [MVP]**: Knowledge Admin dashboard, approval workflow UI, light theme, settings page, account switching, mobile-native UI.
- **Design tokens file**: ready to drop into `apps/web/src/styles/tokens.css`.

## Sections / structure of the source

1. Brand Personality
2. Color System (base, accent, semantic, graph nodes)
3. Typography (families, scale, weights)
4. Spacing and Layout (scale, density, breakpoints, page structure)
5. Voice and Tone
6. Iconography
7. Motion
8. The Three Hero Moments
9. Component Patterns
10. Accessibility
11. Microcopy Reference
12. Out of Scope for Design
13. Design Tokens File

## Pages this source materially changed

- [[consilium-design-system]] — created (synthesis page consolidating all design tokens)
- [[hero-moments]] — created
- [[query-overlay-animation]] — refined with frame-by-frame choreography
- [[node-color-coding]] — created with the strict-non-overlap rule
- [[consilium]] — brand personality bullet added

## Re-ingest 2026-05-14 — accent color revision

Accent palette swapped from amber-gold to orange. Concrete changes:

| Token | Before | After |
|---|---|---|
| `accent-primary` | `#d4a72c` | `#fb8500` |
| `accent-primary-hover` | (n/a) | `#ff9d2a` |
| `accent-primary-muted` | (n/a) | `#8a4900` |
| `accent-primary-bg` | (legacy tint) | `#2d1a06` |
| Section 2.3 header | "Accent palette (amber/gold for institutional credibility)" | "Accent palette (orange for institutional credibility)" |
| Strict-rule wording (§2.5) | "no graph node color may overlap with the accent palette (gold/amber)" | "no graph node color may overlap with the accent palette (orange)" |
| `--node-witness` | `#ff9f1c` | `#ffd60a` (saffron — was too close to new orange accent) |
| `--node-statute` | `#fb5607` | `#d62828` (crimson — was too close to new orange accent) |

Propagated to: [[node-color-coding]] (palette rule + cited-edge color), [[query-overlay-animation]] (cited-edge illumination), [[insight-preservation-score]] (dot color label), [[hero-moments]] (confidence pill, preservation bar labels), [[rag-query-pipeline]] (confidence pill description), [[consilium-design-system]] (accent table + section heading), [[consilium-implementation-plan]] (G-2 active-state description), [[consilium-govern-implementation]] (token value), [[consilium-retrieval-implementation]] (cited-edge illumination). `raw/design-guidelines.md` and `raw/context-dump.md` left as-is per the immutability rule.

## Contradictions or tensions

> ⚠ Density philosophy: "Spacious for consuming, dense for producing/scanning" implies the chat surface (consuming) should be spacious — but chat history is dense by default in most modern apps. The doc lists chat under "dense working surfaces." Resolved: chat history is dense; the redaction modal (a consuming/deciding moment) is spacious.

## Open questions raised

- Light theme is V2; what is the trigger? Customer request, regulatory accessibility requirement, both?
- "Voice control as a first-class feature" is asserted under accessibility — what's the V1 implementation scope vs. V2?
- The signature [[query-overlay-animation]] reads as expensive on lower-end machines. What is the fallback above and beyond `prefers-reduced-motion`?

## Related

- [[consilium-product-brief]] — brand personality derives from positioning
- [[consilium-product-requirements]] — every UI acceptance criterion meets these guidelines
- [[consilium-project-architecture]] — Cytoscape.js choice ties graph visuals to MVP performance budget
