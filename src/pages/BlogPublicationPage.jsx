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
  X,
  Star,
  Flame,
  Bookmark,
  MessageSquare,
  Repeat,
  MoreVertical,
  ThumbsUp,
  TrendingDown
} from 'lucide-react';
import { FaLinkedin, FaGithub, FaXTwitter, FaWhatsapp, FaMedium } from 'react-icons/fa6';
import Navbar from '../components/Navbar';
import StyleOverrides from '../editor/StyleOverrides';
import { useContent } from '../context/ContentProvider';
import { useThemeStore } from '../theme/store';
import { supabase } from '../lib/supabaseClient';
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
  
  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState('Show all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  
  // Real-time live data states
  const [liveDbProjects, setLiveDbProjects] = useState([]);
  const [liveDbBlogs, setLiveDbBlogs] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [clapsMap, setClapsMap] = useState({});

  // Carousel index for Main News
  const [mainNewsIndex, setMainNewsIndex] = useState(0);

  // Fetch directly from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    const fetchLiveDb = async () => {
      if (!supabase) return;
      try {
        const [projRes, blogRes] = await Promise.all([
          supabase.from('projects').select('*').order('sort_order', { ascending: true }),
          supabase.from('blogs').select('*').order('sort_order', { ascending: true }),
        ]);

        if (isMounted) {
          if (projRes.data && projRes.data.length > 0) {
            setLiveDbProjects(projRes.data);
          }
          if (blogRes.data && blogRes.data.length > 0) {
            setLiveDbBlogs(blogRes.data);
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
      category: p.category || (p.tags?.[0] ? `${p.tags[0]}` : 'Dashboard'),
      problem: p.problem || p.subtitle || '',
      insight: p.insight || 'Key statistical pattern and actionable metric discovered.',
      description: p.problem || p.subtitle || p.description || '',
      tags: Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : ['Power BI', 'SQL', 'Dataviz'],
      image: p.image_url || p.imageUrl || p.image || VERIFIED_FALLBACK_IMAGES[idx % VERIFIED_FALLBACK_IMAGES.length],
      href: `/project/${p.id || p._id || idx + 1}`,
      date: p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Nov 17, 2024',
      type: 'project',
      readTime: '5 MIN READ',
      claps: 484 + (idx * 47) % 500,
      responses: 5 + idx * 2,
      featured: true,
    }));
  }, [liveDbProjects, contextProjects]);

  // 2. Unified Blog Articles
  const allBlogs = useMemo(() => {
    const rawList = liveDbBlogs.length > 0 ? liveDbBlogs : contextBlogs;
    return rawList.map((b, idx) => ({
      id: b.id || b._id || String(idx + 1),
      slug: b.slug || String(b.id || idx + 1),
      title: b.title || 'What 2023 Job-Posting Data Taught Me About Data Hiring',
      subtitle: b.excerpt || 'Answering four salary-and-skills questions with nothing but Excel, Power Query, and a Power Pivot model.',
      content: b.content || b.description || 'Full methodology breakdown and analysis notes.',
      tags: Array.isArray(b.tags) ? b.tags : ['Data Engineering', 'SQL', 'Power BI'],
      image: b.cover_image || b.coverImage || b.image_url || b.image || VERIFIED_FALLBACK_IMAGES[idx % VERIFIED_FALLBACK_IMAGES.length],
      readTime: b.read_time || b.readTime || '4 MIN READ',
      date: b.published_at || b.created_at ? new Date(b.published_at || b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Nov 17, 2024',
      category: b.category || (Array.isArray(b.tags) && b.tags[0]) || 'Newsfeed',
      authorName: b.author_name || 'Arun Pandian',
      publicationName: b.category ? `In ${b.category}` : 'In Towards Data Intelligence',
      href: `/blog/${b.slug || b.id}`,
      type: 'article',
      featured: Boolean(b.featured) || idx === 0,
      claps: 567 + (idx * 83) % 900,
      responses: 8 + (idx * 3) % 15,
      shares: 3 + idx,
    }));
  }, [liveDbBlogs, contextBlogs]);

  // Combined Items
  const allItems = useMemo(() => {
    return [...allBlogs, ...allProjects];
  }, [allBlogs, allProjects]);

  // Filter Categories for Top Pills
  const filterCategories = [
    'Show all',
    'Data mining',
    'Dataviz',
    'Scientific paper',
    'Dashboard',
    'Shiny',
    'SQL',
    'Power BI',
    'Python'
  ];

  // Filtered Items based on category and search
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      let matchesCat = true;
      if (selectedCategory !== 'Show all') {
        matchesCat =
          item.category?.toLowerCase() === selectedCategory.toLowerCase() ||
          (Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase() === selectedCategory.toLowerCase()));
      }

      return matchesSearch && matchesCat;
    });
  }, [allItems, searchQuery, selectedCategory]);

  // Main News spotlight & Editor's Picks
  const mainNewsList = useMemo(() => {
    return allItems.slice(0, 4);
  }, [allItems]);

  const currentMainNews = mainNewsList[mainNewsIndex % mainNewsList.length] || allItems[0];
  const editorsPicks = useMemo(() => {
    return allItems.slice(1, 4);
  }, [allItems]);

  const handleNextMainNews = () => {
    setMainNewsIndex((prev) => (prev + 1) % mainNewsList.length);
  };

  const handlePrevMainNews = () => {
    setMainNewsIndex((prev) => (prev - 1 + mainNewsList.length) % mainNewsList.length);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!subscribeEmail.trim()) return;
    setSubscribeSuccess(true);
    toast.success('Subscribed to Arun Pandian\'s Data Journal!', { icon: '🎉' });
    setTimeout(() => {
      setIsSubscribeOpen(false);
      setSubscribeSuccess(false);
      setSubscribeEmail('');
    }, 2000);
  };

  const authorName = settings?.hero?.name || 'Arun Pandian';

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD] text-slate-900 selection:bg-slate-900 selection:text-white">
      <Helmet>
        <title>Data Intelligence Journal & Case Studies | {authorName}</title>
        <meta
          name="description"
          content="Explore data analytics case studies, Power BI architecture, SQL transformations, and statistical modeling articles."
        />
      </Helmet>

      <StyleOverrides />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-24 space-y-12">
        
        {/* ═════════════════════════════════════════════════════════════════
            1. TOP SECTION: EDITORIAL NEWS PORTAL (Matching 2nd Uploaded Screenshot)
            Left: MAIN NEWS with Hero Card & Navigation | Right: EDITOR'S PICKS
            ═════════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── LEFT: MAIN NEWS HERO CARD (lg:col-span-8) ── */}
          <div className="lg:col-span-8 space-y-3">
            
            {/* Header with Red Accent Underline & Next/Prev Controls */}
            <div className="flex items-center justify-between pb-2 border-b-2 border-slate-200">
              <div className="relative">
                <h2 className="font-sans font-black text-sm sm:text-base tracking-wider uppercase text-slate-900">
                  MAIN NEWS
                </h2>
                <div className="absolute -bottom-2.5 left-0 w-16 h-1 bg-red-600 rounded-full" />
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
                <button
                  onClick={handlePrevMainNews}
                  className="p-1 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
                  title="Previous news"
                >
                  <ChevronLeft size={16} />
                </button>
                <span>{mainNewsIndex + 1} / {mainNewsList.length}</span>
                <button
                  onClick={handleNextMainNews}
                  className="p-1 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
                  title="Next news"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Main News Card */}
            {currentMainNews && (
              <div
                onClick={() => navigate(currentMainNews.href)}
                className="group cursor-pointer relative rounded-2xl overflow-hidden bg-slate-950 min-h-[380px] sm:min-h-[460px] flex flex-col justify-end p-6 sm:p-8 border border-slate-200 shadow-md transition-all duration-300 hover:shadow-2xl"
              >
                {/* Background Image */}
                <img
                  src={currentMainNews.image}
                  alt={currentMainNews.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-75"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

                {/* Content Overlay */}
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-red-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                      {currentMainNews.category || 'Newsfeed'}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-blue-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                      {currentMainNews.readTime || '5 MIN READ'}
                    </span>
                  </div>

                  <h3 className="font-serif font-black text-2xl sm:text-3xl md:text-4xl text-white group-hover:text-blue-300 transition-colors leading-tight">
                    {currentMainNews.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed max-w-2xl font-sans">
                    {currentMainNews.subtitle || currentMainNews.description}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-xs font-mono text-slate-400">
                    <span className="text-slate-300 font-semibold">@{currentMainNews.authorName || 'Arun Pandian'}</span>
                    <span>•</span>
                    <span>{currentMainNews.date}</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT: EDITOR'S PICKS (lg:col-span-4) ── */}
          <div className="lg:col-span-4 space-y-3">
            
            {/* Header with Red Accent Underline */}
            <div className="relative pb-2 border-b-2 border-slate-200">
              <h2 className="font-sans font-black text-sm sm:text-base tracking-wider uppercase text-slate-900">
                EDITOR'S PICKS
              </h2>
              <div className="absolute -bottom-2.5 left-0 w-16 h-1 bg-red-600 rounded-full" />
            </div>

            {/* Stacked Cards */}
            <div className="space-y-4 pt-1">
              {editorsPicks.map((pick, idx) => (
                <div
                  key={pick.id}
                  onClick={() => navigate(pick.href)}
                  className="group cursor-pointer rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 relative min-h-[195px] sm:min-h-[220px] flex flex-col justify-end p-5 shadow-xs hover:shadow-xl transition-all"
                >
                  {/* Visual Background */}
                  <img
                    src={pick.image}
                    alt={pick.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                  {/* Play / Video Icon on Top Right if first pick */}
                  {idx === 0 && (
                    <div className="absolute top-4 left-4 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                      <Play size={13} className="ml-0.5" />
                    </div>
                  )}

                  {/* Content Overlay */}
                  <div className="relative z-10 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[9px] font-mono font-bold uppercase tracking-wider">
                        {pick.category || 'Analytics'}
                      </span>
                      {idx === 1 && (
                        <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[9px] font-mono font-bold uppercase tracking-wider">
                          Featured
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif font-bold text-sm sm:text-base text-white group-hover:text-blue-200 transition-colors line-clamp-2 leading-snug">
                      {pick.title}
                    </h4>

                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 pt-0.5">
                      <span>{pick.date}</span>
                      <span>•</span>
                      <span>{pick.readTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </section>

        {/* ═════════════════════════════════════════════════════════════════
            2. BOTTOM SECTION: LARGE VISUAL PROJECTS GRID WITH SNIPPET TEXT
            Matching 1st Uploaded Screenshot: Big full visual cards with rich text explanations
            ═════════════════════════════════════════════════════════════════ */}
        <section className="space-y-6 pt-6 border-t border-slate-200">
          
          {/* Section Header & Teal Filter Pills */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
            <div>
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-slate-950 tracking-tight">
                All Projects & Scientific Case Studies
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-sans mt-0.5">
                Detailed data investigations, scatter correlations, geographic models, and Power BI dashboards.
              </p>
            </div>

            {/* Quick Search */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search charts & studies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:border-slate-900 outline-none"
              />
              <Search size={13} className="absolute left-2.5 top-2 text-slate-400 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-700 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Teal Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {filterCategories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-sans font-medium transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#37B5A8] border-[#37B5A8] text-white font-bold shadow-xs'
                      : 'bg-white border-[#37B5A8]/30 text-[#37B5A8] hover:bg-[#37B5A8]/10'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Large Visual Cards Grid (Matching 1st Uploaded Screenshot with Rich Graphics & Text) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                onClick={() => navigate(item.href)}
                className="group cursor-pointer bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Large Visual Chart / Graph Image */}
                <div className="relative aspect-4/3 sm:aspect-16/10 bg-white flex items-center justify-center p-3 overflow-hidden border-b border-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded bg-white/95 backdrop-blur-xs text-[10px] font-mono font-bold uppercase tracking-wider text-slate-900 border border-slate-200/80 shadow-xs">
                    {item.category}
                  </div>
                </div>

                {/* Detailed Snippet Text & Narrative Body (Matching 1st Uploaded Screenshot) */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-[13px] text-slate-600 line-clamp-3 leading-relaxed font-sans font-normal">
                      {item.subtitle || item.description || 'In-depth methodology breakdown, statistical modeling patterns, and verified business intelligence results.'}
                    </p>
                  </div>

                  {/* Card Footer: Tools / Tags & Read Study Action */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                    <span className="text-[11px] text-slate-500 font-medium truncate max-w-[180px]">
                      {Array.isArray(item.tags) ? item.tags.slice(0, 3).join(' · ') : (item.tool || 'SQL · Power BI')}
                    </span>
                    <span className="text-blue-600 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
                      <span>Explore Case Study</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

        </section>

      </main>

      {/* ── EMAIL NEWSLETTER MODAL ── */}
      {isSubscribeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsSubscribeOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail size={24} />
            </div>

            <div>
              <h3 className="font-serif font-bold text-xl text-slate-900">
                Subscribe to Data Intelligence Journal
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Get monthly deep dives into SQL transformations, DAX optimization patterns, and BI architectures delivered to your inbox.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-3 pt-2">
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-900 outline-none"
              />
              <button
                type="submit"
                disabled={subscribeSuccess}
                className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-blue-600 text-white text-xs font-bold font-mono transition-colors cursor-pointer"
              >
                {subscribeSuccess ? 'Subscribed! 🎉' : 'Get Free Insights'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
