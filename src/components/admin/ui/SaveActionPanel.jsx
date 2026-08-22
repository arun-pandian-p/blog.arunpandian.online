import React from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SaveActionPanel({ isDirty, isSaving, onSave, onDiscard }) {
  return (
    <AnimatePresence>
      {isDirty && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-xl shadow-slate-900/20 lg:ml-32"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </span>
            <span className="text-slate-300">Unsaved changes</span>
          </div>

          <div className="h-4 w-px bg-slate-700 mx-2" />

          <button
            type="button"
            onClick={onDiscard}
            disabled={isSaving}
            className="text-slate-400 hover:text-white transition-colors"
          >
            Discard
          </button>
          
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-1.5 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              'Save changes'
            )}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
