import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, HelpCircle, Info } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'info'
}) {
  // Prevent scrolling on the page body when the modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const themeClasses = {
    danger: {
      bg: 'bg-rose-50 border-rose-100',
      iconBg: 'bg-rose-100 text-rose-600',
      button: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-rose-600/10',
      icon: AlertTriangle,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-100',
      iconBg: 'bg-amber-100 text-amber-600',
      button: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 shadow-amber-600/10',
      icon: AlertTriangle,
    },
    info: {
      bg: 'bg-blue-50 border-blue-100',
      iconBg: 'bg-blue-100 text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-blue-600/10',
      icon: Info,
    },
  };

  const currentTheme = themeClasses[type] || themeClasses.danger;
  const IconComponent = currentTheme.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 font-sans">
          {/* Backdrop with premium blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            className="relative w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 flex flex-col overflow-hidden"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-message"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            {/* Layout content */}
            <div className="flex gap-4 items-start pr-6 mt-1">
              <div className={`p-2.5 rounded-2xl shrink-0 ${currentTheme.iconBg}`}>
                <IconComponent size={24} />
              </div>
              <div className="space-y-2">
                <h3
                  id="confirm-modal-title"
                  className="font-display font-bold text-lg text-slate-900 tracking-tight leading-tight"
                >
                  {title}
                </h3>
                <p id="confirm-modal-message" className="text-sm text-slate-500 leading-relaxed font-medium">
                  {message}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all border border-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-100"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_10px_20px_-5px] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentTheme.button}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
