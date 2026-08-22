import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';
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
    containerClasses = "flex items-center justify-between rounded-full bg-surface shadow-xl border border-line px-2 py-2 max-w-4xl mx-auto mt-4";
    navWrapperClasses += ` top-0 inset-x-0`;
  } else if (navbarStyle === 'minimal') {
    containerClasses = "flex items-center justify-between px-1 py-4 bg-transparent";
    navWrapperClasses += ` top-0 inset-x-0 ${scrolled ? 'py-3' : 'py-5'}`;
  } else if (navbarStyle === 'karolbinkowski') {
    // Brutalist Split
    containerClasses = "flex items-center justify-between bg-bg border-b-[3px] border-ink px-4 py-4";
    navWrapperClasses += ` top-0 inset-x-0`;
  } else if (navbarStyle === 'pelizzari') {
    // Elegant Transparent
    containerClasses = `flex items-center justify-between px-6 transition-all duration-500 ${scrolled ? 'py-4 bg-surface/90 backdrop-blur border-b border-line' : 'py-8 bg-transparent'}`;
    navWrapperClasses += ` top-0 inset-x-0`;
  } else if (navbarStyle === 'vividmotion') {
    // Glassy Minimal
    containerClasses = `flex items-center justify-between px-6 py-3 rounded-[2rem] mx-4 mt-4 transition-all duration-500 ${scrolled ? 'bg-surface/70 backdrop-blur-xl shadow-lg border border-line/50' : 'bg-surface/30 backdrop-blur-md border border-white/10'}`;
    navWrapperClasses += ` top-0 inset-x-0`;
  } else if (navbarStyle === 'studiomodular') {
    // Side Nav Left
    containerClasses = "flex flex-col items-start justify-between h-full bg-surface border-r border-line p-8 w-64";
    navWrapperClasses += ` left-0 inset-y-0 w-64`;
  } else {
    // Default
    containerClasses = `flex items-center justify-between rounded-2xl transition-all duration-500 ${scrolled ? 'bg-surface/80 backdrop-blur-xl border border-line shadow-[0_8px_30px_-12px_rgba(9,9,11,0.15)] px-5 py-2.5' : 'bg-transparent px-1'}`;
    navWrapperClasses += ` top-0 inset-x-0 ${scrolled ? 'py-3' : 'py-5'}`;
  }

  const isVertical = navbarStyle === 'studiomodular';

  return (
    <nav data-edit-id="navbar" data-edit-name="Navbar" data-edit-kind="section" className={navWrapperClasses}>
      <div className={isVertical ? "h-full" : "w-full px-5 sm:px-8"}>
        <div className={containerClasses}>
          <a href="#hero" className={`flex items-center gap-2.5 group ${navbarStyle === 'capsule' ? 'bg-ink text-bg px-3 py-2 rounded-full' : ''}`} aria-label={`${brandName} — home`}>
            <Logo size={24} className={navbarStyle === 'capsule' ? 'text-bg transition-transform duration-300 group-hover:-translate-y-0.5' : 'text-ink transition-transform duration-300 group-hover:-translate-y-0.5'} title={`${brandName} logo`} />
            <span data-edit-id="nav.brand" data-edit-name="Navbar · Brand name" data-edit-kind="text" data-edit-path="hero.name" className={`font-display font-bold tracking-tight ${navbarStyle === 'capsule' ? 'text-bg text-sm pr-1' : 'text-ink'}`}>{brandName}</span>
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

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-ink p-1" aria-label="Toggle menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Scroll progress bar */}
      <motion.div style={{ scaleX: progress }} className="origin-left h-0.5 bg-accent mt-2 mx-auto max-w-7xl" />

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="md:hidden mx-5 mt-2 rounded-2xl bg-surface/95 backdrop-blur-xl border border-line shadow-xl p-3"
        >
          {navLinks.map((link, idx) => (
            <a key={link.name} href={link.href} onClick={() => setIsOpen(false)}
              data-edit-id={`navbar.links.mobile.${idx}`}
              data-edit-name={`Navbar · Link ${idx + 1} (Mobile)`}
              data-edit-kind="link"
              data-edit-path={`navbar.links.${idx}.name`}
              className="block px-4 py-2.5 rounded-xl text-ink-soft hover:text-ink hover:bg-muted font-medium">
              {link.name}
            </a>
          ))}
          <a href={ctaHref} download className="block mt-1 text-center px-4 py-2.5 rounded-xl bg-ink text-bg font-semibold">
            {ctaLabel}
          </a>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
