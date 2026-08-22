import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  MousePointer2, Monitor, Laptop, Tablet, Smartphone, Ruler,
  Undo2, Redo2, Save, Command, ChevronRight, Loader2, Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useEditorStore, overridesToCss } from '../../editor/editorStore';
import type { DeviceMode } from '../../editor/editorStore';
import { useContent } from '../../context/ContentProvider';
import { supabase } from '../../lib/supabaseClient';
import Inspector from './canvas/Inspector';
import CommandPalette from './canvas/CommandPalette';

const DEVICE_WIDTHS: Record<DeviceMode, number | null> = {
  desktop: null, laptop: 1280, tablet: 834, mobile: 390, custom: 0,
};

const DEVICES: { id: DeviceMode; icon: any; label: string }[] = [
  { id: 'desktop', icon: Monitor, label: 'Desktop' },
  { id: 'laptop', icon: Laptop, label: 'Laptop' },
  { id: 'tablet', icon: Tablet, label: 'Tablet' },
  { id: 'mobile', icon: Smartphone, label: 'Mobile' },
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

export default function Canvas() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { settings } = useContent() as any;

  const enabled = useEditorStore((s) => s.enabled);
  const toggleEnabled = useEditorStore((s) => s.toggleEnabled);
  const setEnabled = useEditorStore((s) => s.setEnabled);
  const device = useEditorStore((s) => s.device);
  const setDevice = useEditorStore((s) => s.setDevice);
  const customWidth = useEditorStore((s) => s.customWidth);
  const setCustomWidth = useEditorStore((s) => s.setCustomWidth);
  const overrides = useEditorStore((s) => s.overrides);
  const content = useEditorStore((s) => s.content);
  const selected = useEditorStore((s) => s.selected);
  const setSelected = useEditorStore((s) => s.setSelected);
  const setContent = useEditorStore((s) => s.setContent);
  const requestSelect = useEditorStore((s) => s.requestSelect);
  const selectRequestId = useEditorStore((s) => s.selectRequestId);
  const setPaletteOpen = useEditorStore((s) => s.setPaletteOpen);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.past.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);

  const [saving, setSaving] = useState(false);

  const post = useCallback((msg: any) => {
    iframeRef.current?.contentWindow?.postMessage(msg, '*');
  }, []);

  const resendAll = useCallback(() => {
    post({ type: 'EDITOR_MODE', enabled });
    post({ type: 'EDITOR_STYLE', css: overridesToCss(overrides) });
    post({ type: 'PREVIEW_OVERRIDE', payload: { settings: content } });
  }, [post, enabled, overrides, content]);

  // Enter edit mode automatically when the Visual Editor opens.
  useEffect(() => {
    setEnabled(true);
    return () => { setEnabled(false); setSelected(null); };
  }, [setEnabled, setSelected]);

  // Receive events from the iframe runtime.
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data || {};
      if (d.type === 'EDITOR_SELECTED') setSelected(d.info);
      else if (d.type === 'EDITOR_CLEARED') setSelected(null);
      else if (d.type === 'EDITOR_CONTENT') setContent(d.path, d.value);
      else if (d.type === 'EDITOR_RUNTIME_READY' || d.type === 'PREVIEW_READY') resendAll();
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [setSelected, setContent, resendAll]);

  // Push state changes down to the iframe.
  useEffect(() => { post({ type: 'EDITOR_MODE', enabled }); }, [enabled, post]);
  useEffect(() => { post({ type: 'EDITOR_STYLE', css: overridesToCss(overrides) }); }, [overrides, post]);
  useEffect(() => { post({ type: 'PREVIEW_OVERRIDE', payload: { settings: content } }); }, [content, post]);
  useEffect(() => {
    if (selectRequestId !== null) {
      post({ type: 'EDITOR_SELECT', id: selectRequestId });
      requestSelect(null);
    }
  }, [selectRequestId, post, requestSelect]);

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen(true); }
      else if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      else if (mod && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo, setPaletteOpen]);

  const handleSave = async () => {
    if (!supabase) { toast.error('Supabase not configured — cannot save.'); return; }
    setSaving(true);
    try {
      const ops: Promise<any>[] = [];
      ops.push(supabase.from('site_settings').upsert({ key: 'editorOverrides', value: overrides }) as any);
      for (const [key, partial] of Object.entries(content)) {
        const merged = deepMerge(settings?.[key] || {}, partial);
        ops.push(supabase.from('site_settings').upsert({ key, value: merged }) as any);
      }
      const results = await Promise.all(ops);
      if (results.some((r: any) => r?.error)) throw new Error('save failed');
      toast.success('Canvas changes published');
    } catch {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const width = device === 'custom' ? customWidth : DEVICE_WIDTHS[device];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-100">
      {/* Toolbar */}
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3">
        <button
          onClick={toggleEnabled}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            enabled ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {enabled ? <MousePointer2 size={14} /> : <Eye size={14} />}
          {enabled ? 'Editing' : 'Enable editing'}
        </button>
        {enabled && (
          <span className="hidden text-[11px] text-slate-400 lg:inline">
            Click an element · double-click text to edit
          </span>
        )}

        <div className="mx-1 h-5 w-px bg-slate-200" />

        {/* Devices */}
        <div className="flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5">
          {DEVICES.map((d) => {
            const Icon = d.icon;
            return (
              <button
                key={d.id}
                onClick={() => setDevice(d.id)}
                title={d.label}
                className={`rounded-md p-1.5 transition-colors ${
                  device === d.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon size={15} />
              </button>
            );
          })}
          <button
            onClick={() => setDevice('custom')}
            title="Custom width"
            className={`rounded-md p-1.5 transition-colors ${
              device === 'custom' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Ruler size={15} />
          </button>
          {device === 'custom' && (
            <input
              type="number"
              value={customWidth}
              onChange={(e) => setCustomWidth(Number(e.target.value) || 0)}
              className="w-16 rounded-md border border-slate-200 px-1.5 py-1 text-xs outline-none"
            />
          )}
        </div>

        <div className="mx-1 h-5 w-px bg-slate-200" />

        <button onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30">
          <Undo2 size={16} />
        </button>
        <button onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30">
          <Redo2 size={16} />
        </button>

        <button
          onClick={() => setPaletteOpen(true)}
          className="ml-1 flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-50"
        >
          <Command size={13} /> Search <kbd className="rounded bg-slate-100 px-1 text-[10px]">Ctrl K</kbd>
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Publishing…' : 'Publish'}
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="flex h-8 shrink-0 items-center gap-1 overflow-x-auto border-b border-slate-200 bg-white/70 px-3 text-[11px] text-slate-500">
        <span className="text-slate-400">Page</span>
        {selected?.breadcrumb?.map((c) => (
          <React.Fragment key={c.id}>
            <ChevronRight size={11} className="text-slate-300" />
            <button
              onClick={() => requestSelect(c.id)}
              className={`rounded px-1.5 py-0.5 hover:bg-slate-100 ${c.id === selected?.id ? 'font-semibold text-blue-600' : ''}`}
            >
              {c.name}
            </button>
          </React.Fragment>
        ))}
        {!selected && enabled && <span className="text-slate-400">· click an element to begin</span>}
      </div>

      {/* Canvas + Inspector */}
      <div className="flex min-h-0 flex-1">
        <div className="flex flex-1 items-start justify-center overflow-auto p-4">
          <div
            className="h-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
            style={{ width: width ? `${width}px` : '100%', maxWidth: '100%' }}
          >
            <iframe
              ref={iframeRef}
              src="/?preview=1"
              onLoad={resendAll}
              title="Canvas"
              className="h-full w-full border-0 bg-white"
            />
          </div>
        </div>

        {enabled && (
          <aside className="w-72 shrink-0 border-l border-slate-200 bg-white">
            <Inspector />
          </aside>
        )}
      </div>

      <CommandPalette />
    </div>
  );
}
