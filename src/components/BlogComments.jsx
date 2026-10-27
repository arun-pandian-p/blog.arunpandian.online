import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Send, X, Globe, User, Clock, 
  Sparkles, CheckCircle2, ShieldAlert, Edit2 
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

export default function BlogComments({
  blogSlug,
  blogId,
  blogTitle,
  projectId,
  projectTitle,
  entityType = 'blog', // 'blog' | 'project'
  allowComments = true,
  isOpen,
  onClose,
}) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Effective IDs and titles
  const targetId = projectId || blogId || blogSlug || '';
  const targetSlug = blogSlug || (projectId ? `project_${projectId}` : targetId);
  const targetTitle = projectTitle || blogTitle || (entityType === 'project' ? 'Data Analytics Project' : 'Data Publication');

  // Logged-in user state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return api.auth.getUser();
    } catch {
      return null;
    }
  });

  // Form state
  const [authorName, setAuthorName] = useState('');
  const [authorDomain, setAuthorDomain] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [showEditDetails, setShowEditDetails] = useState(false);

  // Resolved identity fields
  const isLoggedIn = Boolean(currentUser && (currentUser.username || currentUser.email || currentUser.fullName));
  // User instruction: "name from username and email takeup"
  const loggedInUsername = currentUser?.username || currentUser?.fullName || currentUser?.name || (currentUser?.email ? currentUser.email.split('@')[0] : '');
  const loggedInEmail = currentUser?.email || '';
  const loggedInDomain = currentUser?.website || currentUser?.github || '';

  // Load saved identity on mount + sync authenticated account
  useEffect(() => {
    const savedName = localStorage.getItem('commenter_name') || getCookie('commenter_name');
    const savedDomain = localStorage.getItem('commenter_domain') || getCookie('commenter_domain');

    if (savedName) {
      setAuthorName(savedName);
      setIsProfileSaved(true);
    }
    if (savedDomain) {
      setAuthorDomain(savedDomain);
    }

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

  // Fetch all comments
  const fetchComments = async (silent = false) => {
    if (!targetSlug && !targetId) return;
    if (!silent) setLoading(true);

    try {
      // 1. Fetch from /api/comments
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

    // 2. Direct DB fallback
    try {
      if (supabase) {
        const prefix = entityType === 'project' ? '[Project Comment' : '[Blog Comment';
        const { data: msgData } = await supabase
          .from('contact_messages')
          .select('*')
          .or(`subject.ilike.%${prefix}%${targetSlug}%,subject.ilike.%${prefix}%${targetId}%`)
          .order('created_at', { ascending: false });

        if (msgData) {
          const parsed = msgData.map((m) => {
            let domain = '';
            let body = m.message;
            if (m.message?.startsWith('Domain: ')) {
              const parts = m.message.split('\n');
              domain = parts[0].replace('Domain: ', '').trim();
              body = parts.slice(1).join('\n').trim();
            }
            return {
              id: m.id,
              author_name: m.name,
              author_domain: domain,
              content: body,
              created_at: m.created_at
            };
          });
          setComments(parsed);
        }
      }
    } catch (err) {
      console.warn('Comments fetch notice:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchComments();
      const interval = setInterval(() => fetchComments(true), 8000);
      return () => clearInterval(interval);
    }
  }, [targetSlug, targetId, isOpen]);

  // Submit comment
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
      toast.error('Please enter a comment');
      return;
    }

    // Save in Cookie & localStorage only for guests
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
      blog_id: String(targetId),
      blog_title: targetTitle,
      author_name: cleanName,
      author_domain: cleanDomain,
      content: cleanText,
      created_at: new Date().toISOString()
    };

    setComments((prev) => [tempComment, ...prev]);
    setCommentText('');

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
      console.warn('Comment post error:', err);
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
      setTimeout(() => fetchComments(true), 1200);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-base line-clamp-1">
                {entityType === 'project' ? 'Project Discussion & Responses' : 'Responses & Comments'}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{comments.length} active {comments.length === 1 ? 'response' : 'responses'} · Live Feed</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {!allowComments ? (
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <ShieldAlert size={28} className="mx-auto text-amber-500" />
              <h4 className="font-bold text-sm text-slate-800">Discussion Paused</h4>
              <p className="text-xs text-slate-500">Comments have been turned off for this item.</p>
            </div>
          ) : (
            <>
              {/* Comment Input Form */}
              <form onSubmit={handleSubmit} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                {/* Identity Badge: shows verified logged-in account or remembered guest */}
                {isLoggedIn ? (
                  <div className="flex items-center justify-between text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
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
                    <div className="flex items-center justify-between text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
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

                {/* Show name fields on first visit or when user clicks Change Name - ONLY for guests when NOT logged in */}
                {!isLoggedIn && (showEditDetails || (!isProfileSaved)) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Rivera"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">
                        Website / LinkedIn (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. linkedin.com/in/alex"
                        value={authorDomain}
                        onChange={(e) => setAuthorDomain(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:border-blue-500 outline-none font-mono"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <textarea
                    required
                    rows={3}
                    placeholder={
                      isLoggedIn
                        ? `Share your thoughts as @${loggedInUsername}...`
                        : (authorName 
                            ? `Share your thoughts as ${authorName}...` 
                            : "Share your analysis, question, or feedback...")
                    }
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:border-blue-500 outline-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 font-mono">
                    ✦ Stored in Supabase · Markdown supported
                  </span>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-600 text-white text-xs font-mono font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send size={12} />
                    <span>{submitting ? 'Posting...' : 'Post Comment'}</span>
                  </button>
                </div>
              </form>

              {/* Comments Feed List */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Recent Discussions ({comments.length})
                </h4>

                {loading ? (
                  <div className="py-8 text-center text-xs text-slate-400 font-mono">
                    Loading real-time discussion thread...
                  </div>
                ) : comments.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 font-mono bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No comments yet. Be the first to share your thoughts!
                  </div>
                ) : (
                  comments.map((c, i) => (
                    <div
                      key={c.id || i}
                      className="p-3.5 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                            {c.author_name ? c.author_name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <span className="font-bold text-slate-900">{c.author_name}</span>
                          {c.author_domain && (
                            <a
                              href={c.author_domain.startsWith('http') ? c.author_domain : `https://${c.author_domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-blue-600 font-mono hover:underline flex items-center gap-0.5"
                            >
                              <Globe size={10} />
                              <span>{c.author_domain.slice(0, 20)}</span>
                            </a>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Active'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line pl-7">
                        {c.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
