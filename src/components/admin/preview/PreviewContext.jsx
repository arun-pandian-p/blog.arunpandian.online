import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const PreviewContext = createContext(null);

export function usePreview() {
  const ctx = useContext(PreviewContext);
  if (!ctx) throw new Error('usePreview must be used within a PreviewProvider');
  return ctx;
}

export function PreviewProvider({ children }) {
  // The unsaved form draft the current page wants reflected in the live preview.
  const [draft, setDraft] = useState(null);
  // Preview device viewport: 'desktop' | 'mobile'
  const [device, setDevice] = useState('desktop');
  // Layout toggles
  const [editorOpen, setEditorOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(true);
  // Section the preview should scroll to for the current page (e.g. '#skills')
  const [previewAnchor, setPreviewAnchor] = useState(null);

  const pushDraft = useCallback((payload) => setDraft(payload), []);
  const clearDraft = useCallback(() => setDraft(null), []);

  const value = useMemo(
    () => ({
      draft,
      pushDraft,
      clearDraft,
      device,
      setDevice,
      editorOpen,
      setEditorOpen,
      previewOpen,
      setPreviewOpen,
      previewAnchor,
      setPreviewAnchor,
    }),
    [draft, pushDraft, clearDraft, device, editorOpen, previewOpen, previewAnchor]
  );

  return <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>;
}
