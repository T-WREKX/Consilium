# Consilium · Product Brief

**Document type:** Product Brief
**Audience:** Hackathon judges, prospective customers, stakeholders, team alignment
**Status:** v1 · Hackathon stage
**Companion documents:** `product-requirements.md`, `project-architecture.md`, `design-guidelines.md`

---

## One-sentence pitch

**Consilium is the privacy-first knowledge fabric that turns every law firm's accumulated expertise into a queryable, governable, pluggable intelligence layer — the substrate that finally makes legal AI work.**

---

## The Problem

Law firms are sitting on billions of dollars of accumulated expertise that walks out the door every time a lawyer leaves. A senior litigator at a 200-lawyer firm has spent 15 years building intuition about judges, opposing counsel, case strategies, settlement patterns, and client relationships. When they retire or change firms, **that institutional intelligence vanishes overnight.**

Three structural problems compound this:

1. **Knowledge capture is broken.** Lawyers bill in six-minute increments. Every minute spent documenting is a minute not billed. Document management systems (iManage, NetDocuments) store finished work product but not the *reasoning* behind it. The strategy, the why, stays in human heads.

2. **AI adoption is structurally blocked.** Attorney-client privilege is legally binding. Privileged communications cannot go to ChatGPT, Notion AI, Glean, or any provider that might be compelled to disclose. Most major firms have explicitly banned public AI tools for client work. The result: shadow IT (lawyers using personal ChatGPT anyway) or paralysis (no AI at all).

3. **Existing legal AI tools are point solutions.** Harvey does contract review. Spellbook does drafting. CoCounsel does research. None of them solve the underlying problem: the firm has no living, queryable layer of its own accumulated intelligence.

**The cost:** A typical AmLaw 200 firm loses an estimated **$15M–$40M annually** to knowledge fragmentation, redundant work, and onboarding overhead. Senior partner departures can cost firms 5–10% of practice revenue in the year following.

---

## The Product

Consilium is a two-layer knowledge platform built around three graph views.

### Two layers

**Layer 1 — The Personal Brain (local, private).** Each lawyer captures their thinking throughout the day: voice memos between meetings, case observations, strategy notes, research highlights. AI auto-organizes captures into a personal knowledge graph linked to matters, parties, issues, precedents, and concepts. Privileged content never leaves the device unsanitized.

**Layer 2 — The Team-Managed Knowledge Graph (governed cloud).** When lawyers identify learnings worth sharing, they publish to the team's shared graph. AI-assisted redaction strips privileged content and client identifiers before publication. The shared graph becomes the team's collective intelligence — queryable by anyone on the team via a chatbot that grounds every answer in the team graph.

### Three graph views

1. **Personal graph** — the lawyer's own captured knowledge, fully clickable, Obsidian-style.
2. **Team graph (admin view)** — the Knowledge Admin's full view of the team-managed graph, fully clickable.
3. **Query overlay graph** — appears when any team member queries the chatbot. The chat dims, the team graph fades in at center, cited nodes pulse and light up in real time as the answer streams. This is the signature visual moment of Consilium.

### The pluggable brain (V1)

The team-managed graph exposes an MCP server endpoint. Any AI tool the firm uses (Harvey, internal builds, Microsoft Copilot) can plug in for grounded, firm-specific responses. Consilium is not another AI app to add to the stack — it is the substrate that makes the rest of the stack actually work for that firm.

---

## What's in the Hackathon MVP vs. V1 vs. V2

> **This is the most important section of this document for the build team. Anything not marked MVP is out of scope for the hackathon.**

### Hackathon MVP (6 days)

- React + Vite single-page web app
- Pre-seeded single firm, single litigation practice group
- Three pre-seeded user accounts with distinct roles (Lawyer, Practice Group Lead, Knowledge Admin) — username/password auth
- Personal note capture: **audio (Whisper transcription), text, image (OCR/vision)**
- AI auto-organization: Gemini extracts entities and generates structured notes in a personal knowledge graph
- Personal graph view (Obsidian-style, force-directed, fully clickable)
- Publish flow with two-pass AI-assisted redaction (Presidio + Gemini), side-by-side diff, lawyer approval
- **MVP simplification:** published knowledge auto-flows into the team graph (no Knowledge Admin approval step; the role and dashboard ship in V1)
- Team graph view (read-only structure for all team members)
- Chat with team brain: ChatGPT-style answers with citations, grounded only in the team graph, query-overlay graph with pulsing cited nodes
- Pre-seeded team graph with 15–30 sample published insights so retrieval works on day one

