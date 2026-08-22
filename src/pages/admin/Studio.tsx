import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Monitor, Laptop, Tablet, Smartphone, Save,
  Palette, Layout, Zap, Wand2, Loader2,
  Grid3X3, RefreshCw, X, PanelLeft, PanelRight,
  CheckCircle2, Sparkles, ChevronRight, MousePointer2, Eye
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
  { id: 'theme',     icon: Palette,  label: 'Theme',     activeClass: 'text-blue-600 border-blue-500' },
  { id: 'structure', icon: Layout,   label: 'Structure', activeClass: 'text-purple-600 border-purple-500' },
  { id: 'motion',    icon: Zap,      label: 'Motion',    activeClass: 'text-amber-600 border-amber-500' },
  { id: 'scraper',   icon: Wand2,    label: 'Scraper',   activeClass: 'text-emerald-600 border-emerald-500' },
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-300">
      <CheckCircle2 size={16} className="text-emerald-400" />
      Theme published successfully!
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

  // Push the full theme to the iframe
  const pushTheme = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'SYNC_THEME', theme: themeRef.current },
      '*'
    );
  }, []);

  // Push on every theme change (real-time)
  useEffect(() => { pushTheme(); }, [theme, pushTheme]);

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

  // Detect which preset is currently active for the left panel quick access
  const activePresetName = Object.entries(presets).find(([, p]) =>
    p.colors.primary === theme.colors.primary &&
    p.colors.background === theme.colors.background
  )?.[0] ?? null;

  return (
    <div className="flex h-full w-full bg-slate-100/80 overflow-hidden select-none">

      {/* ── LEFT PANEL — Navigation + Quick Presets ── */}
      {leftOpen && (
        <aside className="w-52 bg-white border-r border-slate-200/80 flex flex-col shrink-0 z-20 shadow-[1px_0_0_0_rgba(0,0,0,0.04)]">
          {/* Brand header */}
          <div className="flex items-center justify-between px-3.5 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-md bg-gradient-to-br from-blue-500 to-violet-600 shadow-sm" />
              <span className="text-[12px] font-bold text-slate-800 tracking-tight">Design OS</span>
            </div>
            <button
              onClick={() => setLeftOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
              <PanelLeft size={13} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {/* Section jump nav */}
            <div className="px-3 pt-1.5 pb-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">Navigate</span>
            </div>
            {[
              { anchor: '#hero',     label: 'Hero',       dot: 'bg-blue-500' },
              { anchor: '#about',    label: 'About',      dot: 'bg-purple-500' },
              { anchor: '#skills',   label: 'Skills',     dot: 'bg-amber-500' },
              { anchor: '#timeline', label: 'Experience', dot: 'bg-emerald-500' },
              { anchor: '#projects', label: 'Projects',   dot: 'bg-red-400' },
              { anchor: '#blog',     label: 'Blog',       dot: 'bg-cyan-500' },
              { anchor: 'footer',    label: 'Footer',     dot: 'bg-slate-400' },
            ].map(({ anchor, label, dot }) => (
              <button
                key={anchor}
                onClick={() => iframeRef.current?.contentWindow?.postMessage({ type: 'PREVIEW_SCROLL', anchor }, '*')}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[11px] text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all text-left rounded-lg mx-0.5"
              >
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dot}`} />
                {label}
              </button>
            ))}

            {/* Quick preset access */}
            <div className="px-3 pt-4 pb-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">Presets</span>
            </div>
            {Object.entries(presets).slice(0, 8).map(([name, preset]) => {
              const isActive = activePresetName === name;
              return (
                <button
                  key={name}
                  onClick={() => applyPreset(name)}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-[11px] transition-all text-left rounded-lg mx-0.5 ${
                    isActive
                      ? 'text-blue-600 bg-blue-50 font-semibold'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {/* Mini color dot group */}
                  <span className="flex gap-0.5 shrink-0">
                    {[preset.colors.background, preset.colors.primary, preset.colors.text].map((c, i) => (
                      <span key={i} className="h-2.5 w-2.5 rounded-full border border-black/10" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="truncate">{name.split(' (')[0]}</span>
                  {isActive && <ChevronRight size={10} className="ml-auto text-blue-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Bottom: current palette preview */}
          <div className="p-3 border-t border-slate-100">
            <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2">Active Palette</div>
            <div className="flex gap-1">
              {[theme.colors.background, theme.colors.primary, theme.colors.surface, theme.colors.text, theme.colors.muted, theme.colors.border].map((c, i) => (
                <span key={i} className="flex-1 h-4 rounded border border-black/8 shadow-sm" style={{ background: c }} title={c} />
              ))}
            </div>
          </div>
        </aside>
      )}

      {/* ── CENTER ── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top Toolbar */}
        <header className="flex items-center gap-2 px-3 h-11 bg-white border-b border-slate-200/80 shrink-0 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
          {/* Left — toggle sidebar & editing */}
          <div className="flex items-center gap-2">
            {!leftOpen && (
              <button
                onClick={() => setLeftOpen(true)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all"
              >
                <PanelLeft size={14} />
              </button>
            )}
            {!leftOpen && <div className="h-4 w-px bg-slate-200 mx-1" />}
            
            <button
              onClick={toggleEnabled}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors ${
                enabled ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              {enabled ? <MousePointer2 size={13} /> : <Eye size={13} />}
              {enabled ? 'Editing' : 'Preview'}
            </button>
          </div>

          {/* Center: Device switcher */}
          <div className="flex-1 flex items-center justify-center gap-0.5">
            <div className="flex items-center gap-0.5 bg-slate-100 rounded-xl p-1">
              {DEVICES.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setDevice(id)}
                  title={label}
                  className={`p-1.5 rounded-lg transition-all ${
                    device === id
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon size={13} />
                </button>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIframeKey(k => k + 1)}
              title="Refresh preview"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              <RefreshCw size={13} />
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <button
              onClick={handlePublish}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 text-white text-[11px] font-bold transition-all shadow-sm shadow-emerald-500/30 active:scale-95"
            >
              {isSaving
                ? <><Loader2 size={12} className="animate-spin" /> Saving…</>
                : <><Save size={12} /> Publish</>
              }
            </button>
            {!rightOpen && (
              <button
                onClick={() => setRightOpen(true)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all ml-1"
              >
                <PanelRight size={14} />
              </button>
            )}
          </div>
        </header>

        {/* Canvas Area */}
        <div
          className="flex-1 overflow-auto flex items-start justify-center p-6"
          style={{
            background: '#f1f5f9',
            backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        >
          <div
            className="relative bg-white overflow-hidden transition-all duration-300"
            style={{
              width: canvasWidth,
              maxWidth: canvasWidth,
              minHeight: '100%',
              borderRadius: device === 'mobile' ? '32px' : '10px',
              boxShadow: device === 'mobile'
                ? '0 0 0 8px #1a1a1a, 0 24px 80px rgba(0,0,0,0.25)'
                : '0 0 0 1px rgba(0,0,0,0.06), 0 20px 60px rgba(0,0,0,0.14)',
            }}
          >
            {/* Mobile notch */}
            {device === 'mobile' && (
              <div className="absolute top-0 inset-x-0 flex justify-center z-10 pointer-events-none">
                <div className="h-7 w-28 bg-[#1a1a1a] rounded-b-3xl" />
              </div>
            )}
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src="/?preview=1"
              onLoad={handleIframeLoad}
              className="w-full border-0"
              style={{
                height: device === 'mobile' ? '844px' : device === 'tablet' ? '1024px' : '100vh',
                minHeight: '600px',
                paddingTop: device === 'mobile' ? '28px' : undefined,
              }}
              title="Design OS Preview"
            />
          </div>
        </div>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 h-6 bg-white border-t border-slate-200/80 shrink-0">
          <div className="flex items-center gap-3 text-[9px] text-slate-400">
            <span className="font-mono">{device === 'desktop' ? 'Full Width' : `${deviceWidth}px`}</span>
            <span>·</span>
            <span className="text-slate-500 font-medium">
              {activePresetName ? activePresetName.split(' (')[0] : 'Custom'} palette
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
            <Sparkles size={9} className="text-blue-400" />
            <span>Design OS · Live Preview</span>
          </div>
        </footer>
      </main>

      {/* ── RIGHT PANEL — Theme Controls ── */}
      {rightOpen && (
        <aside className="w-72 bg-white border-l border-slate-200/80 flex flex-col shrink-0 z-20 shadow-[-1px_0_0_0_rgba(0,0,0,0.04)]">
          {/* Tab Bar */}
          <div className="flex items-center border-b border-slate-100 px-1 pt-1 gap-0.5 shrink-0 bg-white">
            {RIGHT_TABS.map(({ id, icon: Icon, label, activeClass }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-t-lg border-b-2 transition-all text-[9px] font-bold uppercase tracking-wider ${
                  activeTab === id
                    ? `bg-slate-50 ${activeClass}`
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
            <button
              onClick={() => setRightOpen(false)}
              className="ml-1 px-2 pb-1 text-slate-300 hover:text-slate-600 transition-colors self-start mt-1.5"
            >
              <X size={11} />
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {activeTab === 'theme'     && <ThemePanel />}
            {activeTab === 'structure' && <StructurePanel />}
            {activeTab === 'motion'    && <ScrollStudio />}
            {activeTab === 'scraper'   && <ScraperPanel />}
          </div>
        </aside>
      )}

      {/* Publish toast */}
      {published && <PublishToast onClose={() => setPublished(false)} />}
    </div>
  );
}
