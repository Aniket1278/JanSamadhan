import 'dotenv/config';
import { sendMail, emailMode } from './mailer.js';

// Usage: npm run test-email            (sends to yourself)
//        npm run test-email -- someone@example.com
const to = process.argv[2] || process.env.MAIL_FROM || process.env.GMAIL_USER;
if (!emailMode()) {
  console.error('Add GMAIL_USER + GMAIL_APP_PASSWORD (or BREVO_API_KEY + MAIL_FROM) to backend/.env first.');
  process.exit(1);
}
console.log(`Sending a test email via ${emailMode()} to ${to} ...`);
try {
  await sendMail(to, 'JanSamadhan test email', 'Email sending works.');
  console.log('Success. Check the inbox and the Spam folder of', to);
} catch (e) {
  console.error('Failed:', e.message);
  if (/535|Invalid login|Username and Password/i.test(e.message))
    console.error('-> Gmail rejected the login. Use a 16-character App Password (not your normal password); 2-Step Verification must be on.');
  else if (/ENOTFOUND|ETIMEDOUT|ECONNREFUSED|ECONNRESET|Timeout|fetch failed/i.test(e.message))
    console.error('-> Your network is blocking email (common on college Wi-Fi). Try a mobile hotspot, or use Brevo (see README).');
}
