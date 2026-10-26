import 'dotenv/config';
import bcrypt from 'bcrypt';
import { pool } from './db.js';

// Creates (or resets) the single admin account. The database allows only one admin.
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_EMAIL || (ADMIN_PASSWORD || '').length < 10) {
  console.error('Set ADMIN_EMAIL and a 10+ character ADMIN_PASSWORD in backend/.env, then run this again.');
  process.exit(1);
}
try {
  await pool.query(`UPDATE users SET role='citizen' WHERE role='admin' AND email <> lower($1)`, [ADMIN_EMAIL]); // only one admin allowed
  await pool.query(
    `INSERT INTO users(name,email,password_hash,role,email_verified) VALUES('Admin',lower($1),$2,'admin',true)
     ON CONFLICT (email) DO UPDATE SET password_hash=$2, role='admin', email_verified=true`,
    [ADMIN_EMAIL, await bcrypt.hash(ADMIN_PASSWORD, 12)]);
  console.log('Admin ready. Log in with:', ADMIN_EMAIL.toLowerCase());
} catch (e) {
  console.error('Could not create admin:', e.message, '\nRun "npm run db:init" first and check DATABASE_URL.');
  process.exitCode = 1;
}
await pool.end();
