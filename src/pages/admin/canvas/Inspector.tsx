import React, { useState } from 'react';
import { useEditorStore } from '../../../editor/editorStore';
import { Type, LayoutGrid, Paintbrush, MousePointerClick, FileText, Sparkles, RotateCcw, Trash2, Plus } from 'lucide-react';
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
  const n = parseFloat(v);
  return Number.isFinite(n) ? String(Math.round(n)) : '';
}

function getContentAt(content: any, path: string) {
  return path.split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), content);
}

// ── Element loop animations — named after the reference websites they replicate ──
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

// ── Module-scope control rows (stable identity → inputs keep focus) ──
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

const NumRow: React.FC<{ label: string; value: string; unit?: string; onSet: (v: string | null) => void }> = ({ label, value, unit = 'px', onSet }) => (
  <Row label={label}>
    <input
      type="number"
      value={value}
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

const FontRow: React.FC<{ value: string; onSet: (v: string | null) => void }> = ({ value, onSet }) => (
  <Row label="Family">
    <select
      value={value}
      onChange={(e) => onSet(e.target.value || null)}
      className="w-40 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-blue-500"
    >
      <option value="">Default</option>
      {FONT_CATEGORIES.map((cat) => (
        <optgroup key={cat} label={cat}>
          {FONTS.filter((f) => f.cat === cat).map((f) => (
            <option key={f.name} value={f.stack}>{f.name}</option>
          ))}
        </optgroup>
      ))}
    </select>
  </Row>
);

const SelectRow: React.FC<{ label: string; value: string; options: string[]; onSet: (v: string | null) => void }> = ({ label, value, options, onSet }) => (
  <Row label={label}>
    <select
      value={value}
      onChange={(e) => onSet(e.target.value || null)}
      className="w-32 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-blue-500"
    >
      <option value="">—</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
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
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between gap-1.5">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-800">{selected.name}</div>
            <div className="truncate text-[11px] text-slate-400">
              {selected.kind}{selected.path ? ` · ${selected.path}` : ''}
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
      <div className="flex shrink-0 border-b border-slate-200">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                tab === t.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'content' && (
          <Group title="Content">
            {selected.path ? (
              selected.kind === 'image' ? (
                <input
                  type="text"
                  placeholder="Image URL"
                  value={String(contentValue)}
                  onChange={(e) => setContent(selected.path!, e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-blue-500"
                />
              ) : (
                <>
                  <textarea
                    rows={4}
                    value={String(contentValue)}
                    onChange={(e) => setContent(selected.path!, e.target.value)}
                    className="w-full resize-y rounded-md border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-blue-500"
                  />
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
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase block">Link Destination (URL)</label>
                          <input
                            type="text"
                            placeholder="e.g. #contact or https://github.com"
                            value={String(linkVal)}
                            onChange={(e) => setContent(linkPath, e.target.value)}
                            className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-blue-500"
                          />
                        </div>
                      );
                    }
                    return null;
                  })()}
                </>
              )
            ) : (
              <p className="text-xs text-slate-400">
                No directly editable text. Double-click text on the canvas to edit it inline.
              </p>
            )}
          </Group>
        )}

        {tab === 'type' && (
          <>
            <Group title="Font">
              <FontRow value={raw('font-family')} onSet={set('font-family')} />
              <NumRow label="Size" value={numStr(raw('font-size'))} onSet={set('font-size')} />
              <SelectRow label="Weight" value={raw('font-weight')} onSet={set('font-weight')} options={['300', '400', '500', '600', '700', '800', '900']} />
            </Group>
            <Group title="Spacing">
              <NumRow label="Letter" value={numStr(raw('letter-spacing'))} onSet={set('letter-spacing')} />
              <NumRow label="Line height" value={numStr(raw('line-height'))} onSet={set('line-height')} />
            </Group>
            <Group title="Alignment">
              <SelectRow label="Align" value={raw('text-align')} onSet={set('text-align')} options={['left', 'center', 'right', 'justify']} />
              <SelectRow label="Transform" value={raw('text-transform')} onSet={set('text-transform')} options={['none', 'uppercase', 'lowercase', 'capitalize']} />
              <ColorRow label="Color" value={raw('color')} onSet={set('color')} />
            </Group>
          </>
        )}

        {tab === 'layout' && (
          <>
            <Group title="Size">
              <NumRow label="Width" value={numStr(raw('width'))} onSet={set('width')} />
              <NumRow label="Height" value={numStr(raw('height'))} onSet={set('height')} />
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
            <Group title="Display">
              <SelectRow label="Display" value={raw('display')} onSet={set('display')} options={['block', 'flex', 'inline-flex', 'grid', 'inline-block', 'none']} />
            </Group>
          </>
        )}

        {tab === 'style' && (
          <>
            <Group title="Background">
              <ColorRow label="Background" value={raw('background-color')} onSet={set('background-color')} />
            </Group>
            <Group title="Border">
              <NumRow label="Width" value={numStr(raw('border-top-width'))} onSet={set('border-width')} />
              <ColorRow label="Color" value={raw('border-color')} onSet={set('border-color')} />
              <NumRow label="Radius" value={numStr(raw('border-radius'))} onSet={set('border-radius')} />
            </Group>
            <Group title="Effects">
              <NumRow label="Opacity" value={raw('opacity')} unit="" onSet={set('opacity')} />
              <SelectRow label="Shadow" value={raw('box-shadow')} onSet={set('box-shadow')} options={['none', '0 1px 2px rgba(0,0,0,0.05)', '0 4px 6px rgba(0,0,0,0.1)', '0 10px 15px rgba(0,0,0,0.1)', '0 20px 40px rgba(0,0,0,0.15)']} />
            </Group>
          </>
        )}

        {tab === 'effects' && (() => {
          const ov = overrides[id] || {};
          // Make hover effects animate smoothly the moment any hover prop is set.
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
    <div className="flex h-full flex-col overflow-y-auto p-4 space-y-6">
      <div className="text-center py-4 border-b border-slate-100">
        <Sparkles size={24} className="mx-auto mb-2 text-blue-500 animate-pulse" />
        <h3 className="text-sm font-semibold text-slate-800">Visual Builder</h3>
        <p className="text-xs text-slate-400 mt-1">Select an element on canvas to edit its styles, or configure branding and custom elements below.</p>
      </div>

      {/* Navbar & Branding Settings */}
      <div className="space-y-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Navbar & Branding</h4>
        
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Favicon Image URL</label>
          <input
            type="text"
            placeholder="Favicon URL (e.g. /favicon.svg)"
            value={content.branding?.faviconUrl || ''}
            onChange={(e) => setContent('branding.faviconUrl', e.target.value)}
            className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-700 outline-none focus:border-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Logo Image URL</label>
          <input
            type="text"
            placeholder="Logo URL (e.g. /logo.svg)"
            value={content.branding?.logoUrl || ''}
            onChange={(e) => setContent('branding.logoUrl', e.target.value)}
            className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-700 outline-none focus:border-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Navbar Button Text</label>
          <input
            type="text"
            placeholder="e.g. Resume"
            value={content.navbar?.ctaLabel || ''}
            onChange={(e) => setContent('navbar.ctaLabel', e.target.value)}
            className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-700 outline-none focus:border-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Navbar Button Link (URL)</label>
          <input
            type="text"
            placeholder="e.g. /resume.pdf"
            value={content.navbar?.ctaHref || ''}
            onChange={(e) => setContent('navbar.ctaHref', e.target.value)}
            className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-700 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Creator Form */}
      <form onSubmit={handleAdd} className="space-y-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Create New Element</h4>
        
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Target Section</label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="hero">Hero Section</option>
            <option value="about">About Section</option>
            <option value="skills">Toolkit Section</option>
            <option value="timeline">Experience Section</option>
            <option value="footer">Footer</option>
            <option value="custom_section">Brand New Section</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Element Type</label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as any)}
            className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="text">Paragraph / Text</option>
            <option value="heading">Heading / Title</option>
            <option value="button">Button Link</option>
            <option value="link">Inline Link</option>
            <option value="image">Image Element</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Admin Element Label</label>
          <input
            type="text"
            placeholder="e.g. Hero Sub-headline"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-700 outline-none focus:border-blue-500"
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
            className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-700 outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {(kind === 'button' || kind === 'link') && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Target Link (URL)</label>
            <input
              type="text"
              placeholder="e.g. #contact or https://github.com"
              value={href}
              onChange={(e) => setHref(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-700 outline-none focus:border-blue-500"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={!value.trim()}
          className="w-full flex items-center justify-center gap-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
        >
          <Plus size={14} /> Add Element
        </button>
      </form>

      {/* List of Custom Elements */}
      {customEls.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-750 uppercase tracking-wider">Dynamic Elements ({customEls.length})</h4>
          <div className="space-y-2">
            {customEls.map((el: any) => (
              <div key={el.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-150 bg-white hover:border-slate-300 transition-all shadow-sm">
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-bold text-slate-800 truncate">{el.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{el.kind} · {el.section}</div>
                </div>
                <button
                  onClick={() => deleteCustomElement(el.id)}
                  title="Delete dynamic element"
                  className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
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
