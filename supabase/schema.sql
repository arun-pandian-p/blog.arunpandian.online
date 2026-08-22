-- ============================================================
-- Arun Pandian Portfolio — Supabase Schema + RLS
-- Run this in the Supabase SQL Editor to set up the database.
-- ============================================================

-- 1. SITE SETTINGS (key-value store for all global content)
-- Stores hero text, about text, nav links, footer, theme, etc.
CREATE TABLE IF NOT EXISTS site_settings (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Remove policies if they already exist before creating
DROP POLICY IF EXISTS "Public read settings" ON site_settings;
DROP POLICY IF EXISTS "Admin write settings" ON site_settings;

-- Anyone can read settings (public site needs them)
CREATE POLICY "Public read settings"
  ON site_settings FOR SELECT
  USING (true);

-- Only authenticated users (admin) can modify
CREATE POLICY "Admin write settings"
  ON site_settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- 2. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  problem     TEXT,
  data        TEXT,
  process     TEXT,
  insight     TEXT,
  tags        TEXT[] DEFAULT '{}',
  github_link TEXT,
  live_link   TEXT,
  image_url   TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  published   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published projects" ON projects;
DROP POLICY IF EXISTS "Admin all projects" ON projects;

CREATE POLICY "Public read published projects"
  ON projects FOR SELECT
  USING (published = true);

CREATE POLICY "Admin all projects"
  ON projects FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- 3. BLOGS
CREATE TABLE IF NOT EXISTS blogs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  excerpt      TEXT,
  content      TEXT,
  tags         TEXT[] DEFAULT '{}',
  read_time    TEXT DEFAULT '3 min read',
  cover_image  TEXT,
  author_name  TEXT DEFAULT 'Arun Pandian',
  author_avatar TEXT,
  published    BOOLEAN NOT NULL DEFAULT false,
  featured     BOOLEAN NOT NULL DEFAULT false,
  sort_order   INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published blogs" ON blogs;
DROP POLICY IF EXISTS "Admin all blogs" ON blogs;

CREATE POLICY "Public read published blogs"
  ON blogs FOR SELECT
  USING (published = true);

CREATE POLICY "Admin all blogs"
  ON blogs FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- 4. EXPERIENCES (timeline)
CREATE TABLE IF NOT EXISTS experiences (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role       TEXT NOT NULL,
  company    TEXT NOT NULL,
  period     TEXT NOT NULL,
  type       TEXT DEFAULT 'Internship',
  impact     TEXT,
  media_url  TEXT,
  company_website TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  published  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published experiences" ON experiences;
DROP POLICY IF EXISTS "Admin all experiences" ON experiences;

CREATE POLICY "Public read published experiences"
  ON experiences FOR SELECT
  USING (published = true);

CREATE POLICY "Admin all experiences"
  ON experiences FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- 5. CONTACT MESSAGES (form submissions)
CREATE TABLE IF NOT EXISTS contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT,
  message    TEXT NOT NULL,
  read       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert contact" ON contact_messages;
DROP POLICY IF EXISTS "Admin read contact" ON contact_messages;
DROP POLICY IF EXISTS "Admin update contact" ON contact_messages;

-- Anyone can insert (public form), but only admin can read
CREATE POLICY "Public insert contact"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin read contact"
  ON contact_messages FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin update contact"
  ON contact_messages FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- 6. Helper: auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_site_settings ON site_settings;
CREATE TRIGGER set_updated_at_site_settings
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_projects ON projects;
CREATE TRIGGER set_updated_at_projects
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_blogs ON blogs;
CREATE TRIGGER set_updated_at_blogs
  BEFORE UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- 7. STORAGE POLICIES
-- ============================================================
-- Enable RLS and setup policies for the 'assets' storage bucket.

-- Ensure the 'assets' bucket exists, is public, and accepts ANY file type.
-- allowed_mime_types = NULL means no MIME allowlist (images, PDF, DOC, PPT,
-- XLS, etc. are all permitted). file_size_limit is 50MB (52428800 bytes),
-- matching the upload widget's hint.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('assets', 'assets', true, 52428800, NULL)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 52428800,
      allowed_mime_types = NULL;

DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Access" ON storage.objects;

CREATE POLICY "Public Read Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'assets');

CREATE POLICY "Authenticated Insert Access"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'assets');

CREATE POLICY "Authenticated Update Access"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'assets')
  WITH CHECK (bucket_id = 'assets');

CREATE POLICY "Authenticated Delete Access"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'assets');


-- ============================================================
-- 8. REALTIME ENABLEMENT
-- ============================================================
-- Recreate the publication to prevent duplicate errors and ensure
-- all tables are configured for realtime updates.

DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE site_settings, projects, blogs, experiences;






CREATE TABLE design_scrapes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  colors JSONB,
  fonts JSONB,
  metrics JSONB,
  components JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
