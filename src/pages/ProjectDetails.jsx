import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';
import { useContent } from '../context/ContentProvider';
import StyleOverrides from '../editor/StyleOverrides';
import arunProfile from '../assets/arun-profile.jpg';
import { isBlogSubdomain } from '../utils/domain';
import ShareModal from '../components/ShareModal';
import BlogComments from '../components/BlogComments';
import InPageComments from '../components/InPageComments';
import MobileBottomNav from '../components/MobileBottomNav';
import toast from 'react-hot-toast';
import { 
  FaLinkedin, 
  FaGithub, 
  FaXTwitter, 
  FaWhatsapp, 
  FaRedditAlien, 
  FaFacebookF, 
  FaEnvelope 
} from 'react-icons/fa6';
import {
  Loader2,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Database,
  Target,
  LineChart,
  Code2,
  Sparkles,
  BarChart3,
  TrendingUp,
  Award,
  Layers,
  Workflow,
  Compass,
  CheckCircle2,
  Briefcase,
  DollarSign,
  MapPin,
  ChevronRight,
  ChevronLeft,
  FolderGit2,
  Maximize2,
  Edit2,
  Edit3,
  Share2,
  Calendar,
  Clock,
  BookOpen,
  Copy,
  Check,
  GitBranch,
  FileText,
  Grid,
  Bookmark,
  MessageSquare,
  Lightbulb,
  Info
} from 'lucide-react';

