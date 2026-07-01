import { describe, it, expect, beforeEach } from 'vitest';
// fake-indexeddb is imported via vitest setup file (fake-indexeddb/auto)
import {
  createNote, getNote, getAllNotes, updateNote, deleteNote,
  saveEntity, getAllEntities, _resetDB,
} from '../../lib/idb';
import type { Entity } from '../../types/index';

describe('idb — notes store', () => {
  beforeEach(() => { _resetDB(); });

  it('createNote generates an id and timestamps', async () => {
    const note = await createNote({
      title: 'Test',
      body: 'Hello',
      contentType: 'text',
      extractedEntities: [],
      classification: 'observation',
      isPrivileged: false,
      isPublished: false,
    });
    expect(note.id).toBeTruthy();
    expect(typeof note.id).toBe('string');
    expect(note.createdAt).toBeGreaterThan(0);
    expect(note.updatedAt).toBeGreaterThan(0);
  });

  it('getNote retrieves by id', async () => {
    const created = await createNote({
      title: 'Retrieval test',
      body: 'body',
      contentType: 'text',
      extractedEntities: [],
      classification: 'research',
      isPrivileged: false,
      isPublished: false,
    });
    const found = await getNote(created.id);
    expect(found?.title).toBe('Retrieval test');
  });

  it('getNote returns undefined for missing id', async () => {
    const result = await getNote('does-not-exist');
    expect(result).toBeUndefined();
  });

  it('getAllNotes returns all created notes', async () => {
    await createNote({ title: 'A', body: '', contentType: 'text', extractedEntities: [], classification: 'observation', isPrivileged: false, isPublished: false });
    await createNote({ title: 'B', body: '', contentType: 'text', extractedEntities: [], classification: 'observation', isPrivileged: false, isPublished: false });
    const all = await getAllNotes();
    const titles = all.map(n => n.title);
    expect(titles).toContain('A');
    expect(titles).toContain('B');
  });

  it('updateNote patches fields and bumps updatedAt', async () => {
    const note = await createNote({
      title: 'Before',
      body: 'original',
      contentType: 'text',
      extractedEntities: [],
      classification: 'observation',
      isPrivileged: false,
      isPublished: false,
    });
    const originalUpdatedAt = note.updatedAt;
    await new Promise(r => setTimeout(r, 5));
    const updated = await updateNote(note.id, { title: 'After' });
    expect(updated.title).toBe('After');
    expect(updated.body).toBe('original');
    expect(updated.updatedAt).toBeGreaterThan(originalUpdatedAt);
  });

  it('updateNote throws when note does not exist', async () => {
    await expect(updateNote('non-existent-id', { title: 'X' })).rejects.toThrow('Note non-existent-id not found');
  });

  it('deleteNote removes the note', async () => {
    const note = await createNote({ title: 'Delete me', body: '', contentType: 'text', extractedEntities: [], classification: 'observation', isPrivileged: false, isPublished: false });
    await deleteNote(note.id);
    const result = await getNote(note.id);
    expect(result).toBeUndefined();
  });
});

describe('idb — entities store', () => {
  beforeEach(() => { _resetDB(); });

  it('saveEntity and getAllEntities round-trip', async () => {
    const entity: Entity = { id: 'ent-1', type: 'judge', name: 'Judge Reyes', confidence: 0.98 };
    await saveEntity(entity);
    const all = await getAllEntities();
    expect(all.find(e => e.id === 'ent-1')?.name).toBe('Judge Reyes');
  });
});
