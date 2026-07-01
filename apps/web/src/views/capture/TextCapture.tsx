import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNoteStore, type OrganizeSnapshot } from '../../store/noteStore';
import { useAuthStore } from '../../store/authStore';
import { organizeNote } from '../../api/client';
import { OrganizePanel } from './OrganizePanel';
import { NotePreview } from './NotePreview';
import { BacklinksPanel } from './BacklinksPanel';
import { LocalGraphView } from '../graph/LocalGraphView';
import type { NoteClassification } from '../../types/index';

const ORGANIZE_MIN_CHARS = 20;
const SAVE_DEBOUNCE_MS = 400;
const PANEL_COLLAPSED_KEY = 'organize-panel-collapsed';

export default function TextCapture() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [organizeError, setOrganizeError] = useState<string | null>(null);
  const [lastOrganizedAt, setLastOrganizedAt] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<{
    classification?: NoteClassification;
    isPrivileged?: boolean;
  }>({});
  // Snapshot of organize-relevant state captured right before the most recent
  // Gemini call. Presence of a snapshot enables the Revert button; clearing it
  // (on note switch, on revert, or on a successful new organize after revert)
  // removes the Revert affordance.
  const [preOrganizeSnapshot, setPreOrganizeSnapshot] = useState<OrganizeSnapshot | null>(null);
  const [panelCollapsed, setPanelCollapsed] = useState<boolean>(
    () => localStorage.getItem(PANEL_COLLAPSED_KEY) === '1'
  );

  const {
    saveNote, setActiveNote, applyAiOrganize, restoreOrganizeSnapshot,
    setClassification, setPrivilege, notes, activeNoteId,
  } = useNoteStore();
  const token = useAuthStore(s => s.token);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteIdRef = useRef<string | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const activeNote = notes.find(n => n.id === activeNoteId) ?? null;

  // Pre-fill the title when arriving via a ghost-node click (graph view
  // → unresolved [[wikilink]] → create note). Clear the router state so a
  // refresh doesn't re-trigger the prefill.
  useEffect(() => {
    const state = location.state as { prefillTitle?: string } | null;
    if (state?.prefillTitle && !activeNoteId) {
      setTitle(state.prefillTitle);
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (activeNoteId && activeNote) {
      setTitle(activeNote.title);
      setBody(activeNote.body);
      noteIdRef.current = activeNote.id;
    } else {
      setTitle('');
      setBody('');
      noteIdRef.current = null;
    }
    setSuggestions({});
    setOrganizeError(null);
    setPreOrganizeSnapshot(null);
    setLastOrganizedAt(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNoteId]);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  function togglePanel() {
    setPanelCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(PANEL_COLLAPSED_KEY, next ? '1' : '0');
      return next;
    });
  }

  async function persist(currentTitle: string, currentBody: string) {
    const data = {
      title: currentTitle,
      body: currentBody,
      contentType: 'text' as const,
      extractedEntities: activeNote?.extractedEntities ?? [],
      classification: (activeNote?.classification ?? 'observation') as NoteClassification,
      isPrivileged: activeNote?.isPrivileged ?? false,
      isPublished: activeNote?.isPublished ?? false,
      folderId: activeNote?.folderId,
      organizeProvenance: activeNote?.organizeProvenance,
      dismissedEntityKeys: activeNote?.dismissedEntityKeys,
    };
    const note = await saveNote(data, noteIdRef.current ?? undefined);
    if (!noteIdRef.current) {
      noteIdRef.current = note.id;
      setActiveNote(note.id);
    }
  }

  function scheduleSave(currentTitle: string, currentBody: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => persist(currentTitle, currentBody), SAVE_DEBOUNCE_MS);
  }

  async function handleOrganize() {
    if (!noteIdRef.current) await persist(title, body);
    const id = noteIdRef.current;
    if (!id) return;
    if (body.trim().length < ORGANIZE_MIN_CHARS) return;
    // Snapshot the organize-relevant fields *before* mutating, so Revert can
    // restore exactly this state. Read from the current note in store (which
    // may differ from `activeNote` closure if a save just landed).
    const current = useNoteStore.getState().notes.find(n => n.id === id);
    const snapshot: OrganizeSnapshot | null = current
      ? {
          extractedEntities: current.extractedEntities,
          classification: current.classification,
          isPrivileged: current.isPrivileged,
          organizeProvenance: current.organizeProvenance,
          dismissedEntityKeys: current.dismissedEntityKeys,
        }
      : null;
    setIsOrganizing(true);
    setOrganizeError(null);
    const resp = await organizeNote(body, token ?? '');
    setIsOrganizing(false);
    if (resp.error) {
      setOrganizeError(resp.error.message);
      return;
    }
    if (resp.data) {
      const { suggestions: s } = await applyAiOrganize(id, resp.data);
      setSuggestions(s);
      setLastOrganizedAt(Date.now());
      setPreOrganizeSnapshot(snapshot);
    }
  }

  async function handleRevert() {
    const id = noteIdRef.current;
    if (!id || !preOrganizeSnapshot) return;
    await restoreOrganizeSnapshot(id, preOrganizeSnapshot);
    setPreOrganizeSnapshot(null);
    setSuggestions({});
    setLastOrganizedAt(null);
    setOrganizeError(null);
  }

  function insertLinkLabel(label: string) {
    const el = bodyRef.current;
    const insertion = `[[${label}]]`;
    if (!el) {
      const next = `${body}${body && !body.endsWith(' ') ? ' ' : ''}${insertion}`;
      setBody(next);
      scheduleSave(title, next);
      return;
    }
    const start = el.selectionStart ?? body.length;
    const end = el.selectionEnd ?? body.length;
    const next = body.slice(0, start) + insertion + body.slice(end);
    setBody(next);
    scheduleSave(title, next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + insertion.length;
      el.setSelectionRange(pos, pos);
    });
  }

  async function acceptClassificationSuggestion() {
    if (!activeNote || !suggestions.classification) return;
    await setClassification(activeNote.id, suggestions.classification, 'user');
    setSuggestions(s => ({ ...s, classification: undefined }));
  }
  function dismissClassificationSuggestion() {
    setSuggestions(s => ({ ...s, classification: undefined }));
  }
  async function acceptPrivilegeSuggestion() {
    if (!activeNote || suggestions.isPrivileged === undefined) return;
    await setPrivilege(activeNote.id, suggestions.isPrivileged, 'user');
    setSuggestions(s => ({ ...s, isPrivileged: undefined }));
  }
  function dismissPrivilegeSuggestion() {
    setSuggestions(s => ({ ...s, isPrivileged: undefined }));
  }

  return (
    <div className="capture-layout">
      <div className="capture-main">
        <div className="editor-container">
          <input
            autoFocus
            type="text"
            placeholder="Note title"
            value={title}
            onChange={e => {
              setTitle(e.target.value);
              scheduleSave(e.target.value, body);
            }}
            className="editor-title"
          />

          <textarea
            ref={bodyRef}
            placeholder="Start writing — use [[Note Title]] to link to other notes."
            value={body}
            onChange={e => {
              setBody(e.target.value);
              scheduleSave(title, e.target.value);
            }}
            className="editor-body"
          />

          <h4 className="preview-heading">Preview</h4>
          <NotePreview body={body} sourceNoteId={activeNote?.id ?? null} />

          <BacklinksPanel activeNoteId={activeNote?.id ?? null} />

          <LocalGraphView focusNoteId={activeNote?.id ?? null} />
        </div>
      </div>

      <OrganizePanel
        note={activeNote}
        body={body}
        collapsed={panelCollapsed}
        onToggleCollapsed={togglePanel}
        onOrganize={handleOrganize}
        isOrganizing={isOrganizing}
        organizeError={organizeError}
        lastOrganizedAt={lastOrganizedAt}
        suggestions={suggestions}
        canRevert={!!preOrganizeSnapshot}
        onRevert={handleRevert}
        onAcceptClassificationSuggestion={acceptClassificationSuggestion}
        onDismissClassificationSuggestion={dismissClassificationSuggestion}
        onAcceptPrivilegeSuggestion={acceptPrivilegeSuggestion}
        onDismissPrivilegeSuggestion={dismissPrivilegeSuggestion}
        onInsertLinkLabel={insertLinkLabel}
      />
    </div>
  );
}
