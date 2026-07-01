import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import { useNoteStore } from '../../store/noteStore';
import { notesToCytoscapeElements, type CytoscapeElement } from '../../lib/graphUtils';
import { applyGraphDiff, recomputeNodeRadii } from '../../lib/graphDiff';
import { personalGraphStylesheet } from '../../lib/graphStyles';
import { GraphNodePreview } from '../../components/GraphNodePreview';
import type { PersonalNote } from '../../types/index';
import './local-graph.css';

if (!(cytoscape as any).__colaRegistered) {
  cytoscape.use(cola);
  (cytoscape as any).__colaRegistered = true;
}

const PREVIEW_DELAY_MS = 320;
const HOP_OPTIONS = [1, 2, 3] as const;
const DEFAULT_HOPS = 2;
const STORAGE_KEY = 'local-graph-hops';

interface Props {
  focusNoteId: string | null;
}

/**
 * Per-note local graph: shows the focused note plus everything reachable in
 * N hops, rendered with the same physics and styles as the global view so it
 * reads as "the same world, scoped down" rather than a different widget.
 *
 * Inner instance is keyed by focusNoteId so changing focus produces a fresh
 * mount (cheap for small scopes) instead of trying to diff across a complete
 * subgraph swap. Edits within the same focus go through the in-place diff.
 */
