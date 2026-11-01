import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  BookBookmark02Icon,
  Share01Icon,
  Clock01Icon,
  Calendar01Icon,
  Alert02Icon,
  ArrowLeft01Icon,
  PencilEdit02Icon,
  SparklesIcon,
  UserIcon,
  DiscountTag01Icon,
} from '@hugeicons/core-free-icons';
import { Blog } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ClapButton } from '../components/story/ClapButton';
import { CommentSection } from '../components/story/CommentSection';
import { ShareModal } from '../components/common/ShareModal';
import { ReportModal } from '../components/common/ReportModal';
import { normalizeContentToHtml } from '../utils/contentConverter';
import { resolveImageUrl, handleImageError } from '../utils/imageHelper';

interface StoryDetailPageProps {
  slug: string;
}

export const StoryDetailPage: React.FC<StoryDetailPageProps> = ({ slug }) => {
  const { user, openAuthModal, isAdmin } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    loadStory();
  }, [slug]);

  // Track reading scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadStory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBlogBySlug(slug);
      setBlog(data);
      // Increment views count
      api.incrementViews(data.id);
      // Check bookmark if user logged in
      if (user) {
        api.checkBookmark(data.id).then(setIsBookmarked).catch(() => {});
      }
    } catch (err: any) {
      setError(err.message || 'Story not found');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (!blog) return;
    try {
      const res = await api.toggleBookmark(blog.id);
      setIsBookmarked(res);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="w-1/3 h-4 bg-slate-200 dark:bg-slate-800 rounded mx-auto mb-4" />
        <div className="w-3/4 h-10 bg-slate-200 dark:bg-slate-800 rounded mx-auto mb-8" />
        <div className="w-full h-80 bg-slate-100 dark:bg-slate-850 rounded-2xl mb-8" />
        <div className="space-y-4">
          <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="w-5/6 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="w-4/6 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <HugeiconsIcon icon={Alert02Icon} size={48} className="text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Story Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">The article you requested could not be located or has been archived.</p>
        <a
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          <span>Back to Journal Feed</span>
        </a>
      </div>
    );
  }

  const tagsList = (() => {
    if (Array.isArray(blog.tags)) return blog.tags;
    if (typeof blog.tags === 'string' && blog.tags.trim()) {
      try {
        const parsed = JSON.parse(blog.tags);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
      return blog.tags.split(',').map(t => t.trim().replace(new RegExp('^[\\["\'\\s]+|[\\]"\'\\s]+$', 'g'), '')).filter(Boolean);
    }
    return [];
  })();

  const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${blog.author_username || 'dev'}`;
  const formattedDate = blog.published_at || blog.created_at
    ? new Date(blog.published_at || blog.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  const isOwner = user && (user.id === blog.author_id || user.username === blog.author_username);
  const coverUrl = resolveImageUrl(blog.cover_image);

  return (
    <div className="relative animate-in fade-in duration-200 pb-24">
      {/* Scroll Progress Bar at very top */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-transparent pointer-events-none">
        <div
          className="h-full bg-emerald-500 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Back Link */}
        <a
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-600 mb-6 transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
          <span>Back to Engineering Feed</span>
        </a>

        {/* Category Badge & Status */}
        <div className="flex items-center gap-2 mb-4">
          {blog.category && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {blog.category}
            </span>
          )}
          {!blog.published && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Draft (Unpublished)
            </span>
          )}
        </div>

        {/* Article Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.2]">
          {blog.title}
        </h1>

        {/* Excerpt */}
        {blog.excerpt && (
          <p className="text-lg text-slate-600 dark:text-slate-300 font-serif italic mb-6 leading-relaxed">
            "{blog.excerpt}"
          </p>
        )}

        {/* Author Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200 dark:border-slate-800 mb-8">
          <div className="flex items-center gap-3">
            <a href={`/author/${blog.author_username || 'dev'}`}>
              <img
                src={blog.author_avatar || defaultAvatar}
                alt={blog.author_name}
                className="w-12 h-12 rounded-full border-2 border-slate-200 dark:border-slate-700 object-cover bg-slate-100"
              />
            </a>
            <div>
              <a
                href={`/author/${blog.author_username || 'dev'}`}
                className="font-bold text-sm text-slate-900 dark:text-white hover:text-emerald-600"
              >
                {blog.author_name || 'Engineering Contributor'}
              </a>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <HugeiconsIcon icon={Calendar01Icon} size={14} />
                  <span>{formattedDate}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <HugeiconsIcon icon={Clock01Icon} size={14} />
                  <span>{typeof blog.read_time === 'number' ? `${blog.read_time} min read` : blog.read_time || '3 min read'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Social / Action Buttons */}
          <div className="flex items-center gap-2">
            {(isOwner || isAdmin) && (
              <a
                href={`/edit/${blog.id}`}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <HugeiconsIcon icon={PencilEdit02Icon} size={14} />
                <span>Edit</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleBookmarkToggle}
              className={`p-2 rounded-full border transition-colors ${
                isBookmarked
                  ? 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-400'
              }`}
              title={isBookmarked ? 'Bookmarked' : 'Bookmark story'}
            >
              <HugeiconsIcon icon={BookBookmark02Icon} size={16} />
            </button>

            <button
              type="button"
              onClick={() => setShareModalOpen(true)}
              className="p-2 rounded-full border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-400 transition-colors"
              title="Share story"
            >
              <HugeiconsIcon icon={Share01Icon} size={16} />
            </button>

            <button
              type="button"
              onClick={() => setReportModalOpen(true)}
              className="p-2 rounded-full border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-400 transition-colors"
              title="Report content"
            >
              <HugeiconsIcon icon={Alert02Icon} size={16} />
            </button>
          </div>
        </div>

        {/* Cover Image Banner (if available) */}
        {blog.cover_image && (
          <div className="rounded-2xl overflow-hidden mb-10 border border-slate-200 dark:border-slate-800 max-h-[500px] bg-slate-100 dark:bg-slate-900">
            <img
              src={coverUrl}
              alt={blog.title}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          </div>
        )}

        {/* Story Body Content */}
        <div
          className="ProseMirror prose prose-slate dark:prose-invert max-w-none mb-12 text-slate-800 dark:text-slate-100"
          dangerouslySetInnerHTML={{ __html: normalizeContentToHtml(blog.content) }}
        />

        {/* Tags footer */}
        {tagsList.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-10 pt-6 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <HugeiconsIcon icon={DiscountTag01Icon} size={14} />
              <span>Tags:</span>
            </span>
            {tagsList.map(tag => (
              <a
                key={tag}
                href={`/?tag=${encodeURIComponent(tag)}`}
                className="px-3 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                #{tag}
              </a>
            ))}
          </div>
        )}

        {/* Floating / Sticky Clapping Action Card */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 mb-12">
          <div className="flex items-center gap-3">
            <ClapButton blogId={blog.id} initialCount={blog.claps_count || 0} />
            <span className="text-xs text-slate-500">
              Found this writeup useful? Give it up to 50 claps!
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
          >
            <HugeiconsIcon icon={Share01Icon} size={14} className="text-slate-400" />
            <span>Share Article</span>
          </button>
        </div>

        {/* Author Footer Card */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 mb-12 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <img
            src={blog.author_avatar || defaultAvatar}
            alt={blog.author_name}
            className="w-16 h-16 rounded-full border-2 border-emerald-500/40 object-cover bg-slate-100"
          />
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
              Written by {blog.author_name || 'Engineering Contributor'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              {blog.author_bio || 'Software engineer sharing deep-dives into modern architecture, backend design, and production lessons.'}
            </p>
            <a
              href={`/author/${blog.author_username || 'dev'}`}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <HugeiconsIcon icon={UserIcon} size={14} />
              <span>View full author profile &amp; stories</span>
            </a>
          </div>
        </div>

        {/* Comments Section */}
        <CommentSection blogId={blog.id} />
      </article>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={blog.title}
        slug={blog.slug}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetId={blog.id}
        targetType="blog"
      />
    </div>
  );
};
