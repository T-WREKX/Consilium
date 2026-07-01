// apps/web/src/views/publish/DiffPane.tsx
import React, { useRef, useState } from 'react';
import type { RedactionItem } from '../../types/index';
import './publish.css';

interface DiffPaneProps {
  original: string;
  sanitized: string;
  redactions: RedactionItem[];
  onSanitizedChange: (text: string) => void;
}

function applyHighlights(text: string, redactions: RedactionItem[], hoveredIdx: number | null) {
  if (redactions.length === 0) return [<span key="all">{text}</span>];

  const segments: React.ReactNode[] = [];
  let cursor = 0;

  const sorted = [...redactions].sort((a, b) => a.position[0] - b.position[0]);

  for (let i = 0; i < sorted.length; i++) {
    const { position, type } = sorted[i];
    const [start, end] = position;

    if (start > cursor) {
      segments.push(<span key={`t${i}`}>{text.slice(cursor, start)}</span>);
    }

    const isHovered = hoveredIdx === i;
    segments.push(
      <mark
        key={`r${i}`}
        className={`redaction-highlight${type === 'GENERALIZATION' ? ' generalization' : ''}${isHovered ? ' hovered' : ''}`}
        title={`${type}: original was "${text.slice(start, end)}"`}
      >
        {text.slice(start, end)}
      </mark>
    );

    cursor = end;
  }

  if (cursor < text.length) {
    segments.push(<span key="tail">{text.slice(cursor)}</span>);
  }

  return segments;
}

export function DiffPane({ original, sanitized, redactions, onSanitizedChange }: DiffPaneProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const editableRef = useRef<HTMLDivElement>(null);

  function handleInput() {
    if (editableRef.current) {
      onSanitizedChange(editableRef.current.innerText);
    }
  }

  return (
    <div className="diff-panes">
      {/* Original pane */}
      <div className="diff-pane-wrapper">
        <div className="diff-pane-header">Original</div>
        <div className="diff-pane">
          {applyHighlights(original, redactions, hoveredIdx)}
        </div>
      </div>

      {/* Sanitized pane — editable */}
      <div className="diff-pane-wrapper">
        <div className="diff-pane-header">To be published</div>
        <div
          ref={editableRef}
          className="diff-pane diff-pane-editable"
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          aria-label="Editable sanitized content"
          data-edited={editableRef.current?.innerText !== sanitized ? 'true' : undefined}
        >
          {sanitized}
        </div>
      </div>
    </div>
  );
}
