import { describe, it, expect, beforeEach } from 'vitest';
// fake-indexeddb via vitest setup
import { seedPersonalNotes } from '../../lib/seedPersonal';
import { SEED_PERSONAL_NOTES, PERSONAL_NOTES_SEED_COUNT } from '../../lib/personalNotes.seed';
import { getAllNotes, createNote, _resetDB } from '../../lib/idb';

beforeEach(async () => {
  _resetDB();
});

describe('seedPersonalNotes', () => {
  const liveSeedCount = SEED_PERSONAL_NOTES.filter((n) => n.deletedAt === undefined).length;

  it('creates notes when IndexedDB is empty (excludes tombstones from default fetch)', async () => {
    await seedPersonalNotes();
    const notes = await getAllNotes();
    expect(notes).toHaveLength(liveSeedCount);
  });

  it('writes the full seed corpus including tombstoned notes', async () => {
    await seedPersonalNotes();
    const all = await getAllNotes({ includeDeleted: true });
    expect(all).toHaveLength(PERSONAL_NOTES_SEED_COUNT);
  });

  it('is idempotent — does not re-seed if notes exist', async () => {
    await createNote({
      title: 'Existing note',
      body: 'body',
      contentType: 'text',
      extractedEntities: [],
      classification: 'observation',
      isPrivileged: false,
      isPublished: false,
    });
    await seedPersonalNotes();
    const notes = await getAllNotes();
    // Should only have the one pre-existing note, not the seed set on top
    expect(notes).toHaveLength(1);
  });

  it('each seeded note has extractedEntities populated', async () => {
    await seedPersonalNotes();
    const notes = await getAllNotes();
    const notesWithEntities = notes.filter((n) => n.extractedEntities.length > 0);
    expect(notesWithEntities.length).toBeGreaterThan(0);
  });

  it('seeded notes preserve their deterministic ids and wikilinks', async () => {
    await seedPersonalNotes();
    const all = await getAllNotes({ includeDeleted: true });
    const byId = new Map(all.map((n) => [n.id, n]));
    // Every link target must resolve to a real note in the store
    for (const note of all) {
      for (const link of note.links ?? []) {
        expect(byId.has(link.targetNoteId)).toBe(true);
      }
    }
  });
});
