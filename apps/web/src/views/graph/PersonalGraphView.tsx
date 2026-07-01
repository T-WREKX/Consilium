import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import { useNoteStore } from '../../store/noteStore';
import { notesToCytoscapeElements } from '../../lib/graphUtils';
import { applyGraphDiff, recomputeNodeRadii } from '../../lib/graphDiff';
import { personalGraphStylesheet, LABEL_ZOOM_THRESHOLD } from '../../lib/graphStyles';
import { getGraphPositions, saveGraphPositions, type GraphPositions } from '../../lib/idb';
import { Logo } from '../../components/Logo';
import { GraphZoomControl } from '../../components/GraphZoomControl';
import { GraphNodePreview } from '../../components/GraphNodePreview';
import type { PersonalNote } from '../../types/index';

const PREVIEW_DELAY_MS = 320;
const POSITION_SAVE_INTERVAL_MS = 10000;
const MIN_LAYOUT_SPREAD = 40;

function snapshotPositions(cy: cytoscape.Core): Record<string, { x: number; y: number }> {
  const out: Record<string, { x: number; y: number }> = {};
  cy.nodes().forEach((n) => {
    const p = n.position();
    out[n.id()] = { x: p.x, y: p.y };
  });
  return out;
}

function isCacheUsable(positions: GraphPositions, ids: string[]): boolean {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  let count = 0;
  for (const id of ids) {
    const p = positions[id];
    if (!p) continue;
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
    count++;
  }
  if (count < 2) return false;
  return (maxX - minX) >= MIN_LAYOUT_SPREAD || (maxY - minY) >= MIN_LAYOUT_SPREAD;
}

if (!(cytoscape as any).__colaRegistered) {
  cytoscape.use(cola);
  (cytoscape as any).__colaRegistered = true;
}

