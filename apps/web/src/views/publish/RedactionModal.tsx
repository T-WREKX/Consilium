// apps/web/src/views/publish/RedactionModal.tsx
import { useEffect, useMemo, useState } from 'react';
import { X, ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';
import type { PersonalNote, RedactResponse, RedactionItem } from '../../types/index';
import { useAuthStore } from '../../store/authStore';
import { redactContent, publishNote } from '../../api/publish';
import { PreservationScore } from './PreservationScore';
import { DiffPane } from './DiffPane';
import { showToast } from '../../components/Toast';
import './redaction-modal.css';

interface RedactionModalProps {
  note: PersonalNote;
  onClose: () => void;
  onPublished: (nodeId: string) => void;
}

function reasonFor(type: RedactionItem['type']): string {
  return type === 'PII'
    ? 'Personally identifying or client-confidential token replaced'
    : 'Specific fact generalized to legal-principle level';
}

function rebuildSanitized(
  original: string,
  redactions: RedactionItem[],
  rejected: Set<number>,
  fallback: string
): string {
  if (redactions.length === 0) return fallback;
  const sorted = redactions
    .map((r, idx) => ({ r, idx }))
    .sort((a, b) => a.r.position[0] - b.r.position[0]);

  let out = '';
  let cursor = 0;
  for (const { r, idx } of sorted) {
    const [start, end] = r.position;
    if (start < cursor) continue;
    out += original.slice(cursor, start);
    out += rejected.has(idx) ? r.original : r.replacement;
    cursor = end;
  }
  out += original.slice(cursor);
  return out;
}

export function RedactionModal({ note, onClose, onPublished }: RedactionModalProps) {
  const token = useAuthStore((s) => s.token);
  const [redactData, setRedactData] = useState<RedactResponse | null>(null);
  const [sanitizedText, setSanitizedText] = useState('');
  const [rejected, setRejected] = useState<Set<number>>(new Set());
  const [paneVersion, setPaneVersion] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displaySanitized = useMemo(() => {
    if (!redactData) return '';
    return rebuildSanitized(
      redactData.original,
      redactData.redactions,
      rejected,
      redactData.sanitized
    );
  }, [redactData, rejected]);

  const hasManualEdit = sanitizedText !== '' && sanitizedText !== displaySanitized;
  const hasRejections = rejected.size > 0;
  const canPublish = redactData
    ? redactData.confidence > 40 || hasManualEdit || hasRejections
    : false;

  // Load redaction on mount
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    redactContent(note.body, token).then((result) => {
      setLoading(false);
      if (result.error) {
        setError(result.error.message);
        return;
      }
      if (result.data) {
        setRedactData(result.data);
        setSanitizedText(result.data.sanitized);
      }
    });
  }, [note.body, token]);

  // When user rejects/un-rejects, force the editable pane to remount with rebuilt text
  useEffect(() => {
    if (!redactData) return;
    setSanitizedText(displaySanitized);
    setPaneVersion((v) => v + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rejected, redactData]);

  // Escape key to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function toggleReject(idx: number) {
    setRejected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  async function handlePublish() {
    if (!token || !canPublish) return;
    setPublishing(true);

    const result = await publishNote(
      {
        title: note.title,
        body: sanitizedText,
        nodeType: 'insight',
        sourcePersonalNoteId: note.id,
      },
      token
    );

    setPublishing(false);

    if (result.error) {
      showToast(result.error.message, 'error');
      return;
    }

    if (result.data) {
      showToast(`Published. Your colleagues can now see this.`, 'success');
      onPublished(result.data.nodeId);
      onClose();
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label="Publish to team graph">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Publish to team graph</h2>
            {redactData && !loading && (
              <PreservationScore score={redactData.confidence} />
            )}
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {loading && (
            <div className="modal-loading">Analyzing for redaction...</div>
          )}
          {error && (
            <div className="modal-error">
              {error}
              <button onClick={onClose}>Dismiss</button>
            </div>
          )}
          {redactData && !loading && (
            <>
              <DiffPane
                key={paneVersion}
                original={redactData.original}
                sanitized={displaySanitized}
                redactions={redactData.redactions}
                onSanitizedChange={setSanitizedText}
              />

              {/* Details disclosure — design §8.1 */}
              <div className="redaction-details">
                <button
                  type="button"
                  className="redaction-details-toggle"
                  onClick={() => setDetailsOpen((o) => !o)}
                  aria-expanded={detailsOpen}
                >
                  {detailsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  Details — {redactData.redactions.length} redaction
                  {redactData.redactions.length === 1 ? '' : 's'}
                </button>

                {detailsOpen && (
                  <ul className="redaction-list" role="list">
                    {redactData.redactions.map((r, idx) => {
                      const isRejected = rejected.has(idx);
                      return (
                        <li key={idx} className={`redaction-row${isRejected ? ' rejected' : ''}`}>
                          <span
                            className={`redaction-type-badge ${r.type === 'PII' ? 'pii' : 'gen'}`}
                          >
                            {r.type === 'PII' ? 'PII' : 'Generalized'}
                          </span>
                          <div className="redaction-row-body">
                            <div className="redaction-row-pair">
                              <code className="redaction-original">{r.original}</code>
                              <span className="redaction-arrow">→</span>
                              <code className="redaction-replacement">
                                {isRejected ? r.original : r.replacement}
                              </code>
                            </div>
                            <div className="redaction-reason">{reasonFor(r.type)}</div>
                          </div>
                          <button
                            type="button"
                            className="redaction-reject-btn"
                            onClick={() => toggleReject(idx)}
                            aria-pressed={isRejected}
                            title={isRejected ? 'Re-apply redaction' : 'Restore original text'}
                          >
                            <RotateCcw size={12} />
                            {isRejected ? 'Re-apply' : 'Restore'}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handlePublish}
            disabled={!canPublish || publishing}
          >
            {publishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
