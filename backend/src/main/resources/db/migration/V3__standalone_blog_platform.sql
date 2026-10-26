-- ============================================================
-- Flyway Migration V3: Standalone Blogging Platform Evolution
-- Adds bookmarks, user profiles, categories, and removes legacy portfolio tables
-- ============================================================

-- 1. Extend users table for author profiles & social links
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(1000);
ALTER TABLE users ADD COLUMN IF NOT EXISTS website VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS github VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS twitter VARCHAR(255);

-- Update existing default user with standard username
UPDATE users
SET username = 'arunpandian',
    bio = 'Writer, Data Enthusiast & Software Engineer.',
    avatar_url = '/assets/arun-profile.jpg'
WHERE email = 'admin@arunpandian.online' AND username IS NULL;

-- 2. Extend blogs table for author details, categories & Medium/DEV.to metadata
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS author_id UUID;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS author_username VARCHAR(100);
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS author_bio TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Engineering';

-- Associate existing articles with the initial user
UPDATE blogs
SET author_id = (SELECT id FROM users WHERE email = 'admin@arunpandian.online' LIMIT 1),
    author_username = 'arunpandian',
    category = 'Data & AI'
WHERE author_id IS NULL;

-- 3. Bookmarks table for saved articles
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    blog_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_bookmarks_user_blog UNIQUE (user_id, blog_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_blog ON bookmarks(blog_id);

-- 4. Clean up legacy portfolio tables safely
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS experiences;

-- 5. Additional indexing for high performance reading feed
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_author_username ON blogs(author_username);
CREATE INDEX IF NOT EXISTS idx_blogs_author_id ON blogs(author_id);
