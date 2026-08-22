import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ───────────────────────────────────────────────────
export type EditKind = 'text' | 'heading' | 'button' | 'link' | 'image' | 'container' | 'section';

export type DeviceMode = 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'custom';

export interface Crumb {
  id: string;
  name: string;
}

export interface SelectedInfo {
  id: string;
  name: string;
  kind: EditKind;
  path?: string; // content path e.g. "hero.subtitle"
  text?: string; // current text content (for the Content tab)
  breadcrumb: Crumb[];
  computed: Record<string, string>; // baseline computed CSS (kebab-case props)
}

// Per-element style overrides. CSS property names are kebab-case with units included.
export type StyleMap = Record<string, string>;
export type OverrideMap = Record<string, StyleMap>;
// Content drafts keyed by site_settings key, e.g. { hero: { subtitle: '...' } }
export type ContentDraft = Record<string, any>;

interface Snapshot {
  overrides: OverrideMap;
  content: ContentDraft;
}

interface EditorState {
  // Runtime
  enabled: boolean;
  device: DeviceMode;
  customWidth: number;
  showGuides: boolean;

  // Selection (populated from the iframe runtime)
  selected: SelectedInfo | null;
  selectRequestId: string | null; // set by admin to programmatically select in the iframe
  paletteOpen: boolean;

  // Persisted edit data
  overrides: OverrideMap;
  content: ContentDraft;

  // History
  past: Snapshot[];
  future: Snapshot[];

  // Actions — runtime
  setEnabled: (v: boolean) => void;
  toggleEnabled: () => void;
  setDevice: (d: DeviceMode) => void;
  setCustomWidth: (w: number) => void;
  toggleGuides: () => void;
  setSelected: (s: SelectedInfo | null) => void;
  requestSelect: (id: string | null) => void;
  setPaletteOpen: (v: boolean) => void;

  // Actions — editing (history-tracked)
  setStyle: (id: string, prop: string, value: string | null) => void;
  clearElementStyles: (id: string) => void;
  setContent: (path: string, value: any) => void;
  addCustomElement: (section: string, kind: EditKind, name: string, value: string, href?: string) => void;
  deleteCustomElement: (id: string) => void;

  // History
  undo: () => void;
  redo: () => void;
  resetEdits: () => void;
}

// ── Helpers ─────────────────────────────────────────────────
function deepSet(obj: any, path: string, value: any): any {
  const keys = path.split('.');
  const root = { ...(obj || {}) };
  let cur: any = root;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    cur[k] = { ...(cur[k] || {}) };
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return root;
}

