import { useState } from 'react';
import { Sparkles, Plus, Link2, X, Undo2 } from 'lucide-react';
import { GeminiIcon } from '../../components/GeminiIcon';
import type { Entity, NoteClassification, PersonalNote } from '../../types/index';
import { useNoteStore } from '../../store/noteStore';
import { AddEntityForm } from './AddEntityForm';
import { LinkQuickPick } from './LinkQuickPick';
import { WikilinkChip } from '../../components/WikilinkChip';

const ENTITY_COLORS: Record<string, string> = {
  matter: '#06d6a0',
  party: '#ef476f',
  lawyer: '#118ab2',
  judge: '#073b4c',
  witness: '#ffd60a',
  concept: '#8338ec',
  precedent: '#3a86ff',
  statute: '#d62828',
};

const CLASSIFICATIONS: { value: NoteClassification; label: string }[] = [
  { value: 'strategy', label: 'Strategy' },
  { value: 'observation', label: 'Observation' },
  { value: 'lesson_learned', label: 'Lesson Learned' },
  { value: 'action_item', label: 'Action Item' },
  { value: 'research', label: 'Research' },
  { value: 'meeting_summary', label: 'Meeting Summary' },
];

interface Props {
  note: PersonalNote | null;
  body: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onOrganize: () => Promise<void>;
  isOrganizing: boolean;
  organizeError: string | null;
  lastOrganizedAt: number | null;
  suggestions: { classification?: NoteClassification; isPrivileged?: boolean };
  canRevert: boolean;
  onRevert: () => void;
  onAcceptClassificationSuggestion: () => void;
  onDismissClassificationSuggestion: () => void;
  onAcceptPrivilegeSuggestion: () => void;
  onDismissPrivilegeSuggestion: () => void;
  onInsertLinkLabel: (label: string) => void;
}

