import type { Core, ElementDefinition } from 'cytoscape';
import type { CytoscapeElement } from './graphUtils';

/**
 * Patch a Cytoscape instance toward a target element set without tearing it
 * down. Lets the physics simulation keep running while nodes appear/disappear,
 * so the graph feels alive rather than rebuilt.
 *
 * New nodes seed their position from the average position of already-present
 * neighbors (plus a small random jitter so coincident nodes can separate). If
 * a new node has no existing neighbors, it spawns near the canvas center.
 *
 * Existing nodes keep their current positions; the physics runner will
 * re-settle the system after this returns. Call `physics.wake()` after this
 * to resume the rAF loop if it had paused at rest.
 */
export function applyGraphDiff(cy: Core, targetElements: CytoscapeElement[]): boolean {
  const targetNodes: ElementDefinition[] = [];
  const targetEdges: ElementDefinition[] = [];
  for (const el of targetElements) {
    if ('source' in el.data) targetEdges.push(el as ElementDefinition);
    else targetNodes.push(el as ElementDefinition);
  }

  const targetNodeIds = new Set(targetNodes.map(n => n.data.id as string));
  const targetEdgeIds = new Set(targetEdges.map(e => e.data.id as string));
  const currentNodeIds = new Set(cy.nodes().map(n => n.id()));
  const currentEdgeIds = new Set(cy.edges().map(e => e.id()));

  const addedNodes = targetNodes.filter(n => !currentNodeIds.has(n.data.id as string));
  const removedNodeIds: string[] = [];
  currentNodeIds.forEach(id => { if (!targetNodeIds.has(id)) removedNodeIds.push(id); });
  const addedEdges = targetEdges.filter(e => !currentEdgeIds.has(e.data.id as string));
  const removedEdgeIds: string[] = [];
  currentEdgeIds.forEach(id => { if (!targetEdgeIds.has(id)) removedEdgeIds.push(id); });

  // Build neighbor lookup from target edges so new nodes can seed near
  // already-existing graph neighbors.
  const neighborsByNode = new Map<string, string[]>();
  for (const e of targetEdges) {
    const s = e.data.source as string;
    const t = e.data.target as string;
    (neighborsByNode.get(s) ?? neighborsByNode.set(s, []).get(s)!).push(t);
    (neighborsByNode.get(t) ?? neighborsByNode.set(t, []).get(t)!).push(s);
  }

  const noChanges =
    addedNodes.length === 0 &&
    removedNodeIds.length === 0 &&
    addedEdges.length === 0 &&
    removedEdgeIds.length === 0;
  if (noChanges) return false;

  cy.batch(() => {
    if (removedEdgeIds.length) {
      cy.edges().filter(e => removedEdgeIds.includes(e.id())).remove();
    }
    if (removedNodeIds.length) {
      cy.nodes().filter(n => removedNodeIds.includes(n.id())).remove();
    }

    const centerX = cy.width() / 2;
    const centerY = cy.height() / 2;
    const jitter = () => (Math.random() - 0.5) * 30;

    for (const node of addedNodes) {
      const id = node.data.id as string;
      const neighborIds = neighborsByNode.get(id) ?? [];
      let seedX = centerX + jitter();
      let seedY = centerY + jitter();
      let count = 0;
      let sumX = 0;
      let sumY = 0;
      for (const nid of neighborIds) {
        const existing = cy.getElementById(nid);
        if (existing && existing.length > 0 && existing.isNode()) {
          const p = existing.position();
          sumX += p.x;
          sumY += p.y;
          count++;
        }
      }
      if (count > 0) {
        seedX = sumX / count + jitter();
        seedY = sumY / count + jitter();
      }
      cy.add({ ...node, position: { x: seedX, y: seedY } });
    }

    if (addedEdges.length) {
      cy.add(addedEdges);
    }
  });

  return true;
}

/**
 * Recompute degree-scaled node sizes. Leaves sit at 32px diameter, the most
 * connected node sits at 80px, everything else interpolates. Hub nodes
 * (classification anchors) get a fixed 44px size.
 *
 * Sizes are stored as node **data** (`size`), not inline style, so they
 * survive the `cy.nodes().removeStyle()` calls that clearSpotlight uses to
 * reset hover bypasses. The stylesheet's `width`/`height` read this data.
 */
export function recomputeNodeRadii(cy: Core): void {
  const nodes = cy.nodes();
  const maxDeg = nodes.reduce((m, n) => Math.max(m, n.degree(true)), 0) || 1;
  cy.batch(() => {
    nodes.forEach(n => {
      if (n.data('isHub')) {
        n.data('size', 44);
        return;
      }
      const r = 16 + (n.degree(true) / maxDeg) * 24;
      n.data('size', r * 2);
    });
  });
}
