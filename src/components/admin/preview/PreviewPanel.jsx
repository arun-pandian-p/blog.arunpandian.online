import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Monitor, Smartphone, RotateCw, ExternalLink, PanelRightClose, Radio } from 'lucide-react';
import { usePreview } from './PreviewContext';

const PREVIEW_SRC = '/?preview=1';

export default function PreviewPanel() {
  const { draft, device, setDevice, setPreviewOpen, previewAnchor } = usePreview();
  const iframeRef = useRef(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Keep the latest values available to the (stable) ready-handshake listener.
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const anchorRef = useRef(previewAnchor);
  anchorRef.current = previewAnchor;

  const pushToFrame = useCallback((payload) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'PREVIEW_OVERRIDE', payload },
      '*'
    );
  }, []);

  const scrollFrame = useCallback(() => {
    if (!anchorRef.current) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'PREVIEW_SCROLL', anchor: anchorRef.current },
      '*'
    );
  }, []);

  // Push whenever the draft changes.
  useEffect(() => {
    pushToFrame(draft);
  }, [draft, pushToFrame]);

  // Scroll the preview to the section for the current page.
  useEffect(() => {
    const t = setTimeout(scrollFrame, 150);
    return () => clearTimeout(t);
  }, [previewAnchor, scrollFrame]);

  // The iframe announces readiness once ContentProvider mounts inside it —
  // respond with the current draft so nothing is lost to a startup race.
  useEffect(() => {
    const handleReady = (event) => {
      if (event.data?.type === 'PREVIEW_READY') {
        pushToFrame(draftRef.current);
        setTimeout(scrollFrame, 200);
      }
    };
    window.addEventListener('message', handleReady);
    return () => window.removeEventListener('message', handleReady);
  }, [pushToFrame, scrollFrame]);

  const handleLoad = () => {
    pushToFrame(draftRef.current);
    setTimeout(scrollFrame, 200);
  };

  const isMobile = device === 'mobile';

  return (
    <div className="flex h-full w-full flex-col bg-slate-100">
      {/* Toolbar */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
          <Radio size={13} className="animate-pulse" />
          Live preview
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            title="Desktop"
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              !isMobile ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Monitor size={14} /> Desktop
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            title="Mobile"
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              isMobile ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Smartphone size={14} /> Mobile
          </button>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            title="Reload preview"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <RotateCw size={15} />
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Open live site in new tab"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <ExternalLink size={15} />
          </a>
          <button
            type="button"
            onClick={() => setPreviewOpen(false)}
            title="Close preview"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <PanelRightClose size={15} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto p-3">
        <div
          className={
            isMobile
              ? 'mx-auto h-full w-[390px] max-w-full overflow-hidden rounded-[2rem] border-[10px] border-slate-800 bg-white shadow-2xl'
              : 'h-full w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'
          }
        >
          <iframe
            key={reloadKey}
            ref={iframeRef}
            src={PREVIEW_SRC}
            onLoad={handleLoad}
            title="Live site preview"
            className="h-full w-full border-0 bg-white"
          />
        </div>
      </div>
    </div>
  );
}
