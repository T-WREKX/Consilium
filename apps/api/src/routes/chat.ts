import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { auth } from '../middleware/auth';
import { retrieveContext, streamRagResponse } from '../services/rag';
import { classifyQuery } from '../services/classifier';
import { streamConversationalResponse } from '../services/conversational';
import {
  improveSession,
  isCogneeEnabled,
  rememberChatTurn,
} from '../services/cognee';

const router = Router();

const chatSchema = z.object({
  query: z.string().min(1).max(10_000),
  sessionId: z.string().uuid().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
        citedNodeIds: z.array(z.string()).optional(),
      })
    )
    .max(8)
    .optional(),
});

const improveSchema = z.object({
  sessionId: z.string().uuid(),
});

/**
 * POST /api/chat
 * RAG query with Server-Sent Events streaming.
 */
router.post('/', auth, async (req: Request, res: Response) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: parsed.error.message,
        retryable: false,
      },
    });
  }

  const { query, history = [], sessionId } = parsed.data;
  let assistantAnswer = '';

  try {
    const kind = await classifyQuery(query, history);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    res.write(`event: kind\ndata: ${JSON.stringify({ kind })}\n\n`);

    if (kind === 'knowledge') {
      const { citedNodeIds, confidence, contexts } = await retrieveContext(query, sessionId);
      res.write(
        `event: cited-nodes\ndata: ${JSON.stringify({ nodeIds: citedNodeIds, confidence })}\n\n`
      );
      const stream = streamRagResponse(query, contexts, confidence);
      for await (const chunk of stream) {
        assistantAnswer += chunk;
        res.write(`event: token\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
      }
      res.write(
        `event: done\ndata: ${JSON.stringify({ kind: 'knowledge', confidence, sourceCount: contexts.length })}\n\n`
      );

      if (sessionId && isCogneeEnabled() && assistantAnswer.trim()) {
        rememberChatTurn({
          sessionId,
          question: query,
          answer: assistantAnswer,
          citedNodeIds,
        }).catch((err) => console.warn('[chat] Cognee remember/entry failed:', err));
      }
    } else {
      const stream = streamConversationalResponse(query, history);
      for await (const chunk of stream) {
        assistantAnswer += chunk;
        res.write(`event: token\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
      }
      res.write(
        `event: done\ndata: ${JSON.stringify({ kind: 'conversational' })}\n\n`
      );
    }

    res.end();
  } catch (err) {
    console.error('[chat] failed:', err);
    if (!res.headersSent) {
      return res.status(500).json({
        error: {
          code: 'CHAT_ERROR',
          message: 'Failed to process query',
          retryable: true,
        },
      });
    }
    res.write(
      `event: error\ndata: ${JSON.stringify({ message: 'Stream interrupted' })}\n\n`
    );
    res.end();
  }
});

/**
 * POST /api/chat/improve
 * Bridge session Q&A into permanent Cognee graph memory.
 */
router.post('/improve', auth, async (req: Request, res: Response) => {
  const parsed = improveSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: parsed.error.message,
        retryable: false,
      },
    });
  }

  if (!isCogneeEnabled()) {
    return res.json({
      data: { improved: false, message: 'Cognee is disabled.' },
    });
  }

  try {
    await improveSession(parsed.data.sessionId);
    return res.json({
      data: { improved: true, sessionId: parsed.data.sessionId },
    });
  } catch (err) {
    console.error('[chat] improve failed:', err);
    return res.status(500).json({
      error: {
        code: 'IMPROVE_ERROR',
        message: err instanceof Error ? err.message : 'Cognee improve failed',
        retryable: true,
      },
    });
  }
});

export default router;