### V1 (first paying customers, post-hackathon)

- Native desktop (macOS, Windows, Linux) + native mobile (iOS, Android)
- True on-device storage of personal notes as markdown files
- On-device LLM inference for personal layer (Gemma)
- Cloud LLM for team layer (Gemini Pro) — sees only sanitized content
- Knowledge Admin approval workflow with dashboard
- Full four-pass redaction pipeline (privilege detection, identifier scrubbing, generalization, preservation check)
- SSO via SAML/OIDC
- iManage / NetDocuments integration (read corpus into seed graph)
- Calendar integration for post-meeting capture prompts
- MCP server endpoint for the "pluggable brain" story
- Audit logging (7-year retention) and per-user access logs
- Single-tenant deployment per firm
- SOC 2 Type II in progress, ABA Formal Opinion 477R compliance baseline

### V2 (mature product)

- Cross-firm anonymized benchmark intelligence
- Advanced analytics dashboards for KM leadership
- Ethical wall automation (inherited from connected systems)
- Slack / Teams capture and notifications
- Westlaw / LexisNexis browser extension
- Zoom / Teams meeting transcript ingestion
- Expansion beyond litigation to corporate, IP, regulatory practice groups
- SOC 2 Type II completed, ISO 27001, GDPR-ready, EU deployment regions

---

## Target Customer

**Initial wedge:** litigation practice groups at **mid-size law firms of 50–300 lawyers**.

The ideal firm has:
- Active litigation practice (not pure transactional)
- An existing knowledge management function (KM Partner, KM Director, or equivalent)
- Growth mode (hiring associates, expanding practice areas)
- Recent senior departures or impending retirements as a forcing function

