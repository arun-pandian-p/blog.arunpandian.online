import { useEffect } from 'react';
import { useContent } from '../context/ContentProvider';
import { overridesToCss } from './editorStore';
import { ensureFontsFromCss } from './fonts';

/**
 * Injects saved per-element style overrides (settings.editorOverrides) into the
 * document so visual edits made in the Canvas editor show on the public site.
 * Runs on every page (public + preview). Live edits use a separate style tag.
 */
export default function StyleOverrides() {
  const { settings } = useContent() as any;
  const overrides = settings?.editorOverrides;

  useEffect(() => {
    const id = 'canvas-saved-overrides';
    let tag = document.getElementById(id) as HTMLStyleElement | null;
    if (!overrides || Object.keys(overrides).length === 0) {
      if (tag) tag.textContent = '';
      return;
    }
    if (!tag) {
      tag = document.createElement('style');
      tag.id = id;
      document.head.appendChild(tag);
    }
    const css = overridesToCss(overrides);
    tag.textContent = css;
    ensureFontsFromCss(css);
  }, [overrides]);

  return null;
}
