import React, { useState } from 'react';
import { useThemeStore } from '../../../theme/store';

type LibTab = 'cards' | 'sections' | 'navbars' | 'footers';

const LIB_TABS: { id: LibTab; label: string }[] = [
  { id: 'cards', label: 'Cards' },
  { id: 'navbars', label: 'Navbars' },
  { id: 'sections', label: 'Sections' },
  { id: 'footers', label: 'Footers' },
];

// ── Tiny visual thumbnail for each card style ──
const CARD_THUMBS: { value: string; label: string; preview: React.ReactNode }[] = [
  {
    value: 'default',
    label: '3D Tilt',
    preview: (
      <div className="w-full h-full bg-[#f4f4f4] rounded-lg border border-[#ddd] p-2 flex flex-col gap-1.5 group-hover:shadow-lg transition-all">
        <div className="h-10 bg-[#e0e0e0] rounded-md" />
        <div className="h-2 bg-[#ccc] rounded w-3/4" />
        <div className="h-2 bg-[#ddd] rounded w-1/2" />
        <div className="flex gap-1 mt-auto"><span className="h-1.5 w-8 rounded-full bg-blue-400" /><span className="h-1.5 w-6 rounded-full bg-[#ddd]" /></div>
      </div>
    ),
  },
  {
    value: 'glass',
    label: 'Glass',
    preview: (
      <div className="w-full h-full rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm p-2 flex flex-col gap-1.5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20" />
        <div className="h-10 bg-white/20 rounded-md relative z-10" />
        <div className="h-2 bg-white/30 rounded w-3/4 relative z-10" />
        <div className="h-2 bg-white/20 rounded w-1/2 relative z-10" />
      </div>
    ),
  },
  {
    value: 'gradient',
    label: 'Gradient',
    preview: (
      <div className="w-full h-full rounded-xl p-2 flex flex-col gap-1.5" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
        <div className="h-10 bg-white/20 rounded-md" />
        <div className="h-2 bg-white/50 rounded w-3/4" />
        <div className="h-2 bg-white/30 rounded w-1/2" />
        <div className="flex gap-1 mt-auto"><span className="h-1.5 w-6 rounded-full bg-white/60" /><span className="h-1.5 w-4 rounded-full bg-white/30" /></div>
      </div>
    ),
  },
  {
    value: 'magazine',
    label: 'Magazine',
    preview: (
      <div className="w-full h-full bg-white border border-[#ddd] flex gap-1 overflow-hidden rounded">
        <div className="w-1/2 bg-[#d1d5db]" />
        <div className="flex-1 p-2 flex flex-col gap-1">
          <div className="h-1.5 w-8 bg-blue-400 rounded-full" />
          <div className="h-2.5 bg-[#222] rounded w-full" />
          <div className="h-2 bg-[#aaa] rounded w-3/4" />
          <div className="h-1.5 bg-[#ccc] rounded w-1/2" />
        </div>
      </div>
    ),
  },
  {
    value: 'bento',
    label: 'Bento',
    preview: (
      <div className="w-full h-full grid grid-cols-2 gap-1 p-1">
        <div className="row-span-2 bg-[#e0e7ff] rounded-lg" />
        <div className="bg-[#fef3c7] rounded-lg" />
        <div className="bg-[#dcfce7] rounded-lg" />
      </div>
    ),
  },
  {
    value: 'masonry',
    label: 'Masonry',
    preview: (
      <div className="w-full h-full flex gap-1 p-1">
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-12 bg-[#e0e0e0] rounded" />
          <div className="h-7 bg-[#d0d0d0] rounded" />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-7 bg-[#d8d8d8] rounded" />
          <div className="h-12 bg-[#e8e8e8] rounded" />
        </div>
      </div>
    ),
  },
  {
    value: 'flip',
    label: 'Flip',
    preview: (
      <div className="w-full h-full relative rounded-lg overflow-hidden" style={{ perspective: '200px' }}>
        <div className="absolute inset-0 bg-[#f0f0f0] rounded-lg border border-[#ddd] flex items-center justify-center">
          <span className="text-[9px] text-[#888] font-mono">Hover →</span>
        </div>
        <div className="absolute inset-0 bg-[#111] rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px] text-white font-mono">Details</span>
        </div>
      </div>
    ),
  },
  {
    value: 'magnetic',
    label: 'Magnetic',
    preview: (
      <div className="w-full h-full bg-white border border-[#e0e0e0] rounded-xl p-2 flex flex-col gap-1.5 group-hover:scale-105 transition-transform duration-300">
        <div className="h-10 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg" />
        <div className="flex gap-1 flex-wrap"><span className="h-3 w-8 rounded-full bg-blue-100" /><span className="h-3 w-6 rounded-full bg-purple-100" /></div>
        <div className="h-2 bg-[#222] rounded w-3/4" />
      </div>
    ),
  },
  {
    value: 'minimal',
    label: 'Minimal',
    preview: (
      <div className="w-full h-full border-2 border-[#111] p-2 flex flex-col gap-1.5 group-hover:shadow-[4px_4px_0px_#111] transition-all">
        <div className="h-10 border border-[#111] bg-[#f5f5f5]" />
        <div className="h-2 bg-[#111] rounded w-3/4" />
        <div className="h-2 bg-[#ccc] rounded w-1/2" />
        <div className="mt-auto pt-2 border-t border-[#111] flex gap-1"><span className="h-3 w-10 border border-[#111] text-[7px] flex items-center justify-center">2024</span></div>
      </div>
    ),
  },
  {
    value: 'editorial',
    label: 'Editorial',
    preview: (
      <div className="w-full h-full rounded overflow-hidden flex flex-col">
        <div className="flex-1 bg-gradient-to-t from-black/60 to-transparent relative">
          <div className="absolute inset-0 bg-[#888]" />
          <div className="absolute bottom-2 left-2"><div className="h-2 bg-white/80 rounded w-16 mb-1" /><div className="h-1.5 bg-white/50 rounded w-12" /></div>
        </div>
        <div className="bg-white p-2 border border-[#eee]">
          <div className="h-1.5 bg-[#ddd] rounded w-3/4" />
        </div>
      </div>
    ),
  },
  {
    value: 'karolbinkowski',
    label: 'Brutalist',
    preview: (
      <div className="w-full h-full border-[2.5px] border-[#111] p-2 flex flex-col gap-1.5 group-hover:shadow-[6px_6px_0px_#e0fd60] transition-all">
        <div className="h-10 border-b-[2px] border-[#111] bg-[#1a1a1a]" />
        <div className="h-2.5 bg-[#111] rounded w-3/4 font-mono" />
        <div className="flex gap-1 mt-auto"><span className="h-4 w-12 bg-[#111] text-[7px] text-white flex items-center justify-center">2024</span></div>
      </div>
    ),
  },
  {
    value: 'vividmotion',
    label: 'Glassy',
    preview: (
      <div className="w-full h-full rounded-2xl border border-white/10 bg-white/10 backdrop-blur p-2 flex flex-col gap-1.5">
        <div className="h-10 bg-white/10 rounded-xl" />
        <div className="h-2 bg-white/30 rounded w-3/4" />
        <div className="h-2 bg-white/20 rounded w-1/2" />
        <div className="flex gap-1 mt-auto"><span className="h-3 w-10 rounded-full bg-white/20 text-[7px]" /></div>
      </div>
    ),
  },
];

const NAVBAR_THUMBS = [
  { value: 'default', label: 'Standard', preview: <div className="flex items-center gap-1.5 h-6 px-2 bg-white border-b border-[#eee]"><span className="w-3 h-3 rounded-sm bg-[#111]" /><span className="flex-1 flex justify-center gap-2">{['Home','Work','About'].map(l=><span key={l} className="h-1.5 w-5 bg-[#ccc] rounded" />)}</span><span className="h-4 w-8 bg-[#111] rounded text-white text-[6px] flex items-center justify-center">CTA</span></div> },
  { value: 'capsule', label: 'Capsule', preview: <div className="flex items-center justify-center h-full"><div className="flex items-center gap-2 bg-white border border-[#ddd] rounded-full px-3 py-1 shadow-sm">{['•','—','•'].map((_,i)=><span key={i} className="h-1 w-4 bg-[#bbb] rounded" />)}</div></div> },
  { value: 'minimal', label: 'Minimal', preview: <div className="flex items-center gap-2 h-6 px-2"><span className="h-2 w-8 bg-[#111] rounded" /><span className="flex-1" />{['/','/'].map((_,i)=><span key={i} className="h-1.5 w-6 bg-[#aaa] rounded" />)}</div> },
  { value: 'karolbinkowski', label: 'Brutalist', preview: <div className="flex items-center h-full border-b-[3px] border-[#111] bg-[#0f0f0f] px-2 gap-2"><span className="h-3 w-3 bg-[#e0fd60] rounded-sm" /><span className="flex-1" />{['',''].map((_,i)=><span key={i} className="h-1.5 w-6 bg-[#555] rounded" />)}</div> },
  { value: 'pelizzari', label: 'Transparent', preview: <div className="flex items-center h-full px-2 gap-2 bg-transparent"><span className="h-2 w-6 bg-[#d63e2e] rounded" /><span className="flex-1" />{['','',''].map((_,i)=><span key={i} className="h-1.5 w-5 bg-[#888] rounded" />)}</div> },
  { value: 'vividmotion', label: 'Glass', preview: <div className="flex items-center h-full px-2 gap-2 bg-white/20 backdrop-blur rounded-lg border border-white/20"><span className="h-2 w-6 bg-[#111]/50 rounded" /><span className="flex-1" />{['',''].map((_,i)=><span key={i} className="h-1.5 w-5 bg-[#888] rounded" />)}</div> },
  { value: 'studiomodular', label: 'Sidebar', preview: <div className="flex h-full"><div className="w-8 bg-[#111] flex flex-col items-center py-2 gap-2">{[0,1,2].map(i=><span key={i} className="h-1.5 w-4 bg-[#444] rounded" />)}</div><div className="flex-1 bg-white" /></div> },
];

const FOOTER_THUMBS = [
  { value: 'default', label: 'Standard', preview: <div className="w-full h-full bg-[#111] flex flex-col items-center justify-center gap-1.5 p-2"><div className="h-4 w-16 bg-white/20 rounded" /><div className="h-1.5 w-24 bg-white/10 rounded" /><div className="flex gap-3 mt-1">{['G','Li','Em'].map(l=><span key={l} className="h-1.5 w-4 bg-white/20 rounded" />)}</div></div> },
  { value: 'karolbinkowski', label: 'Brutalist', preview: <div className="w-full h-full bg-[#f5f5f0] border-t-[3px] border-[#111] flex gap-1 p-1"><div className="flex-1 p-1 border-r-[2px] border-[#111]"><div className="h-5 w-full bg-[#111] rounded" /></div><div className="w-8 flex flex-col gap-1 p-1"><div className="h-2 bg-[#555] rounded" /><div className="h-2 bg-[#888] rounded" /></div></div> },
  { value: 'pelizzari', label: 'Elegant', preview: <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2"><div className="h-3 w-3 rounded-full border border-[#111]" /><div className="h-4 w-20 bg-[#111] rounded italic" /><div className="h-1.5 w-16 bg-[#ccc] rounded" /></div> },
  { value: 'russellnumo', label: 'Grid Table', preview: <div className="w-full h-full grid grid-cols-3 border-t border-[#111] gap-px bg-[#111]">{[0,1,2].map(i=><div key={i} className="bg-white p-1"><div className="h-1.5 w-6 bg-[#ccc] rounded mb-1" /><div className="h-1 w-4 bg-[#eee] rounded" /></div>)}</div> },
  { value: 'studiomodular', label: 'Dark Split', preview: <div className="w-full h-full bg-[#111] grid grid-cols-2 gap-2 p-2"><div className="flex flex-col gap-1"><div className="h-3 w-10 bg-white/30 rounded" /><div className="h-1.5 w-16 bg-white/10 rounded" /></div><div className="grid grid-cols-2 gap-1">{[0,1,2,3].map(i=><div key={i} className="h-1.5 bg-white/10 rounded" />)}</div></div> },
];

const SECTION_CARDS = [
  { label: 'Hero — Parallax', color: 'bg-blue-500/20 border-blue-500/30', desc: '3D scene + headline' },
  { label: 'About — Bento', color: 'bg-purple-500/20 border-purple-500/30', desc: 'Profile + SQL card + stats' },
  { label: 'Skills — Grid', color: 'bg-amber-500/20 border-amber-500/30', desc: 'Category cards + certs' },
  { label: 'Timeline', color: 'bg-emerald-500/20 border-emerald-500/30', desc: 'Vertical experience list' },
  { label: 'Projects — Grid', color: 'bg-red-500/20 border-red-500/30', desc: 'Card grid / carousel' },
  { label: 'Blog — 3-Col', color: 'bg-cyan-500/20 border-cyan-500/30', desc: 'Article cards' },
  { label: 'Contact Form', color: 'bg-indigo-500/20 border-indigo-500/30', desc: 'Email form + socials' },
  { label: 'Footer', color: 'bg-slate-500/20 border-slate-500/30', desc: 'Name + links + copy' },
];

export default function ComponentLibrary() {
  const [tab, setTab] = useState<LibTab>('cards');
  const { updateLayout } = useThemeStore();

  const renderThumbs = (items: { value: string; label: string; preview: React.ReactNode }[], onApply: (v: string) => void) => (
    <div className="grid grid-cols-2 gap-2">
      {items.map(({ value, label, preview }) => (
        <button key={value} onClick={() => onApply(value)}
          className="group flex flex-col gap-1.5 text-left hover:bg-[#1a1a1a] rounded-lg p-1.5 transition-all border border-transparent hover:border-[#2a2a2a]"
          title={`Apply ${label}`}
        >
          <div className="w-full h-16 bg-[#111] rounded overflow-hidden border border-[#222] group-hover:border-blue-500/50 transition-colors">
            {preview}
          </div>
          <span className="text-[10px] text-slate-500 group-hover:text-slate-300 px-0.5 truncate">{label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Sub-tabs */}
      <div className="flex border-b border-[#1f1f1f] shrink-0 px-1 pt-1 gap-0.5">
        {LIB_TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-t transition-all ${
              tab === id ? 'bg-[#1a1a1a] text-blue-400' : 'text-slate-600 hover:text-slate-400'
            }`}>
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {tab === 'cards' && renderThumbs(CARD_THUMBS, (v) => updateLayout({ cardStyle: v as any }))}
        {tab === 'navbars' && renderThumbs(NAVBAR_THUMBS, (v) => updateLayout({ navbarStyle: v as any }))}
        {tab === 'footers' && renderThumbs(FOOTER_THUMBS, (v) => updateLayout({ footerStyle: v as any }))}
        {tab === 'sections' && (
          <div className="space-y-2">
            <p className="text-[10px] text-slate-600 mb-3">Click to scroll preview to section</p>
            {SECTION_CARDS.map(({ label, color, desc }) => (
              <div key={label} className={`p-3 rounded-lg border ${color} cursor-pointer hover:opacity-90 transition-opacity`}>
                <p className="text-[11px] font-semibold text-slate-300">{label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
