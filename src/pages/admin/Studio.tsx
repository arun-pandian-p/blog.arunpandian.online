import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Monitor, Laptop, Tablet, Smartphone, Save,
  Palette, Layout, Zap, Wand2, Loader2,
  Grid3X3, RefreshCw, X, PanelLeft, PanelRight,
  CheckCircle2, Sparkles, ChevronRight, MousePointer2, Eye,
  Sliders, ShieldCheck, ArrowUpRight
} from 'lucide-react';
import { useThemeStore } from '../../theme/store';
import { useEditorStore } from '../../editor/editorStore';
import { supabase } from '../../lib/supabaseClient';
import { useSiteSettings } from '../../components/admin/hooks/useSiteSettings';
import { useContent } from '../../context/ContentProvider';
import { presets } from '../../theme/presets';
import ThemePanel from './studio/ThemePanel';
import StructurePanel from './studio/StructurePanel';
import ScrollStudio from './studio/ScrollStudio';
import ScraperPanel from './studio/ScraperPanel';

type Tab = 'theme' | 'structure' | 'motion' | 'scraper';
type DeviceKey = 'desktop' | 'laptop' | 'tablet' | 'mobile';

const DEVICES: { id: DeviceKey; icon: any; label: string; width: number | null }[] = [
  { id: 'desktop', icon: Monitor, label: 'Desktop', width: null },
  { id: 'laptop', icon: Laptop, label: 'Laptop', width: 1280 },
  { id: 'tablet', icon: Tablet, label: 'Tablet', width: 834 },
  { id: 'mobile', icon: Smartphone, label: 'Mobile', width: 390 },
];

const RIGHT_TABS: { id: Tab; icon: any; label: string; activeClass: string }[] = [
  { id: 'theme',     icon: Palette,  label: 'Theme',     activeClass: 'text-[#F29F67]' },
  { id: 'structure', icon: Layout,   label: 'Structure', activeClass: 'text-purple-600' },
  { id: 'motion',    icon: Zap,      label: 'Motion',    activeClass: 'text-amber-500' },
  { id: 'scraper',   icon: Wand2,    label: 'Scraper',   activeClass: 'text-emerald-500' },
];

function isPlainObject(x: any) {
  return x && typeof x === 'object' && !Array.isArray(x);
}
function deepMerge(base: any, over: any): any {
  if (!isPlainObject(base) || !isPlainObject(over)) return over === undefined ? base : over;
  const out = { ...base };
  for (const k of Object.keys(over)) {
    out[k] = isPlainObject(base[k]) && isPlainObject(over[k]) ? deepMerge(base[k], over[k]) : over[k];
  }
  return out;
}

// Animated publish toast
function PublishToast({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2800);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-6 py-3.5 bg-[#1E1E2C] text-white rounded-2xl shadow-[8px_8px_20px_rgba(0,0,0,0.25)] border border-[#2E2E44] text-xs font-bold animate-in fade-in slide-in-from-bottom-4 duration-300">
      <CheckCircle2 size={16} className="text-[#34B1AA]" />
      <span>Theme published successfully!</span>
    </div>
  );
}

