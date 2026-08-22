-- ============================================================
-- Arun Pandian Portfolio — Seed Data
-- Run this AFTER schema.sql in the Supabase SQL Editor.
-- Populates the database with default content so the
-- public site looks complete on first load.
-- ============================================================

-- ─── SITE SETTINGS ──────────────────────────────────────────

INSERT INTO site_settings (key, value) VALUES

-- Hero section
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
    "github": "https://github.com/shadow-byte-warrior",
    "linkedin": "https://linkedin.com/in/arunpandiansh2030",
    "email": "arunpandi47777@gmail.com"
  }
}'::jsonb),

-- About section
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
}'::jsonb),

-- Skills section
('skills', '{
  "sectionLabel": "02 — Toolkit",
  "sectionTitle": "What I build with",
  "categories": [
    { "title": "Languages & Querying", "icon": "Database", "items": ["SQL — PostgreSQL", "Python", "R"] },
    { "title": "Analysis & Wrangling", "icon": "Sigma", "items": ["Pandas · NumPy", "Exploratory Data Analysis", "Data Cleaning"] },
    { "title": "Visualisation & BI", "icon": "BarChart3", "items": ["Power BI · DAX", "Power Query · Power Pivot", "Plotly · Streamlit"] },
    { "title": "Modelling & Tools", "icon": "Wrench", "items": ["scikit-learn · TensorFlow · PyTorch", "Supabase · PostgreSQL", "Git · REST APIs · n8n"] }
  ],
  "certifications": [
    "Data Analytics Job Simulation — Deloitte (Forage)",
    "GenAI Data Analytics Job Simulation — Tata (Forage)",
    "Data Labeling Job Simulation — Forage",
    "Introduction to AI",
    "HTML5 — The Language"
  ],
  "ticker": ["SQL", "Python", "R", "Pandas", "NumPy", "Power BI", "Power Query", "DAX", "Plotly", "Streamlit", "scikit-learn", "TensorFlow", "PyTorch", "Supabase", "n8n", "Git"]
}'::jsonb),

-- Navbar
('navbar', '{
  "links": [
    { "name": "About", "href": "#about" },
    { "name": "Skills", "href": "#skills" },
    { "name": "Experience", "href": "#timeline" },
    { "name": "Work", "href": "#projects" },
    { "name": "Writing", "href": "#blog" },
    { "name": "Contact", "href": "#contact" }
  ],
  "ctaLabel": "Résumé",
  "ctaHref": "/resume.pdf"
}'::jsonb),

-- Contact section
('contact', '{
  "sectionLabel": "05 — Contact",
  "sectionTitle": "Let''s turn data into decisions.",
  "subtitle": "Hiring for a data role, or want a dashboard that actually gets used? I reply within a day.",
  "email": "arunpandi47777@gmail.com",
  "phone": "+91 82489 60558",
  "location": "Coimbatore, Tamil Nadu"
}'::jsonb),

-- Footer
('footer', '{
  "name": "Arun Pandian",
  "tagline": "Data Analyst — SQL · Python · Power BI. Turning raw data into decisions.",
  "github": "https://github.com/shadow-byte-warrior",
  "linkedin": "https://linkedin.com/in/arunpandiansh2030",
  "email": "arunpandi47777@gmail.com",
  "copyright": "Built with React · Three.js · Node/Express.",
  "designYear": "2026"
}'::jsonb),

-- Welcome / intro quotes
('welcome', '{
  "quotes": [
    "Every dataset hides a question worth answering.",
    "I turn messy data into clear decisions.",
    "Clean models. Honest metrics. Real stories.",
    "Data only matters when it changes a decision."
  ],
  "inviteTitle": "Pleasure to have you here.",
  "inviteSubtitle": "Let''s turn data into decisions — and connect.",
  "name": "Arun Pandian · Data Analyst"
}'::jsonb)

ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();


-- ─── PROJECTS ───────────────────────────────────────────────

INSERT INTO projects (title, problem, data, process, insight, tags, github_link, sort_order) VALUES