export default function PersonalGraphView() {
  const { notes, loadNotes, setActiveNote } = useNoteStore();
  const [search, setSearch] = useState('');
  const [zoomPercent, setZoomPercent] = useState(100);
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const baseZoomRef = useRef<number>(1);
  const layoutRef = useRef<cytoscape.Layouts | null>(null);
  const layoutSettledRef = useRef(false);
  const notesRef = useRef<PersonalNote[]>([]);
  const elementsRef = useRef<ReturnType<typeof notesToCytoscapeElements>>([]);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [previewState, setPreviewState] = useState<{
    note: PersonalNote;
    anchor: { x: number; y: number };
  } | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [graphReady, setGraphReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { notesRef.current = notes; }, [notes]);

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

  const elements = useMemo(() => notesToCytoscapeElements(notes), [notes]);
  useEffect(() => { elementsRef.current = elements; }, [elements]);

  useEffect(() => {
    if (elements.length > 0 && !graphReady) setGraphReady(true);
  }, [elements.length, graphReady]);

  // Spotlight helpers — same shape as TeamGraphView. Extracted so the
  // mouseout cleanup, the container-level mouseleave safety net, and the
  // tap-on-entity (persistent dim) all share one definition. Inline style
  // bypasses from prior spotlights are stripped first so consecutive
  // applications don't accumulate.
  const clearSpotlight = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.nodes().removeStyle();
    cy.edges().removeStyle();
  }, []);

  const applySpotlight = useCallback((nodeId: string) => {
    const cy = cyRef.current;
    if (!cy) return;
    const node = cy.getElementById(nodeId);
    if (!node || node.length === 0 || !node.isNode()) return;
    cy.nodes().removeStyle();
    cy.edges().removeStyle();

    const nbNodes = node.neighborhood().nodes();
    const nbEdges = node.neighborhood().edges();
    // Non-spotlight nodes: turn grey (override their per-type color),
    // dim the colored shadow, hide their labels. Spotlight + neighbors
    // retain their per-type color from the stylesheet default.
    cy.nodes().not(node).not(nbNodes).style({
      'background-color': '#3a3f47',
      'shadow-color': '#3a3f47',
      'background-opacity': 0.5,
      'text-opacity': 0,
    });
    cy.edges().not(nbEdges).style({ opacity: 0.06 });

    // Spotlight node: shadow glow + label visible.
    node.style({
      'shadow-blur': 20,
      'shadow-opacity': 0.95,
      'background-opacity': 1,
      color: '#e6edf3',
      'text-opacity': 1,
    });
    // Neighbors keep their color from the stylesheet; bump opacity + labels.
    nbNodes.style({ 'background-opacity': 1, 'text-opacity': 1 });
    nbEdges.style({ opacity: 0.7, 'line-color': '#fb8500', width: 1.5 });
  }, []);

  const refreshLabelVisibility = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    const base = baseZoomRef.current || 1;
    const showAll = cy.zoom() / base >= LABEL_ZOOM_THRESHOLD;
    cy.nodes().forEach((n) => {
      const forced = n.hasClass('cy-hover') || n.selected();
      n.style('text-opacity', forced || showAll ? 1 : 0);
    });
    // Edges follow labels: when zoomed out, the canvas reads as a clean
    // constellation. Hover handlers temporarily override per-edge opacity
    // inline, so the spotlight effect still surfaces neighborhood edges.
    if (showAll) cy.edges().removeClass('cy-hidden-by-zoom');
    else cy.edges().addClass('cy-hidden-by-zoom');
  }, []);

  const applyZoomPercent = useCallback((pct: number) => {
    const cy = cyRef.current;
    if (!cy) return;
    const base = baseZoomRef.current || 1;
    cy.zoom({
      level: base * (pct / 100),
      renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
    });
  }, []);

  const handleZoomChange = useCallback((pct: number) => {
    setZoomPercent(pct);
    applyZoomPercent(pct);
  }, [applyZoomPercent]);

  const handleZoomReset = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.fit(undefined, 60);
    baseZoomRef.current = cy.zoom();
    setZoomPercent(100);
    refreshLabelVisibility();
  }, [refreshLabelVisibility]);

  // Mount the graph and start a continuous cola simulation. Cola is the
  // library the original polish commit (1c836dd) used; it handles drag
  // disturbance + settle naturally so we don't need the hand-rolled physics
  // tick from earlier. `infinite: true` keeps the layout alive, which is
  // what gives Obsidian's graph the "breathing" feel.
  useEffect(() => {
    if (!graphReady || !containerRef.current) return;
    const containerEl = containerRef.current;
    let cancelled = false;

    (async () => {
      const cached: GraphPositions = await getGraphPositions().catch(() => ({} as GraphPositions));
      if (cancelled) return;

      const snapshot = elementsRef.current;
      const nodeIds: string[] = [];
      for (const el of snapshot) {
        if (!('source' in el.data)) nodeIds.push((el.data as any).id as string);
      }
      const cacheUsable = isCacheUsable(cached, nodeIds);

      const seededElements = cacheUsable
        ? snapshot.map((el) => {
            if ('source' in el.data) return el;
            const p = cached[(el.data as any).id];
            return p ? ({ ...el, position: p } as any) : el;
          })
        : snapshot;

      const cy = cytoscape({
        container: containerEl,
        elements: seededElements as any,
        style: personalGraphStylesheet,
        layout: { name: 'preset' },
        // Cytoscape's built-in wheel zoom centers on the cursor. We replace
        // it with a custom handler below that always centers on the canvas
        // center — a cluster-centric zoom feels less disorienting.
        userZoomingEnabled: false,
        userPanningEnabled: true,
        // Force the canvas to rasterize at higher pixel density so the graph
        // stays sharp at deep zoom levels (up to 500%). Default 'auto' uses
        // window.devicePixelRatio (often 1) and the upscale at 5× looks blurry.
        // 'auto' uses device pixel ratio (1 on most monitors, 2 on retina).
        // Was previously forced to 2 for sharpness at 5× zoom, but that's
        // 4× the pixels per frame for a niche zoom level — trade the deep-
        // zoom sharpness for smoother continuous motion.
        pixelRatio: 'auto',
        textureOnViewport: false,
        motionBlur: false,
        // Edges/labels temporarily hide during active pan/zoom — invisible
        // at rest, big perf win on graphs with many edges. Common cytoscape
        // pattern; the user only sees the simplification mid-interaction.
        hideEdgesOnViewport: true,
        hideLabelsOnViewport: true,
      } as any);
      cyRef.current = cy;
      (window as any).__cy = cy;

      cy.on('mouseover', 'node', (evt) => {
        const node = evt.target;
        node.addClass('cy-hover');
        applySpotlight(node.id());

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
        clearSpotlight();
        refreshLabelVisibility();
      });

      // Safety net: cola's continuous motion can make node-level mouseout
      // unreliable (a node can slide out from under the cursor before the
      // browser fires mouseout). Catch the case where the cursor leaves the
      // canvas entirely and force-clear any stuck spotlight state.
      const handleContainerLeave = () => {
        cancelPreview();
        cy.nodes().removeClass('cy-hover');
        clearSpotlight();
        refreshLabelVisibility();
      };
      containerEl.addEventListener('mouseleave', handleContainerLeave);
      (cy as any).__onContainerLeave = handleContainerLeave;

      cy.on('tap', 'node', (evt) => {
        const node = evt.target;
        const noteId = node.data('noteId') as string | undefined;
        if (noteId) {
          setActiveNote(noteId);
          navigate('/capture');
          return;
        }
        if (node.data('isGhost')) {
          const label = (node.data('ghostLabel') as string | undefined) ?? '';
          setActiveNote(null);
          navigate('/capture', { state: { prefillTitle: label } });
          return;
        }
        const neighborhood = node.neighborhood().add(node);
        cy.elements().not(neighborhood).style({ opacity: 0.2 });
        neighborhood.style({ opacity: 1 });
      });

      cy.on('tap', (evt) => {
        if (evt.target === cy) {
          cy.elements().style({ opacity: 1 });
        }
      });

      // Throttle to one update per animation frame — wheel events fire much
      // faster than the screen can render, and each one paid the cost of a
      // React state update + a full cy.nodes() traversal in label refresh.
      let zoomRaf = 0;
      cy.on('zoom', () => {
        cancelPreview();
        if (zoomRaf) return;
        zoomRaf = requestAnimationFrame(() => {
          zoomRaf = 0;
          const base = baseZoomRef.current || 1;
          const pct = Math.round((cy.zoom() / base) * 100);
          const clamped = Math.max(50, Math.min(500, pct));
          setZoomPercent((prev) => (Math.abs(clamped - prev) >= 1 ? clamped : prev));
          refreshLabelVisibility();
        });
      });

      cy.on('pan', cancelPreview);
      cy.on('grab', 'node', cancelPreview);

      // Custom wheel zoom — anchored to canvas center, ~50% per wheel tick.
      // (Cytoscape's default handler zooms toward the cursor and was disabled
      // via userZoomingEnabled: false in the cy() options above.)
      const handleWheelZoom = (e: WheelEvent) => {
        e.preventDefault();
        const base = baseZoomRef.current || 1;
        const factor = e.deltaY < 0 ? 1.5 : 1 / 1.5;
        const newZoom = cy.zoom() * factor;
        const clamped = Math.max(base * 0.5, Math.min(base * 5.0, newZoom));
        cy.zoom({
          level: clamped,
          renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
        });
      };
      containerEl.addEventListener('wheel', handleWheelZoom, { passive: false });
      (cy as any).__onWheelZoom = handleWheelZoom;

      const ro = new ResizeObserver(() => {
        setContainerSize({ width: containerEl.clientWidth, height: containerEl.clientHeight });
      });
      ro.observe(containerEl);
      setContainerSize({ width: containerEl.clientWidth, height: containerEl.clientHeight });
      (cy as any).__ro = ro;

      // Continuous cola layout — the simulation runs forever, reacting to
      // node drag in real time. Matches the polish-commit config.
      const layout = cy.layout({
        name: 'cola',
        infinite: true,
        fit: false,
        animate: true,
        randomize: !cacheUsable,
        maxSimulationTime: 0,
        ungrabifyWhileSimulating: false,
        // Don't pack disconnected components into a side column — let
        // node-node repulsion push orphans into a natural orbit around the
        // main cluster.
        handleDisconnected: false,
        // Higher threshold lets cola coast when near equilibrium — saves
        // CPU per frame without killing the live "breathing" feel since
        // any user interaction (drag, add) re-energizes the sim.
        convergenceThreshold: 0.05,
        nodeSpacing: 28,
        edgeLength: 130,
        padding: 40,
      } as any);
      layout.run();
      layoutRef.current = layout;

      // Give the simulation a beat to spread nodes, then fit. fcose-free path
      // means there's no `layoutstop` to hook — schedule the fit instead.
      setTimeout(() => {
        if (cancelled || !cyRef.current) return;
        cy.fit(undefined, 60);
        const base = cy.zoom();
        baseZoomRef.current = base;
        cy.minZoom(base * 0.5);
        cy.maxZoom(base * 5.0);
        setZoomPercent(100);
        refreshLabelVisibility();
        recomputeNodeRadii(cy);
        layoutSettledRef.current = true;
      }, cacheUsable ? 100 : 1400);
    })();

    return () => {
      cancelled = true;
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      layoutRef.current?.stop();
      layoutRef.current = null;
      const cy = cyRef.current;
      if (cy) {
        const onLeave = (cy as any).__onContainerLeave as (() => void) | undefined;
        if (onLeave && containerRef.current) {
          containerRef.current.removeEventListener('mouseleave', onLeave);
        }
        const onWheel = (cy as any).__onWheelZoom as ((e: WheelEvent) => void) | undefined;
        if (onWheel && containerRef.current) {
          containerRef.current.removeEventListener('wheel', onWheel);
        }
        (cy as any).__ro?.disconnect?.();
        cy.destroy();
      }
      cyRef.current = null;
      layoutSettledRef.current = false;
    };
  }, [graphReady, navigate, setActiveNote, refreshLabelVisibility, cancelPreview, schedulePreview, applySpotlight, clearSpotlight]);

  // Incremental updates: when notes change, patch elements in place. Cola
  // automatically picks up new nodes and edges since the layout is live.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !layoutSettledRef.current || elements.length === 0) return;
    const changed = applyGraphDiff(cy, elements);
    if (changed) {
      recomputeNodeRadii(cy);
      // Re-run cola briefly so new nodes integrate into the layout.
      layoutRef.current?.stop();
      const layout = cy.layout({
        name: 'cola',
        infinite: true,
        fit: false,
        animate: true,
        randomize: false,
        maxSimulationTime: 0,
        ungrabifyWhileSimulating: false,
        handleDisconnected: false,
        nodeSpacing: 28,
        edgeLength: 130,
      } as any);
      layout.run();
      layoutRef.current = layout;
    }
  }, [elements]);

  // Periodic save of positions for stable layouts across reloads.
  useEffect(() => {
    const interval = setInterval(() => {
      const cy = cyRef.current;
      if (!cy || !layoutSettledRef.current) return;
      void saveGraphPositions(snapshotPositions(cy));
    }, POSITION_SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      const cy = cyRef.current;
      if (cy && layoutSettledRef.current) {
        void saveGraphPositions(snapshotPositions(cy));
      }
    };
  }, []);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    if (!search.trim()) {
      // Drop inline opacity so the zoom-hide class takes effect again.
      cy.elements().removeStyle('opacity');
      refreshLabelVisibility();
      return;
    }
    const q = search.toLowerCase();
    cy.nodes().forEach((node) => {
      node.style({
        opacity: (node.data('label') as string).toLowerCase().includes(q) ? 1 : 0.2,
      });
    });
    cy.edges().style({ opacity: 0.15 });
  }, [search, refreshLabelVisibility]);

  if (notes.length === 0) {
    return (
      <div className="empty-state" style={{ height: '100%' }}>
        <div className="empty-state-logo">
          <Logo size={64} />
        </div>
        <span className="empty-state-title">Your personal graph is empty</span>
        <span className="empty-state-desc">
          Capture your first note to build your personal knowledge graph. Each note creates connected nodes automatically.
        </span>
        <button onClick={() => navigate('/capture')} className="btn btn--primary">
          Capture a note
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-canvas)' }}>
      <div className="graph-toolbar">
        <div className="graph-search-wrapper">
          <Search size={14} className="graph-search-icon" />
          <input
            type="text"
            placeholder="Search your graph..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="graph-search"
          />
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        <GraphNodePreview
          note={previewState?.note ?? null}
          anchor={previewState?.anchor ?? null}
          bounds={containerSize}
        />
        <GraphZoomControl
          zoomPercent={zoomPercent}
          onChange={handleZoomChange}
          onReset={handleZoomReset}
        />
      </div>
    </div>
  );
}
