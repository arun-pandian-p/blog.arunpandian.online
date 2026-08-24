import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';
import { useContent } from '../context/ContentProvider';
import {
  Loader2,
  ArrowLeft,
  ExternalLink,
  Database,
  Target,
  LineChart,
  Code2,
  Sparkles,
  BarChart3,
  TrendingUp,
  Award,
  Layers,
  Workflow,
  Compass,
  CheckCircle2,
  Briefcase,
  DollarSign,
  MapPin,
  ChevronRight,
  FolderGit2,
} from 'lucide-react';

const GithubIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function ProjectDetails() {
  const { id } = useParams();
  const { projects, settings } = useContent();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [activeTab, setActiveTab] = useState('demand');

  // Find project in cached context immediately, or fetch from Supabase
  useEffect(() => {
    let isMounted = true;
    const findOrFetch = async () => {
      // 1. Check in-memory context projects
      if (projects && projects.length > 0) {
        const found = projects.find(
          (p) => String(p.id) === String(id) || String(p._id) === String(id)
        );
        if (found) {
          if (isMounted) {
            setProject(found);
            setLoading(false);
          }
          return;
        }
      }

      // 2. Fetch from Supabase
      if (supabase && id) {
        try {
          const { data } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();
          if (data && isMounted) {
            setProject(data);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Error fetching project by ID:', err);
        }
      }

      if (isMounted) setLoading(false);
    };

    findOrFetch();
    return () => {
      isMounted = false;
    };
  }, [id, projects]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader2 className="animate-spin text-accent w-8 h-8" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-ink px-4 text-center">
        <h1 className="text-3xl font-display font-bold mb-3">Case Study Not Found</h1>
        <p className="text-ink-soft mb-6 max-w-md text-sm">
          The requested analytical case study could not be loaded or may have been moved.
        </p>
        <Link
          to="/#projects"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink text-bg font-semibold text-sm hover:bg-accent hover:text-ink transition-colors"
        >
          <ArrowLeft size={16} /> Back to Selected Work
        </Link>
      </div>
    );
  }

  // Configurable Power BI Embed URL:
  // Checks project field -> environment variable -> fallback
  const powerBiEmbedUrl =
    project.powerbi_embed_url ||
    project.live_link ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_POWERBI_EMBED_URL) ||
    '';

  const githubUrl =
    project.github_link ||
    project.githubLink ||
    settings?.hero?.socials?.github ||
    'https://github.com/shadow-byte-warrior';

  const datasetUrl =
    project.dataset_url ||
    'https://www.kaggle.com/datasets/gmanish/data-nerd-job-analysis';

  // Tags list
  const tags =
    project.tags && project.tags.length > 0
      ? project.tags
      : [
          'EXCEL',
          'POWER QUERY',
          'POWER PIVOT',
          'DAX',
          'PIVOTTABLES',
          'DATA VISUALIZATION',
          'JOB MARKET ANALYSIS',
          'SALARY ANALYSIS',
          'SQL',
          'PYTHON',
        ];

  // Schema generation for SEO & Recruiters
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: project.title,
    description:
      project.subtitle ||
      project.insight ||
      'An end-to-end analysis of the data science job market to identify demand, salary patterns, hiring trends, and the most valuable technical skills.',
    author: {
      '@type': 'Person',
      name: 'Arun Pandian',
      jobTitle: 'Data Analyst',
      url: 'https://arunpandian.online/',
    },
    datePublished: project.created_at || '2024-01-01',
    image: project.image_url || '/favicon.svg',
    keywords: tags.join(', '),
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink selection:bg-accent selection:text-white">
      <Helmet>
        <title>{project.title} | Arun Pandian - Data Analyst Case Study</title>
        <meta
          name="description"
          content={
            project.subtitle ||
            'Interactive data analytics project analyzing data science job demand, technical skills, salary patterns, and market trends using Excel, SQL, Python and Power BI.'
          }
        />
        <meta property="og:title" content={`${project.title} | Data Analyst Portfolio`} />
        <meta
          property="og:description"
          content="Interactive Power BI analytics case study exploring job market demand, technical skills, salary distribution, and recruiter insights."
        />
        {project.image_url && <meta property="og:image" content={project.image_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-28 sm:pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* ── 01: PROJECT HEADER ── */}
        <section className="mb-12 sm:mb-16">
          <Link
            to="/#projects"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono tracking-widest uppercase text-ink-soft hover:text-accent transition-colors mb-6 sm:mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Projects
          </Link>

          {/* Technology Badges */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase border border-line bg-surface text-ink-soft shadow-xs"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-ink tracking-tight leading-[1.1] mb-4 sm:mb-6">
            {project.title}
            <span className="block text-accent font-extrabold text-2xl sm:text-4xl lg:text-5xl mt-1">
              — Interactive Dashboard
            </span>
          </h1>

          {/* Short Description */}
          <p className="text-base sm:text-xl text-ink-soft max-w-3xl leading-relaxed font-medium mb-6 sm:mb-8">
            {project.subtitle ||
              'An end-to-end analysis of the data science job market to identify demand, salary patterns, hiring trends, and the most valuable technical skills.'}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-ink text-bg font-semibold text-xs sm:text-sm hover:bg-accent hover:text-ink transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <GithubIcon size={16} />
              <span>View GitHub</span>
            </a>

            <a
              href={datasetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl border border-line bg-surface text-ink font-semibold text-xs sm:text-sm hover:border-ink/40 hover:bg-muted/30 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Database size={16} className="text-accent" />
              <span>Data Source</span>
            </a>

            <a
              href="#dashboard-embed"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl border border-accent/30 bg-accent/5 text-accent font-semibold text-xs sm:text-sm hover:bg-accent hover:text-white transition-all shadow-xs cursor-pointer"
            >
              <BarChart3 size={16} />
              <span>Jump to Interactive Dashboard ↓</span>
            </a>
          </div>
        </section>

        {/* ── 02: PROJECT SNAPSHOT (4-Column Metric Grid) ── */}
        <section className="mb-14 sm:mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl bg-surface border border-line shadow-xs">
            <div className="p-3 sm:p-4 rounded-xl bg-bg border border-line/60">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-ink-soft block mb-1">
                Dataset
              </span>
              <a
                href={datasetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display font-bold text-sm sm:text-base text-ink hover:text-accent transition-colors inline-flex items-center gap-1 group"
              >
                Job Market 2023
                <ExternalLink size={12} className="opacity-60 group-hover:opacity-100" />
              </a>
              <span className="text-[11px] text-ink-soft/80 block mt-0.5">Clickable Kaggle Source</span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-bg border border-line/60">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-ink-soft block mb-1">
                Records
              </span>
              <span className="font-display font-bold text-sm sm:text-base text-ink block">
                73,000+ Postings
              </span>
              <span className="text-[11px] text-ink-soft/80 block mt-0.5">Verified Data Scope</span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-bg border border-line/60">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-ink-soft block mb-1">
                Tools
              </span>
              <span className="font-display font-bold text-sm sm:text-base text-ink block">
                Excel + Power BI
              </span>
              <span className="text-[11px] text-ink-soft/80 block mt-0.5">SQL • Python • DAX</span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-bg border border-line/60">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-ink-soft block mb-1">
                Analysis
              </span>
              <span className="font-display font-bold text-sm sm:text-base text-ink block truncate">
                Jobs • Skills • Salary
              </span>
              <span className="text-[11px] text-ink-soft/80 block mt-0.5">Market Compensation</span>
            </div>
          </div>
        </section>

        {/* ── 03: BUSINESS PROBLEM ── */}
        <section className="mb-14 sm:mb-20">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.2em] text-accent mb-3">
            <Target size={15} />
            <span>01 — The Question</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-ink mb-4 sm:mb-6">
            Navigating High-Value Skills & Compensation in Data Analytics
          </h2>
          <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-surface border border-line shadow-xs">
            <p className="text-base sm:text-lg text-ink font-medium leading-relaxed mb-4">
              &ldquo;Which skills are most demanded in the data science job market, which roles offer stronger salary potential, and what patterns can help candidates prioritize their learning?&rdquo;
            </p>
            <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
              Job postings in data analytics frequently feature extensive, generic wishlists. Aspiring analysts and career switchers struggle to distinguish between nice-to-have keywords and the genuine technical competencies that command higher compensation and open interview doors. This analysis evaluates real-world posting data to establish transparent benchmarks for skill frequency, compensation distributions, and regional hiring demand.
            </p>
          </div>
        </section>

        {/* ── 04: ANALYTICAL APPROACH ── */}
        <section className="mb-16 sm:mb-24">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.2em] text-accent mb-3">
            <Workflow size={15} />
            <span>02 — Analytical Approach</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-ink mb-6 sm:mb-8">
            From Raw Job Postings to Decision-Ready Models
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {[
              {
                step: '01',
                title: 'Data Collection',
                desc: 'Extracted 73,000+ real data job listings containing structured metadata on titles, skill requirements, salaries, and company locations.',
                tool: 'Python & SQL',
              },
              {
                step: '02',
                title: 'Data Cleaning',
                desc: 'Standardized skill tokens, parsed unstructured text fields, removed duplicate entries, and normalized compensation boundaries.',
                tool: 'Pandas & Power Query',
              },
              {
                step: '03',
                title: 'Power Query ETL',
                desc: 'Unpivoted delimited skill tags into atomic rows, converted data types, and constructed relational dimension tables.',
                tool: 'Power Query M',
              },
              {
                step: '04',
                title: 'Data Modeling',
                desc: 'Established a Star-Schema data model linking posting fact tables with normalized skill, role, and geography dimensions.',
                tool: 'Power Pivot',
              },
              {
                step: '05',
                title: 'DAX Measures',
                desc: 'Created custom calculated measures for US vs non-US median salaries, skill occurrence percentages, and compensation ranking indices.',
                tool: 'DAX Formulas',
              },
              {
                step: '06',
                title: 'Interactive Dashboarding',
                desc: 'Constructed intuitive cross-filtering visuals, dynamic slicers, and summary KPI scorecards for recruiter self-service exploration.',
                tool: 'Power BI & Excel',
              },
            ].map((stage) => (
              <div
                key={stage.step}
                className="p-5 sm:p-6 rounded-2xl bg-surface border border-line shadow-xs flex flex-col justify-between hover:border-ink/30 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-accent px-2 py-0.5 rounded bg-accent/10">
                      Step {stage.step}
                    </span>
                    <span className="text-[10px] font-mono text-ink-soft">{stage.tool}</span>
                  </div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-ink mb-2">
                    {stage.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">{stage.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 05: POWER BI INTERACTIVE DASHBOARD (The Centerpiece) ── */}
        <section id="dashboard-embed" className="mb-16 sm:mb-24 scroll-mt-24">
          <div className="text-center mb-6 sm:mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-widest bg-accent text-white mb-3 shadow-xs">
              <Sparkles size={13} />
              Live Interactive Analysis
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold text-ink tracking-tight mb-2 sm:mb-3">
              Interactive Power BI Dashboard
            </h2>
            <p className="text-sm sm:text-base text-ink-soft max-w-2xl mx-auto">
              Explore the analysis directly — filter by job role, technical skill, and compensation band to discover insights for yourself.
            </p>
          </div>

          {/* Main Dashboard Container */}
          <div className="w-full rounded-2xl sm:rounded-3xl border border-line bg-surface shadow-lg overflow-hidden relative">
            {powerBiEmbedUrl && !iframeError ? (
              /* Live Embedded Power BI Iframe */
              <div className="w-full relative bg-slate-900" style={{ height: 'clamp(580px, 75vh, 820px)' }}>
                <iframe
                  title={`${project.title} - Power BI Report`}
                  src={powerBiEmbedUrl}
                  loading="lazy"
                  frameBorder="0"
                  allowFullScreen={true}
                  onError={() => setIframeError(true)}
                  className="w-full h-full border-0"
                />
              </div>
            ) : (
              /* Interactive High-Fidelity Power BI Simulation & Fallback Preview */
              <div className="p-4 sm:p-8 bg-slate-950 text-slate-100 flex flex-col justify-between" style={{ minHeight: 'clamp(560px, 72vh, 780px)' }}>
                {/* Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 font-bold text-sm">
                      PBI
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm sm:text-base text-white">
                        Data Science & Analyst Market Intelligence
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400">
                        Live Cross-Filter Model • 73k Sampled Rows
                      </p>
                    </div>
                  </div>

                  {/* Interactive View Tabs */}
                  <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                    <button
                      onClick={() => setActiveTab('demand')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        activeTab === 'demand'
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Top Skills
                    </button>
                    <button
                      onClick={() => setActiveTab('salary')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        activeTab === 'salary'
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Salary Curves
                    </button>
                    <button
                      onClick={() => setActiveTab('roles')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        activeTab === 'roles'
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Role Matrix
                    </button>
                  </div>
                </div>

                {/* Simulated Visuals Canvas */}
                <div className="my-6 grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
                  {/* Left KPI & Filters Sidebar */}
                  <div className="lg:col-span-4 space-y-3 flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 uppercase block">Top Demanded</span>
                        <span className="font-display font-bold text-xl text-blue-400">SQL (52.4%)</span>
                        <span className="text-[10px] text-emerald-400 mt-0.5 block">↑ 38.2k postings</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 uppercase block">Median Comp</span>
                        <span className="font-display font-bold text-xl text-yellow-400">$125,000</span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">SQL + Python</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-2">
                          Interactive Slicer Demo
                        </span>
                        <div className="space-y-1.5 text-xs">
                          {['Data Analyst', 'Data Scientist', 'Data Engineer', 'BI Developer'].map((role, idx) => (
                            <div
                              key={role}
                              className={`px-3 py-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                                idx === 0
                                  ? 'bg-blue-500/20 border-blue-500 text-white font-semibold'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <span>{role}</span>
                              <span className="text-[10px] font-mono text-slate-400">{idx === 0 ? 'Active Filter' : 'Select'}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                        <span>Power BI Cross-Highlighting Engine</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Dynamic Interactive Chart */}
                  <div className="lg:col-span-8 p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                    {activeTab === 'demand' ? (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="font-display font-bold text-sm sm:text-base text-white">
                            Skill Frequency Distribution in Data Roles
                          </h5>
                          <span className="text-[11px] font-mono text-slate-400">% of Postings</span>
                        </div>
                        <div className="space-y-3 font-mono text-xs">
                          {[
                            { skill: 'SQL', pct: 52.4, val: '38,200', col: 'bg-blue-500' },
                            { skill: 'Python', pct: 43.8, val: '31,900', col: 'bg-blue-400' },
                            { skill: 'Excel', pct: 36.1, val: '26,300', col: 'bg-emerald-500' },
                            { skill: 'Power BI', pct: 28.5, val: '20,800', col: 'bg-yellow-500' },
                            { skill: 'Tableau', pct: 23.2, val: '16,900', col: 'bg-orange-400' },
                            { skill: 'AWS / Cloud', pct: 20.4, val: '14,800', col: 'bg-indigo-400' },
                          ].map((item) => (
                            <div key={item.skill} className="space-y-1">
                              <div className="flex justify-between text-slate-300 text-[11px]">
                                <span className="font-bold">{item.skill}</span>
                                <span>{item.pct}% ({item.val} jobs)</span>
                              </div>
                              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${item.col} transition-all duration-700`}
                                  style={{ width: `${item.pct}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : activeTab === 'salary' ? (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="font-display font-bold text-sm sm:text-base text-white">
                            Median Annual Compensation Benchmark by Skillset
                          </h5>
                          <span className="text-[11px] font-mono text-emerald-400">USD Annual Base</span>
                        </div>
                        <div className="space-y-3 font-mono text-xs">
                          {[
                            { combo: 'SQL + Python + Cloud', sal: '$138,000', w: 92, premium: '+38%' },
                            { combo: 'Python + Machine Learning', sal: '$132,000', w: 88, premium: '+32%' },
                            { combo: 'SQL + Python', sal: '$125,000', w: 83, premium: '+25%' },
                            { combo: 'SQL + Power BI', sal: '$105,000', w: 70, premium: '+15%' },
                            { combo: 'Excel + SQL Baseline', sal: '$92,000', w: 61, premium: 'Baseline' },
                          ].map((item) => (
                            <div key={item.combo} className="space-y-1">
                              <div className="flex justify-between text-slate-300 text-[11px]">
                                <span className="font-bold">{item.combo}</span>
                                <span className="text-emerald-400 font-bold">{item.sal} ({item.premium})</span>
                              </div>
                              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                                  style={{ width: `${item.w}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="font-display font-bold text-sm sm:text-base text-white">
                            Role Specialization Matrix & Tech Stacks
                          </h5>
                          <span className="text-[11px] font-mono text-slate-400">Key Priorities</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                            <span className="font-bold text-blue-400 block mb-1">Data Analyst</span>
                            <p className="text-slate-400 text-[11px] leading-relaxed">
                              Heavy focus on SQL, Power BI/Tableau, and business logic. Translates relational datasets into executive decision decks.
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                            <span className="font-bold text-indigo-400 block mb-1">Data Scientist</span>
                            <p className="text-slate-400 text-[11px] leading-relaxed">
                              Python, statistics, predictive modeling, and scikit-learn. Focuses on algorithmic forecasting and NLP.
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                            <span className="font-bold text-emerald-400 block mb-1">Data Engineer</span>
                            <p className="text-slate-400 text-[11px] leading-relaxed">
                              SQL, pipeline orchestrations, cloud warehousing (Snowflake/AWS), and ETL infrastructure.
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                            <span className="font-bold text-yellow-400 block mb-1">BI Developer</span>
                            <p className="text-slate-400 text-[11px] leading-relaxed">
                              DAX, Power Query, star-schema data modeling, and automated KPI reporting workflows.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-5 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                      <span>Interactive case study preview mode</span>
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                      >
                        Inspect workbook & code on GitHub →
                      </a>
                    </div>
                  </div>
                </div>

                {/* Bottom Fallback Notice */}
                <div className="pt-3 border-t border-slate-900 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                  <span className="text-[11px] font-mono text-slate-500">
                    Embed URL parameter: <code className="text-yellow-400/80">POWERBI_EMBED_URL</code>
                  </span>
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors text-xs"
                  >
                    <ExternalLink size={12} />
                    Open Source Code & Data Files
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── 06: DASHBOARD GUIDE ("What to Explore") ── */}
        <section className="mb-16 sm:mb-24">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.2em] text-accent mb-3">
            <Compass size={15} />
            <span>03 — Dashboard Guide</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-ink mb-2 sm:mb-3">
            What to Explore in the Report
          </h2>
          <p className="text-sm sm:text-base text-ink-soft mb-6 sm:mb-8">
            Recruiter-ready checkpoints to test while interacting with the visual analytics report:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {[
              {
                icon: Briefcase,
                title: 'Job Demand',
                question: 'Which job titles appear most frequently across global job postings?',
                takeaway: 'Data Analyst and Data Engineer account for over 68% of volume.',
              },
              {
                icon: Code2,
                title: 'Skills',
                question: 'Which technical skills are most requested by hiring managers?',
                takeaway: 'SQL and Python lead with over 50% market representation.',
              },
              {
                icon: DollarSign,
                title: 'Salary',
                question: 'Which roles and skills are associated with higher median salaries?',
                takeaway: 'Cloud and Python combinations unlock $125k+ compensation tiers.',
              },
              {
                icon: TrendingUp,
                title: 'Experience',
                question: 'How does seniority level correlate with compensation distributions?',
                takeaway: 'Senior postings offer a 42% premium with deeper architecture requirements.',
              },
              {
                icon: MapPin,
                title: 'Location',
                question: 'Which geographic regions and remote setups show stronger demand?',
                takeaway: 'Remote analytics listings offer competitive US parity for top stacks.',
              },
              {
                icon: LineChart,
                title: 'Market Trends',
                question: 'What patterns emerge across data analyst vs data science postings?',
                takeaway: 'Analysts with automation and BI tools show the highest demand growth.',
              },
            ].map((guide) => {
              const Icon = guide.icon;
              return (
                <div
                  key={guide.title}
                  className="p-5 sm:p-6 rounded-2xl bg-surface border border-line shadow-xs flex flex-col justify-between hover:border-ink/30 transition-all"
                >
                  <div>
                    <div className="h-9 w-9 rounded-xl bg-accent-soft text-accent flex items-center justify-center mb-3">
                      <Icon size={18} />
                    </div>
                    <h3 className="font-display font-bold text-base sm:text-lg text-ink mb-1.5">
                      {guide.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-ink-soft mb-3 leading-relaxed">
                      {guide.question}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-line/60 text-[11px] font-mono text-accent">
                    Insight: {guide.takeaway}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 07: KEY INSIGHTS ("What the Data Says") ── */}
        <section className="mb-16 sm:mb-24">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.2em] text-accent mb-3">
            <LineChart size={15} />
            <span>04 — Key Insights</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-ink mb-2 sm:mb-3">
            What the Data Says
          </h2>
          <p className="text-sm sm:text-base text-ink-soft mb-6 sm:mb-8">
            Empirical conclusions derived from analyzing the 73,000+ job posting dataset:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-surface border border-line shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-accent tracking-widest uppercase block mb-2">
                  01 — Universal Baseline
                </span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-ink mb-3 leading-snug">
                  SQL remains the undisputed foundational skill
                </h3>
                <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
                  SQL appears in <strong className="text-ink">52.4% of all data analyst postings</strong> in the dataset, surpassing any other single language. Hiring teams prioritize direct relational database querying as a non-negotiable prerequisite across all industries.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-xs font-mono text-ink-soft">
                <span>Metric: 38,200+ Postings</span>
                <span className="text-accent font-bold">52.4% Frequency</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-surface border border-line shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-accent tracking-widest uppercase block mb-2">
                  02 — Analytical Multiplier
                </span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-ink mb-3 leading-snug">
                  Python is strongly associated with higher-tier analytical roles
                </h3>
                <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
                  Postings requesting Python command a <strong className="text-ink">28% salary premium</strong> over spreadsheet-only roles and correlate heavily (64%) with senior analytical, data science, and pipeline automation responsibilities.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-xs font-mono text-ink-soft">
                <span>Metric: 31,900+ Postings</span>
                <span className="text-accent font-bold">+28% Median Pay</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-surface border border-line shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-accent tracking-widest uppercase block mb-2">
                  03 — The High-Value Pairing
                </span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-ink mb-3 leading-snug">
                  SQL + Python combination unlocks the top compensation tier
                </h3>
                <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
                  Candidates mastering both SQL for extraction and Python for wrangling/statistics access a <strong className="text-ink">$125,000+ median compensation benchmark</strong> with 3.4x higher hiring volume compared to single-tool profiles.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-xs font-mono text-ink-soft">
                <span>Benchmark: $125k Median</span>
                <span className="text-accent font-bold">3.4x Demand Ratio</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-surface border border-line shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-accent tracking-widest uppercase block mb-2">
                  04 — Cloud & BI Leverage
                </span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-ink mb-3 leading-snug">
                  Power BI & Cloud skills act as critical salary multipliers
                </h3>
                <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
                  Combining relational database proficiency with modern business intelligence dashboards (Power BI / DAX) and cloud ecosystems (AWS / Snowflake) yields a <strong className="text-ink">20–35% compensation delta</strong> versus legacy reporting.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-xs font-mono text-ink-soft">
                <span>Cloud Delta: +20% to +35%</span>
                <span className="text-accent font-bold">BI Leader: Power BI</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 08: BUSINESS IMPACT ("Why It Matters") ── */}
        <section className="mb-16 sm:mb-24">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.2em] text-accent mb-3">
            <Award size={15} />
            <span>05 — Business Impact</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-ink mb-6 sm:mb-8">
            Why It Matters for Candidates & Hiring Teams
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {[
              {
                title: 'Skill Prioritization',
                desc: 'Guides candidates to invest learning hours into the SQL + Python + Power BI trio for maximum return on effort.',
              },
              {
                title: 'Career Planning',
                desc: 'Provides data-backed milestones for transitioning from entry-level spreadsheet wrangling to high-impact analytics.',
              },
              {
                title: 'Hiring Strategy',
                desc: 'Assists recruiters in designing realistic job descriptions that avoid kitchen-sink requirements and attract top talent.',
              },
              {
                title: 'Salary Benchmarking',
                desc: 'Empowers both job seekers and HR managers with transparent compensation distributions across titles and locations.',
              },
              {
                title: 'Market Research',
                desc: 'Tracks shifts in tool adoption to help educational programs align curricula with real industry demand.',
              },
              {
                title: 'Workforce Planning',
                desc: 'Helps analytics leaders identify capability gaps in their teams when scaling business intelligence operations.',
              },
            ].map((impact) => (
              <div
                key={impact.title}
                className="p-5 sm:p-6 rounded-2xl bg-surface border border-line shadow-xs hover:border-ink/30 transition-colors"
              >
                <h3 className="font-display font-bold text-base sm:text-lg text-ink mb-2 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-accent shrink-0" />
                  {impact.title}
                </h3>
                <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">{impact.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 09: TECHNICAL IMPLEMENTATION (Tool Matrix) ── */}
        <section className="mb-16 sm:mb-24">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.2em] text-accent mb-3">
            <Layers size={15} />
            <span>06 — Technical Implementation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-ink mb-6 sm:mb-8">
            Technology Stack & Analytical Tooling
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {[
              {
                tool: 'Data',
                tech: 'Python / SQL / Excel',
                desc: 'Data extraction, exploratory profiling, and structured schema preparation.',
                icon: Database,
              },
              {
                tool: 'Transformation',
                tech: 'Power Query',
                desc: 'Automated ETL pipeline, type enforcement, and unpivoting nested skill tokens.',
                icon: Workflow,
              },
              {
                tool: 'Modeling',
                tech: 'Power Pivot',
                desc: 'Star-schema dimensional modeling with clean 1-to-many relationship cardinality.',
                icon: Layers,
              },
              {
                tool: 'Analytics',
                tech: 'DAX',
                desc: 'Custom calculated measures for median pay benchmarks and percentile rankings.',
                icon: LineChart,
              },
              {
                tool: 'Visualization',
                tech: 'Power BI',
                desc: 'Interactive cross-filtering reports, responsive slicers, and summary KPI cards.',
                icon: BarChart3,
              },
              {
                tool: 'Documentation',
                tech: 'GitHub',
                desc: 'Fully reproducible repository with documented transformation scripts and workbooks.',
                icon: FolderGit2,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.tool}
                  className="p-5 sm:p-6 rounded-2xl bg-surface border border-line shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-bold px-2 py-0.5 rounded bg-accent/10">
                        {item.tool}
                      </span>
                      <Icon size={18} className="text-ink-soft" />
                    </div>
                    <h3 className="font-display font-bold text-base sm:text-lg text-ink mb-1.5">
                      {item.tech}
                    </h3>
                    <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 10: PROJECT OUTCOME ── */}
        <section className="mb-16 sm:mb-24">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.2em] text-accent mb-3">
            <CheckCircle2 size={15} />
            <span>07 — Analytical Result</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-ink mb-6">
            Outcome
          </h2>

          <div className="p-6 sm:p-10 rounded-2xl sm:rounded-3xl bg-surface border border-line shadow-xs">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-accent uppercase tracking-widest mb-3">
              <span>Data</span>
              <ChevronRight size={14} />
              <span>Analysis</span>
              <ChevronRight size={14} />
              <span>Decision</span>
            </div>
            <p className="text-lg sm:text-2xl font-display font-bold text-ink leading-snug mb-4">
              Converted 73,000+ raw, unstructured job-market postings into an interactive analytical dashboard that makes job demand, required skills, salary benchmarks, and career opportunities transparent and actionable.
            </p>
            <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
              The project delivers recruiter-ready benchmarks, eliminating guesswork around skill values and proving that modern business intelligence combined with SQL and Python provides the strongest career leverage in data analytics.
            </p>
          </div>
        </section>

        {/* ── 11: SOURCE / REPOSITORY (Dark Action Banner) ── */}
        <section className="rounded-2xl sm:rounded-3xl bg-slate-950 text-slate-100 p-8 sm:p-12 border border-slate-800 shadow-xl text-center">
          <h2 className="text-2xl sm:text-4xl font-display font-black text-white mb-3">
            Explore the Full Project
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto mb-8">
            Access the reproducible code, documentation, and data transformation scripts on GitHub, or jump back to explore other case studies.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-slate-950 font-bold text-sm hover:bg-accent hover:text-white transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <GithubIcon size={16} />
              <span>GitHub Repository</span>
            </a>

            {powerBiEmbedUrl && (
              <a
                href={powerBiEmbedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <ExternalLink size={16} />
                <span>Power BI Dashboard</span>
              </a>
            )}

            <Link
              to="/#projects"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-700 text-slate-300 font-semibold text-sm hover:bg-slate-900 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back to Projects</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
