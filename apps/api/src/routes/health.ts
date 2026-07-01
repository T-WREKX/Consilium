import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/health
 * Health check for deployment platform monitoring.
 */
router.get('/health', (_req: Request, res: Response) => {
  return res.json({
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '1.0.0',
    },
  });
});

export default router;
