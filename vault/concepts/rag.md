---
title: Retrieval-Augmented Generation (RAG)
type: concept
status: active
tags: [llm, retrieval, pattern]
sources: [karpathy-llm-wiki-pattern, consilium-project-architecture]
created: 2026-05-12
updated: 2026-05-12
---

# Retrieval-Augmented Generation (RAG)

A pattern where, at query time, an LLM retrieves relevant chunks from a document collection (typically by embedding similarity), then generates an answer grounded in those chunks. In this vault, RAG is invoked in **two different senses**:

1. **As the thing the [[llm-wiki-pattern]] differentiates against** (raw documents → on-demand retrieval → forget).
2. **As the runtime mechanism for Consilium's team-brain query feature** — see [[rag-query-pipeline]].

Both meanings are valid; the distinction matters.

## Definition

RAG = embed query → vector similarity search over chunks (or documents) → assemble context → prompt an LLM to answer grounded in that context.

## Key claims (contrast with [[llm-wiki-pattern]])

- **No accumulation.** Each query re-discovers knowledge from scratch. (see [[karpathy-llm-wiki-pattern]])
- **No persistent synthesis.** A subtle question that requires synthesizing five documents requires re-finding and re-piecing the fragments every time.
- **The wiki pattern compiles once and keeps current**; cross-references and synthesis are already in place when the next question arrives.
- RAG over **a wiki** is reasonable. RAG over **raw documents alone** is the thing the wiki pattern improves on.

## Key claims (Consilium usage)

- Consilium's team-brain query is a RAG pipeline grounded in the team graph: embed → top-8 cosine similarity in [[postgres-pgvector]] → 1-hop graph expansion → Gemini Pro synthesis with inline `[node_id]` citations. (see [[rag-query-pipeline]])
- **Refusal is a first-class outcome**: if no nodes are above 0.75 similarity, the system refuses rather than hallucinates. (see [[citation-grounding]])
- The graph traversal layered on top of vector retrieval is what makes this distinctly more than chunk-level RAG.

## Contrast with adjacent concepts

- **Not the same as fine-tuning** — RAG injects context at inference time; fine-tuning bakes knowledge into weights.
- **Distinct from agent-based retrieval** (where the LLM autonomously decides what to search) — Consilium MVP is single-step retrieval, not agentic.

## How it shows up in Consilium

See [[rag-query-pipeline]] for the full sequence diagram and the confidence-bucket rules (High/Medium/Low/Refuse).

## Open questions

- How well does graph-augmented retrieval generalize beyond Consilium's small homogeneous team graph? Open in the general case.

## Sources

- [[karpathy-llm-wiki-pattern]]
- [[consilium-project-architecture]]
