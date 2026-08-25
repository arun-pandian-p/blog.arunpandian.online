import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Palette, RotateCcw, ChevronDown, Check, Type, Sliders } from 'lucide-react';
import { useThemeStore } from '../../../theme/store';
import { presets, SITE_FONTS, EFFECT_STYLES, CURSOR_STYLES, type ThemeState } from '../../../theme/presets';

// ── Helpers ──────────────────────────────────────────────────────────────────

function isValidHex(hex: string) {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

function contrastColor(hex: string): string {
  if (!isValidHex(hex)) return '#000000';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#000000' : '#ffffff';
}

// ── Color token fields ────────────────────────────────────────────────────────

const COLOR_FIELDS: { key: Extract<keyof ThemeState['colors'], string>; label: string; hint: string }[] = [
  { key: 'primary',    label: 'Accent',     hint: 'CTA buttons, links, highlights' },
  { key: 'background', label: 'Background', hint: 'Page background' },
  { key: 'surface',    label: 'Surface',    hint: 'Cards, panels, inputs' },
  { key: 'text',       label: 'Text',       hint: 'Body text color' },
  { key: 'muted',      label: 'Muted',      hint: 'Secondary / placeholder text' },
  { key: 'border',     label: 'Border',     hint: 'Dividers, outlines' },
];

// ── Editable color row (Neumorphic) ──────────────────────────────────────────

interface ColorRowProps {
  label: string;
  hint: string;
  value: string;
  onChange: (hex: string) => void;
}

function ColorRow({ label, hint, value, onChange }: ColorRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const colorRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const commitDraft = () => {
    const normalized = draft.startsWith('#') ? draft : `#${draft}`;
    if (isValidHex(normalized)) {
      onChange(normalized);
      setDraft(normalized);
    } else {
      setDraft(value);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitDraft();
    if (e.key === 'Escape') { setDraft(value); setEditing(false); }
  };

  return (
    <div className="group flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-[#EEF2F8] shadow-[3px_3px_6px_#D0D7E3,-3px_-3px_6px_#FFFFFF] hover:shadow-[4px_4px_8px_#D0D7E3,-4px_-4px_8px_#FFFFFF] transition-all">
      {/* Color swatch button with soft depth */}
      <button
        onClick={() => colorRef.current?.click()}
        className="relative h-7 w-7 shrink-0 rounded-xl shadow-[2px_2px_4px_#CBD5E1,-2px_-2px_4px_#FFFFFF] transition-transform hover:scale-105 active:scale-95 cursor-pointer overflow-hidden border border-white/60"
        style={{ background: isValidHex(value) ? value : '#888' }}
        title={`Pick ${label}`}
      >
        <input
          ref={colorRef}
          type="color"
          value={isValidHex(value) ? value : '#888888'}
          onChange={(e) => { onChange(e.target.value); setDraft(e.target.value); }}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          tabIndex={-1}
        />
      </button>

      {/* Label + hex input */}
      <div className="flex-1 min-w-0">
        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-0.5">{label}</div>
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitDraft}
            onKeyDown={handleKeyDown}
            className="w-full text-xs font-mono text-slate-800 bg-[#E8EDF5] shadow-[inset_2px_2px_4px_#D0D7E3,inset_-2px_-2px_4px_#FFFFFF] rounded-lg px-2 py-1 outline-none border border-[#F29F67]"
            autoFocus
          />
        ) : (
          <button
            onClick={() => { setEditing(true); setDraft(value); }}
            className="text-xs font-mono font-semibold text-slate-700 hover:text-[#F29F67] transition-colors text-left"
            title={hint}
          >
            {isValidHex(value) ? value.toUpperCase() : value}
          </button>
        )}
      </div>
    </div>
  );
}

// ── BG preview ────────────────────────────────────────────────────────────────

