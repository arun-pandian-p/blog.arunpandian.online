import React, { useState, useMemo } from 'react';
import { useEditorStore } from '../../../editor/editorStore';
import { Type, LayoutGrid, Paintbrush, MousePointerClick, FileText, Sparkles, RotateCcw, Trash2, Plus, Search, Sliders, Maximize2 } from 'lucide-react';
import { FONTS, FONT_CATEGORIES } from '../../../editor/fonts';

type Tab = 'content' | 'type' | 'layout' | 'style' | 'effects';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'type', label: 'Type', icon: Type },
  { id: 'layout', label: 'Layout', icon: LayoutGrid },
  { id: 'style', label: 'Style', icon: Paintbrush },
  { id: 'effects', label: 'Effects', icon: MousePointerClick },
];

function rgbToHex(input: string): string {
  if (!input) return '#000000';
  if (input.startsWith('#')) return input;
  const m = input.match(/rgba?\(([^)]+)\)/);
  if (!m) return '#000000';
  const [r, g, b] = m[1].split(',').map((n) => parseInt(n.trim(), 10));
  const hex = (n: number) => Math.max(0, Math.min(255, n || 0)).toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

function numStr(v: string): string {
  if (!v) return '';
  const n = parseFloat(v);
  return Number.isFinite(n) ? String(Math.round(n * 100) / 100) : '';
}

function getContentAt(content: any, path: string) {
  return path.split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), content);
}

// Element loop animations
const ELEMENT_ANIMATIONS: { label: string; value: string }[] = [
  { label: 'None', value: '' },
  { label: 'Float — drinkjoyrush.com', value: 'vs-float 4s ease-in-out infinite' },
  { label: 'Bounce — drinkjoyrush.com', value: 'vs-bounce 2.4s ease-in-out infinite' },
  { label: 'Spin slow — k95.it', value: 'vs-spin 12s linear infinite' },
  { label: 'Pulse — rideradian.com', value: 'vs-pulse 2s ease-in-out infinite' },
  { label: 'Glitch — Retro Cyber', value: 'vs-glitch 1.6s steps(2) infinite' },
  { label: 'Wiggle — juliencalot.com', value: 'vs-wiggle 1.2s ease-in-out infinite' },
];

function hoverScalePct(v?: string): string {
  const m = String(v || '').match(/scale\(([\d.]+)\)/);
  return m ? String(Math.round(parseFloat(m[1]) * 100)) : '';
}

// Module-scope control rows
const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3 py-1.5">
    <label className="w-24 shrink-0 text-xs text-slate-500">{label}</label>
    <div className="flex flex-1 items-center justify-end gap-2">{children}</div>
  </div>
);

const Group: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border-b border-slate-100 px-4 py-3">
    <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{title}</div>
    {children}
  </div>
);

const NumRow: React.FC<{ label: string; value: string; unit?: string; onSet: (v: string | null) => void; min?: number; max?: number; step?: number }> = ({ label, value, unit = 'px', onSet, min, max, step }) => (
  <Row label={label}>
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onSet(e.target.value === '' ? null : `${e.target.value}${unit}`)}
      className="w-20 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-blue-500"
    />
    <span className="w-5 text-[10px] text-slate-400">{unit}</span>
  </Row>
);

const ColorRow: React.FC<{ label: string; value: string; onSet: (v: string | null) => void }> = ({ label, value, onSet }) => (
  <Row label={label}>
    <input
      type="text"
      value={value}
      onChange={(e) => onSet(e.target.value || null)}
      className="w-24 rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-700 outline-none focus:border-blue-500"
    />
    <input
      type="color"
      value={rgbToHex(value)}
      onChange={(e) => onSet(e.target.value)}
      className="h-7 w-7 shrink-0 cursor-pointer rounded border border-slate-200 p-0"
    />
  </Row>
);

