import { useState } from 'react';
import { PenLine, Mic, Upload } from 'lucide-react';
import TextCapture from './TextCapture';
import AudioCapture from './AudioCapture';
import ImageCapture from './ImageCapture';
import './organize-panel.css';

type Tab = 'write' | 'record' | 'upload';

const TABS: { key: Tab; label: string; Icon: typeof PenLine }[] = [
  { key: 'write', label: 'Write', Icon: PenLine },
  { key: 'record', label: 'Record', Icon: Mic },
  { key: 'upload', label: 'Upload', Icon: Upload },
];

export default function CaptureView() {
  const [activeTab, setActiveTab] = useState<Tab>('write');

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-canvas)' }}>
      <div className="capture-tabs">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`capture-tab${activeTab === key ? ' active' : ''}`}
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div className="capture-content">
        {activeTab === 'write' && <TextCapture />}
        {activeTab === 'record' && <AudioCapture />}
        {activeTab === 'upload' && <ImageCapture />}
      </div>
    </div>
  );
}
