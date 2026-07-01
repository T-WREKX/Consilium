// apps/api/src/services/redaction.ts
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { withGeminiRetry } from './gemini-retry';

dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const PRESIDIO_ANALYZER = process.env.PRESIDIO_ANALYZER_URL ?? 'http://localhost:5001';
const PRESIDIO_ANONYMIZER = process.env.PRESIDIO_ANONYMIZER_URL ?? 'http://localhost:5002';

const redactPrompt = fs.readFileSync(
  path.join(__dirname, '../prompts/redact.md'),
  'utf-8'
);
const preservePrompt = fs.readFileSync(
  path.join(__dirname, '../prompts/preserve.md'),
  'utf-8'
);

interface PresidioResult {
  entity_type: string;
  start: number;
  end: number;
  score: number;
}

export interface RedactionItem {
  original: string;
  replacement: string;
  type: 'PII' | 'GENERALIZATION';
  position: [number, number];
}

export interface RedactResult {
  original: string;
  sanitized: string;
  redactions: RedactionItem[];
  confidence: number;
}

// Pass 1: Presidio PII detection and tokenization
async function presidioRedact(text: string): Promise<{ tokenized: string; redactions: RedactionItem[] }> {
  try {
    const analyzeRes = await fetch(`${PRESIDIO_ANALYZER}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: 'en' }),
    });

    if (!analyzeRes.ok) throw new Error('Presidio analyzer failed');
    const analyzerResults: PresidioResult[] = await analyzeRes.json() as PresidioResult[];

    const anonymizeRes = await fetch(`${PRESIDIO_ANONYMIZER}/anonymize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        anonymizers: { DEFAULT: { type: 'replace', new_value: 'REDACTED' } },
        analyzer_results: analyzerResults,
      }),
    });

    if (!anonymizeRes.ok) throw new Error('Presidio anonymizer failed');
    const anonData = await anonymizeRes.json() as { text: string; items: Array<{ text: string; start: number; end: number; entity_type: string; operator: string }> };

    // Build redaction map from Presidio results
    const redactions: RedactionItem[] = analyzerResults.map((r) => ({
      original: text.slice(r.start, r.end),
      replacement: `[${r.entity_type}]`,
      type: 'PII' as const,
      position: [r.start, r.end] as [number, number],
    }));

    return { tokenized: anonData.text, redactions };
  } catch {
    // Fallback: regex-based PII scrub for demo resilience
    return regexFallback(text);
  }
}

function regexFallback(text: string): { tokenized: string; redactions: RedactionItem[] } {
  const patterns: Array<[RegExp, string]> = [
    [/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, 'PERSON'],
    [/\b[\w.-]+@[\w.-]+\.\w+\b/g, 'EMAIL'],
    [/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, 'PHONE'],
  ];

  const redactions: RedactionItem[] = [];
  let tokenized = text;

  for (const [pattern, label] of patterns) {
    tokenized = tokenized.replace(pattern, (match, offset) => {
      redactions.push({ original: match, replacement: `[${label}]`, type: 'PII', position: [offset, offset + match.length] });
      return `[${label}]`;
    });
  }

  return { tokenized, redactions };
}

// Pass 2: Gemini Pro generalization
async function geminiGeneralize(tokenizedText: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
  const result = await withGeminiRetry(
    (opts) =>
      model.generateContent(
        [{ text: redactPrompt }, { text: tokenizedText }],
        opts
      ),
    { label: 'redact.generalize', timeoutMs: 30_000 }
  );
  return result.response.text().trim();
}

// Preservation score: Gemini Flash
async function geminiPreservationScore(original: string, sanitized: string): Promise<number> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await withGeminiRetry(
    (opts) =>
      model.generateContent(
        [
          { text: preservePrompt },
          { text: `ORIGINAL:\n${original}\n\nSANITIZED:\n${sanitized}` },
        ],
        opts
      ),
    { label: 'redact.preserve', timeoutMs: 20_000 }
  );

  try {
    const parsed = JSON.parse(result.response.text().trim()) as { score: number };
    return Math.min(100, Math.max(0, parsed.score));
  } catch {
    return 50;
  }
}

export async function redactNote(content: string): Promise<RedactResult> {
  const { tokenized, redactions: piiRedactions } = await presidioRedact(content);
  const sanitized = await geminiGeneralize(tokenized);
  const confidence = await geminiPreservationScore(content, sanitized);

  return {
    original: content,
    sanitized,
    redactions: piiRedactions,
    confidence,
  };
}
