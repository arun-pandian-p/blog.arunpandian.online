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

function broadcastTheme(theme: ThemeState) {
  if (typeof window !== 'undefined') {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach((iframe) => {
      iframe.contentWindow?.postMessage({ type: 'SYNC_THEME', theme }, '*');
    });
  }
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
      applyPreset: (presetName) => {
        const preset = presets[presetName];
        if (preset) {
          set({ theme: preset });
          broadcastTheme(preset);
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