export default function Studio() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { theme, applyPreset } = useThemeStore();
  const { saveSettings } = useSiteSettings('theme');
  const { settings } = useContent() as any;

  const themeRef = useRef(theme);
  themeRef.current = theme;

  const [isSaving, setIsSaving] = useState(false);
  const [published, setPublished] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('theme');
  const [device, setDevice] = useState<DeviceKey>('desktop');
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  const enabled = useEditorStore((s) => s.enabled);
  const toggleEnabled = useEditorStore((s) => s.toggleEnabled);
  const content = useEditorStore((s) => s.content);
  const setContent = useEditorStore((s) => s.setContent);

  // Push the full theme to the iframe — also retry once after 300 ms
  // in case the iframe's message listener hasn't registered yet.
  const pushTheme = useCallback(() => {
    const send = () =>
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'SYNC_THEME', theme: themeRef.current },
        '*'
      );
    send();
    // Retry after 350ms for slow iframe boots
    const t = setTimeout(send, 350);
    return () => clearTimeout(t);
  }, []);

  // Push on every theme change (real-time)
  useEffect(() => { pushTheme(); }, [theme, pushTheme]);

  // Re-push when user switches device (new canvas size triggers re-layout)
  useEffect(() => { setTimeout(() => pushTheme(), 100); }, [device, pushTheme]);

  // Listen for iframe ready signals and content updates
  useEffect(() => {
    const handle = (e: MessageEvent) => {
      if (e.data?.type === 'THEME_STUDIO_READY') pushTheme();
      else if (e.data?.type === 'EDITOR_CONTENT') setContent(e.data.path, e.data.value);
      else if (e.data?.type === 'PREVIEW_READY' || e.data?.type === 'EDITOR_RUNTIME_READY') {
        pushTheme();
        iframeRef.current?.contentWindow?.postMessage({ type: 'EDITOR_MODE', enabled }, '*');
      }
    };
    window.addEventListener('message', handle);
    return () => window.removeEventListener('message', handle);
  }, [pushTheme, enabled, setContent]);

  // Push editor mode when it changes
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'EDITOR_MODE', enabled }, '*');
  }, [enabled]);

  const handleIframeLoad = () => {
    pushTheme();
    iframeRef.current?.contentWindow?.postMessage({ type: 'EDITOR_MODE', enabled }, '*');
  };

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      await saveSettings(theme);
      
      // Save content overrides if any
      if (supabase && Object.keys(content).length > 0) {
        const ops: Promise<any>[] = [];
        for (const [key, partial] of Object.entries(content)) {
          const merged = deepMerge(settings?.[key] || {}, partial);
          ops.push(supabase.from('site_settings').upsert({ key, value: merged }) as any);
        }
        await Promise.all(ops);
      }
      
      setPublished(true);
    } finally {
      setIsSaving(false);
    }
  };

  const deviceWidth = DEVICES.find((d) => d.id === device)?.width;
  const canvasWidth = deviceWidth ? `${deviceWidth}px` : '100%';

  // Detect which preset is currently active
  const activePresetName = Object.entries(presets).find(([, p]) =>
    p.colors.primary === theme.colors.primary &&
    p.colors.background === theme.colors.background
  )?.[0] ?? null;

  return (
    <div className="flex h-full w-full bg-[#EBF0F7] text-slate-800 font-sans select-none overflow-hidden p-2 sm:p-3 gap-3">

      {/* ── LEFT PANEL — Neumorphic Navigation & Quick Presets ── */}
      {leftOpen && (
        <aside className="w-56 bg-[#EEF2F8] rounded-3xl p-3 flex flex-col shrink-0 z-20 shadow-[6px_6px_14px_#D0D7E3,-6px_-6px_14px_#FFFFFF] border border-white/60">
          
          {/* Brand header */}
          <div className="flex items-center justify-between px-2 py-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-xl bg-gradient-to-br from-[#F29F67] to-[#E8824A] shadow-[2px_2px_5px_rgba(242,159,103,0.4)] flex items-center justify-center text-white font-bold text-xs">
                ✦
              </div>
              <span className="text-xs font-black text-[#1E1E2C] tracking-tight">Design OS</span>
            </div>
            <button
              onClick={() => setLeftOpen(false)}
              className="p-1.5 rounded-xl bg-[#EEF2F8] text-slate-400 hover:text-slate-700 shadow-[3px_3px_6px_#D0D7E3,-3px_-3px_6px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#D0D7E3,inset_-2px_-2px_4px_#FFFFFF] transition-all cursor-pointer"
              title="Close Panel"
            >
              <PanelLeft size={13} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Section jump nav */}
            <div>
              <div className="px-2 pb-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Jump to Section
              </div>
              <div className="space-y-1">
                {[
                  { anchor: '#hero',     label: 'Hero',       dot: 'bg-[#F29F67]' },
                  { anchor: '#about',    label: 'About',      dot: 'bg-purple-500' },
                  { anchor: '#skills',   label: 'Skills',     dot: 'bg-[#E0B50F]' },
                  { anchor: '#timeline', label: 'Experience', dot: 'bg-[#34B1AA]' },
                  { anchor: '#projects', label: 'Projects',   dot: 'bg-rose-500' },
                  { anchor: '#blog',     label: 'Blog',       dot: 'bg-[#3B8FF3]' },
                  { anchor: 'footer',    label: 'Footer',     dot: 'bg-slate-500' },
                ].map(({ anchor, label, dot }) => (
                  <button
                    key={anchor}
                    onClick={() => iframeRef.current?.contentWindow?.postMessage({ type: 'PREVIEW_SCROLL', anchor }, '*')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#1E1E2C] rounded-xl bg-[#EEF2F8] hover:shadow-[3px_3px_6px_#D0D7E3,-3px_-3px_6px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#D0D7E3,inset_-2px_-2px_4px_#FFFFFF] transition-all text-left cursor-pointer"
                  >
                    <span className={`h-2 w-2 rounded-full shrink-0 ${dot}`} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick preset access */}
            <div>
              <div className="px-2 pb-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Theme Presets
              </div>
              <div className="space-y-1">
                {Object.entries(presets).slice(0, 8).map(([name, preset]) => {
                  const isActive = activePresetName === name;
                  return (
                    <button
                      key={name}
                      onClick={() => applyPreset(name)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-all text-left rounded-xl cursor-pointer ${
                        isActive
                          ? 'text-[#F29F67] font-bold shadow-[inset_3px_3px_6px_#CBD5E1,inset_-3px_-3px_6px_#FFFFFF] bg-[#E8EDF5]'
                          : 'text-slate-600 hover:text-slate-900 shadow-[3px_3px_6px_#D0D7E3,-3px_-3px_6px_#FFFFFF] hover:shadow-[4px_4px_8px_#D0D7E3,-4px_-4px_8px_#FFFFFF] bg-[#EEF2F8]'
                      }`}
                    >
                      <span className="flex gap-0.5 shrink-0">
                        {[preset.colors.background, preset.colors.primary, preset.colors.text].map((c, i) => (
                          <span key={i} className="h-2.5 w-2.5 rounded-full border border-black/10 shadow-xs" style={{ background: c }} />
                        ))}
                      </span>
                      <span className="truncate">{name.split(' (')[0]}</span>
                      {isActive && <ChevronRight size={12} className="ml-auto text-[#F29F67] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom: current palette preview */}
          <div className="pt-3 border-t border-slate-200/60 mt-2">
            <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-2 px-1">Active Palette</div>
            <div className="flex gap-1 p-1.5 rounded-xl bg-[#E8EDF5] shadow-[inset_2px_2px_4px_#D0D7E3,inset_-2px_-2px_4px_#FFFFFF]">
              {[theme.colors.background, theme.colors.primary, theme.colors.surface, theme.colors.text, theme.colors.muted, theme.colors.border].map((c, i) => (
                <span key={i} className="flex-1 h-4 rounded-md shadow-xs" style={{ background: c }} title={c} />
              ))}
            </div>
          </div>
        </aside>
      )}

      {/* ── CENTER WORKSPACE ── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0 gap-3">

        {/* Top Neumorphic Toolbar Header */}
        <header className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#EEF2F8] rounded-2xl shadow-[6px_6px_12px_#D0D7E3,-6px_-6px_12px_#FFFFFF] border border-white/60 shrink-0">
          
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            {!leftOpen && (
              <button
                onClick={() => setLeftOpen(true)}
                className="p-2 rounded-xl bg-[#EEF2F8] text-slate-500 hover:text-slate-800 shadow-[3px_3px_6px_#D0D7E3,-3px_-3px_6px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#D0D7E3,inset_-2px_-2px_4px_#FFFFFF] transition-all cursor-pointer"
                title="Open Navigation"
              >
                <PanelLeft size={14} />
              </button>
            )}

            {/* Editing / Preview Mode Toggle */}
            <button
              onClick={toggleEnabled}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                enabled
                  ? 'bg-[#F29F67] text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.15)]'
                  : 'bg-[#EEF2F8] text-slate-600 shadow-[3px_3px_6px_#D0D7E3,-3px_-3px_6px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#D0D7E3,inset_-2px_-2px_4px_#FFFFFF]'
              }`}
            >
              {enabled ? <MousePointer2 size={13} /> : <Eye size={13} />}
              <span>{enabled ? 'Editing Mode' : 'Preview'}</span>
            </button>
          </div>

          {/* Center: Neumorphic Device Switcher Capsule */}
          <div className="flex items-center p-1 bg-[#E8EDF5] rounded-2xl shadow-[inset_3px_3px_6px_#D0D7E3,inset_-3px_-3px_6px_#FFFFFF]">
            {DEVICES.map(({ id, icon: Icon, label }) => {
              const isSelected = device === id;
              return (
                <button
                  key={id}
                  onClick={() => setDevice(id)}
                  title={label}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#EEF2F8] text-[#F29F67] shadow-[3px_3px_6px_#D0D7E3,-3px_-3px_6px_#FFFFFF]'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Icon size={14} />
                </button>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIframeKey((k) => k + 1)}
              className="p-2 rounded-xl bg-[#EEF2F8] text-slate-500 hover:text-slate-800 shadow-[3px_3px_6px_#D0D7E3,-3px_-3px_6px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#D0D7E3,inset_-2px_-2px_4px_#FFFFFF] transition-all cursor-pointer"
              title="Refresh Preview"
            >
              <RefreshCw size={14} />
            </button>

            {/* Publish Theme Button */}
            <button
              onClick={handlePublish}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#F29F67] to-[#E8824A] text-white text-xs font-extrabold shadow-[4px_4px_10px_rgba(242,159,103,0.4),-2px_-2px_6px_#FFFFFF] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              <span>{isSaving ? 'Saving...' : 'Publish'}</span>
            </button>

            {!rightOpen && (
              <button
                onClick={() => setRightOpen(true)}
                className="p-2 rounded-xl bg-[#EEF2F8] text-slate-500 hover:text-slate-800 shadow-[3px_3px_6px_#D0D7E3,-3px_-3px_6px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#D0D7E3,inset_-2px_-2px_4px_#FFFFFF] transition-all cursor-pointer"
                title="Open Settings Inspector"
              >
                <PanelRight size={14} />
              </button>
            )}
          </div>
        </header>

        {/* ── Neumorphic Frame & Embedded Live Viewport ── */}
        <div className="flex-1 min-h-0 bg-[#E8EDF5] rounded-3xl p-3 shadow-[inset_6px_6px_14px_#D0D7E3,inset_-6px_-6px_14px_#FFFFFF] border border-white/60 flex flex-col items-center justify-center overflow-hidden relative">
          
          <div
            style={{ width: canvasWidth }}
            className="h-full bg-white rounded-2xl overflow-hidden shadow-[8px_8px_20px_#D0D7E3,-8px_-8px_20px_#FFFFFF] border border-slate-200 transition-all duration-300 flex flex-col"
          >
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src="/?preview=1"
              onLoad={handleIframeLoad}
              className="w-full h-full border-0"
              title="Design OS Preview"
            />
          </div>

          {/* Bottom Status Bar */}
          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-[11px] font-mono text-slate-500 pointer-events-none">
            <span className="bg-[#EEF2F8]/90 backdrop-blur px-2.5 py-1 rounded-lg shadow-sm border border-white/80">
              {device === 'desktop' ? 'Full Width Responsive' : `${canvasWidth} Canvas`}
            </span>
            <span className="bg-[#EEF2F8]/90 backdrop-blur px-2.5 py-1 rounded-lg shadow-sm border border-white/80 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34B1AA] animate-pulse" />
              Design OS · Live Sync
            </span>
          </div>
        </div>

      </main>

      {/* ── RIGHT PANEL — Neumorphic Customization Inspector ── */}
      {rightOpen && (
        <aside className="w-80 bg-[#EEF2F8] rounded-3xl p-3 flex flex-col shrink-0 z-20 shadow-[6px_6px_14px_#D0D7E3,-6px_-6px_14px_#FFFFFF] border border-white/60">
          
          {/* Top Tab Bar (Neumorphic Segmented Capsule) */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
            <div className="flex items-center gap-1 p-1 bg-[#E8EDF5] rounded-2xl shadow-[inset_2px_2px_4px_#D0D7E3,inset_-2px_-2px_4px_#FFFFFF]">
              {RIGHT_TABS.map(({ id, icon: Icon, label, activeClass }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      isActive
                        ? `bg-[#EEF2F8] ${activeClass} shadow-[2px_2px_5px_#D0D7E3,-2px_-2px_5px_#FFFFFF]`
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <Icon size={12} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setRightOpen(false)}
              className="p-1.5 rounded-xl bg-[#EEF2F8] text-slate-400 hover:text-slate-700 shadow-[3px_3px_6px_#D0D7E3,-3px_-3px_6px_#FFFFFF] active:shadow-[inset_2px_2px_4px_#D0D7E3,inset_-2px_-2px_4px_#FFFFFF] transition-all cursor-pointer"
              title="Close Inspector"
            >
              <PanelRight size={13} />
            </button>
          </div>

          {/* Active Tab Body */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            {activeTab === 'theme' && <ThemePanel />}
            {activeTab === 'structure' && <StructurePanel />}
            {activeTab === 'motion' && <ScrollStudio />}
            {activeTab === 'scraper' && <ScraperPanel />}
          </div>
        </aside>
      )}

      {published && <PublishToast onClose={() => setPublished(false)} />}
    </div>
  );
}
