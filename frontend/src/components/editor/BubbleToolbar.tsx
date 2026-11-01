import React from 'react';
import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  TextStrikethroughIcon,
  CodeIcon,
  Link01Icon,
  Heading01Icon,
  Heading02Icon,
  LeftToRightBlockQuoteIcon,
  HighlighterIcon,
} from '@hugeicons/core-free-icons';

interface BubbleToolbarProps {
  editor: Editor;
  onOpenLinkModal: () => void;
}

export const BubbleToolbar: React.FC<BubbleToolbarProps> = ({ editor, onOpenLinkModal }) => {
  return (
    <BubbleMenu
      editor={editor}
      className="flex items-center gap-0.5 p-1 bg-slate-900 text-white rounded-lg shadow-2xl border border-slate-700 text-xs backdrop-blur-md"
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
          editor.isActive('bold') ? 'bg-emerald-600 text-white' : 'text-slate-300'
        }`}
        title="Bold (Ctrl+B)"
      >
        <HugeiconsIcon icon={TextBoldIcon} size={14} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
          editor.isActive('italic') ? 'bg-emerald-600 text-white' : 'text-slate-300'
        }`}
        title="Italic (Ctrl+I)"
      >
        <HugeiconsIcon icon={TextItalicIcon} size={14} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
          editor.isActive('underline') ? 'bg-emerald-600 text-white' : 'text-slate-300'
        }`}
        title="Underline (Ctrl+U)"
      >
        <HugeiconsIcon icon={TextUnderlineIcon} size={14} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
          editor.isActive('strike') ? 'bg-emerald-600 text-white' : 'text-slate-300'
        }`}
        title="Strikethrough"
      >
        <HugeiconsIcon icon={TextStrikethroughIcon} size={14} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
          editor.isActive('code') ? 'bg-emerald-600 text-white' : 'text-slate-300'
        }`}
        title="Inline Code"
      >
        <HugeiconsIcon icon={CodeIcon} size={14} />
      </button>

      <div className="w-[1px] h-4 bg-slate-700 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
          editor.isActive('heading', { level: 1 }) ? 'bg-emerald-600 text-white' : 'text-slate-300'
        }`}
        title="H1 Heading"
      >
        <HugeiconsIcon icon={Heading01Icon} size={14} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
          editor.isActive('heading', { level: 2 }) ? 'bg-emerald-600 text-white' : 'text-slate-300'
        }`}
        title="H2 Heading"
      >
        <HugeiconsIcon icon={Heading02Icon} size={14} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
          editor.isActive('blockquote') ? 'bg-emerald-600 text-white' : 'text-slate-300'
        }`}
        title="Blockquote"
      >
        <HugeiconsIcon icon={LeftToRightBlockQuoteIcon} size={14} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
        className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
          editor.isActive('highlight') ? 'bg-yellow-400 text-slate-900' : 'text-slate-300'
        }`}
        title="Highlight"
      >
        <HugeiconsIcon icon={HighlighterIcon} size={14} />
      </button>

      <button
        type="button"
        onClick={onOpenLinkModal}
        className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
          editor.isActive('link') ? 'bg-emerald-600 text-white' : 'text-slate-300'
        }`}
        title="Insert Link"
      >
        <HugeiconsIcon icon={Link01Icon} size={14} />
      </button>
    </BubbleMenu>
  );
};
