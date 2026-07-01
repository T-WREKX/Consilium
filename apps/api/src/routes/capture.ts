import { Router, Request, Response } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';
import { auth } from '../middleware/auth';
import { organizeNote } from '../services/organize';
import { withGeminiRetry } from '../services/gemini-retry';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const organizeSchema = z.object({
  content: z.string().min(1).max(50_000),
});

const visionResponseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    text: { type: SchemaType.STRING },
    description: { type: SchemaType.STRING },
  },
  required: ['text', 'description'],
};

router.post('/organize', auth, async (req: Request, res: Response) => {
  const parsed = organizeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: parsed.error.message, retryable: false },
    });
  }
  try {
    const result = await organizeNote(parsed.data.content);
    return res.json({ data: result });
  } catch {
    return res.status(500).json({
      error: { code: 'ORGANIZE_ERROR', message: 'Organization failed', retryable: true },
    });
  }
});

router.post('/transcribe', upload.single('audio'), auth, async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'No audio file provided', retryable: false },
    });
  }
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await withGeminiRetry(
      (opts) =>
        model.generateContent(
          [
            'Transcribe this audio exactly as spoken. Return only the transcription text, no commentary or formatting.',
            { inlineData: { data: req.file!.buffer.toString('base64'), mimeType: req.file!.mimetype } },
          ],
          opts
        ),
      { label: 'transcribe', timeoutMs: 45_000 }
    );
    return res.json({ data: { transcript: result.response.text().trim() } });
  } catch {
    return res.status(500).json({
      error: { code: 'TRANSCRIPTION_ERROR', message: 'Transcription failed', retryable: true },
    });
  }
});

router.post('/vision', upload.single('image'), auth, async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'No image file provided', retryable: false },
    });
  }
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: visionResponseSchema,
      },
    });
    const result = await withGeminiRetry(
      (opts) =>
        model.generateContent(
          [
            'Extract all text from this image and provide a brief structural description.',
            { inlineData: { data: req.file!.buffer.toString('base64'), mimeType: req.file!.mimetype } },
          ],
          opts
        ),
      { label: 'vision', timeoutMs: 30_000 }
    );
    const parsed = JSON.parse(result.response.text());
    return res.json({ data: parsed });
  } catch {
    return res.status(500).json({
      error: { code: 'VISION_ERROR', message: 'Image analysis failed', retryable: true },
    });
  }
});

export default router;
