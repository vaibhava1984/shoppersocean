ALTER TABLE profiles ADD COLUMN password_hash TEXT;
ALTER TABLE profiles ADD COLUMN password_salt TEXT;
CREATE TABLE IF NOT EXISTS auth_sessions (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,token_hash TEXT UNIQUE NOT NULL,created_at TEXT NOT NULL,expires_at TEXT NOT NULL,FOREIGN KEY(user_id) REFERENCES profiles(id));
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id);
CREATE TABLE IF NOT EXISTS password_reset_tokens (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,token_hash TEXT UNIQUE NOT NULL,expires_at TEXT NOT NULL,used_at TEXT,created_at TEXT NOT NULL,FOREIGN KEY(user_id) REFERENCES profiles(id));
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token_hash);
