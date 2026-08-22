import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ArrowUpRight, X, Sparkles, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProjectChartPreview from './ProjectChartPreview';

const GithubIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const CATEGORIES = [
  { id: 'all', label: 'Show all' },
  { id: 'data viz', label: 'data viz' },
  { id: 'machine learning', label: 'machine learning' },
  { id: 'analytics', label: 'analytics & sql' },
  { id: 'automation', label: 'automation & n8n' },
];

export default function PortfolioGrid({ projects = [], sectionConfig = {} }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);

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
    <section id="projects" className="py-20 sm:py-28 bg-[#fafafa] text-slate-900 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Section Header (matching reference image) ── */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-blue-600 mb-2 block">
            {sectionConfig.label || '01 — Selected Work'}
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-slate-900">
            {sectionConfig.title || 'PORTFOLIO'}
          </h2>
          {/* Blue accent line */}
          <div className="h-1 w-14 bg-blue-600 rounded-full mx-auto mt-3 mb-4" />
          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto font-normal">
            {sectionConfig.subtitle || 'Explore featured data analytics dashboards, predictive machine learning models, and automated ETL pipelines.'}
          </p>
        </div>

        {/* ── Category Filter Tabs ── */}
        <div className="flex justify-center mb-10 sm:mb-12 overflow-x-auto hide-scrollbar px-2">
          <div className="inline-flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-sm shadow-slate-100">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`relative px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none whitespace-nowrap ${
                    isActive
                      ? 'text-blue-600 bg-blue-50/80 font-bold shadow-xs'
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

        {/* ── Multi-Column Dense Portfolio Grid ── */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
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
                chartType = index,
                image_url,
                imageUrl = image_url,
              } = project;

              return (
                <motion.article
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: (index % 4) * 0.05 }}
                  key={id || title}
                  onClick={() => setSelectedProject(project)}
                  className="group relative bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-400/80 hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Chart / Dashboard Viewport */}
                  <div className="relative w-full aspect-video sm:aspect-[4/3] bg-slate-50 border-b border-slate-100 overflow-hidden">
                    <ProjectChartPreview
                      type={chartType}
                      title={title}
                      imageUrl={imageUrl}
                    />

                    {/* Hover Overlay with Quick Buttons */}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 backdrop-blur-[2px]">
                      <div className="flex justify-between items-center text-white/80 text-[10px] font-mono">
                        <span className="bg-blue-600 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          {tags[0] || 'Analytics'}
                        </span>
                        <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded">
                          <Sparkles size={10} className="text-amber-400" />
                          View Case Study
                        </span>
                      </div>

                      <div className="flex items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
                        {githubLink && (
                          <a
                            href={githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-white text-slate-900 hover:bg-blue-600 hover:text-white shadow-md transition-all hover:scale-110"
                            title="View GitHub Repository"
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
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        <button
                          onClick={() => setSelectedProject(project)}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 font-semibold text-xs shadow-md transition-all flex items-center gap-1 hover:scale-105"
                        >
                          Details
                          <ArrowUpRight size={14} />
                        </button>
                      </div>

                      <div className="text-[10px] text-white/70 text-center font-mono">
                        Click card for breakdown
                      </div>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-white">
                    <div>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-md bg-slate-100 text-slate-600 border border-slate-200/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Title */}
                      <h3 className="font-display font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                        {title}
                      </h3>

                      {/* Short insight / problem description */}
                      {(insight || problem) && (
                        <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                          {insight || problem}
                        </p>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span className="font-mono text-[10px] text-slate-400">
                        {new Date(project.created_at || Date.now()).getFullYear()}
                      </span>
                      <span className="text-blue-600 font-semibold text-[11px] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                        Explore <ArrowUpRight size={12} />
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
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        )}

      </div>

      {/* ── Quick View Details Modal ── */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col z-10"
            >
              {/* Modal Header */}
              <div className="relative aspect-video w-full bg-slate-100 border-b border-slate-200">
                <ProjectChartPreview
                  type={selectedProject.chartType || 0}
                  title={selectedProject.title}
                  imageUrl={selectedProject.image_url || selectedProject.imageUrl}
                />
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-slate-700 hover:bg-slate-900 hover:text-white transition-colors shadow-md cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-5">
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {selectedProject.tags?.map((t) => (
                      <span key={t} className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-display font-bold text-2xl text-slate-900">
                    {selectedProject.title}
                  </h3>
                </div>

                {/* Flow Details */}
                <div className="space-y-3.5 text-sm">
                  {selectedProject.problem && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-bold text-xs uppercase tracking-wider text-rose-600 block mb-1">
                        Problem Statement
                      </span>
                      <p className="text-slate-700 leading-relaxed">{selectedProject.problem}</p>
                    </div>
                  )}

                  {selectedProject.data && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-bold text-xs uppercase tracking-wider text-sky-600 block mb-1">
                        Dataset & Sources
                      </span>
                      <p className="text-slate-700 leading-relaxed">{selectedProject.data}</p>
                    </div>
                  )}

                  {selectedProject.process && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-bold text-xs uppercase tracking-wider text-amber-600 block mb-1">
                        Process & Modeling
                      </span>
                      <p className="text-slate-700 leading-relaxed">{selectedProject.process}</p>
                    </div>
                  )}

                  {selectedProject.insight && (
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                      <span className="font-bold text-xs uppercase tracking-wider text-emerald-700 block mb-1">
                        Key Insight & Impact
                      </span>
                      <p className="text-emerald-900 font-medium leading-relaxed">{selectedProject.insight}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    {selectedProject.githubLink && (
                      <a
                        href={selectedProject.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                      >
                        <GithubIcon size={16} /> GitHub Source
                      </a>
                    )}
                    {(selectedProject.demoLink || selectedProject.liveLink) && (
                      <a
                        href={selectedProject.demoLink || selectedProject.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-500 shadow-sm transition-colors"
                      >
                        <ExternalLink size={16} /> Live Dashboard
                      </a>
                    )}
                  </div>

                  {selectedProject._id && (
                    <Link
                      to={`/project/${selectedProject._id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      Full Case Study Page <ArrowUpRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
