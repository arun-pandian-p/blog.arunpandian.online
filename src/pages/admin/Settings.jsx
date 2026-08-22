import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, Trash2, Check, Palette, RotateCcw } from 'lucide-react';
import { TextField, Toggle } from '../../components/admin/ui/FormInputs';
import SaveActionPanel from '../../components/admin/ui/SaveActionPanel';
import SectionCard from '../../components/admin/ui/SectionCard';
import ImageUpload from '../../components/admin/ui/ImageUpload';
import { useSiteSettings } from '../../components/admin/hooks/useSiteSettings';
import { usePreviewSync } from '../../components/admin/preview/usePreviewSync';
import { useThemeStore } from '../../theme/store';
import { presets } from '../../theme/presets';

// Footer fields are FLAT — this is exactly the shape the public footer reads.
const generalSchema = z.object({
  welcome: z.object({
    enabled: z.boolean(),
    name: z.string().min(1, 'Name is required'),
    quote: z.string().min(1, 'Quote is required'),
    inviteTitle: z.string().min(1, 'Invite title is required'),
    inviteSubtitle: z.string().min(1, 'Invite subtitle is required'),
  }),
  footer: z.object({
    name: z.string().min(1, 'Name is required'),
    tagline: z.string(),
    github: z.string().url('Must be a valid URL').or(z.literal('')),
    linkedin: z.string().url('Must be a valid URL').or(z.literal('')),
    email: z.string().email('Must be a valid email').or(z.literal('')),
    copyright: z.string(),
    designYear: z.string(),
  }),
  navbar: z.object({
    ctaLabel: z.string().min(1, 'Label is required'),
    ctaHref: z.string().min(1, 'Link is required'),
  }),
  sections: z.object({
    projects: z.object({
      label: z.string(),
      title: z.string().min(1, 'Title is required'),
      subtitle: z.string(),
    }),
    blog: z.object({
      label: z.string(),
      title: z.string().min(1, 'Title is required'),
    }),
  }),
  branding: z.object({
    logoUrl: z.string().optional(),
    faviconUrl: z.string().optional(),
  }),
});

const emptyDefaults = {
  welcome: { enabled: true, name: '', quote: '', inviteTitle: '', inviteSubtitle: '' },
  footer: { name: '', tagline: '', github: '', linkedin: '', email: '', copyright: '', designYear: '' },
  navbar: { ctaLabel: 'Résumé', ctaHref: '/resume.pdf' },
  sections: {
    projects: { label: '', title: '', subtitle: '' },
    blog: { label: '', title: '' },
  },
  branding: { logoUrl: '', faviconUrl: '' },
};

// ─── Saved Theme CRUD (localStorage) ─────────────────────────────────────────

