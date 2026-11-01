import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';

import { FontSize, LineHeight, Indentation, CustomImage } from './extensions';
import { EditorToolbar } from './EditorToolbar';
import { BubbleToolbar } from './BubbleToolbar';
import { TableMenu } from './TableMenu';
import { ImageDialog } from './ImageDialog';
import { LinkDialog } from './LinkDialog';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Clock01Icon,
  File01Icon,
  BadgeCheckIcon,
  Book02Icon,
} from '@hugeicons/core-free-icons';
import { normalizeContentToHtml } from '../../utils/contentConverter';

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  initialContent?: string;
  initialJson?: any;
  onChange?: (html: string, json: any) => void;
  placeholder?: string;
  autoSaveKey?: string;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  isPreviewMode: boolean;
  onTogglePreviewMode: () => void;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  initialContent = '',
  initialJson = null,
  onChange,
  placeholder = 'Type your story, document findings, or paste from Word/Docs...',
  autoSaveKey = 'apstories_draft_content',
  isZenMode,
  onToggleZenMode,
  isPreviewMode,
  onTogglePreviewMode,
}) => {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [activeImageAttrs, setActiveImageAttrs] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'synced'>('synced');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const [isPageView, setIsPageView] = useState(true);
  const autosaveTimerRef = useRef<any>(null);

  // Normalize initial content so Markdown syntax (###, **, \n) is converted to rich HTML before editor mounting
  const formattedInitialContent = React.useMemo(() => {
    if (initialJson) return initialJson;
    return normalizeContentToHtml(initialContent);
  }, [initialContent, initialJson]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        codeBlock: false, // Replaced by CodeBlockLowlight
      }),
      Underline,
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      FontSize,
      LineHeight,
      Indentation,
      CustomImage.configure({
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-emerald-600 dark:text-emerald-400 underline underline-offset-2 hover:opacity-80 transition-opacity',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: formattedInitialContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const json = editor.getJSON();

      if (onChange) {
        onChange(html, json);
      }

      // Debounced local persistence
      setSaveStatus('saving');
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = setTimeout(() => {
        try {
          localStorage.setItem(autoSaveKey, JSON.stringify({ html, json, time: Date.now() }));
          setSaveStatus('saved');
          const d = new Date();
          setLastSavedTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        } catch (e) {
          console.warn('LocalStorage save failed:', e);
        }
      }, 750);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[600px] font-sans text-slate-800 dark:text-slate-100',
      },
      // Transform pasted Markdown text into formatted HTML on paste
      transformPastedText(text) {
        if (/^#{1,6}\s+|^\s*[-*+]\s+|```|\[.*?\]\(.*?\)/m.test(text)) {
          return normalizeContentToHtml(text);
        }
        return text;
      },
      // Handle drag & drop images
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/') || file.name.endsWith('.svg')) {
            const reader = new FileReader();
            reader.onload = e => {
              const src = e.target?.result as string;
              if (src) {
                const node = view.state.schema.nodes.image.create({ src, width: '100%', align: 'center' });
                const transaction = view.state.tr.replaceSelectionWith(node);
                view.dispatch(transaction);
              }
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  // Watch for external content updates if initialContent changes after mount
  useEffect(() => {
    if (editor && initialContent && !initialJson && editor.isEmpty) {
      const normalized = normalizeContentToHtml(initialContent);
      editor.commands.setContent(normalized);
    }
  }, [editor, initialContent]);

  // Handle image insertion
  const handleInsertImage = (data: { src: string; alt?: string; width?: string; align?: string }) => {
    if (!editor) return;
    editor.chain().focus().setImage({
      src: data.src,
      alt: data.alt || '',
      title: data.alt || '',
      width: data.width || '100%',
      align: data.align || 'center',
    } as any).run();
  };

  // Handle link saving
  const handleSaveLink = (url: string) => {
    if (!editor) return;
    editor.chain().focus().setLink({ href: url }).run();
  };

  const handleUnlink = () => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Loading WYSIWYG editor...
      </div>
    );
  }

  // Word & Reading time stats
  const wordCount = editor.storage.characterCount.words();
  const charCount = editor.storage.characterCount.characters();
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className={`relative flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all ${
      isZenMode ? 'fixed inset-0 z-50 rounded-none border-none shadow-none bg-[#f1f3f4] dark:bg-[#070b14] overflow-y-auto' : ''
    }`}>
      {/* Microsoft Word / Google Docs Style Ribbon Toolbar */}
      <EditorToolbar
        editor={editor}
        onOpenImageModal={() => {
          setActiveImageAttrs(null);
          setImageModalOpen(true);
        }}
        onOpenLinkModal={() => setLinkModalOpen(true)}
        isZenMode={isZenMode}
        onToggleZenMode={onToggleZenMode}
        isPreviewMode={isPreviewMode}
        onTogglePreviewMode={onTogglePreviewMode}
        isPageView={isPageView}
        onTogglePageView={() => setIsPageView(!isPageView)}
      />

      {/* Floating Bubble Toolbar on Selection */}
      <BubbleToolbar
        editor={editor}
        onOpenLinkModal={() => setLinkModalOpen(true)}
      />

      {/* Contextual Table Menu */}
      <div className="px-4">
        <TableMenu editor={editor} />
      </div>

      {/* Document Canvas Workspace */}
      <div className={`flex-1 overflow-y-auto transition-colors ${
        isPageView
          ? 'bg-[#eef2f6] dark:bg-[#070b14] py-8 sm:py-12 px-2 sm:px-6'
          : 'bg-white dark:bg-slate-900 py-6 px-6'
      }`}>
        {isPreviewMode ? (
          /* Reader Preview */
          <div className="max-w-[850px] mx-auto bg-white dark:bg-[#131b2e] rounded shadow-md border border-slate-200/80 dark:border-slate-800 p-8 sm:p-14">
            <div className="mb-6 pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <HugeiconsIcon icon={Book02Icon} size={16} />
              <span>Document Print &amp; Reader Preview</span>
            </div>
            <div
              className="ProseMirror prose prose-slate dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
            />
          </div>
        ) : isPageView ? (
          /* Microsoft Word / Google Docs A4-Style Paper Sheet */
          <div className="max-w-[850px] min-h-[1100px] mx-auto bg-white dark:bg-[#131b2e] rounded-sm shadow-md hover:shadow-lg transition-shadow border border-slate-200/80 dark:border-slate-800 px-8 sm:px-16 py-12 relative">
            {/* Top document margin indicator line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/30 to-emerald-500/20 rounded-t-sm" />
            
            <EditorContent editor={editor} />
          </div>
        ) : (
          /* Continuous Full-Width Canvas */
          <div className="max-w-4xl mx-auto">
            <EditorContent editor={editor} />
          </div>
        )}
      </div>

      {/* Bottom Status Bar (Word count, read time, autosave indicator) */}
      <div className="flex items-center justify-between px-6 py-2 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <HugeiconsIcon icon={File01Icon} size={14} className="text-slate-400" />
            {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} chars
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <HugeiconsIcon icon={Clock01Icon} size={14} className="text-slate-400" />
            ~{estimatedReadTime} min read
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <HugeiconsIcon
            icon={BadgeCheckIcon}
            size={14}
            className={saveStatus === 'saving' ? 'text-amber-500 animate-spin' : 'text-emerald-600 dark:text-emerald-400'}
          />
          <span>
            {saveStatus === 'saving' ? 'Saving document...' : `Autosaved locally at ${lastSavedTime}`}
          </span>
        </div>
      </div>

      {/* Image Modal */}
      <ImageDialog
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onInsert={handleInsertImage}
        initialData={activeImageAttrs}
      />

      {/* Link Modal */}
      <LinkDialog
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onSave={handleSaveLink}
        onUnlink={handleUnlink}
        initialUrl={editor.getAttributes('link').href || ''}
      />
    </div>
  );
};
