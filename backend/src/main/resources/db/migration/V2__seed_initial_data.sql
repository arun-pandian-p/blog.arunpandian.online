-- ============================================================
-- Flyway Migration V2: Seed Data for Arun Pandian Platform
-- ============================================================

-- 1. Initial Admin User (password: Admin@12345)
INSERT INTO users (id, email, password_hash, full_name, role)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin@arunpandian.online',
    '$2a$10$INGctjrbn2xPEOI7rOCRFOEUS6TQCVZM3luRjR2fAGoYE5C5.Sweq',
    'Arun Pandian',
    'ROLE_ADMIN'
);

-- 2. Initial Site Settings
INSERT INTO site_settings (setting_key, setting_value) VALUES
('hero', '{
  "badge": "Open to Data Analyst roles · Fresher 2026",
  "headline": ["I turn raw", "data into"],
  "headlineAccent": "decisions.",
  "subtitle": "Hi, I''m Arun Pandian — an entry-level data analyst querying, modelling and story-telling with SQL, Python, Excel & Power BI.",
  "name": "Arun Pandian",
  "role": "Data Analyst",
  "primaryCta": { "label": "View selected work", "href": "#projects" },
  "secondaryCta": { "label": "Download résumé", "href": "/resume.pdf" },
  "videoSrc": "/hero-animation.mp4",
  "videoCaption": "Data · in motion",
  "videoSubCaption": "SQL · Python · BI",
  "story": [
    { "k": "S", "label": "Messy, scattered data" },
    { "k": "T", "label": "A question worth answering" },
    { "k": "A", "label": "SQL · Python · Power BI" },
    { "k": "R", "label": "Decisions people trust" }
  ],
  "credentials": [
    { "value": "2026", "label": "AI & DS graduate" },
    { "value": "3", "label": "Projects shipped" },
    { "value": "5", "label": "Certifications" }
  ],
  "ticker": ["SQL", "Python", "Excel", "Power BI", "Power Query", "Power Pivot", "DAX", "n8n", "Pandas", "Data Modelling", "EDA", "Automation"],
  "socials": {
    "github": "https://github.com/arun-pandian-p",
    "linkedin": "https://www.linkedin.com/in/arunpandianp-dataanalyst/",
    "email": "arunpandi47777@gmail.com"
  }
}'),
('about', '{
  "sectionLabel": "01 — About",
  "sectionTitle": "The story behind the queries",
  "narrative": "I''m an entry-level data analyst and B.Tech AI & Data Science graduate who works across the full data lifecycle — wrangling, EDA, dashboarding and automation — turning messy structured and unstructured data into decisions.",
  "narrativeExtra": "I''ve built end-to-end Excel / Power Query analyses on real-world job-market data and an n8n-based automation pipeline running on a local LLM. Most at home where a clean data model meets a question worth answering.",
  "stack": ["SQL", "Python", "Excel", "Power BI", "Power Query", "n8n"],
  "profileCaption": "Arun Pandian",
  "profileSubCaption": "Data Analyst · Coimbatore, India",
  "education": {
    "school": "EASA College of Engineering & Technology — Coimbatore",
    "degree": "B.Tech, Artificial Intelligence & Data Science",
    "years": "2022 — 2026"
  },
  "goals": {
    "now": "Land an impactful Data Analyst role and ship measurable value.",
    "next": "Design and scale AI-powered analytics products."
  },
  "stats": [
    { "value": "2026", "label": "B.Tech AI & DS graduate" },
    { "value": "2", "label": "Data / analytics internships" },
    { "value": "3", "label": "Data projects shipped" },
    { "value": "5", "label": "Job-simulation certifications" }
  ]
}'),
('skills', '{
  "sectionLabel": "02 — Toolkit",
  "sectionTitle": "What I build with",
  "categories": [
    { "title": "Languages & Querying", "icon": "Database", "items": ["SQL — PostgreSQL", "Python", "R"] },
    { "title": "Analysis & Wrangling", "icon": "Sigma", "items": ["Pandas · NumPy", "Exploratory Data Analysis", "Data Cleaning"] },
    { "title": "Visualisation & BI", "icon": "BarChart3", "items": ["Power BI · DAX", "Power Query · Power Pivot", "Plotly · Streamlit"] },
    { "title": "Modelling & Tools", "icon": "Wrench", "items": ["scikit-learn · TensorFlow · PyTorch", "PostgreSQL", "Git · REST APIs · n8n"] }
  ],
  "certifications": [
    "Data Analytics Job Simulation — Deloitte (Forage)",
    "GenAI Data Analytics Job Simulation — Tata (Forage)",
    "Data Labeling Job Simulation — Forage",
    "Introduction to AI",
    "HTML5 — The Language"
  ],
  "ticker": ["SQL", "Python", "R", "Pandas", "NumPy", "Power BI", "Power Query", "DAX", "Plotly", "Streamlit", "scikit-learn", "TensorFlow", "PyTorch", "n8n", "Git"]
}');

