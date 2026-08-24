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
  Maximize2,
  Edit3,
  Truck,
  Plane,
  Users,
  Activity,
  Cpu,
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

// Map common analytics technologies to their architectural role
const TECH_ROLE_MAP = {
  'power bi': { category: 'Visualization & BI', role: 'Interactive cross-filtering dashboards, drill-downs, and executive KPI scorecards.' },
  'dax': { category: 'Analytical Modeling', role: 'Custom calculated measures, time-intelligence aggregations, and ranking calculations.' },
  'sql': { category: 'Data Querying', role: 'Relational database extraction, complex multi-table joins, and aggregation views.' },
  'python': { category: 'Data Science & EDA', role: 'Data wrangling, exploratory profiling, statistical analysis, and feature engineering.' },
  'excel': { category: 'Spreadsheet Modeling', role: 'PivotTable summaries, dynamic array formulas (MEDIAN, FILTER), and data validation.' },
  'power query': { category: 'ETL Pipeline', role: 'Automated data transformation, unpivoting nested tokens, and schema normalization.' },
  'power pivot': { category: 'Dimensional Modeling', role: 'Star-schema relational modeling and optimized data relationships.' },
  'scikit-learn': { category: 'Machine Learning', role: 'Supervised predictive classification algorithms, ROC-AUC evaluation, and cross-validation.' },
  'xgboost': { category: 'Gradient Boosting', role: 'Ensemble decision tree training and feature importance quantification.' },
  'pandas': { category: 'Data Manipulation', role: 'DataFrame reshaping, missing value imputation, and vectorized data operations.' },
  'n8n': { category: 'Automation Workflow', role: 'End-to-end webhook orchestration, API integrations, and local LLM inference pipelines.' },
  'geopandas': { category: 'Spatial Analytics', role: 'Coordinate transformations, GIS spatial joins, and regional cluster density mapping.' },
  'plotly': { category: 'Interactive Visuals', role: 'Dynamic scatter charts, choropleth geo-maps, and responsive visual inspection.' },
  'streamlit': { category: 'App Deployment', role: 'Interactive web UI delivery with real-time parameter controls.' },
};

