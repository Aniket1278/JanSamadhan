# JanSamadhan

**An independent public complaint platform for India.** Citizens report local problems, find who is responsible, and follow every complaint until it is resolved. A public scorecard shows how responsive MPs and MLAs have been to verified complaints.

> JanSamadhan is a private, independent platform. It is **not** affiliated with, endorsed by, or authorized by the Government of India or any State Government.

<!-- Add screenshots here: homepage, submit form, tracking timeline, admin page, scorecard -->

---

## Features

| Area | What it does |
|---|---|
| **Location selector** | Dependent dropdowns: State/UT → District → Taluka → Village/City/Ward, loaded from the database |
| **Leaders & departments** | Shows the MP, MLA, Sarpanch, Councillor and departments for a location. Only details added with an **official source link** are shown. Nothing is invented or pre-filled |
| **Accounts** | Register with email and password. A 6-digit **email OTP** confirms a new account once. After that, users log in with email and password |
| **Complaints** | Title, description, category, location. Each gets a unique ID such as `JS-2026-AB12CD` |
| **Tracking** | Look up a complaint by ID and see a public timeline with official responses |
| **Statuses** | Submitted, Under Review, Verified, In Progress, Resolved, Rejected, Escalated |
| **Public directory** | Search and filter complaints by category and status |
| **Privacy** | Names and emails are never shown on complaints. Public pages say "Anonymous citizen" |
| **AI screening** (optional) | Each new complaint is rated *genuine*, *suspicious* or *spam* with a short reason. Only the admin sees it, and it never decides anything by itself |
| **Admin account** | Exactly one admin (enforced by the database) who reviews, changes status with a written explanation, or deletes complaints |
| **Officials** | Verified officials update complaints inside their own area only |
| **Scorecard** | How many verified complaints each MP/MLA's area has resolved, average days to resolve, and how many are pending over 30 days |

### Scorecard fairness rules
- Only complaints that reviewers **verified** are counted. Rejected and unreviewed ones are not.
- A resolution rate appears only after **10** verified complaints. Before that the page says "not enough data".
- It measures responsiveness to complaints filed **on this platform**, not a representative's full work. The page says so.
- Every representative is shown with the same metrics and an official source link.

---

## Tech stack

| Part | Technology |
|---|---|
| Frontend | React 18, Vite, React Router |
| Backend | Node.js, Express |
| Database | PostgreSQL 16 |
| Security | bcrypt password hashing, JWT sessions, Helmet, rate limiting, hashed one-time codes |
| Email | Gmail (App Password) or Brevo (HTTPS API) through Nodemailer |
| AI (optional) | Anthropic API, Claude Haiku |

---

## Project structure

```
jansamadhan/
├── frontend/              React + Vite app
│   ├── src/pages/         Home, Submit, Track, Directory, Scorecard, Login, Official, Admin
│   ├── src/LocationPicker.jsx
│   ├── src/api.js         fetch wrapper with JWT and readable errors
│   └── vercel.json        API proxy and page-refresh fix for Vercel
├── backend/               Express REST API
│   ├── src/server.js      all routes
│   ├── src/auth.js        JWT and role middleware
│   ├── src/mailer.js      Gmail / Brevo sending
│   ├── src/db.js          PostgreSQL connection
│   └── src/*.js           helper scripts (see below)
├── database/
│   ├── schema.sql         tables (safe to run again)
│   └── seed.sql           all states/UTs and Maharashtra districts
├── docker-compose.yml     PostgreSQL for local development
└── README.md
```

---

## Quick start (local)

**You need:** Node.js 18 or newer, and either Docker Desktop or PostgreSQL.

### 1. Database
With Docker (easiest):
```bash
docker compose up -d
```
This creates the database `jansamadhan` (user `jan`, password `jan`) and loads the tables and locations.

Without Docker, install PostgreSQL, create a database, and set `DATABASE_URL` in the next step to match your own user and password.

### 2. Backend
```bash
cd backend
cp .env.example .env        # Windows: copy .env.example .env
```
Open `.env` and set at least `JWT_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` (10+ characters). Then:
```bash
npm install
npm run db:init             # creates any missing tables
npm run seed-admin          # creates the one admin account
npm run dev
```
You should see `JanSamadhan API running` and `Database connected, tables found`.

### 3. Frontend
In a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173**.

### 4. First login
- **Admin:** log in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`, then open the **Admin** tab.
- **Citizen:** click Register. While testing without email settings, the 6-digit code prints in the **backend terminal** as `[dev only] OTP for ...`.

---

## Configuration (`backend/.env`)

| Variable | Purpose |
|---|---|
| `PORT` | API port (default 4000) |
| `CLIENT_URL` | Address of the frontend (`http://localhost:5173` locally) |
| `DATABASE_URL` | `postgres://USER:PASSWORD@HOST:PORT/DATABASE` |
| `JWT_SECRET` | Long random text used to sign login tokens |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Send OTP emails through Gmail. Needs 2-Step Verification and an App Password |
| `BREVO_API_KEY`, `MAIL_FROM` | Send emails through Brevo instead (works where Gmail ports are blocked) |
| `ANTHROPIC_API_KEY` | Turns on AI complaint screening. Without it complaints show "unchecked" |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | The single admin account, created by `npm run seed-admin` |
| `ADMIN_REQUIRES_OTP` | Set to `true` to also require an emailed code for the admin |
| `NODE_ENV` | Set to `production` when deployed. In development, OTP codes also print in the terminal |

