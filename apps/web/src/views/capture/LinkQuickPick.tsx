import { useMemo, useState } from 'react';
import { useNoteStore } from '../../store/noteStore';

interface Props {
  onPick: (label: string) => void;
  onCancel: () => void;
}

export function LinkQuickPick({ onPick, onCancel }: Props) {
  const notes = useNoteStore(s => s.notes);
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const live = notes.filter(n => !n.deletedAt);
    if (!q) return live.slice(0, 8);
    return live.filter(n => n.title.toLowerCase().includes(q)).slice(0, 8);
  }, [notes, query]);

  return (
    <div className="link-quickpick">
      <input
        autoFocus
        type="text"
        value={query}
        placeholder="Search notes or type a new title..."
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); onPick(query.trim() || (matches[0]?.title ?? '')); }
          if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
        }}
        className="link-quickpick__input"
      />
      <ul className="link-quickpick__list">
        {matches.map(n => (
          <li key={n.id}>
            <button type="button" className="link-quickpick__item" onClick={() => onPick(n.title)}>
              {n.title || '(untitled)'}
            </button>
          </li>
        ))}
        {query && !matches.some(n => n.title.toLowerCase() === query.toLowerCase()) && (
          <li>
            <button type="button" className="link-quickpick__item link-quickpick__item--new" onClick={() => onPick(query)}>
              + Create new note &ldquo;{query}&rdquo;
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
