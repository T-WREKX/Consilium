import { describe, it, expect, beforeEach } from 'vitest';
// fake-indexeddb polyfills IndexedDB via vitest setup file
import { _resetDB } from '../../lib/idb';
import { useNoteStore } from '../../store/noteStore';
import type { OrganizeResponse } from '../../types/index';

beforeEach(() => {
  _resetDB();
  // Reset Zustand store state between tests
  useNoteStore.setState({ notes: [], activeNoteId: null });
});

const baseData = {
  title: 'Test note',
  body: 'body content',
  contentType: 'text' as const,
  extractedEntities: [],
  classification: 'observation' as const,
  isPrivileged: false,
  isPublished: false,
};

describe('noteStore', () => {
  it('saveNote creates a note and adds it to state', async () => {
    const { saveNote } = useNoteStore.getState();
    const note = await saveNote(baseData);
    expect(note.id).toBeTruthy();
    expect(useNoteStore.getState().notes).toHaveLength(1);
    expect(useNoteStore.getState().notes[0].title).toBe('Test note');
  });

  it('saveNote with existingId updates in place', async () => {
    const { saveNote } = useNoteStore.getState();
    const created = await saveNote(baseData);
    const updated = await saveNote({ ...baseData, title: 'Updated title' }, created.id);
    expect(updated.title).toBe('Updated title');
    expect(useNoteStore.getState().notes).toHaveLength(1);
  });

  it('setActiveNote updates activeNoteId', () => {
    useNoteStore.getState().setActiveNote('abc-123');
    expect(useNoteStore.getState().activeNoteId).toBe('abc-123');
  });

  it('updateNoteOrganization patches entities and classification', async () => {
    const { saveNote, updateNoteOrganization } = useNoteStore.getState();
    const note = await saveNote(baseData);
    const result: OrganizeResponse = {
      entities: [{ id: 'e1', type: 'judge', name: 'Judge Reyes', confidence: 0.98 }],
      classification: 'strategy',
      isPrivileged: true,
    };
    await updateNoteOrganization(note.id, result);
    const updated = useNoteStore.getState().notes.find(n => n.id === note.id);
    expect(updated?.extractedEntities).toHaveLength(1);
    expect(updated?.classification).toBe('strategy');
    expect(updated?.isPrivileged).toBe(true);
  });

  it('loadNotes populates state from IndexedDB', async () => {
    const { saveNote, loadNotes } = useNoteStore.getState();
    await saveNote(baseData);
    useNoteStore.setState({ notes: [] }); // simulate page reload
    await loadNotes();
    expect(useNoteStore.getState().notes.length).toBeGreaterThan(0);
  });
});
