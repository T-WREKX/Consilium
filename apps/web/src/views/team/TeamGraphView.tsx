// apps/web/src/views/team/TeamGraphView.tsx
import { useEffect, useRef, useState, useCallback } from 'react';
import cytoscape, { Core } from 'cytoscape';
import cola from 'cytoscape-cola';
import { useAuthStore } from '../../store/authStore';
import { fetchTeamGraph } from '../../api/teamGraph';
import type { TeamGraph } from '../../types/index';
import { NodeSummaryPanel } from './NodeSummaryPanel';
import { GraphZoomControl } from '../../components/GraphZoomControl';
import { LABEL_ZOOM_THRESHOLD } from '../../lib/graphStyles';
import { recomputeNodeRadii } from '../../lib/graphDiff';
import './team.css';

if (!(cytoscape as any).__colaRegistered) {
  cytoscape.use(cola);
  (cytoscape as any).__colaRegistered = true;
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

export function TeamGraphView() {
  const token = useAuthStore((s) => s.token);
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const baseZoomRef = useRef<number>(1);
  const layoutRef = useRef<cytoscape.Layouts | null>(null);
  const searchRef = useRef('');
  // Spotlight state — when a node is selected via tap (and the sidebar is
  // open), it stays lit even when the user hovers other nodes. On hover-out
  // we restore the selection spotlight instead of fully clearing.
  const hoveredIdRef = useRef<string | null>(null);
  const selectedIdRef = useRef<string | null>(null);

  const [graph, setGraph] = useState<TeamGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomPercent, setZoomPercent] = useState(100);

  useEffect(() => {
    if (!token) return;
    fetchTeamGraph(token).then((result) => {
      setLoading(false);
      if (result.error) { setError(result.error.message); return; }
      if (result.data) setGraph(result.data);
    });
  }, [token]);

  // Keep searchRef in sync so event handlers can read current filter
  useEffect(() => { searchRef.current = searchQuery; }, [searchQuery]);

  // Strip every hover/selection bypass. The :selected stylesheet rule
  // re-applies the chosen-state visuals on its own, so we don't need
  // inline overrides for the focused node.
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
    // Reset first so consecutive spotlights don't stack bypasses.
    cy.nodes().removeStyle();
    cy.edges().removeStyle();

    const nbNodes = node.neighborhood().nodes();
    const nbEdges = node.neighborhood().edges();
    // Non-spotlight nodes: turn grey (override per-type color), dim the
    // colored shadow, hide labels. Spotlight + neighbors keep their colors
    // from the stylesheet default.
    cy.nodes().not(node).not(nbNodes).style({
      'background-color': '#3a3f47',
      'shadow-color': '#3a3f47',
      'background-opacity': 0.5,
      'text-opacity': 0,
    });
    cy.edges().not(nbEdges).style({ opacity: 0.06 });

    node.style({
      'shadow-blur': 22,
      'shadow-opacity': 0.95,
      'background-opacity': 1,
      color: '#e6edf3',
      'text-opacity': 1,
    });
    nbNodes.style({ 'background-opacity': 1, 'text-opacity': 1 });
    nbEdges.style({ opacity: 0.8, 'line-color': '#fb8500', width: 1.5 });
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

  useEffect(() => {
    if (!containerRef.current || !graph) return;

    const elements = [
      ...graph.nodes.map((n: any) => ({
        data: { id: n.id, label: n.title, nodeType: n.nodeType ?? n.node_type },
      })),
      ...graph.edges.map((e: any) => ({
        data: {
          id: e.id,
          source: e.sourceNodeId ?? e.source_node_id,
          target: e.targetNodeId ?? e.target_node_id,
          edgeType: e.edgeType ?? e.edge_type,
        },
      })),
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            // Per-type color at rest (matches personal graph). The spotlight
            // handler greys-out non-spotlight nodes inline when active.
            'background-color': (el: cytoscape.NodeSingular) => NODE_COLORS[el.data('nodeType')] ?? '#7d8590',
            'background-opacity': 0.9,
            // Degree-scaled size via shared helper (lib/graphDiff). Stored
            // in node data so removeStyle() during hover cleanup doesn't
            // collapse every node back to a uniform default.
            width: (el: cytoscape.NodeSingular) => (el.data('size') as number | undefined) ?? 32,
            height: (el: cytoscape.NodeSingular) => (el.data('size') as number | undefined) ?? 32,
            label: 'data(label)',
            'font-size': 11,
            'font-family': 'Inter, system-ui, sans-serif',
            'font-weight': 400,
            color: '#8b949e',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 6,
            'text-max-width': '120px',
            'text-wrap': 'ellipsis',
            'text-outline-color': '#0d1117',
            'text-outline-width': 2,
            'text-outline-opacity': 0.8,
            'text-opacity': 1,
            'border-width': 0,
            'shadow-blur': 6,
            'shadow-color': (el: cytoscape.NodeSingular) => NODE_COLORS[el.data('nodeType')] ?? '#7d8590',
            'shadow-offset-x': 0,
            'shadow-offset-y': 0,
            'shadow-opacity': 0.5,
            'overlay-opacity': 0,
          } as any,
        },
        {
          selector: 'node:selected',
          style: {
            'border-color': '#fb8500',
            'border-width': 2,
            'shadow-blur': 24,
            'shadow-opacity': 0.9,
            'background-opacity': 1,
            color: '#e6edf3',
          } as any,
        },
        // Edge tier hierarchy matches personal graph (vault/concepts/
        // derived-edges.md): author-stated edges loudest, AI-extracted
        // medium, derived/scaffolding lowest.
        {
          selector: 'edge',
          style: {
            'line-color': '#21262d',
            width: 0.75,
            'curve-style': 'bezier',
            opacity: 0.35,
            'overlay-opacity': 0,
          } as any,
        },
        {
          selector: 'edge[edgeType="related_to"]',
          style: {
            'line-style': 'dashed',
            'line-color': '#30363d',
            'line-dash-pattern': [4, 3],
            width: 0.5,
            opacity: 0.25,
          } as any,
        },
        {
          selector: 'edge[edgeType="about"]',
          style: {
            'line-style': 'dotted',
            'line-color': '#21262d',
            width: 0.4,
            opacity: 0.15,
          } as any,
        },
        {
          selector: 'edge[edgeType="linked_to"]',
          style: {
            'line-style': 'solid',
            'line-color': '#9d4edd',
            width: 1.2,
            opacity: 0.7,
          } as any,
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#fb8500',
            opacity: 0.9,
            width: 2.2,
          },
        },
        // Hide edges when the user is zoomed out at or below 100%
        // (refreshLabelVisibility manages the class). Hover handlers still
        // override inline opacity to surface neighborhood edges.
        {
          selector: 'edge.cy-hidden-by-zoom',
          style: { opacity: 0 } as any,
        },
      ],
      layout: { name: 'preset' },
      // Custom center-anchored wheel zoom (see handleWheelZoom below).
      userZoomingEnabled: false,
      userPanningEnabled: true,
      // Render at higher pixel density so the canvas stays sharp at deep
      // zoom levels. Default 'auto' is too low for the 5× max we allow.
      pixelRatio: 'auto',
      textureOnViewport: false,
      motionBlur: false,
      hideEdgesOnViewport: true,
      hideLabelsOnViewport: true,
    } as any);

    cyRef.current = cy;

    // Continuous cola simulation — same library + config family as the
    // personal graph so both views feel identical. `infinite: true` keeps the
    // layout alive forever; cola handles drag-grab natively.
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
      nodeSpacing: 28,
      edgeLength: 130,
      padding: 40,
    } as any);
    layout.run();
    layoutRef.current = layout;

    // No `layoutstop` event with infinite cola — give the sim a beat to
    // spread the nodes, then fit and apply degree-scaled radii.
    setTimeout(() => {
      if (!cyRef.current) return;
      cy.fit(undefined, 60);
      const base = cy.zoom();
      baseZoomRef.current = base;
      cy.minZoom(base * 0.5);
      cy.maxZoom(base * 5.0);
      setZoomPercent(100);
      refreshLabelVisibility();

      recomputeNodeRadii(cy);
    }, 1400);

    // Hover spotlight — temporary; mouseout either falls back to the
    // selected node's spotlight (if sidebar is open) or fully resets.
    cy.on('mouseover', 'node', (e) => {
      const node = e.target;
      node.addClass('cy-hover');
      hoveredIdRef.current = node.id();
      applySpotlight(node.id());
    });

    cy.on('mouseout', 'node', (e) => {
      const node = e.target;
      node.removeClass('cy-hover');
      hoveredIdRef.current = null;

      // If the sidebar is open on a node, fall back to the selection
      // spotlight instead of fully clearing. Otherwise reset everything.
      if (selectedIdRef.current) {
        applySpotlight(selectedIdRef.current);
      } else {
        clearSpotlight();
      }

      // Re-apply active search filter (overlays opacity for filtered nodes).
      const q = searchRef.current.trim().toLowerCase();
      if (q) {
        cy.nodes().forEach(n => {
          n.style({ opacity: n.data('label')?.toLowerCase().includes(q) ? 1 : 0.15 });
        });
      }

      refreshLabelVisibility();
    });

    cy.on('tap', 'node', (e) => {
      setSelectedNodeId(e.target.id());
    });

    cy.on('tap', (e) => {
      if (e.target === cy) setSelectedNodeId(null);
    });

    let zoomRaf = 0;
    cy.on('zoom', () => {
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

    // Custom center-anchored wheel zoom (cytoscape default disabled above).
    const containerEl = containerRef.current!;
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

    // Safety net for hover state: cola's continuous motion can make node-
    // level mouseout unreliable. If the cursor leaves the canvas entirely,
    // clear any stuck spotlight — unless a node is currently selected
    // (sidebar open), in which case keep that selection spotlight live.
    const handleContainerLeave = () => {
      hoveredIdRef.current = null;
      cy.nodes().removeClass('cy-hover');
      if (selectedIdRef.current) applySpotlight(selectedIdRef.current);
      else clearSpotlight();
      refreshLabelVisibility();
    };
    containerEl.addEventListener('mouseleave', handleContainerLeave);

    return () => {
      containerEl.removeEventListener('wheel', handleWheelZoom);
      containerEl.removeEventListener('mouseleave', handleContainerLeave);
      layoutRef.current?.stop();
      layoutRef.current = null;
      cy.destroy();
      cyRef.current = null;
    };
  }, [graph, refreshLabelVisibility, applySpotlight, clearSpotlight]);

  // Selection-driven spotlight: when a node is tapped (opens the sidebar)
  // its neighborhood stays highlighted until the sidebar is closed (which
  // sets selectedNodeId back to null via onClose or background-tap).
  useEffect(() => {
    selectedIdRef.current = selectedNodeId;
    const cy = cyRef.current;
    if (!cy) return;
    if (selectedNodeId) {
      // Mirror selection into cytoscape so :selected stylesheet rules apply.
      cy.$(':selected').unselect();
      cy.getElementById(selectedNodeId).select();
      applySpotlight(selectedNodeId);
    } else {
      cy.$(':selected').unselect();
      // Hover takes over if the user is actively hovering; otherwise reset.
      if (hoveredIdRef.current) applySpotlight(hoveredIdRef.current);
      else clearSpotlight();
    }
  }, [selectedNodeId, applySpotlight, clearSpotlight]);

  // Search filter
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    if (!searchQuery.trim()) {
      cy.nodes().removeStyle('opacity');
      refreshLabelVisibility();
      return;
    }

    const q = searchQuery.toLowerCase();
    cy.nodes().forEach((node) => {
      const matches = node.data('label')?.toLowerCase().includes(q);
      node.style({ opacity: matches ? 1 : 0.15 });
    });
  }, [searchQuery, refreshLabelVisibility]);

  if (error) {
    return (
      <div className="team-graph-root">
        <div className="team-graph-empty">
          <span>Couldn't load. Retry.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="team-graph-root">
      <div className="team-graph-toolbar">
        <input
          className="team-graph-search"
          type="search"
          placeholder="Filter nodes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Filter team graph nodes"
        />
      </div>

      <div className="team-graph-canvas">
        {loading && (
          <div className="team-graph-empty">
            <span>Loading team knowledge graph...</span>
          </div>
        )}
        {!loading && graph?.nodes.length === 0 && (
          <div className="team-graph-empty">
            <span>No published insights yet. Be the first to publish.</span>
          </div>
        )}
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        {!loading && graph && graph.nodes.length > 0 && (
          <GraphZoomControl
            zoomPercent={zoomPercent}
            onChange={handleZoomChange}
            onReset={handleZoomReset}
          />
        )}
      </div>

      <NodeSummaryPanel
        nodeId={selectedNodeId}
        onClose={() => setSelectedNodeId(null)}
      />
    </div>
  );
}
