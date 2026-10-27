import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, ThumbsUp, ThumbsDown, Send, User, 
  Clock, Globe, Sparkles, CheckCircle2, ShieldAlert, 
  CornerDownRight, MoreVertical, Flame, RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { api } from '../services/apiClient';

// Cookie helpers
function getCookie(name) {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '';
}

function setCookie(name, value, days = 365) {
  if (typeof document === 'undefined') return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export default function InPageComments({
  itemId,
  itemSlug,
  itemTitle,
  entityType = 'project', // 'project' | 'blog'
  allowComments = true
}) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'top'

  // Logged-in user state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return api.auth.getUser();
    } catch {
      return null;
    }
  });

  // User details state (persisted via cookies & localStorage for guests)
  const [authorName, setAuthorName] = useState('');
  const [authorDomain, setAuthorDomain] = useState('');
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [showEditDetails, setShowEditDetails] = useState(false);

  // Input states
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [commentText, setCommentText] = useState('');

  // Comment like states
  const [commentLikes, setCommentLikes] = useState({});
  const [commentDislikes, setCommentDislikes] = useState({});
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('');

  const targetId = String(itemId || itemSlug || '');
  const targetSlug = itemSlug || (itemId ? `${entityType}_${itemId}` : targetId);
  const targetTitle = itemTitle || `${entityType === 'project' ? 'Project' : 'Blog'} Discussion`;

  // Resolved identity fields
  const isLoggedIn = Boolean(currentUser && (currentUser.username || currentUser.email || currentUser.fullName));
  // User instruction: "name from username and email takeup"
  const loggedInUsername = currentUser?.username || currentUser?.fullName || currentUser?.name || (currentUser?.email ? currentUser.email.split('@')[0] : '');
  const loggedInEmail = currentUser?.email || '';
  const loggedInDomain = currentUser?.website || currentUser?.github || '';
  const effectiveAuthorName = isLoggedIn ? loggedInUsername : authorName;

  // Load saved identity on mount + sync logged-in account
  useEffect(() => {
    const savedName = localStorage.getItem('commenter_name') || getCookie('commenter_name');
    const savedDomain = localStorage.getItem('commenter_domain') || getCookie('commenter_domain');

    if (savedName) {
      setAuthorName(savedName);
      setReplyAuthor(savedName);
      setIsProfileSaved(true);
    }
    if (savedDomain) {
      setAuthorDomain(savedDomain);
    }

    // Check existing session
    if (api.auth.isAuthenticated()) {
      const u = api.auth.getUser();
      if (u) setCurrentUser(u);
      api.auth.me().then((meUser) => {
        if (meUser) setCurrentUser(meUser);
      }).catch(() => {});
    } else if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setCurrentUser({
            email: session.user.email,
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
            fullName: session.user.user_metadata?.full_name || 'User',
            avatarUrl: session.user.user_metadata?.avatar_url,
          });
        }
      }).catch(() => {});
    }

    let authSub = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const stored = api.auth.getUser();
          setCurrentUser(stored || {
            email: session.user.email,
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
            fullName: session.user.user_metadata?.full_name || 'User',
            avatarUrl: session.user.user_metadata?.avatar_url,
          });
        } else if (!api.auth.isAuthenticated()) {
          setCurrentUser(null);
        }
      });
      authSub = data?.subscription;
    }

    return () => {
      if (authSub) authSub.unsubscribe();
    };
  }, []);

  // Fetch all comments (both from API endpoint and Supabase fallback)
  const fetchComments = async (silent = false) => {
    if (!targetSlug && !targetId) return;
    if (!silent) setLoading(true);

    try {
      // 1. Fetch from /api/comments endpoint (has server-side access to all community comments)
      const res = await fetch(`/api/comments?targetSlug=${encodeURIComponent(targetSlug)}&targetId=${encodeURIComponent(targetId)}&entityType=${entityType}`);
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.comments)) {
          setComments(json.comments);
          if (!silent) setLoading(false);
          return;
        }
      }
    } catch (apiErr) {
      console.warn('API comments fetch notice, trying direct DB fallback:', apiErr);
    }

    // 2. Direct Supabase fallback
    try {
      if (supabase) {
        const prefix = entityType === 'project' ? '[Project Comment' : '[Blog Comment';
        const { data: msgData } = await supabase
          .from('contact_messages')
          .select('*')
          .or(`subject.ilike.%${prefix}%${targetSlug}%,subject.ilike.%${prefix}%${targetId}%`)
          .order('created_at', { ascending: false });

        if (msgData && msgData.length > 0) {
          const parsed = msgData.map((m) => {
            let domain = '';
            let body = m.message || '';
            if (body.startsWith('Domain: ')) {
              const parts = body.split('\n');
              domain = parts[0].replace('Domain: ', '').trim();
              body = parts.slice(1).join('\n').trim();
            }
            return {
              id: m.id,
              author_name: m.name,
              author_domain: domain,
              content: body,
              created_at: m.created_at,
              likes: 0
            };
          });
          setComments(parsed);
        }
      }
    } catch (err) {
      console.warn('Direct DB fetch notice:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial fetch and Realtime updates
  useEffect(() => {
    fetchComments();

    // Set up Real-time channel via Supabase if available
    let channel = null;
    if (supabase) {
      try {
        channel = supabase
          .channel(`realtime-comments-${targetId}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'contact_messages' },
            () => {
              fetchComments(true);
            }
          )
          .subscribe();
      } catch (e) {
        console.warn('Realtime channel error:', e);
      }
    }

    // Polling fallback every 8 seconds for live updates
    const pollInterval = setInterval(() => {
      fetchComments(true);
    }, 8000);

    return () => {
      clearInterval(pollInterval);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [targetSlug, targetId]);

  // Handle Comment Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = (isLoggedIn ? loggedInUsername : authorName).trim();
    const cleanDomain = (isLoggedIn ? (loggedInDomain || authorDomain) : authorDomain).trim().replace(/^https?:\/\//, '');
    const cleanEmail = (isLoggedIn ? loggedInEmail : '').trim();
    const cleanText = commentText.trim();

    if (!cleanName) {
      toast.error('Please enter your name');
      if (!isLoggedIn) setShowEditDetails(true);
      return;
    }
    if (!cleanText) {
      toast.error('Please type a comment');
      return;
    }

    // Save identity in Cookie & LocalStorage only for guest commenters
    if (!isLoggedIn) {
      localStorage.setItem('commenter_name', cleanName);
      setCookie('commenter_name', cleanName, 365);
      if (cleanDomain) {
        localStorage.setItem('commenter_domain', cleanDomain);
        setCookie('commenter_domain', cleanDomain, 365);
      }
      setIsProfileSaved(true);
      setShowEditDetails(false);
    }

    setSubmitting(true);

    const tempComment = {
      id: `temp-${Date.now()}`,
      blog_slug: targetSlug,
      blog_id: targetId,
      blog_title: targetTitle,
      author_name: cleanName,
      author_domain: cleanDomain,
      content: cleanText,
      created_at: new Date().toISOString(),
      likes: 0
    };

    // Optimistically add to list
    setComments((prev) => [tempComment, ...prev]);
    setCommentText('');
    setIsInputFocused(false);

    try {
      // 1. Try POST to /api/comments
      const token = api.auth.getToken();
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          targetSlug: targetSlug,
          target_slug: targetSlug,
          blogId: targetId ? targetId : undefined,
          blog_id: targetId,
          blog_slug: targetSlug,
          blog_title: targetTitle,
          authorName: cleanName,
          author_name: cleanName,
          authorEmail: cleanEmail || undefined,
          author_email: cleanEmail || undefined,
          authorDomain: cleanDomain || undefined,
          author_domain: cleanDomain || undefined,
          content: cleanText,
          entityType: entityType
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result?.comment) {
          setComments((prev) => 
            prev.map(c => c.id === tempComment.id ? result.comment : c)
          );
        }
        toast.success(`Comment posted live!`, { icon: '💬' });
      } else {
        // Fallback insert directly via Supabase client
        if (supabase) {
          await supabase.from('contact_messages').insert([{
            name: cleanName,
            email: cleanEmail || (cleanDomain ? `user@${cleanDomain}` : 'reader@arunpandian.online'),
            subject: `[${entityType === 'project' ? 'Project' : 'Blog'} Comment - ${targetSlug}]`,
            message: `${cleanDomain ? `Domain: ${cleanDomain}\n` : ''}${cleanText}`,
            read: false
          }]);
        }
        toast.success(`Comment posted live!`, { icon: '💬' });
      }
    } catch (err) {
      console.warn('Comment post fallback:', err);
      if (supabase) {
        try {
          await supabase.from('contact_messages').insert([{
            name: cleanName,
            email: cleanEmail || (cleanDomain ? `user@${cleanDomain}` : 'reader@arunpandian.online'),
            subject: `[${entityType === 'project' ? 'Project' : 'Blog'} Comment - ${targetSlug}]`,
            message: `${cleanDomain ? `Domain: ${cleanDomain}\n` : ''}${cleanText}`,
            read: false
          }]);
        } catch (_) {}
      }
      toast.success('Comment posted!', { icon: '✨' });
    } finally {
      setSubmitting(false);
      // Refresh to ensure synced with DB
      setTimeout(() => fetchComments(true), 1200);
    }
  };

  // Like a comment (YouTube style)
  const handleLikeComment = (commentId) => {
    setCommentLikes((prev) => {
      const current = prev[commentId] || 0;
      const isLiked = current > 0;
      const updated = { ...prev, [commentId]: isLiked ? 0 : current + 1 };
      
      if (!isLiked && commentDislikes[commentId]) {
        setCommentDislikes((dPrev) => ({ ...dPrev, [commentId]: false }));
      }
      return updated;
    });
  };

  // Dislike a comment (YouTube style)
  const handleDislikeComment = (commentId) => {
    setCommentDislikes((prev) => {
      const isDisliked = !prev[commentId];
      if (isDisliked && commentLikes[commentId]) {
        setCommentLikes((lPrev) => ({ ...lPrev, [commentId]: 0 }));
      }
      return { ...prev, [commentId]: isDisliked };
    });
  };

  // Relative timestamp helper (YouTube style)
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    const now = new Date();
    const past = new Date(dateStr);
    const diffSecs = Math.floor((now - past) / 1000);

    if (diffSecs < 60) return 'Just now';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'top') {
      const aScore = (a.likes || 0) + (commentLikes[a.id] || 0);
      const bScore = (b.likes || 0) + (commentLikes[b.id] || 0);
      return bScore - aScore;
    }
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  return (
    <section id="comments-section" className="pt-10 pb-6 border-t border-slate-200 scroll-mt-24">
      {/* ── YouTube-Style Comments Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h3 className="font-display font-black text-xl sm:text-2xl text-slate-900 tracking-tight flex items-center gap-2">
            <span>{comments.length} Comments</span>
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-mono font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Real-Time
          </span>
        </div>

        {/* Sort Filter (Top / Newest) */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Sort by:</span>
          <button
            onClick={() => setSortBy('newest')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              sortBy === 'newest'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Newest First
          </button>
          <button
            onClick={() => setSortBy('top')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              sortBy === 'top'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Top Rated
          </button>
        </div>
      </div>

      {!allowComments ? (
        <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
          <ShieldAlert size={28} className="mx-auto text-amber-500" />
          <h4 className="font-bold text-sm text-slate-800">Comments are turned off</h4>
          <p className="text-xs text-slate-500">Responses have been paused for this investigation.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── YouTube-Style Input Box ── */}
          <div className="flex gap-3 sm:gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center font-mono shrink-0 shadow-xs overflow-hidden">
              {currentUser?.avatarUrl || currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatarUrl || currentUser.avatar_url}
                  alt={loggedInUsername}
                  className="w-full h-full object-cover"
                />
              ) : (
                effectiveAuthorName ? effectiveAuthorName.charAt(0).toUpperCase() : <User size={16} />
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex-1 space-y-3">
              {/* Identity Badge: shows verified logged-in account or remembered guest */}
              {isLoggedIn ? (
                <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate">
                      Commenting as <strong className="text-slate-900 font-bold">@{loggedInUsername}</strong>
                      {loggedInEmail && (
                        <span className="text-slate-400 font-mono text-[11px] ml-1.5 hidden sm:inline">({loggedInEmail})</span>
                      )}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full shrink-0 ml-2">
                    Logged In
                  </span>
                </div>
              ) : (
                isProfileSaved && authorName && (
                  <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Commenting as <strong className="text-slate-900 font-bold">{authorName}</strong></span>
                      {authorDomain && (
                        <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">({authorDomain})</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEditDetails(!showEditDetails)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-[11px] font-mono hover:underline cursor-pointer shrink-0 ml-2"
                    >
                      {showEditDetails ? 'Done' : 'Change Name'}
                    </button>
                  </div>
                )
              )}

              <div className="space-y-2">
                <textarea
                  required
                  rows={isInputFocused ? 3 : 2}
                  onFocus={() => setIsInputFocused(true)}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    isLoggedIn
                      ? `Add a comment as @${loggedInUsername}...`
                      : (authorName 
                          ? `Add a comment as ${authorName}...` 
                          : "Add a comment or analytical thought...")
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 outline-none leading-relaxed transition-all resize-y shadow-2xs"
                />

                {/* Name & Details Inputs (Shown ONLY for guests when NOT logged in; completely removed after login) */}
                {!isLoggedIn && (showEditDetails || (!isProfileSaved && isInputFocused)) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl bg-blue-50/60 border border-blue-200/70 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-600 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Rivera"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:border-blue-600 outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-600 mb-1">
                        Website / LinkedIn / GitHub (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. linkedin.com/in/alex"
                        value={authorDomain}
                        onChange={(e) => setAuthorDomain(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:border-blue-600 outline-none font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {isInputFocused && (
                <div className="flex items-center justify-between pt-1 animate-in fade-in duration-150">
                  <span className="text-[11px] font-mono text-slate-400">
                    ✦ Stored in Supabase · Markdown supported
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsInputFocused(false);
                        setCommentText('');
                      }}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !commentText.trim()}
                      className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Send size={12} />
                      <span>{submitting ? 'Posting...' : 'Comment'}</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* ── YouTube-Style Comments Feed List ── */}
          <div className="space-y-4 pt-4">
            {loading ? (
              <div className="py-12 text-center text-xs font-mono text-slate-400 space-y-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading real-time community discussion...</p>
              </div>
            ) : sortedComments.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <MessageSquare size={24} className="mx-auto text-slate-400" />
                <p className="font-semibold text-slate-700">No comments yet</p>
                <p className="text-slate-400">Be the first to share your feedback or ask an analytical question!</p>
              </div>
            ) : (
              sortedComments.map((comment, idx) => {
                const commentId = comment.id || idx;
                const likes = (comment.likes || 0) + (commentLikes[commentId] || 0);
                const isLiked = (commentLikes[commentId] || 0) > 0;
                const isDisliked = Boolean(commentDislikes[commentId]);

                return (
                  <div 
                    key={commentId}
                    className="flex gap-3 sm:gap-4 items-start p-4 rounded-2xl bg-white hover:bg-slate-50/60 border border-slate-100 hover:border-slate-200 transition-colors shadow-2xs group"
                  >
                    {/* User Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-800 to-slate-950 text-white font-bold text-xs flex items-center justify-center font-mono shrink-0 shadow-xs">
                      {comment.author_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      {/* Name, Badge, Date */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-slate-900 leading-tight">
                          {comment.author_name}
                        </span>

                        {comment.author_domain && (
                          <a
                            href={comment.author_domain.startsWith('http') ? comment.author_domain : `https://${comment.author_domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] font-semibold border border-blue-200/60 hover:underline"
                          >
                            <Globe size={9} />
                            <span>{comment.author_domain.replace(/^https?:\/\//, '').slice(0, 24)}</span>
                          </a>
                        )}

                        <span className="text-slate-400 text-[11px] font-mono">
                          {formatTimeAgo(comment.created_at)}
                        </span>
                      </div>

                      {/* Comment Body */}
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line">
                        {comment.content}
                      </p>

                      {/* YouTube Action Bar: Like, Dislike, Reply */}
                      <div className="flex items-center gap-3 pt-1 text-xs text-slate-500">
                        {/* Like Button */}
                        <button
                          onClick={() => handleLikeComment(commentId)}
                          className={`flex items-center gap-1 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer ${
                            isLiked ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Like comment"
                        >
                          <ThumbsUp size={13} className={isLiked ? 'fill-blue-600' : ''} />
                          {likes > 0 && <span className="font-mono text-[11px]">{likes}</span>}
                        </button>

                        {/* Dislike Button */}
                        <button
                          onClick={() => handleDislikeComment(commentId)}
                          className={`p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer ${
                            isDisliked ? 'text-rose-600' : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Dislike comment"
                        >
                          <ThumbsDown size={13} className={isDisliked ? 'fill-rose-600' : ''} />
                        </button>

                        {/* Reply Button */}
                        <button
                          onClick={() => setReplyingToId(replyingToId === commentId ? null : commentId)}
                          className="px-2 py-0.5 rounded-md hover:bg-slate-100 font-semibold text-[11px] transition-colors cursor-pointer"
                        >
                          Reply
                        </button>
                      </div>

                      {/* Nested Reply Box */}
                      {replyingToId === commentId && (
                        <div className="mt-3 pl-3 sm:pl-4 border-l-2 border-blue-300 space-y-2 pt-1 animate-in fade-in duration-150">
                          {!isLoggedIn && (
                            <input
                              type="text"
                              placeholder="Your Name *"
                              value={replyAuthor || authorName}
                              onChange={(e) => setReplyAuthor(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 outline-none"
                            />
                          )}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder={`Reply to @${comment.author_name}...`}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 outline-none"
                            />
                            <button
                              type="button"
                              onClick={async () => {
                                const sender = (isLoggedIn ? loggedInUsername : (replyAuthor || authorName)).trim();
                                if (!replyText.trim() || !sender) {
                                  toast.error(isLoggedIn ? 'Please enter a reply' : 'Please enter your name and reply');
                                  return;
                                }
                                
                                const replyContent = `@${comment.author_name} ${replyText.trim()}`;
                                const token = api.auth.getToken();
                                
                                try {
                                  await fetch('/api/comments', {
                                    method: 'POST',
                                    headers: { 
                                      'Content-Type': 'application/json',
                                      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                                    },
                                    body: JSON.stringify({
                                      targetSlug: targetSlug,
                                      target_slug: targetSlug,
                                      blog_slug: targetSlug,
                                      blog_id: targetId,
                                      blogId: targetId ? targetId : undefined,
                                      blog_title: targetTitle,
                                      authorName: sender,
                                      author_name: sender,
                                      authorEmail: (isLoggedIn ? loggedInEmail : undefined),
                                      author_email: (isLoggedIn ? loggedInEmail : undefined),
                                      content: replyContent,
                                      entityType: entityType
                                    })
                                  });
                                } catch (_) {}
                                
                                toast.success(`Reply posted to @${comment.author_name}!`, { icon: '💬' });
                                setReplyText('');
                                setReplyingToId(null);
                                setTimeout(() => fetchComments(true), 800);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold font-mono hover:bg-blue-500 transition-colors cursor-pointer"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </section>
  );
}
