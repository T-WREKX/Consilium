import { readFileSync } from 'fs';
import { join } from 'path';
import pool from './pool';

/**
 * Run schema.sql against the database.
 * Idempotent — all CREATE statements use IF NOT EXISTS.
 */
async function runSchema() {
  const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');

  try {
    await pool.query(sql);
    console.log('[schema] Database schema applied successfully.');
  } catch (err) {
    console.error('[schema] Failed to apply schema:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSchema();
