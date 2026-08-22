import React from 'react';
import { Layout } from 'lucide-react';
import { useThemeStore } from '../../../theme/store';

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{children}</label>
);

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 pt-4 pb-2 border-t border-slate-100 first:border-0 first:pt-0">
    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{children}</span>
  </div>
);

const PresetGrid = <T extends string>({
  label, value, options, onChange,
}: { label: string; value: T; options: { value: T; label: string; description?: string }[]; onChange: (v: T) => void }) => (
  <div className="space-y-1.5">
    <Label>{label}</Label>
    <div className="grid grid-cols-1 gap-1">
      {options.map((opt) => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-all text-[11px] ${
            value === opt.value
              ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-sm'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-800'
          }`}>
          <div className={`h-2 w-2 rounded-full shrink-0 ${value === opt.value ? 'bg-blue-500' : 'bg-slate-300'}`} />
          <div>
            <div className="font-medium">{opt.label}</div>
            {opt.description && <div className="text-[10px] text-slate-400 mt-0.5">{opt.description}</div>}
          </div>
        </button>
      ))}
    </div>
  </div>
);

const NAVBAR_OPTIONS = [
  { value: 'default' as const, label: 'Standard Full Width', description: 'Top bar, full viewport width' },
  { value: 'capsule' as const, label: 'Floating Capsule', description: 'Pill-shaped floating above content' },
  { value: 'minimal' as const, label: 'Minimal Text Only', description: 'Ultra-clean, no borders' },
  { value: 'karolbinkowski' as const, label: 'Brutalist Split', description: 'karolbinkow.ski — Bold border separation' },
  { value: 'pelizzari' as const, label: 'Elegant Transparent', description: 'pelizzari.com — Transparent overlay' },
  { value: 'vividmotion' as const, label: 'Glassy Minimal', description: 'vividmotion.co — Blur glass effect' },
  { value: 'studiomodular' as const, label: 'Side Nav Left', description: 'studiomodular.be — Vertical sidebar' },
];

const HERO_OPTIONS = [
  { value: 'default' as const, label: 'Standard Parallax', description: 'Portrait + headline grid' },
  { value: 'karolbinkowski' as const, label: 'Massive Split Typography', description: 'Full-bleed giant headline' },
  { value: 'pelizzari' as const, label: 'Editorial Cinematic', description: 'Dark fullscreen editorial' },
  { value: 'russellnumo' as const, label: 'Monospace Grid', description: 'Structured info grid' },
  { value: 'vividmotion' as const, label: 'Soft Glassy', description: 'Glass card hero' },
  { value: 'konnect' as const, label: 'Konnect Dark', description: 'Dark theme circular layout with floating avatars' },
  { value: 'loveandrespect' as const, label: 'Love & Respect Grid', description: 'Text left, video/image grid right' },
  { value: 'logoipsum' as const, label: 'Rounded Collage', description: 'Split layout with rounded image collage' },
  { value: 'videostreaming' as const, label: 'Video Streaming', description: 'Large video preview side-by-side' },
  { value: 'streaming' as const, label: 'Fan Carousel', description: 'Movie poster fan spread' },
  { value: 'puremoda' as const, label: 'Fashion Bento', description: 'Clean asymmetrical bento boxes' },
  { value: 'katerio' as const, label: 'Retro Split Grid', description: 'Modern streetwear grid' },
  { value: 'retro-portfolio' as const, label: 'Retro Portfolio', description: 'Dark green editorial layout' },
];

const CARD_OPTIONS = [
  { value: 'default' as const, label: 'Default 3D Tilt', description: 'Perspective tilt on hover' },
  { value: 'glass' as const, label: 'Glass / Frosted', description: 'Glassmorphism with blur + glow' },
  { value: 'gradient' as const, label: 'Vivid Gradient', description: 'Rotating colour gradient per card' },
  { value: 'magazine' as const, label: 'Magazine / Editorial', description: 'Feature + supporting grid' },
  { value: 'bento' as const, label: 'Bento Grid Tiles', description: 'Tall/wide alternating bento' },
  { value: 'masonry' as const, label: 'Masonry Pinterest', description: 'Variable height column flow' },
  { value: 'flip' as const, label: 'Flip Card', description: '3D flip reveals details on back' },
  { value: 'magnetic' as const, label: 'Magnetic Spring', description: 'Spring-scale hover with glow' },
  { value: 'minimal' as const, label: 'Minimal Flat', description: 'Clean outlines, no shadow' },
  { value: 'editorial' as const, label: 'Editorial Image', description: 'Image-dominant with overlay' },
  { value: 'karolbinkowski' as const, label: 'Neon Brutalist', description: 'Bold borders + neon accent' },
  { value: 'pelizzari' as const, label: 'Cinematic Serif', description: 'Tall portrait, serif italic' },
  { value: 'russellnumo' as const, label: 'Monospace Grid', description: 'Technical, monospace table' },
  { value: 'vividmotion' as const, label: 'Smooth Glassy', description: 'Translucent glass look' },
];

const FOOTER_OPTIONS = [
  { value: 'default' as const, label: 'Standard Wave', description: 'Centered with wave divider' },
  { value: 'karolbinkowski' as const, label: 'Brutalist Grid', description: 'Bold borders, uppercase' },
  { value: 'pelizzari' as const, label: 'Elegant Serif', description: 'Centered, serif typography' },
  { value: 'russellnumo' as const, label: 'Monospace Table', description: 'Column grid, tabular' },
  { value: 'studiomodular' as const, label: 'Asymmetrical Left', description: 'Dark bg, left-heavy layout' },
];

const PROJECTS_SCROLL_OPTIONS = [
  { value: 'grid' as const, label: 'Standard Grid', description: '2-column card grid' },
  { value: 'horizontal' as const, label: 'Horizontal Carousel', description: 'Swipe / scroll sideways' },
  { value: 'vertical' as const, label: 'Vertical Track', description: 'Full-height snap scroll' },
  { value: 'masonry' as const, label: 'Masonry Columns', description: 'Pinterest-style variable height' },
  { value: 'bento' as const, label: 'Bento Grid', description: 'Alternating tall/wide tiles' },
];

const SCROLL_OPTIONS = [
  { value: 'horizontal' as const, label: 'Horizontal Ticker Marquee' },
  { value: 'vertical' as const, label: 'Vertical Stacking Marquee' },
  { value: 'none' as const, label: 'No Marquee' },
];

export default function StructurePanel() {
  const { theme, updateLayout } = useThemeStore();
  const layout = theme.layout || {};

  return (
    <div className="space-y-1 text-sm">
      <SectionHeader>Navbar</SectionHeader>
      <PresetGrid label="Navbar Design" value={layout.navbarStyle || 'default'} options={NAVBAR_OPTIONS} onChange={(v) => updateLayout({ navbarStyle: v })} />

      <SectionHeader>Hero</SectionHeader>
      <PresetGrid label="Hero Layout" value={layout.heroStyle || 'default'} options={HERO_OPTIONS} onChange={(v) => updateLayout({ heroStyle: v })} />

      <SectionHeader>Project Cards</SectionHeader>
      <PresetGrid label="Card Style" value={layout.cardStyle || 'default'} options={CARD_OPTIONS} onChange={(v) => updateLayout({ cardStyle: v })} />
      <PresetGrid label="Projects Layout" value={layout.projectsScroll || 'grid'} options={PROJECTS_SCROLL_OPTIONS} onChange={(v) => updateLayout({ projectsScroll: v })} />

      <SectionHeader>Blog</SectionHeader>
      <PresetGrid
        label="Blog Layout"
        value={layout.blogScroll || 'horizontal'}
        options={[
          { value: 'horizontal' as const, label: 'Horizontal Carousel', description: 'Snap-scroll with arrow guide (default)' },
          { value: 'grid' as const, label: '3-Column Grid', description: 'Classic equal-width grid' },
          { value: 'masonry' as const, label: 'Masonry Columns', description: 'Pinterest-style variable height' },
          { value: 'bento' as const, label: 'Bento Grid', description: 'Alternating tall/wide tiles' },
        ]}
        onChange={(v) => updateLayout({ blogScroll: v as any })}
      />

      <SectionHeader>Footer</SectionHeader>
      <PresetGrid label="Footer Design" value={layout.footerStyle || 'default'} options={FOOTER_OPTIONS} onChange={(v) => updateLayout({ footerStyle: v })} />

      <SectionHeader>Scroll Ticker</SectionHeader>
      <PresetGrid label="Marquee Style" value={layout.scrollStyle || 'horizontal'} options={SCROLL_OPTIONS} onChange={(v) => updateLayout({ scrollStyle: v })} />
    </div>
  );
}

