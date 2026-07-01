import pool from './pool';

// ─── Team Graph Queries ──────────────────────────────────────────────────────

/**
 * Retrieve top-k team graph nodes by cosine similarity to a query embedding.
 * Uses pgvector's `<=>` operator (cosine distance).
 */
export async function vectorSearch(
  queryEmbedding: number[],
  limit: number = 8
) {
  const embeddingStr = `[${queryEmbedding.join(',')}]`;
  const result = await pool.query(
    `SELECT id, node_type, title, body, summary, contributor_id, metadata,
            created_at, updated_at,
            1 - (embedding <=> $1::vector) AS similarity
     FROM team_graph_nodes
     WHERE embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [embeddingStr, limit]
  );
  return result.rows;
}

/**
 * 1-hop graph expansion: given a set of node IDs, return all directly
 * connected nodes and the connecting edges.
 */
export async function expandOneHop(nodeIds: string[]) {
  if (nodeIds.length === 0) return { nodes: [], edges: [] };

  // Get edges connecting to/from the seed nodes
  const edgeResult = await pool.query(
    `SELECT id, source_node_id, target_node_id, edge_type, weight
     FROM team_graph_edges
     WHERE source_node_id = ANY($1) OR target_node_id = ANY($1)`,
    [nodeIds]
  );

  // Collect neighbor node IDs
  const neighborIds = new Set<string>();
  for (const edge of edgeResult.rows) {
    neighborIds.add(edge.source_node_id);
    neighborIds.add(edge.target_node_id);
  }
  // Remove seed nodes to get only the new neighbors
  for (const id of nodeIds) neighborIds.delete(id);

  let neighborNodes: any[] = [];
  if (neighborIds.size > 0) {
    const neighborResult = await pool.query(
      `SELECT id, node_type, title, body, summary, contributor_id, metadata,
              created_at, updated_at
       FROM team_graph_nodes
       WHERE id = ANY($1)`,
      [Array.from(neighborIds)]
    );
    neighborNodes = neighborResult.rows;
  }

  return { nodes: neighborNodes, edges: edgeResult.rows };
}

/**
 * Retrieve all team graph nodes and edges for rendering.
 */
export async function getFullTeamGraph() {
  const nodesResult = await pool.query(
    `SELECT id, node_type, title, summary, contributor_id, metadata,
            created_at, updated_at
     FROM team_graph_nodes
     ORDER BY created_at DESC`
  );
  const edgesResult = await pool.query(
    `SELECT id, source_node_id, target_node_id, edge_type, weight
     FROM team_graph_edges`
  );
  return { nodes: nodesResult.rows, edges: edgesResult.rows };
}

/**
 * Retrieve a single team graph node by ID with its connected edges and neighbor summaries.
 */
export async function getNodeById(nodeId: string) {
  const nodeResult = await pool.query(
    `SELECT id, node_type, title, body, summary, contributor_id, metadata,
            created_at, updated_at
     FROM team_graph_nodes
     WHERE id = $1`,
    [nodeId]
  );

  if (nodeResult.rows.length === 0) return null;

  const edgesResult = await pool.query(
    `SELECT e.id, e.source_node_id, e.target_node_id, e.edge_type, e.weight,
            n.title AS connected_title, n.node_type AS connected_type
     FROM team_graph_edges e
     JOIN team_graph_nodes n ON n.id = CASE
       WHEN e.source_node_id = $1 THEN e.target_node_id
       ELSE e.source_node_id
     END
     WHERE e.source_node_id = $1 OR e.target_node_id = $1`,
    [nodeId]
  );

  return {
    ...nodeResult.rows[0],
    connections: edgesResult.rows,
  };
}

/**
 * Insert a new node into the team graph and return its ID.
 */
export async function insertNode(node: {
  node_type: string;
  title: string;
  body?: string;
  summary?: string;
  contributor_id?: string;
  source_personal_note_id?: string;
  embedding?: number[];
  metadata?: Record<string, unknown>;
}) {
  const embeddingStr = node.embedding
    ? `[${node.embedding.join(',')}]`
    : null;

  const result = await pool.query(
    `INSERT INTO team_graph_nodes
       (node_type, title, body, summary, contributor_id, source_personal_note_id, embedding, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7::vector, $8)
     RETURNING id`,
    [
      node.node_type,
      node.title,
      node.body ?? null,
      node.summary ?? null,
      node.contributor_id ?? null,
      node.source_personal_note_id ?? null,
      embeddingStr,
      JSON.stringify(node.metadata ?? {}),
    ]
  );
  return result.rows[0].id as string;
}

/**
 * Insert an edge into the team graph. Uses ON CONFLICT to skip duplicates.
 */
export async function insertEdge(edge: {
  source_node_id: string;
  target_node_id: string;
  edge_type: string;
  weight?: number;
}) {
  await pool.query(
    `INSERT INTO team_graph_edges (source_node_id, target_node_id, edge_type, weight)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (source_node_id, target_node_id, edge_type) DO NOTHING`,
    [edge.source_node_id, edge.target_node_id, edge.edge_type, edge.weight ?? 1.0]
  );
}

/**
 * Check if team graph has any data (used to determine if seed is needed).
 */
export async function getNodeCount(): Promise<number> {
  const result = await pool.query('SELECT COUNT(*)::int AS count FROM team_graph_nodes');
  return result.rows[0].count;
}

/**
 * Delete a team graph node. Connected edges cascade via the FK constraint
 * (team_graph_edges.{source,target}_node_id ON DELETE CASCADE).
 * Returns the deleted row's id + contributor_id, or null if not found.
 */
export async function deleteNodeById(
  nodeId: string
): Promise<{ id: string; contributor_id: string | null } | null> {
  const result = await pool.query(
    `DELETE FROM team_graph_nodes
     WHERE id = $1
     RETURNING id, contributor_id`,
    [nodeId]
  );
  return result.rows[0] ?? null;
}
