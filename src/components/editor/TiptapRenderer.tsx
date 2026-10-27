import React, { useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { all, createLowlight } from 'lowlight';
import DOMPurify from 'dompurify';

const lowlight = createLowlight(all);

interface TiptapRendererProps {
  content?: string;
  contentJson?: any;
  className?: string;
  fontFamily?: 'serif' | 'sans' | 'mono';
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
}

export const TiptapRenderer: React.FC<TiptapRendererProps> = ({
  content = '',
  contentJson = null,
  className = '',
  fontFamily = 'serif',
  fontSize = 'base'
}) => {
  // Determine typography classes based on self-hosted Google/GitHub fonts
  const fontClass = fontFamily === 'sans'
    ? 'font-sans font-sans-inter'
    : fontFamily === 'mono'
      ? 'font-mono font-mono-jetbrains'
      : 'font-serif font-serif-newsreader';

  const sizeClass = fontSize === 'sm'
    ? 'text-[15px] sm:text-[16px] leading-[1.65]'
    : fontSize === 'lg'
      ? 'text-[17px] sm:text-[19px] leading-[1.8]'
      : fontSize === 'xl'
        ? 'text-[19px] sm:text-[21px] leading-[1.85]'
        : 'text-[16px] sm:text-[18px] leading-[1.75]';

  // Parse JSON if passed as string
  const parsedJson = useMemo(() => {
    if (!contentJson) return null;
    if (typeof contentJson === 'object') return contentJson;
    try {
      return JSON.parse(contentJson);
    } catch {
      return null;
    }
  }, [contentJson]);

  // Read-only Tiptap instance if contentJson exists
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'text-blue-600 underline hover:text-blue-800'
        }
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-6 shadow-sm mx-auto'
        }
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript'
      })
    ],
    content: parsedJson || '',
    editable: false,
  }, [parsedJson]);

  // If valid Tiptap JSON is available, render via Tiptap
  if (parsedJson && editor) {
    return (
      <div className={`prose prose-lg max-w-none text-stone-800 transition-all duration-150 ${fontClass} ${sizeClass} ${className}`}>
        <EditorContent editor={editor} />
      </div>
    );
  }

  // Fallback for legacy HTML / Markdown content (sanitized with DOMPurify)
  const cleanHtml = useMemo(() => {
    if (!content) return '';
    return DOMPurify.sanitize(content, {
      ADD_TAGS: ['iframe', 'video', 'source'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'controls', 'target']
    });
  }, [content]);

  return (
    <div
      className={`prose prose-lg max-w-none text-stone-800 transition-all duration-150 ${fontClass} ${sizeClass} tiptap ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
};

export default TiptapRenderer;
