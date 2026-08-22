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
} from 'lucide-react';
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

  const closeSidebar = () => setSidebarOpen(false);
  const showPreview = supportsPreview && previewOpen;
  const showEditor = !showPreview || editorOpen;

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

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
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

      {/* Sidebar - Dark theme */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${navCollapsed ? 'lg:hidden' : ''}`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold">
              AP
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide">ADMIN PANEL</div>
              <div className="text-[10px] text-slate-400">Arun Pandian</div>
            </div>
          </div>
          <button onClick={closeSidebar} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-5 space-y-5 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="px-4 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={closeSidebar}
                      className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon size={17} className={isActive ? 'text-blue-400' : 'text-slate-500'} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0 space-y-4">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-blue-400">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs text-slate-400 truncate">{userEmail}</div>
              <div className="text-[10px] text-slate-500">Administrator</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
          >
            <LogOut size={16} />
            Sign Out
          </button>

          <Link
            to="/"
            className="flex w-full items-center justify-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Site
          </Link>
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
            <div className="ml-auto hidden md:flex items-center gap-2">
              {previewOpen && (
                <button
                  onClick={() => setEditorOpen((v) => !v)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  title={editorOpen ? 'Hide editor' : 'Show editor'}
                >
                  {editorOpen ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
                  {editorOpen ? 'Hide editor' : 'Show editor'}
                </button>
              )}
              <button
                onClick={() => setPreviewOpen((v) => !v)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  previewOpen
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title={previewOpen ? 'Hide preview' : 'Show preview'}
              >
                {previewOpen ? <Eye size={15} /> : <EyeOff size={15} />}
                {previewOpen ? 'Preview on' : 'Preview off'}
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
