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
  ThumbsUp
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
  
  // Top Visual Gallery Filter State (2nd Upload Design)
  const [galleryCategory, setGalleryCategory] = useState('Show all');

  // Bottom Medium Feed Tabs State (1st Upload Design)
  const [activeTab, setActiveTab] = useState('For you');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  
  // Real-time live data states
  const [liveDbProjects, setLiveDbProjects] = useState([]);
  const [liveDbBlogs, setLiveDbBlogs] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [clapsMap, setClapsMap] = useState({});

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
      date: p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Jul 8',
      type: 'project',
      readTime: '5 min read',
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
      readTime: b.read_time || b.readTime || '4 min read',
      date: b.published_at || b.created_at ? new Date(b.published_at || b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Jul 8',
      category: b.category || (Array.isArray(b.tags) && b.tags[0]) || 'Towards Data Intelligence',
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

  // Top Visual Gallery Filter Categories (Image 2 style)
  const galleryFilterCategories = [
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

  // Visual Gallery Items (Top Section)
  const visualGalleryItems = useMemo(() => {
    if (galleryCategory === 'Show all') return allItems;
    return allItems.filter((item) => {
      const matchCat = item.category?.toLowerCase() === galleryCategory.toLowerCase();
      const matchTags = Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase() === galleryCategory.toLowerCase());
      return matchCat || matchTags;
    });
  }, [allItems, galleryCategory]);

  // Bottom Medium Feed Tabs (Image 1 style)
  const feedTabs = [
    'For you',
    'Featured',
    'Power BI',
    'SQL',
    'Python',
    'Data Engineering',
    'Analytics',
  ];

  // Filtered Medium Feed Items (Bottom Section)
  const feedItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      let matchesTab = true;
      if (activeTab === 'Featured') {
        matchesTab = item.featured;
      } else if (activeTab !== 'For you') {
        matchesTab =
          item.category?.toLowerCase() === activeTab.toLowerCase() ||
          (Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase() === activeTab.toLowerCase()));
      }

      return matchesSearch && matchesTab;
    });
  }, [allItems, searchQuery, activeTab]);

  const handleBookmarkToggle = (e, id) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast('Removed from reading list', { icon: '🗑️' });
      } else {
        next.add(id);
        toast.success('Saved to your reading list!', { icon: '🔖' });
      }
      return next;
    });
  };

  const handleClap = (e, id) => {
    e.stopPropagation();
    setClapsMap((prev) => {
      const current = prev[id] || 0;
      const updated = current + 1;
      toast.success(`👏 Clapped! (${updated})`, { icon: '👏' });
      return { ...prev, [id]: updated };
    });
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
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-slate-900 selection:text-white">
      <Helmet>
        <title>Publications & Projects | {authorName}</title>
        <meta
          name="description"
          content="Explore data analytics case studies, Power BI architecture, SQL transformations, and statistical modeling articles."
        />
      </Helmet>

      <StyleOverrides />
      <Navbar />

      {/* ═════════════════════════════════════════════════════════════════
          TOP SECTION: 2ND UPLOADED DESIGN (Visual Project / Charts Gallery Grid)
          Matching Screenshot 2: Clean Teal Filter Pills + Multi-Column Card Visuals
          ═════════════════════════════════════════════════════════════════ */}
      <section className="pt-24 sm:pt-28 pb-12 bg-[#FCFDFD] border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          {/* Header Title for Visual Gallery */}
          <div className="text-center mb-8 space-y-2">
            <h2 className="font-serif font-black text-2xl sm:text-3xl md:text-4xl text-slate-950 tracking-tight">
              Data Visualization & Interactive Projects
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-sans max-w-lg mx-auto">
              Explore dashboards, statistical charts, ETL transformations, and data models.
            </p>
          </div>

          {/* Teal Pill Filter Buttons (Exact 2nd Uploaded Screenshot Style) */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-10">
            {galleryFilterCategories.map((cat) => {
              const isSelected = galleryCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setGalleryCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-md text-xs sm:text-[13px] font-sans font-medium transition-all cursor-pointer border ${
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

          {/* 4-Column Visual Cards Grid (Exact 2nd Uploaded Screenshot Style) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {visualGalleryItems.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(item.href)}
                className="group cursor-pointer bg-white rounded-xl border border-slate-200/90 hover:border-[#37B5A8]/50 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Visual Chart Thumbnail */}
                <div className="aspect-square bg-white flex items-center justify-center p-2 sm:p-3 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                {/* Card Sub-Info */}
                <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex-1 flex flex-col justify-between">
                  <h3 className="font-serif font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#37B5A8] transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-slate-400">
                    <span>{item.category}</span>
                    <span className="text-[#37B5A8] font-bold">View →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          DOWN SECTION: 1ST UPLOADED DESIGN (Medium-Style Editorial Feed)
          Matching Screenshot 1: For You Tabs + Left Text / Right Thumbnail Cards
          ═════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-12 pb-24">
        
        {/* Masthead Header Title */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-slate-950 tracking-tight">
              Arun Pandian
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              Data Analyst
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input Bar */}
            <div className="relative w-40 sm:w-60">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-slate-900 outline-none"
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

            <Link
              to="/admin/blogs"
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Admin Blog Studio"
            >
              <FileText size={15} />
            </Link>
          </div>
        </div>

        {/* Medium Feed Tabs (For you, Featured, Power BI, SQL, Python, etc.) */}
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar border-b border-slate-200 py-3 text-sm font-sans text-slate-600">
          {feedTabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 border-b-2 font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-slate-950 text-slate-950 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Medium Article Cards Feed (Matching Screenshot 1) */}
        <div className="divide-y divide-slate-150 mt-2">
          {feedItems.length === 0 ? (
            <div className="py-20 text-center text-slate-500 space-y-3">
              <BookOpen size={36} className="mx-auto text-slate-300" />
              <p className="font-serif font-bold text-lg text-slate-800">No articles found</p>
              <p className="text-xs max-w-xs mx-auto">Try switching tabs or clear your search.</p>
              <button
                onClick={() => { setActiveTab('For you'); setSearchQuery(''); }}
                className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold"
              >
                View all articles
              </button>
            </div>
          ) : (
            feedItems.map((item) => {
              const isSaved = bookmarkedIds.has(item.id);
              const customClaps = clapsMap[item.id] ? item.claps + clapsMap[item.id] : item.claps;

              return (
                <article
                  key={item.id}
                  onClick={() => navigate(item.href)}
                  className="py-7 group cursor-pointer transition-colors"
                >
                  {/* Publication Subheader Row */}
                  <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">
                      ➔
                    </div>
                    <span className="font-semibold text-slate-900 truncate">
                      {item.publicationName || `In ${item.category}`}
                    </span>
                    <span>by</span>
                    <span className="text-slate-800 font-medium">{item.authorName || 'Arun Pandian'}</span>
                    <span>·</span>
                    <span className="text-slate-500 font-mono text-[11px]">{item.date}</span>
                  </div>

                  {/* Main Content Split: Left Text + Right Thumbnail (Exact Screenshot 1 Style) */}
                  <div className="flex items-start justify-between gap-4 sm:gap-6">
                    
                    {/* Left Info Column */}
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <h2 className="font-serif font-bold text-base sm:text-xl text-slate-950 group-hover:text-blue-700 transition-colors leading-snug line-clamp-2">
                        {item.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed font-sans font-normal">
                        {item.subtitle || item.description}
                      </p>
                    </div>

                    {/* Right Rectangular Thumbnail */}
                    {item.image && (
                      <div className="w-28 h-20 sm:w-36 sm:h-24 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-200">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}

                  </div>

                  {/* Footer Actions Row (Star, Read Time, Claps, Responses, Bookmark, Share) */}
                  <div className="flex items-center justify-between pt-4 mt-2 text-xs text-slate-500">
                    <div className="flex items-center gap-4 sm:gap-5">
                      {item.featured && (
                        <span className="text-amber-500 text-sm" title="Featured Member Story">
                          ★
                        </span>
                      )}
                      
                      <span className="font-mono text-[11px] text-slate-400">
                        {item.readTime}
                      </span>

                      {/* Interactive Claps */}
                      <button
                        onClick={(e) => handleClap(e, item.id)}
                        className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Clap"
                      >
                        <span className="text-sm">👏</span>
                        <span className="font-mono text-xs">{customClaps}</span>
                      </button>

                      {/* Responses / Comments */}
                      <div className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors">
                        <MessageSquare size={13} />
                        <span className="font-mono text-xs">{item.responses || 5}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Save / Bookmark Button */}
                      <button
                        onClick={(e) => handleBookmarkToggle(e, item.id)}
                        className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                          isSaved ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-slate-800'
                        }`}
                        title={isSaved ? "Saved in reading list" : "Save story"}
                      >
                        <Bookmark size={15} className={isSaved ? "fill-amber-500" : ""} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (navigator.share) {
                            navigator.share({ title: item.title, url: window.location.origin + item.href }).catch(() => {});
                          } else {
                            navigator.clipboard.writeText(window.location.origin + item.href);
                            toast.success('Link copied!', { icon: '🔗' });
                          }
                        }}
                        className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                        title="Share"
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>

                </article>
              );
            })
          )}
        </div>

      </main>

      {/* ── EMAIL NEWSLETTER SUBSCRIPTION MODAL ── */}
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
                placeholder="Enter your work or personal email..."
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
