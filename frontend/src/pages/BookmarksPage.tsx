import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  BookBookmark02Icon,
  ArrowLeft01Icon,
  Delete02Icon,
  Clock01Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';
import { Bookmark as BookmarkType } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const BookmarksPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadBookmarks();
  }, [user]);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const data = await api.getBookmarks();
      setBookmarks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (blogId: string) => {
    try {
      await api.toggleBookmark(blogId);
      setBookmarks(prev => prev.filter(b => b.blog_id !== blogId));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <HugeiconsIcon icon={BookBookmark02Icon} size={48} className="text-slate-300 dark:text-slate-700 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sign in to View Saved Stories</h2>
        <p className="text-sm text-slate-500 mb-6">
          Keep track of important engineering posts, system designs, and code snippets.
        </p>
        <button
          type="button"
          onClick={() => openAuthModal('login')}
          className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-200">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <HugeiconsIcon icon={BookBookmark02Icon} size={28} className="text-emerald-600 dark:text-emerald-400" />
            <span>Saved Engineering Stories</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {bookmarks.length} {bookmarks.length === 1 ? 'story' : 'stories'} saved to your personal reading list
          </p>
        </div>

        <a
          href="/"
          className="text-xs font-semibold text-slate-500 hover:text-emerald-600 flex items-center gap-1"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
          <span>Feed</span>
        </a>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          Loading saved stories...
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <HugeiconsIcon icon={SparklesIcon} size={40} className="text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">No saved stories yet</h3>
          <p className="text-xs text-slate-500 mb-4">Click the bookmark icon on any article to save it for later reading.</p>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
          >
            Explore Feed
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map(item => {
            const blog = item.blog;
            if (!blog) return null;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:shadow-sm transition-all"
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {blog.author_name || 'Engineer'}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <HugeiconsIcon icon={Clock01Icon} size={12} />
                      <span>{typeof blog.read_time === 'number' ? `${blog.read_time} min read` : blog.read_time || '3 min read'}</span>
                    </span>
                  </div>

                  <a
                    href={`/story/${blog.slug}`}
                    className="font-bold text-base text-slate-900 dark:text-white hover:text-emerald-600 transition-colors line-clamp-1 mb-1"
                  >
                    {blog.title}
                  </a>

                  {blog.excerpt && (
                    <p className="text-xs text-slate-500 line-clamp-1">{blog.excerpt}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(item.blog_id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                  title="Remove from saved stories"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
