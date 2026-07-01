/**
 * Personal-notes seed loader.
 *
 * On first run (empty IndexedDB note store) hydrates the litigator@acme.law
 * account with the corpus defined in ./personalNotes.seed.ts. Notes are
 * written with their pre-assigned IDs so wikilink targets resolve
 * deterministically and the personal graph renders the same way across reloads.
 *
 * Idempotent: any pre-existing note in the store (live or tombstoned) skips
 * the seed entirely.
 */

import { getAllNotes, putNote } from './idb';
import { SEED_PERSONAL_NOTES } from './personalNotes.seed';
import type { PersonalNote } from '../types/index';

export async function seedPersonalNotes(): Promise<void> {
  const existing = await getAllNotes({ includeDeleted: true });
  if (existing.length > 0) return;

  for (const seed of SEED_PERSONAL_NOTES) {
    const note: PersonalNote = {
      ...seed,
      updatedAt: seed.updatedAt ?? seed.createdAt,
    };
    await putNote(note);
  }
}
