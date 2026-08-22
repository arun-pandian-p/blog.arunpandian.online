import { useEffect } from 'react';
import { usePreview } from './PreviewContext';

/**
 * Streams a react-hook-form's live values into the admin preview panel.
 *
 * @param {object} form   The react-hook-form instance (from useForm()).
 * @param {(values:any)=>object} mapToPayload
 *        Maps raw form values to a preview payload, e.g.
 *        (v) => ({ settings: { hero: v } }).
 *        The payload shape mirrors ContentProvider: { settings?, projects?, blogs?, experiences? }.
 */
export function usePreviewSync(form, mapToPayload, anchor) {
  const { pushDraft, clearDraft, setPreviewAnchor } = usePreview();

  useEffect(() => {
    if (anchor) setPreviewAnchor(anchor);
    return () => setPreviewAnchor(null);
  }, [anchor, setPreviewAnchor]);

  useEffect(() => {
    if (!form) return;

    // Push the current values immediately so the preview matches on open.
    try {
      pushDraft(mapToPayload(form.getValues()));
    } catch {
      /* ignore mapping errors on first paint */
    }

    // Then stream every change (fires on edits AND on form.reset()).
    const subscription = form.watch((values) => {
      try {
        pushDraft(mapToPayload(values));
      } catch {
        /* ignore transient mapping errors */
      }
    });

    return () => {
      subscription.unsubscribe?.();
      clearDraft();
    };
    // mapToPayload is expected to be stable (defined at module scope or memoized).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);
}
