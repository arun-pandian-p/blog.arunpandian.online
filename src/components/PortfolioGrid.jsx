import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  ArrowUpRight,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
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
  ChevronLeft,
  ChevronDown,
  Code2,
  BookOpen,
  LayoutGrid,
  Columns
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ProjectChartPreview from './ProjectChartPreview';
import { useThemeStore } from '../theme/store';

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
  { id: 'all', label: 'All Projects' },
  { id: 'power bi', label: 'Power BI' },
  { id: 'sql', label: 'SQL' },
  { id: 'python', label: 'Python' },
  { id: 'excel', label: 'Excel' },
  { id: 'machine learning', label: 'Machine Learning' },
];

const getAnalyticalQuestion = (project) => {
  if (project.analytical_question || project.question) {
    return project.analytical_question || project.question;
  }
  const title = (project.title || '').toLowerCase();
  if (title.includes('delivery') || title.includes('amazon')) {
    return 'Can delivery delays be predicted from traffic, weather, and distance dynamics?';
  }
  if (title.includes('job') || title.includes('salary')) {
    return 'Which skills and technologies command the highest demand and compensation?';
  }
  if (title.includes('flight') || title.includes('turnaround')) {
    return 'What operational bottlenecks are responsible for airport gate turnaround delays?';
  }
  if (title.includes('churn')) {
    return 'What customer activity patterns signal subscription cancellation 30 days ahead?';
  }
  if (title.includes('life') || title.includes('regression')) {
    return 'How do healthcare spending and economic metrics interact with mortality rates?';
  }
  if (title.includes('epidemic') || title.includes('heatmap')) {
    return 'How do spatial clustering algorithms trace epidemiological vector velocity?';
  }
  if (title.includes('email') || title.includes('automation')) {
    return 'Can local private LLM models automate inbox triage with zero cloud API cost?';
  }
  return project.subtitle || project.problem || 'How can data-driven modeling answer core business questions?';
};

