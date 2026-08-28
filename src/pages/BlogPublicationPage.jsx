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
  ChevronLeft,
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
  Mail,
  Share2,
  Check,
  User,
  X
} from 'lucide-react';
import Navbar from '../components/Navbar';
import StyleOverrides from '../editor/StyleOverrides';
import { useContent } from '../context/ContentProvider';
import { useThemeStore } from '../theme/store';
import { supabase } from '../lib/supabaseClient';
import { FaLinkedin, FaGithub, FaXTwitter, FaMedium } from 'react-icons/fa6';
import toast from 'react-hot-toast';

const VERIFIED_FALLBACK_IMAGES = [
  'https://secxgzharggytkevlvmx.supabase.co/storage/v1/object/public/assets/blogs/4bzfqm82kmd_1784187994669.png',
  'https://secxgzharggytkevlvmx.supabase.co/storage/v1/object/public/assets/blogs/t8bk7q5eg7g_1784188043415.png',
  'https://secxgzharggytkevlvmx.supabase.co/storage/v1/object/public/assets/blogs/bl6o93ym18c_1784188015054.png',
];

export default function BlogPublicationPage() {
  const navigate = useNavigate();
  const { settings, projects: contextProjects = [], blogs: contextBlogs = [] } = useContent();
  const { theme } = useThemeStore();
  
  // Layout presets & arrangement: 'magazine' | 'grid' | 'list'
  const [layoutMode, setLayoutMode] = useState('magazine');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  
  // Real-time live data states
  const [liveDbProjects, setLiveDbProjects] = useState([]);
  const [liveDbBlogs, setLiveDbBlogs] = useState([]);
  const [liveDbCertifications, setLiveDbCertifications] = useState([]);

  // Fetch directly from Supabase on mount
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
      tags: Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : ['Power BI', 'SQL', 'Data Analytics'],
      image: p.image_url || p.imageUrl || p.image || VERIFIED_FALLBACK_IMAGES[idx % VERIFIED_FALLBACK_IMAGES.length],
      href: `/project/${p.id || p._id || idx + 1}`,
      date: p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Aug 24, 2026',
      type: 'project',
      readTime: '6 min read',
    }));
  }, [liveDbProjects, contextProjects]);

  // 2. Unified Blog Articles
  const allBlogs = useMemo(() => {
    const rawList = liveDbBlogs.length > 0 ? liveDbBlogs : contextBlogs;
    return rawList.map((b, idx) => ({
      id: b.id || b._id || String(idx + 1),
      slug: b.slug || String(b.id || idx + 1),
      title: b.title || 'Data Analytics Process Notes',
      subtitle: b.excerpt || (Array.isArray(b.tags) ? b.tags.slice(0, 3).join(' · ') : 'Methodologies & Architecture'),
      content: b.content || b.description || 'Full methodology breakdown and analysis notes.',
      tags: Array.isArray(b.tags) ? b.tags : ['Excel', 'Power Query', 'DAX'],
      image: b.cover_image || b.coverImage || b.image_url || b.image || VERIFIED_FALLBACK_IMAGES[idx % VERIFIED_FALLBACK_IMAGES.length],
      readTime: b.read_time || b.readTime || '5 min read',
      date: b.published_at || b.created_at ? new Date(b.published_at || b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Aug 21, 2026',
      category: b.category || (Array.isArray(b.tags) && b.tags[0]) || 'Data Analytics',
      authorName: b.author_name || 'Arun Pandian',
      href: `/blog/${b.slug || b.id}`,
      type: 'article',
      featured: Boolean(b.featured),
    }));
  }, [liveDbBlogs, contextBlogs]);

  // Combined articles list for filtering & search
  const allItems = useMemo(() => {
    return [...allBlogs, ...allProjects];
  }, [allBlogs, allProjects]);

  // Categories list with counts
  const categoriesList = useMemo(() => {
    const cats = ['All'];
    allItems.forEach((item) => {
      if (item.category && !cats.includes(item.category)) {
        cats.push(item.category);
      }
      if (Array.isArray(item.tags)) {
        item.tags.forEach((tag) => {
          if (tag && !cats.includes(tag) && cats.length < 9) {
            cats.push(tag);
          }
        });
      }
    });
    return cats;
  }, [allItems]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesCat =
        selectedCategory === 'All' ||
        item.category.toLowerCase() === selectedCategory.toLowerCase() ||
        (Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase() === selectedCategory.toLowerCase()));

      return matchesSearch && matchesCat;
    });
  }, [allItems, searchQuery, selectedCategory]);

  // Featured 3 Spotlight Cards (Top Hero Showcase matching Image 2)
  const spotlightCards = useMemo(() => {
    const featuredList = allBlogs.filter((b) => b.featured);
    if (featuredList.length >= 3) return featuredList.slice(0, 3);
    return allBlogs.slice(0, 3);
  }, [allBlogs]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!subscribeEmail.trim()) return;
    setSubscribeSuccess(true);
    toast.success('Thank you for subscribing to our Data Publication!', { icon: '🎉' });
    setTimeout(() => {
      setIsSubscribeOpen(false);
      setSubscribeSuccess(false);
      setSubscribeEmail('');
    }, 2000);
  };

  const authorName = settings?.hero?.name || 'Arun Pandian';
  const authorBio = settings?.about?.bio || settings?.sections?.blog?.authorBio || "Data Analyst exploring real-world datasets, Business Intelligence architecture, and ETL engineering pipelines.";

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-slate-900 selection:text-white">
      <Helmet>
        <title>Blog & Technical Publications | {authorName}</title>
        <meta
          name="description"
          content="Explore in-depth data analytics case studies, Power BI architecture, SQL transformations, and statistical modeling articles."
        />
      </Helmet>

      <StyleOverrides />
      <Navbar />

      {/* ═════════════════════════════════════════════════════════════════
          TOP EDITORIAL MASTHEAD (Matching Elementor Blog Style & Image 2)
          ═════════════════════════════════════════════════════════════════ */}
      <header className="pt-24 sm:pt-28 pb-6 border-b border-slate-100 bg-slate-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Sub-Bar: Social Icons & Tagline */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/70 text-xs font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-700 tracking-wide uppercase text-[11px]">
                Data Intelligence & Engineering Journal
              </span>
            </div>

            {/* Social Channels */}
            <div className="flex items-center gap-4 text-slate-600">
              <a
                href="https://www.linkedin.com/in/arunpandianp-dataanalyst/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#0077B5] transition-colors"
                title="LinkedIn"
              >
                <FaLinkedin size={15} />
              </a>
              <a
                href="https://github.com/arun-pandian-p"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-900 transition-colors"
                title="GitHub"
              >
                <FaGithub size={15} />
              </a>
              <button
                onClick={() => setIsSubscribeOpen(true)}
                className="px-3 py-1 rounded-full bg-slate-900 hover:bg-blue-600 text-white font-bold text-[11px] font-mono transition-all shadow-xs cursor-pointer"
              >
                Subscribe
              </button>
            </div>
          </div>

          {/* Central Iconic Title: BLOG */}
          <div className="py-8 sm:py-12 text-center">
            <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl tracking-tight text-slate-950 uppercase leading-none">
              BLOG
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto font-sans leading-relaxed">
              Analytical investigations, Power BI & DAX architectures, SQL pipelines, and real-world business insights.
            </p>
          </div>

          {/* Editorial Navigation Menu (Home, Pages, Categories, Search) */}
          <nav className="flex flex-wrap items-center justify-between gap-4 py-3 border-t border-slate-200 text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <Link to="/#projects" className="hover:text-blue-600 transition-colors">Projects</Link>
              <Link to="/#skills" className="hover:text-blue-600 transition-colors">Toolkit</Link>
              <Link to="/#about" className="hover:text-blue-600 transition-colors">About</Link>
              <Link to="/#contact" className="hover:text-blue-600 transition-colors">Contact</Link>
              <Link to="/admin/blogs" className="text-slate-400 hover:text-blue-600 transition-colors">Admin Studio ⚙</Link>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search articles & case studies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:border-slate-900 outline-none font-sans"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </nav>

        </div>
      </header>

      {/* ═════════════════════════════════════════════════════════════════
          SPOTLIGHT MAGAZINE 3-CARD HERO (Matching User Image 2)
          Left: Category Banner | Center: Prominent Spotlight Hero | Right: Visual Story
          ═════════════════════════════════════════════════════════════════ */}
      {spotlightCards.length > 0 && !searchQuery && selectedCategory === 'All' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            
            {/* Card 1 (Left): Tall Editorial Spotlight */}
            {spotlightCards[0] && (
              <div
                onClick={() => navigate(spotlightCards[0].href)}
                className="md:col-span-4 group cursor-pointer relative rounded-2xl overflow-hidden bg-slate-900 min-h-[360px] md:min-h-[460px] flex flex-col justify-end p-6 border border-slate-200/80 shadow-sm transition-all duration-300 hover:shadow-xl"
              >
                <img
                  src={spotlightCards[0].image}
                  alt={spotlightCards[0].title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                <div className="relative z-10 space-y-2">
                  <span className="inline-block px-3 py-1 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-mono font-black uppercase tracking-wider text-slate-900 shadow-xs">
                    {spotlightCards[0].category}
                  </span>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-white group-hover:text-blue-300 transition-colors leading-snug">
                    {spotlightCards[0].title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {spotlightCards[0].subtitle}
                  </p>
                  <div className="flex items-center gap-3 pt-2 text-[11px] font-mono text-slate-300">
                    <span>{spotlightCards[0].date}</span>
                    <span>•</span>
                    <span>{spotlightCards[0].readTime}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Card 2 (Center): Primary Large Hero Card with Iconic Floating Dark Badge Overlay */}
            {spotlightCards[1] && (
              <div
                onClick={() => navigate(spotlightCards[1].href)}
                className="md:col-span-5 group cursor-pointer relative rounded-2xl overflow-hidden bg-slate-950 min-h-[380px] md:min-h-[460px] flex flex-col justify-between p-6 border border-slate-200/80 shadow-md transition-all duration-300 hover:shadow-2xl"
              >
                <img
                  src={spotlightCards[1].image}
                  alt={spotlightCards[1].title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/20" />

                {/* Top Badge */}
                <div className="relative z-10 flex justify-between items-center">
                  <span className="px-3 py-1 rounded-md bg-blue-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm">
                    ★ Featured Story
                  </span>
                  <span className="text-[11px] font-mono text-white/80 bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                    {spotlightCards[1].readTime}
                  </span>
                </div>

                {/* Center / Bottom Floating Dark Pill Overlay (Exact Image 2 Style) */}
                <div className="relative z-10 mt-auto pt-8">
                  <div className="bg-black/90 backdrop-blur-md px-5 py-4 rounded-xl border border-white/15 shadow-2xl text-center space-y-2 group-hover:border-blue-500/50 transition-colors">
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-blue-400">
                      {spotlightCards[1].category}
                    </span>
                    <h2 className="font-serif font-black text-xl sm:text-2xl text-white group-hover:text-blue-200 transition-colors leading-tight">
                      {spotlightCards[1].title}
                    </h2>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {spotlightCards[1].subtitle}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Card 3 (Right): Side Spotlight Card */}
            {spotlightCards[2] && (
              <div
                onClick={() => navigate(spotlightCards[2].href)}
                className="md:col-span-3 group cursor-pointer relative rounded-2xl overflow-hidden bg-slate-900 min-h-[360px] md:min-h-[460px] flex flex-col justify-end p-6 border border-slate-200/80 shadow-sm transition-all duration-300 hover:shadow-xl"
              >
                <img
                  src={spotlightCards[2].image}
                  alt={spotlightCards[2].title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                <div className="relative z-10 space-y-2">
                  <span className="inline-block px-3 py-1 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-mono font-black uppercase tracking-wider text-slate-900 shadow-xs">
                    {spotlightCards[2].category}
                  </span>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-white group-hover:text-blue-300 transition-colors leading-snug">
                    {spotlightCards[2].title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {spotlightCards[2].subtitle}
                  </p>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-blue-300 group-hover:translate-x-1 transition-transform">
                      Read Article →
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>
      )}

      {/* ═════════════════════════════════════════════════════════════════
          MAIN CONTENT FEED & CATEGORY FILTER BAR
          ═════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Filter Bar & Layout Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-8 border-b border-slate-200">
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {categoriesList.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setLayoutMode('magazine')}
                title="Magazine Grid View"
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  layoutMode === 'magazine' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setLayoutMode('list')}
                title="List Feed View"
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  layoutMode === 'list' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                <Columns size={15} />
              </button>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {filteredItems.length} items
            </span>
          </div>
        </div>

        {/* ─── Articles Grid ─── */}
        {filteredItems.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-2xl border border-slate-200">
            <h3 className="font-serif font-bold text-xl text-slate-800 mb-2">No publications found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
              Try adjusting your search query or reset the category filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold font-mono hover:bg-blue-600 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : layoutMode === 'magazine' ? (
          /* Magazine 3-Column Grid Layout (Image 2 style) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                onClick={() => navigate(item.href)}
                className="group cursor-pointer flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300"
              >
                {/* Thumbnail image with subtle hover zoom */}
                <div className="relative aspect-16/10 overflow-hidden bg-slate-950">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[10px] font-mono font-bold uppercase tracking-wider text-slate-900 shadow-xs">
                    {item.category}
                  </div>
                </div>

                {/* Content Box */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span>{item.readTime}</span>
                    </div>

                    <h2 className="font-serif font-bold text-lg sm:text-xl text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                      {item.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed font-sans font-normal">
                      {item.subtitle || item.description}
                    </p>
                  </div>

                  {/* Footer metadata */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                      <span>Read Full Study</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">
                      {item.type === 'project' ? 'Case Study' : 'Article'}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* List Feed View */
          <div className="space-y-6 max-w-4xl mx-auto">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                onClick={() => navigate(item.href)}
                className="group cursor-pointer p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row gap-6 items-start"
              >
                <div className="w-full sm:w-56 aspect-16/10 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-mono font-bold uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400">• {item.date}</span>
                    <span className="text-xs font-mono text-slate-400">• {item.readTime}</span>
                  </div>
                  <h2 className="font-serif font-bold text-xl text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {item.subtitle || item.description}
                  </p>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      <span>Explore Analysis</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            NEWSLETTER / SUBSCRIBE CALLOUT BANNER (Image 2 style)
            ═════════════════════════════════════════════════════════════════ */}
        <div className="mt-16 sm:mt-20 p-8 sm:p-12 rounded-3xl bg-slate-950 text-white relative overflow-hidden shadow-xl border border-slate-800">
          <div className="max-w-2xl mx-auto text-center space-y-4 relative z-10">
            <span className="px-3 py-1 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
              Newsletter & Updates
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-4xl text-white tracking-tight">
              Stay Informed on New Data Studies
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Subscribe to get notified when deep-dive business intelligence projects, DAX methodologies, and data analysis guides are published.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 pt-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                placeholder="Enter your work email address..."
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none font-sans"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
              >
                {subscribeSuccess ? '✓ Subscribed' : 'Subscribe Free'}
              </button>
            </form>
          </div>
        </div>

      </main>

      {/* Quick Subscribe Modal */}
      {isSubscribeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setIsSubscribeOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={18} />
            </button>
            <h3 className="font-serif font-bold text-2xl text-slate-900">Subscribe to Publication</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Get notified directly in your inbox whenever new technical case studies and datasets are published.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3 pt-2">
              <input
                type="email"
                required
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-slate-900 outline-none"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                {subscribeSuccess ? '✓ Subscribed!' : 'Confirm Subscription'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
