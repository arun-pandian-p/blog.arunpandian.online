import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  BookBookmark02Icon,
  Clock01Icon,
  Clapping01Icon,
} from '@hugeicons/core-free-icons';
import { Blog } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { resolveImageUrl, handleImageError } from '../../utils/imageHelper';

interface StoryCardProps {
  blog: Blog;
  onSelectTag?: (tag: string) => void;
  onSelectCategory?: (category: string) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({ blog, onSelectTag, onSelectCategory }) => {
  const { user, openAuthModal } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

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

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openAuthModal('login');
      return;
    }
    setBookmarkLoading(true);
    try {
      const res = await api.toggleBookmark(blog.id);
      setIsBookmarked(res);
    } catch (err) {
      console.error(err);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const formattedDate = blog.published_at || blog.created_at
    ? new Date(blog.published_at || blog.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${blog.author_username || 'engineer'}`;
  const coverUrl = resolveImageUrl(blog.cover_image);

  return (
    <article className="group relative flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all hover:border-emerald-500/40 overflow-hidden">
      {/* Cover Image Thumbnail (mobile: on top, desktop: on right) */}
      {blog.cover_image && (
        <a
          href={`/story/${blog.slug}`}
          className="w-full h-44 sm:w-48 sm:h-36 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 group-hover:opacity-95 transition-opacity sm:order-last"
        >
          <img
            src={coverUrl}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
            loading="lazy"
          />
        </a>
      )}

      {/* Main Body */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Author Header */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={blog.author_avatar || defaultAvatar}
                alt={blog.author_name || 'Author'}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 flex-shrink-0"
              />
              <div className="text-xs truncate">
                <a
                  href={`/author/${blog.author_username || 'arunpandian'}`}
                  className="font-semibold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 truncate"
                  onClick={e => e.stopPropagation()}
                >
                  {blog.author_name || 'Engineering Contributor'}
                </a>
                <span className="text-slate-400 mx-1.5">·</span>
                <span className="text-slate-400">{formattedDate}</span>
              </div>
            </div>

            {blog.category && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  if (onSelectCategory) onSelectCategory(blog.category!);
                }}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 hover:bg-emerald-100 flex-shrink-0"
              >
                {blog.category}
              </button>
            )}
          </div>

          {/* Title & Excerpt */}
          <a href={`/story/${blog.slug}`} className="block group-hover:text-emerald-600 transition-colors">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-1.5 line-clamp-2">
              {blog.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
              {blog.excerpt || 'Read the full engineering story and architectural breakdown...'}
            </p>
          </a>
        </div>

        {/* Footer info: tags, read time, reactions */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {tagsList.slice(0, 2).map(tag => (
              <button
                key={tag}
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  if (onSelectTag) onSelectTag(tag);
                }}
                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors truncate max-w-[120px]"
              >
                #{tag}
              </button>
            ))}
            {tagsList.length > 2 && (
              <span className="text-slate-400 text-[11px]">+{tagsList.length - 2}</span>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <span className="flex items-center gap-1 text-[11px] sm:text-xs">
              <HugeiconsIcon icon={Clock01Icon} size={13} />
              <span>{typeof blog.read_time === 'number' ? `${blog.read_time}m` : blog.read_time || '3 min'}</span>
            </span>

            <span className="flex items-center gap-1 text-[11px] sm:text-xs">
              <HugeiconsIcon icon={Clapping01Icon} size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>{blog.claps_count || 0}</span>
            </span>

            <button
              type="button"
              onClick={handleBookmarkToggle}
              disabled={bookmarkLoading}
              className={`p-1.5 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 touch-manipulation ${
                isBookmarked
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
            >
              <HugeiconsIcon icon={BookBookmark02Icon} size={15} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
