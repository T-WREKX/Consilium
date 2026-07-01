import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchTeamGraph } from '../../api/chat';

interface QueryOverlayProps {
  active: boolean;
  citedNodeIds: string[];
  token?: string | null;
  onDismiss: () => void;
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

const LOADING_MESSAGES = [
  'Grepping knowledge...',
  'Gathering context...',
  'Reading firm memory...',
  'Scanning precedents...',
  'Connecting insights...',
  'Mining case history...',
  'Surfacing evidence...',
  'Synthesizing findings...',
  'Preparing content...',
  'Assembling response...',
];

/* ── Timing constants ── */
const FADE_IN_MS = 400;
const PULSE_STAGGER_MS = 150;
const PULSE_DURATION_MS = 300;
const FADE_OUT_MS = 600;
const ACCENT_RGB = '251, 133, 0';

function stableJitter(index: number, seed: number): number {
  const x = Math.sin(index * 9301 + seed * 49297) * 49297;
  return x - Math.floor(x);
}

function triangle(t: number): number {
  return 1 - Math.abs(2 * t - 1);
}

function easeOut(t: number): number {
  return 1 - (1 - t) ** 3;
}

/** Six node-type colors in orbit ring order */
const ORBIT_COLORS = ['#9d4edd', '#06d6a0', '#3a86ff', '#ef476f', '#ffd60a', '#118ab2'];

export const QueryOverlay: React.FC<QueryOverlayProps> = ({
  active,
  citedNodeIds,
  token,
  onDismiss,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [graphData, setGraphData] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [msgIdx, setMsgIdx] = useState(() => Math.floor(Math.random() * LOADING_MESSAGES.length));

  const phaseRef = useRef<'in' | 'hold' | 'out'>('in');
  const phaseStartRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const prefersReducedMotion = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  // Fetch team graph once activated
  useEffect(() => {
    if (active && !graphData) {
      fetchTeamGraph(token ?? null).then((data) => setGraphData(data));
    }
  }, [active, graphData, token]);

  // Cycle loading messages while visible
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(id);
  }, [visible]);

  // Escape key dismisses
  useEffect(() => {
    if (!active) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [active, onDismiss]);

  // Become visible as soon as active (no waiting for graphData)
  useEffect(() => {
    if (active && !visible) {
      setVisible(true);
      phaseRef.current = 'in';
      phaseStartRef.current = performance.now();
    } else if (!active && visible) {
      phaseRef.current = 'out';
      phaseStartRef.current = performance.now();
    }
  }, [active, visible]);

  // Canvas rAF loop — only runs when graphData is available
  useEffect(() => {
    if (!visible || !graphData) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Read the canvas's *own* size, not the viewport — the overlay is now
    // scoped to the chat-root area, not the whole window.
    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      return { w: rect.width, h: rect.height };
    };

    const layoutNodes = () => {
      const { w, h } = measure();
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.32;
      const positions = new Map<string, { x: number; y: number }>();
      const nodes = graphData.nodes ?? [];
      nodes.forEach((node: any, i: number) => {
        const angle = (2 * Math.PI * i) / Math.max(nodes.length, 1);
        const jitter = stableJitter(i, 42);
        const r = radius * (0.72 + jitter * 0.55);
        positions.set(node.id, {
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle),
        });
      });
      return positions;
    };

    let positions = layoutNodes();
    let { w: lastW, h: lastH } = measure();

    const activationStart = (citedIndex: number) =>
      FADE_IN_MS + citedIndex * PULSE_STAGGER_MS;

    const nodeState = (nodeId: string, elapsed: number) => {
      const citedIndex = citedNodeIds.indexOf(nodeId);
      if (citedIndex < 0) return { progress: 0, scale: 1, isLit: false };
      if (prefersReducedMotion.current) {
        return { progress: elapsed > FADE_IN_MS ? 1 : 0, scale: 1, isLit: elapsed > FADE_IN_MS };
      }
      const start = activationStart(citedIndex);
      if (elapsed < start) return { progress: 0, scale: 1, isLit: false };
      const local = Math.min((elapsed - start) / PULSE_DURATION_MS, 1);
      return { progress: easeOut(local), scale: 1 + 0.15 * triangle(local), isLit: local >= 1 };
    };

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const now = performance.now();
      const elapsed = now - phaseStartRef.current;

      let envelope = 1;
      if (phaseRef.current === 'in') {
        envelope = Math.min(elapsed / FADE_IN_MS, 1);
      } else if (phaseRef.current === 'out') {
        envelope = Math.max(1 - elapsed / FADE_OUT_MS, 0);
        if (envelope <= 0) { setVisible(false); return; }
      }

      const cur = measure();
      if (cur.w !== lastW || cur.h !== lastH) {
        lastW = cur.w;
        lastH = cur.h;
        positions = layoutNodes();
      }
      const dpr = window.devicePixelRatio || 1;
      const targetW = lastW * dpr;
      const targetH = lastH * dpr;
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, lastW, lastH);

