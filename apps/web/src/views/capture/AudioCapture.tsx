import { useEffect, useRef, useState } from 'react';
import { Mic } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import { startRecording, formatDuration, MAX_RECORDING_DURATION, type Recording } from '../../lib/audio';
import { transcribeAudio, organizeNote } from '../../api/client';
import { useNoteStore } from '../../store/noteStore';
import { useAuthStore } from '../../store/authStore';

type AudioState = 'idle' | 'recording' | 'transcribing' | 'editing';

export default function AudioCapture() {
  const [state, setState] = useState<AudioState>('idle');
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recordingRef = useRef<Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const waveContainerRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<Blob | null>(null);
  const [organizeError, setOrganizeError] = useState<string | null>(null);
  const { saveNote, updateNoteOrganization } = useNoteStore();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (state !== 'recording' || !waveContainerRef.current) return;
    wavesurferRef.current = WaveSurfer.create({
      container: waveContainerRef.current,
      waveColor: '#7d8590',
      progressColor: '#fb8500',
      height: 64,
      barWidth: 2,
      barGap: 1,
      interact: false,
    });
    return () => { wavesurferRef.current?.destroy(); wavesurferRef.current = null; };
  }, [state]);

  // Auto-stop when duration reaches the cap — kept outside the interval updater to avoid side effects in a state setter
  useEffect(() => {
    if (state === 'recording' && duration >= MAX_RECORDING_DURATION - 1) {
      void handleStop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleStop references stable refs only
  }, [duration, state]);

  async function handleStart() {
    setError(null);
    setDuration(0);
    try {
      recordingRef.current = await startRecording();
      setState('recording');
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch {
      setError('Microphone access denied. Allow microphone access in your browser and try again.');
    }
  }

  async function handleStop() {
    if (!recordingRef.current) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setState('transcribing');

    const blob = await recordingRef.current.stop();
    blobRef.current = blob;
    recordingRef.current = null;

    const response = await transcribeAudio(blob, token ?? '');
    if (!response.data) {
      setError('Transcription failed. Try again.');
      setState('idle');
      return;
    }
    setTranscript(response.data.transcript);
    setState('editing');
  }

  async function runOrganize(noteId: string, text: string) {
    if (text.trim().length <= 20) return;
    setOrganizeError(null);
    const response = await organizeNote(text, token ?? '');
    if (response.data) {
      await updateNoteOrganization(noteId, response.data);
    } else if (response.error) {
      setOrganizeError(response.error.message);
    }
  }

  async function handleSave() {
    const note = await saveNote({
      title: 'Audio note',
      body: transcript,
      contentType: 'audio',
      audioBlob: blobRef.current ?? undefined,
      audioTranscript: transcript,
      extractedEntities: [],
      classification: 'observation',
      isPrivileged: false,
      isPublished: false,
    });
    await runOrganize(note.id, transcript);
    setState('idle');
    setTranscript('');
    setDuration(0);
    blobRef.current = null;
  }

  return (
    <div className="editor-container">
      {state === 'idle' && (
        <div className="audio-idle">
          <button
            onClick={handleStart}
            className="audio-record-btn"
            aria-label="Start recording"
          >
            <Mic size={28} />
          </button>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-secondary)' }}>
            Tap to record a voice note
          </span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-muted)' }}>
            Max 5 minutes. Audio is transcribed via Gemini.
          </span>
        </div>
      )}

      {state === 'recording' && (
        <div className="audio-recording">
          <div className="audio-recording-indicator">
            <span className="audio-recording-dot" />
            Recording
          </div>
          <div ref={waveContainerRef} style={{ width: '100%', borderRadius: 8 }} />
          <div className="audio-timer">
            {formatDuration(duration)}
          </div>
          <button onClick={handleStop} className="btn" style={{ background: 'var(--danger)', color: '#fff', padding: '10px 24px', fontSize: 14 }}>
            Stop recording
          </button>
        </div>
      )}

      {state === 'transcribing' && (
        <div className="audio-idle">
          <span className="spinner" style={{ width: 24, height: 24 }} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-secondary)' }}>
            Transcribing audio...
          </span>
        </div>
      )}

      {state === 'editing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: 'var(--text-muted)' }}>
            Transcript — edit before saving
          </label>
          <textarea
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            className="transcript-editor"
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleSave} className="btn btn--primary">
              Save note
            </button>
            <button
              onClick={() => { setState('idle'); setTranscript(''); setDuration(0); blobRef.current = null; }}
              className="btn btn--secondary"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="error-inline" style={{ marginTop: 16 }}>
          <span className="error-inline-text">{error}</span>
          <button onClick={() => setError(null)} className="btn btn--danger-text">Dismiss</button>
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