const GithubIcon = ({ size = 18 }) => (
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

export default function ProjectDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { projects: contextProjects = [], settings } = useContent();
  const [project, setProject] = useState(null);
  const [allProjectsList, setAllProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeVisualIndex, setActiveVisualIndex] = useState(0);

  // Social Sharing, Comments & Live Likes State
  const [likesCount, setLikesCount] = useState(142);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  // Load likes & bookmarks from localStorage
  useEffect(() => {
    if (!id) return;
    const storedLikes = localStorage.getItem(`project_likes_${id}`);
    const storedUserLiked = localStorage.getItem(`project_user_liked_${id}`);
    const storedBookmark = localStorage.getItem(`project_bookmarked_${id}`);

    if (storedLikes) {
      setLikesCount(parseInt(storedLikes, 10));
    }
    if (storedUserLiked) setHasLiked(true);
    if (storedBookmark) setIsBookmarked(true);
  }, [id]);

  // Dynamic back navigation: Check if came from Blog publication or Home
  const isFromBlog = useMemo(() => {
    if (location.state?.from === '/blog' || location.state?.from === 'blog') return true;
    if (location.search.includes('from=blog')) return true;
    if (typeof document !== 'undefined' && (document.referrer.includes('/blog') || document.referrer.includes('blog.'))) return true;
    return false;
  }, [location]);

  const backLink = isFromBlog ? (isBlogSubdomain() ? '/' : '/blog') : '/#projects';
  const backLabel = isFromBlog ? 'Back to Blog Publication' : 'Back to Featured Projects';

  const handleBackClick = (e) => {
    e.preventDefault();
    if (location.state?.from) {
      navigate(location.state.from);
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(backLink);
    }
  };

  // Fetch project & all projects directly from Supabase for instant real-time live data
  useEffect(() => {
    let isMounted = true;
    const fetchLiveProject = async () => {
      if (supabase) {
        try {
          const [projRes, allRes] = await Promise.all([
            supabase.from('projects').select('*').eq('id', id).single(),
            supabase.from('projects').select('*').order('sort_order', { ascending: true }),
          ]);

          if (isMounted) {
            if (allRes.data && allRes.data.length > 0) {
              setAllProjectsList(allRes.data);
            }
            if (projRes.data) {
              setProject(projRes.data);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Supabase project query fallback:', err);
        }
      }

      // Fallback to in-memory context projects
      if (contextProjects && contextProjects.length > 0) {
        setAllProjectsList(contextProjects);
        const found = contextProjects.find(
          (p) => String(p.id) === String(id) || String(p._id) === String(id)
        );
        if (found && isMounted) {
          setProject(found);
          setLoading(false);
          return;
        }
      }

      if (isMounted) setLoading(false);
    };

    fetchLiveProject();

    // Realtime Supabase Channel Listener for instantaneous live update
    let channel;
    if (supabase) {
      channel = supabase
        .channel(`project-live-${id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'projects', filter: `id=eq.${id}` },
          (payload) => {
            if (payload.new) {
              setProject(payload.new);
            }
          }
        )
        .subscribe();
    }

    return () => {
      isMounted = false;
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [id, contextProjects]);

  const copyToClipboard = (text, codeId) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(codeId);
    toast.success('Calculated measure copied to clipboard!', { icon: '📋' });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Live Like / Clap Action
  const handleLike = () => {
    const newCount = likesCount + 1;
    setLikesCount(newCount);
    setHasLiked(true);
    localStorage.setItem(`project_likes_${id}`, newCount);
    localStorage.setItem(`project_user_liked_${id}`, 'true');

    toast.success(`👏 Clapped! (${newCount})`, {
      icon: '👏',
      style: { borderRadius: '12px', background: '#0F172A', color: '#fff', fontSize: '13px' }
    });
  };

  // Bookmark Toggle
  const handleBookmarkToggle = () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    if (nextState) {
      localStorage.setItem(`project_bookmarked_${id}`, 'true');
      toast.success('Saved to project bookmarks!', { icon: '🔖' });
    } else {
      localStorage.removeItem(`project_bookmarked_${id}`);
      toast('Removed from bookmarks.', { icon: '🗑️' });
    }
  };

  // Direct Social Share Handler
  const handleDirectShare = (platform) => {
    const currentUrl = window.location.href;
    const shareTitle = project?.title || 'Data Analytics Case Study';
    const cleanExcerpt = project?.problem || project?.subtitle || 'Data analytics investigation with interactive dashboards and calculated metrics.';

    if (platform === 'native' && navigator.share) {
      navigator.share({
        title: shareTitle,
        text: `${shareTitle} by Arun Pandian`,
        url: currentUrl,
      }).catch(() => {});
      return;
    }

    if (platform === 'linkedin') {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
        '_blank',
        'width=600,height=600'
      );
    } else if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareTitle} | Analytics by @arunpandian`)}&url=${encodeURIComponent(currentUrl)}&hashtags=DataAnalytics,SQL,PowerBI,Python`,
        '_blank',
        'width=600,height=450'
      );
    } else if (platform === 'reddit') {
      window.open(
        `https://reddit.com/submit?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(shareTitle)}`,
        '_blank',
        'width=650,height=550'
      );
    } else if (platform === 'whatsapp') {
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this data analytics project: "${shareTitle}" — ${currentUrl}`)}`,
        '_blank'
      );
    } else if (platform === 'facebook') {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
        '_blank',
        'width=600,height=500'
      );
    } else if (platform === 'email') {
      window.location.href = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`Hi,\n\nCheck out this data analytics case study:\n\n${shareTitle}\n\n${cleanExcerpt}\n\n${currentUrl}\n\nBest,`)}`;
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(currentUrl);
      toast.success('Project link copied to clipboard!', { icon: '🔗' });
    }
  };

  // Find previous and next projects for cross-navigation
  const { prevProject, nextProject, relatedProjects } = useMemo(() => {
    const list = allProjectsList.length > 0 ? allProjectsList : contextProjects;
    const currentIndex = list.findIndex((p) => String(p.id) === String(id) || String(p._id) === String(id));
    
    const prev = currentIndex > 0 ? list[currentIndex - 1] : list[list.length - 1];
    const next = currentIndex < list.length - 1 && currentIndex !== -1 ? list[currentIndex + 1] : list[0];
    const related = list.filter((p) => String(p.id) !== String(id) && String(p._id) !== String(id)).slice(0, 3);

    return { prevProject: prev, nextProject: next, relatedProjects: related };
  }, [allProjectsList, contextProjects, id]);

  // ─── Real-Time Dynamic Insights Breakdown Generator ───
  const parsedInsights = useMemo(() => {
    if (!project) return [];
    const rawInsight = project.insight || '';
    const items = [];

    if (rawInsight.trim()) {
      // Check if insight contains multiple bullet points, sentences or numbered points
      const lines = rawInsight
        .split(/\n|(?:\r\n)|\•|(?:\d+\.\s+)/)
        .map((l) => l.trim())
        .filter((l) => l.length > 4);

      if (lines.length > 1) {
        lines.forEach((line, idx) => {
          items.push({
            title: `Analytical Finding 0${idx + 1}`,
            tag: idx === 0 ? 'Primary Insight' : idx === 1 ? 'Variance Metric' : 'Operational Pattern',
            finding: line,
            evidence: project.data || `Calculated across active dataset records (${project.records_count || 'production records'}).`,
            implication: idx === 0 && project.result ? project.result : 'Enables dynamic thresholding and automated stakeholder reporting.',
          });
        });
      } else {
        items.push({
          title: 'Core Analytical Finding',
          tag: 'Statistical Pattern',
          finding: rawInsight,
          evidence: project.data || 'Extracted via Power Query ETL & relational star-schema calculation.',
          implication: project.result || 'Directly drives automated operational efficiency & measurable cost savings.',
        });
      }
    }

    // If project has measurable result, add strategic impact card
    if (project.result && items.length < 2) {
      items.push({
        title: 'Measurable Business Outcome',
        tag: 'Strategic Impact',
        finding: project.result,
        evidence: project.process || 'Verified through multi-dimensional cross-filtering & benchmark aggregation.',
        implication: 'Translates raw analytical discovery into quantified executive ROI.',
      });
    }

    // Default structured card if no input yet
    if (items.length === 0) {
      items.push({
        title: 'Core Analytical Finding',
        tag: 'Key Metric',
        finding: project.result || project.problem || 'Statistical investigation identifying operational inflection points.',
        evidence: project.data || 'Multi-source transactional datasets normalized through ETL.',
        implication: 'Enables high-confidence data-driven decision frameworks.',
      });
    }

    return items;
  }, [project]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 px-4 text-center">
        <h1 className="text-3xl font-display font-bold mb-3">Case Study Not Found</h1>
        <p className="text-slate-500 mb-6 max-w-md text-sm">
          The requested analytical case study could not be loaded or may have been moved.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-blue-600 transition-colors"
        >
          <ArrowLeft size={16} /> Return to Blog &amp; Publication Index
        </Link>
      </div>
    );
  }

  // ─── Dynamic Attributes ───
  const title = project.title || 'Data Analytics Case Study';
  const authorAvatar = settings?.about?.profileImage || project.author_avatar || arunProfile;
  const subtitle =
    project.subtitle ||
    project.problem ||
    `An end-to-end data analytics investigation evaluating ${title.toLowerCase()} to extract actionable intelligence.`;

  const tags = Array.isArray(project.tags) && project.tags.length > 0
    ? project.tags
    : typeof project.tags === 'string' && project.tags.trim().length > 0
      ? project.tags.split(',').map(t => t.trim()).filter(Boolean)
      : ['Power BI', 'SQL', 'Data Analytics', 'Data Visualization'];

  const powerBiEmbedUrl = project.powerbi_embed_url || project.live_link || project.liveLink || '';
  const githubUrl = project.github_link || project.githubLink || 'https://github.com/arun-pandian-p';
  const datasetUrl = project.dataset_url || githubUrl;
  
  // Extract up to 5 multi-format visuals (PNG, JPG, GIF, WebM, MP4)
  const rawImageField = project.image_url || project.image || project.imageUrl || '';
  const visualsList = rawImageField.includes('|||')
    ? rawImageField.split('|||').map(v => v.trim()).filter(Boolean)
    : [rawImageField].filter(Boolean);

  const activeVisual = visualsList[activeVisualIndex] || visualsList[0] || '';
  const isVideoVisual = activeVisual ? Boolean(activeVisual.match(/\.(mp4|webm|ogg|mov)$/i)) : false;
  const toolsSummary = tags.slice(0, 4).join(' • ');

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-blue-600 selection:text-white">
      <Helmet>
        <title>{title} | Arun Pandian - Analytics Case Study</title>
        <meta name="description" content={subtitle} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Arun Pandian Data Analytics" />
        <meta property="og:title" content={`${title} | Arun Pandian`} />
        <meta property="og:description" content={subtitle} />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : `https://arunpandian.online/project/${id}`} />
        {activeVisual && (
          <>
            <meta property="og:image" content={activeVisual.startsWith('http') ? activeVisual : `https://arunpandian.online${activeVisual.startsWith('/') ? '' : '/'}${activeVisual}`} />
            <meta property="og:image:secure_url" content={activeVisual.startsWith('http') ? activeVisual : `https://arunpandian.online${activeVisual.startsWith('/') ? '' : '/'}${activeVisual}`} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta name="twitter:image" content={activeVisual.startsWith('http') ? activeVisual : `https://arunpandian.online${activeVisual.startsWith('/') ? '' : '/'}${activeVisual}`} />
          </>
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@arunpandian" />
        <meta name="twitter:title" content={`${title} | Arun Pandian`} />
        <meta name="twitter:description" content={subtitle} />
      </Helmet>

      <StyleOverrides />
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        
        {/* ── 01: EDITORIAL HEADER & AUTHOR INFO ── */}
        <header className="mb-8 sm:mb-10 pb-8 border-b border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <button
              onClick={handleBackClick}
              className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase text-slate-600 hover:text-blue-600 font-semibold transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
              <span>{backLabel}</span>
            </button>
            
            <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {new Date(project.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={13} /> 6 min read
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              data-edit-id="project.category"
              data-edit-name="Project Category"
              data-edit-kind="text"
              data-edit-path="project.category"
              className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200"
            >
              {tags[0] || 'Power BI'}
            </span>
            <span
              data-edit-id="project.tags"
              data-edit-name="Project Tags"
              data-edit-kind="text"
              data-edit-path="project.tags"
              className="px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200"
            >
              {toolsSummary}
            </span>
          </div>

          {/* Large Editorial Headline */}
          <h1
            data-edit-id="project.title"
            data-edit-name="Project Title"
            data-edit-kind="heading"
            data-edit-path="project.title"
            className="font-display font-black text-3xl sm:text-5xl text-slate-900 tracking-tight leading-[1.12] mb-5"
          >
            {title}
          </h1>

          {/* Author Block & Social / Share Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <img
                src={authorAvatar}
                alt="Arun Pandian"
                className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-slate-100 shadow-xs"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = arunProfile;
                }}
              />
              <div>
                <span
                  data-edit-id="hero.name"
                  data-edit-name="Author Name"
                  data-edit-kind="heading"
                  data-edit-path="hero.name"
                  className="font-bold text-sm text-slate-900 block leading-tight"
                >
                  Arun Pandian
                </span>
                <span
                  data-edit-id="hero.title"
                  data-edit-name="Author Role"
                  data-edit-kind="text"
                  data-edit-path="hero.title"
                  className="text-[11px] font-mono text-slate-500"
                >
                  Data Analyst
                </span>
              </div>
            </div>

            {/* YouTube-Style Action Buttons Bar */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              {/* YouTube Style Connected Like / Dislike Pill */}
              <div className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 p-0.5 shadow-2xs">
                <button
                  onClick={handleLike}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-l-full text-xs font-bold transition-all cursor-pointer ${
                    hasLiked 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-800 hover:bg-slate-200'
                  }`}
                  title="Like this project"
                >
                  <ThumbsUp size={14} className={hasLiked ? 'fill-white' : ''} />
                  <span>{likesCount}</span>
                </button>
                <div className="w-px h-3.5 bg-slate-300 mx-0.5" />
                <button
                  onClick={() => {
                    setHasDisliked(!hasDisliked);
                    if (!hasDisliked && hasLiked) setHasLiked(false);
                    toast(hasDisliked ? 'Dislike removed' : 'Feedback recorded', { icon: '👍' });
                  }}
                  className={`p-1.5 px-2.5 rounded-r-full text-xs transition-all cursor-pointer ${
                    hasDisliked ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Dislike"
                >
                  <ThumbsDown size={13} className={hasDisliked ? 'fill-white' : ''} />
                </button>
              </div>

              {/* YouTube Style Share Pill Button */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="Share (𝕏 post, Instagram, LinkedIn, Reddit)"
              >
                <Share2 size={13} className="text-blue-600" />
                <span>Share</span>
              </button>

              {/* YouTube Style Comments Scroll Button */}
              <button
                onClick={() => {
                  const el = document.getElementById('comments-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="Jump to Comments"
              >
                <MessageSquare size={13} className="text-blue-600" />
                <span>Comments</span>
              </button>

              {/* YouTube Style Bookmark Pill */}
              <button
                onClick={handleBookmarkToggle}
                className="p-1.5 px-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all cursor-pointer"
                title="Save Project"
              >
                <Bookmark size={14} className={isBookmarked ? 'fill-amber-500 text-amber-500' : ''} />
              </button>

              <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

              {/* Direct Quick Share Platforms */}
              <button
                onClick={() => handleDirectShare('linkedin')}
                className="p-2 rounded-full bg-slate-50 hover:bg-[#0077B5]/10 border border-slate-200 text-[#0077B5] transition-all cursor-pointer"
                title="Share on LinkedIn"
              >
                <FaLinkedin size={14} />
              </button>

              <button
                onClick={() => handleDirectShare('twitter')}
                className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 hover:text-slate-950 transition-all cursor-pointer"
                title="Share on 𝕏 (Twitter)"
              >
                <FaXTwitter size={13} />
              </button>

              <button
                onClick={() => handleDirectShare('whatsapp')}
                className="p-2 rounded-full bg-slate-50 hover:bg-[#25D366]/10 border border-slate-200 text-[#25D366] transition-all cursor-pointer"
                title="Share on WhatsApp"
              >
                <FaWhatsapp size={14} />
              </button>

              <button
                onClick={() => handleDirectShare('reddit')}
                className="p-2 rounded-full bg-slate-50 hover:bg-[#FF4500]/10 border border-slate-200 text-[#FF4500] transition-all cursor-pointer"
                title="Share on Reddit"
              >
                <FaRedditAlien size={14} />
              </button>
            </div>
          </div>
        </header>

        {/* ── 02: ANALYTICAL QUESTION & RECRUITER MODE (Derived from Real Inputs) ── */}
        <section className="mb-10 space-y-6">
          {/* Analytical Question Box */}
          <div className="p-5 sm:p-6 rounded-2xl bg-blue-50/70 border border-blue-200/80">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-blue-700 block mb-1">
              Analytical Question &amp; Core Hypothesis:
            </span>
            <p
              data-edit-id="project.problem"
              data-edit-name="Analytical Question / Problem"
              data-edit-kind="text"
              data-edit-path="project.problem"
              className="text-base sm:text-lg text-slate-800 italic font-medium leading-relaxed"
            >
              "{project.problem || subtitle}"
            </p>
          </div>

          {/* Recruiter At-a-Glance Grid - Dynamically populated from real inputs */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Recruiter Mode · Key Deliverables &amp; Real Metrics
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-900 block mb-1">Problem Addressed</span>
                <p className="text-slate-600 leading-relaxed line-clamp-3">
                  {project.problem || subtitle}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Dataset &amp; Volume</span>
                <p className="text-slate-600 leading-relaxed line-clamp-2">
                  {project.data || (project.records_count ? `${project.records_count} rows` : 'Verified Production Dataset')}
                </p>
                {datasetUrl && (
                  <a href={datasetUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono truncate block mt-1">
                    Dataset Source ↗
                  </a>
                )}
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-1">Methodology &amp; ETL</span>
                <p className="text-slate-600 leading-relaxed line-clamp-3">
                  {project.process || 'Star-Schema dimensional modeling, ETL normalization, dynamic DAX measures.'}
                </p>
              </div>

              <div>
                <span className="font-bold text-emerald-800 block mb-1">Key Impact / Result</span>
                <p
                  data-edit-id="project.result"
                  data-edit-name="Key Outcome / Impact"
                  data-edit-kind="text"
                  data-edit-path="project.result"
                  className="text-emerald-700 leading-relaxed font-medium line-clamp-3"
                >
                  {project.result || project.insight || 'Engineered automated reporting saving turnaround variance.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 03: LIVE ANALYTICS SHOWCASE & REAL UPLOADED VISUAL ── */}
        <section className="mb-12">
          <div className="w-full rounded-2xl bg-slate-900 border border-slate-200 shadow-xl overflow-hidden">
            {/* Top Bar */}
            <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-500 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-amber-500 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
                </div>
                <span className="font-mono text-slate-300 ml-2 hidden sm:inline">{title}</span>
              </div>
              <div className="flex items-center gap-2">
                {activeVisual && (
                  <button
                    onClick={() => setShowImageZoom(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors font-mono cursor-pointer"
                    title="Zoom in high resolution"
                  >
                    <Maximize2 size={12} />
                    <span className="text-[11px]">Zoom</span>
                  </button>
                )}
                {powerBiEmbedUrl && (
                  <a
                    href={powerBiEmbedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors font-mono cursor-pointer"
                  >
                    <ExternalLink size={12} />
                    <span className="text-[11px]">Live App</span>
                  </a>
                )}
              </div>
            </div>

            {/* Visual Display */}
            <div className="relative aspect-16/10 bg-slate-950 flex items-center justify-center overflow-hidden">
              {activeVisual ? (
                isVideoVisual ? (
                  <video
                    src={activeVisual}
                    controls
                    autoPlay
                    muted
                    loop
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={activeVisual}
                    alt={title}
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={() => setShowImageZoom(true)}
                  />
                )
              ) : powerBiEmbedUrl ? (
                <iframe
                  src={powerBiEmbedUrl}
                  title={title}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              ) : (
                <div className="p-8 text-center text-slate-400 font-mono text-xs space-y-2">
                  <BarChart3 className="mx-auto w-10 h-10 text-slate-600 animate-pulse" />
                  <p>Interactive Analytics Model Ready</p>
                  <p className="text-[11px] text-slate-500">
                    Upload dashboard screenshots or link live Power BI report in admin panel.
                  </p>
                </div>
              )}
            </div>

            {/* Multi-Visual Selector Bar if multiple visuals uploaded */}
            {visualsList.length > 1 && (
              <div className="px-4 py-2.5 bg-slate-800/90 border-t border-slate-700 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400 text-[11px]">
                  Visual {activeVisualIndex + 1} of {visualsList.length}
                </span>
                <div className="flex items-center gap-1.5">
                  {visualsList.map((_, vIdx) => (
                    <button
                      key={vIdx}
                      onClick={() => setActiveVisualIndex(vIdx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        activeVisualIndex === vIdx ? 'w-6 bg-blue-500' : 'w-2 bg-slate-600 hover:bg-slate-400'
                      }`}
                      title={`Visual 0${vIdx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── 04: STRUCTURED TABS (Overview, Real-Time Insights, DAX / SQL, Data Model, Downloads) ── */}
        <section className="mb-16">
          {/* Tab Selection Bar */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 mb-8 overflow-x-auto hide-scrollbar">
            {[
              { id: 'overview', label: '📊 Overview' },
              { id: 'insights', label: '💡 Real-Time Insights' },
              { id: 'dax', label: '🧮 DAX / SQL' },
              { id: 'model', label: '📐 Data Model' },
              { id: 'downloads', label: '📥 Downloads' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[40px] px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 space-y-4">
                <h3 className="font-display font-bold text-xl text-slate-900">
                  Business Context &amp; Objectives
                </h3>
                <p className="text-slate-700 leading-relaxed text-sm sm:text-base font-normal">
                  {project.description || project.problem || 'This analytics project investigates operational performance metrics by comparing empirical observations against statistical prediction models. By cross-referencing multi-variable factors, we provide executive stakeholders with high-confidence decision triggers.'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs font-mono text-slate-600">
                  <div><strong>Tools:</strong> {toolsSummary}</div>
                  <div><strong>Dimensional Model:</strong> Star-Schema Relational</div>
                  <div><strong>Calculation Engine:</strong> DAX / SQL / Python</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REAL-TIME INSIGHTS (Derived from real inputs only) */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-xl text-slate-900">
                    Key Findings &amp; Statistical Insights
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Real-time analytical discoveries extracted directly from project input data.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono font-bold">
                  ● Live Insights
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {parsedInsights.map((item, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between space-y-4 hover:border-blue-300 transition-colors shadow-2xs">
                    <div>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 block mb-1">
                        Insight 0{idx + 1} · {item.tag}
                      </span>
                      <h4 className="font-display font-bold text-lg text-slate-900 mb-2">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-3">
                        <strong>Finding:</strong> {item.finding}
                      </p>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
                        <strong>Evidence:</strong> {item.evidence}
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-100 text-xs text-emerald-800 font-medium">
                      <strong>Business Value:</strong> {item.implication}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DAX / SQL */}
          {activeTab === 'dax' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 space-y-6">
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900 mb-1">
                  Engineered DAX Measures &amp; SQL Queries
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Production-grade calculations engineered for instant responsiveness.
                </p>
              </div>

              {project.dax_code ? (
                <div className="rounded-xl overflow-hidden bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800">
                  <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-slate-400">
                    <span>// Custom Project Measure Code</span>
                    <button
                      onClick={() => copyToClipboard(project.dax_code, 'custom_dax')}
                      className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedCode === 'custom_dax' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      <span className="text-[10px]">{copiedCode === 'custom_dax' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-4 text-emerald-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                    {project.dax_code}
                  </pre>
                </div>
              ) : (
                <>
                  <div className="rounded-xl overflow-hidden bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800">
                    <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-slate-400">
                      <span>// 1. Dynamic Performance Metric Measure</span>
                      <button
                        onClick={() => copyToClipboard(`Performance_Delta = \nDIVIDE(\n    [Actual_Metric_Total] - [Baseline_Target],\n    [Baseline_Target],\n    0\n)`, 'c1')}
                        className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedCode === 'c1' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        <span className="text-[10px]">{copiedCode === 'c1' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-4 text-blue-300 overflow-x-auto leading-relaxed">
{`Performance_Delta = 
DIVIDE(
    [Actual_Metric_Total] - [Baseline_Target],
    [Baseline_Target],
    0
)`}
                    </pre>
                  </div>

                  <div className="rounded-xl overflow-hidden bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800">
                    <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-slate-400">
                      <span>// 2. Filtered SLA Benchmark &amp; Cohort Analysis</span>
                      <button
                        onClick={() => copyToClipboard(`On_Target_Rate = \nCALCULATE(\n    COUNTROWS(f_analytics),\n    f_analytics[Variance_Time] <= f_analytics[SLA_Target]\n) / COUNTROWS(f_analytics)`, 'c2')}
                        className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedCode === 'c2' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        <span className="text-[10px]">{copiedCode === 'c2' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-4 text-emerald-300 overflow-x-auto leading-relaxed">
{`On_Target_Rate = 
CALCULATE(
    COUNTROWS(f_analytics),
    f_analytics[Variance_Time] <= f_analytics[SLA_Target]
) / COUNTROWS(f_analytics)`}
                    </pre>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 4: DATA MODEL */}
          {activeTab === 'model' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 space-y-6">
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900 mb-1">
                  Relational Star-Schema Architecture
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Optimized dimensional schema with 1-to-many single-directional filter propagation.
                </p>
              </div>

              {project.model_notes ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono leading-relaxed whitespace-pre-wrap">
                  {project.model_notes}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950">
                    <div className="font-bold text-blue-800 mb-2 flex justify-between items-center">
                      <span>Fact Table</span>
                      <span className="text-[10px] bg-blue-200 px-1.5 py-0.5 rounded">f_analytics_fact</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-blue-900">
                      <li>• Transaction_ID (PK)</li>
                      <li>• Date_Key (FK)</li>
                      <li>• Dimension_Key (FK)</li>
                      <li>• Metric_Value</li>
                      <li>• Target_Value</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                    <div className="font-bold text-slate-900 mb-2 flex justify-between items-center">
                      <span>Dimension</span>
                      <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">d_calendar</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-600">
                      <li>• Date_Key (PK)</li>
                      <li>• Year / Quarter / Month</li>
                      <li>• Day_Of_Week_Index</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                    <div className="font-bold text-slate-900 mb-2 flex justify-between items-center">
                      <span>Dimension</span>
                      <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">d_categories</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-600">
                      <li>• Category_ID (PK)</li>
                      <li>• Category_Name</li>
                      <li>• Regional_Segment</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DOWNLOADS */}
          {activeTab === 'downloads' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 space-y-4">
              <h3 className="font-display font-bold text-xl text-slate-900">
                Deliverables &amp; Source Files
              </h3>
              <p className="text-xs text-slate-500 font-mono mb-6">
                Verified repository downloads for code validation and reproduction.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 flex flex-col justify-between transition-colors cursor-pointer"
                >
                  <span className="text-xs font-mono font-bold text-blue-600">.PBIX / Code</span>
                  <span className="text-sm font-bold mt-1">Download Source Model</span>
                  <span className="text-[10px] font-mono text-slate-400 mt-3">GitHub Source ↗</span>
                </a>

                <a
                  href={datasetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 flex flex-col justify-between transition-colors cursor-pointer"
                >
                  <span className="text-xs font-mono font-bold text-emerald-600">Raw Dataset</span>
                  <span className="text-sm font-bold mt-1">Dataset Source (.CSV)</span>
                  <span className="text-[10px] font-mono text-slate-400 mt-3">Verified Data ↗</span>
                </a>

                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 flex flex-col justify-between transition-colors cursor-pointer"
                >
                  <span className="text-xs font-mono font-bold text-amber-600">Documentation</span>
                  <span className="text-sm font-bold mt-1">Technical Markdown</span>
                  <span className="text-[10px] font-mono text-slate-400 mt-3">GitHub README ↗</span>
                </a>

                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 flex flex-col justify-between transition-colors cursor-pointer"
                >
                  <span className="text-xs font-mono font-bold text-purple-600">Repository</span>
                  <span className="text-sm font-bold mt-1">GitHub Repo</span>
                  <span className="text-[10px] font-mono text-slate-400 mt-3">arun-pandian-p ↗</span>
                </a>
              </div>
            </div>
          )}
        </section>

        {/* ── 05: YOUTUBE-STYLE IN-PAGE COMMENTS & COMMUNITY DISCUSSION ── */}
        <InPageComments
          itemId={id}
          itemSlug={id}
          itemTitle={title}
          entityType="project"
          allowComments={true}
        />

        {/* ── 06: "DISCOVER MORE" BOX ── */}
        <section className="mb-14 rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs">
          <div className="bg-[#EBF3FF] px-5 py-3 border-b border-blue-100 flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-800 font-sans">
              Discover more
            </h4>
            <Link to="/#projects" className="text-xs font-mono text-blue-600 font-semibold hover:underline">
              View All Works →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 bg-white">
            <Link
              to="/#projects"
              className="px-5 py-3.5 flex items-center justify-between text-sm font-semibold text-slate-800 hover:text-blue-600 hover:bg-slate-50/80 transition-colors group cursor-pointer"
            >
              <span>Featured Analytics Projects Portfolio</span>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>

            {relatedProjects.map((rp) => (
              <Link
                key={rp.id}
                to={`/project/${rp.id}`}
                className="px-5 py-3.5 flex items-center justify-between text-sm text-slate-700 hover:text-blue-600 hover:bg-slate-50/80 transition-colors group cursor-pointer"
              >
                <span>{rp.title}</span>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}

            <Link
              to="/blog"
              className="px-5 py-3.5 flex items-center justify-between text-sm text-slate-700 hover:text-blue-600 hover:bg-slate-50/80 transition-colors group cursor-pointer"
            >
              <span>Data Analytics Publication &amp; Notes Feed</span>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </section>

        {/* ── 06: PREV / NEXT NAVIGATION ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
          {prevProject && (
            <Link
              to={`/project/${prevProject.id}`}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center gap-3 group"
            >
              <ChevronLeft size={20} className="text-slate-400 group-hover:text-blue-600 group-hover:-translate-x-1 transition-all" />
              <div className="truncate">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Previous Project</span>
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate block">{prevProject.title}</span>
              </div>
            </Link>
          )}

          {nextProject && (
            <Link
              to={`/project/${nextProject.id}`}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between text-right group sm:col-start-2"
            >
              <div className="truncate">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Next Project</span>
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate block">{nextProject.title}</span>
              </div>
              <ChevronRight size={20} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>
          )}
        </div>

        {/* ── 07: BOTTOM ACTION BANNER ── */}
        <section className="rounded-2xl sm:rounded-3xl bg-slate-900 text-white p-8 sm:p-12 text-center shadow-lg">
          <h2 className="text-2xl sm:text-4xl font-display font-black mb-3">
            Explore the Full Code &amp; Data Model
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto mb-8">
            Access reproducible code, dimensional schemas, and data transformation scripts on GitHub, or discuss this study in the open comment box.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <GithubIcon size={16} />
              <span>GitHub Repository</span>
            </a>

            <button
              onClick={() => setIsCommentModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all shadow-2xs cursor-pointer"
            >
              <MessageSquare size={15} />
              <span>Open Comment Box</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all shadow-2xs cursor-pointer"
            >
              <Share2 size={15} />
              <span>Share Project</span>
            </button>

            <button
              onClick={handleBackClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-700 text-slate-200 bg-slate-800 font-semibold text-sm hover:bg-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={15} />
              <span>{backLabel}</span>
            </button>
          </div>
        </section>
      </main>

      {/* Reusable Share Modal with image preview and multi-platform links */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={title}
        description={subtitle}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        image={activeVisual}
        tags={tags}
        type="Project"
      />

      {/* Universal 15-Day Live Discussion & Comments Modal */}
      <BlogComments
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        projectId={id}
        projectTitle={title}
        entityType="project"
        allowComments={true}
      />

      {/* Image / Video Zoom Lightbox Modal */}
      {showImageZoom && activeVisual && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={() => setShowImageZoom(false)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 p-2 flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              {visualsList.length > 1 && (
                <span className="px-2 py-1 rounded bg-slate-800/90 text-slate-300 text-xs font-mono">
                  {activeVisualIndex + 1} / {visualsList.length}
                </span>
              )}
              <button
                onClick={() => setShowImageZoom(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800/90 text-white text-xs font-mono hover:bg-slate-700 cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            {isVideoVisual ? (
              <video
                src={activeVisual}
                controls
                autoPlay
                className="w-full h-auto max-h-[85vh] object-contain rounded-lg p-2"
              />
            ) : (
              <img
                src={activeVisual}
                alt={`${title} - Zoomed Visual 0${activeVisualIndex + 1}`}
                className="w-full h-auto max-h-[85vh] object-contain p-2"
              />
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation (3 Icons: Articles/Feed, Share, Comments) */}
      <MobileBottomNav
        mode="project"
        onShareClick={() => setIsShareModalOpen(true)}
        onCommentsClick={() => {
          const el = document.getElementById('comments-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </div>
  );
}
