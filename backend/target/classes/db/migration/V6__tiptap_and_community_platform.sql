-- ============================================================
-- Flyway Migration V6: Tiptap JSON, Community Reactions, Follows & Moderation
-- ============================================================

-- 1. Add content_json to blogs if not exists (stored as JSON/TEXT for cross-dialect compatibility)
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS content_json TEXT;

-- 2. Add parent_id to comments for nested replies
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id UUID;
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

-- 3. Create user_follows table
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY,
    follower_id UUID NOT NULL,
    following_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_follows UNIQUE (follower_id, following_id),
    CONSTRAINT fk_user_follows_follower FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_follows_following FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

-- 4. Create blog_reactions table (Claps / Likes)
CREATE TABLE IF NOT EXISTS blog_reactions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    blog_id UUID NOT NULL,
    reaction_type VARCHAR(20) NOT NULL DEFAULT 'CLAP',
    count INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_blog_reaction UNIQUE (user_id, blog_id, reaction_type),
    CONSTRAINT fk_blog_reactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_blog_reactions_blog FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_blog_reactions_blog ON blog_reactions(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_reactions_user ON blog_reactions(user_id);

-- 5. Create abuse_reports table
CREATE TABLE IF NOT EXISTS abuse_reports (
    id UUID PRIMARY KEY,
    reporter_id UUID,
    target_type VARCHAR(20) NOT NULL,
    target_id UUID NOT NULL,
    reason VARCHAR(100) NOT NULL,
    details TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_abuse_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_abuse_reports_status ON abuse_reports(status);
