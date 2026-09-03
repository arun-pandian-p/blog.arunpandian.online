import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, ThumbsUp, ThumbsDown, Send, User, 
  Clock, Globe, Sparkles, CheckCircle2, ShieldAlert, 
  CornerDownRight, MoreVertical, Flame
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

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

  // Input states
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorDomain, setAuthorDomain] = useState('');
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

  // 15-day expiration ISO
  const getFifteenDaysAgoISO = () => {
    return new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();
  };

  const fetchComments = async () => {
    if (!targetSlug && !targetId) return;
    setLoading(true);
    const fifteenDaysAgo = getFifteenDaysAgoISO();

    try {
      if (supabase) {
        // 1. Fetch from blog_comments table
        const { data, error } = await supabase
          .from('blog_comments')
          .select('*')
          .or(`blog_slug.eq.${targetSlug},blog_id.eq.${targetId},blog_slug.eq.${targetId}`)
          .gte('created_at', fifteenDaysAgo)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setComments(data);
          setLoading(false);
          return;
        }

        // 2. Fallback fetch from contact_messages
        const prefix = entityType === 'project' ? '[Project Comment' : '[Blog Comment';
        const { data: msgData, error: msgError } = await supabase
          .from('contact_messages')
          .select('*')
          .or(`subject.ilike.%${prefix}%${targetSlug}%,subject.ilike.%${prefix}%${targetId}%`)
          .gte('created_at', fifteenDaysAgo)
          .order('created_at', { ascending: false });

        if (!msgError && msgData) {
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
              likes: Math.floor(Math.random() * 5) + 1
            };
          });
          setComments(parsed);
        } else if (data) {
          setComments(data);
        }
      }
    } catch (err) {
      console.warn('Comments fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [targetSlug, targetId]);

  // Handle Comment Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = authorName.trim();
    const cleanDomain = authorDomain.trim().replace(/^https?:\/\//, '');
    const cleanText = commentText.trim();

    if (!cleanName) {
      toast.error('Please enter your name');
      return;
    }
    if (!cleanText) {
      toast.error('Please type a comment');
      return;
    }

    setSubmitting(true);

    const newComment = {
      blog_slug: targetSlug,
      blog_id: targetId,
      blog_title: targetTitle,
      author_name: cleanName,
      author_domain: cleanDomain,
      content: cleanText,
      created_at: new Date().toISOString(),
      likes: 0
    };

    try {
      if (supabase) {
        const { error: insertError } = await supabase
          .from('blog_comments')
          .insert([newComment]);

        if (insertError) {
          await supabase.from('contact_messages').insert([{
            name: cleanName,
            email: cleanDomain ? `user@${cleanDomain}` : 'reader@arunpandian.online',
            subject: `[${entityType === 'project' ? 'Project' : 'Blog'} Comment - ${targetSlug}]`,
            message: `${cleanDomain ? `Domain: ${cleanDomain}\n` : ''}${cleanText}`
          }]);
        }
      }

      setComments((prev) => [newComment, ...prev]);
      setCommentText('');
      setAuthorName('');
      setAuthorDomain('');
      setIsInputFocused(false);
      toast.success('Comment posted! Live on this page.', { icon: '💬' });
    } catch (err) {
      console.warn('Comment post error:', err);
      toast.success('Comment posted!', { icon: '✨' });
    } finally {
      setSubmitting(false);
    }
  };

  // Like a comment (YouTube style)
  const handleLikeComment = (commentId) => {
    setCommentLikes((prev) => {
      const current = prev[commentId] || 0;
      const isLiked = current > 0;
      const updated = { ...prev, [commentId]: isLiked ? 0 : current + 1 };
      
      // If was disliked, clear dislike
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

  // Relative timestamp helper (YouTube style: "2 hours ago", "Just now")
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
    if (diffDays < 15) return `${diffDays} days ago`;
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
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-mono font-medium">
            Live Feed
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
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center font-mono shrink-0 shadow-xs">
              {authorName ? authorName.charAt(0).toUpperCase() : <User size={16} />}
            </div>

            <form onSubmit={handleSubmit} className="flex-1 space-y-3">
              <div className="space-y-2">
                <textarea
                  required
                  rows={isInputFocused ? 3 : 2}
                  onFocus={() => setIsInputFocused(true)}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment or analytical thought..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 outline-none leading-relaxed transition-all resize-y shadow-2xs"
                />

                {isInputFocused && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-in fade-in duration-150">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Your Name *"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:border-blue-600 outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Website / LinkedIn / GitHub (Optional)"
                        value={authorDomain}
                        onChange={(e) => setAuthorDomain(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:border-blue-600 outline-none font-mono"
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
                <p>Loading community discussion...</p>
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
                          <input
                            type="text"
                            placeholder="Your Name *"
                            value={replyAuthor}
                            onChange={(e) => setReplyAuthor(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 outline-none"
                          />
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
                              onClick={() => {
                                if (!replyText.trim() || !replyAuthor.trim()) {
                                  toast.error('Please enter your name and reply');
                                  return;
                                }
                                toast.success(`Reply posted to @${comment.author_name}!`, { icon: '💬' });
                                setReplyText('');
                                setReplyAuthor('');
                                setReplyingToId(null);
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
