import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { TextField } from '../../../components/admin/ui/FormInputs';
import SaveActionPanel from '../../../components/admin/ui/SaveActionPanel';
import SectionCard from '../../../components/admin/ui/SectionCard';
import { useSiteSettings } from '../../../components/admin/hooks/useSiteSettings';

// Every field here is live-wired to the public site's CSS design tokens.
const themeSchema = z.object({
  accentColor: z.string().min(1, 'Required'),
  inkColor: z.string().min(1, 'Required'),
  bgColor: z.string().min(1, 'Required'),
  surfaceColor: z.string().min(1, 'Required'),
  fontFamily: z.string().min(1, 'Required'),
});

const defaults = {
  accentColor: '#2563EB',
  inkColor: '#09090B',
  bgColor: '#FAFAFA',
  surfaceColor: '#FFFFFF',
  fontFamily: 'Space Grotesk',
};

const fonts = ['Space Grotesk', 'Archivo', 'Inter', 'Outfit'];

export default function ThemeSettings() {
  const { fetchSettings, saveSettings, loading: initLoading } = useSiteSettings('theme');
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm({
    resolver: zodResolver(themeSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    fetchSettings().then((data) => {
      if (data) form.reset({ ...defaults, ...data });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (values) => {
    setIsSaving(true);
    const success = await saveSettings(values);
    if (success) form.reset(values);
    setIsSaving(false);
  };

  const w = form.watch();

  if (initLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={24} /></div>;
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl space-y-8 pb-32">
      <div>
        <h1 className="font-bold text-2xl text-slate-800">Theme</h1>
        <p className="text-slate-500 mt-1 text-sm">
          These map directly to the public site's design tokens and update live — changes apply the moment you save.
        </p>
      </div>

      <SectionCard title="Colors">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField type="color" label="Accent / CTA color" className="h-16" {...form.register('accentColor')} error={form.formState.errors.accentColor?.message} />
          <TextField type="color" label="Ink (headings & text)" className="h-16" {...form.register('inkColor')} error={form.formState.errors.inkColor?.message} />
          <TextField type="color" label="Page background" className="h-16" {...form.register('bgColor')} error={form.formState.errors.bgColor?.message} />
          <TextField type="color" label="Card / surface" className="h-16" {...form.register('surfaceColor')} error={form.formState.errors.surfaceColor?.message} />
        </div>
      </SectionCard>

      <SectionCard title="Typography">
        <div className="max-w-sm">
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">Body font family</label>
          <select {...form.register('fontFamily')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer">
            {fonts.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <p className="mt-1.5 text-xs text-slate-400">Headings stay in Archivo; this sets the body text font.</p>
        </div>
      </SectionCard>

      {/* Live preview */}
      <SectionCard title="Preview" description="How the tokens read on the public site.">
        <div className="rounded-xl border border-slate-200 p-6" style={{ backgroundColor: w.bgColor }}>
          <div className="rounded-xl p-5 shadow-sm" style={{ backgroundColor: w.surfaceColor, fontFamily: `'${w.fontFamily}', sans-serif` }}>
            <p className="font-extrabold text-xl tracking-tight" style={{ color: w.inkColor }}>
              I turn raw data into <span style={{ color: w.accentColor, fontStyle: 'italic' }}>decisions.</span>
            </p>
            <p className="mt-2 text-sm" style={{ color: w.inkColor, opacity: 0.65 }}>
              This is how body text will read on the public site.
            </p>
            <span className="mt-4 inline-block rounded-full px-5 py-2 text-sm font-semibold text-white" style={{ backgroundColor: w.accentColor }}>
              Primary button
            </span>
          </div>
        </div>
      </SectionCard>

      <SaveActionPanel
        isDirty={form.formState.isDirty}
        isSaving={isSaving}
        onDiscard={() => form.reset()}
        onSave={form.handleSubmit(onSubmit)}
      />
    </form>
  );
}
