---
title: Consilium demo narrative (5 minutes)
type: topic
status: active
tags: [consilium, demo, hackathon]
sources: [consilium-product-brief, consilium-product-requirements, consilium-context-dump]
created: 2026-05-12
updated: 2026-05-12
---

# Consilium demo narrative (5 minutes)

The story [[consilium|Consilium]] tells live, in order. Timed for five minutes. Aligned across the brief (high-level beats) and the PRD (per-beat acceptance criteria).

## The four beats

### 0:00–0:30 — Setup (30 seconds)

Brief framing: legal AI is **blocked by privilege**; firms lose **billions** to knowledge loss; Consilium is the **privacy-architected knowledge fabric**.

### 0:30–1:30 — Capture (60 seconds)

Logged in as [[litigator|Lawyer]]. Open capture screen. **Record a 30-second audio note** about a deposition observation. Audio transcribes via [[whisper]]. [[auto-organization-pipeline]] runs; entities appear as chips. Personal graph updates live.

**Acceptance**: structured note produced with extracted entities within 5 seconds.

### 1:30–3:00 — Publish (90 seconds)

From the new note, click **"Publish to team graph"**. [[redaction-pipeline|Redaction modal]] opens. Show the side-by-side diff with redactions visibly applied. Walk through one or two redactions (hover the connecting curve; show the [[insight-preservation-score|preservation score]]). Approve. Confirmation toast.

**Acceptance**: publish flow completes end-to-end in **under 30 seconds, clockable on stage**.

### 3:00–4:30 — Retrieval (the climax, 90 seconds)

Switch accounts to a second lawyer (logout/login is acceptable for MVP; account switcher would be cleaner but is V1). Open chat. Submit the seeded query:

> *"What has our firm learned about cross-examining expert witnesses on damages calculations?"*

**The chat dims. The team graph fades in at center. Cited nodes pulse and light up. The graph fades back as the streaming response begins. Citations are clickable.** This is the [[query-overlay-animation|signature visual moment]] and the line judges remember.

**Acceptance**: query produces a coherent, cited response in under 10 seconds; overlay animation runs at 60fps.

### 4:30–5:00 — Close (30 seconds)

Frame what just happened:

- Privacy-protected capture
- Governed publishing
- Citation-grounded retrieval with visible reasoning

Mention V1: **native apps, on-device AI, [[mcp-server|MCP integration]] with the rest of the legal AI stack**. This is where the [[pluggable-brain]] tagline lands.

## Refusal segment (deliberate, ~15 seconds)

Build a dedicated refusal beat into the demo. Trigger a query the seed corpus does **not** answer, and use it to land the privilege-guarantee point. Decided: the refusal is **shown as a feature**, not encountered as a failure. (see [[demo-off-script-query-handling]])

**Talk-track when refusal appears** (whether deliberately or in Q&A):

> *"Watch what happens when we ask something the firm hasn't captured knowledge about — the system refuses rather than fabricating. That's the privilege guarantee made visible. A lawyer would never want a hallucinated answer they might cite in a brief."*

## Seed corpus and backup queries

- **MVP seed corpus**: Philippine laws, articles, and previous cases. The firm brain delivers useful answers from day one (matches [[adoption-strategy]] Pillar 2). (see [[acme-litigation-partners]])
- **Backup query coverage**: seed is designed so **2–3 additional queries beyond the canonical one** produce strong cited answers. If a judge asks off-script and the question happens to match a backup, the demo holds. If it doesn't match, the refusal segment above lands the point.
- **Seed voice**: conclusory + brief narrative justification, 2–3 sentences each — see [[acme-seed-voice-tone]].

## Pre-demo checklist

- All three demo accounts work; role differences visible (even if MVP role differences are limited)
- Seed data loaded; canonical query known to produce a strong response
- Refusal case tested (the failure mode is intentional and shippable)
- Confidence indicator visibly differs across high/medium/low cases
- Audio capture tested in the demo room's network conditions

## Risks during demo

- **Network flakiness** → cloud AI ([[gemini]], [[whisper]]) is the single point of failure. Have a cached canonical query ready.
- **Account switch friction** → logout/login is ~5 seconds; rehearse to remove fumbling.
- **The canonical query** is hardcoded; what if judges ask a different question? Resolved: rehearsed refusal talk-track + backup-query coverage + deliberate refusal segment. (see [[demo-off-script-query-handling]])

## Sources

- [[consilium-product-brief]]
- [[consilium-product-requirements]]
- [[consilium-context-dump]]
