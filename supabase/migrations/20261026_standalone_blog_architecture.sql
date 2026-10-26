-- ============================================================
-- 20261026_standalone_blog_architecture.sql
-- Complete Standalone Blogging Platform Schema & Security Migration
-- Target: Supabase PostgreSQL (Postgres 17+)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 1. CLEAN UP OBSOLETE PORTFOLIO & SUPERADMIN TABLES ────────
DROP TABLE IF EXISTS super_admin_profile CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS experiences CASCADE;
DROP TABLE IF EXISTS project_charts CASCADE;

-- ─── 2. USERS TABLE SCHEMA ─────────────────────────────────────
-- Drop any legacy policies on users so column types can be altered cleanly
DROP POLICY IF EXISTS "Public read user profiles" ON public.users;
DROP POLICY IF EXISTS "Public read users" ON public.users;
DROP POLICY IF EXISTS "Users update own profile" ON public.users;
DROP POLICY IF EXISTS "Admin manage all users" ON public.users;
DROP POLICY IF EXISTS "Admin manage users" ON public.users;

CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_uid  UUID UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  username      VARCHAR(100) NOT NULL UNIQUE,
  full_name     VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  bio           TEXT,
  avatar_url    VARCHAR(1000),
  website       VARCHAR(500),
  github        VARCHAR(255),
  twitter       VARCHAR(255),
  role          VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER' CHECK (role IN ('ROLE_USER', 'ROLE_ADMIN')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Backfill existing auth.users into public.users if missing
INSERT INTO public.users (id, supabase_uid, email, username, full_name, role, created_at, updated_at)
SELECT 
  au.id,
  au.id,
  lower(au.email),
  CASE 
    WHEN au.email = 'admin@arunpandian.online' THEN 'arunpandian'
    ELSE lower(regexp_replace(split_part(au.email, '@', 1), '[^a-zA-Z0-9_-]', '', 'g'))
  END,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  CASE 
    WHEN au.email = 'admin@arunpandian.online' THEN 'ROLE_ADMIN'
    ELSE 'ROLE_USER'
  END,
  au.created_at,
  now()
FROM auth.users au
ON CONFLICT (email) DO UPDATE
  SET supabase_uid = EXCLUDED.supabase_uid,
      id = EXCLUDED.id,
      updated_at = now();

-- Ensure supabase_uid is of type UUID and matches auth.users(id)
ALTER TABLE public.users 
  ALTER COLUMN supabase_uid TYPE UUID USING (
    CASE 
      WHEN supabase_uid IS NOT NULL AND supabase_uid::text ~ '^[0-9a-fA-F-]{36}$' THEN supabase_uid::uuid 
      ELSE NULL 
    END
  );

-- Ensure foreign key from public.users to auth.users exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_auth_users'
  ) THEN
    ALTER TABLE public.users 
      ADD CONSTRAINT fk_users_auth_users 
      FOREIGN KEY (supabase_uid) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ─── 3. USER ROLES TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role        VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER' CHECK (role IN ('ROLE_USER', 'ROLE_ADMIN')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uk_user_roles_user UNIQUE (user_id)
);

-- Sync user_roles from users table
INSERT INTO public.user_roles (user_id, role)
SELECT id, role FROM public.users
ON CONFLICT (user_id) DO UPDATE
  SET role = EXCLUDED.role;

-- ─── 4. BLOGS TABLE SCHEMA ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blogs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           VARCHAR(255) NOT NULL,
  slug            VARCHAR(255) NOT NULL UNIQUE,
  excerpt         TEXT,
  content         TEXT,
  tags            VARCHAR(500),
  read_time       VARCHAR(50) DEFAULT '3 min read',
  cover_image     VARCHAR(1000),
  cover_video_url VARCHAR(1000),
  author_id       UUID REFERENCES public.users(id) ON DELETE SET NULL,
  author_username VARCHAR(100),
  author_name     VARCHAR(255) DEFAULT 'Arun Pandian',
  author_avatar   VARCHAR(1000),
  author_bio      TEXT,
  category        VARCHAR(100) NOT NULL DEFAULT 'Engineering',
  status          VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED')),
  published       BOOLEAN NOT NULL DEFAULT false,
  featured        BOOLEAN NOT NULL DEFAULT false,
  sort_order      INT NOT NULL DEFAULT 0,
  views_count     BIGINT NOT NULL DEFAULT 0,
  claps_count     BIGINT NOT NULL DEFAULT 0,
  published_at    TIMESTAMPTZ,
  scheduled_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure all required columns exist on blogs
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS author_username VARCHAR(100);
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS author_bio TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS cover_video_url VARCHAR(1000);
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