export function LocalGraphView({ focusNoteId }: Props) {
  const [hops, setHops] = useState<number>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const n = raw ? Number(raw) : DEFAULT_HOPS;
    return HOP_OPTIONS.includes(n as any) ? n : DEFAULT_HOPS;
  });

  const handleHopsChange = (next: number) => {
    setHops(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  if (!focusNoteId) {
    return (
      <section className="local-graph local-graph--empty">
        <header className="local-graph__header">
          <h3 className="local-graph__title">Local graph</h3>
        </header>
        <p className="local-graph__hint">Save the note to see how it connects.</p>
      </section>
    );
  }

  return (
    <section className="local-graph">
      <header className="local-graph__header">
        <h3 className="local-graph__title">Local graph</h3>
        <div className="local-graph__hops" role="group" aria-label="Neighborhood depth">
          {HOP_OPTIONS.map(n => (
            <button
              key={n}
              type="button"
              onClick={() => handleHopsChange(n)}
              className={`local-graph__hop-btn${n === hops ? ' is-active' : ''}`}
              aria-pressed={n === hops}
            >
              {n}-hop
            </button>
          ))}
        </div>
      </header>
      <LocalGraphCanvas key={focusNoteId} focusNoteId={focusNoteId} hops={hops} />
    </section>
  );
}

function LocalGraphCanvas({ focusNoteId, hops }: { focusNoteId: string; hops: number }) {
  const { notes } = useNoteStore();
  const navigate = useNavigate();
  const setActiveNote = useNoteStore(s => s.setActiveNote);

  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const layoutRef = useRef<cytoscape.Layouts | null>(null);
  const layoutSettledRef = useRef(false);
  const notesRef = useRef<PersonalNote[]>([]);
  const scopedElementsRef = useRef<ReturnType<typeof notesToCytoscapeElements>>([]);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [previewState, setPreviewState] = useState<{
    note: PersonalNote;
    anchor: { x: number; y: number };
  } | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => { notesRef.current = notes; }, [notes]);

  const fullElements = useMemo(() => notesToCytoscapeElements(notes), [notes]);

  // BFS the full element set out to `hops` from the focused note. Returns
  // exactly the elements (nodes + edges) that should be rendered in scope.
  const scopedElements = useMemo(
    () => scopeToNeighborhood(fullElements, focusNoteId, hops),
    [fullElements, focusNoteId, hops],
  );
  useEffect(() => { scopedElementsRef.current = scopedElements; }, [scopedElements]);

  const cancelPreview = useCallback(() => {
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    setPreviewState(null);
  }, []);

  const schedulePreview = useCallback((noteId: string, anchor: { x: number; y: number }) => {
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(() => {
      const note = notesRef.current.find(n => n.id === noteId);
      if (note) setPreviewState({ note, anchor });
    }, PREVIEW_DELAY_MS);
  }, []);

  // Mount once: create cy *with* the scoped elements at construction time.
  // Passing elements via cy.add() after construction confuses fcose's
  // randomization (nodes end up all at origin); team-graph-style construction
  // avoids the issue.
  useEffect(() => {
    if (!containerRef.current) return;
    const initialScoped = scopedElementsRef.current;
    if (initialScoped.length === 0) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: initialScoped as any,
      style: personalGraphStylesheet,
      layout: { name: 'preset' },
      userZoomingEnabled: false,
      userPanningEnabled: true,
      pixelRatio: 'auto',
      textureOnViewport: false,
      motionBlur: false,
      hideEdgesOnViewport: true,
      hideLabelsOnViewport: true,
    } as any);
    cyRef.current = cy;
    cy.getElementById(focusNoteId).addClass('cy-focus');

    // Cola handles grab/drag/release natively when `ungrabifyWhileSimulating`
    // is false, so we don't need a custom momentum handler here.
    cy.on('grab', 'node', cancelPreview);

    cy.on('mouseover', 'node', (evt) => {
      const node = evt.target;
      node.addClass('cy-hover');
      const nbNodes = node.neighborhood().nodes();
      const nbEdges = node.neighborhood().edges();
      cy.nodes().not(node).not(nbNodes).style({ opacity: 0.18 });
      cy.edges().not(nbEdges).style({ opacity: 0.08 });
      node.style({
        'shadow-blur': 22,
        'shadow-opacity': 0.95,
        'background-opacity': 1,
        color: '#e6edf3',
        'text-opacity': 1,
      });
      nbNodes.style({ opacity: 0.9 });
      nbEdges.style({ opacity: 0.85, 'line-color': '#fb8500', width: 1.4 });

      const noteId = node.data('noteId') as string | undefined;
      if (noteId) {
        const rp = node.renderedPosition();
        schedulePreview(noteId, { x: rp.x, y: rp.y });
      }
    });

    cy.on('mouseout', 'node', (evt) => {
      cancelPreview();
      const node = evt.target;
      node.removeClass('cy-hover');

      // Unconditionally clear every hover-applied bypass. The cy-focus
      // class still has its own stylesheet rule, so the focused note
      // re-paints correctly without any inline override.
      cy.nodes().removeStyle();
      cy.edges().removeStyle();
    });

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const noteId = node.data('noteId') as string | undefined;
      if (noteId && noteId !== focusNoteId) {
        setActiveNote(noteId);
        navigate('/capture');
        return;
      }
      if (node.data('isGhost')) {
        const label = (node.data('ghostLabel') as string | undefined) ?? '';
        setActiveNote(null);
        navigate('/capture', { state: { prefillTitle: label } });
      }
    });

    cy.on('pan', cancelPreview);
    cy.on('zoom', cancelPreview);

    const containerEl = containerRef.current;
    const ro = new ResizeObserver(() => {
      if (!containerEl) return;
      setContainerSize({ width: containerEl.clientWidth, height: containerEl.clientHeight });
    });
    ro.observe(containerEl);
    setContainerSize({ width: containerEl.clientWidth, height: containerEl.clientHeight });

    // Custom center-anchored wheel zoom.
    const handleWheelZoom = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.5 : 1 / 1.5;
      const newZoom = cy.zoom() * factor;
      const clamped = Math.max(cy.zoom() * 0.1, Math.min(cy.zoom() * 10, newZoom));
      cy.zoom({
        level: clamped,
        renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
      });
    };
    containerEl.addEventListener('wheel', handleWheelZoom, { passive: false });

    // Cola continuous layout — same library/config as PersonalGraphView,
    // scoped tighter for the smaller neighborhood. The focused note stays
    // pinned at the center via cola's `lockedNodes` so the camera doesn't
    // drift as the user navigates between notes.
    const layout = cy.layout({
      name: 'cola',
      infinite: true,
      fit: false,
      animate: true,
      randomize: true,
      maxSimulationTime: 0,
      ungrabifyWhileSimulating: false,
      handleDisconnected: false,
      convergenceThreshold: 0.05,
      nodeSpacing: 22,
      edgeLength: 100,
      padding: 30,
    } as any);
    layout.run();
    layoutRef.current = layout;

    setTimeout(() => {
      const c = cyRef.current;
      if (!c) return;
      c.fit(undefined, 30);
      recomputeNodeRadii(c);
      layoutSettledRef.current = true;
    }, 1000);

    return () => {
      ro.disconnect();
      containerEl.removeEventListener('wheel', handleWheelZoom);
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      layoutRef.current?.stop();
      layoutRef.current = null;
      cy.destroy();
      cyRef.current = null;
      layoutSettledRef.current = false;
    };
  }, [cancelPreview, schedulePreview, navigate, setActiveNote, focusNoteId]);

  // Incremental updates: diff scoped element changes into the running graph.
  // Cola picks up new nodes automatically since the simulation is live.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !layoutSettledRef.current || scopedElements.length === 0) return;
    const changed = applyGraphDiff(cy, scopedElements);
    if (changed) {
      cy.getElementById(focusNoteId).addClass('cy-focus');
      recomputeNodeRadii(cy);
      // Nudge cola so new nodes integrate into the running layout.
      layoutRef.current?.stop();
      const layout = cy.layout({
        name: 'cola',
        infinite: true,
        fit: false,
        animate: true,
        randomize: false,
        maxSimulationTime: 0,
        ungrabifyWhileSimulating: false,
        nodeSpacing: 22,
        edgeLength: 100,
      } as any);
      layout.run();
      layoutRef.current = layout;
    }
  }, [scopedElements, focusNoteId]);

  if (scopedElements.length === 0) {
    return (
      <div className="local-graph__canvas-wrap">
        <p className="local-graph__hint">No connections yet — add entities or wikilinks.</p>
      </div>
    );
  }

  return (
    <div className="local-graph__canvas-wrap">
      <div ref={containerRef} className="local-graph__canvas" />
      <GraphNodePreview
        note={previewState?.note ?? null}
        anchor={previewState?.anchor ?? null}
        bounds={containerSize}
      />
    </div>
  );
}