function BgPreview({ colors }: { colors: ThemeState['colors'] }) {
  const bg = colors.background || '#fff';
  const surface = colors.surface || '#f0f0f0';
  const text = colors.text || '#000';
  const primary = colors.primary || '#2563eb';
  const muted = colors.muted || '#888';
  const border = colors.border || '#e4e4e7';

  return (
    <div
      className="w-full rounded-2xl overflow-hidden shadow-[inset_3px_3px_6px_#D0D7E3,inset_-3px_-3px_6px_#FFFFFF] border border-white/60 mb-3"
      style={{ background: bg }}
    >
      {/* Navbar */}
      <div className="flex items-center justify-between px-3 py-2" style={{ background: surface, borderBottom: `1px solid ${border}` }}>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full" style={{ background: primary }} />
          <div className="h-1.5 w-12 rounded-full" style={{ background: muted, opacity: 0.4 }} />
        </div>
        <div className="px-2.5 py-0.5 rounded-full font-bold" style={{ background: primary, color: contrastColor(primary), fontSize: '7px' }}>
          CTA
        </div>
      </div>

      {/* Hero */}
      <div className="px-4 py-3 space-y-1.5">
        <div className="h-2 w-3/4 rounded-full" style={{ background: text, opacity: 0.85 }} />
        <div className="h-1.5 w-1/2 rounded-full" style={{ background: muted, opacity: 0.5 }} />
        <div className="h-1.5 w-2/3 rounded-full" style={{ background: muted, opacity: 0.35 }} />
        <div className="flex gap-1.5 pt-1">
          <div className="h-5 w-12 rounded-md" style={{ background: primary }} />
          <div className="h-5 w-12 rounded-md border" style={{ borderColor: border, background: surface }} />
        </div>
      </div>

      {/* Cards */}
      <div className="flex gap-2 px-4 pb-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 rounded-lg p-2 space-y-1" style={{ background: surface, border: `1px solid ${border}` }}>
            <div className="h-1.5 rounded-full w-full" style={{ background: text, opacity: 0.6 }} />
            <div className="h-1 rounded-full w-3/4" style={{ background: muted, opacity: 0.4 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Preset card (Neumorphic) ──────────────────────────────────────────────────

function PresetCard({ name, preset, isActive, onApply }: {
  name: string;
  preset: ThemeState;
  isActive: boolean;
  onApply: () => void;
}) {
  const colors = [preset.colors.background, preset.colors.primary, preset.colors.text, preset.colors.surface];

  return (
    <button
      onClick={onApply}
      title={name}
      className={`group relative flex items-center gap-2 px-2.5 py-2.5 rounded-2xl transition-all text-left cursor-pointer ${
        isActive
          ? 'bg-[#E8EDF5] shadow-[inset_3px_3px_6px_#CBD5E1,inset_-3px_-3px_6px_#FFFFFF] border border-[#F29F67]'
          : 'bg-[#EEF2F8] shadow-[3px_3px_6px_#D0D7E3,-3px_-3px_6px_#FFFFFF] hover:shadow-[4px_4px_8px_#D0D7E3,-4px_-4px_8px_#FFFFFF] border border-white/60'
      }`}
    >
      <div className="flex gap-0.5 shrink-0">
        {colors.map((c, i) => (
          <span key={i} className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-xs" style={{ background: c }} />
        ))}
      </div>
      <span className={`text-[10px] truncate leading-tight transition-colors ${
        isActive ? 'text-[#F29F67] font-bold' : 'text-slate-600 group-hover:text-slate-900 font-medium'
      }`}>
        {name.split(' (')[0]}
      </span>
      {isActive && <Check size={11} className="ml-auto shrink-0 text-[#F29F67]" />}
    </button>
  );
}

// ── Font select (Neumorphic) ──────────────────────────────────────────────────

function FontSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-xs font-semibold rounded-xl px-3 py-2 bg-[#EEF2F8] text-slate-800 shadow-[inset_2px_2px_4px_#D0D7E3,inset_-2px_-2px_4px_#FFFFFF] border border-white/80 focus:outline-none focus:border-[#F29F67] transition-colors cursor-pointer"
    >
      {!SITE_FONTS.some((g) => g.fonts.some((f) => f.stack === value)) && value && (
        <option value={value}>{value.split(',')[0]}</option>
      )}
      {SITE_FONTS.map((group) => (
        <optgroup key={group.site} label={group.site} className="text-slate-400">
          {group.fonts.map((f) => (
            <option key={`${group.site}-${f.name}`} value={f.stack}>
              {f.name} · {f.role}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

// ── Tab system ────────────────────────────────────────────────────────────────

type PanelTab = 'colors' | 'type' | 'effects';
const PANEL_TABS: { id: PanelTab; label: string; icon: any }[] = [
  { id: 'colors',  label: 'Colors',  icon: Palette },
  { id: 'type',    label: 'Type',    icon: Type },
  { id: 'effects', label: 'Effects', icon: Sliders },
];

// ── Main component ─────────────────────────────────────────────────────────────

export default function ThemePanel() {
  const {
    theme,
    customPresets,
    updateColors,
    updateTypography,
    updateLayout,
    applyPreset,
    saveCustomPreset,
    deleteCustomPreset,
    loadCustomPresetsFromDb,
  } = useThemeStore();
  const [activeTab, setActiveTab] = useState<PanelTab>('colors');
  const [presetsOpen, setPresetsOpen] = useState(true);
  const [newPresetName, setNewPresetName] = useState('');

  useEffect(() => {
    loadCustomPresetsFromDb();
  }, [loadCustomPresetsFromDb]);

  const activePreset = Object.entries(presets).find(([, p]) =>
    p.colors.primary === theme.colors.primary &&
    p.colors.background === theme.colors.background
  )?.[0] ?? null;

  const handleReset = useCallback(() => {
    applyPreset('Default');
  }, [applyPreset]);

  return (
    <div className="text-sm flex flex-col h-full space-y-3">

      {/* Inner Neumorphic Tab bar */}
      <div className="flex gap-1 p-1 bg-[#E8EDF5] rounded-2xl shadow-[inset_2px_2px_4px_#D0D7E3,inset_-2px_-2px_4px_#FFFFFF]">
        {PANEL_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === id
                ? 'bg-[#EEF2F8] text-[#F29F67] shadow-[3px_3px_6px_#D0D7E3,-3px_-3px_6px_#FFFFFF]'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Icon size={11} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── COLORS TAB ── */}
      {activeTab === 'colors' && (
        <div className="space-y-3">
          <BgPreview colors={theme.colors} />

          {/* Presets toggle */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => setPresetsOpen((v) => !v)}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <Palette size={12} className="text-[#F29F67]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Color Presets</span>
              <ChevronDown
                size={12}
                className={`text-slate-400 transition-transform duration-200 ${presetsOpen ? '' : '-rotate-90'}`}
              />
            </button>

            <button
              onClick={handleReset}
              title="Reset to Default"
              className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw size={10} /> Reset
            </button>
          </div>

          {presetsOpen && (
            <div className="space-y-3 pb-2">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(presets).map(([name, preset]) => (
                  <PresetCard
                    key={name}
                    name={name}
                    preset={preset as ThemeState}
                    isActive={activePreset === name}
                    onApply={() => applyPreset(name)}
                  />
                ))}
              </div>

              {/* Custom Presets Section */}
              {Object.keys(customPresets).length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Custom Saved Presets</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(customPresets).map(([name, preset]) => (
                      <div key={name} className="relative group">
                        <PresetCard
                          name={name}
                          preset={preset as ThemeState}
                          isActive={activePreset === name}
                          onApply={() => applyPreset(name)}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCustomPreset(name);
                          }}
                          title="Delete custom preset"
                          className="absolute right-1.5 top-1.5 p-0.5 rounded bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[9px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Current Preset Form */}
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Save Current as Preset</div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Preset Name (e.g. Neon Horizon)"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    className="flex-1 text-xs font-medium rounded-xl px-2.5 py-1.5 bg-[#EEF2F8] text-slate-800 shadow-[inset_2px_2px_4px_#D0D7E3,inset_-2px_-2px_4px_#FFFFFF] outline-none"
                  />
                  <button
                    onClick={async () => {
                      if (!newPresetName.trim()) return;
                      await saveCustomPreset(newPresetName.trim(), theme);
                      setNewPresetName('');
                    }}
                    disabled={!newPresetName.trim()}
                    className="px-3 py-1.5 bg-[#F29F67] hover:bg-[#e08f58] text-white text-[11px] font-bold rounded-xl shadow-[2px_2px_4px_#D0D7E3,-2px_-2px_4px_#FFFFFF] disabled:opacity-50 cursor-pointer transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Color tokens */}
          <div className="pt-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1 mb-2">Token Palette</div>
            <div className="space-y-2">
              {COLOR_FIELDS.map(({ key, label, hint }) => (
                <ColorRow
                  key={key}
                  label={label}
                  hint={hint}
                  value={(theme.colors as any)[key] || '#000000'}
                  onChange={(hex) => updateColors({ [key]: hex } as any)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TYPE TAB ── */}
      {activeTab === 'type' && (
        <div className="space-y-3">
          {/* Heading font */}
          <div className="p-3.5 bg-[#EEF2F8] rounded-2xl shadow-[4px_4px_8px_#D0D7E3,-4px_-4px_8px_#FFFFFF] border border-white/60 space-y-2.5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Heading Font</div>
            <FontSelect
              value={theme.typography.headingFont}
              onChange={(v) => updateTypography({ headingFont: v })}
            />
            <div
              className="text-xl font-bold text-slate-800 leading-tight truncate pt-1"
              style={{ fontFamily: theme.typography.headingFont, fontWeight: theme.typography.headingWeight }}
            >
              Turning Raw Data Into Decisions
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="space-y-1">
                <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Weight</div>
                <select
                  value={theme.typography.headingWeight}
                  onChange={(e) => updateTypography({ headingWeight: e.target.value })}
                  className="w-full text-xs font-semibold rounded-xl px-2 py-1.5 bg-[#EEF2F8] text-slate-800 shadow-[inset_2px_2px_4px_#D0D7E3,inset_-2px_-2px_4px_#FFFFFF] outline-none"
                >
                  {['400','500','600','700','800','900'].map(w => <option key={w}>{w}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Size</div>
                <input
                  type="text"
                  value={theme.typography.headingSize}
                  onChange={(e) => updateTypography({ headingSize: e.target.value })}
                  className="w-full text-xs font-mono font-semibold rounded-xl px-2 py-1.5 bg-[#EEF2F8] text-slate-800 shadow-[inset_2px_2px_4px_#D0D7E3,inset_-2px_-2px_4px_#FFFFFF] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Body font */}
          <div className="p-3.5 bg-[#EEF2F8] rounded-2xl shadow-[4px_4px_8px_#D0D7E3,-4px_-4px_8px_#FFFFFF] border border-white/60 space-y-2.5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Body Font</div>
            <FontSelect
              value={theme.typography.fontFamily}
              onChange={(v) => updateTypography({ fontFamily: v })}
            />
            <div
              className="text-xs text-slate-600 leading-relaxed pt-1"
              style={{ fontFamily: theme.typography.fontFamily, fontWeight: theme.typography.bodyWeight }}
            >
              The quick brown fox jumps over the lazy dog.
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="space-y-1">
                <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Weight</div>
                <select
                  value={theme.typography.bodyWeight}
                  onChange={(e) => updateTypography({ bodyWeight: e.target.value })}
                  className="w-full text-xs font-semibold rounded-xl px-2 py-1.5 bg-[#EEF2F8] text-slate-800 shadow-[inset_2px_2px_4px_#D0D7E3,inset_-2px_-2px_4px_#FFFFFF] outline-none"
                >
                  {['300','400','500','600','700'].map(w => <option key={w}>{w}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Size</div>
                <input
                  type="text"
                  value={theme.typography.bodySize}
                  onChange={(e) => updateTypography({ bodySize: e.target.value })}
                  className="w-full text-xs font-mono font-semibold rounded-xl px-2 py-1.5 bg-[#EEF2F8] text-slate-800 shadow-[inset_2px_2px_4px_#D0D7E3,inset_-2px_-2px_4px_#FFFFFF] outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EFFECTS TAB ── */}
      {activeTab === 'effects' && (
        <div className="space-y-3">
          <div className="p-3.5 bg-[#EEF2F8] rounded-2xl shadow-[4px_4px_8px_#D0D7E3,-4px_-4px_8px_#FFFFFF] border border-white/60 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Animation Package</div>
            <select
              value={theme.layout?.animationStyle || 'default'}
              onChange={(e) => updateLayout({ animationStyle: e.target.value as any })}
              className="w-full text-xs font-semibold rounded-xl px-3 py-2 bg-[#EEF2F8] text-slate-800 shadow-[inset_2px_2px_4px_#D0D7E3,inset_-2px_-2px_4px_#FFFFFF] outline-none"
            >
              {EFFECT_STYLES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div className="p-3.5 bg-[#EEF2F8] rounded-2xl shadow-[4px_4px_8px_#D0D7E3,-4px_-4px_8px_#FFFFFF] border border-white/60 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Custom Cursor</div>
            <select
              value={theme.layout?.cursorStyle || 'default'}
              onChange={(e) => updateLayout({ cursorStyle: e.target.value as any })}
              className="w-full text-xs font-semibold rounded-xl px-3 py-2 bg-[#EEF2F8] text-slate-800 shadow-[inset_2px_2px_4px_#D0D7E3,inset_-2px_-2px_4px_#FFFFFF] outline-none"
            >
              {CURSOR_STYLES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>
      )}

    </div>
  );
}
