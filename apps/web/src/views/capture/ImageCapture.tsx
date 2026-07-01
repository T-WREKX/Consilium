import { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { analyzeImage, organizeNote } from '../../api/client';
import { useNoteStore } from '../../store/noteStore';
import { useAuthStore } from '../../store/authStore';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024;

type ImageState = 'idle' | 'analyzing' | 'editing';

export default function ImageCapture() {
  const [state, setState] = useState<ImageState>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [organizeError, setOrganizeError] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { saveNote, updateNoteOrganization } = useNoteStore();
  const token = useAuthStore((s) => s.token);

  // Fix 1A + Fix 2: Revoke object URL when preview changes or on unmount
  useEffect(() => {
    const url = preview;
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [preview]);

  function handleFile(f: File) {
    // Fix 7: Guard against processing a new file while not idle
    if (state !== 'idle') return;
    setError(null);
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError('Only PNG, JPG, and WebP files are accepted.');
      return;
    }
    if (f.size > MAX_BYTES) {
      setError('File must be under 10MB.');
      return;
    }
    fileRef.current = f;
    setPreview(URL.createObjectURL(f));
    runAnalysis(f);
  }

  async function runAnalysis(f: File) {
    setState('analyzing');
    const response = await analyzeImage(f, token ?? '');
    // Fix 3: Stale request guard — bail if a newer upload has taken over
    if (fileRef.current !== f) return;
    // Fix 4: Replace unsafe non-null assertion with data check
    if (!response.data) {
      setError('Image analysis failed. Try again.');
      setState('idle');
      return;
    }
    setText(response.data.text);
    setState('editing');
  }

  async function handleSave() {
    if (!fileRef.current) return;
    const note = await saveNote({
      // Fix 8: Fallback title for dotfiles / extension-only names
      title: fileRef.current.name.replace(/\.[^.]+$/, '') || 'Untitled image',
      body: text,
      contentType: 'image',
      imageBlob: fileRef.current,
      extractedEntities: [],
      // Fix 5: Remove unnecessary type cast
      classification: 'observation',
      isPrivileged: false,
      isPublished: false,
    });
    if (text.trim().length > 20) {
      setOrganizeError(null);
      const response = await organizeNote(text, token ?? '');
      if (response.data) {
        await updateNoteOrganization(note.id, response.data);
      } else if (response.error) {
        setOrganizeError(response.error.message);
      }
    }
    reset();
  }

  function reset() {
    setState('idle');
    fileRef.current = null;
    setPreview(null);
    setText('');
    setError(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  return (
    <div className="editor-container">
      {state === 'idle' && (
        // Fix 6: Keyboard accessibility for drop zone
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
          role="button"
          tabIndex={0}
          aria-label="Upload image"
          className="drop-zone"
        >
          {/* Fix 9: Derive accept attribute from ACCEPTED_TYPES */}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <div className="drop-zone-icon">
            <Upload size={22} />
          </div>
          <span className="drop-zone-title">
            Drop an image or click to upload
          </span>
          <span className="drop-zone-subtitle">
            PNG, JPG, WebP — max 10MB
          </span>
        </div>
      )}

      {state === 'analyzing' && (
        <div className="audio-idle">
          {preview && (
            <img src={preview} alt="Uploaded" className="image-preview" />
          )}
          <span className="spinner" style={{ width: 24, height: 24 }} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-secondary)' }}>
            Analyzing image...
          </span>
        </div>
      )}

      {state === 'editing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {preview && (
            <img src={preview} alt="Uploaded" className="image-preview image-preview--small" style={{ alignSelf: 'flex-start' }} />
          )}
          <label style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: 'var(--text-muted)' }}>
            Extracted text — edit before saving
          </label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            className="transcript-editor"
            style={{ minHeight: 200 }}
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleSave} className="btn btn--primary">
              Save note
            </button>
            <button onClick={reset} className="btn btn--secondary">
              Discard
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="error-inline" style={{ marginTop: 16 }}>
          <span className="error-inline-text">{error}</span>
          {/* Fix 1C: Call reset() directly instead of inline mutation */}
          <button onClick={reset} className="btn btn--danger-text">Dismiss</button>
        </div>
      )}

      {organizeError && (
        <div className="error-inline" style={{ marginTop: 12 }}>
          <span className="error-inline-text">Organization failed</span>
          <button onClick={() => setOrganizeError(null)} className="btn btn--danger-text">Dismiss</button>
        </div>
      )}
    </div>
  );
}
