// apps/api/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRouter from './routes/auth';
import captureRouter from './routes/capture';
import chatRouter from './routes/chat';
import teamGraphRouter from './routes/teamGraph';
import publishRouter from './routes/publish';
import seedRouter from './routes/seed';
import healthRouter from './routes/health';

dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const app = express();
const PORT = process.env.PORT ?? 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';

app.use(cors({ origin: FRONTEND_ORIGIN, credentials: false }));
app.use(express.json({ limit: '10mb' }));

// Public routes
app.use('/api/auth', authRouter);
app.use('/api/health', healthRouter);

// Dev-only seed route
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/seed', seedRouter);
}

// Protected routes — auth middleware is applied per-route inside each router
app.use('/api', captureRouter);
app.use('/api/team-graph', teamGraphRouter);
app.use('/api/chat', chatRouter);
app.use('/api', publishRouter);

app.listen(PORT, () => {
  console.log(`[api] Consilium API running on port ${PORT}`);
});

export default app;
