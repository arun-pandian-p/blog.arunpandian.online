import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import Logo from './Logo';
import { useContent } from '../context/ContentProvider';
import { LetterRoll } from '../theme/Modifiers';

const Navbar = () => {
  const { settings } = useContent();
  const navbar = settings.navbar || {};
  const brandName = settings.hero?.name || 'Arun Pandian';
  const animationStyle = settings.theme?.layout?.animationStyle || 'default';
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
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
  }, []);

  const navLinks = navbar.links || [
    { name: 'About', href: '/#about' },
    { name: 'Skills', href: '/#skills' },
    { name: 'Experience', href: '/#timeline' },
    { name: 'Work', href: '/#projects' },
    { name: 'Writing', href: '/#blog' },
    { name: 'Contact', href: '/#contact' },
  ];
  const ctaLabel = navbar.ctaLabel || 'Résumé';
  const ctaHref = navbar.ctaHref || '/resume.pdf';
  
  const navbarStyle = settings.theme?.layout?.navbarStyle || 'default';

  // Determine structural classes based on the selected navbarStyle
  let containerClasses = "";
  let navWrapperClasses = `fixed z-50 transition-all duration-500`;

  if (navbarStyle === 'capsule') {
    containerClasses = "flex items-center justify-between rounded-full bg-surface shadow-xl border border-line px-3 py-1.5 sm:px-4 sm:py-2 max-w-4xl mx-auto mt-2 sm:mt-4";
    navWrapperClasses += ` top-0 inset-x-0`;
  } else if (navbarStyle === 'minimal') {
    containerClasses = "flex items-center justify-between px-1 py-3 sm:py-4 bg-transparent";
    navWrapperClasses += ` top-0 inset-x-0 ${scrolled ? 'py-2 sm:py-3' : 'py-3 sm:py-5'}`;
  } else if (navbarStyle === 'karolbinkowski') {
    // Brutalist Split
    containerClasses = "flex items-center justify-between bg-bg border-b-[3px] border-ink px-4 py-3 sm:py-4";
    navWrapperClasses += ` top-0 inset-x-0`;
  } else if (navbarStyle === 'pelizzari') {
    // Elegant Transparent
    containerClasses = `flex items-center justify-between px-4 sm:px-6 transition-all duration-500 ${scrolled ? 'py-3 sm:py-4 bg-surface/90 backdrop-blur border-b border-line' : 'py-4 sm:py-8 bg-transparent'}`;
    navWrapperClasses += ` top-0 inset-x-0`;
  } else if (navbarStyle === 'vividmotion') {
    // Glassy Minimal
    containerClasses = `flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 rounded-[2rem] mx-2 sm:mx-4 mt-2 sm:mt-4 transition-all duration-500 ${scrolled ? 'bg-surface/70 backdrop-blur-xl shadow-lg border border-line/50' : 'bg-surface/30 backdrop-blur-md border border-white/10'}`;
    navWrapperClasses += ` top-0 inset-x-0`;
  } else if (navbarStyle === 'studiomodular') {
    // Side Nav Left on desktop, Top bar on mobile
    containerClasses = "flex md:flex-col items-center md:items-start justify-between h-auto md:h-full bg-surface border-b md:border-b-0 md:border-r border-line px-4 py-3 md:p-8 w-full md:w-64";
    navWrapperClasses += ` top-0 inset-x-0 md:inset-x-auto md:left-0 md:inset-y-0 md:w-64`;
  } else {
    // Default
    containerClasses = `flex items-center justify-between rounded-2xl transition-all duration-500 ${scrolled ? 'bg-surface/90 backdrop-blur-xl border border-line shadow-[0_8px_30px_-12px_rgba(9,9,11,0.15)] px-4 sm:px-5 py-2 sm:py-2.5' : 'bg-transparent px-1'}`;
    navWrapperClasses += ` top-0 inset-x-0 ${scrolled ? 'py-2 sm:py-3' : 'py-3 sm:py-5'}`;
  }

  const isVertical = navbarStyle === 'studiomodular';

  return (
    <nav data-edit-id="navbar" data-edit-name="Navbar" data-edit-kind="section" className={navWrapperClasses}>
      <div className={isVertical ? "h-full w-full" : "w-full px-3.5 sm:px-8"}>
        <div className={containerClasses}>
          <a href="#hero" className={`flex items-center gap-2.5 group ${navbarStyle === 'capsule' ? 'bg-ink text-bg px-3 py-1.5 rounded-full' : ''}`} aria-label={`${brandName} — home`}>
            <Logo size={22} className={navbarStyle === 'capsule' ? 'text-bg transition-transform duration-300 group-hover:-translate-y-0.5' : 'text-ink transition-transform duration-300 group-hover:-translate-y-0.5'} title={`${brandName} logo`} />
            <span data-edit-id="nav.brand" data-edit-name="Navbar · Brand name" data-edit-kind="text" data-edit-path="hero.name" className={`font-display font-bold tracking-tight text-sm sm:text-base ${navbarStyle === 'capsule' ? 'text-bg text-xs sm:text-sm pr-1' : 'text-ink'}`}>{brandName}</span>
          </a>

          <div className={`hidden md:flex ${isVertical ? 'flex-col items-start gap-4 w-full' : 'items-center gap-1'}`}>
            {navLinks.map((link, idx) => {
              const isActive = activeSection === link.href.substring(1);
              let linkClasses = `relative px-3.5 py-2 text-sm font-medium transition-colors ${isActive ? 'text-ink' : 'text-ink-soft hover:text-ink'} `;
              if (navbarStyle === 'karolbinkowski') linkClasses += "uppercase font-bold tracking-widest text-xs border-r-[3px] border-transparent hover:border-accent";
              else if (navbarStyle === 'pelizzari') linkClasses += "font-serif text-base tracking-wide";
              else linkClasses += "rounded-full";

              return (
                <a
                  key={link.name}
                  href={link.href}
                  data-edit-id={`navbar.links.${idx}`}
                  data-edit-name={`Navbar · Link ${idx + 1}`}
                  data-edit-kind="link"
                  data-edit-path={`navbar.links.${idx}.name`}
                  className={linkClasses}
                >
                  {animationStyle === 'k95' ? (
                    <LetterRoll text={link.name} />
                  ) : (
                    link.name
                  )}
                  {isActive && !['karolbinkowski', 'pelizzari'].includes(navbarStyle) && (
                    <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-muted" transition={{ type: 'spring', stiffness: 350, damping: 30 }} />
                  )}
                </a>
              );
            })}
            <a href={ctaHref} download data-edit-id="nav.cta" data-edit-name="Navbar · CTA button" data-edit-kind="button" data-edit-path="navbar.ctaLabel" className={`${isVertical ? 'mt-8 w-full text-center' : 'ml-2'} px-4 py-2 font-semibold transition-all text-sm ${
              navbarStyle === 'karolbinkowski' ? 'bg-accent text-ink border-[3px] border-ink uppercase tracking-widest hover:-translate-y-1 hover:shadow-[4px_4px_0px_var(--color-ink)]' :
              navbarStyle === 'pelizzari' ? 'bg-transparent text-ink border border-ink rounded-none hover:bg-ink hover:text-bg font-serif' :
              navbarStyle === 'minimal' ? 'bg-transparent text-ink border border-ink rounded-full hover:bg-ink hover:text-bg' : 
              'bg-ink text-bg rounded-full hover:bg-accent hover:text-ink'}`}>
              {ctaLabel}
            </a>
          </div>

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

      {/* Scroll progress bar */}
      <motion.div style={{ scaleX: progress }} className="origin-left h-0.5 bg-accent mt-1 mx-auto max-w-7xl" />

      {/* Mobile Drawer Dropdown */}
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
                {navLinks.map((link, idx) => {
                  const isActive = activeSection === link.href.substring(1);
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
                          ? 'text-accent bg-accent/10'
                          : 'text-ink-soft hover:text-ink active:bg-muted'
                      }`}
                    >
                      <span>{link.name}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                    </a>
                  );
                })}
              </div>
              <div className="pt-2 mt-2 border-t border-line">
                <a
                  href={ctaHref}
                  download
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-xl bg-ink text-bg font-semibold text-sm active:bg-accent active:text-ink transition-colors"
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
