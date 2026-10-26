import nodemailer from 'nodemailer';

const gmailReady = () => process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD && !process.env.GMAIL_USER.startsWith('yourapp');
export const emailMode = () => (process.env.BREVO_API_KEY ? 'Brevo' : gmailReady() ? 'Gmail' : null);

// Short timeouts so a blocked network fails in seconds instead of hanging for minutes
const gmail = port => nodemailer.createTransport({
  host: 'smtp.gmail.com', port, secure: port === 465,
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, '') },
  connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
});

// Sends one email. Brevo (normal HTTPS, works on most networks) if configured, else Gmail on port 465, then 587.
export async function sendMail(to, subject, text) {
  if (process.env.BREVO_API_KEY) {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST', signal: AbortSignal.timeout(15000),
      headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({ sender: { name: 'JanSamadhan', email: process.env.MAIL_FROM || process.env.GMAIL_USER },
        to: [{ email: to }], subject, textContent: text }),
    });
    if (!r.ok) throw new Error('Brevo said: ' + (await r.text()).slice(0, 200));
    return;
  }
  if (!gmailReady()) throw new Error('Email is not set up. Add Gmail or Brevo details to backend/.env');
  let last;
  for (const port of [465, 587]) {
    try { await gmail(port).sendMail({ from: `JanSamadhan <${process.env.GMAIL_USER}>`, to, subject, text }); return; }
    catch (e) { last = e; }
  }
  throw last;
}
