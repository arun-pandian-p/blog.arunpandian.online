import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { presets } from './presets';
import type { ThemeState } from '../types';
import { supabase } from '../lib/supabaseClient';

interface ThemeStore {
  theme: ThemeState;
  customPresets: Record<string, Partial<ThemeState>>;
  isSyncing: boolean;
  setTheme: (theme: ThemeState) => void;
  updateColors: (colors: Partial<ThemeState['colors']>) => void;
  updateTypography: (typography: Partial<ThemeState['typography']>) => void;
  updateLayout: (layout: Partial<ThemeState['layout']>) => void;
  applyPreset: (presetName: string) => void;
  saveCustomPreset: (presetName: string, theme: ThemeState) => Promise<boolean>;
  deleteCustomPreset: (presetName: string) => Promise<boolean>;
  loadCustomPresetsFromDb: () => Promise<void>;
  exportThemeJson: () => string;
  importThemeJson: (jsonStr: string) => boolean;
}

// Deep merge helper — ensures missing keys in lightweight presets
// never leave stale values from the previously selected preset.
function isPlainObject(x: any): x is Record<string, any> {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}

function deepMerge<T>(base: T, over: Partial<T>): T {
  if (!isPlainObject(base) || !isPlainObject(over)) {
    return (over === undefined ? base : over) as T;
  }
  const out = { ...base } as any;
  for (const k of Object.keys(over as any)) {
    const bk = (base as any)[k];
    const ok = (over as any)[k];
    out[k] = isPlainObject(bk) && isPlainObject(ok) ? deepMerge(bk, ok) : ok;
  }
  return out as T;
}

// Broadcast to all iframes (Studio → iframe public site)
function broadcastTheme(theme: ThemeState) {
  if (typeof window === 'undefined') return;
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach((iframe) => {
    try {
      iframe.contentWindow?.postMessage({ type: 'SYNC_THEME', theme }, '*');
    } catch (_) {}
  });
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: presets.Default as ThemeState,
      customPresets: {},
      isSyncing: false,

      setTheme: (theme) => {
        set({ theme });
        broadcastTheme(theme);
      },

      updateColors: (colors) =>
        set((state) => {
          const next = { ...state.theme, colors: { ...state.theme.colors, ...colors } };
          broadcastTheme(next);
          return { theme: next };
        }),

      updateTypography: (typography) =>
        set((state) => {
          const next = { ...state.theme, typography: { ...state.theme.typography, ...typography } };
          broadcastTheme(next);
          return { theme: next };
        }),

      updateLayout: (layout) =>
        set((state) => {
          const next = { ...state.theme, layout: { ...state.theme.layout, ...layout } };
          broadcastTheme(next);
          return { theme: next };
        }),

      applyPreset: (presetName: string) => {
        const { customPresets } = get();
        const preset = (presets as Record<string, Partial<ThemeState>>)[presetName] || customPresets[presetName];
        if (!preset) return;
        
        // Merge preset ON TOP OF Default to fill any missing keys
        const full: ThemeState = deepMerge(presets.Default as ThemeState, preset);
        set({ theme: full });
        broadcastTheme(full);
      },

      saveCustomPreset: async (presetName: string, themeState: ThemeState) => {
        if (!presetName.trim()) return false;
        const currentCustom = { ...get().customPresets, [presetName.trim()]: themeState };
        set({ customPresets: currentCustom });
        
        if (supabase) {
          try {
            await supabase.from('site_settings').upsert({
              key: 'custom_presets',
              value: currentCustom,
              updated_at: new Date().toISOString(),
            });
            return true;
          } catch (e) {
            console.warn('Could not save preset to Supabase:', e);
          }
        }
        return true;
      },

      deleteCustomPreset: async (presetName: string) => {
        const currentCustom = { ...get().customPresets };
        delete currentCustom[presetName];
        set({ customPresets: currentCustom });

        if (supabase) {
          try {
            await supabase.from('site_settings').upsert({
              key: 'custom_presets',
              value: currentCustom,
              updated_at: new Date().toISOString(),
            });
            return true;
          } catch (e) {
            console.warn('Could not delete preset from Supabase:', e);
          }
        }
        return true;
      },

      loadCustomPresetsFromDb: async () => {
        if (!supabase) return;
        set({ isSyncing: true });
        try {
          const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'custom_presets')
            .single();

          if (!error && data?.value && typeof data.value === 'object') {
            set({ customPresets: data.value });
          }
        } catch (e) {
          console.warn('Failed to load custom presets:', e);
        } finally {
          set({ isSyncing: false });
        }
      },

      exportThemeJson: () => {
        return JSON.stringify(get().theme, null, 2);
      },

      importThemeJson: (jsonStr: string) => {
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed && parsed.colors && parsed.typography && parsed.layout) {
            const merged = deepMerge(presets.Default as ThemeState, parsed);
            set({ theme: merged });
            broadcastTheme(merged);
            return true;
          }
        } catch {
          // invalid json
        }
        return false;
      },
    }),
    {
      name: 'arun-theme-v3', // bumped for fresh schema synchronization
      partialize: (s) => ({
        theme: s.theme,
        customPresets: s.customPresets,
      }),
    }
  )
);
