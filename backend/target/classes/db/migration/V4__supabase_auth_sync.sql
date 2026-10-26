-- ============================================================
-- Flyway Migration V4: Supabase Auth & Realtime Synchronization
-- ============================================================

-- 1. Allow nullable password_hash for users authenticated via Supabase Auth
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- 2. Add supabase_uid column to bind Supabase Auth user UUID
ALTER TABLE users ADD COLUMN IF NOT EXISTS supabase_uid VARCHAR(100);

-- 3. Index supabase_uid for fast lookup during JWT validation
CREATE INDEX IF NOT EXISTS idx_users_supabase_uid ON users(supabase_uid);
