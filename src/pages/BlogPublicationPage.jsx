import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Search,
  ArrowRight,
  ExternalLink,
  Play,
  FileText,
  BarChart3,
  Database,
  Filter,
  CheckCircle2,
  Calendar,
  Clock,
  ChevronRight,
  Sparkles,
  Layers,
  Code2,
  TrendingUp,
  Award,
  Tag,
  BookOpen,
  PieChart,
  LineChart,
  MapPin,
  Cpu,
  GraduationCap,
  ShieldCheck,
  ScatterChart,
  Network,
  Activity,
  Compass,
  Grid,
  SlidersHorizontal,
  LayoutGrid,
  Columns,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import StyleOverrides from '../editor/StyleOverrides';
import { useContent } from '../context/ContentProvider';
import { useThemeStore } from '../theme/store';
import { supabase } from '../lib/supabaseClient';
import { FaLinkedin, FaGithub } from 'react-icons/fa6';

const VERIFIED_FALLBACK_IMAGES = [
  'https://secxgzharggytkevlvmx.supabase.co/storage/v1/object/public/assets/blogs/4bzfqm82kmd_1784187994669.png',
  'https://secxgzharggytkevlvmx.supabase.co/storage/v1/object/public/assets/blogs/t8bk7q5eg7g_1784188043415.png',
  'https://secxgzharggytkevlvmx.supabase.co/storage/v1/object/public/assets/blogs/bl6o93ym18c_1784188015054.png',
];

