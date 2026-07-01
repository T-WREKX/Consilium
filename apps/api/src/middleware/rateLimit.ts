// apps/api/src/middleware/rateLimit.ts
import { Request, Response, NextFunction } from 'express';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

const counts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(req: Request, res: Response, next: NextFunction): void {
  const key = req.user?.id ?? req.ip ?? 'anonymous';
  const now = Date.now();
  const entry = counts.get(key);

  if (!entry || now > entry.resetAt) {
    counts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }

  if (entry.count >= MAX_REQUESTS) {
    res.status(429).json({
      error: { code: 'RATE_LIMITED', message: 'Too many requests. Retry in a minute.', retryable: true },
    });
    return;
  }

  entry.count += 1;
  next();
}
