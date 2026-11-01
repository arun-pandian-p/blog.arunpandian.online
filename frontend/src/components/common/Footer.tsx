import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CodeIcon } from '@hugeicons/core-free-icons';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 sm:mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-10 sm:py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <img
                src="/logo.png"
                alt="Apstories Logo"
                className="w-8 h-8 rounded-full object-cover border border-emerald-500/40 shadow-sm"
              />
              <span className="font-extrabold text-lg text-slate-900 dark:text-white">Apstories</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-4 leading-relaxed">
              A personal engineering journal for daily developer journeys, technical learnings, project updates, feature architecture, and hard-earned engineering lessons.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <HugeiconsIcon icon={CodeIcon} size={16} className="text-emerald-500 flex-shrink-0" />
              <span>Built with React, Vite, Tiptap, Java 21 Spring Boot &amp; Supabase PostgreSQL</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Engineering Topics
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><a href="/?category=Architecture" className="hover:text-emerald-500">System Architecture</a></li>
              <li><a href="/?category=Backend" className="hover:text-emerald-500">Java &amp; Spring Boot APIs</a></li>
              <li><a href="/?category=AI" className="hover:text-emerald-500">Local LLMs &amp; AI Automation</a></li>
              <li><a href="/?category=DevOps" className="hover:text-emerald-500">Cloud &amp; Kubernetes</a></li>
              <li><a href="/?category=Learnings" className="hover:text-emerald-500">Engineering Postmortems</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Journal Guidelines
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><a href="/new" className="hover:text-emerald-500">Write an Article</a></li>
              <li><a href="/bookmarks" className="hover:text-emerald-500">Reading List</a></li>
              <li><a href="/admin" className="hover:text-emerald-500">Admin Moderation</a></li>
              <li><span className="text-slate-400">Markdown &amp; Shortcuts Supported</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Apstories Engineering Journal. All technical articles belong to respective authors.</p>
          <div className="flex items-center gap-1.5">
            <span>Engineered with passion for software craftsmanship</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
