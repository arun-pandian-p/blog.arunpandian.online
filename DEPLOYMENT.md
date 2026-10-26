# Deployment & Platform Guide: blog.arunpandian.online

This guide documents the architecture, configuration, environment variables, deployment steps, and reverse proxy setup for the standalone `blog.arunpandian.online` publishing platform.

---

## 1. Architecture Overview

```
                      Internet
                         │
                 HTTPS:443 (Cloudflare / TLS)
                         │
              ┌──────────┴──────────┐
              │ Reverse Proxy       │
              │ (Nginx / Caddy)     │
              └──────────┬──────────┘
                         │
         ┌───────────────┴───────────────┐
         │ /                             │ /api/**, /uploads/**, /feed.xml
         ▼                               ▼
┌──────────────────┐           ┌────────────────────────┐
│ Static Frontend  │           │ Java 21 Spring Boot    │
│ (React / Vite)   │           │ Container (:8080)      │
└──────────────────┘           └───────────┬────────────┘
                                           │
                                           ▼
                               ┌────────────────────────┐
                               │ PostgreSQL 16 Database │
                               │ (Docker / RDS)         │
                               └────────────────────────┘
```

- **Domain**: `https://blog.arunpandian.online`
- **Permanent Public Post URL**: `https://blog.arunpandian.online/posts/{slug}`
- **Frontend**: React 19 + Vite 8 (Static SPA served via CDN, Nginx, or Web Server)
- **Backend**: Java 21 + Spring Boot 3.4.3 REST API (Running on port `8080`)
- **Database**: PostgreSQL 16 with automated Flyway versioned migrations:
  - `V1__init_schema.sql`: Core schema (users, blogs, comments, reactions, newsletter, site settings, media)
  - `V2__seed_initial_data.sql`: Seed data and initial admin
  - `V3__standalone_blog_platform.sql`: Bookmarks table, user profile extensions, author linkage, category taxonomy, and cleanup of legacy portfolio tables
- **Security**: Stateless JWT Authentication, BCrypt password hashing, sliding-window Rate Limiting, standard `ROLE_ADMIN` and `ROLE_USER` access controls (zero superadmin accounts).

---

## 2. API Endpoints Reference

### Public Endpoints (No Auth Required)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/blogs` | Paginated blog posts (supports `query`, `category`, `tag`, `author`) |
| `GET` | `/api/blogs/{slug}` | Fetch single published article by slug (increments view count) |
| `GET` | `/api/blogs/{slug}/related` | Top related articles by category / primary tag |
| `POST` | `/api/blogs/{id}/clap` | Increment clap / applause count |
| `GET` | `/api/users/{username}` | Public author profile with biography and recent articles |
| `GET` | `/feed.xml`, `/rss.xml` | RSS 2.0 channel feed |
| `GET` | `/sitemap.xml` | Search engine XML sitemap |
| `POST` | `/api/auth/login` | Authenticate user or admin, returns JWT token |
| `POST` | `/api/auth/register` | Register new user account with standard `ROLE_USER` |
| `POST` | `/api/auth/logout` | Sign out endpoint |
| `GET` | `/api/comments` | Fetch approved article comments |
| `POST` | `/api/comments` | Submit new comment for moderation |
| `POST` | `/api/comments/{id}/like` | Like a comment |
| `POST` | `/api/reactions` | Submit reaction emoji |
| `GET` | `/api/reactions/summary` | Aggregate reaction counts |
| `POST` | `/api/newsletter/subscribe` | Subscribe email to publication updates |
| `POST` | `/api/newsletter/unsubscribe` | Unsubscribe email |
| `GET` | `/uploads/**` | Serve uploaded cover images and assets |
| `GET` | `/actuator/health` | Service health check |

### Authenticated Endpoints (`ROLE_USER` or `ROLE_ADMIN`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/auth/me` | Fetch currently logged-in user profile |
| `PUT` | `/api/users/profile` | Update user name, bio, avatar, and social links |
| `PUT` | `/api/users/password` | Update account password (validates current password) |
| `GET` | `/api/bookmarks` | List user's saved reading list articles |
| `POST` | `/api/bookmarks/{blogId}` | Toggle bookmark for an article |
| `DELETE` | `/api/bookmarks/{blogId}` | Remove bookmark |
| `GET` | `/api/bookmarks/{blogId}/status` | Check if article is bookmarked by current user |
| `GET` | `/api/blogs/me` | List current user's articles (drafts, scheduled, published) |
| `POST` | `/api/blogs` | Create draft, published, or scheduled article (max 4 tags) |
| `PUT` | `/api/blogs/{id}` | Update article (author can update own, admin can update any) |
| `DELETE` | `/api/blogs/{id}` | Delete article (author can delete own, admin can delete any) |
| `POST` | `/api/media/upload` | Upload media image with MIME-type validation |

