import { create } from 'zustand';
import * as idb from '../lib/idb';
import { parseWikilinks, resolveWikilinks } from '../lib/wikilinks';
import { mergeOrganize } from '../lib/organizeMerge';
import { deleteTeamGraphNode } from '../api/teamGraph';
import { useAuthStore } from './authStore';
import type {
  PersonalNote,
  NoteFolder,
  OrganizeResponse,
  Entity,
  NoteClassification,
  OrganizeProvenance,
} from '../types/index';

/** Snapshot of the organize-relevant fields, used to revert AI changes. */
export interface OrganizeSnapshot {
  extractedEntities: Entity[];
  classification: NoteClassification;
  isPrivileged: boolean;
  organizeProvenance?: OrganizeProvenance;
  dismissedEntityKeys?: string[];
}

interface NoteState {
  notes: PersonalNote[];
  folders: NoteFolder[];
  activeNoteId: string | null;

  loadNotes: () => Promise<void>;
  loadFolders: () => Promise<void>;
  saveNote: (
    data: Omit<PersonalNote, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => Promise<PersonalNote>;
  deleteNote: (id: string) => Promise<{ unpublishedFromTeam: boolean; teamError?: string }>;
  setActiveNote: (id: string | null) => void;
  updateNoteOrganization: (id: string, result: OrganizeResponse) => Promise<void>;
  removeEntity: (noteId: string, entityId: string) => Promise<void>;
  markNotePublished: (noteId: string, publishedNodeId: string) => Promise<void>;
  setEntities: (noteId: string, entities: Entity[], provenance: 'user' | 'ai') => Promise<void>;
  setClassification: (noteId: string, value: NoteClassification, provenance: 'user' | 'ai') => Promise<void>;
  setPrivilege: (noteId: string, value: boolean, provenance: 'user' | 'ai') => Promise<void>;
  dismissEntity: (noteId: string, entityId: string) => Promise<void>;
  applyAiOrganize: (
    noteId: string,
    response: OrganizeResponse
  ) => Promise<{ suggestions: { classification?: NoteClassification; isPrivileged?: boolean } }>;
  restoreOrganizeSnapshot: (noteId: string, snapshot: OrganizeSnapshot) => Promise<void>;
  createFolder: (name: string) => Promise<NoteFolder>;
  deleteFolder: (id: string) => Promise<void>;
  moveNoteToFolder: (noteId: string, folderId: string | null) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  folders: [],
  activeNoteId: null,

  loadNotes: async () => {
    const notes = await idb.getAllNotes();
    set({ notes });
  },

  loadFolders: async () => {
    const folders = await idb.getAllFolders();
    set({ folders });
  },

  saveNote: async (data, existingId) => {
    // Resolve [[wikilinks]] in body against the current corpus
    const tokens = parseWikilinks(data.body);
    const { links } = resolveWikilinks(tokens, get().notes, existingId ?? null);
    // Keep only resolved links; unresolved are re-derived from body on render
    const resolvedLinks = links.filter(l => l.targetNoteId);
    const dataWithLinks = { ...data, links: resolvedLinks };

    if (existingId) {
      const updated = await idb.updateNote(existingId, dataWithLinks);
      set(state => ({
        notes: state.notes.map(n => (n.id === existingId ? updated : n)),
      }));
      return updated;
    }
    const note = await idb.createNote(dataWithLinks);
    set(state => ({ notes: [note, ...state.notes] }));
    return note;
  },

  deleteNote: async (id) => {
    const note = get().notes.find(n => n.id === id);

    // If the note was published, delete the team-graph node too. If that fails,
    // surface the error to the caller but still continue with local deletion so
    // the user isn't stuck with a stale row in their sidebar.
    let unpublishedFromTeam = false;
    let teamError: string | undefined;
    if (note?.isPublished && note.publishedNodeId) {
      const token = useAuthStore.getState().token;
      if (token) {
        const result = await deleteTeamGraphNode(note.publishedNodeId, token);
        if (result.error) {
          teamError = result.error.message;
        } else {
          unpublishedFromTeam = true;
        }
      } else {
        teamError = 'Not signed in — could not remove from team graph';
      }
    }

    await idb.deleteNote(id);
    set(state => ({
      notes: state.notes.filter(n => n.id !== id),
      activeNoteId: state.activeNoteId === id ? null : state.activeNoteId,
    }));
    return { unpublishedFromTeam, teamError };
  },

  setActiveNote: (id) => set({ activeNoteId: id }),

  updateNoteOrganization: async (id, result) => {
    const updated = await idb.updateNote(id, {
      extractedEntities: result.entities,
      classification: result.classification,
      isPrivileged: result.isPrivileged,
    });
    set(state => ({
      notes: state.notes.map(n => (n.id === id ? updated : n)),
    }));
    for (const entity of result.entities) {
      await idb.saveEntity(entity);
    }
  },

  removeEntity: async (noteId, entityId) => {
    const note = get().notes.find(n => n.id === noteId);
    if (!note) return;
    const nextEntities = note.extractedEntities.filter(e => e.id !== entityId);
    const updated = await idb.updateNote(noteId, { extractedEntities: nextEntities });
    set(state => ({
      notes: state.notes.map(n => (n.id === noteId ? updated : n)),
    }));
  },

  markNotePublished: async (noteId, publishedNodeId) => {
    const updated = await idb.updateNote(noteId, { isPublished: true, publishedNodeId });
    set(state => ({
      notes: state.notes.map(n => (n.id === noteId ? updated : n)),
    }));
  },

  setEntities: async (noteId, entities, provenance) => {
    const note = get().notes.find(n => n.id === noteId);
    if (!note) return;
    const nextProv = {
      ...(note.organizeProvenance ?? { entities: 'unset' as const, classification: 'unset' as const, privilege: 'unset' as const }),
      entities: provenance,
    };
    const updated = await idb.updateNote(noteId, {
      extractedEntities: entities,
      organizeProvenance: nextProv,
    });
    set(state => ({ notes: state.notes.map(n => (n.id === noteId ? updated : n)) }));
    for (const e of entities) await idb.saveEntity(e);
  },

  setClassification: async (noteId, value, provenance) => {
    const note = get().notes.find(n => n.id === noteId);
    if (!note) return;
    const nextProv = {
      ...(note.organizeProvenance ?? { entities: 'unset' as const, classification: 'unset' as const, privilege: 'unset' as const }),
      classification: provenance,
    };
    const updated = await idb.updateNote(noteId, {
      classification: value,
      organizeProvenance: nextProv,
    });
    set(state => ({ notes: state.notes.map(n => (n.id === noteId ? updated : n)) }));
  },

  setPrivilege: async (noteId, value, provenance) => {
    const note = get().notes.find(n => n.id === noteId);
    if (!note) return;
    const nextProv = {
      ...(note.organizeProvenance ?? { entities: 'unset' as const, classification: 'unset' as const, privilege: 'unset' as const }),
      privilege: provenance,
    };
    const updated = await idb.updateNote(noteId, {
      isPrivileged: value,
      organizeProvenance: nextProv,
    });
    set(state => ({ notes: state.notes.map(n => (n.id === noteId ? updated : n)) }));
  },

  dismissEntity: async (noteId, entityId) => {
    const note = get().notes.find(n => n.id === noteId);
    if (!note) return;
    const target = note.extractedEntities.find(e => e.id === entityId);
    const dismissedKeys = new Set(note.dismissedEntityKeys ?? []);
    if (target) dismissedKeys.add(`${target.type}:${target.name.trim().toLowerCase()}`);
    const nextEntities = note.extractedEntities.filter(e => e.id !== entityId);
    const updated = await idb.updateNote(noteId, {
      extractedEntities: nextEntities,
      dismissedEntityKeys: Array.from(dismissedKeys),
    });
    set(state => ({ notes: state.notes.map(n => (n.id === noteId ? updated : n)) }));
  },

  applyAiOrganize: async (noteId, response) => {
    const note = get().notes.find(n => n.id === noteId);
    if (!note) return { suggestions: {} };
    const result = mergeOrganize({
      current: {
        extractedEntities: note.extractedEntities,
        classification: note.classification,
        isPrivileged: note.isPrivileged,
        organizeProvenance: note.organizeProvenance,
        dismissedEntityKeys: note.dismissedEntityKeys,
      },
      ai: response,
    });
    const updated = await idb.updateNote(noteId, {
      extractedEntities: result.extractedEntities,
      classification: result.classification,
      isPrivileged: result.isPrivileged,
      organizeProvenance: result.organizeProvenance,
    });
    set(state => ({ notes: state.notes.map(n => (n.id === noteId ? updated : n)) }));
    for (const e of result.extractedEntities) await idb.saveEntity(e);
    return { suggestions: result.suggestions };
  },

  /** Atomically restore the snapshot of pre-Gemini state. Used by the
      "Revert" button to undo everything an organize call introduced. */
  restoreOrganizeSnapshot: async (noteId, snapshot) => {
    const updated = await idb.updateNote(noteId, {
      extractedEntities: snapshot.extractedEntities,
      classification: snapshot.classification,
      isPrivileged: snapshot.isPrivileged,
      organizeProvenance: snapshot.organizeProvenance,
      dismissedEntityKeys: snapshot.dismissedEntityKeys,
    });
    set(state => ({ notes: state.notes.map(n => (n.id === noteId ? updated : n)) }));
  },

  createFolder: async (name) => {
    const folder = await idb.createFolder(name);
    set(state => ({ folders: [...state.folders, folder] }));
    return folder;
  },

  deleteFolder: async (id) => {
    await idb.deleteFolder(id);
    // Unfile all notes in this folder
    const notesInFolder = get().notes.filter(n => n.folderId === id);
    for (const note of notesInFolder) {
      await idb.updateNote(note.id, { folderId: undefined });
    }
    set(state => ({
      folders: state.folders.filter(f => f.id !== id),
      notes: state.notes.map(n => n.folderId === id ? { ...n, folderId: undefined } : n),
    }));
  },

  moveNoteToFolder: async (noteId, folderId) => {
    const updated = await idb.updateNote(noteId, { folderId: folderId ?? undefined });
    set(state => ({
      notes: state.notes.map(n => (n.id === noteId ? updated : n)),
    }));
  },
}));
