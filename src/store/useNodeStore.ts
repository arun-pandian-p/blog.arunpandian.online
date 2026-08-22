import { create } from 'zustand';

export type NodeType = 'Container' | 'Text' | 'Image' | 'Button' | 'Section';

export interface EditorNode {
  id: string;
  type: NodeType;
  props: Record<string, any>;
  style: Record<string, any>;
  animation?: {
    preset?: string;
    duration?: number;
    delay?: number;
  };
  children: EditorNode[];
}

interface NodeState {
  nodes: EditorNode[];
  setNodes: (nodes: EditorNode[]) => void;
  updateNode: (id: string, updates: Partial<EditorNode>) => void;
  addNode: (node: EditorNode, parentId?: string) => void;
  removeNode: (id: string) => void;
}

const initialNodes: EditorNode[] = [
  {
    id: 'root',
    type: 'Section',
    props: { className: 'min-h-screen p-8 bg-background flex flex-col items-center justify-center' },
    style: {},
    children: [
      {
        id: 'heading-1',
        type: 'Text',
        props: { text: 'Welcome to Theme Studio', as: 'h1', className: 'text-5xl font-bold tracking-tight text-foreground mb-4' },
        style: {},
        children: [],
      },
      {
        id: 'text-1',
        type: 'Text',
        props: { text: 'Select elements to edit their properties.', as: 'p', className: 'text-lg text-muted-foreground' },
        style: {},
        children: [],
      },
    ],
  },
];

const updateNodeRecursively = (nodes: EditorNode[], id: string, updates: Partial<EditorNode>): EditorNode[] => {
  return nodes.map((node) => {
    if (node.id === id) {
      return { ...node, ...updates };
    }
    if (node.children.length > 0) {
      return { ...node, children: updateNodeRecursively(node.children, id, updates) };
    }
    return node;
  });
};

const removeNodeRecursively = (nodes: EditorNode[], id: string): EditorNode[] => {
  return nodes.filter(node => node.id !== id).map(node => {
    if (node.children.length > 0) {
      return { ...node, children: removeNodeRecursively(node.children, id) };
    }
    return node;
  });
};

const addNodeRecursively = (nodes: EditorNode[], newNode: EditorNode, parentId: string): EditorNode[] => {
  return nodes.map((node) => {
    if (node.id === parentId) {
      return { ...node, children: [...node.children, newNode] };
    }
    if (node.children.length > 0) {
      return { ...node, children: addNodeRecursively(node.children, newNode, parentId) };
    }
    return node;
  });
};

export const useNodeStore = create<NodeState>((set) => ({
  nodes: initialNodes,
  setNodes: (nodes) => set({ nodes }),
  updateNode: (id, updates) =>
    set((state) => ({ nodes: updateNodeRecursively(state.nodes, id, updates) })),
  addNode: (node, parentId) =>
    set((state) => {
      if (!parentId) {
        return { nodes: [...state.nodes, node] };
      }
      return { nodes: addNodeRecursively(state.nodes, node, parentId) };
    }),
  removeNode: (id) =>
    set((state) => ({ nodes: removeNodeRecursively(state.nodes, id) })),
}));
