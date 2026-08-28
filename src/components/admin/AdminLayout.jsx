import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
  LayoutDashboard,
  Settings,
  FolderOpen,
  PenTool,
  Briefcase,
  Mail,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Sparkles,
  UserRound,
  Wrench,
  Award,
  AtSign,
  Palette,
  Search,
  PanelLeftClose,
  PanelLeft,
  Eye,
  EyeOff,
  MousePointerClick,
  Sun,
  Moon,
  UploadCloud,
  Check,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { PreviewProvider, usePreview } from './preview/PreviewContext';
import PreviewPanel from './preview/PreviewPanel';
import Logo from '../Logo';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { name: 'Inbox', path: '/admin/inbox', icon: Mail },
    ],
  },
  {
    label: 'Site content',
    items: [
      { name: 'Hero', path: '/admin/settings/hero', icon: Sparkles },
      { name: 'About', path: '/admin/settings/about', icon: UserRound },
      { name: 'Skills', path: '/admin/settings/skills', icon: Wrench },
      { name: 'Certifications', path: '/admin/settings/certifications', icon: Award },
      { name: 'Contact', path: '/admin/settings/contact', icon: AtSign },
    ],
  },
  {
    label: 'Collections',
    items: [
      { name: 'Projects', path: '/admin/projects', icon: FolderOpen },
      { name: 'Experience', path: '/admin/experiences', icon: Briefcase },
      { name: 'Blogs', path: '/admin/blogs', icon: PenTool },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Visual Editor', path: '/admin/canvas', icon: MousePointerClick },
      { name: 'Theme Studio', path: '/admin/studio', icon: Palette },
      { name: 'SEO', path: '/admin/settings/seo', icon: Search },
      { name: 'Settings', path: '/admin/settings', icon: Settings },
    ],
  },
];

const navItems = navGroups.flatMap((g) => g.items);

// Routes that get the split editor + live preview experience.
const PREVIEW_PREFIXES = [
  '/admin/settings',
  '/admin/projects',
  '/admin/experiences',
  '/admin/blogs',
];

export default function AdminLayout() {
  return (
    <PreviewProvider>
      <AdminShell />
    </PreviewProvider>
  );
}