-- Trigger to enforce published boolean consistency with status
CREATE OR REPLACE FUNCTION sync_blog_published_status()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'PUBLISHED' THEN
    NEW.published := true;
    IF NEW.published_at IS NULL THEN
      NEW.published_at := now();
    END IF;
  ELSE
    NEW.published := false;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_blog_published_status ON public.blogs;
CREATE TRIGGER trg_sync_blog_published_status
  BEFORE INSERT OR UPDATE ON public.blogs
  FOR EACH ROW EXECUTE FUNCTION sync_blog_published_status();

-- ─── 5. COMMENTS TABLE SCHEMA ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id       UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  author_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  target_slug   VARCHAR(255),
  author_name   VARCHAR(255) NOT NULL,
  author_email  VARCHAR(255),
  author_avatar VARCHAR(1000),
  content       TEXT NOT NULL,
  status        VARCHAR(50) NOT NULL DEFAULT 'APPROVED' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SPAM')),
  likes         INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure all required columns exist on comments
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS author_avatar VARCHAR(1000);

-- ─── 6. BOOKMARKS TABLE SCHEMA ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  blog_id     UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uk_bookmarks_user_blog UNIQUE (user_id, blog_id)
);

-- ─── 7. SITE SETTINGS TABLE SCHEMA ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_settings (
  setting_key   VARCHAR(255) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 8. NEWSLETTER SUBSCRIBERS TABLE SCHEMA ────────────────────
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) NOT NULL UNIQUE,
  source      VARCHAR(100) DEFAULT 'web',
  status      VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'UNSUBSCRIBED', 'PENDING')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 9. SYSTEM LOGS TABLE SCHEMA ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.system_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level       VARCHAR(20) NOT NULL DEFAULT 'INFO',
  action      VARCHAR(100) NOT NULL,
  details     JSONB,
  user_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ip_address  VARCHAR(50),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 10. HIGH PERFORMANCE INDEXES ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_supabase_uid ON public.users(supabase_uid);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON public.blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON public.blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_author_id ON public.blogs(author_id);
CREATE INDEX IF NOT EXISTS idx_blogs_public_feed ON public.blogs(published, status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_blog_id ON public.comments(blog_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON public.comments(status);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_blog ON public.bookmarks(blog_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_system_logs_created ON public.system_logs(created_at DESC);

-- ─── 11. AUTOMATIC PROFILE SYNC ON AUTH SIGNUP ──────────────────
CREATE OR REPLACE FUNCTION public.generate_unique_username(preferred text, email text)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  base_slug text;
  candidate text;
  suffix int := 1;
BEGIN
  base_slug := COALESCE(NULLIF(trim(preferred), ''), split_part(email, '@', 1), 'user');
  base_slug := lower(regexp_replace(base_slug, '[^a-zA-Z0-9_-]', '', 'g'));
  IF base_slug = '' THEN
    base_slug := 'user';
  END IF;
  candidate := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.users WHERE username = candidate) LOOP
    candidate := base_slug || '-' || suffix;
    suffix := suffix + 1;
  END LOOP;
  RETURN candidate;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_username text;
  new_name text;
  new_role text;
BEGIN
  new_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  new_username := public.generate_unique_username(
    NEW.raw_user_meta_data->>'username',
    NEW.email
  );
  -- Role is database-enforced: only default admin gets ROLE_ADMIN; all signups get ROLE_USER
  IF NEW.email = 'admin@arunpandian.online' THEN
    new_role := 'ROLE_ADMIN';
  ELSE
    new_role := 'ROLE_USER';
  END IF;

  INSERT INTO public.users (
    id,
    supabase_uid,
    email,
    username,
    full_name,
    role,
    avatar_url,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.id,
    lower(NEW.email),
    new_username,
    new_name,
    new_role,
    NEW.raw_user_meta_data->>'avatar_url',
    now(),
    now()
  )
  ON CONFLICT (email) DO UPDATE
    SET supabase_uid = EXCLUDED.supabase_uid,
        updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, new_role)
  ON CONFLICT (user_id) DO UPDATE
    SET role = EXCLUDED.role;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ─── 12. ROLE LEVEL SECURITY (RLS) HELPER & POLICIES ────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE (supabase_uid = auth.uid() OR id = auth.uid())
      AND role = 'ROLE_ADMIN'
  );
$$;

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- ── USERS POLICIES ──
DROP POLICY IF EXISTS "Public read users" ON public.users;
DROP POLICY IF EXISTS "Users update own profile" ON public.users;
DROP POLICY IF EXISTS "Admin manage users" ON public.users;