const FontRow: React.FC<{ value: string; onSet: (v: string | null) => void }> = ({ value, onSet }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return FONTS.filter((f) => {
      const matchCat = categoryFilter === 'all' || f.cat === categoryFilter;
      const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, categoryFilter]);

  return (
    <div className="space-y-2 py-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-slate-500">Font Family</label>
        <span className="text-[10px] text-slate-400">{filtered.length} fonts</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-2 top-2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search fonts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-6 pr-2 py-1 text-xs border border-slate-200 rounded-md outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-[11px] border border-slate-200 rounded-md px-1.5 py-1 text-slate-600 outline-none"
        >
          <option value="all">All</option>
          {FONT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <select
        value={value}
        onChange={(e) => onSet(e.target.value || null)}
        className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500 font-sans"
        size={4}
      >
        <option value="">Default (Inherit)</option>
        {filtered.map((f) => (
          <option key={f.name} value={f.stack}>
            {f.name} ({f.cat})
          </option>
        ))}
      </select>
    </div>
  );
};

const SelectRow: React.FC<{ label: string; value: string; options: { label: string; value: string }[] | string[]; onSet: (v: string | null) => void }> = ({ label, value, options, onSet }) => (
  <Row label={label}>
    <select
      value={value}
      onChange={(e) => onSet(e.target.value || null)}
      className="w-36 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-blue-500"
    >
      <option value="">—</option>
      {options.map((o) => {
        const val = typeof o === 'string' ? o : o.value;
        const lbl = typeof o === 'string' ? o : o.label;
        return <option key={val} value={val}>{lbl}</option>;
      })}
    </select>
  </Row>
);

export default function Inspector() {
  const selected = useEditorStore((s) => s.selected);
  const overrides = useEditorStore((s) => s.overrides);
  const content = useEditorStore((s) => s.content);
  const setStyle = useEditorStore((s) => s.setStyle);
  const setContent = useEditorStore((s) => s.setContent);
  const clearElementStyles = useEditorStore((s) => s.clearElementStyles);
  const [tab, setTab] = useState<Tab>('content');

  if (!selected) {
    return <NoSelectionPanel />;
  }

  const id = selected.id;
  const raw = (prop: string) => overrides[id]?.[prop] ?? selected.computed[prop] ?? '';
  const set = (prop: string) => (v: string | null) => setStyle(id, prop, v);

  const contentValue =
    (selected.path ? getContentAt(content, selected.path) : undefined) ?? selected.text ?? '';

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 px-4 py-3 bg-white">
        <div className="flex items-center justify-between gap-1.5">
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-slate-900">{selected.name}</div>
            <div className="truncate text-[11px] font-mono text-slate-400">
              {selected.kind.toUpperCase()}{selected.path ? ` · ${selected.path}` : ''}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {id.startsWith('custom_el_') && (
              <button
                onClick={() => {
                  useEditorStore.getState().deleteCustomElement(id);
                }}
                title="Delete this custom element"
                className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-600 hover:bg-red-100 transition-colors"
              >
                Delete
              </button>
            )}
            <button
              onClick={() => clearElementStyles(id)}
              title="Reset this element's style overrides"
              className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 border-b border-slate-200 bg-slate-50/70">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-colors cursor-pointer ${
                tab === t.id ? 'text-blue-600 bg-white border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-white">
        {tab === 'content' && (
          <Group title="Element Content">
            {selected.path ? (
              selected.kind === 'image' ? (
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 font-medium">Image Source URL</label>
                  <input
                    type="text"
                    placeholder="https://... image URL"
                    value={String(contentValue)}
                    onChange={(e) => setContent(selected.path!, e.target.value)}
                    className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-500 font-medium">Text Content</label>
                    <textarea
                      rows={4}
                      value={String(contentValue)}
                      onChange={(e) => setContent(selected.path!, e.target.value)}
                      className="w-full resize-y rounded-md border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                  {(() => {
                    const p = selected.path;
                    let linkPath = null;
                    if (p === 'navbar.ctaLabel') linkPath = 'navbar.ctaHref';
                    else if (p === 'hero.primaryCta.label') linkPath = 'hero.primaryCta.href';
                    else if (p === 'hero.secondaryCta.label') linkPath = 'hero.secondaryCta.href';
                    else if (p.startsWith('navbar.links.') && p.endsWith('.name')) linkPath = p.replace('.name', '.href');
                    else if (p.startsWith('custom_elements.') && p.endsWith('.value')) {
                      const elId = p.split('.')[1];
                      const customEl = content.custom_elements?.[elId];
                      if (customEl && (customEl.kind === 'button' || customEl.kind === 'link')) {
                        linkPath = `custom_elements.${elId}.href`;
                      }
                    }

                    if (linkPath) {
                      const linkVal = (linkPath.split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), content)) ?? '';
                      return (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase block">Link Destination (URL / Hash)</label>
                          <input
                            type="text"
                            placeholder="e.g. #projects, /resume.pdf or https://..."
                            value={String(linkVal)}
                            onChange={(e) => setContent(linkPath, e.target.value)}
                            className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
                          />
                        </div>
                      );
                    }
                    return null;
                  })()}
                </>
              )
            ) : (
              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-blue-900 leading-relaxed">
                <span className="font-bold block mb-1">💡 Double-Click to Edit</span>
                Double-click this text on the canvas to edit it live directly in place with Figma-like real-time synchronization.
              </div>
            )}
          </Group>
        )}

        {tab === 'type' && (
          <>
            <Group title="Font & Typography">
              <FontRow value={raw('font-family')} onSet={set('font-family')} />
              <NumRow label="Size" value={numStr(raw('font-size'))} onSet={set('font-size')} />
              <SelectRow label="Weight" value={raw('font-weight')} onSet={set('font-weight')} options={['100', '200', '300', '400', '500', '600', '700', '800', '900']} />
            </Group>
            <Group title="Spacing & Flow">
              <NumRow label="Letter Spacing" value={numStr(raw('letter-spacing'))} onSet={set('letter-spacing')} step={0.5} />
              <NumRow label="Line Height" value={numStr(raw('line-height'))} onSet={set('line-height')} step={0.1} />
            </Group>
            <Group title="Appearance & Alignment">
              <SelectRow label="Align" value={raw('text-align')} onSet={set('text-align')} options={['left', 'center', 'right', 'justify']} />
              <SelectRow label="Transform" value={raw('text-transform')} onSet={set('text-transform')} options={['none', 'uppercase', 'lowercase', 'capitalize']} />
              <ColorRow label="Text Color" value={raw('color')} onSet={set('color')} />
            </Group>
          </>
        )}

        {tab === 'layout' && (
          <>
            <Group title="Size & Dimensions">
              <NumRow label="Width" value={numStr(raw('width'))} onSet={set('width')} />
              <NumRow label="Height" value={numStr(raw('height'))} onSet={set('height')} />
              <NumRow label="Max Width" value={numStr(raw('max-width'))} onSet={set('max-width')} />
              <NumRow label="Min Height" value={numStr(raw('min-height'))} onSet={set('min-height')} />
              <SelectRow
                label="Aspect Ratio"
                value={raw('aspect-ratio')}
                onSet={set('aspect-ratio')}
                options={['auto', '1 / 1', '16 / 9', '4 / 3', '3 / 2', '21 / 9']}
              />
            </Group>
            <Group title="Scale & Transform">
              <Row label="Scale Factor">
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={(() => {
                    const m = String(raw('transform') || '').match(/scale\(([\d.]+)\)/);
                    return m ? m[1] : '1';
                  })()}
                  onChange={(e) => {
                    const val = e.target.value;
                    set('transform')(val === '1' ? null : `scale(${val})`);
                  }}
                  className="w-28 cursor-pointer"
                />
              </Row>
            </Group>
            <Group title="Padding">
              <NumRow label="Top" value={numStr(raw('padding-top'))} onSet={set('padding-top')} />
              <NumRow label="Right" value={numStr(raw('padding-right'))} onSet={set('padding-right')} />
              <NumRow label="Bottom" value={numStr(raw('padding-bottom'))} onSet={set('padding-bottom')} />
              <NumRow label="Left" value={numStr(raw('padding-left'))} onSet={set('padding-left')} />
            </Group>
            <Group title="Margin">
              <NumRow label="Top" value={numStr(raw('margin-top'))} onSet={set('margin-top')} />
              <NumRow label="Right" value={numStr(raw('margin-right'))} onSet={set('margin-right')} />
              <NumRow label="Bottom" value={numStr(raw('margin-bottom'))} onSet={set('margin-bottom')} />
              <NumRow label="Left" value={numStr(raw('margin-left'))} onSet={set('margin-left')} />
            </Group>
            <Group title="Display & Alignment">
              <SelectRow label="Display" value={raw('display')} onSet={set('display')} options={['block', 'flex', 'inline-flex', 'grid', 'inline-block', 'none']} />
            </Group>
          </>
        )}

        {tab === 'style' && (
          <>
            <Group title="Background">
              <ColorRow label="Background" value={raw('background-color')} onSet={set('background-color')} />
            </Group>
            <Group title="Borders & Corners">
              <NumRow label="Border Width" value={numStr(raw('border-top-width'))} onSet={set('border-width')} />
              <ColorRow label="Border Color" value={raw('border-color')} onSet={set('border-color')} />
              <NumRow label="Corner Radius" value={numStr(raw('border-radius'))} onSet={set('border-radius')} />
            </Group>
            <Group title="Shadow & Opacity">
              <NumRow label="Opacity" value={raw('opacity')} unit="" onSet={set('opacity')} min={0} max={1} step={0.05} />
              <SelectRow
                label="Shadow"
                value={raw('box-shadow')}
                onSet={set('box-shadow')}
                options={[
                  { label: 'None', value: 'none' },
                  { label: 'Subtle', value: '0 1px 3px rgba(0,0,0,0.1)' },
                  { label: 'Medium', value: '0 4px 12px rgba(0,0,0,0.12)' },
                  { label: 'Large Floating', value: '0 12px 28px rgba(0,0,0,0.15)' },
                  { label: '2XL Elevated', value: '0 24px 48px rgba(0,0,0,0.22)' },
                  { label: 'Color Accent Glow', value: '0 0 24px var(--color-primary)' },
                ]}
              />
            </Group>
          </>
        )}

        {tab === 'effects' && (() => {
          const ov = overrides[id] || {};
          const ensureTransition = () => {
            if (!(overrides[id] || {})['transition']) {
              setStyle(id, 'transition', 'all 0.3s cubic-bezier(0.16,1,0.3,1)');
            }
          };
          return (
            <>
              <Group title="Loop animation">
                <Row label="Animation">
                  <select
                    value={ov['animation'] ?? ''}
                    onChange={(e) => set('animation')(e.target.value || null)}
                    className="w-44 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-blue-500"
                  >
                    {ELEMENT_ANIMATIONS.map((a) => (
                      <option key={a.label} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </Row>
              </Group>
              <Group title="Hover effects">
                <NumRow
                  label="Scale %"
                  unit="%"
                  value={hoverScalePct(ov['hover:transform'])}
                  onSet={(v) => {
                    const pct = v === null ? NaN : parseFloat(v);
                    set('hover:transform')(Number.isFinite(pct) ? `scale(${(pct / 100).toFixed(2)})` : null);
                    ensureTransition();
                  }}
                />
                <NumRow
                  label="Lift"
                  value={numStr(String(ov['hover:translate'] ?? '').replace(/0\s+-?/, ''))}
                  onSet={(v) => {
                    set('hover:translate')(v === null ? null : `0 -${parseFloat(v)}px`);
                    ensureTransition();
                  }}
                />
                <ColorRow
                  label="Text color"
                  value={ov['hover:color'] ?? ''}
                  onSet={(v) => { set('hover:color')(v); ensureTransition(); }}
                />
                <ColorRow
                  label="Background"
                  value={ov['hover:background-color'] ?? ''}
                  onSet={(v) => { set('hover:background-color')(v); ensureTransition(); }}
                />
                <Row label="Glow">
                  <select
                    value={ov['hover:box-shadow'] ?? ''}
                    onChange={(e) => { set('hover:box-shadow')(e.target.value || null); ensureTransition(); }}
                    className="w-44 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-blue-500"
                  >
                    <option value="">None</option>
                    <option value="0 0 15px var(--color-primary)">Neon glow — rideradian.com</option>
                    <option value="4px 4px 0px var(--color-text)">Sticker offset — drinkjoyrush.com</option>
                    <option value="0 0 0 1px var(--color-primary)">Hairline ring — k95.it</option>
                    <option value="0 20px 40px rgba(0,0,0,0.25)">Soft elevation</option>
                  </select>
                </Row>
              </Group>
              <Group title="Filters & blend">
                <NumRow
                  label="Blur"
                  value={numStr(String(ov['filter'] ?? '').replace(/[^\d.]/g, ''))}
                  onSet={(v) => set('filter')(v === null ? null : `blur(${parseFloat(v)}px)`)}
                />
                <SelectRow
                  label="Blend"
                  value={raw('mix-blend-mode')}
                  onSet={set('mix-blend-mode')}
                  options={['normal', 'multiply', 'screen', 'overlay', 'difference', 'exclusion']}
                />
                <NumRow
                  label="Speed"
                  unit="s"
                  value={numStr(String(ov['transition-duration'] ?? '').replace('s', ''))}
                  onSet={(v) => set('transition-duration')(v === null ? null : `${parseFloat(v)}s`)}
                />
              </Group>
            </>
          );
        })()}
      </div>
    </div>
  );
}

function NoSelectionPanel() {
  const content = useEditorStore((s) => s.content);
  const setContent = useEditorStore((s) => s.setContent);
  const addCustomElement = useEditorStore((s) => s.addCustomElement);
  const deleteCustomElement = useEditorStore((s) => s.deleteCustomElement);

  const [section, setSection] = useState('hero');
  const [kind, setKind] = useState<'text' | 'heading' | 'button' | 'link' | 'image'>('text');
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [href, setHref] = useState('');

  const customEls = Object.values(content.custom_elements || {});

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    const elName = name.trim() || `Custom ${kind.toUpperCase()}`;
    addCustomElement(section, kind, elName, value, href);
    setName('');
    setValue('');
    setHref('');
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 space-y-6 bg-slate-50/50">
      <div className="text-center py-4 border-b border-slate-200">
        <Sparkles size={24} className="mx-auto mb-2 text-blue-600 animate-pulse" />
        <h3 className="text-sm font-bold text-slate-900">Visual Canvas Inspector</h3>
        <p className="text-xs text-slate-500 mt-1">Select any element on canvas to customize typography, dimensions, scaling, and style overrides live.</p>
      </div>

      {/* Navbar & Branding Settings */}
      <div className="space-y-3.5 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Navbar & Branding</h4>
        
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Favicon Image URL</label>
          <input
            type="text"
            placeholder="Favicon URL (e.g. /favicon.svg)"
            value={content.branding?.faviconUrl || ''}
            onChange={(e) => setContent('branding.faviconUrl', e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 outline-none focus:border-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Logo Image URL</label>
          <input
            type="text"
            placeholder="Logo URL (e.g. /logo.svg)"
            value={content.branding?.logoUrl || ''}
            onChange={(e) => setContent('branding.logoUrl', e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 outline-none focus:border-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Navbar CTA Button Text</label>
          <input
            type="text"
            placeholder="e.g. Resume"
            value={content.navbar?.ctaLabel || ''}
            onChange={(e) => setContent('navbar.ctaLabel', e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 outline-none focus:border-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Navbar CTA Destination</label>
          <input
            type="text"
            placeholder="e.g. /resume.pdf"
            value={content.navbar?.ctaHref || ''}
            onChange={(e) => setContent('navbar.ctaHref', e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Creator Form */}
      <form onSubmit={handleAdd} className="space-y-3.5 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Add Dynamic Custom Element</h4>
        
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Target Section</label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="hero">Hero Section</option>
            <option value="about">About Section</option>
            <option value="skills">Toolkit Section</option>
            <option value="timeline">Experience Section</option>
            <option value="footer">Footer</option>
            <option value="custom_section">Brand New Custom Section</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Element Type</label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as any)}
            className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="text">Paragraph / Text Block</option>
            <option value="heading">Heading / Title</option>
            <option value="button">Button Link</option>
            <option value="link">Inline Link</option>
            <option value="image">Image Element</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Admin Label</label>
          <input
            type="text"
            placeholder="e.g. Hero Sub-headline"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 outline-none focus:border-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">
            {kind === 'image' ? 'Image URL' : 'Content Text'}
          </label>
          <textarea
            rows={2}
            placeholder={kind === 'image' ? 'https://example.com/image.jpg' : 'Write text here...'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {(kind === 'button' || kind === 'link') && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Target Link (URL / Hash)</label>
            <input
              type="text"
              placeholder="e.g. #contact or https://github.com"
              value={href}
              onChange={(e) => setHref(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 outline-none focus:border-blue-500"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={!value.trim()}
          className="w-full flex items-center justify-center gap-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Plus size={14} /> Add Element
        </button>
      </form>

      {/* List of Custom Elements */}
      {customEls.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Dynamic Elements ({customEls.length})</h4>
          <div className="space-y-2">
            {customEls.map((el: any) => (
              <div key={el.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs">
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-bold text-slate-800 truncate">{el.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{el.kind} · {el.section}</div>
                </div>
                <button
                  onClick={() => deleteCustomElement(el.id)}
                  title="Delete dynamic element"
                  className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
