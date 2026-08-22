import React from 'react';
import { Zap, Layers, AlignJustify } from 'lucide-react';

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{children}</label>
);

const SectionHeader = ({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) => (
  <div className="flex items-center gap-2 pt-4 pb-2 border-t border-slate-100 first:border-0 first:pt-0">
    {Icon && <Icon size={11} className="text-slate-400" />}
    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{children}</span>
  </div>
);

const ToggleGroup = ({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) => (
  <div className="space-y-1.5">
    <Label>{label}</Label>
    <div className="flex gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
      {options.map((opt) => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          className={`flex-1 px-2 py-1.5 rounded-md text-[10px] font-semibold transition-all ${
            value === opt.value
              ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
              : 'text-slate-500 hover:text-slate-700'
          }`}>
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

const SliderControl = ({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit?: string;
  onChange: (v: number) => void;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      <span className="text-[10px] font-mono text-blue-600 font-semibold">{value}{unit}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none bg-slate-200 cursor-pointer accent-blue-500" />
  </div>
);

const SelectControl = ({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) => (
  <div className="space-y-1">
    <Label>{label}</Label>
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full text-[11px] border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-blue-400 transition-colors shadow-sm">
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  </div>
);

const useMotionStore = () => {
  const [settings, setSettings] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('design-os-motion') || '{}'); } catch { return {}; }
  });
  const update = (key: string, value: any) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem('design-os-motion', JSON.stringify(next));
  };
  return { settings, update };
};

export default function ScrollStudio() {
  const { settings, update } = useMotionStore();

  return (
    <div className="space-y-2 text-sm">

      <SectionHeader icon={AlignJustify}>Scroll Mode</SectionHeader>
      <ToggleGroup label="Page Scroll Type" value={settings.scrollMode || 'native'}
        options={[{ value: 'native', label: 'Native' }, { value: 'smooth', label: 'Smooth' }, { value: 'snap', label: 'Snap' }]}
        onChange={(v) => update('scrollMode', v)} />
      <ToggleGroup label="Section Transition" value={settings.sectionTransition || 'fade'}
        options={[{ value: 'fade', label: 'Fade' }, { value: 'slide', label: 'Slide' }, { value: 'none', label: 'None' }]}
        onChange={(v) => update('sectionTransition', v)} />

      <SectionHeader icon={Layers}>Parallax</SectionHeader>
      <ToggleGroup label="Parallax Enabled" value={settings.parallax || 'on'}
        options={[{ value: 'on', label: 'On' }, { value: 'off', label: 'Off' }]}
        onChange={(v) => update('parallax', v)} />
      {settings.parallax !== 'off' && (
        <SliderControl label="Parallax Intensity" value={settings.parallaxIntensity || 40} min={0} max={100} step={5} unit="%" onChange={(v) => update('parallaxIntensity', v)} />
      )}

      <SectionHeader>Ticker / Marquee</SectionHeader>
      <SliderControl label="Speed" value={settings.tickerSpeed || 20} min={5} max={60} step={1} unit="s" onChange={(v) => update('tickerSpeed', v)} />
      <ToggleGroup label="Pause on Hover" value={settings.tickerPause || 'on'}
        options={[{ value: 'on', label: 'On' }, { value: 'off', label: 'Off' }]}
        onChange={(v) => update('tickerPause', v)} />

      <SectionHeader icon={Zap}>Reveal Animations</SectionHeader>
      <SelectControl label="Reveal Style" value={settings.revealStyle || 'slice'}
        options={['Slice Reveal', 'Fade Up', 'Scale In', 'Blur In', 'Stagger Words', 'Clip Path', 'None']}
        onChange={(v) => update('revealStyle', v)} />
      <SliderControl label="Duration" value={settings.revealDuration || 700} min={100} max={2000} step={50} unit="ms" onChange={(v) => update('revealDuration', v)} />
      <SliderControl label="Delay Stagger" value={settings.revealStagger || 80} min={0} max={300} step={10} unit="ms" onChange={(v) => update('revealStagger', v)} />
      <SelectControl label="Easing Curve" value={settings.revealEasing || 'ease-out'}
        options={['ease-out', 'ease-in-out', 'spring', 'linear', 'back-out', 'elastic']}
        onChange={(v) => update('revealEasing', v)} />

      <SectionHeader>Project Slider Type</SectionHeader>
      <SelectControl label="Slider Mode" value={settings.sliderMode || 'grid'}
        options={['Grid', 'Horizontal Carousel', 'Vertical Stack', '3D Coverflow', 'Film Strip', 'Fade', 'Stack Cards', 'Masonry', 'Bento']}
        onChange={(v) => update('sliderMode', v)} />
      <SliderControl label="Slide Speed" value={settings.slideSpeed || 400} min={100} max={1500} step={50} unit="ms" onChange={(v) => update('slideSpeed', v)} />
      <ToggleGroup label="Autoplay" value={settings.autoplay || 'off'}
        options={[{ value: 'on', label: 'On' }, { value: 'off', label: 'Off' }]}
        onChange={(v) => update('autoplay', v)} />
      {settings.autoplay === 'on' && (
        <SliderControl label="Autoplay Delay" value={settings.autoplayDelay || 3000} min={1000} max={10000} step={500} unit="ms" onChange={(v) => update('autoplayDelay', v)} />
      )}

      <SectionHeader>Mouse Interactions</SectionHeader>
      <ToggleGroup label="Magnetic Buttons" value={settings.magneticButtons || 'on'}
        options={[{ value: 'on', label: 'On' }, { value: 'off', label: 'Off' }]}
        onChange={(v) => update('magneticButtons', v)} />
      <ToggleGroup label="Tilt Cards" value={settings.tiltCards || 'on'}
        options={[{ value: 'on', label: 'On' }, { value: 'off', label: 'Off' }]}
        onChange={(v) => update('tiltCards', v)} />
      <ToggleGroup label="Hover Lift" value={settings.hoverLift || 'on'}
        options={[{ value: 'on', label: 'On' }, { value: 'off', label: 'Off' }]}
        onChange={(v) => update('hoverLift', v)} />

      <p className="text-[10px] text-slate-400 pt-2 pb-1 border-t border-slate-100 mt-2">
        Motion settings apply globally on next page reload.
      </p>
    </div>
  );
}
