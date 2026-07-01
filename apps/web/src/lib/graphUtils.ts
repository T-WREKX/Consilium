// Node colors from design-guidelines.md §2.5 — do not change without updating the spec
import type { PersonalNote } from '../types/index';
import { parseWikilinks, resolveWikilinks } from './wikilinks';

export const NODE_COLORS: Record<string, string> = {
  insight: '#9d4edd',   // personal notes are "insights" — purple
  matter: '#06d6a0',
  party: '#ef476f',
  lawyer: '#118ab2',
  judge: '#073b4c',
  witness: '#ffd60a',
  concept: '#8338ec',
  precedent: '#3a86ff',
  statute: '#d62828',
  // Phase 2: Classification hub node colors (muted variants to not overpower data nodes)
  classification: '#484f58',
};

// Classification label display names — used by Phase 2 hub-node labels.
const CLASSIFICATION_LABELS: Record<string, string> = {
  strategy: 'Strategy',
  observation: 'Observation',
  lesson_learned: 'Lesson Learned',
  action_item: 'Action Item',
  research: 'Research',
  meeting_summary: 'Meeting Summary',
};

export const EDGE_COLOR_DEFAULT = '#30363d';
export const EDGE_COLOR_HOVER = '#7d8590';

export interface CytoscapeNodeData {
  id: string;
  label: string;
  type: string;
  color: string;
  noteId?: string;
  isHub?: boolean; // Phase 2: classification hub nodes are rendered larger
  isGhost?: boolean; // unresolved [[wikilink]] — placeholder for a note that doesn't exist yet
  ghostLabel?: string; // raw wikilink label, used to prefill title on click
}

export interface CytoscapeEdgeData {
  id: string;
  source: string;
  target: string;
  edgeType?: string;
}

export type CytoscapeElement =
  | { data: CytoscapeNodeData }
  | { data: CytoscapeEdgeData };

/**
 * Convert personal notes into Cytoscape elements with Obsidian-style connections:
 *   - Note (insight) nodes
 *   - Entity nodes (deduped by type:name)
 *   - Note → Entity edges (mentions)
 *   - Phase 1: Note ↔ Note edges (shared entities — 2+ shared = related_to)
 *   - Phase 2: Classification hub nodes + edges (about)
 *   - Phase 4: Entity ↔ Entity edges (co-occurrence — 2+ notes = related_to)
 */
