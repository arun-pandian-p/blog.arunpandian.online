import { useEffect, useRef } from 'react';
import { ensureFontsFromCss } from './fonts';

/**
 * CanvasRuntime runs INSIDE the preview iframe (the public site).
 * It turns the page into an editable canvas when the admin enables Edit Mode.
 *
 * Protocol (admin -> iframe):
 *   { type: 'EDITOR_MODE',   enabled }
 *   { type: 'EDITOR_STYLE',  css }            // live per-element override CSS
 *   { type: 'EDITOR_SELECT', id }             // programmatic selection / focus
 *
 * Protocol (iframe -> admin):
 *   { type: 'EDITOR_SELECTED', info }         // SelectedInfo payload
 *   { type: 'EDITOR_CONTENT',  path, value }  // inline text edit committed
 *   { type: 'EDITOR_CLEARED' }                // selection cleared
 */

const CAPTURE_PROPS = [
  'color', 'background-color', 'font-family', 'font-size', 'font-weight',
  'letter-spacing', 'line-height', 'text-align', 'text-transform',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'border-radius', 'opacity', 'box-shadow', 'border-top-width', 'border-color',
  'width', 'height', 'display',
];

const EDITABLE_KINDS = new Set(['text', 'heading', 'button', 'link']);

export default function CanvasRuntime() {
  const enabledRef = useRef(false);
  const selectedElRef = useRef<HTMLElement | null>(null);
  const hoverElRef = useRef<HTMLElement | null>(null);
  const editingRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ── Overlay layer (plain DOM so it never intercepts clicks) ──
    const layer = document.createElement('div');
    layer.setAttribute('data-canvas-overlay', '');
    Object.assign(layer.style, {
      position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '2147483000',
    } as CSSStyleDeclaration);

    const mkBox = (color: string) => {
      const b = document.createElement('div');
      Object.assign(b.style, {
        position: 'fixed', boxSizing: 'border-box', border: `1.5px solid ${color}`,
        borderRadius: '2px', display: 'none', pointerEvents: 'none',
        transition: 'none',
      } as CSSStyleDeclaration);
      layer.appendChild(b);
      return b;
    };
    const hoverBox = mkBox('rgba(59,130,246,0.7)');
    const selBox = mkBox('#2563EB');
    selBox.style.borderWidth = '2px';
    selBox.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.6)';

    const label = document.createElement('div');
    Object.assign(label.style, {
      position: 'fixed', display: 'none', pointerEvents: 'none',
      background: '#2563EB', color: '#fff', font: '600 11px/1 ui-sans-serif, system-ui',
      padding: '3px 6px', borderRadius: '4px', whiteSpace: 'nowrap', zIndex: '2147483001',
      transform: 'translateY(-100%)',
    } as CSSStyleDeclaration);
    layer.appendChild(label);

    const styleTag = document.createElement('style');
    styleTag.id = 'canvas-live-overrides';
    document.head.appendChild(styleTag);
    document.body.appendChild(layer);

    // ── Helpers ──
    const findEditable = (target: EventTarget | null): HTMLElement | null => {
      if (!(target instanceof Element)) return null;
      const el = target.closest('[data-edit-id]');
      return el instanceof HTMLElement ? el : null;
    };

    const nameOf = (el: HTMLElement) =>
      el.getAttribute('data-edit-name') || el.getAttribute('data-edit-kind') || el.tagName.toLowerCase();

    const kindOf = (el: HTMLElement) => (el.getAttribute('data-edit-kind') || 'container');

    const positionBox = (box: HTMLElement, el: HTMLElement | null) => {
      if (!el || !el.isConnected) { box.style.display = 'none'; return; }
      const r = el.getBoundingClientRect();
      box.style.display = 'block';
      box.style.left = `${r.left}px`;
      box.style.top = `${r.top}px`;
      box.style.width = `${r.width}px`;
      box.style.height = `${r.height}px`;
    };

    const positionLabel = (el: HTMLElement | null) => {
      if (!el || !el.isConnected) { label.style.display = 'none'; return; }
      const r = el.getBoundingClientRect();
      label.style.display = 'block';
      label.textContent = nameOf(el);
      label.style.left = `${r.left}px`;
      label.style.top = `${Math.max(r.top - 4, 12)}px`;
    };

    const buildBreadcrumb = (el: HTMLElement) => {
      const chain: { id: string; name: string }[] = [];
      let node: HTMLElement | null = el;
      while (node) {
        if (node.hasAttribute('data-edit-id')) {
          chain.unshift({ id: node.getAttribute('data-edit-id')!, name: nameOf(node) });
        }
        node = node.parentElement;
      }
      return chain;
    };

    const emitSelected = (el: HTMLElement) => {
      const computed = getComputedStyle(el);
      const captured: Record<string, string> = {};
      for (const p of CAPTURE_PROPS) captured[p] = computed.getPropertyValue(p).trim();
      const info = {
        id: el.getAttribute('data-edit-id')!,
        name: nameOf(el),
        kind: kindOf(el),
        path: el.getAttribute('data-edit-path') || undefined,
        text: (el.textContent || '').trim(),
        breadcrumb: buildBreadcrumb(el),
        computed: captured,
      };
      window.parent.postMessage({ type: 'EDITOR_SELECTED', info }, '*');
    };

    const select = (el: HTMLElement | null) => {
      selectedElRef.current = el;
      if (el) {
        positionBox(selBox, el);
        positionLabel(el);
        emitSelected(el);
      } else {
        selBox.style.display = 'none';
        label.style.display = 'none';
        window.parent.postMessage({ type: 'EDITOR_CLEARED' }, '*');
      }
    };

    // ── Event handlers (only active in edit mode) ──
    const onMove = (e: MouseEvent) => {
      if (!enabledRef.current || editingRef.current) return;
      const el = findEditable(e.target);
      hoverElRef.current = el;
      if (el && el !== selectedElRef.current) {
        positionBox(hoverBox, el);
      } else {
        hoverBox.style.display = 'none';
      }
    };

    const onClickCapture = (e: MouseEvent) => {
      if (!enabledRef.current || editingRef.current) return;
      const el = findEditable(e.target);
      if (!el) return;
      // Block navigation / button actions while editing.
      e.preventDefault();
      e.stopPropagation();
      hoverBox.style.display = 'none';
      select(el);
    };

    const commitEdit = () => {
      const el = editingRef.current;
      if (!el) return;
      const path = el.getAttribute('data-edit-path');
      const value = (el.textContent || '').trim();
      el.removeAttribute('contenteditable');
      el.style.removeProperty('outline');
      el.style.removeProperty('cursor');
      editingRef.current = null;
      if (path) window.parent.postMessage({ type: 'EDITOR_CONTENT', path, value }, '*');
    };

    const onDblClick = (e: MouseEvent) => {
      if (!enabledRef.current) return;
      const el = findEditable(e.target);
      if (!el || !el.getAttribute('data-edit-path') || !EDITABLE_KINDS.has(kindOf(el))) return;
      e.preventDefault();
      e.stopPropagation();
      editingRef.current = el;
      el.setAttribute('contenteditable', 'plaintext-only');
      el.style.outline = '2px solid #2563EB';
      el.style.cursor = 'text';
      el.focus();
      // place caret / select all
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!editingRef.current) return;
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(); }
      if (e.key === 'Escape') { e.preventDefault(); commitEdit(); }
    };

    const onFocusOut = (e: FocusEvent) => {
      if (editingRef.current && e.target === editingRef.current) commitEdit();
    };

    // ── Messages from admin ──
    const onMessage = (event: MessageEvent) => {
      const d = event.data || {};
      if (d.type === 'EDITOR_MODE') {
        enabledRef.current = !!d.enabled;
        document.documentElement.setAttribute('data-canvas-edit', d.enabled ? 'on' : 'off');
        if (!d.enabled) {
          hoverBox.style.display = 'none';
          selBox.style.display = 'none';
          label.style.display = 'none';
          selectedElRef.current = null;
          if (editingRef.current) commitEdit();
        }
      } else if (d.type === 'EDITOR_STYLE') {
        styleTag.textContent = d.css || '';
        ensureFontsFromCss(d.css || '');
      } else if (d.type === 'EDITOR_SELECT') {
        const el = d.id
          ? (document.querySelector(`[data-edit-id="${CSS.escape(d.id)}"]`) as HTMLElement | null)
          : null;
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          select(el);
        } else {
          select(null);
        }
      } else if (d.type === 'PREVIEW_SCROLL') {
        try {
          const target = d.anchor ? document.querySelector(d.anchor) : null;
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch {
          /* invalid selector — ignore */
        }
      }
    };

    // Keep the boxes glued to elements as the layout/scroll changes.
    const tick = () => {
      if (enabledRef.current) {
        if (selectedElRef.current) { positionBox(selBox, selectedElRef.current); positionLabel(selectedElRef.current); }
        if (hoverElRef.current && hoverElRef.current !== selectedElRef.current) positionBox(hoverBox, hoverElRef.current);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('click', onClickCapture, true);
    document.addEventListener('dblclick', onDblClick, true);
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('focusout', onFocusOut, true);
    window.addEventListener('message', onMessage);

    // Announce that the editor runtime is live so the admin re-sends state.
    window.parent.postMessage({ type: 'EDITOR_RUNTIME_READY' }, '*');

    return () => {
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('click', onClickCapture, true);
      document.removeEventListener('dblclick', onDblClick, true);
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('focusout', onFocusOut, true);
      window.removeEventListener('message', onMessage);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      layer.remove();
      styleTag.remove();
    };
  }, []);

  return null;
}