function isValidHex(hex) {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

function contrastColor(hex) {
  if (!isValidHex(hex)) return '#000';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? '#000000' : '#ffffff';
}

const SAVED_THEMES_KEY = 'design-os-saved-themes';

function loadSavedThemes() {
  try { return JSON.parse(localStorage.getItem(SAVED_THEMES_KEY) || '[]'); } catch { return []; }
}

function persistSavedThemes(themes) {
  localStorage.setItem(SAVED_THEMES_KEY, JSON.stringify(themes));
}

const COLOR_FIELDS = [
  { key: 'primary',    label: 'Accent' },
  { key: 'background', label: 'Background' },
  { key: 'surface',    label: 'Surface' },
  { key: 'text',       label: 'Text' },
  { key: 'muted',      label: 'Muted' },
  { key: 'border',     label: 'Border' },
];

function ThemeCrudPanel() {
  const { theme, applyPreset, updateColors } = useThemeStore();
  const [savedThemes, setSavedThemes] = useState(loadSavedThemes);
  const [saveName, setSaveName] = useState('');
  const [editingColors, setEditingColors] = useState(null); // { id, colors }
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  // Active preset detection
  const activePreset = Object.entries(presets).find(([, p]) =>
    p.colors.primary === theme.colors.primary &&
    p.colors.background === theme.colors.background
  )?.[0] ?? null;

  // Save current theme as named entry
  const handleSave = () => {
    const name = saveName.trim() || `My Theme ${savedThemes.length + 1}`;
    const entry = {
      id: Date.now().toString(),
      name,
      colors: { ...theme.colors },
      typography: { ...theme.typography },
      layout: { ...theme.layout },
      createdAt: new Date().toISOString(),
    };
    const next = [entry, ...savedThemes];
    setSavedThemes(next);
    persistSavedThemes(next);
    setSaveName('');
    showToast(`"${name}" saved!`);
  };

  // Apply a saved theme
  const handleApply = (entry) => {
    updateColors(entry.colors);
    showToast(`Applied "${entry.name}"`);
  };

  // Delete a saved theme
  const handleDelete = (id) => {
    const next = savedThemes.filter((t) => t.id !== id);
    setSavedThemes(next);
    persistSavedThemes(next);
  };

  // Rename
  const handleRename = (id, newName) => {
    const next = savedThemes.map((t) => t.id === id ? { ...t, name: newName } : t);
    setSavedThemes(next);
    persistSavedThemes(next);
  };

  // Update a single color within a saved theme
  const handleUpdateColor = (id, colorKey, value) => {
    const next = savedThemes.map((t) =>
      t.id === id ? { ...t, colors: { ...t.colors, [colorKey]: value } } : t
    );
    setSavedThemes(next);
    persistSavedThemes(next);
  };

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-3 py-2 text-sm font-medium shadow-sm">
          <Check size={14} />
          {toast}
        </div>
      )}

      {/* Built-in presets */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
          <Palette size={14} className="text-blue-500" />
          Built-in Presets
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(presets).map(([name, preset]) => {
            const isActive = activePreset === name;
            return (
              <button
                key={name}
                onClick={() => applyPreset(name)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-200 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex gap-0.5 shrink-0">
                  {[preset.colors.background, preset.colors.primary, preset.colors.text].map((c, i) => (
                    <span key={i} className="h-4 w-4 rounded-full border border-black/10 shadow-sm" style={{ background: c }} />
                  ))}
                </div>
                <span className={`text-xs truncate leading-tight ${isActive ? 'text-blue-700 font-semibold' : 'text-slate-600'}`}>
                  {name.split(' (')[0]}
                </span>
                {isActive && <Check size={12} className="ml-auto shrink-0 text-blue-500" />}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => applyPreset('Default')}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
        >
          <RotateCcw size={12} />
          Reset to Default
        </button>
      </div>

      {/* Save current as named theme */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-slate-700">Save Current Theme</h3>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          {/* Current color preview */}
          <div className="flex items-center gap-2">
            {[theme.colors.background, theme.colors.primary, theme.colors.text, theme.colors.surface, theme.colors.muted, theme.colors.border].map((c, i) => (
              <span key={i} className="h-6 w-6 rounded-full border border-slate-200 shadow-sm" style={{ background: c }} />
            ))}
            <span className="text-xs text-slate-500 ml-1">Current theme</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Theme name (e.g. My Dark Mode)"
              className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 outline-none focus:border-blue-400 transition-colors shadow-sm"
            />
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
            >
              <Plus size={14} />
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Saved themes CRUD */}
      {savedThemes.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-slate-700">
            Saved Themes
            <span className="ml-2 text-xs font-normal text-slate-400">({savedThemes.length})</span>
          </h3>
          <div className="space-y-3">
            {savedThemes.map((entry) => (
              <div
                key={entry.id}
                className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm space-y-3"
              >
                {/* Header row */}
                <div className="flex items-center gap-2">
                  {/* Color swatches */}
                  <div className="flex gap-0.5 shrink-0">
                    {[entry.colors.background, entry.colors.primary, entry.colors.text].map((c, i) => (
                      <span key={i} className="h-5 w-5 rounded-full border border-black/10" style={{ background: c }} />
                    ))}
                  </div>
                  {/* Editable name */}
                  <input
                    type="text"
                    defaultValue={entry.name}
                    onBlur={(e) => handleRename(entry.id, e.target.value.trim() || entry.name)}
                    className="flex-1 text-sm font-semibold text-slate-700 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-400 outline-none transition-colors"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleApply(entry)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Check size={11} /> Apply
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Inline color editors */}
                <div className="grid grid-cols-3 gap-2">
                  {COLOR_FIELDS.map(({ key, label }) => (
                    <div key={key} className="space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1">
                        <div className="relative h-4 w-4 rounded shrink-0 border border-slate-200">
                          <input
                            type="color"
                            value={isValidHex(entry.colors[key]) ? entry.colors[key] : '#888888'}
                            onChange={(e) => handleUpdateColor(entry.id, key, e.target.value)}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                          />
                          <div className="h-full w-full rounded" style={{ background: entry.colors[key] }} />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 truncate">
                          {(entry.colors[key] || '').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-slate-400">
                  Saved {new Date(entry.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {savedThemes.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-4">
          No saved themes yet — customize colors in Theme Studio and save them here.
        </p>
      )}
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

export default function Settings() {
  const { fetchSettings: fetchWelcome, saveSettings: saveWelcome } = useSiteSettings('welcome');
  const { fetchSettings: fetchFooter, saveSettings: saveFooter } = useSiteSettings('footer');
  const { fetchSettings: fetchSections, saveSettings: saveSections } = useSiteSettings('sections');
  const { fetchSettings: fetchNavbar, saveSettings: saveNavbar } = useSiteSettings('navbar');
  const { fetchSettings: fetchBranding, saveSettings: saveBranding } = useSiteSettings('branding');
  const [isSaving, setIsSaving] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  const form = useForm({
    resolver: zodResolver(generalSchema),
    defaultValues: emptyDefaults,
  });

  usePreviewSync(form, (v) => ({
    settings: {
      welcome: { ...v.welcome, quotes: v.welcome?.quote ? [v.welcome.quote] : [] },
      footer: v.footer,
      navbar: v.navbar,
      sections: v.sections,
      branding: v.branding,
    },
  }));

  useEffect(() => {
    Promise.all([fetchWelcome(), fetchFooter(), fetchSections(), fetchNavbar(), fetchBranding()]).then(([welcomeData, footerData, sectionsData, navbarData, brandingData]) => {
      const mappedWelcome = welcomeData
        ? {
            enabled: welcomeData.enabled ?? true,
            name: welcomeData.name || '',
            quote: welcomeData.quote || (welcomeData.quotes && welcomeData.quotes[0]) || '',
            inviteTitle: welcomeData.inviteTitle || '',
            inviteSubtitle: welcomeData.inviteSubtitle || '',
          }
        : emptyDefaults.welcome;

      const mappedFooter = footerData
        ? {
            name: footerData.name || '',
            tagline: footerData.tagline || '',
            github: footerData.github || footerData.links?.github || '',
            linkedin: footerData.linkedin || footerData.links?.linkedin || '',
            email: footerData.email || '',
            copyright: footerData.copyright || '',
            designYear: footerData.designYear || '',
          }
        : emptyDefaults.footer;

      form.reset({
        welcome: mappedWelcome,
        footer: mappedFooter,
        navbar: { ...emptyDefaults.navbar, ...navbarData },
        sections: {
          projects: { ...emptyDefaults.sections.projects, ...sectionsData?.projects },
          blog: { ...emptyDefaults.sections.blog, ...sectionsData?.blog },
        },
        branding: { ...emptyDefaults.branding, ...brandingData },
      });
      setInitLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (values) => {
    setIsSaving(true);
    const welcomePayload = {
      ...values.welcome,
      quotes: [values.welcome.quote],
    };
    const results = await Promise.all([
      saveWelcome(welcomePayload),
      saveFooter(values.footer),
      saveSections(values.sections),
      saveNavbar(values.navbar),
      saveBranding(values.branding),
    ]);
    if (results.every(Boolean)) {
      form.reset(values);
    }
    setIsSaving(false);
  };

  if (initLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={24} /></div>;
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl space-y-8 pb-32">
      <div>
        <h1 className="font-bold text-2xl text-slate-800">General Settings</h1>
        <p className="text-slate-500 mt-1 text-sm">Configure the welcome screen, section headers and footer.</p>
      </div>

      {/* ── Theme Colors CRUD ── */}
      <SectionCard title="Theme Colors" description="Apply built-in presets or save your own custom color themes.">
        <ThemeCrudPanel />
      </SectionCard>

      <SectionCard title="Branding">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUpload
            label="Site Logo"
            folder="branding"
            url={form.watch('branding.logoUrl')}
            onUpload={(url) => form.setValue('branding.logoUrl', url, { shouldDirty: true })}
          />
          <ImageUpload
            label="Site Favicon"
            folder="branding"
            url={form.watch('branding.faviconUrl')}
            onUpload={(url) => form.setValue('branding.faviconUrl', url, { shouldDirty: true })}
          />
        </div>
      </SectionCard>

      <SectionCard title="Welcome Screen">
        <div className="space-y-6">
          <Toggle
            label="Enable Welcome Screen"
            description="Show a brief animated intro before revealing the portfolio."
            checked={form.watch('welcome.enabled')}
            onChange={(val) => form.setValue('welcome.enabled', val, { shouldDirty: true })}
          />
          <div className="h-px bg-slate-100" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              label="Branding Name"
              placeholder="e.g. Arun Pandian · Data Analyst"
              {...form.register('welcome.name')}
              error={form.formState.errors.welcome?.name?.message}
            />
            <TextField
              label="Welcome Screen Quote"
              placeholder="e.g. I turn messy data into clear decisions."
              {...form.register('welcome.quote')}
              error={form.formState.errors.welcome?.quote?.message}
            />
            <TextField
              label="Invitation Title"
              placeholder="e.g. Pleasure to have you here."
              {...form.register('welcome.inviteTitle')}
              error={form.formState.errors.welcome?.inviteTitle?.message}
            />
            <TextField
              label="Invitation Subtitle"
              placeholder="e.g. Let's turn data into decisions — and connect."
              {...form.register('welcome.inviteSubtitle')}
              error={form.formState.errors.welcome?.inviteSubtitle?.message}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Navbar" description="Navigation links follow the page sections automatically; the call-to-action button is editable.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField label="CTA Button Label" placeholder="Résumé" {...form.register('navbar.ctaLabel')} error={form.formState.errors.navbar?.ctaLabel?.message} />
          <TextField label="CTA Button Link" placeholder="/resume.pdf" {...form.register('navbar.ctaHref')} error={form.formState.errors.navbar?.ctaHref?.message} />
        </div>
      </SectionCard>

      <SectionCard title="Section Headers">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-slate-700">Projects section</h3>
            <TextField label="Eyebrow label" placeholder="04 — Selected Work" {...form.register('sections.projects.label')} error={form.formState.errors.sections?.projects?.label?.message} />
            <TextField label="Title" placeholder="Recruiter-ready case studies" {...form.register('sections.projects.title')} error={form.formState.errors.sections?.projects?.title?.message} />
            <TextField label="Subtitle" placeholder="Quality over quantity…" {...form.register('sections.projects.subtitle')} error={form.formState.errors.sections?.projects?.subtitle?.message} />
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-slate-700">Blog section</h3>
            <TextField label="Eyebrow label" placeholder="05 — Writing" {...form.register('sections.blog.label')} error={form.formState.errors.sections?.blog?.label?.message} />
            <TextField label="Title" placeholder="Notes on the process" {...form.register('sections.blog.title')} error={form.formState.errors.sections?.blog?.title?.message} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Footer">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField label="Display Name" placeholder="Arun Pandian" {...form.register('footer.name')} error={form.formState.errors.footer?.name?.message} />
          <TextField label="Tagline" placeholder="Data Analyst — SQL · Python · Power BI…" {...form.register('footer.tagline')} error={form.formState.errors.footer?.tagline?.message} />
          <TextField label="Copyright Text" placeholder="Built with React · Supabase." {...form.register('footer.copyright')} error={form.formState.errors.footer?.copyright?.message} />
          <TextField label="Design Year" placeholder="2026" {...form.register('footer.designYear')} error={form.formState.errors.footer?.designYear?.message} />
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="font-semibold text-sm text-slate-700">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField label="GitHub URL" {...form.register('footer.github')} error={form.formState.errors.footer?.github?.message} />
            <TextField label="LinkedIn URL" {...form.register('footer.linkedin')} error={form.formState.errors.footer?.linkedin?.message} />
            <TextField label="Contact Email" {...form.register('footer.email')} error={form.formState.errors.footer?.email?.message} />
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
