import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useEditorStore } from '../../../editor/editorStore';
import { CATALOG } from '../../../editor/catalog';

export default function CommandPalette() {
  const open = useEditorStore((s) => s.paletteOpen);
  const setOpen = useEditorStore((s) => s.setPaletteOpen);
  const requestSelect = useEditorStore((s) => s.requestSelect);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return CATALOG;
    return CATALOG.filter((c) => `${c.name} ${c.group}`.toLowerCase().includes(term));
  }, [q]);

  useEffect(() => {
    if (open) {
      setQ('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => setActive(0), [q]);

  if (!open) return null;

  const choose = (id: string) => {
    requestSelect(id);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (results[active]) choose(results[active].id); }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-slate-900/40 pt-[12vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-slate-100 px-4">
          <Search size={16} className="text-slate-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Jump to a component, section…"
            className="w-full py-3 text-sm outline-none"
          />
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-400">Esc</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto py-1">
          {results.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-slate-400">No matches</div>
          )}
          {results.map((c, i) => (
            <button
              key={c.id}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(c.id)}
              className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                i === active ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{c.name}</span>
              <span className="text-[11px] text-slate-400">{c.group}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
