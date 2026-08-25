import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';
import { useContent } from '../context/ContentProvider';
import StyleOverrides from '../editor/StyleOverrides';
import arunProfile from '../assets/arun-profile.jpg';
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
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
  ChevronLeft,
  FolderGit2,
  Maximize2,
  Edit2,
  Edit3,
  Truck,
  Plane,
  Users,
  Activity,
  Cpu,
  Share2,
  Calendar,
  Clock,
  BookOpen,
  Copy,
  Check,
  GitBranch,
  FileText,
  Grid,
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
  const { projects: contextProjects = [], settings } = useContent();
  const [project, setProject] = useState(null);
  const [allProjectsList, setAllProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeVisualIndex, setActiveVisualIndex] = useState(0);

  // Fetch project & all projects directly from Supabase for instant real-time live data
  useEffect(() => {
    let isMounted = true;
    const fetchLiveProject = async () => {
      if (supabase) {
        try {
          const [projRes, allRes] = await Promise.all([
            supabase.from('projects').select('*').eq('id', id).single(),
            supabase.from('projects').select('*').order('sort_order', { ascending: true }),
          ]);

          if (isMounted) {
            if (allRes.data && allRes.data.length > 0) {
              setAllProjectsList(allRes.data);
            }
            if (projRes.data) {
              setProject(projRes.data);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Supabase project query fallback:', err);
        }
      }

      // Fallback to in-memory context projects
      if (contextProjects && contextProjects.length > 0) {
        setAllProjectsList(contextProjects);
        const found = contextProjects.find(
          (p) => String(p.id) === String(id) || String(p._id) === String(id)
        );
        if (found && isMounted) {
          setProject(found);
          setLoading(false);
          return;
        }
      }

      if (isMounted) setLoading(false);
    };

    fetchLiveProject();
    return () => {
      isMounted = false;
    };
  }, [id, contextProjects]);

  const copyToClipboard = (text, codeId) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(codeId);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Find previous and next projects for cross-navigation
  const { prevProject, nextProject, relatedProjects } = useMemo(() => {
    const list = allProjectsList.length > 0 ? allProjectsList : contextProjects;
    const currentIndex = list.findIndex((p) => String(p.id) === String(id) || String(p._id) === String(id));
    
    const prev = currentIndex > 0 ? list[currentIndex - 1] : list[list.length - 1];
    const next = currentIndex < list.length - 1 && currentIndex !== -1 ? list[currentIndex + 1] : list[0];
    const related = list.filter((p) => String(p.id) !== String(id) && String(p._id) !== String(id)).slice(0, 3);

    return { prevProject: prev, nextProject: next, relatedProjects: related };
  }, [allProjectsList, contextProjects, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 px-4 text-center">
        <h1 className="text-3xl font-display font-bold mb-3">Case Study Not Found</h1>
        <p className="text-slate-500 mb-6 max-w-md text-sm">
          The requested analytical case study could not be loaded or may have been moved.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-blue-600 transition-colors"
        >
          <ArrowLeft size={16} /> Return to Blog & Publication Index
        </Link>
      </div>
    );
  }

  // ─── Dynamic Attributes ───
  const title = project.title || 'Data Analytics Case Study';
  const authorAvatar = settings?.about?.profileImage || project.author_avatar || arunProfile;
  const subtitle =
    project.subtitle ||
    project.problem ||
    `An end-to-end data analytics investigation evaluating ${title.toLowerCase()} to extract actionable intelligence.`;

  const tags = Array.isArray(project.tags) && project.tags.length > 0
    ? project.tags
    : ['Power BI', 'SQL', 'Data Analytics', 'Data Visualization'];

  const powerBiEmbedUrl = project.powerbi_embed_url || project.live_link || project.liveLink || '';
  const githubUrl = project.github_link || project.githubLink || 'https://github.com/arun-pandian-p';
  const datasetUrl = project.dataset_url || githubUrl;
  
  // Extract up to 5 multi-format visuals (PNG, JPG, GIF, WebM, MP4)
  const rawImageField = project.image_url || project.image || project.imageUrl || '';
  const visualsList = rawImageField.includes('|||')
    ? rawImageField.split('|||').map(v => v.trim()).filter(Boolean)
    : [rawImageField].filter(Boolean);

  const activeVisual = visualsList[activeVisualIndex] || visualsList[0] || '';
  const isVideoVisual = activeVisual ? Boolean(activeVisual.match(/\.(mp4|webm|ogg|mov)$/i)) : false;

  const toolsSummary = tags.slice(0, 4).join(' • ');

  const isDelivery = title.toLowerCase().includes('delivery') || title.toLowerCase().includes('amazon');

  // Staggered Gantt Chart Data (Cascading timeline matching sample_blog.pdf Image 2)
  const cascadingGanttTasks = [
    { label: 'Project Initiation & Scope', left: 4, width: 14, color: 'bg-slate-600 text-white' },
    { label: 'Feasibility & Data Audit', left: 15, width: 16, color: 'bg-slate-500 text-white' },
    { label: 'Power Query ETL Normalization', left: 28, width: 22, color: 'bg-blue-600 text-white' },
    { label: 'Star-Schema Dimensional Modeling', left: 45, width: 18, color: 'bg-indigo-600 text-white' },
    { label: 'Core DAX Measure Engineering & Calculation', left: 38, width: 36, color: 'bg-rose-500 text-white' },
    { label: 'Visual UI & Interactive Cross-Filtering', left: 70, width: 18, color: 'bg-blue-600 text-white' },
    { label: 'Quality Assurance & SLA Verification', left: 78, width: 16, color: 'bg-blue-700 text-white' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-blue-600 selection:text-white">
      <Helmet>
        <title>{title} | Arun Pandian - Analytics Case Study</title>
        <meta name="description" content={subtitle} />
      </Helmet>

      <StyleOverrides />
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        
        {/* ── 01: EDITORIAL HEADER & AUTHOR INFO (Matching sample_blog.pdf) ── */}
        <header className="mb-8 sm:mb-10 pb-8 border-b border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase text-slate-600 hover:text-blue-600 font-semibold transition-colors"
            >
              <ChevronLeft size={14} />
              <span>Blog & Publication Index</span>
            </Link>
            
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={`/admin/projects?edit=${project.id}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 text-xs font-mono font-medium transition-all shadow-xs cursor-pointer"
                title="Edit this project in Admin Panel"
              >
                <Edit2 size={12} className="text-slate-500" />
                <span>Edit in Admin</span>
              </Link>
              <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  {new Date(project.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={13} /> 6 min read
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              data-edit-id="project.category"
              data-edit-name="Project Category"
              data-edit-kind="text"
              data-edit-path="project.category"
              className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200"
            >
              {tags[0] || 'Power BI'}
            </span>
            <span
              data-edit-id="project.tags"
              data-edit-name="Project Tags"
              data-edit-kind="text"
              data-edit-path="project.tags"
              className="px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200"
            >
              {toolsSummary}
            </span>
          </div>

          {/* Large Editorial Headline */}
          <h1
            data-edit-id="project.title"
            data-edit-name="Project Title"
            data-edit-kind="heading"
            data-edit-path="project.title"
            className="font-display font-black text-3xl sm:text-5xl text-slate-900 tracking-tight leading-[1.12] mb-5"
          >
            {title}
          </h1>

          {/* Author Block & Social Links (Gleek style) */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <img
                src={authorAvatar}
                alt="Arun Pandian"
                className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-slate-100 shadow-xs"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = arunProfile;
                }}
              />
              <div>
                <span
                  data-edit-id="hero.name"
                  data-edit-name="Author Name"
                  data-edit-kind="heading"
                  data-edit-path="hero.name"
                  className="font-bold text-sm text-slate-900 block leading-tight"
                >
                  Arun Pandian
                </span>
                <span
                  data-edit-id="hero.title"
                  data-edit-name="Author Role"
                  data-edit-kind="text"
                  data-edit-path="hero.title"
                  className="text-[11px] font-mono text-slate-500"
                >
                  Data Analyst
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
              <a href="https://www.linkedin.com/in/arunpandianp-dataanalyst/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">LinkedIn ↗</a>
              <a href="https://github.com/arun-pandian-p" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">GitHub ↗</a>
              <a href="/resume.pdf" download className="hover:text-blue-600 transition-colors font-semibold text-blue-600">Résumé ↓</a>
            </div>
          </div>
        </header>

        {/* ── 02: ANALYTICAL QUESTION & RECRUITER MODE ── */}
        <section className="mb-10 space-y-6">
          {/* Analytical Question Box */}
          <div className="p-5 sm:p-6 rounded-2xl bg-blue-50/70 border border-blue-200/80">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-blue-700 block mb-1">
              Analytical Question & Core Hypothesis:
            </span>
            <p
              data-edit-id="project.problem"
              data-edit-name="Analytical Question / Problem"
              data-edit-kind="text"
              data-edit-path="project.problem"
              className="text-base sm:text-lg text-slate-800 italic font-medium leading-relaxed"
            >
              "{project.problem || subtitle}"
            </p>
          </div>

          {/* Recruiter At-a-Glance Grid */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Recruiter Mode · Key Deliverables
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-900 block mb-1">Problem Addressed</span>
                <p className="text-slate-600 leading-relaxed">
                  {isDelivery ? 'Delivery SLA delay variance under weather & traffic surges.' : 'Operational bottlenecks and data fragmentation.'}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Dataset Source</span>
                <a href={datasetUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono truncate block">
                  Verified Production Dataset ↗
                </a>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Architecture</span>
                <p className="text-slate-600 leading-relaxed">
                  Star-Schema, 1-to-many propagation, dynamic DAX measures.
                </p>
              </div>

              <div>
                <span className="font-bold text-emerald-800 block mb-1">Key Impact</span>
                <p
                  data-edit-id="project.result"
                  data-edit-name="Key Outcome / Impact"
                  data-edit-kind="text"
                  data-edit-path="project.result"
                  className="text-emerald-700 leading-relaxed font-medium"
                >
                  {project.result || 'Identified +48 min delay penalty saving 14% turnaround variance.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 03: LIVE ANALYTICS SHOWCASE & REAL UPLOADED VISUAL ── */}
        <section className="mb-12">
          <div className="w-full rounded-2xl bg-slate-900 border border-slate-200 shadow-xl overflow-hidden">
            {/* Top Bar */}
            <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-500 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-amber-500 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
                </div>
                <span className="font-mono text-slate-300 ml-2 hidden sm:inline">{title}</span>
              </div>
              <div className="flex items-center gap-2">
                {activeVisual && (
                  <button
                    onClick={() => setShowImageZoom(true)}
                    className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white font-mono text-[11px] cursor-pointer"
                  >
                    Zoom View ↗
                  </button>
                )}
                {powerBiEmbedUrl && (
                  <a
                    href={powerBiEmbedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px]"
                  >
                    Open Live Dashboard ↗
                  </a>
                )}
              </div>
            </div>

            {/* Multi-Visual Slide Switcher Bar (When 2 to 5 visuals exist) */}
            {visualsList.length > 1 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/90 border-b border-slate-800 overflow-x-auto">
                <span className="text-[11px] font-mono text-slate-400 font-bold">Gallery ({visualsList.length} Visuals):</span>
                <div className="flex items-center gap-1.5">
                  {visualsList.map((vUrl, idx) => {
                    const isVid = vUrl.match(/\.(mp4|webm|ogg|mov)$/i);
                    const isGif = vUrl.match(/\.gif$/i);
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveVisualIndex(idx)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
                          activeVisualIndex === idx
                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <span>Visual 0{idx + 1}</span>
                        {isVid && <span className="text-[9px] px-1 py-0.2 bg-blue-900 text-blue-200 rounded font-bold">MP4</span>}
                        {isGif && <span className="text-[9px] px-1 py-0.2 bg-emerald-900 text-emerald-200 rounded font-bold">GIF</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Visual Canvas */}
            <div className="p-3 sm:p-6 bg-slate-950 flex items-center justify-center min-h-[360px]">
              {powerBiEmbedUrl && !iframeError ? (
                <iframe
                  title={title}
                  src={powerBiEmbedUrl}
                  className="w-full aspect-16/9 rounded-xl border-0"
                  allowFullScreen
                  onError={() => setIframeError(true)}
                />
              ) : activeVisual ? (
                isVideoVisual ? (
                  <video
                    src={activeVisual}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-auto max-h-[550px] object-contain rounded-lg shadow-md"
                  />
                ) : (
                  <img
                    src={activeVisual}
                    alt={`${title} - Visual 0${activeVisualIndex + 1}`}
                    className="w-full h-auto max-h-[550px] object-contain rounded-lg cursor-pointer hover:scale-[1.005] transition-transform"
                    onClick={() => setShowImageZoom(true)}
                  />
                )
              ) : (
                <div className="text-slate-400 font-mono text-xs">Visual report preview available</div>
              )}
            </div>
          </div>
        </section>

        {/* ── 04: CASCADING GANTT CHART (Exact Gleek Layout from sample_blog.pdf Image 2) ── */}
        <section className="mb-14 space-y-4">
          <div className="flex items-center justify-between">
            <h3
              data-edit-id="project.ganttTitle"
              data-edit-name="Timeline Section Title"
              data-edit-kind="heading"
              data-edit-path="project.ganttTitle"
              className="font-serif font-bold text-xl sm:text-2xl text-slate-900"
            >
              Phased Implementation & Turnaround Timeline
            </h3>
            <span
              data-edit-id="project.ganttBadge"
              data-edit-name="Timeline Badge"
              data-edit-kind="text"
              data-edit-path="project.ganttBadge"
              className="text-xs font-mono text-slate-500"
            >
              6-Stage Lifecycle
            </span>
          </div>

          <p
            data-edit-id="project.ganttDescription"
            data-edit-name="Timeline Description"
            data-edit-kind="text"
            data-edit-path="project.ganttDescription"
            className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans"
          >
            The project follows an iterative analytical lifecycle ensuring rigorous validation across every stage. The cascading Gantt chart below illustrates the sequential schedule from ingestion to deployment milestone:
          </p>

          {/* Gleek Staggered Gantt Canvas (Matching Image 2) */}
          <div className="p-4 sm:p-6 rounded-2xl bg-[#F0F7FF] border border-blue-100 overflow-x-auto shadow-2xs">
            <div className="min-w-[650px] relative py-4">
              
              {/* Vertical Time Grid Columns */}
              <div className="absolute inset-0 grid grid-cols-6 pointer-events-none">
                <div className="border-r border-blue-200/50 h-full" />
                <div className="border-r border-blue-200/50 h-full" />
                <div className="border-r border-blue-200/50 h-full" />
                <div className="border-r border-blue-200/50 h-full" />
                <div className="border-r border-blue-200/50 h-full" />
                <div className="border-r border-rose-400 h-full relative">
                  {/* Red Milestone Vertical Line (Image 2 style) */}
                  <span className="absolute -top-3 right-0 text-[10px] font-mono font-bold text-rose-600 bg-white px-1.5 py-0.5 rounded shadow-2xs border border-rose-200">
                    Milestone
                  </span>
                </div>
              </div>

              {/* Staggered Gantt Bars */}
              <div className="space-y-3 relative z-10 font-sans text-[11px]">
                {cascadingGanttTasks.map((task, idx) => (
                  <div key={idx} className="h-7 relative flex items-center">
                    <div
                      className={`absolute h-6 rounded-md shadow-xs px-2.5 flex items-center font-medium truncate ${task.color}`}
                      style={{
                        left: `${task.left}%`,
                        width: `${task.width}%`,
                      }}
                    >
                      <span className="truncate text-[10px] font-sans">{task.label}</span>
                    </div>
                  </div>
                ))}

                {/* Milestone Diamond Marker at end */}
                <div className="h-6 relative flex items-center">
                  <div
                    className="absolute flex items-center gap-1.5"
                    style={{ left: '92%' }}
                  >
                    <div className="w-3.5 h-3.5 bg-blue-600 rotate-45 shadow-xs" />
                    <span className="text-[10px] font-mono font-bold text-blue-900 whitespace-nowrap">
                      Project Closure
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Date Scale */}
              <div className="grid grid-cols-6 pt-6 border-t border-blue-200 text-[10px] font-mono text-slate-500 mt-4">
                <span>2026-06-01</span>
                <span>2026-06-15</span>
                <span>2026-07-01</span>
                <span>2026-07-15</span>
                <span>2026-08-01</span>
                <span>2026-08-24</span>
              </div>
            </div>
          </div>

          {/* Inline Link + Pill Badge (Gleek style from Image 3) */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-serif italic text-slate-700">
            <span>Explore relational model architecture in</span>
            <span className="not-italic inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-300 text-slate-800 text-[11px] font-mono font-semibold">
              <FileText size={12} /> Evaluating Dimensional Data Modeling
            </span>
          </div>
        </section>

        {/* ── 05: STRUCTURED TABS (Overview, Insights, DAX / SQL, Data Model, Downloads) ── */}
        <section className="mb-16">
          {/* Tab Selection Bar */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 mb-8 overflow-x-auto hide-scrollbar">
            {[
              { id: 'overview', label: '📊 Overview' },
              { id: 'insights', label: '💡 Insights' },
              { id: 'dax', label: '🧮 DAX / SQL' },
              { id: 'model', label: '📐 Data Model' },
              { id: 'downloads', label: '📥 Downloads' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-edit-id={`project.tab.${tab.id}`}
                data-edit-name={`Tab: ${tab.label}`}
                data-edit-kind="button"
                data-edit-path={`project.tab.${tab.id}`}
                className={`min-h-[40px] px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 space-y-4">
                <h3
                  data-edit-id="project.overviewTitle"
                  data-edit-name="Overview Section Title"
                  data-edit-kind="heading"
                  data-edit-path="project.overviewTitle"
                  className="font-display font-bold text-xl text-slate-900"
                >
                  Business Context & Objectives
                </h3>
                <p
                  data-edit-id="project.overviewDescription"
                  data-edit-name="Overview Description"
                  data-edit-kind="text"
                  data-edit-path="project.overviewDescription"
                  className="text-slate-700 leading-relaxed text-sm sm:text-base font-normal"
                >
                  {project.description || project.problem || 'This analytics project investigates operational performance metrics by comparing empirical lead times against statistical prediction models. By cross-referencing multi-variable factors including weather conditions and traffic density, we provide executive stakeholders with high-confidence decision triggers.'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs font-mono text-slate-600">
                  <div><strong>Tools:</strong> {toolsSummary}</div>
                  <div><strong>Dimensional Model:</strong> Star-Schema</div>
                  <div><strong>Calculation Engine:</strong> DAX / SQL</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INSIGHTS */}
          {activeTab === 'insights' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Weather Impact on Lead Time',
                  tag: 'Logistics Factor',
                  finding: 'Severe weather conditions (Stormy / Foggy) contributed an average of +48 minutes to delivery lead times.',
                  evidence: 'Cross-referenced against 45,000+ orders across 5 regional meteorological hubs.',
                  implication: 'Enables dynamic buffer adjustments in dispatch scheduling during forecasted storm windows.',
                },
                {
                  title: 'Traffic Jam Congestion Multiplier',
                  tag: 'Operational Risk',
                  finding: 'Metropolitan density zones experience 2.3x higher delivery turnaround variance during peak hours.',
                  evidence: 'Isolated traffic congestion index from low (Level 1) to jam (Level 4).',
                  implication: 'Automates proactive customer ETA updates to reduce customer support inbound inquiries.',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 block mb-1">
                      Insight 0{idx + 1} · {item.tag}
                    </span>
                    <h4 className="font-display font-bold text-lg text-slate-900 mb-2">{item.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
                      <strong>Finding:</strong> {item.finding}
                    </p>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
                      <strong>Evidence:</strong> {item.evidence}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 text-xs text-emerald-800 font-medium">
                    <strong>Business Value:</strong> {item.implication}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: DAX / SQL */}
          {activeTab === 'dax' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 space-y-6">
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900 mb-1">
                  Engineered DAX Measures & SQL Queries
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Production-grade calculations engineered for instant dashboard responsiveness.
                </p>
              </div>

              {/* Code 1 */}
              <div className="rounded-xl overflow-hidden bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-slate-400">
                  <span>// 1. Average Delivery Delay Variance Delta</span>
                  <button
                    onClick={() => copyToClipboard(`SLA_Variance_Delta = \nDIVIDE(\n    [Avg_Actual_Delivery_Time] - [Avg_Predicted_Delivery_Time],\n    [Avg_Predicted_Delivery_Time],\n    0\n)`, 'c1')}
                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedCode === 'c1' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span className="text-[10px]">{copiedCode === 'c1' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 text-blue-300 overflow-x-auto leading-relaxed">
{`SLA_Variance_Delta = 
DIVIDE(
    [Avg_Actual_Delivery_Time] - [Avg_Predicted_Delivery_Time],
    [Avg_Predicted_Delivery_Time],
    0
)`}
                </pre>
              </div>

              {/* Code 2 */}
              <div className="rounded-xl overflow-hidden bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-slate-400">
                  <span>// 2. On-Time Fulfillment % Benchmark</span>
                  <button
                    onClick={() => copyToClipboard(`On_Time_Rate_Pct = \nCALCULATE(\n    COUNTROWS(f_deliveries),\n    f_deliveries[Actual_Time_Mins] <= f_deliveries[SLA_Target_Mins]\n) / COUNTROWS(f_deliveries)`, 'c2')}
                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedCode === 'c2' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span className="text-[10px]">{copiedCode === 'c2' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 text-emerald-300 overflow-x-auto leading-relaxed">
{`On_Time_Rate_Pct = 
CALCULATE(
    COUNTROWS(f_deliveries),
    f_deliveries[Actual_Time_Mins] <= f_deliveries[SLA_Target_Mins]
) / COUNTROWS(f_deliveries)`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: DATA MODEL */}
          {activeTab === 'model' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 space-y-6">
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900 mb-1">
                  Star-Schema Relational Architecture
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Optimized dimensional schema with 1-to-many single-directional filter propagation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950">
                  <div className="font-bold text-blue-800 mb-2 flex justify-between items-center">
                    <span>Fact Table</span>
                    <span className="text-[10px] bg-blue-200 px-1.5 py-0.5 rounded">f_deliveries</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-blue-900">
                    <li>• Delivery_ID (PK)</li>
                    <li>• Order_Date (FK)</li>
                    <li>• Driver_ID (FK)</li>
                    <li>• Actual_Time_Mins</li>
                    <li>• Predicted_Time_Mins</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                  <div className="font-bold text-slate-900 mb-2 flex justify-between items-center">
                    <span>Dimension</span>
                    <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">d_traffic</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-600">
                    <li>• Traffic_ID (PK)</li>
                    <li>• Traffic_Level (Jam / Low)</li>
                    <li>• Congestion_Index</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                  <div className="font-bold text-slate-900 mb-2 flex justify-between items-center">
                    <span>Dimension</span>
                    <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">d_weather</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-600">
                    <li>• Weather_ID (PK)</li>
                    <li>• Condition (Storm / Rain)</li>
                    <li>• Precipitation_mm</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DOWNLOADS */}
          {activeTab === 'downloads' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 space-y-4">
              <h3
                data-edit-id="project.downloadsTitle"
                data-edit-name="Downloads Section Title"
                data-edit-kind="heading"
                data-edit-path="project.downloadsTitle"
                className="font-display font-bold text-xl text-slate-900"
              >
                Deliverables & Source Files
              </h3>
              <p
                data-edit-id="project.downloadsDescription"
                data-edit-name="Downloads Description"
                data-edit-kind="text"
                data-edit-path="project.downloadsDescription"
                className="text-xs text-slate-500 font-mono mb-6"
              >
                Verified repository downloads for code validation and reproduction.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 flex flex-col justify-between transition-colors cursor-pointer"
                >
                  <span className="text-xs font-mono font-bold text-blue-600">.PBIX File</span>
                  <span className="text-sm font-bold mt-1">Download Power BI Model</span>
                  <span className="text-[10px] font-mono text-slate-400 mt-3">GitHub Source ↗</span>
                </a>

                <a
                  href={datasetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 flex flex-col justify-between transition-colors cursor-pointer"
                >
                  <span className="text-xs font-mono font-bold text-emerald-600">Raw Dataset</span>
                  <span className="text-sm font-bold mt-1">Dataset Source (.CSV)</span>
                  <span className="text-[10px] font-mono text-slate-400 mt-3">Verified Data ↗</span>
                </a>

                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 flex flex-col justify-between transition-colors cursor-pointer"
                >
                  <span className="text-xs font-mono font-bold text-amber-600">Documentation</span>
                  <span className="text-sm font-bold mt-1">Technical Markdown</span>
                  <span className="text-[10px] font-mono text-slate-400 mt-3">GitHub README ↗</span>
                </a>

                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 flex flex-col justify-between transition-colors cursor-pointer"
                >
                  <span className="text-xs font-mono font-bold text-purple-600">Repository</span>
                  <span className="text-sm font-bold mt-1">GitHub Repo</span>
                  <span className="text-[10px] font-mono text-slate-400 mt-3">arun-pandian-p ↗</span>
                </a>
              </div>
            </div>
          )}
        </section>

        {/* ── 06: "DISCOVER MORE" BOX (Dynamic Project & Publication Links) ── */}
        <section className="mb-14 rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs">
          {/* Header Bar */}
          <div className="bg-[#EBF3FF] px-5 py-3 border-b border-blue-100 flex items-center justify-between">
            <h4
              data-edit-id="project.discoverMoreTitle"
              data-edit-name="Discover More Title"
              data-edit-kind="heading"
              data-edit-path="project.discoverMoreTitle"
              className="font-bold text-sm text-slate-800 font-sans"
            >
              Discover more
            </h4>
            <Link to="/#projects" className="text-xs font-mono text-blue-600 font-semibold hover:underline">
              View All Works →
            </Link>
          </div>

          {/* Dynamic List Rows from Real Database Projects */}
          <div className="divide-y divide-slate-100 bg-white">
            <Link
              to="/#projects"
              className="px-5 py-3.5 flex items-center justify-between text-sm font-semibold text-slate-800 hover:text-blue-600 hover:bg-slate-50/80 transition-colors group cursor-pointer"
            >
              <span>projects</span>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>

            {relatedProjects.map((rp) => (
              <Link
                key={rp.id}
                to={`/project/${rp.id}`}
                className="px-5 py-3.5 flex items-center justify-between text-sm text-slate-700 hover:text-blue-600 hover:bg-slate-50/80 transition-colors group cursor-pointer"
              >
                <span>{rp.title}</span>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}

            <Link
              to="/blog"
              className="px-5 py-3.5 flex items-center justify-between text-sm text-slate-700 hover:text-blue-600 hover:bg-slate-50/80 transition-colors group cursor-pointer"
            >
              <span>Data Analytics Publication & Notes Feed</span>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </section>

        {/* ── 07: RELATED CASE STUDIES GRID (Live Uploaded Thumbnails) ── */}
        {relatedProjects.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-4">
              <h4
                data-edit-id="project.relatedTitle"
                data-edit-name="Related Projects Title"
                data-edit-kind="heading"
                data-edit-path="project.relatedTitle"
                className="font-serif font-bold text-base text-slate-900"
              >
                Related analytical case studies
              </h4>
              <Link to="/#projects" className="text-xs font-mono text-blue-600 hover:underline">
                Explore portfolio →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedProjects.map((rp) => (
                <Link
                  key={rp.id}
                  to={`/project/${rp.id}`}
                  className="rounded-xl overflow-hidden bg-white hover:bg-slate-50 border border-slate-200 flex flex-col justify-between transition-all duration-300 shadow-2xs hover:shadow-md group"
                >
                  <div className="aspect-16/10 bg-slate-900 overflow-hidden relative">
                    {rp.image_url || rp.image ? (
                      <img
                        src={rp.image_url || rp.image}
                        alt={rp.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-xs">
                        Case Study
                      </div>
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-white/90 backdrop-blur-xs text-[10px] font-mono font-bold text-slate-800">
                      {rp.category || 'Power BI'}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <h5 className="font-display font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-2">
                      {rp.title}
                    </h5>
                    <span className="text-[11px] font-mono text-blue-600 font-semibold flex items-center gap-1">
                      Read investigation <ArrowRight size={11} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── 08: PREV / NEXT NAVIGATION (Seamless Project Browsing) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
          {prevProject && (
            <Link
              to={`/project/${prevProject.id}`}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center gap-3 group"
            >
              <ChevronLeft size={20} className="text-slate-400 group-hover:text-blue-600 group-hover:-translate-x-1 transition-all" />
              <div className="truncate">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Previous Project</span>
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate block">{prevProject.title}</span>
              </div>
            </Link>
          )}

          {nextProject && (
            <Link
              to={`/project/${nextProject.id}`}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between text-right group sm:col-start-2"
            >
              <div className="truncate">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Next Project</span>
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate block">{nextProject.title}</span>
              </div>
              <ChevronRight size={20} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>
          )}
        </div>

        {/* ── 09: BOTTOM ACTION BANNER (Full Fusion with Home Projects & Publication) ── */}
        <section className="rounded-2xl sm:rounded-3xl bg-slate-900 text-white p-8 sm:p-12 text-center shadow-lg">
          <h2
            data-edit-id="project.ctaTitle"
            data-edit-name="CTA Banner Title"
            data-edit-kind="heading"
            data-edit-path="project.ctaTitle"
            className="text-2xl sm:text-4xl font-display font-black mb-3"
          >
            Explore the Full Code & Data Model
          </h2>
          <p
            data-edit-id="project.ctaDescription"
            data-edit-name="CTA Banner Description"
            data-edit-kind="text"
            data-edit-path="project.ctaDescription"
            className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto mb-8"
          >
            Access the reproducible code, dimensional schemas, and data transformation scripts on GitHub, or return to explore other analytics case studies.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-edit-id="project.ctaGithub"
              data-edit-name="CTA GitHub Button"
              data-edit-kind="button"
              data-edit-path="project.ctaGithub"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <GithubIcon size={16} />
              <span>GitHub Repository</span>
            </a>

            {powerBiEmbedUrl && (
              <a
                href={powerBiEmbedUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-edit-id="project.ctaDashboard"
                data-edit-name="CTA Live Dashboard Button"
                data-edit-kind="button"
                data-edit-path="project.ctaDashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all shadow-2xs cursor-pointer"
              >
                <ExternalLink size={15} />
                <span>Live Dashboard</span>
              </a>
            )}

            <Link
              to="/#projects"
              data-edit-id="project.ctaGrid"
              data-edit-name="CTA Projects Grid Button"
              data-edit-kind="button"
              data-edit-path="project.ctaGrid"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-700 text-slate-200 bg-slate-800 font-semibold text-sm hover:bg-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <Grid size={15} />
              <span>Back to Projects Grid</span>
            </Link>

            <Link
              to="/blog"
              data-edit-id="project.ctaPublication"
              data-edit-name="CTA Publication Button"
              data-edit-kind="button"
              data-edit-path="project.ctaPublication"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-700 text-slate-200 bg-slate-800 font-semibold text-sm hover:bg-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={15} />
              <span>Back to Publication Index</span>
            </Link>

            <Link
              to={`/admin/projects?edit=${project.id}`}
              data-edit-id="project.ctaAdmin"
              data-edit-name="CTA Edit in Admin Button"
              data-edit-kind="button"
              data-edit-path="project.ctaAdmin"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-700 text-slate-300 bg-slate-800/80 font-medium text-sm hover:bg-slate-800 hover:text-white transition-all cursor-pointer shadow-2xs"
            >
              <Edit2 size={14} className="text-slate-400" />
              <span>Edit in Admin</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Floating quick edit button (subtle grey pill) */}
      <div className="fixed bottom-6 right-6 z-40">
        <Link
          to={`/admin/projects?edit=${project.id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono font-medium shadow-xl border border-slate-700/80 transition-all hover:scale-105 backdrop-blur-md cursor-pointer"
          title="Edit this project in Admin Panel"
        >
          <Edit2 size={13} className="text-slate-400" />
          <span>Edit in Admin</span>
        </Link>
      </div>

      {/* Image / Video Zoom Lightbox Modal */}
      {showImageZoom && activeVisual && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={() => setShowImageZoom(false)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 p-2 flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              {visualsList.length > 1 && (
                <span className="px-2 py-1 rounded bg-slate-800/90 text-slate-300 text-xs font-mono">
                  {activeVisualIndex + 1} / {visualsList.length}
                </span>
              )}
              <button
                onClick={() => setShowImageZoom(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800/90 text-white text-xs font-mono hover:bg-slate-700 cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            {isVideoVisual ? (
              <video
                src={activeVisual}
                controls
                autoPlay
                className="w-full h-auto max-h-[85vh] object-contain rounded-lg p-2"
              />
            ) : (
              <img
                src={activeVisual}
                alt={`${title} - Zoomed Visual 0${activeVisualIndex + 1}`}
                className="w-full h-auto max-h-[85vh] object-contain p-2"
              />
            )}

            {visualsList.length > 1 && (
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => setActiveVisualIndex((prev) => (prev > 0 ? prev - 1 : visualsList.length - 1))}
                  className="px-3 py-1 rounded bg-slate-800 text-slate-200 text-xs font-mono hover:bg-slate-700 cursor-pointer"
                >
                  ← Prev Visual
                </button>
                <button
                  onClick={() => setActiveVisualIndex((prev) => (prev < visualsList.length - 1 ? prev + 1 : 0))}
                  className="px-3 py-1 rounded bg-slate-800 text-slate-200 text-xs font-mono hover:bg-slate-700 cursor-pointer"
                >
                  Next Visual →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
