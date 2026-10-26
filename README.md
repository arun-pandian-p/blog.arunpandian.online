<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=2563EB&height=200&section=header&text=Arun%20Pandian&fontSize=60&fontAlignY=35&desc=Data%20Analyst%20Portfolio%20%26%20Java%20Spring%20Boot%20Publication&descAlignY=55&descSize=18&fontColor=ffffff" width="100%" />

  **Modern Data Analytics Portfolio & Java 21 + Spring Boot Decoupled Architecture**
  <br />

  [![Blog Subdomain](https://img.shields.io/badge/Blog_Publication-blog.arunpandian.online-0F172A?style=for-the-badge&logo=googlechrome&logoColor=white)](https://blog.arunpandian.online)
  [![Java 21](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org)
  [![Spring Boot 3](https://img.shields.io/badge/Spring_Boot-3.4.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
  [![Flyway](https://img.shields.io/badge/Flyway-Migrations-CC0200?style=for-the-badge&logo=flyway&logoColor=white)](https://flywaydb.org)

  <br />
  <a href="#-architecture">Architecture</a> · <a href="#-crud-endpoints">Endpoints</a> · <a href="#-local-development">Development</a> · <a href="#-testing--verification">Testing</a> · <a href="#-deployment">Deployment</a>
</div>

<br />

---

## 🌐 Domains & Live Architecture

| Platform | Domain | Description |
| :--- | :--- | :--- |
| **Data Journal** | [`https://blog.arunpandian.online`](https://blog.arunpandian.online) | Dedicated editorial publication platform with topic filtering, chronological timeline, markdown parsing, and reader engagement. |
| **Spring Boot API** | `https://blog.arunpandian.online/api` | Java 21 + Spring Boot 3.4.3 REST API with JWT security, PostgreSQL persistence, and Flyway migrations. |

---

## 🏛️ Java + Spring Boot Backend Architecture

The backend adheres strictly to a clean 4-tier layer pattern:
```
controller → service → repository → database
```

- **Controller (`com.arunpandian.blog.controller`)**: Exposes REST endpoints, performs `@Valid` request binding, handles HTTP codes.
- **Service (`com.arunpandian.blog.service`)**: Business logic, slug generation, scheduled publishing (`@Scheduled`), read-time calculations, transactions (`@Transactional`).
- **Repository (`com.arunpandian.blog.repository`)**: Spring Data JPA interfaces for PostgreSQL.
- **Security (`com.arunpandian.blog.security`)**: JWT filter, BCrypt password hashing, role-based security (`ROLE_ADMIN`), in-memory sliding-window rate limiting.
- **Exception Handling (`com.arunpandian.blog.exception`)**: `@RestControllerAdvice` emitting uniform `ApiErrorResponse` JSON.
- **Database Migrations (`db/migration/`)**:
  - `V1__init_schema.sql`: Full DDL with indexes for blogs, projects, comments, reactions, media, newsletter subscribers.
  - `V2__seed_initial_data.sql`: Seed data and admin credentials.

---

## 🚀 Complete CRUD REST Endpoints

### 1. Blog Posts & Publication
- `GET /api/blogs` — Public paginated list of published posts with search & tag filtering.
- `GET /api/blogs/{slug}` — Public post details (increments views, enforces unpublished drafts protection).
- `POST /api/blogs/{id}/clap` — Increment post claps.
- `GET /api/admin/blogs` — Admin list including drafts and scheduled posts.
- `POST /api/admin/blogs` — Create post (validates unique slug, Markdown, max 4 tags).
- `PUT /api/admin/blogs/{id}` — Update post, status transitions (DRAFT → PUBLISHED / SCHEDULED).
- `DELETE /api/admin/blogs/{id}` — Delete post.

### 2. Comments & Moderation
- `GET /api/comments?targetSlug=...` — Approved comments for post or project.
- `POST /api/comments` — Public comment submission with rate limiting.
- `POST /api/comments/{id}/like` — Like a comment.
- `GET /api/admin/comments` — Admin moderation queue.
- `PATCH /api/admin/comments/{id}/status` — Approve, reject, or mark comment as spam.
- `DELETE /api/admin/comments/{id}` — Delete comment.

### 3. Projects & Experiences
- `GET /api/projects` — Public list of published analytics projects.
- `GET /api/admin/projects` — Admin project management.
- `GET /api/experiences` — Public career milestones.
- `GET /api/admin/experiences` — Admin experience CRUD.

### 4. Media, Reactions, Newsletter & Settings
- `POST /api/media/upload` — Upload cover images and attachments with MIME validation.
- `GET /api/media/{filename}` — Stream media file.
- `POST /api/reactions` / `GET /api/reactions` — Multi-type reactions (clap, heart, fire, insightful).
- `POST /api/contact` — Contact message submission.
- `POST /api/newsletter/subscribe` / `unsubscribe` — Newsletter subscriptions.
- `POST /api/admin/newsletter/broadcast` — Newsletter dispatch.
- `GET /api/settings` / `PUT /api/admin/settings/{key}` — Dynamic site configuration.

---

## 💻 Local Development

### Prerequisites
- Java 21+ (`java -version`)
- Node.js 20+ & npm (`node -v`)
- PostgreSQL 16 (or use automatic H2 compatibility in dev mode)

### 1. Run Spring Boot Backend
```bash
# Using the root or backend Maven wrapper
./mvnw -f backend/pom.xml spring-boot:run
# Backend starts on http://localhost:8080 with file-based H2 database by default
```

### 2. Run React Frontend
```bash
npm install
npm run dev
# Frontend runs on http://localhost:5173 with proxy configured to http://localhost:8080
```

---

## 🧪 Testing & Verification

Run the complete Maven test suite (context loading, Flyway migrations, authentication, RBAC, tag validation, comment moderation, rate limiting):
```bash
./mvnw clean test
```

Run frontend build & TypeScript verification:
```bash
npm run build
```

---

## 🐳 Containerization & Deployment

Build and run using Docker Compose:
```bash
docker compose up -d --build
```
Check health:
```bash
curl http://localhost:8080/actuator/health
# {"status":"UP"}
```
Refer to [`DEPLOYMENT.md`](./DEPLOYMENT.md) for full server provisioning, Nginx configuration, and CI/CD secret setup.
