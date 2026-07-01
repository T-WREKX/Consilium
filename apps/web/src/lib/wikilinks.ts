import type { PersonalNote, NoteLink } from '../types/index';

export interface WikilinkToken {
  rawLabel: string;
  position: [number, number]; // [start, end] in source body
}

/**
 * Find all [[Title]] tokens in a body. Matches non-empty labels.
 * Does NOT support nested brackets, aliases (|), or section anchors (#) — MVP scope.
 */
export function parseWikilinks(body: string): WikilinkToken[] {
  const tokens: WikilinkToken[] = [];
  const re = /\[\[([^\[\]\n]+?)\]\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const label = m[1].trim();
    if (!label) continue;
    tokens.push({ rawLabel: label, position: [m.index, m.index + m[0].length] });
  }
  return tokens;
}

export interface ResolveResult {
  links: NoteLink[];
  ambiguous: string[]; // labels with multiple title matches
}

/**
 * Resolve parsed wikilink tokens against the corpus.
 * - Case-insensitive exact title match
 * - Excludes soft-deleted notes and self-references (sourceNoteId)
 * - Multiple matches → pick most recently updated, record in `ambiguous`
 */
export function resolveWikilinks(
  tokens: WikilinkToken[],
  notes: PersonalNote[],
  sourceNoteId: string | null = null
): ResolveResult {
  const live = notes.filter(n => !n.deletedAt && n.id !== sourceNoteId);
  const byTitle = new Map<string, PersonalNote[]>();
  for (const n of live) {
    const k = n.title.trim().toLowerCase();
    if (!k) continue;
    const arr = byTitle.get(k);
    if (arr) arr.push(n); else byTitle.set(k, [n]);
  }

  const links: NoteLink[] = [];
  const ambiguous: string[] = [];

  for (const tok of tokens) {
    const key = tok.rawLabel.toLowerCase();
    const matches = byTitle.get(key);
    if (!matches || matches.length === 0) {
      links.push({ targetNoteId: '', displayLabel: tok.rawLabel, position: tok.position });
      continue;
    }
    if (matches.length > 1) ambiguous.push(tok.rawLabel);
    const winner = matches.reduce((a, b) => (a.updatedAt >= b.updatedAt ? a : b));
    links.push({ targetNoteId: winner.id, displayLabel: tok.rawLabel, position: tok.position });
  }

  return { links, ambiguous };
}
