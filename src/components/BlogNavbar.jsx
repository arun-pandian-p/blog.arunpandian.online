import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, Sparkles, Mail, Menu, X } from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa6';
import { getMainDomainUrl } from '../utils/domain';

export default function BlogNavbar({ onSubscribeClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mainPortfolioUrl = getMainDomainUrl();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs py-3'
          : 'bg-white/80 backdrop-blur-sm border-b border-slate-100 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* ── Left: Editorial Publication Brand ── */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none"
            title="Arun Pandian Data Journal"
          >
            {/* Custom Monogram */}
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center font-serif font-bold text-sm tracking-wider shadow-sm group-hover:bg-blue-600 transition-colors duration-200">
              AP
            </div>

            <div className="flex flex-col">
              <span className="font-serif font-black text-base sm:text-lg text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                Arun Pandian
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-medium">
                Data Journal &amp; Publications
              </span>
            </div>
          </Link>
        </div>

        {/* ── Center: Quick Publication Categories (Desktop) ── */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-full border border-slate-200/80">
          <Link
            to="/"
            className="px-3.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-950 rounded-full hover:bg-white transition-all"
          >
            All Articles
          </Link>
          <span className="text-slate-300 text-xs">•</span>
          <a
            href="#projects"
            onClick={(e) => {
              if (window.location.pathname !== '/') return;
              e.preventDefault();
              window.scrollTo({ top: 600, behavior: 'smooth' });
            }}
            className="px-3.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-950 rounded-full hover:bg-white transition-all"
          >
            SQL Pipelines
          </a>
          <span className="text-slate-300 text-xs">•</span>
          <a
            href="#projects"
            onClick={(e) => {
              if (window.location.pathname !== '/') return;
              e.preventDefault();
              window.scrollTo({ top: 600, behavior: 'smooth' });
            }}
            className="px-3.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-950 rounded-full hover:bg-white transition-all"
          >
            Power BI Architecture
          </a>
        </nav>

        {/* ── Right: Direct Portfolio Link & Subscribe Action ── */}
        <div className="hidden sm:flex items-center gap-3">
          
          {/* Main Portfolio Link */}
          <a
            href={mainPortfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-all duration-200"
            title="Return to Main Portfolio"
          >
            <span>Portfolio</span>
            <ArrowUpRight size={13} className="opacity-70" />
          </a>

          {/* Subscribe CTA Button */}
          {onSubscribeClick ? (
            <button
              onClick={onSubscribeClick}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 hover:bg-blue-600 text-white text-xs font-mono font-bold transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer"
            >
              <Mail size={13} />
              <span>Subscribe</span>
            </button>
          ) : (
            <a
              href="#subscribe"
              onClick={(e) => {
                e.preventDefault();
                const el = document.querySelector('section[class*="prefooter"]') || document.querySelector('form');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 hover:bg-blue-600 text-white text-xs font-mono font-bold transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer"
            >
              <Mail size={13} />
              <span>Subscribe</span>
            </a>
          )}

          {/* Socials */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 text-slate-500">
            <a
              href="https://github.com/arun-pandian-p"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="GitHub"
            >
              <FaGithub size={14} />
            </a>
            <a
              href="https://www.linkedin.com/in/arunpandianp-dataanalyst/"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-full hover:bg-slate-100 hover:text-blue-600 transition-colors"
              title="LinkedIn"
            >
              <FaLinkedin size={14} />
            </a>
          </div>
        </div>

        {/* ── Mobile Hamburger Button ── */}
        <div className="flex sm:hidden items-center gap-2">
          <a
            href={mainPortfolioUrl}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold text-slate-700 bg-slate-100 border border-slate-200"
          >
            <span>Portfolio</span>
            <ArrowUpRight size={11} />
          </a>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

      </div>

      {/* ── Mobile Dropdown Menu ── */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3 shadow-xl">
          <div className="flex flex-col space-y-2 text-sm font-medium text-slate-800">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              All Articles &amp; Dispatches
            </Link>
            <a
              href={mainPortfolioUrl}
              className="px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between text-blue-600 font-semibold"
            >
              <span>Main Portfolio &amp; Projects</span>
              <ArrowUpRight size={14} />
            </a>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            {onSubscribeClick && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSubscribeClick();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center gap-2"
              >
                <Mail size={14} />
                <span>Subscribe to Updates</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