export function OrganizePanel(props: Props) {
  const {
    note, body, collapsed, onToggleCollapsed,
    onOrganize, isOrganizing, organizeError, lastOrganizedAt, suggestions,
    canRevert, onRevert,
    onAcceptClassificationSuggestion, onDismissClassificationSuggestion,
    onAcceptPrivilegeSuggestion, onDismissPrivilegeSuggestion,
    onInsertLinkLabel,
  } = props;
  const { setEntities, setClassification, setPrivilege, dismissEntity } = useNoteStore();
  const [addingEntity, setAddingEntity] = useState(false);
  const [pickingLink, setPickingLink] = useState(false);

  if (collapsed) {
    return (
      <aside className="organize-panel organize-panel--collapsed">
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="organize-panel__expand"
          aria-label="Expand organize panel"
        >
          <Sparkles size={16} />
        </button>
      </aside>
    );
  }

  const disabled = !note || body.trim().length < 20 || isOrganizing;
  const entities = note?.extractedEntities ?? [];
  const provenance = note?.organizeProvenance;
  const canOrganize = body.trim().length >= 20 && note;

  async function handleAddEntity(e: Entity) {
    if (!note) return;
    await setEntities(note.id, [...entities, e], 'user');
    setAddingEntity(false);
  }

  return (
    <aside className="organize-panel">
      <header className="organize-panel__header">
        <h3 className="organize-panel__title">Organize</h3>
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="organize-panel__collapse"
          aria-label="Collapse organize panel"
        >
          <X size={14} />
        </button>
      </header>

      <section className="organize-section">
        <h4 className="organize-section__title">Entities</h4>
        <div className="entity-chips">
          {entities.map(entity => (
            <span key={entity.id} className="entity-chip">
              <span
                className="entity-chip-dot"
                style={{ backgroundColor: ENTITY_COLORS[entity.type] ?? 'var(--text-muted)' }}
              />
              <span className="entity-chip-name">{entity.name}</span>
              <span className="entity-chip-type">[{entity.type}]</span>
              <button
                type="button"
                aria-label={`Remove entity ${entity.name}`}
                className="entity-chip-remove"
                onClick={() => note && dismissEntity(note.id, entity.id)}
              >
                ×
              </button>
            </span>
          ))}
          {entities.length === 0 && !addingEntity && (
            <div className="organize-empty">No entities yet — add manually or use Gemini below.</div>
          )}
        </div>
        {addingEntity ? (
          <AddEntityForm onAdd={handleAddEntity} onCancel={() => setAddingEntity(false)} />
        ) : (
          <button
            type="button"
            className="organize-add-btn"
            onClick={() => setAddingEntity(true)}
            disabled={!note}
          >
            <Plus size={12} /> Add entity
          </button>
        )}
      </section>

      <section className="organize-section">
        <h4 className="organize-section__title">Classification</h4>
        <select
          value={note?.classification ?? 'observation'}
          disabled={!note}
          onChange={e => note && setClassification(note.id, e.target.value as NoteClassification, 'user')}
          className="organize-select"
        >
          {CLASSIFICATIONS.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        {provenance?.classification === 'ai' && <span className="organize-hint">ai-suggested</span>}
        {suggestions.classification && (
          <div className="organize-suggestion">
            Suggested: {CLASSIFICATIONS.find(c => c.value === suggestions.classification)?.label}
            <button type="button" className="btn btn--small" onClick={onAcceptClassificationSuggestion}>Accept</button>
            <button type="button" className="btn btn--small btn--ghost" onClick={onDismissClassificationSuggestion}>Dismiss</button>
          </div>
        )}
      </section>

      <section className="organize-section">
        <h4 className="organize-section__title">Privilege</h4>
        <label className="organize-checkbox">
          <input
            type="checkbox"
            disabled={!note}
            checked={note?.isPrivileged ?? false}
            onChange={e => note && setPrivilege(note.id, e.target.checked, 'user')}
          />
          Attorney-client privileged
        </label>
        {provenance?.privilege === 'ai' && <span className="organize-hint">ai-suggested</span>}
        {suggestions.isPrivileged !== undefined && (
          <div className="organize-suggestion">
            Suggested: {suggestions.isPrivileged ? 'Privileged' : 'Not privileged'}
            <button type="button" className="btn btn--small" onClick={onAcceptPrivilegeSuggestion}>Accept</button>
            <button type="button" className="btn btn--small btn--ghost" onClick={onDismissPrivilegeSuggestion}>Dismiss</button>
          </div>
        )}
      </section>

      <section className="organize-section">
        <h4 className="organize-section__title">Links</h4>
        <div className="organize-links">
          {(note?.links ?? []).map((link, i) => (
            <div key={`${link.targetNoteId}-${i}`} className="organize-link-row">
              <Link2 size={12} />
              <WikilinkChip link={link} sourceNoteId={note?.id ?? null} />
            </div>
          ))}
          {(!note?.links || note.links.length === 0) && (
            <div className="organize-empty">No links yet — type [[Title]] in the body or add one below.</div>
          )}
        </div>
        {pickingLink ? (
          <LinkQuickPick
            onPick={label => {
              if (label) onInsertLinkLabel(label);
              setPickingLink(false);
            }}
            onCancel={() => setPickingLink(false)}
          />
        ) : (
          <button
            type="button"
            className="organize-add-btn"
            onClick={() => setPickingLink(true)}
            disabled={!note}
          >
            <Plus size={12} /> Add link
          </button>
        )}
      </section>

      <div className="organize-panel__footer">
        {canRevert && !isOrganizing ? (
          <button
            type="button"
            className="btn btn--primary organize-action organize-action--revert"
            onClick={onRevert}
          >
            <Undo2 size={16} />
            Revert
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--primary organize-action"
            disabled={disabled}
            onClick={onOrganize}
          >
            <GeminiIcon size={16} />
            {isOrganizing ? 'Organizing…' : 'Organize with Gemini'}
          </button>
        )}
        {organizeError && <div className="organize-error">{organizeError}</div>}
        {!organizeError && lastOrganizedAt && (
          <div className="organize-meta">Last organized: {timeAgo(lastOrganizedAt)}</div>
        )}
        {!canOrganize && !isOrganizing && !canRevert && (
          <div className="organize-meta">Write at least 20 characters to enable.</div>
        )}
      </div>
    </aside>
  );
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
