-- Optional Cloudflare D1 schema. Requires separately configured Worker and D1 binding.
CREATE TABLE IF NOT EXISTS races (race_key TEXT PRIMARY KEY, race_date TEXT NOT NULL, kind TEXT NOT NULL, venue TEXT NOT NULL, race_number INTEGER NOT NULL, payload TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS predictions (id TEXT PRIMARY KEY, race_key TEXT NOT NULL, payload TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