Never upload `.env` to GitHub. It is already listed in `.gitignore`.

### Email setup
**Gmail:** turn on 2-Step Verification, create an App Password at `myaccount.google.com/apppasswords` **in the same account as `GMAIL_USER`**, and paste the 16 characters. Then run `npm run test-email`.

**Brevo (free, 300 emails a day):** add and verify your sender address in Brevo, create an API key, and set `BREVO_API_KEY` and `MAIL_FROM`.

### Backend scripts
| Command | What it does |
|---|---|
| `npm run dev` | Start the API with auto-restart |
| `npm start` | Start the API (production) |
| `npm run db:init` | Create missing tables and load locations. Safe to repeat |
| `npm run seed-admin` | Create or reset the admin. Run again after changing the admin password |
| `npm run check-admin` | Explain why admin login fails |
| `npm run test-email` | Send a test email and show the exact error if it fails |

---

## Adding data

**Representatives** (never pre-filled, and an official source URL is required). As the admin, send:
```
POST /api/admin/representatives
{ "role": "MLA", "name": "...", "party": "...", "constituency": "...",
  "source_url": "https://official-page", "location_ids": [12, 15] }
```
Link each one to every location they cover, because constituencies do not follow district borders.

**Officials:** register them as normal users, then in SQL:
```sql
UPDATE users SET role = 'official', location_id = <location id> WHERE email = 'official@example.com';
```
**More locations:** add rows to the `locations` table (`level` is `state`, `district`, `taluka` or `village`) or extend `database/seed.sql`.

---

## API overview

| Method | Path | Who |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login`, `/api/auth/verify-otp` | Anyone |
| GET | `/api/locations?parent=ID` | Anyone |
| GET | `/api/representatives?location=ID`, `/api/departments?location=ID` | Anyone |
| POST | `/api/complaints` | Logged-in citizen |
| GET | `/api/complaints`, `/api/complaints/:id`, `/api/scorecard`, `/api/stats` | Anyone |
| PATCH | `/api/complaints/:id/status` (explanation required) | Official in area, or admin |
| GET / DELETE | `/api/admin/complaints`, `/api/admin/complaints/:id` | Admin |
| POST | `/api/admin/representatives` | Admin |

---

## Security and privacy
- Passwords are stored as bcrypt hashes. OTP codes are stored hashed, expire in 10 minutes, and allow 5 attempts.
- Login tokens (JWT) last 7 days. Roles are checked on the server for every protected route.
- Public endpoints never return a user's name, email or ID.
- Rate limiting, Helmet security headers and input checks protect the API.
- The AI check treats complaint text as data, only advises human reviewers, and its result is never shown publicly.
- Leaders and officials are shown only with an official source. The platform never guesses names.

---

## Deployment
Use three free services: **Neon** (database), **Render** (backend), **Vercel** (frontend).

1. **Neon:** create a project and copy the connection string (ends with `?sslmode=require`).
2. **Render:** new Web Service, Root Directory `backend`, Build `npm install`, Start `npm start`. Set `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `BREVO_API_KEY`, `MAIL_FROM`. Free hosts block Gmail's ports, so use Brevo.
3. **Create tables and admin once:** put the Neon string in your local `backend/.env`, run `npm run db:init` and `npm run seed-admin`, then change it back.
4. **Vercel:** import the repo, set **Root Directory** to `frontend`. In `frontend/vercel.json`, replace `YOUR-BACKEND-URL` with your Render address, commit and push, then deploy.
5. Set `CLIENT_URL` on Render to your final Vercel address and redeploy the backend.

Render's free plan sleeps when idle, so the first request after a break can take about a minute.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "Cannot reach the server" or "Request failed" | The backend is not running. Start it with `npm run dev` in `backend` |
| `DATABASE PROBLEM` at startup | Check `DATABASE_URL`, start Docker, then run `npm run db:init` |
| Admin cannot log in | Run `npm run check-admin`. After editing `ADMIN_PASSWORD`, run `npm run seed-admin` again. A password containing `#` must be in quotes in `.env` |
| `535 Username and Password not accepted` | Wrong App Password. Create a new one in the same Gmail account as `GMAIL_USER`, then **restart the backend** |
| OTP email missing | Run `npm run test-email`, check Spam, or switch to Brevo. The code also prints in the backend terminal during development |
| "Wrong code" | Only the newest code works. Each registration or login attempt creates a new one |
| "Email already registered" | Use Log in. An unfinished sign-up can simply be registered again |
| `.env` changes ignored | Restart the backend. It reads `.env` only when it starts |

Run every backend command from inside the `backend` folder, because that is where `.env` is read.

---

## Current limits and roadmap
Not built yet:
- Photo and document upload
- Email or SMS notifications for status changes
- Automatic escalation of overdue complaints
- Admin screens for managing users, locations, departments and representatives (today this is done through the API or SQL)
- Hindi and Marathi translations
- Automated tests
- Complete locations: only Maharashtra districts are seeded, and talukas and villages must be added

---

## License
Choose a license before making the repository public, for example MIT.
