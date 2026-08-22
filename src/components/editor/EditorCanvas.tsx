import React from 'react';
import { useNodeStore, type EditorNode } from '../../store/useNodeStore';
import { useEditorStore } from '../../store/useEditorStore';
import { useThemeStore } from '../../store/useThemeStore';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, type HTMLMotionProps } from 'framer-motion';

import { useDroppable } from '@dnd-kit/core';
import { Helmet } from 'react-helmet-async';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NodeRenderer: React.FC<{ node: EditorNode }> = ({ node }) => {
  const { selectedNodeId, hoveredNodeId, setSelectedNodeId, setHoveredNodeId } = useEditorStore();
  
  const { isOver, setNodeRef } = useDroppable({
    id: node.id,
    data: { type: node.type, acceptsDrop: node.type === 'Section' || node.type === 'Container' }
  });

  const isSelected = selectedNodeId === node.id;
  const isHovered = hoveredNodeId === node.id && !isSelected;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
  };

  const handleHover = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHoveredNodeId(node.id);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hoveredNodeId === node.id) {
      setHoveredNodeId(null);
    }
  };

  const commonProps = {
    ref: setNodeRef,
    onClick: handleSelect,
    onMouseOver: handleHover,
    onMouseOut: handleMouseLeave,
    className: cn(
      node.props.className || '',
      isSelected ? 'ring-2 ring-blue-500 ring-inset relative z-10' : '',
      isHovered && !isSelected ? 'ring-1 ring-blue-400 ring-dashed ring-inset relative z-10' : '',
      isOver && (node.type === 'Section' || node.type === 'Container') ? 'bg-blue-50/50 ring-2 ring-blue-400 ring-dashed' : '',
      'transition-all duration-200'
    ),
    style: node.style,
  };

  // Motion setup
  const getMotionProps = (): HTMLMotionProps<any> => {
    const preset = node.animation?.preset || 'none';
    if (preset === 'none') return {};

    const duration = node.animation?.duration || 0.5;
    const delay = node.animation?.delay || 0;

    const transition = { duration, delay, ease: 'easeOut' as const }; // Default smooth ease

    switch (preset) {
      case 'fade':
        return { initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition, viewport: { once: true } };
      case 'slide-up':
        return { initial: { opacity: 0, y: 50 }, whileInView: { opacity: 1, y: 0 }, transition, viewport: { once: true } };
      case 'slide-left':
        return { initial: { opacity: 0, x: 50 }, whileInView: { opacity: 1, x: 0 }, transition, viewport: { once: true } };
      case 'scale-up':
        return { initial: { opacity: 0, scale: 0.9 }, whileInView: { opacity: 1, scale: 1 }, transition, viewport: { once: true } };
      case 'blur-in':
        return { initial: { opacity: 0, filter: 'blur(10px)' }, whileInView: { opacity: 1, filter: 'blur(0px)' }, transition, viewport: { once: true } };
      default:
        return {};
    }
  };

  const motionProps = getMotionProps();

  if (node.type === 'Section' || node.type === 'Container') {
    return (
      <motion.div {...commonProps} {...motionProps}>
        {node.children.map((child) => (
          <NodeRenderer key={child.id} node={child} />
        ))}
      </motion.div>
    );
  }

  if (node.type === 'Text') {
    const Tag = node.props.as || 'p';
    const isHeading = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.props.as);
    const fontStyle = isHeading ? { fontFamily: 'var(--font-heading)' } : { fontFamily: 'var(--font-body)' };
    
    // We cast to any because Framer Motion has specific types like motion.h1, motion.p
    // But we are using dynamic tags. `motion.div` fallback isn't great.
    // Instead we use a custom motion component if needed, or just motion(Tag).
    const MotionTag = motion.create(Tag as keyof React.JSX.IntrinsicElements) as any;

    return (
      <MotionTag {...commonProps} {...motionProps} style={{ ...commonProps.style, ...fontStyle }}>
        {node.props.text}
      </MotionTag>
    );
  }

  if (node.type === 'Image') {
    return (
      <motion.img 
        src={node.props.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'} 
        alt={node.props.alt || 'Placeholder'} 
        {...commonProps} 
        {...motionProps}
      />
    );
  }

  if (node.type === 'Button') {
    return (
      <motion.button {...commonProps} {...motionProps}>
        {node.props.text || 'Button'}
      </motion.button>
    );
  }

  return null;
};

export default function EditorCanvas() {
  const nodes = useNodeStore((state) => state.nodes);
  const { setSelectedNodeId } = useEditorStore();
  const { tokens } = useThemeStore();

  const handleCanvasClick = () => {
    setSelectedNodeId(null);
  };

  const canvasStyle = {
    '--color-primary': tokens.colors.primary,
    '--color-secondary': tokens.colors.secondary,
    '--color-background': tokens.colors.background,
    '--color-foreground': tokens.colors.foreground,
    '--color-muted': tokens.colors.muted,
    '--color-border': tokens.colors.border,
    '--font-heading': tokens.typography.fontFamilyHeading,
    '--font-body': tokens.typography.fontFamilyBody,
    '--spacing-container': tokens.spacing.container,
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-foreground)',
  } as React.CSSProperties;

  const extractFont = (fontStr: string) => {
    const primary = fontStr.split(',')[0].replace(/['"]/g, '').trim();
    return primary;
  };

  const fontHeadingUrl = `https://fonts.googleapis.com/css2?family=${extractFont(tokens.typography.fontFamilyHeading).replace(/ /g, '+')}:wght@400;500;600;700&display=swap`;
  const fontBodyUrl = `https://fonts.googleapis.com/css2?family=${extractFont(tokens.typography.fontFamilyBody).replace(/ /g, '+')}:wght@400;500;600;700&display=swap`;

  return (
    <div 
      className="w-full h-full bg-slate-100 overflow-y-auto relative"
      onClick={handleCanvasClick}
    >
      <Helmet>
        <link href={fontHeadingUrl} rel="stylesheet" />
        <link href={fontBodyUrl} rel="stylesheet" />
      </Helmet>
      <div 
        className="w-full min-h-full shadow-sm transition-all duration-300 overflow-hidden"
        style={canvasStyle}
      >
        {nodes.map((node) => (
          <NodeRenderer key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}
