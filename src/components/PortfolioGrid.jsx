import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  ArrowUpRight,
  ArrowDown,
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
  ChevronDown,
  Code2,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ProjectChartPreview from './ProjectChartPreview';
import DoodleGuide from './DoodleGuide';

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

// Helper to determine analytical question
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
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const projectRefs = useRef([]);

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

  const scrollToNextProject = (currentIndex) => {
    const nextIdx = currentIndex + 1;
    if (nextIdx < filteredProjects.length && projectRefs.current[nextIdx]) {
      projectRefs.current[nextIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (projectRefs.current[0]) {
      projectRefs.current[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section id="projects" className="py-16 sm:py-24 bg-[#FAFAFC] text-slate-900 border-b border-slate-200/80 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Section Header ── */}
        <div className="mb-10 sm:mb-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700 text-xs font-mono font-bold uppercase tracking-wider mb-3">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                Analytical Case Studies & Projects
              </div>
              <h2 className="font-display font-black text-3xl sm:text-5xl text-slate-900 tracking-tight">
                Project Index
              </h2>
            </div>

            <div className="flex flex-col md:items-end gap-2">
              <p className="text-xs sm:text-sm text-slate-600 font-mono">
                Showing <strong className="text-slate-900">{filteredProjects.length}</strong> data projects with interactive reports
              </p>
              
              {/* Guided Arrow Scroll Indicator */}
              <button
                onClick={() => scrollToNextProject(-1)}
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer group"
              >
                <span>Explore Case Studies</span>
                <span className="p-1 rounded-full bg-blue-100 text-blue-600 group-hover:translate-y-0.5 transition-transform">
                  <ArrowDown size={13} className="animate-bounce" />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Category Filter Tabs ── */}
        <div className="flex justify-start mb-10 overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none whitespace-nowrap flex items-center justify-center ${
                    isActive
                      ? 'text-blue-700 bg-blue-50/80 font-bold shadow-2xs border border-blue-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Vertical Scrolling Feed with Guided Connectors ── */}
        <div className="space-y-8 sm:space-y-12 relative">
          
          {filteredProjects.map((project, index) => {
            const {
              _id,
              id = _id,
              title,
              tags = [],
              githubLink = 'https://github.com/arun-pandian-p',
              demoLink,
              liveLink = demoLink,
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
            const isLast = index === filteredProjects.length - 1;

            return (
              <article
                key={id || title}
                ref={(el) => (projectRefs.current[index] = el)}
                className="group relative bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  
                  {/* Left Column: Rich Interactive Visual / Preview */}
                  <div className="lg:col-span-5 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-100 relative min-h-[260px] sm:min-h-[320px] flex items-center justify-center overflow-hidden">
                    <Link to={`/project/${id || 1}`} className="w-full h-full block relative">
                      <ProjectChartPreview
                        type={chartType}
                        title={title}
                        imageUrl={imageUrl}
                      />
                      
                      {/* Floating Badges */}
                      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                        <span className="font-mono text-xs font-black text-slate-900 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg shadow-sm border border-slate-200 tracking-wider">
                          #{projectNumber}
                        </span>
                        <span className="text-xs font-mono font-bold uppercase tracking-wider bg-blue-600 text-white px-2.5 py-1 rounded-lg shadow-sm">
                          {displayCategory}
                        </span>
                      </div>
                    </Link>
                  </div>

                  {/* Right Column: High-Density Analytical Narrative */}
                  <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      
                      {/* Project Title */}
                      <div>
                        <Link to={`/project/${id || 1}`}>
                          <h3 className="font-display font-black text-slate-900 text-xl sm:text-2xl lg:text-3xl leading-tight group-hover:text-blue-600 transition-colors">
                            {title}
                          </h3>
                        </Link>
                      </div>

                      {/* Analytical Question */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                        <Lightbulb size={17} className="text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                            Analytical Question
                          </span>
                          <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5 leading-relaxed">
                            "{question}"
                          </p>
                        </div>
                      </div>

                      {/* Business Impact / Outcome Callout */}
                      {(result || insight) && (
                        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100/90 flex items-start gap-3">
                          <Sparkles size={17} className="text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 block">
                              Measurable Business Impact
                            </span>
                            <p className="text-xs sm:text-sm text-emerald-950 font-medium mt-0.5 leading-relaxed">
                              {result || insight}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Tech Stack Pills */}
                      {tags && tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons & Next Guide */}
                    <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/project/${id || 1}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs transition-colors shadow-xs"
                        >
                          <span>Explore Deep Case Study</span>
                          <ArrowRight size={14} />
                        </Link>

                        <a
                          href={githubLink.replace('shadow-byte-warrior', 'arun-pandian-p')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
                        >
                          <GithubIcon size={14} />
                          <span>Code</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => setSelectedProject(project)}
                          className="inline-flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <span>Quick View</span>
                        </button>
                      </div>

                      {/* Guide Arrow to Next Project */}
                      {!isLast && (
                        <button
                          onClick={() => scrollToNextProject(index)}
                          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Scroll down to next case study"
                        >
                          <span>Next Case Study #{String(index + 2).padStart(2, '0')}</span>
                          <ArrowDown size={13} className="group-hover:translate-y-0.5 transition-transform" />
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              </article>
            );
          })}

        </div>

        {/* ── Bottom Section Guided Action Indicator ── */}
        <div className="mt-14 text-center">
          <a
            href="#about"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-mono font-bold text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-all group"
          >
            <span>✦ All {filteredProjects.length} Analytical Case Studies Explored — Continue to About & Skills</span>
            <ArrowDown size={14} className="group-hover:translate-y-1 transition-transform text-blue-600" />
          </a>
        </div>

      </div>

      {/* ── Interactive Quick View Modal (FlowingData Reader) ── */}
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
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-10 text-slate-900"
            >
              {/* Sticky Top Header */}
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

              {/* Scrollable Modal Content */}
              <div className="overflow-y-auto overflow-x-hidden p-5 sm:p-7 space-y-6">
                
                {/* Visual Header */}
                <div className="relative aspect-[16/9] w-full rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden">
                  <ProjectChartPreview
                    type={selectedProject.chartType || 0}
                    title={selectedProject.title}
                    imageUrl={selectedProject.image_url || selectedProject.imageUrl}
                  />
                </div>

                {/* Title & Quick Recruiter Takeaway */}
                <div>
                  <h3 className="font-display font-black text-xl sm:text-2xl text-slate-900 tracking-tight leading-tight">
                    {selectedProject.title}
                  </h3>
                  
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

                {/* Structured Flow */}
                <div className="space-y-4 text-xs sm:text-sm">
                  {selectedProject.problem && (
                    <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
                      <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                        <Target size={15} />
                        <span>Problem Statement</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed">
                        {selectedProject.problem}
                      </p>
                    </div>
                  )}

                  {selectedProject.data && (
                    <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100">
                      <div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                        <Database size={15} />
                        <span>Dataset & Data Sources</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed">
                        {selectedProject.data}
                      </p>
                    </div>
                  )}

                  {selectedProject.process && (
                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                      <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                        <Brain size={15} />
                        <span>Methodology & Workflow</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                        {selectedProject.process}
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom Bar */}
              <div className="sticky bottom-0 z-20 p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
                <Link
                  to={`/project/${selectedProject._id || selectedProject.id || 1}`}
                  onClick={() => setSelectedProject(null)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-colors shadow-xs"
                >
                  <span>Open Full Article & Dashboard</span>
                  <ArrowUpRight size={14} />
                </Link>

                <a
                  href={(selectedProject.githubLink || 'https://github.com/arun-pandian-p').replace('shadow-byte-warrior', 'arun-pandian-p')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
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
