---
title: Index
type: index
status: active
updated: 2026-05-15
---

# Index

Catalog of every page in the wiki. Updated on every ingest and every lint.

## Sources

- [[karpathy-llm-wiki-pattern]] — Karpathy's gist defining the LLM Wiki pattern this vault implements
- [[consilium-product-brief]] — One-sentence pitch, problem, product, market, hackathon framing
- [[consilium-product-requirements]] — PRD: roles, MVP feature spec, V1 scope, acceptance criteria
- [[consilium-project-architecture]] — MVP and V1 architecture, stack, data model, AI pipelines, API
- [[consilium-design-guidelines]] — Brand, color, type, motion, hero moments, microcopy
- [[consilium-context-dump]] — Full conceptual journey, decision rationale, rejected ideas, glossary
- [[consilium-implementation-plan]] — 6-day hackathon sprint plan: 25 tickets, developer assignments, contingency plans
- [[consilium-seed-data-analysis]] — the team's executive summary of the complete seeding system across auth, team graph, and personal notes

## Entities

### Product
- [[consilium]] — The product itself: privacy-first knowledge fabric for law firms
- [[stratum]] — The original codename for Consilium (do not use externally)
- [[consilium-vault-assistant]] — Claude system prompt that answers Consilium questions grounded in the vault

### Organizations (demo)
- [[acme-litigation-partners]] — Pre-seeded demo firm and commercial-litigation practice group

### Hackathon org and sponsors
- [[wemakedevs-cognee-hackathon]] — Hosts the AI & Big Data Expo hackathon; Consilium competes in Track 4
- [[veea]] — Track 1 sponsor; maker of [[lobster-trap]]
- [[lobster-trap]] — Veea's DPI proxy; optional deferred integration for Consilium

### Roles and personas
- [[litigator]] — Primary user persona: 4–8 year litigation associate at a mid-size firm
- [[practice-group-lead]] — Validator persona: partner leading the litigation practice group
- [[knowledge-admin]] — V1 buyer-aligned persona: KM Partner / KM Director

### AI and model providers
- [[gemini]] — Google's Gemini 2.5 Pro / Flash / Vision and `text-embedding-004`
- [[gemma]] — On-device model used in V1 for personal-layer extraction
- [[whisper]] — OpenAI Whisper API for audio transcription
- [[microsoft-presidio]] — Self-hosted PII detection used in redaction Pass 1

### Tools and platforms (frontend, infra)
- [[obsidian]] — Markdown vault app; the IDE for the Wiki pattern
- [[cytoscape-js]] — Graph visualization library chosen for Consilium MVP
- [[postgres-pgvector]] — Single Postgres database with pgvector for embeddings
- [[react-vite]] — Frontend framework and build tool for the MVP SPA
- [[tauri]] — V1 cross-platform desktop shell

### Document management and integrations (V1)
- [[imanage]] — Legal DMS, V1 integration target for seeding the team graph
- [[netdocuments]] — Legal DMS, V1 integration target

### Competitors and adjacent products
- [[harvey]] — Legal AI competitor / future MCP consumer; $3B (2025) reference comp
- [[spellbook]] — Legal AI for drafting
- [[cocounsel]] — Legal AI for research
- [[glean]] — Enterprise search; cloud-first model incompatible with privilege
- [[notion]] — Generic team knowledge; lacks legal compliance posture
- [[rewind-ai]] — Rejected reference: always-on capture pattern explicitly ruled out

## Concepts

