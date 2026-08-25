import { useEffect, useRef } from 'react';
import { ensureFontsFromCss } from './fonts';

/**
 * CanvasRuntime runs INSIDE the preview iframe (the public site).
 * It turns the page into an editable, interactive Figma-like canvas with:
 *   - Auto text & element detection with badges
 *   - 8-point visual resize handles (width, height, scale)
 *   - Double-click in-place live text editing
 *   - Real-time CSS style override injection
 */

const CAPTURE_PROPS = [
  'color', 'background-color', 'font-family', 'font-size', 'font-weight',
  'letter-spacing', 'line-height', 'text-align', 'text-transform',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'border-radius', 'opacity', 'box-shadow', 'border-top-width', 'border-color',
  'width', 'height', 'max-width', 'min-height', 'display', 'transform',
];

const EDITABLE_KINDS = new Set(['text', 'heading', 'button', 'link', 'card', 'section', 'container', 'image', 'navbar', 'footer']);

type HandlePosition = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

export default function CanvasRuntime() {
  const enabledRef = useRef(false);
  const selectedElRef = useRef<HTMLElement | null>(null);
  const hoverElRef = useRef<HTMLElement | null>(null);
  const editingRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const isDraggingHandleRef = useRef<HandlePosition | null>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; startW: number; startH: number }>({ startX: 0, startY: 0, startW: 0, startH: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ── Overlay layer (DOM root for visual canvas guides) ──
    const layer = document.createElement('div');
    layer.setAttribute('data-canvas-overlay', '');
    Object.assign(layer.style, {
      position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '2147483000',
    } as CSSStyleDeclaration);

    const mkBox = (borderColor: string, borderStyle = 'solid') => {
      const b = document.createElement('div');
      Object.assign(b.style, {
        position: 'fixed', boxSizing: 'border-box', border: `1.5px ${borderStyle} ${borderColor}`,
        borderRadius: '2px', display: 'none', pointerEvents: 'none',
        transition: 'none',
      } as CSSStyleDeclaration);
      layer.appendChild(b);
      return b;
    };

    const hoverBox = mkBox('rgba(59, 130, 246, 0.7)', 'dashed');
    const selBox = mkBox('#2563EB', 'solid');
    selBox.style.borderWidth = '2px';
    selBox.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.7), 0 4px 12px rgba(37,99,235,0.2)';

    // Label Badge
    const label = document.createElement('div');
    Object.assign(label.style, {
      position: 'fixed', display: 'none', pointerEvents: 'none',
      background: '#2563EB', color: '#fff', font: '700 10px/1 ui-sans-serif, system-ui',
      padding: '3px 7px', borderRadius: '4px', whiteSpace: 'nowrap', zIndex: '2147483002',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      transform: 'translateY(-100%)',
    } as CSSStyleDeclaration);
    layer.appendChild(label);

    // Dimension Pill
    const dimPill = document.createElement('div');
    Object.assign(dimPill.style, {
      position: 'fixed', display: 'none', pointerEvents: 'none',
      background: 'rgba(15, 23, 42, 0.85)', color: '#94A3B8', font: '500 9px/1 monospace',
      padding: '2px 5px', borderRadius: '3px', whiteSpace: 'nowrap', zIndex: '2147483002',
      backdropFilter: 'blur(4px)',
    } as CSSStyleDeclaration);
    layer.appendChild(dimPill);

    // ── 8 Resize Handles on Selection Box ──
    const handlesContainer = document.createElement('div');
    Object.assign(handlesContainer.style, {
      position: 'fixed', display: 'none', pointerEvents: 'auto', zIndex: '2147483005',
    } as CSSStyleDeclaration);
    layer.appendChild(handlesContainer);

    const handleElements: Record<HandlePosition, HTMLDivElement> = {} as any;
    const positions: HandlePosition[] = ['nw', 'ne', 'se', 'sw', 'n', 's', 'e', 'w'];
    const cursors: Record<HandlePosition, string> = {
      nw: 'nwse-resize', se: 'nwse-resize',
      ne: 'nesw-resize', sw: 'nesw-resize',
      n: 'ns-resize', s: 'ns-resize',
      e: 'ew-resize', w: 'ew-resize',
    };

    positions.forEach((pos) => {
      const h = document.createElement('div');
      Object.assign(h.style, {
        position: 'fixed', width: '8px', height: '8px',
        backgroundColor: '#FFFFFF', border: '2px solid #2563EB',
        borderRadius: '1px', cursor: cursors[pos], zIndex: '2147483006',
        display: 'none', boxSizing: 'border-box',
      } as CSSStyleDeclaration);
      h.setAttribute('data-handle', pos);
      layer.appendChild(h);
      handleElements[pos] = h;

      h.addEventListener('mousedown', (e: MouseEvent) => {
        if (!selectedElRef.current) return;
        e.preventDefault();
        e.stopPropagation();
        isDraggingHandleRef.current = pos;
        const rect = selectedElRef.current.getBoundingClientRect();
        dragStartRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          startW: rect.width,
          startH: rect.height,
        };
      });
    });

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

    const positionHandles = (el: HTMLElement | null) => {
      if (!el || !el.isConnected || !enabledRef.current) {
        positions.forEach((pos) => { handleElements[pos].style.display = 'none'; });
        return;
      }
      const r = el.getBoundingClientRect();
      const hw = 8;
      const hOffset = hw / 2;

      const coords: Record<HandlePosition, { x: number; y: number }> = {
        nw: { x: r.left - hOffset, y: r.top - hOffset },
        ne: { x: r.right - hOffset, y: r.top - hOffset },
        se: { x: r.right - hOffset, y: r.bottom - hOffset },
        sw: { x: r.left - hOffset, y: r.bottom - hOffset },
        n:  { x: r.left + r.width / 2 - hOffset, y: r.top - hOffset },
        s:  { x: r.left + r.width / 2 - hOffset, y: r.bottom - hOffset },
        e:  { x: r.right - hOffset, y: r.top + r.height / 2 - hOffset },
        w:  { x: r.left - hOffset, y: r.top + r.height / 2 - hOffset },
      };

      positions.forEach((pos) => {
        const h = handleElements[pos];
        h.style.display = 'block';
        h.style.left = `${coords[pos].x}px`;
        h.style.top = `${coords[pos].y}px`;
      });
    };

    const positionLabel = (el: HTMLElement | null) => {
      if (!el || !el.isConnected) { label.style.display = 'none'; dimPill.style.display = 'none'; return; }
      const r = el.getBoundingClientRect();
      label.style.display = 'block';
      label.textContent = `${nameOf(el)} (${kindOf(el).toUpperCase()})`;
      label.style.left = `${r.left}px`;
      label.style.top = `${Math.max(r.top - 6, 8)}px`;

      dimPill.style.display = 'block';
      dimPill.textContent = `${Math.round(r.width)} × ${Math.round(r.height)}px`;
      dimPill.style.left = `${r.left}px`;
      dimPill.style.top = `${r.bottom + 4}px`;
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
      const r = el.getBoundingClientRect();
      const info = {
        id: el.getAttribute('data-edit-id')!,
        name: nameOf(el),
        kind: kindOf(el),
        path: el.getAttribute('data-edit-path') || undefined,
        text: (el.textContent || '').trim(),
        breadcrumb: buildBreadcrumb(el),
        computed: captured,
        rect: { top: r.top, left: r.left, width: r.width, height: r.height },
      };
      window.parent.postMessage({ type: 'EDITOR_SELECTED', info }, '*');
    };

    const select = (el: HTMLElement | null) => {
      selectedElRef.current = el;
      if (el) {
        positionBox(selBox, el);
        positionLabel(el);
        positionHandles(el);
        emitSelected(el);
      } else {
        selBox.style.display = 'none';
        label.style.display = 'none';
        dimPill.style.display = 'none';
        positions.forEach((pos) => { handleElements[pos].style.display = 'none'; });
        window.parent.postMessage({ type: 'EDITOR_CLEARED' }, '*');
      }
    };

    // ── Handle Drag Resizing ──
    const onHandleMouseMove = (e: MouseEvent) => {
      const handle = isDraggingHandleRef.current;
      const el = selectedElRef.current;
      if (!handle || !el) return;

      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;
      let newW = dragStartRef.current.startW;
      let newH = dragStartRef.current.startH;

      if (handle.includes('e')) newW = Math.max(30, dragStartRef.current.startW + dx);
      if (handle.includes('w')) newW = Math.max(30, dragStartRef.current.startW - dx);
      if (handle.includes('s')) newH = Math.max(20, dragStartRef.current.startH + dy);
      if (handle.includes('n')) newH = Math.max(20, dragStartRef.current.startH - dy);

      el.style.width = `${Math.round(newW)}px`;
      if (handle.includes('n') || handle.includes('s')) {
        el.style.height = `${Math.round(newH)}px`;
      }

      window.parent.postMessage({
        type: 'EDITOR_RESIZE_LIVE',
        id: el.getAttribute('data-edit-id'),
        width: `${Math.round(newW)}px`,
        height: `${Math.round(newH)}px`,
      }, '*');
    };

    const onHandleMouseUp = () => {
      if (isDraggingHandleRef.current && selectedElRef.current) {
        const el = selectedElRef.current;
        const rect = el.getBoundingClientRect();
        window.parent.postMessage({
          type: 'EDITOR_RESIZE_COMMIT',
          id: el.getAttribute('data-edit-id'),
          width: `${Math.round(rect.width)}px`,
          height: `${Math.round(rect.height)}px`,
        }, '*');
      }
      isDraggingHandleRef.current = null;
    };

    // ── Event Handlers ──
    const onMove = (e: MouseEvent) => {
      if (!enabledRef.current || editingRef.current || isDraggingHandleRef.current) return;
      const el = findEditable(e.target);
      hoverElRef.current = el;
      if (el && el !== selectedElRef.current) {
        positionBox(hoverBox, el);
      } else {
        hoverBox.style.display = 'none';
      }
    };

    const onClickCapture = (e: MouseEvent) => {
      if (!enabledRef.current || editingRef.current || isDraggingHandleRef.current) return;
      const el = findEditable(e.target);
      if (!el) return;
      // Intercept clicks during Canvas edit mode
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
      
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    };

    const onInput = () => {
      const el = editingRef.current;
      if (!el) return;
      const path = el.getAttribute('data-edit-path');
      const value = (el.textContent || '').trim();
      if (path) {
        window.parent.postMessage({ type: 'EDITOR_CONTENT_LIVE', path, value }, '*');
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!editingRef.current) return;
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(); }
      if (e.key === 'Escape') { e.preventDefault(); commitEdit(); }
    };

    const onFocusOut = (e: FocusEvent) => {
      if (editingRef.current && e.target === editingRef.current) commitEdit();
    };

    // ── Messages from Admin ──
    const onMessage = (event: MessageEvent) => {
      const d = event.data || {};
      if (d.type === 'EDITOR_MODE') {
        enabledRef.current = !!d.enabled;
        document.documentElement.setAttribute('data-canvas-edit', d.enabled ? 'on' : 'off');
        if (!d.enabled) {
          hoverBox.style.display = 'none';
          selBox.style.display = 'none';
          label.style.display = 'none';
          dimPill.style.display = 'none';
          positions.forEach((pos) => { handleElements[pos].style.display = 'none'; });
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
        } catch {}
      }
    };

    // Glued box refresh loop
    const tick = () => {
      if (enabledRef.current) {
        if (selectedElRef.current) {
          positionBox(selBox, selectedElRef.current);
          positionLabel(selectedElRef.current);
          positionHandles(selectedElRef.current);
        }
        if (hoverElRef.current && hoverElRef.current !== selectedElRef.current) {
          positionBox(hoverBox, hoverElRef.current);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('mousemove', onHandleMouseMove);
    document.addEventListener('mouseup', onHandleMouseUp);
    document.addEventListener('click', onClickCapture, true);
    document.addEventListener('dblclick', onDblClick, true);
    document.addEventListener('input', onInput, true);
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('focusout', onFocusOut, true);
    window.addEventListener('message', onMessage);

    window.parent.postMessage({ type: 'EDITOR_RUNTIME_READY' }, '*');

    return () => {
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('mousemove', onHandleMouseMove);
      document.removeEventListener('mouseup', onHandleMouseUp);
      document.removeEventListener('click', onClickCapture, true);
      document.removeEventListener('dblclick', onDblClick, true);
      document.removeEventListener('input', onInput, true);
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
