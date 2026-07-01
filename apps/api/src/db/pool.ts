import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();                           // load .env defaults
dotenv.config({ path: '.env.local', override: true }); // local secrets override

const connectionString = process.env.DATABASE_URL;

// Enable SSL for any non-localhost host (Railway, hosted Postgres, etc.).
// Local Postgres on localhost/127.0.0.1 still connects without SSL.
const needsSsl = (() => {
  if (!connectionString) return false;
  try {
    const host = new URL(connectionString).hostname;
    return host !== 'localhost' && host !== '127.0.0.1';
  } catch {
    return false;
  }
})();

const pool = new Pool({
  connectionString,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  console.error('[db] Unexpected pool error:', err.message);
});

export default pool;
