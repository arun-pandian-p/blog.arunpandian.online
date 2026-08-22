import React from 'react';
import { useThemeStore } from '../../store/useThemeStore';

export default function ThemePanel() {
  const { tokens, updateColor, updateTokens } = useThemeStore();

  return (
    <div className="space-y-6 text-slate-300">
      {/* Colors Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Colors</h3>
        <div className="space-y-3">
          {Object.entries(tokens.colors).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-xs text-slate-400 capitalize">{key}</label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 uppercase font-mono w-14 text-right">
                  {value}
                </span>
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateColor(key as any, e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-slate-800" />

      {/* Typography Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Typography</h3>
        
        <div className="space-y-2">
          <label className="text-xs text-slate-400 block">Heading Font</label>
          <select 
            value={tokens.typography.fontFamilyHeading}
            onChange={(e) => updateTokens({ typography: { ...tokens.typography, fontFamilyHeading: e.target.value } })}
            className="w-full bg-slate-900 border border-slate-700 rounded text-xs p-2 text-slate-300 outline-none focus:border-blue-500"
          >
            <option value="Inter, sans-serif">Inter</option>
            <option value="Roboto, sans-serif">Roboto</option>
            <option value="'Outfit', sans-serif">Outfit</option>
            <option value="'Playfair Display', serif">Playfair Display</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-slate-400 block">Body Font</label>
          <select 
            value={tokens.typography.fontFamilyBody}
            onChange={(e) => updateTokens({ typography: { ...tokens.typography, fontFamilyBody: e.target.value } })}
            className="w-full bg-slate-900 border border-slate-700 rounded text-xs p-2 text-slate-300 outline-none focus:border-blue-500"
          >
            <option value="Inter, sans-serif">Inter</option>
            <option value="Roboto, sans-serif">Roboto</option>
            <option value="'Outfit', sans-serif">Outfit</option>
            <option value="'Lora', serif">Lora</option>
          </select>
        </div>
      </div>
      
      <hr className="border-slate-800" />
      
      {/* Layout Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Layout</h3>
        <div className="space-y-2">
          <label className="text-xs text-slate-400 block">Container Max Width</label>
          <input 
            type="text" 
            value={tokens.spacing.container}
            onChange={(e) => updateTokens({ spacing: { ...tokens.spacing, container: e.target.value } })}
            className="w-full bg-slate-900 border border-slate-700 rounded text-xs p-2 text-slate-300 outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
