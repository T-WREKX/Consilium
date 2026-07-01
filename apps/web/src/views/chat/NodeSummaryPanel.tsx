import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { fetchNodeSummary } from '../../api/chat';
import { useAuthStore } from '../../store/authStore';

interface NodeSummaryPanelProps {
  nodeId: string | null;
  onClose: () => void;
}

/**
 * Slide-in panel showing a cited node's details.
 * Appears from the right when a citation chip is clicked.
 */
export const NodeSummaryPanel: React.FC<NodeSummaryPanelProps> = ({ nodeId, onClose }) => {
  const [node, setNode] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!nodeId) {
      setNode(null);
      return;
    }
    setLoading(true);
    fetchNodeSummary(nodeId, token)
      .then((data) => setNode(data))
      .catch(() => setNode(null))
      .finally(() => setLoading(false));
  }, [nodeId]);

  // Handle Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (nodeId) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [nodeId, onClose]);

  if (!nodeId) return null;

  const NODE_COLORS: Record<string, string> = {
    insight: 'var(--node-insight)',
    matter: 'var(--node-matter)',
    party: 'var(--node-party)',
    lawyer: 'var(--node-lawyer)',
    judge: 'var(--node-judge)',
    witness: 'var(--node-witness)',
    concept: 'var(--node-concept)',
    precedent: 'var(--node-precedent)',
    statute: 'var(--node-statute)',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(13, 17, 23, 0.5)',
          zIndex: 999,
          animation: 'fadeIn var(--duration-fast) var(--easing-entry)',
        }}
      />
      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '400px',
          maxWidth: '90vw',
          backgroundColor: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-default)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight var(--duration-default) var(--easing-entry)',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-default)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
            }}
          >
            Node Detail
          </span>
          <button
            onClick={onClose}
            aria-label="Close panel"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {loading && (
            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
              Loading...
            </p>
          )}
          {!loading && node && (
            <>
              {/* Type badge */}
              <div style={{ marginBottom: '12px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-surface-raised)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    color: NODE_COLORS[node.node_type] ?? 'var(--text-secondary)',
                    fontWeight: 500,
                    textTransform: 'capitalize',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: NODE_COLORS[node.node_type] ?? 'var(--text-muted)',
                    }}
                  />
                  {node.node_type}
                </span>
              </div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  lineHeight: 1.4,
                  marginBottom: '12px',
                }}
              >
                {node.title}
              </h3>

              {/* Summary */}
              {node.summary && (
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.55,
                    marginBottom: '16px',
                    fontStyle: 'italic',
                  }}
                >
                  {node.summary}
                </p>
              )}

              {/* Body */}
              {node.body && (
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '15px',
                    color: 'var(--text-primary)',
                    lineHeight: 1.6,
                    marginBottom: '20px',
                  }}
                >
                  {node.body}
                </div>
              )}

              {/* Connections */}
              {node.connections && node.connections.length > 0 && (
                <div>
                  <h4
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Connected Nodes
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {node.connections.map((conn: any) => (
                      <div
                        key={conn.id}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: 'var(--bg-surface-raised)',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: NODE_COLORS[conn.connected_type] ?? 'var(--text-muted)',
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '13px',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {conn.connected_title}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            marginLeft: 'auto',
                          }}
                        >
                          {conn.edge_type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          {!loading && !node && (
            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
              Node not found.
            </p>
          )}
        </div>
      </div>
    </>
  );
};
