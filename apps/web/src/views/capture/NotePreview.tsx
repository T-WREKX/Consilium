import { useMemo } from 'react';
import { useNoteStore } from '../../store/noteStore';
import { parseWikilinks, resolveWikilinks } from '../../lib/wikilinks';
import { WikilinkChip } from '../../components/WikilinkChip';

interface Props {
  body: string;
  sourceNoteId: string | null;
}

type Segment =
  | { kind: 'text'; text: string }
  | { kind: 'link'; link: import('../../types/index').NoteLink };

export function NotePreview({ body, sourceNoteId }: Props) {
  const notes = useNoteStore(s => s.notes);

  const segments = useMemo<Segment[]>(() => {
    const tokens = parseWikilinks(body);
    if (tokens.length === 0) return [{ kind: 'text', text: body }];
    const { links } = resolveWikilinks(tokens, notes, sourceNoteId);
    const out: Segment[] = [];
    let cursor = 0;
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      if (!link.position) continue;
      const [start, end] = link.position;
      if (start > cursor) out.push({ kind: 'text', text: body.slice(cursor, start) });
      out.push({ kind: 'link', link });
      cursor = end;
    }
    if (cursor < body.length) out.push({ kind: 'text', text: body.slice(cursor) });
    return out;
  }, [body, notes, sourceNoteId]);

  if (!body.trim()) {
    return <div className="note-preview note-preview--empty">Preview appears here once you start typing.</div>;
  }

  return (
    <div className="note-preview">
      {segments.map((seg, i) =>
        seg.kind === 'text'
          ? <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{seg.text}</span>
          : <WikilinkChip key={i} link={seg.link} sourceNoteId={sourceNoteId} />
      )}
    </div>
  );
}
