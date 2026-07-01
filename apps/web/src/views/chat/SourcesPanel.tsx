import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { fetchNodeSummary } from '../../api/chat';
import { useAuthStore } from '../../store/authStore';

interface SourcesPanelProps {
  citedNodeIds: string[];
  expanded: boolean;
  onToggle: () => void;
  onSourceClick: (nodeId: string) => void;
}

interface NodeMeta {
  title: string;
  node_type: string;
}

const NODE_COLORS: Record<string, string> = {
  insight: '#9d4edd',
  matter: '#06d6a0',
  party: '#ef476f',
  lawyer: '#118ab2',
  judge: '#073b4c',
  witness: '#ffd60a',
  concept: '#8338ec',
  precedent: '#3a86ff',
  statute: '#d62828',
};

export const SourcesPanel: React.FC<SourcesPanelProps> = ({
  citedNodeIds,
  expanded,
  onToggle,
  onSourceClick,
}) => {
  const [nodeMeta, setNodeMeta] = useState<Record<string, NodeMeta>>({});
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!expanded || citedNodeIds.length === 0) return;
    const unresolved = citedNodeIds.filter((id) => !nodeMeta[id]);
    if (unresolved.length === 0) return;

    Promise.all(
      unresolved.map((id) =>
        fetchNodeSummary(id, token).then((data) =>
          data ? { id, title: data.title, node_type: data.node_type } : null
        )
      )
    ).then((results) => {
      const updates: Record<string, NodeMeta> = {};
      results.forEach((r) => {
        if (r) updates[r.id] = { title: r.title, node_type: r.node_type };
      });
      if (Object.keys(updates).length > 0) {
        setNodeMeta((prev) => ({ ...prev, ...updates }));
      }
    });
  }, [expanded, citedNodeIds, token]);

  if (citedNodeIds.length === 0) return null;

  return (
    <div
      style={{
        marginTop: '8px',
        borderRadius: '8px',
        border: '1px solid var(--border-muted)',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: 'var(--bg-surface-raised)',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: 500,
        }}
      >
        <span>{citedNodeIds.length} {citedNodeIds.length === 1 ? 'source' : 'sources'}</span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div style={{ padding: '6px 8px', backgroundColor: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {citedNodeIds.map((id, idx) => {
            const meta = nodeMeta[id];
            const color = meta ? (NODE_COLORS[meta.node_type] ?? 'var(--text-muted)') : 'var(--text-muted)';
            return (
              <button
                key={id}
                onClick={() => onSourceClick(id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'background 120ms ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-raised)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span
                  style={{
                    color: 'var(--accent-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 600,
                    minWidth: '22px',
                    flexShrink: 0,
                  }}
                >
                  [{idx + 1}]
                </span>
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}
                >
                  {meta ? meta.title : (
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                      {id.slice(0, 8)}…
                    </span>
                  )}
                </span>
                {meta && (
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '11px',
                      color,
                      textTransform: 'capitalize',
                      flexShrink: 0,
                      opacity: 0.8,
                    }}
                  >
                    {meta.node_type}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
