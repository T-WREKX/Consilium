import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNoteStore } from '../../store/noteStore';

const CONTEXT_CHARS = 75;

interface Props {
  activeNoteId: string | null;
}

export function BacklinksPanel({ activeNoteId }: Props) {
  const { notes, setActiveNote } = useNoteStore();
  const navigate = useNavigate();

  const backlinks = useMemo(() => {
    if (!activeNoteId) return [];
    return notes
      .filter(
        n =>
          !n.deletedAt &&
          n.id !== activeNoteId &&
          (n.links ?? []).some(l => l.targetNoteId === activeNoteId)
      )
      .map(n => {
        const link = (n.links ?? []).find(l => l.targetNoteId === activeNoteId);
        let snippet = n.body;
        if (link?.position) {
          const [start] = link.position;
          const from = Math.max(0, start - CONTEXT_CHARS);
          const to = Math.min(n.body.length, start + CONTEXT_CHARS);
          snippet =
            (from > 0 ? '…' : '') + n.body.slice(from, to) + (to < n.body.length ? '…' : '');
        }
        return { id: n.id, title: n.title || 'Untitled', snippet };
      });
  }, [notes, activeNoteId]);

  if (!activeNoteId) return null;
  if (backlinks.length === 0) {
    return (
      <section className="backlinks-panel backlinks-panel--empty">
        <h3 className="backlinks-panel__title">Backlinks</h3>
        <p>No other notes link to this one yet.</p>
      </section>
    );
  }

  return (
    <section className="backlinks-panel">
      <h3 className="backlinks-panel__title">Backlinks ({backlinks.length})</h3>
      <ul className="backlinks-list">
        {backlinks.map(b => (
          <li key={b.id}>
            <button
              type="button"
              className="backlink-card"
              onClick={() => {
                setActiveNote(b.id);
                navigate('/capture');
              }}
            >
              <span className="backlink-card__title">{b.title}</span>
              <span className="backlink-card__snippet">{b.snippet}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
