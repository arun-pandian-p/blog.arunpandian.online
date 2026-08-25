import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { presets } from './presets';
import type { ThemeState } from './presets';

interface ThemeStore {
  theme: ThemeState;
  setTheme: (theme: ThemeState) => void;
  updateColors: (colors: Partial<ThemeState['colors']>) => void;
  updateTypography: (typography: Partial<ThemeState['typography']>) => void;
  updateLayout: (layout: Partial<ThemeState['layout']>) => void;
  applyPreset: (presetName: string) => void;
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
    (set) => ({
      theme: presets.Default,

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
        const preset = presets[presetName];
        if (!preset) return;
        // Merge preset ON TOP OF Default to fill any missing keys
        // so switching presets never leaves stale layout values behind.
        const full: ThemeState = deepMerge(presets.Default, preset);
        set({ theme: full });
        broadcastTheme(full);
      },
    }),
    {
      name: 'arun-theme-v2', // bumped so stale persisted data is discarded
    }
  )
);
