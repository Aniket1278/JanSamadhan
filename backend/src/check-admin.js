import 'dotenv/config';
import bcrypt from 'bcrypt';
import { pool } from './db.js';

// Run: npm run check-admin   (tells you exactly why the admin login fails)
const { ADMIN_EMAIL, ADMIN_PASSWORD, GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
const ok = m => console.log('OK    ' + m), fix = m => console.log('FIX   ' + m);
try {
  ADMIN_EMAIL ? ok('ADMIN_EMAIL is ' + ADMIN_EMAIL) : fix('ADMIN_EMAIL is empty in backend/.env');
  if (!ADMIN_PASSWORD) fix('ADMIN_PASSWORD is empty in backend/.env');
  else if (ADMIN_PASSWORD.length < 10) fix(`ADMIN_PASSWORD was read as only ${ADMIN_PASSWORD.length} characters. It needs 10+. If it contains a # sign, wrap the whole password in quotes: ADMIN_PASSWORD="your#password"`);
  else ok(`ADMIN_PASSWORD was read as ${ADMIN_PASSWORD.length} characters (check this matches what you type)`);
  if (/@example\.com$/i.test(ADMIN_EMAIL || '')) fix('ADMIN_EMAIL is a placeholder. The login code is sent there, so use an inbox you can open.');

  const { rows: [u] } = await pool.query('SELECT role, password_hash FROM users WHERE email = lower($1)', [ADMIN_EMAIL || '']);
  if (!u) fix('No account exists for this email. Run: npm run seed-admin');
  else {
    u.role === 'admin' ? ok('Account exists and is the admin') : fix('Account exists but is not admin. Run: npm run seed-admin');
    (await bcrypt.compare(ADMIN_PASSWORD || '', u.password_hash)) ? ok('ADMIN_PASSWORD matches the saved password')
      : fix('ADMIN_PASSWORD in .env differs from the saved one. Run: npm run seed-admin again');
  }
  const gmail = GMAIL_USER && GMAIL_APP_PASSWORD && !GMAIL_USER.startsWith('yourapp');
  console.log(gmail ? `INFO  Login code is emailed to ${ADMIN_EMAIL} and also printed in the backend terminal.`
                    : 'INFO  Gmail is off, so the login code prints in the backend terminal.');
} catch (e) { fix('Database problem: ' + e.message + '  -> run npm run db:init and check DATABASE_URL'); }
await pool.end();
