import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Comment01Icon,
  FavouriteIcon,
  ArrowTurnBackwardIcon,
  Delete02Icon,
  SentIcon,
} from '@hugeicons/core-free-icons';
import { Comment } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface CommentSectionProps {
  blogId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ blogId }) => {
  const { user, openAuthModal, isAdmin } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [guestName, setGuestName] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [blogId]);

  const loadComments = async () => {
    try {
      const data = await api.getComments(blogId);
      setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (parentId?: string, contentToPost?: string) => {
    const text = (parentId ? contentToPost : newContent)?.trim();
    if (!text) return;

    setSubmitting(true);
    try {
      await api.addComment(blogId, {
        content: text,
        parent_id: parentId,
        author_name: user?.full_name || guestName.trim() || 'Anonymous Developer',
        author_email: user?.email,
      });

      if (parentId) {
        setReplyToId(null);
        setReplyContent('');
      } else {
        setNewContent('');
      }
      loadComments();
    } catch (err: any) {
      alert(err.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      const likes = await api.likeComment(commentId);
      setComments(prev =>
        prev.map(c => {
          if (c.id === commentId) return { ...c, likes };
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map(r => (r.id === commentId ? { ...r, likes } : r)),
            };
          }
          return c;
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.deleteComment(commentId);
      loadComments();
    } catch (err: any) {
      alert(err.message || 'Failed to delete comment');
    }
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.author_name || 'dev'}`;
    const formattedDate = comment.created_at
      ? new Date(comment.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Recently';

    const canDelete = isAdmin || (user && user.id === comment.author_id);

    return (
      <div
        key={comment.id}
        className={`flex gap-3.5 ${isReply ? 'ml-8 sm:ml-12 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800' : 'mb-6'}`}
      >
        <img
          src={comment.author_avatar || defaultAvatar}
          alt={comment.author_name}
          className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 flex-shrink-0"
        />

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                {comment.author_name}
              </span>
              <span className="text-slate-400 text-xs">· {formattedDate}</span>
            </div>

            {canDelete && (
              <button
                type="button"
                onClick={() => handleDelete(comment.id)}
                className="text-slate-400 hover:text-red-500 p-1 rounded"
                title="Delete comment"
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} />
              </button>
            )}
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-2 whitespace-pre-wrap">
            {comment.content}
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <button
              type="button"
              onClick={() => handleLike(comment.id)}
              className="flex items-center gap-1 hover:text-red-500 transition-colors"
            >
              <HugeiconsIcon icon={FavouriteIcon} size={14} className="text-red-500" />
              <span>{comment.likes || 0}</span>
            </button>

            {!isReply && (
              <button
                type="button"
                onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
                className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
              >
                <HugeiconsIcon icon={ArrowTurnBackwardIcon} size={14} />
                <span>Reply</span>
              </button>
            )}
          </div>

          {/* Inline Reply Form */}
          {replyToId === comment.id && (
            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <textarea
                rows={2}
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                placeholder={`Replying to ${comment.author_name}...`}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 mb-2"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyToId(null)}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting || !replyContent.trim()}
                  onClick={() => handlePostComment(comment.id, replyContent)}
                  className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Post Reply'}
                </button>
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-2 mt-2">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HugeiconsIcon icon={Comment01Icon} size={20} className="text-emerald-600 dark:text-emerald-400" />
          <span>Engineering Discussions ({comments.length})</span>
        </h3>
      </div>

      {/* Main Comment Input */}
      <div className="mb-8 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <textarea
          rows={3}
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          placeholder="Share your thoughts, architectural feedback, questions, or lessons..."
          className="w-full p-3 text-sm rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-3"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          {!user ? (
            <input
              type="text"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              placeholder="Your name or handle (Optional)"
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          ) : (
            <div className="text-xs text-slate-500">
              Commenting as <span className="font-semibold text-slate-700 dark:text-slate-200">{user.full_name}</span>
            </div>
          )}

          <button
            type="button"
            disabled={submitting || !newContent.trim()}
            onClick={() => handlePostComment()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <HugeiconsIcon icon={SentIcon} size={14} />
            <span>{submitting ? 'Submitting...' : 'Post Comment'}</span>
          </button>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          Loading discussion threads...
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
          No comments yet. Start the engineering conversation!
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map(c => renderComment(c))}
        </div>
      )}
    </section>
  );
};
