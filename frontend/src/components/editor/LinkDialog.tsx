import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link01Icon, Cancel01Icon, Tick01Icon } from '@hugeicons/core-free-icons';

interface LinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string, openInNewTab: boolean) => void;
  onUnlink?: () => void;
  initialUrl?: string;
}

export const LinkDialog: React.FC<LinkDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  onUnlink,
  initialUrl = '',
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [openInNewTab, setOpenInNewTab] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      if (onUnlink) onUnlink();
      onClose();
      return;
    }
    let formatted = url.trim();
    if (!/^https?:\/\//i.test(formatted) && !formatted.startsWith('#') && !formatted.startsWith('/')) {
      formatted = 'https://' + formatted;
    }
    onSave(formatted, openInNewTab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Link01Icon} size={16} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
              {initialUrl ? 'Edit Link' : 'Insert Link'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              URL Destination
            </label>
            <input
              type="text"
              autoFocus
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={openInNewTab}
              onChange={e => setOpenInNewTab(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <HugeiconsIcon icon={Link01Icon} size={14} className="text-slate-400" />
            <span>Open link in new tab</span>
          </label>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            {initialUrl && onUnlink ? (
              <button
                type="button"
                onClick={() => { onUnlink(); onClose(); }}
                className="text-xs text-red-600 hover:underline"
              >
                Remove Link
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1 px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm"
              >
                <HugeiconsIcon icon={Tick01Icon} size={14} />
                <span>Apply Link</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
