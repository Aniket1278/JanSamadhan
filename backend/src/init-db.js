import 'dotenv/config';
import fs from 'node:fs';
import { pool } from './db.js';

// Safe to run any number of times: creates missing tables and loads locations only if none exist.
const dir = new URL('../../database/', import.meta.url);
try {
  await pool.query(fs.readFileSync(new URL('schema.sql', dir), 'utf8'));
  const { rows } = await pool.query('SELECT count(*)::int AS n FROM locations');
  if (!rows[0].n) await pool.query(fs.readFileSync(new URL('seed.sql', dir), 'utf8'));
  console.log('Database ready.');
} catch (e) {
  console.error('Database setup failed:', e.message, '\nCheck DATABASE_URL in backend/.env');
  process.exitCode = 1;
}
await pool.end();
