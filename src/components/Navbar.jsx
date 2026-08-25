import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import Logo from './Logo';
import { useContent } from '../context/ContentProvider';
import { useThemeStore } from '../theme/store';
import { LetterRoll } from '../theme/Modifiers';

const Navbar = () => {
  const { settings } = useContent();
  const { theme } = useThemeStore();
  const location = useLocation();
  const navbar = settings.navbar || {};
  const brandName = settings.hero?.name || 'Arun Pandian';
  const animationStyle = theme?.layout?.animationStyle || settings.theme?.layout?.animationStyle || 'default';
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  const isBlogPage = location.pathname.startsWith('/blog');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      if (isBlogPage) return;
      const sections = ['hero', 'about', 'projects', 'experience', 'skills', 'faq', 'contact'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isBlogPage]);

  // Desktop Navbar links (only Home & Blog)
  const desktopNavLinks = [
    { name: 'Home', href: '/#hero' },
    { name: 'Blog', href: '/blog' },
  ];

  // Mobile drawer links (only Home & Blog)
  const mobileNavLinks = [
    { name: 'Home', href: '/#hero' },
    { name: 'Blog', href: '/blog' },
  ];

  const ctaLabel = navbar.ctaLabel || 'Resume';
  const ctaHref = navbar.ctaHref || '/resume.pdf';
  
  const navbarStyle = theme?.layout?.navbarStyle || settings.theme?.layout?.navbarStyle || 'default';

  // ── Structural classes based on selected navbarStyle ──
  // Use CSS variables for colors so theme presets instantly update the navbar.
  let navWrapperClasses = 'fixed top-0 inset-x-0 z-50 transition-all duration-300 w-full flex justify-center';
  let containerClasses = 'relative flex items-center justify-between px-4 sm:px-8 py-3.5 backdrop-blur border-b w-full';
  let innerWrapper = 'max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8';
  let isDarkTheme = false;
  // These inline styles will read the CSS vars set by ThemeProvider
  let navBgStyle = { backgroundColor: 'color-mix(in srgb, var(--color-surface) 95%, transparent)', borderColor: 'var(--color-border)', color: 'var(--color-text)' };

  if (navbarStyle === 'capsule') {
    navWrapperClasses = 'fixed top-3 sm:top-5 inset-x-0 z-50 transition-all duration-300 w-full flex justify-center px-3 sm:px-6 pointer-events-none';
    innerWrapper = 'w-full max-w-3xl sm:max-w-4xl mx-auto pointer-events-auto';
    containerClasses = `relative flex items-center justify-between px-4 sm:px-7 py-2.5 rounded-full backdrop-blur-xl border transition-shadow ${
      scrolled ? 'shadow-xl' : 'shadow-md'
    }`;
    navBgStyle = { backgroundColor: 'color-mix(in srgb, var(--color-surface) 95%, transparent)', borderColor: 'var(--color-border)', color: 'var(--color-text)' };
  } else if (navbarStyle === 'minimal') {
    navWrapperClasses = 'fixed top-0 inset-x-0 z-50 transition-all duration-300 w-full flex justify-center';
    innerWrapper = 'max-w-7xl mx-auto w-full px-4 sm:px-8';
    containerClasses = `relative flex items-center justify-between py-3.5 sm:py-4 bg-transparent transition-all w-full ${
      scrolled ? 'backdrop-blur-md border-b shadow-2xs' : ''
    }`;
    navBgStyle = scrolled ? { backgroundColor: 'color-mix(in srgb, var(--color-surface) 90%, transparent)', borderColor: 'var(--color-border)', color: 'var(--color-text)' } : { color: 'var(--color-text)' };
  } else if (navbarStyle === 'karolbinkowski') {
    isDarkTheme = true;
    navWrapperClasses = 'fixed top-0 inset-x-0 z-50 bg-[#111111] text-white border-b-2 border-[#222222] transition-all w-full flex justify-center';
    innerWrapper = 'max-w-7xl mx-auto w-full px-4 sm:px-8';
    containerClasses = 'relative flex items-center justify-between py-3.5 w-full';
    navBgStyle = {};
  } else if (navbarStyle === 'pelizzari') {
    isDarkTheme = true;
    navWrapperClasses = 'fixed top-0 inset-x-0 z-50 bg-black/60 backdrop-blur-xl text-white border-b border-white/10 transition-all w-full flex justify-center';
    innerWrapper = 'max-w-7xl mx-auto w-full px-4 sm:px-8';
    containerClasses = 'relative flex items-center justify-between py-3.5 sm:py-4 w-full';
    navBgStyle = {};
  } else if (navbarStyle === 'vividmotion') {
    navWrapperClasses = 'fixed top-3 sm:top-4 inset-x-0 z-50 transition-all w-full flex justify-center px-3 sm:px-6 pointer-events-none';
    innerWrapper = 'max-w-4xl mx-auto w-full pointer-events-auto';
    containerClasses = `relative flex items-center justify-between px-5 sm:px-7 py-3 rounded-2xl backdrop-blur-2xl border shadow-lg ${
      scrolled ? 'shadow-2xl' : ''
    }`;
    navBgStyle = { backgroundColor: 'color-mix(in srgb, var(--color-surface) 80%, transparent)', borderColor: 'var(--color-border)', color: 'var(--color-text)' };
  } else {
    // default
    navWrapperClasses = `fixed top-0 inset-x-0 z-50 transition-all duration-300 w-full flex justify-center ${scrolled ? 'shadow-xs' : ''}`;
    innerWrapper = 'max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8';
    containerClasses = 'relative flex items-center justify-between px-4 sm:px-8 py-3.5 backdrop-blur border-b w-full';
    navBgStyle = { backgroundColor: 'color-mix(in srgb, var(--color-surface) 95%, transparent)', borderColor: 'var(--color-border)', color: 'var(--color-text)' };
  }

  return (
    <nav data-edit-id="navbar" data-edit-name="Navbar" data-edit-kind="section" className={navWrapperClasses}>
      <div className={innerWrapper}>
        <div className={containerClasses} style={navBgStyle}>
          {/* Left Brand */}
          <a href="/#hero" className="flex items-center gap-2.5 group shrink-0" aria-label={`${brandName} — home`}>
            <Logo size={30} className="transition-transform duration-300 group-hover:scale-105" title={`${brandName} logo`} />
            <div>
              <span
                data-edit-id="nav.brand"
                data-edit-name="Navbar · Brand name"
                data-edit-kind="text"
                data-edit-path="hero.name"
                className={`font-display font-extrabold tracking-tight text-xs sm:text-sm block leading-none ${
                  isDarkTheme ? 'text-white' : 'text-ink'
                }`}
              >
                {brandName}
              </span>
              <span
                data-edit-id="nav.role"
                data-edit-name="Navbar · Role"
                data-edit-kind="text"
                data-edit-path="hero.role"
                className={`text-[9px] sm:text-[10px] font-mono block mt-0.5 ${
                  isDarkTheme ? 'text-slate-400' : 'text-ink-soft'
                }`}
              >
                {settings.hero?.role?.replace(/Specialist/gi, '').trim() || 'Data Analyst'}
              </span>
            </div>
          </a>

          {/* Center Nav: Home & Blog (Centered horizontally in Navbar) */}
          <div className="hidden md:flex items-center justify-center gap-1.5 absolute left-1/2 -translate-x-1/2">
            {desktopNavLinks.map((link) => {
              const targetSection = link.href.split('#')[1] || 'hero';
              const isActive = link.href === '/blog' ? isBlogPage : (!isBlogPage && activeSection === targetSection);
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`px-3.5 py-1.5 text-xs font-semibold transition-all rounded-full ${
                    isDarkTheme
                      ? isActive
                        ? 'text-white bg-white/20 font-bold shadow-2xs'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                      : isActive
                      ? 'text-blue-600 bg-blue-50/90 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Action: Resume Button & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href={ctaHref}
              download
              className={`hidden md:inline-flex px-3.5 py-1.5 text-xs font-semibold rounded-full transition-colors shadow-2xs cursor-pointer items-center gap-1.5 ${
                isDarkTheme
                  ? 'bg-white text-black hover:bg-slate-200'
                  : 'bg-slate-900 text-white hover:bg-blue-600'
              }`}
            >
              <span>{ctaLabel}</span>
              <span className="text-[10px] opacity-70">↓</span>
            </a>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`md:hidden min-w-[36px] min-h-[36px] flex items-center justify-center p-1.5 rounded-xl transition-colors ${
                isDarkTheme ? 'text-white active:bg-white/10' : 'text-ink active:bg-muted/80'
              }`}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Scroll progress bar */}
      <motion.div style={{ scaleX: progress }} className="origin-left h-0.5 bg-accent mt-0.5 mx-auto max-w-7xl w-full" />

      {/* Mobile Drawer Dropdown (Home & Blog on Mobile) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-xs"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="md:hidden relative z-50 mx-3.5 sm:mx-6 mt-2 rounded-2xl bg-surface/98 backdrop-blur-2xl border border-line shadow-2xl p-3"
            >
              <div className="space-y-1">
                {mobileNavLinks.map((link, idx) => {
                  const targetSection = link.href.split('#')[1] || 'hero';
                  const isActive = link.href === '/blog' ? isBlogPage : (!isBlogPage && activeSection === targetSection);
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      data-edit-id={`navbar.links.mobile.${idx}`}
                      data-edit-name={`Navbar · Link ${idx + 1} (Mobile)`}
                      data-edit-kind="link"
                      data-edit-path={`navbar.links.${idx}.name`}
                      className={`flex items-center justify-between min-h-[44px] px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                        isActive
                          ? 'text-blue-600 bg-blue-50/90 font-bold'
                          : 'text-ink-soft hover:text-ink active:bg-muted'
                      }`}
                    >
                      <span>{link.name}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                    </Link>
                  );
                })}
              </div>
              <div className="pt-2 mt-2 border-t border-line">
                <a
                  href={ctaHref}
                  download
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-blue-600 active:bg-blue-700 transition-colors"
                >
                  {ctaLabel}
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
