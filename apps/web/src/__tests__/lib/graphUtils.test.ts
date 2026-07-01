import { describe, it, expect } from 'vitest';
import { notesToCytoscapeElements } from '../../lib/graphUtils';
import type { PersonalNote } from '../../types/index';

const baseNote = (overrides: Partial<PersonalNote> = {}): PersonalNote => ({
  id: 'note-1',
  title: 'Test Note',
  body: 'body',
  contentType: 'text',
  extractedEntities: [],
  classification: 'observation',
  isPrivileged: false,
  isPublished: false,
  createdAt: 1000,
  updatedAt: 1001,
  ...overrides,
});

describe('notesToCytoscapeElements', () => {
  it('returns empty array for no notes', () => {
    expect(notesToCytoscapeElements([])).toEqual([]);
  });

  it('creates one node per note', () => {
    const elements = notesToCytoscapeElements([baseNote({ id: 'n1' }), baseNote({ id: 'n2' })]);
    const nodes = elements.filter(e => 'data' in e && !('source' in (e as { data: { source?: string } }).data));
    const noteNodes = nodes.filter(n => (n as { data: { noteId?: string } }).data.noteId);
    expect(noteNodes).toHaveLength(2);
  });

  it('creates entity nodes and edges for note with entities', () => {
    const note = baseNote({
      id: 'n1',
      extractedEntities: [
        { id: 'e1', type: 'judge', name: 'Judge Reyes', confidence: 0.98 },
      ],
    });
    const elements = notesToCytoscapeElements([note]);
    const entityNode = elements.find(
      e => (e as { data: { label?: string } }).data.label === 'Judge Reyes'
    );
    const edge = elements.find(
      e => 'source' in (e as { data: { source?: string } }).data
    );
    expect(entityNode).toBeDefined();
    expect(edge).toBeDefined();
  });

  it('deduplicates entity nodes across notes', () => {
    const sharedEntity = { id: 'e1', type: 'judge' as const, name: 'Judge Reyes', confidence: 0.95 };
    const n1 = baseNote({ id: 'n1', extractedEntities: [sharedEntity] });
    const n2 = baseNote({ id: 'n2', extractedEntities: [sharedEntity] });
    const elements = notesToCytoscapeElements([n1, n2]);
    const judgeNodes = elements.filter(
      e => (e as { data: { label?: string } }).data.label === 'Judge Reyes'
    );
    expect(judgeNodes).toHaveLength(1);
  });

  it('assigns color based on node type from design-guidelines §2.5', () => {
    const note = baseNote({
      id: 'n1',
      extractedEntities: [{ id: 'e1', type: 'party', name: 'Acme Corp', confidence: 0.9 }],
    });
    const elements = notesToCytoscapeElements([note]);
    const partyNode = elements.find(
      e => (e as { data: { label?: string } }).data.label === 'Acme Corp'
    ) as { data: { color: string } };
    expect(partyNode?.data.color).toBe('#ef476f');
  });
});
