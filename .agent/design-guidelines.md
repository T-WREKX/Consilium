# Consilium · Design Guidelines

**Document type:** Design Guidelines
**Audience:** Designers, frontend engineers
**Status:** v1 · Hackathon stage
**Companion documents:** `product-brief.md`, `product-requirements.md`, `project-architecture.md`

---

## 1. Brand Personality

Consilium is **modern, sleek, minimal, confident, institutional, intelligent**.

It is not playful. It is not chirpy. It does not use emoji in microcopy. It treats lawyers as the precise, skeptical, time-pressured professionals they are. Every interaction should feel considered, fast, and quietly impressive.

Reference points (in priority order):
1. **Harvey** — for legal credibility and dark, restrained interfaces
2. **Notion** — for content density, structured editing, and warm professional feel
3. **Obsidian** — for the graph aesthetic that is central to Consilium

---

## 2. Color System

### 2.1 Theme

**Dark mode is primary.** Light mode is V2.

### 2.2 Base palette (GitHub classic dark)

| Token | Hex | Use |
|---|---|---|
| `bg-canvas` | `#0d1117` | App background |
| `bg-surface` | `#161b22` | Panels, cards, modals |
| `bg-surface-raised` | `#1c2128` | Hover, raised elements |
| `bg-overlay` | `#22272e` | Dropdowns, popovers |
| `border-default` | `#30363d` | Default borders |
| `border-muted` | `#21262d` | Subtle dividers |
| `text-primary` | `#e6edf3` | Primary text |
| `text-secondary` | `#7d8590` | Secondary text, metadata |
| `text-muted` | `#484f58` | Disabled, placeholders |

### 2.3 Accent palette (orange for institutional credibility)

| Token | Hex | Use |
|---|---|---|
| `accent-primary` | `#fb8500` | Primary actions, links, focus rings |
| `accent-primary-hover` | `#ff9d2a` | Hover state |
| `accent-primary-muted` | `#8a4900` | Subtle highlights, badges |
| `accent-primary-bg` | `#2d1a06` | Accent-tinted backgrounds |

### 2.4 Semantic palette

| Token | Hex | Use |
|---|---|---|
| `success` | `#3fb950` | Confirmation, published, healthy |
| `warning` | `#d29922` | Cautions, medium confidence |
| `danger` | `#f85149` | Errors, low confidence, refusals |
| `info` | `#58a6ff` | Informational, neutral signals |

### 2.5 Graph node color coding

> **Strict rule: no graph node color may overlap with the accent palette (orange) or semantic palette.** This keeps UI signals (selection, alerts) visually distinct from data.

| Node Type | Hex | Visual |
|---|---|---|
| `insight` | `#9d4edd` | Purple — the primary user-generated content type |
| `matter` | `#06d6a0` | Teal — case/matter container |
| `party` | `#ef476f` | Magenta — clients, opposing parties |
| `lawyer` | `#118ab2` | Steel blue — firm lawyers, opposing counsel |
| `judge` | `#073b4c` (with outline) | Deep slate with white outline — judicial figures |
| `witness` | `#ffd60a` | Saffron — expert and fact witnesses |
| `concept` | `#8338ec` | Violet — legal concepts, doctrines |
| `precedent` | `#3a86ff` | Sky blue — case law |
| `statute` | `#d62828` | Crimson — statutory authority |

Edges inherit a neutral `#30363d` at rest and brighten to `#7d8590` on hover. Cited edges during query overlay illuminate to `accent-primary` (orange) — this is the only place an accent color appears in graph viz, signaling "active cited path."

---

## 3. Typography

### 3.1 Type families

- **Body text:** Source Serif Pro (refined, editorial, lends institutional gravitas)
- **UI / navigation / labels:** Inter (clean, neutral, legible at small sizes)
- **Monospace:** JetBrains Mono (citation IDs, code, metadata)

Load via Google Fonts or self-host.

### 3.2 Scale

