// apps/web/src/views/team/NodeSummaryPanel.tsx
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { fetchNodeById } from '../../api/teamGraph';
import type { TeamGraphNode } from '../../types/index';
import './team.css';

interface NodeSummaryPanelProps {
  nodeId: string | null;
  onClose: () => void;
}

export function NodeSummaryPanel({ nodeId, onClose }: NodeSummaryPanelProps) {
  const token = useAuthStore((s) => s.token);
  const [node, setNode] = useState<(TeamGraphNode & { connections: unknown[] }) | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!nodeId || !token) { setNode(null); return; }
    setLoading(true);
    fetchNodeById(nodeId, token)
      .then((r) => setNode(r.data ?? null))
      .finally(() => setLoading(false));
  }, [nodeId, token]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <aside className={`node-panel${nodeId ? ' open' : ''}`} aria-label="Node detail">
      {node && (
        <>
          <div className="node-panel-header">
            <div>
              <div className="node-panel-type">{node.nodeType}</div>
              <div className="node-panel-title">{node.title}</div>
            </div>
            <button className="node-panel-close" onClick={onClose} aria-label="Close panel">
              <X size={18} />
            </button>
          </div>
          <div className="node-panel-body">
            <p>{node.summary ?? node.body ?? 'No content available.'}</p>
            <div className="node-panel-meta">
              Added {new Date(node.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </>
      )}
      {loading && (
        <div className="node-panel-body" style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Loading...
        </div>
      )}
    </aside>
  );
}
