import { openDB, type IDBPDatabase } from 'idb';
import type { PersonalNote, NoteFolder, Entity } from '../types/index';

const DB_NAME = 'consilium-personal';
const DB_VERSION = 2;

type ConsiliumDB = {
  notes: { key: string; value: PersonalNote };
  entities: { key: string; value: Entity };
  personalGraph: { key: string; value: { id: string; data: unknown } };
  folders: { key: string; value: NoteFolder };
};

let dbPromise: Promise<IDBPDatabase<ConsiliumDB>> | null = null;

function getDB(): Promise<IDBPDatabase<ConsiliumDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ConsiliumDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('notes')) {
          db.createObjectStore('notes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('entities')) {
          db.createObjectStore('entities', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('personalGraph')) {
          db.createObjectStore('personalGraph', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('folders')) {
          db.createObjectStore('folders', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function createNote(
  data: Omit<PersonalNote, 'id' | 'createdAt' | 'updatedAt'>
): Promise<PersonalNote> {
  const db = await getDB();
  const note: PersonalNote = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.put('notes', note);
  return note;
}

/**
 * Write a fully-formed PersonalNote (with caller-supplied id and timestamps)
 * straight into the notes store. Used by the personal-notes seed so wikilink
 * targets resolve to deterministic IDs across reloads.
 */
export async function putNote(note: PersonalNote): Promise<void> {
  const db = await getDB();
  await db.put('notes', note);
}

export async function getNote(id: string): Promise<PersonalNote | undefined> {
  const db = await getDB();
  return db.get('notes', id);
}

export async function getAllNotes(options: { includeDeleted?: boolean } = {}): Promise<PersonalNote[]> {
  const db = await getDB();
  const all = await db.getAll('notes');
  if (options.includeDeleted) return all;
  return all.filter(n => !n.deletedAt);
}

export async function updateNote(
  id: string,
  updates: Partial<Omit<PersonalNote, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<PersonalNote> {
  const db = await getDB();
  const existing = await db.get('notes', id);
  if (!existing) throw new Error(`Note ${id} not found`);
  const updated: PersonalNote = { ...existing, ...updates, id, updatedAt: Date.now() };
  await db.put('notes', updated);
  return updated;
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDB();
  const existing = await db.get('notes', id);
  if (!existing) return;
  const tombstoned: PersonalNote = { ...existing, deletedAt: Date.now() };
  await db.put('notes', tombstoned);
}

/** Hard-delete a note (used by future trash UI). Not exposed to the store. */
export async function hardDeleteNote(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('notes', id);
}

export async function saveEntity(entity: Entity): Promise<void> {
  const db = await getDB();
  await db.put('entities', entity);
}

export async function getAllEntities(): Promise<Entity[]> {
  const db = await getDB();
  return db.getAll('entities');
}

// ─── Folders ─────────────────────────────────────────────────────────────────

export async function createFolder(name: string): Promise<NoteFolder> {
  const db = await getDB();
  const folder: NoteFolder = {
    id: crypto.randomUUID(),
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.put('folders', folder);
  return folder;
}

export async function getAllFolders(): Promise<NoteFolder[]> {
  const db = await getDB();
  return db.getAll('folders');
}

export async function updateFolder(id: string, updates: Partial<Pick<NoteFolder, 'name'>>): Promise<NoteFolder> {
  const db = await getDB();
  const existing = await db.get('folders', id);
  if (!existing) throw new Error(`Folder ${id} not found`);
  const updated: NoteFolder = { ...existing, ...updates, updatedAt: Date.now() };
  await db.put('folders', updated);
  return updated;
}

export async function deleteFolder(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('folders', id);
}

// ─── Graph positions ────────────────────────────────────────────────────────
// Persist node positions for the personal graph so the layout looks the same
// on every reload. Stored as a single record under personalGraph[positions]
// to avoid a DB version bump; payload is { [nodeId]: { x, y } }.

const POSITIONS_KEY = 'positions';

export type GraphPositions = Record<string, { x: number; y: number }>;

export async function getGraphPositions(): Promise<GraphPositions> {
  const db = await getDB();
  const record = await db.get('personalGraph', POSITIONS_KEY);
  if (!record) return {};
  return (record.data as GraphPositions) ?? {};
}

export async function saveGraphPositions(positions: GraphPositions): Promise<void> {
  const db = await getDB();
  await db.put('personalGraph', { id: POSITIONS_KEY, data: positions });
}

/** Resets the DB connection for test isolation. */
export function _resetDB(): void {
  dbPromise = null;
}