| Token | Size / Line-height | Family | Use |
|---|---|---|---|
| `display` | 48px / 1.1 | Source Serif Pro | Marketing pages only |
| `h1` | 32px / 1.25 | Source Serif Pro | Page titles |
| `h2` | 24px / 1.3 | Source Serif Pro | Section headers |
| `h3` | 18px / 1.4 | Source Serif Pro | Subsection, card titles |
| `body-lg` | 16px / 1.6 | Source Serif Pro | Primary reading |
| `body` | 15px / 1.6 | Source Serif Pro | Default body |
| `body-sm` | 14px / 1.55 | Source Serif Pro | Secondary content |
| `ui` | 14px / 1.4 | Inter | Buttons, navigation, labels |
| `ui-sm` | 13px / 1.4 | Inter | Form labels, captions |
| `ui-xs` | 12px / 1.3 | Inter | Metadata, timestamps |
| `mono` | 13px / 1.5 | JetBrains Mono | Citation IDs, technical refs |

### 3.3 Weight usage

- Source Serif: 400 (body), 600 (emphasized), 700 (headings)
- Inter: 400 (default UI), 500 (buttons, active states), 600 (strong emphasis)
- Avoid 800/900 weights — feels too "marketing"

---

## 4. Spacing and Layout

### 4.1 Spacing scale

4px-based scale: `2, 4, 8, 12, 16, 24, 32, 48, 64, 96`. Use Tailwind defaults.

### 4.2 Density philosophy

**Mix of spacious and dense.**

- **Spacious:** marketing surfaces (login, empty states, hero moments, the redaction modal)
- **Dense:** working surfaces (graph view, chat history, note editor sidebar)

Rule of thumb: when the user is *consuming* (reading, browsing, deciding), generous space. When the user is *producing or scanning* (capturing, searching, comparing), denser layout.

### 4.3 Layout breakpoints

| Breakpoint | Width | Notes |
|---|---|---|
| `sm` | 640px | Single column, mobile-style |
| `md` | 768px | Tablet, condensed layout |
| `lg` | 1024px | Standard desktop |
| `xl` | 1280px | Wide desktop, primary target |
| `2xl` | 1536px | Power users |

