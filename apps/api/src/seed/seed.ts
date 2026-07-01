/**
 * Consilium MVP Seed Script
 *
 * Seeds the database with:
 *   1. Three demo user accounts (PRD §2.1)
 *   2. Lawyer entity nodes for the full firm roster (12–15 lawyers; the 3 demo
 *      accounts get both a `users` row and a `lawyer`-type team-graph node).
 *   3. Entity nodes for matters, judges, opposing firms, expert witnesses,
 *      legal concepts, precedents, and statutes.
 *   4. Published insight nodes authored by various firm lawyers.
 *   5. Derived edges from insight metadata (authored_by, mentions, about,
 *      cites, involves, concerns) plus hand-authored related_to edges.
 *   6. Obsidian-style derived edges via deriveAllEdges (shared-entity,
 *      embedding-similarity, entity co-occurrence).
 *
 * Idempotent: checks for existing data before inserting.
 * Run: `npm run seed` or `POST /api/seed`
 */

import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

import bcrypt from 'bcrypt';
import pool from '../db/pool';
import { insertNode, insertEdge, getNodeCount } from '../db/queries';
import { generateEmbedding } from '../services/embedding';
import {
  FIRM_LAWYERS,
  ENTITIES,
  INSIGHTS,
  HAND_AUTHORED_EDGES,
  type SeedLawyer,
} from './team-graph.seed';
import { deriveAllEdges } from './deriveEdges';

const BCRYPT_ROUNDS = 10;

// ─── Demo Accounts (PRD §2.1) ──────────────────────────────────────────────
// Display names are the authoritative roster for the 3 user-accounted lawyers.
// FIRM_LAWYERS in team-graph.seed.ts MUST keep names + emails in sync.

const demoUsers = [
  {
    email: 'litigator@acme.law',
    password: 'demo',
    display_name: 'Ana Mendoza',
    role: 'lawyer',
  },
  {
    email: 'lead@acme.law',
    password: 'demo',
    display_name: 'Carlos Reyes',
    role: 'practice_group_lead',
  },
  {
    email: 'admin@acme.law',
    password: 'demo',
    display_name: 'Diana Santos',
    role: 'knowledge_admin',
  },
];

/**
 * Insert the 3 demo accounts. Returns an email → user_id map so the team-graph
 * loader can resolve `contributor_id` for insights authored by accounted users.
 */