-- 3. Seed Projects
INSERT INTO projects (id, title, subtitle, category, problem, data, process, insight, result, tags, github_link, live_link, image_url, sort_order, published) VALUES
(
  'b0000000-0000-0000-0000-000000000001',
  'Data Science Job Market Analysis',
  'Excel DAX and Power Query breakdown of high-paying data analytics skills',
  'Analysis',
  'Job seekers struggle to know which skills actually pay. Postings are broad and generic, so it''s hard to tell which tech stacks drive salary for data roles.',
  'Real 2023 data-science job-posting dataset — titles, skill requirements, salary ranges, countries and schedule types.',
  'Built an end-to-end Excel analysis: Power Query ETL to clean and shape the data, a Power Pivot data model, and custom DAX measures comparing US vs. non-US median salaries. Linked skill demand to pay with combo PivotCharts.',
  'SQL and Python are the highest-value skill combination — the pairing tops the dataset on both demand and median salary.',
  'Actionable blueprint for curriculum prioritizing SQL and Python for entry-level market positioning.',
  'Excel, Power Query, Power Pivot, DAX',
  'https://github.com/arun-pandian-p',
  'https://github.com/arun-pandian-p',
  '/assets/projects/amazon_delivery.png',
  1,
  true
),
(
  'b0000000-0000-0000-0000-000000000002',
  'Data Jobs Salary Dashboard',
  'Formula-driven interactive spreadsheet dashboard with zero macros',
  'Dashboard',
  'Comparing data-role pay across titles, countries and schedule types usually means fragile macros or heavy tooling that non-analysts can''t maintain.',
  'The same 2023 data-jobs dataset, benchmarked by job title, country and schedule type.',
  'Built an interactive Excel dashboard driven entirely by dynamic array formulas (MEDIAN + FILTER) and dropdown filters with data validation — charts update automatically with no macros or Power Query.',
  'A fully formula-driven dashboard anyone can open, filter and trust — no add-ins, no refresh steps, no black boxes.',
  'Deployed widely to peers and hiring managers as an instant salary benchmarking reference.',
  'Excel, Dynamic Arrays, Map Charts, Data Validation',
  'https://github.com/arun-pandian-p',
  'https://github.com/arun-pandian-p',
  '/assets/projects/amazon_delivery.png',
  2,
  true
),
(
  'b0000000-0000-0000-0000-000000000003',
  'AI Email Summarizer Workflow',
  'Local privacy-first automation pipeline running via Ollama and n8n',
  'Automation',
  'Long email threads eat time. Reading every message to extract the point is repetitive, manual work.',
  'Gmail messages pulled via OAuth2, summarized text, and structured rows written to Google Sheets.',
  'Built the workflow entirely in n8n — Gmail extraction, 2-line AI summarization through a locally hosted LLM (Ollama), and structured logging to the Sheets API via a local inference endpoint.',
  'A private, no-cost summarization pipeline that runs on a local model — inbox triage without sending data to a third-party API.',
  'Saves 45 minutes daily on inbox reading while preserving full privacy of incoming messages.',
  'n8n, Ollama (Local LLM), Google Sheets, Automation',
  'https://github.com/arun-pandian-p',
  'https://github.com/arun-pandian-p',
  '/assets/projects/amazon_delivery.png',
  3,
  true
);

