---
title: RAG query pipeline
type: concept
status: active
tags: [pipeline, ai, consilium, retrieval]
sources: [consilium-project-architecture, consilium-product-requirements, consilium-implementation-plan]
created: 2026-05-12
updated: 2026-05-15
---

# RAG query pipeline

The retrieval and synthesis pipeline behind [[consilium|Consilium]]'s chat-with-team-brain feature — the **knowledge path** in the two-path chat architecture. Embed the query → vector similarity search → 1-hop graph expansion → grounded synthesis with inline node-ID citations. Triggers the [[query-overlay-animation]] in parallel.

**Classifier-gated (added 2026-05-15)**: every chat message first goes through [[chat-query-classifier]], which decides between `knowledge` (this pipeline) and `conversational` ([[conversational-chat-path]] — no retrieval). The pipeline below runs only when the classifier returns `kind: 'knowledge'`.

## Sequence

1. User submits a query in the chat input.
2. Backend embeds the query using [[gemini|`gemini-embedding-001`]] with `outputDimensionality: 768` (architecture spec called for `text-embedding-004`, which is not exposed by `@google/generative-ai`).
3. Backend runs cosine-similarity search in [[postgres-pgvector]]:
   ```sql
   SELECT id, title, summary
   FROM team_graph_nodes
   ORDER BY embedding <=> $query_embedding
   LIMIT 8;
   ```
4. For each retrieved node, **1-hop graph expansion** via `team_graph_edges`, deduplicated by node ID.
5. **Filter** expanded set: keep only nodes with cosine similarity > **0.55** to the query.
6. Construct context as a JSON array of `{ id, title, summary, body, type }`.
7. Stream Gemini Pro response with a system prompt that enforces grounding rules (see below).
8. Frontend parses inline `[node_id]` markers into clickable [[consilium-retrieval-implementation|CitationChip]]s. Each chip's click opens the `NodeSummaryPanel` for the cited node. The parser accepts both full 36-char UUIDs and 8–12 char hex-prefix IDs (the API returns the prefix form) and resolves them against the message's `citedNodeIds` list. (commit `6d38070`, 2026-05-15)
9. **In parallel**, the frontend triggers the [[query-overlay-animation]] using the returned cited node IDs.

## Grounding rules (system prompt)

- **Cite every claim** with a node ID.
- **Refuse to answer** if no nodes are above similarity **0.75** — *"I don't have enough firm knowledge to answer this confidently."*
- **Output structured response** with inline `[node_id]` markers.
- See [[citation-grounding]] for the full discipline.

## Confidence buckets (re-calibrated 2026-05-15)

Empirically re-calibrated against `gemini-embedding-001` actual distributions on the seeded corpus (see `apps/api/src/diagnostics-similarity.ts`). Even tightly-matched queries — e.g. *"How does Judge Buenaventura handle motions"* against 6 dedicated Buenaventura insights — cap around **0.80** cosine similarity, so the old "≥0.80 = high" threshold was unreachable in practice. New thresholds:

| Level | Rule | Meaning |
|---|---|---|
| `high` | ≥3 nodes ≥ 0.75 | Multiple strongly on-topic hits |
| `medium` | ≥2 nodes ≥ 0.70 | Solid but thinner — one strong + adjacent |
| `low` | ≥1 node ≥ 0.60 | A single weakly-related hit |
| `refuse` | 0 nodes ≥ 0.60 | No answer attempted |

The confidence indicator is a small pill in the chat UI: green/amber/red dot + label, drawn from the **semantic** palette (`success`, `warning`, `danger`) — unaffected by the 2026-05-14 accent revision from amber-gold to orange. Sources section is collapsed for High, expanded for Medium/Low.

## Why graph expansion on top of vector search

Pure top-k embedding similarity misses the relational structure of the team graph. A query about "cross-examining expert witnesses on damages" might top-rank a single insight; the 1-hop expansion pulls in related precedent nodes, motion-practice insights, and contributor history that strengthen the synthesis.

## Streaming and UX

- Streaming response begins within 3 seconds of query submission.
- Citation chips appear in the response only after the segment containing the citation has streamed.
- The [[query-overlay-animation]] overlay holds for ~1 second after cited nodes pulse, then fades back as the response streams.

## Implementation (as shipped — `apps/api/src/services/rag.ts`)

- **Top-k**: **8** (matches spec)
- **Final cosine threshold**: **0.55** for context inclusion (matches spec)
- **Graph expansion**: 1-hop; **only `insight`-type neighbors are added to the context** — entity neighbors (`matter`, `party`, `lawyer`, `judge`, `witness`, `concept`, `precedent`, `statute`) are walked but not synthesized over. Keeps the context focused on synthesizable claims.
- **Synthesis model**: `gemini-2.5-pro`, streaming
- **System prompt**: `apps/api/src/prompts/chat.md` (loaded once at module scope via the shared `promptLoader.ts` helper).
- **Reliability**: the initial stream connect is wrapped in [[gemini-retry-backoff|withGeminiRetry]]; mid-stream chunks are **not** retryable (partial output may already have reached the user).
- **Refusal message — random variant (added 2026-05-15)**: one of four phrasings is picked at random per refused query so the demo doesn't feel scripted. All variants share the same intent (acknowledge gap, invite capture):
  - *"I don't have firm knowledge that directly addresses this. You may want to capture your own thinking on this topic as a starting point."*
  - *"The firm brain doesn't have material covering this question. Consider opening a capture and starting the record yourself — your notes today become tomorrow's institutional memory."*
  - *"No published insights in the team graph speak to this directly. This looks like an open area for the firm's knowledge — your capture could be the first entry."*
  - *"I couldn't find firm knowledge on this. Rather than synthesize from general legal training, I'd rather defer — this is a good prompt for a fresh personal capture."*
- **SSE event sequence (revised 2026-05-15)**: (1) `kind` event with `{ kind: 'knowledge' }` from the classifier, then (2) `cited-nodes` with `{ nodeIds, confidence }`, then (3..N) `token` events with `{ text }`, finally `done` with `{ kind: 'knowledge', confidence, sourceCount }`. The `kind` event fires **before** anything else so the frontend can decide whether to expect `cited-nodes` and gate the [[query-overlay-animation]] accordingly. For the conversational branch, the protocol omits `cited-nodes` and emits `done` with `{ kind: 'conversational' }` only.
- **Citation format**: inline `[node_id]` markers in the response body; Sources section after `---` lists `[id] Title`

See [[consilium-retrieval-implementation]] for the full breakdown.

## Relation to RAG generally

This is RAG in the **classical** sense — see [[rag]] for the contrast with the [[llm-wiki-pattern]] and the broader pattern. The graph-traversal layer is what differentiates Consilium's RAG from chunk-only retrieval.

## Sources

- [[consilium-project-architecture]]
- [[consilium-product-requirements]]
- [[consilium-implementation-plan]]