async function seedUsers(): Promise<Map<string, string>> {
  const emailToId = new Map<string, string>();

  const existing = await pool.query<{ id: string; email: string }>(
    'SELECT id, email FROM users'
  );
  if (existing.rows.length > 0) {
    console.log('[seed] Users already exist, skipping creation.');
    for (const row of existing.rows) {
      emailToId.set(row.email, row.id);
    }
    return emailToId;
  }

  for (const user of demoUsers) {
    const hash = await bcrypt.hash(user.password, BCRYPT_ROUNDS);
    const result = await pool.query<{ id: string }>(
      `INSERT INTO users (email, password_hash, display_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [user.email, hash, user.display_name, user.role]
    );
    emailToId.set(user.email, result.rows[0].id);
    console.log(`[seed] Created user: ${user.email} (${user.role})`);
  }

  return emailToId;
}

/**
 * Override created_at on a freshly inserted node so demo timestamps span the
 * 2–3 year history rather than collapsing to insert-time.
 */
async function setNodeTimestamp(nodeId: string, isoTimestamp: string): Promise<void> {
  await pool.query(
    `UPDATE team_graph_nodes SET created_at = $1, updated_at = $1 WHERE id = $2`,
    [isoTimestamp, nodeId]
  );
}

async function seedTeamGraph(emailToUserId: Map<string, string>): Promise<void> {
  const count = await getNodeCount();
  if (count > 0) {
    console.log(`[seed] Team graph already has ${count} nodes, skipping.`);
    return;
  }

  // Placeholder ID → real UUID maps
  const lawyerMap = new Map<string, string>();  // lawyer placeholder → entity node UUID
  const entityMap = new Map<string, string>();  // every entity placeholder → entity node UUID
  const insightMap = new Map<string, string>(); // insight placeholder → insight node UUID

  // ─── Pass 1: lawyer entity nodes ────────────────────────────────────────
  // Every firm lawyer gets a `lawyer`-type node so `authored_by` edges have a
  // target. The 3 demo-account lawyers ALSO live in the `users` table.
  console.log(`[seed] Inserting ${FIRM_LAWYERS.length} lawyer entity nodes...`);
  for (const lawyer of FIRM_LAWYERS) {
    const embText = `${lawyer.name} ${lawyer.role}${lawyer.specialty ? ' ' + lawyer.specialty : ''}`;
    const embedding = await generateEmbedding(embText);
    const id = await insertNode({
      node_type: 'lawyer',
      title: lawyer.name,
      summary: lawyerSummary(lawyer),
      embedding,
      metadata: {
        role: lawyer.role,
        specialty: lawyer.specialty,
        userEmail: lawyer.userEmail,
        isFirmLawyer: true,
      },
    });
    lawyerMap.set(lawyer.placeholderId, id);
    entityMap.set(lawyer.placeholderId, id);
  }

  // ─── Pass 2: matter / judge / opposing-firm / witness / concept / precedent / statute ──
  console.log(`[seed] Inserting ${ENTITIES.length} entity nodes...`);
  for (const ent of ENTITIES) {
    const embText = `${ent.name}${ent.description ? '. ' + ent.description : ''}`;
    const embedding = await generateEmbedding(embText);
    const id = await insertNode({
      node_type: ent.type,
      title: ent.name,
      body: ent.description,
      summary: ent.description
        ? ent.description.split(/(?<=\.)\s+/)[0]
        : ent.name,
      embedding,
      metadata: ent.metadata,
    });
    entityMap.set(ent.placeholderId, id);
  }

  // ─── Pass 3: insight nodes ──────────────────────────────────────────────
  console.log(`[seed] Inserting ${INSIGHTS.length} insight nodes (embedding each)...`);
  for (let i = 0; i < INSIGHTS.length; i++) {
    const insight = INSIGHTS[i];
    if ((i + 1) % 10 === 0 || i === 0) {
      console.log(`[seed]   (${i + 1}/${INSIGHTS.length}) ${insight.title}`);
    }

    const author = FIRM_LAWYERS.find(
      (l) => l.placeholderId === insight.authorPlaceholderId
    );
    const contributorId = author?.userEmail
      ? emailToUserId.get(author.userEmail)
      : undefined;

    const embedding = await generateEmbedding(`${insight.title}\n${insight.body}`);
    const id = await insertNode({
      node_type: 'insight',
      title: insight.title,
      body: insight.body,
      summary: insight.summary,
      contributor_id: contributorId,
      source_personal_note_id: insight.sourcePersonalNotePlaceholderId,
      embedding,
      metadata: {
        classification: insight.classification,
        ...insight.metadata,
      },
    });
    await setNodeTimestamp(id, insight.createdAt);
    insightMap.set(insight.placeholderId, id);
  }

  // ─── Pass 4: derived edges from insight metadata ────────────────────────
  console.log('[seed] Building insight→entity edges from metadata...');
  let derivedEdgeCount = 0;
  for (const insight of INSIGHTS) {
    const insightId = insightMap.get(insight.placeholderId)!;

    // authored_by → lawyer entity
    const authorEntityId = lawyerMap.get(insight.authorPlaceholderId);
    if (authorEntityId) {
      await insertEdge({
        source_node_id: insightId,
        target_node_id: authorEntityId,
        edge_type: 'authored_by',
      });
      derivedEdgeCount++;
    }

    const edgeRefs: Array<[readonly string[] | undefined, string]> = [
      [insight.mentions, 'mentions'],
      [insight.about, 'about'],
      [insight.cites, 'cites'],
      [insight.involves, 'involves'],
      [insight.concerns, 'concerns'],
    ];
    for (const [refs, edgeType] of edgeRefs) {
      if (!refs) continue;
      for (const ref of refs) {
        const targetId = entityMap.get(ref);
        if (!targetId) {
          console.warn(
            `[seed]   missing placeholder "${ref}" referenced by insight "${insight.placeholderId}" (${edgeType})`
          );
          continue;
        }
        await insertEdge({
          source_node_id: insightId,
          target_node_id: targetId,
          edge_type: edgeType,
        });
        derivedEdgeCount++;
      }
    }
  }
  console.log(`[seed] Created ${derivedEdgeCount} derived edges from insight metadata.`);

  // ─── Pass 5: hand-authored edges (cross-insight related_to + curated others) ─
  console.log(`[seed] Inserting ${HAND_AUTHORED_EDGES.length} hand-authored edges...`);
  let handAuthoredCount = 0;
  for (const edge of HAND_AUTHORED_EDGES) {
    const sourceId = insightMap.get(edge.source) ?? entityMap.get(edge.source);
    const targetId = insightMap.get(edge.target) ?? entityMap.get(edge.target);
    if (!sourceId || !targetId) {
      console.warn(
        `[seed]   skipping edge ${edge.source} → ${edge.target} (${edge.type}): unresolved placeholder`
      );
      continue;
    }
    await insertEdge({
      source_node_id: sourceId,
      target_node_id: targetId,
      edge_type: edge.type,
      weight: edge.weight ?? 1.0,
    });
    handAuthoredCount++;
  }
  console.log(`[seed] Inserted ${handAuthoredCount} hand-authored edges.`);

  const finalCount = await getNodeCount();
  console.log(`[seed] Team graph seeded with ${finalCount} total nodes.`);
}

function lawyerSummary(lawyer: SeedLawyer): string {
  const roleText: Record<SeedLawyer['role'], string> = {
    partner: 'Partner',
    practice_group_lead: 'Partner & Practice Group Lead',
    senior_counsel: 'Senior Counsel',
    senior_associate: 'Senior Associate',
    mid_associate: 'Mid-level Associate',
    junior_associate: 'Junior Associate',
  };
  const base = roleText[lawyer.role] ?? lawyer.role;
  return lawyer.specialty ? `${base} — ${lawyer.specialty}` : base;
}

/**
 * Truncate users + team graph tables. ON DELETE CASCADE on team_graph_edges
 * means clearing nodes is sufficient for the graph side, but we TRUNCATE
 * explicitly so the operation is reviewable in logs.
 *
 * Gated behind a CLI flag so it cannot fire by accident. The flag must be
 * passed explicitly: `npm run seed -- --reset`.
 */
async function resetSeedTables(): Promise<void> {
  console.log('[seed] --reset specified: TRUNCATING users + team_graph_nodes + team_graph_edges...');
  // Order matters less due to CASCADE, but TRUNCATE ... CASCADE is explicit.
  await pool.query(
    'TRUNCATE TABLE team_graph_edges, team_graph_nodes, users RESTART IDENTITY CASCADE'
  );
  console.log('[seed] Reset complete. All seed-managed tables are empty.');
}

export async function runSeed(options: { reset?: boolean } = {}): Promise<{ users: number; nodes: number }> {
  console.log('[seed] Starting Consilium seed...');

  if (options.reset) {
    await resetSeedTables();
  }

  const emailToUserId = await seedUsers();
  await seedTeamGraph(emailToUserId);

  console.log('[seed] Deriving Obsidian-style graph connections...');
  const derived = await deriveAllEdges();
  console.log(
    `[seed] Derived edges: ${derived.sharedEntity} shared-entity, ${derived.embeddingSimilarity} embedding-similarity, ${derived.entityCooccurrence} co-occurrence`
  );

  const userCount = await pool.query('SELECT COUNT(*)::int AS count FROM users');
  const nodeCount = await getNodeCount();
  const edgeCount = await pool.query(
    'SELECT COUNT(*)::int AS count FROM team_graph_edges'
  );

  console.log('[seed] Seed complete.');
  console.log(`[seed] Users: ${userCount.rows[0].count}`);
  console.log(`[seed] Team graph nodes: ${nodeCount}`);
  console.log(`[seed] Team graph edges: ${edgeCount.rows[0].count}`);

  return { users: userCount.rows[0].count, nodes: nodeCount };
}

// Run directly if executed as a script.
// CLI: `npm run seed` (idempotent) or `npm run seed -- --reset` (wipe first).
if (require.main === module) {
  const reset = process.argv.includes('--reset');
  if (reset) {
    console.log('[seed] WARNING: --reset will TRUNCATE users, team_graph_nodes, team_graph_edges.');
    console.log('[seed] Connected to:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@'));
  }
  runSeed({ reset })
    .then(() => pool.end())
    .catch((err) => {
      console.error('[seed] Fatal error:', err);
      pool.end();
      process.exit(1);
    });
}
