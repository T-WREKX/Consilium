import { describe, it, expect, vi } from 'vitest';

// Mock the Gemini SDK before importing the service
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            entities: [
              { id: 'mock-uuid-1', type: 'judge', name: 'Judge Reyes', confidence: 0.97 },
            ],
            classification: 'observation',
            isPrivileged: false,
          }),
        },
      }),
    }),
  })),
  SchemaType: { OBJECT: 'object', ARRAY: 'array', STRING: 'string', NUMBER: 'number', BOOLEAN: 'boolean' },
}));

import { organizeNote } from '../../services/organize';

describe('organizeNote', () => {
  it('returns entities, classification, and isPrivileged', async () => {
    const result = await organizeNote('Judge Reyes ruled in our favor on the motion.');
    expect(result.entities).toHaveLength(1);
    expect(result.entities[0].type).toBe('judge');
    expect(result.entities[0].name).toBe('Judge Reyes');
    expect(result.classification).toBe('observation');
    expect(result.isPrivileged).toBe(false);
  });

  it('returns correct TypeScript shape', async () => {
    const result = await organizeNote('Content');
    expect(typeof result.isPrivileged).toBe('boolean');
    expect(Array.isArray(result.entities)).toBe(true);
  });
});