### Admin Moderation Endpoints (`ROLE_ADMIN` Only)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/blogs` | View all platform articles with status filters |
| `GET` | `/api/admin/comments` | Review, approve, or reject comments |
| `PATCH` | `/api/admin/comments/{id}/status` | Update comment moderation status |
| `GET` | `/api/admin/newsletter/subscribers` | View publication subscriber list |
| `POST` | `/api/admin/newsletter/broadcast` | Broadcast newsletter email to subscribers |
| `PUT` | `/api/admin/settings/{key}` | Update site/platform settings |

---

## 3. Environment Variables & Secrets

### Spring Boot Backend Configuration
| Environment Variable | Description | Default / Example |
|---|---|---|
| `PORT` | HTTP port the Spring Boot server listens on | `8080` |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile (`dev`, `prod`, `test`) | `prod` |
| `SPRING_DATASOURCE_URL` | JDBC URL for PostgreSQL database | `jdbc:postgresql://postgres:5432/arun_blog` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `StrongSecretPassword123!` |
| `JWT_SECRET` | 256-bit+ HMAC-SHA secret key for JWT signing | *32+ byte secure random hex/base64 string* |
| `JWT_EXPIRATION_MS` | JWT validity duration in milliseconds | `86400000` (24 hours) |
| `CORS_ALLOWED_ORIGINS` | Permitted origins for Cross-Origin Resource Sharing | `https://blog.arunpandian.online,http://localhost:5173` |
| `STORAGE_UPLOAD_DIR` | Directory on disk where uploaded media files are saved | `/app/uploads` |
| `RATE_LIMIT_PER_MINUTE` | Public write endpoints rate limit per IP | `60` |
| `AUTH_RATE_LIMIT_PER_MINUTE` | Auth login rate limit per IP | `15` |

### Required GitHub Repository Secrets
Configure these in **GitHub Settings → Secrets and variables → Actions**:
- `PROD_SERVER_HOST`: IP address or hostname of your production server
- `PROD_SERVER_USER`: SSH username (e.g. `ubuntu` or `deploy`)
- `PROD_SSH_KEY`: Private SSH key for automated deployment
- `JWT_SECRET`: Production JWT signing secret
- `POSTGRES_PASSWORD`: Production database password

---

## 4. Quick Start Deployment with Docker Compose

1. Clone repository to server:
   ```bash
   git clone https://github.com/arun-pandian-p/blog.arunpandian.online.git /opt/blog.arunpandian.online
   cd /opt/blog.arunpandian.online
   ```

2. Create `.env` file:
   ```bash
   cat << 'EOF' > .env
   POSTGRES_DB=arun_blog
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=YourSecureProductionPassword123!
   JWT_SECRET=c29tZXNlY3VyZXJhbmRvbWtleXdpdGhsZW5ndGhncmVhdGVydGhhbjMyYnl0ZXM=
   CORS_ALLOWED_ORIGINS=https://blog.arunpandian.online
   EOF
   ```

3. Launch services:
   ```bash
   docker compose up -d --build
   ```

4. Verify health:
   ```bash
   curl http://localhost:8080/actuator/health
   # Output: {"status":"UP"}
   ```

---

## 5. Nginx Reverse Proxy Configuration

```nginx
server {
    listen 80;
    server_name blog.arunpandian.online;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name blog.arunpandian.online;

    ssl_certificate /etc/letsencrypt/live/blog.arunpandian.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/blog.arunpandian.online/privkey.pem;

    # Static Frontend
    root /var/www/blog.arunpandian.online/dist;
    index index.html;

    # API Proxy to Spring Boot Backend
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads Proxy
    location /uploads/ {
        proxy_pass http://127.0.0.1:8080/uploads/;
        proxy_set_header Host $host;
    }

    # RSS Feeds
    location = /feed.xml {
        proxy_pass http://127.0.0.1:8080/feed.xml;
        proxy_set_header Host $host;
    }

    location = /rss.xml {
        proxy_pass http://127.0.0.1:8080/rss.xml;
        proxy_set_header Host $host;
    }

    # SPA Routing Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