export default function PortfolioGrid({ projects = [], sectionConfig = {} }) {
  const { theme } = useThemeStore();
  const themeProjectsScroll = theme?.layout?.projectsScroll;
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [layoutMode, setLayoutMode] = useState(themeProjectsScroll === 'vertical' || themeProjectsScroll === 'grid' ? 'vertical' : 'horizontal');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  // Sync with theme store changes from Theme Studio
  useEffect(() => {
    if (themeProjectsScroll) {
      setLayoutMode(themeProjectsScroll === 'vertical' || themeProjectsScroll === 'grid' ? 'vertical' : 'horizontal');
    }
  }, [themeProjectsScroll]);

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

  // Filter projects
  const filteredProjects = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    if (activeCategory === 'all') return projects;

    return projects.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      const tags = (p.tags || []).map((t) => t.toLowerCase());

      if (activeCategory === 'power bi') {
        return cat.includes('bi') || tags.some((t) => t.includes('power bi') || t.includes('bi') || t.includes('dax'));
      }
      if (activeCategory === 'sql') {
        return cat.includes('sql') || tags.some((t) => t.includes('sql') || t.includes('postgres') || t.includes('query'));
      }
      if (activeCategory === 'python') {
        return cat.includes('python') || tags.some((t) => t.includes('python') || t.includes('pandas') || t.includes('eda'));
      }
      if (activeCategory === 'excel') {
        return cat.includes('excel') || tags.some((t) => t.includes('excel') || t.includes('pivot') || t.includes('formula'));
      }
      if (activeCategory === 'machine learning') {
        return cat.includes('machine') || cat.includes('ml') || tags.some((t) => t.includes('learn') || t.includes('xgboost') || t.includes('model'));
      }
      return cat === activeCategory;
    });
  }, [projects, activeCategory]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    const index = Math.round(scrollLeft / (clientWidth * 0.85));
    setActiveSlideIndex(Math.min(index, filteredProjects.length - 1));
  };

  const scrollLeftAction = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: -360, behavior: 'smooth' });
  };

  const scrollRightAction = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: 360, behavior: 'smooth' });
  };

  const scrollToSlide = (index) => {
    if (!scrollContainerRef.current) return;
    const child = scrollContainerRef.current.children[index];
    if (child) {
      child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  return (
    <section id="projects" data-edit-id="projects.section" data-edit-name="Portfolio / Projects Section" data-edit-kind="section" className="py-12 sm:py-20 bg-[#FAFAFC] text-slate-900 border-b border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Section Header ── */}
        <div className="mb-6 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div data-edit-id="projects.badge" data-edit-name="Projects Badge" data-edit-kind="text" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                Analytical Case Studies & Projects
              </div>
              <h2 data-edit-id="projects.title" data-edit-name="Projects Title" data-edit-kind="heading" data-edit-path="sections.projects.title" className="font-display font-black text-2xl sm:text-4xl text-slate-900 tracking-tight">
                Project Index
              </h2>
            </div>

            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3">
              <p className="text-xs sm:text-sm text-slate-600 font-mono">
                Showing <strong className="text-slate-900">{filteredProjects.length}</strong> data projects with interactive reports
              </p>

              {/* View Switcher & Guided Arrow Controls */}
              <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
                {/* Horizontal Scroll Arrows */}
                <button
                  onClick={scrollLeftAction}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Scroll Left (Previous)"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={scrollRightAction}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Scroll Right (Next)"
                >
                  <ChevronRight size={16} />
                </button>

                <div className="h-4 w-px bg-slate-200 mx-0.5" />

                {/* Layout Mode Toggle */}
                <button
                  onClick={() => setLayoutMode(layoutMode === 'horizontal' ? 'vertical' : 'horizontal')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    layoutMode === 'horizontal'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title={layoutMode === 'horizontal' ? 'Switch to Vertical Grid' : 'Switch to Horizontal Slider'}
                >
                  {layoutMode === 'horizontal' ? <Columns size={13} /> : <LayoutGrid size={13} />}
                  <span className="hidden sm:inline">{layoutMode === 'horizontal' ? 'Horizontal' : 'Vertical'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Category Filter Tabs ── */}
        <div className="flex justify-start mb-6 sm:mb-8 overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-flex items-center gap-1 p-1 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`min-h-[34px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none whitespace-nowrap flex items-center justify-center ${
                    isActive
                      ? 'text-blue-700 bg-blue-50 font-bold shadow-2xs border border-blue-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── PROJECT FEED (RESPONSIVE HORIZONTAL SNAP / VERTICAL GRID) ── */}
        {layoutMode === 'horizontal' ? (
          /* Horizontal Slider Layout */
          <div className="space-y-4">
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
              style={{ scrollBehavior: 'smooth' }}
            >
              {filteredProjects.map((project, index) => {
                const {
                  _id,
                  id = _id,
                  title,
                  tags = [],
                  githubLink = 'https://github.com/arun-pandian-p',
                  chartType = index,
                  image_url,
                  imageUrl = image_url,
                  category,
                  result,
                  insight,
                } = project;

                const projectNumber = String(index + 1).padStart(2, '0');
                const displayCategory = category || tags[0] || 'Analytics';
                const question = getAnalyticalQuestion(project);

                return (
                  <article
                    key={id || title}
                    data-edit-id={`projects.card.${id || index}`}
                    data-edit-name={`Project Card · ${title}`}
                    data-edit-kind="card"
                    className="w-[min(88vw,330px)] sm:w-[380px] lg:w-[420px] shrink-0 snap-start bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* Visual Header (Clean Mobile Resize Ratio) */}
                      <Link
                        to={`/project/${id || 1}`}
                        className="block relative w-full h-44 sm:h-52 bg-slate-50 border-b border-slate-100 overflow-hidden"
                      >
                        <ProjectChartPreview
                          type={chartType}
                          title={title}
                          imageUrl={imageUrl}
                        />
                        
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                          <span className="font-mono text-[10px] font-bold text-slate-800 bg-white/95 backdrop-blur px-2 py-0.5 rounded shadow-2xs border border-slate-200">
                            #{projectNumber}
                          </span>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/80 px-2 py-0.5 rounded">
                            {displayCategory}
                          </span>
                        </div>
                      </Link>

                      {/* Content */}
                      <div className="p-4 sm:p-5 space-y-3">
                        <Link to={`/project/${id || 1}`}>
                          <h3 className="font-display font-bold text-slate-900 text-base sm:text-lg leading-snug hover:text-blue-600 transition-colors line-clamp-2">
                            {title}
                          </h3>
                        </Link>

                        {/* Analytical Question */}
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          <span className="font-semibold text-slate-800">Question: </span>
                          "{question}"
                        </p>

                        {/* Measurable Impact */}
                        {(result || insight) && (
                          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100/90 flex items-start gap-2">
                            <Sparkles size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-emerald-950 font-medium line-clamp-2">
                              {result || insight}
                            </p>
                          </div>
                        )}

                        {/* Tools Badges */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-slate-100 text-slate-700 border border-slate-200/60"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link
                        to={`/project/${id || 1}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <span>Case Study</span>
                        <ArrowUpRight size={13} />
                      </Link>

                      <div className="flex items-center gap-2">
                        <a
                          href={githubLink.replace('shadow-byte-warrior', 'arun-pandian-p')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                          title="GitHub Code"
                        >
                          <GithubIcon size={14} />
                        </a>
                        <button
                          onClick={() => setSelectedProject(project)}
                          className="text-[11px] font-mono text-slate-400 hover:text-slate-700"
                        >
                          Quick View
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Slide Pagination Indicator Dots */}
            <div className="flex items-center justify-center gap-1.5 pt-2">
              {filteredProjects.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToSlide(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeSlideIndex === idx
                      ? 'w-6 bg-blue-600'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Default Vertical Grid Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => {
              const {
                _id,
                id = _id,
                title,
                tags = [],
                githubLink = 'https://github.com/arun-pandian-p',
                chartType = index,
                image_url,
                imageUrl = image_url,
                category,
                result,
                insight,
              } = project;

              const projectNumber = String(index + 1).padStart(2, '0');
              const displayCategory = category || tags[0] || 'Analytics';
              const question = getAnalyticalQuestion(project);

              return (
                <article
                  key={id || title}
                  data-edit-id={`projects.vertical_card.${id || index}`}
                  data-edit-name={`Project Card · ${title}`}
                  data-edit-kind="card"
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {/* Visual Header */}
                    <Link
                      to={`/project/${id || 1}`}
                      className="block relative w-full h-44 sm:h-48 bg-slate-50 border-b border-slate-100 overflow-hidden"
                    >
                      <ProjectChartPreview
                        type={chartType}
                        title={title}
                        imageUrl={imageUrl}
                      />
                      
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                        <span className="font-mono text-[10px] font-bold text-slate-800 bg-white/95 backdrop-blur px-2 py-0.5 rounded shadow-2xs border border-slate-200">
                          #{projectNumber}
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/80 px-2 py-0.5 rounded">
                          {displayCategory}
                        </span>
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-4 sm:p-5 space-y-3">
                      <Link to={`/project/${id || 1}`}>
                        <h3 className="font-display font-bold text-slate-900 text-base sm:text-lg leading-snug hover:text-blue-600 transition-colors line-clamp-2">
                          {title}
                        </h3>
                      </Link>

                      {/* Analytical Question */}
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        <span className="font-semibold text-slate-800">Question: </span>
                        "{question}"
                      </p>

                      {/* Impact */}
                      {(result || insight) && (
                        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100/90 flex items-start gap-2">
                          <Sparkles size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-emerald-950 font-medium line-clamp-2">
                            {result || insight}
                          </p>
                        </div>
                      )}

                      {/* Tools Badges */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-slate-100 text-slate-700 border border-slate-200/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/project/${id || 1}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <span>Read Case Study</span>
                      <ArrowUpRight size={13} />
                    </Link>

                    <div className="flex items-center gap-2">
                      <a
                        href={githubLink.replace('shadow-byte-warrior', 'arun-pandian-p')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                        title="GitHub Code"
                      >
                        <GithubIcon size={14} />
                      </a>
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="text-[11px] font-mono text-slate-400 hover:text-slate-700"
                      >
                        Quick View
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>

      {/* ── Interactive Quick View Modal ── */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-10 text-slate-900"
            >
              {/* Top Header */}
              <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">
                    Quick Case Study Preview
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {selectedProject.category || selectedProject.tags?.[0] || 'Analytics'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="min-w-[36px] min-h-[36px] p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                  aria-label="Close Case Study Modal"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
                <div className="relative aspect-[16/9] w-full rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden">
                  <ProjectChartPreview
                    type={selectedProject.chartType || 0}
                    title={selectedProject.title}
                    imageUrl={selectedProject.image_url || selectedProject.imageUrl}
                  />
                </div>

                <div>
                  <h3 className="font-display font-black text-xl sm:text-2xl text-slate-900 tracking-tight leading-tight">
                    {selectedProject.title}
                  </h3>
                  
                  {(selectedProject.result || selectedProject.insight) && (
                    <div className="mt-3 p-3 rounded-xl bg-blue-50/80 border border-blue-100 flex items-start gap-2.5">
                      <Sparkles size={16} className="text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 block">
                          Executive Takeaway
                        </span>
                        <p className="text-xs text-blue-950 font-medium leading-relaxed mt-0.5">
                          {selectedProject.result || selectedProject.insight}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  {selectedProject.problem && (
                    <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100">
                      <span className="text-rose-700 font-bold uppercase tracking-wider block mb-1">Problem Statement</span>
                      <p className="text-slate-800 leading-relaxed">{selectedProject.problem}</p>
                    </div>
                  )}
                  {selectedProject.process && (
                    <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100">
                      <span className="text-amber-700 font-bold uppercase tracking-wider block mb-1">Methodology</span>
                      <p className="text-slate-800 leading-relaxed whitespace-pre-line">{selectedProject.process}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 z-20 p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
                <Link
                  to={`/project/${selectedProject._id || selectedProject.id || 1}`}
                  onClick={() => setSelectedProject(null)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-colors shadow-2xs"
                >
                  <span>Open Full Article</span>
                  <ArrowUpRight size={13} />
                </Link>

                <a
                  href={(selectedProject.githubLink || 'https://github.com/arun-pandian-p').replace('shadow-byte-warrior', 'arun-pandian-p')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  <GithubIcon size={14} />
                  <span>GitHub</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