function AdminShell() {
  const [userEmail, setUserEmail] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminTheme, setAdminTheme] = useState(
    () => (typeof window !== 'undefined' && window.localStorage.getItem('admin-theme')) || 'light'
  );
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [uploadingDrop, setUploadingDrop] = useState(false);
  const dropzoneInputRef = useRef(null);

  const [navCollapsed, setNavCollapsed] = useState(
    () => typeof window !== 'undefined' && window.localStorage.getItem('admin-nav-collapsed') === '1'
  );
  const location = useLocation();
  const navigate = useNavigate();
  const { editorOpen, setEditorOpen, previewOpen, setPreviewOpen } = usePreview();

  const isFullBleed =
    location.pathname === '/admin/studio' || location.pathname === '/admin/canvas';
  const supportsPreview =
    !isFullBleed && PREVIEW_PREFIXES.some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserEmail(user.email);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const toggleAdminTheme = (theme) => {
    setAdminTheme(theme);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('admin-theme', theme);
    }
  };

  const toggleNavCollapsed = () => {
    const next = !navCollapsed;
    setNavCollapsed(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('admin-nav-collapsed', next ? '1' : '0');
    }
  };

  const handleQuickUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDrop(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `uploads/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const { error } = await supabase.storage.from('assets').upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from('assets').getPublicUrl(path);
      if (data?.publicUrl) {
        navigator.clipboard.writeText(data.publicUrl);
        toast.success('Uploaded & URL copied to clipboard!', { icon: '📋' });
      }
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploadingDrop(false);
      if (e.target) e.target.value = '';
    }
  };

  const closeSidebar = () => setSidebarOpen(false);
  const showPreview = supportsPreview && previewOpen;
  const showEditor = !showPreview || editorOpen;

  // Filtered nav groups for real-time sidebar search
  const filteredNavGroups = navGroups.map((g) => ({
    ...g,
    items: g.items.filter((item) =>
      item.name.toLowerCase().includes(sidebarSearch.toLowerCase())
    ),
  })).filter((g) => g.items.length > 0);

  // ── Resizable editor / preview split ──
  const splitRef = useRef(null);
  const [isWide, setIsWide] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  );
  const [editorWidth, setEditorWidth] = useState(() => {
    const saved = typeof window !== 'undefined' && window.localStorage.getItem('admin-editor-width');
    return saved ? Number(saved) : 560;
  });
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => setIsWide(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('admin-editor-width', String(Math.round(editorWidth)));
  }, [editorWidth]);

  const startDrag = (e) => {
    e.preventDefault();
    setDragging(true);
    const onMove = (ev) => {
      const rect = splitRef.current?.getBoundingClientRect();
      if (!rect) return;
      const min = 340;
      const max = rect.width - 380;
      const next = Math.max(min, Math.min(max, ev.clientX - rect.left));
      setEditorWidth(next);
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const resizable = showPreview && showEditor && isWide;
  const isDark = adminTheme === 'dark';

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden font-sans transition-colors duration-300 ${
        isDark ? 'bg-[#141422] text-[#F1F5F9]' : 'bg-[#F4F6FA] text-[#1E1E2C]'
      }`}
    >
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Hidden file input for quick dropzone */}
      <input
        type="file"
        ref={dropzoneInputRef}
        onChange={handleQuickUpload}
        className="hidden"
      />

      {/* ─── EXPANDED FULL SIDEBAR ─── */}
      {!navCollapsed && (
        <motion.aside
          className={`fixed inset-y-0 left-0 z-50 w-72 h-screen max-h-screen flex flex-col transition-all duration-300 lg:static lg:translate-x-0 border-r shrink-0 select-none ${
            isDark
              ? 'bg-[#1E1E2C] text-white border-[#2A2A3E] shadow-2xl'
              : 'bg-white text-[#1E1E2C] border-[#E8ECF2] shadow-[0_4px_24px_rgba(0,0,0,0.04)]'
          } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Top Bar: Mac Dots + Collapse Button */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56] inline-block shadow-xs" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E] inline-block shadow-xs" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#34B1AA] inline-block shadow-xs" />
            </div>

            <button
              onClick={toggleNavCollapsed}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-[#28283C]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Collapse to Slim Floating Rail"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>

          {/* Top User Profile Card */}
          <div className="px-4 py-2 shrink-0">
            <div
              className={`flex items-center justify-between gap-3 p-2.5 rounded-2xl border transition-all ${
                isDark
                  ? 'bg-gradient-to-b from-[#252538] to-[#1E1E2C] border-[#313149] shadow-xs'
                  : 'bg-gradient-to-b from-slate-50 to-slate-100/90 border-[#E8ECF2] shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src="https://secxgzharggytkevlvmx.supabase.co/storage/v1/object/public/assets/about/lpb0j8p0xp7_1784136525170.png"
                    alt="Arun Pandian"
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-[#F29F67]/50 bg-slate-800"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/favicon.svg';
                    }}
                  />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#34B1AA] ring-2 ring-[#1E1E2C]" />
                </div>
                <div className="min-w-0">
                  <div className={`font-bold text-xs tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Arun Pandian
                  </div>
                  <div className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Data Analyst
                  </div>
                </div>
              </div>

              <Link
                to="/admin/studio"
                title="Open Theme Studio"
                className="h-8 w-8 rounded-xl bg-[#F29F67]/20 text-[#F29F67] hover:bg-[#F29F67] hover:text-white flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-xs"
              >
                <Sparkles size={14} />
              </Link>
            </div>
          </div>

          {/* Live Search Bar */}
          <div className="px-4 pb-2 shrink-0">
            <div
              className={`relative flex items-center rounded-xl border transition-all ${
                isDark
                  ? 'bg-[#181824] border-[#2C2C40] focus-within:border-[#F29F67] shadow-inner'
                  : 'bg-slate-100/90 border-[#E2E6EE] focus-within:border-[#F29F67] shadow-inner'
              }`}
            >
              <Search size={14} className="absolute left-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-transparent outline-none ${
                  isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'
                }`}
              />
              {sidebarSearch && (
                <button
                  onClick={() => setSidebarSearch('')}
                  className="pr-3 text-xs text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Navigation List */}
          <nav className="flex-1 min-h-0 px-3 py-2 space-y-4 overflow-y-auto overflow-x-hidden">
            {filteredNavGroups.map((group) => (
              <div key={group.label}>
                <div className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {group.label}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={closeSidebar}
                        className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-[#F29F67] to-[#E8824A] text-white shadow-md shadow-[#F29F67]/30 font-bold'
                            : isDark
                            ? 'text-slate-300 hover:bg-[#28283C] hover:text-white'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={16} className={isActive ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'} />
                          <span>{item.name}</span>
                        </div>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quick Upload Dropzone Widget */}
            <div className="px-1 pt-2">
              <div
                onClick={() => dropzoneInputRef.current?.click()}
                className={`p-3 rounded-2xl border border-dashed text-center transition-all cursor-pointer group ${
                  isDark
                    ? 'border-[#33334B] bg-[#171724]/80 hover:bg-[#202033] hover:border-[#F29F67]'
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-[#F29F67]'
                }`}
              >
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#F29F67]">
                  <UploadCloud size={16} className="group-hover:scale-110 transition-transform" />
                  <span>{uploadingDrop ? 'Uploading...' : 'Quick Asset Upload'}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Upload directly to Supabase storage
                </p>
              </div>
            </div>
          </nav>

          {/* Pinned Bottom Controls */}
          <div className={`p-3 border-t shrink-0 space-y-2 ${isDark ? 'border-[#2A2A3E] bg-[#1A1A28]' : 'border-[#E8ECF2] bg-white'}`}>
            {/* Light / Dark Mode Toggle Capsule */}
            <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-[#141422] border-[#2C2C40]' : 'bg-slate-100 border-[#E2E6EE]'}`}>
              <button
                type="button"
                onClick={() => toggleAdminTheme('light')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !isDark
                    ? 'bg-white text-[#F29F67] shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun size={13} />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => toggleAdminTheme('dark')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#28283C] text-[#F29F67] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Moon size={13} />
                <span>Dark</span>
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/"
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border font-semibold transition-colors ${
                  isDark ? 'border-[#2C2C40] bg-[#222234] text-slate-300 hover:bg-[#2C2C42]' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ArrowLeft size={13} />
                <span>Public Site</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-rose-200/40 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-semibold transition-colors cursor-pointer"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </motion.aside>
      )}

      {/* ─── COLLAPSED ULTRA-SLIM FLOATING RAIL (Matching Image 2 Reference) ─── */}
      {navCollapsed && (
        <aside
          className={`hidden lg:flex flex-col items-center justify-between w-[72px] my-3 ml-3 rounded-3xl border select-none shrink-0 shadow-lg z-30 transition-all ${
            isDark ? 'bg-[#1E1E2C] border-[#2A2A3E] text-white' : 'bg-white border-[#E8ECF2] text-[#1E1E2C]'
          }`}
        >
          {/* Top Monogram / Logo & Expand Button */}
          <div className="flex flex-col items-center gap-4 pt-5">
            <button
              onClick={toggleNavCollapsed}
              className="w-10 h-10 rounded-2xl bg-[#F29F67]/20 text-[#F29F67] hover:bg-[#F29F67] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
              title="Expand Sidebar"
            >
              <PanelLeft size={18} />
            </button>
          </div>

          {/* Centered Floating Icons Rail with Active Indicator */}
          <div className="flex flex-col items-center gap-2 py-4">
            {navItems.slice(0, 8).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  title={item.name}
                  className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all group cursor-pointer ${
                    isActive
                      ? isDark
                        ? 'bg-[#2C2C42] text-[#34B1AA] shadow-sm'
                        : 'bg-slate-100 text-[#34B1AA] shadow-sm'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-[#252538]'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {/* Left Active Teal Indicator Bar (Matching 2nd Image) */}
                  {isActive && (
                    <span className="absolute -left-3 w-1.5 h-6 rounded-r-full bg-[#34B1AA]" />
                  )}
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </Link>
              );
            })}
          </div>

          {/* Bottom Avatar with Status Ring */}
          <div className="flex flex-col items-center gap-3 pb-5">
            {/* Quick Theme Toggle */}
            <button
              onClick={() => toggleAdminTheme(isDark ? 'light' : 'dark')}
              className={`p-2 rounded-xl cursor-pointer ${
                isDark ? 'text-amber-400 hover:bg-[#28283C]' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <div className="relative group cursor-pointer">
              <img
                src="https://secxgzharggytkevlvmx.supabase.co/storage/v1/object/public/assets/about/lpb0j8p0xp7_1784136525170.png"
                alt="Arun Pandian"
                className="h-10 w-10 rounded-full object-cover ring-2 ring-[#34B1AA] bg-slate-800"
                onClick={toggleNavCollapsed}
              />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#34B1AA] ring-2 ring-[#1E1E2C]" />
            </div>
          </div>
        </aside>
      )}

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Header Bar */}
        <header
          className={`h-16 px-4 sm:px-6 flex items-center justify-between border-b shrink-0 select-none transition-colors ${
            isDark ? 'bg-[#1E1E2C] border-[#2A2A3E]' : 'bg-white border-[#E8ECF2]'
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base tracking-tight">
                {navItems.find((n) => n.path === location.pathname)?.name || 'Admin Workspace'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Split Preview Controls (when on project/blog editors) */}
            {supportsPreview && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditorOpen(!editorOpen)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    editorOpen
                      ? isDark ? 'bg-[#28283C] text-white border-[#3C3C54]' : 'bg-slate-100 text-slate-900 border-slate-300'
                      : 'text-slate-400 border-transparent hover:bg-slate-100'
                  }`}
                >
                  {editorOpen ? 'Hide Editor' : 'Show Editor'}
                </button>
                <button
                  onClick={() => setPreviewOpen(!previewOpen)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    previewOpen
                      ? 'bg-[#34B1AA]/10 text-[#34B1AA] border-[#34B1AA]/30'
                      : 'text-slate-400 border-transparent hover:bg-slate-100'
                  }`}
                >
                  {previewOpen ? <Eye size={13} /> : <EyeOff size={13} />}
                  <span>Preview {previewOpen ? 'On' : 'Off'}</span>
                </button>
              </div>
            )}

            {/* Quick Public Site Link */}
            <Link
              to="/"
              className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isDark
                  ? 'border-[#2C2C40] bg-[#222234] text-slate-300 hover:bg-[#2C2C42]'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Public Site ↗</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Split or Full Page Content */}
        <div ref={splitRef} className="flex-1 flex min-h-0 overflow-hidden relative">
          
          {/* Main Outlet Form/Table/Dashboard View */}
          <div
            style={{
              width: resizable ? `${editorWidth}px` : '100%',
              maxWidth: resizable ? `${editorWidth}px` : '100%',
            }}
            className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-colors ${
              isDark ? 'bg-[#141422]' : 'bg-[#F4F6FA]'
            }`}
          >
            <Outlet context={{ isDark }} />
          </div>

          {/* Resizer Handle */}
          {resizable && (
            <div
              onMouseDown={startDrag}
              className={`w-1.5 hover:w-2 transition-all cursor-col-resize shrink-0 relative z-20 ${
                isDark ? 'bg-[#2A2A3E] hover:bg-[#F29F67]' : 'bg-[#E8ECF2] hover:bg-[#F29F67]'
              }`}
            />
          )}

          {/* Split Live Preview Panel */}
          {showPreview && (
            <div className="flex-1 min-w-[340px] h-full overflow-hidden bg-slate-950">
              <PreviewPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
