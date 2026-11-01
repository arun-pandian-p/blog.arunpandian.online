import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  FloppyDiskIcon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';
import { Blog } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TiptapEditor } from '../components/editor/TiptapEditor';
import { PublishSettingsModal } from '../components/editor/PublishSettingsModal';
import { normalizeContentToHtml } from '../utils/contentConverter';

interface EditorPageProps {
  editStoryId?: string;
}

export const EditorPage: React.FC<EditorPageProps> = ({ editStoryId }) => {
  const { user, openAuthModal } = useAuth();
  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [contentJson, setContentJson] = useState<any>(null);
  const [category, setCategory] = useState('Engineering');
  const [tags, setTags] = useState<string[]>(['Engineering', 'Architecture']);
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isZenMode, setIsZenMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [loading, setLoading] = useState(!!editStoryId);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const autoSaveKey = editStoryId ? `apstories_edit_${editStoryId}` : 'apstories_draft_story';

  // Load existing story if editing
  useEffect(() => {
    if (editStoryId) {
      api.getBlogBySlug(editStoryId)
        .then(data => {
          setTitle(data.title);
          const normalized = normalizeContentToHtml(data.content);
          setContentHtml(normalized);
          setContentJson(data.content_json);
          setCategory(data.category || 'Engineering');
          if (Array.isArray(data.tags)) setTags(data.tags);
          else if (typeof data.tags === 'string' && data.tags.trim()) setTags(data.tags.split(',').map(t => t.trim()));
          setSlug(data.slug);
          setExcerpt(data.excerpt || '');
          setCoverImage(data.cover_image || '');
        })
        .catch(err => {
          console.error(err);
          alert('Failed to load story for editing');
        })
        .finally(() => setLoading(false));
    } else {
      // Check for saved local draft
      try {
        const saved = localStorage.getItem(autoSaveKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.html && window.confirm('Found an unsaved draft in your browser. Would you like to restore it?')) {
            setContentHtml(parsed.html);
            setContentJson(parsed.json);
            if (parsed.title) setTitle(parsed.title);
          }
        }
      } catch (e) {}
    }
  }, [editStoryId]);

  // Save title in draft
  const handleTitleChange = (val: string) => {
    setTitle(val);
    try {
      const saved = localStorage.getItem(autoSaveKey);
      const data = saved ? JSON.parse(saved) : {};
      data.title = val;
      localStorage.setItem(autoSaveKey, JSON.stringify(data));
    } catch (e) {}
  };

  const handleEditorChange = (html: string, json: any) => {
    setContentHtml(html);
    setContentJson(json);
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      alert('Please provide a story title.');
      return;
    }
    if (!user) {
      openAuthModal('login');
      return;
    }

    setSubmitting(true);
    setStatusMessage('Saving draft to cloud...');
    try {
      const payload: Partial<Blog> = {
        title: title.trim(),
        content: contentHtml,
        content_json: contentJson,
        category,
        tags,
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        cover_image: coverImage.trim() || undefined,
        published: false,
        status: 'DRAFT',
      };

      if (editStoryId) {
        await api.updateBlog(editStoryId, payload);
      } else {
        const created = await api.createBlog(payload);
        window.history.replaceState(null, '', `/edit/${created.id}`);
      }

      setStatusMessage('Draft successfully saved!');
      setTimeout(() => setStatusMessage(null), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to save draft');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishSubmit = async (settings: {
    category: string;
    tags: string[];
    slug: string;
    excerpt: string;
    coverImage: string;
    published: boolean;
  }) => {
    if (!title.trim()) {
      alert('Please provide a story title.');
      return;
    }
    if (!user) {
      openAuthModal('login');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<Blog> = {
        title: title.trim(),
        content: contentHtml,
        content_json: contentJson,
        category: settings.category,
        tags: settings.tags,
        slug: settings.slug || undefined,
        excerpt: settings.excerpt || undefined,
        cover_image: settings.coverImage || undefined,
        published: settings.published,
        status: settings.published ? 'PUBLISHED' : 'DRAFT',
      };

      let result: Blog;
      if (editStoryId) {
        result = await api.updateBlog(editStoryId, payload);
      } else {
        result = await api.createBlog(payload);
      }

      // Clear local auto-save draft
      localStorage.removeItem(autoSaveKey);

      if (settings.published) {
        window.location.href = `/story/${result.slug}`;
      } else {
        alert('Draft saved successfully!');
        setPublishModalOpen(false);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to publish story');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-slate-400">
        Loading story editor...
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20 transition-all ${
      isZenMode ? 'p-0' : 'pt-6'
    }`}>
      <div className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 ${isZenMode ? 'max-w-4xl' : ''}`}>
        {/* Editor Top Control Bar */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              title="Return to feed"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
            </a>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {editStoryId ? 'Editing Story' : 'New Engineering Story'}
              </span>
              {statusMessage && (
                <span className="ml-3 text-xs text-slate-500 animate-in fade-in">
                  {statusMessage}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={submitting}
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <HugeiconsIcon icon={FloppyDiskIcon} size={16} className="text-slate-400" />
              <span className="hidden sm:inline">Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => setPublishModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.02]"
            >
              <HugeiconsIcon icon={SparklesIcon} size={16} />
              <span>Publish...</span>
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div className="mb-6">
          <input
            type="text"
            value={title}
            onChange={e => handleTitleChange(e.target.value)}
            placeholder="Title of your engineering journey or lesson..."
            className="w-full text-2xl sm:text-4xl font-extrabold tracking-tight bg-transparent text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none border-b border-transparent focus:border-slate-200 dark:focus:border-slate-800 pb-2 transition-colors"
          />
        </div>

        {/* Tiptap Advanced Editor */}
        <TiptapEditor
          initialContent={contentHtml}
          initialJson={contentJson}
          onChange={handleEditorChange}
          autoSaveKey={autoSaveKey}
          isZenMode={isZenMode}
          onToggleZenMode={() => setIsZenMode(!isZenMode)}
          isPreviewMode={isPreviewMode}
          onTogglePreviewMode={() => setIsPreviewMode(!isPreviewMode)}
        />
      </div>

      {/* Publish Settings Modal */}
      <PublishSettingsModal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onPublish={handlePublishSubmit}
        isSubmitting={submitting}
        initialData={{
          title,
          category,
          tags,
          slug,
          excerpt,
          coverImage,
        }}
      />
    </div>
  );
};
