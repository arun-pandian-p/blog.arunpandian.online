import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  ArrowUpRight,
  X,
  Sparkles,
  Filter,
  Target,
  Database,
  Brain,
  Lightbulb,
  TrendingUp,
  Wrench,
  Layers,
  ChevronRight,
  Code2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ProjectChartPreview from './ProjectChartPreview';

const GithubIcon = ({ size = 16 }) => (
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

const CATEGORIES = [
  { id: 'all', label: 'Show all' },
  { id: 'data viz', label: 'Data Viz' },
  { id: 'machine learning', label: 'Machine Learning' },
  { id: 'analytics', label: 'Analytics & SQL' },
  { id: 'automation', label: 'Automation & n8n' },
];

export default function PortfolioGrid({ projects = [], sectionConfig = {} }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setSelectedProject(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [selectedProject]);

  // Normalize and filter projects
  const filteredProjects = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    if (activeCategory === 'all') return projects;

    return projects.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      const tags = (p.tags || []).map((t) => t.toLowerCase());

      if (activeCategory === 'data viz') {
        return cat.includes('viz') || tags.some((t) => t.includes('bi') || t.includes('chart') || t.includes('viz') || t.includes('pivot'));
      }
      if (activeCategory === 'machine learning') {
        return cat.includes('machine') || cat.includes('ml') || tags.some((t) => t.includes('learn') || t.includes('xgboost') || t.includes('model') || t.includes('python'));
      }
      if (activeCategory === 'analytics') {
        return cat.includes('analytics') || tags.some((t) => t.includes('sql') || t.includes('excel') || t.includes('analytics') || t.includes('eda'));
      }
      if (activeCategory === 'automation') {
        return cat.includes('auto') || tags.some((t) => t.includes('n8n') || t.includes('llm') || t.includes('sheet') || t.includes('api'));
      }
      return cat === activeCategory;
    });
  }, [projects, activeCategory]);

  return (
    <section id="projects" className="py-16 sm:py-24 lg:py-28 bg-[#fafafa] text-slate-900 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Section Header ── */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.25em] text-blue-600 mb-2 block">
            {sectionConfig.label || '01 — Selected Work'}
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-slate-900">
            {sectionConfig.title || 'PORTFOLIO'}
          </h2>
          {/* Blue accent line */}
          <div className="h-1 w-12 sm:w-14 bg-blue-600 rounded-full mx-auto mt-2.5 sm:mt-3 mb-3.5 sm:mb-4" />
          <p className="text-xs sm:text-base text-slate-600 max-w-xl mx-auto font-normal leading-relaxed px-2">
            {sectionConfig.subtitle || 'Recruiter-ready case studies'}
          </p>
        </div>

        {/* ── Category Filter Tabs (Touch-friendly & Horizontal scroll on mobile) ── */}
        <div className="flex justify-start sm:justify-center mb-8 sm:mb-12 overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200/90 shadow-xs shadow-slate-100/50">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`relative min-h-[38px] sm:min-h-[40px] px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none whitespace-nowrap flex items-center justify-center ${
                    isActive
                      ? 'text-blue-600 bg-blue-50/90 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                  {isActive && (
                    <motion.div
                      layoutId="activePill"
                      className="absolute inset-0 border border-blue-200 rounded-xl pointer-events-none"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Responsive Projects Grid ── */}
        {/* Mobile: 1 column clean cards | Desktop: Multi-column dense showcase */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          <AnimatePresence>
            {filteredProjects.map((project, index) => {
              const {
                _id,
                id = _id,
                title,
                tags = [],
                githubLink,
                demoLink,
                liveLink = demoLink,
                insight,
                problem,
                result,
                chartType = index,
                image_url,
                imageUrl = image_url,
                category,
              } = project;

              const projectNumber = String(index + 1).padStart(2, '0');
              const displayCategory = category || tags[0] || 'Analytics';
              const summaryResult = result || insight;

              return (
                <motion.article
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25, delay: (index % 4) * 0.04 }}
                  key={id || title}
                  className="group relative bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-400/80 hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  {/* ── Cover Image / Chart Preview (Full Card Width, Responsive, Rounded) ── */}
                  <div className="relative w-full aspect-[16/9] sm:aspect-[4/3] bg-slate-50 border-b border-slate-100 overflow-hidden">
                    <ProjectChartPreview
                      type={chartType}
                      title={title}
                      imageUrl={imageUrl}
                    />

                    {/* Mobile Top Header Badges (Visible on mobile, hidden on desktop hover overlay) */}
                    <div className="md:hidden absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                      <span className="font-mono text-[10px] font-bold text-blue-700 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-md shadow-xs border border-slate-200/80 tracking-wider">
                        #{projectNumber}
                      </span>
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-md px-2 py-0.5 rounded-md">
                        {displayCategory}
                      </span>
                    </div>

                    {/* Desktop Hover Overlay with Quick Buttons */}
                    <div className="hidden md:flex absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col justify-between p-3.5 backdrop-blur-[2px]">
                      <div className="flex justify-between items-center text-white/80 text-[10px] font-mono">
                        <span className="bg-blue-600 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          #{projectNumber} · {displayCategory}
                        </span>
                        <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded">
                          <Sparkles size={10} className="text-amber-400" />
                          View Case Study
                        </span>
                      </div>

                      <div className="flex items-center justify-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                        {githubLink && (
                          <a
                            href={githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-white text-slate-900 hover:bg-blue-600 hover:text-white shadow-md transition-all hover:scale-110"
                            title="View GitHub Repository"
                            aria-label="View GitHub Repository"
                          >
                            <GithubIcon size={16} />
                          </a>
                        )}
                        {liveLink && (
                          <a
                            href={liveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-white text-slate-900 hover:bg-blue-600 hover:text-white shadow-md transition-all hover:scale-110"
                            title="Open Live Demo"
                            aria-label="Open Live Demo"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        <button
                          onClick={() => setSelectedProject(project)}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 font-semibold text-xs shadow-md transition-all flex items-center gap-1 hover:scale-105"
                        >
                          Case Study
                          <ArrowUpRight size={14} />
                        </button>
                      </div>

                      <div className="text-[10px] text-white/70 text-center font-mono">
                        Click card for full breakdown
                      </div>
                    </div>
                  </div>

                  {/* ── Card Content Body ── */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-white gap-3">
                    <div>
                      {/* Desktop Tags (top of text) */}
                      <div className="hidden md:flex flex-wrap gap-1 mb-2">
                        {tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-md bg-slate-100 text-slate-600 border border-slate-200/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Project Title */}
                      <h3 className="font-display font-bold text-slate-900 text-base sm:text-lg leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                        {title}
                      </h3>

                      {/* Recruiter-Scan 1-line Problem & Result (Clean on mobile) */}
                      <div className="mt-2 space-y-1 text-xs leading-relaxed">
                        {problem && (
                          <p className="text-slate-600 line-clamp-2 font-normal">
                            <span className="font-semibold text-slate-800">Problem: </span>
                            {problem}
                          </p>
                        )}
                        {summaryResult && (
                          <p className="text-emerald-700 line-clamp-1 font-medium text-[11px] sm:text-xs">
                            <span className="font-bold text-emerald-800">Impact: </span>
                            {summaryResult}
                          </p>
                        )}
                      </div>

                      {/* Mobile Key Tools / Tags (Compact badges) */}
                      <div className="md:hidden flex flex-wrap gap-1 mt-2.5">
                        {tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200/70"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* ── Mobile Touch-Friendly Action Bar (min 44px touch targets) ── */}
                    <div className="md:hidden pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="flex-1 min-h-[44px] px-3.5 py-2.5 rounded-xl bg-blue-600 active:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 select-none"
                        aria-label={`View Case Study for ${title}`}
                      >
                        <Sparkles size={13} className="text-blue-200" />
                        <span>View Case Study</span>
                        <ArrowUpRight size={14} />
                      </button>

                      {githubLink && (
                        <a
                          href={githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl bg-slate-100 text-slate-700 active:bg-slate-200 border border-slate-200/80 flex items-center justify-center transition-colors"
                          title="GitHub Repository"
                          aria-label="GitHub Repository"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <GithubIcon size={18} />
                        </a>
                      )}
                      {liveLink && (
                        <a
                          href={liveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl bg-slate-100 text-slate-700 active:bg-slate-200 border border-slate-200/80 flex items-center justify-center transition-colors"
                          title="Live Demo"
                          aria-label="Live Demo"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}
                    </div>

                    {/* ── Desktop Bottom Action Footer ── */}
                    <div className="hidden md:flex mt-4 pt-3 border-t border-slate-100 items-center justify-between text-xs text-slate-400">
                      <span className="font-mono text-[10px] text-slate-400">
                        {new Date(project.created_at || Date.now()).getFullYear()}
                      </span>
                      <span className="text-blue-600 font-semibold text-[11px] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                        Explore Case Study <ArrowUpRight size={12} />
                      </span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* ── Empty State ── */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <Filter size={32} className="mx-auto text-slate-400 mb-3" />
            <h4 className="font-bold text-slate-700 text-base">No projects found in this category</h4>
            <p className="text-xs text-slate-400 mt-1">Switch to "Show all" to see all portfolio case studies.</p>
            <button
              onClick={() => setActiveCategory('all')}
              className="mt-4 min-h-[40px] px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500 transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        )}

      </div>

      {/* ── Recruiter-Ready Case Study Modal / Bottom Sheet ── */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            {/* Modal / Bottom Sheet Box */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col z-10 text-slate-900"
            >
              {/* Sticky Top Header with Close Button */}
              <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">
                    Case Study
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {selectedProject.category || selectedProject.tags?.[0] || 'Analytics'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="min-w-[40px] min-h-[40px] p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                  aria-label="Close Case Study Modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="overflow-y-auto overflow-x-hidden p-5 sm:p-7 space-y-6">
                
                {/* Visual Header / Chart Preview */}
                <div className="relative aspect-[16/9] w-full rounded-2xl bg-slate-100 border border-slate-200/80 overflow-hidden">
                  <ProjectChartPreview
                    type={selectedProject.chartType || 0}
                    title={selectedProject.title}
                    imageUrl={selectedProject.image_url || selectedProject.imageUrl}
                  />
                </div>

                {/* Title & Quick Recruiter Takeaway */}
                <div>
                  <h3 className="font-display font-black text-xl sm:text-2xl lg:text-3xl text-slate-900 tracking-tight leading-tight">
                    {selectedProject.title}
                  </h3>
                  
                  {/* Recruiter 5-Second Scan Callout */}
                  {(selectedProject.result || selectedProject.insight) && (
                    <div className="mt-3 p-3.5 rounded-xl bg-blue-50/80 border border-blue-100 flex items-start gap-2.5">
                      <Sparkles size={18} className="text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 block">
                          Executive Takeaway / Impact
                        </span>
                        <p className="text-xs sm:text-sm text-blue-950 font-medium leading-relaxed mt-0.5">
                          {selectedProject.result || selectedProject.insight}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Structured Case Study Flow: Problem → Data → Process → Key Insights → Result → Tools ── */}
                <div className="space-y-4 text-xs sm:text-sm">
                  
                  {/* 1. Problem */}
                  {selectedProject.problem && (
                    <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
                      <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                        <Target size={15} />
                        <span>Problem Statement</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed font-normal">
                        {selectedProject.problem}
                      </p>
                    </div>
                  )}

                  {/* 2. Data */}
                  {selectedProject.data && (
                    <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100">
                      <div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                        <Database size={15} />
                        <span>Dataset & Data Sources</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed font-normal">
                        {selectedProject.data}
                      </p>
                    </div>
                  )}

                  {/* 3. Process */}
                  {selectedProject.process && (
                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                      <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                        <Brain size={15} />
                        <span>Methodology & Workflow</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed font-normal whitespace-pre-line">
                        {selectedProject.process}
                      </p>
                    </div>
                  )}

                  {/* 4. Key Insights */}
                  {selectedProject.insight && (
                    <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                      <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                        <Lightbulb size={15} />
                        <span>Key Analytical Insights</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed font-normal">
                        {selectedProject.insight}
                      </p>
                    </div>
                  )}

                  {/* 5. Result */}
                  {(selectedProject.result || selectedProject.insight) && (
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                        <TrendingUp size={15} />
                        <span>Measurable Outcome & Business Result</span>
                      </div>
                      <p className="text-emerald-950 font-medium leading-relaxed">
                        {selectedProject.result || selectedProject.insight}
                      </p>
                    </div>
                  )}

                  {/* 6. Tools & Technologies */}
                  {selectedProject.tags && selectedProject.tags.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider mb-2.5">
                        <Wrench size={15} />
                        <span>Tools & Tech Stack</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProject.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-white text-slate-800 border border-slate-200 shadow-2xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* ── 7. Live & GitHub Links (Sticky Bottom Bar, min 44px Touch Targets) ── */}
              <div className="sticky bottom-0 z-20 p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shadow-lg">
                <div className="flex items-center gap-2 flex-1 sm:flex-none">
                  {selectedProject.githubLink && (
                    <a
                      href={selectedProject.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                    >
                      <GithubIcon size={16} /> GitHub Source
                    </a>
                  )}
                  {(selectedProject.demoLink || selectedProject.liveLink) && (
                    <a
                      href={selectedProject.demoLink || selectedProject.liveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-500 shadow-sm transition-colors"
                    >
                      <ExternalLink size={16} /> Live Dashboard
                    </a>
                  )}
                </div>

                {selectedProject._id && (
                  <Link
                    to={`/project/${selectedProject._id}`}
                    onClick={() => setSelectedProject(null)}
                    className="min-h-[44px] inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors"
                  >
                    Full Case Study Page <ArrowUpRight size={14} />
                  </Link>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
