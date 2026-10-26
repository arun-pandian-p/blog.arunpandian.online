-- ============================================================
-- Flyway Migration V5: User Roles, System Logs & Obsolete Table Cleanup
-- ============================================================

-- 1. Obsolete tables cleanup
DROP TABLE IF EXISTS super_admin_profile;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS experiences;

-- 2. User Roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_roles_user UNIQUE (user_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Backfill user_roles from users using ANSI SQL
INSERT INTO user_roles (id, user_id, role)
SELECT u.id, u.id, u.role FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id
);

-- 3. System Logs table
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY,
    level VARCHAR(20) NOT NULL DEFAULT 'INFO',
    action VARCHAR(100) NOT NULL,
    details TEXT,
    user_id UUID,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_system_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_system_logs_created ON system_logs(created_at);
