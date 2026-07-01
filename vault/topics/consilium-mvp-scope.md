---
title: Consilium MVP scope (6-day hackathon)
type: topic
status: active
tags: [consilium, mvp, scope, hackathon]
sources: [consilium-product-requirements, consilium-product-brief, consilium-project-architecture, consilium-context-dump]
created: 2026-05-12
updated: 2026-05-12
---

# Consilium MVP scope (6-day hackathon)

What [[consilium|Consilium]] ships in six days, what it explicitly does not, and why the line is where it is. The "Do Not Build" list is load-bearing: anything not tagged `[MVP]` is **scope creep** that risks the demo. (see [[consilium-product-requirements]])

## Time budget

**6 days total**, split **4 days build + 2 days pitch/video/slides** for the [[wemakedevs-cognee-hackathon|WeMakeDevs Cognee Hackathon]] async-judging format. The [[consilium-project-architecture|architecture build plan]] occupies days 1–5 of the build window; day 6 is mostly non-build (hardening, demo dry runs, video recording, submission assets). (see [[consilium-context-dump]] §9)

## What ships

- **React + Vite single-page web app** with three demo accounts at [[acme-litigation-partners]].
- **Username/password auth** (JWT, 24h), no SSO, no signup.
- **Personal note capture**: text, audio ([[whisper]], 5-min cap), image ([[gemini|Gemini Vision]], 10MB).
- **[[auto-organization-pipeline]]**: single Gemini Pro call → entities + classification + privilege flag, <5s.
- **Personal graph view** (Obsidian-style force-directed, [[cytoscape-js]], 100+ nodes clean).
- **[[redaction-pipeline]] two-pass** with side-by-side diff + [[insight-preservation-score]].
- **Auto-flow to team graph** (no Admin approval step).
- **Team graph view** (read-only structural).
- **Chat with team brain** with citations, refusal, confidence indicator, streaming.
- **[[query-overlay-animation]]** with cited nodes pulsing.
- **Seed data**: 15–30 published insights + 5–8 personal notes for the Lawyer.
- **Deployed at a single public URL** (Vercel + Railway/Render).
- **Cost**: under $100 over the hackathon window.

## What does not ship (the "Do Not Build" list)

From [[consilium-product-requirements]] §3:

- Knowledge Admin approval dashboard (V1)
- Supervisor escalation workflows (V1)
- Browser extension, calendar integration, email forward (V1)
- Mobile native apps (V1)
- True on-device LLM inference (V1)
- True local filesystem markdown storage (V1)
- SSO / SAML / OIDC (V1)
- [[imanage]] / [[netdocuments]] integration (V1)
- [[mcp-server]] endpoint (V1 — architecture only)
- Multi-firm tenancy (V1)
- Audit log UI (V1)
- Per-user access logs (V1)
- Ethical wall enforcement (V1+)
- Real-time collaboration on notes (OUT)
- Built-in document drafting (OUT — Consilium integrates with drafting tools)
- Time tracking and billing (OUT)
- Conflict checking automation (OUT)
- Client portals (OUT)
- Court filing integration (OUT)

## Why this line

The MVP is the demo. The demo wins or loses the hackathon. The PRD is explicit: **"If a feature is not tagged [MVP], do not build it for the hackathon."**

Anything below the line either (a) does not contribute to the [[consilium-demo-narrative|5-minute demo]], (b) requires production infrastructure (audit, compliance, multi-tenancy), or (c) belongs to the [[pluggable-brain]] story which is V1 by design.

## MVP simplifications that matter

- **Knowledge Admin auto-approve** — the role exists in the data model but the dashboard does not ship. Demo accordingly does not switch to the admin account.
- **Two-pass redaction** — not four. The simplified pipeline is paired with a single [[insight-preservation-score]] call.
- **Cloud AI** ([[gemini]] + [[whisper]]) — the [[local-first-architecture]] story is supported architecturally (notes in IndexedDB; redaction before any cloud call sees published content) but on-device inference is V1.
- **Personal notes in IndexedDB**, not on disk.
- **Login switch** between accounts is acceptable; an account-switcher UI is V1.

## Contingency plans

Per [[consilium-project-architecture]] §11:

| Slip risk | Fallback |
|---|---|
| Pass 2 generalization quality | Ship Pass 1 only with manual review UI |
| Query-overlay graph animation | Simplified animation (dim chat, no graph fly-in) |
| Image capture | Drop entirely; demo with text + audio only |
| Personal graph perf > 100 nodes | Cap demo seed at 50 personal nodes |

## Acceptance criteria summary

The 12-item checklist (per [[consilium-product-requirements]] §7) ranges from "three demo accounts work" through "query-overlay graph animation triggers correctly and runs smoothly" to "demo script can be executed end-to-end without errors in under 5 minutes."

## Sources

- [[consilium-product-requirements]]
- [[consilium-product-brief]]
- [[consilium-project-architecture]]
- [[consilium-context-dump]]
