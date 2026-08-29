<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=2563EB&height=200&section=header&text=Arun%20Pandian&fontSize=60&fontAlignY=35&desc=Data%20Analyst%20Portfolio%20%26%20Technical%20Publication&descAlignY=55&descSize=18&fontColor=ffffff" width="100%" />

  **Modern Data Analytics Portfolio & Decoupled Technical Publication System**
  <br />

  [![Live Portfolio](https://img.shields.io/badge/Live_Portfolio-arunpandian.online-2563EB?style=for-the-badge&logo=vercel&logoColor=white)](https://arunpandian.online)
  [![Blog Subdomain](https://img.shields.io/badge/Blog_Publication-blog.arunpandian.online-0F172A?style=for-the-badge&logo=googlechrome&logoColor=white)](https://blog.arunpandian.online)
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/arunpandianp-dataanalyst)
  [![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Storage-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
  [![Resend](https://img.shields.io/badge/Resend-Email%20Broadcasting-000000?style=for-the-badge&logo=resend&logoColor=white)](https://resend.com)

  <br />
  <a href="#-domains--live-architecture">Live Domains</a> · <a href="#-key-features">Features</a> · <a href="#-project-architecture">Architecture</a> · <a href="#-newsletter--email-automation">Email Automation</a> · <a href="#-local-development">Development</a>
</div>

<br />

---

## 🌐 Domains & Live Architecture

| Platform | Domain | Description |
| :--- | :--- | :--- |
| **Main Portfolio** | [`https://arunpandian.online`](https://arunpandian.online) | Flagship data analytics portfolio showcasing featured SQL pipelines, Power BI dashboards, experience timeline, and visual case studies. |
| **Data Journal** | [`https://blog.arunpandian.online`](https://blog.arunpandian.online) | Dedicated editorial publication platform with topic filtering, chronological timeline, markdown parsing, and reader engagement. |
| **Email Dispatch** | `updates@arunpandian.online` | Automated newsletter broadcasting & personalized subscriber onboarding via verified DKIM/SPF DNS records. |

---

## ✨ Key Features

### 1. 📰 Editorial Technical Publication (`blog.arunpandian.online`)
- **Dedicated Editorial Branding**: Custom `BlogNavbar` with clean publication navigation, topic filters (`SQL Pipelines`, `Power BI DAX`), and quick links to the main portfolio.
- **Rich Article Reader**: Real-time reading progress bar, text-to-speech audio reader, formatted code blocks with syntax highlighting, and dynamic table of contents.
- **Engagement Tools**: Article claps, bookmarking, social sharing modal (LinkedIn, X, WhatsApp), and next/previous story navigation.

### 2. 📬 Automated Newsletter & Welcome Onboarding
- **Zero-Friction Subscription**: Modern interactive pre-footer card with ambient glow and real-time validation across both the portfolio and blog.
- **Automated Welcome Email**: Instantly sends a branded introduction email from `updates@arunpandian.online` outlining what new subscribers will receive.
- **One-Click Broadcast**: Publishing or updating any blog post or project automatically triggers an HTML email dispatch to all active subscribers.

### 3. 🛠️ Real-Time Admin Studio & CMS
- Built-in management suite for creating, editing, and publishing blogs, projects, experience milestones, and site settings with instant Supabase synchronization.

---

## 📂 Project Architecture

```text
/
├── api/
│   ├── send-newsletter.js       # Vercel serverless broadcast engine to subscribers
│   └── send-welcome.js          # Automated welcome & introduction email dispatcher
│
├── public/                      # Static assets, résumé PDF, media files
│
├── src/
│   ├── components/
│   │   ├── BlogNavbar.jsx       # Dedicated editorial publication navbar
│   │   ├── Navbar.jsx           # Main portfolio navigation with cross-domain linking
│   │   ├── NewsletterSubscribe.jsx # Reusable newsletter card & modal forms
│   │   └── admin/               # Admin studio modals, inputs & authentication
│   │
│   ├── context/
│   │   └── ContentProvider.jsx  # Supabase live data sync & fallback content store
│   │
│   ├── pages/
│   │   ├── HomePage.jsx         # Flagship portfolio landing page
│   │   ├── BlogPublicationPage.jsx # 3-split publication feed & highlights
│   │   ├── BlogDetails.jsx      # High-conversion article reader
│   │   ├── ProjectDetails.jsx   # Deep-dive project breakdown
│   │   └── admin/               # Admin dashboard, blog editor & project manager
│   │
│   ├── services/
│   │   └── newsletterService.ts # Client API service for broadcasts & subscriptions
│   │
│   └── utils/
│       ├── blogParser.ts        # Markdown parser, headings extractor & metadata
│       └── domain.ts            # Dynamic subdomain routing & URL resolver
│
├── supabase/
│   └── schema.sql               # PostgreSQL schema & Row-Level Security policies
│
└── vercel.json                  # Serverless function routing & SPA rewrites
```

---

## 📬 Newsletter & Email Automation

The application uses **Resend** and verified custom domain DNS records for fast, reliable delivery:

```sql
-- Subscribers Table (Supabase)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'home_footer',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Environment Variables:
Add the following to your `.env` or Vercel Environment Variables:
```env
RESEND_API_KEY=re_your_api_key_here
NEWSLETTER_FROM_EMAIL=Arun Pandian <updates@arunpandian.online>
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SECRET_KEY=your_service_role_key
```

---

## 💻 Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm run dev
   ```
   - Main Portfolio: `http://localhost:5173`
   - Blog Subdomain Mode: `http://localhost:5173/?subdomain=blog`

3. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🚀 GitHub Repositories

- **Main Portfolio**: [https://github.com/arun-pandian-p/arunpandian.online](https://github.com/arun-pandian-p/arunpandian.online)
- **Dedicated Blog**: [https://github.com/arun-pandian-p/blog.arunpandian.online](https://github.com/arun-pandian-p/blog.arunpandian.online)

<br />

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=2563EB&height=100&section=footer" width="100%"/>
  <p>Crafted with 💙 by <a href="https://linkedin.com/in/arunpandianp-dataanalyst"><b>Arun Pandian</b></a></p>
</div>
