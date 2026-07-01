# Consilium · Full Context Dump

**Purpose:** A complete record of how Consilium was conceptualized, from the very first question about Obsidian through to the final product definition. This document exists so that anyone (including future Claude instances, new team members, or your future self) can reconstruct not just *what* Consilium is but *why every decision was made the way it was*.

**Format:** Roughly chronological, organized by phase. Each phase shows the question being explored, the key insights, the decisions made, and what was rejected.

**Status:** Captured from full session, hackathon stage

---

## Table of Contents

1. [The Starting Point: Curiosity About Obsidian](#1-the-starting-point-curiosity-about-obsidian)
2. [Phase 1 — Surveying the Knowledge Management Landscape](#2-phase-1--surveying-the-knowledge-management-landscape)
3. [Phase 2 — Identifying the Market Gap](#3-phase-2--identifying-the-market-gap)
4. [Phase 3 — From Vague Idea to Initial Thesis](#4-phase-3--from-vague-idea-to-initial-thesis)
5. [Phase 4 — The Healthcare Detour](#5-phase-4--the-healthcare-detour)
6. [Phase 5 — Reframing for Enterprise (the Hackathon Pivot)](#6-phase-5--reframing-for-enterprise-the-hackathon-pivot)
7. [Phase 6 — Picking the Vertical: Legal Wins](#7-phase-6--picking-the-vertical-legal-wins)
8. [Phase 7 — Defining the Product (Stratum → Consilium)](#8-phase-7--defining-the-product-stratum--consilium)
9. [Phase 8 — The Adoption Strategy Problem](#9-phase-8--the-adoption-strategy-problem)
10. [Phase 9 — Hackathon-Specific Strategy](#10-phase-9--hackathon-specific-strategy)
11. [Phase 10 — Locking the MVP](#11-phase-10--locking-the-mvp)
12. [Phase 11 — Refining Business Model and Market Positioning](#12-phase-11--refining-business-model-and-market-positioning)
13. [Decisions Index](#13-decisions-index)
14. [Rejected Ideas Index](#14-rejected-ideas-index)
15. [Glossary of Concepts](#15-glossary-of-concepts)

---

## 1. The Starting Point: Curiosity About Obsidian

The conversation began with simple curiosity about Obsidian — what platforms it ran on, then quickly broadened: "what applications are for obsidian?" The next question was the inflection point: **"is obsidian mainly for personal use? are there other use cases for the 2nd brain?"**

This question — about whether the "second brain" concept extended beyond personal use — was the seed for everything that followed.

**Key insight at this stage:** Obsidian was conceived as a single-user, local-first tool. Use cases beyond personal — academic research, writing, software development, teaching, business consulting, therapy, tabletop RPGs — all exist, but each is still fundamentally one person's vault. Obsidian has no admin layer, no permissioning, no centralized user management, no audit logs.

The next question pushed deeper: **"so there is no centralized way to manage multiple 2nd brains in a team?"**

The answer was effectively no. Workarounds exist (Git-shared vaults, Obsidian Sync, cloud storage, Relay plugin) but none address the real structural problem: there's no way to govern how knowledge flows from individuals to teams to organizations.

---

## 2. Phase 1 — Surveying the Knowledge Management Landscape

To understand the market, we walked through the landscape of tools attempting to be "centralized second brains":

**True centralized team second brain platforms:** Notion (dominant), Tana, Capacities, AFFiNE, Anytype

**Networked/social knowledge tools:** Mem, Reflect, Saga

**Open-source / self-hosted:** Logseq, AppFlowy, SiYuan, Trilium

**AI-powered shared brains (the interesting frontier):** Glean, Hebbia, Guru, Slab — these explicitly try to be "the team's collective second brain" with LLMs as the interface

**The fundamental tension uncovered:**
Personal note-taking and team knowledge management have *different* requirements. Personal brains thrive on idiosyncratic structure and messy linking. Team brains need consistency, discoverability, permissioning, and shared vocabulary. Force one into the other and either people stop using it (too rigid) or it becomes chaos (too loose).

The most promising direction identified: **AI-retrieval-layer approach** — let people keep their personal systems and have AI bridge them. But it was noted as early and trust/privacy issues were real.

---

## 3. Phase 2 — Identifying the Market Gap

The question shifted to intake mechanisms: how do these tools get knowledge in? This revealed a critical insight about the philosophical split in the market:

**The Obsidian/Logseq camp** believes the *act* of writing and organizing notes is itself the thinking. Frictionless capture means you accumulate junk you never revisit.

**The Mem/Rewind camp** believes capture friction is the enemy and AI can sort it out later.

Neither is fully right; the goal determines the right approach. Most serious users end up with hybrid systems.

We then asked the strategic question: **"if i was to create something that competed against all of these tools, what would be my leverage?"**

The leverage points identified:

1. **The "personal vs. team" split is unsolved** — no one has cracked the handoff between an individual's messy thinking space and a team's clean, shared knowledge.
2. **Incumbents are trapped by their data models** — Notion (block model), Obsidian (Markdown files), Roam (outliner blocks) — each made an architectural bet years ago that's now technical debt.
3. **AI is the actual disruption vector** — but most are bolting it on rather than making it native.
4. **Trust and privacy is a wide-open lane** — cloud-first tools require sending personal thoughts to someone's servers; local-first AI is becoming feasible.
5. **The "where does knowledge actually live" problem** — knowledge is scattered across Slack, email, Drive, GitHub, Notion, calendars. There's room for a unified retrieval and synthesis layer.
6. **Specific verticals beat horizontal** — horizontal knowledge management is a graveyard; verticals (researchers, lawyers, therapists, etc.) have real pull.
7. **The output side is underserved** — most tools focus on capture and storage; very few help you *do* something with what you've collected.
8. **Network effects nobody has captured** — some knowledge wants to be social (book highlights, research, learning).

**The hard truth surfaced at this stage:** Distribution and habit are the real moats. Notion has 100M+ users with ingrained workflows. Obsidian has fanatical loyalty. People don't switch note systems easily because the switching cost is their entire externalized memory.

The strongest combination identified at this stage: **AI-native + local-first/private + vertical + solving the personal-to-shared handoff.**

---

## 4. Phase 3 — From Vague Idea to Initial Thesis

The first concrete product thesis emerged:

> "There is a market for consumers, specifically professionals like therapists or people in medicine. The biggest leverage we could have is multimodal support, locality (using local models and storage), a 'publish to team' feature which cleans the data from a local device to a cloud storage, and create output by connecting it to workflows or existing systems."

This was sharp but needed stress-testing. Several pieces were challenged:

**"Therapists and medicine" is two different markets.** Therapists are mostly solo practitioners with cash-pay or simple insurance; medicine writ large means hospitals, complex EHR integration, long sales cycles. Pick one.

**Local models have real limitations.** A 7B-parameter model running on a therapist's MacBook is not GPT-4. Pure local-only is a marketing story that may not survive contact with what users actually need. The architecture should be *hybrid*: local for sensitive raw data and routine tasks, with optional cloud escalation.

**"Publish to team" is the hardest piece technically.** The cleaning/de-identification step is where this gets real. Stripping PHI from clinical notes is not a solved problem.

**HIPAA compliance is a moat and a tax.** Costs real money and time before launch, but means casual competitors can't enter your market.

The recommendation that emerged: **therapists specifically, not "professionals."** Smaller deals but faster sales, less regulatory drag, more emotional pull, cleaner path to product-market fit. Medicine is the expansion play after.

---

## 5. Phase 4 — The Healthcare Detour

We spent meaningful time defining what the healthcare product would look like. The architecture proposed was a **four-tier system**:

- **Tier 1: Personal clinical brain (local).** Lives on clinician's device. Captures voice memos, dictated notes, reflections. Never leaves device unprotected.
- **Tier 2: Care team layer (private cloud, governed).** When information needs sharing, it graduates from Tier 1 with AI-mediated PHI scrubbing.
- **Tier 3: Organizational knowledge (institutional).** Hospital-wide protocols, accumulated case patterns.
- **Tier 4: Cross-institutional / research (anonymized, opt-in).** Patterns benefiting broader medical knowledge.

The killer demo flow proposed: Dr. Patel sees a complex patient, voice-captures the visit, AI generates the note (Tier 1), shares with cardiologist via Tier 2 with PHI scrubbed, institutional knowledge surfaces from Tier 3, and six months later when Dr. Patel leaves, AI generates a handoff to the replacement.

**Then a critical user observation surfaced:** "where is the 2nd brain functionality here?"

This was the most important course-correction of the conversation. What had been described was basically an AI scribe with PHI scrubbing — competitive with Abridge, Suki, Nuance DAX. Not a second brain.

**The fix:** Add memory and retrieval. A second brain compounds — note #500 is more valuable than note #1 because it connects to the previous 499. The MVP needed to demonstrate that compounding. The new wow moments became:

1. **"It remembered."** When the clinician starts dictating and the system surfaces a relevant past case from months ago.
2. **"It scrubbed."** PHI being stripped as it graduates between tiers.

Then another challenge: **"why would the team need the publish again?"**

This forced honest examination: the publish-to-team feature was doing two jobs at once and neither was the core second-brain story. The architecture got simpler:

- Personal brain (Tier 1) — single-user accumulation
- Team layer — moved to roadmap, not MVP

The bigger strategic question surfaced: there were really two different products being conflated:

- **Product A** — Privacy-first knowledge platform for regulated industries (healthcare, legal, defense). Local-first architecture is core. Smaller market but defensible moat.
- **Product B** — Team intelligence platform for knowledge-heavy companies (consulting, ops, professional services). Cloud-first, AI-rich. Larger market, more competitive.

These are different products with different architectures, features, and buyers. Trying to serve both was making the thesis fuzzy.

---

## 6. Phase 5 — Reframing for Enterprise (the Hackathon Pivot)

Context arrived: this was for the **WeMakeDevs Cognee Hackathon** The user shifted direction: "actually now that i think about it its actually for enterprise. how can we make it for enterprise?"

The enterprise reframe was substantial. **Enterprise "second brain" is fundamentally different:**

- Forget personal note-taking. The enterprise pain is: **organizational knowledge is fragmented, siloed, and walks out the door when employees leave.**
- The product isn't "second brain for companies." It's "the AI layer that turns scattered enterprise tribal knowledge into a queryable, governed, living organizational memory."

The four pillars got reframed for enterprise:

| Pillar | Personal framing | Enterprise framing |
|---|---|---|
| Multimodal | Capture everything | Ingest from where work already happens |
| Locality | Privacy preference | Data sovereignty and compliance |
| Personal-to-team publish | Knowledge sharing | Governed knowledge graduation |
| Workflow integration | Output to tools | Connect to Salesforce, Jira, ServiceNow, etc. |

**A critical user insight emerged:** "lets try to stay horizontal enterprise and frame our final team-managed cloud knowledge to be a brain that they can plug and play to anywhere theyd want to."

This was the "**pluggable brain**" concept — the team's accumulated knowledge becomes infrastructure that any AI tool the enterprise uses (internal builds, external services, future deployments) can plug into. **This positioning became one of the most defensible elements of Consilium.**

But then came the validation question: **"how can we validate if we are solving an actual problem?"**

This led to a deep dive on validation methodology — Mom Test principles, talking to real users about specific past pain rather than asking opinions about future products, looking for emotional activation and quantified cost as signals of real pain.

We worked through a hypothetical target: mid-level consulting/operations manager at a 500-1000 person company.

Then the screen-capture idea came up: a plugin that captures whatever's on screen, AI auto-organizes it. This idea was challenged seriously:

1. **Rewind.ai exists and is struggling with this exact model.** Adoption mixed despite huge funding.
2. **Enterprises will block it.** Consulting firms (McKinsey, Bain, etc.) won't allow software that screenshots client work. Compliance risk too high.
3. **"One-button capture" doesn't actually reduce friction** — the user still has to decide what's worth capturing.
4. **Audio capture has even bigger legal problems** — two-party consent states, fireable offenses at most consulting firms.
5. **Local-first claim has limits** — if AI processing happens in the cloud, the privacy pitch is defeated.

**The deeper reframe:** The problem isn't "how do we make capture more convenient." The problem is "people don't capture useful knowledge." Easier capture doesn't solve knowledge sharing — it just creates more noise.

For consulting/ops, the valuable capture moments are deliberate: after meetings, end of day reflection, inline annotation, project artifacts, conversation context. Less-but-better is more compelling than more-but-easier.

But there was still a mismatch: the user was committing to Product B users (consulting/ops) with Product A architecture (local-first). One needed to give.

---

## 7. Phase 6 — Picking the Vertical: Legal Wins

The user pushed: "lets try to research one more time: what industry could highly benefit from a solution like product A?"

A rigorous evaluation of verticals followed:

### Tier 1 — Strongest fit
- **Healthcare (clinical):** HIPAA, urgent demand, clinicians want AI but can't legally use most tools. Caveat: EHR vendors dominate.
- **Legal (law firms):** Attorney-client privilege legally binding. Lawyers desperately want AI. Harvey raised at $3B in 2025 validating the market. **Probably the best Product A vertical right now.**
- **Defense / aerospace / classified work:** ITAR, EAR, CMMC, classified handling. Real pain. But selling to defense requires FedRAMP/IL4-IL6, clearances, years of relationship building. Not hackathon-friendly.

### Tier 2 — Strong fit but with caveats
- Financial services (investment banking, hedge funds, PE/VC)
- Pharma R&D
- Government / public sector

### Tier 3 — Sometimes claimed but weaker fit
- Wealth management, insurance, HR/People Ops, education

### Comparison: Healthcare vs Legal vs Defense

| Factor | Healthcare | Legal | Defense |
|---|---|---|---|
| Regulatory urgency | High | Very High | Extreme |
| Hackathon demoability | Good | Very good | Poor |
| Sales cycle | Long (hospitals) / Short (small practice) | Medium | Very long |
| Competition | AI scribes, Epic | Harvey, Spellbook, CoCounsel | Mostly internal builds |
| Market size | Huge | Large | Medium but high-value |
| Hackathon judge appeal | Very high (relatable) | High (clearly enterprise) | High but hard to demo |

**The recommendation: Legal wins for the hackathon.**

Why legal was the strongest:
1. Legal AI is having a moment (Harvey $3B validates)
2. The pain is acute and clearly articulated (lawyers loudly complain)
3. The privacy architecture is the entire pitch — local-first isn't nice-to-have, it's the only way to make AI work for privileged work
4. The knowledge graph fits beautifully — legal knowledge is inherently relational (cases cite cases, clauses reference clauses)
5. Buyers have money (Big Law firm spend per lawyer is multiples of hospitals per clinician)
6. It's demo-able
7. Healthcare AI space is more crowded; legal infrastructure layer is wide open

**The user agreed: legal.**

---

## 8. Phase 7 — Defining the Product (Stratum → Consilium)

The first proposal was named **"Stratum"** — reflecting the layered architecture (knowledge accumulates in distinct layers, each with its own privacy properties). A formal proposal document was drafted with:

- Problem framing
- Three-layer architecture (Personal Brain, Practice Group Brain, Firm Brain)
- Detailed intake mechanisms (voice-first mobile, browser extension, calendar integration, email forward, image capture)
- Publishing flow with multi-pass redaction
- Track 4 alignment
- Demo narrative

Then the name changed to **Consilium** — evoking structured growth, support for what climbs through it, and the lattice of connections that knowledge graphs actually look like. Less formal than "Stratum," more inviting.

The product definition stabilized as:

**Two layers (collapsed from the original three):**

1. **Personal Brain** — local, private, single-user, captures everything
2. **Team-Managed Knowledge Graph** — governed cloud, populated from published personal knowledge

**Three graph views:**

1. Personal graph — Obsidian-style, fully clickable
2. Team graph (admin view) — Knowledge Admin's full clickable view
3. Query overlay graph — appears when chatting, cited nodes pulse and light up

**The signature moments:**

1. **Capture** — voice/text/image with AI auto-organization
2. **Publish with redaction** — visible PHI scrubbing, side-by-side diff
3. **Retrieval with overlay** — chat dims, team graph fades in, nodes pulse, response streams with citations

---

## 9. Phase 8 — The Adoption Strategy Problem

A genuinely hard question surfaced: **why would someone working at a firm freely provide knowledge to a firm-managed knowledge graph for free?**

Initial five-layer model proposed:

1. **Personal Utility** — make the personal brain valuable for selfish reasons
2. **Reciprocity Gates** — can't query firm brain without contributing
3. **Career Capital** — attribution, citations, performance review integration
4. **Firm-Level Mandates** — matter closing memos, departure protocols
5. **Compounding Defaults** — smart product design makes contribution path-of-least-resistance

The user pushed back hard, and rightly:
- Layer 1 is solid ✓
- Layer 2 is flimsy and dictatory — punishes new hires, feels coercive, creates gaming
- Layer 3 requires firm-wide compliance — only works if leadership commits
- Layer 4 introduces "another step to take" problem — only departure capture is robust
- Layer 5 is good tech ✓

**The cleaner two-pillar model emerged:**

**Pillar 1 — Personal Utility (The Foundation):** The personal brain has to be useful for the lawyer's own work, independent of any firm benefit. *If a lawyer wouldn't use Consilium even if the firm brain didn't exist, the product has failed.*

**Pillar 2 — Friction-Free Publishing (The Mechanism):** Once they're using the personal brain, publishing has to be so easy that the question is "why would I not?" — AI suggests publishable insights with sanitization already done, one tap to approve.

**The One Mandatory Exception — Departure Capture:** When a lawyer leaves, structured knowledge extraction is part of offboarding. The firm has legitimate interest and leverage; the lawyer has neutral or aligned interest.

**The Reinforcing Dynamic — Experienced Reciprocity:** When a lawyer queries the firm brain and gets a useful answer, they trust it more and want to contribute back. Natural reciprocity like Wikipedia or Stack Overflow. **For this to work, the firm brain has to deliver useful answers from day one** — pre-seeded with public legal knowledge, anonymized industry patterns, existing firm KM content.

This more honest model became the canonical adoption strategy.

---

## 10. Phase 9 — Hackathon-Specific Strategy

Several hackathon-specific questions arose:

### Does building with Gemini qualify for the Google AI prize?

Yes. The Gemini Award required:
- Use Gemini via Google AI Studio or Gemini API for reasoning, chat, or multimodal understanding
- Implement agent-driven or automated workflows
- Demonstrate practical value through working prototype

Consilium fits cleanly. Track 4 (Data & Intelligence) is home base; Gemini Award is cross-track.

> **Update later in the session:** The hackathon organizers relaxed the Google AI Studio requirement. Consilium now uses the **Gemini API directly** (not via AI Studio). Gemini remains central to the product — entity extraction, redaction, RAG synthesis all run on Gemini — so qualification for the Gemini Award is unchanged.

### Should we go after the Veea Award (Track 1: Agent Security & AI Governance)?

Two paths considered:

**Path A:** Stay in Track 4, integrate Lobster Trap as a component. Use it as the actual policy enforcement layer for the publish-to-team flow. MIT licensed, drop-in, OpenAI-compatible.

**Path B:** Reposition Consilium to Track 1. Frame entire product as "AI governance infrastructure for law firms."

**Recommendation: Path A.** Track 4 is the more natural fit. Track 1 would be crowded with pure security/governance tools. Lobster Trap integration deferred to optional.

### How does the submission work?

Requirements: project title, descriptions, tags, cover image, video presentation, slide presentation, GitHub repo, demo platform, application URL.

6 days, 3 full-stack developers. Decided on **balanced approach**: ~4 days build, ~2 days pitch/video/slides.

---

## 11. Phase 10 — Locking the MVP

A structured Q&A walked through every decision needed for the four documents (PRD, Brief, Architecture, Design Guidelines). Key decisions:

### Foundational

- **Documents cover full vision but clearly mark MVP scope** — so they serve both the hackathon and future development
- **Target customer:** litigation practice groups in mid-size firms (50-300 lawyers)
- **Buyer:** Knowledge Management Partner / KM Director
- **Team:** 3 full-stack developers leveraging AI for unfamiliar concepts
- **Duration:** 6 days
- **Demo:** live with deployed MVP

### Product Brief

- **Competitor framing priority:** Harvey/Spellbook/CoCounsel, Notion/Confluence, iManage/NetDocuments
- **Business model:** firm-wide license (not per-seat)
- **Hero moment:** retrieval (associate asking firm brain a question, getting deep firm-specific intelligence)
- **Framing:** introducing Consilium at hackathon stage

### Product Requirements

- **MVP scope:** auth, three modal intake (audio/text/image), AI auto-organization, personal graph view (Obsidian-style), publish flow with redaction, team graph view (read-only), chat with team brain (RAG with citations and overlay animation), seed data
- **Auth:** simple username/password for MVP, SSO for V1
- **Single pre-seeded firm and practice group simulation:** "Acme Litigation Partners" with three pre-seeded user accounts
- **Graph view:** Obsidian-style, force-directed, fully clickable for personal; read-only structure for team graph in MVP
- **Three graph views:** personal, team (admin view, V1), query overlay
- **Query overlay UX:** chat dims, team graph fades in at center, cited nodes pulse and light up in real time as answer streams, graph fades as response renders
- **Publishing in MVP:** auto-flows to team graph without admin approval (admin approval is V1)
- **Chat answers:** ChatGPT-style with citations, grounded only in team graph
- **No source = no answer rule** — refusal preferred over hallucination
- **Roles:** Lawyer, Practice Group Lead, Knowledge Admin (only Lawyer is functionally distinct in MVP)
- **Compliance:** SOC 2 Type II + ABA Formal Opinion 477R for V1; nothing formal in MVP

### Architecture

- **MVP stack:** React + Vite frontend, Node.js + Express backend, single Postgres with pgvector, IndexedDB for personal notes, Gemini API + Whisper API, self-hosted Presidio
- **V1 stack:** Native desktop (Tauri) + native mobile (React Native), Gemma on-device for personal, Gemini cloud for team layer (sanitized inputs only), per-firm single-tenant deployments, SSO via SAML/OIDC
- **Graph storage:** Postgres with relational tables modeling nodes/edges + pgvector for embeddings (not Neo4j — operational complexity not worth it at MVP scale)
- **Personal storage MVP:** IndexedDB (sold as "local-first architecture" externally)
- **Personal storage V1:** True local markdown files on native apps
- **MCP server:** V1 feature, documented but not built for MVP

### Design

- **Personality:** modern, sleek, minimal, confident, trusted, institutional, smart, intelligent, discerning
- **References:** Harvey, Notion, Obsidian (in priority order)
- **Theme:** dark mode primary, GitHub classic dark base
- **Accents:** amber/gold for institutional credibility
- **Typography:** Source Serif Pro (body), Inter (UI), JetBrains Mono (technical)
- **Density:** mix of spacious (consuming) and dense (producing)
- **Voice:** direct and clear, no emoji, no exclamation points
- **Icons:** Lucide, mixed outlined/filled by context
- **Motion:** subtle and functional, with one deliberate moment (the query overlay reveal)
- **Hero moments:** publish/redaction, chat with citations, query overlay graph
- **Graph node colors:** 9 distinct colors, none overlapping with accent or semantic palettes
- **Voice control:** feature-equal, not voice-first on desktop

### The redaction pipeline simplification

The full V1 redaction pipeline has 4 passes (privilege detection, identifier scrubbing, generalization, preservation check). For MVP, this was simplified to 2 passes:

- Pass 1: Microsoft Presidio for PII tokenization
- Pass 2: Gemini single-pass generalization
- Plus: side-by-side diff UI with confidence indicator

This is buildable in ~1 dev-day. Full 4-pass pipeline documented as V1.

---

## 12. Phase 11 — Refining Business Model and Market Positioning

After the MVP scope was locked, two structural pieces of the pitch were revisited under harder scrutiny — the kind of scrutiny investors and hackathon judges would actually apply.

### The business model shift: firm-wide → practice-group license

The original plan was a firm-wide license tiered by firm size ($50K–$150K ARR across 50–300 lawyers). The reasoning at the time was sound — knowledge value compounds with participation, per-seat creates wrong incentives, single SKU keeps sales simple. All still true. But the model didn't match what was actually being *sold*.

The product enters a firm through one practice group (litigation), not the whole firm. The KM Partner is the champion, the Practice Group Lead is the validator, the litigators are the users. Asking a firm to commit firm-wide on day one means asking every other practice group lead — corporate, IP, regulatory — to weigh in on a tool they haven't seen and don't have the same pain about. That's a firm-level procurement decision, and firm-level procurement is the slowest motion in legal services sales.

A practice-group license matches the sales reality. The litigation group signs first. Pricing scales with the group's size (10–25 litigators at $25K, 25–50 at $50K, 50–100 at $85K). Once the litigation group is producing value visible to the rest of the firm, expansion is the natural next motion — add corporate, add IP, add regulatory. At maturity a fully deployed firm reaches roughly $200K ARR across multiple groups, which is meaningfully better than the original $150K ceiling.

The land-and-expand framing also produces a cleaner narrative for fundraising. Initial wedge ACV is modest ($25K–$50K), but per-customer ACV compounds as expansion happens, and the expansion path is structural rather than aspirational — it's the same product, same architecture, sold to the next practice group. Per-seat is still rejected for the same reason as before: it punishes participation, which is the opposite of what the team graph needs.

### The target customer reframe: wedge, not the only market

The original positioning called mid-size firms (50–300 lawyers) the "primary target." Technically accurate, strategically incomplete. A judge or investor reading that and looking at the architecture would immediately ask: *"so why not BigLaw? Your single-tenant deployments, audit logs, ethical wall enforcement, and SSO obviously fit BigLaw — are you under-shooting your market?"* And they'd be right. The product *does* fit BigLaw. The hesitation isn't about product fit; it's about go-to-market.

The honest reframe: mid-size firms are the **wedge**, not the ceiling. Mid-size wins as the first target for reasons that are about market entry rather than product limits:

- Faster sales cycles (months vs. years for BigLaw)
- Less locked into incumbent contracts (Microsoft, iManage, Glean, Harvey, internal builds)
- More acute pain (mid-size lacks BigLaw's institutional knowledge infrastructure)
- Lower internal-build risk (BigLaw increasingly has in-house AI teams building competing tools)
- Better champion access for a startup (warm intros to KM Partners at mid-size firms are reachable; AmLaw 100 KM Partners are not)
- Lower initial compliance burden (mid-size accepts standard SOC 2; BigLaw demands custom security reviews, on-prem options, escrow agreements)

From there, the expansion path is structural: other practice groups within target firms, then up-market to BigLaw / AmLaw 200 where the architecture genuinely fits, then adjacent to in-house legal teams at large corporations, and eventually adjacent professional services (consulting, accounting) — but legal first, prove the model.

The BigLaw note deserves its own honesty pass. Architecturally, nothing changes for BigLaw. The single-tenant deployments, audit logs, SSO, and ethical wall enforcement already there are what BigLaw demands. What changes is the *motion*: enterprise sales reps, longer cycles, custom security reviews, multi-year deals. The anchor logo value is also asymmetric — one AmLaw 100 firm is worth more marketing-wise than five mid-size firms, and the knowledge density argument compounds harder at scale. BigLaw is a deliberate later phase, not a market we don't address.

These two changes — practice-group license and wedge framing — don't alter the product, the architecture, or the demo. They sharpen the story the documents tell about what Consilium is selling, who it's selling to, and where it's going.

---

## 13. Decisions Index

A compact reference of every major decision and why it was made:

| Decision | Reasoning |
|---|---|
| **Vertical: Legal** | Hot market (Harvey $3B), acute pain, privacy architecture is the entire pitch, well-funded buyers, demo-able |
| **Wedge: Litigation practice groups in mid-size firms (50–300 lawyers); not the only market** | Deliberate expansion path to other practice groups, then BigLaw, then in-house legal teams. Densest pattern-matching value, real KM function, faster sales than BigLaw, more sophisticated than boutiques |
| **Buyer: KM Partner / KM Director** | Has budget, owns the problem, has credibility with practitioners, career incentive to champion |
| **Business model: Practice-group license with land-and-expand** | Matches what we actually sell (one practice group); shortens sales cycle; clearer expansion path; per-seat would create wrong incentive (firms gating access to control cost) |
| **Two layers, not three** | Original "personal → practice group → firm-wide" simplified to "personal → team" for MVP clarity |
| **Three graph views** | Personal (fully clickable), team admin (V1), query overlay (signature moment) |
| **Publishing: MVP auto-flow, V1 requires approval** | Demo timing — admin approval step adds friction without adding wow moment |
| **AI organization runs after every save** | Differentiator from generic note-taking; the "intelligence" is visible |
| **Redaction: 2-pass MVP, 4-pass V1** | Build time constraint; 2-pass still produces the wow moment visually |
| **Graph storage: Postgres relational + pgvector** | Neo4j overkill at MVP scale; one DB simpler ops; can re-evaluate at scale |
| **Personal storage: IndexedDB (MVP) / markdown files (V1)** | Browser limitations; V1 native apps deliver the real promise |
| **Stack: React + Vite + Node + Postgres** | Team familiarity, fast build, free deployment tiers |
| **AI: Gemini API (MVP) / Gemma on-device (V1)** | Hackathon requires Gemini for Gemini Award; V1 honors local-first promise |
| **Dark mode primary, GitHub classic dark base** | Modern, sleek, institutional; matches reference points (Harvey, Notion dark, Obsidian) |
| **Amber/gold accents** | Institutional legal credibility without the navy/gold cliché |
| **Voice: direct and clear, no emoji** | Lawyers find chirpy product voice unprofessional |
| **Adoption strategy: 2 pillars + 1 mandatory exception + 1 reinforcing dynamic** | Honest about what works; rejects coercive mechanisms |
| **MCP server for the "pluggable brain"** | Differentiator that grows in value as enterprise AI proliferates |
| **Single-tenant deployments for V1** | Legal sensitivity requires hard isolation |
| **Track 4 (Data & Intelligence), not Track 1 (Security)** | Natural product fit; less crowded category for our specific approach |
| **Hackathon: 4 days build, 2 days pitch/video** | Balanced approach for WeMakeDevs Cognee Hackathon async + video judging |

---

## 14. Rejected Ideas Index

Things we considered and explicitly chose NOT to do, with reasoning:

| Rejected Idea | Why |
|---|---|
| **Pure local-only AI** | Can't compete on capability with cloud frontier models; users will resent the limitation |
| **Healthcare as the vertical** | Crowded space (AI scribes), EHR integration complexity, longer sales cycles than legal |
| **Horizontal consulting/ops manager target** | Local-first architecture mismatched with their actual needs (they have compliant cloud, not regulatory blocks) |
| **Screen capture / always-on capture (Rewind-style)** | Procurement killer in enterprise; consulting firms won't allow it; legal liability around recordings |
| **Audio capture of meetings without consent flow** | Two-party consent state laws; fireable offense at most professional services firms |
| **Per-seat pricing** | Creates wrong incentive — firms gate access to control cost, killing network effects |
| **Firm-wide license as primary business model** | Mismatched with what we actually sell (one practice group at a time); created procurement friction; replaced with practice-group license + land-and-expand |
| **Three knowledge layers (personal → practice → firm)** | Collapsed to two for MVP clarity; firm-wide super-layer added complexity without demo value |
| **Mandatory firm-wide contribution policies** | Coercive, would destroy adoption; only departure capture is robust |
| **Reciprocity gates (can't query unless you contribute)** | Punishes new hires, feels coercive, creates gaming behavior |
| **Real-time collaborative editing** | Not the problem we're solving; out of scope |
| **Built-in document drafting** | We integrate with drafting tools, don't replace them |
| **Time tracking and billing** | Adjacent but not our problem |
| **Conflict checking automation** | Respect existing conflicts data; don't compete with conflicts databases |
| **Client portals** | Different product entirely |
| **Court filing integration** | Different product entirely |
| **Knowledge Admin approval in MVP** | Adds friction to demo without adding wow moment |
| **Neo4j or dedicated graph DB** | Operational complexity not justified at MVP scale |
| **Repositioning to Track 1 (Agent Security)** | Crowded track, our positioning is more naturally Track 4 |
| **Multiple competitor verticals simultaneously** | "Picking one and going deep beats two poorly" |
| **Mobile-first capture for MVP** | Browser limits make this hard; V1 native apps deliver this |
| **Full 4-pass redaction pipeline in MVP** | 2-pass produces the same wow moment in 1/4 the build time |
| **Built-in onboarding tour for MVP** | Polish item; demo doesn't require it |
| **Settings/preferences page** | V1 concern |
| **Light theme** | V1 concern |

---

## 15. Glossary of Concepts

Terms that have specific meaning in the Consilium context:

**Consilium** — the product. A privacy-first knowledge fabric for law firms.

**Stratum** — the original codename for Consilium. The architecture is "stratum" (layered) but the product is "consilium." Don't use Stratum anywhere user-facing.

**Personal brain** — the lawyer's individual, local, private knowledge store. In MVP, IndexedDB in browser. In V1, markdown files on native app.

**Team-managed KQ** (or **team graph**) — the shared, governed knowledge graph populated from published personal knowledge. Always cloud-hosted (per-firm single-tenant in V1).

**Personal graph view** — Obsidian-style force-directed visualization of the lawyer's own notes, fully clickable.

**Team graph view** — same visual style as personal, but read-only for non-admins in MVP (only admins can click into individual nodes in V1).

**Query overlay graph** — the signature visual moment. When chat is queried, chat dims, team graph fades in at center, cited nodes pulse and light up, graph fades back as response streams.

**Publish** — the act of moving a personal note to the team-managed KQ. In MVP, auto-approved after the lawyer's own approval of the sanitization. In V1, requires Knowledge Admin approval.

**Redaction pipeline** — the AI-assisted process that scrubs PII and generalizes specifics from a personal note before it's published. 2-pass in MVP (Presidio + Gemini generalization), 4-pass in V1 (adds privilege detection and preservation check).

**Insight preservation score** — confidence indicator (0-100%) that the strategic meaning survives redaction. Below 60% triggers yellow warning; below 40% triggers red.

**Knowledge Admin** — the role responsible for managing the team-managed KQ. In MVP, the role exists in the data model but has no special powers. In V1, approves publications and has the admin dashboard.

**Pluggable brain** — the V1 positioning where the team-managed KQ exposes an MCP server endpoint, becoming infrastructure that other AI tools (Harvey, CoCounsel, internal builds) can query for firm-specific grounding.

**The wow moment** — the visible PHI/PII scrubbing during publish, where lawyers see redactions happen in real time on screen.

**The retrieval moment** — the chat query with overlay animation and streaming citations. This is the demo climax.

**Persona accounts (MVP)** — three pre-seeded demo accounts: `litigator@acme.law`, `lead@acme.law`, `admin@acme.law`, all password `demo`. Used to demonstrate role differences during the hackathon demo.

**Seed corpus** — the 15-30 fictional published insights pre-loaded into the team graph so retrieval works on day one. Without seed data, the demo fails.

**The seeded demo query** — *"What has our firm learned about cross-examining expert witnesses on damages calculations?"* — this specific query MUST work for the demo and the seed data should be designed to make it work.

**Acme Litigation Partners** — the fictional firm used in the MVP. Single hardcoded firm; no multi-tenancy in MVP.

**Track 4 (Data & Intelligence)** — WeMakeDevs Cognee Hackathon track Consilium is competing in. Focus areas: RAG over proprietary data, AI-powered data pipelines, analytics agents for NL querying, anomaly detection, knowledge graph extraction.

**Gemini Award** — cross-track recognition at the hackathon for best Gemini-powered project. Consilium qualifies via Gemini usage throughout (extraction, redaction, synthesis).

**MVP / V1 / V2** — scope phases. MVP = 6-day hackathon build. V1 = first paying customers, post-hackathon. V2 = mature product.

**KM Partner** — Knowledge Management Partner. The primary buyer persona at target firms.

**Practice Group Lead** — the partner leading a litigation practice group. Validator persona who confirms the tool works for their team.

**Litigator** — the primary user persona. A 4-8 year associate or senior associate at a mid-size firm.

**Pluggable brain** — see above. The defensible long-term moat.

**Local-first** — the architectural philosophy where data stays on the user's device unless explicitly published. In MVP, this is partly a marketing story (data is in IndexedDB, AI runs in cloud). In V1, it's literal (Gemma on-device, markdown files on disk).

**ABA Formal Opinion 477R** — American Bar Association ethics opinion on lawyer's duty of technology competence, including securing client information. V1 compliance baseline.

**Attorney-client privilege** — the legal doctrine making client communications confidential. Cannot be exposed to AI providers that might be compelled to disclose. The entire reason Consilium exists architecturally.

**Ethical wall** (also Chinese wall) — when a firm represents Client A and a different partner takes a matter adverse to Client A, certain lawyers cannot see information about the conflicting matter. V1+ concern for Consilium.

**Harvey** — the dominant legal AI tool ($3B valuation in 2025). Not a direct competitor; Consilium would plug *into* Harvey via the MCP server.

**Lobster Trap** — Veea's deep prompt inspection (DPI) proxy. Optional integration for Consilium to demonstrate enterprise security depth. Decided as optional for MVP.

---

## 16. The Conceptual Through-Line

If someone asked "summarize the entire conceptual journey of Consilium in one paragraph," it would be this:

> Consilium emerged from curiosity about whether Obsidian-style personal knowledge tools could work for teams. The answer was no — not because the tools couldn't be adapted, but because the structural needs are different. Personal knowledge wants to be messy and idiosyncratic; team knowledge needs governance, privacy, and shared vocabulary. The market gap was the personal-to-team handoff: no tool handles the graduation of individual thinking into organizational intelligence with the right privacy properties. After considering healthcare, consulting, and other verticals, **legal** emerged as the optimal target — privilege concerns structurally block existing AI tools, the market is hot and well-funded, and the knowledge graph model fits the relational nature of legal reasoning. Consilium is the privacy-first knowledge fabric for law firms: a personal brain that lives locally, a team brain that's governed and queryable, and a "pluggable brain" architecture exposing the firm's accumulated knowledge to any AI tool the firm uses. The hackathon MVP demonstrates the three signature moments — capture, publish with visible redaction, retrieval with graph-overlay visualization — proving the architecture works while pointing at the much larger V1 vision.

---

## 17. What This Document Is For

This context dump exists to:

1. **Onboard new contributors** without making them read the entire session
2. **Resolve ambiguity** by showing not just decisions but the reasoning behind them
3. **Prevent regression** to rejected ideas (the Rejected Ideas Index is critical for this)
4. **Provide AI agents with grounding** if used as input to LLM-powered tools
5. **Serve as evidence of decision quality** when pitching, recruiting, or fundraising
6. **Preserve the conceptual frame** when execution details start to crowd out strategy

When in doubt about what Consilium is or why it works the way it does, this document is the source of truth alongside the four specification documents (Brief, PRD, Architecture, Design Guidelines).
