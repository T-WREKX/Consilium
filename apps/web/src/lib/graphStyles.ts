export const EDGE_COLOR_HOVER = '#fb8500';
// Labels + edges hide at 100% (fit-to-view) and below. They only appear
// once the user zooms IN past 100%, so the default view reads as a clean
// constellation of nodes. Hover still surfaces neighborhood edges inline.
// 1.05 (5% above base) gives a small buffer so labels don't flicker at
// exactly 100%.
export const LABEL_ZOOM_THRESHOLD = 1.05;

/**
 * Shared Cytoscape stylesheet for both the personal global graph and the
 * per-note local graph. Keep visual language consistent between views so the
 * local graph reads as "the same world, zoomed in" rather than a different
 * widget.
 */
export const personalGraphStylesheet: any[] = [
  {
    selector: 'node',
    style: {
      // Rest state shows per-type color. The spotlight handler greys-out
      // non-spotlight nodes inline when a hover/selection is active.
      'background-color': 'data(color)',
      'background-opacity': 0.9,
      label: 'data(label)',
      'font-size': 11,
      'font-family': 'Inter, system-ui, sans-serif',
      'font-weight': 400,
      'text-valign': 'bottom',
      'text-halign': 'center',
      'text-margin-y': 6,
      color: '#8b949e',
      'text-wrap': 'ellipsis',
      'text-max-width': '100px',
      'text-outline-color': '#0d1117',
      'text-outline-width': 2,
      'text-outline-opacity': 0.8,
      'text-opacity': 1,
      // Read degree-scaled size from data (set by recomputeNodeRadii in
      // lib/graphDiff). Falls back to 32 when not yet computed. Storing as
      // data instead of inline style means removeStyle() during hover
      // cleanup doesn't wipe per-node sizing.
      width: (el: any) => (el.data('size') as number | undefined) ?? 32,
      height: (el: any) => (el.data('size') as number | undefined) ?? 32,
      'border-width': 0,
      // Halved shadow-blur (12 → 6) — shadow drawing is per-node per-frame
      // and dominates render cost in the cola simulation. Still gives a
      // faint colored glow; the hover override goes louder for emphasis.
      'shadow-blur': 6,
      'shadow-color': 'data(color)',
      'shadow-offset-x': 0,
      'shadow-offset-y': 0,
      'shadow-opacity': 0.5,
      'overlay-opacity': 0,
    } as any,
  },
  {
    selector: 'node[?isHub]',
    style: {
      shape: 'diamond',
      width: 44,
      height: 44,
      'background-opacity': 0.4,
      'shadow-opacity': 0.3,
      'shadow-blur': 8,
      'font-size': 10,
      'font-weight': 500,
      color: '#484f58',
    } as any,
  },
  // Ghost nodes (unresolved [[wikilinks]]) — visually distinct so users can
  // tell "this note doesn't exist yet, click to create" at a glance.
  {
    selector: 'node[?isGhost]',
    style: {
      'background-color': '#0d1117',
      'background-opacity': 0.4,
      'border-width': 1,
      'border-style': 'dashed',
      'border-color': '#9d4edd',
      'border-opacity': 0.6,
      'shadow-opacity': 0.2,
      'shadow-blur': 6,
      color: '#6e7681',
      'font-style': 'italic',
    } as any,
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': 2,
      'border-color': '#fb8500',
      'shadow-blur': 24,
      'shadow-opacity': 0.9,
      'background-opacity': 1,
      color: '#e6edf3',
    } as any,
  },
  // Marks the currently-focused note in a local graph view. Distinct from
  // :selected so we don't conflict with user click-selection.
  {
    selector: 'node.cy-focus',
    style: {
      'border-width': 2,
      'border-color': '#fb8500',
      'shadow-blur': 26,
      'shadow-opacity': 0.95,
      'background-opacity': 1,
      color: '#e6edf3',
      'text-opacity': 1,
    } as any,
  },
  // Edge style hierarchy follows vault/concepts/derived-edges.md §"Visual
  // differentiation". Strict order — author > AI-extracted > AI-derived >
  // scaffolding — keeps the canvas readable by tier alone, without legend.
  //
  // Base edge — `mentions` (note → entity, AI-extracted). Thin, neutral.
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
  // Phase 1 / Phase 4 derived — `related_to`. Algorithmic; dashed and dim.
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
  // Phase 2 derived — `about` (note → classification hub). Lowest opacity
  // since it's pure structural scaffolding.
  {
    selector: 'edge[edgeType="about"]',
    style: {
      'line-style': 'dotted',
      'line-color': '#21262d',
      width: 0.4,
      opacity: 0.15,
    } as any,
  },
  // Wikilinks (note ↔ note, author-stated) — loudest edge tier; the only one
  // a human explicitly authored.
  {
    selector: 'edge[edgeType="linked_to"]',
    style: {
      'line-style': 'solid',
      'line-color': '#9d4edd',
      width: 1.2,
      opacity: 0.7,
    } as any,
  },
  // Wikilinks pointing at not-yet-created notes — same tier, dashed treatment.
  {
    selector: 'edge[edgeType="linked_to_ghost"]',
    style: {
      'line-style': 'dashed',
      'line-color': '#9d4edd',
      'line-dash-pattern': [4, 4],
      width: 1.0,
      opacity: 0.55,
    } as any,
  },
  {
    selector: 'edge:selected',
    style: {
      'line-color': EDGE_COLOR_HOVER,
      opacity: 0.8,
      width: 1.5,
    },
  },
  // Class applied to all edges when the user is zoomed out past
  // LABEL_ZOOM_THRESHOLD. Hover/click handlers still override per-edge
  // opacity inline, so neighborhood spotlight continues to work.
  {
    selector: 'edge.cy-hidden-by-zoom',
    style: { opacity: 0 } as any,
  },
];
