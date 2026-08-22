import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useNodeStore, type EditorNode } from '../../store/useNodeStore';

export default function InspectorPanel() {
  const { selectedNodeId } = useEditorStore();
  const { nodes, updateNode } = useNodeStore();

  const findNode = (nodesList: EditorNode[], id: string): EditorNode | null => {
    for (const node of nodesList) {
      if (node.id === id) return node;
      if (node.children.length > 0) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedNode = selectedNodeId ? findNode(nodes, selectedNodeId) : null;

  if (!selectedNode) {
    return (
      <div className="text-center py-10 text-sm text-slate-500">
        Select an element on the canvas to inspect its properties.
      </div>
    );
  }

  const handlePropChange = (key: string, value: any) => {
    updateNode(selectedNode.id, {
      props: { ...selectedNode.props, [key]: value }
    });
  };

  const handleStyleChange = (key: string, value: string) => {
    updateNode(selectedNode.id, {
      style: { ...selectedNode.style, [key]: value }
    });
  };

  return (
    <div className="space-y-6 text-slate-300">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Properties</h2>
        <span className="text-[10px] uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
          {selectedNode.type}
        </span>
      </div>

      <hr className="border-slate-800" />

      {/* Component Specific Props */}
      {(selectedNode.type === 'Text' || selectedNode.type === 'Button') && (
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Content</h3>
          <div className="space-y-2">
            <label className="text-xs text-slate-400 block">Text</label>
            <input 
              type="text" 
              value={selectedNode.props.text || ''}
              onChange={(e) => handlePropChange('text', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded text-xs p-2 text-slate-300 outline-none focus:border-blue-500"
            />
          </div>
          
          {selectedNode.type === 'Text' && (
            <div className="space-y-2">
              <label className="text-xs text-slate-400 block">HTML Tag</label>
              <select 
                value={selectedNode.props.as || 'p'}
                onChange={(e) => handlePropChange('as', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded text-xs p-2 text-slate-300 outline-none focus:border-blue-500"
              >
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="p">Paragraph</option>
                <option value="span">Span</option>
              </select>
            </div>
          )}
        </div>
      )}

      {selectedNode.type === 'Image' && (
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Image Source</h3>
          <div className="space-y-2">
            <label className="text-xs text-slate-400 block">URL</label>
            <input 
              type="text" 
              value={selectedNode.props.src || ''}
              onChange={(e) => handlePropChange('src', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded text-xs p-2 text-slate-300 outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Spacing & Layout */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Spacing</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-slate-400 block">Padding</label>
            <input 
              type="text" 
              placeholder="e.g. 1rem or 16px"
              value={selectedNode.style.padding || ''}
              onChange={(e) => handleStyleChange('padding', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded text-xs p-2 text-slate-300 outline-none focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400 block">Margin</label>
            <input 
              type="text" 
              placeholder="e.g. 1rem or auto"
              value={selectedNode.style.margin || ''}
              onChange={(e) => handleStyleChange('margin', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded text-xs p-2 text-slate-300 outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Styling */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Appearance</h3>
        
        <div className="space-y-2">
          <label className="text-xs text-slate-400 block">Tailwind Classes</label>
          <input 
            type="text" 
            placeholder="e.g. bg-blue-500 text-white rounded-lg"
            value={selectedNode.props.className || ''}
            onChange={(e) => handlePropChange('className', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded text-xs p-2 text-slate-300 outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-slate-400 block">Border Radius</label>
            <input 
              type="text" 
              placeholder="e.g. 8px"
              value={selectedNode.style.borderRadius || ''}
              onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded text-xs p-2 text-slate-300 outline-none focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400 block">Opacity</label>
            <input 
              type="number" 
              step="0.1"
              min="0"
              max="1"
              placeholder="1"
              value={selectedNode.style.opacity || ''}
              onChange={(e) => handleStyleChange('opacity', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded text-xs p-2 text-slate-300 outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <hr className="border-slate-800" />

      {/* Motion Studio */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase text-blue-500 tracking-wider">Motion Studio</h3>
        
        <div className="space-y-2">
          <label className="text-xs text-slate-400 block">Animation Preset</label>
          <select 
            value={selectedNode.animation?.preset || 'none'}
            onChange={(e) => updateNode(selectedNode.id, { animation: { ...selectedNode.animation, preset: e.target.value } })}
            className="w-full bg-slate-900 border border-slate-700 rounded text-xs p-2 text-slate-300 outline-none focus:border-blue-500"
          >
            <option value="none">None</option>
            <option value="fade">Fade In</option>
            <option value="slide-up">Slide Up</option>
            <option value="slide-left">Slide Left</option>
            <option value="scale-up">Scale Up</option>
            <option value="blur-in">Blur In</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-slate-400 block">Duration (s)</label>
            <input 
              type="number" 
              step="0.1"
              min="0"
              placeholder="0.5"
              value={selectedNode.animation?.duration || ''}
              onChange={(e) => updateNode(selectedNode.id, { animation: { ...selectedNode.animation, duration: parseFloat(e.target.value) } })}
              className="w-full bg-slate-900 border border-slate-700 rounded text-xs p-2 text-slate-300 outline-none focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400 block">Delay (s)</label>
            <input 
              type="number" 
              step="0.1"
              min="0"
              placeholder="0"
              value={selectedNode.animation?.delay || ''}
              onChange={(e) => updateNode(selectedNode.id, { animation: { ...selectedNode.animation, delay: parseFloat(e.target.value) } })}
              className="w-full bg-slate-900 border border-slate-700 rounded text-xs p-2 text-slate-300 outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
