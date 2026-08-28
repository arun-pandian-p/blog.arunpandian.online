import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// ─── Fallback data (mirrors what was hardcoded in the components) ────

const GH = 'https://github.com/arun-pandian-p';

const fallbackSettings = {
  hero: {
    badge: 'Arun Pandian · Data Analyst',
    headline: ['Turning complex', 'datasets into'],
    headlineAccent: 'decisions.',
    subtitle:
      "Hi, I'm Arun Pandian — a Data Analyst specializing in SQL, Python, Excel & Power BI. I help businesses scale by extracting actionable intelligence from unstructured data.",
    name: 'Arun Pandian',
    role: 'Data Analyst',
    primaryCta: { label: 'Explore Featured Projects', href: '#projects' },
    secondaryCta: { label: 'Download résumé', href: '/resume.pdf' },
    videoSrc: '/hero-animation.mp4',
    videoCaption: 'Data Analytics & Strategy',
    videoSubCaption: 'SQL · Python · BI',
    story: [
      { k: 'S', label: 'Messy, scattered data' },
      { k: 'T', label: 'A question worth answering' },
      { k: 'A', label: 'SQL · Python · Power BI' },
      { k: 'R', label: 'Decisions people trust' },
    ],
    credentials: [
      { value: '2026', label: 'AI & DS graduate' },
      { value: '3', label: 'Projects shipped' },
      { value: '5', label: 'Certifications' },
    ],
    ticker: ['SQL', 'Python', 'Excel', 'Power BI', 'Power Query', 'Power Pivot', 'DAX', 'n8n', 'Pandas', 'Data Modelling', 'EDA', 'Automation'],
    socials: {
      github: 'https://github.com/arun-pandian-p',
      linkedin: 'https://www.linkedin.com/in/arunpandianp-dataanalyst/',
      email: 'arunpandi47777@gmail.com',
    },
  },
  about: {
    sectionLabel: '01 — About',
    sectionTitle: 'The story behind the queries',
    narrative:
      "I'm an entry-level data analyst and B.Tech AI & Data Science graduate who works across the full data lifecycle — wrangling, EDA, dashboarding and automation — turning messy structured and unstructured data into decisions.",
    narrativeExtra:
      "I've built end-to-end Excel / Power Query analyses on real-world job-market data and an n8n-based automation pipeline running on a local LLM. Most at home where a clean data model meets a question worth answering.",
    stack: ['SQL', 'Python', 'Excel', 'Power BI', 'Power Query', 'n8n'],
    profileCaption: 'Arun Pandian',
    profileSubCaption: 'Data Analyst · Coimbatore, India',
    education: {
      school: 'EASA College of Engineering & Technology — Coimbatore',
      degree: 'B.Tech, Artificial Intelligence & Data Science',
      years: '2022 — 2026',
    },
    goals: {
      now: 'Land an impactful Data Analyst role and ship measurable value.',
      next: 'Design and scale AI-powered analytics products.',
    },
    stats: [
      { value: '2026', label: 'B.Tech AI & DS graduate' },
      { value: '2', label: 'Data / analytics internships' },
      { value: '3', label: 'Data projects shipped' },
      { value: '5', label: 'Job-simulation certifications' },
    ],
  },
  skills: {
    sectionLabel: '02 — Toolkit',
    sectionTitle: 'What I build with',
    categories: [
      { title: 'Languages & Querying', icon: 'Database', items: ['SQL — PostgreSQL', 'Python', 'R'] },
      { title: 'Analysis & Wrangling', icon: 'Sigma', items: ['Pandas · NumPy', 'Exploratory Data Analysis', 'Data Cleaning'] },
      { title: 'Visualisation & BI', icon: 'BarChart3', items: ['Power BI · DAX', 'Power Query · Power Pivot', 'Plotly · Streamlit'] },
      { title: 'Modelling & Tools', icon: 'Wrench', items: ['scikit-learn · TensorFlow · PyTorch', 'Supabase · PostgreSQL', 'Git · REST APIs · n8n'] },
    ],
    certifications: [
      'Data Analytics Job Simulation — Deloitte (Forage)',
      'GenAI Data Analytics Job Simulation — Tata (Forage)',
      'Data Labeling Job Simulation — Forage',
      'Introduction to AI',
      'HTML5 — The Language',
    ],
    ticker: ['SQL', 'Python', 'R', 'Pandas', 'NumPy', 'Power BI', 'Power Query', 'DAX', 'Plotly', 'Streamlit', 'scikit-learn', 'TensorFlow', 'PyTorch', 'Supabase', 'n8n', 'Git'],
  },
  navbar: {
    links: [
      { name: 'About', href: '/#about' },
      { name: 'Skills', href: '/#skills' },
      { name: 'Experience', href: '/#timeline' },
      { name: 'Work', href: '/#projects' },
      { name: 'Writing', href: '/#blog' },
      { name: 'Contact', href: '/#contact' },
    ],
    ctaLabel: 'Résumé',
    ctaHref: '/resume.pdf',
  },
  contact: {
    sectionLabel: '05 — Contact',
    sectionTitle: "Let's turn data into decisions.",
    subtitle: 'Hiring for a data role, or want a dashboard that actually gets used? I reply within a day.',
    email: 'arunpandi47777@gmail.com',
    phone: '+91 82489 60558',
    location: 'Coimbatore, Tamil Nadu',
  },
  footer: {
    name: 'Arun Pandian',
    tagline: 'Data Analyst — SQL · Python · Power BI. Turning raw data into decisions.',
    github: 'https://github.com/arun-pandian-p',
    linkedin: 'https://www.linkedin.com/in/arunpandianp-dataanalyst/',
    email: 'arunpandi47777@gmail.com',
    copyright: 'Built with React · Three.js · Node/Express.',
    designYear: '2026',
  },
  sections: {
    projects: {
      label: '01 — Selected Work',
      title: 'PORTFOLIO',
      subtitle: 'Recruiter-ready case studies',
    },
    blog: {
      label: '05 — Writing',
      title: 'Notes on the process',
    },
  },
  welcome: {
    enabled: true,
    quotes: [
      'Every dataset hides a question worth answering.',
      'I turn messy data into clear decisions.',
      'Clean models. Honest metrics. Real stories.',
      'Data only matters when it changes a decision.',
    ],
    inviteTitle: 'Pleasure to have you here.',
    inviteSubtitle: "Let's turn data into decisions — and connect.",
    name: 'Arun Pandian · Data Analyst',
  },
  theme: {
    accentColor: '#2563EB',
    inkColor: '#09090B',
    bgColor: '#FAFAFA',
    surfaceColor: '#FFFFFF',
    fontFamily: 'Space Grotesk',
  },
  seo: {
    metaTitle: 'Arun Pandian | Data Analyst - SQL, Python, Power BI',
    metaDescription: 'Arun Pandian is a Data Analyst specializing in SQL, Python, Excel & Power BI. View my portfolio of data analysis projects and case studies.',
    keywords: 'data analyst, SQL, Python, Power BI, portfolio, data science, Arun Pandian',
    ogImage: '',
    twitterHandle: '',
  },
};

