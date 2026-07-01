import { Router, Request, Response } from 'express';
import { auth } from '../middleware/auth';
import { getFullTeamGraph, getNodeById, deleteNodeById } from '../db/queries';
import pool from '../db/pool';

const router = Router();

/**
 * GET /api/team-graph
 * Return all team graph nodes and edges for rendering.
 */
router.get('/', auth, async (_req: Request, res: Response) => {
  try {
    const graph = await getFullTeamGraph();
    return res.json({ data: graph });
  } catch (err) {
    console.error('[team-graph] Failed to fetch graph:', err);
    return res.status(500).json({
      error: {
        code: 'GRAPH_ERROR',
        message: 'Failed to load team graph',
        retryable: true,
      },
    });
  }
});

/**
 * GET /api/team-graph/nodes/:id
 * Return a single node with its connections (for citation summary panels).
 */
router.get('/nodes/:id', auth, async (req: Request, res: Response) => {
  try {
    const node = await getNodeById(String(req.params.id));
    if (!node) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Node not found',
          retryable: false,
        },
      });
    }
    return res.json({ data: node });
  } catch (err) {
    console.error('[team-graph] Failed to fetch node:', err);
    return res.status(500).json({
      error: {
        code: 'NODE_ERROR',
        message: 'Failed to load node',
        retryable: true,
      },
    });
  }
});

/**
 * DELETE /api/team-graph/nodes/:id
 * Remove a published node from the team graph. Connected edges cascade.
 * Authorization: a Lawyer / Practice Group Lead may delete only nodes
 * they contributed; Knowledge Admin may delete any node (V1: explicit
 * remove permission on this role).
 */
router.delete('/nodes/:id', auth, async (req: Request, res: Response) => {
  const nodeId = String(req.params.id);
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Not authenticated', retryable: false },
    });
  }

  try {
    // Pre-check ownership unless caller is knowledge_admin
    if (user.role !== 'knowledge_admin') {
      const owner = await pool.query(
        `SELECT contributor_id FROM team_graph_nodes WHERE id = $1`,
        [nodeId]
      );
      if (owner.rows.length === 0) {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Node not found', retryable: false },
        });
      }
      const contributorId = owner.rows[0].contributor_id;
      if (contributorId && contributorId !== user.id) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You can only delete insights you published',
            retryable: false,
          },
        });
      }
    }

    const deleted = await deleteNodeById(nodeId);
    if (!deleted) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Node not found', retryable: false },
      });
    }
    return res.json({ data: { id: deleted.id } });
  } catch (err) {
    console.error('[team-graph] Failed to delete node:', err);
    return res.status(500).json({
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete node',
        retryable: true,
      },
    });
  }
});

export default router;