**Why this segment is optimal:**
- Mid-size firms feel knowledge loss acutely (smaller than BigLaw's institutional infrastructure, larger than boutiques where everyone already knows everything)
- Litigation has the densest pattern-matching value: recurring judges, repeat opposing counsel, motion practice patterns
- These firms have budget but aren't locked into deep enterprise contracts → faster sales cycles
- Litigation insights lend themselves naturally to graph structure

**Why mid-size first, not large firms:**
- Faster sales cycles (months vs. years for BigLaw)
- Less locked into incumbent contracts (Microsoft, iManage, Glean, Harvey, internal tools)
- More acute pain (mid-size lacks the institutional knowledge infrastructure BigLaw has)
- Lower internal-build risk (BigLaw increasingly has in-house AI teams building their own tools)
- Better champion access for a startup (founder can get meetings with KM Partners at mid-size firms via warm intros; harder at AmLaw 100)
- Lower initial compliance burden (mid-size accepts standard SOC 2; BigLaw demands custom reviews, on-prem options, escrow agreements)

**Expansion path:**
- Within target firms: other practice groups (corporate, IP, regulatory)
- Up-market: BigLaw / AmLaw 200 — where Consilium's architecture (single-tenant deployments, audit logs, SSO, ethical wall enforcement) genuinely fits well; not over-shooting BigLaw, slightly under-shooting if we don't target them eventually
- Adjacent: in-house legal teams at large corporations
- Further adjacent: other professional services (consulting, accounting) — but legal first, prove the model

**A note on BigLaw fit:** The product doesn't fundamentally change for BigLaw — architecture already supports it. Go-to-market changes significantly: enterprise sales reps, longer cycles, custom security reviews, multi-year deals. Anchor logo value: landing one AmLaw 100 firm is worth marketing-wise more than five mid-size firms. Knowledge density argument: large firms compound the team graph value harder.

---

## The Buyer

**Primary buyer:** the **Knowledge Management Partner** or **KM Director**.

This person typically:
- Holds budget authority for KM-specific tools or strong influence over the COO/CIO who does
- Owns the problem Consilium solves
- Has credibility with practitioners (often a former lawyer)
- Has career incentive to champion a successful KM tool

**Secondary influencer:** Litigation Practice Group Lead, who validates the tool works for their team.

**Economic decision:** practice-group license signed by Managing Partner / COO / CFO on the KM Partner's recommendation, with the Litigation Practice Group Lead as validator.

### Market sizing

| | Definition | Estimate |
|---|---|---|
| **TAM** | All law firms globally with KM needs | 175,000+ firms; legal tech ~$30B and growing 9% YoY |
| **SAM** | US/UK/CA/AU firms, 50–300 lawyers, active litigation, KM function | ~3,000–5,000 firms · ~$50K initial ACV per practice group → $150M–$250M wedge SAM; full firm penetration over years pushes meaningfully higher (multiple practice groups per firm) |
| **SOM** | Realistically obtainable in 3–5 years (2–5% of SAM) | $3M–$37M ARR as defensible early-stage target |

**Honest read:** strong wedge into a recognized, growing category (Harvey at $3B validates the space). Not a billion-dollar standalone market in three years by itself, but the natural expansion path into adjacent verticals (corporate legal, in-house teams, expert services) extends the trajectory meaningfully. Sales cycles are 3–9 months; mid-size firms vary in sophistication; partnership channels needed for the bottom end of SAM that outsources KM to consultants.

---

## Business Model

**Practice-group license, tiered by practice group size.** Sell to the litigation practice group as the unit of value. No per-seat metering — knowledge value compounds with participation, and per-seat pricing creates the wrong incentive (firms gating access to control cost).

Indicative pricing for V1:
- 10–25 litigators: $25K ARR
- 25–50 litigators: $50K ARR
- 50–100 litigators: $85K ARR

**Land-and-expand:** expansion happens by adding other practice groups (corporate, IP, regulatory) over time within the same firm. Full firm deployment at maturity: ~$200K ARR per firm across multiple practice groups.

**Rationale:** matches what we're actually selling (one practice group, not the whole firm); shortens sales cycle (no firm-level decision required upfront); produces a better economic story with clearer expansion path and defensible per-customer ACV at scale.

Pricing not finalized; cited only for TAM/SAM math.

---

## Competitive Positioning

| Category | Examples | How Consilium Differs |
|---|---|---|
| **Legal AI point tools** | Harvey, Spellbook, CoCounsel, Eve, Paxton | Consilium is the firm's knowledge substrate that plugs *into* these tools, not a competitor to them |
| **Document management** | iManage, NetDocuments | Consilium captures the *reasoning* DMS systems never see; integrates with them rather than replacing |
| **Enterprise search** | Glean, Hebbia | Consilium is privacy-architected from day one for privilege; Glean's cloud-first model is incompatible with most firm policies |
| **Personal knowledge tools** | Obsidian, Roam, Notion | Consilium adds the firm-level governed publishing layer Obsidian-class tools lack; built for legal compliance from day one |
| **Generic team knowledge** | Notion, Confluence | Consilium is purpose-built for legal: privilege protection, ethical walls, audit logs, citation-grounded retrieval |

**The defensible moat:** vertical depth in legal, privacy architecture cloud-first competitors cannot easily replicate, pluggable-brain positioning that grows in value as enterprise AI proliferates, and within-firm network effects (every captured insight makes the team graph more valuable, increasing switching costs).

---

## Why Consilium Wins the Hackathon

This proposal threads a difficult needle. It is **clearly enterprise**, **clearly AI-native**, solves a **real, urgent, expensive problem**, is **technically substantive**, is **demoable in five minutes**, and hits **every focus area in Track 4: Data & Intelligence**:

- **RAG systems over proprietary or multi-source data** → the team graph with citation-grounded retrieval
- **AI-powered data pipelines and validation** → capture-to-structured-graph pipeline
- **Analytics agents for natural language querying** → conversational query of the team brain
- **Knowledge graph extraction from documents** → the technical core

It also qualifies for the **Gemini Award** (Gemini powers extraction, redaction, and synthesis throughout) and is positioned in a hot, well-funded vertical (legal AI, Harvey at $3B) that judges will recognize immediately.

---

## Demo Narrative (5 minutes)

The story Consilium tells live, in order:

1. **Capture.** Lawyer dictates post-deposition observations. AI structures into a personal note linked to the matter, opposing counsel, and witness on the personal graph.
2. **Privacy.** Lawyer hits publish. Real-time redaction visibly strips client names and privileged content, leaving the strategic insight. Lawyer approves the sanitized version.
3. **Retrieval.** A different team member asks: *"What has our firm learned about cross-examining expert witnesses on damages calculations?"* Chat dims. Team graph fades in. Cited nodes pulse in real time as the answer streams. Citations are clickable.
4. **Preservation framing.** Close with the institutional memory pitch: this is the layer that survives departures, accelerates onboarding, and makes every other AI tool the firm uses smarter.

---

## Closing

**Consilium is not another AI wrapper. It is the missing layer that makes every other AI tool the firm uses actually work.**

The product, the architecture, the demo, and the market are aligned. The hackathon MVP is intentionally scoped to deliver the signature moments — capture, redaction, retrieval with the graph overlay — and the V1 vision is honest about what comes next.