const fallbackProjects = [
  {
    _id: '1',
    title: 'Data Science Job Market Analysis',
    subtitle: 'An end-to-end analysis of the data science job market to identify demand, salary patterns, hiring trends, and the most valuable technical skills.',
    category: 'data viz',
    problem: "Job seekers struggle to know which skills actually pay. Postings are broad and generic, so it's hard to tell which tech stacks drive salary for data roles.",
    data: 'Real 2023 data-science job-posting dataset — titles, skill requirements, salary ranges, countries and schedule types.',
    process: 'Built an end-to-end Excel analysis: Power Query ETL to clean and shape the data, a Power Pivot data model, and custom DAX measures comparing US vs. non-US median salaries. Linked skill demand to pay with combo PivotCharts.',
    insight: 'SQL and Python are the highest-value skill combination — the pairing tops the dataset on both demand and median salary.',
    result: 'Discovered SQL + Python unlocks a $125k+ median compensation benchmark with 3.4x higher hiring volume than single-tool skillsets.',
    tags: ['Excel', 'Power Query', 'Power Pivot', 'DAX', 'PivotTables', 'Data Visualization', 'Job Market Analysis', 'Salary Analysis', 'SQL', 'Python'],
    githubLink: GH,
    dataset_url: 'https://www.kaggle.com/datasets/gmanish/data-nerd-job-analysis',
    chartType: 0,
  },
  {
    _id: '2',
    title: 'Flight Delays & Carrier Turnaround Analysis',
    category: 'data viz',
    problem: "Airlines struggle to minimize turnaround bottlenecks and predict departure gate hold times across hubs.",
    data: 'Bureau of Transportation Statistics (BTS) on-time flight performance records spanning 450,000+ flights.',
    process: 'Constructed automated SQL pipeline in PostgreSQL, aggregated delay distributions, and built interactive Power BI comparative benchmarks.',
    insight: 'Carrier delay delta reduced by identifying peak gate hold intervals during weather re-routing.',
    result: 'Identified actionable gate bottlenecks yielding a potential 14% turnaround delay reduction across top 6 carrier routes.',
    tags: ['SQL', 'Power BI', 'DAX', 'Analytics'],
    githubLink: GH,
    chartType: 1,
  },
  {
    _id: '3',
    title: 'Data Jobs Salary & Comp Benchmark Dashboard',
    category: 'analytics',
    problem: "Comparing data-role pay across titles, countries and schedule types usually means fragile macros or heavy tooling that non-analysts can't maintain.",
    data: 'The same 2023 data-jobs dataset, benchmarked by job title, country and schedule type.',
    process: 'Built an interactive Excel dashboard driven entirely by dynamic array formulas (MEDIAN + FILTER) and dropdown filters with data validation — charts update automatically with no macros or Power Query.',
    insight: 'A fully formula-driven dashboard anyone can open, filter and trust — no add-ins, no refresh steps, no black boxes.',
    result: 'Zero-maintenance instant drill-down tool reducing compensation lookup time from 15 minutes to under 5 seconds for HR teams.',
    tags: ['Excel', 'Dynamic Arrays', 'Map Charts', 'Data Validation'],
    githubLink: GH,
    chartType: 3,
  },
  {
    _id: '4',
    title: 'Global Epidemic & Geospatial Cluster Heatmap',
    category: 'data viz',
    problem: "Public health agencies lack unified spatial visualizations to track disease vector spreading and cluster anomalies in real time.",
    data: 'WHO & Johns Hopkins global epidemiology time-series records cross-referenced with regional census data.',
    process: 'Cleaned spatial coordinates using GeoPandas, extracted cluster density metrics with Python, and rendered interactive cluster heatmaps.',
    insight: 'Identified transmission velocity correlations with population density with 94.2% spatial accuracy.',
    result: 'Achieved 94.2% spatial cluster prediction accuracy with sub-second regional rendering over 100k+ coordinate pairs.',
    tags: ['Python', 'GeoPandas', 'Plotly', 'Streamlit'],
    githubLink: GH,
    chartType: 2,
  },
  {
    _id: '5',
    title: 'Predictive Customer Churn Classifier',
    category: 'machine learning',
    problem: "SaaS companies lose 15% revenue to unnoticed customer drop-off before contract renewals.",
    data: 'Telecommunications and SaaS user activity logs with 70,000 subscriber usage patterns.',
    process: 'Engineered engagement feature matrices with Pandas, trained XGBoost and Random Forest classifiers with Scikit-learn, and evaluated ROC-AUC.',
    insight: 'Achieved 89.4% precision in predicting customer churn 30 days prior to contract expiration.',
    result: 'Predicted at-risk renewals with 89.4% precision (0.91 ROC-AUC), saving an estimated $180K annual recurring revenue.',
    tags: ['Python', 'Scikit-Learn', 'XGBoost', 'EDA'],
    githubLink: GH,
    chartType: 7,
  },
  {
    _id: '6',
    title: 'Life Expectancy & Socio-Economic Regression Study',
    category: 'machine learning',
    problem: "Understanding how healthcare expenditure and GDP interact with population health outcomes across developing nations.",
    data: 'World Bank & United Nations development indicators spanning 190+ countries over 20 years.',
    process: 'Performed exploratory data analysis, residual diagnostics, multivariate polynomial regression, and multi-variable bubble scatter plotting in Python/Seaborn.',
    insight: 'Healthcare spending elasticity plateaus beyond $4,500 per capita without proportional sanitation infrastructure.',
    result: 'Quantified critical diminishing returns threshold (R² = 0.884) guiding national budget allocation models.',
    tags: ['Python', 'Pandas', 'EDA', 'Statistics'],
    githubLink: GH,
    chartType: 4,
  },
  {
    _id: '7',
    title: 'AI Email Summarizer & LLM Automation Pipeline',
    category: 'automation',
    problem: 'Long email threads eat time. Reading every message to extract the point is repetitive, manual work.',
    data: 'Gmail messages pulled via OAuth2, summarized text, and structured rows written to Google Sheets.',
    process: 'Built the workflow entirely in n8n — Gmail extraction, 2-line AI summarization through a locally hosted LLM (Ollama), and structured logging to the Sheets API via a local inference endpoint.',
    insight: 'A private, no-cost summarization pipeline that runs on a local model — inbox triage without sending data to a third-party API.',
    result: 'Reduced daily inbox processing time by 75% with 100% data privacy and $0 cloud API token cost.',
    tags: ['n8n', 'Ollama (Local LLM)', 'Google Sheets', 'Automation'],
    githubLink: GH,
    chartType: 5,
  },
  {
    _id: '8',
    title: 'Environmental Telemetry & Sensor Signal EDA',
    category: 'analytics',
    problem: "Detecting sudden equipment anomalies in industrial sensor time-series streams with high noise ratios.",
    data: '100Hz dual-channel vibration and temperature telemetry sensor records.',
    process: 'Implemented Fast Fourier Transform (FFT) noise filtering, rolling standard deviation windowing, and automated anomaly alert thresholds in Python.',
    insight: 'Reduced false positive alerts by 62% using dynamic rolling thresholding.',
    result: 'Cut false-positive alarms by 62% while preserving 99.8% true anomaly detection within 12ms latency.',
    tags: ['Python', 'NumPy', 'Signal Processing', 'EDA'],
    githubLink: GH,
    chartType: 6,
  },
];

