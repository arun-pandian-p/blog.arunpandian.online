import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Bookmark as BookmarkIcon,
  Trash2,
  Clock,
  Calendar,
  ArrowLeft,
  BookOpen,
  Loader2,
  LogIn
} from 'lucide-react';
import BlogNavbar from '../components/BlogNavbar';
import MobileBottomNav from '../components/MobileBottomNav';
import { api } from '../services/apiClient';
import toast from 'react-hot-toast';
import ArticleImage from '../components/common/ArticleImage';
import { supabase } from '../lib/supabaseClient';

export default function BookmarksPage() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = api.auth.isAuthenticated();
  const currentUser = api.auth.getUser();

  const fetchBookmarks = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api.bookmarks.getBookmarks();
      setBookmarks(data || []);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      toast.error('Could not load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();

    let channel = null;
    if (supabase && currentUser?.id) {
      channel = supabase
        .channel(`realtime:bookmarks:${currentUser.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookmarks',
            filter: `user_id=eq.${currentUser.id}`,
          },
          () => {
            fetchBookmarks();
          }
        )
        .subscribe();
    }

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [isAuthenticated, currentUser?.id]);

  const handleRemove = async (blogId, title) => {
    try {
      await api.bookmarks.remove(blogId);
      setBookmarks((prev) => prev.filter((b) => b.blogId !== blogId));
      toast.success(`Removed "${title}" from your bookmarks`);
    } catch (err) {
      toast.error('Failed to remove bookmark');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C1A17] font-sans antialiased selection:bg-[#B83A26]/10 selection:text-[#B83A26]">
      <Helmet>
        <title>Reading List & Bookmarks — blog.arunpandian.online</title>
        <meta name="description" content="Access your saved articles and reading list on blog.arunpandian.online." />
      </Helmet>

      <BlogNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-24">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#7A7265] hover:text-[#B83A26] transition-colors mb-4"
          >
            <ArrowLeft size={14} />
            <span>Back to All Articles</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#B83A26]/10 text-[#B83A26] flex items-center justify-center">
              <BookmarkIcon size={20} />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-black text-[#1C1A17]">
                Your Reading List
              </h1>
              <p className="text-xs font-mono text-[#8C8479]">
                Articles you've saved for later reading
              </p>
            </div>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E7E0D3] p-8 shadow-xs">
            <BookmarkIcon size={44} className="mx-auto text-[#8C8479] mb-4 opacity-50" />
            <h2 className="font-serif text-xl font-bold text-[#1C1A17] mb-2">Sign in to save articles</h2>
            <p className="text-xs sm:text-sm text-[#7A7265] max-w-md mx-auto mb-6">
              Create an account or log in to sync your bookmarks across devices.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1C1A17] text-white text-xs font-mono font-bold hover:bg-[#B83A26] transition-colors"
            >
              <LogIn size={14} />
              <span>Sign In / Register</span>
            </Link>
          </div>
        ) : loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-[#7A7265]">
            <Loader2 size={32} className="animate-spin text-[#B83A26]" />
            <p className="font-mono text-xs uppercase tracking-widest">Loading your saved articles...</p>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E7E0D3] p-8 shadow-xs">
            <BookOpen size={44} className="mx-auto text-[#8C8479] mb-4 opacity-50" />
            <h2 className="font-serif text-xl font-bold text-[#1C1A17] mb-2">Your reading list is empty</h2>
            <p className="text-xs sm:text-sm text-[#7A7265] max-w-md mx-auto mb-6">
              When browsing articles, click the bookmark icon to save them here for later.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1C1A17] text-white text-xs font-mono font-bold hover:bg-[#B83A26] transition-colors"
            >
              Explore Articles
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#EBE4D8] bg-white rounded-3xl border border-[#E7E0D3] overflow-hidden shadow-xs">
            {bookmarks.map((item) => (
              <div key={item.id} className="p-6 sm:p-7 hover:bg-[#FBF9F5]/70 transition-colors flex items-start justify-between gap-5 group">
                <div className="flex-1 space-y-2">
                  <h3 className="font-serif text-lg font-bold text-[#1C1A17] group-hover:text-[#B83A26] transition-colors">
                    <Link to={`/posts/${item.blogSlug || item.blogId}`}>
                      {item.blogTitle || 'Untitled Article'}
                    </Link>
                  </h3>
                  {item.blogExcerpt && (
                    <p className="text-xs text-[#5C5549] line-clamp-2 leading-relaxed">
                      {item.blogExcerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-[#8C8479]">
                    {item.authorName && <span>By {item.authorName}</span>}
                    {item.readTime && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {item.readTime}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link to={`/posts/${item.blogSlug || item.blogId}`} className="w-20 h-20 shrink-0 hidden sm:block">
                    <ArticleImage
                      src={item.coverImage}
                      alt={item.blogTitle}
                      aspectRatio="square"
                      containerClassName="w-20 h-20 rounded-xl"
                    />
                  </Link>
                  <button
                    onClick={() => handleRemove(item.blogId, item.blogTitle)}
                    title="Remove from bookmarks"
                    className="p-2 text-[#8C8479] hover:text-[#B83A26] hover:bg-[#F2ECE1] rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
}
