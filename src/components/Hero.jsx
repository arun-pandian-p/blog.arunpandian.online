import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowUpRight, ArrowDownRight, ArrowRight, Compass, ShieldAlert, Sparkles, Volume2, VolumeX } from 'lucide-react';
import MagneticButton from './MagneticButton';
import Parallax from './Parallax';
import arunProfile from '../assets/arun-profile.jpg';
import { useContent } from '../context/ContentProvider';
import { WordRotator } from '../theme/Modifiers';

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
  const animationStyle = settings.theme?.layout?.animationStyle || 'default';

  const story = hero.story || [];
  const credentials = hero.credentials || [];
  const ticker = hero.ticker || [];
  const socials = hero.socials || {};
  const hiddenFields = hero.hiddenFields || [];
  const gallery = hero.gallery || [];
  const isVisible = (field) => !hiddenFields.includes(field);

  const heroStyle = settings.theme?.layout?.heroStyle || 'default';

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
      <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="relative min-h-screen flex flex-col pt-32 pb-12 bg-surface text-ink border-b border-ink">
        <div className="w-full h-full flex flex-col md:flex-row border-t border-ink border-b border-ink mx-6 max-w-[calc(100%-3rem)]">
          <div className="w-full md:w-2/3 p-8 border-r border-ink flex flex-col justify-center bg-bg">
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
  if (animationStyle === 'joyrush') {
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
  if (animationStyle === 'k95') {
    return (
      <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="relative min-h-screen flex flex-col justify-between pt-36 pb-12 bg-[#FAFAFA] text-[#111111] font-mono">
        {/* Hairline structural grids */}
        <div className="absolute inset-0 grid grid-cols-4 pointer-events-none -z-10">
          <div className="border-r border-line h-full" />
          <div className="border-r border-line h-full" />
          <div className="border-r border-line h-full" />
          <div className="h-full" />
        </div>

        <div className="w-full max-w-7xl mx-auto px-5 flex flex-col justify-center flex-1">
          <div className="grid lg:grid-cols-4 gap-6 items-start">
            <div className="lg:col-span-1 text-xs space-y-4">
              <div>[01] INDEX</div>
              <div className="text-black/50">BRAND & DIGITAL DIGITAL EXPERT PORTFOLIO</div>
              {isVisible('badge') && (
                <div data-edit-id="hero.badge" data-edit-name="Hero · Badge" data-edit-kind="text" data-edit-path="hero.badge" className="underline">{hero.badge}</div>
              )}
            </div>

            <div className="lg:col-span-3">
              <h1 data-edit-id="hero.headline" data-edit-name="Hero · Headline" data-edit-kind="heading" className="font-display font-bold text-4xl sm:text-7xl uppercase tracking-tighter leading-none">
                {(hero.headline || []).map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
                {isVisible('headlineAccent') && (
                  <span data-edit-id="hero.accent" data-edit-name="Hero · Accent word" data-edit-kind="text" data-edit-path="hero.headlineAccent" className="block text-accent italic">{hero.headlineAccent}</span>
                )}
              </h1>

              {isVisible('subtitle') && (
                <p data-edit-id="hero.subtitle" data-edit-name="Hero · Subtitle" data-edit-kind="text" data-edit-path="hero.subtitle" className="mt-8 max-w-lg text-sm text-[#111111]/70 leading-relaxed uppercase">
                  {hero.subtitle?.replace(/<[^>]*>/g, '')}
                </p>
              )}

              <div className="mt-8 flex gap-4">
                {isVisible('primaryCta') && (
                  <a
                    href={hero.primaryCta?.href || '#projects'}
                    data-edit-id="hero.primaryCta" data-edit-name="Hero · Primary button" data-edit-kind="button" data-edit-path="hero.primaryCta.label"
                    className="custom-element-button px-6 py-2.5 border border-black uppercase text-xs tracking-widest hover:bg-black hover:text-white transition-transform"
                  >
                    {hero.primaryCta?.label}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-5 flex justify-between items-end text-[10px] border-t border-line pt-6">
          <span>ARUN PANDIAN PORTFOLIO Selected Works</span>
          <span>© 2026 EDITION</span>
        </div>
      </section>
    );
  }

  // ─── LAYOUT C: JULIEN CALOT ART ───
  if (animationStyle === 'juliencalot') {
    return (
      <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-36 pb-12 bg-[#F4F1EC] text-[#1A1A1A]">
        <div className="w-full max-w-7xl mx-auto px-5 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            {isVisible('badge') && (
              <span data-edit-id="hero.badge" data-edit-name="Hero · Badge" data-edit-kind="text" data-edit-path="hero.badge" className="text-xs uppercase tracking-[0.2em] text-[#FF2A54] font-bold">
                {hero.badge}
              </span>
            )}
            <h1 data-edit-id="hero.headline" data-edit-name="Hero · Headline" data-edit-kind="heading" className="mt-6 font-display font-extrabold text-5xl sm:text-8xl italic tracking-tight leading-none">
              {(hero.headline || []).map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
              {isVisible('headlineAccent') && (
                <span data-edit-id="hero.accent" data-edit-name="Hero · Accent word" data-edit-kind="text" data-edit-path="hero.headlineAccent" className="block text-[#FF2A54] not-italic font-black mt-2">{hero.headlineAccent}</span>
              )}
            </h1>

            {isVisible('subtitle') && (
              <p data-edit-id="hero.subtitle" data-edit-name="Hero · Subtitle" data-edit-kind="text" data-edit-path="hero.subtitle" className="mt-6 max-w-md text-base text-black/60 leading-relaxed font-mono">
                {hero.subtitle?.replace(/<[^>]*>/g, '')}
              </p>
            )}

            <div className="mt-8">
              {isVisible('primaryCta') && (
                <a
                  href={hero.primaryCta?.href || '#projects'}
                  data-edit-id="hero.primaryCta" data-edit-name="Hero · Primary button" data-edit-kind="button" data-edit-path="hero.primaryCta.label"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1A1A1A] text-white hover:bg-[#FF2A54] transition-transform text-sm font-bold"
                >
                  {hero.primaryCta?.label} <ArrowRight size={16} />
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-72 h-96 rounded-2xl overflow-hidden border border-black/10 shadow-2xl">
              <img fetchPriority="high"
                data-edit-id="hero.profileImage" data-edit-name="Hero · Profile image" data-edit-kind="image" data-edit-path="hero.profileImage"
                src={hero.profileImage || arunProfile}
                alt={hero.name || 'Arun Pandian'}
                className="w-full h-full object-cover filter saturate-125"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─── LAYOUT D: DEPOLUXE (Brutalist Cinematic) ───
  if (animationStyle === 'depoluxe') {
    return (
      <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="relative min-h-screen flex flex-col justify-center items-center bg-[#0B0B0B] text-[#E8E4DC] px-5 py-24 text-center">
        {/* Fullscreen muted video background layer */}
        <div className="absolute inset-0 opacity-20 -z-10">
          <video
            ref={videoRef}
            src={hero.videoSrc || '/hero-animation.mp4'}
            autoPlay muted={isMuted} loop playsInline
            className="w-full h-full object-cover pointer-events-none"
          />
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMuted(!isMuted); }}
            className="absolute bottom-6 right-6 p-3 rounded-full bg-white/10 backdrop-blur text-white hover:bg-white/20 transition-colors pointer-events-auto z-50 flex items-center justify-center cursor-pointer shadow-lg"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>

        <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
          {isVisible('badge') && (
            <span data-edit-id="hero.badge" data-edit-name="Hero · Badge" data-edit-kind="text" data-edit-path="hero.badge" className="text-xs uppercase tracking-[0.3em] text-[#E8E4DC]/60 font-semibold mb-6">
              {hero.badge}
            </span>
          )}

          <h1 data-edit-id="hero.headline" data-edit-name="Hero · Headline" data-edit-kind="heading" className="font-display font-extrabold text-3xl sm:text-6xl uppercase tracking-[0.1em] leading-tight">
            {(hero.headline || []).map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
            {isVisible('headlineAccent') && (
              <span data-edit-id="hero.accent" data-edit-name="Hero · Accent word" data-edit-kind="text" data-edit-path="hero.headlineAccent" className="block text-white italic tracking-widest mt-2">{hero.headlineAccent}</span>
            )}
          </h1>

          {isVisible('subtitle') && (
            <p data-edit-id="hero.subtitle" data-edit-name="Hero · Subtitle" data-edit-kind="text" data-edit-path="hero.subtitle" className="mt-8 max-w-xl text-sm text-[#E8E4DC]/70 uppercase tracking-widest leading-loose">
              {hero.subtitle?.replace(/<[^>]*>/g, '')}
            </p>
          )}

          <div className="mt-10">
            {isVisible('primaryCta') && (
              <a
                href={hero.primaryCta?.href || '#projects'}
                data-edit-id="hero.primaryCta" data-edit-name="Hero · Primary button" data-edit-kind="button" data-edit-path="hero.primaryCta.label"
                className="custom-element-button px-10 py-4 border border-[#E8E4DC] text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#E8E4DC] hover:text-[#0B0B0B] transition-transform"
              >
                {hero.primaryCta?.label}
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ─── LAYOUT E: RADIAN (Neon Hazard Sports) ───
  if (animationStyle === 'radian') {
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
          <div className="relative flex justify-center items-center h-full min-h-[500px]">
             <div className="absolute w-[400px] h-[400px] rounded-full border border-white/10 flex items-center justify-center">
               <div className="w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-[#4c84ff] to-[#ff4c84] flex items-center justify-center overflow-hidden p-1 shadow-2xl">
                 <img fetchPriority="high" src={gallery[0]?.url || hero.profileImage || arunProfile} alt="Profile" className="w-full h-full object-cover rounded-full bg-[#151722]" />
               </div>
             </div>
             <div className="absolute top-[20%] right-[15%] w-16 h-16 rounded-full overflow-hidden border-2 border-[#151722] shadow-lg animate-[bounce_3s_ease-in-out_infinite]" style={{ opacity: gallery.length === 1 ? 0 : 1 }}>
                <img fetchPriority="high" src={gallery[1]?.url || gallery[0]?.url || arunProfile} alt="Float" className="w-full h-full object-cover" />
             </div>
             <div className="absolute bottom-[25%] left-[10%] w-14 h-14 rounded-full overflow-hidden border-2 border-[#151722] shadow-lg animate-[bounce_4s_ease-in-out_infinite]" style={{ opacity: (gallery.length === 1 || gallery.length === 2) ? 0 : 1 }}>
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
      <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="relative min-h-screen flex flex-col justify-center bg-[#f7f5f2] text-[#2c2b29] pt-32 pb-12 overflow-hidden">
        <div className="absolute left-[35%] top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none opacity-[0.03] -z-10">
          <span className="font-serif text-[40rem] leading-none">&amp;</span>
        </div>
        <div className="w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center z-10">
          <div className="max-w-lg">
            <h1 data-edit-id="hero.headline" data-edit-name="Hero · Headline" data-edit-kind="heading" className="font-serif italic font-light text-5xl sm:text-7xl leading-[1.1] mb-8">
              {(hero.headline || []).map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
              {isVisible('headlineAccent') && (
                <span data-edit-id="hero.accent" data-edit-name="Hero · Accent word" data-edit-kind="text" data-edit-path="hero.headlineAccent" className="not-italic font-bold tracking-tight block">{hero.headlineAccent}</span>
              )}
            </h1>
            {isVisible('subtitle') && (
              <p data-edit-id="hero.subtitle" data-edit-name="Hero · Subtitle" data-edit-kind="text" data-edit-path="hero.subtitle" className="text-lg opacity-80 mb-10 leading-relaxed font-sans">
                {hero.subtitle?.replace(/<[^>]*>/g, '')}
              </p>
            )}
            {isVisible('primaryCta') && (
              <a href={hero.primaryCta?.href || '#projects'} data-edit-id="hero.primaryCta" data-edit-name="Hero · Primary button" data-edit-kind="button" data-edit-path="hero.primaryCta.label" className="inline-block border-b-2 border-[#2c2b29] pb-1 uppercase tracking-widest text-sm font-bold hover:opacity-60 transition-opacity">
                {hero.primaryCta?.label}
              </a>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 h-[600px]">
            <div className="flex flex-col gap-4 h-full">
              {gallery.length <= 1 ? (
                <div className="bg-[#e4e2de] rounded-sm overflow-hidden flex-1 relative">
                  <img fetchPriority="high" src={gallery[0]?.url || hero.profileImage || arunProfile} alt="Grid 1" className="w-full h-full object-cover filter grayscale" />
                </div>
              ) : (
                <>
                  <div className="bg-[#e4e2de] rounded-sm overflow-hidden flex-1 relative">
                    <img fetchPriority="high" src={gallery[0]?.url || hero.profileImage || arunProfile} alt="Grid 1" className="w-full h-full object-cover filter grayscale" />
                  </div>
                  {gallery.length >= 3 && (
                    <div className="bg-[#e4e2de] rounded-sm overflow-hidden h-1/3 relative">
                      <img fetchPriority="high" src={gallery[1]?.url || arunProfile} alt="Grid 2" className="w-full h-full object-cover" />
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex flex-col gap-4 h-full pt-12">
              <div className={`bg-[#2c2b29] rounded-sm overflow-hidden relative group ${(gallery.length === 2 || gallery.length >= 3) ? 'h-1/2' : 'h-full flex-1'}`}>
                <video ref={videoRef} src={hero.videoSrc || '/hero-animation.mp4'} autoPlay muted={isMuted} loop playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMuted(!isMuted); }}
                  className="absolute inset-0 w-full h-full flex items-center justify-center transition-opacity bg-black/10 hover:bg-black/20 cursor-pointer"
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/40 text-white">
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </div>
                </button>
              </div>
              {(gallery.length === 2 || gallery.length >= 3 || !gallery.length) && (
                <div className="bg-[#e4e2de] rounded-sm overflow-hidden flex-1 relative">
                  <img fetchPriority="high" src={gallery.length === 2 ? gallery[1]?.url : (gallery[2]?.url || gallery[0]?.url || arunProfile)} alt="Grid 3" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─── HERO STYLE: LOGOIPSUM (Rounded Collage) ───
  if (heroStyle === 'logoipsum') {
    return (
      <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="relative min-h-screen flex flex-col justify-center bg-white text-slate-900 pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-full md:w-[45%] bg-[#fce044] -z-10 rounded-l-[100px] hidden md:block" />
        <div className="w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-xl">
            <h1 data-edit-id="hero.headline" data-edit-name="Hero · Headline" data-edit-kind="heading" className="font-display font-extrabold text-[clamp(2.5rem,4vw,3.5rem)] leading-[1.1] mb-6">
              {(hero.headline || []).map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
              {isVisible('headlineAccent') && (
                <span data-edit-id="hero.accent" data-edit-name="Hero · Accent word" data-edit-kind="text" data-edit-path="hero.headlineAccent" className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-[#fce044] block mt-2">{hero.headlineAccent}</span>
              )}
            </h1>
            {isVisible('subtitle') && (
              <p data-edit-id="hero.subtitle" data-edit-name="Hero · Subtitle" data-edit-kind="text" data-edit-path="hero.subtitle" className="text-slate-500 text-lg mb-8 leading-relaxed">
                {hero.subtitle?.replace(/<[^>]*>/g, '')}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-6">
              {isVisible('primaryCta') && (
                <a href={hero.primaryCta?.href || '#projects'} data-edit-id="hero.primaryCta" data-edit-name="Hero · Primary button" data-edit-kind="button" data-edit-path="hero.primaryCta.label" className="px-8 py-4 bg-slate-900 text-white rounded-[2rem] font-semibold hover:bg-slate-800 transition-colors shadow-lg">
                  {hero.primaryCta?.label}
                </a>
              )}
              {isVisible('secondaryCta') && (
                <a href={hero.secondaryCta?.href || '#about'} data-edit-id="hero.secondaryCta" data-edit-name="Hero · Secondary button" data-edit-kind="button" data-edit-path="hero.secondaryCta.label" className="flex items-center gap-3 font-semibold text-slate-800 hover:text-slate-600 transition-colors">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-100 shrink-0">
                    <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-slate-900 border-b-[5px] border-b-transparent ml-1" />
                  </div>
                  {hero.secondaryCta?.label || 'Watch Video'}
                </a>
              )}
            </div>
          </div>
          <div className="flex gap-6 h-[500px] justify-center lg:justify-end">
            {gallery.length === 1 ? (
              <div className="w-64 sm:w-80 h-full">
                <img fetchPriority="high" src={gallery[0]?.url || hero.profileImage || arunProfile} alt="Collage 1" className="w-full h-full object-cover rounded-[3rem] shadow-lg" />
              </div>
            ) : gallery.length === 2 ? (
              <>
                <div className="w-48 sm:w-56 h-full pt-12">
                  <img fetchPriority="high" src={gallery[0]?.url} alt="Collage 1" className="w-full h-[80%] object-cover rounded-full shadow-lg" />
                </div>
                <div className="w-48 sm:w-56 h-full pb-12">
                  <img fetchPriority="high" src={gallery[1]?.url} alt="Collage 2" className="w-full h-[80%] object-cover rounded-[3rem] shadow-lg" />
                </div>
              </>
            ) : gallery.length === 3 ? (
              <>
                <div className="flex flex-col gap-6 pt-12 w-40 sm:w-48">
                  <img fetchPriority="high" src={gallery[0]?.url} alt="Collage 1" className="w-full h-[50%] object-cover rounded-full shadow-lg" />
                  <img fetchPriority="high" src={gallery[1]?.url} alt="Collage 2" className="w-full h-[50%] object-cover rounded-[3rem] shadow-lg" />
                </div>
                <div className="w-48 sm:w-56 h-full">
                  <img fetchPriority="high" src={gallery[2]?.url} alt="Collage 3" className="w-full h-[90%] object-cover rounded-[3rem] shadow-lg mt-6" />
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-6 pt-12 w-40 sm:w-48">
                  <img fetchPriority="high" src={gallery[0]?.url || hero.profileImage || arunProfile} alt="Collage 1" className="w-full h-[60%] object-cover rounded-full shadow-lg" />
                  <img fetchPriority="high" src={gallery[1]?.url || arunProfile} alt="Collage 2" className="w-full h-[40%] object-cover rounded-[3rem] shadow-lg" />
                </div>
                <div className="flex flex-col gap-6 w-48 sm:w-56">
                  <img fetchPriority="high" src={gallery[2]?.url || gallery[0]?.url || arunProfile} alt="Collage 3" className="w-full h-[45%] object-cover rounded-[3rem] shadow-lg" />
                  <img fetchPriority="high" src={gallery[3]?.url || gallery[0]?.url || arunProfile} alt="Collage 4" className="w-full h-[55%] object-cover rounded-full shadow-lg" />
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

  // ─── DEFAULT PORTFOLIO HERO ───
  return (
    <section id="hero" data-edit-id="hero.section" data-edit-name="Hero" data-edit-kind="section" className="relative min-h-dvh flex flex-col justify-center overflow-hidden pt-36 sm:pt-40 pb-12">
      <div
        className="absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(120% 90% at 85% 10%, color-mix(in srgb, var(--color-accent) 10%, transparent) 0%, transparent 55%)' }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 [background-image:linear-gradient(to_right,var(--color-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-line)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(120%_100%_at_50%_0%,black_35%,transparent_80%)]"
      />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        <div className="lg:col-span-7">
          {isVisible('badge') && (
            <motion.div custom={0} variants={rise} initial="hidden" animate="show">
              <div data-edit-id="hero.badge" data-edit-name="Hero · Badge" data-edit-kind="text" data-edit-path="hero.badge" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-line bg-surface/70 backdrop-blur text-xs sm:text-sm font-medium text-ink-soft">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {hero.badge}
              </div>
            </motion.div>
          )}

          <h1 data-edit-id="hero.headline" data-edit-name="Hero · Headline" data-edit-kind="heading" className="mt-6 font-display font-extrabold text-ink leading-[0.92] tracking-tight text-[clamp(2.75rem,7vw,5.5rem)]">
            {(hero.headline || []).map((line, i) => (
              <motion.span key={i} custom={i + 1} variants={rise} initial="hidden" animate="show" className="block">{line}</motion.span>
            ))}
            {isVisible('headlineAccent') && (
              <motion.span custom={(hero.headline || []).length + 1} variants={rise} initial="hidden" animate="show" className="block">
                {animationStyle === 'monolog' ? (
                  <span className="inline-flex items-center">
                    <span data-edit-id="hero.accent" data-edit-name="Hero · Accent word" data-edit-kind="text" data-edit-path="hero.headlineAccent" className="italic font-medium text-accent mr-2">{hero.headlineAccent}</span>
                    <WordRotator words={['with SQL', 'with Python', 'with Power BI', 'with n8n']} />
                  </span>
                ) : (
                  <span data-edit-id="hero.accent" data-edit-name="Hero · Accent word" data-edit-kind="text" data-edit-path="hero.headlineAccent" className="italic font-medium text-accent">{hero.headlineAccent}</span>
                )}
              </motion.span>
            )}
          </h1>

          {isVisible('subtitle') && (
            <motion.p
              data-edit-id="hero.subtitle" data-edit-name="Hero · Subtitle" data-edit-kind="text" data-edit-path="hero.subtitle"
              custom={4} variants={rise} initial="hidden" animate="show"
              className="mt-6 max-w-lg text-base sm:text-lg text-ink-soft leading-relaxed"
              dangerouslySetInnerHTML={{ __html: hero.subtitle }}
            />
          )}

          {isVisible('story') && story.length > 0 && (
            <motion.div custom={5} variants={rise} initial="hidden" animate="show" className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-3">
              {story.map((s, i) => (
                <React.Fragment key={s.k}>
                  <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 backdrop-blur pl-2 pr-3.5 py-1.5">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-bg text-[11px] font-mono font-bold">{s.k}</span>
                    <span className="text-xs sm:text-sm font-medium text-ink-soft">{s.label}</span>
                  </div>
                  {i < story.length - 1 && <ArrowRight size={16} className="text-ink-soft/40 shrink-0" aria-hidden />}
                </React.Fragment>
              ))}
            </motion.div>
          )}

          <motion.div custom={6} variants={rise} initial="hidden" animate="show" className="mt-9 flex flex-wrap items-center gap-4">
            {isVisible('primaryCta') && (
              <MagneticButton
                href={hero.primaryCta?.href || '#projects'}
                data-edit-id="hero.primaryCta" data-edit-name="Hero · Primary button" data-edit-kind="button" data-edit-path="hero.primaryCta.label"
                className="group gap-2 rounded-full bg-ink text-bg px-8 py-4 text-base font-semibold shadow-[0_10px_30px_-10px_rgba(9,9,11,0.5)] hover:bg-accent hover:text-ink transition-colors duration-300"
              >
                {hero.primaryCta?.label || 'View selected work'}
                <ArrowDownRight size={19} className="group-hover:translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              </MagneticButton>
            )}
            {isVisible('secondaryCta') && (
              <MagneticButton
                href={hero.secondaryCta?.href || '/resume.pdf'} download strength={0.25}
                data-edit-id="hero.secondaryCta" data-edit-name="Hero · Secondary button" data-edit-kind="button" data-edit-path="hero.secondaryCta.label"
                className="gap-2 rounded-full border border-ink/15 bg-surface/70 backdrop-blur px-8 py-4 text-base font-semibold text-ink hover:border-ink/40 transition-colors duration-300"
              >
                {hero.secondaryCta?.label || 'Download résumé'}
                <ArrowUpRight size={17} />
              </MagneticButton>
            )}
          </motion.div>

          <motion.div custom={7} variants={rise} initial="hidden" animate="show" className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
            {isVisible('credentials') && credentials.length > 0 && (
              <>
                <div className="flex items-center gap-6 sm:gap-8">
                  {credentials.map((c) => (
                    <div key={c.label}>
                      <div className="font-display font-extrabold text-2xl sm:text-3xl text-ink tabular-nums leading-none">{c.value}</div>
                      <div className="mt-1 text-[11px] sm:text-xs text-ink-soft">{c.label}</div>
                    </div>
                  ))}
                </div>
                <div className="hidden sm:block h-10 w-px bg-line" />
              </>
            )}
            <div className="flex items-center gap-5 text-ink-soft">
              {socials.github && <a href={socials.github} target="_blank" rel="noopener noreferrer" className="hover:text-ink transition-colors"><GithubIcon /></a>}
              {socials.linkedin && <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors"><LinkedinIcon /></a>}
              {socials.email && <a href={`mailto:${socials.email}`} className="hover:text-danger transition-colors"><Mail size={20} /></a>}
            </div>
          </motion.div>
        </div>

        <Parallax speed={60} className="lg:col-span-5">
          <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1, ease, delay: 0.25 }}>
            <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="relative mx-auto max-w-md">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-accent/25 via-indigo-300/20 to-transparent blur-3xl" />
              <div className="relative rounded-[1.75rem] border border-line bg-surface p-2 shadow-[0_40px_90px_-30px_rgba(9,9,11,0.4)] group">
                <video
                  ref={videoRef}
                  data-edit-id="hero.videoSrc" data-edit-name="Hero · Video" data-edit-kind="image" data-edit-path="hero.videoSrc"
                  className="w-full rounded-[1.35rem] aspect-square object-cover bg-ink"
                  src={hero.videoSrc || '/hero-animation.mp4'}
                  autoPlay muted={isMuted} loop playsInline preload="auto"
                />
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMuted(!isMuted); }}
                  className="absolute top-6 right-6 p-2 rounded-full bg-surface/80 backdrop-blur text-ink shadow-md transition-opacity z-50 flex items-center justify-center border border-line cursor-pointer"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                {(isVisible('videoCaption') || isVisible('videoSubCaption')) && (
                  <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-xl bg-surface/85 backdrop-blur px-4 py-2.5 border border-line">
                    {isVisible('videoCaption') && <span data-edit-id="hero.videoCaption" data-edit-name="Hero · Video caption" data-edit-kind="text" data-edit-path="hero.videoCaption" className="font-display font-semibold text-ink text-sm">{hero.videoCaption || 'Data · in motion'}</span>}
                    {isVisible('videoSubCaption') && <span data-edit-id="hero.videoSubCaption" data-edit-name="Hero · Video subcaption" data-edit-kind="text" data-edit-path="hero.videoSubCaption" className="text-xs text-ink-soft font-mono">{hero.videoSubCaption || 'SQL · Python · BI'}</span>}
                  </div>
                )}
              </div>
              
              {(isVisible('name') || isVisible('role')) && (
                <div className="absolute -top-5 -left-5 sm:-left-8 flex items-center gap-3 rounded-2xl bg-surface/90 backdrop-blur border border-line shadow-[0_20px_45px_-20px_rgba(9,9,11,0.5)] pl-2 pr-4 py-2">
                  <div className="relative shrink-0">
                    <div className="absolute -inset-[3px] rounded-full" style={{ background: 'conic-gradient(from 0deg, var(--color-primary), #6366F1, #a5b4fc, var(--color-primary))' }} />
                    <img fetchPriority="high"
                      data-edit-id="hero.profileImage" data-edit-name="Hero · Profile image" data-edit-kind="image" data-edit-path="hero.profileImage"
                      src={hero.profileImage || arunProfile}
                      alt={hero.name || 'Arun Pandian'}
                      className="relative h-14 w-14 rounded-full object-cover border-2 border-surface"
                      style={{ objectPosition: '50% 22%' }}
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-surface" />
                  </div>
                  <div className="leading-tight">
                    {isVisible('name') && <p data-edit-id="hero.profileName" data-edit-name="Hero · Profile name" data-edit-kind="text" data-edit-path="hero.name" className="font-display font-bold text-ink text-sm">{hero.name || 'Arun Pandian'}</p>}
                    {isVisible('role') && <p data-edit-id="hero.profileRole" data-edit-name="Hero · Profile role" data-edit-kind="text" data-edit-path="hero.role" className="text-[11px] text-ink-soft font-mono">{hero.role || 'Data Analyst'}</p>}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </Parallax>
      </div>

      {isVisible('ticker') && ticker.length > 0 && settings.theme?.layout?.scrollStyle !== 'none' && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.7 }}
          className="relative z-10 mt-14 border-y border-line bg-surface/50 backdrop-blur py-3.5 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
        >
          <div className={settings.theme?.layout?.scrollStyle === 'vertical' ? "flex flex-col h-20 animate-marquee-vertical" : "flex w-max animate-marquee"}>
            {[...ticker, ...ticker].map((t, i) => (
              <span key={i} className={`mx-6 inline-flex items-center gap-6 text-sm font-mono uppercase tracking-wider text-ink-soft ${settings.theme?.layout?.scrollStyle === 'vertical' ? 'py-1' : ''}`}>
                {t}
                <span className="h-1 w-1 rounded-full bg-accent/60" />
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default Hero;
