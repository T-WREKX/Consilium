import { useNavigate } from 'react-router-dom';
import { useNoteStore } from '../store/noteStore';
import type { NoteLink } from '../types/index';

interface Props {
  link: NoteLink;
  /** When true, clicking an unresolved chip creates a stub note named after `displayLabel`. */
  createOnClickIfUnresolved?: boolean;
  /** Optional id of the note the chip is rendered in (used for save-back after stub creation). */
  sourceNoteId?: string | null;
}

export function WikilinkChip({ link, createOnClickIfUnresolved = true, sourceNoteId = null }: Props) {
  const navigate = useNavigate();
  const { notes, saveNote, setActiveNote } = useNoteStore();

  // Resolve display label from current title at render time, fall back to original label
  const target = link.targetNoteId ? notes.find(n => n.id === link.targetNoteId && !n.deletedAt) : null;
  const label = target?.title?.trim() || link.displayLabel;
  const isResolved = !!target;

  async function handleClick() {
    if (isResolved && target) {
      setActiveNote(target.id);
      navigate('/capture');
      return;
    }
    if (!createOnClickIfUnresolved) return;
    // Create a stub note titled with the display label
    const stub = await saveNote({
      title: link.displayLabel,
      body: '',
      contentType: 'text',
      extractedEntities: [],
      classification: 'observation',
      isPrivileged: false,
      isPublished: false,
    });
    // Re-save the source note so its links[] re-resolves to the new stub
    if (sourceNoteId) {
      const src = useNoteStore.getState().notes.find(n => n.id === sourceNoteId);
      if (src) {
        await saveNote({
          title: src.title,
          body: src.body,
          contentType: src.contentType,
          extractedEntities: src.extractedEntities,
          classification: src.classification,
          isPrivileged: src.isPrivileged,
          isPublished: src.isPublished,
          folderId: src.folderId,
          organizeProvenance: src.organizeProvenance,
          dismissedEntityKeys: src.dismissedEntityKeys,
        }, src.id);
      }
    }
    setActiveNote(stub.id);
    navigate('/capture');
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`wikilink-chip ${isResolved ? 'wikilink-chip--resolved' : 'wikilink-chip--unresolved'}`}
      title={isResolved ? `Open: ${label}` : `Create note: ${label}`}
    >
      {label}
    </button>
  );
}
