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
  Mail,
  TrendingUp,
  Tag,
  Star,
  Flame,
  Heart,
  ThumbsUp,
  Printer,
  Volume2,
  VolumeX
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

// Custom GitHub Icon
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
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Medium-style Likes / Claps & Bookmark state
  const [likesCount, setLikesCount] = useState(24);
  const [hasLiked, setHasLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [clapAnim, setClapAnim] = useState(false);

  // Initialize Likes and Bookmarks from localStorage
  useEffect(() => {
    if (!slug) return;
    const storedLikes = localStorage.getItem(`blog_likes_${slug}`);
    const storedUserLiked = localStorage.getItem(`blog_user_liked_${slug}`);
    const storedBookmark = localStorage.getItem(`blog_bookmarked_${slug}`);

    if (storedLikes) {
      setLikesCount(parseInt(storedLikes, 10));
    } else {
      // Seed random initial claps between 18 and 42 for social proof
      const initialSeed = Math.floor(Math.random() * 24) + 18;
      setLikesCount(initialSeed);
    }

    if (storedUserLiked) setHasLiked(true);
    if (storedBookmark) setIsBookmarked(true);
  }, [slug]);

  // Fetch blog directly from Supabase for instant live data
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

      // Fallback to in-memory context blogs
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
    toast.success('Code copied to clipboard!', { icon: '📋' });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Medium-style Clap / Like Handler
  const handleLike = () => {
    const newCount = likesCount + 1;
    setLikesCount(newCount);
    setHasLiked(true);
    setClapAnim(true);
    setTimeout(() => setClapAnim(false), 800);

    localStorage.setItem(`blog_likes_${slug}`, newCount);
    localStorage.setItem(`blog_user_liked_${slug}`, 'true');

    toast.success(`👏 Clapped for this article! (${newCount})`, {
      icon: '👏',
      style: { borderRadius: '12px', background: '#0F172A', color: '#fff', fontSize: '13px' }
    });
  };

  // Bookmark Toggle Handler
  const handleBookmarkToggle = () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    if (nextState) {
      localStorage.setItem(`blog_bookmarked_${slug}`, 'true');
      toast.success('Article saved to your reading list!', { icon: '🔖' });
    } else {
      localStorage.removeItem(`blog_bookmarked_${slug}`);
      toast('Article removed from reading list.', { icon: '🗑️' });
    }
  };

  // Comprehensive Professional Share Function
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
        `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this data analytics study: "${shareTitle}" — ${currentUrl}`)}`,
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
      window.location.href = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`Hi,\n\nI thought you might find this data publication interesting:\n\n${shareTitle}\n${currentUrl}\n\nBest,`)}`;
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      toast.success('Article link copied to clipboard!', { icon: '🔗' });
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Featured and Recent Posts for Sidebar
  const { featuredPosts, recentPosts, prevBlog, nextBlog, relatedBlogs } = useMemo(() => {
    const list = allBlogsList.length > 0 ? allBlogsList : contextBlogs;
    const currentIndex = list.findIndex(
      (b) => String(b.slug) === String(slug) || String(b.id) === String(slug)
    );

    const prev = currentIndex > 0 ? list[currentIndex - 1] : list[list.length - 1];
    const next = currentIndex < list.length - 1 && currentIndex !== -1 ? list[currentIndex + 1] : list[0];
    
    // Featured posts (featured flag or top 3)
    const featured = list.filter((b) => b.featured && String(b.slug) !== String(slug)).slice(0, 3);
    const fallbackFeatured = featured.length > 0 ? featured : list.filter((b) => String(b.slug) !== String(slug)).slice(0, 3);

    // Recent posts (latest 5)
    const recent = list.filter((b) => String(b.slug) !== String(slug)).slice(0, 5);
    const related = list.filter((b) => String(b.slug) !== String(slug)).slice(0, 3);

    return { 
      featuredPosts: fallbackFeatured, 
      recentPosts: recent, 
      prevBlog: prev, 
      nextBlog: next, 
      relatedBlogs: related 
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
  const title = blog.title || 'Exploring Fitbit Data using Fitbit\'s API';
  const excerpt = blog.excerpt || blog.summary || 'An in-depth technical investigation and data modeling case study.';
  const authorName = blog.author_name || settings?.about?.name || 'Arun Pandian';
  const authorRole = settings?.about?.role || 'Data Analyst';
  const authorAvatar =
    blog.author_avatar ||
    settings?.about?.profileImage ||
    arunProfile;
  const authorBio =
    settings?.about?.bio ||
    "Hi, I'm Arun Pandian — a Data Analyst transforming complex datasets into actionable business intelligence with SQL, Python, Excel & Power BI.";

  const category = meta.category || 'Data Analytics';
  const tags = Array.isArray(blog.tags) && blog.tags.length > 0
    ? blog.tags
    : typeof blog.tags === 'string' && blog.tags.trim().length > 0
      ? blog.tags.split(',').map(t => t.trim()).filter(Boolean)
      : ['statistics', 'python', 'API'];

  const coverImage = blog.cover_image || blog.image || '';
  const imageCaption = meta.imageCaption || '';
  const readTime = blog.read_time || '5 min read';
  const publishedDate = new Date(blog.published_at || blog.created_at || Date.now()).toLocaleDateString(
    'en-US',
    { month: 'long', day: 'numeric', year: 'numeric' }
  );

  const videoUrl = meta.videoUrl || '';
  const powerbiUrl = meta.powerbiUrl || '';
  const githubLink = meta.githubLink || 'https://github.com/arun-pandian-p';
  const liveLink = meta.liveLink || '';
  const seoTitle = meta.seoTitle || `${title} | Arun Pandian`;
  const seoDescription = meta.seoDescription || excerpt || title;
  const currentCanonicalUrl = typeof window !== 'undefined' ? window.location.href : `https://arunpandian.online/blog/${blog.slug || blog.id}`;

  // ─── Custom Markdown Renderer ───
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
          <h1 key={idx} className="font-serif font-black text-3xl sm:text-4xl text-slate-900 mt-10 mb-4 tracking-tight">
            {text}
          </h1>
        );
      }

      // Heading 2
      if (trimmed.startsWith('## ')) {
        const text = trimmed.replace(/^##\s+/, '').replace(/\*\*|\*|`/g, '');
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        return (
          <h2
            key={idx}
            id={id}
            className="group font-serif font-bold text-2xl sm:text-3xl text-slate-900 mt-10 mb-4 pt-3 border-t border-slate-100 scroll-mt-24 flex items-center justify-between"
          >
            <span>{text}</span>
            <a
              href={`#${id}`}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity text-sm font-mono"
              aria-label="Link to section"
            >
              #
            </a>
          </h2>
        );
      }

      // Heading 3
      if (trimmed.startsWith('### ')) {
        const text = trimmed.replace(/^###\s+/, '').replace(/\*\*|\*|`/g, '');
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        return (
          <h3
            key={idx}
            id={id}
            className="font-sans font-bold text-lg sm:text-xl text-slate-900 mt-8 mb-3 scroll-mt-24"
          >
            {text}
          </h3>
        );
      }

      // Heading 4
      if (trimmed.startsWith('#### ')) {
        const text = trimmed.replace(/^####\s+/, '').replace(/\*\*|\*|`/g, '');
        return (
          <h4
            key={idx}
            className="font-sans font-bold text-sm text-slate-800 mt-6 mb-2 uppercase tracking-wide text-xs"
          >
            {text}
          </h4>
        );
      }

      // Callout Alert Box (> [!NOTE], > [!TIP], > [!IMPORTANT], > [!WARNING])
      if (trimmed.startsWith('> [!NOTE]') || trimmed.startsWith('> [!TIP]') || trimmed.startsWith('> [!IMPORTANT]') || trimmed.startsWith('> [!WARNING]')) {
        const lines = trimmed.split('\n');
        const alertType = lines[0].replace('> [!', '').replace(']', '').trim();
        const alertBody = lines.slice(1).map(l => l.replace(/^>\s?/, '')).join(' ');

        let alertColor = 'bg-blue-50/80 border-blue-500 text-blue-950';
        let AlertIcon = Info;
        if (alertType === 'TIP') {
          alertColor = 'bg-emerald-50/80 border-emerald-500 text-emerald-950';
          AlertIcon = Lightbulb;
        } else if (alertType === 'WARNING') {
          alertColor = 'bg-amber-50/80 border-amber-500 text-amber-950';
          AlertIcon = AlertTriangle;
        } else if (alertType === 'IMPORTANT') {
          alertColor = 'bg-indigo-50/80 border-indigo-600 text-indigo-950';
          AlertIcon = AlertCircle;
        }

        return (
          <div key={idx} className={`p-4 sm:p-5 rounded-xl border-l-4 my-6 shadow-2xs ${alertColor}`}>
            <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase tracking-wider mb-1.5">
              <AlertIcon size={16} />
              <span>{alertType}</span>
            </div>
            <p className="text-sm sm:text-base leading-relaxed">{alertBody}</p>
          </div>
        );
      }

      // Standard Blockquote
      if (trimmed.startsWith('> ')) {
        const quoteText = trimmed.replace(/^>\s?/gm, '');
        return (
          <blockquote key={idx} className="p-4 sm:p-6 my-6 border-l-4 border-slate-900 bg-slate-50 rounded-r-xl italic font-serif text-lg text-slate-800 leading-relaxed shadow-2xs">
            "{quoteText}"
          </blockquote>
        );
      }

      // Fenced Code Block (```sql, ```python, ```dax)
      if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
        codeBlockCounter++;
        const codeId = `code-block-${codeBlockCounter}`;
        const lines = trimmed.split('\n');
        const language = lines[0].replace('```', '').trim() || 'sql';
        const codeBody = lines.slice(1, -1).join('\n');

        return (
          <div key={idx} className="my-6 rounded-xl overflow-hidden border border-slate-800 bg-[#0E1726] shadow-md font-mono text-xs">
            <div className="px-4 py-2.5 bg-[#172338] border-b border-slate-800 flex items-center justify-between text-slate-300">
              <span className="text-[11px] font-bold uppercase text-blue-400 tracking-wider">
                {language}
              </span>
              <button
                onClick={() => copyToClipboard(codeBody, codeId)}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Copy snippet"
              >
                {copiedCode === codeId ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span className="text-[10px] text-emerald-300 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span className="text-[10px]">Copy code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 sm:p-5 text-blue-200 overflow-x-auto leading-relaxed text-[13px]">
              <code>{codeBody}</code>
            </pre>
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
            <div key={idx} className="my-6 overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                  <tr>
                    {headers.map((h, hIdx) => (
                      <th key={hIdx} className="px-4 py-3 font-mono text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {dataRows.map((r, rIdx) => (
                    <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      {r.map((cell, cIdx) => (
                        <td key={cIdx} className="px-4 py-3 leading-snug">{cell}</td>
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
          <ul key={idx} className="my-4 space-y-2 list-disc list-inside text-slate-700 text-[16px] sm:text-[17.5px] leading-[1.78]">
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
          <ol key={idx} className="my-4 space-y-2 list-decimal list-inside text-slate-700 text-[16px] sm:text-[17.5px] leading-[1.78]">
            {items.map((item, itemIdx) => (
              <li key={itemIdx} className="pl-1 marker:font-bold marker:text-slate-800">
                {item}
              </li>
            ))}
          </ol>
        );
      }

      // Collapsible FAQ Accordion (<details><summary>...</summary>...</details>)
      if (trimmed.startsWith('<details>')) {
        const sumMatch = trimmed.match(/<summary>(.*?)<\/summary>/);
        const summary = sumMatch ? sumMatch[1] : 'Click to expand';
        const body = trimmed.replace(/<details>[\s\S]*?<summary>.*?<\/summary>/, '').replace(/<\/details>/, '').trim();
        return (
          <details key={idx} className="my-6 p-4 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 cursor-pointer shadow-2xs">
            <summary className="font-bold text-sm sm:text-base text-slate-900 select-none">{summary}</summary>
            <div className="pt-3 mt-3 border-t border-slate-200 text-sm text-slate-600 leading-relaxed">{body}</div>
          </details>
        );
      }

      // Horizontal Divider
      if (trimmed === '---' || trimmed === '***') {
        return <hr key={idx} className="my-8 border-slate-200 max-w-md mx-auto" />;
      }

      // Responsive Markdown Image: ![Caption](url)
      const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        const caption = imgMatch[1];
        const imgUrl = imgMatch[2];
        return (
          <figure key={idx} className="my-8">
            <img
              src={imgUrl}
              alt={caption || 'Article Visual'}
              className="w-full h-auto rounded-2xl border border-slate-200 shadow-sm object-cover"
              loading="lazy"
            />
            {caption && (
              <figcaption className="text-center text-xs font-serif italic text-slate-500 mt-2.5">
                {caption}
              </figcaption>
            )}
          </figure>
        );
      }

      // Standard Paragraph
      return (
        <p key={idx} className="text-slate-800 text-[16px] sm:text-[17.5px] leading-[1.78] my-5 font-normal tracking-[-0.003em]">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFB] text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* ─── Rich SEO Open Graph & Twitter Social Tags ─── */}
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={currentCanonicalUrl} />
        
        {/* OpenGraph */}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={currentCanonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Arun Pandian · Data Analytics Publication" />
        {coverImage && <meta property="og:image" content={coverImage} />}
        <meta property="article:published_time" content={blog.published_at || blog.created_at} />
        <meta property="article:author" content={authorName} />
        <meta property="article:section" content={category} />
        {tags.map((t) => <meta key={t} property="article:tag" content={t} />)}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        {coverImage && <meta name="twitter:image" content={coverImage} />}
      </Helmet>

      <StyleOverrides />

      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-100 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* ── 01: TOP BREADCRUMBS & ACTION BAR ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/80 text-xs font-mono text-slate-500">
          <nav className="flex items-center gap-2">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-xs">{category}</span>
          </nav>

          <div className="flex items-center gap-2">
            {/* Quick Share Trigger */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 text-xs font-mono font-medium transition-all shadow-xs cursor-pointer"
              title="Share this article"
            >
              <Share2 size={12} className="text-blue-600" />
              <span>Share</span>
            </button>

            {/* Admin Edit Link */}
            <Link
              to={`/admin/blogs?edit=${blog.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 text-xs font-mono font-medium transition-all shadow-xs cursor-pointer"
              title="Edit in Admin Panel"
            >
              <Edit2 size={12} className="text-slate-500" />
              <span>Edit in Admin</span>
            </Link>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            3-SECTION SPLIT LAYOUT (Matching Uploaded Screenshot & Medium UI)
            Left/Center (Col 8): Tags + Title + Date + GitHub Box + Content
            Right Sidebar (Col 4): Featured Posts + Recent Posts + TOC
            ═════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ─────────────────────────────────────────────────────────────
              LEFT / CENTER MAIN ARTICLE COLUMN (lg:col-span-8)
              ───────────────────────────────────────────────────────────── */}
          <article className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            
            {/* 1. TOP TAGS PILLS */}
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-medium border border-slate-200/80 transition-colors"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* 2. ARTICLE HEADLINE TITLE */}
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-slate-950 tracking-tight leading-[1.2]">
              {title}
            </h1>

            {/* 3. PUBLISH DATE & AUTHOR META */}
            <div className="text-xs text-slate-500 font-mono flex flex-wrap items-center gap-3 pb-2">
              <span>{publishedDate}</span>
              <span>•</span>
              <span>{readTime}</span>
              <span>•</span>
              <span className="font-medium text-slate-700">By {authorName}</span>
            </div>

            {/* ── MEDIUM-STYLE ENGAGEMENT & SHARABLE BAR ── */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-3.5 px-4 bg-slate-50/80 rounded-xl border border-slate-200/90 text-xs">
              
              {/* Left: Claps / Like & Bookmark */}
              <div className="flex items-center gap-4">
                {/* Clap Button */}
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    hasLiked
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                  title="Clap for this article"
                >
                  <span className={`text-base ${clapAnim ? 'scale-125 transition-transform' : ''}`}>👏</span>
                  <span className="font-mono text-xs">{likesCount}</span>
                </button>

                {/* Bookmark Toggle */}
                <button
                  onClick={handleBookmarkToggle}
                  className={`p-2 rounded-full border transition-colors cursor-pointer ${
                    isBookmarked
                      ? 'bg-amber-50 text-amber-600 border-amber-300'
                      : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
                  }`}
                  title={isBookmarked ? "Saved in Reading List" : "Save Article"}
                >
                  <Bookmark size={15} className={isBookmarked ? "fill-amber-500" : ""} />
                </button>

                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-full bg-white text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors cursor-pointer hidden sm:inline-flex"
                  title="Print / Save PDF"
                >
                  <Printer size={15} />
                </button>
              </div>

              {/* Right: Instant Sharable Links (LinkedIn, X, WhatsApp, Reddit, Copy) */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-mono text-[11px] mr-1 hidden sm:inline">Share:</span>
                
                {/* LinkedIn */}
                <button
                  onClick={() => handleShare('linkedin')}
                  className="p-2 rounded-lg bg-white hover:bg-[#0077B5]/10 text-[#0077B5] border border-slate-200 transition-colors cursor-pointer"
                  title="Share on LinkedIn"
                >
                  <FaLinkedin size={14} />
                </button>

                {/* Twitter / X */}
                <button
                  onClick={() => handleShare('twitter')}
                  className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                  title="Share on X"
                >
                  <FaXTwitter size={13} />
                </button>

                {/* WhatsApp */}
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="p-2 rounded-lg bg-white hover:bg-[#25D366]/10 text-[#25D366] border border-slate-200 transition-colors cursor-pointer"
                  title="Share on WhatsApp"
                >
                  <FaWhatsapp size={14} />
                </button>

                {/* Reddit */}
                <button
                  onClick={() => handleShare('reddit')}
                  className="p-2 rounded-lg bg-white hover:bg-[#FF4500]/10 text-[#FF4500] border border-slate-200 transition-colors cursor-pointer hidden sm:inline-flex"
                  title="Share on Reddit"
                >
                  <FaRedditAlien size={14} />
                </button>

                {/* Copy Link */}
                <button
                  onClick={() => handleShare('copy')}
                  className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1 text-xs"
                  title="Copy link to clipboard"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>

            </div>

            {/* 4. GITHUB REPOSITORY / CODE NOTICE BANNER */}
            {githubLink && (
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm sm:text-[15px] font-sans leading-relaxed shadow-2xs flex items-start gap-3">
                <GithubIcon size={20} className="shrink-0 text-slate-900 mt-0.5" />
                <div>
                  <span className="font-bold">All code for this project is </span>
                  <a
                    href={githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-600 hover:text-blue-800 underline transition-colors"
                  >
                    here on GitHub
                  </a>
                  <span>, along with instructions and dataset scripts.</span>
                </div>
              </div>
            )}

            {/* Excerpt Summary */}
            {excerpt && (
              <p className="text-base sm:text-lg text-slate-600 font-sans leading-relaxed italic border-l-2 border-slate-300 pl-4 py-1">
                {excerpt}
              </p>
            )}

            {/* Primary Cover Visual Banner */}
            {coverImage && (
              <figure className="my-6">
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm aspect-16/9 bg-slate-950">
                  <img
                    src={coverImage}
                    alt={title}
                    className="w-full h-full object-cover"
                    fetchPriority="high"
                  />
                </div>
                {imageCaption && (
                  <figcaption className="text-center text-xs font-serif italic text-slate-500 mt-2.5">
                    {imageCaption}
                  </figcaption>
                )}
              </figure>
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

            {/* 5. MAIN ARTICLE CONTENT */}
            <div className="article-body pt-2">
              {renderFormattedArticle(cleanContent)}
            </div>

            {/* Live App / Repository Action Buttons */}
            {(githubLink || liveLink) && (
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 mt-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Explore Interactive Materials</h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Reproducible models and verified scripts.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  {githubLink && (
                    <a
                      href={githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-mono font-bold transition-all shadow-xs"
                    >
                      <GithubIcon size={14} />
                      <span>GitHub Repo ↗</span>
                    </a>
                  )}
                  {liveLink && (
                    <a
                      href={liveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-mono font-bold transition-all shadow-xs"
                    >
                      <ExternalLink size={14} />
                      <span>Live App ↗</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Sharable Action Strip */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                >
                  <span>👏 Clap ({likesCount})</span>
                </button>
                <button
                  onClick={handleBookmarkToggle}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Bookmark size={14} />
                  <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <Share2 size={13} />
                  <span>Share Full Study</span>
                </button>
              </div>
            </div>

          </article>

          {/* ─────────────────────────────────────────────────────────────
              RIGHT SIDEBAR: FEATURED POSTS + RECENT POSTS + TOC (lg:col-span-4)
              (Matching User's Uploaded 3-Section Split Screenshot)
              ───────────────────────────────────────────────────────────── */}
          <aside className="lg:col-span-4 space-y-8 sticky top-24">
            
            {/* ── SECTION 1: FEATURED POSTS (Spotlight Cards) ── */}
            {featuredPosts.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-1.5">
                    <Star size={16} className="text-amber-500 fill-amber-500" />
                    <span>Featured Posts</span>
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Curated</span>
                </div>

                <div className="space-y-4">
                  {featuredPosts.slice(0, 2).map((fp) => (
                    <div
                      key={fp.id}
                      onClick={() => navigate(`/blog/${fp.slug || fp.id}`)}
                      className="group cursor-pointer rounded-xl overflow-hidden border border-slate-200 bg-slate-900 relative shadow-2xs hover:shadow-md transition-all"
                    >
                      <div className="aspect-16/10 overflow-hidden bg-slate-950">
                        {fp.cover_image && (
                          <img
                            src={fp.cover_image}
                            alt={fp.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                          />
                        )}
                      </div>
                      <div className="p-3.5 bg-white space-y-1">
                        <span className="text-[10px] font-mono font-bold text-blue-600 uppercase block">
                          {fp.category || 'Data Analytics'}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                          {fp.title}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400 block pt-1">
                          {new Date(fp.published_at || fp.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SECTION 2: RECENT POSTS (Compact List with Thumbnails & Dates) ── */}
            {recentPosts.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-1.5">
                    <Flame size={16} className="text-orange-500" />
                    <span>Recent Posts</span>
                  </h3>
                  <Link to="/blog" className="text-[11px] font-mono text-blue-600 hover:underline">
                    View All →
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  {recentPosts.map((rp) => (
                    <div
                      key={rp.id}
                      onClick={() => navigate(`/blog/${rp.slug || rp.id}`)}
                      className="py-3 first:pt-0 last:pb-0 flex items-center gap-3.5 group cursor-pointer"
                    >
                      {/* Compact Thumbnail */}
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                        {rp.cover_image ? (
                          <img
                            src={rp.cover_image}
                            alt={rp.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                            <FileText size={16} />
                          </div>
                        )}
                      </div>

                      {/* Title & Date */}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-sans font-bold text-xs sm:text-[13px] text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                          {rp.title}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                          {new Date(rp.published_at || rp.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SECTION 3: TABLE OF CONTENTS (Section Outline) ── */}
            {headings.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 text-blue-700">
                    <List size={14} /> Section Outline
                  </span>
                  <span className="text-[10px] text-slate-400">{headings.length} parts</span>
                </div>

                <nav className="space-y-1 text-xs max-h-[50vh] overflow-y-auto pr-1">
                  {headings.map((h) => {
                    const isActive = activeHeadingId === h.id;
                    return (
                      <a
                        key={h.id}
                        href={`#${h.id}`}
                        className={`block py-1.5 transition-all leading-snug rounded-md px-2 ${
                          h.level === 3 ? 'pl-5 text-[11px]' : 'font-semibold'
                        } ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-bold translate-x-1 border-l-2 border-blue-600'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        {h.text}
                      </a>
                    );
                  })}
                </nav>
              </div>
            )}

            {/* Author Card Snapshot */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-xs space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="h-10 w-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="font-bold text-slate-900">{authorName}</div>
                  <div className="text-[11px] text-slate-500">{authorRole}</div>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Specializing in data pipelines, SQL transformations, DAX analytics, and dashboard architecture.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-blue-600 font-mono text-[11px] font-bold">
                <a
                  href="https://www.linkedin.com/in/arunpandianp-dataanalyst/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline text-[#0077B5]"
                >
                  <FaLinkedin className="text-xs" /> LinkedIn
                </a>
                <a
                  href="https://github.com/arun-pandian-p"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline text-slate-800"
                >
                  <FaGithub className="text-xs" /> GitHub
                </a>
                <Link to="/#contact" className="hover:underline text-blue-600">
                  Contact ✉
                </Link>
              </div>
            </div>

          </aside>

        </div>

        {/* ── PREV / NEXT NAVIGATION BAR ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 pt-8 border-t border-slate-200">
          {prevBlog && (
            <Link
              to={`/blog/${prevBlog.slug || prevBlog.id}`}
              className="p-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center gap-3 group shadow-2xs"
            >
              <ChevronLeft size={22} className="text-slate-400 group-hover:text-blue-600 group-hover:-translate-x-1 transition-all shrink-0" />
              <div className="truncate">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Previous Article</span>
                <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 truncate block mt-0.5">{prevBlog.title}</span>
              </div>
            </Link>
          )}

          {nextBlog && (
            <Link
              to={`/blog/${nextBlog.slug || nextBlog.id}`}
              className="p-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between text-right group shadow-2xs sm:col-start-2"
            >
              <div className="truncate">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Next Article</span>
                <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 truncate block mt-0.5">{nextBlog.title}</span>
              </div>
              <ChevronRight size={22} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          )}
        </div>

        {/* ── RELATED PUBLICATIONS GRID ── */}
        {relatedBlogs.length > 0 && (
          <section className="mt-16 pt-12 border-t border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">
                More Technical Studies & Articles
              </h4>
              <Link to="/blog" className="text-xs font-mono text-blue-600 hover:underline font-bold">
                Explore All Publications →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedBlogs.map((rb) => (
                <Link
                  key={rb.id}
                  to={`/blog/${rb.slug || rb.id}`}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all flex flex-col justify-between group shadow-2xs"
                >
                  <div>
                    {rb.cover_image && (
                      <img
                        src={rb.cover_image}
                        alt={rb.title}
                        className="w-full h-36 object-cover rounded-xl mb-3.5 bg-slate-900"
                      />
                    )}
                    <span className="text-[10px] font-mono font-bold text-blue-600 uppercase block mb-1">
                      {rb.category || 'Data Analytics'}
                    </span>
                    <h5 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-snug">
                      {rb.title}
                    </h5>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                      {rb.excerpt || 'Comprehensive data analysis, methodology, and SQL modeling.'}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-blue-600 font-bold mt-4 flex items-center gap-1">
                    <span>Read Study</span>
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* ── PROFESSIONAL SHARE MODAL ── */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
                <Share2 size={16} className="text-blue-600" />
                <span>Share Article</span>
              </h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Share <strong className="text-slate-900">"{title}"</strong> with your professional network:
            </p>

            {/* Social Share Grid */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <button
                onClick={() => handleShare('linkedin')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-[#0077B5]/10 border border-slate-200 text-slate-700 hover:text-[#0077B5] transition-colors cursor-pointer text-xs font-semibold gap-1.5"
              >
                <FaLinkedin size={22} className="text-[#0077B5]" />
                <span>LinkedIn</span>
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-950 transition-colors cursor-pointer text-xs font-semibold gap-1.5"
              >
                <FaXTwitter size={20} />
                <span>X / Twitter</span>
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-[#25D366]/10 border border-slate-200 text-slate-700 hover:text-[#25D366] transition-colors cursor-pointer text-xs font-semibold gap-1.5"
              >
                <FaWhatsapp size={22} className="text-[#25D366]" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => handleShare('reddit')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-[#FF4500]/10 border border-slate-200 text-slate-700 hover:text-[#FF4500] transition-colors cursor-pointer text-xs font-semibold gap-1.5"
              >
                <FaRedditAlien size={22} className="text-[#FF4500]" />
                <span>Reddit</span>
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-[#1877F2]/10 border border-slate-200 text-slate-700 hover:text-[#1877F2] transition-colors cursor-pointer text-xs font-semibold gap-1.5"
              >
                <FaFacebookF size={20} className="text-[#1877F2]" />
                <span>Facebook</span>
              </button>
              <button
                onClick={() => handleShare('email')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-xs font-semibold gap-1.5"
              >
                <FaEnvelope size={20} className="text-slate-600" />
                <span>Email</span>
              </button>
            </div>

            {/* Copy Link Input Bar */}
            <div className="pt-2">
              <label className="block text-[11px] font-mono text-slate-500 mb-1">Direct Link:</label>
              <div className="flex gap-2">
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
        </div>
      )}

      {/* Floating Quick Edit & Share Bubble on Bottom Right */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/90 hover:bg-white text-slate-800 text-xs font-mono font-semibold shadow-lg border border-slate-200 transition-all hover:scale-105 backdrop-blur-md cursor-pointer"
          title="Share Article"
        >
          <Share2 size={13} className="text-blue-600" />
          <span className="hidden sm:inline">Share</span>
        </button>
        <Link
          to={`/admin/blogs?edit=${blog.id}`}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-mono font-medium shadow-lg border border-slate-800 transition-all hover:scale-105 backdrop-blur-md cursor-pointer"
          title="Edit this article in Admin Panel"
        >
          <Edit2 size={12} className="text-blue-400" />
          <span className="hidden sm:inline">Edit in Admin</span>
        </Link>
      </div>
    </div>
  );
}
