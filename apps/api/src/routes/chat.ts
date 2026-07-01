import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { auth } from '../middleware/auth';
import { retrieveContext, streamRagResponse } from '../services/rag';
import { classifyQuery } from '../services/classifier';
import { streamConversationalResponse } from '../services/conversational';

const router = Router();

const chatSchema = z.object({
  query: z.string().min(1).max(10_000),
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

/**
 * POST /api/chat
 * RAG query with Server-Sent Events streaming.
 *
 * Two paths, selected by a Gemini Flash classifier:
 *   - knowledge:     existing retrieval + grounded answer
 *   - conversational: no retrieval; relaxed prompt with hard rule against
 *                     substantive legal claims from training data
 *
 * SSE event protocol (kind emitted first):
 *   event: kind          → { kind: "knowledge" | "conversational" }
 *   event: cited-nodes   → { nodeIds, confidence }      (knowledge only)
 *   event: token         → { text }                     (both)
 *   event: done          → { kind, confidence, sourceCount } | { kind: "conversational" }
 *   event: error         → { message }
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

  const { query, history = [] } = parsed.data;

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
      const { citedNodeIds, confidence, contexts } = await retrieveContext(query);
      res.write(
        `event: cited-nodes\ndata: ${JSON.stringify({ nodeIds: citedNodeIds, confidence })}\n\n`
      );
      const stream = streamRagResponse(query, contexts, confidence);
      for await (const chunk of stream) {
        res.write(`event: token\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
      }
      res.write(
        `event: done\ndata: ${JSON.stringify({ kind: 'knowledge', confidence, sourceCount: contexts.length })}\n\n`
      );
    } else {
      const stream = streamConversationalResponse(query, history);
      for await (const chunk of stream) {
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

export default router;