const fallbackBlogs = [
  {
    _id: '1',
    title: 'What 2023 job-posting data taught me about data hiring',
    excerpt: 'Answering four salary-and-skills questions with nothing but Excel, Power Query and a Power Pivot model.',
    content: '### The question\nWhich skills actually move the salary needle for data roles? I took a real 2023 job-posting dataset and let the data answer.\n\n### The build\n1. **Power Query ETL** to clean and reshape messy posting data.\n2. **Power Pivot model** so relationships and measures live in one place.\n3. **Custom DAX** comparing US vs. non-US median salaries and linking skill demand to pay.\n\n### The finding\nSQL + Python is the highest-value pairing in the dataset — top of the pile on both demand and median salary.',
    tags: ['Excel', 'Power Query', 'DAX'],
    readTime: '5 min read',
    publishedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    title: 'A salary dashboard with zero macros',
    excerpt: 'How dynamic array formulas (MEDIAN + FILTER) let me build an interactive Excel dashboard anyone can maintain.',
    content: "### Why no macros?\nMacros and add-ins break the moment a dashboard leaves your machine. I wanted something a hiring manager could just open.\n\n### The approach\nEverything runs on **dynamic array formulas** — MEDIAN + FILTER recompute as you change dropdowns wired with data validation. No Power Query refresh, no VBA.\n\n### The payoff\nBenchmark pay by title, country and schedule type instantly — a spreadsheet that behaves like an app.",
    tags: ['Excel', 'Dynamic Arrays', 'Dashboards'],
    readTime: '4 min read',
    publishedAt: new Date().toISOString(),
  },
  {
    _id: '3',
    title: 'Summarizing my inbox with a local LLM + n8n',
    excerpt: "A private email-summarization pipeline that never leaves my machine — Gmail, Ollama and Google Sheets.",
    content: "### The itch\nI didn't want to hand my email to a cloud API just to get the gist of a thread.\n\n### The workflow\nBuilt end-to-end in **n8n**: Gmail OAuth2 pulls messages, a locally hosted **Ollama** model writes a 2-line summary, and results land in **Google Sheets** via the API.\n\n### The result\nInbox triage on a local model — useful summaries, zero data sent to a third party.",
    tags: ['n8n', 'Local LLM', 'Automation'],
    readTime: '4 min read',
    publishedAt: new Date().toISOString(),
  },
];

