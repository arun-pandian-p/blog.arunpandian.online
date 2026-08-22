import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContent } from '../context/ContentProvider';
import Logo from './Logo';

/* Awwwards-style intro: shows a single curated quote, then transitions to 
   the landing screen via a premium staggered mosaic/grid small box scale-down reveal. */

const QUOTE_DURATION = 2000; // Duration to show the single quote
const COLS = 10;
const ROWS = 8;

export default function Welcome({ onDone }) {
  const { settings } = useContent();
  const welcome = settings.welcome || {};

  // Retrieve single quote (with fallback)
  const quote = welcome.quote || (welcome.quotes && welcome.quotes[0]) || 'I turn messy data into clear decisions.';

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const [phase, setPhase] = useState('quote'); // quote -> invite -> exit
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    setPhase('exit');
    setTimeout(onDone, 1200); // Allow time for the mosaic animation to complete
  };

  useEffect(() => {
    if (reduced) {
      const t = setTimeout(onDone, 400);
      return () => clearTimeout(t);
    }

    const timers = [];

    // Show single quote, then go to invite/welcome splash, then auto-finish
    timers.push(setTimeout(() => setPhase('invite'), QUOTE_DURATION));
    timers.push(setTimeout(() => setPhase('exit'), QUOTE_DURATION + 2000));
    timers.push(setTimeout(() => finish(), QUOTE_DURATION + 3000));

    // Allow skip by key/scroll/click
    const bail = () => finish();
    window.addEventListener('wheel', bail, { passive: true });
    window.addEventListener('touchmove', bail, { passive: true });
    window.addEventListener('keydown', bail);
    
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('wheel', bail);
      window.removeEventListener('touchmove', bail);
      window.removeEventListener('keydown', bail);
    };
  }, [onDone, reduced]);

  // Generate grid tiles for the box reveal
  const tiles = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      tiles.push({ r, c, id: `${r}-${c}` });
    }
  }

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none">
      {/* Mosaic tiles overlay for exit phase */}
      <AnimatePresence>
        {phase === 'exit' && (
          <div className="absolute inset-0 z-[9999] grid grid-cols-10 grid-rows-8">
            {tiles.map(({ r, c, id }) => {
              // Stagger delay based on distance/randomness for a beautiful fluid dissolve
              const delay = (r + c) * 0.04 + Math.random() * 0.05;
              return (
                <motion.div
                  key={id}
                  initial={{ scale: 1.05, opacity: 1 }}
                  animate={{ scale: 0, opacity: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.55, delay, ease: [0.36, 0.66, 0.04, 1] }}
                  className="bg-slate-950 border border-slate-900/50"
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Main content layer */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={phase === 'exit' ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.4 }}
        onClick={finish}
        className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden px-6 cursor-pointer pointer-events-auto"
      >
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_45%,rgba(37,99,235,0.2),transparent_70%)]" />

        {/* Skip */}
        <button
          onClick={(e) => { e.stopPropagation(); finish(); }}
          className="absolute top-6 right-6 z-10 text-[11px] font-mono tracking-[0.25em] uppercase text-white/50 hover:text-white transition-colors"
        >
          Skip →
        </button>

        {phase === 'quote' ? (
          <div className="relative max-w-3xl text-center">
            {/* Logo + Name */}
            <div className="flex flex-col items-center justify-center gap-4 mb-8">
              <Logo size={42} className="opacity-90 animate-pulse" />
              <span className="text-[11px] font-mono tracking-[0.35em] uppercase text-white/40">
                {welcome.name || 'Arun Pandian · Data Analyst'}
              </span>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-extrabold text-2xl sm:text-4xl md:text-5xl tracking-tight leading-[1.2] text-balance text-slate-100"
            >
              &ldquo;{quote}&rdquo;
            </motion.p>
          </div>
        ) : phase === 'invite' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative text-center max-w-2xl px-4"
          >
            <div className="flex justify-center mb-6">
              <Logo size={56} className="opacity-95" />
            </div>
            <p className="text-xs font-mono tracking-[0.35em] uppercase text-blue-400 mb-3">Welcome</p>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight leading-tight text-white">
              {welcome.inviteTitle || 'Pleasure to have you here.'}
            </h2>
            <p className="mt-4 text-slate-400 text-lg sm:text-xl">
              {welcome.inviteSubtitle || "Let's turn data into decisions — and connect."}
            </p>
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  );
}
