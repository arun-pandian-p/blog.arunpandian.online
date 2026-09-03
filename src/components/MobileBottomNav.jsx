import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Compass, Briefcase, Share2, MessageSquare, ArrowLeft, Heart, Home } from 'lucide-react';
import { getMainDomainUrl } from '../utils/domain';

export default function MobileBottomNav({
  mode = 'publication', // 'publication' | 'article' | 'project'
  onShareClick,
  onCommentsClick,
  commentsCount = 0,
  onExploreClick
}) {
  const location = useLocation();
  const mainPortfolioUrl = getMainDomainUrl();

  const isArticleView = mode === 'article' || mode === 'project';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/92 backdrop-blur-lg border-t border-[#E8E1D5] px-6 py-2 shadow-lg safe-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* ── MODE 1: ARTICLE / PROJECT DETAIL VIEW (3 Icons: Feed, Share, Comments) ── */}
        {isArticleView ? (
          <>
            {/* 1. Back to Feed */}
            <Link
              to="/blog"
              className="flex flex-col items-center justify-center gap-1 text-[#6E665C] hover:text-[#1C1A17] active:scale-95 transition-all p-1"
              title="All Articles"
            >
              <div className="p-1 rounded-full">
                <BookOpen size={20} />
              </div>
              <span className="text-[10px] font-mono font-medium leading-none">Articles</span>
            </Link>

            {/* 2. Direct Share Modal Trigger */}
            <button
              onClick={onShareClick}
              className="flex flex-col items-center justify-center gap-1 text-[#B83A26] hover:text-[#8F2819] active:scale-95 transition-all p-1 cursor-pointer"
              title="Share"
            >
              <div className="p-1 rounded-full bg-[#B83A26]/10">
                <Share2 size={20} className="text-[#B83A26]" />
              </div>
              <span className="text-[10px] font-mono font-bold leading-none text-[#B83A26]">Share</span>
            </button>

            {/* 3. Jump to Comments Section */}
            <button
              onClick={onCommentsClick || (() => {
                const el = document.getElementById('comments-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              })}
              className="flex flex-col items-center justify-center gap-1 text-[#6E665C] hover:text-[#1C1A17] active:scale-95 transition-all p-1 cursor-pointer relative"
              title="Community Comments"
            >
              <div className="p-1 rounded-full relative">
                <MessageSquare size={20} />
                {commentsCount > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#B83A26]" />
                )}
              </div>
              <span className="text-[10px] font-mono font-medium leading-none">Comments</span>
            </button>
          </>
        ) : (
          /* ── MODE 2: PUBLICATION / BLOG INDEX FEED (3 Icons: Articles, Topics/Explore, Portfolio) ── */
          <>
            {/* 1. Articles Feed (Home) */}
            <Link
              to="/blog"
              className="flex flex-col items-center justify-center gap-1 text-[#B83A26] active:scale-95 transition-all p-1"
              title="Articles Feed"
            >
              <div className="p-1 rounded-full bg-[#B83A26]/10">
                <BookOpen size={20} className="text-[#B83A26]" />
              </div>
              <span className="text-[10px] font-mono font-bold leading-none text-[#B83A26]">Articles</span>
            </Link>

            {/* 2. Explore / Topics Filter */}
            <button
              onClick={onExploreClick || (() => {
                const el = document.getElementById('topics-section') || document.querySelector('input[type="text"]');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                  if (el.focus) el.focus();
                }
              })}
              className="flex flex-col items-center justify-center gap-1 text-[#6E665C] hover:text-[#1C1A17] active:scale-95 transition-all p-1 cursor-pointer"
              title="Explore Topics"
            >
              <div className="p-1 rounded-full">
                <Compass size={20} />
              </div>
              <span className="text-[10px] font-mono font-medium leading-none">Explore</span>
            </button>

            {/* 3. Main Portfolio Link */}
            <a
              href={mainPortfolioUrl}
              className="flex flex-col items-center justify-center gap-1 text-[#6E665C] hover:text-[#1C1A17] active:scale-95 transition-all p-1"
              title="Main Portfolio"
            >
              <div className="p-1 rounded-full">
                <Briefcase size={20} />
              </div>
              <span className="text-[10px] font-mono font-medium leading-none">Portfolio</span>
            </a>
          </>
        )}

      </div>
    </nav>
  );
}
