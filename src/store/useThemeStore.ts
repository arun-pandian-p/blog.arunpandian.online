import { create } from 'zustand';

export interface ThemeTokens {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  typography: {
    fontFamilyHeading: string;
    fontFamilyBody: string;
    baseSize: string;
  };
  spacing: {
    container: string;
  };
}

interface ThemeState {
  tokens: ThemeTokens;
  updateTokens: (updates: Partial<ThemeTokens>) => void;
  updateColor: (key: keyof ThemeTokens['colors'], value: string) => void;
}

const defaultTokens: ThemeTokens = {
  colors: {
    primary: '#000000',
    secondary: '#ffffff',
    background: '#ffffff',
    foreground: '#09090b',
    muted: '#f4f4f5',
    border: '#e4e4e7',
  },
  typography: {
    fontFamilyHeading: 'Inter, sans-serif',
    fontFamilyBody: 'Inter, sans-serif',
    baseSize: '16px',
  },
  spacing: {
    container: '1200px',
  },
};

export const useThemeStore = create<ThemeState>((set) => ({
  tokens: defaultTokens,
  updateTokens: (updates) =>
    set((state) => ({ tokens: { ...state.tokens, ...updates } })),
  updateColor: (key, value) =>
    set((state) => ({
      tokens: {
        ...state.tokens,
        colors: { ...state.tokens.colors, [key]: value },
      },
    })),
}));
