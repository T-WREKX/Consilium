---
title: Consilium V1 roadmap (first paying customers)
type: topic
status: active
tags: [consilium, v1, roadmap]
sources: [consilium-product-brief, consilium-product-requirements, consilium-project-architecture]
created: 2026-05-12
updated: 2026-05-12
---

# Consilium V1 roadmap

What [[consilium|Consilium]] becomes for first paying customers post-hackathon. Documented in detail across all three product docs; not built for the demo. The V1 spec is what justifies the [[consilium-business-model|practice-group license price]] and the [[pluggable-brain]] positioning.

## Synthesis

V1 turns the MVP's *architectural posture* into *operational reality*. The [[local-first-architecture]] claim becomes true (markdown on disk + [[gemma]] on-device). The [[redaction-pipeline]] gains two more passes and a proper preservation check. The [[knowledge-admin]] dashboard ships. The [[mcp-server]] endpoint goes live. The product becomes deployable into a real firm with SSO, audit logs, single-tenant isolation, and compliance.

## What ships in V1

### Native and on-device

- **Tauri desktop** (macOS, Windows, Linux) + **React Native mobile** (iOS, Android). (see [[tauri]])
- **Markdown files on disk** as the personal vault.
- **Local SQLite + `sqlite-vec`** for the local vector index.
- **[[gemma]] on-device** (2B or 3B) for personal-layer extraction and classification.
- **Cloud [[gemini]]** continues to handle the sanitized team-layer workload only.

### Governance

- **[[knowledge-admin|Knowledge Admin]] approval workflow** with dashboard: pending-approval count badge, side-by-side preview, approve/reject/edit-and-approve.
- **Practice Group Lead** gains "flag for promotion" affordance.
- **Audit log service** with 7-year retention.
- **Per-user access logs**: any lawyer can see who viewed their published insights.

### Security and identity

- **SSO via SAML/OIDC** (WorkOS or Auth0).
- **MFA mandatory for Knowledge Admin** role.
- **Per-firm encryption keys** via cloud KMS (AWS or GCP).
- **Single-tenant deployment per firm** (US-East default).

### Redaction

- **Four-pass [[redaction-pipeline]]**:
  1. Privileged content detection (fine-tuned legal model + Presidio)
  2. Client identifier scrubbing
  3. Generalization
  4. Preservation check (dedicated LLM call)

### Integrations (priority order)

| Integration | Direction | Priority |
|---|---|---|
| [[imanage]] / [[netdocuments]] | Inbound (seed team graph) | Critical |
| Microsoft 365 / Google Workspace | Bidirectional (SSO, calendar, email) | Critical |
| Slack / Teams | Bidirectional (capture, notifications) | Important |
| Zoom / Teams meetings | Inbound (transcripts) | Important |
| [[harvey]] / [[cocounsel]] / [[spellbook]] | Outbound (MCP) | Important |
| Westlaw / LexisNexis | Inbound (research extension) | Nice-to-have |
| PracticePanther / Clio | Inbound (matter context) | V2 |

### Pluggable brain

- **[[mcp-server]] endpoint** with `query` / `get_node` / `list_topics` tools and `team-graph` / `topics` / `recent-insights` resources.
- **OAuth 2.0 client-credentials** auth, scoped tokens, 24h expiry.
- **Configurable rate limits**, default 1000 queries/hour per integration.
- **Full SDK and public docs** at V1 launch.

### Compliance

- **SOC 2 Type II in progress** at launch.
- **ABA Formal Opinion 477R** compliance baseline.

## Pricing (indicative)

**Practice-group license**, tiered by practice-group size:

- 10–25 litigators: **$25K ARR**
- 25–50 litigators: **$50K ARR**
- 50–100 litigators: **$85K ARR**

**Full firm deployment at maturity**: ~**$200K ARR per firm** across multiple practice groups (land-and-expand).

Single SKU, **no per-seat metering**. (see [[consilium-business-model]])

> Pricing was revised on 2026-05-12 from a firm-wide license to a practice-group license. See [[consilium-business-model]] and [[consilium-decision-history]] Phase 11.

## Tensions and open questions

- **Per-firm KMS**: AWS or GCP? V1 stack table lists both; choice unresolved.
- **Embedding migration path**: if Google ships a non-768-d successor to `text-embedding-004`, what's the rebuild plan?
- **Channel partners** for the bottom end of SAM (firms that outsource KM to consultants) — named as necessary, not chosen.
- **Voice control "as a first-class feature"** is claimed under [[consilium-design-guidelines]] §10 accessibility; scope vs V2 is unresolved.

## Sources

- [[consilium-product-brief]]
- [[consilium-product-requirements]]
- [[consilium-project-architecture]]