CREATE POLICY "Public read users"
  ON public.users FOR SELECT
  USING (true);

-- Users can update safe fields on their own profile, but CANNOT self-promote role
CREATE POLICY "Users update own profile"
  ON public.users FOR UPDATE
  USING (id = auth.uid() OR supabase_uid = auth.uid())
  WITH CHECK (
    (id = auth.uid() OR supabase_uid = auth.uid())
    AND role = (SELECT u.role FROM public.users u WHERE u.id = auth.uid() OR u.supabase_uid = auth.uid())
  );

CREATE POLICY "Admin manage users"
  ON public.users FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role');

-- ── USER ROLES POLICIES ──
DROP POLICY IF EXISTS "Users view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admin manage user roles" ON public.user_roles;

CREATE POLICY "Users view own role"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Admin manage user roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role');

-- ── BLOGS POLICIES ──
DROP POLICY IF EXISTS "Public read published blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authors read own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authors insert own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authors update own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authors delete own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admin manage all blogs" ON public.blogs;

-- Public can ONLY view published articles
CREATE POLICY "Public read published blogs"
  ON public.blogs FOR SELECT
  USING (
    published = true 
    AND status = 'PUBLISHED' 
    AND (published_at IS NULL OR published_at <= now())
  );

-- Authors can view all their own articles (drafts, scheduled, archived)
CREATE POLICY "Authors read own blogs"
  ON public.blogs FOR SELECT
  USING (author_id = auth.uid());

CREATE POLICY "Authors insert own blogs"
  ON public.blogs FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (author_id = auth.uid() OR public.is_admin())
  );

CREATE POLICY "Authors update own blogs"
  ON public.blogs FOR UPDATE
  USING (author_id = auth.uid() OR public.is_admin());

CREATE POLICY "Authors delete own blogs"
  ON public.blogs FOR DELETE
  USING (author_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admin manage all blogs"
  ON public.blogs FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role');

-- ── COMMENTS POLICIES ──
DROP POLICY IF EXISTS "Public read approved comments" ON public.comments;
DROP POLICY IF EXISTS "Public submit comment" ON public.comments;
DROP POLICY IF EXISTS "Authors manage own comments" ON public.comments;
DROP POLICY IF EXISTS "Admin manage all comments" ON public.comments;

CREATE POLICY "Public read approved comments"
  ON public.comments FOR SELECT
  USING (status = 'APPROVED');

CREATE POLICY "Public submit comment"
  ON public.comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authors manage own comments"
  ON public.comments FOR UPDATE
  USING (author_id = auth.uid() OR public.is_admin());

CREATE POLICY "Authors delete own comments"
  ON public.comments FOR DELETE
  USING (author_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admin manage all comments"
  ON public.comments FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role');

-- ── BOOKMARKS POLICIES ──
DROP POLICY IF EXISTS "Users read own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users insert own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users delete own bookmarks" ON public.bookmarks;

CREATE POLICY "Users read own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users insert own bookmarks"
  ON public.bookmarks FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (user_id = auth.uid() OR public.is_admin());

-- ── SITE SETTINGS POLICIES ──
DROP POLICY IF EXISTS "Public read settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin manage settings" ON public.site_settings;

CREATE POLICY "Public read settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admin manage settings"
  ON public.site_settings FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role');

-- ── NEWSLETTER POLICIES ──
DROP POLICY IF EXISTS "Public subscribe newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admin manage subscribers" ON public.newsletter_subscribers;

CREATE POLICY "Public subscribe newsletter"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin manage subscribers"
  ON public.newsletter_subscribers FOR ALL
  USING (public.is_admin() OR auth.role() = 'service_role');

-- ── SYSTEM LOGS POLICIES ──
DROP POLICY IF EXISTS "Admin view system logs" ON public.system_logs;
DROP POLICY IF EXISTS "Service role insert system logs" ON public.system_logs;

CREATE POLICY "Admin view system logs"
  ON public.system_logs FOR SELECT
  USING (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Service role insert system logs"
  ON public.system_logs FOR ALL
  USING (auth.role() = 'service_role');

-- ─── 13. SUPABASE REALTIME REPLICATION SETUP ───────────────────
ALTER TABLE public.blogs REPLICA IDENTITY FULL;
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER TABLE public.bookmarks REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.blogs;
  EXCEPTION WHEN others THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
  EXCEPTION WHEN others THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookmarks;
  EXCEPTION WHEN others THEN NULL;
  END;
END $$;
