import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('../../services/organize', () => ({
  organizeNote: vi.fn().mockResolvedValue({
    entities: [],
    classification: 'observation',
    isPrivileged: false,
  }),
}));

// Mock OpenAI and Gemini SDKs
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    audio: {
      transcriptions: {
        create: vi.fn().mockResolvedValue({ text: 'Transcribed text' }),
      },
    },
  })),
}));

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: { text: () => JSON.stringify({ text: 'Extracted', description: 'A document' }) },
      }),
    }),
  })),
}));

import captureRouter from '../../routes/capture';

const app = express();
app.use(express.json());
app.use('/api', captureRouter);

describe('POST /api/organize', () => {
  it('returns 400 when content is missing', async () => {
    const res = await request(app).post('/api/organize').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns organize result on valid content', async () => {
    const res = await request(app)
      .post('/api/organize')
      .send({ content: 'Judge Reyes ruled favorably on our motion in limine.' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('classification');
    expect(res.body.data).toHaveProperty('isPrivileged');
  });
});
