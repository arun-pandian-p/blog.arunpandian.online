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
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { PreviewProvider, usePreview } from './preview/PreviewContext';
import PreviewPanel from './preview/PreviewPanel';

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
  const [sidebarTheme, setSidebarTheme] = useState(
    () => (typeof window !== 'undefined' && window.localStorage.getItem('admin-sidebar-theme')) || 'dark'
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

  const toggleSidebarTheme = (theme) => {
    setSidebarTheme(theme);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('admin-sidebar-theme', theme);
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

  useEffect(() => {
    window.localStorage.setItem('admin-nav-collapsed', navCollapsed ? '1' : '0');
  }, [navCollapsed]);

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
  const isDark = sidebarTheme === 'dark';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Hidden file input for sidebar quick dropzone */}
      <input
        type="file"
        ref={dropzoneInputRef}
        onChange={handleQuickUpload}
        className="hidden"
      />

      {/* Sidebar - Neumorphic Dark/White Theme */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 w-72 h-screen max-h-screen flex flex-col transition-all duration-300 lg:static lg:translate-x-0 border-r shrink-0 select-none ${
          isDark
            ? 'bg-[#0B111E] text-white border-slate-800/80 shadow-2xl'
            : 'bg-white text-slate-800 border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)]'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${navCollapsed ? 'lg:hidden' : ''}`}
      >
        {/* Top Mac Window Control Dots */}
        <div className="flex items-center gap-1.5 px-5 pt-3.5 pb-1 shrink-0">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56] inline-block shadow-xs" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E] inline-block shadow-xs" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F] inline-block shadow-xs" />
        </div>

        {/* Top User Profile Card (Matching uploaded reference) */}
        <div className="px-4 py-3 shrink-0">
          <div
            className={`flex items-center justify-between gap-3 p-2.5 rounded-2xl border transition-all ${
              isDark
                ? 'bg-gradient-to-b from-[#131C2E] to-[#0E1626] border-slate-800/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]'
                : 'bg-gradient-to-b from-slate-50 to-slate-100/90 border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <img
                  src="https://secxgzharggytkevlvmx.supabase.co/storage/v1/object/public/assets/about/lpb0j8p0xp7_1784136525170.png"
                  alt="Arun Pandian"
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-500/40 bg-slate-800"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/favicon.svg';
                  }}
                />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-[#0B111E]" />
              </div>
              <div className="min-w-0">
                <div className={`font-bold text-xs tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Arun Pandian
                </div>
                <div className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Data Analyst Specialist
                </div>
              </div>
            </div>

            <Link
              to="/admin/studio"
              title="Open Theme Studio"
              className="h-8 w-8 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-xs"
            >
              <Sparkles size={14} />
            </Link>
          </div>
        </div>

        {/* Live Search Bar (Matching Reference Capsule Input) */}
        <div className="px-4 pb-2 shrink-0">
          <div
            className={`relative flex items-center rounded-xl border transition-all ${
              isDark
                ? 'bg-[#121A2A] border-slate-700/60 focus-within:border-blue-500 shadow-inner'
                : 'bg-slate-100/90 border-slate-200 focus-within:border-blue-500 shadow-inner'
            }`}
          >
            <Search size={14} className={`absolute left-3.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
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

        {/* Navigation List - Smooth internal scroll area */}
        <nav className="flex-1 min-h-0 px-3 py-2 space-y-4 overflow-y-auto overflow-x-hidden">
          {filteredNavGroups.map((group) => (
            <div key={group.label}>
              <div
                className={`px-3 mb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] ${
                  isDark ? 'text-slate-400/90' : 'text-slate-400'
                }`}
              >
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
                          ? isDark
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                            : 'bg-blue-600 text-white shadow-[0_4px_16px_rgba(37,99,235,0.3)] font-bold'
                          : isDark
                          ? 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={16}
                          className={
                            isActive
                              ? 'text-white'
                              : isDark
                              ? 'text-slate-400 group-hover:text-slate-200'
                              : 'text-slate-500 group-hover:text-slate-700'
                          }
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.name === 'Projects' && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                            isActive
                              ? 'bg-white/20 text-white font-bold'
                              : isDark
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-slate-200/80 text-slate-600'
                          }`}
                        >
                          4
                        </span>
                      )}
                      {item.name === 'Blogs' && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                            isActive
                              ? 'bg-white/20 text-white font-bold'
                              : isDark
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-slate-200/80 text-slate-600'
                          }`}
                        >
                          3
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick Drag-n-Drop Upload Capsule (Matching Reference image) */}
          <div className="pt-2 px-1">
            <button
              type="button"
              onClick={() => dropzoneInputRef.current?.click()}
              className={`w-full py-4 px-3 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#0E1626]/80 border-slate-700/70 text-slate-300 hover:border-blue-500/80 hover:bg-[#121C30]'
                  : 'bg-slate-50 border-slate-300 text-slate-600 hover:border-blue-500 hover:bg-blue-50/40'
              }`}
            >
              <UploadCloud size={20} className={uploadingDrop ? 'animate-bounce text-blue-500' : 'text-blue-500'} />
              <span className="text-[11px] font-bold font-sans">
                {uploadingDrop ? 'Uploading File...' : 'Drag-n-Drop to Upload'}
              </span>
              <span className={`text-[9px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                PNG, JPG, PDF, XLSX, PBIX
              </span>
            </button>
          </div>
        </nav>

        {/* Bottom Section: Theme Switcher + Pinned Logout */}
        <div
          className={`p-3 border-t shrink-0 space-y-2.5 z-10 transition-colors ${
            isDark ? 'bg-[#0B111E] border-slate-800/80' : 'bg-white border-slate-200'
          }`}
        >
          {/* Neumorphic Light / Dark Toggle Capsule (Exact reference match) */}
          <div
            className={`flex items-center p-1 rounded-xl border transition-all ${
              isDark ? 'bg-[#121A2A] border-slate-800' : 'bg-slate-100 border-slate-200/90 shadow-inner'
            }`}
          >
            <button
              onClick={() => toggleSidebarTheme('light')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !isDark
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun size={13} className={!isDark ? 'text-amber-500' : 'text-slate-400'} />
              <span>Light</span>
            </button>
            <button
              onClick={() => toggleSidebarTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#1E293B] text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Moon size={13} className={isDark ? 'text-blue-400' : 'text-slate-400'} />
              <span>Dark</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors border cursor-pointer ${
                isDark
                  ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/40'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
              }`}
            >
              <ArrowLeft size={12} />
              <span className="truncate">Public Site</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 px-2.5 py-2 text-xs font-medium text-red-500 hover:text-red-400 transition-colors cursor-pointer border border-red-500/20"
            >
              <LogOut size={12} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center border-b border-slate-200 bg-white px-6 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-500 hover:text-slate-700 mr-4"
          >
            <Menu size={20} />
          </button>
          <button
            onClick={() => setNavCollapsed((v) => !v)}
            className="mr-4 hidden items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors lg:inline-flex"
            title={navCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          >
            {navCollapsed ? <PanelLeft size={15} /> : <PanelLeftClose size={15} />}
            {navCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          </button>
          <h2 className="text-xl font-bold text-slate-800">
            {navItems.find((i) => i.path === location.pathname)?.name || 'Dashboard'}
          </h2>

          {/* Preview controls */}
          {supportsPreview && (
            <div className="ml-auto flex items-center gap-2">
              {previewOpen && (
                <button
                  onClick={() => setEditorOpen((v) => !v)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  title={editorOpen ? 'Hide editor' : 'Show editor'}
                >
                  {editorOpen ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
                  <span className="hidden sm:inline">{editorOpen ? 'Hide editor' : 'Show editor'}</span>
                </button>
              )}
              <button
                onClick={() => setPreviewOpen((v) => !v)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  previewOpen
                    ? 'border-blue-200 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title={previewOpen ? 'Hide preview' : 'Show preview'}
              >
                {previewOpen ? <Eye size={15} /> : <EyeOff size={15} />}
                <span>{previewOpen ? 'Preview on' : 'Preview off'}</span>
              </button>
            </div>
          )}
        </header>

        {/* Scrollable Page Content */}
        {isFullBleed ? (
          <div className="flex-1 overflow-hidden p-0">
            <div className="h-full w-full">
              <Outlet />
            </div>
          </div>
        ) : supportsPreview ? (
          <div ref={splitRef} className="relative flex min-h-0 flex-1 overflow-hidden">
            {showEditor && (
              <div
                style={resizable ? { width: editorWidth } : undefined}
                className={`h-full overflow-auto bg-white p-6 lg:p-8 ${
                  showPreview ? 'w-full md:shrink-0' : 'flex-1'
                }`}
              >
                <div className={showPreview ? '' : 'mx-auto max-w-6xl'}>
                  <Outlet />
                </div>
              </div>
            )}

            {/* Draggable divider */}
            {resizable && (
              <div
                onMouseDown={startDrag}
                onDoubleClick={() => setEditorWidth(560)}
                title="Drag to resize · double-click to reset"
                className={`group hidden w-1.5 shrink-0 cursor-col-resize items-center justify-center md:flex ${
                  dragging ? 'bg-blue-400' : 'bg-slate-200 hover:bg-blue-400'
                } transition-colors`}
              >
                <div className={`h-10 w-1 rounded-full ${dragging ? 'bg-white' : 'bg-slate-400 group-hover:bg-white'}`} />
              </div>
            )}

            {showPreview && (
              <div className={`hidden min-w-0 flex-1 md:block ${dragging ? 'pointer-events-none' : ''}`}>
                <PreviewPanel />
              </div>
            )}

            {/* Overlay keeps mouse events flowing while dragging over the iframe */}
            {dragging && <div className="fixed inset-0 z-[60] cursor-col-resize" />}
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-6 lg:p-8">
            <div className="mx-auto max-w-6xl">
              <Outlet />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
