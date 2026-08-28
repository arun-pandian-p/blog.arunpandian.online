import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowUpRight, ArrowDownRight, ArrowRight, Compass, ShieldAlert, Sparkles, Volume2, VolumeX, Download, FileText, FileDown } from 'lucide-react';
import MagneticButton from './MagneticButton';
import Parallax from './Parallax';
import arunProfile from '../assets/arun-profile.jpg';
import { useContent } from '../context/ContentProvider';
import { useThemeStore } from '../theme/store';
import { WordRotator } from '../theme/Modifiers';
import DoodleGuide from './DoodleGuide';
import StickyQuoteNote from './StickyQuoteNote';

const GithubIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);
const LinkedinIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const ease = [0.16, 1, 0.3, 1];
const rise = {
  hidden: { opacity: 1, y: 0 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.15, delay: 0, ease } }),
};

const Hero = () => {
  const { settings } = useContent();
  const { theme } = useThemeStore();
  const [isMuted, setIsMuted] = React.useState(true);
  const videoRef = React.useRef(null);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      if (!isMuted) {
        videoRef.current.volume = 1;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isMuted]);
  const hero = settings.hero || {};
  const animationStyle = theme?.layout?.animationStyle || settings.theme?.layout?.animationStyle || 'default';

  const story = hero.story || [];
  const credentials = hero.credentials || [];
  const ticker = hero.ticker || [];
  const socials = hero.socials || {};
  const hiddenFields = hero.hiddenFields || [];
  const gallery = hero.gallery || [];
  const isVisible = (field) => !hiddenFields.includes(field);

  const heroStyle = theme?.layout?.heroStyle || settings.theme?.layout?.heroStyle || 'default';

  // ─── HERO STYLE: KAROL BINKOWSKI (Massive Split Typography) ───
  if (heroStyle === 'karolbinkowski') {
    return (
      <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="relative min-h-screen flex flex-col justify-center bg-bg text-ink pt-32 pb-12 border-b-[3px] border-ink">
        <div className="w-full max-w-7xl mx-auto px-6 flex flex-col items-start">
          {isVisible('badge') && (
            <div data-edit-id="hero.badge" data-edit-name="Hero · Badge" data-edit-kind="text" data-edit-path="hero.badge" className="text-xs uppercase tracking-[0.2em] font-bold border border-ink px-4 py-2 mb-8 bg-surface">
              {hero.badge}
            </div>
          )}
          <h1 data-edit-id="hero.headline" data-edit-name="Hero · Headline" data-edit-kind="heading" className="font-display font-black uppercase text-[clamp(3rem,10vw,8rem)] leading-[0.85] tracking-tighter w-full">
            {(hero.headline || []).map((line, i) => (
              <span key={i} className="block hover:text-accent transition-colors duration-300" style={{ textShadow: '4px 4px 0px var(--color-ink)' }}>{line}</span>
            ))}
            {isVisible('headlineAccent') && (
              <span data-edit-id="hero.accent" data-edit-name="Hero · Accent word" data-edit-kind="text" data-edit-path="hero.headlineAccent" className="block text-bg mt-4" style={{ WebkitTextStroke: '2px var(--color-ink)' }}>
                {hero.headlineAccent}
              </span>
            )}
          </h1>
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between w-full mt-12 gap-8">
            {isVisible('subtitle') && (
              <p data-edit-id="hero.subtitle" data-edit-name="Hero · Subtitle" data-edit-kind="text" data-edit-path="hero.subtitle" className="max-w-md text-sm font-bold uppercase leading-relaxed border-l-[3px] border-accent pl-4">
                {hero.subtitle?.replace(/<[^>]*>/g, '')}
              </p>
            )}
            <div className="flex gap-4">
              {isVisible('primaryCta') && (
                <a href={hero.primaryCta?.href || '#projects'} data-edit-id="hero.primaryCta" data-edit-name="Hero · Primary button" data-edit-kind="button" data-edit-path="hero.primaryCta.label" className="px-8 py-4 bg-accent text-ink border-[3px] border-ink font-bold uppercase tracking-widest text-sm hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_var(--color-ink)] transition-transform">
                  {hero.primaryCta?.label}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─── HERO STYLE: PELIZZARI (Editorial Cinematic) ───
  if (heroStyle === 'pelizzari') {
    return (
      <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="relative min-h-screen flex flex-col justify-end pb-24 px-6 text-bg">
        <div className="absolute inset-0 -z-10 bg-ink">
          {hero.profileImage && (
            <img fetchPriority="high" src={hero.profileImage || arunProfile} alt="Hero" className="w-full h-full object-cover opacity-60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        </div>
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center text-center">
          {isVisible('badge') && (
            <div data-edit-id="hero.badge" data-edit-name="Hero · Badge" data-edit-kind="text" data-edit-path="hero.badge" className="text-[10px] uppercase tracking-[0.3em] font-medium mb-8 text-bg/70">
              {hero.badge}
            </div>
          )}
          <h1 data-edit-id="hero.headline" data-edit-name="Hero · Headline" data-edit-kind="heading" className="font-serif italic text-5xl sm:text-7xl lg:text-8xl leading-tight font-light w-full max-w-5xl">
            {(hero.headline || []).map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
            {isVisible('headlineAccent') && (
              <span data-edit-id="hero.accent" data-edit-name="Hero · Accent word" data-edit-kind="text" data-edit-path="hero.headlineAccent" className="block not-italic mt-2 text-surface">
                {hero.headlineAccent}
              </span>
            )}
          </h1>
          {isVisible('subtitle') && (
            <p data-edit-id="hero.subtitle" data-edit-name="Hero · Subtitle" data-edit-kind="text" data-edit-path="hero.subtitle" className="mt-10 max-w-xl text-base sm:text-lg text-bg/80 leading-relaxed font-serif">
              {hero.subtitle?.replace(/<[^>]*>/g, '')}
            </p>
          )}
          <div className="mt-12">
            {isVisible('primaryCta') && (
              <a href={hero.primaryCta?.href || '#projects'} data-edit-id="hero.primaryCta" data-edit-name="Hero · Primary button" data-edit-kind="button" data-edit-path="hero.primaryCta.label" className="px-8 py-4 border border-bg/30 text-bg text-sm uppercase tracking-widest hover:bg-bg hover:text-ink transition-colors">
                {hero.primaryCta?.label}
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ─── HERO STYLE: RUSSELL NUMO (Monospace Grid) ───
  if (heroStyle === 'russellnumo') {
    return (
      <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="relative min-h-screen flex flex-col pt-24 sm:pt-32 pb-8 sm:pb-12 bg-surface text-ink border-b border-ink">
        <div className="w-full h-full flex flex-col md:flex-row border-t border-ink border-b border-ink mx-3 sm:mx-6 max-w-[calc(100%-1.5rem)] sm:max-w-[calc(100%-3rem)]">
          <div className="w-full md:w-2/3 p-4 sm:p-8 border-b md:border-b-0 md:border-r border-ink flex flex-col justify-center bg-bg">
            <h1 data-edit-id="hero.headline" data-edit-name="Hero · Headline" data-edit-kind="heading" className="font-mono uppercase text-4xl sm:text-6xl font-bold leading-tight">
              {(hero.headline || []).map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
              {isVisible('headlineAccent') && (
                <span data-edit-id="hero.accent" data-edit-name="Hero · Accent word" data-edit-kind="text" data-edit-path="hero.headlineAccent" className="block text-accent mt-4">
                  {hero.headlineAccent}
                </span>
              )}
            </h1>
          </div>
          <div className="w-full md:w-1/3 p-8 flex flex-col justify-between bg-surface">
            <div>
              {isVisible('badge') && (
                <div data-edit-id="hero.badge" data-edit-name="Hero · Badge" data-edit-kind="text" data-edit-path="hero.badge" className="text-xs font-mono uppercase border border-ink p-2 mb-8 inline-block">
                  {hero.badge}
                </div>
              )}
              {isVisible('subtitle') && (
                <p data-edit-id="hero.subtitle" data-edit-name="Hero · Subtitle" data-edit-kind="text" data-edit-path="hero.subtitle" className="text-sm font-mono leading-relaxed">
                  {hero.subtitle?.replace(/<[^>]*>/g, '')}
                </p>
              )}
            </div>
            <div className="mt-12 flex flex-col gap-4">
              {isVisible('primaryCta') && (
                <a href={hero.primaryCta?.href || '#projects'} data-edit-id="hero.primaryCta" data-edit-name="Hero · Primary button" data-edit-kind="button" data-edit-path="hero.primaryCta.label" className="w-full text-center px-6 py-4 bg-ink text-bg font-mono font-bold uppercase tracking-wider hover:bg-accent hover:text-ink transition-colors">
                  {hero.primaryCta?.label}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─── HERO STYLE: VIVID MOTION (Soft Glassy) ───
  if (heroStyle === 'vividmotion') {
    return (
      <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent blur-[100px] -z-10" />
        <div className="w-full max-w-6xl rounded-[3rem] bg-surface/40 backdrop-blur-3xl border border-white/20 shadow-2xl p-12 sm:p-20 text-center flex flex-col items-center">
          {isVisible('badge') && (
            <div data-edit-id="hero.badge" data-edit-name="Hero · Badge" data-edit-kind="text" data-edit-path="hero.badge" className="px-5 py-2 rounded-full bg-white/10 border border-white/20 text-ink/80 text-xs font-medium tracking-wide mb-10">
              {hero.badge}
            </div>
          )}
          <h1 data-edit-id="hero.headline" data-edit-name="Hero · Headline" data-edit-kind="heading" className="font-display font-medium text-4xl sm:text-7xl text-ink leading-tight tracking-tight max-w-4xl">
            {(hero.headline || []).map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
            {isVisible('headlineAccent') && (
              <span data-edit-id="hero.accent" data-edit-name="Hero · Accent word" data-edit-kind="text" data-edit-path="hero.headlineAccent" className="inline-block px-4 rounded-full bg-accent/20 text-accent/90 mt-2">
                {hero.headlineAccent}
              </span>
            )}
          </h1>
          {isVisible('subtitle') && (
            <p data-edit-id="hero.subtitle" data-edit-name="Hero · Subtitle" data-edit-kind="text" data-edit-path="hero.subtitle" className="mt-8 max-w-2xl text-lg sm:text-xl text-ink/60 leading-relaxed font-light">
              {hero.subtitle?.replace(/<[^>]*>/g, '')}
            </p>
          )}
          <div className="mt-12 flex items-center justify-center gap-4">
            {isVisible('primaryCta') && (
              <a href={hero.primaryCta?.href || '#projects'} data-edit-id="hero.primaryCta" data-edit-name="Hero · Primary button" data-edit-kind="button" data-edit-path="hero.primaryCta.label" className="px-10 py-4 rounded-full bg-ink text-bg font-medium hover:scale-105 hover:shadow-xl transition-transform">
                {hero.primaryCta?.label}
              </a>
            )}
            {isVisible('secondaryCta') && (
              <a href={hero.secondaryCta?.href || '/resume.pdf'} data-edit-id="hero.secondaryCta" data-edit-name="Hero · Secondary button" data-edit-kind="button" data-edit-path="hero.secondaryCta.label" className="px-10 py-4 rounded-full border border-ink/20 text-ink hover:bg-white/10 transition-colors">
                {hero.secondaryCta?.label}
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ─── LAYOUT A: JOY RUSH (Playful Candy & Floaters) ───
  if (heroStyle === 'default' && animationStyle === 'joyrush') {
    return (
      <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-36 pb-12 bg-[#FDF7EE]">
        {/* Floating background clouds/bubbles */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <motion.div animate={{ y: [0, -20, 0], x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} className="absolute top-[20%] left-[10%] w-24 h-24 rounded-full bg-[#37B5A8]/10 blur-xl" />
          <motion.div animate={{ y: [0, 15, 0], x: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="absolute bottom-[20%] right-[10%] w-32 h-32 rounded-full bg-[#E64B5A]/15 blur-xl" />
          <motion.div animate={{ y: [0, -30, 0] }} transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }} className="absolute top-[60%] left-[80%] w-16 h-16 rounded-full bg-yellow-300/20 blur-lg" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-5 text-center flex flex-col items-center">
          {/* Eyebrow badge */}
          {isVisible('badge') && (
            <motion.div custom={0} variants={rise} initial="hidden" animate="show" data-edit-id="hero.badge" data-edit-name="Hero · Badge" data-edit-kind="text" data-edit-path="hero.badge" className="px-5 py-2 rounded-full bg-[#E64B5A] text-[#FFF3F6] border-2 border-[#2C0E1E] shadow-[3px_3px_0px_#2C0E1E] text-xs font-bold uppercase tracking-wider">
              {hero.badge}
            </motion.div>
          )}

          {/* Heading */}
          <h1 data-edit-id="hero.headline" data-edit-name="Hero · Headline" data-edit-kind="heading" className="mt-8 font-display font-black text-black leading-[0.9] text-[clamp(2.75rem,8vw,5rem)] text-transform-lowercase">
            {(hero.headline || []).map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
            {isVisible('headlineAccent') && (
              <span data-edit-id="hero.accent" data-edit-name="Hero · Accent word" data-edit-kind="text" data-edit-path="hero.headlineAccent" className="block italic text-[#37B5A8] mt-2">{hero.headlineAccent}</span>
            )}
          </h1>

          {/* Subtitle */}
          {isVisible('subtitle') && (
            <p data-edit-id="hero.subtitle" data-edit-name="Hero · Subtitle" data-edit-kind="text" data-edit-path="hero.subtitle" className="mt-8 max-w-xl text-base sm:text-lg text-[#2C0E1E]/80 leading-relaxed font-semibold">
              {hero.subtitle?.replace(/<[^>]*>/g, '')}
            </p>
          )}

          {/* Visual Profile Avatar Bubble */}
          <div className="relative mt-10 w-44 h-44 rounded-full border-4 border-[#2C0E1E] shadow-[6px_6px_0px_#2C0E1E] overflow-hidden bg-white">
            <img fetchPriority="high"
              data-edit-id="hero.profileImage" data-edit-name="Hero · Profile image" data-edit-kind="image" data-edit-path="hero.profileImage"
              src={hero.profileImage || arunProfile}
              alt={hero.name || 'Arun Pandian'}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Button Stepper CTAs */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {isVisible('primaryCta') && (
              <a
                href={hero.primaryCta?.href || '#projects'}
                data-edit-id="hero.primaryCta" data-edit-name="Hero · Primary button" data-edit-kind="button" data-edit-path="hero.primaryCta.label"
                className="custom-element-button px-8 py-3.5 border-3 border-[#2C0E1E] text-black font-bold uppercase rounded-full shadow-[4px_4px_0px_#2C0E1E] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#2C0E1E] transition-transform"
              >
                {hero.primaryCta?.label || 'View selected work'}
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ─── LAYOUT B: K95 MINIMAL (Monochrome & Lines) ───
  if (heroStyle === 'default' && animationStyle === 'k95') {
    return (
      <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="relative min-h-screen flex flex-col justify-between pt-36 pb-12 bg-[#FAFAFA] text-[#111111] font-mono">
        {/* Hairline structural grids */}
        <div className="absolute inset-0 grid grid-cols-4 pointer-events-none -z-10">
          <div className="border-r border-line h-full" />
          <div className="border-r border-line h-full" />
          <div className="border-r border-line h-full" />
          <div className="h-full" />
        </div>

        <div className="w-full max-w-6xl mx-auto px-5">
          <div className="flex justify-between items-start border-b border-line pb-8">
            {isVisible('badge') && (
              <span data-edit-id="hero.badge" data-edit-name="Hero · Badge" data-edit-kind="text" data-edit-path="hero.badge" className="text-xs uppercase tracking-widest text-ink-soft">
                {hero.badge}
              </span>
            )}
            <span className="text-xs text-ink-soft font-mono">EST. 2026</span>
          </div>

          <div className="my-16">
            <h1 data-edit-id="hero.headline" data-edit-name="Hero · Headline" data-edit-kind="heading" className="text-[clamp(2.5rem,7vw,6rem)] font-light leading-[1.05] tracking-tight uppercase">
              {(hero.headline || []).map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
              {isVisible('headlineAccent') && (
                <span data-edit-id="hero.accent" data-edit-name="Hero · Accent word" data-edit-kind="text" data-edit-path="hero.headlineAccent" className="block text-accent font-normal mt-2 underline underline-offset-8">
                  {hero.headlineAccent}
                </span>
              )}
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-line">
            <div className="col-span-2">
              {isVisible('subtitle') && (
                <p data-edit-id="hero.subtitle" data-edit-name="Hero · Subtitle" data-edit-kind="text" data-edit-path="hero.subtitle" className="text-sm text-ink-soft leading-relaxed max-w-xl">
                  {hero.subtitle?.replace(/<[^>]*>/g, '')}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3 justify-end items-start md:items-end">
              {isVisible('primaryCta') && (
                <a
                  href={hero.primaryCta?.href || '#projects'}
                  data-edit-id="hero.primaryCta" data-edit-name="Hero · Primary button" data-edit-kind="button" data-edit-path="hero.primaryCta.label"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-ink hover:text-accent font-bold transition-colors"
                >
                  <span>{hero.primaryCta?.label || 'Work Index'}</span>
                  <ArrowRight size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─── LAYOUT C: JULIEN CALOT (Dark Artistic Drama) ───
  if (heroStyle === 'default' && animationStyle === 'juliencalot') {
    return (
      <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="relative min-h-screen flex items-center justify-center pt-28 pb-16 bg-[#0B0A0F] text-[#FAF9FC] overflow-hidden">
        {/* Glow ambient background sphere */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF2A54]/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
          {isVisible('badge') && (
            <span data-edit-id="hero.badge" data-edit-name="Hero · Badge" data-edit-kind="text" data-edit-path="hero.badge" className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[11px] font-mono tracking-widest uppercase text-[#A59EB5] mb-6">
              {hero.badge}
            </span>
          )}

          <h1 data-edit-id="hero.headline" data-edit-name="Hero · Headline" data-edit-kind="heading" className="font-serif italic font-light text-[clamp(3rem,8vw,7rem)] leading-[0.95] text-white">
            {(hero.headline || []).map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
            {isVisible('headlineAccent') && (
              <span data-edit-id="hero.accent" data-edit-name="Hero · Accent word" data-edit-kind="text" data-edit-path="hero.headlineAccent" className="not-italic font-sans font-black text-[#FF2A54] block mt-2 tracking-tight">
                {hero.headlineAccent}
              </span>
            )}
          </h1>

          {isVisible('subtitle') && (
            <p data-edit-id="hero.subtitle" data-edit-name="Hero · Subtitle" data-edit-kind="text" data-edit-path="hero.subtitle" className="mt-8 max-w-xl text-sm sm:text-base text-[#A59EB5] leading-relaxed">
              {hero.subtitle?.replace(/<[^>]*>/g, '')}
            </p>
          )}

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {isVisible('primaryCta') && (
              <a
                href={hero.primaryCta?.href || '#projects'}
                data-edit-id="hero.primaryCta" data-edit-name="Hero · Primary button" data-edit-kind="button" data-edit-path="hero.primaryCta.label"
                className="px-8 py-3.5 rounded-full bg-[#FF2A54] hover:bg-[#ff4267] text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#FF2A54]/30 hover:scale-105 transition-all"
              >
                {hero.primaryCta?.label || 'Explore'}
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ─── LAYOUT D: DEPO LUXE (High-End Luxury Monolith) ───
  if (heroStyle === 'default' && animationStyle === 'depoluxe') {
    return (
      <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="relative min-h-screen flex flex-col justify-center pt-32 pb-16 bg-[#0E0F11] text-[#EAEAEA] border-b border-[#2C2F36]">
        <div className="w-full max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#D4AF37]" />
              {isVisible('badge') && (
                <span data-edit-id="hero.badge" data-edit-name="Hero · Badge" data-edit-kind="text" data-edit-path="hero.badge" className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-serif">
                  {hero.badge}
                </span>
              )}
            </div>

            <h1 data-edit-id="hero.headline" data-edit-name="Hero · Headline" data-edit-kind="heading" className="font-serif text-[clamp(2.5rem,6vw,5.5rem)] font-light leading-[1.05] tracking-tight">
              {(hero.headline || []).map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
              {isVisible('headlineAccent') && (
                <span data-edit-id="hero.accent" data-edit-name="Hero · Accent word" data-edit-kind="text" data-edit-path="hero.headlineAccent" className="block text-[#D4AF37] italic font-normal mt-1">
                  {hero.headlineAccent}
                </span>
              )}
            </h1>

            {isVisible('subtitle') && (
              <p data-edit-id="hero.subtitle" data-edit-name="Hero · Subtitle" data-edit-kind="text" data-edit-path="hero.subtitle" className="max-w-xl text-sm text-[#808590] leading-relaxed font-serif pt-4 border-t border-[#2C2F36]">
                {hero.subtitle?.replace(/<[^>]*>/g, '')}
              </p>
            )}

            <div className="pt-4 flex gap-4">
              {isVisible('primaryCta') && (
                <a
                  href={hero.primaryCta?.href || '#projects'}
                  data-edit-id="hero.primaryCta" data-edit-name="Hero · Primary button" data-edit-kind="button" data-edit-path="hero.primaryCta.label"
                  className="px-8 py-3.5 bg-transparent border border-[#D4AF37] text-[#D4AF37] text-xs uppercase tracking-[0.2em] font-serif hover:bg-[#D4AF37] hover:text-black transition-colors"
                >
                  {hero.primaryCta?.label || 'Curated Portfolio'}
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-64 h-80 rounded-none border border-[#2C2F36] p-2 bg-[#181A1F]">
              <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37]" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37]" />
              <img fetchPriority="high"
                data-edit-id="hero.profileImage" data-edit-name="Hero · Profile image" data-edit-kind="image" data-edit-path="hero.profileImage"
                src={hero.profileImage || arunProfile}
                alt={hero.name || 'Arun Pandian'}
                className="w-full h-full object-cover grayscale contrast-125"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─── LAYOUT E: RADIAN (Neon Hazard Sports) ───
  if (heroStyle === 'default' && animationStyle === 'radian') {
    return (
      <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="relative min-h-screen flex flex-col justify-center bg-bg text-ink overflow-hidden pt-36 pb-12">
        {/* Full-width neon lines background */}
        <div 
          className="absolute inset-0 pointer-events-none -z-10" 
          style={{ background: 'radial-gradient(circle at center, color-mix(in srgb, var(--color-accent) 15%, transparent) 0%, transparent 60%)' }}
        />

        <div className="w-full max-w-7xl mx-auto px-5 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            {isVisible('badge') && (
              <span data-edit-id="hero.badge" data-edit-name="Hero · Badge" data-edit-kind="text" data-edit-path="hero.badge" className="inline-block px-3 py-1 bg-accent text-bg font-mono text-xs font-bold uppercase tracking-widest mb-6">
                {hero.badge}
              </span>
            )}

            <h1 data-edit-id="hero.headline" data-edit-name="Hero · Headline" data-edit-kind="heading" className="font-display font-black uppercase text-[clamp(2.5rem,8vw,6rem)] tracking-tighter leading-[0.85] break-words">
              {(hero.headline || []).map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
              {isVisible('headlineAccent') && (
                <span data-edit-id="hero.accent" data-edit-name="Hero · Accent word" data-edit-kind="text" data-edit-path="hero.headlineAccent" className="block text-accent">{hero.headlineAccent}</span>
              )}
            </h1>

            {isVisible('subtitle') && (
              <p data-edit-id="hero.subtitle" data-edit-name="Hero · Subtitle" data-edit-kind="text" data-edit-path="hero.subtitle" className="mt-8 max-w-md text-sm sm:text-base text-ink-soft leading-relaxed font-mono">
                {hero.subtitle?.replace(/<[^>]*>/g, '')}
              </p>
            )}

            <div className="mt-8">
              {isVisible('primaryCta') && (
                <a
                  href={hero.primaryCta?.href || '#projects'}
                  data-edit-id="hero.primaryCta" data-edit-name="Hero · Primary button" data-edit-kind="button" data-edit-path="hero.primaryCta.label"
                  className="custom-element-button inline-flex items-center gap-2 px-8 py-3.5 bg-accent text-bg font-bold uppercase hover:opacity-90 transition-transform text-xs tracking-wider"
                  style={{ boxShadow: '0 0 15px var(--color-accent)' }}
                >
                  {hero.primaryCta?.label}
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center relative">
            {/* GPS meta display box */}
            <div className="absolute top-4 right-4 z-20 font-mono text-[9px] text-[#F3D016] bg-black/60 px-2 py-1 rounded border border-[#F3D016]/20">
              COORD: 54.3439°N 7.6321°W
            </div>
            
            <div className="w-full max-w-sm aspect-square bg-[#111111] border-2 border-[#F3D016] p-2 relative group">
              <video
                ref={videoRef}
                src={hero.videoSrc || '/hero-animation.mp4'}
                autoPlay muted={isMuted} loop playsInline
                className="w-full h-full object-cover filter grayscale contrast-125"
              />
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMuted(!isMuted); }}
                className="absolute bottom-4 right-4 p-2 rounded bg-[#F3D016] text-black transition-opacity z-50 flex items-center justify-center cursor-pointer shadow-md"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─── HERO STYLE: KONNECT (Dark Theme Circular) ───
  if (heroStyle === 'konnect') {
    return (
      <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="relative min-h-screen flex flex-col justify-center bg-[#0d0e15] text-white pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1d1f30] via-[#0d0e15] to-[#0d0e15] opacity-50 pointer-events-none -z-10" />
        <div className="w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            {isVisible('badge') && (
              <div data-edit-id="hero.badge" data-edit-name="Hero · Badge" data-edit-kind="text" data-edit-path="hero.badge" className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-[#4c84ff] text-xs font-bold uppercase tracking-wider mb-6">
                {hero.badge}
              </div>
            )}
            <h1 data-edit-id="hero.headline" data-edit-name="Hero · Headline" data-edit-kind="heading" className="font-display font-bold text-[clamp(2.5rem,5vw,4.5rem)] leading-tight mb-6">
              {(hero.headline || []).map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
              {isVisible('headlineAccent') && (
                <span data-edit-id="hero.accent" data-edit-name="Hero · Accent word" data-edit-kind="text" data-edit-path="hero.headlineAccent" className="text-[#4c84ff] block">{hero.headlineAccent}</span>
              )}
            </h1>
            {isVisible('subtitle') && (
              <p data-edit-id="hero.subtitle" data-edit-name="Hero · Subtitle" data-edit-kind="text" data-edit-path="hero.subtitle" className="text-white/60 text-lg max-w-lg mb-8 leading-relaxed">
                {hero.subtitle?.replace(/<[^>]*>/g, '')}
              </p>
            )}
            <div className="flex flex-wrap gap-4">
              {isVisible('primaryCta') && (
                <a href={hero.primaryCta?.href || '#projects'} data-edit-id="hero.primaryCta" data-edit-name="Hero · Primary button" data-edit-kind="button" data-edit-path="hero.primaryCta.label" className="px-8 py-3.5 bg-[#4c84ff] text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-[0_0_20px_rgba(76,132,255,0.4)]">
                  {hero.primaryCta?.label}
                </a>
              )}
              {isVisible('secondaryCta') && (
                <a href={hero.secondaryCta?.href || '#about'} data-edit-id="hero.secondaryCta" data-edit-name="Hero · Secondary button" data-edit-kind="button" data-edit-path="hero.secondaryCta.label" className="px-8 py-3.5 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors">
                  {hero.secondaryCta?.label}
                </a>
              )}
            </div>
          </div>
          <div className="relative flex justify-center items-center h-full min-h-[340px] sm:min-h-[500px]">
             <div className="absolute w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] rounded-full border border-white/10 flex items-center justify-center">
               <div className="w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] rounded-full bg-gradient-to-tr from-[#4c84ff] to-[#ff4c84] flex items-center justify-center overflow-hidden p-1 shadow-2xl">
                 <img fetchPriority="high" src={gallery[0]?.url || hero.profileImage || arunProfile} alt="Profile" className="w-full h-full object-cover rounded-full bg-[#151722]" />
               </div>
             </div>
             <div className="absolute top-[10%] right-[10%] w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#151722] shadow-lg animate-[bounce_3s_ease-in-out_infinite]" style={{ opacity: gallery.length === 1 ? 0 : 1 }}>
                <img fetchPriority="high" src={gallery[1]?.url || gallery[0]?.url || arunProfile} alt="Float" className="w-full h-full object-cover" />
             </div>
             <div className="absolute bottom-[15%] left-[5%] w-11 h-11 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-[#151722] shadow-lg animate-[bounce_4s_ease-in-out_infinite]" style={{ opacity: (gallery.length === 1 || gallery.length === 2) ? 0 : 1 }}>
                <img fetchPriority="high" src={gallery[2]?.url || gallery[0]?.url || arunProfile} alt="Float" className="w-full h-full object-cover" />
             </div>
             {credentials.length > 0 && (
               <div className="absolute top-[30%] left-[5%] bg-white/10 backdrop-blur border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                 <span className="text-[#4c84ff] font-bold text-xl">{credentials[0]?.value}</span>
                 <span className="text-white/70 text-xs uppercase">{credentials[0]?.label}</span>
               </div>
             )}
          </div>
        </div>
      </section>
    );
  }

  // ─── HERO STYLE: LOVE & RESPECT (Grid & Video) ───
  if (heroStyle === 'loveandrespect') {
    return (
      <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="relative min-h-0 lg:min-h-screen flex flex-col justify-center bg-[#f7f5f2] text-[#2c2b29] pt-20 sm:pt-28 pb-8 sm:pb-12 overflow-hidden">
        <div className="absolute left-[35%] top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none opacity-[0.03] -z-10">
          <span className="font-serif text-[40rem] leading-none">&amp;</span>
        </div>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center z-10">
          <div className="max-w-lg">
            <h1 data-edit-id="hero.headline" data-edit-name="Hero · Headline" data-edit-kind="heading" className="font-serif italic font-light text-3xl sm:text-5xl lg:text-7xl leading-[1.15] mb-4 sm:mb-6">
              {(hero.headline || []).map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
              {isVisible('headlineAccent') && (
                <span data-edit-id="hero.accent" data-edit-name="Hero · Accent word" data-edit-kind="text" data-edit-path="hero.headlineAccent" className="not-italic font-bold tracking-tight block">{hero.headlineAccent}</span>
              )}
            </h1>
            {isVisible('subtitle') && (
              <p data-edit-id="hero.subtitle" data-edit-name="Hero · Subtitle" data-edit-kind="text" data-edit-path="hero.subtitle" className="text-sm sm:text-base lg:text-lg opacity-80 mb-6 sm:mb-8 leading-relaxed font-sans">
                {hero.subtitle?.replace(/<[^>]*>/g, '')}
              </p>
            )}
            {isVisible('primaryCta') && (
              <a href={hero.primaryCta?.href || '#projects'} data-edit-id="hero.primaryCta" data-edit-name="Hero · Primary button" data-edit-kind="button" data-edit-path="hero.primaryCta.label" className="inline-block border-b-2 border-[#2c2b29] pb-1 uppercase tracking-widest text-xs sm:text-sm font-bold hover:opacity-60 transition-opacity">
                {hero.primaryCta?.label}
              </a>
            )}

            {/* Motivational Sticky Note in Hero Empty Space */}
            <div className="mt-6 sm:mt-8">
              <StickyQuoteNote />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 h-[380px] sm:h-[460px] lg:h-[560px] max-w-md mx-auto lg:max-w-none w-full">
            <div className="flex flex-col gap-3 sm:gap-4 h-full">
              {gallery.length <= 1 ? (
                <div className="bg-[#e4e2de] rounded-2xl overflow-hidden h-full relative shadow-sm">
                  <img fetchPriority="high" src={gallery[0]?.url || hero.profileImage || arunProfile} alt="Grid 1" className="w-full h-full object-cover object-center filter grayscale" />
                </div>
              ) : (
                <>
                  <div className="bg-[#e4e2de] rounded-2xl overflow-hidden flex-1 relative shadow-sm">
                    <img fetchPriority="high" src={gallery[0]?.url || hero.profileImage || arunProfile} alt="Grid 1" className="w-full h-full object-cover object-center filter grayscale" />
                  </div>
                  {gallery.length >= 3 && (
                    <div className="bg-[#e4e2de] rounded-2xl overflow-hidden h-1/3 relative shadow-sm">
                      <img fetchPriority="high" src={gallery[1]?.url || arunProfile} alt="Grid 2" className="w-full h-full object-cover object-center" />
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex flex-col gap-3 sm:gap-4 h-full">
              <div className={`bg-[#2c2b29] rounded-2xl overflow-hidden relative group shadow-sm ${(gallery.length === 2 || gallery.length >= 3) ? 'flex-1 h-1/2' : 'h-full flex-1'}`}>
                <video ref={videoRef} src={hero.videoSrc || '/hero-animation.mp4'} autoPlay muted={isMuted} loop playsInline className="w-full h-full object-cover object-center opacity-80 group-hover:opacity-100 transition-opacity" />
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMuted(!isMuted); }}
                  className="absolute inset-0 w-full h-full flex items-center justify-center transition-opacity bg-black/10 hover:bg-black/20 cursor-pointer"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/40 text-white">
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </div>
                </button>
              </div>
              {(gallery.length === 2 || gallery.length >= 3 || !gallery.length) && (
                <div className="bg-[#e4e2de] rounded-2xl overflow-hidden flex-1 h-1/2 relative shadow-sm">
                  <img fetchPriority="high" src={gallery.length === 2 ? gallery[1]?.url : (gallery[2]?.url || gallery[0]?.url || arunProfile)} alt="Grid 3" className="w-full h-full object-cover object-center" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─── HERO STYLE: LOGOIPSUM (Rounded Collage with Grid Lines) ───
  if (heroStyle === 'logoipsum') {
    return (
      <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="relative min-h-screen flex flex-col justify-center bg-white text-slate-900 pt-32 pb-12 overflow-hidden">
        {/* Subtle Engineering Data Grid Background */}
        <div 
          className="absolute inset-0 pointer-events-none -z-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(15, 23, 42, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(15, 23, 42, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse 90% 80% at 50% 45%, #000 65%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 50% 45%, #000 65%, transparent 100%)'
          }}
        />

        {/* Ambient Soft Blur Highlights */}
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-gradient-to-br from-amber-400/10 via-orange-300/10 to-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          <div className="max-w-xl text-center lg:text-left mx-auto lg:mx-0">
            <h1 data-edit-id="hero.headline" data-edit-name="Hero · Headline" data-edit-kind="heading" className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-[1.15] mb-4 sm:mb-6">
              {(hero.headline || []).map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
              {isVisible('headlineAccent') && (
                <span data-edit-id="hero.accent" data-edit-name="Hero · Accent word" data-edit-kind="text" data-edit-path="hero.headlineAccent" className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400 block mt-2">{hero.headlineAccent}</span>
              )}
            </h1>
            {isVisible('subtitle') && (
              <p data-edit-id="hero.subtitle" data-edit-name="Hero · Subtitle" data-edit-kind="text" data-edit-path="hero.subtitle" className="text-slate-500 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 leading-relaxed">
                {hero.subtitle?.replace(/<[^>]*>/g, '')}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-5">
              {isVisible('primaryCta') && (
                <a href={hero.primaryCta?.href || '#projects'} data-edit-id="hero.primaryCta" data-edit-name="Hero · Primary button" data-edit-kind="button" data-edit-path="hero.primaryCta.label" className="px-6 sm:px-8 py-3 sm:py-3.5 bg-slate-900 text-white rounded-full font-semibold text-xs sm:text-sm hover:bg-slate-800 hover:shadow-lg transition-all active:scale-95 shadow-md">
                  {hero.primaryCta?.label}
                </a>
              )}
              {isVisible('secondaryCta') && (
                <a 
                  href={hero.secondaryCta?.href || '/resume.pdf'} 
                  download="Arun_Pandian_Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-edit-id="hero.secondaryCta" 
                  data-edit-name="Hero · Secondary button" 
                  data-edit-kind="button" 
                  data-edit-path="hero.secondaryCta.label" 
                  className="group flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white hover:bg-slate-50 border border-slate-200/90 shadow-xs hover:shadow-md font-semibold text-slate-800 hover:text-slate-950 transition-all duration-200 cursor-pointer active:scale-95 text-xs sm:text-sm"
                >
                  <div className="w-7 h-7 sm:w-9 sm:h-9 bg-slate-100 group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-600 rounded-full flex items-center justify-center transition-colors shrink-0 border border-slate-200/80">
                    <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                  </div>
                  <span className="font-semibold">{hero.secondaryCta?.label || 'Download résumé'}</span>
                </a>
              )}
            </div>
          </div>
          <div className="flex gap-3 sm:gap-6 h-[320px] sm:h-[420px] lg:h-[500px] justify-center lg:justify-end w-full max-w-md mx-auto lg:max-w-none">
            {gallery.length === 1 ? (
              <div className="w-56 sm:w-72 lg:w-80 h-full">
                <img fetchPriority="high" src={gallery[0]?.url || hero.profileImage || arunProfile} alt="Collage 1" className="w-full h-full object-cover rounded-2xl sm:rounded-[3rem] shadow-lg" />
              </div>
            ) : gallery.length === 2 ? (
              <>
                <div className="w-36 sm:w-48 lg:w-56 h-full pt-6 sm:pt-12">
                  <img fetchPriority="high" src={gallery[0]?.url} alt="Collage 1" className="w-full h-[85%] object-cover rounded-2xl sm:rounded-full shadow-lg" />
                </div>
                <div className="w-36 sm:w-48 lg:w-56 h-full pb-6 sm:pb-12">
                  <img fetchPriority="high" src={gallery[1]?.url} alt="Collage 2" className="w-full h-[85%] object-cover rounded-2xl sm:rounded-[3rem] shadow-lg" />
                </div>
              </>
            ) : gallery.length === 3 ? (
              <>
                <div className="flex flex-col gap-3 sm:gap-6 pt-6 sm:pt-12 w-32 sm:w-40 lg:w-48">
                  <img fetchPriority="high" src={gallery[0]?.url} alt="Collage 1" className="w-full h-[50%] object-cover rounded-xl sm:rounded-full shadow-lg" />
                  <img fetchPriority="high" src={gallery[1]?.url} alt="Collage 2" className="w-full h-[50%] object-cover rounded-xl sm:rounded-[2.5rem] shadow-lg" />
                </div>
                <div className="w-36 sm:w-48 lg:w-56 h-full">
                  <img fetchPriority="high" src={gallery[2]?.url} alt="Collage 3" className="w-full h-[90%] object-cover rounded-2xl sm:rounded-[3rem] shadow-lg mt-4 sm:mt-6" />
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-3 sm:gap-6 pt-6 sm:pt-12 w-32 sm:w-40 lg:w-48">
                  <img fetchPriority="high" src={gallery[0]?.url || hero.profileImage || arunProfile} alt="Collage 1" className="w-full h-[60%] object-cover rounded-xl sm:rounded-full shadow-lg" />
                  <img fetchPriority="high" src={gallery[1]?.url || arunProfile} alt="Collage 2" className="w-full h-[40%] object-cover rounded-xl sm:rounded-[2.5rem] shadow-lg" />
                </div>
                <div className="flex flex-col gap-3 sm:gap-6 w-36 sm:w-48 lg:w-56">
                  <img fetchPriority="high" src={gallery[2]?.url || gallery[0]?.url || arunProfile} alt="Collage 3" className="w-full h-[45%] object-cover rounded-2xl sm:rounded-[2.5rem] shadow-lg" />
                  <img fetchPriority="high" src={gallery[3]?.url || gallery[0]?.url || arunProfile} alt="Collage 4" className="w-full h-[55%] object-cover rounded-2xl sm:rounded-full shadow-lg" />
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ─── HERO STYLE: STREAMING (Fan Carousel) ───
  if (heroStyle === 'streaming') {
    return (
      <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="relative min-h-[90vh] flex flex-col justify-center bg-[#eaeaea] text-black pt-32 pb-24 overflow-hidden">
        <div className="absolute top-6 right-8 bg-[#e50914] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition cursor-pointer shadow-lg z-20">
           Save
        </div>
        <div className="w-full max-w-7xl mx-auto px-6 text-center relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-2xl tracking-tight">Profile</span>
          </div>
          <h1 data-edit-id="hero.headline" data-edit-name="Hero · Headline" data-edit-kind="heading" className="font-display font-bold text-[clamp(2rem,3vw,3rem)] leading-tight mb-12">
            {hero.headline?.join(' ') || 'Discover Unlimited Content'}
          </h1>
          
          <div className="relative w-full max-w-2xl h-[400px] flex justify-center items-center mt-8">
            {gallery.length === 1 && (
               <img alt="" fetchPriority="high" src={gallery[0]?.url || hero.profileImage || arunProfile} className="absolute w-64 h-96 object-cover rounded-xl shadow-2xl z-10" />
            )}
            {gallery.length === 2 && (
               <>
                 <img alt="" fetchPriority="high" src={gallery[0]?.url} className="absolute w-64 h-96 object-cover rounded-xl shadow-2xl z-10 -rotate-6 -translate-x-12" />
                 <img alt="" fetchPriority="high" src={gallery[1]?.url} className="absolute w-64 h-96 object-cover rounded-xl shadow-xl z-0 rotate-6 translate-x-12 opacity-80" />
               </>
            )}
            {gallery.length >= 3 && (
               <>
                 <img alt="" fetchPriority="high" src={gallery[1]?.url || arunProfile} className="absolute w-56 h-80 object-cover rounded-xl shadow-lg z-0 -rotate-12 -translate-x-32 opacity-60 grayscale hover:grayscale-0 transition" />
                 {gallery.length >= 5 && (
                   <img alt="" fetchPriority="high" src={gallery[3]?.url || arunProfile} className="absolute w-48 h-72 object-cover rounded-xl shadow-md -z-10 -rotate-12 -translate-x-56 opacity-40 grayscale hover:grayscale-0 transition" />
                 )}
                 <img alt="" fetchPriority="high" src={gallery[0]?.url || hero.profileImage || arunProfile} className="absolute w-64 h-96 object-cover rounded-xl shadow-2xl z-20 hover:scale-105 transition-transform duration-300 ring-2 ring-yellow-500 ring-offset-4 ring-offset-[#eaeaea]" />
                 <img alt="" fetchPriority="high" src={gallery[2]?.url || arunProfile} className="absolute w-56 h-80 object-cover rounded-xl shadow-lg z-0 rotate-12 translate-x-32 opacity-60 grayscale hover:grayscale-0 transition" />
                 {gallery.length >= 5 && (
                   <img alt="" fetchPriority="high" src={gallery[4]?.url || arunProfile} className="absolute w-48 h-72 object-cover rounded-xl shadow-md -z-10 rotate-12 translate-x-56 opacity-40 grayscale hover:grayscale-0 transition" />
                 )}
               </>
            )}
            {gallery.length === 0 && (
               <img alt="" fetchPriority="high" src={arunProfile} className="absolute w-64 h-96 object-cover rounded-xl shadow-2xl z-10 ring-2 ring-yellow-500 ring-offset-4 ring-offset-[#eaeaea]" />
            )}
          </div>
        </div>
      </section>
    );
  }

  // ─── HERO STYLE: PUREMODA (Fashion Bento) ───
  if (heroStyle === 'puremoda') {
    return (
      <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="relative min-h-screen bg-white text-black p-4 md:p-8 pt-24 md:pt-32 overflow-hidden">
        <div className="w-full max-w-[1400px] mx-auto lg:h-[calc(100vh-8rem)] lg:min-h-[600px] grid lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4 h-full min-h-[500px] lg:min-h-0">
            <div className="bg-[#e4e2de] rounded-3xl p-8 lg:p-12 flex flex-col justify-between flex-1 relative overflow-hidden group">
              <div>
                <h1 data-edit-id="hero.headline" data-edit-name="Hero · Headline" data-edit-kind="heading" className="font-display font-black text-[clamp(2.5rem,5vw,5rem)] leading-[0.9] uppercase tracking-tighter">
                  {(hero.headline || []).map((line, i) => (
                    <span key={i} className="block">{line}</span>
                  ))}
                  <ArrowRight size={48} strokeWidth={1} className="inline-block ml-4 -mt-4 text-black/50 group-hover:translate-x-4 transition-transform" />
                </h1>
              </div>
              {isVisible('subtitle') && (
                <p data-edit-id="hero.subtitle" data-edit-name="Hero · Subtitle" data-edit-kind="text" data-edit-path="hero.subtitle" className="text-black/70 text-sm max-w-sm leading-relaxed mt-12">
                  {hero.subtitle?.replace(/<[^>]*>/g, '')}
                </p>
              )}
            </div>
            {(gallery.length >= 2) && (
              <div className="h-1/3 flex gap-4">
                {gallery.length === 2 ? (
                  <div className="flex-1 bg-slate-200 rounded-3xl overflow-hidden relative">
                    <img alt="" fetchPriority="high" src={gallery[1]?.url} className="w-full h-full object-cover" />
                    <div data-edit-id="hero.puremodaTag1" data-edit-name="Tag 1" data-edit-kind="text" data-edit-path="hero.puremodaTag1" className="absolute bottom-4 left-6 text-white font-black text-xl drop-shadow-md">{hero.puremodaTag1 || '#ANALYTICS'}</div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 bg-slate-200 rounded-3xl overflow-hidden relative">
                      <img alt="" fetchPriority="high" src={gallery[1]?.url} className="w-full h-full object-cover" />
                      <div data-edit-id="hero.puremodaTag1" data-edit-name="Tag 1" data-edit-kind="text" data-edit-path="hero.puremodaTag1" className="absolute bottom-4 left-6 text-white font-black text-xl drop-shadow-md">{hero.puremodaTag1 || '#MACHINE_LEARNING'}</div>
                    </div>
                    <div className="flex-1 bg-slate-200 rounded-3xl overflow-hidden relative">
                      <img alt="" fetchPriority="high" src={gallery[2]?.url} className="w-full h-full object-cover" />
                      <div data-edit-id="hero.puremodaTag2" data-edit-name="Tag 2" data-edit-kind="text" data-edit-path="hero.puremodaTag2" className="absolute bottom-4 left-6 text-white font-black text-xl drop-shadow-md">{hero.puremodaTag2 || '#PREDICTIVE'}</div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="h-full min-h-[500px] lg:min-h-0 bg-slate-100 rounded-3xl overflow-hidden relative group">
            <img alt="" fetchPriority="high" src={gallery[0]?.url || hero.profileImage || arunProfile} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            {isVisible('primaryCta') && (
              <a href={hero.primaryCta?.href || '#projects'} data-edit-id="hero.primaryCta" data-edit-name="Hero · Primary button" data-edit-kind="button" data-edit-path="hero.primaryCta.label" className="absolute top-[60%] right-[10%] w-24 h-24 rounded-full border border-white text-white flex items-center justify-center font-semibold text-xs tracking-widest text-center hover:bg-white hover:text-black transition-colors backdrop-blur-sm">
                {hero.primaryCta?.label || 'SHOP NOW'}
              </a>
            )}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center bg-white/20 backdrop-blur-md rounded-full p-2 border border-white/30 text-white">
              <span className="px-6 text-sm font-semibold tracking-wider hidden sm:block">LEARN MORE</span>
              <span className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                <ArrowDownRight size={18} />
              </span>
              <span className="px-6 text-sm font-semibold tracking-wider ml-auto border-l border-white/30 hidden sm:block">CONTACT US</span>
              <span className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">
                <Mail size={16} />
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─── HERO STYLE: KATERIO (Retro Split Grid) ───
  if (heroStyle === 'katerio') {
    return (
      <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="relative min-h-screen bg-[#90939c] text-black p-4 md:p-8 pt-24 md:pt-32 overflow-hidden">
        <div className="w-full max-w-[1400px] mx-auto lg:h-[calc(100vh-8rem)] lg:min-h-[600px] bg-white rounded-[2rem] p-4 flex flex-col lg:flex-row gap-4 shadow-2xl">
          <div className="flex-1 min-h-[400px] lg:min-h-0 bg-slate-200 rounded-3xl overflow-hidden relative group">
            <img alt="" fetchPriority="high" src={gallery[0]?.url || hero.profileImage || arunProfile} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute top-6 left-6 right-6 flex flex-wrap gap-2 z-10">
              <div data-edit-id="hero.katerioBadge1" data-edit-name="Badge 1" data-edit-kind="text" data-edit-path="hero.katerioBadge1" className="bg-white/30 backdrop-blur-md border border-white/50 text-white text-[10px] sm:text-xs px-4 py-1.5 rounded-full uppercase tracking-wider font-semibold">
                {hero.katerioBadge1 || 'New Insights Unveiled!'}
              </div>
              <div data-edit-id="hero.katerioBadge2" data-edit-name="Badge 2" data-edit-kind="text" data-edit-path="hero.katerioBadge2" className="bg-white/30 backdrop-blur-md border border-white/50 text-white text-[10px] sm:text-xs px-4 py-1.5 rounded-full uppercase tracking-wider font-semibold">
                {hero.katerioBadge2 || '2026 Q3 Analysis'}
              </div>
            </div>
            <div className="absolute bottom-8 left-8 z-10">
              <h1 data-edit-id="hero.headline" data-edit-name="Hero · Headline" data-edit-kind="heading" className="font-display font-black text-[clamp(2.5rem,4vw,3.5rem)] text-white leading-tight">
                {(hero.headline || ['Your', 'Data', 'Speaks.']).map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </h1>
            </div>
            {isVisible('primaryCta') && (
               <a href={hero.primaryCta?.href || '#projects'} data-edit-id="hero.primaryCta" data-edit-name="Hero · Primary button" data-edit-kind="button" data-edit-path="hero.primaryCta.label" className="absolute bottom-8 right-8 bg-[#c4e4d4] text-[#1c2e25] px-6 py-3 rounded-full font-bold flex items-center gap-4 hover:bg-white transition-colors z-10">
                 {hero.primaryCta?.label || 'NEXT UP'} <ArrowRight size={16} />
               </a>
            )}
            <div data-edit-id="hero.katerioShop" data-edit-name="Action button" data-edit-kind="text" data-edit-path="hero.katerioShop" className="absolute top-1/2 right-[10%] -translate-y-1/2 w-24 h-24 rounded-full border border-white/40 text-white flex items-center justify-center font-semibold text-xs tracking-widest text-center hover:bg-white hover:text-black transition-colors backdrop-blur-md shadow-lg z-10 cursor-pointer">
              {hero.katerioShop || 'EXPLORE'}
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-4 min-h-[500px] lg:min-h-0">
            <div className="bg-[#b5decb] rounded-3xl p-8 flex-1 flex flex-col justify-between relative overflow-hidden">
              <h2 data-edit-id="hero.katerioHeadline" data-edit-name="Subheadline" data-edit-kind="text" data-edit-path="hero.katerioHeadline" className="font-display font-black text-[clamp(1.5rem,3vw,2.5rem)] text-[#1a2f24] leading-tight uppercase max-w-sm relative z-10">
                {hero.katerioHeadline || 'UNLEASH YOUR BUSINESS POTENTIAL WITH DATA DRIVEN INSIGHTS'}
              </h2>
              <div className="absolute top-12 right-12 text-[#1a2f24] opacity-50 z-0">
                <svg width="120" height="120" viewBox="0 0 100 100" className="animate-[spin_20s_linear_infinite]"><path d="M50 10 C 20 10, 10 40, 10 60 C 10 80, 40 90, 70 80 C 90 70, 90 40, 70 20" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
              </div>
              <div className="flex justify-between items-center gap-2 lg:gap-4 z-10 mt-12 flex-wrap">
                 <div className="flex-1 min-w-[160px] bg-white/40 backdrop-blur rounded-full px-4 py-2 flex justify-between items-center font-semibold text-xs text-[#1a2f24]">
                   LEARN MORE
                   <span className="bg-[#1a2f24] text-white rounded-full p-1"><ArrowDownRight size={14} /></span>
                 </div>
                 <div className="flex-1 min-w-[160px] bg-[#1a2f24]/10 rounded-full px-4 py-2 flex justify-between items-center font-semibold text-xs text-[#1a2f24]">
                   CONTACT US
                   <span className="bg-white text-[#1a2f24] rounded-full p-1"><Mail size={14} /></span>
                 </div>
              </div>
            </div>
            <div className="h-1/2 flex gap-4">
              <div className="flex-1 bg-[#1c1c1c] rounded-3xl p-8 relative flex flex-col justify-between text-white group cursor-pointer">
                <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition">
                  <ArrowUpRight size={16} />
                </div>
                <div data-edit-id="hero.katerioSub1" data-edit-name="Card Subtitle" data-edit-kind="text" data-edit-path="hero.katerioSub1" className="font-mono text-sm lg:text-lg opacity-80">{hero.katerioSub1 || 'Deep Dive!'}</div>
                <div data-edit-id="hero.katerioSub2" data-edit-name="Card Title" data-edit-kind="text" data-edit-path="hero.katerioSub2" className="font-display font-black text-2xl lg:text-3xl whitespace-pre-wrap">{hero.katerioSub2 || 'Predictive\nModels'}</div>
              </div>
              {gallery.length >= 2 ? (
                <div className="flex-1 bg-slate-200 rounded-3xl overflow-hidden relative group cursor-pointer">
                  <img alt="" fetchPriority="high" src={gallery[1]?.url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white backdrop-blur group-hover:bg-black transition z-10">
                    <ArrowUpRight size={16} />
                  </div>
                  <div data-edit-id="hero.subtitle" data-edit-name="Hero · Subtitle" data-edit-kind="text" data-edit-path="hero.subtitle" className="absolute inset-x-6 top-1/2 -translate-y-1/2 text-white text-[10px] lg:text-xs font-mono opacity-80 leading-relaxed z-10 hidden sm:block">
                    {hero.subtitle?.replace(/<[^>]*>/g, '') || 'Challenging conventional decision-making, putting an end to guesswork and bringing precision.'}
                  </div>
                  <div data-edit-id="hero.katerioTag" data-edit-name="Tag" data-edit-kind="text" data-edit-path="hero.katerioTag" className="absolute bottom-6 left-6 text-white font-black text-sm lg:text-xl tracking-wider z-10">{hero.katerioTag || '#DATA_MINING'}</div>
                </div>
              ) : (
                <div className="flex-1 bg-slate-200 rounded-3xl overflow-hidden relative group hidden sm:block">
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-sm">Upload more photos</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─── HERO STYLE: RETRO PORTFOLIO (Han Nguyen) ───
  if (heroStyle === 'retro-portfolio') {
    return (
      <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="relative min-h-[90vh] flex flex-col justify-start bg-[#3b4936] text-[#f2e9d8] pt-24 overflow-hidden z-0">
        <div className="absolute top-1/4 left-0 w-full overflow-hidden flex flex-col items-center pointer-events-none select-none z-0">
          <div className="font-display font-black text-[clamp(4rem,10vw,12rem)] leading-[0.8] tracking-tighter text-[#f2e9d8]">
            {hero.headline?.join(' ') || 'PORTFOLIO'}
          </div>
          {[...Array(3)].map((_, i) => (
             <div key={i} className="font-display font-black text-[clamp(4rem,10vw,12rem)] leading-[0.8] tracking-tighter" style={{ WebkitTextStroke: '2px #f2e9d8', color: 'transparent', opacity: 1 - (i * 0.2) }}>
               {hero.headline?.join(' ') || 'PORTFOLIO'}
             </div>
          ))}
        </div>
        
        <div className="w-full max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-8 relative z-10 h-full mt-12 pb-24">
           <div className="md:col-span-7 lg:col-span-8 relative">
              <div className="absolute -top-12 -left-8 text-[#ffb000]">
                 <Sparkles size={48} fill="currentColor" />
              </div>
              <div className="absolute bottom-12 right-0 lg:right-12 text-[#ffb000]">
                 <Sparkles size={32} fill="currentColor" />
              </div>
              <div className="w-full max-w-md bg-black/20 rounded-xl overflow-hidden aspect-[3/4] mix-blend-luminosity relative shadow-2xl">
                 <img alt="" fetchPriority="high" src={gallery[0]?.url || hero.profileImage || arunProfile} className="w-full h-full object-cover sepia-[0.3]" />
              </div>
              {isVisible('subtitle') && (
                <p data-edit-id="hero.subtitle" data-edit-name="Hero · Subtitle" data-edit-kind="text" data-edit-path="hero.subtitle" className="text-[#f2e9d8]/80 text-sm max-w-sm leading-relaxed mt-6 font-mono absolute bottom-0 left-0 bg-[#3b4936]/80 backdrop-blur p-4 rounded-xl shadow-lg">
                  {hero.subtitle?.replace(/<[^>]*>/g, '')}
                </p>
              )}
           </div>
           
           <div className="md:col-span-5 lg:col-span-4 flex flex-col justify-center gap-4 mt-24 md:mt-0 items-start md:items-end font-mono text-[#f2e9d8]">
              {credentials.slice(0, 3).map((cred, i) => (
                 <div key={i} className="text-sm md:text-base lg:text-lg tracking-wide bg-black/20 px-4 py-2 rounded backdrop-blur">
                   <span className="opacity-60">{cred.label}:</span> {cred.value}
                 </div>
              ))}
           </div>
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20">
           <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#ffb000] text-[#3b4936] flex items-center justify-center font-bold text-center leading-tight shadow-xl border-4 border-[#3b4936] cursor-pointer hover:scale-110 transition-transform">
             Scroll<br/>down
           </div>
        </div>
      </section>
    );
  }

  // ─── HERO STYLE: VIDEO STREAMING (Side-by-side Video) ───
  if (heroStyle === 'videostreaming') {
    return (
      <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="relative min-h-screen flex flex-col justify-center bg-[#0a0a0a] text-white pt-32 pb-12 overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 max-w-xl">
            {isVisible('badge') && (
              <div data-edit-id="hero.badge" data-edit-name="Hero · Badge" data-edit-kind="text" data-edit-path="hero.badge" className="text-red-500 font-bold uppercase tracking-[0.2em] mb-4 text-xs flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse" />
                {hero.badge}
              </div>
            )}
            <h1 data-edit-id="hero.headline" data-edit-name="Hero · Headline" data-edit-kind="heading" className="font-display font-bold text-[clamp(2.5rem,4vw,3.5rem)] leading-tight mb-6">
              {(hero.headline || []).map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
              {isVisible('headlineAccent') && (
                <span data-edit-id="hero.accent" data-edit-name="Hero · Accent word" data-edit-kind="text" data-edit-path="hero.headlineAccent" className="text-white/40 block">{hero.headlineAccent}</span>
              )}
            </h1>
            {isVisible('subtitle') && (
              <p data-edit-id="hero.subtitle" data-edit-name="Hero · Subtitle" data-edit-kind="text" data-edit-path="hero.subtitle" className="text-white/60 text-lg mb-8 leading-relaxed">
                {hero.subtitle?.replace(/<[^>]*>/g, '')}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4">
              {isVisible('primaryCta') && (
                <a href={hero.primaryCta?.href || '#projects'} data-edit-id="hero.primaryCta" data-edit-name="Hero · Primary button" data-edit-kind="button" data-edit-path="hero.primaryCta.label" className="px-8 py-3.5 bg-white text-black font-semibold rounded-md hover:bg-slate-200 transition-colors">
                  {hero.primaryCta?.label}
                </a>
              )}
              {isVisible('secondaryCta') && (
                <a href={hero.secondaryCta?.href || '#about'} data-edit-id="hero.secondaryCta" data-edit-name="Hero · Secondary button" data-edit-kind="button" data-edit-path="hero.secondaryCta.label" className="px-8 py-3.5 border border-white/20 text-white font-semibold rounded-md hover:bg-white/10 transition-colors">
                  {hero.secondaryCta?.label}
                </a>
              )}
            </div>
          </div>
          <div className="lg:col-span-7 relative group mt-12 lg:mt-0">
            <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-slate-900 border border-white/10 aspect-[4/3] lg:aspect-video">
              <video ref={videoRef} src={hero.videoSrc || '/hero-animation.mp4'} autoPlay muted={isMuted} loop playsInline className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMuted(!isMuted); }}
                  className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:scale-110 hover:bg-red-500 transition-transform duration-300 pointer-events-auto text-white cursor-pointer"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                   {isMuted ? <VolumeX size={32} /> : <Volume2 size={32} />}
                </button>
              </div>
              {(isVisible('videoCaption') || isVisible('videoSubCaption')) && (
                 <div className="absolute bottom-6 left-6 flex flex-col">
                   {isVisible('videoCaption') && <span className="text-white font-bold text-xl drop-shadow-md">{hero.videoCaption}</span>}
                   {isVisible('videoSubCaption') && <span className="text-white/80 text-sm drop-shadow-md">{hero.videoSubCaption}</span>}
                 </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─── DEFAULT EDITORIAL COMPACT HERO (FlowingData-Inspired) ───
  return (
    <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="pt-24 sm:pt-28 pb-12 sm:pb-16 bg-white border-b border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Eyebrow Pill */}
        <div data-edit-id="hero.badge" data-edit-name="Hero · Badge" data-edit-kind="text" data-edit-path="hero.badge" className="inline-flex items-center gap-2 mb-4 sm:mb-6">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
            {hero.badge || 'Data Analyst • Portfolio & Publication'}
          </span>
        </div>

        {/* Editorial Headline */}
        <h1
          data-edit-id="hero.headline"
          data-edit-name="Hero · Headline"
          data-edit-kind="heading"
          data-edit-path="hero.headline"
          className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-[1.1] mb-4 sm:mb-5"
        >
          {Array.isArray(hero.headline) ? hero.headline.join(' ') : (hero.headline || 'I turn data into decisions.')}
        </h1>

        {/* Supporting Narrative */}
        <p
          data-edit-id="hero.subtitle"
          data-edit-name="Hero · Subtitle"
          data-edit-kind="text"
          data-edit-path="hero.subtitle"
          className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl leading-relaxed font-normal mb-8"
        >
          {hero.subtitle?.replace(/<[^>]*>/g, '') || 'Data analysis, business intelligence and visualization projects focused on finding patterns, explaining what matters, and turning analysis into actionable insights.'}
        </p>

        {/* Editorial CTAs */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
          <a
            href={hero.primaryCta?.href || "#projects"}
            data-edit-id="hero.primaryCta"
            data-edit-name="Hero · Primary CTA"
            data-edit-kind="button"
            data-edit-path="hero.primaryCta.label"
            className="px-6 py-3 rounded-full bg-slate-900 hover:bg-blue-600 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            {hero.primaryCta?.label || 'View Projects ↓'}
          </a>
          <a
            href="#analytics"
            data-edit-id="hero.analyticsCta"
            data-edit-name="Hero · Analytics Button"
            data-edit-kind="button"
            className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm border border-slate-200 transition-all active:scale-95 cursor-pointer"
          >
            Read Analytics →
          </a>
          <a
            href="#visualizations"
            data-edit-id="hero.vizCta"
            data-edit-name="Hero · Visualizations Button"
            data-edit-kind="button"
            className="px-6 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200 transition-all cursor-pointer"
          >
            Visualizations
          </a>
        </div>

        {/* Motivational Sticky Note in Hero Section */}
        <div className="my-8" data-edit-id="hero.stickynote" data-edit-name="Hero · Sticky Note" data-edit-kind="container">
          <StickyQuoteNote />
        </div>

        {/* Core Stack Pills */}
        <div data-edit-id="hero.toolstack" data-edit-name="Hero · Tools Stack" data-edit-kind="container" className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[11px]">Primary Tools:</span>
            {['Power BI', 'SQL (PostgreSQL)', 'Python (Pandas)', 'Excel & DAX', 'Statistics'].map((tool, idx) => (
              <span key={tool} data-edit-id={`hero.tool.${idx}`} data-edit-name={`Tool · ${tool}`} data-edit-kind="badge" className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-[11px]">
                {tool}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            {socials.github && <a href={socials.github.replace('shadow-byte-warrior', 'arun-pandian-p')} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors font-medium">GitHub ↗</a>}
            {socials.linkedin && <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors font-medium">LinkedIn ↗</a>}
            <a href="/resume.pdf" download className="hover:text-slate-900 transition-colors font-medium">Resume ↓</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
