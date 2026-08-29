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
  Dices,
  Shuffle
} from 'lucide-react';
import { FaLinkedin, FaGithub, FaXTwitter, FaWhatsapp, FaMedium } from 'react-icons/fa6';
import BlogNavbar from '../components/BlogNavbar';
import StyleOverrides from '../editor/StyleOverrides';
import { useContent } from '../context/ContentProvider';
import { useThemeStore } from '../theme/store';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { isBlogSubdomain, getMainDomainUrl } from '../utils/domain';
import NewsletterSubscribe from '../components/NewsletterSubscribe';
import { sendWelcomeEmail } from '../services/newsletterService';

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
  const [selectedCategory, setSelectedCategory] = useState('All');
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
    return rawList.map((p, idx) => {
      const rawDate = p.created_at || p.published_at || p.updated_at;
      const timestamp = rawDate ? new Date(rawDate).getTime() : Date.now() - idx * 86400000;
      const dateObj = new Date(timestamp);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      const monthYear = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      return {
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
        href: isBlogSubdomain() ? `${getMainDomainUrl()}/project/${p.id || p._id || idx + 1}?from=blog` : `/project/${p.id || p._id || idx + 1}?from=blog`,
        timestamp,
        date: formattedDate,
        monthYear,
        type: 'project',
        readTime: '5 MIN READ',
        claps: 484 + (idx * 47) % 500,
        responses: 5 + idx * 2,
        featured: true,
      };
    });
  }, [liveDbProjects, contextProjects]);

  // 2. Unified Blog Articles
  const allBlogs = useMemo(() => {
    const onSubdomain = isBlogSubdomain();
    const rawList = liveDbBlogs.length > 0 ? liveDbBlogs : contextBlogs;
    return rawList.map((b, idx) => {
      const rawDate = b.published_at || b.created_at || b.updated_at;
      const timestamp = rawDate ? new Date(rawDate).getTime() : Date.now() - idx * 86400000;
      const dateObj = new Date(timestamp);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      const monthYear = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      return {
        id: b.id || b._id || String(idx + 1),
        slug: b.slug || String(b.id || idx + 1),
        title: b.title || 'What 2023 Job-Posting Data Taught Me About Data Hiring',
        subtitle: b.excerpt || 'Answering four salary-and-skills questions with nothing but Excel, Power Query, and a Power Pivot model.',
        content: b.content || b.description || 'Full methodology breakdown and analysis notes.',
        tags: Array.isArray(b.tags) ? b.tags : ['Data Engineering', 'SQL', 'Power BI'],
        image: b.cover_image || b.coverImage || b.image_url || b.image || VERIFIED_FALLBACK_IMAGES[idx % VERIFIED_FALLBACK_IMAGES.length],
        readTime: b.read_time || b.readTime || '4 MIN READ',
        timestamp,
        date: formattedDate,
        monthYear,
        category: b.category || (Array.isArray(b.tags) && b.tags[0]) || 'Newsfeed',
        authorName: b.author_name || 'Arun Pandian',
        publicationName: b.category ? `In ${b.category}` : 'In Towards Data Intelligence',
        href: onSubdomain ? `/${b.slug || b.id}` : `/blog/${b.slug || b.id}`,
        type: 'article',
        featured: Boolean(b.featured) || idx === 0,
        claps: 567 + (idx * 83) % 900,
        responses: 8 + (idx * 3) % 15,
        shares: 3 + idx,
      };
    });
  }, [liveDbBlogs, contextBlogs]);

  // Combined Items Sorted Strictly Date-Wise (Latest Update First)
  const allItems = useMemo(() => {
    const combined = [...allBlogs, ...allProjects];
    return combined.sort((a, b) => b.timestamp - a.timestamp);
  }, [allBlogs, allProjects]);

  // Filter Categories
  const filterCategories = [
    'All',
    'Power BI',
    'SQL',
    'Python',
    'Data Engineering',
    'Analytics',
    'Dashboard'
  ];

  // Filtered Items (Centre Feed)
  const filteredItems = useMemo(() => {
    return allItems
      .filter((item) => {
        const matchesSearch =
          !searchQuery.trim() ||
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

        let matchesCat = true;
        if (selectedCategory !== 'All') {
          matchesCat =
            item.category?.toLowerCase() === selectedCategory.toLowerCase() ||
            (Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase() === selectedCategory.toLowerCase()));
        }

        return matchesSearch && matchesCat;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [allItems, searchQuery, selectedCategory]);

  // Main News spotlight & Editor's Picks (Strictly Latest Date First)
  const mainNewsList = useMemo(() => {
    return allItems.slice(0, 5);
  }, [allItems]);

  const currentMainNews = mainNewsList[mainNewsIndex % mainNewsList.length] || allItems[0];
  const editorsPicks = useMemo(() => {
    return allItems.slice(1, 3); // 2 cards to match the left hero height with zero gap
  }, [allItems]);

  // Left Column Data: Recent Highlights & Next Post Preview
  const recentPosts = useMemo(() => allItems.slice(0, 4), [allItems]);
  const nextFeaturedPost = useMemo(() => allItems[1] || allItems[0], [allItems]);

  // Right Column Data: Timeline Groups & Stats
  const timelineDates = useMemo(() => {
    const groups = {};
    allItems.forEach((item) => {
      const my = item.monthYear || 'Recent Updates';
      if (!groups[my]) groups[my] = [];
      groups[my].push(item);
    });
    return Object.entries(groups).slice(0, 5);
  }, [allItems]);

  const handleNextMainNews = () => {
    setMainNewsIndex((prev) => (prev + 1) % mainNewsList.length);
  };

  const handlePrevMainNews = () => {
    setMainNewsIndex((prev) => (prev - 1 + mainNewsList.length) % mainNewsList.length);
  };

  // Safe navigation for both internal blog routes and external main domain URLs
  const handleOpenItem = (href) => {
    if (!href) return;
    if (href.startsWith('http://') || href.startsWith('https://')) {
      window.location.href = href;
    } else {
      navigate(href);
    }
  };

  // Surprise Me Random Post Feature
  const handleSurpriseMe = () => {
    if (allItems.length === 0) return;
    const randomIndex = Math.floor(Math.random() * allItems.length);
    const randomPost = allItems[randomIndex];
    toast.success(`🎲 Selected: ${randomPost.title}`, { icon: '✨' });
    handleOpenItem(randomPost.href);
  };

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

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const cleanEmail = subscribeEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) return;

    try {
      if (supabase) {
        const { error } = await supabase
          .from('newsletter_subscribers')
          .insert([{ email: cleanEmail, source: 'blog_publication_modal', status: 'active' }]);
        
        if (error && (error.code === 'PGRST205' || error.message?.includes('schema cache'))) {
          await supabase.from('contact_messages').insert([{
            name: 'Newsletter Subscriber',
            email: cleanEmail,
            subject: '[Newsletter Subscription]',
            message: `Subscribed from blog publication modal at ${new Date().toISOString()}`
          }]);
        }
      }

      // Automatically dispatch personal Welcome & Introduction email
      sendWelcomeEmail(cleanEmail).catch((err) => console.warn('Welcome dispatch error:', err));

      setSubscribeSuccess(true);
      toast.success('Subscribed! Welcome email sent to your inbox 🚀', { icon: '📬' });
      setTimeout(() => {
        setIsSubscribeOpen(false);
        setSubscribeSuccess(false);
        setSubscribeEmail('');
      }, 2000);
    } catch (err) {
      console.warn('Error subscribing:', err);
      setSubscribeSuccess(true);
      toast.success('Subscribed to Arun Pandian\'s Data Journal!', { icon: '🎉' });
      setTimeout(() => {
        setIsSubscribeOpen(false);
        setSubscribeSuccess(false);
        setSubscribeEmail('');
      }, 2000);
    }
  };

  const authorName = settings?.hero?.name || 'Arun Pandian';

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1A17] selection:bg-[#1C1A17] selection:text-[#FAF7F2]">
      <Helmet>
        <title>Publications & Case Studies | {authorName}</title>
        <meta
          name="description"
          content="Explore data analytics case studies, Power BI architecture, SQL transformations, and statistical modeling articles."
        />
      </Helmet>

      <StyleOverrides />
      <BlogNavbar onSubscribeClick={() => setIsSubscribeOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-24 space-y-12">
        
        {/* ═════════════════════════════════════════════════════════════════
            1. TOP SECTION: EDITORIAL NEWS PORTAL (MAIN NEWS & EDITOR'S PICKS)
            ═════════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* ── LEFT: MAIN NEWS HERO CARD (lg:col-span-8) ── */}
          <div className="lg:col-span-8 flex flex-col space-y-3">
            
            {/* Header with Red Accent Underline & Next/Prev Controls */}
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#E5DDD0]">
              <div className="relative">
                <h2 className="font-sans font-black text-sm sm:text-base tracking-wider uppercase text-[#1C1A17]">
                  MAIN UPDATES
                </h2>
                <div className="absolute -bottom-2.5 left-0 w-20 h-1 bg-[#B83A26] rounded-full" />
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono text-[#8C8479]">
                <button
                  onClick={handlePrevMainNews}
                  className="p-1 rounded hover:bg-[#EFE9DF] text-[#4A453E] hover:text-[#1C1A17] transition-colors cursor-pointer"
                  title="Previous news"
                >
                  <ChevronLeft size={16} />
                </button>
                <span>{mainNewsIndex + 1} / {mainNewsList.length}</span>
                <button
                  onClick={handleNextMainNews}
                  className="p-1 rounded hover:bg-[#EFE9DF] text-[#4A453E] hover:text-[#1C1A17] transition-colors cursor-pointer"
                  title="Next news"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Main News Card (flex-1 to match right column height perfectly) */}
            {currentMainNews && (
              <div
                onClick={() => handleOpenItem(currentMainNews.href)}
                className="group cursor-pointer relative rounded-2xl overflow-hidden bg-[#161513] flex-1 min-h-[440px] sm:min-h-[480px] flex flex-col justify-end p-6 sm:p-8 border border-[#DDD5C7] shadow-sm transition-all duration-300 hover:shadow-xl"
              >
                {/* Background Image */}
                <img
                  src={currentMainNews.image}
                  alt={currentMainNews.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-75"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#161513]/95 via-[#161513]/55 to-transparent" />

                {/* Content Overlay */}
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-[#B83A26] text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-2xs">
                      {currentMainNews.category || 'Newsfeed'}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-[#1D4ED8] text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-2xs">
                      {currentMainNews.readTime || '5 MIN READ'}
                    </span>
                  </div>

                  <h3 className="font-serif font-black text-2xl sm:text-3xl md:text-4xl text-[#FAF7F2] group-hover:text-[#E2DAD0] transition-colors leading-tight">
                    {currentMainNews.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#D8D2C5] line-clamp-2 leading-relaxed max-w-2xl font-sans">
                    {currentMainNews.subtitle || currentMainNews.description}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-xs font-mono text-[#AAA396]">
                    <span className="text-[#FAF7F2] font-semibold">@{currentMainNews.authorName || 'Arun Pandian'}</span>
                    <span>•</span>
                    <span>{currentMainNews.date}</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT: EDITOR'S PICKS (lg:col-span-4) ── */}
          <div className="lg:col-span-4 flex flex-col space-y-3">
            
            {/* Header with Red Accent Underline */}
            <div className="relative pb-2 border-b-2 border-[#E5DDD0]">
              <h2 className="font-sans font-black text-sm sm:text-base tracking-wider uppercase text-[#1C1A17]">
                EDITOR'S PICKS
              </h2>
              <div className="absolute -bottom-2.5 left-0 w-16 h-1 bg-[#B83A26] rounded-full" />
            </div>

            {/* Stacked Cards (matching height with zero gap) */}
            <div className="flex-1 flex flex-col justify-between gap-4 pt-1">
              {editorsPicks.map((pick, idx) => (
                <div
                  key={pick.id}
                  onClick={() => handleOpenItem(pick.href)}
                  className="group cursor-pointer rounded-2xl overflow-hidden bg-[#161513] border border-[#DDD5C7] relative flex-1 min-h-[210px] flex flex-col justify-end p-5 shadow-xs hover:shadow-xl transition-all"
                >
                  {/* Visual Background */}
                  <img
                    src={pick.image}
                    alt={pick.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161513]/95 via-[#161513]/40 to-transparent" />

                  {/* Play / Video Icon on Top Right if first pick */}
                  {idx === 0 && (
                    <div className="absolute top-4 left-4 w-7 h-7 rounded-full bg-[#B83A26] text-white flex items-center justify-center shadow-md">
                      <Play size={13} className="ml-0.5" />
                    </div>
                  )}

                  {/* Content Overlay */}
                  <div className="relative z-10 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-[#1D4ED8] text-white text-[9px] font-mono font-bold uppercase tracking-wider shadow-2xs">
                        {pick.category || 'Analytics'}
                      </span>
                      {idx === 1 && (
                        <span className="px-2 py-0.5 rounded bg-[#B83A26] text-white text-[9px] font-mono font-bold uppercase tracking-wider shadow-2xs">
                          Featured
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif font-bold text-sm sm:text-base text-[#FAF7F2] group-hover:text-[#E2DAD0] transition-colors line-clamp-2 leading-snug">
                      {pick.title}
                    </h4>

                    <div className="text-[11px] font-mono text-[#AAA396] flex items-center gap-2 pt-0.5">
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
            2. 3-SPLIT TECHNICAL BLOG SECTION (CareerFoundry Inspired)
            Left: Recent Posts & Next Story | Centre: Main Chronological Feed | Right: Date & Time Highlights
            ═════════════════════════════════════════════════════════════════ */}
        <section className="pt-8 border-t border-[#E5DDD0]">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ───────────────────────────────────────────────────────────
                LEFT COLUMN: RECENT POSTS & NEXT STORY HIGHLIGHTS (lg:col-span-3)
                ─────────────────────────────────────────────────────────── */}
            <aside className="lg:col-span-3 space-y-6 order-2 lg:order-1">
              
              {/* Next Story Spotlight Card */}
              {nextFeaturedPost && (
                <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#E8E1D5] shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-[#8C8479] pb-2 border-b border-[#EFE9DF]">
                    <span className="font-bold text-[#B83A26] uppercase tracking-wider">Next Story</span>
                    <span>{nextFeaturedPost.readTime}</span>
                  </div>

                  <div 
                    onClick={() => handleOpenItem(nextFeaturedPost.href)}
                    className="group cursor-pointer space-y-2"
                  >
                    <div className="aspect-16/10 rounded-xl overflow-hidden bg-[#161513] border border-[#E8E1D5]">
                      <img 
                        src={nextFeaturedPost.image} 
                        alt={nextFeaturedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    </div>
                    <h4 className="font-serif font-bold text-sm text-[#1C1A17] group-hover:text-[#B83A26] transition-colors line-clamp-2">
                      {nextFeaturedPost.title}
                    </h4>
                    <p className="text-[11px] text-[#6E665C] line-clamp-2 leading-relaxed">
                      {nextFeaturedPost.subtitle}
                    </p>
                  </div>
                </div>
              )}

              {/* Recent Publications Mini List */}
              <div className="p-5 rounded-2xl bg-[#FFFDFB] border border-[#E8E1D5] shadow-xs space-y-4">
                <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-[#1C1A17] flex items-center gap-1.5 pb-2 border-b border-[#EFE9DF]">
                  <Clock size={14} className="text-[#B83A26]" />
                  <span>Recent Post Dispatch</span>
                </h3>

                <div className="space-y-3">
                  {recentPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => handleOpenItem(post.href)}
                      className="group cursor-pointer space-y-1 pb-3 border-b border-[#F4EFE6] last:border-0 last:pb-0"
                    >
                      <span className="text-[10px] font-mono text-[#B83A26] font-semibold uppercase">
                        {post.category}
                      </span>
                      <h5 className="font-serif font-bold text-xs text-[#2B2723] group-hover:text-[#B83A26] transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h5>
                      <span className="text-[10px] font-mono text-[#8C8479] block">
                        {post.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Dispatch Card */}
              <NewsletterSubscribe
                variant="card"
                source="blog_publication_sidebar"
                title="Subscribe to Updates"
                description="Get notified directly at your inbox from updates@arunpandian.online for every new publication."
              />

              {/* Quick Tech Skills Cloud */}
              <div className="p-5 rounded-2xl bg-[#F4EFE6]/80 border border-[#E2DAD0] space-y-3">
                <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#4A453E] flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#B83A26]" />
                  <span>Core Competencies</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {['SQL Pipelines', 'Power BI DAX', 'Python Pandas', 'Lakehouse', 'ETL', 'Statistical Modeling'].map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md bg-[#FFFDFB] border border-[#DDD5C7] text-[11px] font-mono text-[#4A453E] font-medium shadow-2xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

            </aside>

            {/* ───────────────────────────────────────────────────────────
                CENTRE COLUMN: MAIN CHRONOLOGICAL BLOG FEED (lg:col-span-6)
                ─────────────────────────────────────────────────────────── */}
            <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
              
              {/* Category Filter Tabs & Search Bar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-serif font-black text-xl sm:text-2xl text-[#1C1A17] tracking-tight">
                    All Publications by Date
                  </h2>

                  <div className="relative w-36 sm:w-48">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-7 pr-2.5 py-1 rounded-full border border-[#DDD5C7] bg-[#FFFDFB] text-xs text-[#1C1A17] placeholder-[#8C8479] focus:border-[#1C1A17] outline-none"
                    />
                    <Search size={12} className="absolute left-2.5 top-1.5 text-[#8C8479] pointer-events-none" />
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {filterCategories.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 rounded-full text-xs font-sans font-medium whitespace-nowrap transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#1C1A17] border-[#1C1A17] text-[#FAF7F2] font-bold shadow-xs'
                            : 'bg-[#F4EFE6] border-[#DDD5C7] text-[#5C554B] hover:bg-[#EFE8DC]'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feed Items (CareerFoundry / Medium Layout by Dates) */}
              <div className="divide-y divide-[#EAE2D5]">
                {filteredItems.length === 0 ? (
                  <div className="py-16 text-center text-[#8C8479] space-y-2">
                    <BookOpen size={32} className="mx-auto text-[#DDD4C5]" />
                    <p className="font-serif font-bold text-base text-[#2B2723]">No matching publications found</p>
                    <button
                      onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                      className="px-4 py-1.5 rounded-full bg-[#1C1A17] text-[#FAF7F2] text-xs font-bold"
                    >
                      Reset filters
                    </button>
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const isSaved = bookmarkedIds.has(item.id);
                    const customClaps = clapsMap[item.id] ? item.claps + clapsMap[item.id] : item.claps;

                    return (
                      <article
                        key={item.id}
                        onClick={() => handleOpenItem(item.href)}
                        className="py-6 group cursor-pointer transition-colors"
                      >
                        {/* Header Byline */}
                        <div className="flex items-center gap-2 text-xs text-[#6E665C] mb-2">
                          <div className="w-4 h-4 rounded-full bg-[#B83A26] text-white text-[9px] flex items-center justify-center font-bold">
                            ➔
                          </div>
                          <span className="font-semibold text-[#1C1A17] truncate">
                            {item.publicationName || `In ${item.category}`}
                          </span>
                          <span>·</span>
                          <span className="text-[#8C8479] font-mono text-[11px]">{item.date}</span>
                        </div>

                        {/* Split: Left Text + Right Thumbnail */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-1.5 min-w-0">
                            <h3 className="font-serif font-bold text-base sm:text-lg text-[#1C1A17] group-hover:text-[#B83A26] transition-colors leading-snug line-clamp-2">
                              {item.title}
                            </h3>
                            <p className="text-xs sm:text-[13px] text-[#6E665C] line-clamp-2 leading-relaxed font-sans">
                              {item.subtitle || item.description}
                            </p>
                          </div>

                          {item.image && (
                            <div className="w-24 h-18 sm:w-28 sm:h-20 rounded-lg overflow-hidden bg-[#161513] shrink-0 border border-[#DDD5C7]">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            </div>
                          )}
                        </div>

                        {/* Footer Row */}
                        <div className="flex items-center justify-between pt-3 text-xs text-[#8C8479]">
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-[10px] text-[#8C8479]">
                              {item.readTime}
                            </span>
                            <button
                              onClick={(e) => handleClap(e, item.id)}
                              className="flex items-center gap-1 text-[#4A453E] hover:text-[#1C1A17] transition-colors cursor-pointer"
                            >
                              <span>👏</span>
                              <span className="font-mono text-xs">{customClaps}</span>
                            </button>
                            <div className="flex items-center gap-1 text-[#6E665C]">
                              <MessageSquare size={12} />
                              <span className="font-mono text-xs">{item.responses || 4}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => handleBookmarkToggle(e, item.id)}
                              className={`p-1 rounded-full transition-colors cursor-pointer ${
                                isSaved ? 'text-[#B83A26] bg-[#F4EFE6]' : 'text-[#8C8479] hover:text-[#1C1A17]'
                              }`}
                              title={isSaved ? "Saved" : "Save"}
                            >
                              <Bookmark size={14} className={isSaved ? "fill-[#B83A26]" : ""} />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>

            </div>

            {/* ───────────────────────────────────────────────────────────
                RIGHT COLUMN: DATES & TIME HIGHLIGHTS / TIMELINE (lg:col-span-3)
                ─────────────────────────────────────────────────────────── */}
            <aside className="lg:col-span-3 space-y-6 order-3">
              
              {/* Author Overview Card */}
              <div className="p-5 rounded-2xl bg-[#FFFDFB] border border-[#E8E1D5] shadow-xs space-y-3 text-center">
                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto border-2 border-[#1C1A17] shadow-xs">
                  <img
                    src="https://secxgzharggytkevlvmx.supabase.co/storage/v1/object/public/assets/about/lpb0j8p0xp7_1784136525170.png"
                    alt="Arun Pandian"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-[#1C1A17]">Arun Pandian</h4>
                  <p className="text-xs text-[#8C8479] font-mono">Data Analyst &amp; BI Engineer</p>
                </div>
                <p className="text-[11px] text-[#6E665C] leading-relaxed font-sans">
                  Crafting end-to-end data analytics solutions, Power BI dashboards, and high-throughput SQL pipelines.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#EFE9DF]">
                  <a
                    href="https://github.com/arun-pandian-p"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-[#F4EFE6] text-[#4A453E] hover:bg-[#EAE2D5] transition-colors"
                  >
                    <FaGithub size={14} />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-[#F4EFE6] text-[#1D4ED8] hover:bg-[#EAE2D5] transition-colors"
                  >
                    <FaLinkedin size={14} />
                  </a>
                  <Link
                    to="/admin/blogs"
                    className="p-2 rounded-lg bg-[#F4EFE6] text-[#4A453E] hover:bg-[#EAE2D5] transition-colors"
                    title="Studio"
                  >
                    <FileText size={14} />
                  </Link>
                </div>
              </div>

              {/* Date & Time Highlights Timeline Widget */}
              <div className="p-5 rounded-2xl bg-[#FFFDFB] border border-[#E8E1D5] shadow-xs space-y-4">
                <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-[#1C1A17] flex items-center gap-1.5 pb-2 border-b border-[#EFE9DF]">
                  <Calendar size={14} className="text-[#B83A26]" />
                  <span>Chronological Highlights</span>
                </h3>

                <div className="space-y-4">
                  {timelineDates.map(([period, items]) => (
                    <div key={period} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-[#2B2723]">
                        <span>{period}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F4EFE6] text-[#5C554B] border border-[#E2DAD0]">
                          {items.length} post{items.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <ul className="space-y-1 pl-2 border-l-2 border-[#E8E1D5] text-[11px] text-[#6E665C]">
                        {items.slice(0, 2).map((item) => (
                          <li
                            key={item.id}
                            onClick={() => handleOpenItem(item.href)}
                            className="truncate cursor-pointer hover:text-[#B83A26] transition-colors"
                            title={item.title}
                          >
                            • {item.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reading Stats Widget */}
              <div className="p-4 rounded-2xl bg-[#1C1A17] text-[#FAF7F2] space-y-2 border border-[#2D2A26]">
                <div className="flex items-center gap-2 text-[#F59E0B] font-mono text-xs font-bold">
                  <Flame size={14} />
                  <span>Journal Stats</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2 rounded-lg bg-[#2B2723]/90 border border-[#3D3832]">
                    <span className="text-[10px] text-[#A8A095] block font-mono">Total Stories</span>
                    <strong className="text-base font-serif">{allItems.length}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#2B2723]/90 border border-[#3D3832]">
                    <span className="text-[10px] text-[#A8A095] block font-mono">Avg Read</span>
                    <strong className="text-base font-serif">5 min</strong>
                  </div>
                </div>
              </div>

            </aside>

          </div>

        </section>

        {/* ═════════════════════════════════════════════════════════════════
            3. BOTTOM SECTION: "SURPRISE ME" & SOCIAL SHARE ACTION BAR
            ═════════════════════════════════════════════════════════════════ */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          
          {/* Left: Surprise Me Generator */}
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/30 text-blue-300 text-xs font-mono font-bold">
              <Dices size={13} />
              <span>Random Discovery</span>
            </div>
            <h3 className="font-serif font-bold text-lg sm:text-xl text-white">
              Can't decide which case study to read next?
            </h3>
            <p className="text-xs text-slate-400 max-w-md">
              Let the algorithm pick a random data architecture or visualization deep dive for you.
            </p>
          </div>

          {/* Action Buttons: Surprise Me & Share */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSurpriseMe}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold transition-all shadow-md hover:shadow-blue-500/20 cursor-pointer flex items-center gap-2"
            >
              <Shuffle size={14} />
              <span>Surprise Me</span>
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'Arun Pandian Data Journal', url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Journal link copied!', { icon: '🔗' });
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Share2 size={14} />
              <span>Share Journal</span>
            </button>

            <button
              onClick={() => setIsSubscribeOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Mail size={14} />
              <span>Subscribe</span>
            </button>
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
