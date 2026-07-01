---
title: Consilium design system
type: topic
status: active
tags: [consilium, design, system]
sources: [consilium-design-guidelines]
created: 2026-05-12
updated: 2026-05-12
---

# Consilium design system

Synthesis of [[consilium-design-guidelines]] for quick reference. Dark mode primary, GitHub-classic neutrals, **orange accent (`#fb8500`)** (revised from amber-gold on 2026-05-14), Source Serif Pro for body, Inter for UI, JetBrains Mono for code/citations.

## Color tokens

### Base (GitHub classic dark)

| Token | Hex |
|---|---|
| `bg-canvas` | `#0d1117` |
| `bg-surface` | `#161b22` |
| `bg-surface-raised` | `#1c2128` |
| `bg-overlay` | `#22272e` |
| `border-default` | `#30363d` |
| `border-muted` | `#21262d` |
| `text-primary` | `#e6edf3` |
| `text-secondary` | `#7d8590` |
| `text-muted` | `#484f58` |

### Accent (orange) — revised 2026-05-14

Previous amber-gold palette retired (`#d4a72c` and its variants). Current values match the updated `.agent/design-guidelines.md`:

| Token | Hex |
|---|---|
| `accent-primary` | `#fb8500` |
| `accent-primary-hover` | `#ff9d2a` |
| `accent-primary-muted` | `#8a4900` |
| `accent-primary-bg` | `#2d1a06` |
| `--accent-primary-rgb` | `251, 133, 0` (added 2026-05-14 to support `rgba(var(--accent-primary-rgb), α)` drop-shadow filters on the [[consilium-logo|logo]] and citation chip motion glows) |

### Semantic

| Token | Hex |
|---|---|
| `success` | `#3fb950` |
| `warning` | `#d29922` |
| `danger` | `#f85149` |
| `info` | `#58a6ff` |

### Graph nodes

See [[node-color-coding]]. Strict rule: **no overlap with accent or semantic**. 2026-05-14 palette adjustments alongside the accent rebrand: `witness` `#ff9f1c` → **`#ffd60a`** (saffron); `statute` `#fb5607` → **`#d62828`** (crimson). Both moved away from the new orange accent.

## Typography

| Family | Use |
|---|---|
| Source Serif Pro | Body text, headings |
| Inter | UI / navigation / labels |
| JetBrains Mono | Citation IDs, code, metadata |

Scale: `display 48` / `h1 32` / `h2 24` / `h3 18` / `body-lg 16` / `body 15` / `body-sm 14` / `ui 14` / `ui-sm 13` / `ui-xs 12` / `mono 13`.

## Spacing

4px scale: `2, 4, 8, 12, 16, 24, 32, 48, 64, 96`. Tailwind defaults.

## Density

**Spacious** for consuming surfaces (login, empty states, redaction modal). **Dense** for working surfaces (graph view, chat history, note editor sidebar). Rule of thumb: *consuming → space; producing/scanning → density.*

## Breakpoints

`sm 640` / `md 768` / `lg 1024` / `xl 1280` (primary design target — lawyer's laptop) / `2xl 1536`.

## Motion

| Token | Duration | Use |
|---|---|---|
| `fast` | 150ms | Button feedback, hover |
| `default` | 250ms | Panels, dropdowns |
| `slow` | 400ms | Modal entry, overlay fade |
| `deliberate` | 600–800ms | [[query-overlay-animation]] (the only place) |

Easing: default `cubic-bezier(0.4, 0, 0.2, 1)`, entry `cubic-bezier(0, 0, 0.2, 1)`, exit `cubic-bezier(0.4, 0, 1, 1)`.

Honor `prefers-reduced-motion` everywhere.

## Components

- **Buttons**: primary (accent bg, dark text), secondary (`bg-surface-raised`), tertiary (text link), destructive (`danger`), icon-only (32×32, tooltip required). Heights `sm 32` / `default 36` / `lg 40`.
- **Inputs**: `bg-surface`, `border-default`. Focus: `accent-primary` border + subtle inner glow.
- **Cards**: `bg-surface`, 1px `border-default`, 16px padding (24px for spacious), 6px radius.
- **Modals**: `bg-canvas` 70% backdrop, no blur (blur reserved for query overlay). Panel `bg-surface`, 8px radius, drop-shadow. Max width 720 / 960 (redaction modal). Top-right `✕`, Escape key.
- **Toasts**: slide in bottom-right, 3s auto-dismiss, colored left border. Max 3 visible.
- **Citation chip**: inline monospace, `accent-primary-bg` background, `accent-primary` text, `[1]` or `[2,3]` format.
- **Graph node**: 24px circle (32px selected), fill by [[node-color-coding|type]], 1px stroke, label below.

## Iconography

Lucide outlined. Sizes 16 / 20 / 24px. Inherit `text-secondary`; `text-primary` on hover; `accent-primary` when active or selected.

## Voice

Direct, clear, professional without being stiff. No exclamation points. No emoji. No apology-cute language.

| Bad | Good |
|---|---|
| "Yay! Your note is saved 🎉" | "Note saved." |
| "Oops, something went wrong!" | "Couldn't save. Retry." |
| "Awesome work publishing!" | "Published. 12 colleagues can now see this." |

Refusal voice: *"I don't have firm knowledge that directly addresses this. You may want to capture your own thinking on this topic as a starting point."*

## Accessibility

- WCAG 2.1 AA baseline.
- 4.5:1 contrast for text, 3:1 for UI elements.
- Keyboard navigation everywhere; visible focus rings.
- ARIA labels on icon-only buttons, graph nodes, citation chips.
- `prefers-reduced-motion` honored.
- Text resize to 200% without layout breaking on primary surfaces.
- Voice control as a first-class feature.

## Out of scope (MVP)

Knowledge Admin dashboard, approval workflow UI, per-user access log, account switcher, light theme, onboarding tour, settings page, search across personal + team. All V1+.

## Token file

Drop into `apps/web/src/styles/tokens.css`. Full token list in [[consilium-design-guidelines]] §13.

## Sources

- [[consilium-design-guidelines]]
