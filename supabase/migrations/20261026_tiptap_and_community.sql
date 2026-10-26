-- ============================================================
-- Supabase Migration: Tiptap JSON, Community Reactions, Follows & Moderation
-- ============================================================

-- 1. Add content_json to blogs if not exists
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS content_json JSONB;

-- 2. Add parent_id to comments for nested replies
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_id);

-- 3. Create user_follows table
CREATE TABLE IF NOT EXISTS public.user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_follows UNIQUE (follower_id, following_id),
    CONSTRAINT chk_no_self_follow CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Public read user_follows" ON public.user_follows;
    DROP POLICY IF EXISTS "Users insert own follows" ON public.user_follows;
    DROP POLICY IF EXISTS "Users delete own follows" ON public.user_follows;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Public read user_follows"
ON public.user_follows FOR SELECT
USING (true);

CREATE POLICY "Users insert own follows"
ON public.user_follows FOR INSERT
WITH CHECK (
    auth.uid() = (SELECT supabase_uid FROM public.users WHERE id = follower_id)
);

CREATE POLICY "Users delete own follows"
ON public.user_follows FOR DELETE
USING (
    auth.uid() = (SELECT supabase_uid FROM public.users WHERE id = follower_id)
);

-- 4. Create blog_reactions table (Claps / Likes)
CREATE TABLE IF NOT EXISTS public.blog_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL DEFAULT 'CLAP',
    count INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_blog_reaction UNIQUE (user_id, blog_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_blog_reactions_blog ON public.blog_reactions(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_reactions_user ON public.blog_reactions(user_id);

ALTER TABLE public.blog_reactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Public read blog_reactions" ON public.blog_reactions;
    DROP POLICY IF EXISTS "Users manage own reactions" ON public.blog_reactions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Public read blog_reactions"
ON public.blog_reactions FOR SELECT
USING (true);

CREATE POLICY "Users manage own reactions"
ON public.blog_reactions FOR ALL
USING (
    auth.uid() = (SELECT supabase_uid FROM public.users WHERE id = user_id)
    OR public.is_admin()
);

-- 5. Create abuse_reports table
CREATE TABLE IF NOT EXISTS public.abuse_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    target_type VARCHAR(20) NOT NULL,
    target_id UUID NOT NULL,
    reason VARCHAR(100) NOT NULL,
    details TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_abuse_reports_status ON public.abuse_reports(status);

ALTER TABLE public.abuse_reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users create abuse reports" ON public.abuse_reports;
    DROP POLICY IF EXISTS "Admins manage abuse reports" ON public.abuse_reports;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Users create abuse reports"
ON public.abuse_reports FOR INSERT
WITH CHECK (
    auth.uid() IS NOT NULL
);

CREATE POLICY "Admins manage abuse reports"
ON public.abuse_reports FOR ALL
USING (
    public.is_admin()
);

-- 6. Add realtime publications
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_reactions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_follows;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