export default function BlogPublicationPage() {
  const navigate = useNavigate();
  const { settings, projects: contextProjects = [], blogs: contextBlogs = [] } = useContent();
  const { theme } = useThemeStore();
  
  // Layout presets & arrangement: 'grid' | 'horizontal' | 'bento'
  const defaultLayout = theme?.layout?.blogScroll || settings?.sections?.blog?.layout || 'grid';
  const [layoutMode, setLayoutMode] = useState(defaultLayout);

  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedCertification, setSelectedCertification] = useState(null);
  
  // Real-time live data states
  const [liveDbProjects, setLiveDbProjects] = useState([]);
  const [liveDbBlogs, setLiveDbBlogs] = useState([]);
  const [liveDbCertifications, setLiveDbCertifications] = useState([]);

  // Sync with theme store changes
  useEffect(() => {
    if (theme?.layout?.blogScroll) {
      setLayoutMode(theme.layout.blogScroll);
    }
  }, [theme?.layout?.blogScroll]);

  // Fetch directly from Supabase on mount to guarantee fresh live data from admin panel
  useEffect(() => {
    let isMounted = true;
    const fetchLiveDb = async () => {
      if (!supabase) return;
      try {
        const [projRes, blogRes, settingsRes] = await Promise.all([
          supabase.from('projects').select('*').order('sort_order', { ascending: true }),
          supabase.from('blogs').select('*').order('sort_order', { ascending: true }),
          supabase.from('site_settings').select('*'),
        ]);

        if (isMounted) {
          if (projRes.data && projRes.data.length > 0) {
            setLiveDbProjects(projRes.data);
          }
          if (blogRes.data && blogRes.data.length > 0) {
            setLiveDbBlogs(blogRes.data);
          }
          if (settingsRes.data && settingsRes.data.length > 0) {
            const certRow = settingsRes.data.find((r) => r.key === 'certifications');
            if (certRow?.value?.certifications) {
              setLiveDbCertifications(certRow.value.certifications);
            }
          }
        }
      } catch (err) {
        console.warn('Error fetching live data for publication page:', err);
      }
    };

    fetchLiveDb();
    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Unified Projects
  const allProjects = useMemo(() => {
    const rawList = liveDbProjects.length > 0 ? liveDbProjects : contextProjects;
    return rawList.map((p, idx) => ({
      id: p.id || p._id || String(idx + 1),
      title: p.title || 'Data Analytics Project',
      subtitle: p.subtitle || p.problem || (Array.isArray(p.tags) ? p.tags.slice(0, 3).join(' · ') : 'SQL · Python · Power BI'),
      tool: Array.isArray(p.tags) ? p.tags.slice(0, 4).join(' · ') : (p.tool || 'Power BI · SQL'),
      category: p.category || (p.tags?.[0] ? `${p.tags[0]}` : 'Power BI'),
      problem: p.problem || p.subtitle || '',
      insight: p.insight || 'Key statistical pattern and actionable metric discovered.',
      description: p.problem || p.subtitle || p.description || '',
      analyticalQuestion: p.analyticalQuestion || p.insight || 'How can structured analytics solve this operational challenge?',
      tags: Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : ['Power BI', 'SQL', 'Data Analytics'],
      image: p.image_url || p.imageUrl || p.image || VERIFIED_FALLBACK_IMAGES[idx % VERIFIED_FALLBACK_IMAGES.length],
      href: `/project/${p.id || p._id || idx + 1}`,
      date: p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Aug 24, 2026',
    }));
  }, [liveDbProjects, contextProjects]);

  // 2. Unified Blog Articles
  const allBlogs = useMemo(() => {
    const rawList = liveDbBlogs.length > 0 ? liveDbBlogs : contextBlogs;
    return rawList.map((b, idx) => ({
      id: b.id || b._id || String(idx + 1),
      title: b.title || 'Data Analytics Process Notes',
      subtitle: b.excerpt || (Array.isArray(b.tags) ? b.tags.slice(0, 3).join(' · ') : 'Methodologies & Architecture'),
      content: b.content || b.description || 'Full methodology breakdown and analysis notes.',
      tags: Array.isArray(b.tags) ? b.tags : ['Excel', 'Power Query', 'DAX'],
      image: b.cover_image || b.coverImage || b.image_url || b.image || VERIFIED_FALLBACK_IMAGES[idx % VERIFIED_FALLBACK_IMAGES.length],
      readTime: b.read_time || b.readTime || '5 min read',
      date: b.published_at || b.created_at ? new Date(b.published_at || b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Aug 21, 2026',
      category: 'Editorial Article',
    }));
  }, [liveDbBlogs, contextBlogs]);

  // 3. Unified Certifications
  const allCertifications = useMemo(() => {
    const rawList =
      liveDbCertifications.length > 0
        ? liveDbCertifications
        : settings?.certifications?.certifications || settings?.skills?.certifications || [];

    return rawList.map((c, idx) => {
      const isObj = typeof c === 'object' && c !== null;
      const name = isObj ? (c.name || c.title) : c;
      const issuer = isObj ? (c.issuer || 'Forage') : (name.includes('Deloitte') ? 'Deloitte' : name.includes('Tata') ? 'Tata' : 'Forage');
      const image = isObj ? (c.image || '') : '';
      const credentialUrl = isObj ? (c.credentialUrl || '') : '';
      const issueDate = isObj ? (c.issueDate || 'June 2026') : 'July 2026';

      return {
        id: `cert-${idx + 1}`,
        title: name,
        issuer,
        subtitle: `${issuer} · Professional Credential & Simulation`,
        image: image || VERIFIED_FALLBACK_IMAGES[idx % VERIFIED_FALLBACK_IMAGES.length],
        credentialUrl,
        issueDate,
        tags: [issuer, 'Job Simulation', 'Data Analytics'],
        category: 'Certification Story',
        description: `Completed comprehensive professional simulation covering data pipelines, forensic anomaly analysis, and executive KPI scorecards.`,
      };
    });
  }, [liveDbCertifications, settings]);

  // 4. Combined Mixed Cards Grid
  const mixedShowcaseCards = useMemo(() => {
    const cards = [];
    allProjects.forEach((p) => {
      cards.push({
        id: `proj-${p.id}`,
        title: p.title,
        subtitle: p.subtitle,
        image: p.image,
        category: `${p.category || 'Power BI'} Project`,
        link: p.href,
        type: 'project',
      });
    });
    allBlogs.forEach((b) => {
      cards.push({
        id: `blog-${b.id}`,
        title: b.title,
        subtitle: b.subtitle,
        image: b.image,
        category: 'Editorial Article',
        articleData: b,
        type: 'article',
      });
    });
    allCertifications.forEach((c) => {
      cards.push({
        id: `cert-${c.id}`,
        title: c.title,
        subtitle: c.subtitle,
        image: c.image,
        category: 'Certification Story',
        certData: c,
        type: 'certification',
      });
    });
    return cards;
  }, [allProjects, allBlogs, allCertifications]);

  // 5. Combined Editorial Story Feed
  const allEditorialStories = useMemo(() => {
    const stories = [];
    allProjects.forEach((p) => {
      stories.push({
        id: `story-proj-${p.id}`,
        title: p.title,
        date: p.date,
        topic: 'Statistical Visualization',
        subtopic: p.tool || 'Power BI · Analytics',
        tags: p.tags,
        image: p.image,
        narrative: (
          <div className="space-y-3">
            <p className="font-medium text-slate-800">
              <strong>Analytical Question:</strong> <em>"{p.analyticalQuestion}"</em>
            </p>
            <p>{p.description}</p>
            {p.insight && (
              <p className="bg-slate-50 p-3 rounded-lg border-l-3 border-blue-600 text-xs sm:text-sm">
                <strong>Key Finding:</strong> {p.insight}
              </p>
            )}
          </div>
        ),
        ctaLink: p.href,
        ctaText: 'Explore full case study and data model →',
        type: 'project',
      });
    });

    allBlogs.forEach((b) => {
      stories.push({
        id: `story-blog-${b.id}`,
        title: b.title,
        date: b.date,
        topic: 'Methodology Notes',
        subtopic: b.subtitle,
        tags: b.tags,
        image: b.image,
        narrative: (
          <div className="space-y-3">
            <p className="line-clamp-4">{b.content}</p>
          </div>
        ),
        articleData: b,
        ctaText: 'Read full analysis and methodology notes →',
        type: 'article',
      });
    });

    allCertifications.forEach((c) => {
      stories.push({
        id: `story-cert-${c.id}`,
        title: `${c.title} — ${c.issuer}`,
        date: c.issueDate || 'July 2026',
        topic: 'Professional Simulation',
        subtopic: `${c.issuer} Job Simulation`,
        tags: c.tags,
        image: c.image,
        narrative: (
          <div className="space-y-3">
            <p>{c.description}</p>
            <p className="text-xs text-slate-600">
              <strong>Issuer:</strong> {c.issuer} · {c.issueDate}
            </p>
          </div>
        ),
        certData: c,
        ctaText: 'View certification credential details →',
        type: 'certification',
      });
    });

    return stories;
  }, [allProjects, allBlogs, allCertifications]);

  // Filtered stories based on topic
  const filteredStories = useMemo(() => {
    if (selectedTopic === 'All') return allEditorialStories;
    return allEditorialStories.filter((s) => {
      const matchTopic = s.topic.toLowerCase().includes(selectedTopic.toLowerCase());
      const matchSub = s.subtopic && s.subtopic.toLowerCase().includes(selectedTopic.toLowerCase());
      const matchTag = s.tags && s.tags.some((t) => t.toLowerCase().includes(selectedTopic.toLowerCase()));
      return matchTopic || matchSub || matchTag;
    });
  }, [allEditorialStories, selectedTopic]);

  const handleCardClick = (card) => {
    if (card.link) {
      if (card.link.startsWith('http')) {
        window.open(card.link, '_blank');
      } else {
        navigate(card.link);
      }
    } else if (card.articleData) {
      navigate(`/blog/${card.articleData.slug || card.articleData.id}`);
    } else if (card.certData) {
      setSelectedCertification(card.certData);
    }
  };

  const handleStoryClick = (story) => {
    if (story.ctaLink) {
      if (story.ctaLink.startsWith('http')) {
        window.open(story.ctaLink, '_blank');
      } else {
        navigate(story.ctaLink);
      }
    } else if (story.articleData) {
      navigate(`/blog/${story.articleData.slug || story.articleData.id}`);
    } else if (story.certData) {
      setSelectedCertification(story.certData);
    }
  };

  // Helper to render image or PDF preview cleanly
  const renderVisualMedia = (mediaUrl, altTitle) => {
    if (!mediaUrl) return null;
    const isPdf = mediaUrl.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-4">
          <GraduationCap size={36} className="text-blue-400 mb-2" />
          <span className="text-xs font-mono font-bold text-center px-2">{altTitle}</span>
          <span className="text-[10px] text-slate-400 mt-1 uppercase font-mono tracking-wider">PDF Certificate</span>
        </div>
      );
    }

    return (
      <img
        src={mediaUrl}
        alt={altTitle}
        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
        loading="lazy"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = VERIFIED_FALLBACK_IMAGES[0];
        }}
      />
    );
  };

  // Dynamic Sidebar & Author Configurations (Editable via Admin)
  const sidebarSectionTitle = settings?.sections?.blog?.sidebarName || 'Made by Arun Pandian';
  const authorName = settings?.hero?.name || 'Arun Pandian';
  const authorBio = settings?.about?.bio || settings?.sections?.blog?.authorBio || "Hi, I'm Arun Pandian — a Data Analyst transforming complex datasets into actionable business intelligence with SQL, Python, Excel & Power BI.";

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-blue-600 selection:text-white">
      <Helmet>
        <title>Analytics Publication, Projects & Certifications | {authorName}</title>
        <meta
          name="description"
          content="FlowingData-inspired data analytics publication, real uploaded projects, and technical certifications by Arun Pandian."
        />
      </Helmet>

      <StyleOverrides />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-20">

        {/* ═════════════════════════════════════════════════════════════════
            PART 1: TOP SHOWCASE CARDS (HORIZONTAL / GRID / BENTO ARRANGEMENT)
            Real Projects + Real Blog Articles + Real Certifications
            ═════════════════════════════════════════════════════════════════ */}
        <section className="mb-12 sm:mb-16">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 mb-6 gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <h2
                data-edit-id="blog.showcaseTitle"
                data-edit-name="Blog · Showcase Title"
                data-edit-kind="heading"
                data-edit-path="sections.blog.showcaseTitle"
                className="text-xs font-mono font-bold tracking-widest text-slate-700 uppercase"
              >
                Featured Projects, Articles & Certifications
              </h2>
            </div>

            {/* Layout Arrangement Switcher (Horizontal vs Vertical Grid) */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-mono">
                <button
                  onClick={() => setLayoutMode('grid')}
                  title="3-Column Grid Layout"
                  className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                    layoutMode === 'grid'
                      ? 'bg-white font-bold text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LayoutGrid size={13} />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setLayoutMode('horizontal')}
                  title="Horizontal Carousel Layout"
                  className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                    layoutMode === 'horizontal'
                      ? 'bg-white font-bold text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Columns size={13} />
                  <span className="hidden sm:inline">Horizontal</span>
                </button>
              </div>

              <span className="text-[11px] font-mono text-slate-400">
                {mixedShowcaseCards.length} Total Works
              </span>
            </div>
          </div>

          {/* Render by Layout Arrangement */}
          {layoutMode === 'horizontal' ? (
            /* Horizontal Scrollable Carousel with Arrow Indicator */
            <div className="relative">
              <div className="flex overflow-x-auto gap-5 sm:gap-6 pb-4 snap-x snap-mandatory hide-scrollbar -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
                {mixedShowcaseCards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card)}
                    className="w-[78vw] sm:w-[42vw] md:w-[30vw] lg:w-[24vw] shrink-0 snap-center group cursor-pointer flex flex-col"
                  >
                    <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/90 shadow-2xs group-hover:shadow-md group-hover:border-slate-300 transition-all duration-300 aspect-4/3 mb-3 relative">
                      {renderVisualMedia(card.image, card.title)}
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-[10px] font-mono font-bold text-slate-800 shadow-xs border border-slate-200/60">
                        {card.category}
                      </div>
                    </div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-1 truncate">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono truncate">
                      {card.subtitle}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* 3-Column Standard Grid Layout */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {mixedShowcaseCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className="group cursor-pointer flex flex-col"
                >
                  <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/90 shadow-2xs group-hover:shadow-md group-hover:border-slate-300 transition-all duration-300 aspect-4/3 mb-3 relative">
                    {renderVisualMedia(card.image, card.title)}
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-[10px] font-mono font-bold text-slate-800 shadow-xs border border-slate-200/60">
                      {card.category}
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-1">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono line-clamp-1">
                    {card.subtitle}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="border-t border-slate-200/90 mb-12 sm:mb-16" />

        {/* ═════════════════════════════════════════════════════════════════
            PART 2: FLOWINGDATA EDITORIAL STREAM + STICKY SIDEBAR (Image 1 & 3 style)
            Left: Date & Topic | Center: Detailed Story | Right: Complete FlowingData Sidebar
            ═════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative">
          
          {/* ─────────────────────────────────────────────────────────────
              LEFT / CENTER: EDITORIAL STORIES FEED (Col-span-12 lg:col-span-8)
              ───────────────────────────────────────────────────────────── */}
          <section className="col-span-12 lg:col-span-8 space-y-16 sm:space-y-20">
            {filteredStories.map((story) => (
              <article
                key={story.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-6 items-start pb-12 border-b border-slate-100 last:border-b-0"
              >
                {/* Left Metadata Column (Date, Topic, Tags) */}
                <div className="md:col-span-3 space-y-2 pt-1 font-sans text-xs">
                  <div className="text-slate-500 font-medium text-xs">
                    {story.date}
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-serif text-slate-400 block mb-0.5">
                      Topic
                    </span>
                    <span className="font-semibold text-slate-800 block leading-tight">
                      {story.topic}
                    </span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      / {story.subtopic}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {story.tags?.map((t) => (
                      <span
                        key={t}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTopic(t);
                        }}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200/80 text-slate-600 hover:text-blue-600 cursor-pointer"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Story Content Column (Headline, Large Visual, Narrative, Links) */}
                <div className="md:col-span-9 space-y-4">
                  {/* FlowingData Signature Title (Burgundy / Dark Serif) */}
                  <h2
                    onClick={() => handleStoryClick(story)}
                    className="font-serif font-bold text-2xl sm:text-3xl text-[#7F1D1D] hover:text-[#991B1B] cursor-pointer tracking-tight leading-snug transition-colors"
                  >
                    {story.title}
                  </h2>

                  {/* Real Image or GIF (No synthetic placeholder video!) */}
                  {story.image && (
                    <div
                      onClick={() => handleStoryClick(story)}
                      className="rounded-xl overflow-hidden bg-slate-900 border border-slate-200 aspect-16/10 cursor-pointer group"
                    >
                      {renderVisualMedia(story.image, story.title)}
                    </div>
                  )}

                  {/* Narrative Body */}
                  <div className="text-sm sm:text-[15px] text-slate-700 leading-relaxed font-sans font-normal">
                    {story.narrative}
                  </div>

                  {/* Link CTA */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleStoryClick(story)}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#7F1D1D] hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      <span>{story.ctaText}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {/* ─────────────────────────────────────────────────────────────
              RIGHT SIDEBAR: FULL FLOWINGDATA SIDEBAR (Col-span-12 lg:col-span-4)
              Sticky & Editable from Admin & Studio
              ───────────────────────────────────────────────────────────── */}
          <aside className="col-span-12 lg:col-span-4 space-y-8 lg:pl-4 lg:border-l lg:border-slate-200/80 sticky top-24 self-start">
            
            {/* 1. Browse by Chart Type & Stack (FlowingData Visual Icon Badges) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h4 className="font-serif font-bold text-sm text-slate-900 italic">
                  Browse by Chart Type & Stack
                </h4>
                {selectedTopic !== 'All' && (
                  <button
                    onClick={() => setSelectedTopic('All')}
                    className="text-[10px] font-mono text-blue-600 font-semibold cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              {/* Chart Type Icon Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {[
                  { name: 'Power BI', icon: BarChart3, filter: 'Power BI' },
                  { name: 'Line & DAX', icon: LineChart, filter: 'DAX' },
                  { name: 'Dynamic Arrays', icon: Code2, filter: 'Dynamic Arrays' },
                  { name: 'SQL & Database', icon: Database, filter: 'SQL' },
                  { name: 'Automation', icon: Cpu, filter: 'Automation' },
                  { name: 'Spreadsheets', icon: Layers, filter: 'Excel' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedTopic === item.filter;
                  return (
                    <button
                      key={item.name}
                      onClick={() => setSelectedTopic(isSelected ? 'All' : item.filter)}
                      className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 font-bold'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <Icon size={14} className={isSelected ? 'text-blue-400' : 'text-slate-500'} />
                      <span className="text-[11px] truncate">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Browse By Topic (Matching FlowingData "Browse by Topic") */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-slate-900 italic pb-2 border-b border-slate-200">
                Browse By Topic
              </h4>

              <ul className="space-y-2.5 text-xs">
                {[
                  { title: 'Visualization', sub: 'Seeing data & interactive dashboards', filter: 'Visualization' },
                  { title: 'Data Wrangling', sub: 'SQL extraction & Power Query ETL', filter: 'SQL' },
                  { title: 'Spreadsheet Modeling', sub: 'Formula-driven Excel frameworks', filter: 'Excel' },
                  { title: 'Artificial Intelligence', sub: 'Local LLMs, Ollama & n8n pipelines', filter: 'Automation' },
                  { title: 'Statistical Analysis', sub: 'Analyzing data & regression metrics', filter: 'Statistical' },
                  { title: 'Certifications', sub: 'Deloitte, Tata & Forage simulations', filter: 'Certification' },
                ].map((t) => (
                  <li
                    key={t.title}
                    onClick={() => setSelectedTopic(t.filter)}
                    className="cursor-pointer group flex flex-col"
                  >
                    <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {t.title}
                    </span>
                    <span className="text-[11px] text-slate-500 italic font-serif">
                      {t.sub}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Made by Author / Sidebar Name (Customizable via Admin) */}
            <div className="space-y-3">
              <h4
                data-edit-id="blog.sidebarName"
                data-edit-name="Blog · Sidebar Name"
                data-edit-kind="heading"
                data-edit-path="sections.blog.sidebarName"
                className="font-serif font-bold text-sm text-slate-900 italic pb-2 border-b border-slate-200"
              >
                {sidebarSectionTitle}
              </h4>
              <ul className="space-y-2 text-xs font-mono text-slate-600">
                <li>
                  <Link to="/#projects" className="hover:text-blue-600 transition-colors flex items-center justify-between">
                    <span>The Process & Case Studies</span>
                    <span className="text-slate-400">→</span>
                  </Link>
                </li>
                <li>
                  <Link to="/#skills" className="hover:text-blue-600 transition-colors flex items-center justify-between">
                    <span>Technical Toolkit & Architecture</span>
                    <span className="text-slate-400">→</span>
                  </Link>
                </li>
                <li>
                  <a href="/resume.pdf" download className="hover:text-blue-600 transition-colors flex items-center justify-between font-semibold text-blue-600">
                    <span>Download Official Résumé</span>
                    <span>↓</span>
                  </a>
                </li>
                <li>
                  <Link to="/admin" className="hover:text-slate-900 transition-colors flex items-center justify-between text-slate-400">
                    <span>Admin Studio Control</span>
                    <span>⚙</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* 4. About the Author */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-serif font-bold text-sm text-slate-900">
                About the Author
              </h4>
              <p
                data-edit-id="blog.authorBio"
                data-edit-name="Blog · Author Bio"
                data-edit-kind="text"
                data-edit-path="sections.blog.authorBio"
                className="text-xs text-slate-600 leading-relaxed"
              >
                {authorBio}
              </p>
              <div className="flex items-center gap-3 pt-2 text-xs font-mono text-slate-500 border-t border-slate-200">
                <a
                  href="https://www.linkedin.com/in/arunpandianp-dataanalyst/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-[#0077B5] transition-colors"
                  title="LinkedIn Profile"
                >
                  <FaLinkedin className="text-sm text-[#0077B5]" />
                  <span>LinkedIn</span>
                </a>
                <a
                  href="https://github.com/arun-pandian-p"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                  title="GitHub Profile"
                >
                  <FaGithub className="text-sm text-slate-800" />
                  <span>GitHub</span>
                </a>
                <a
                  href="/resume.pdf"
                  download
                  className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors font-semibold text-blue-600"
                  title="Download Résumé"
                >
                  <FileText size={13} />
                  <span>Résumé</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Inline Article Reading Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <span>{selectedArticle.date}</span>
                <span>•</span>
                <span>{selectedArticle.readTime}</span>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-mono text-slate-700 font-bold cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            {selectedArticle.image && (
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-auto rounded-xl border border-slate-200"
              />
            )}

            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#7F1D1D] tracking-tight">
              {selectedArticle.title}
            </h2>

            <div className="prose prose-slate max-w-none text-sm leading-relaxed whitespace-pre-line font-sans text-slate-700">
              {selectedArticle.content}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <div className="flex flex-wrap gap-1.5">
                {selectedArticle.tags?.map((t) => (
                  <span key={t} className="text-xs font-mono px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded">
                    {t}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-blue-600 transition-colors cursor-pointer"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Certification Credential Modal */}
      {selectedCertification && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setSelectedCertification(null)}
        >
          <div
            className="relative max-w-xl w-full max-h-[85vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 text-xs font-mono text-blue-600 font-bold">
                <ShieldCheck size={16} />
                <span>{selectedCertification.issuer}</span>
              </div>
              <button
                onClick={() => setSelectedCertification(null)}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-mono text-slate-700 font-bold cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            {selectedCertification.image && (
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 aspect-16/10 flex items-center justify-center">
                {renderVisualMedia(selectedCertification.image, selectedCertification.title)}
              </div>
            )}

            <div>
              <h2 className="font-serif font-bold text-2xl text-[#7F1D1D] tracking-tight mb-2">
                {selectedCertification.title}
              </h2>
              <p className="text-xs font-mono text-slate-500 mb-4">
                {selectedCertification.subtitle}
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {selectedCertification.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-2 justify-between items-center">
              {selectedCertification.credentialUrl ? (
                <a
                  href={selectedCertification.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-blue-600 hover:underline"
                >
                  <span>Verify Original Certificate</span>
                  <ExternalLink size={12} />
                </a>
              ) : (
                <span className="text-xs font-mono text-slate-400">Verified Credential</span>
              )}
              
              <button
                onClick={() => setSelectedCertification(null)}
                className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-blue-600 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200/90 py-8 bg-slate-50 text-slate-600 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{authorName}</span>
            <span>· Data Analyst Publication</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <a
              href="https://www.linkedin.com/in/arunpandianp-dataanalyst/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[#0077B5] transition-colors"
            >
              <FaLinkedin className="text-xs text-[#0077B5]" /> LinkedIn
            </a>
            <a
              href="https://github.com/arun-pandian-p"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
            >
              <FaGithub className="text-xs text-slate-800" /> GitHub
            </a>
            <a
              href="/resume.pdf"
              download
              className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
              <FileText size={12} /> Résumé
            </a>
            <Link to="/admin" className="hover:text-slate-900 transition-colors">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
