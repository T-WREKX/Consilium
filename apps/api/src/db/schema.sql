-- Consilium MVP Database Schema
-- Extensions, tables, and indexes for users + team graph + pgvector embeddings

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ─── Users ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('lawyer', 'practice_group_lead', 'knowledge_admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Team Graph Nodes ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_graph_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_type TEXT NOT NULL CHECK (node_type IN (
    'insight', 'matter', 'party', 'lawyer', 'judge',
    'witness', 'concept', 'precedent', 'statute'
  )),
  title TEXT NOT NULL,
  body TEXT,
  summary TEXT,
  contributor_id UUID REFERENCES users(id),
  source_personal_note_id TEXT,
  embedding vector(768),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_node_type ON team_graph_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_embedding ON team_graph_nodes USING hnsw (embedding vector_cosine_ops);

-- ─── Team Graph Edges ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_graph_edges (
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

CREATE INDEX IF NOT EXISTS idx_edge_source ON team_graph_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_edge_target ON team_graph_edges(target_node_id);
