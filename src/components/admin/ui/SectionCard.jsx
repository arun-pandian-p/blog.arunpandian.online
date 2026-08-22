import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

/* Admin settings card with an expand/collapse chevron.
   The action prop (like the site-visibility eye toggle) is always visible in the header. */

export default function SectionCard({ title, description, action, defaultOpen = true, children, className = '' }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`bg-white rounded-[1.25rem] border border-slate-200 shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-4 p-6">
        <div>
          <h2 className="font-bold text-lg text-slate-800">{title}</h2>
          {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {action}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
            title={open ? 'Collapse' : 'Expand'}
            className="shrink-0 p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ChevronDown size={16} className={`transform transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
