import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SparklesIcon,
  Clock01Icon,
  FlameIcon,
  DiscountTag01Icon,
  Cancel01Icon,
  ComputerTerminal01Icon,
  FilterIcon,
} from '@hugeicons/core-free-icons';
import { Blog } from '../types';
import { api } from '../services/api';
import { StoryCard } from '../components/story/StoryCard';

const CATEGORIES = [
  'All',
  'Engineering',
  'Architecture',
  'Backend',
  'Frontend',
  'DevOps',
  'Data & AI',
  'Learnings',
];

interface HomePageProps {
  searchQuery?: string;
  onClearSearch?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ searchQuery = '', onClearSearch }) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortTab, setSortTab] = useState<'latest' | 'trending' | 'views'>('latest');

  useEffect(() => {
    loadStories();
  }, [searchQuery, selectedCategory, selectedTag, sortTab]);

  useEffect(() => {
    api.getFeaturedBlogs().then(setFeaturedBlogs).catch(() => {});
  }, []);

  const loadStories = async () => {
    setLoading(true);
    try {
      const data = await api.getBlogs({
        search: searchQuery || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        tag: selectedTag || undefined,
        sort: sortTab,
      });
      setBlogs(data);
    } catch (err) {
      console.error('Failed to load stories:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 animate-in fade-in duration-200 overflow-x-hidden">
      {/* Engineering Journal Hero Banner (if no search or specific filter) */}
      {!searchQuery && selectedCategory === 'All' && !selectedTag && (
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 text-white p-5 sm:p-10 md:p-12 mb-8 sm:mb-10 border border-slate-800 shadow-xl">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] sm:text-xs font-semibold mb-3 sm:mb-4">
              <HugeiconsIcon icon={ComputerTerminal01Icon} size={14} />
              <span>Personal Engineering Journal &amp; Technical Digest</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3 sm:mb-4 leading-tight">
              Documenting the craft of software engineering.
            </h1>
            <p className="text-slate-300 text-xs sm:text-base leading-relaxed mb-5 sm:mb-6">
              Daily deep-dives into system design, backend architectures, technical learnings, bugs conquered, and production-tested patterns.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <a
                href="/new"
                className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 text-center"
              >
                Write in Journal
              </a>
              <a
                href="#stories-feed"
                className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors text-center"
              >
                Explore Stories
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Search Filter Header (when searching) */}
      {searchQuery && (
        <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl mb-8">
          <div className="flex items-center gap-2 text-sm text-emerald-900 dark:text-emerald-200">
            <HugeiconsIcon icon={FilterIcon} size={16} className="text-emerald-600" />
            <span>Search results for: <strong>"{searchQuery}"</strong></span>
          </div>
          {onClearSearch && (
            <button
              type="button"
              onClick={onClearSearch}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={14} />
              <span>Clear Search</span>
            </button>
          )}
        </div>
      )}

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => { setSelectedCategory(cat); setSelectedTag(null); }}
            className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}

        {selectedTag && (
          <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-800">
            <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1 font-semibold">
              <HugeiconsIcon icon={DiscountTag01Icon} size={14} />
              <span>#{selectedTag}</span>
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="hover:text-red-500 ml-1"
              >
                ×
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Main Feed Content Area */}
      <div id="stories-feed" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stories Stream (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sub-Sort Tabs */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setSortTab('latest')}
                className={`flex items-center gap-1.5 pb-2 border-b-2 transition-all ${
                  sortTab === 'latest'
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <HugeiconsIcon icon={Clock01Icon} size={14} />
                <span>Latest Stories</span>
              </button>
              <button
                type="button"
                onClick={() => setSortTab('trending')}
                className={`flex items-center gap-1.5 pb-2 border-b-2 transition-all ${
                  sortTab === 'trending'
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <HugeiconsIcon icon={FlameIcon} size={14} />
                <span>Trending</span>
              </button>
            </div>

            <span className="text-xs text-slate-400">
              {blogs.length} {blogs.length === 1 ? 'story' : 'stories'}
            </span>
          </div>

          {/* Stories List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                  <div className="w-3/4 h-6 bg-slate-200 dark:bg-slate-800 rounded mb-3" />
                  <div className="w-full h-12 bg-slate-100 dark:bg-slate-800/60 rounded" />
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
              <HugeiconsIcon icon={SparklesIcon} size={40} className="text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">No stories match this filter</h3>
              <p className="text-xs text-slate-500 mb-4">Be the first to publish an article on this technical topic!</p>
              <a
                href="/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              >
                Write in Journal
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {blogs.map(blog => (
                <StoryCard
                  key={blog.id}
                  blog={blog}
                  onSelectTag={tag => setSelectedTag(tag)}
                  onSelectCategory={cat => setSelectedCategory(cat)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar: Featured & Trending Topics */}
        <aside className="space-y-6">
          {/* Featured Engineering Stories */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <HugeiconsIcon icon={SparklesIcon} size={16} className="text-emerald-500" />
              <span>Featured Articles</span>
            </h3>
            <div className="space-y-4">
              {featuredBlogs.slice(0, 3).map((fb, idx) => (
                <a
                  key={fb.id}
                  href={`/story/${fb.slug}`}
                  className="block group hover:bg-slate-50 dark:hover:bg-slate-850 p-2.5 rounded-xl -mx-2.5 transition-colors"
                >
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">0{idx + 1}</span>
                    <span>·</span>
                    <span>{fb.author_name || 'Engineer'}</span>
                  </div>
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 transition-colors line-clamp-2">
                    {fb.title}
                  </h4>
                </a>
              ))}
            </div>
          </div>

          {/* Popular Engineering Tags Cloud */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <HugeiconsIcon icon={DiscountTag01Icon} size={16} className="text-emerald-500" />
              <span>Recommended Tags</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Java',
                'SpringBoot',
                'Architecture',
                'TypeScript',
                'React',
                'PostgreSQL',
                'Local LLM',
                'Automation',
                'DevOps',
                'Backend',
                'Security',
              ].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                    selectedTag === tag
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Journal Write Callout */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
              Have a technical lesson to share?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Write daily developer notes, post-mortems, architectural decisions, and tutorials using our high-fidelity Tiptap editor.
            </p>
            <a
              href="/new"
              className="inline-block px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/20"
            >
              Start Writing
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
};
