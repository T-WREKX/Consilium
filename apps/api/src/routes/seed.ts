import { Router, Request, Response } from 'express';
import { runSeed } from '../seed/seed';

const router = Router();

/**
 * POST /api/seed
 * Re-run seed data load. Idempotent — safe to call multiple times.
 * Dev/deployment use only.
 */
router.post('/seed', async (_req: Request, res: Response) => {
  try {
    const result = await runSeed();
    return res.json({
      data: {
        message: 'Seed complete',
        users: result.users,
        nodes: result.nodes,
      },
    });
  } catch (err) {
    console.error('[seed] Seed failed:', err);
    return res.status(500).json({
      error: {
        code: 'SEED_ERROR',
        message: err instanceof Error ? err.message : 'Seed failed',
        retryable: true,
      },
    });
  }
});

export default router;
