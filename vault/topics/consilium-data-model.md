---
title: Consilium data model
type: topic
status: active
tags: [consilium, data-model, schema]
sources: [consilium-project-architecture]
created: 2026-05-12
updated: 2026-05-12
---

# Consilium data model

The schemas behind [[consilium|Consilium]]: relational Postgres for the team graph, TypeScript-typed IndexedDB for personal notes.

## Team graph schema (Postgres)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('lawyer', 'practice_group_lead', 'knowledge_admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE team_graph_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_type TEXT NOT NULL CHECK (node_type IN (
    'insight', 'matter', 'party', 'lawyer', 'judge',
    'witness', 'concept', 'precedent', 'statute'
  )),
  title TEXT NOT NULL,
  body TEXT,
  summary TEXT,
  contributor_id UUID REFERENCES users(id),
  source_personal_note_id TEXT,  -- IndexedDB id, traceability only
  embedding vector(768),         -- pgvector; matches text-embedding-004
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_node_type ON team_graph_nodes(node_type);
CREATE INDEX idx_embedding ON team_graph_nodes USING hnsw (embedding vector_cosine_ops);

CREATE TABLE team_graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id UUID NOT NULL REFERENCES team_graph_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES team_graph_nodes(id) ON DELETE CASCADE,
  edge_type TEXT NOT NULL CHECK (edge_type IN (
    'mentions', 'involves', 'cites', 'authored_by',
    'about', 'concerns', 'related_to'
  )),
  weight FLOAT DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (source_node_id, target_node_id, edge_type)
);

CREATE INDEX idx_edge_source ON team_graph_edges(source_node_id);
CREATE INDEX idx_edge_target ON team_graph_edges(target_node_id);
```

## Node types

9 types, color-coded per [[node-color-coding]]: `insight`, `matter`, `party`, `lawyer`, `judge`, `witness`, `concept`, `precedent`, `statute`.

## Edge types

7 typed relationships: `mentions`, `involves`, `cites`, `authored_by`, `about`, `concerns`, `related_to`. The `UNIQUE (source, target, edge_type)` constraint prevents duplicate edges of the same type.

## Personal note schema (IndexedDB)

```typescript
interface PersonalNote {
  id: string;                     // uuid generated client-side
  title: string;
  body: string;                   // markdown
  contentType: 'text' | 'audio' | 'image';
  audioBlob?: Blob;
  imageBlob?: Blob;
  audioTranscript?: string;
  extractedEntities: Entity[];    // populated by auto-organization
  classification: NoteClassification;
  isPrivileged: boolean;
  isPublished: boolean;
  publishedNodeId?: string;       // team_graph_nodes.id if published
  createdAt: number;              // epoch ms
  updatedAt: number;
}

interface Entity {
  id: string;
  type: 'matter' | 'party' | 'lawyer' | 'judge' | 'witness'
      | 'concept' | 'precedent' | 'statute';
  name: string;
  confidence: number;
}

type NoteClassification =
  | 'strategy' | 'observation' | 'lesson_learned'
  | 'action_item' | 'research' | 'meeting_summary';
```

## IndexedDB object stores

- `notes` (key: `id`) — all personal notes
- `entities` (key: `id`) — locally-tracked entity dedup
- `personalGraph` — derived graph structure for fast rendering

## Embedding dimension

`vector(768)` matches Gemini's `text-embedding-004`. HNSW index uses `vector_cosine_ops`.

## Audit hooks (V1)

Even though MVP does not ship audit logging, the schema includes `updated_at` and `contributor_id` so audit can be added **without schema migration**.

## Open questions

- If the embedding model dimension changes (V1 model rev), the `vector(768)` column needs to be rebuilt. Strategy: dual-write + reindex window — not documented.
- 100k-node-per-firm scenario (V1 firms with deep DMS seeding): HNSW recall/latency trade-off needs revisiting.

## Sources

- [[consilium-project-architecture]]
