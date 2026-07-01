export const MAX_RECORDING_DURATION = 300; // 5 minutes in seconds

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export interface Recording {
  stop: () => Promise<Blob>;
  stream: MediaStream;
}

export async function startRecording(): Promise<Recording> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
  const chunks: BlobPart[] = [];

  recorder.ondataavailable = e => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  // Request data every 250ms — provides chunks for WaveSurfer to visualize
  recorder.start(250);

  const stop = (): Promise<Blob> =>
    new Promise(resolve => {
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        resolve(new Blob(chunks, { type: 'audio/webm;codecs=opus' }));
      };
      recorder.stop();
    });

  return { stop, stream };
}
