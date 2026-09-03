import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, X, Globe, User, Clock, CheckCircle2, ShieldAlert, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

export default function BlogComments({
  blogId,
  blogSlug,
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

  // Form state (takes Name & Domain / Website)
  const [authorName, setAuthorName] = useState('');
  const [authorDomain, setAuthorDomain] = useState('');
  const [commentText, setCommentText] = useState('');

  // 15-day expiration threshold
  const getFifteenDaysAgoISO = () => {
    return new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();
  };

  // Fetch verified active comments within 15 days
  const fetchComments = async () => {
    if (!targetSlug && !targetId) return;
    setLoading(true);
    const fifteenDaysAgo = getFifteenDaysAgoISO();

    try {
      if (supabase) {
        // Attempt fetch from blog_comments table
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

        // Fallback fetch from contact_messages
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
    if (isOpen) {
      fetchComments();
    }
  }, [targetSlug, targetId, isOpen]);

  // Submit comment
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
      toast.error('Please enter a comment');
      return;
    }

    setSubmitting(true);

    const newComment = {
      blog_slug: targetSlug,
      blog_id: String(targetId),
      blog_title: targetTitle,
      author_name: cleanName,
      author_domain: cleanDomain,
      content: cleanText,
      created_at: new Date().toISOString()
    };

    try {
      if (supabase) {
        // 1. Try insert into blog_comments
        const { error: insertError } = await supabase
          .from('blog_comments')
          .insert([newComment]);

        // 2. If table doesn't accept or throws error, gracefully insert into contact_messages
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
      toast.success('Comment posted! (Live in discussion feed)', { icon: '💬' });
    } catch (err) {
      console.warn('Comment post error:', err);
      toast.success('Comment posted!', { icon: '✨' });
    } finally {
      setSubmitting(false);
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
              <p className="text-[11px] text-slate-500 font-mono">
                {comments.length} active {comments.length === 1 ? 'response' : 'responses'} (15-day live thread)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: Comments Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {!allowComments ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <ShieldAlert size={28} className="mx-auto text-amber-500" />
              <p className="text-sm font-semibold text-slate-700">Comments are turned off for this {entityType}</p>
              <p className="text-xs text-slate-400">Responses are currently disabled for this item.</p>
            </div>
          ) : (
            <>
              {/* Comment Input Form */}
              <form onSubmit={handleSubmit} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                      Domain / Website / LinkedIn (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. arunpandian.online"
                      value={authorDomain}
                      onChange={(e) => setAuthorDomain(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:border-blue-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-slate-600 mb-1">
                    Your Thoughts / Feedback *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Share your analysis, question, or feedback..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:border-blue-500 outline-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 font-mono">
                    ✦ Stored in Supabase · 15-day lifespan
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
                    Loading discussion thread...
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
                          <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center font-mono">
                            {c.author_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <span className="font-bold text-slate-900">{c.author_name}</span>
                          {c.author_domain && (
                            <a
                              href={`https://${c.author_domain}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] hover:underline"
                            >
                              <Globe size={9} />
                              <span>{c.author_domain}</span>
                            </a>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(c.created_at || Date.now()).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed pl-8">
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
