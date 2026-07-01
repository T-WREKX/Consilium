<div align="center">

<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# Consilium

**The privacy-first knowledge fabric that turns every law firm's accumulated expertise into a queryable, governable, pluggable intelligence layer.**

[Product Brief](.agent/product-brief.md) · [Architecture](.agent/project-architecture.md) · [Design System](.agent/design-guidelines.md) · [Agent Guide](AGENT.md)

</div>

---

## What is Consilium?

Consilium is a two-layer knowledge platform for law firms. It captures individual lawyer expertise locally, governs its publication into a shared team knowledge graph with AI-assisted redaction, and makes the accumulated intelligence queryable via a citation-grounded chatbot with a signature graph-overlay visualization.

**The problem:** Law firms lose an estimated $15M–$40M annually to knowledge fragmentation, redundant work, and institutional memory loss when senior lawyers depart. Attorney-client privilege structurally blocks adoption of generic AI tools.

**The solution:** A personal brain (local, private) where lawyers capture thinking throughout the day, paired with a team-managed knowledge graph (governed cloud) where sanitized insights are published and retrievable by the entire practice group.

## Key Features

| Feature | Description |
|---|---|
| **Multimodal Capture** | Text, audio (Whisper transcription), and image (Gemini Vision OCR) note intake |
| **AI Auto-Organization** | Gemini extracts entities, classifies notes, and builds a personal knowledge graph |
| **Privacy-First Publishing** | Two-pass redaction pipeline (Presidio PII tokenization + Gemini generalization) with side-by-side diff review |
| **Team Knowledge Graph** | Governed, queryable graph of the practice group's accumulated intelligence |
| **Citation-Grounded Chat** | RAG-powered retrieval over the team graph; every claim cites a source node |
| **Cognee Memory Layer** | Hybrid graph-vector memory — remember on publish, recall in chat, improve across sessions, forget on retraction |
| **Query-Overlay Visualization** | Signature visual moment — chat dims, team graph fades in, cited nodes pulse as the answer streams |
| **Pluggable Brain (V1)** | MCP server endpoint so external AI tools (Harvey, CoCounsel, Copilot) can query the firm's knowledge |

## Tech Stack (MVP)

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Cytoscape.js |
| Backend | Node.js 20, Express, TypeScript |
| Database | PostgreSQL 16, pgvector |
| AI | Gemini 2.5 Pro/Flash/Vision, Whisper API, Microsoft Presidio, Cognee (memory sidecar) |
| Personal Storage | IndexedDB (browser) |
| Deployment | Vercel (frontend), Railway/Render (backend + Postgres) |

## Repository Structure

```
consilium/
├── apps/
│   ├── web/                        # React + Vite frontend (SPA)
│   │   └── src/
│   │       ├── api/                # Backend client (fetch wrappers, TanStack Query)
│   │       ├── components/         # Reusable UI components
│   │       ├── lib/                # IndexedDB wrappers, graph utilities
│   │       ├── store/              # Zustand stores
│   │       ├── styles/             # Design tokens, global CSS
│   │       └── views/              # Page-level views (auth, capture, chat, graph, publish, team)
│   └── api/                        # Node.js + Express backend
│       └── src/
│           ├── routes/             # Express route handlers
│           ├── services/           # AI orchestration, redaction, RAG
│           ├── db/                 # Postgres client, queries, migrations
│           ├── prompts/            # System prompts for Gemini
│           └── seed/               # Seed data scripts and content
├── infra/
│   ├── docker-compose.yml          # Local dev: Postgres + Presidio
│   └── deploy/                     # Vercel + Railway deployment configs
├── docs/                           # Hackathon submission assets, public docs
├── .agent/                         # Agent-facing specification documents
│   ├── product-brief.md            # Product vision, market, business model
│   ├── product-requirements.md     # PRD: roles, features, acceptance criteria
│   ├── project-architecture.md     # System architecture, data model, pipelines
│   ├── design-guidelines.md        # Brand, color, type, motion, components
│   ├── context-dump.md             # Full decision history and reasoning
│   └── consilium-vault-assistant.md  # Vault assistant system prompt
├── vault/                          # LLM-maintained knowledge wiki (Obsidian vault)
│   ├── sources/                    # Summary pages per source document
│   ├── entities/                   # Named things: products, tools, companies, roles
│   ├── concepts/                   # Ideas, patterns, doctrines, techniques
│   ├── topics/                     # Synthesis pages spanning multiple sources
│   ├── raw/                        # Immutable source documents
│   └── templates/                  # Page templates for wiki maintenance
├── AGENT.md                        # Agent entry point (start here)
└── README.md                       # This file
```

## Target Market

**Initial wedge:** Litigation practice groups at mid-size law firms (50–300 lawyers).

**Expansion path:** Other practice groups → BigLaw / AmLaw 200 → In-house legal teams → Adjacent professional services.

**Business model:** Practice-group license, tiered by size ($25K–$85K ARR), with land-and-expand across the firm (~$200K ARR at maturity).

## Hackathon Context

Built for the **WeMakeDevs Cognee Hackathon**. Team-brain memory powered by [Cognee](https://docs.cognee.ai/) (`remember` / `recall` / `improve` / `forget`).

**Demo narrative (5 min):** Capture → Publish with visible redaction → Retrieval with graph-overlay visualization → Save session to firm memory.

## Developers

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/T-WREKX">
        <img src="https://github.com/T-WREKX.png" width="100px;" alt="Abdul Hosain"/><br />
        <sub><b>Abdul Hosain</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/hatif03">
        <img src="https://github.com/hatif03.png" width="100px;" alt="Hatif Osmani"/><br />
        <sub><b>Hatif Osmani</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/azimwarsii">
        <img src="https://github.com/azimwarsii.png" width="100px;" alt="Azim Warsi"/><br />
        <sub><b>Azim Warsi</b></sub>
      </a>
    </td>
  </tr>
</table>

## License

This project was built for the WeMakeDevs Cognee Hackathon.
