-- JanSamadhan schema (PostgreSQL 15+)
CREATE TABLE IF NOT EXISTS locations (            -- one self-referencing table: state > district > taluka > village/ward
  id        SERIAL PRIMARY KEY,
  parent_id INT REFERENCES locations(id),
  level     TEXT NOT NULL CHECK (level IN ('state','district','taluka','village')),
  name      TEXT NOT NULL,
  UNIQUE (parent_id, name)
);

CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  email          TEXT UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  role           TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen','official','admin')),
  email_verified BOOLEAN NOT NULL DEFAULT false,
  verify_token   TEXT,
  location_id    INT REFERENCES locations(id),   -- an official's jurisdiction
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS representatives (      -- empty on purpose: add only after checking an official source
  id           SERIAL PRIMARY KEY,
  role         TEXT NOT NULL CHECK (role IN ('MP','MLA','Sarpanch','Councillor')),
  name         TEXT NOT NULL,
  party        TEXT,
  constituency TEXT,
  source_url   TEXT NOT NULL,       -- official page proving the details
  active       BOOLEAN NOT NULL DEFAULT true,
  verified_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Constituencies do not follow district borders, so link each representative to every area they cover
CREATE TABLE IF NOT EXISTS representative_locations (
  representative_id INT REFERENCES representatives(id) ON DELETE CASCADE,
  location_id       INT REFERENCES locations(id),
  PRIMARY KEY (representative_id, location_id)
);

CREATE TABLE IF NOT EXISTS departments (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT,
  location_id INT REFERENCES locations(id),
  contact_url TEXT
);

CREATE TABLE IF NOT EXISTS complaints (
  id          TEXT PRIMARY KEY,     -- JS-2026-AB12CD
  user_id     UUID NOT NULL REFERENCES users(id),
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  category    TEXT NOT NULL,
  location_id INT NOT NULL REFERENCES locations(id),
  status      TEXT NOT NULL DEFAULT 'Submitted'
              CHECK (status IN ('Submitted','Under Review','Verified','In Progress','Resolved','Rejected','Escalated')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS complaints_status_idx ON complaints (status, created_at DESC);
CREATE INDEX IF NOT EXISTS complaints_location_idx ON complaints (location_id);

CREATE TABLE IF NOT EXISTS complaint_representatives (
  complaint_id      TEXT REFERENCES complaints(id) ON DELETE CASCADE,
  representative_id INT  REFERENCES representatives(id),
  PRIMARY KEY (complaint_id, representative_id)
);

CREATE TABLE IF NOT EXISTS complaint_events (     -- public timeline
  id           SERIAL PRIMARY KEY,
  complaint_id TEXT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  status       TEXT NOT NULL,
  note         TEXT,
  actor_id     UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Email one-time codes for login (hashed, 10-minute expiry, 5 attempts)
CREATE TABLE IF NOT EXISTS otps (
  email      TEXT PRIMARY KEY,
  purpose    TEXT NOT NULL,
  code_hash  TEXT NOT NULL,
  attempts   INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL
);

-- AI screening result (visible to reviewers only)
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS ai_verdict TEXT, ADD COLUMN IF NOT EXISTS ai_score INT, ADD COLUMN IF NOT EXISTS ai_reason TEXT;

-- Exactly one admin account
CREATE UNIQUE INDEX IF NOT EXISTS one_admin ON users(role) WHERE role = 'admin';