(
  'Data Science Job Market Analysis',
  'Job seekers struggle to know which skills actually pay. Postings are broad and generic, so it''s hard to tell which tech stacks drive salary for data roles.',
  'Real 2023 data-science job-posting dataset — titles, skill requirements, salary ranges, countries and schedule types.',
  'Built an end-to-end Excel analysis: Power Query ETL to clean and shape the data, a Power Pivot data model, and custom DAX measures comparing US vs. non-US median salaries. Linked skill demand to pay with combo PivotCharts.',
  'SQL and Python are the highest-value skill combination — the pairing tops the dataset on both demand and median salary.',
  ARRAY['Excel', 'Power Query', 'Power Pivot', 'DAX'],
  'https://github.com/shadow-byte-warrior',
  1
),
(
  'Data Jobs Salary Dashboard',
  'Comparing data-role pay across titles, countries and schedule types usually means fragile macros or heavy tooling that non-analysts can''t maintain.',
  'The same 2023 data-jobs dataset, benchmarked by job title, country and schedule type.',
  'Built an interactive Excel dashboard driven entirely by dynamic array formulas (MEDIAN + FILTER) and dropdown filters with data validation — charts update automatically with no macros or Power Query.',
  'A fully formula-driven dashboard anyone can open, filter and trust — no add-ins, no refresh steps, no black boxes.',
  ARRAY['Excel', 'Dynamic Arrays', 'Map Charts', 'Data Validation'],
  'https://github.com/shadow-byte-warrior',
  2
),
(
  'AI Email Summarizer Workflow',
  'Long email threads eat time. Reading every message to extract the point is repetitive, manual work.',
  'Gmail messages pulled via OAuth2, summarized text, and structured rows written to Google Sheets.',
  'Built the workflow entirely in n8n — Gmail extraction, 2-line AI summarization through a locally hosted LLM (Ollama), and structured logging to the Sheets API via a local inference endpoint.',
  'A private, no-cost summarization pipeline that runs on a local model — inbox triage without sending data to a third-party API.',
  ARRAY['n8n', 'Ollama (Local LLM)', 'Google Sheets', 'Automation'],
  'https://github.com/shadow-byte-warrior',
  3
);


-- ─── BLOGS ──────────────────────────────────────────────────

INSERT INTO blogs (title, slug, excerpt, content, tags, read_time, published, sort_order, published_at) VALUES

(
  'What 2023 job-posting data taught me about data hiring',
  'job-posting-data-hiring',
  'Answering four salary-and-skills questions with nothing but Excel, Power Query and a Power Pivot model.',
  E'### The question\nWhich skills actually move the salary needle for data roles? I took a real 2023 job-posting dataset and let the data answer.\n\n### The build\n1. **Power Query ETL** to clean and reshape messy posting data.\n2. **Power Pivot model** so relationships and measures live in one place.\n3. **Custom DAX** comparing US vs. non-US median salaries and linking skill demand to pay.\n\n### The finding\nSQL + Python is the highest-value pairing in the dataset — top of the pile on both demand and median salary.',
  ARRAY['Excel', 'Power Query', 'DAX'],
  '5 min read',
  true,
  1,
  now()
),
(
  'A salary dashboard with zero macros',
  'salary-dashboard-zero-macros',
  'How dynamic array formulas (MEDIAN + FILTER) let me build an interactive Excel dashboard anyone can maintain.',
  E'### Why no macros?\nMacros and add-ins break the moment a dashboard leaves your machine. I wanted something a hiring manager could just open.\n\n### The approach\nEverything runs on **dynamic array formulas** — MEDIAN + FILTER recompute as you change dropdowns wired with data validation. No Power Query refresh, no VBA.\n\n### The payoff\nBenchmark pay by title, country and schedule type instantly — a spreadsheet that behaves like an app.',
  ARRAY['Excel', 'Dynamic Arrays', 'Dashboards'],
  '4 min read',
  true,
  2,
  now()
),
(
  'Summarizing my inbox with a local LLM + n8n',
  'inbox-local-llm-n8n',
  'A private email-summarization pipeline that never leaves my machine — Gmail, Ollama and Google Sheets.',
  E'### The itch\nI didn''t want to hand my email to a cloud API just to get the gist of a thread.\n\n### The workflow\nBuilt end-to-end in **n8n**: Gmail OAuth2 pulls messages, a locally hosted **Ollama** model writes a 2-line summary, and results land in **Google Sheets** via the API.\n\n### The result\nInbox triage on a local model — useful summaries, zero data sent to a third party.',
  ARRAY['n8n', 'Local LLM', 'Automation'],
  '4 min read',
  true,
  3,
  now()
);


-- ─── EXPERIENCES ────────────────────────────────────────────

INSERT INTO experiences (role, company, period, type, impact, media_url, company_website, sort_order) VALUES

(
  'Software Engineer Intern',
  'Carpediem Tech Innovations',
  'Jan 2026 — Mar 2026',
  'Internship',
  'Built AI-powered data-processing and automation workflows in Python to support business decision-making, moving structured and unstructured data through analytical pipelines.',
  NULL,
  NULL,
  1
),
(
  'Gen AI Intern',
  'Carpediem Tech Innovations',
  'Dec 2025 — Jan 2026',
  'Internship',
  'Built NLP data pipelines for automated text processing and n8n automation scripts across APIs and databases — reducing manual data-handling effort and improving workflow consistency.',
  NULL,
  NULL,
  2
);
