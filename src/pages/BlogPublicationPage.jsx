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
  
  // Medium-style Feed Tabs: 'for-you' | 'featured' | category
  const [activeTab, setActiveTab] = useState('for-you');
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
      category: p.category || (p.tags?.[0] ? `${p.tags[0]}` : 'Power BI'),
      problem: p.problem || p.subtitle || '',
      insight: p.insight || 'Key statistical pattern and actionable metric discovered.',
      description: p.problem || p.subtitle || p.description || '',
      tags: Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : ['Power BI', 'SQL', 'Data Analytics'],
      image: p.image_url || p.imageUrl || p.image || VERIFIED_FALLBACK_IMAGES[idx % VERIFIED_FALLBACK_IMAGES.length],
      href: `/project/${p.id || p._id || idx + 1}`,
      date: p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Apr 15',
      type: 'project',
      readTime: '6 min read',
      claps: 320 + (idx * 47) % 500,
      responses: 4 + idx * 2,
      featured: true,
    }));
  }, [liveDbProjects, contextProjects]);

  // 2. Unified Blog Articles
  const allBlogs = useMemo(() => {
    const rawList = liveDbBlogs.length > 0 ? liveDbBlogs : contextBlogs;
    return rawList.map((b, idx) => ({
      id: b.id || b._id || String(idx + 1),
      slug: b.slug || String(b.id || idx + 1),
      title: b.title || 'The Medallion Architecture Reconsidered: What It Solved, and Where It\'s Cracking',
      subtitle: b.excerpt || 'Rethinking Bronze, Silver, and Gold for the modern AI and business intelligence era.',
      content: b.content || b.description || 'Full methodology breakdown and analysis notes.',
      tags: Array.isArray(b.tags) ? b.tags : ['Data Engineering', 'SQL', 'Architecture'],
      image: b.cover_image || b.coverImage || b.image_url || b.image || VERIFIED_FALLBACK_IMAGES[idx % VERIFIED_FALLBACK_IMAGES.length],
      readTime: b.read_time || b.readTime || '7 min read',
      date: b.published_at || b.created_at ? new Date(b.published_at || b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Jul 4',
      category: b.category || (Array.isArray(b.tags) && b.tags[0]) || 'Data Engineering',
      authorName: b.author_name || 'Arun Pandian',
      publicationName: b.category ? `In ${b.category}` : 'In Towards Data Intelligence',
      href: `/blog/${b.slug || b.id}`,
      type: 'article',
      featured: Boolean(b.featured) || idx === 0,
      claps: 484 + (idx * 83) % 900,
      responses: 5 + (idx * 3) % 15,
      shares: 3 + idx,
    }));
  }, [liveDbBlogs, contextBlogs]);

  // Combined Items
  const allItems = useMemo(() => {
    return [...allBlogs, ...allProjects];
  }, [allBlogs, allProjects]);

  // Navigation Tabs list
  const tabCategories = [
    { id: 'for-you', label: 'For you' },
    { id: 'featured', label: 'Featured' },
    { id: 'Power BI', label: 'Power BI' },
    { id: 'SQL', label: 'SQL' },
    { id: 'Python', label: 'Python' },
    { id: 'Data Engineering', label: 'Data Engineering' },
    { id: 'Analytics', label: 'Analytics' },
  ];

  // Filtered Articles based on tab and search
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      let matchesTab = true;
      if (activeTab === 'featured') {
        matchesTab = item.featured;
      } else if (activeTab !== 'for-you') {
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
        <title>Publications & Articles | {authorName}</title>
        <meta
          name="description"
          content="Explore data analytics case studies, Power BI architecture, SQL transformations, and statistical modeling articles."
        />
      </Helmet>

      <StyleOverrides />
      <Navbar />

      {/* ═════════════════════════════════════════════════════════════════
          TOP HEADER & PROMO BANNER
          ═════════════════════════════════════════════════════════════════ */}
      <div className="pt-20 sm:pt-24 bg-amber-400 text-slate-950 px-4 py-2.5 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-3">
        <span>Verified Data Analytics Case Studies & Architecture Guides.</span>
        <button
          onClick={() => setIsSubscribeOpen(true)}
          className="px-3 py-1 rounded-full bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Subscribe free
        </button>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pb-24">
        
        {/* ── MASTHEAD TITLE ── */}
        <div className="flex items-center justify-between pt-8 pb-4 border-b border-slate-100">
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
                placeholder="Search..."
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

        {/* ── MEDIUM FEED TABS (For you, Featured, Topics) ── */}
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar border-b border-slate-200 py-3 text-sm font-sans text-slate-600">
          {tabCategories.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 border-b-2 font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-slate-950 text-slate-950 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            MEDIUM PUBLICATION ARTICLES FEED (Matching Screenshot Image 2)
            Left: Publication info, Bold Title, Subtitle, Claps & Meta
            Right: Square Crisp Thumbnail
            ═════════════════════════════════════════════════════════════════ */}
        <div className="divide-y divide-slate-150 mt-4">
          {filteredItems.length === 0 ? (
            <div className="py-20 text-center text-slate-500 space-y-3">
              <BookOpen size={36} className="mx-auto text-slate-300" />
              <p className="font-serif font-bold text-lg text-slate-800">No stories found in this section</p>
              <p className="text-xs max-w-xs mx-auto">Try selecting "For you" or search for SQL, Power BI, Python keywords.</p>
              <button
                onClick={() => { setActiveTab('for-you'); setSearchQuery(''); }}
                className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold"
              >
                View all stories
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSaved = bookmarkedIds.has(item.id);
              const customClaps = clapsMap[item.id] ? item.claps + clapsMap[item.id] : item.claps;

              return (
                <article
                  key={item.id}
                  onClick={() => navigate(item.href)}
                  className="py-6 group cursor-pointer transition-colors"
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

                  {/* Main Content Split: Left Info + Right Thumbnail */}
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

                    {/* Right Thumbnail */}
                    {item.image && (
                      <div className="w-24 h-18 sm:w-32 sm:h-22 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-200">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}

                  </div>

                  {/* Footer Actions Row (Star, Claps, Responses, Bookmark) */}
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
