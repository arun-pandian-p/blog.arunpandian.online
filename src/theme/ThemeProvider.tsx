import React, { useEffect, useRef } from 'react';
import { useThemeStore } from './store';
import { useContent } from '../context/ContentProvider';
import type { ThemeState } from './presets';

// Accept both the modern ThemeState shape (from the Theme Studio) and the
// legacy flat shape saved by the older Theme settings page, so publishing from
// either place still hydrates the public site correctly.
function normalizeTheme(raw: any, current: ThemeState): ThemeState | null {
  if (!raw || typeof raw !== 'object') return null;

  if ('colors' in raw) return raw as ThemeState;

  if ('accentColor' in raw || 'bgColor' in raw || 'inkColor' in raw) {
    return {
      colors: {
        primary: raw.accentColor ?? current.colors.primary,
        background: raw.bgColor ?? current.colors.background,
        surface: raw.surfaceColor ?? current.colors.surface,
        text: raw.inkColor ?? current.colors.text,
        muted: current.colors.muted,
        border: current.colors.border,
      },
      typography: {
        fontFamily: raw.fontFamily ? `${raw.fontFamily}, sans-serif` : current.typography.fontFamily,
        headingFont: current.typography.headingFont,
        bodySize: current.typography.bodySize,
        headingSize: current.typography.headingSize,
        bodyWeight: current.typography.bodyWeight,
        headingWeight: current.typography.headingWeight,
      },
      layout: current.layout,
    };
  }

  return null;
}

// ── Load a Google Font by name into the document head ──────────────────────
function loadGoogleFont(fontName: string, id: string) {
  if (!fontName) return;
  const clean = fontName.split(',')[0].replace(/['"]/g, '').trim();
  if (!clean || clean.toLowerCase().startsWith('system') || clean.toLowerCase().startsWith('arial')) return;
  const linkId = `theme-gfont-${id}`;
  let el = document.getElementById(linkId) as HTMLLinkElement | null;
  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(clean)}:wght@300;400;500;600;700;800;900&display=swap`;
  if (!el) {
    el = document.createElement('link');
    el.id = linkId;
    el.rel = 'stylesheet';
    document.head.appendChild(el);
  }
  if (el.href !== href) el.href = href;
  return `'${clean}', system-ui, sans-serif`;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, setTheme } = useThemeStore();
  const { settings } = useContent() as any;

  // True once this tab is being driven live by the Theme Studio (via postMessage).
  // While studio-controlled we must NOT let the async DB hydration overwrite the
  // live edits the user is dragging — that race is what made the preview "revert".
  const studioControlledRef = useRef(false);

  // Announce readiness to the parent Studio the moment we mount inside an iframe,
  // so it pushes the current theme immediately (before the DB fetch resolves).
  useEffect(() => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'THEME_STUDIO_READY' }, '*');
    }
  }, []);

  // Hydrate theme from the database (via ContentProvider) on load or when another
  // client publishes an update. Skipped while the Studio is driving this tab live.
  useEffect(() => {
    if (studioControlledRef.current) return;
    const next = normalizeTheme(settings?.theme, theme);
    if (next) {
      setTheme(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.theme, setTheme]);

  // Apply the active theme to CSS variables on <html> — including font loading.
  useEffect(() => {
    const root = document.documentElement;

    // ── Color tokens ──────────────────────────────────────────────────────
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-muted', theme.colors.muted);
    root.style.setProperty('--color-border', theme.colors.border);

    // Legacy variables mapped to Tailwind utilities
    root.style.setProperty('--color-accent', theme.colors.primary);
    root.style.setProperty('--color-bg', theme.colors.background);
    root.style.setProperty('--color-ink', theme.colors.text);
    root.style.setProperty('--color-ink-soft', theme.colors.muted);
    root.style.setProperty('--color-line', theme.colors.border);

    // ── Typography tokens ─────────────────────────────────────────────────
    // Load Google Fonts and resolve font stacks
    const bodyStack = loadGoogleFont(theme.typography.fontFamily, 'body') || theme.typography.fontFamily;
    const headingStack = loadGoogleFont(theme.typography.headingFont, 'heading') || theme.typography.headingFont;

    root.style.setProperty('--font-primary', bodyStack);
    root.style.setProperty('--font-sans', bodyStack);
    root.style.setProperty('--font-heading', headingStack);
    root.style.setProperty('--font-display', headingStack);
    root.style.setProperty('--font-size-base', theme.typography.bodySize);
    root.style.setProperty('--font-size-heading', theme.typography.headingSize);
    root.style.setProperty('--font-weight-base', theme.typography.bodyWeight);
    root.style.setProperty('--font-weight-heading', theme.typography.headingWeight);

    // ── Layout tokens ─────────────────────────────────────────────────────
    root.style.setProperty('--radius-base', theme.layout.radius || '1rem');

    // ── Animation preset class ────────────────────────────────────────────
    // Remove any previous preset class then apply the current one so that
    // awwwards-preset-* CSS rules in HomePage activate instantly.
    const animClass = `awwwards-preset-${theme.layout?.animationStyle || 'default'}`;
    const body = document.body;
    Array.from(body.classList)
      .filter((c) => c.startsWith('awwwards-preset-'))
      .forEach((c) => body.classList.remove(c));
    body.classList.add(animClass);
  }, [theme]);

  // Live sync from the Theme Studio (postMessage across the iframe boundary).
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_THEME' && event.data.theme) {
        studioControlledRef.current = true;
        setTheme(event.data.theme as ThemeState);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setTheme]);

  return <>{children}</>;
};
