import React, { useState } from 'react';
import { Search, Loader2, Globe, CheckCircle2, AlertCircle, Link, Palette, Type, Grid, Wand2 } from 'lucide-react';
import { useThemeStore } from '../../../theme/store';

import { supabase } from '../../../lib/supabaseClient';

// ── Design pattern categories returned from the scraper API ──
interface DesignBlueprint {
  url: string;
  colors: { dominant: string[]; accent: string[] };
  fonts: string[];
  metrics: { symmetry: number; density: number; complexity: number; economy: number };
  components: { type: string; html: string; css: string }[];
}

// ── Call the local Node.js / Playwright API ──
async function analyzeUrl(url: string): Promise<DesignBlueprint> {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const res = await fetch(`${apiUrl}/api/design-scrape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned ${res.status}. Is the scraper API running?`);
  }

  return await res.json();
}

export default function ScraperPanel() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DesignBlueprint | null>(null);
  const [error, setError] = useState('');
  const { updateColors, updateTypography, updateLayout } = useThemeStore();

  const analyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const normalized = url.startsWith('http') ? url : `https://${url}`;
      const blueprint = await analyzeUrl(normalized);
      setResult(blueprint);
    } catch (e: any) {
      if (e.name === 'TypeError' && e.message?.includes('fetch')) {
        setError('Scraper API is offline. To use AI Scraping, start the scraper server (cd scraper-api && npm start) or configure VITE_API_URL.');
      } else {
        setError(e.message || 'Could not reach the URL. Try another site.');
      }
    } finally {
      setLoading(false);
    }
  };

  const applyColor = (bg: string, accent: string) => {
    updateColors({ background: bg, primary: accent, text: '#111', surface: '#fff' });
  };

  const applyFonts = (heading: string, body: string) => {
    updateTypography({ headingFont: heading, fontFamily: body });
  };

  const applyAll = () => {
    if (!result) return;
    if (result.colors.dominant[0]) applyColor(result.colors.dominant[0], result.colors.accent[0] || result.colors.dominant[0]);
    if (result.fonts[0]) applyFonts(result.fonts[0], result.fonts[1] || result.fonts[0]);
  };

  const [saving, setSaving] = useState(false);
  const saveToSupabase = async () => {
    if (!result) return;
    setSaving(true);
    try {
      if (!supabase) throw new Error('Supabase client is not configured.');
      const { error: dbError } = await supabase.from('design_scrapes').insert([{
        url: result.url,
        colors: result.colors,
        fonts: result.fonts,
        metrics: result.metrics,
        components: result.components
      }]);
      if (dbError) throw dbError;
      alert('Saved to Supabase successfully!');
    } catch (e: any) {
      alert('Failed to save: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Wand2 size={14} className="text-purple-400" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300">AI Inspiration Scraper</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Paste any website URL to extract its design patterns — colors, fonts, layouts, animations. No assets are copied.
        </p>
      </div>

      {/* URL Input */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-[#111] border border-[#2a2a2a] rounded-lg focus-within:border-blue-500 transition-colors">
          <Globe size={13} className="text-slate-500 shrink-0" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && analyze()}
            placeholder="https://example.com"
            className="flex-1 bg-transparent text-[12px] text-slate-200 placeholder-slate-600 outline-none"
          />
        </div>
        <button
          onClick={analyze}
          disabled={loading || !url.trim()}
          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-[11px] font-semibold text-white shrink-0"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
          {loading ? 'Analyzing…' : 'Analyze'}
        </button>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-1.5">
        {['pelizzari.com', 'karolbinkow.ski', 'haoqi.design', 'vividmotion.co', 'tol.is', 'pxpush.com'].map((site) => (
          <button key={site} onClick={() => { setUrl(`https://${site}`); }}
            className="px-2 py-1 text-[10px] rounded border border-[#2a2a2a] text-slate-500 hover:text-slate-200 hover:border-[#3a3a3a] transition-all">
            {site}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-red-300">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="relative">
            <div className="h-10 w-10 rounded-full border-2 border-[#2a2a2a] border-t-purple-500 animate-spin" />
            <Globe size={14} className="absolute inset-0 m-auto text-purple-400" />
          </div>
          <p className="text-[11px] text-slate-500">Extracting design metadata…</p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span className="text-[11px] font-semibold text-slate-300">Blueprint extracted</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={saveToSupabase} disabled={saving}
                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] text-slate-300 transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Save to DB'}
              </button>
              <button onClick={applyAll}
                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors">
                Apply All
              </button>
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Palette size={11} className="text-slate-500" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Detected Colors</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {result.colors.dominant.map((bg, i) => (
                <button key={i} onClick={() => applyColor(bg, result.colors.accent[i] || bg)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-[#2a2a2a] hover:border-purple-500/50 transition-all">
                  <div className="flex gap-1">
                    <span className="h-4 w-4 rounded-full border border-white/10" style={{ background: bg }} />
                    <span className="h-4 w-4 rounded-full border border-white/10" style={{ background: result.colors.accent[i] || bg }} />
                  </div>
                  <span className="text-[10px] text-slate-500 hover:text-slate-300">Apply</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fonts */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Type size={11} className="text-slate-500" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Detected Fonts</span>
            </div>
            {result.fonts.map((f, i) => (
              <button key={i} onClick={() => applyFonts(f, f)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-[#2a2a2a] hover:border-purple-500/50 text-left transition-all">
                <p className="text-[11px] text-slate-300">{f}</p>
                <span className="text-[10px] text-purple-400">Apply</span>
              </button>
            ))}
          </div>

          {/* Detected Components */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Grid size={11} className="text-slate-500" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Extracted Components</span>
            </div>
            <div className="flex flex-col gap-2">
              {result.components.length === 0 ? (
                <p className="text-[10px] text-slate-500">No recognizable components found.</p>
              ) : (
                result.components.map((c, i) => (
                  <div key={i} className="p-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
                    <span className="text-[10px] text-slate-400 block mb-1">Type: {c.type}</span>
                    <div className="text-[9px] font-mono text-slate-500 overflow-x-auto whitespace-nowrap pb-1">
                      {c.css}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Design Metadata */}
          <div className="space-y-1.5 p-3 rounded-lg bg-[#111] border border-[#1f1f1f]">
            {[
              ['Symmetry Score', result.metrics.symmetry],
              ['Density Score', result.metrics.density],
              ['Complexity Score', result.metrics.complexity],
              ['Economy Score', result.metrics.economy],
            ].map(([key, val]) => (
              <div key={key as string} className="flex items-center justify-between text-[10px]">
                <span className="text-slate-600">{key}</span>
                <span className="text-slate-300 font-mono">{val}</span>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <p className="text-[10px] text-slate-600 italic">
            Only design metadata extracted. No images, logos, text or copyrighted assets are copied.
          </p>
        </div>
      )}
    </div>
  );
}
