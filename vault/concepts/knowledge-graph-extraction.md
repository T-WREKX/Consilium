---
title: Knowledge graph extraction
type: concept
status: active
tags: [pipeline, ai, consilium]
sources: [consilium-product-requirements, consilium-project-architecture, consilium-product-brief]
created: 2026-05-12
updated: 2026-05-12
---

# Knowledge graph extraction

The end-to-end process by which [[consilium|Consilium]] turns unstructured capture (text, audio transcript, image OCR) into structured nodes and edges in the personal or team graph. The **technical core** Consilium pitches against Track 4 of the hackathon. (see [[hackathon-judging-fit]])

## Pipeline

1. **Capture** — text editor, MediaRecorder audio (transcribed by [[whisper]]), or image upload ([[gemini|Gemini Vision]] extracts text + structural description).
2. **[[auto-organization-pipeline]]** — single Gemini Pro call extracts entities (matters, parties, lawyers, judges, witnesses, legal concepts, precedents, statutes), classifies note type (`strategy`/`observation`/`lesson_learned`/`action_item`/`research`/`meeting_summary`), and flags privileged content.
3. **Personal graph integration** (frontend) — create/update entity nodes, create edges from the note node to entity nodes, suggest edges to existing notes that share entities.
4. **On publish** — [[redaction-pipeline]] runs; the sanitized version becomes a new node in the team graph; edges to existing entities are created or strengthened.
5. **Retrieval** — [[rag-query-pipeline]] uses embeddings + 1-hop graph expansion over `team_graph_edges`.

## Data shape (team graph, see [[consilium-data-model]])

- `team_graph_nodes` — typed nodes (`insight`, `matter`, `party`, `lawyer`, `judge`, `witness`, `concept`, `precedent`, `statute`)
- `team_graph_edges` — typed edges (`mentions`, `involves`, `cites`, `authored_by`, `about`, `concerns`, `related_to`)

## Why graph (not just embeddings)

- **Structural retrieval**: 1-hop expansion from top vector hits brings in related context that pure embedding similarity misses.
- **Demoable structure**: the graph is a visible artifact; an embedding space is not.
- **Aligns with the legal domain**: matters, parties, judges, statutes have **natural relationships** that an embedding space flattens.

## Why a single Gemini call

[[auto-organization-pipeline|Extraction + classification + privilege flagging]] in one structured-output call keeps end-to-end latency under the 5-second budget. Multiple round-trips would blow it.

## Track 4 (Data & Intelligence) fit

From [[consilium-product-brief]] §"Why Consilium Wins the Hackathon":

- **RAG over proprietary multi-source data** → the team graph with citation-grounded retrieval.
- **AI-powered data pipelines and validation** → the capture-to-structured-graph pipeline.
- **Analytics agents for natural language querying** → conversational query of the team brain.
- **Knowledge graph extraction from documents** → exactly this concept.

## Sources

- [[consilium-product-requirements]]
- [[consilium-project-architecture]]
- [[consilium-product-brief]]
