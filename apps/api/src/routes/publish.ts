// apps/api/src/routes/publish.ts
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { auth } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import { redactNote } from '../services/redaction';
import { generateEmbedding } from '../services/embedding';
import { insertNode, insertEdge } from '../db/queries';

const router = Router();

const redactSchema = z.object({
  content: z.string().min(1).max(50_000),
});

const publishSchema = z.object({
  title: z.string().min(1).max(500),
  body: z.string().min(1).max(50_000),
  summary: z.string().max(1000).optional(),
  nodeType: z.enum(['insight', 'matter', 'party', 'lawyer', 'judge', 'witness', 'concept', 'precedent', 'statute']).default('insight'),
  sourcePersonalNoteId: z.string().optional(),
  relatedNodeIds: z.array(z.string().uuid()).max(20).optional(),
});

// POST /api/redact
router.post('/redact', auth, rateLimit, async (req: Request, res: Response) => {
  const parsed = redactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: parsed.error.message, retryable: false },
    });
  }

  try {
    const result = await redactNote(parsed.data.content);
    return res.json({ data: result });
  } catch (err) {
    console.error('[publish] Redaction failed:', err);
    return res.status(500).json({
      error: { code: 'REDACTION_ERROR', message: 'Redaction pipeline failed', retryable: true },
    });
  }
});

// POST /api/publish
router.post('/publish', auth, rateLimit, async (req: Request, res: Response) => {
  const parsed = publishSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: parsed.error.message, retryable: false },
    });
  }

  const { title, body, summary, nodeType, sourcePersonalNoteId, relatedNodeIds } = parsed.data;
  const contributorId = req.user!.id;

  try {
    const embedding = await generateEmbedding(`${title}\n\n${body}`);

    const nodeId = await insertNode({
      node_type: nodeType,
      title,
      body,
      summary,
      contributor_id: contributorId,
      source_personal_note_id: sourcePersonalNoteId,
      embedding,
    });

    // Create authored_by edge from node → contributor (lawyer node may not exist; skip gracefully)
    if (relatedNodeIds?.length) {
      for (const relatedId of relatedNodeIds) {
        await insertEdge({
          source_node_id: nodeId,
          target_node_id: relatedId,
          edge_type: 'related_to',
        });
      }
    }

    return res.json({
      data: { nodeId, message: 'Published.' },
    });
  } catch (err) {
    console.error('[publish] Publish failed:', err);
    return res.status(500).json({
      error: { code: 'PUBLISH_ERROR', message: 'Failed to publish note', retryable: true },
    });
  }
});

export default router;
