import type { Core } from 'cytoscape';

/**
 * Obsidian-style force-directed graph physics.
 *
 * Four forces, all balanced against velocity damping so the system settles
 * at equilibrium rather than oscillating forever:
 *
 *   1. Repulsion — every node pushes every other node (Coulombic, F = repelForce / d²)
 *   2. Link spring — Hookean spring along edges (F = (d - linkDistance) * linkForce)
 *   3. Link distance — preferred rest length of the spring
 *   4. Center — gentle pull toward canvas center (prevents drift to infinity)
 *
 * Plus damping: velocities decay by `damping` per frame so kinetic energy
 * dissipates and the system reaches rest.
 *
 * When the system stays below `restKineticEnergy` for `restFramesRequired`
 * frames, the rAF loop pauses to save CPU. Call `wake()` after user
 * interaction (e.g., drag-release) to resume.
 */
export interface PhysicsConfig {
  /** Strength of the center-attracting force. */
  centerForce: number;
  /** Coulombic repulsion constant. F = repelForce / d². */
  repelForce: number;
  /** Hookean spring constant for connected edges. */
  linkForce: number;
  /** Natural rest length of edge springs (pixels). */
  linkDistance: number;
  /** Velocity multiplier per frame (1 = no damping, 0 = instant stop). */
  damping: number;
  /** Max per-frame node speed in pixels (clamps runaway). */
  maxSpeed: number;
  /** Total system KE threshold below which the simulation considers itself at rest. */
  restKineticEnergy: number;
  /** Consecutive at-rest frames required before pausing the rAF loop. */
  restFramesRequired: number;
  /**
   * Random per-frame force injected into every free node. Acts like thermal
   * jitter — keeps the system continuously breathing instead of fully dying,
   * which is what gives Obsidian's graph its "alive" feel.
   */
  thermalNoise: number;
}

export const DEFAULT_PHYSICS: PhysicsConfig = {
  centerForce: 0.0004,
  repelForce: 750,
  linkForce: 0.04,
  linkDistance: 120,
  damping: 0.92,
  maxSpeed: 4.0,
  restKineticEnergy: 0.001,
  restFramesRequired: 600,
  thermalNoise: 0.025,
};

export interface PhysicsRunner {
  /** Begin or resume the simulation. No-op if already running. */
  start: () => void;
  /** Cancel the rAF loop. Stable positions preserved. */
  stop: () => void;
  /** Resume after rest. Call this when injecting energy (drag-release, new node, etc.). */
  wake: () => void;
  /** Set a node's velocity directly (used for drag-release momentum). Wakes the loop. */
  setNodeVelocity: (id: string, vx: number, vy: number) => void;
  /** Whether the rAF loop is currently active. */
  isRunning: () => boolean;
}

/**
 * Create a physics runner bound to a Cytoscape core. The runner manages its
 * own per-node velocity state; the caller provides a pin predicate so dragged
 * nodes are excluded from force integration.
 */
export function createPhysicsRunner(
  cy: Core,
  isPinned: (id: string) => boolean,
  config: Partial<PhysicsConfig> = {},
): PhysicsRunner {
  const cfg: PhysicsConfig = { ...DEFAULT_PHYSICS, ...config };
  const vel = new Map<string, [number, number]>();
  cy.nodes().forEach(n => { vel.set(n.id(), [0, 0]); });

  let rafId = 0;
  let restingFrames = 0;

  const tick = () => {
    const cxP = cy.width() / 2;
    const cyP = cy.height() / 2;
    let totalKE = 0;

    // Snapshot positions so all force calculations see a consistent state
    const allPos = new Map<string, { x: number; y: number }>();
    cy.nodes().forEach(n => {
      const id = n.id();
      if (!vel.has(id)) vel.set(id, [0, 0]); // handle nodes added since init
      allPos.set(id, { ...n.position() });
    });

    cy.batch(() => {
      cy.nodes().forEach(n => {
        const id = n.id();
        if (isPinned(id)) return;

        const pos = allPos.get(id);
        if (!pos) return;

        let fx = 0;
        let fy = 0;

        // 1. Center pull
        fx += (cxP - pos.x) * cfg.centerForce;
        fy += (cyP - pos.y) * cfg.centerForce;

        // 2. Repulsion (every other node)
        cy.nodes().forEach(m => {
          const mid = m.id();
          if (mid === id) return;
          const mp = allPos.get(mid);
          if (!mp) return;
          const dx = pos.x - mp.x;
          const dy = pos.y - mp.y;
          const d2 = Math.max(dx * dx + dy * dy, 4);
          const d = Math.sqrt(d2);
          fx += (dx / d) * (cfg.repelForce / d2);
          fy += (dy / d) * (cfg.repelForce / d2);
        });

        // 3 & 4. Spring along each connected edge (rest length = linkDistance)
        n.connectedEdges().forEach(e => {
          const other = e.source().id() === id ? e.target() : e.source();
          const op = allPos.get(other.id());
          if (!op) return;
          const dx = op.x - pos.x;
          const dy = op.y - pos.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const stretch = (d - cfg.linkDistance) * cfg.linkForce;
          fx += (dx / d) * stretch;
          fy += (dy / d) * stretch;
        });

        // 5. Thermal jitter — small random per-frame impulse so the system
        // never fully dies. The springs and center force keep nodes from
        // drifting; this just adds the subtle continuous motion that makes
        // a graph feel alive instead of frozen.
        fx += (Math.random() - 0.5) * cfg.thermalNoise;
        fy += (Math.random() - 0.5) * cfg.thermalNoise;

        // Integrate with damping + speed clamp
        const v = vel.get(id) ?? [0, 0];
        let vx = v[0] * cfg.damping + fx;
        let vy = v[1] * cfg.damping + fy;
        const spd = Math.sqrt(vx * vx + vy * vy);
        if (spd > cfg.maxSpeed) {
          vx = (vx / spd) * cfg.maxSpeed;
          vy = (vy / spd) * cfg.maxSpeed;
        }
        vel.set(id, [vx, vy]);
        totalKE += vx * vx + vy * vy;
        n.position({ x: pos.x + vx, y: pos.y + vy });
      });
    });

    if (totalKE < cfg.restKineticEnergy) {
      restingFrames++;
      if (restingFrames >= cfg.restFramesRequired) {
        rafId = 0;
        return;
      }
    } else {
      restingFrames = 0;
    }
    rafId = requestAnimationFrame(tick);
  };

  return {
    start: () => {
      if (rafId) return;
      restingFrames = 0;
      rafId = requestAnimationFrame(tick);
    },
    stop: () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    },
    wake: () => {
      restingFrames = 0;
      if (!rafId) rafId = requestAnimationFrame(tick);
    },
    setNodeVelocity: (id, vx, vy) => {
      vel.set(id, [vx, vy]);
      restingFrames = 0;
      if (!rafId) rafId = requestAnimationFrame(tick);
    },
    isRunning: () => rafId !== 0,
  };
}
