// apps/api/src/routes/auth.ts
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { auth } from '../middleware/auth';
import { findUserByEmail, verifyPassword, signToken } from '../services/auth';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Invalid email or password format', retryable: false },
    });
  }

  const { email, password } = parsed.data;
  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(401).json({
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', retryable: false },
    });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', retryable: false },
    });
  }

  const token = signToken(user);
  return res.json({
    data: {
      token,
      user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
    },
  });
});

// POST /api/auth/logout — stateless JWT; client drops the token
router.post('/logout', (_req: Request, res: Response) => {
  return res.json({ data: { ok: true } });
});

// GET /api/me
router.get('/me', auth, (req: Request, res: Response) => {
  return res.json({ data: req.user });
});

export default router;
