import type {
  Entity,
  NoteClassification,
  OrganizeProvenance,
  OrganizeResponse,
  PersonalNote,
} from '../types/index';

export interface MergeInput {
  current: Pick<PersonalNote,
    'extractedEntities' | 'classification' | 'isPrivileged' | 'organizeProvenance' | 'dismissedEntityKeys'
  >;
  ai: OrganizeResponse;
}

export interface MergeOutput {
  extractedEntities: Entity[];
  classification: NoteClassification;
  isPrivileged: boolean;
  organizeProvenance: OrganizeProvenance;
  suggestions: {
    classification?: NoteClassification;
    isPrivileged?: boolean;
  };
}

const DEFAULT_PROV: OrganizeProvenance = { entities: 'unset', classification: 'unset', privilege: 'unset' };

function entityKey(e: { type: string; name: string }): string {
  return `${e.type}:${e.name.trim().toLowerCase()}`;
}

/**
 * Merge AI's OrganizeResponse into the note's current organize fields.
 * - user-set fields are preserved; AI suggestion is returned in `suggestions` for inline hinting
 * - unset/ai fields are filled by AI (provenance flips to 'ai')
 * - entities are deduplicated by `${type}:${name}` (case-insensitive on name);
 *   user-added entities are preserved; AI entities the user previously dismissed do not reappear
 */
export function mergeOrganize(input: MergeInput): MergeOutput {
  const prov = { ...DEFAULT_PROV, ...(input.current.organizeProvenance ?? {}) };
  const dismissed = new Set(input.current.dismissedEntityKeys ?? []);

  // Entities: union, prefer existing instance on conflict, drop dismissed AI suggestions
  const byKey = new Map<string, Entity>();
  for (const e of input.current.extractedEntities) byKey.set(entityKey(e), e);
  for (const e of input.ai.entities) {
    const k = entityKey(e);
    if (dismissed.has(k)) continue;
    if (!byKey.has(k)) byKey.set(k, e);
  }
  const mergedEntities = Array.from(byKey.values());
  const entitiesProv: OrganizeProvenance['entities'] =
    prov.entities === 'user' ? 'user' : (input.ai.entities.length > 0 ? 'ai' : prov.entities);

  // Classification
  let classification = input.current.classification;
  let classSuggestion: NoteClassification | undefined;
  let classProv = prov.classification;
  if (prov.classification === 'user') {
    if (input.ai.classification !== input.current.classification) classSuggestion = input.ai.classification;
  } else {
    classification = input.ai.classification;
    classProv = 'ai';
  }

  // Privilege
  let isPrivileged = input.current.isPrivileged;
  let privSuggestion: boolean | undefined;
  let privProv = prov.privilege;
  if (prov.privilege === 'user') {
    if (input.ai.isPrivileged !== input.current.isPrivileged) privSuggestion = input.ai.isPrivileged;
  } else {
    isPrivileged = input.ai.isPrivileged;
    privProv = 'ai';
  }

  return {
    extractedEntities: mergedEntities,
    classification,
    isPrivileged,
    organizeProvenance: {
      entities: entitiesProv,
      classification: classProv,
      privilege: privProv,
    },
    suggestions: {
      classification: classSuggestion,
      isPrivileged: privSuggestion,
    },
  };
}