      const nodes = graphData.nodes ?? [];
      const edges = graphData.edges ?? [];

      for (const edge of edges) {
        const src = positions.get(edge.source_node_id);
        const tgt = positions.get(edge.target_node_id);
        if (!src || !tgt) continue;
        const srcState = nodeState(edge.source_node_id, elapsed);
        const tgtState = nodeState(edge.target_node_id, elapsed);
        const isCitedEdge =
          srcState.isLit && tgtState.isLit ||
          (srcState.progress > 0 && tgtState.progress > 0 &&
            citedNodeIds.includes(edge.source_node_id) && citedNodeIds.includes(edge.target_node_id));
        const edgeProgress = Math.min(srcState.progress, tgtState.progress);

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        if (isCitedEdge && edgeProgress > 0) {
          ctx.strokeStyle = `rgba(${ACCENT_RGB}, ${envelope * (0.4 + 0.6 * edgeProgress)})`;
          ctx.lineWidth = 1 + 1.4 * edgeProgress;
          ctx.shadowColor = `rgba(${ACCENT_RGB}, ${envelope * 0.5 * edgeProgress})`;
          ctx.shadowBlur = 8 * edgeProgress;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else {
          ctx.strokeStyle = `rgba(48, 54, 61, ${envelope * 0.35})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      const baseSize = 5;
      const litSize = 9;
      for (const node of nodes) {
        const pos = positions.get(node.id);
        if (!pos) continue;
        const color = NODE_COLORS[node.node_type] ?? '#7d8590';
        const state = nodeState(node.id, elapsed);
        const isCited = citedNodeIds.includes(node.id);
        const nodeOpacity = isCited ? (0.15 + 0.85 * state.progress) * envelope : 0.15 * envelope;
        const size = isCited ? (baseSize + (litSize - baseSize) * state.progress) * state.scale : baseSize;

        if (isCited && state.progress > 0.4) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, size + 6, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = nodeOpacity * 0.22 * state.progress;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = nodeOpacity;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible, graphData, citedNodeIds]);

  // When no graphData, still handle the out-phase collapse
  useEffect(() => {
    if (!visible || graphData) return;
    if (phaseRef.current !== 'out') return;

    const id = setTimeout(() => setVisible(false), FADE_OUT_MS);
    return () => clearTimeout(id);
  }, [visible, graphData, phaseRef.current]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        backgroundColor: 'rgba(13, 17, 23, 0.94)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
      onClick={onDismiss}
      role="presentation"
    >
      {/* Canvas graph (shown when graphData is loaded) */}
      {graphData && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
          aria-hidden
        />
      )}

      {/* Framer orbit animation — shown while waiting for graph data */}
      {!graphData && (
        <div
          style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}
          aria-hidden
        >
          <div style={{ position: 'relative', width: 160, height: 160 }}>
            {/* Outer faint ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '1px solid rgba(251, 133, 0, 0.08)',
              }}
            />
            {/* Mid ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                inset: 20,
                borderRadius: '50%',
                border: '1px solid rgba(251, 133, 0, 0.12)',
              }}
            />
            {/* Orbiting colored nodes */}
            {ORBIT_COLORS.map((color, i) => {
              const orbitRadius = i % 2 === 0 ? 68 : 52;
              const duration = 6 + i * 1.4;
              const delay = (i / ORBIT_COLORS.length) * -duration;
              return (
                <motion.div
                  key={i}
                  animate={{ rotate: 360 }}
                  transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
                  style={{ position: 'absolute', inset: 0 }}
                >
                  <motion.div
                    animate={{ scale: [0.85, 1.2, 0.85], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: duration * 0.7, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                    style={{
                      position: 'absolute',
                      top: `calc(50% - ${orbitRadius}px - 4px)`,
                      left: 'calc(50% - 4px)',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: color,
                      boxShadow: `0 0 8px ${color}88`,
                    }}
                  />
                </motion.div>
              );
            })}
            {/* Center pulse node */}
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: '#fb8500',
                boxShadow: '0 0 16px rgba(251, 133, 0, 0.7)',
              }}
            />
          </div>
        </div>
      )}

      {/* Cycling status label */}
      <div
        style={{
          position: 'absolute',
          bottom: '56px',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={msgIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {LOADING_MESSAGES[msgIdx]}
          </motion.span>
        </AnimatePresence>

        {/* Pulsing dots */}
        <span style={{ display: 'inline-flex', gap: 5 }}>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.22, ease: 'easeInOut' }}
              style={{
                width: 4,
                height: 4,
                borderRadius: 999,
                background: 'var(--accent-primary)',
                display: 'inline-block',
              }}
            />
          ))}
        </span>
      </div>

      {/* ESC hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.5, duration: 0.4 }}
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-muted)',
          letterSpacing: '0.04em',
          pointerEvents: 'none',
        }}
      >
        ESC to dismiss
      </motion.div>
    </motion.div>
  );
};
