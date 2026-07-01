import { useLayoutEffect, useRef, useState } from 'react';
import type { PersonalNote } from '../types/index';
import './graph-node-preview.css';

interface GraphNodePreviewProps {
  note: PersonalNote | null;
  /** Anchor point in container-relative pixels (the rendered node position). */
  anchor: { x: number; y: number } | null;
  /** Container dimensions for edge-flipping. */
  bounds: { width: number; height: number };
}

const PREVIEW_CHAR_LIMIT = 220;
const OFFSET = 18;

/**
 * Floating preview panel rendered above the graph canvas. Mirrors Obsidian's
 * hover-preview: title, a body excerpt, and a small meta strip. Visibility is
 * controlled by the parent (it passes `note=null` to dismiss); fade timing
 * lives in CSS so this stays a pure presentational component.
 */
export function GraphNodePreview({ note, anchor, bounds }: GraphNodePreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<{ left: number; top: number }>({ left: -9999, top: -9999 });

  useLayoutEffect(() => {
    if (!note || !anchor || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    let left = anchor.x + OFFSET;
    let top = anchor.y + OFFSET;
    if (left + rect.width > bounds.width - 8) left = anchor.x - rect.width - OFFSET;
    if (top + rect.height > bounds.height - 8) top = anchor.y - rect.height - OFFSET;
    if (left < 8) left = 8;
    if (top < 8) top = 8;
    setPlacement({ left, top });
  }, [note, anchor, bounds.width, bounds.height]);

  if (!note || !anchor) return null;

  const excerpt = (note.body ?? '').trim().slice(0, PREVIEW_CHAR_LIMIT);
  const truncated = (note.body ?? '').length > PREVIEW_CHAR_LIMIT;

  return (
    <div
      ref={ref}
      className="graph-node-preview"
      style={{ left: placement.left, top: placement.top }}
      role="tooltip"
    >
      <div className="graph-node-preview__title">{note.title || 'Untitled'}</div>
      {excerpt ? (
        <div className="graph-node-preview__body">
          {excerpt}
          {truncated && <span className="graph-node-preview__ellipsis">…</span>}
        </div>
      ) : (
        <div className="graph-node-preview__body graph-node-preview__body--empty">
          Empty note
        </div>
      )}
      <div className="graph-node-preview__meta">
        {note.classification && (
          <span className="graph-node-preview__chip">{note.classification.replace('_', ' ')}</span>
        )}
        {note.extractedEntities.length > 0 && (
          <span className="graph-node-preview__chip">{note.extractedEntities.length} entities</span>
        )}
      </div>
    </div>
  );
}
