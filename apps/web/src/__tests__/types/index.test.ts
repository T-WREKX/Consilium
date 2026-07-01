import { describe, it, expect } from 'vitest';
import type {
  PersonalNote, Entity, NoteClassification,
  OrganizeResponse, ApiResponse, ApiError,
} from '../../types/index';

describe('PersonalNote type', () => {
  it('accepts all required fields', () => {
    const note: PersonalNote = {
      id: 'abc-123',
      title: 'Test note',
      body: 'Body text',
      contentType: 'text',
      extractedEntities: [],
      classification: 'observation',
      isPrivileged: false,
      isPublished: false,
      createdAt: 1000,
      updatedAt: 1001,
    };
    expect(note.id).toBe('abc-123');
    expect(note.contentType).toBe('text');
  });

  it('accepts optional blob fields', () => {
    const note: PersonalNote = {
      id: 'abc-124',
      title: 'Audio note',
      body: 'transcript',
      contentType: 'audio',
      audioBlob: new Blob(['audio'], { type: 'audio/webm' }),
      audioTranscript: 'transcript text',
      extractedEntities: [],
      classification: 'meeting_summary',
      isPrivileged: false,
      isPublished: false,
      createdAt: 2000,
      updatedAt: 2001,
    };
    expect(note.contentType).toBe('audio');
    expect(note.audioBlob).toBeDefined();
  });
});

describe('ApiResponse type', () => {
  it('accepts data-only shape', () => {
    const res: ApiResponse<{ count: number }> = { data: { count: 3 } };
    expect(res.data?.count).toBe(3);
  });

  it('accepts error-only shape', () => {
    const err: ApiError = { code: '500', message: 'Server error', retryable: true };
    const res: ApiResponse<never> = { error: err };
    expect(res.error?.retryable).toBe(true);
  });
});
