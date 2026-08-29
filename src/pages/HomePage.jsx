import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Timeline from '../components/Timeline';
import ProjectCard from '../components/ProjectCard';
import BlogCard from '../components/BlogCard';
import ContactForm from '../components/ContactForm';
import Welcome from '../components/Welcome';
import FAQ from '../components/FAQ';
import PortfolioGrid from '../components/PortfolioGrid';
import FeaturedStory from '../components/FeaturedStory';
import VisualizationsGallery from '../components/VisualizationsGallery';
import { Helmet } from 'react-helmet-async';
import Parallax from '../components/Parallax';
import SliceReveal from '../components/SliceReveal';
import Logo from '../components/Logo';
import { ArrowUp, Lock, ArrowRight, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContent } from '../context/ContentProvider';
import { useThemeStore } from '../theme/store';
import CanvasRuntime from '../editor/CanvasRuntime';
import StyleOverrides from '../editor/StyleOverrides';
import { TopMarquee, PreloaderCounter, GrainOverlay, RadianScrollNav, Scanlines, toRoman } from '../theme/Modifiers';
import DoodleGuide from '../components/DoodleGuide';
import NewsletterSubscribe from '../components/NewsletterSubscribe';

export default function HomePage() {
  const { settings, projects, blogs } = useContent();
  const { theme: studioTheme } = useThemeStore();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // When rendered inside the admin live-preview iframe, skip the intro animation
  // so edits are visible immediately.
  const isPreview =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('preview') === '1';

  const theme = studioTheme || settings?.theme;
  const animationStyle = theme?.layout?.animationStyle || settings?.theme?.layout?.animationStyle || 'default';
  const footerStyle = theme?.layout?.footerStyle || settings?.theme?.layout?.footerStyle || 'default';
  const projectsScroll = theme?.layout?.projectsScroll || settings?.theme?.layout?.projectsScroll || 'horizontal';
  const blogScroll = theme?.layout?.blogScroll || settings?.theme?.layout?.blogScroll || 'horizontal';

  const alreadySeenIntro =
    typeof window !== 'undefined' &&
    sessionStorage.getItem('welcome_shown') === 'true';

  const [loadComplete, setLoadComplete] = useState(animationStyle !== 'juliencalot');
  const [intro, setIntro] = useState(!isPreview && !alreadySeenIntro && Boolean(settings?.welcome?.enabled));

  useEffect(() => {
    setLoadComplete(animationStyle !== 'juliencalot');
  }, [animationStyle]);

  // Admin can enable/disable the welcome intro
  const welcomeEnabled = Boolean(settings?.welcome?.enabled);
  useEffect(() => {
    if ((!welcomeEnabled || alreadySeenIntro) && intro) setIntro(false);
  }, [welcomeEnabled, alreadySeenIntro, intro]);

  useEffect(() => {
    if (!intro) {
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    const safety = setTimeout(() => {
      try { sessionStorage.setItem('welcome_shown', 'true'); } catch {}
      setIntro(false);
    }, 2500);
    return () => {
      clearTimeout(safety);
      document.body.style.overflow = '';
    };
  }, [intro]);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };


  // ─── Custom Cursor State ───
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);
  const layout = theme?.layout || settings?.theme?.layout || {};
  const cursorStyle = layout.cursorStyle || 'default';

  useEffect(() => {
    if (cursorStyle === 'default' || cursorStyle === 'none' || isPreview || typeof window === 'undefined') return;
    const updateCursor = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    const onMouseOver = (e) => {
      if (e.target.closest('a, button, [role="button"], [data-edit-id]')) {
        setHovered(true);
      } else {
        setHovered(false);
      }
    };
    window.addEventListener('mousemove', updateCursor);
    window.addEventListener('mouseover', onMouseOver);
    return () => {
      window.removeEventListener('mousemove', updateCursor);
      window.removeEventListener('mouseover', onMouseOver);
    };
  }, [cursorStyle, isPreview]);

  // ── Theme: apply admin-configured tokens as CSS variables (live) ──
  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    const colors = theme.colors || {};
    const typography = theme.typography || {};
    const themeLayout = theme.layout || {};

    // Color tokens
    const vars = {
      '--color-primary': colors.primary || '#2563EB',
      '--color-background': colors.background || '#FAFAFA',
      '--color-surface': colors.surface || '#FFFFFF',
      '--color-text': colors.text || '#09090B',
      '--color-muted': colors.muted || '#71717A',
      '--color-border': colors.border || '#E4E4E7',
      '--color-accent': colors.primary || '#2563EB',
      '--color-ink': colors.text || '#09090B',
      '--color-bg': colors.background || '#FAFAFA',
      '--color-ink-soft': colors.muted || '#71717A',
      '--color-line': colors.border || '#E4E4E7',
      '--radius-base': themeLayout.radius || '1rem',
      '--border-custom': themeLayout.borderStyle || 'none',
    };

    for (const [k, v] of Object.entries(vars)) {
      if (v) root.style.setProperty(k, v);
    }

    // Dynamic Google Fonts Loader — reads from theme.typography (modern shape)
    const loadFont = (fontName, elementId, ...cssVarNames) => {
      if (!fontName) return null;
      const cleanFont = fontName.split(',')[0].replace(/['"]/g, '').trim();
      if (!cleanFont || cleanFont.toLowerCase().startsWith('system')) return null;
      const id = `theme-font-${elementId}`;
      let link = document.getElementById(id);
      const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanFont)}:wght@300;400;500;600;700;800;900&display=swap`;
      if (!link) {
        link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      if (link.href !== href) link.href = href;
      const stack = `'${cleanFont}', system-ui, sans-serif`;
      cssVarNames.forEach((v) => root.style.setProperty(v, stack));
      return stack;
    };

    // Body font (theme.typography.fontFamily)
    loadFont(typography.fontFamily, 'body', '--font-sans', '--font-primary');

    // Heading font (theme.typography.headingFont)
    if (typography.headingFont) {
      loadFont(typography.headingFont, 'heading', '--font-display', '--font-heading');
    } else if (typography.fontFamily) {
      // Fall back to body font for headings
      const cleanBody = typography.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
      const stack = `'${cleanBody}', system-ui, sans-serif`;
      root.style.setProperty('--font-display', stack);
      root.style.setProperty('--font-heading', stack);
    }

    // Typography weight / size tokens
    if (typography.bodyWeight) root.style.setProperty('--font-weight-base', typography.bodyWeight);
    if (typography.headingWeight) root.style.setProperty('--font-weight-heading', typography.headingWeight);
    if (typography.bodySize) root.style.setProperty('--font-size-base', typography.bodySize);
    if (typography.headingSize) root.style.setProperty('--font-size-heading', typography.headingSize);

    return () => {
      Object.keys(vars).forEach((k) => root.style.removeProperty(k));
      root.style.removeProperty('--font-sans');
      root.style.removeProperty('--font-primary');
      root.style.removeProperty('--font-display');
      root.style.removeProperty('--font-heading');
      root.style.removeProperty('--border-custom');
    };
  }, [theme]);

  // ── SEO: document title + meta tags from admin settings (live) ──
  const seo = settings?.seo;
  useEffect(() => {
    if (!seo) return;
    if (seo.metaTitle) document.title = seo.metaTitle;
    const setMeta = (attr, name, content) => {
      if (!content) return;
      let el = document.head.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    setMeta('name', 'description', seo.metaDescription);
    setMeta('name', 'keywords', seo.keywords);
    setMeta('property', 'og:title', seo.metaTitle);
    setMeta('property', 'og:description', seo.metaDescription);
    setMeta('property', 'og:image', seo.ogImage || projects?.[0]?.image_url);
    setMeta('name', 'twitter:site', seo.twitterHandle);
  }, [seo]);

  const rawFooter = settings?.footer || {};
  const footerData = {
    ...rawFooter,
    github: (rawFooter.github || 'https://github.com/arun-pandian-p').replace('shadow-byte-warrior', 'arun-pandian-p'),
  };
  const projectsSection = settings?.sections?.projects || {};
  const blogSection = settings?.sections?.blog || {};

  return (
    <>
      {animationStyle === 'juliencalot' && !loadComplete && !isPreview && (
        <PreloaderCounter onComplete={() => setLoadComplete(true)} />
      )}

      <div className={`grain bg-bg text-ink min-h-screen relative awwwards-preset-${animationStyle}`}>
        {animationStyle === 'joyrush' && <TopMarquee />}
        {animationStyle === 'juliencalot' && !isPreview && <GrainOverlay opacity={0.06} />}
        {animationStyle === 'monolog' && <GrainOverlay opacity={0.03} />}
        {animationStyle === 'radian' && <RadianScrollNav />}
        {animationStyle === 'cyber' && <Scanlines opacity={0.07} />}

        {/* Custom Styles Injector for Awwwards animations */}
        <style dangerouslySetInnerHTML={{ __html: `
          .custom-element { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
          .awwwards-preset-joyrush { text-transform: lowercase; }
          .awwwards-preset-joyrush h1, .awwwards-preset-joyrush h2, .awwwards-preset-joyrush h3, .awwwards-preset-joyrush p, .awwwards-preset-joyrush span, .awwwards-preset-joyrush a { text-transform: lowercase !important; }
          .awwwards-preset-joyrush .custom-element-button { background-color: var(--color-primary); color: #2C0E1E; border: 3px solid #2C0E1E; box-shadow: 4px 4px 0px #2C0E1E; border-radius: 9999px; }
          .awwwards-preset-joyrush .custom-element-button:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0px #2C0E1E; }
          .awwwards-preset-k95 { font-family: var(--font-primary); }
          .awwwards-preset-k95 h1, .awwwards-preset-k95 h2, .awwwards-preset-k95 h3, .awwwards-preset-k95 p, .awwwards-preset-k95 span, .awwwards-preset-k95 a { text-transform: uppercase !important; }
          .awwwards-preset-k95 .custom-element-button { background: transparent; color: var(--color-text); border: 1px solid var(--color-border); border-radius: 0px; text-transform: uppercase; letter-spacing: 0.1em; }
          .awwwards-preset-k95 .custom-element-button:hover { background: var(--color-text); color: var(--color-background); }
          .awwwards-preset-juliencalot { background-image: radial-gradient(circle at 10% 20%, rgba(255, 42, 84, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 40%); }
          .awwwards-preset-depoluxe { text-transform: uppercase; }
          .awwwards-preset-depoluxe .custom-element-button { border: 1px solid var(--color-primary); color: var(--color-primary); background: transparent; border-radius: 0px; font-weight: 800; letter-spacing: 0.2em; }
          .awwwards-preset-depoluxe .custom-element-button:hover { background: var(--color-primary); color: var(--color-background); }
          .awwwards-preset-monolog { letter-spacing: 0.05em; line-height: 1.8; }
          .awwwards-preset-monolog .custom-element-button { border-bottom: 1px solid var(--color-primary); border-radius: 0px; background: transparent; color: var(--color-text); padding: 4px 0px; }
          .awwwards-preset-radian { background-color: #000; color: #fff; }
          .awwwards-preset-radian .custom-element-button { background: var(--color-primary); color: #000; border-radius: 4px; font-weight: 900; }
          .awwwards-preset-radian .custom-element-button:hover { box-shadow: 0 0 15px var(--color-primary); }
        ` }} />

        <StyleOverrides />
        {isPreview && <CanvasRuntime />}


      <AnimatePresence>
        {intro && welcomeEnabled && !isPreview && <Welcome key="welcome" onDone={() => setIntro(false)} />}
      </AnimatePresence>

      <Navbar />

      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Arun Pandian | Data Analyst Portfolio",
            "url": "https://arunpandian.online/"
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Arun Pandian",
            "jobTitle": "Data Analyst",
            "url": "https://arunpandian.online/",
            "image": projects?.map((p) => p.image_url).filter(Boolean) || [],
            "sameAs": [
              settings?.hero?.socials?.github || "https://github.com/arun-pandian-p",
              settings?.hero?.socials?.linkedin || "https://www.linkedin.com/in/arunpandianp-dataanalyst/"
            ].filter(Boolean)
          })}
        </script>
      </Helmet>
      
      <Hero />

      {/* Projects / Portfolio Grid Section */}
      <PortfolioGrid projects={projects} sectionConfig={projectsSection} />

      <About />
      <Skills />
      <Timeline />
      
      <FAQ />

      <ContactForm />

      {/* Footer */}
      {footerStyle === 'karolbinkowski' ? (
        <footer className="bg-bg text-ink border-t-[3px] border-ink mt-8 sm:mt-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
            <div className="w-full md:w-2/3 p-5 sm:p-8 border-b-[3px] md:border-b-0 md:border-r-[3px] border-ink">
              <h3 data-edit-id="footer.name" data-edit-name="Footer · Name" data-edit-kind="heading" data-edit-path="footer.name" className="font-display font-black text-4xl sm:text-7xl lg:text-8xl uppercase tracking-tighter hover:text-accent transition-colors duration-300 break-words w-full" style={{ WebkitTextStroke: '1px var(--color-ink)' }}>
                {footerData.name}
              </h3>
              <p data-edit-id="footer.tagline" data-edit-name="Footer · Tagline" data-edit-kind="text" data-edit-path="footer.tagline" className="mt-4 sm:mt-6 text-xs sm:text-sm font-bold uppercase tracking-widest max-w-sm">{footerData.tagline}</p>
              <div className="mt-8 pt-6 border-t-[2px] border-ink/20">
                <NewsletterSubscribe source="home_footer_karol" />
              </div>
            </div>
            <div className="w-full md:w-1/3 flex flex-col justify-between">
              <div className="p-5 sm:p-8 flex flex-col gap-3 sm:gap-4">
                <a href={footerData.github} target="_blank" rel="noopener noreferrer" className="text-lg sm:text-xl font-bold uppercase border-b-[3px] border-transparent hover:border-accent hover:text-accent transition-all inline-block w-max">GitHub</a>
                <a href={footerData.linkedin} target="_blank" rel="noopener noreferrer" className="text-lg sm:text-xl font-bold uppercase border-b-[3px] border-transparent hover:border-accent hover:text-accent transition-all inline-block w-max">LinkedIn</a>
                <a href={`mailto:${footerData.email}`} className="text-lg sm:text-xl font-bold uppercase border-b-[3px] border-transparent hover:border-accent hover:text-accent transition-all inline-block w-max break-all">Email</a>
              </div>
              <div className="border-t-[3px] border-ink p-5 sm:p-8 bg-surface text-xs font-bold uppercase tracking-widest flex flex-col gap-2">
                <span>&copy; {new Date().getFullYear()} {footerData.name}</span>
                <span>{footerData.copyright}</span>
                <Link to="/admin" className="mt-3 sm:mt-4 inline-flex items-center gap-2 hover:text-accent w-max min-h-[36px]">
                  <Lock size={12} /> ADMIN
                </Link>
              </div>
            </div>
          </div>
        </footer>
      ) : footerStyle === 'pelizzari' ? (
        <footer className="bg-bg text-ink border-t border-line mt-12 sm:mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center text-center">
            <Logo size={40} className="text-ink mb-8 sm:mb-12 opacity-80" title="Logo" />
            <h3 data-edit-id="footer.name" data-edit-name="Footer · Name" data-edit-kind="heading" data-edit-path="footer.name" className="font-serif italic text-3xl sm:text-5xl lg:text-6xl font-light mb-4 sm:mb-6">{footerData.name}</h3>
            <p data-edit-id="footer.tagline" data-edit-name="Footer · Tagline" data-edit-kind="text" data-edit-path="footer.tagline" className="text-ink/60 font-serif text-base sm:text-lg max-w-md">{footerData.tagline}</p>
            <div className="w-full max-w-md mt-8">
              <NewsletterSubscribe source="home_footer_pelizzari" />
            </div>
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 mt-10 sm:mt-16 text-xs sm:text-sm tracking-widest uppercase text-ink/80">
              <a href={footerData.github} className="hover:text-ink transition-colors min-h-[36px] flex items-center">GitHub</a>
              <a href={footerData.linkedin} className="hover:text-ink transition-colors min-h-[36px] flex items-center">LinkedIn</a>
              <a href={`mailto:${footerData.email}`} className="hover:text-ink transition-colors min-h-[36px] flex items-center">Contact</a>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 border-t border-line/50 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-[10px] uppercase tracking-[0.2em] text-ink/40">
            <span>&copy; {new Date().getFullYear()} {footerData.copyright}</span>
            <Link to="/admin" className="hover:text-ink transition-colors flex items-center gap-2 min-h-[36px]">
              <Lock size={10} /> Admin
            </Link>
          </div>
        </footer>
      ) : footerStyle === 'russellnumo' ? (
        <footer className="bg-surface text-ink border-t border-ink mt-12 sm:mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 border-b border-ink">
              <div className="col-span-1 md:col-span-2 p-4 sm:p-6 border-b md:border-b-0 md:border-r border-ink">
                <h3 data-edit-id="footer.name" data-edit-name="Footer · Name" data-edit-kind="heading" data-edit-path="footer.name" className="font-mono text-xl sm:text-2xl font-bold uppercase">{footerData.name}</h3>
                <p data-edit-id="footer.tagline" data-edit-name="Footer · Tagline" data-edit-kind="text" data-edit-path="footer.tagline" className="font-mono text-xs sm:text-sm mt-3 sm:mt-4 text-ink-soft">{footerData.tagline}</p>
                <div className="mt-6 pt-4 border-t border-ink/20">
                  <NewsletterSubscribe source="home_footer_russell" />
                </div>
              </div>
              <div className="col-span-1 p-4 sm:p-6 border-b md:border-b-0 md:border-r border-ink flex flex-col gap-3 sm:gap-4 font-mono text-xs sm:text-sm">
                <span className="font-bold border-b border-ink pb-2 mb-1 sm:mb-2">Socials</span>
                <a href={footerData.github} className="hover:text-accent">GitHub</a>
                <a href={footerData.linkedin} className="hover:text-accent">LinkedIn</a>
              </div>
              <div className="col-span-1 p-4 sm:p-6 flex flex-col justify-between font-mono text-xs">
                <div>
                  <span className="font-bold border-b border-ink pb-2 mb-3 sm:mb-4 block">Status</span>
                  <div className="flex items-center gap-2 text-accent">
                    <span className="w-2 h-2 bg-accent rounded-full animate-pulse" /> Available
                  </div>
                </div>
                <a href={`mailto:${footerData.email}`} className="mt-6 sm:mt-8 bg-ink text-bg text-center py-2.5 hover:bg-accent hover:text-ink transition-colors uppercase font-bold min-h-[44px] flex items-center justify-center">Email Me</a>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 text-xs font-mono text-ink-soft gap-3">
              <span>&copy; {new Date().getFullYear()} — {footerData.copyright}</span>
              <Link to="/admin" className="flex items-center gap-2 hover:text-ink border border-line px-3 py-1.5 min-h-[36px]">
                <Lock size={12} /> Admin
              </Link>
            </div>
          </div>
        </footer>
      ) : footerStyle === 'studiomodular' ? (
        <footer className="bg-ink text-bg mt-8 sm:mt-12 py-12 sm:py-16 px-4 sm:px-8 relative overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12">
            <div className="md:col-span-5 flex flex-col justify-between">
              <div>
                <h3 data-edit-id="footer.name" data-edit-name="Footer · Name" data-edit-kind="heading" data-edit-path="footer.name" className="font-display text-3xl sm:text-5xl font-medium tracking-tight mb-3 sm:mb-4">{footerData.name}</h3>
                <p data-edit-id="footer.tagline" data-edit-name="Footer · Tagline" data-edit-kind="text" data-edit-path="footer.tagline" className="text-bg/60 text-base sm:text-lg max-w-sm">{footerData.tagline}</p>
                <div className="mt-6">
                  <NewsletterSubscribe source="home_footer_studiomodular" />
                </div>
              </div>
              <div className="mt-8 sm:mt-12 text-xs font-mono text-bg/40">
                <p>&copy; {new Date().getFullYear()} {footerData.copyright}</p>
                <Link to="/admin" className="mt-3 sm:mt-4 flex items-center gap-2 hover:text-bg w-max min-h-[36px]">
                  <Lock size={12} /> Admin Portal
                </Link>
              </div>
            </div>
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 text-sm">
              <div className="flex flex-col gap-4 sm:gap-6 border-t border-bg/20 pt-4 sm:pt-6">
                <span className="text-bg/40 uppercase tracking-widest text-xs">Socials</span>
                <a href={footerData.github} className="hover:text-accent transition-colors font-medium min-h-[36px] flex items-center">GitHub</a>
                <a href={footerData.linkedin} className="hover:text-accent transition-colors font-medium min-h-[36px] flex items-center">LinkedIn</a>
              </div>
              <div className="flex flex-col gap-4 sm:gap-6 border-t border-bg/20 pt-4 sm:pt-6">
                <span className="text-bg/40 uppercase tracking-widest text-xs">Inquiries</span>
                <a href={`mailto:${footerData.email}`} className="text-base sm:text-xl hover:text-accent transition-colors font-medium break-all">{footerData.email}</a>
              </div>
            </div>
          </div>
        </footer>
      ) : (
        <footer data-edit-id="footer.section" data-edit-name="Footer Section" data-edit-kind="footer" className="bg-ink text-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8">
              <div>
                <Logo size={36} className="text-bg mb-4 sm:mb-5" title="AP monogram" />
                <h3
                  data-edit-id="footer.name" data-edit-name="Footer · Name" data-edit-kind="heading" data-edit-path="footer.name"
                  className={`font-display font-extrabold tracking-tight ${
                    animationStyle === 'monolog'
                      ? 'text-[clamp(2.5rem,10vw,10rem)] leading-none opacity-90' /* bymonolog.com — giant brand wordmark filling the footer */
                      : 'text-3xl sm:text-6xl'
                  }`}
                >{footerData.name}</h3>
                <p data-edit-id="footer.tagline" data-edit-name="Footer · Tagline" data-edit-kind="text" data-edit-path="footer.tagline" className="mt-2.5 sm:mt-3 text-bg/60 text-xs sm:text-sm max-w-sm">{footerData.tagline}</p>
                
                {/* Newsletter Subscribe */}
                <div className="mt-6 pt-4 border-t border-bg/15 max-w-md">
                  <NewsletterSubscribe source="home_footer_default" />
                </div>

                {/* Doodle Art Guide Sticky Note for Footer */}
                <div className="mt-5">
                  <DoodleGuide
                    tag="Connect"
                    text="Open for full-time Data Analyst roles & projects"
                    subtext="Let's build something data-driven together ✦"
                    icon="heart"
                    arrow="none"
                    rotation={1}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm text-bg/70">
                <a href={footerData.github} target="_blank" rel="noopener noreferrer" className="hover:text-bg transition-colors min-h-[36px] flex items-center">GitHub</a>
                <a href={footerData.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-bg transition-colors min-h-[36px] flex items-center">LinkedIn</a>
                <a href={`mailto:${footerData.email}`} className="hover:text-bg transition-colors min-h-[36px] flex items-center break-all">Email</a>
              </div>
            </div>
            <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-bg/10 flex flex-wrap items-center justify-between gap-3 text-[11px] sm:text-xs text-bg/40 font-mono">
              <span>&copy; {new Date().getFullYear()} {footerData.name}. {footerData.copyright}</span>
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="hidden sm:inline">Designed &amp; developed in {footerData.designYear}</span>
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-bg/10 text-bg/40 hover:text-bg/80 hover:border-bg/30 transition-all duration-300 cursor-pointer min-h-[32px]"
                  aria-label="Admin dashboard"
                >
                  <Lock size={10} />
                  <span className="text-[10px] tracking-wider uppercase">Admin</span>
                </Link>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Dynamic Custom Section */}
      {settings?.custom_elements && Object.values(settings.custom_elements).some((e) => e.section === 'custom_section') && (
        <section id="custom-section" className="py-16 sm:py-24 lg:py-32 bg-bg border-b border-line">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <span className="text-xs font-mono tracking-[0.25em] text-accent uppercase">06 — Custom Section</span>
            <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
              {renderCustomElements('custom_section', settings.custom_elements)}
            </div>
          </div>
        </section>
      )}

      {/* Scroll to Top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 min-w-[44px] min-h-[44px] p-3 bg-ink hover:bg-accent text-bg hover:text-ink rounded-full shadow-xl z-50 cursor-pointer focus:outline-none transition-colors flex items-center justify-center"
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Custom Awwwards Cursors */}
      {cursorStyle !== 'default' && cursorStyle !== 'none' && !isPreview && (
        <div
          className="fixed pointer-events-none z-[9999] rounded-full transition-transform duration-100 ease-out"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
            transform: `translate(-50%, -50%) scale(${hovered ? 1.4 : 1})`,
            ...getCursorStyles(cursorStyle)
          }}
        />
      )}
    </div>
    </>
  );
}

// ─── Visual Editor Dynamic Custom Element Renderer ───
export function renderCustomElements(sectionName, elementsDict) {
  if (!elementsDict) return null;
  const els = Object.values(elementsDict)
    .filter((e) => e.section === sectionName)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return els.map((el) => {
    const commonProps = {
      key: el.id,
      'data-edit-id': el.id,
      'data-edit-name': el.name,
      'data-edit-kind': el.kind,
      'data-edit-path': el.path,
      className: `custom-element custom-element-${el.kind} my-4 transition-all duration-300 inline-block w-full`,
    };

    switch (el.kind) {
      case 'heading':
        return (
          <h3 {...commonProps} className={`${commonProps.className} font-display font-bold text-2xl sm:text-4xl text-ink leading-tight`}>
            {el.value}
          </h3>
        );
      case 'text':
        return (
          <p {...commonProps} className={`${commonProps.className} text-base text-ink-soft leading-relaxed`}>
            {el.value}
          </p>
        );
      case 'button':
        return (
          <div key={el.id} className="my-4">
            <a
              href={el.href || '#'}
              {...commonProps}
              className={`custom-element-button inline-flex items-center justify-center px-6 py-3 rounded-full bg-ink text-bg font-semibold hover:bg-accent hover:text-ink text-sm transition-all duration-300`}
            >
              {el.value}
            </a>
          </div>
        );
      case 'link':
        return (
          <div key={el.id} className="my-4">
            <a
              href={el.href || '#'}
              {...commonProps}
              className={`text-sm font-semibold text-accent hover:underline inline-flex items-center gap-1`}
            >
              {el.value}
            </a>
          </div>
        );
      case 'image':
        return (
          <img
            src={el.value}
            alt={el.name}
            {...commonProps}
            className={`${commonProps.className} max-w-md h-auto rounded-lg border border-line object-cover shadow-md`}
          />
        );
      default:
        return null;
    }
  });
}

function getCursorStyles(style) {
  switch (style) {
    case 'dot':
      return {
        width: '8px',
        height: '8px',
        backgroundColor: 'var(--color-primary)',
        boxShadow: '0 0 8px var(--color-primary)',
      };
    case 'bubble':
      return {
        width: '32px',
        height: '32px',
        border: '2px solid var(--color-primary)',
        backgroundColor: 'rgba(255, 92, 138, 0.08)',
      };
    case 'invert':
      return {
        width: '24px',
        height: '24px',
        backgroundColor: '#ffffff',
        mixBlendMode: 'difference',
      };
    case 'crosshair':
      return {
        width: '16px',
        height: '16px',
        border: '1.5px solid var(--color-primary)',
        borderRadius: '0px',
      };
    default:
      return {};
  }
}

