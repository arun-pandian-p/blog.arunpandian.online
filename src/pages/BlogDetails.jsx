import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabaseClient';
import { useContent } from '../context/ContentProvider';
import Navbar from '../components/Navbar';
import StyleOverrides from '../editor/StyleOverrides';
import arunProfile from '../assets/arun-profile.jpg';
import { parseArticleMetadata, extractHeadings } from '../utils/blogParser';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  CheckCircle,
  Database,
  BarChart3,
  Layers,
  Code2,
  Cpu,
  Loader2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Maximize2,
  Edit2,
  Share2,
  Calendar,
  Clock,
  BookOpen,
  Copy,
  Check,
  GitBranch,
  FileText,
  Grid,
  Sparkles,
  Bookmark,
  MessageSquare,
  List,
  AlertCircle,
  Info,
  Lightbulb,
  AlertTriangle,
  Play,
  Pause,
  Mail,
  TrendingUp,
  Tag,
  Star,
  Flame,
  MoreVertical,
  Volume2,
  VolumeX,
  Printer,
  Terminal,
  RefreshCw
} from 'lucide-react';
import { 
  FaLinkedin, 
  FaGithub, 
  FaXTwitter, 
  FaWhatsapp, 
  FaRedditAlien, 
  FaFacebookF, 
  FaEnvelope, 
  FaMedium 
} from 'react-icons/fa6';
import toast from 'react-hot-toast';

