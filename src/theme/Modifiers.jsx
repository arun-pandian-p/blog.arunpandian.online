import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── 1. INFINITE TEXT MARQUEE (Joy Rush style) ───
export function TopMarquee() {
  return (
    <div className="w-full bg-[#E64B5A] text-[#FFF3F6] py-2 text-xs font-mono tracking-wider overflow-hidden border-b-2 border-[#2C0E1E] relative z-55">
      <div className="flex w-max animate-marquee-fast">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="mx-8 uppercase font-bold inline-flex items-center gap-4">
            always delicious <span className="text-yellow-300">✦</span> joyfully bold <span className="text-yellow-300">✦</span> effortlessly stylish <span className="text-yellow-300">✦</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee-fast {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-fast {
          animation: marquee-fast 20s linear infinite;
        }
      `}</style>
    </div>
  );
}

// ─── 2. COUNT-UP PRELOADER COUNTER (Julien Calot style) ───
export function PreloaderCounter({ onComplete }) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let start = 0;
    const duration = 1200; // ms
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const nextCount = Math.floor(easeProgress * 100);
      
      setCount(nextCount);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setTimeout(() => {
          setVisible(false);
          if (onComplete) onComplete();
        }, 300);
      }
    };

    requestAnimationFrame(update);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-[#0B0A0F] text-[#FAF9FC] z-[9999] flex flex-col justify-between p-8 sm:p-12 font-display">
      <div className="flex justify-between items-start">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-white/40">CALOT EXHIBITION</span>
        <span className="text-xs font-mono text-white/40">© 2026</span>
      </div>
      
      <div className="my-auto">
        <h1 className="text-6xl sm:text-9xl font-extrabold tracking-tighter text-[#FF2A54]">
          {String(count).padStart(3, '0')}%
        </h1>
        <p className="mt-4 text-sm sm:text-base font-mono text-white/60 tracking-wider">LOADING CREATIVE WORKPLACE</p>
      </div>

      <div className="flex justify-between items-end border-t border-white/10 pt-6">
        <span className="text-sm font-semibold tracking-wider">J. CALOT portfolio</span>
        <span className="text-xs font-mono">EN / FR</span>
      </div>
    </div>
  );
}

// ─── 3. WORD ROTATOR (Monolog style) ───
export function WordRotator({ words = ['Wrangles Data', 'Automates Tasks', 'Models Insights', 'Builds Visuals'] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [words.length]);

  return (
    <div className="inline-block relative overflow-hidden h-[1.25em] align-bottom ml-2">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="block font-display italic font-semibold text-accent"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// ─── 4. FILM GRAIN OVERLAY ───
export function GrainOverlay({ opacity = 0.04 }) {
  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

// ─── 5. RADIAN CHAPTER SCROLL NAV ───
export function RadianScrollNav() {
  const [activeSection, setActiveSection] = useState('hero');
  const sections = [
    { id: 'hero', name: 'Overview' },
    { id: 'about', name: 'About' },
    { id: 'skills', name: 'Toolkit' },
    { id: 'timeline', name: 'Experience' },
    { id: 'projects', name: 'Projects' },
    { id: 'contact', name: 'Contact' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el && scrollPos >= el.offsetTop && scrollPos < el.offsetTop + el.offsetHeight) {
          setActiveSection(section.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentIndex = sections.findIndex(s => s.id === activeSection) + 1;

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-6 font-mono text-[10px] tracking-widest text-ink">
      <div className="text-right">
        <span className="font-bold text-accent">0{currentIndex}</span>
        <span className="text-ink-soft opacity-50"> / 0{sections.length}</span>
        <div className="text-ink-soft font-bold uppercase mt-1">{sections.find(s => s.id === activeSection)?.name}</div>
      </div>
      
      <div className="flex flex-col gap-3 pr-1">
        {sections.map((sec, idx) => (
          <a
            key={sec.id}
            href={`#${sec.id}`}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              activeSection === sec.id ? 'bg-accent scale-150' : 'bg-ink-soft opacity-30 hover:opacity-70'
            }`}
            style={activeSection === sec.id ? { boxShadow: '0 0 8px var(--color-accent)' } : {}}
            title={sec.name}
          />
        ))}
      </div>
    </div>
  );
}

// ─── 5b. LETTER STAGGER ENTRANCE (Hildén & Kaira style — hildenkaira.fi) ───
// Each character springs in independently, like H&K's letter-image logo assembly.
export function LetterStagger({ text = '', delay = 0, className = '' }) {
  const chars = String(text).split('');
  return (
    <span className={`inline-block ${className}`} aria-label={text}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          aria-hidden
          initial={{ opacity: 0, y: '0.6em', rotate: -6, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
          transition={{ delay: delay + i * 0.045, type: 'spring', stiffness: 320, damping: 22 }}
          className="inline-block will-change-transform"
        >
          {char === ' ' ? ' ' : char}
        </motion.span>
      ))}
    </span>
  );
}

// ─── 5c. ROMAN NUMERAL HELPER (Depo Luxe style — depoluxe.xyz index list) ───
export function toRoman(num) {
  const map = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let n = Math.max(1, Math.round(num));
  let out = '';
  for (const [v, s] of map) { while (n >= v) { out += s; n -= v; } }
  return out;
}

// ─── 5d. SCANLINES OVERLAY (Retro Cyber) ───
export function Scanlines({ opacity = 0.08 }) {
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[9998] pointer-events-none"
      style={{
        opacity,
        backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0,0,0,0.9) 3px, transparent 4px)',
        mixBlendMode: 'multiply',
      }}
    />
  );
}

// ─── 6. LETTER ROLL HOVER EFFECT (K95 style) ───
export function LetterRoll({ text }) {
  return (
    <span className="inline-block overflow-hidden relative group/roll h-[1.2em] leading-tight">
      <span className="flex transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) group-hover/roll:-translate-y-full">
        {text.split('').map((char, i) => (
          <span key={i} className="inline-block transition-transform duration-300 delay-[calc(var(--index)*0.015s)]" style={{ '--index': i }}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
      <span className="flex absolute top-full left-0 transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) group-hover/roll:-translate-y-full text-accent">
        {text.split('').map((char, i) => (
          <span key={i} className="inline-block transition-transform duration-300 delay-[calc(var(--index)*0.015s)]" style={{ '--index': i }}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    </span>
  );
}
