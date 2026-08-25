import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import Logo from './Logo';
import { useContent } from '../context/ContentProvider';
import { LetterRoll } from '../theme/Modifiers';

const Navbar = () => {
  const { settings } = useContent();
  const location = useLocation();
  const navbar = settings.navbar || {};
  const brandName = settings.hero?.name || 'Arun Pandian';
  const animationStyle = settings.theme?.layout?.animationStyle || 'default';
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
      const sections = ['hero', 'about', 'skills', 'timeline', 'projects', 'blog', 'contact'];
      const scrollPosition = window.scrollY + 120;
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el && scrollPosition >= el.offsetTop && scrollPosition < el.offsetTop + el.offsetHeight) {
          setActiveSection(section);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isBlogPage]);

  // Desktop navigation links (Home, Blog)
  const desktopNavLinks = [
    { name: 'Home', href: '/#hero' },
    { name: 'Blog', href: '/blog' },
  ];

  // Mobile drawer links (full comprehensive site navigation)
  const mobileNavLinks = navbar.links || [
    { name: 'Home', href: '/#hero' },
    { name: 'Projects', href: '/#projects' },
    { name: 'Blog', href: '/blog' },
    { name: 'Visualizations', href: '/#visualizations' },
    { name: 'About', href: '/#about' },
    { name: 'Skills', href: '/#skills' },
    { name: 'Experience', href: '/#timeline' },
    { name: 'Contact', href: '/#contact' },
  ];

  const ctaLabel = navbar.ctaLabel || 'Resume';
  const ctaHref = navbar.ctaHref || '/resume.pdf';
  
  const navbarStyle = settings.theme?.layout?.navbarStyle || 'minimal';

  // Determine structural classes based on the selected navbarStyle
  let containerClasses = "relative flex items-center justify-between px-4 sm:px-8 py-3.5 bg-white/95 backdrop-blur border-b border-slate-200/90";
  let navWrapperClasses = `fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-xs' : ''}`;

  return (
    <nav data-edit-id="navbar" data-edit-name="Navbar" data-edit-kind="section" className={navWrapperClasses}>
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className={containerClasses}>
          {/* Left Brand */}
          <a href="/#hero" className="flex items-center gap-2.5 group" aria-label={`${brandName} — home`}>
            <Logo size={32} className="transition-transform duration-300 group-hover:scale-105" title={`${brandName} logo`} />
            <div>
              <span
                data-edit-id="nav.brand"
                data-edit-name="Navbar · Brand name"
                data-edit-kind="text"
                data-edit-path="hero.name"
                className="font-display font-extrabold tracking-tight text-sm sm:text-base text-ink block leading-none"
              >
                {brandName}
              </span>
              <span
                data-edit-id="nav.role"
                data-edit-name="Navbar · Role"
                data-edit-kind="text"
                data-edit-path="hero.role"
                className="text-[10px] sm:text-[11px] font-mono text-ink-soft block mt-0.5"
              >
                {settings.hero?.role || 'Data Analyst · BI · SQL · Python'}
              </span>
            </div>
          </a>

          {/* Center Nav: Home & Blog (Centered horizontally in Navbar) */}
          <div className="hidden md:flex items-center justify-center gap-2 absolute left-1/2 -translate-x-1/2">
            {desktopNavLinks.map((link, idx) => {
              const targetSection = link.href.split('#')[1] || 'hero';
              const isActive = link.href === '/blog' ? isBlogPage : (!isBlogPage && activeSection === targetSection);
              return (
                <a
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all rounded-full ${
                    isActive
                      ? 'text-blue-600 bg-blue-50/90 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </div>

          {/* Right Action: Resume Button & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <a
              href={ctaHref}
              download
              className="hidden md:inline-flex px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-full bg-slate-900 text-white hover:bg-blue-600 transition-colors shadow-2xs cursor-pointer items-center gap-1.5"
            >
              <span>{ctaLabel}</span>
              <span className="text-[10px] opacity-70">↓</span>
            </a>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-ink p-2 rounded-xl active:bg-muted/80 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Scroll progress bar */}
      <motion.div style={{ scaleX: progress }} className="origin-left h-0.5 bg-accent mt-1 mx-auto max-w-7xl" />

      {/* Mobile Drawer Dropdown (Full Menu on Mobile) */}
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
                    <a
                      key={link.name}
                      href={link.href}
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
                    </a>
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
