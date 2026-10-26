import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Menu, X, Bookmark, Edit3, User, LogIn, LogOut, Rss, Settings } from 'lucide-react';
import { api } from '../services/apiClient';

export default function BlogNavbar({ onSubscribeClick }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    if (api.auth.isAuthenticated()) {
      setUser(api.auth.getUser());
      api.auth.me().then(setUser).catch(() => {});
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    setUserDropdownOpen(false);
    navigate('/', { replace: true });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#E7E0D3] shadow-xs py-3'
          : 'bg-[#FBF9F5]/85 backdrop-blur-sm border-b border-[#EFE9DF] py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* ── Left: Publication Brand ── */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none"
            title="blog.arunpandian.online"
          >
            <div className="w-8 h-8 rounded-xl bg-[#1C1A17] text-[#FAF7F2] flex items-center justify-center font-serif font-black text-sm tracking-wider shadow-xs group-hover:bg-[#B83A26] transition-colors">
              B
            </div>

            <div className="flex flex-col">
              <span className="font-serif font-black text-base sm:text-lg text-[#1C1A17] leading-tight group-hover:text-[#B83A26] transition-colors">
                blog.arunpandian.online
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C8479] font-medium hidden sm:inline">
                Independent Publishing Platform
              </span>
            </div>
          </Link>
        </div>

        {/* ── Center: Core Publication Links ── */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#F2ECE1]/70 px-2 py-1 rounded-full border border-[#E2DAD0]">
          <Link
            to="/"
            className="px-3 py-1 text-xs font-mono font-medium text-[#4A453E] hover:text-[#1C1A17] rounded-full hover:bg-white transition-all shadow-2xs"
          >
            Articles
          </Link>
          <span className="text-[#C4BDB2] text-xs">•</span>
          <Link
            to="/bookmarks"
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-mono font-medium text-[#6E665C] hover:text-[#1C1A17] rounded-full hover:bg-white transition-all"
          >
            <Bookmark size={11} />
            <span>Reading List</span>
          </Link>
          <span className="text-[#C4BDB2] text-xs">•</span>
          <a
            href="/feed.xml"
            target="_blank"
            rel="noopener noreferrer"
            title="RSS 2.0 Feed"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium text-[#6E665C] hover:text-[#B83A26] rounded-full hover:bg-white transition-all"
          >
            <Rss size={11} />
            <span>RSS</span>
          </a>
        </nav>

        {/* ── Right: Write button, Auth & User Menu ── */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Write Action (Medium / DEV.to style) */}
          <Link
            to="/write"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#DED7CB] hover:border-[#1C1A17] bg-white hover:bg-[#FAF8F5] text-xs font-mono font-bold text-[#1C1A17] transition-all cursor-pointer"
          >
            <Edit3 size={13} className="text-[#B83A26]" />
            <span>Write</span>
          </Link>

          {/* Subscribe Action */}
          {onSubscribeClick && (
            <button
              onClick={onSubscribeClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1C1A17] hover:bg-[#B83A26] text-[#FAF7F2] text-xs font-mono font-bold transition-all shadow-xs cursor-pointer"
            >
              <Mail size={12} />
              <span>Subscribe</span>
            </button>
          )}

          {/* Auth Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#E2DAD0] transition-all focus:outline-none cursor-pointer"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-7 h-7 rounded-full object-cover border border-[#E2DAD0]" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#1C1A17] text-white flex items-center justify-center text-xs font-serif font-bold">
                    {user.fullName?.charAt(0) || 'U'}
                  </div>
                )}
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-[#E7E0D3] shadow-lg py-1.5 text-xs font-mono z-50">
                  <div className="px-3.5 py-2 border-b border-[#F2ECE1]">
                    <p className="font-bold text-[#1C1A17] truncate">{user.fullName}</p>
                    <p className="text-[11px] text-[#8C8479] truncate">@{user.username || 'user'}</p>
                  </div>
                  {user.username && (
                    <Link
                      to={`/author/${user.username}`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-3.5 py-2 text-[#4A453E] hover:bg-[#FBF9F5] hover:text-[#B83A26]"
                    >
                      View Public Profile
                    </Link>
                  )}
                  <Link
                    to="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-[#4A453E] hover:bg-[#FBF9F5] hover:text-[#1C1A17]"
                  >
                    <Settings size={13} />
                    <span>Account Settings</span>
                  </Link>
                  <Link
                    to="/bookmarks"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-[#4A453E] hover:bg-[#FBF9F5] hover:text-[#1C1A17]"
                  >
                    <Bookmark size={13} />
                    <span>Reading List</span>
                  </Link>
                  {(user.role === 'ROLE_ADMIN' || user.role === 'ADMIN') && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-3.5 py-2 text-[#4A453E] hover:bg-[#FBF9F5] font-bold text-[#B83A26]"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <div className="border-t border-[#F2ECE1] mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut size={13} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-mono font-medium text-[#4A453E] hover:text-[#1C1A17]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-full bg-[#1C1A17] text-white text-xs font-mono font-bold hover:bg-[#B83A26] transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* ── Mobile Hamburger Button ── */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            to="/write"
            className="p-1.5 rounded-lg border border-[#E2DAD0] text-[#1C1A17]"
            title="Write"
          >
            <Edit3 size={15} />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-[#E2DAD0] text-[#1C1A17]"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

      </div>

      {/* ── Mobile Dropdown Menu ── */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#E7E0D3] bg-white px-4 py-4 space-y-3 shadow-xl font-mono text-xs">
          <div className="flex flex-col space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-[#FAF8F5] text-[#1C1A17] font-semibold"
            >
              All Articles
            </Link>
            <Link
              to="/bookmarks"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-[#FAF8F5] text-[#1C1A17]"
            >
              Saved Bookmarks
            </Link>
            <Link
              to="/write"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-[#FAF8F5] text-[#B83A26] font-bold"
            >
              Write New Article
            </Link>
            <a
              href="/feed.xml"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-lg hover:bg-[#FAF8F5] text-[#7A7265]"
            >
              RSS Feed (/feed.xml)
            </a>
          </div>

          <div className="pt-2 border-t border-[#EFE9DF] flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 px-3 rounded-lg bg-[#FAF8F5] text-[#1C1A17] font-semibold flex items-center justify-between"
                >
                  <span>{user.fullName} (@{user.username || 'user'})</span>
                  <Settings size={14} />
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2 px-3 rounded-lg text-rose-600 hover:bg-rose-50 text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-xl border border-[#E2DAD0] text-[#1C1A17] font-bold"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-xl bg-[#1C1A17] text-white font-bold"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