-- 4. Seed Blogs
INSERT INTO blogs (id, title, slug, excerpt, content, tags, read_time, cover_image, author_name, published, status, featured, sort_order, published_at) VALUES
(
  'c0000000-0000-0000-0000-000000000001',
  'What 2023 job-posting data taught me about data hiring',
  'job-posting-data-hiring',
  'Answering four salary-and-skills questions with nothing but Excel, Power Query and a Power Pivot model.',
  '### The question\nWhich skills actually move the salary needle for data roles? I took a real 2023 job-posting dataset and let the data answer.\n\n### The build\n1. **Power Query ETL** to clean and reshape messy posting data.\n2. **Power Pivot model** so relationships and measures live in one place.\n3. **Custom DAX** comparing US vs. non-US median salaries and linking skill demand to pay.\n\n### The finding\nSQL + Python is the highest-value pairing in the dataset — top of the pile on both demand and median salary.',
  'Excel, Power Query, DAX',
  '5 min read',
  '/assets/projects/amazon_delivery.png',
  'Arun Pandian',
  true,
  'PUBLISHED',
  true,
  1,
  CURRENT_TIMESTAMP
),
(
  'c0000000-0000-0000-0000-000000000002',
  'A salary dashboard with zero macros',
  'salary-dashboard-zero-macros',
  'How dynamic array formulas (MEDIAN + FILTER) let me build an interactive Excel dashboard anyone can maintain.',
  '### Why no macros?\nMacros and add-ins break the moment a dashboard leaves your machine. I wanted something a hiring manager could just open.\n\n### The approach\nEverything runs on **dynamic array formulas** — MEDIAN + FILTER recompute as you change dropdowns wired with data validation. No Power Query refresh, no VBA.\n\n### The payoff\nBenchmark pay by title, country and schedule type instantly — a spreadsheet that behaves like an app.',
  'Excel, Dynamic Arrays, Dashboards',
  '4 min read',
  '/assets/projects/amazon_delivery.png',
  'Arun Pandian',
  true,
  'PUBLISHED',
  false,
  2,
  CURRENT_TIMESTAMP
),
(
  'c0000000-0000-0000-0000-000000000003',
  'Summarizing my inbox with a local LLM + n8n',
  'inbox-local-llm-n8n',
  'A private email-summarization pipeline that never leaves my machine — Gmail, Ollama and Google Sheets.',
  '### The itch\nI didn''t want to hand my email to a cloud API just to get the gist of a thread.\n\n### The workflow\nBuilt end-to-end in **n8n**: Gmail OAuth2 pulls messages, a locally hosted **Ollama** model writes a 2-line summary, and results land in **Google Sheets** via the API.\n\n### The result\nInbox triage on a local model — useful summaries, zero data sent to a third party.',
  'n8n, Local LLM, Automation',
  '4 min read',
  '/assets/projects/amazon_delivery.png',
  'Arun Pandian',
  true,
  'PUBLISHED',
  false,
  3,
  CURRENT_TIMESTAMP
);

-- 5. Seed Experiences
INSERT INTO experiences (id, role, company, period, type, impact, sort_order, published) VALUES
(
  'd0000000-0000-0000-0000-000000000001',
  'Software Engineer Intern',
  'Carpediem Tech Innovations',
  'Jan 2026 — Mar 2026',
  'Internship',
  'Built AI-powered data-processing and automation workflows in Python to support business decision-making, moving structured and unstructured data through analytical pipelines.',
  1,
  true
),
(
  'd0000000-0000-0000-0000-000000000002',
  'Gen AI Intern',
  'Carpediem Tech Innovations',
  'Dec 2025 — Jan 2026',
  'Internship',
  'Built NLP data pipelines for automated text processing and n8n automation scripts across APIs and databases — reducing manual data-handling effort and improving workflow consistency.',
  2,
  true
);

-- 6. Seed Comments
INSERT INTO comments (id, blog_id, target_slug, author_name, author_email, content, status, likes) VALUES
(
  'e0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'job-posting-data-hiring',
  'Sarah Jenkins',
  'sarah.j@analyticsreview.io',
  'Fantastic breakdown of the SQL vs Python demand! The DAX comparison methodology is remarkably clean and reproducible.',
  'APPROVED',
  8
);
