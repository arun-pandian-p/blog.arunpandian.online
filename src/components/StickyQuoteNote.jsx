import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shuffle, Copy, Check, Quote, Heart } from 'lucide-react';
import { motivationalQuotes, getDailyQuoteIndex } from '../data/motivationalQuotes';
import toast from 'react-hot-toast';

export default function StickyQuoteNote({ className = '' }) {
  const [currentIndex, setCurrentIndex] = useState(() => getDailyQuoteIndex());
  const [copied, setCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const quote = motivationalQuotes[currentIndex] || motivationalQuotes[0];

  const handleShuffle = () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * motivationalQuotes.length);
    } while (nextIndex === currentIndex && motivationalQuotes.length > 1);
    setCurrentIndex(nextIndex);
    setIsLiked(false);
  };

  const handleCopy = () => {
    const textToCopy = `"${quote.tamil}"\n"${quote.english}"\n— ${quote.author}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Tamil Quote & Translation Copied!', {
      icon: '📌',
      style: {
        borderRadius: '12px',
        background: '#1E293B',
        color: '#F8FAFC',
        fontSize: '13px',
      },
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      data-edit-id="hero.stickynote"
      data-edit-name="Hero · Daily Motivational Sticky Note"
      className={`relative inline-block w-full max-w-sm sm:max-w-md ${className}`}
    >
      {/* 3D Red Push Pin */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center pointer-events-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]">
        <div className="relative flex flex-col items-center">
          {/* Pin Head */}
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-rose-800 ring-2 ring-red-300/60 shadow-inner flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white/70 shadow-xs" />
          </div>
          {/* Pin Stem Shadow */}
          <div className="w-1 h-2 bg-gradient-to-b from-slate-400 to-slate-600 -mt-0.5 rounded-b-xs" />
        </div>
      </div>

      {/* Realistic Yellow Post-it Paper with Curled Corner & Soft Drop Shadow */}
      <motion.div
        whileHover={{ rotate: 0.5, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative bg-gradient-to-br from-[#FEF08A] via-[#FDE047] to-[#FACC15] text-slate-900 pt-6 pb-4 px-5 sm:px-6 rounded-2xl shadow-[0_12px_28px_-6px_rgba(0,0,0,0.18),0_4px_12px_rgba(202,138,4,0.22)] border border-yellow-300/80 transform -rotate-1 select-none overflow-hidden"
      >
        {/* Curled bottom-left corner decorative fold */}
        <div className="absolute bottom-0 left-0 w-6 h-6 overflow-hidden pointer-events-none">
          <div className="w-9 h-9 bg-gradient-to-tr from-yellow-500/40 via-yellow-400/30 to-transparent -translate-x-4 translate-y-4 rotate-45 shadow-xs" />
        </div>

        {/* Top Header Tag */}
        <div className="flex items-center justify-between gap-2 pb-2 mb-2.5 border-b border-yellow-600/20 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-yellow-950 font-bold tracking-wider uppercase text-[10px]">
            <Sparkles size={13} className="text-amber-700 animate-spin-slow" />
            <span>தினசரி ஊக்கம் • Daily Note</span>
          </div>

          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-950/10 text-yellow-950 font-sans font-bold">
            #{quote.category}
          </span>
        </div>

        {/* Dynamic Animated Quote Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={quote.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="space-y-2.5 my-1"
          >
            {/* Tamil Slogan */}
            <p className="font-sans font-bold text-sm sm:text-base text-yellow-950 leading-snug tracking-tight">
              "{quote.tamil}"
            </p>

            {/* English Meaning */}
            <p className="text-xs sm:text-[13px] text-yellow-900/90 font-serif italic leading-relaxed">
              "{quote.english}"
            </p>

            {/* Author */}
            <div className="flex items-center justify-end text-[11px] font-sans font-bold text-yellow-950/80 pt-1">
              <span>— {quote.author}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Interactive Bottom Control Toolbar */}
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-yellow-600/20 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffle}
              title="Next Motivational Note (100+ Quotes)"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-yellow-950/10 hover:bg-yellow-950/20 text-yellow-950 text-[11px] font-bold transition-all active:scale-95 cursor-pointer"
            >
              <Shuffle size={12} className="text-yellow-900" />
              <span>Shuffle 🔀</span>
            </button>

            <button
              onClick={() => setIsLiked(!isLiked)}
              title="Favorite Quote"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLiked ? 'text-rose-600 bg-rose-50/60' : 'text-yellow-900 hover:bg-yellow-950/10'
              }`}
            >
              <Heart size={13} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
          </div>

          <button
            onClick={handleCopy}
            title="Copy Quote and Meaning"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-950/10 hover:bg-yellow-950/20 text-yellow-950 text-[11px] font-semibold transition-all active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-700" />
                <span className="text-emerald-800 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
