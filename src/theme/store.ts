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

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: presets.Default,
      setTheme: (theme) => set({ theme }),
      updateColors: (colors) => set((state) => ({ theme: { ...state.theme, colors: { ...state.theme.colors, ...colors } } })),
      updateTypography: (typography) => set((state) => ({ theme: { ...state.theme, typography: { ...state.theme.typography, ...typography } } })),
      updateLayout: (layout) => set((state) => ({ theme: { ...state.theme, layout: { ...state.theme.layout, ...layout } } })),
      applyPreset: (presetName) => {
        const preset = presets[presetName];
        if (preset) {
          set({ theme: preset });
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
