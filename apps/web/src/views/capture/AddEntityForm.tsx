import { useState } from 'react';
import type { Entity } from '../../types/index';

const TYPES: Entity['type'][] = [
  'matter',
  'party',
  'lawyer',
  'judge',
  'witness',
  'concept',
  'precedent',
  'statute',
];

interface Props {
  onAdd: (entity: Entity) => void;
  onCancel: () => void;
}

export function AddEntityForm({ onAdd, onCancel }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<Entity['type']>('matter');

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd({ id: crypto.randomUUID(), type, name: trimmed, confidence: 1 });
    setName('');
  }

  return (
    <div className="add-entity-form">
      <input
        autoFocus
        type="text"
        value={name}
        placeholder="Entity name"
        onChange={e => setName(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); submit(); }
          if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
        }}
        className="add-entity-form__name"
      />
      <select
        value={type}
        onChange={e => setType(e.target.value as Entity['type'])}
        className="add-entity-form__type"
      >
        {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <button type="button" onClick={submit} className="btn btn--small">Add</button>
      <button type="button" onClick={onCancel} className="btn btn--small btn--ghost">Cancel</button>
    </div>
  );
}
