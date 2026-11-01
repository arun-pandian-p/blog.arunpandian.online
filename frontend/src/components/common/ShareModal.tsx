import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  Tick01Icon,
  Copy01Icon,
  Share01Icon,
  NewTwitterIcon,
  Linkedin01Icon,
  GlobeIcon,
} from '@hugeicons/core-free-icons';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  slug: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, title, slug }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fullUrl = `${window.location.origin}/story/${slug}`;
  const textEncoded = encodeURIComponent(`Read "${title}" on Apstories Engineering Journal:`);
  const urlEncoded = encodeURIComponent(fullUrl);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Share01Icon} size={20} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Share Engineering Story
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={20} />
          </button>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
          Share this technical writeup with your engineering team, Twitter/X network, or community.
        </p>

        {/* Social Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <a
            href={`https://twitter.com/intent/tweet?text=${textEncoded}&url=${urlEncoded}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <HugeiconsIcon icon={NewTwitterIcon} size={22} className="text-slate-900 dark:text-white" />
            <span>Twitter / X</span>
          </a>

          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${urlEncoded}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <HugeiconsIcon icon={Linkedin01Icon} size={22} className="text-blue-600 dark:text-blue-400" />
            <span>LinkedIn</span>
          </a>

          <a
            href={`https://reddit.com/submit?url=${urlEncoded}&title=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <HugeiconsIcon icon={GlobeIcon} size={22} className="text-orange-600 dark:text-orange-400" />
            <span>Community</span>
          </a>
        </div>

        {/* Copy Link Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Story Link
          </label>
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950 p-1">
            <input
              type="text"
              readOnly
              value={fullUrl}
              className="flex-1 px-3 py-1.5 text-xs bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none select-all"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              {copied ? <HugeiconsIcon icon={Tick01Icon} size={14} /> : <HugeiconsIcon icon={Copy01Icon} size={14} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
