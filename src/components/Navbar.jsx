import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import Logo from './Logo';
import { useContent } from '../context/ContentProvider';
import { useThemeStore } from '../theme/store';

/* ─────────────────────────────────────────────────────────────────────────────
   Shared helpers
───────────────────────────────────────────────────────────────────────────── */

/** Three-column pill layout — logo left | links center | cta right.
 *  Uses CSS Grid (1fr auto 1fr) so the center column is always exactly
 *  centred relative to the container regardless of how wide each side is. */
function NavGrid({ children, px = 'px-5 sm:px-7', py = 'py-2.5', extra = '' }) {
  return (
    <div
      className={`grid items-center ${px} ${py} ${extra}`}
      style={{ gridTemplateColumns: '1fr auto 1fr' }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────────────────────── */
const Navbar = () => {
  const { settings } = useContent();
  const { theme } = useThemeStore();
  const location = useLocation();

  const navbar    = settings.navbar || {};
  const brandName = settings.hero?.name || 'Arun Pandian';
  const role      = settings.hero?.role?.replace(/Specialist/gi, '').trim() || 'Data Analyst';
  const ctaLabel  = navbar.ctaLabel || 'Resume';
  const ctaHref   = navbar.ctaHref  || '/resume.pdf';

  const [isOpen,        setIsOpen]        = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  const isBlogPage   = location.pathname.startsWith('/blog');
  const navbarStyle  = theme?.layout?.navbarStyle || settings.theme?.layout?.navbarStyle || 'default';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      if (isBlogPage) return;
      const ids = ['hero', 'about', 'projects', 'experience', 'skills', 'faq', 'contact'];
      const y   = window.scrollY + 200;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && y >= el.offsetTop && y < el.offsetTop + el.offsetHeight) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isBlogPage]);

  const navLinks = [
    { name: 'Home', href: '/#hero' },
    { name: 'Blog', href: '/blog'  },
  ];

  const isLinkActive = (href) =>
    href === '/blog' ? isBlogPage : (!isBlogPage && activeSection === (href.split('#')[1] || 'hero'));

  /* ── CSS-var–driven color tokens so every theme preset works ── */
  const surfaceBg = {
    backgroundColor : 'color-mix(in srgb, var(--color-surface) 93%, transparent)',
    borderColor     : 'var(--color-border)',
    color           : 'var(--color-text)',
  };
  const solidBg = {
    backgroundColor : 'color-mix(in srgb, var(--color-surface) 97%, transparent)',
    borderColor     : 'var(--color-border)',
    color           : 'var(--color-text)',
  };
  const activeLink  = { color: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 9%, transparent)' };
  const idleLink    = { color: 'var(--color-muted)'   };
  const ctaBtn      = { background: 'var(--color-text)', color: 'var(--color-background)' };

  /* ── Shared desktop link list ── */
  const DesktopLinks = () => (
    <div className="flex items-center justify-center gap-1">
      {navLinks.map(({ name, href }) => (
        <Link
          key={name}
          to={href}
          className="px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 whitespace-nowrap"
          style={isLinkActive(href) ? activeLink : idleLink}
        >
          {name}
        </Link>
      ))}
    </div>
  );

  /* ── Shared CTA button ── */
  const CtaButton = ({ className = '' }) => (
    <a
      href={ctaHref}
      download
      className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full transition-colors whitespace-nowrap ${className}`}
      style={ctaBtn}
    >
      {ctaLabel}
      <span className="opacity-60 text-[10px]">↓</span>
    </a>
  );

  /* ── Shared mobile drawer ── */
  const MobileDrawer = ({ bg = surfaceBg }) => (
    <AnimatePresence>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit   ={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute top-[calc(100%+8px)] left-4 right-4 z-50 rounded-2xl border backdrop-blur-2xl shadow-2xl p-3"
            style={bg}
          >
            <div className="space-y-1 mb-2">
              {navLinks.map(({ name, href }) => (
                <Link
                  key={name}
                  to={href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between min-h-[44px] px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                  style={isLinkActive(href) ? activeLink : idleLink}
                >
                  <span>{name}</span>
                  {isLinkActive(href) && (
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-primary)' }} />
                  )}
                </Link>
              ))}
            </div>
            <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <a
                href={ctaHref}
                download
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center min-h-[44px] px-4 rounded-xl font-bold text-sm"
                style={ctaBtn}
              >
                {ctaLabel}
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  /* ── Hamburger toggle ── */
  const HamburgerBtn = ({ color = 'var(--color-text)' }) => (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full transition-colors"
      style={{ color }}
      aria-label="Toggle menu"
      aria-expanded={isOpen}
    >
      {isOpen ? <X size={18} /> : <Menu size={18} />}
    </button>
  );

  /* ── Scroll progress bar ── */
  const ProgressBar = ({ color = 'var(--color-primary)' }) => (
    <motion.div
      style={{ scaleX: progress, background: color }}
      className="absolute bottom-0 left-0 right-0 h-[2px] origin-left"
    />
  );

  /* ══════════════════════════════════════════════════════════════════════════
     CAPSULE  (default for most presets)
     Floating pill centered in viewport, full page-width up to 880 px.
  ══════════════════════════════════════════════════════════════════════════ */
  if (navbarStyle === 'capsule') {
    return (
      <nav className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <div
          className={`pointer-events-auto relative w-full max-w-[880px] rounded-full border backdrop-blur-xl transition-shadow duration-300 ${scrolled ? 'shadow-2xl' : 'shadow-md'}`}
          style={surfaceBg}
        >
          {/* ── 3-column grid: logo | links | cta ── */}
          <NavGrid>
            {/* Col 1 — Brand (left-aligned) */}
            <a href="/#hero" className="flex items-center gap-2.5 group" aria-label={`${brandName} home`}>
              <Logo size={28} className="shrink-0 transition-transform duration-300 group-hover:scale-105" />
              <div>
                <span className="block text-[11px] font-extrabold tracking-tight leading-none" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
                  {brandName}
                </span>
                <span className="block text-[9px] font-mono mt-0.5" style={{ color: 'var(--color-muted)' }}>
                  {role}
                </span>
              </div>
            </a>

            {/* Col 2 — Links (centered by the grid) */}
            <DesktopLinks />

            {/* Col 3 — CTA (right-aligned) */}
            <div className="flex items-center justify-end gap-2">
              <div className="hidden sm:block">
                <CtaButton />
              </div>
              <HamburgerBtn />
            </div>
          </NavGrid>

          <ProgressBar />
          <MobileDrawer />
        </div>
      </nav>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     MINIMAL
  ══════════════════════════════════════════════════════════════════════════ */
  if (navbarStyle === 'minimal') {
    return (
      <nav className={`fixed top-0 inset-x-0 z-50 flex justify-center transition-all duration-300 ${scrolled ? 'backdrop-blur-md border-b shadow-sm' : ''}`}
        style={scrolled ? solidBg : { color: 'var(--color-text)' }}
      >
        <div className="relative w-full max-w-7xl">
          <NavGrid px="px-6 sm:px-10" py="py-4">
            {/* Brand */}
            <a href="/#hero" className="flex items-center gap-2.5 group">
              <Logo size={28} className="transition-transform duration-300 group-hover:scale-105" />
              <div>
                <span className="block text-[11px] font-extrabold tracking-tight leading-none" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>{brandName}</span>
                <span className="block text-[9px] font-mono mt-0.5" style={{ color: 'var(--color-muted)' }}>{role}</span>
              </div>
            </a>
            {/* Links */}
            <DesktopLinks />
            {/* CTA */}
            <div className="flex justify-end gap-2">
              <div className="hidden sm:block"><CtaButton /></div>
              <HamburgerBtn />
            </div>
          </NavGrid>
          <ProgressBar />
          <MobileDrawer bg={solidBg} />
        </div>
      </nav>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     KAROL BINKOWSKI  (brutalist dark)
  ══════════════════════════════════════════════════════════════════════════ */
  if (navbarStyle === 'karolbinkowski') {
    const darkBg = { backgroundColor: '#111111', borderColor: '#222222', color: '#ffffff' };
    const darkActive = { color: '#ffffff', background: 'rgba(255,255,255,0.18)' };
    const darkIdle   = { color: 'rgba(255,255,255,0.55)' };
    return (
      <nav className="fixed top-0 inset-x-0 z-50 border-b-2 flex justify-center" style={darkBg}>
        <div className="relative w-full max-w-7xl">
          <NavGrid px="px-6 sm:px-10" py="py-3.5">
            <a href="/#hero" className="flex items-center gap-2.5">
              <Logo size={28} className="invert" />
              <div>
                <span className="block text-[11px] font-extrabold tracking-tight leading-none text-white">{brandName}</span>
                <span className="block text-[9px] font-mono mt-0.5 text-slate-400">{role}</span>
              </div>
            </a>
            <div className="flex items-center justify-center gap-1">
              {navLinks.map(({ name, href }) => (
                <Link key={name} to={href}
                  className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors whitespace-nowrap"
                  style={isLinkActive(href) ? { color: '#fff', background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.4)' } : { color: 'rgba(255,255,255,0.55)', borderColor: 'transparent' }}
                >{name}</Link>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2">
              <a href={ctaHref} download className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-white text-black hover:bg-slate-100 transition-colors whitespace-nowrap">{ctaLabel} ↓</a>
              <button onClick={() => setIsOpen(!isOpen)} className="sm:hidden w-9 h-9 flex items-center justify-center text-white" aria-label="Toggle menu">{isOpen ? <X size={18}/> : <Menu size={18}/>}</button>
            </div>
          </NavGrid>
          <ProgressBar color="#ffffff" />
          <AnimatePresence>
            {isOpen && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="sm:hidden absolute top-full left-0 right-0 border-b-2 p-4" style={darkBg}>
                {navLinks.map(({ name, href }) => (
                  <Link key={name} to={href} onClick={() => setIsOpen(false)} className="block py-3 font-bold text-sm uppercase tracking-wider border-b" style={{ color: '#fff', borderColor: '#333' }}>{name}</Link>
                ))}
                <a href={ctaHref} download onClick={() => setIsOpen(false)} className="block mt-3 py-3 text-center font-bold text-sm bg-white text-black">{ctaLabel}</a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     PELIZZARI  (cinematic dark overlay)
  ══════════════════════════════════════════════════════════════════════════ */
  if (navbarStyle === 'pelizzari') {
    return (
      <nav className="fixed top-0 inset-x-0 z-50 flex justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
        <div className="relative w-full max-w-7xl">
          <NavGrid px="px-6 sm:px-10" py="py-4">
            <a href="/#hero" className="flex items-center gap-2.5">
              <Logo size={28} className="invert" />
              <div>
                <span className="block text-[11px] font-extrabold tracking-tight leading-none text-white">{brandName}</span>
                <span className="block text-[9px] font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{role}</span>
              </div>
            </a>
            <div className="flex items-center justify-center gap-1">
              {navLinks.map(({ name, href }) => (
                <Link key={name} to={href}
                  className="px-4 py-1.5 text-xs font-semibold italic transition-all whitespace-nowrap"
                  style={isLinkActive(href) ? { color: '#fff' } : { color: 'rgba(255,255,255,0.5)' }}
                >{name}</Link>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2">
              <a href={ctaHref} download className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full border border-white text-white hover:bg-white hover:text-black transition-colors whitespace-nowrap">{ctaLabel} ↓</a>
              <button onClick={() => setIsOpen(!isOpen)} className="sm:hidden w-9 h-9 flex items-center justify-center text-white" aria-label="Toggle menu">{isOpen ? <X size={18}/> : <Menu size={18}/>}</button>
            </div>
          </NavGrid>
          <ProgressBar color="rgba(255,255,255,0.7)" />
          <AnimatePresence>
            {isOpen && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="sm:hidden absolute top-full left-0 right-0 p-4"
                style={{ backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {navLinks.map(({ name, href }) => (
                  <Link key={name} to={href} onClick={() => setIsOpen(false)} className="block py-3 font-semibold text-sm" style={{ color: 'rgba(255,255,255,0.75)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{name}</Link>
                ))}
                <a href={ctaHref} download onClick={() => setIsOpen(false)} className="block mt-3 py-3 text-center font-bold text-sm border border-white rounded-full text-white">{ctaLabel}</a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     VIVIDMOTION  (glass card floating)
  ══════════════════════════════════════════════════════════════════════════ */
  if (navbarStyle === 'vividmotion') {
    return (
      <nav className="fixed top-3 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <div
          className={`pointer-events-auto relative w-full max-w-[800px] rounded-2xl border backdrop-blur-2xl transition-shadow duration-300 ${scrolled ? 'shadow-2xl' : 'shadow-lg'}`}
          style={surfaceBg}
        >
          <NavGrid px="px-5 sm:px-7" py="py-3">
            <a href="/#hero" className="flex items-center gap-2.5 group">
              <Logo size={28} className="transition-transform duration-300 group-hover:scale-105" />
              <div>
                <span className="block text-[11px] font-extrabold tracking-tight leading-none" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>{brandName}</span>
                <span className="block text-[9px] font-mono mt-0.5" style={{ color: 'var(--color-muted)' }}>{role}</span>
              </div>
            </a>
            <DesktopLinks />
            <div className="flex items-center justify-end gap-2">
              <div className="hidden sm:block"><CtaButton /></div>
              <HamburgerBtn />
            </div>
          </NavGrid>
          <ProgressBar />
          <MobileDrawer />
        </div>
      </nav>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     DEFAULT  (standard full-width pill / the design in the screenshot)
     This is the one shown in the attached image — off-white pill, centered.
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 flex justify-center border-b transition-all duration-300 ${scrolled ? 'shadow-sm' : ''}`}
      style={solidBg}
    >
      <div className="relative w-full max-w-7xl">
        <NavGrid px="px-4 sm:px-8" py="py-3.5">
          {/* Col 1 — Brand */}
          <a href="/#hero" className="flex items-center gap-2.5 group shrink-0" aria-label={`${brandName} home`}>
            <Logo size={30} className="transition-transform duration-300 group-hover:scale-105" />
            <div>
              <span
                className="block text-[11px] sm:text-[13px] font-extrabold tracking-tight leading-none"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
              >
                {brandName}
              </span>
              <span className="block text-[9px] sm:text-[10px] font-mono mt-0.5" style={{ color: 'var(--color-muted)' }}>
                {role}
              </span>
            </div>
          </a>

          {/* Col 2 — Nav links (grid centers this automatically) */}
          <DesktopLinks />

          {/* Col 3 — CTA + mobile toggle */}
          <div className="flex items-center justify-end gap-2">
            <div className="hidden sm:block">
              <CtaButton />
            </div>
            <HamburgerBtn />
          </div>
        </NavGrid>

        <ProgressBar />

        {/* Mobile drawer */}
        <MobileDrawer bg={solidBg} />
      </div>
    </nav>
  );
};

export default Navbar;
