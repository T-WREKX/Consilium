/**
 * Derived Edge Generator
 *
 * Runs after seeding to create Obsidian-style derived connections:
 *   Phase 1: Shared-entity edges (insight ↔ insight via 2+ shared entities)
 *   Phase 3: Embedding similarity edges (insight ↔ insight with cosine > 0.80)
 *   Phase 4: Entity co-occurrence edges (entity ↔ entity appearing in 3+ insights together)
 *
 * All derived edges use edge_type = 'related_to' and are idempotent (ON CONFLICT DO NOTHING).
 */

import pool from '../db/pool';
import { insertEdge } from '../db/queries';

/**
 * Phase 1: Create `related_to` edges between insights that share 2+ entity mentions.
 * Two insights mentioning the same 2+ entities are topically related.
 */
export async function deriveSharedEntityEdges(): Promise<number> {
  const result = await pool.query(`
    SELECT e1.source_node_id AS insight_a, e2.source_node_id AS insight_b, COUNT(*) AS shared
    FROM team_graph_edges e1
    JOIN team_graph_edges e2
      ON e1.target_node_id = e2.target_node_id
      AND e1.source_node_id < e2.source_node_id
    JOIN team_graph_nodes n1 ON n1.id = e1.source_node_id AND n1.node_type = 'insight'
    JOIN team_graph_nodes n2 ON n2.id = e2.source_node_id AND n2.node_type = 'insight'
    WHERE e1.edge_type = 'mentions' AND e2.edge_type = 'mentions'
    GROUP BY e1.source_node_id, e2.source_node_id
    HAVING COUNT(*) >= 2
  `);

  let count = 0;
  for (const row of result.rows) {
    await insertEdge({
      source_node_id: row.insight_a,
      target_node_id: row.insight_b,
      edge_type: 'related_to',
      weight: Math.min(row.shared / 3, 1.0), // normalize: 2 shared = 0.67, 3+ = 1.0
    });
    count++;
  }

  return count;
}

/**
 * Phase 3: Create `related_to` edges between insights with embedding cosine similarity > 0.80.
 * This finds semantic connections the user never explicitly made.
 */
export async function deriveEmbeddingSimilarityEdges(): Promise<number> {
  const result = await pool.query(`
    SELECT a.id AS node_a, b.id AS node_b,
           1 - (a.embedding <=> b.embedding) AS similarity
    FROM team_graph_nodes a, team_graph_nodes b
    WHERE a.id < b.id
      AND a.node_type = 'insight'
      AND b.node_type = 'insight'
      AND a.embedding IS NOT NULL
      AND b.embedding IS NOT NULL
      AND 1 - (a.embedding <=> b.embedding) > 0.80
  `);

  let count = 0;
  for (const row of result.rows) {
    // Skip if a shared-entity edge already exists (Phase 1 may have created it)
    const existing = await pool.query(
      `SELECT 1 FROM team_graph_edges
       WHERE ((source_node_id = $1 AND target_node_id = $2)
           OR (source_node_id = $2 AND target_node_id = $1))
         AND edge_type = 'related_to'`,
      [row.node_a, row.node_b]
    );
    if (existing.rows.length > 0) continue;

    await insertEdge({
      source_node_id: row.node_a,
      target_node_id: row.node_b,
      edge_type: 'related_to',
      weight: parseFloat(row.similarity),
    });
    count++;
  }

  return count;
}

/**
 * Phase 4: Create edges between entities that co-occur in 2+ insights together.
 * E.g., if "Judge Soriano" and "RTC Makati Branch 147" both appear in 3 insights,
 * they get a `related_to` edge — revealing structural relationships.
 */
export async function deriveEntityCooccurrenceEdges(): Promise<number> {
  const result = await pool.query(`
    SELECT e1.target_node_id AS entity_a, e2.target_node_id AS entity_b, COUNT(*) AS cooccurrences
    FROM team_graph_edges e1
    JOIN team_graph_edges e2
      ON e1.source_node_id = e2.source_node_id
      AND e1.target_node_id < e2.target_node_id
    JOIN team_graph_nodes n1 ON n1.id = e1.target_node_id AND n1.node_type != 'insight'
    JOIN team_graph_nodes n2 ON n2.id = e2.target_node_id AND n2.node_type != 'insight'
    WHERE e1.edge_type = 'mentions' AND e2.edge_type = 'mentions'
    GROUP BY e1.target_node_id, e2.target_node_id
    HAVING COUNT(*) >= 2
  `);

  let count = 0;
  for (const row of result.rows) {
    await insertEdge({
      source_node_id: row.entity_a,
      target_node_id: row.entity_b,
      edge_type: 'related_to',
      weight: Math.min(row.cooccurrences / 4, 1.0),
    });
    count++;
  }

  return count;
}

/**
 * Run all derived edge generators in sequence.
 */
export async function deriveAllEdges(): Promise<{
  sharedEntity: number;
  embeddingSimilarity: number;
  entityCooccurrence: number;
}> {
  console.log('[derive] Phase 1: Shared-entity edges...');
  const sharedEntity = await deriveSharedEntityEdges();
  console.log(`[derive] Phase 1 complete: ${sharedEntity} edges created.`);

  console.log('[derive] Phase 3: Embedding similarity edges...');
  const embeddingSimilarity = await deriveEmbeddingSimilarityEdges();
  console.log(`[derive] Phase 3 complete: ${embeddingSimilarity} edges created.`);

  console.log('[derive] Phase 4: Entity co-occurrence edges...');
  const entityCooccurrence = await deriveEntityCooccurrenceEdges();
  console.log(`[derive] Phase 4 complete: ${entityCooccurrence} edges created.`);

  return { sharedEntity, embeddingSimilarity, entityCooccurrence };
}
