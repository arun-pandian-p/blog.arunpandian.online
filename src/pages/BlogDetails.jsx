import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabaseClient';
import { useContent } from '../context/ContentProvider';
import Navbar from '../components/Navbar';
import StyleOverrides from '../editor/StyleOverrides';
import arunProfile from '../assets/arun-profile.jpg';
import { FaLinkedin, FaGithub } from 'react-icons/fa6';
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
} from 'lucide-react';
import toast from 'react-hot-toast';

// Custom SVG Icons
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

const LinkedinIcon = ({ size = 16 }) => (
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
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const XTwitterIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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
            supabase.from('blogs').select('*').order('sort_order', { ascending: true }),
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

  const handleShare = (platform) => {
    const url = window.location.href;
    const shareTitle = blog?.title || 'Data Analytics Article';

    if (platform === 'linkedin') {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        '_blank'
      );
    } else if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(url)}`,
        '_blank'
      );
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast.success('Article link copied to clipboard!', { icon: '🔗' });
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Find previous and next blog articles for cross-navigation
  const { prevBlog, nextBlog, relatedBlogs } = useMemo(() => {
    const list = allBlogsList.length > 0 ? allBlogsList : contextBlogs;
    const currentIndex = list.findIndex(
      (b) => String(b.slug) === String(slug) || String(b.id) === String(slug)
    );

    const prev = currentIndex > 0 ? list[currentIndex - 1] : list[list.length - 1];
    const next = currentIndex < list.length - 1 && currentIndex !== -1 ? list[currentIndex + 1] : list[0];
    const related = list.filter((b) => String(b.slug) !== String(slug) && String(b.id) !== String(slug)).slice(0, 3);

    return { prevBlog: prev, nextBlog: next, relatedBlogs: related };
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
  const title = blog.title || 'Technical Data Analytics Investigation';
  const excerpt = blog.excerpt || blog.summary || 'An in-depth data analytics investigation.';
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
    : ['Data Analytics', 'Power BI', 'SQL', 'Data Engineering'];

  const coverImage = blog.cover_image || blog.image || '';
  const imageCaption = meta.imageCaption || '';
  const readTime = blog.read_time || '5 min read';
  const publishedDate = new Date(blog.published_at || blog.created_at || Date.now()).toLocaleDateString(
    'en-US',
    { month: 'short', day: 'numeric', year: 'numeric' }
  );

  const videoUrl = meta.videoUrl || '';
  const powerbiUrl = meta.powerbiUrl || '';
  const githubLink = meta.githubLink || 'https://github.com/arun-pandian-p';
  const liveLink = meta.liveLink || '';
  const seoTitle = meta.seoTitle || `${title} | Arun Pandian`;
  const seoDescription = meta.seoDescription || excerpt;

  // ─── Custom Markdown Renderer for High Readability ───
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
          <h1 key={idx} className="font-serif font-black text-3xl sm:text-4xl text-slate-900 mt-12 mb-4 tracking-tight">
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
            className="group font-serif font-bold text-2xl sm:text-3xl text-slate-900 mt-12 mb-4 pt-4 border-t border-slate-100 scroll-mt-24 flex items-center justify-between"
          >
            <span>{text}</span>
            <a
              href={`#${id}`}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity text-sm font-mono"
              aria-label="Link to this section"
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
            className="font-sans font-bold text-xl text-slate-900 mt-8 mb-3 scroll-mt-24"
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
            className="font-sans font-bold text-base text-slate-800 mt-6 mb-2 uppercase tracking-wide text-xs"
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
            {/* Header with language & copy button */}
            <div className="px-4 py-2.5 bg-[#172338] border-b border-slate-800 flex items-center justify-between text-slate-300">
              <span className="text-[11px] font-bold uppercase text-blue-400 tracking-wider">
                {language}
              </span>
              <button
                onClick={() => copyToClipboard(codeBody, codeId)}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Copy code snippet"
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
          <ul key={idx} className="my-4 space-y-2 list-disc list-inside text-slate-700 text-[17px] leading-[1.78]">
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
          <ol key={idx} className="my-4 space-y-2 list-decimal list-inside text-slate-700 text-[17px] leading-[1.78]">
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
        return <hr key={idx} className="my-8 border-slate-200" />;
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
        <p key={idx} className="text-slate-800 text-[17px] sm:text-[18px] leading-[1.78] my-5 font-normal tracking-[-0.003em]">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-blue-600 selection:text-white">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        {meta.socialImage && <meta property="og:image" content={meta.socialImage} />}
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
        
        {/* ── 01: BREADCRUMBS & TOP NAV BAR ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 text-xs font-mono text-slate-500">
          <nav className="flex items-center gap-2">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-xs">{category}</span>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              to={`/admin/blogs?edit=${blog.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 text-xs font-mono font-medium transition-all shadow-xs cursor-pointer"
              title="Edit this article in Admin Panel"
            >
              <Edit2 size={12} className="text-slate-500" />
              <span>Edit in Admin</span>
            </Link>
          </div>
        </div>

        {/* ── 02: ARTICLE HEADER & METADATA ── */}
        <header className="max-w-3xl mx-auto mb-8 sm:mb-12">
          {/* Category Badge */}
          <div className="mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              {category}
            </span>
          </div>

          {/* Large H1 Title (KDnuggets / High Readability Inspired) */}
          <h1 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl text-slate-900 tracking-tight leading-[1.18] mb-5">
            {title}
          </h1>

          {/* Subtitle / Excerpt */}
          <p className="text-lg sm:text-xl text-slate-600 font-sans leading-relaxed font-normal mb-8">
            {excerpt}
          </p>

          {/* Author Meta Bar & Social Share */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200">
            <div className="flex items-center gap-3.5">
              <img
                src={authorAvatar}
                alt={authorName}
                className="h-11 w-11 rounded-full object-cover border-2 border-slate-200 shadow-sm"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = arunProfile;
                }}
              />
              <div>
                <div className="font-bold text-sm text-slate-900">{authorName}</div>
                <div className="text-xs text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                  <span>{publishedDate}</span>
                  <span>•</span>
                  <span>{readTime}</span>
                </div>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 mr-1 hidden sm:inline">Share:</span>
              <button
                onClick={() => handleShare('linkedin')}
                title="Share on LinkedIn"
                className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 transition-colors cursor-pointer"
              >
                <LinkedinIcon size={15} />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                title="Share on X (Twitter)"
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
              >
                <XTwitterIcon size={14} />
              </button>
              <button
                onClick={() => handleShare('copy')}
                title="Copy Article Link"
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
              </button>
            </div>
          </div>
        </header>

        {/* ── 03: HERO COVER IMAGE / VIDEO BANNER ── */}
        {coverImage && (
          <figure className="max-w-4xl mx-auto mb-12 sm:mb-16">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-950 aspect-16/9 sm:aspect-21/9 flex items-center justify-center">
              <img
                src={coverImage}
                alt={title}
                className="w-full h-full object-cover"
                fetchPriority="high"
              />
            </div>
            {imageCaption && (
              <figcaption className="text-center text-xs font-serif italic text-slate-500 mt-3">
                {imageCaption}
              </figcaption>
            )}
          </figure>
        )}

        {/* Mobile Collapsible TOC Dropdown */}
        {headings.length > 0 && (
          <div className="lg:hidden max-w-3xl mx-auto mb-8">
            <button
              onClick={() => setIsMobileTocOpen(!isMobileTocOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800"
            >
              <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-blue-700">
                <List size={14} /> Table of Contents ({headings.length} Sections)
              </span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${isMobileTocOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMobileTocOpen && (
              <div className="mt-2 p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2 text-xs font-sans">
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    onClick={() => setIsMobileTocOpen(false)}
                    className={`block py-1 text-slate-700 hover:text-blue-600 transition-colors ${h.level === 3 ? 'pl-4 text-slate-500' : 'font-semibold'}`}
                  >
                    {h.text}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 04: TWO-COLUMN LAYOUT: MAIN ARTICLE + STICKY TOC ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
          
          {/* Main Article Reading Column (680–760px) */}
          <article className="lg:col-span-8 max-w-3xl font-sans">
            
            {/* Embedded Video (if provided) */}
            {videoUrl && (
              <div className="my-8 rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-video bg-black">
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

            {/* Embedded Power BI / Interactive App (if provided) */}
            {powerbiUrl && (
              <div className="my-8 rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 aspect-16/10">
                <iframe
                  src={powerbiUrl}
                  title="Interactive Report Embed"
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}

            {/* Render Full Technical Markdown Content with High Readability */}
            <div className="article-body">
              {renderFormattedArticle(cleanContent)}
            </div>

            {/* Article Tags */}
            <div className="pt-8 mt-12 border-t border-slate-200 flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mr-2">Tags:</span>
              {tags.map((t) => (
                <span
                  key={t}
                  className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium"
                >
                  #{t}
                </span>
              ))}
            </div>

            {/* GitHub Repo / Live Demo Link Action Box */}
            {(githubLink || liveLink) && (
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 my-10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Explore Source Code & Artifacts</h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Verified repository materials and reproducible scripts.
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
          </article>

          {/* ── 05: DESKTOP STICKY TABLE OF CONTENTS (Right Side) ── */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              
              {/* Table of Contents Box */}
              {headings.length > 0 ? (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 text-blue-700">
                      <List size={14} /> Table of Contents
                    </span>
                    <span className="text-[10px] text-slate-400">{headings.length} sections</span>
                  </div>

                  <nav className="space-y-1.5 text-xs max-h-[60vh] overflow-y-auto pr-1">
                    {headings.map((h) => {
                      const isActive = activeHeadingId === h.id;
                      return (
                        <a
                          key={h.id}
                          href={`#${h.id}`}
                          className={`block py-1 transition-all leading-snug rounded-md px-2 ${
                            h.level === 3 ? 'pl-5 text-[11px]' : 'font-semibold'
                          } ${
                            isActive
                              ? 'bg-blue-100/70 text-blue-700 font-bold translate-x-1'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                          }`}
                        >
                          {h.text}
                        </a>
                      );
                    })}
                  </nav>
                </div>
              ) : null}

              {/* Quick Author Snapshot Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-xs space-y-3">
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
            </div>
          </aside>
        </div>

        {/* ── 06: BOTTOM SECTION: AUTHOR CARD, RELATED POSTS & CTAS ── */}
        <section className="max-w-4xl mx-auto mt-16 pt-12 border-t border-slate-200 space-y-12">
          
          {/* Detailed Author Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-2xs">
            <img
              src={authorAvatar}
              alt={authorName}
              className="h-20 w-20 rounded-full object-cover border-2 border-white shadow-md shrink-0"
            />
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-serif">Written by {authorName}</h3>
                  <p className="text-xs font-mono text-slate-500">{authorRole}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://www.linkedin.com/in/arunpandianp-dataanalyst/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-700 hover:text-[#0077B5] hover:border-[#0077B5]/30 transition-colors"
                  >
                    <FaLinkedin className="text-sm text-[#0077B5]" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href="https://github.com/arun-pandian-p"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-700 hover:text-slate-950 hover:border-slate-400 transition-colors"
                  >
                    <FaGithub className="text-sm text-slate-900" />
                    <span>GitHub</span>
                  </a>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-sans">
                {authorBio}
              </p>
            </div>
          </div>

          {/* Prev / Next Article Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Related Articles Grid */}
          {relatedBlogs.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-xl text-slate-900">
                  Related Technical Publications
                </h4>
                <Link to="/blog" className="text-xs font-mono text-blue-600 hover:underline font-semibold">
                  View All Articles →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {relatedBlogs.map((rb) => (
                  <Link
                    key={rb.id}
                    to={`/blog/${rb.slug || rb.id}`}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all flex flex-col justify-between group shadow-2xs"
                  >
                    <div>
                      {rb.cover_image && (
                        <img
                          src={rb.cover_image}
                          alt={rb.title}
                          className="w-full h-28 object-cover rounded-lg mb-3 bg-slate-900"
                        />
                      )}
                      <h5 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-snug">
                        {rb.title}
                      </h5>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                        {rb.excerpt || 'Data analytics investigation and modeling walk-through.'}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-blue-600 font-bold mt-3 block">
                      Read Article →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Dual CTAs: Explore Projects & Contact Arun */}
          <div className="rounded-2xl sm:rounded-3xl bg-slate-900 text-white p-8 sm:p-10 text-center shadow-lg space-y-6">
            <h2 className="text-2xl sm:text-3xl font-display font-black">
              Interested in more data insights or collaboration?
            </h2>
            <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              Explore interactive dashboards in the portfolio or reach out for data analytics roles, modeling consulting, or business intelligence projects.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-3">
              <Link
                to="/#projects"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Grid size={15} />
                <span>Explore Portfolio Projects</span>
              </Link>
              <Link
                to="/#contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <Mail size={15} />
                <span>Contact Me</span>
              </Link>
              <Link
                to={`/admin/blogs?edit=${blog.id}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium text-xs sm:text-sm transition-all cursor-pointer"
              >
                <Edit2 size={13} className="text-slate-400" />
                <span>Edit in Admin</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Quick Edit Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Link
          to={`/admin/blogs?edit=${blog.id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono font-medium shadow-xl border border-slate-700/80 transition-all hover:scale-105 backdrop-blur-md cursor-pointer"
          title="Edit this article in Admin Panel"
        >
          <Edit2 size={13} className="text-slate-400" />
          <span>Edit in Admin</span>
        </Link>
      </div>
    </div>
  );
}
