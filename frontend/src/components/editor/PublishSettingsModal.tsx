import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  Tick01Icon,
  Image01Icon,
  SparklesIcon,
  DiscountTag01Icon,
  Folder01Icon,
  GlobeIcon,
} from '@hugeicons/core-free-icons';
import { api } from '../../services/api';

interface PublishSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (settings: {
    category: string;
    tags: string[];
    slug: string;
    excerpt: string;
    coverImage: string;
    published: boolean;
  }) => void;
  initialData: {
    title: string;
    category?: string;
    tags?: string[] | string;
    slug?: string;
    excerpt?: string;
    coverImage?: string;
    readTime?: string | number;
  };
  isSubmitting?: boolean;
}

const CATEGORIES = [
  'Engineering',
  'Architecture',
  'Backend & APIs',
  'Frontend & UI',
  'DevOps & Cloud',
  'AI & Data',
  'System Design',
  'Learnings & Postmortems',
];

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80', // Code
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80', // Matrix
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80', // Laptop
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80', // Space/Network
];

export const PublishSettingsModal: React.FC<PublishSettingsModalProps> = ({
  isOpen,
  onClose,
  onPublish,
  initialData,
  isSubmitting = false,
}) => {
  const [category, setCategory] = useState(initialData.category || 'Engineering');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(() => {
    if (Array.isArray(initialData.tags)) return initialData.tags;
    if (typeof initialData.tags === 'string' && initialData.tags.trim()) {
      return initialData.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    return ['Engineering', 'Architecture'];
  });
  const [slug, setSlug] = useState(initialData.slug || '');
  const [excerpt, setExcerpt] = useState(initialData.excerpt || '');
  const [coverImage, setCoverImage] = useState(initialData.coverImage || '');
  const [uploadingCover, setUploadingCover] = useState(false);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const res = await api.uploadMedia(file);
      setCoverImage(res.url);
    } catch (err: any) {
      alert(err.message || 'Failed to upload cover');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = (published: boolean) => {
    onPublish({
      category,
      tags,
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      coverImage: coverImage.trim(),
      published,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={SparklesIcon} size={20} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Publish Story Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Cover Image Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <HugeiconsIcon icon={Image01Icon} size={16} className="text-emerald-600" />
              <span>Cover Image / Banner</span>
            </label>

            {coverImage ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 group h-44 mb-3">
                <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCoverImage('')}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow"
                  >
                    Remove Cover
                  </button>
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2 mb-2">
              <input
                type="text"
                value={coverImage}
                onChange={e => setCoverImage(e.target.value)}
                placeholder="Paste image or SVG URL..."
                className="flex-1 min-w-[200px] px-3.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <label className="cursor-pointer px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                {uploadingCover ? 'Uploading...' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*,.svg"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Presets:</span>
              {PRESET_COVERS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCoverImage(p)}
                  className="w-12 h-7 rounded border border-slate-300 dark:border-slate-700 overflow-hidden hover:scale-105 transition-transform"
                >
                  <img src={p} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Category & Tags Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                <HugeiconsIcon icon={Folder01Icon} size={16} className="text-emerald-600" />
                <span>Category</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                <HugeiconsIcon icon={DiscountTag01Icon} size={16} className="text-emerald-600" />
                <span>Tags (Press Enter or comma)</span>
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags: react, java, architecture..."
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Tags Chips */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map(t => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="hover:text-red-500 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Story Excerpt / Summary (SEO & Social Cards)
            </label>
            <textarea
              rows={3}
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="A brief 1-2 sentence preview for search engines and social feeds..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
              <HugeiconsIcon icon={GlobeIcon} size={16} className="text-emerald-600" />
              <span>Custom URL Slug</span>
            </label>
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950">
              <span className="px-3 text-xs text-slate-400 bg-slate-50 dark:bg-slate-900 py-2 border-r border-slate-200 dark:border-slate-800">
                /story/
              </span>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="custom-story-slug"
                className="flex-1 px-3 py-2 text-sm bg-transparent text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave(true)}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <HugeiconsIcon icon={Tick01Icon} size={16} />
              <span>{isSubmitting ? 'Publishing...' : 'Publish to Feed'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