const fallbackExperiences = [
  {
    id: '1',
    role: 'Software Engineer Intern',
    company: 'Carpediem Tech Innovations',
    period: 'Jan 2026 — Mar 2026',
    type: 'Internship',
    impact: 'Built AI-powered data-processing and automation workflows in Python to support business decision-making, moving structured and unstructured data through analytical pipelines.',
  },
  {
    id: '2',
    role: 'Gen AI Intern',
    company: 'Carpediem Tech Innovations',
    period: 'Dec 2025 — Jan 2026',
    type: 'Internship',
    impact: 'Built NLP data pipelines for automated text processing and n8n automation scripts across APIs and databases — reducing manual data-handling effort and improving workflow consistency.',
  },
];

// ─── Deep merge (draft preview overrides win over fetched content) ──
function isPlainObject(x) {
  return x && typeof x === 'object' && !Array.isArray(x);
}
function deepMerge(base, over) {
  if (!isPlainObject(base) || !isPlainObject(over)) return over === undefined ? base : over;
  const out = { ...base };
  for (const key of Object.keys(over)) {
    out[key] = isPlainObject(base[key]) && isPlainObject(over[key])
      ? deepMerge(base[key], over[key])
      : over[key];
  }
  return out;
}

// ─── Context ────────────────────────────────────────────────

