import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';
import { readFileSync } from 'fs';
import { join } from 'path';
import { withGeminiRetry } from './gemini-retry';

export interface OrganizeResult {
  entities: Array<{
    id: string;
    type: 'matter' | 'party' | 'lawyer' | 'judge' | 'witness' | 'concept' | 'precedent' | 'statute';
    name: string;
    confidence: number;
  }>;
  classification:
    | 'strategy'
    | 'observation'
    | 'lesson_learned'
    | 'action_item'
    | 'research'
    | 'meeting_summary';
  isPrivileged: boolean;
}

const systemPrompt = readFileSync(
  join(__dirname, '../prompts/organize.md'),
  'utf-8'
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const responseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    entities: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          type: { type: SchemaType.STRING },
          name: { type: SchemaType.STRING },
          confidence: { type: SchemaType.NUMBER },
        },
        required: ['id', 'type', 'name', 'confidence'],
      },
    },
    classification: { type: SchemaType.STRING },
    isPrivileged: { type: SchemaType.BOOLEAN },
  },
  required: ['entities', 'classification', 'isPrivileged'],
};

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-pro',
  systemInstruction: systemPrompt,
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema,
  },
});

export async function organizeNote(content: string): Promise<OrganizeResult> {
  const result = await withGeminiRetry(
    (opts) => model.generateContent(content, opts),
    { label: 'organize', timeoutMs: 30_000 }
  );
  const text = result.response.text();
  try {
    return JSON.parse(text) as OrganizeResult;
  } catch {
    throw new Error(`Gemini returned non-JSON response: ${text.slice(0, 100)}`);
  }
}