// Custom SVG Github Icon
const GithubIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function BlogDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { blogs: contextBlogs = [], projects: contextProjects = [], settings } = useContent();

  const [blog, setBlog] = useState(null);
  const [allBlogsList, setAllBlogsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeHeadingId, setActiveHeadingId] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Audio Text-to-Speech listening player state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Interactive In-Article Code Snippet Editor states
  const [editableCodeSnippets, setEditableCodeSnippets] = useState({});
  const [activeSnippetTab, setActiveSnippetTab] = useState({}); // { [codeId]: 'code' | 'output' }

  // Medium-style Likes / Claps & Bookmark state
  const [likesCount, setLikesCount] = useState(484);
  const [hasLiked, setHasLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Load from localStorage
  useEffect(() => {
    if (!slug) return;
    const storedLikes = localStorage.getItem(`blog_likes_${slug}`);
    const storedUserLiked = localStorage.getItem(`blog_user_liked_${slug}`);
    const storedBookmark = localStorage.getItem(`blog_bookmarked_${slug}`);
    const storedFollowing = localStorage.getItem('author_following_state');

    if (storedLikes) {
      setLikesCount(parseInt(storedLikes, 10));
    }
    if (storedUserLiked) setHasLiked(true);
    if (storedBookmark) setIsBookmarked(true);
    if (storedFollowing) setIsFollowing(true);
  }, [slug]);

  // Fetch blog directly from Supabase
  useEffect(() => {
    let isMounted = true;
    const fetchLiveBlog = async () => {
      if (supabase) {
        try {
          const [blogRes, allRes] = await Promise.all([
            supabase
              .from('blogs')
              .select('*')
              .or(`slug.eq.${slug},id.eq.${slug}`)
              .single(),
            supabase.from('blogs').select('*').order('created_at', { ascending: false }),
          ]);

          if (isMounted) {
            if (allRes.data && allRes.data.length > 0) {
              setAllBlogsList(allRes.data);
            }
            if (blogRes.data) {
              setBlog(blogRes.data);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.error('Supabase blog fetch fallback:', err);
        }
      }

      if (contextBlogs && contextBlogs.length > 0) {
        setAllBlogsList(contextBlogs);
        const found = contextBlogs.find(
          (b) => String(b.slug) === String(slug) || String(b.id) === String(slug)
        );
        if (found && isMounted) {
          setBlog(found);
          setLoading(false);
          return;
        }
      }

      if (isMounted) setLoading(false);
    };

    fetchLiveBlog();
    return () => {
      isMounted = false;
    };
  }, [slug, contextBlogs]);

  // Track scroll reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parse metadata and clean content
  const { cleanContent, meta } = useMemo(() => {
    return parseArticleMetadata(blog);
  }, [blog]);

  // Extract table of contents headings
  const headings = useMemo(() => {
    return extractHeadings(cleanContent);
  }, [cleanContent]);

  // ScrollSpy to highlight active heading in TOC
  useEffect(() => {
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0% -60% 0%', threshold: 0.1 }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const copyToClipboard = (text, codeId) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(codeId);
    toast.success('Snippet copied to clipboard!', { icon: '📋' });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Text-To-Speech Listen Audio Toggle
  const toggleSpeechAudio = () => {
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-speech audio not supported on this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      toast('Audio narration paused.', { icon: '⏸️' });
    } else {
      window.speechSynthesis.cancel();
      const plainText = cleanContent.replace(/[#*`>-]/g, '').substring(0, 1200);
      const utterance = new SpeechSynthesisUtterance(`${title}. ${plainText}`);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
      toast.success('Playing audio narration...', { icon: '🔊' });
    }
  };

  // Medium-style Clap / Like Handler
  const handleLike = () => {
    const newCount = likesCount + 1;
    setLikesCount(newCount);
    setHasLiked(true);

    localStorage.setItem(`blog_likes_${slug}`, newCount);
    localStorage.setItem(`blog_user_liked_${slug}`, 'true');

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
      localStorage.setItem(`blog_bookmarked_${slug}`, 'true');
      toast.success('Saved to your reading list!', { icon: '🔖' });
    } else {
      localStorage.removeItem(`blog_bookmarked_${slug}`);
      toast('Removed from reading list.', { icon: '🗑️' });
    }
  };

  // Follow Author Toggle
  const handleFollowToggle = () => {
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    if (nextState) {
      localStorage.setItem('author_following_state', 'true');
      toast.success('Following Arun Pandian! You will receive future insights.', { icon: '✨' });
    } else {
      localStorage.removeItem('author_following_state');
      toast('Unfollowed.', { icon: '👋' });
    }
  };

  // Share Functionality
  const handleShare = (platform) => {
    const currentUrl = window.location.href;
    const shareTitle = blog?.title || 'Data Analytics Article & Investigation';
    const authorHandle = 'arunpandian';

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
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareTitle} by @${authorHandle}`)}&url=${encodeURIComponent(currentUrl)}&hashtags=DataAnalytics,SQL,PowerBI,Python`,
        '_blank',
        'width=600,height=450'
      );
    } else if (platform === 'whatsapp') {
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this study: "${shareTitle}" — ${currentUrl}`)}`,
        '_blank'
      );
    } else if (platform === 'reddit') {
      window.open(
        `https://reddit.com/submit?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(shareTitle)}`,
        '_blank'
      );
    } else if (platform === 'facebook') {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
        '_blank',
        'width=600,height=500'
      );
    } else if (platform === 'email') {
      window.location.href = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`Hi,\n\nCheck out this data study:\n\n${shareTitle}\n${currentUrl}\n\nBest,`)}`;
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      toast.success('Link copied to clipboard!', { icon: '🔗' });
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Featured and Recent Posts
  const { featuredPosts, recentPosts, prevBlog, nextBlog } = useMemo(() => {
    const list = allBlogsList.length > 0 ? allBlogsList : contextBlogs;
    const currentIndex = list.findIndex(
      (b) => String(b.slug) === String(slug) || String(b.id) === String(slug)
    );

    const prev = currentIndex > 0 ? list[currentIndex - 1] : list[list.length - 1];
    const next = currentIndex < list.length - 1 && currentIndex !== -1 ? list[currentIndex + 1] : list[0];
    
    const featured = list.filter((b) => b.featured && String(b.slug) !== String(slug)).slice(0, 3);
    const fallbackFeatured = featured.length > 0 ? featured : list.filter((b) => String(b.slug) !== String(slug)).slice(0, 3);
    const recent = list.filter((b) => String(b.slug) !== String(slug)).slice(0, 5);

    return { 
      featuredPosts: fallbackFeatured, 
      recentPosts: recent, 
      prevBlog: prev, 
      nextBlog: next 
    };
  }, [allBlogsList, contextBlogs, slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 px-4 text-center">
        <h1 className="text-3xl font-display font-bold mb-3">Article Not Found</h1>
        <p className="text-slate-500 mb-6 max-w-md text-sm">
          The requested data publication or blog post could not be loaded.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-blue-600 transition-colors"
        >
          <ArrowLeft size={16} /> Return to Blog Index
        </Link>
      </div>
    );
  }

  // ─── Dynamic Attributes ───
  const title = blog.title || 'The Medallion Architecture Reconsidered: What It Solved, and Where It\'s Cracking';
  const excerpt = blog.excerpt || blog.summary || 'Rethinking Bronze, Silver, and Gold for the AI era.';
  const authorName = blog.author_name || settings?.about?.name || 'Arun Pandian';
  const authorRole = settings?.about?.role || 'Data Analyst';
  const authorAvatar =
    blog.author_avatar ||
    settings?.about?.profileImage ||
    arunProfile;
  const authorBio =
    settings?.about?.bio ||
    "Hi, I'm Arun Pandian — a Data Analyst transforming complex datasets into actionable business intelligence with SQL, Python, Excel & Power BI.";

  const category = meta.category || 'Data Engineering';
  const tags = Array.isArray(blog.tags) && blog.tags.length > 0
    ? blog.tags
    : typeof blog.tags === 'string' && blog.tags.trim().length > 0
      ? blog.tags.split(',').map(t => t.trim()).filter(Boolean)
      : ['statistics', 'python', 'API', 'Data Architecture'];

  const coverImage = blog.cover_image || blog.image || '';
  const imageCaption = meta.imageCaption || 'Medallion Architecture Reconsidered';
  const readTime = blog.read_time || '7 min read';
  const publishedDate = new Date(blog.published_at || blog.created_at || Date.now()).toLocaleDateString(
    'en-US',
    { month: 'short', day: 'numeric' }
  );

  const videoUrl = meta.videoUrl || '';
  const powerbiUrl = meta.powerbiUrl || '';
  const githubLink = meta.githubLink || 'https://github.com/arun-pandian-p';
  const liveLink = meta.liveLink || '';
  const seoTitle = meta.seoTitle || `${title} | Arun Pandian`;
  const seoDescription = meta.seoDescription || excerpt || title;
  const currentCanonicalUrl = typeof window !== 'undefined' ? window.location.href : `https://arunpandian.online/blog/${blog.slug || blog.id}`;

  // ─── Custom Markdown Renderer with Interactive Code Snippet Editor ───
  const renderFormattedArticle = (contentStr) => {
    if (!contentStr) return null;

    const sections = contentStr.split('\n\n');
    let codeBlockCounter = 0;

    return sections.map((block, idx) => {
      const trimmed = block.trim();

      // Heading 1
      if (trimmed.startsWith('# ')) {
        const text = trimmed.replace(/^#\s+/, '').replace(/\*\*|\*|`/g, '');
        return (
          <h1 key={idx} className="font-serif font-black text-2xl sm:text-3xl text-slate-900 mt-8 mb-4 tracking-tight">
            {text}
          </h1>
        );
      }

      // Heading 2
      if (trimmed.startsWith('## ')) {
        const text = trimmed.replace(/^##\s+/, '').replace(/\*\*|\*|`/g, '');
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        return (
          <h2
            key={idx}
            id={id}
            className="font-serif font-bold text-xl sm:text-2xl text-slate-900 mt-8 mb-3 pt-3 border-t border-slate-100 scroll-mt-20"
          >
            {text}
          </h2>
        );
      }

      // Heading 3
      if (trimmed.startsWith('### ')) {
        const text = trimmed.replace(/^###\s+/, '').replace(/\*\*|\*|`/g, '');
        return (
          <h3 key={idx} className="font-sans font-bold text-lg text-slate-900 mt-6 mb-2">
            {text}
          </h3>
        );
      }

      // Callout Alert Box
      if (trimmed.startsWith('> [!NOTE]') || trimmed.startsWith('> [!TIP]') || trimmed.startsWith('> [!IMPORTANT]') || trimmed.startsWith('> [!WARNING]')) {
        const lines = trimmed.split('\n');
        const alertType = lines[0].replace('> [!', '').replace(']', '').trim();
        const alertBody = lines.slice(1).map(l => l.replace(/^>\s?/, '')).join(' ');

        return (
          <div key={idx} className="p-4 rounded-xl border-l-4 border-blue-600 bg-blue-50/80 text-blue-950 my-5 text-sm leading-relaxed">
            <div className="font-mono font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Info size={14} />
              <span>{alertType}</span>
            </div>
            <p>{alertBody}</p>
          </div>
        );
      }

      // Standard Blockquote
      if (trimmed.startsWith('> ')) {
        const quoteText = trimmed.replace(/^>\s?/gm, '');
        return (
          <blockquote key={idx} className="p-4 my-5 border-l-3 border-slate-900 bg-slate-50 italic font-serif text-base sm:text-lg text-slate-800 leading-relaxed">
            "{quoteText}"
          </blockquote>
        );
      }

      // ── Interactive In-Article Code Snippet Editor & Runner ──
      if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
        codeBlockCounter++;
        const codeId = `code-block-${codeBlockCounter}`;
        const lines = trimmed.split('\n');
        const language = lines[0].replace('```', '').trim() || 'sql';
        const defaultCode = lines.slice(1, -1).join('\n');
        const currentCode = editableCodeSnippets[codeId] !== undefined ? editableCodeSnippets[codeId] : defaultCode;
        const currentTab = activeSnippetTab[codeId] || 'code';

        return (
          <div key={idx} className="my-6 rounded-xl overflow-hidden border border-slate-800 bg-[#0E1726] shadow-md font-mono text-xs">
            {/* Header: Language, Interactive Tab Toggle & Copy Button */}
            <div className="px-3 sm:px-4 py-2.5 bg-[#172338] border-b border-slate-800 flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase text-blue-400 tracking-wider">
                  {language}
                </span>
                <span className="text-slate-600">•</span>
                <button
                  onClick={() => setActiveSnippetTab(prev => ({ ...prev, [codeId]: 'code' }))}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                    currentTab === 'code' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Editor
                </button>
                <button
                  onClick={() => {
                    setActiveSnippetTab(prev => ({ ...prev, [codeId]: 'output' }));
                    toast.success('Simulated execution completed!', { icon: '⚡' });
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 ${
                    currentTab === 'output' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Terminal size={11} />
                  <span>Run</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditableCodeSnippets(prev => ({ ...prev, [codeId]: defaultCode }));
                    toast('Snippet reset to original', { icon: '🔄' });
                  }}
                  className="text-[10px] text-slate-400 hover:text-white p-1"
                  title="Reset snippet"
                >
                  <RefreshCw size={11} />
                </button>
                <button
                  onClick={() => copyToClipboard(currentCode, codeId)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Copy code"
                >
                  {copiedCode === codeId ? (
                    <>
                      <Check size={12} className="text-emerald-400" />
                      <span className="text-[10px] text-emerald-300 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Body: Editable Code Area or Simulated Terminal Output */}
            {currentTab === 'code' ? (
              <div className="p-3 sm:p-4 text-blue-200">
                <textarea
                  value={currentCode}
                  onChange={(e) => setEditableCodeSnippets(prev => ({ ...prev, [codeId]: e.target.value }))}
                  rows={Math.min(12, Math.max(3, currentCode.split('\n').length))}
                  className="w-full bg-transparent text-blue-200 outline-none resize-y font-mono text-[13px] leading-relaxed border-0"
                  spellCheck="false"
                />
              </div>
            ) : (
              <div className="p-4 bg-[#080d16] text-emerald-400 space-y-1.5 text-[12px]">
                <div className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Execution Output (Query Plan / Result):</div>
                <div className="p-2 rounded bg-black/40 border border-slate-800 text-emerald-300 whitespace-pre-wrap">
                  {`✓ Query executed successfully in 42ms\n✓ 1,248 rows affected / returned\n✓ Schema validated (Status: OK)`}
                </div>
              </div>
            )}
          </div>
        );
      }

      // Markdown Table
      if (trimmed.includes('|') && trimmed.split('\n').length >= 2) {
        const rows = trimmed.split('\n').filter(r => r.trim().startsWith('|'));
        if (rows.length >= 2) {
          const headers = rows[0].split('|').map(h => h.trim()).filter(Boolean);
          const dataRows = rows.slice(2).map(r => r.split('|').map(c => c.trim()).filter(Boolean));

          return (
            <div key={idx} className="my-5 overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                  <tr>
                    {headers.map((h, hIdx) => (
                      <th key={hIdx} className="px-3.5 py-2.5 font-mono text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {dataRows.map((r, rIdx) => (
                    <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      {r.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2.5 leading-snug">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
      }

      // Bullet List
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split('\n').map(i => i.replace(/^[-*]\s+/, '').trim()).filter(Boolean);
        return (
          <ul key={idx} className="my-3 space-y-1.5 list-disc list-inside text-slate-700 text-[15px] sm:text-[16px] leading-relaxed">
            {items.map((item, itemIdx) => (
              <li key={itemIdx} className="pl-1 marker:text-blue-600">
                {item}
              </li>
            ))}
          </ul>
        );
      }

      // Numbered List
      if (/^\d+\.\s/.test(trimmed)) {
        const items = trimmed.split('\n').map(i => i.replace(/^\d+\.\s+/, '').trim()).filter(Boolean);
        return (
          <ol key={idx} className="my-3 space-y-1.5 list-decimal list-inside text-slate-700 text-[15px] sm:text-[16px] leading-relaxed">
            {items.map((item, itemIdx) => (
              <li key={itemIdx} className="pl-1 marker:font-bold marker:text-slate-800">
                {item}
              </li>
            ))}
          </ol>
        );
      }

      // Divider
      if (trimmed === '---' || trimmed === '***') {
        return <hr key={idx} className="my-6 border-slate-200" />;
      }

      // Responsive Image: ![Caption](url)
      const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        const caption = imgMatch[1];
        const imgUrl = imgMatch[2];
        return (
          <figure key={idx} className="my-6">
            <img
              src={imgUrl}
              alt={caption || 'Article Visual'}
              className="w-full h-auto rounded-xl border border-slate-200 shadow-sm object-cover"
              loading="lazy"
            />
            {caption && (
              <figcaption className="text-center text-xs font-serif italic text-slate-500 mt-2">
                {caption}
              </figcaption>
            )}
          </figure>
        );
      }

      // Standard Paragraph
      return (
        <p key={idx} className="text-slate-800 text-[15px] sm:text-[17px] leading-[1.75] my-4 font-normal tracking-[-0.003em]">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-slate-900 selection:text-white">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={currentCanonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={currentCanonicalUrl} />
        <meta property="og:type" content="article" />
        {coverImage && <meta property="og:image" content={coverImage} />}
      </Helmet>

      <StyleOverrides />

      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-100 z-50">
        <div
          className="h-full bg-slate-900 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <Navbar />

      {/* ═════════════════════════════════════════════════════════════════
          TOP MEDIUM-STYLE PROMO BAR (Matching Screenshot Image 1)
          ═════════════════════════════════════════════════════════════════ */}
      <div className="pt-20 sm:pt-24 bg-amber-400 text-slate-950 px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-2">
        <span>Verified Data Analytics Case Studies & Architecture Guides.</span>
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="underline font-bold hover:text-slate-800"
        >
          Share now
        </button>
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          ARTICLE READING VIEW (Clean Mobile & Desktop Architecture)
          ═════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 pt-6 pb-20">
        
        {/* Top Header Row (Back arrow, publication badge, listen button, share) */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            <Link
              to="/blog"
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
              title="Back to stories"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-xs font-mono">
              <span>➔</span>
              <span>{category}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Listen Audio Button */}
            <button
              onClick={toggleSpeechAudio}
              className={`p-2 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium ${
                isPlayingAudio ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
              title="Listen to story audio"
            >
              {isPlayingAudio ? <Pause size={14} /> : <Play size={14} />}
              <span className="hidden sm:inline">{isPlayingAudio ? 'Playing' : 'Listen'}</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 cursor-pointer"
              title="Share"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Member-Only / Featured Story Badge */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
            <span>✨</span>
            <span>Featured Case Study</span>
          </span>
        </div>

        {/* Big Bold Headline Title (Matching Image 1) */}
        <h1 className="font-serif font-black text-2xl sm:text-4xl md:text-[2.75rem] text-slate-950 tracking-tight leading-[1.2] mb-3">
          {title}
        </h1>

        {/* Subtitle / Italic Lead (Matching Image 1) */}
        <p className="text-base sm:text-xl text-slate-600 font-serif italic leading-relaxed mb-6">
          {excerpt}
        </p>

        {/* Reading Time & Published Date */}
        <div className="text-xs text-slate-500 font-mono mb-4 flex items-center gap-2">
          <span>{readTime}</span>
          <span>·</span>
          <span>{publishedDate}</span>
        </div>

        {/* Author Bar (Avatar, Name, Follow button) - Matching Image 1 */}
        <div className="flex items-center justify-between py-3 border-y border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-11 h-11 rounded-full object-cover border border-slate-200"
              onError={(e) => { e.target.src = arunProfile; }}
            />
            <div>
              <div className="font-bold text-sm text-slate-900">{authorName}</div>
              <div className="text-xs text-slate-500">{authorRole}</div>
            </div>
          </div>

          <button
            onClick={handleFollowToggle}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              isFollowing
                ? 'bg-slate-100 text-slate-800 border border-slate-200'
                : 'bg-slate-950 text-white hover:bg-slate-800'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>

        {/* Primary Graphic / Banner Figure (Matching Image 1) */}
        {coverImage && (
          <figure className="my-6">
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950">
              <img
                src={coverImage}
                alt={title}
                className="w-full h-auto object-cover"
                fetchPriority="high"
              />
            </div>
            {imageCaption && (
              <figcaption className="text-center text-xs font-serif italic text-slate-500 mt-2">
                {imageCaption}
              </figcaption>
            )}
          </figure>
        )}

        {/* GitHub Code Repository Notice Banner */}
        {githubLink && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-sans leading-relaxed my-6 flex items-start gap-3">
            <GithubIcon size={18} className="shrink-0 text-slate-900 mt-0.5" />
            <div>
              <span className="font-bold">All code for this project is </span>
              <a
                href={githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-600 hover:text-blue-800 underline"
              >
                here on GitHub
              </a>
              <span>, along with instructions and dataset scripts.</span>
            </div>
          </div>
        )}

        {/* Embedded Video */}
        {videoUrl && (
          <div className="my-6 rounded-xl overflow-hidden border border-slate-200 shadow-sm aspect-video bg-black">
            {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
              <iframe
                src={videoUrl.replace('watch?v=', 'embed/')}
                title="Video Embed"
                className="w-full h-full"
                allowFullScreen
              />
            ) : (
              <video src={videoUrl} controls className="w-full h-full object-cover" />
            )}
          </div>
        )}

        {/* Embedded Power BI / Interactive App */}
        {powerbiUrl && (
          <div className="my-6 rounded-xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 aspect-16/10">
            <iframe
              src={powerbiUrl}
              title="Interactive Report Embed"
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        )}

        {/* Main Formatted Article Content */}
        <div className="article-body">
          {renderFormattedArticle(cleanContent)}
        </div>

        {/* ── MEDIUM-STYLE IN-FLOW ARTICLE FOOTER (No intrusive bottom bar) ── */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 text-slate-700 hover:text-slate-950 cursor-pointer"
            >
              <span className="text-xl">👏</span>
              <span className="font-mono text-xs font-bold">{likesCount}</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-900 text-xs"
            >
              <MessageSquare size={16} />
              <span className="font-mono">5</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBookmarkToggle}
              className="text-slate-500 hover:text-slate-900 cursor-pointer"
              title="Bookmark"
            >
              <Bookmark size={18} className={isBookmarked ? "fill-amber-500 text-amber-500" : ""} />
            </button>

            <button
              onClick={() => handleShare('native')}
              className="text-slate-500 hover:text-slate-900 cursor-pointer"
              title="Share"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Prev / Next Story Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 pt-6 border-t border-slate-100">
          {prevBlog && (
            <Link
              to={`/blog/${prevBlog.slug || prevBlog.id}`}
              className="p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Previous Story</span>
              <span className="font-serif font-bold text-sm text-slate-900 block truncate mt-0.5">{prevBlog.title}</span>
            </Link>
          )}

          {nextBlog && (
            <Link
              to={`/blog/${nextBlog.slug || nextBlog.id}`}
              className="p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-right sm:col-start-2"
            >
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Next Story</span>
              <span className="font-serif font-bold text-sm text-slate-900 block truncate mt-0.5">{nextBlog.title}</span>
            </Link>
          )}
        </div>

      </main>

      {/* ── PROFESSIONAL SHARE MODAL ── */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
                <Share2 size={16} className="text-blue-600" />
                <span>Share Story</span>
              </h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Share <strong className="text-slate-900">"{title}"</strong>:
            </p>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <button
                onClick={() => handleShare('linkedin')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-[#0077B5]/10 border border-slate-200 text-slate-700 hover:text-[#0077B5] text-xs font-semibold gap-1.5"
              >
                <FaLinkedin size={22} className="text-[#0077B5]" />
                <span>LinkedIn</span>
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-950 text-xs font-semibold gap-1.5"
              >
                <FaXTwitter size={20} />
                <span>Twitter / X</span>
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-[#25D366]/10 border border-slate-200 text-slate-700 hover:text-[#25D366] text-xs font-semibold gap-1.5"
              >
                <FaWhatsapp size={22} className="text-[#25D366]" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => handleShare('reddit')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-[#FF4500]/10 border border-slate-200 text-slate-700 hover:text-[#FF4500] text-xs font-semibold gap-1.5"
              >
                <FaRedditAlien size={22} className="text-[#FF4500]" />
                <span>Reddit</span>
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-[#1877F2]/10 border border-slate-200 text-slate-700 hover:text-[#1877F2] text-xs font-semibold gap-1.5"
              >
                <FaFacebookF size={20} className="text-[#1877F2]" />
                <span>Facebook</span>
              </button>
              <button
                onClick={() => handleShare('email')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold gap-1.5"
              >
                <FaEnvelope size={20} className="text-slate-600" />
                <span>Email</span>
              </button>
            </div>

            <div className="pt-2 flex gap-2">
              <input
                type="text"
                readOnly
                value={currentCanonicalUrl}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 truncate outline-none select-all"
              />
              <button
                onClick={() => handleShare('copy')}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold font-mono transition-colors shrink-0 cursor-pointer"
              >
                {copiedLink ? 'Copied!' : 'Copy'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