**Primary design target: 1280px** (typical lawyer's laptop or external monitor).

### 4.4 Standard page structure

```
┌────────────────────────────────────────────────┐
│  Top nav (56px, sticky, bg-surface)            │
├────────┬───────────────────────────────────────┤
│        │                                       │
│ Side   │   Main content (variable density)     │
│ nav    │                                       │
│ (240px)│                                       │
│        │                                       │
└────────┴───────────────────────────────────────┘
```

---

## 5. Voice and Tone

**Direct and clear.** Professional without being stiff. No exclamation points. No emoji. No "Oops!" or "Yay!"

Examples:

| Bad | Good |
|---|---|
| "Yay! Your note is saved 🎉" | "Note saved." |
| "Oops, something went wrong!" | "Couldn't save. Retry." |
| "Awesome work publishing!" | "Published. 12 colleagues can now see this." |
| "Let us know if you have any questions!" | "Documentation is in the help menu." |
| "Searching the firm's amazing knowledge..." | "Searching firm knowledge." |

**Refusal voice:** when the AI cannot answer confidently, the tone is matter-of-fact and respectful, never apologetic-cute:

> "I don't have firm knowledge that directly addresses this. You may want to capture your own thinking on this topic as a starting point."

---

## 6. Iconography

**Library:** Lucide Icons. Outlined style by default. Filled variant only for active states (e.g., active nav item, selected filter).

**Sizes:** 16px (inline), 20px (default UI), 24px (prominent actions). All icons render at integer pixel sizes; no fractional scaling.

**Color:** icons inherit `text-secondary` by default, `text-primary` on hover, `accent-primary` when active or selected.

---

## 7. Motion

**Subtle and functional.** Motion exists to aid understanding, never to entertain.

### 7.1 Durations

- `fast` — 150ms (button feedback, hover transitions)
- `default` — 250ms (panel open/close, dropdowns)
- `slow` — 400ms (modal entry, graph overlay fade)
- `deliberate` — 600–800ms (the query-overlay graph reveal — the only place we slow down on purpose)

### 7.2 Easing

- Default: `cubic-bezier(0.4, 0, 0.2, 1)` (Material standard)
- Entry: `cubic-bezier(0, 0, 0.2, 1)` (decelerate)
- Exit: `cubic-bezier(0.4, 0, 1, 1)` (accelerate)

### 7.3 Reduced motion

Honor `prefers-reduced-motion`. Disable graph animations, modal slides, and overlay reveals. Replace with instant state changes. The query-overlay graph still renders but does not animate.

---

## 8. The Three Hero Moments

These are the UI surfaces that must feel especially polished. Most design effort concentrates here.

### 8.1 Hero Moment 1 · Publish Flow with Redaction

The most consequential surface in Consilium. This is what makes legal AI legally defensible, and judges (and customers) need to *see* it working.

**Layout:**

```
┌─────────────────────────────────────────────────┐
│  Publish to team graph                       ✕  │
├─────────────────────────────────────────────────┤
│  Insight preservation: ●●●○○ 73%   ▼ details    │
├─────────────────────┬───────────────────────────┤
│                     │                           │
│  Original           │  To be published          │
│  (read-only)        │  (editable)               │
│                     │                           │
│  Our client         │  [CLIENT_A]               │
│  TechMed Inc        │  acquired                 │
│  acquired Acme      │  [ORG_B]                  │
│  Devices in         │  in a horizontal          │
│  Q3 2019...         │  transaction in a         │
│                     │  regulated industry...    │
│                     │                           │
├─────────────────────┴───────────────────────────┤
│                                                 │
│         [ Cancel ]      [ Publish ]             │
└─────────────────────────────────────────────────┘
```

**Design requirements:**

- Each redaction in the right pane has a colored underline (`accent-primary` for PII tokens, distinct softer hue for generalizations)
- Hovering a redaction in either pane highlights its match in the other pane with a faint connecting curve
- The preservation score bar uses 5 dots filling left-to-right; green at high, amber at medium, red at low
- Publish button is disabled until the preservation score is above 40% or the lawyer has manually edited the right pane (`data-edited="true"`)
- The "details" disclosure shows a list of every redaction with type, original, replacement, and reason

### 8.2 Hero Moment 2 · Chat with Citations

The retrieval payoff. This is where Consilium stops looking like a notes app and becomes the firm's brain.

**Layout:**

```
┌──────────────────────────────────────────────────────┐
│  Team Brain                                          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  You                                                 │
│  What has our firm learned about cross-examining     │
│  expert witnesses on damages calculations?           │
│                                                      │
│  ── Consilium ──────────────────────────────────────   │
│                                                      │
│  Our firm has developed three repeatable approaches  │
│  for cross-examining damages experts. The most       │
│  consistent technique is to establish the witness's  │
│  reliance on assumptions provided by counsel [1],    │
│  which has produced favorable rulings in two recent  │
│  matters [2,3]. A secondary approach focuses on...   │
│                                                      │
│  Confidence: High · 5 sources                        │
│                                                      │
│  ▾ Sources                                           │
│  [1] Cross-examining experts on counsel-supplied     │
│      assumptions — A. Patel, Mar 2024                │
│  [2] Damages expert deposition strategy — ...        │
│  [3] Motion in limine to exclude damages testimony — │
│                                                      │
├──────────────────────────────────────────────────────┤
│  [ Ask the firm... ]                          [ → ]  │
└──────────────────────────────────────────────────────┘
```

**Design requirements:**

- Citation chips are inline superscript-style, monospace font, mouse cursor on hover, click opens summary panel as a slide-in from the right
- Streaming response renders progressively; citation chips appear once that segment streams in
- Confidence badge is a small pill: green dot + "High", amber dot + "Medium", red dot + "Low"
- Sources section is collapsed by default for high-confidence answers, expanded by default for medium/low
- Refusal state is fully styled: clear message, no "fake sources", subtle suggestion to capture related personal note

### 8.3 Hero Moment 3 · Query-Overlay Graph Animation

The signature visual moment. The thing judges remember. Get this right.

**Flow:**

1. User submits query in chat input.
2. Chat window dims to 30% opacity within 150ms; input disabled.
3. A new full-screen overlay (`bg-canvas` at 95% with backdrop blur) fades in over 400ms.
4. The team graph fades in at the center over 400ms, positioned with the graph's centroid aligned to viewport center. All nodes start at 15% opacity.
5. As the backend returns the cited node IDs (typically within 1–2 seconds), cited nodes pulse to full opacity in waves — one node every 150ms, in order of relevance rank. Connecting edges between cited nodes illuminate to `accent-primary` as their endpoint nodes light up.
6. The overlay holds full state for ~1 second after all cited nodes are lit, giving the eye time to register the network.
7. As Gemini streams the response, the overlay fades back to transparent over 600ms; chat un-dims. Cited node IDs in the streaming text are clickable chips referencing the same node IDs.

**Design requirements:**

- Use `requestAnimationFrame` for the pulse waves to keep 60fps
- Each pulse is a brief scale (1.0 → 1.15 → 1.0) over 300ms paired with opacity (15% → 100%)
- Edges illuminate via `stroke` and `stroke-width` transitions; no flash
- Honor `prefers-reduced-motion`: skip pulse, set final state directly, no fade
- During the overlay, the chat input is non-interactive but the user can press Escape to dismiss

---

## 9. Component Patterns

### 9.1 Buttons

| Variant | Use | Visual |
|---|---|---|
| Primary | Main action (Publish, Send, Save) | `accent-primary` background, dark text |
| Secondary | Common alternatives (Cancel) | `bg-surface-raised`, `text-primary`, subtle border |
| Tertiary | Inline/text actions (link-style) | No background, `text-secondary` → `accent-primary` on hover |
| Destructive | Delete, reject | `danger` background |
| Icon-only | Compact toolbars | 32x32px, ghost background, tooltip required |

Heights: `sm` 32px, `default` 36px, `lg` 40px.

### 9.2 Input fields

- `bg-surface` background, `border-default` border
- Focus: `accent-primary` border, subtle inner glow ring
- Error: `danger` border, error text below
- Label sits above field, `ui-sm` size

### 9.3 Cards

- `bg-surface` background, 1px `border-default`
- 16px padding default, 24px for "spacious" contexts
- 6px border-radius
- Hover (when interactive): `bg-surface-raised`, slight border brightening

### 9.4 Modals

- Backdrop: `bg-canvas` at 70% opacity, no blur for standard modals (blur reserved for query overlay)
- Modal panel: `bg-surface`, `border-default`, 8px border-radius, drop-shadow
- Max width: 720px default; 960px for redaction modal
- Close affordance: top-right `✕` icon button, Escape key support

### 9.5 Notifications and toasts

- Slide in from bottom-right, 3-second auto-dismiss for success
- `success` left border (3px) on success toasts, similar for error/warning
- Stack vertically, max 3 visible

### 9.6 Citation chip

- Inline element, monospace font
- Background: `accent-primary-bg`, text: `accent-primary`
- Format: `[1]`, `[2,3]` (multi-citation comma-separated)
- Hover: subtle background brightening, cursor pointer
- Click: opens summary panel

### 9.7 Graph node visual

- Circle, 24px diameter by default, scales to 32px when selected
- Fill: color from section 2.5 by node type
- Stroke: 1px `border-default` at rest, `text-primary` when hovered, `accent-primary` when selected
- Label: positioned below node, `ui-xs` size, `text-secondary` color
- Hovered nodes have a soft glow (filter: drop-shadow)

---

## 10. Accessibility

- WCAG 2.1 AA baseline for all interactive surfaces
- All color combinations meet 4.5:1 contrast for text, 3:1 for UI elements
- Keyboard navigation: every interactive element reachable and operable; visible focus rings
- Screen reader: proper ARIA labels on icon-only buttons, graph nodes, citation chips
- `prefers-reduced-motion` honored everywhere
- Voice control as a first-class feature (mobile capture is voice-first; desktop has voice-feature-equal alongside text and image)
- Text resizing up to 200% without layout breaking on primary surfaces

---

## 11. Microcopy Reference

| Surface | Microcopy |
|---|---|
| Login title | "Sign in to Consilium" |
| Login button | "Continue" |
| Empty personal graph | "Capture your first note" |
| Capture: text | "Write" |
| Capture: audio | "Record" |
| Capture: image | "Upload" |
| Save state (auto-save) | "Saved" |
| Publish button | "Publish to team graph" |
| Redaction modal title | "Publish to team graph" |
| Publish confirmation | "Published. {N} colleagues can now see this." |
| Chat input placeholder | "Ask the firm..." |
| Refusal | "I don't have firm knowledge that directly addresses this. You may want to capture your own thinking on this topic as a starting point." |
| Low-confidence prefix | "I have limited firm knowledge on this. Based on what's available:" |
| Generic error | "Couldn't load. Retry." |

---

## 12. What's Out of Scope for Design [MVP]

The following are not designed for MVP. Engineers should not build them speculatively.

- **[V1]** Knowledge Admin dashboard
- **[V1]** Approval workflow UI
- **[V1]** Per-user access log surface ("who has viewed my insights")
- **[V1]** Account switching UI (MVP uses logout/login)
- **[V1]** Light theme
- **[V1]** Onboarding tour
- **[V1]** Settings / preferences page
- **[V1]** Search across personal + team graphs simultaneously
- **[V2]** Mobile-native UI
- **[V2]** Analytics dashboards
- **[V2]** Admin panel for firm-wide configuration

The MVP surfaces — login, capture, personal graph, publish/redaction modal, team graph, chat — are the only surfaces that need design polish. Everything else is documented for the future.

---

## 13. Design Tokens File [for implementation]

Suggested implementation in `apps/web/src/styles/tokens.css`:

```css
:root {
  /* Base */
  --bg-canvas: #0d1117;
  --bg-surface: #161b22;
  --bg-surface-raised: #1c2128;
  --bg-overlay: #22272e;
  --border-default: #30363d;
  --border-muted: #21262d;
  --text-primary: #e6edf3;
  --text-secondary: #7d8590;
  --text-muted: #484f58;

  /* Accent */
  --accent-primary: #fb8500;
  --accent-primary-hover: #ff9d2a;
  --accent-primary-muted: #8a4900;
  --accent-primary-bg: #2d1a06;

  /* Semantic */
  --success: #3fb950;
  --warning: #d29922;
  --danger: #f85149;
  --info: #58a6ff;

  /* Graph nodes */
  --node-insight: #9d4edd;
  --node-matter: #06d6a0;
  --node-party: #ef476f;
  --node-lawyer: #118ab2;
  --node-judge: #073b4c;
  --node-witness: #ffd60a;
  --node-concept: #8338ec;
  --node-precedent: #3a86ff;
  --node-statute: #d62828;

  /* Type */
  --font-serif: 'Source Serif Pro', Georgia, serif;
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  /* Motion */
  --duration-fast: 150ms;
  --duration-default: 250ms;
  --duration-slow: 400ms;
  --duration-deliberate: 700ms;
  --easing-default: cubic-bezier(0.4, 0, 0.2, 1);
  --easing-entry: cubic-bezier(0, 0, 0.2, 1);
  --easing-exit: cubic-bezier(0.4, 0, 1, 1);
}
```
