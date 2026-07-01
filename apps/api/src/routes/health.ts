import { Router, Request, Response } from 'express';
import { checkCogneeHealth, isCogneeEnabled } from '../services/cognee';

const router = Router();

/**
 * GET /api/health
 * Health check for deployment platform monitoring.
 */
router.get('/health', async (_req: Request, res: Response) => {
  let cognee: { enabled: boolean; healthy: boolean | null } = {
    enabled: isCogneeEnabled(),
    healthy: null,
  };
  if (cognee.enabled) {
    cognee.healthy = await checkCogneeHealth();
  }

  return res.json({
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '1.0.0',
      cognee,
    },
  });
});

export default router;