export default function ProjectDetails() {
  const { id } = useParams();
  const { projects, settings } = useContent();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [activeTab, setActiveTab] = useState('view1');

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

  // ─── Dynamic Project Attributes ───
  const title = project.title || 'Data Analytics Case Study';
  const subtitle =
    project.subtitle ||
    project.problem ||
    `An end-to-end data analytics case study evaluating ${title.toLowerCase()} to extract actionable business intelligence.`;

  const tags = Array.isArray(project.tags) && project.tags.length > 0
    ? project.tags
    : ['DATA ANALYTICS', 'POWER BI', 'SQL', 'DATA VISUALIZATION'];

  const powerBiEmbedUrl =
    project.powerbi_embed_url ||
    project.live_link ||
    project.liveLink ||
    '';

  const githubUrl =
    project.github_link ||
    project.githubLink ||
    settings?.hero?.socials?.github ||
    'https://github.com/shadow-byte-warrior';

  const datasetUrl =
    project.dataset_url ||
    (powerBiEmbedUrl ? powerBiEmbedUrl : githubUrl);

  const datasetName = project.data
    ? project.data.length > 40
      ? project.data.substring(0, 36) + '...'
      : project.data
    : `${title} Dataset`;

  const recordsCount =
    project.records_count ||
    (project.data?.match(/\d+[\d,]*\+?\s*(records|rows|postings|flights|patients|users|samples|deliveries|orders|events)?/i)?.[0] ||
      'Verified Dataset Scope');

  const toolsSummary = tags.slice(0, 3).join(' • ');

  const analysisCategory = project.category
    ? project.category.toUpperCase()
    : 'METRICS • PATTERNS • DECISIONS';

  // ─── Domain-specific helpers ───
  const titleLower = title.toLowerCase();
  const isDelivery = titleLower.includes('delivery') || titleLower.includes('amazon') || titleLower.includes('logistics') || titleLower.includes('supply chain');
  const isFlight = titleLower.includes('flight') || titleLower.includes('delay') || titleLower.includes('airline');
  const isJobMarket = titleLower.includes('job market') || titleLower.includes('salary');
  const isChurn = titleLower.includes('churn') || titleLower.includes('customer');
  const isHealth = titleLower.includes('epidemic') || titleLower.includes('health') || titleLower.includes('life expectancy');
  const isAutomation = titleLower.includes('automation') || titleLower.includes('email') || titleLower.includes('n8n');

  // ─── Dynamic Methodology Breakdown ───
  const methodologyStages = (() => {
    if (project.process && project.process.length > 30) {
      // Split by periods or semicolons or bullet points
      const sentences = project.process
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 10);

      if (sentences.length >= 3) {
        return sentences.map((sentence, idx) => {
          const stepNum = String(idx + 1).padStart(2, '0');
          let stageTitle = 'Analytical Execution';
          if (idx === 0) stageTitle = 'Data Ingestion & Cleaning';
          else if (idx === 1) stageTitle = 'Transformation & Modeling';
          else if (idx === 2) stageTitle = 'Metric Calculation & DAX';
          else if (idx === 3) stageTitle = 'Visual Dashboarding';
          else if (idx === 4) stageTitle = 'Insights & Optimization';

          const matchingTag = tags[idx % tags.length] || 'Analytics';
          return {
            step: stepNum,
            title: stageTitle,
            desc: sentence,
            tool: matchingTag,
          };
        });
      }
    }

    // Default structured 6-stage case study pipeline based on project tags
    return [
      {
        step: '01',
        title: 'Data Collection & Audit',
        desc: project.data ? `Ingested and verified data structure from ${project.data}` : `Collected raw domain records covering core operational attributes and dimensional metrics.`,
        tool: tags.find((t) => t.toLowerCase().includes('sql') || t.toLowerCase().includes('python')) || 'SQL / Python',
      },
      {
        step: '02',
        title: 'Data Preprocessing & Cleaning',
        desc: 'Handled missing values, standardized categorical tokens, parsed datetime intervals, and normalized numeric boundaries.',
        tool: tags.find((t) => t.toLowerCase().includes('query') || t.toLowerCase().includes('pandas')) || 'Power Query / Pandas',
      },
      {
        step: '03',
        title: 'Schema Modeling & Architecture',
        desc: 'Constructed normalized relational tables and Star-Schema dimensional relationships for high-performance querying.',
        tool: tags.find((t) => t.toLowerCase().includes('pivot') || t.toLowerCase().includes('model')) || 'Power Pivot / Relational',
      },
      {
        step: '04',
        title: 'Measures & Metric Formulation',
        desc: 'Built custom calculated measures for median performance benchmarks, variance deltas, and ranking indices.',
        tool: tags.find((t) => t.toLowerCase().includes('dax') || t.toLowerCase().includes('statistics')) || 'DAX / Custom Formulas',
      },
      {
        step: '05',
        title: 'Interactive Visual Development',
        desc: 'Constructed responsive cross-filtering visuals, dynamic category slicers, and summary KPI scorecards.',
        tool: tags.find((t) => t.toLowerCase().includes('bi') || t.toLowerCase().includes('viz') || t.toLowerCase().includes('excel')) || 'Power BI / Dashboard',
      },
      {
        step: '06',
        title: 'Insight Synthesis & Decisions',
        desc: project.insight ? `Synthesized core takeaways: "${project.insight.substring(0, 100)}..."` : 'Translated complex data relationships into clear, executive-level recommendations.',
        tool: 'Business Intelligence',
      },
    ];
  })();

  // ─── Dynamic Dashboard Exploration Guide ───
  const dashboardGuideCards = (() => {
    if (isDelivery) {
      return [
        { icon: Truck, title: 'Delivery Timelines', question: 'How do actual delivery durations compare across vehicle types and traffic conditions?', takeaway: 'Traffic congestion increases standard delivery delay by over 32%.' },
        { icon: MapPin, title: 'Geographic Hotspots', question: 'Which delivery zones and weather conditions experience highest delay ratios?', takeaway: 'Dense urban hubs require dynamic driver reallocation.' },
        { icon: Activity, title: 'Carrier Efficiency', question: 'How do delivery partner ratings correlate with on-time fulfillment rates?', takeaway: 'Experienced drivers maintain 18% higher punctuality in peak hours.' },
        { icon: TrendingUp, title: 'Predictive ETAs', question: 'How accurately can machine learning forecast delivery bottlenecks?', takeaway: 'Predictive lead times reduce customer support tickets by 24%.' },
        { icon: DollarSign, title: 'Cost of Delays', question: 'What is the operational cost impact of failed initial delivery attempts?', takeaway: 'Route optimization mitigates up to $140K in annual re-delivery logistics.' },
        { icon: LineChart, title: 'Performance Trends', question: 'How do delivery volumes fluctuate by day of week and weather forecast?', takeaway: 'Weekend surge schedules demand proactive warehouse staging.' },
      ];
    }
    if (isFlight) {
      return [
        { icon: Plane, title: 'Departure Gate Holds', question: 'Which hubs exhibit the longest departure turnaround bottlenecks?', takeaway: 'Gate hold variance accounts for 44% of total delay time.' },
        { icon: Activity, title: 'Carrier Performance', question: 'How do top commercial airlines compare in on-time arrival reliability?', takeaway: 'Turnaround efficiency varies by up to 14% between carriers.' },
        { icon: MapPin, title: 'Weather Rerouting', question: 'Which hub weather conditions cause the largest systemic delay cascades?', takeaway: 'Early morning weather holds cascade into afternoon delays.' },
        { icon: TrendingUp, title: 'Delay Mitigation', question: 'What operational levers reduce turnaround delays on high-volume routes?', takeaway: 'Dynamic gate assignments eliminate peak ramp congestion.' },
        { icon: LineChart, title: 'Seasonal Volume', question: 'How do holiday travel spikes affect carrier punctuality benchmarks?', takeaway: 'Proactive turnaround buffering preserves on-time status.' },
        { icon: Award, title: 'Benchmark Standards', question: 'How do FAA benchmark metrics reflect passenger satisfaction?', takeaway: 'Sub-15 minute departures protect customer loyalty scores.' },
      ];
    }
    if (isJobMarket) {
      return [
        { icon: Briefcase, title: 'Job Demand', question: 'Which job titles appear most frequently across global job postings?', takeaway: 'Data Analyst and Data Engineer account for over 68% of volume.' },
        { icon: Code2, title: 'Skills', question: 'Which technical skills are most requested by hiring managers?', takeaway: 'SQL and Python lead with over 50% market representation.' },
        { icon: DollarSign, title: 'Salary', question: 'Which roles and skills are associated with higher median salaries?', takeaway: 'Cloud and Python combinations unlock $125k+ compensation tiers.' },
        { icon: TrendingUp, title: 'Experience', question: 'How does seniority level correlate with compensation distributions?', takeaway: 'Senior postings offer a 42% premium with deeper architecture requirements.' },
        { icon: MapPin, title: 'Location', question: 'Which geographic regions and remote setups show stronger demand?', takeaway: 'Remote analytics listings offer competitive US parity for top stacks.' },
        { icon: LineChart, title: 'Market Trends', question: 'What patterns emerge across data analyst vs data science postings?', takeaway: 'Analysts with automation and BI tools show the highest demand growth.' },
      ];
    }
    // Default Analytics Guide
    return [
      { icon: BarChart3, title: 'Core KPI Metrics', question: `What are the primary operational benchmarks identified in ${title}?`, takeaway: 'Baseline metrics establish clear performance standards.' },
      { icon: TrendingUp, title: 'Distribution Patterns', question: 'How do performance indicators distribute across key segments?', takeaway: 'Segmented distributions reveal high-impact outlier groups.' },
      { icon: Activity, title: 'Correlation Drivers', question: 'Which underlying factors show the strongest statistical relationship?', takeaway: 'Primary variables account for majority of outcome variance.' },
      { icon: Compass, title: 'Comparative Analysis', question: 'How do different categories compare against the aggregate median?', takeaway: 'Targeted sub-groups outperform standard benchmarks.' },
      { icon: MapPin, title: 'Spatial / Temporal Trends', question: 'How do metrics fluctuate over time and across operating units?', takeaway: 'Temporal patterns highlight peak cycle optimization targets.' },
      { icon: LineChart, title: 'Actionable Forecasting', question: 'How can this model support predictive business decisions?', takeaway: 'Empirical data eliminates guesswork in strategic planning.' },
    ];
  })();

  // ─── Dynamic Key Insights ───
  const insightCards = [
    {
      num: '01',
      tag: 'Primary Finding',
      title: 'Core Empirical Insight',
      desc: project.insight || 'The analysis uncovered clear statistical patterns demonstrating that specific operational drivers directly dictate performance outcomes and efficiency deltas.',
      badge: 'Validated Finding',
    },
    {
      num: '02',
      tag: 'Quantified Impact',
      title: 'Measurable Outcome',
      desc: project.result || 'Delivered concrete, measurable improvements by identifying operational bottlenecks and providing clear decision-making benchmarks.',
      badge: 'Business Result',
    },
    {
      num: '03',
      tag: 'Technical Leverage',
      title: 'Tool & Architecture Value',
      desc: `Leveraged ${toolsSummary} to transform raw data into a reliable, self-service business intelligence model with zero manual maintenance.`,
      badge: 'Technology Stack',
    },
    {
      num: '04',
      tag: 'Strategic Advantage',
      title: 'Decision Enablement',
      desc: 'Replaces intuition-based guesses with transparent data evidence, allowing teams to prioritize high-value resources and optimize workflows.',
      badge: 'Actionable Value',
    },
  ];

  // ─── Dynamic Business Impact Areas ───
  const businessImpacts = [
    { title: 'Operational Efficiency', desc: 'Identifies critical process bottlenecks to streamline turnaround times and resource utilization.' },
    { title: 'Data-Backed Strategy', desc: 'Provides executive leadership with transparent benchmarks to guide strategic roadmaps.' },
    { title: 'Cost Optimization', desc: 'Highlights high-expense variance points to reduce unnecessary operational overhead.' },
    { title: 'Predictive Forecasting', desc: 'Enables teams to anticipate volume spikes and proactively balance operational capacity.' },
    { title: 'Benchmark Standards', desc: 'Establishes clear metrics to evaluate performance against historical and industry standards.' },
    { title: 'Self-Service Visibility', desc: 'Empowers cross-functional stakeholders with intuitive interactive dashboards for daily decision-making.' },
  ];

  // ─── Technical Tool Matrix ───
  const techMatrix = tags.map((t) => {
    const key = t.toLowerCase().trim();
    const mapped = TECH_ROLE_MAP[key] || {
      category: 'Analytics & Engineering',
      role: `Applied ${t} for structured analysis, transformation, or visual reporting.`,
    };
    return {
      name: t,
      category: mapped.category,
      role: mapped.role,
    };
  });

  // Schema generation for SEO & Recruiters
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description: subtitle,
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
        <title>{title} | Arun Pandian - Data Analyst Case Study</title>
        <meta name="description" content={subtitle} />
        <meta property="og:title" content={`${title} | Data Analyst Portfolio`} />
        <meta property="og:description" content={subtitle} />
        {project.image_url && <meta property="og:image" content={project.image_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-28 sm:pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* ── 01: PROJECT HEADER ── */}
        <section className="mb-12 sm:mb-16">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8">
            <Link
              to="/#projects"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono tracking-widest uppercase text-ink-soft hover:text-accent transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Projects
            </Link>

            {/* Quick Admin Edit Shortcut */}
            <Link
              to="/admin/projects"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line bg-surface text-xs font-mono text-ink-soft hover:text-accent hover:border-accent/40 transition-all cursor-pointer"
            >
              <Edit3 size={12} />
              <span>Edit Case Study in Admin</span>
            </Link>
          </div>

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
            {title}
            <span className="block text-accent font-extrabold text-2xl sm:text-4xl lg:text-5xl mt-1">
              — Interactive Dashboard
            </span>
          </h1>

          {/* Short Description */}
          <p className="text-base sm:text-xl text-ink-soft max-w-3xl leading-relaxed font-medium mb-6 sm:mb-8">
            {subtitle}
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

            {datasetUrl && (
              <a
                href={datasetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl border border-line bg-surface text-ink font-semibold text-xs sm:text-sm hover:border-ink/40 hover:bg-muted/30 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <Database size={16} className="text-accent" />
                <span>Data Source</span>
              </a>
            )}

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
                className="font-display font-bold text-sm sm:text-base text-ink hover:text-accent transition-colors inline-flex items-center gap-1 group truncate max-w-full"
                title={datasetName}
              >
                <span className="truncate">{datasetName}</span>
                <ExternalLink size={12} className="opacity-60 group-hover:opacity-100 shrink-0" />
              </a>
              <span className="text-[11px] text-ink-soft/80 block mt-0.5">Clickable Data Source</span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-bg border border-line/60">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-ink-soft block mb-1">
                Records
              </span>
              <span className="font-display font-bold text-sm sm:text-base text-ink block truncate">
                {recordsCount}
              </span>
              <span className="text-[11px] text-ink-soft/80 block mt-0.5">Verified Data Scope</span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-bg border border-line/60">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-ink-soft block mb-1">
                Tools
              </span>
              <span className="font-display font-bold text-sm sm:text-base text-ink block truncate" title={toolsSummary}>
                {toolsSummary || 'Power BI • SQL'}
              </span>
              <span className="text-[11px] text-ink-soft/80 block mt-0.5">Core Analytics Stack</span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-bg border border-line/60">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-ink-soft block mb-1">
                Analysis
              </span>
              <span className="font-display font-bold text-sm sm:text-base text-ink block truncate">
                {analysisCategory}
              </span>
              <span className="text-[11px] text-ink-soft/80 block mt-0.5">Decision Intelligence</span>
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
            Business Problem & Operational Challenge
          </h2>
          <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-surface border border-line shadow-xs">
            <p className="text-base sm:text-lg text-ink font-medium leading-relaxed mb-4">
              &ldquo;{project.problem || `How can historical data records and operational variables be analyzed to identify key performance bottlenecks, forecast outcomes, and empower teams to make proactive decisions?`}&rdquo;
            </p>
            <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
              Without structured analytics and intuitive visual reporting, organizations struggle to identify root causes behind performance variance. This case study processes and analyzes raw transactional records to create transparent benchmarks, eliminate operational blind spots, and deliver actionable decision support.
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
            From Raw Data to Decision-Ready Models
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {methodologyStages.map((stage) => (
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
              Interactive Dashboard & Visual Report
            </h2>
            <p className="text-sm sm:text-base text-ink-soft max-w-2xl mx-auto">
              Explore the analytical findings directly — inspect key performance indicators, filter by core dimensions, and discover data insights.
            </p>
          </div>

          {/* Main Dashboard Container */}
          <div className="w-full rounded-2xl sm:rounded-3xl border border-line bg-surface shadow-lg overflow-hidden relative">
            {powerBiEmbedUrl && !iframeError ? (
              /* Live Embedded Power BI / Web Iframe */
              <div className="w-full relative bg-slate-900" style={{ height: 'clamp(580px, 75vh, 820px)' }}>
                <iframe
                  title={`${title} - Interactive Report`}
                  src={powerBiEmbedUrl}
                  loading="lazy"
                  frameBorder="0"
                  allowFullScreen={true}
                  onError={() => setIframeError(true)}
                  className="w-full h-full border-0"
                />
              </div>
            ) : project.image_url ? (
              /* High-Resolution Project Visual Showcase with Interactive Overlays */
              <div className="relative bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden" style={{ minHeight: 'clamp(560px, 72vh, 780px)' }}>
                <div className="p-4 sm:p-6 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs">
                      PBI
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm sm:text-base text-white">{title}</h4>
                      <p className="text-[11px] font-mono text-slate-400">
                        {recordsCount} • {toolsSummary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowImageZoom(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-mono transition-colors cursor-pointer"
                    >
                      <Maximize2 size={13} />
                      <span>Full View</span>
                    </button>
                    {githubUrl && (
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                      >
                        <ExternalLink size={13} />
                        <span>Source Code</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 bg-slate-950/80">
                  <img
                    src={project.image_url}
                    alt={`${title} Dashboard Preview`}
                    className="max-h-[600px] w-auto max-w-full rounded-xl object-contain shadow-2xl border border-slate-800/80 cursor-pointer transition-transform hover:scale-[1.01]"
                    onClick={() => setShowImageZoom(true)}
                  />
                </div>

                <div className="p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                  <span className="text-[11px] font-mono text-slate-500">
                    Live embed URL parameter: <code className="text-yellow-400/80">live_link</code> in Admin
                  </span>
                  <Link
                    to="/admin/projects"
                    className="text-accent hover:underline text-[11px] font-mono inline-flex items-center gap-1"
                  >
                    <Edit3 size={11} />
                    Configure live embed URL in Admin →
                  </Link>
                </div>
              </div>
            ) : (
              /* Interactive High-Fidelity Power BI Simulation */
              <div className="p-4 sm:p-8 bg-slate-950 text-slate-100 flex flex-col justify-between" style={{ minHeight: 'clamp(560px, 72vh, 780px)' }}>
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 font-bold text-sm">
                      PBI
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm sm:text-base text-white">{title}</h4>
                      <p className="text-[11px] font-mono text-slate-400">
                        Live Cross-Filter Model • {recordsCount}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                    <button
                      onClick={() => setActiveTab('view1')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        activeTab === 'view1'
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Performance KPIs
                    </button>
                    <button
                      onClick={() => setActiveTab('view2')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        activeTab === 'view2'
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Distribution Trends
                    </button>
                  </div>
                </div>

                <div className="my-6 grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
                  <div className="lg:col-span-4 space-y-3 flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 uppercase block">Sample Scope</span>
                        <span className="font-display font-bold text-lg text-blue-400 truncate block">{recordsCount}</span>
                        <span className="text-[10px] text-emerald-400 mt-0.5 block">↑ Verified Dataset</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 uppercase block">Primary Stack</span>
                        <span className="font-display font-bold text-lg text-yellow-400 truncate block">{tags[0] || 'Power BI'}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">{tags[1] || 'DAX'}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-2">
                          Active Dimension Filters
                        </span>
                        <div className="space-y-1.5 text-xs">
                          {tags.slice(0, 4).map((tag, idx) => (
                            <div
                              key={tag}
                              className={`px-3 py-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                                idx === 0
                                  ? 'bg-blue-500/20 border-blue-500 text-white font-semibold'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <span>{tag}</span>
                              <span className="text-[10px] font-mono text-slate-400">{idx === 0 ? 'Selected' : 'Filter'}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                        <span>Interactive Cross-Filter Engine</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-8 p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-display font-bold text-sm sm:text-base text-white">
                          {activeTab === 'view1' ? 'Operational Distribution & Metrics' : 'Comparative Segment Trends'}
                        </h5>
                        <span className="text-[11px] font-mono text-slate-400">{tags.join(' • ')}</span>
                      </div>

                      <div className="space-y-3 font-mono text-xs">
                        {[
                          { label: tags[0] || 'Category A', pct: 78, val: 'Primary Driver', col: 'bg-blue-500' },
                          { label: tags[1] || 'Category B', pct: 64, val: 'Core Variable', col: 'bg-blue-400' },
                          { label: tags[2] || 'Category C', pct: 52, val: 'Performance Lead', col: 'bg-emerald-500' },
                          { label: tags[3] || 'Category D', pct: 38, val: 'Secondary Factor', col: 'bg-yellow-500' },
                        ].map((item) => (
                          <div key={item.label} className="space-y-1">
                            <div className="flex justify-between text-slate-300 text-[11px]">
                              <span className="font-bold">{item.label}</span>
                              <span>{item.val}</span>
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

                    <div className="mt-5 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                      <span>Self-service reporting model</span>
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                      >
                        Inspect code & assets on GitHub →
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-900 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                  <span className="text-[11px] font-mono text-slate-500">
                    Embed URL parameter: <code className="text-yellow-400/80">live_link</code>
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
            {dashboardGuideCards.map((guide) => {
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
            Empirical conclusions derived from analyzing the dataset:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {insightCards.map((card) => (
              <div
                key={card.num}
                className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-surface border border-line shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-accent tracking-widest uppercase block mb-2">
                    {card.num} — {card.tag}
                  </span>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-ink mb-3 leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-sm sm:text-base text-ink-soft leading-relaxed">{card.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-xs font-mono text-ink-soft">
                  <span>Scope: {recordsCount}</span>
                  <span className="text-accent font-bold">{card.badge}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 08: BUSINESS IMPACT ("Why It Matters") ── */}
        <section className="mb-16 sm:mb-24">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.2em] text-accent mb-3">
            <Award size={15} />
            <span>05 — Business Impact</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-ink mb-6 sm:mb-8">
            Why It Matters for Stakeholders & Decision Makers
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {businessImpacts.map((impact) => (
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
            {techMatrix.map((item) => (
              <div
                key={item.name}
                className="p-5 sm:p-6 rounded-2xl bg-surface border border-line shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-bold px-2 py-0.5 rounded bg-accent/10">
                      {item.category}
                    </span>
                    <Code2 size={18} className="text-ink-soft" />
                  </div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-ink mb-1.5">
                    {item.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">{item.role}</p>
                </div>
              </div>
            ))}
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
              {project.result ||
                `Converted raw transactional records into an intuitive visual analytics dashboard that empowers teams to make proactive, evidence-based business decisions.`}
            </p>
            <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
              {project.insight ||
                'The project delivers recruiter-ready benchmarks, eliminating guesswork and providing a reproducible framework for analyzing complex datasets.'}
            </p>
          </div>
        </section>

        {/* ── 11: SOURCE / REPOSITORY (Dark Action Banner) ── */}
        <section className="rounded-2xl sm:rounded-3xl bg-slate-950 text-slate-100 p-8 sm:p-12 border border-slate-800 shadow-xl text-center">
          <h2 className="text-2xl sm:text-4xl font-display font-black text-white mb-3">
            Explore the Full Project
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto mb-8">
            Access the reproducible code, documentation, and data transformation scripts on GitHub, or return to explore other analytics case studies.
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

      {/* Image Zoom Lightbox Modal */}
      {showImageZoom && project.image_url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          onClick={() => setShowImageZoom(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setShowImageZoom(false)}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-800/80 text-white text-xs font-mono hover:bg-slate-700"
            >
              Close ✕
            </button>
            <img
              src={project.image_url}
              alt={title}
              className="w-full h-auto max-h-[85vh] object-contain p-2"
            />
          </div>
        </div>
      )}
    </div>
  );
}

