import React, { useEffect, useRef } from 'react';
import { useThemeStore } from './store';
import { useContent } from '../context/ContentProvider';
import type { ThemeState } from './presets';

// Accept both the modern ThemeState shape (from the Theme Studio) and the
// legacy flat shape saved by the older Theme settings page, so publishing from
// either place still hydrates the public site correctly.
function normalizeTheme(raw: any, current: ThemeState): ThemeState | null {
  if (!raw || typeof raw !== 'object') return null;

  // Modern shape — has colors object
  if ('colors' in raw && raw.colors?.primary) return raw as ThemeState;

  // Legacy flat shape
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

// Load a Google Font by name into the document head
function loadGoogleFont(fontName: string, id: string): string {
  if (!fontName) return fontName;
  const clean = fontName.split(',')[0].replace(/['"]/g, '').trim();
  if (!clean || clean.toLowerCase().startsWith('system') || clean.toLowerCase().startsWith('arial')) {
    return fontName;
  }
  const linkId = `theme-gfont-${id}`;
  let el = document.getElementById(linkId) as HTMLLinkElement | null;
  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(clean)}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,700&display=swap`;
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
  // live edits the user is making — that race was causing the preview to revert.
  const studioControlledRef = useRef(false);

  // Track if we've done the initial DB hydration so it only happens once.
  const hasHydratedRef = useRef(false);

  // Announce readiness to the parent Studio the moment we mount inside an iframe.
  useEffect(() => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'THEME_STUDIO_READY' }, '*');
    }
  }, []);

  // Hydrate theme from DB on FIRST load only. Once Studio takes control, or once
  // we've already hydrated, skip — this prevents DB settings overwriting preset clicks.
  useEffect(() => {
    // Skip if studio is actively controlling this tab
    if (studioControlledRef.current) return;
    // Only hydrate once — not on every ContentProvider re-render
    if (hasHydratedRef.current) return;
    const next = normalizeTheme(settings?.theme, theme);
    if (next) {
      hasHydratedRef.current = true;
      setTheme(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.theme]);

  // Apply the active theme to CSS custom properties on <html>.
  // This runs on every theme change so live preset switches are instant.
  useEffect(() => {
    const root = document.documentElement;

    // ── Color tokens ─────────────────────────────────────────────────────
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-muted', theme.colors.muted);
    root.style.setProperty('--color-border', theme.colors.border);

    // Alias names used by Tailwind utilities and legacy components
    root.style.setProperty('--color-accent', theme.colors.primary);
    root.style.setProperty('--color-bg', theme.colors.background);
    root.style.setProperty('--color-ink', theme.colors.text);
    root.style.setProperty('--color-ink-soft', theme.colors.muted);
    root.style.setProperty('--color-line', theme.colors.border);

    // ── Typography tokens ─────────────────────────────────────────────────
    const bodyFont = theme.typography.fontFamily || 'Space Grotesk, sans-serif';
    const headFont = theme.typography.headingFont || theme.typography.fontFamily || 'Space Grotesk, sans-serif';

    const bodyStack = loadGoogleFont(bodyFont, 'body');
    const headStack = loadGoogleFont(headFont, 'heading');

    root.style.setProperty('--font-primary', bodyStack);
    root.style.setProperty('--font-sans', bodyStack);
    root.style.setProperty('--font-heading', headStack);
    root.style.setProperty('--font-display', headStack);
    root.style.setProperty('--font-size-base', theme.typography.bodySize || '16px');
    root.style.setProperty('--font-size-heading', theme.typography.headingSize || '48px');
    root.style.setProperty('--font-weight-base', theme.typography.bodyWeight || '400');
    root.style.setProperty('--font-weight-heading', theme.typography.headingWeight || '700');

    // ── Layout tokens ─────────────────────────────────────────────────────
    root.style.setProperty('--radius-base', theme.layout?.radius || '1rem');

    // ── Animation preset class ────────────────────────────────────────────
    const animClass = `awwwards-preset-${theme.layout?.animationStyle || 'default'}`;
    const body = document.body;
    Array.from(body.classList)
      .filter((c) => c.startsWith('awwwards-preset-'))
      .forEach((c) => body.classList.remove(c));
    body.classList.add(animClass);

    // ── Directly set body styles so they win even if Tailwind loads async ─
    body.style.setProperty('background-color', theme.colors.background, 'important');
    body.style.setProperty('color', theme.colors.text, 'important');
    body.style.setProperty('font-family', bodyStack, 'important');
  }, [theme]);

  // Live sync from the Theme Studio (postMessage across iframe boundary).
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_THEME' && event.data.theme) {
        // Mark as studio-controlled so DB re-hydration doesn't overwrite
        studioControlledRef.current = true;
        setTheme(event.data.theme as ThemeState);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setTheme]);

  return <>{children}</>;
};
