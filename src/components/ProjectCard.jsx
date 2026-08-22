import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ExternalLink, FileText, ArrowUpRight } from 'lucide-react';
import { useContent } from '../context/ContentProvider';

const GithubIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const flow = [
  { key: 'problem', label: 'Problem', dot: 'bg-rose-400' },
  { key: 'data', label: 'Data', dot: 'bg-sky-400' },
  { key: 'process', label: 'Process', dot: 'bg-amber-400' },
  { key: 'insight', label: 'Insight', dot: 'bg-emerald-500' },
];

const ProjectCard = ({ project, index = 0 }) => {
  const { title, tags, githubLink, caseStudyLink, demoLink, insight } = project;
  const { settings } = useContent();
  const animationStyle = settings?.theme?.layout?.animationStyle || 'default';
  const cardStyle = settings?.theme?.layout?.cardStyle || 'default';

  // ─── 3D Tilt Logic (default card) ───
  const ref = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotX = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 200, damping: 20 });
  const rotY = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 200, damping: 20 });

  const onMove = (e) => {
    if (cardStyle !== 'default') return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => { mx.set(0.5); my.set(0.5); };

  // ─── Render Variations ───

  // ── Glass Card ──
  if (cardStyle === 'glass') {
    return (
      <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-[transform,filter,opacity] duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        {project.image_url && (
          <div className="w-full h-52 overflow-hidden">
            <img loading="lazy" src={project.image_url} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          </div>
        )}
        <div className="p-6 flex flex-col flex-1 relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 font-mono text-white/60 border border-white/10">{new Date(project.created_at || Date.now()).getFullYear()}</span>
            <div className="flex gap-2 text-white/50">
              {githubLink && <a href={githubLink} target="_blank" rel="noopener noreferrer" className="hover:text-white"><GithubIcon size={15} /></a>}
              {demoLink && <a href={demoLink} target="_blank" rel="noopener noreferrer" className="hover:text-white"><ExternalLink size={15} /></a>}
            </div>
          </div>
          <Link to={`/project/${project.id}`}><h3 className={`hover:text-accent transition-colors font-display font-bold text-xl text-white leading-snug mb-3`}>{title}</h3></Link>
          {insight && <p className="text-sm text-white/60 leading-relaxed flex-1">{insight}</p>}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tags?.map((tag) => <span key={tag} className="px-2 py-0.5 text-[10px] rounded-full border border-white/15 text-white/50 bg-white/5">{tag}</span>)}
          </div>
        </div>
      </article>
    );
  }

  // ── Gradient Card ──
  if (cardStyle === 'gradient') {
    const gradients = [
      'from-violet-600 via-purple-600 to-blue-600',
      'from-rose-500 via-pink-600 to-orange-500',
      'from-emerald-500 via-teal-600 to-cyan-600',
      'from-amber-500 via-orange-600 to-red-600',
    ];
    const grad = gradients[index % gradients.length];
    return (
      <article className={`group relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br ${grad} shadow-2xl hover:-translate-y-2 transition-[transform,filter,opacity] duration-500`}>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
        {project.image_url && (
          <div className="w-full h-48 overflow-hidden opacity-40 mix-blend-overlay">
            <img loading="lazy" src={project.image_url} alt={title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-7 flex flex-col flex-1 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono text-white/70 border border-white/20 px-2.5 py-1 rounded-full">{new Date(project.created_at || Date.now()).getFullYear()}</span>
            <div className="flex gap-2 text-white/70">
              {githubLink && <a href={githubLink} target="_blank" rel="noopener noreferrer" className="hover:text-white"><GithubIcon size={16} /></a>}
              {demoLink && <a href={demoLink} target="_blank" rel="noopener noreferrer" className="hover:text-white"><ExternalLink size={16} /></a>}
            </div>
          </div>
          <Link to={`/project/${project.id}`}><h3 className={`hover:text-accent transition-colors font-display font-black text-2xl text-white leading-tight mb-4`}>{title}</h3></Link>
          {insight && <p className="text-sm text-white/80 leading-relaxed flex-1">{insight}</p>}
          <div className="mt-5 flex flex-wrap gap-1.5">
            {tags?.map((tag) => <span key={tag} className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-white/20 text-white">{tag}</span>)}
          </div>
        </div>
      </article>
    );
  }

  // ── Magazine Card ──
  if (cardStyle === 'magazine') {
    const isFeature = index === 0;
    return (
      <article className={`group relative overflow-hidden bg-surface border border-line hover:border-ink/30 transition-[transform,filter,opacity] duration-500 ${
        isFeature ? 'md:col-span-2 flex flex-row' : 'flex flex-col'
      }`}>
        {project.image_url && (
          <div className={`overflow-hidden bg-muted flex-shrink-0 ${
            isFeature ? 'w-1/2 min-h-[320px]' : 'w-full h-56'
          }`}>
            <img loading="lazy" src={project.image_url} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
        )}
        <div className="p-7 flex flex-col justify-between flex-1">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[9px] uppercase tracking-[0.3em] text-accent font-bold">{tags?.[0] || 'Project'}</span>
              <span className="h-px flex-1 bg-line" />
              <span className="text-[10px] font-mono text-ink-soft">{new Date(project.created_at || Date.now()).getFullYear()}</span>
            </div>
            <h3 className={`font-display font-bold text-ink leading-tight mb-4 ${
              isFeature ? 'text-3xl sm:text-5xl' : 'text-xl sm:text-2xl'
            }`}>{title}</h3>
            {insight && <p className="text-sm text-ink-soft leading-relaxed">{insight}</p>}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-2">{tags?.slice(1).map((tag) => <span key={tag} className="text-[10px] text-ink-soft">{tag}</span>)}</div>
            <div className="flex gap-3 text-ink-soft">
              {githubLink && <a href={githubLink} target="_blank" rel="noopener noreferrer" className="hover:text-ink"><GithubIcon size={16} /></a>}
              {demoLink && <a href={demoLink} target="_blank" rel="noopener noreferrer" className="hover:text-ink"><ExternalLink size={16} /></a>}
            </div>
          </div>
        </div>
      </article>
    );
  }

  // ── Bento Card ──
  if (cardStyle === 'bento') {
    // Alternating tall/wide bento tiles
    const isTall = index % 3 === 0;
    return (
      <article className={`group relative overflow-hidden rounded-2xl bg-surface border border-line hover:border-accent/40 hover:shadow-[0_0_30px_rgba(0,0,0,0.12)] transition-[transform,filter,opacity] duration-400 ${
        isTall ? 'row-span-2 flex flex-col' : 'flex flex-col'
      }`}>
        {project.image_url && (
          <div className={`w-full overflow-hidden bg-muted flex-shrink-0 ${isTall ? 'h-80' : 'h-44'}`}>
            <img loading="lazy" src={project.image_url} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
        )}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
            <span className="text-[10px] font-mono text-ink-soft">{tags?.[0]}</span>
          </div>
          <Link to={`/project/${project.id}`}><h3 className={`hover:text-accent transition-colors font-display font-bold text-ink text-lg leading-snug mb-2`}>{title}</h3></Link>
          {insight && <p className="text-xs text-ink-soft leading-relaxed flex-1 line-clamp-3">{insight}</p>}
          <div className="mt-4 flex gap-2">
            {githubLink && <a href={githubLink} target="_blank" rel="noopener noreferrer" className="text-ink-soft hover:text-ink"><GithubIcon size={14} /></a>}
            {demoLink && <a href={demoLink} target="_blank" rel="noopener noreferrer" className="text-ink-soft hover:text-ink"><ExternalLink size={14} /></a>}
          </div>
        </div>
      </article>
    );
  }

  // ── Masonry Card ──
  if (cardStyle === 'masonry') {
    return (
      <article className="group relative overflow-hidden rounded-xl border border-line bg-surface break-inside-avoid mb-6 hover:shadow-xl transition-[transform,filter,opacity] duration-500">
        {project.image_url && (
          <div className="w-full overflow-hidden bg-muted">
            <img loading="lazy" src={project.image_url} alt={title} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" style={{ aspectRatio: index % 2 === 0 ? '4/3' : '3/4' }} />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            {tags?.slice(0,2).map((tag) => <span key={tag} className="px-2 py-0.5 text-[10px] rounded-full bg-accent/10 text-accent font-medium">{tag}</span>)}
          </div>
          <Link to={`/project/${project.id}`}><h3 className={`hover:text-accent transition-colors font-display font-bold text-ink text-lg leading-snug mb-2`}>{title}</h3></Link>
          {insight && <p className="text-sm text-ink-soft leading-relaxed">{insight}</p>}
          <div className="mt-4 flex gap-3 text-ink-soft">
            {githubLink && <a href={githubLink} target="_blank" rel="noopener noreferrer" className="hover:text-ink"><GithubIcon size={15} /></a>}
            {demoLink && <a href={demoLink} target="_blank" rel="noopener noreferrer" className="hover:text-ink"><ExternalLink size={15} /></a>}
          </div>
        </div>
      </article>
    );
  }

  // ── Flip Card ──
  if (cardStyle === 'flip') {
    return (
      <div className="group perspective-1000" style={{ perspective: '1000px', height: '360px' }}>
        <div
          className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <div className="absolute inset-0 rounded-2xl border border-line bg-surface overflow-hidden [backface-visibility:hidden]">
            {project.image_url && (
              <img loading="lazy" src={project.image_url} alt={title} className="w-full h-1/2 object-cover" />
            )}
            <div className="p-6">
              <div className="flex flex-wrap gap-1.5 mb-3">{tags?.map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent">{t}</span>)}</div>
              <Link to={`/project/${project.id}`}><h3 className={`hover:text-accent transition-colors font-display font-bold text-xl text-ink leading-tight`}>{title}</h3></Link>
              <p className="text-xs text-ink-soft mt-3 font-mono uppercase tracking-wider">Hover to see details →</p>
            </div>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl bg-ink text-bg p-6 flex flex-col justify-between [backface-visibility:hidden]"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div>
              <Link to={`/project/${project.id}`}><h3 className={`hover:text-accent transition-colors font-display font-bold text-2xl mb-4 text-bg`}>{title}</h3></Link>
              {flow.map((f) => {
                if (!project[f.key]) return null;
                return <div key={f.key} className="mb-3"><p className="text-[10px] font-mono text-bg/50 uppercase tracking-wider mb-0.5">{f.label}</p><p className="text-sm text-bg/90">{project[f.key]}</p></div>;
              })}
            </div>
            <div className="flex gap-3 text-bg/60">
              {githubLink && <a href={githubLink} target="_blank" rel="noopener noreferrer" className="hover:text-bg"><GithubIcon size={16} /></a>}
              {project.id && <Link to={`/project/${project.id}`} target="_blank" rel="noopener noreferrer" className="hover:text-bg"><FileText size={16} /></Link>}
              {demoLink && <a href={demoLink} target="_blank" rel="noopener noreferrer" className="hover:text-bg"><ExternalLink size={16} /></a>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Magnetic / Tilt Card ──
  if (cardStyle === 'magnetic') {
    return (
      <motion.article
        whileHover={{ scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        {project.image_url && (
          <div className="w-full h-52 overflow-hidden">
            <img loading="lazy" src={project.image_url} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          </div>
        )}
        <div className="p-6 flex flex-col flex-1 relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex flex-wrap gap-1.5">{tags?.map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border border-accent/20 text-accent bg-accent/5">{t}</span>)}</div>
            <motion.div whileHover={{ rotate: 45 }} className="text-ink-soft group-hover:text-accent transition-colors">
              <ArrowUpRight size={18} />
            </motion.div>
          </div>
          <Link to={`/project/${project.id}`}><h3 className={`hover:text-accent transition-colors font-display font-bold text-xl text-ink leading-snug mb-3 flex-1`}>{title}</h3></Link>
          {insight && <p className="text-sm text-ink-soft leading-relaxed line-clamp-2">{insight}</p>}
          <div className="mt-4 pt-4 border-t border-line flex gap-3 text-ink-soft">
            {githubLink && <a href={githubLink} target="_blank" rel="noopener noreferrer" className="hover:text-ink"><GithubIcon size={15} /></a>}
            {demoLink && <a href={demoLink} target="_blank" rel="noopener noreferrer" className="hover:text-ink"><ExternalLink size={15} /></a>}
          </div>
        </div>
      </motion.article>
    );
  }

  if (cardStyle === 'minimal') {
    return (
      <article className="group relative flex flex-col border border-ink bg-bg transition-[transform,filter,opacity] duration-300 hover:shadow-[8px_8px_0px_var(--color-ink)] hover:-translate-y-1 hover:-translate-x-1">
        {project.image_url && (
          <div className="w-full h-56 border-b border-ink overflow-hidden bg-muted">
            <img loading="lazy" src={project.image_url} alt={title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-[transform,filter,opacity] duration-500" />
          </div>
        )}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="text-[10px] uppercase tracking-widest font-bold text-ink">
              {new Date(project.created_at || Date.now()).getFullYear()}
            </span>
            <div className="flex items-center gap-3 text-ink">
              {githubLink && <a href={githubLink} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-accent transition-colors"><GithubIcon /></a>}
              {project.id && <Link to={`/project/${project.id}`} target="_blank" rel="noopener noreferrer" aria-label="Case study" className="hover:text-accent transition-colors"><FileText size={18} /></Link>}
              {demoLink && <a href={demoLink} target="_blank" rel="noopener noreferrer" aria-label="Live demo" className="hover:text-accent transition-colors"><ExternalLink size={18} /></a>}
            </div>
          </div>
          <h3 className="font-display font-black uppercase text-2xl text-ink leading-none mb-6">
            {title}
          </h3>
          <div className="space-y-4 flex-1">
            {flow.map((f) => {
              if (!project[f.key]) return null;
              return (
                <div key={f.key} className="text-sm border-t border-ink/20 pt-2">
                  <span className="font-bold text-ink mr-2">[{f.label}]</span>
                  <span className="text-ink-soft">{project[f.key]}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-ink flex flex-wrap gap-2">
            {tags && tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-ink text-ink bg-surface">{tag}</span>
            ))}
          </div>
        </div>
      </article>
    );
  }

  if (cardStyle === 'karolbinkowski') {
    return (
      <article className="group relative flex flex-col border-[3px] border-ink bg-surface transition-[transform,filter,opacity] duration-300 hover:shadow-[12px_12px_0px_var(--color-accent)] hover:-translate-y-2 hover:-translate-x-2">
        {project.image_url && (
          <div className="w-full h-56 border-b-[3px] border-ink overflow-hidden bg-muted relative">
            <img loading="lazy" src={project.image_url} alt={title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-[transform,filter,opacity] duration-300" />
            <div className="absolute inset-0 bg-accent mix-blend-color opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}
        <div className="p-6 sm:p-8 flex flex-col flex-1">
          <div className="flex items-center justify-between gap-4 mb-6">
            <span className="text-[11px] bg-ink text-bg px-3 py-1 font-bold tracking-widest uppercase border border-transparent group-hover:border-accent">
              {new Date(project.created_at || Date.now()).getFullYear()}
            </span>
            <div className="flex items-center gap-3 text-ink">
              {githubLink && <a href={githubLink} target="_blank" rel="noopener noreferrer" className="hover:text-accent"><GithubIcon /></a>}
              {project.id && <Link to={`/project/${project.id}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent"><FileText size={18} /></Link>}
              {demoLink && <a href={demoLink} target="_blank" rel="noopener noreferrer" className="hover:text-accent"><ExternalLink size={18} /></a>}
            </div>
          </div>
          <h3 className="font-display font-black uppercase text-3xl sm:text-4xl text-ink leading-none mb-6">
            {title}
          </h3>
          <div className="space-y-4 flex-1">
            {flow.map((f) => {
              if (!project[f.key]) return null;
              return (
                <div key={f.key} className="text-sm">
                  <span className="font-black text-ink uppercase mr-2">{f.label}</span>
                  <span className="text-ink-soft font-medium">{project[f.key]}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-8 pt-4 border-t-[3px] border-ink flex flex-wrap gap-2">
            {tags && tags.map((tag) => (
              <span key={tag} className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-line text-ink">{tag}</span>
            ))}
          </div>
        </div>
      </article>
    );
  }

  if (cardStyle === 'pelizzari') {
    return (
      <article className="group relative flex flex-col transition-[transform,filter,opacity] duration-700">
        <div className="w-full aspect-[3/4] overflow-hidden bg-muted mb-6">
          {project.image_url && (
            <img loading="lazy" src={project.image_url} alt={title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-[transform,filter,opacity] duration-1000 group-hover:scale-105" />
          )}
        </div>
        <div className="flex flex-col flex-1 px-2">
          <h3 className="font-serif italic text-3xl sm:text-4xl text-ink leading-tight mb-2">
            {title}
          </h3>
          <span className="text-xs font-mono uppercase tracking-widest text-ink-soft mb-6 block">
            {new Date(project.created_at || Date.now()).getFullYear()}
          </span>
          <div className="space-y-4 flex-1">
            {flow.map((f) => {
              if (!project[f.key]) return null;
              return (
                <p key={f.key} className="text-sm leading-relaxed text-ink/80 font-serif">
                  {project[f.key]}
                </p>
              );
            })}
          </div>
          <div className="flex items-center justify-between border-t border-line/50 pt-6 mt-8">
            <div className="flex flex-wrap gap-x-3 gap-y-2">
              {tags && tags.map((tag) => (
                <span key={tag} className="text-[10px] font-medium text-ink-soft uppercase tracking-widest">{tag}</span>
              ))}
            </div>
            <div className="flex items-center gap-4 text-ink-soft shrink-0">
              {githubLink && <a href={githubLink} target="_blank" rel="noopener noreferrer" className="hover:text-ink"><GithubIcon /></a>}
              {project.id && <Link to={`/project/${project.id}`} target="_blank" rel="noopener noreferrer" className="hover:text-ink"><FileText size={18} /></Link>}
              {demoLink && <a href={demoLink} target="_blank" rel="noopener noreferrer" className="hover:text-ink"><ExternalLink size={18} /></a>}
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (cardStyle === 'russellnumo') {
    return (
      <article className="group relative grid grid-cols-1 md:grid-cols-2 border border-ink bg-surface transition-colors hover:bg-line/20">
        {project.image_url && (
          <div className="w-full h-full min-h-[300px] border-b md:border-b-0 md:border-r border-ink overflow-hidden bg-muted">
            <img loading="lazy" src={project.image_url} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          </div>
        )}
        <div className="p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 mb-6">
              <span className="text-xs font-mono uppercase tracking-widest text-ink-soft border border-ink px-2 py-1">
                {new Date(project.created_at || Date.now()).getFullYear()}
              </span>
              <div className="flex items-center gap-3 text-ink">
                {githubLink && <a href={githubLink} target="_blank" rel="noopener noreferrer" className="hover:text-accent"><GithubIcon /></a>}
                {project.id && <Link to={`/project/${project.id}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent"><FileText size={18} /></Link>}
                {demoLink && <a href={demoLink} target="_blank" rel="noopener noreferrer" className="hover:text-accent"><ExternalLink size={18} /></a>}
              </div>
            </div>
            <h3 className="font-mono font-bold uppercase text-2xl text-ink leading-tight mb-8 pb-4 border-b border-ink">
              {title}
            </h3>
            <div className="space-y-4 font-mono text-sm">
              {flow.map((f) => {
                if (!project[f.key]) return null;
                return (
                  <div key={f.key} className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    <span className="font-bold text-ink uppercase lg:col-span-1">{f.label}:</span>
                    <span className="text-ink-soft lg:col-span-2">{project[f.key]}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-ink flex flex-wrap gap-2">
            {tags && tags.map((tag) => (
              <span key={tag} className="font-mono text-[10px] uppercase text-ink-soft bg-ink/5 px-2 py-1">{tag}</span>
            ))}
          </div>
        </div>
      </article>
    );
  }

  if (cardStyle === 'vividmotion') {
    return (
      <article className="group relative flex flex-col rounded-[2rem] border border-white/10 bg-surface/30 backdrop-blur-md overflow-hidden transition-[transform,filter,opacity] duration-500 hover:bg-surface/70 hover:shadow-2xl hover:border-line/50">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {project.image_url && (
          <div className="w-full h-56 overflow-hidden bg-muted p-2">
            <img loading="lazy" src={project.image_url} alt={title} className="w-full h-full object-cover rounded-[1.5rem] transition-transform duration-700 group-hover:scale-[1.02]" />
          </div>
        )}
        <div className="p-8 flex flex-col flex-1 relative z-10">
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="text-xs font-medium text-ink/60 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
              {new Date(project.created_at || Date.now()).getFullYear()}
            </span>
            <div className="flex items-center gap-3 text-ink/60">
              {githubLink && <a href={githubLink} target="_blank" rel="noopener noreferrer" className="hover:text-ink transition-colors"><GithubIcon /></a>}
              {project.id && <Link to={`/project/${project.id}`} target="_blank" rel="noopener noreferrer" className="hover:text-ink transition-colors"><FileText size={18} /></Link>}
              {demoLink && <a href={demoLink} target="_blank" rel="noopener noreferrer" className="hover:text-ink transition-colors"><ExternalLink size={18} /></a>}
            </div>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl text-ink leading-tight mb-6 font-medium tracking-tight">
            {title}
          </h3>
          <div className="space-y-4 flex-1">
            {flow.map((f) => {
              if (!project[f.key]) return null;
              return (
                <div key={f.key} className="text-sm">
                  <span className="text-ink/90 block mb-1">{project[f.key]}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-8 pt-6 border-t border-line/30 flex flex-wrap gap-2">
            {tags && tags.map((tag) => (
              <span key={tag} className="px-3 py-1 text-[11px] font-medium rounded-full bg-line/30 text-ink/80">{tag}</span>
            ))}
          </div>
        </div>
      </article>
    );
  }

  if (cardStyle === 'editorial') {
    return (
      <article className="group relative flex flex-col rounded-sm overflow-hidden">
        <div className="w-full aspect-[4/3] overflow-hidden bg-muted relative">
          {project.image_url && (
            <img loading="lazy" src={project.image_url} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          
          <div className="absolute bottom-0 left-0 p-6 sm:p-8 w-full flex items-end justify-between">
            <div>
              <span className="text-xs font-mono font-medium text-white/70 mb-2 block tracking-widest">
                {new Date(project.created_at || Date.now()).getFullYear()}
              </span>
              <h3 className="font-display font-medium text-2xl sm:text-3xl text-white leading-tight">
                {title}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="p-6 sm:p-8 flex flex-col flex-1 bg-surface border border-t-0 border-line">
          <div className="space-y-4 flex-1 mb-8">
            {flow.map((f) => {
              if (!project[f.key]) return null;
              return (
                <div key={f.key} className="flex gap-4">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-ink-soft w-20 shrink-0 pt-1">{f.label}</span>
                  <p className="text-sm leading-relaxed text-ink/80">{project[f.key]}</p>
                </div>
              );
            })}
          </div>
          
          <div className="flex items-center justify-between border-t border-line pt-6">
            <div className="flex flex-wrap gap-x-3 gap-y-2">
              {tags && tags.map((tag) => (
                <span key={tag} className="text-xs font-medium text-ink-soft">{tag}</span>
              ))}
            </div>
            <div className="flex items-center gap-4 text-ink-soft shrink-0">
              {githubLink && <a href={githubLink} target="_blank" rel="noopener noreferrer" className="hover:text-ink"><GithubIcon /></a>}
              {project.id && <Link to={`/project/${project.id}`} target="_blank" rel="noopener noreferrer" className="hover:text-ink"><FileText size={18} /></Link>}
              {demoLink && <a href={demoLink} target="_blank" rel="noopener noreferrer" className="hover:text-ink"><ExternalLink size={18} /></a>}
            </div>
          </div>
        </div>
      </article>
    );
  }

  // ─── Default 3D Tilt Card ───
  return (
    <motion.article
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 1000 }}
      className="group relative flex flex-col rounded-3xl border border-line bg-surface overflow-hidden [transform-style:preserve-3d] hover:border-ink/20 hover:shadow-[0_40px_80px_-40px_rgba(9,9,11,0.4)] transition-shadow duration-300"
    >
      {project.image_url && (
        <div className="w-full h-48 overflow-hidden bg-muted" style={{ transform: 'translateZ(10px)' }}>
          <img loading="lazy" 
            src={project.image_url} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      )}

      <div className="p-7 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-4 mb-4" style={{ transform: 'translateZ(30px)' }}>
          {/* Year or badge area (optional if created_at was provided, otherwise just a static badge or nothing) */}
          <span className="text-xs font-mono font-bold text-ink-soft bg-muted px-2.5 py-1 rounded-md">
            {new Date(project.created_at || Date.now()).getFullYear()}
          </span>
          <div className="flex items-center gap-2.5 text-ink-soft shrink-0">
            {githubLink && <a href={githubLink} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-ink transition-colors"><GithubIcon /></a>}
            {project.id && <Link to={`/project/${project.id}`} target="_blank" rel="noopener noreferrer" aria-label="Case study" className="hover:text-ink transition-colors"><FileText size={18} /></Link>}
            {demoLink && <a href={demoLink} target="_blank" rel="noopener noreferrer" aria-label="Live demo" className="hover:text-accent transition-colors"><ExternalLink size={18} /></a>}
          </div>
        </div>

        <h3 className="font-display font-bold text-xl sm:text-[1.35rem] text-ink leading-snug mb-4" style={{ transform: 'translateZ(40px)' }}>
          {animationStyle === 'depoluxe' && (
            <span className="font-mono text-accent mr-3">
              {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][index] || String(index + 1)}.
            </span>
          )}
          {title}
        </h3>

        <div className="space-y-3.5 flex-1" style={{ transform: 'translateZ(20px)' }}>
          {flow.map((f) => {
            if (!project[f.key]) return null;
            return (
              <div key={f.key}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${f.dot}`} />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-ink-soft">{f.label}</span>
                </div>
                <p className={`pl-3.5 text-sm leading-relaxed border-l border-line ${f.key === 'insight' ? 'text-ink font-medium' : 'text-ink-soft'}`}>
                  {project[f.key]}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-5 border-t border-line flex flex-wrap gap-1.5" style={{ transform: 'translateZ(20px)' }}>
          {tags && tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 text-[11px] font-medium rounded-full border border-line text-ink-soft bg-surface">{tag}</span>
          ))}
        </div>

        {(`/project/${project.id}`) && (
          <a
            href={`/project/${project.id}`} target="_blank" rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink group-hover:text-accent transition-colors"
            style={{ transform: 'translateZ(30px)' }}
          >
            Read the case study
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        )}
      </div>
    </motion.article>
  );
};

export default ProjectCard;
