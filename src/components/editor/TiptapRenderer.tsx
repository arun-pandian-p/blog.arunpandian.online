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
}

export const TiptapRenderer: React.FC<TiptapRendererProps> = ({
  content = '',
  contentJson = null,
  className = ''
}) => {
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
      <div className={`prose prose-lg max-w-none text-stone-800 leading-relaxed font-serif ${className}`}>
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
      className={`prose prose-lg max-w-none text-stone-800 leading-relaxed font-serif tiptap ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
};

export default TiptapRenderer;