const HISTORY_LIMIT = 100;

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => {
      // Push current edit data onto the undo stack before mutating.
      const snapshot = (): Snapshot => ({
        overrides: JSON.parse(JSON.stringify(get().overrides)),
        content: JSON.parse(JSON.stringify(get().content)),
      });
      const commit = (mutate: (s: Snapshot) => Snapshot) => {
        const before = snapshot();
        const after = mutate(before);
        set({
          overrides: after.overrides,
          content: after.content,
          past: [...get().past, before].slice(-HISTORY_LIMIT),
          future: [],
        });
      };

      return {
        enabled: false,
        device: 'desktop',
        customWidth: 1024,
        showGuides: true,

        selected: null,
        selectRequestId: null,
        paletteOpen: false,

        overrides: {},
        content: {},
        past: [],
        future: [],

        setEnabled: (v) => set({ enabled: v, selected: v ? get().selected : null }),
        toggleEnabled: () => set({ enabled: !get().enabled, selected: null }),
        setDevice: (d) => set({ device: d }),
        setCustomWidth: (w) => set({ customWidth: w }),
        toggleGuides: () => set({ showGuides: !get().showGuides }),
        setSelected: (s) => set({ selected: s }),
        requestSelect: (id) => set({ selectRequestId: id }),
        setPaletteOpen: (v) => set({ paletteOpen: v }),

        setStyle: (id, prop, value) =>
          commit((snap) => {
            const style: StyleMap = { ...(snap.overrides[id] || {}) };
            if (value === null || value === '') delete style[prop];
            else style[prop] = value;
            const overrides = { ...snap.overrides, [id]: style };
            if (Object.keys(style).length === 0) delete overrides[id];
            return { ...snap, overrides };
          }),

        clearElementStyles: (id) =>
          commit((snap) => {
            const overrides = { ...snap.overrides };
            delete overrides[id];
            return { ...snap, overrides };
          }),

        setContent: (path, value) =>
          commit((snap) => {
            const [key, ...rest] = path.split('.');
            const keyObj = rest.length
              ? deepSet(snap.content[key] || {}, rest.join('.'), value)
              : value;
            return { ...snap, content: { ...snap.content, [key]: keyObj } };
          }),

        addCustomElement: (section, kind, name, value, href) =>
          commit((snap) => {
            const id = `custom_el_${Date.now()}`;
            const customList = { ...(snap.content.custom_elements || {}) };
            customList[id] = {
              id,
              section,
              kind,
              name,
              value,
              href: href || '',
              path: `custom_elements.${id}.value`,
              order: Object.keys(customList).length + 1,
            };
            return { ...snap, content: { ...snap.content, custom_elements: customList } };
          }),

        deleteCustomElement: (id) =>
          commit((snap) => {
            const customList = { ...(snap.content.custom_elements || {}) };
            delete customList[id];
            const overrides = { ...snap.overrides };
            delete overrides[id];
            return { ...snap, content: { ...snap.content, custom_elements: customList }, overrides };
          }),

        undo: () => {
          const { past, future } = get();
          if (past.length === 0) return;
          const prev = past[past.length - 1];
          const current: Snapshot = snapshot();
          set({
            overrides: prev.overrides,
            content: prev.content,
            past: past.slice(0, -1),
            future: [current, ...future].slice(0, HISTORY_LIMIT),
          });
        },

        redo: () => {
          const { past, future } = get();
          if (future.length === 0) return;
          const next = future[0];
          const current: Snapshot = snapshot();
          set({
            overrides: next.overrides,
            content: next.content,
            past: [...past, current].slice(-HISTORY_LIMIT),
            future: future.slice(1),
          });
        },

        resetEdits: () =>
          set({ overrides: {}, content: {}, past: [], future: [], selected: null }),
      };
    },
    {
      name: 'canvas-editor',
      partialize: (s) => ({
        overrides: s.overrides,
        content: s.content,
        device: s.device,
        customWidth: s.customWidth,
        showGuides: s.showGuides,
      }),
    }
  )
);

// ── Element effect keyframes (named after their source websites) ──
// vs-float / vs-bounce  → drinkjoyrush.com floating cans & clouds
// vs-spin               → k95.it orbiting thumbnails
// vs-pulse              → rideradian.com glow pulse
// vs-glitch             → retro-cyber jitter
// vs-wiggle             → juliencalot.com playful tilt
export const EFFECT_KEYFRAMES = `
@keyframes vs-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes vs-bounce { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-6px) scale(1.02); } }
@keyframes vs-spin { to { transform: rotate(360deg); } }
@keyframes vs-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }
@keyframes vs-glitch { 0%,100% { transform: translate(0,0); } 20% { transform: translate(-2px,1px); } 40% { transform: translate(2px,-1px); } 60% { transform: translate(-1px,-2px); } 80% { transform: translate(1px,2px); } }
@keyframes vs-wiggle { 0%,100% { transform: rotate(-1.5deg); } 50% { transform: rotate(1.5deg); } }
`;

// Build a CSS string that applies the given overrides via [data-edit-id] selectors.
// Props prefixed with "hover:" compile into a :hover rule (used by the Effects tab).
export function overridesToCss(overrides: OverrideMap): string {
  let usesEffects = false;
  const rules = Object.entries(overrides)
    .map(([id, style]) => {
      const base: string[] = [];
      const hover: string[] = [];
      for (const [prop, val] of Object.entries(style)) {
        if (String(val).includes('vs-')) usesEffects = true;
        if (prop.startsWith('hover:')) hover.push(`${prop.slice(6)}: ${val} !important;`);
        else base.push(`${prop}: ${val} !important;`);
      }
      const safe = id.replace(/"/g, '\\"');
      let rule = base.length ? `[data-edit-id="${safe}"] { ${base.join(' ')} }` : '';
      if (hover.length) rule += `\n[data-edit-id="${safe}"]:hover { ${hover.join(' ')} }`;
      return rule;
    })
    .filter(Boolean)
    .join('\n');
  return (usesEffects ? EFFECT_KEYFRAMES : '') + rules;
}