- [[llm-wiki-pattern]] — Persistent compounding wiki maintained by an LLM, vs ephemeral RAG
- [[memex]] — Vannevar Bush's 1945 vision; spiritual predecessor to the wiki pattern
- [[rag]] — Retrieval-augmented generation; contrast and basis for the wiki pattern
- [[attorney-client-privilege]] — Legal doctrine that structurally blocks generic AI adoption
- [[two-layer-architecture]] — Personal brain (local) + team-managed graph (cloud) separation
- [[three-graph-views]] — Personal, team-admin, query-overlay graphs
- [[pluggable-brain]] — Consilium as the substrate other AI tools plug into via MCP
- [[redaction-pipeline]] — Two-pass MVP (Presidio + Gemini generalization) → four-pass V1
- [[auto-organization-pipeline]] — Single Gemini call: extract + classify + privilege detect
- [[rag-query-pipeline]] — Embed → top-k vector search → 1-hop graph expansion → grounded synthesis
- [[query-overlay-animation]] — Signature visual: chat dims, team graph fades in, cited nodes pulse
- [[mcp-server]] — V1 endpoint exposing the team graph to Harvey, CoCounsel, Copilot
- [[citation-grounding]] — Every claim cites a node ID; refuse rather than hallucinate
- [[insight-preservation-score]] — Single-LLM-call confidence metric on redacted content
- [[force-directed-graph]] — Layout algorithm; nodes repel, edges attract
- [[local-first-architecture]] — Personal notes never leave the device unsanitized
- [[node-color-coding]] — Strict rule: graph palette never overlaps with UI accent/semantic
- [[knowledge-graph-extraction]] — Pipeline from raw capture to entity/edge inserts
- [[hero-moments]] — Three UI surfaces where design polish must concentrate
- [[adoption-strategy]] — Two pillars + departure-capture exception + reinforcing reciprocity
- [[ethical-wall]] — Chinese-wall doctrine; V1+ retrieval-filter requirement
- [[derived-edges]] — Obsidian-style automatic connections in the team and personal graphs: shared-entity, classification-hub, embedding-similarity, entity-co-occurrence
- [[graph-zoom-control]] — Persistent zoom widget for the personal and team graph views: range 20–150%, gradient slider, fit-to-view reset, adaptive label threshold
- [[note-wikilinks]] — Author-stated `[[Title]]` linking in personal notes: UUID-stable resolution, soft delete, backlinks panel, solid-purple `linked_to` edges + organize-provenance model
- [[chat-query-classifier]] — Gemini Flash router that decides every chat message between knowledge (RAG) and conversational (no retrieval); fails safe to knowledge
- [[conversational-chat-path]] — No-retrieval Gemini Flash chat reply for greetings, capability questions, prior-turn follow-ups; hard rule against substantive legal claims from training data
- [[gemini-retry-backoff]] — Shared `withGeminiRetry` wrapper for every Gemini SDK call: exponential backoff + full jitter, per-attempt timeout, retryable-error classification

## Topics