export function notesToCytoscapeElements(notes: PersonalNote[]): CytoscapeElement[] {
  const elements: CytoscapeElement[] = [];
  const seenEntities = new Set<string>(); // "type:name" dedup key
  const classificationNotes = new Map<string, string[]>(); // classification → noteIds[]

  // Track which entities each note mentions for Phase 1 + 4 derived edges.
  const noteEntities = new Map<string, Set<string>>(); // noteId → Set<entityNodeId>
  const entityNotes = new Map<string, Set<string>>();   // entityNodeId → Set<noteId>

  // Pass 1: Create note and entity nodes + mention edges
  for (const note of notes) {
    elements.push({
      data: {
        id: note.id,
        label: note.title || 'Untitled',
        type: 'insight',
        color: NODE_COLORS['insight'],
        noteId: note.id,
      },
    });

    const cls = note.classification;
    if (cls) {
      if (!classificationNotes.has(cls)) classificationNotes.set(cls, []);
      classificationNotes.get(cls)!.push(note.id);
    }

    const entityIds = new Set<string>();

    for (const entity of note.extractedEntities) {
      const dedupeKey = `${entity.type}:${entity.name}`;
      const entityNodeId = `entity-${dedupeKey}`;

      entityIds.add(entityNodeId);

      if (!entityNotes.has(entityNodeId)) entityNotes.set(entityNodeId, new Set());
      entityNotes.get(entityNodeId)!.add(note.id);

      if (!seenEntities.has(dedupeKey)) {
        seenEntities.add(dedupeKey);
        elements.push({
          data: {
            id: entityNodeId,
            label: entity.name,
            type: entity.type,
            color: NODE_COLORS[entity.type] ?? '#7d8590',
          },
        });
      }

      elements.push({
        data: {
          id: `edge-${note.id}-${entityNodeId}`,
          source: note.id,
          target: entityNodeId,
          edgeType: 'mentions',
        },
      });
    }

    noteEntities.set(note.id, entityIds);
  }

  // Phase 1 (derived): Note↔Note `related_to` for insights sharing 2+ entities.
  // Per vault/concepts/derived-edges.md — these surface latent topical clusters
  // and render at low opacity so they're "structural scaffolding."
  const noteIds = notes.map(n => n.id);
  const addedRelatedEdges = new Set<string>();

  for (let i = 0; i < noteIds.length; i++) {
    for (let j = i + 1; j < noteIds.length; j++) {
      const a = noteIds[i];
      const b = noteIds[j];
      const entitiesA = noteEntities.get(a) ?? new Set();
      const entitiesB = noteEntities.get(b) ?? new Set();
      let shared = 0;
      for (const e of entitiesA) if (entitiesB.has(e)) shared++;
      if (shared >= 2) {
        const edgeKey = `${a}-${b}`;
        if (!addedRelatedEdges.has(edgeKey)) {
          addedRelatedEdges.add(edgeKey);
          elements.push({
            data: {
              id: `related-${a}-${b}`,
              source: a,
              target: b,
              edgeType: 'related_to',
            },
          });
        }
      }
    }
  }

  // Phase 1b: Author-stated [[wikilink]] edges (visually distinct from inferred related_to)
  for (const note of notes) {
    for (const link of note.links ?? []) {
      if (!link.targetNoteId) continue;
      elements.push({
        data: {
          id: `linked-${note.id}-${link.targetNoteId}`,
          source: note.id,
          target: link.targetNoteId,
          edgeType: 'linked_to',
        },
      });
    }
  }

  // Phase 1c: Ghost nodes for unresolved [[wikilinks]]. The store strips
  // unresolved links from note.links at save time, so we re-parse each body
  // here and emit one shared ghost node per unique label (case-insensitive).
  // Lets users see "notes that should exist" alongside ones that do.
  const ghostIdByKey = new Map<string, string>();
  const addedGhostEdges = new Set<string>();
  for (const note of notes) {
    if (!note.body) continue;
    const tokens = parseWikilinks(note.body);
    if (tokens.length === 0) continue;
    const { links } = resolveWikilinks(tokens, notes, note.id);
    for (const link of links) {
      if (link.targetNoteId) continue;
      const labelKey = link.displayLabel.trim().toLowerCase();
      if (!labelKey) continue;
      let ghostId = ghostIdByKey.get(labelKey);
      if (!ghostId) {
        ghostId = `ghost-${labelKey.replace(/[^a-z0-9]+/g, '-')}`;
        ghostIdByKey.set(labelKey, ghostId);
        elements.push({
          data: {
            id: ghostId,
            label: link.displayLabel,
            type: 'ghost',
            color: '#9d4edd',
            isGhost: true,
            ghostLabel: link.displayLabel,
          },
        });
      }
      const edgeKey = `${note.id}-${ghostId}`;
      if (addedGhostEdges.has(edgeKey)) continue;
      addedGhostEdges.add(edgeKey);
      elements.push({
        data: {
          id: `linked-ghost-${note.id}-${ghostId}`,
          source: note.id,
          target: ghostId,
          edgeType: 'linked_to_ghost',
        },
      });
    }
  }

  // Phase 2 (derived): Classification hub nodes + about edges.
  // Per vault/concepts/derived-edges.md — synthetic hub per classification
  // value, rendered as muted diamonds at very low opacity so they read as
  // structural scaffolding, not content.
  for (const [cls, noteIdList] of classificationNotes.entries()) {
    if (noteIdList.length < 1) continue;
    const hubId = `hub-${cls}`;
    elements.push({
      data: {
        id: hubId,
        label: CLASSIFICATION_LABELS[cls] ?? cls,
        type: 'classification',
        color: NODE_COLORS['classification'],
        isHub: true,
      },
    });
    for (const nId of noteIdList) {
      elements.push({
        data: {
          id: `edge-${nId}-${hubId}`,
          source: nId,
          target: hubId,
          edgeType: 'about',
        },
      });
    }
  }

  // Phase 4 (derived): Entity↔Entity co-occurrence — two entities appearing
  // together in ≥2 insights. Renders as `related_to` at the same low-opacity
  // tier as Phase 1.
  const entityIdList = Array.from(entityNotes.keys());
  for (let i = 0; i < entityIdList.length; i++) {
    for (let j = i + 1; j < entityIdList.length; j++) {
      const eA = entityIdList[i];
      const eB = entityIdList[j];
      const notesA = entityNotes.get(eA)!;
      const notesB = entityNotes.get(eB)!;
      let cooccurrences = 0;
      for (const n of notesA) if (notesB.has(n)) cooccurrences++;
      if (cooccurrences >= 2) {
        elements.push({
          data: {
            id: `cooccur-${eA}-${eB}`,
            source: eA,
            target: eB,
            edgeType: 'related_to',
          },
        });
      }
    }
  }

  return elements;
}
