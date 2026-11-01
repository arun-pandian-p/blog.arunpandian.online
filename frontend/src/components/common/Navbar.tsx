import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Book02Icon,
  Search01Icon,
  PencilEdit02Icon,
  Moon02Icon,
  Sun02Icon,
  BookBookmark02Icon,
  Shield01Icon,
  UserIcon,
  Logout01Icon,
  Menu01Icon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch, searchQuery = '' }) => {
  const { user, isAdmin, logout, openAuthModal } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    if (onSearch) onSearch(val);
  };

  const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'dev'}`;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <a href="/" className="flex items-center gap-2 sm:gap-2.5 group flex-shrink-0">
              <img
                src="/logo.png"
                alt="Apstories Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-emerald-500/40 group-hover:border-emerald-500 shadow-sm transition-all"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 leading-none">
                  Apstories
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Journal
                  </span>
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
              <a
                href="/"
                className="px-3 py-1.5 rounded-lg hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                Feed
              </a>
              <a
                href="/bookmarks"
                className="px-3 py-1.5 rounded-lg hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors flex items-center gap-1.5"
              >
                <HugeiconsIcon icon={BookBookmark02Icon} size={16} className="text-slate-400" />
                Bookmarks
              </a>
              {isAdmin && (
                <a
                  href="/admin"
                  className="px-3 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors flex items-center gap-1.5"
                >
                  <HugeiconsIcon icon={Shield01Icon} size={16} />
                  Moderation
                </a>
              )}
            </nav>
          </div>

          {/* Center: Search input (hidden on mobile, available in drawer) */}
          <div className="hidden sm:flex flex-1 max-w-md mx-2 sm:mx-4">
            <div className="relative w-full">
              <HugeiconsIcon icon={Search01Icon} size={16} className="text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={localSearch}
                onChange={handleSearchChange}
                placeholder="Search architecture, Java, AI, lessons..."
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* Write Story Button - Always Accessible */}
            <a
              href="/new"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold rounded-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.02] touch-manipulation"
              title="Write Story"
            >
              <HugeiconsIcon icon={PencilEdit02Icon} size={15} />
              <span className="hidden min-[380px]:inline">Write</span>
              <span className="hidden sm:inline">Story</span>
            </a>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark or light mode"
              className="p-1.5 sm:p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <HugeiconsIcon icon={Sun02Icon} size={17} /> : <HugeiconsIcon icon={Moon02Icon} size={17} />}
            </button>

            {/* Desktop User Profile or Sign In */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-emerald-500 transition-all"
                >
                  <img
                    src={user.avatar_url || defaultAvatar}
                    alt={user.full_name}
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover bg-slate-100"
                  />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-2 text-xs z-50 animate-in fade-in duration-100">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {user.full_name}
                      </p>
                      <p className="text-slate-400 truncate">@{user.username}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Admin Moderator
                        </span>
                      )}
                    </div>

                    <a
                      href={`/author/${user.username}`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                    >
                      <HugeiconsIcon icon={UserIcon} size={15} />
                      My Engineering Profile
                    </a>

                    <a
                      href="/bookmarks"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                    >
                      <HugeiconsIcon icon={BookBookmark02Icon} size={15} />
                      Saved Stories
                    </a>

                    {isAdmin && (
                      <a
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold"
                      >
                        <HugeiconsIcon icon={Shield01Icon} size={15} />
                        Moderation Dashboard
                      </a>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium text-left"
                    >
                      <HugeiconsIcon icon={Logout01Icon} size={15} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="hidden md:inline-flex px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Sign In
              </button>
            )}

            {/* Mobile hamburger menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile navigation menu"
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 touch-manipulation"
            >
              <HugeiconsIcon icon={Menu01Icon} size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-out Drawer Panel */}
          <aside className="fixed top-0 right-0 bottom-0 w-[84%] max-w-xs bg-white dark:bg-slate-950 shadow-2xl z-50 p-5 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250 border-l border-slate-200 dark:border-slate-800">
            <div>
              {/* Drawer Header with original logo and close button */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <a
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <img
                    src="/logo.png"
                    alt="Apstories Logo"
                    className="w-8 h-8 rounded-full object-cover border border-emerald-500/40 shadow-sm"
                  />
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                    Apstories
                  </span>
                </a>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={20} />
                </button>
              </div>

              {/* Mobile Search Input */}
              <div className="relative mb-5">
                <HugeiconsIcon icon={Search01Icon} size={15} className="text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={handleSearchChange}
                  placeholder="Search engineering stories..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1 text-sm font-medium">
                <a
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  <HugeiconsIcon icon={Book02Icon} size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Engineering Feed</span>
                </a>

                <a
                  href="/bookmarks"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  <HugeiconsIcon icon={BookBookmark02Icon} size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Saved Bookmarks</span>
                </a>

                <a
                  href="/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold transition-colors"
                >
                  <HugeiconsIcon icon={PencilEdit02Icon} size={18} />
                  <span>Write New Story</span>
                </a>

                {isAdmin && (
                  <a
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-purple-700 dark:text-purple-300 font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                  >
                    <HugeiconsIcon icon={Shield01Icon} size={18} />
                    <span>Moderation Dashboard</span>
                  </a>
                )}
              </nav>
            </div>

            {/* Drawer Bottom: User identity / Sign In & Theme toggle */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              {user ? (
                <div>
                  <div className="flex items-center gap-3 px-2 py-2 mb-2">
                    <img
                      src={user.avatar_url || defaultAvatar}
                      alt={user.full_name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 bg-slate-100"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user.full_name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
                    </div>
                  </div>

                  <a
                    href={`/author/${user.username}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
                  >
                    <HugeiconsIcon icon={UserIcon} size={16} />
                    <span>My Profile</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-left"
                  >
                    <HugeiconsIcon icon={Logout01Icon} size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full py-2.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                >
                  Sign In to Apstories
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