- [[legal-ai-landscape]] — Competitive map: point tools, DMS, enterprise search, generic KM
- [[consilium-mvp-scope]] — What ships in 6 days, what does not, and why
- [[consilium-v1-roadmap]] — First paying customers: native apps, on-device LLM, approvals, MCP
- [[consilium-v2-vision]] — Cross-firm benchmarks, ethical walls, EU deployment, vertical expansion
- [[consilium-tech-stack]] — Frontend, backend, database, AI, deployment — MVP and V1
- [[consilium-data-model]] — Postgres schema for team graph; IndexedDB schema for personal notes
- [[consilium-ai-pipelines]] — Auto-organize, redact, RAG query — sequence diagrams and prompts
- [[consilium-api-surface]] — REST endpoints for the MVP backend
- [[consilium-design-system]] — Tokens, type, components, motion
- [[consilium-demo-narrative]] — Five-minute hackathon demo flow
- [[consilium-business-model]] — Practice-group license + land-and-expand; market sizing TAM/SAM/SOM
- [[competitive-moat]] — Vertical depth, privacy architecture, pluggable positioning, network effects
- [[hackathon-judging-fit]] — Why Consilium maps cleanly to Track 4 and the Gemini Award
- [[consilium-decision-history]] — Ten-phase reasoning chain from Obsidian curiosity to locked MVP
- [[consilium-rejected-ideas]] — Queryable surface of ideas explicitly ruled out (don't regress)
- [[consilium-codebase-structure]] — Monorepo layout: apps/, .agent/, infra/, docs/, vault/ — file ownership per developer
- [[consilium-implementation-plan]] — 6-day sprint breakdown: 25 tickets (K-1–K-8, G-1–G-8, N-1–N-8), day-by-day plan, contingencies
- [[consilium-capture-implementation]] — CAPTURE domain (Capture domain) fully implemented: IDB layer, types, organize service, all capture views, personal graph, seed data
- [[consilium-govern-implementation]] — GOVERN domain (Govern domain) fully implemented: auth, rate limiting, redaction backend + modal, app shell, team graph view, Toast
- [[consilium-retrieval-implementation]] — RETRIEVAL domain (Retrieval domain) fully implemented: DB schema, 20-node seed, RAG service, SSE chat, canvas query overlay, deployment, audit fixes

## Questions

Status legend: **✓** answered · **◐** partially answered · *(no mark)* open. Once answered, the originating pages get updated to absorb the answer.

### Architecture and infrastructure
- [[embedding-model-migration-path]] — what if Gemini's embedding dimension changes?
- [[firm-graph-scale-beyond-10k-nodes]] — V1 plan at 100k+ nodes per firm
- [[per-firm-kms-aws-vs-gcp]] — pick one or per-firm choice
- [[tauri-auto-update-and-signing]] — distribution/signing strategy
- [[tauri-gemma-inference-bridge]] — webview↔inference path
- ✓ [[cytoscape-webgl-vs-canvas]] — **canvas**
- ✓ [[react-vite-bundle-size-budget]] — **500KB gzipped, <2s TTI, code-split chat/capture/graph, lazy Cytoscape & WaveSurfer**

### AI pipelines
- [[auto-organization-json-validation-fallback]] — Gemini structured-output failure path
- [[on-device-speech-recognition-path]] — V1 audio (Whisper.cpp vs native)
- [[gemma-quantization-and-throughput]] — on-device throughput target
- [[gemma-fallback-on-old-hardware]] — degrade or block?
- [[presidio-custom-legal-recognizers-training]] — V1 fine-tuned model provenance
- [[insight-preservation-score-calibration]] — calibrating the 0–100 score

### Privacy, privilege, ethical wall
- [[ethical-wall-conflicts-db-source]] — which conflicts DB to inherit from
- [[ethical-wall-retrieval-time-behavior]] — what happens when retrieval would cite a walled node
- [[ethical-wall-denied-read-audit-logging]] — separate log channel?
- [[cross-layer-search-privilege-handling]] — V1+ unified search

### MCP and retrieval
- [[mcp-client-readiness-harvey-cocounsel-copilot]] — first integration partner
- [[mcp-developer-docs-surface]] — V1 docs platform
- [[graph-augmented-rag-generalization]] — does graph augmentation pay off

### Personas and adoption
- ✓ [[practice-group-lead-mvp-distinctiveness]] — **same access as Lawyer in MVP + rehearsed talk-track; Lead dashboard ships in V1**
- [[lead-flag-for-promotion-ui]] — V1 design surface
- [[litigator-capture-frequency-target]] — target metric
- [[knowledge-admin-dashboard-surfaces-v1]] — admin dashboard design
- [[buyer-at-firms-without-km-function]] — substitute buyer
- [[departure-capture-mechanics]] — offboarding flow design
- ◐ [[v1-seed-strategy-at-firm-onboarding]] — **MVP: PH laws/articles/cases. V1 customer-onboarding still open.**
- [[performance-review-integration]] — does it ever ship

### Demo and hackathon
- ✓ [[demo-off-script-query-handling]] — **rehearsed talk-track + 2–3 backup queries seeded + explicit refusal segment**
- [[wemakedevs-cognee-judging-weights-demo-vs-video]] — rubric weight
- [[lobster-trap-day-5-go-no-go]] — integrate or skip
- [[lobster-trap-latency-cost-measurement]] — measure first
- [[lobster-trap-legal-policy-defaults]] — does it ship usable rules
- ✓ [[acme-seed-voice-tone]] — **conclusory + brief narrative justification, 2–3 sentences each, senior-partner-dictating voice**

### Design
- [[light-theme-trigger]] — when does light mode ship
- [[voice-control-v1-scope]] — first-class feature scope
- [[query-overlay-low-end-fallback]] — beyond `prefers-reduced-motion`

### Integrations
- [[imanage-v1-api-path]] — REST vs MFAPI vs plugins
- [[dms-ingest-volume-strategy]] — cost envelope at firm scale

### Competitive watch
- [[glean-on-prem-comparison]] — has Glean shipped on-prem?
- [[spellbook-privilege-posture]] — privilege-friendly?
- [[harvey-mcp-roadmap]] — published?

### Business and roadmap
- [[tam-adjacent-verticals-trajectory]] — timeline and capital
- [[channel-partner-strategy-for-sam-long-tail]] — which partners
- [[v2-vertical-expansion-order]] — practice areas first or in-house first

### Vault meta
- [[multi-curator-vault-discipline]] — scaling the wiki pattern
- [[index-only-retrieval-scale-limit]] — when to install qmd
- [[contradiction-flag-vs-silent-update]] — rule for ⚠ flags