const ContentContext = createContext(null);

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used within a ContentProvider');
  return ctx;
}

// Helper: convert Supabase project row → component shape
function mapProject(row) {
  return {
    id: row.id,
    _id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    category: row.category,
    problem: row.problem,
    data: row.data,
    dataset_url: row.dataset_url,
    records_count: row.records_count,
    process: row.process,
    insight: row.insight,
    result: row.result,
    tags: row.tags || [],
    githubLink: row.github_link,
    github_link: row.github_link,
    liveLink: row.live_link,
    live_link: row.live_link,
    demoLink: row.live_link,
    powerbi_embed_url: row.powerbi_embed_url || row.live_link,
    imageUrl: row.image_url,
    image_url: row.image_url,
    created_at: row.created_at,
    published: row.published,
    sort_order: row.sort_order,
  };
}

function mapBlog(row) {
  return {
    _id: row.id,
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    tags: row.tags || [],
    readTime: row.read_time,
    read_time: row.read_time,
    coverImage: row.cover_image,
    // BlogCard reads the raw column name — keep both shapes wired
    cover_image: row.cover_image,
    authorName: row.author_name,
    author_name: row.author_name,
    authorAvatar: row.author_avatar,
    author_avatar: row.author_avatar,
    publishedAt: row.published_at,
    published_at: row.published_at,
    created_at: row.created_at,
    published: row.published,
    featured: row.featured,
    sort_order: row.sort_order,
  };
}

function mapExperience(row) {
  return {
    id: row.id,
    role: row.role,
    company: row.company,
    period: row.period,
    type: row.type,
    impact: row.impact,
    media_url: row.media_url,
    company_website: row.company_website,
    sort_order: row.sort_order,
  };
}

const CACHE_KEY = 'arun_site_content_cache_v2';

function getCachedData() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setCachedData(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {}
}

