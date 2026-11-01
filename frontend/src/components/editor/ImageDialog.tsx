import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Upload01Icon,
  Link01Icon,
  CodeIcon,
  Cancel01Icon,
  Image01Icon,
  Tick01Icon,
} from '@hugeicons/core-free-icons';
import { api } from '../../services/api';

interface ImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (data: { src: string; alt?: string; width?: string; align?: string }) => void;
  initialData?: { src?: string; alt?: string; width?: string; align?: string };
}

export const ImageDialog: React.FC<ImageDialogProps> = ({
  isOpen,
  onClose,
  onInsert,
  initialData,
}) => {
  const [tab, setTab] = useState<'upload' | 'url' | 'svg'>('upload');
  const [url, setUrl] = useState(initialData?.src || '');
  const [alt, setAlt] = useState(initialData?.alt || '');
  const [width, setWidth] = useState(initialData?.width || '100%');
  const [align, setAlign] = useState(initialData?.align || 'center');
  const [svgCode, setSvgCode] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const res = await api.uploadMedia(file);
      setUrl(res.url);
      if (!alt) setAlt(res.filename.replace(/\.[^/.]+$/, ''));
      setTab('url'); // Switch to preview
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalSrc = url.trim();

    if (tab === 'svg' && svgCode.trim()) {
      const encodedSvg = encodeURIComponent(svgCode.trim());
      finalSrc = `data:image/svg+xml;utf8,${encodedSvg}`;
    }

    if (!finalSrc) {
      setError('Please provide an image URL, file, or SVG code.');
      return;
    }

    onInsert({
      src: finalSrc,
      alt: alt.trim() || undefined,
      width,
      align,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Image01Icon} size={20} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {initialData?.src ? 'Edit Image / Media' : 'Insert Media'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 pt-2">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-medium border-b-2 transition-all ${
              tab === 'upload'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <HugeiconsIcon icon={Upload01Icon} size={16} />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-medium border-b-2 transition-all ${
              tab === 'url'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <HugeiconsIcon icon={Link01Icon} size={16} />
            <span>Image URL</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('svg')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-medium border-b-2 transition-all ${
              tab === 'svg'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <HugeiconsIcon icon={CodeIcon} size={16} />
            <span>Paste SVG Code</span>
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm rounded-lg bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50">
              {error}
            </div>
          )}

          {tab === 'upload' && (
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors">
              <input
                type="file"
                id="image-file-input"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.svg"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <label htmlFor="image-file-input" className="cursor-pointer block">
                <HugeiconsIcon icon={Upload01Icon} size={40} className="mx-auto mb-3 text-slate-400 group-hover:text-emerald-500" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 block mb-1">
                  {uploading ? 'Uploading media to CDN...' : 'Click to choose image or SVG'}
                </span>
                <span className="text-xs text-slate-400">
                  Supports PNG, JPEG, WEBP, GIF, SVG (Vector preserved)
                </span>
              </label>
            </div>
          )}

          {tab === 'url' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Image Source URL
              </label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/diagram.png"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {tab === 'svg' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Raw SVG Code
              </label>
              <textarea
                value={svgCode}
                onChange={e => setSvgCode(e.target.value)}
                placeholder="<svg xmlns='http://www.w3.org/2000/svg' ...> ... </svg>"
                rows={5}
                className="w-full px-3.5 py-2 font-mono text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Size & Alignment Controls */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Width Scale
              </label>
              <select
                value={width}
                onChange={e => setWidth(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="25%">25% (Quarter Width)</option>
                <option value="50%">50% (Half Width)</option>
                <option value="75%">75% (Medium Width)</option>
                <option value="100%">100% (Full Width)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Alignment
              </label>
              <select
                value={align}
                onChange={e => setAlign(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="center">Center</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Alt Text / Caption
            </label>
            <input
              type="text"
              value={alt}
              onChange={e => setAlt(e.target.value)}
              placeholder="Descriptive caption for accessibility and SEO"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-lg shadow-sm transition-colors"
            >
              <HugeiconsIcon icon={Tick01Icon} size={16} />
              <span>{initialData?.src ? 'Update Image' : 'Insert into Story'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
