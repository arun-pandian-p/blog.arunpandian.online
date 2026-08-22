import { create } from 'zustand';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

interface EditorState {
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  viewport: ViewportMode;
  setSelectedNodeId: (id: string | null) => void;
  setHoveredNodeId: (id: string | null) => void;
  setViewport: (viewport: ViewportMode) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  selectedNodeId: null,
  hoveredNodeId: null,
  viewport: 'desktop',
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setHoveredNodeId: (id) => set({ hoveredNodeId: id }),
  setViewport: (viewport) => set({ viewport }),
}));