export function ContentProvider({ children }) {
  const cached = getCachedData();
  const [settings, setSettings] = useState(() => cached?.settings || fallbackSettings);
  const [projects, setProjects] = useState(() => cached?.projects || fallbackProjects);
  const [blogs, setBlogs] = useState(() => cached?.blogs || fallbackBlogs);
  const [experiences, setExperiences] = useState(() => cached?.experiences || fallbackExperiences);
  const [loading, setLoading] = useState(() => !cached);

  // ── Live draft preview: when this app runs inside the admin's preview iframe,
  //    the admin pushes unsaved form drafts here so the site re-renders instantly.
  const [previewOverride, setPreviewOverride] = useState(null);

  useEffect(() => {
    const inIframe = typeof window !== 'undefined' && window.parent && window.parent !== window;
    if (!inIframe) return;

    const handleMessage = (event) => {
      if (event.data?.type === 'PREVIEW_OVERRIDE') {
        setPreviewOverride(event.data.payload || null);
      }
    };
    window.addEventListener('message', handleMessage);
    // Tell the parent we're mounted and ready to receive the current draft.
    window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase client not available — using fallback data.');
      setLoading(false);
      return;
    }

    let latestSettings = cached?.settings || fallbackSettings;
    let latestProjects = cached?.projects || fallbackProjects;
    let latestBlogs = cached?.blogs || fallbackBlogs;
    let latestExperiences = cached?.experiences || fallbackExperiences;

    const syncCache = () => {
      setCachedData({
        settings: latestSettings,
        projects: latestProjects,
        blogs: latestBlogs,
        experiences: latestExperiences,
      });
    };

    // Per-table fetchers so realtime events can refresh just what changed
    const fetchSettings = async () => {
      const { data: rows, error } = await supabase
        .from('site_settings')
        .select('key, value');
      if (!error && rows && rows.length > 0) {
        const merged = { ...fallbackSettings };
        for (const row of rows) {
          let val = row.value;
          if (val && typeof val === 'object' && !Array.isArray(val)) {
            // Sanitize any legacy github username or outdated title/links
            val = JSON.parse(
              JSON.stringify(val)
                .replace(/shadow-byte-warrior/g, 'arun-pandian-p')
                .replace(/Data Analyst Specialist/g, 'Data Analyst')
                .replace(/arunpandiansh2030/g, 'arunpandianp-dataanalyst')
            );
            // Map legacy hidden object if it exists
            if (val.hidden && typeof val.hidden === 'object') {
              const extraHiddenFields = Object.entries(val.hidden)
                .filter(([_, isHidden]) => isHidden === true)
                .map(([k]) => k);
              val = {
                ...val,
                hiddenFields: Array.from(new Set([...(val.hiddenFields || []), ...extraHiddenFields]))
              };
            }
            merged[row.key] = { ...(fallbackSettings[row.key] || {}), ...val };
          } else {
            merged[row.key] = val;
          }
        }
        latestSettings = merged;
        setSettings(merged);
        syncCache();
      }
    };

    // Public site only shows published rows — drafts stay admin-only
    const fetchProjects = async () => {
      const { data: rows, error } = await supabase
        .from('projects')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true });
      if (!error && rows) {
        const mapped = rows.length > 0 ? rows.map(mapProject) : [];
        latestProjects = mapped;
        setProjects(mapped);
        syncCache();
      }
    };

    const fetchBlogs = async () => {
      const { data: rows, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true });
      if (!error && rows) {
        const mapped = rows.length > 0 ? rows.map(mapBlog) : [];
        latestBlogs = mapped;
        setBlogs(mapped);
        syncCache();
      }
    };

    const fetchExperiences = async () => {
      const { data: rows, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true });
      if (!error && rows) {
        const mapped = rows.length > 0 ? rows.map(mapExperience) : [];
        latestExperiences = mapped;
        setExperiences(mapped);
        syncCache();
      }
    };

    const fetchAll = async () => {
      try {
        await Promise.all([fetchSettings(), fetchProjects(), fetchBlogs(), fetchExperiences()]);
      } catch (err) {
        console.warn('Supabase fetch failed, using fallback data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();

    // ── Realtime: any admin save instantly updates the public site ──
    const channel = supabase
      .channel('content-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, fetchSettings)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchProjects)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blogs' }, fetchBlogs)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'experiences' }, fetchExperiences)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Submit contact form to Supabase instead of the old Express endpoint
  const submitContact = async (formData) => {
    if (!supabase) {
      throw new Error('Supabase not configured — email me directly instead.');
    }
    const { error } = await supabase
      .from('contact_messages')
      .insert([{
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      }]);
    if (error) throw error;
    return { message: 'Message sent successfully!' };
  };

  // Apply live draft overrides (if any) on top of the fetched/fallback content.
  const mergedSettings = previewOverride?.settings
    ? deepMerge(settings, previewOverride.settings)
    : settings;
  const mergedProjects = previewOverride?.projects ?? projects;
  const mergedBlogs = previewOverride?.blogs ?? blogs;
  const mergedExperiences = previewOverride?.experiences ?? experiences;

  const value = {
    settings: mergedSettings,
    projects: mergedProjects,
    blogs: mergedBlogs,
    experiences: mergedExperiences,
    loading,
    submitContact,
    isPreview: !!previewOverride,
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
}
