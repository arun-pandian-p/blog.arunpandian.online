import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import Logo from './Logo';
import { useContent } from '../context/ContentProvider';
import { useThemeStore } from '../theme/store';
import { isBlogSubdomain, getBlogDomainUrl } from '../utils/domain';

/* ─────────────────────────────────────────────────────────────────────────────
   Shared helpers
───────────────────────────────────────────────────────────────────────────── */

/** Responsive navbar container:
 *  - Mobile  (<sm): flex items-center justify-between — Logo+Name on left, Hamburger on right
 *  - Desktop (sm+): CSS Grid (1fr auto 1fr) — Logo left, Links centered, CTA right
 */
function NavGrid({ children, px = 'px-3.5 sm:px-7', py = 'py-2 sm:py-2.5', extra = '' }) {
  return (
    <div
      className={`flex items-center justify-between sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-x-4 ${px} ${py} ${extra}`}
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

  const onBlogSubdomain = isBlogSubdomain();
  const isBlogPage   = onBlogSubdomain || location.pathname.startsWith('/blog');
  const navbarStyle  = theme?.layout?.navbarStyle || settings.theme?.layout?.navbarStyle || 'default';

  const blogDomain = getBlogDomainUrl();
  const brandHref  = '/#hero';

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
    { name: 'Home', href: '/#hero', isExternal: false },
    { name: 'About', href: '/#about', isExternal: false },
    { name: 'Projects', href: '/#projects', isExternal: false },
    { name: 'Experience', href: '/#experience', isExternal: false },
    { name: 'Skills', href: '/#skills', isExternal: false },
    { name: 'Blog', href: blogDomain, isExternal: true },
    { name: 'Contact', href: '/#contact', isExternal: false },
  ];

  const isLinkActive = (href, isExternal) => {
    if (isExternal) return false;
    if (location.pathname.startsWith('/project') && href.includes('#projects')) return true;
    if (location.pathname !== '/' && !location.pathname.startsWith('/project')) return false;
    const targetSection = href.split('#')[1] || 'hero';
    return activeSection === targetSection;
  };

  /* ── CSS-var–driven color tokens so every theme preset works ── */
  const surfaceBg = {
    backgroundColor : 'color-mix(in srgb, var(--color-surface) 94%, transparent)',
    borderColor     : 'var(--color-border)',
    color           : 'var(--color-text)',
  };
  const solidBg = {
    backgroundColor : 'color-mix(in srgb, var(--color-surface) 97%, transparent)',
    borderColor     : 'var(--color-border)',
    color           : 'var(--color-text)',
  };
  const activeLink  = { color: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' };
  const idleLink    = { color: 'var(--color-muted)'   };
  const ctaBtn      = { background: 'var(--color-text)', color: 'var(--color-background)' };

  /* ── Shared desktop link list ── (hidden on mobile header, shown only on sm+) */
  const DesktopLinks = () => (
    <div data-edit-id="navbar.links" data-edit-name="Navbar Links" data-edit-kind="container" className="hidden sm:flex items-center justify-center gap-1">
      {navLinks.map(({ name, href, isExternal }, idx) => (
        isExternal ? (
          <a
            key={name}
            href={href}
            data-edit-id={`navbar.link.${idx}`}
            data-edit-name={`Nav Link · ${name}`}
            data-edit-kind="link"
            data-edit-path={`navbar.links.${idx}.name`}
            className="px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 whitespace-nowrap"
            style={isLinkActive(href, isExternal) ? activeLink : idleLink}
          >
            {name}
          </a>
        ) : (
          <Link
            key={name}
            to={href}
            data-edit-id={`navbar.link.${idx}`}
            data-edit-name={`Nav Link · ${name}`}
            data-edit-kind="link"
            data-edit-path={`navbar.links.${idx}.name`}
            className="px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 whitespace-nowrap"
            style={isLinkActive(href, isExternal) ? activeLink : idleLink}
          >
            {name}
          </Link>
        )
      ))}
    </div>
  );

  /* ── Shared CTA button ── (hidden on mobile header, shown only on sm+) */
  const CtaButton = ({ className = '' }) => (
    <a
      href={ctaHref}
      download
      data-edit-id="navbar.cta"
      data-edit-name="Navbar · CTA Button"
      data-edit-kind="button"
      data-edit-path="navbar.ctaLabel"
      className={`hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full transition-colors whitespace-nowrap min-h-[34px] ${className}`}
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
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit   ={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[calc(100%+8px)] left-2 right-2 sm:left-4 sm:right-4 z-50 rounded-2xl border backdrop-blur-2xl shadow-2xl p-3"
            style={bg}
          >
            <div className="space-y-1 mb-2">
              {navLinks.map(({ name, href, isExternal }) => (
                isExternal ? (
                  <a
                    key={name}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between min-h-[46px] px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                    style={isLinkActive(href, isExternal) ? activeLink : idleLink}
                  >
                    <span>{name}</span>
                    {isLinkActive(href, isExternal) && (
                      <span className="h-2 w-2 rounded-full" style={{ background: 'var(--color-primary)' }} />
                    )}
                  </a>
                ) : (
                  <Link
                    key={name}
                    to={href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between min-h-[46px] px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                    style={isLinkActive(href, isExternal) ? activeLink : idleLink}
                  >
                    <span>{name}</span>
                    {isLinkActive(href, isExternal) && (
                      <span className="h-2 w-2 rounded-full" style={{ background: 'var(--color-primary)' }} />
                    )}
                  </Link>
                )
              ))}
            </div>
            <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <a
                href={ctaHref}
                download
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center min-h-[46px] px-4 rounded-xl font-bold text-sm"
                style={ctaBtn}
              >
                {ctaLabel} ↓
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  /* ── Hamburger toggle (minimum 44x44px touch target) ── */
  const HamburgerBtn = ({ color = 'var(--color-text)' }) => (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="sm:hidden flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 rounded-full transition-colors cursor-pointer"
      style={{ color }}
      aria-label="Toggle navigation menu"
      aria-expanded={isOpen}
    >
      {isOpen ? <X size={20} /> : <Menu size={20} />}
    </button>
  );

  /* ── Scroll progress bar ── */
  const ProgressBar = ({ color = 'var(--color-primary)' }) => (
    <motion.div
      style={{ scaleX: progress, background: color }}
      className="absolute bottom-0 left-0 right-0 h-[2px] origin-left pointer-events-none"
    />
  );

  /* ══════════════════════════════════════════════════════════════════════════
     CAPSULE
     Floating pill centered in viewport, full width up to 880 px.
  ══════════════════════════════════════════════════════════════════════════ */
  if (navbarStyle === 'capsule') {
    return (
      <nav data-edit-id="navbar.section" data-edit-name="Navbar Section" data-edit-kind="navbar" className="fixed top-2.5 sm:top-4 inset-x-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none">
        <div
          data-edit-id="navbar.container"
          data-edit-name="Navbar Capsule"
          data-edit-kind="container"
          className={`pointer-events-auto relative w-full max-w-[880px] rounded-full border backdrop-blur-xl transition-shadow duration-300 ${scrolled ? 'shadow-xl' : 'shadow-sm sm:shadow-md'}`}
          style={surfaceBg}
        >
          <NavGrid>
            {/* Col 1 — Brand (left-aligned) */}
            <a href={brandHref} data-edit-id="navbar.brand" data-edit-name="Navbar Brand" data-edit-kind="link" className="flex items-center gap-2 sm:gap-2.5 group min-w-0" aria-label={`${brandName} home`}>
              <Logo size={28} className="shrink-0 transition-transform duration-300 group-hover:scale-105" />
              <div className="min-w-0">
                <span data-edit-id="navbar.name" data-edit-name="Navbar · Name" data-edit-kind="text" data-edit-path="hero.name" className="block text-xs sm:text-sm font-extrabold tracking-tight leading-tight truncate" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
                  {brandName}
                </span>
                <span data-edit-id="navbar.role" data-edit-name="Navbar · Role" data-edit-kind="text" data-edit-path="hero.role" className="block text-[9px] sm:text-[10px] font-mono mt-0.5 truncate" style={{ color: 'var(--color-muted)' }}>
                  {role}
                </span>
              </div>
            </a>

            {/* Col 2 — Links (centered on desktop, hidden on mobile header) */}
            <DesktopLinks />

            {/* Col 3 — CTA (right-aligned on desktop, hamburger on mobile) */}
            <div className="flex items-center justify-end gap-2 shrink-0">
              <CtaButton />
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
          <NavGrid px="px-4 sm:px-10" py="py-2.5 sm:py-4">
            <a href={brandHref} className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
              <Logo size={28} className="shrink-0 transition-transform duration-300 group-hover:scale-105" />
              <div className="min-w-0">
                <span className="block text-xs sm:text-sm font-extrabold tracking-tight leading-tight truncate" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>{brandName}</span>
                <span className="block text-[9px] sm:text-[10px] font-mono mt-0.5 truncate" style={{ color: 'var(--color-muted)' }}>{role}</span>
              </div>
            </a>
            <DesktopLinks />
            <div className="flex items-center justify-end gap-2 shrink-0">
              <CtaButton />
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
    return (
      <nav className="fixed top-0 inset-x-0 z-50 border-b-2 flex justify-center" style={darkBg}>
        <div className="relative w-full max-w-7xl">
          <NavGrid px="px-4 sm:px-10" py="py-2.5 sm:py-3.5">
            <a href={brandHref} className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <Logo size={28} className="invert shrink-0" />
              <div className="min-w-0">
                <span className="block text-xs sm:text-sm font-extrabold tracking-tight leading-tight text-white truncate">{brandName}</span>
                <span className="block text-[9px] sm:text-[10px] font-mono mt-0.5 text-slate-400 truncate">{role}</span>
              </div>
            </a>
            <DesktopLinks />
            <div className="flex items-center justify-end gap-2 shrink-0">
              <a href={ctaHref} download className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-white text-black hover:bg-slate-100 transition-colors whitespace-nowrap">{ctaLabel} ↓</a>
              <HamburgerBtn color="#ffffff" />
            </div>
          </NavGrid>
          <ProgressBar color="#ffffff" />
          <MobileDrawer bg={darkBg} />
        </div>
      </nav>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     PELIZZARI  (cinematic dark overlay)
  ══════════════════════════════════════════════════════════════════════════ */
  if (navbarStyle === 'pelizzari') {
    return (
      <nav className="fixed top-0 inset-x-0 z-50 flex justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
        <div className="relative w-full max-w-7xl">
          <NavGrid px="px-4 sm:px-10" py="py-2.5 sm:py-4">
            <a href={brandHref} className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <Logo size={28} className="invert shrink-0" />
              <div className="min-w-0">
                <span className="block text-xs sm:text-sm font-extrabold tracking-tight leading-tight text-white truncate">{brandName}</span>
                <span className="block text-[9px] sm:text-[10px] font-mono mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{role}</span>
              </div>
            </a>
            <DesktopLinks />
            <div className="flex items-center justify-end gap-2 shrink-0">
              <a href={ctaHref} download className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full border border-white text-white hover:bg-white hover:text-black transition-colors whitespace-nowrap">{ctaLabel} ↓</a>
              <HamburgerBtn color="#ffffff" />
            </div>
          </NavGrid>
          <ProgressBar color="rgba(255,255,255,0.7)" />
          <MobileDrawer bg={{ backgroundColor: 'rgba(15,15,15,0.95)', color: '#fff', borderColor: 'rgba(255,255,255,0.15)' }} />
        </div>
      </nav>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     VIVIDMOTION  (glass card floating)
  ══════════════════════════════════════════════════════════════════════════ */
  if (navbarStyle === 'vividmotion') {
    return (
      <nav className="fixed top-2.5 sm:top-3 inset-x-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none">
        <div
          className={`pointer-events-auto relative w-full max-w-[800px] rounded-2xl border backdrop-blur-2xl transition-shadow duration-300 ${scrolled ? 'shadow-xl' : 'shadow-md'}`}
          style={surfaceBg}
        >
          <NavGrid px="px-3.5 sm:px-7" py="py-2 sm:py-3">
            <a href={brandHref} className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
              <Logo size={28} className="shrink-0 transition-transform duration-300 group-hover:scale-105" />
              <div className="min-w-0">
                <span className="block text-xs sm:text-sm font-extrabold tracking-tight leading-tight truncate" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>{brandName}</span>
                <span className="block text-[9px] sm:text-[10px] font-mono mt-0.5 truncate" style={{ color: 'var(--color-muted)' }}>{role}</span>
              </div>
            </a>
            <DesktopLinks />
            <div className="flex items-center justify-end gap-2 shrink-0">
              <CtaButton />
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
     DEFAULT  (standard full-width navbar)
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 flex justify-center border-b transition-all duration-300 ${scrolled ? 'shadow-xs' : ''}`}
      style={solidBg}
    >
      <div className="relative w-full max-w-7xl">
        <NavGrid px="px-4 sm:px-8" py="py-2.5 sm:py-3.5">
          {/* Col 1 — Brand */}
          <a href={brandHref} className="flex items-center gap-2 sm:gap-2.5 group shrink-0 min-w-0" aria-label={`${brandName} home`}>
            <Logo size={28} className="shrink-0 transition-transform duration-300 group-hover:scale-105 sm:w-[30px] sm:h-[30px]" />
            <div className="min-w-0">
              <span
                className="block text-xs sm:text-sm font-extrabold tracking-tight leading-tight truncate"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
              >
                {brandName}
              </span>
              <span className="block text-[9px] sm:text-[10px] font-mono mt-0.5 truncate" style={{ color: 'var(--color-muted)' }}>
                {role}
              </span>
            </div>
          </a>

          {/* Col 2 — Nav links (centered on desktop, hidden on mobile header) */}
          <DesktopLinks />

          {/* Col 3 — CTA + mobile toggle */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            <CtaButton />
            <HamburgerBtn />
          </div>
        </NavGrid>

        <ProgressBar />
        <MobileDrawer bg={solidBg} />
      </div>
    </nav>
  );
};

export default Navbar;