/**
 * BFS the full element set out to `hops` from `focusId`. Returns the
 * elements (nodes and edges) inside that neighborhood. Edges are included if
 * both endpoints are in scope.
 */
function scopeToNeighborhood(
  all: CytoscapeElement[],
  focusId: string,
  hops: number,
): CytoscapeElement[] {
  const nodes: CytoscapeElement[] = [];
  const edges: CytoscapeElement[] = [];
  for (const el of all) {
    if ('source' in el.data) edges.push(el);
    else nodes.push(el);
  }

  const adjacency = new Map<string, Set<string>>();
  for (const e of edges) {
    const s = (e.data as any).source as string;
    const t = (e.data as any).target as string;
    if (!adjacency.has(s)) adjacency.set(s, new Set());
    if (!adjacency.has(t)) adjacency.set(t, new Set());
    adjacency.get(s)!.add(t);
    adjacency.get(t)!.add(s);
  }

  const inScope = new Set<string>([focusId]);
  let frontier = new Set<string>([focusId]);
  for (let i = 0; i < hops; i++) {
    const next = new Set<string>();
    for (const id of frontier) {
      const neighbors = adjacency.get(id);
      if (!neighbors) continue;
      for (const n of neighbors) {
        if (!inScope.has(n)) {
          inScope.add(n);
          next.add(n);
        }
      }
    }
    if (next.size === 0) break;
    frontier = next;
  }

  const scopedNodes = nodes.filter(n => inScope.has((n.data as any).id));
  const scopedEdges = edges.filter(e => {
    const s = (e.data as any).source as string;
    const t = (e.data as any).target as string;
    return inScope.has(s) && inScope.has(t);
  });
  return [...scopedNodes, ...scopedEdges];
}
