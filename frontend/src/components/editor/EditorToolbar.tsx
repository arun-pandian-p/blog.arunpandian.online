import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  TextStrikethroughIcon,
  CodeIcon,
  Link01Icon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  CheckListIcon,
  LeftToRightBlockQuoteIcon,
  MinusSignIcon,
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  TextAlignJustifyIcon,
  TextIndentMoreIcon,
  TextIndentLessIcon,
  TableIcon as HugeTableIcon,
  Image01Icon,
  Undo02Icon,
  Redo02Icon,
  RemoveFormattingIcon,
  ColorPickerIcon,
  HighlighterIcon,
  ArrowDown01Icon,
  Maximize02Icon,
  Minimize02Icon,
  ViewIcon,
  PrinterIcon,
  File01Icon,
  ParagraphSpacingIcon,
  PlusSignIcon,
} from '@hugeicons/core-free-icons';

const Bold = (p: any) => <HugeiconsIcon icon={TextBoldIcon} size={15} {...p} />;
const Italic = (p: any) => <HugeiconsIcon icon={TextItalicIcon} size={15} {...p} />;
const Underline = (p: any) => <HugeiconsIcon icon={TextUnderlineIcon} size={15} {...p} />;
const Strikethrough = (p: any) => <HugeiconsIcon icon={TextStrikethroughIcon} size={15} {...p} />;
const Code = (p: any) => <HugeiconsIcon icon={CodeIcon} size={15} {...p} />;
const LinkIcon = (p: any) => <HugeiconsIcon icon={Link01Icon} size={15} {...p} />;
const List = (p: any) => <HugeiconsIcon icon={LeftToRightListBulletIcon} size={15} {...p} />;
const ListOrdered = (p: any) => <HugeiconsIcon icon={LeftToRightListNumberIcon} size={15} {...p} />;
const CheckSquare = (p: any) => <HugeiconsIcon icon={CheckListIcon} size={15} {...p} />;
const Quote = (p: any) => <HugeiconsIcon icon={LeftToRightBlockQuoteIcon} size={15} {...p} />;
const Minus = (p: any) => <HugeiconsIcon icon={MinusSignIcon} size={15} {...p} />;
const AlignLeft = (p: any) => <HugeiconsIcon icon={TextAlignLeftIcon} size={15} {...p} />;
const AlignCenter = (p: any) => <HugeiconsIcon icon={TextAlignCenterIcon} size={15} {...p} />;
const AlignRight = (p: any) => <HugeiconsIcon icon={TextAlignRightIcon} size={15} {...p} />;
const AlignJustify = (p: any) => <HugeiconsIcon icon={TextAlignJustifyIcon} size={15} {...p} />;
const Indent = (p: any) => <HugeiconsIcon icon={TextIndentMoreIcon} size={15} {...p} />;
const Outdent = (p: any) => <HugeiconsIcon icon={TextIndentLessIcon} size={15} {...p} />;
const TableIcon = (p: any) => <HugeiconsIcon icon={HugeTableIcon} size={15} {...p} />;
const ImageIcon = (p: any) => <HugeiconsIcon icon={Image01Icon} size={15} {...p} />;
const Undo2 = (p: any) => <HugeiconsIcon icon={Undo02Icon} size={15} {...p} />;
const Redo2 = (p: any) => <HugeiconsIcon icon={Redo02Icon} size={15} {...p} />;
const RemoveFormatting = (p: any) => <HugeiconsIcon icon={RemoveFormattingIcon} size={15} {...p} />;
const Palette = (p: any) => <HugeiconsIcon icon={ColorPickerIcon} size={15} {...p} />;
const Highlighter = (p: any) => <HugeiconsIcon icon={HighlighterIcon} size={15} {...p} />;
const ChevronDown = (p: any) => <HugeiconsIcon icon={ArrowDown01Icon} size={15} {...p} />;
const Maximize2 = (p: any) => <HugeiconsIcon icon={Maximize02Icon} size={15} {...p} />;
const Minimize2 = (p: any) => <HugeiconsIcon icon={Minimize02Icon} size={15} {...p} />;
const Eye = (p: any) => <HugeiconsIcon icon={ViewIcon} size={15} {...p} />;
const Printer = (p: any) => <HugeiconsIcon icon={PrinterIcon} size={15} {...p} />;
const FileText = (p: any) => <HugeiconsIcon icon={File01Icon} size={15} {...p} />;
const FoldHorizontal = (p: any) => <HugeiconsIcon icon={ParagraphSpacingIcon} size={15} {...p} />;
const Plus = (p: any) => <HugeiconsIcon icon={PlusSignIcon} size={15} {...p} />;
import {
  FONT_FAMILIES,
  FONT_SIZES,
  LINE_SPACINGS,
  COLOR_PALETTE,
  HIGHLIGHT_PALETTE,
  CODE_LANGUAGES,
} from './constants';

interface EditorToolbarProps {
  editor: Editor;
  onOpenImageModal: () => void;
  onOpenLinkModal: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  isPreviewMode: boolean;
  onTogglePreviewMode: () => void;
  isPageView: boolean;
  onTogglePageView: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  onOpenImageModal,
  onOpenLinkModal,
  isZenMode,
  onToggleZenMode,
  isPreviewMode,
  onTogglePreviewMode,
  isPageView,
  onTogglePageView,
}) => {
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [highlightMenuOpen, setHighlightMenuOpen] = useState(false);
  const [tableMenuOpen, setTableMenuOpen] = useState(false);
  const [lineSpacingOpen, setLineSpacingOpen] = useState(false);

  // Active heading value
  let activeHeading = 'paragraph';
  if (editor.isActive('heading', { level: 1 })) activeHeading = 'h1';
  else if (editor.isActive('heading', { level: 2 })) activeHeading = 'h2';
  else if (editor.isActive('heading', { level: 3 })) activeHeading = 'h3';
  else if (editor.isActive('heading', { level: 4 })) activeHeading = 'h4';

  const handleHeadingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else if (val === 'title') {
      editor.chain().focus().setHeading({ level: 1 }).run();
    } else if (val === 'subtitle') {
      editor.chain().focus().setHeading({ level: 3 }).run();
    } else {
      const level = parseInt(val.replace('h', '')) as 1 | 2 | 3 | 4 | 5 | 6;
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'default') {
      editor.chain().focus().unsetFontFamily().run();
    } else {
      editor.chain().focus().setFontFamily(val).run();
    }
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'default') {
      editor.chain().focus().unsetFontSize().run();
    } else {
      editor.chain().focus().setFontSize(val).run();
    }
  };

  const insertTable = (rows: number, cols: number) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setTableMenuOpen(false);
  };

  const insertCodeBlock = (language: string) => {
    if (!language) return;
    editor.chain().focus().toggleCodeBlock({ language }).run();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="sticky top-0 z-20 flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-[#f8fafc] dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs select-none overflow-x-auto scrollbar-none flex-nowrap sm:flex-wrap max-w-full">
      {/* 1. History & File Actions */}
      <div className="flex-shrink-0 flex items-center gap-0.5 pr-2 border-r border-slate-250 dark:border-slate-750">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          title="Print Document (Ctrl+P)"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>

      {/* 2. Style Preset Dropdown (Normal text, Title, Headings) */}
      <div className="flex items-center pl-1 pr-2 border-r border-slate-250 dark:border-slate-750">
        <select
          value={activeHeading}
          onChange={handleHeadingChange}
          aria-label="Style Presets"
          className="h-7 px-2 text-xs font-semibold rounded border border-slate-250 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="paragraph">Normal text</option>
          <option value="title">Title (H1)</option>
          <option value="subtitle">Subtitle (H3)</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
        </select>
      </div>

      {/* 3. Font Family (20+ fonts) */}
      <div className="flex items-center pr-2 border-r border-slate-250 dark:border-slate-750">
        <select
          onChange={handleFontFamilyChange}
          aria-label="Font Family"
          className="h-7 px-2 text-xs font-medium rounded border border-slate-250 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-[135px]"
        >
          <option value="default">Default Font</option>
          <optgroup label="Modern Sans-Serif">
            {FONT_FAMILIES.filter(f => f.category === 'sans').map(f => (
              <option key={f.name} value={f.family}>
                {f.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Editorial Serif">
            {FONT_FAMILIES.filter(f => f.category === 'serif').map(f => (
              <option key={f.name} value={f.family}>
                {f.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Monospace / Code">
            {FONT_FAMILIES.filter(f => f.category === 'mono').map(f => (
              <option key={f.name} value={f.family}>
                {f.name}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* 4. Font Size */}
      <div className="flex items-center pr-2 border-r border-slate-250 dark:border-slate-750">
        <select
          onChange={handleFontSizeChange}
          aria-label="Font Size"
          className="h-7 px-1.5 text-xs font-medium rounded border border-slate-250 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="default">12 pt</option>
          {FONT_SIZES.map(s => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* 5. Bold, Italic, Underline, Strike */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-slate-250 dark:border-slate-750">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 font-bold transition-colors ${
            editor.isActive('bold') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : ''
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${
            editor.isActive('italic') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : ''
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${
            editor.isActive('underline') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : ''
          }`}
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${
            editor.isActive('strike') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : ''
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6. Color & Highlighting */}
      <div className="relative flex items-center gap-0.5 pr-2 border-r border-slate-250 dark:border-slate-750">
        <button
          type="button"
          onClick={() => { setColorMenuOpen(!colorMenuOpen); setHighlightMenuOpen(false); setLineSpacingOpen(false); }}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-0.5"
          title="Text Color"
        >
          <Palette className="w-3.5 h-3.5 text-slate-700 dark:text-slate-200" />
          <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
        </button>

        {colorMenuOpen && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 grid grid-cols-4 gap-1.5 z-30">
            {COLOR_PALETTE.map(c => (
              <button
                key={c.name}
                type="button"
                onClick={() => {
                  if (c.value === 'inherit') editor.chain().focus().unsetColor().run();
                  else editor.chain().focus().setColor(c.value).run();
                  setColorMenuOpen(false);
                }}
                className="w-5 h-5 rounded border border-slate-300 dark:border-slate-700 hover:scale-110 transition-transform"
                style={{ backgroundColor: c.value === 'inherit' ? '#0f172a' : c.value }}
                title={c.name}
              />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => { setHighlightMenuOpen(!highlightMenuOpen); setColorMenuOpen(false); setLineSpacingOpen(false); }}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-0.5"
          title="Text Highlight Color"
        >
          <Highlighter className="w-3.5 h-3.5 text-amber-500" />
          <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
        </button>

        {highlightMenuOpen && (
          <div className="absolute top-full left-6 mt-1 p-2 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-1.5 z-30">
            {HIGHLIGHT_PALETTE.map(h => (
              <button
                key={h.name}
                type="button"
                onClick={() => {
                  if (!h.value) editor.chain().focus().unsetHighlight().run();
                  else editor.chain().focus().toggleHighlight({ color: h.value }).run();
                  setHighlightMenuOpen(false);
                }}
                className="w-5 h-5 rounded border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center justify-center hover:scale-110 transition-transform"
                style={{ backgroundColor: h.value || '#cbd5e1' }}
                title={h.name}
              >
                {!h.value && '×'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 7. Alignment, Line Spacing & Indentation */}
      <div className="relative flex items-center gap-0.5 pr-2 border-r border-slate-250 dark:border-slate-750">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : ''
          }`}
          title="Align Left (Ctrl+Shift+L)"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : ''
          }`}
          title="Align Center (Ctrl+Shift+E)"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : ''
          }`}
          title="Align Right (Ctrl+Shift+R)"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${
            editor.isActive({ textAlign: 'justify' }) ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : ''
          }`}
          title="Justify (Ctrl+Shift+J)"
        >
          <AlignJustify className="w-3.5 h-3.5" />
        </button>

        {/* Line Spacing Dropdown */}
        <button
          type="button"
          onClick={() => { setLineSpacingOpen(!lineSpacingOpen); setColorMenuOpen(false); setHighlightMenuOpen(false); }}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-0.5"
          title="Line & Paragraph Spacing"
        >
          <FoldHorizontal className="w-3.5 h-3.5" />
          <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
        </button>

        {lineSpacingOpen && (
          <div className="absolute top-full left-16 mt-1 p-1 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 min-w-[140px] z-30">
            {LINE_SPACINGS.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => {
                  editor.chain().focus().setLineHeight(s.value).run();
                  setLineSpacingOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Indent / Outdent */}
        <button
          type="button"
          onClick={() => editor.chain().focus().outdent().run()}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
          title="Decrease Indent"
        >
          <Outdent className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().indent().run()}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
          title="Increase Indent"
        >
          <Indent className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 8. Lists & Checklists */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-slate-250 dark:border-slate-750">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${
            editor.isActive('bulletList') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : ''
          }`}
          title="Bulleted List"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${
            editor.isActive('orderedList') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : ''
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${
            editor.isActive('taskList') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : ''
          }`}
          title="Checklist / Task List"
        >
          <CheckSquare className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${
            editor.isActive('blockquote') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : ''
          }`}
          title="Blockquote"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
          title="Horizontal Divider Line"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 9. Insert Elements: Table, Image, Link, Code */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-slate-250 dark:border-slate-750">
        <button
          type="button"
          onClick={onOpenImageModal}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400"
          title="Insert Image / SVG / Media"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Image</span>
        </button>

        {/* Table Insert Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setTableMenuOpen(!tableMenuOpen)}
            className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-0.5 ${
              editor.isActive('table') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : ''
            }`}
            title="Insert Table"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
          </button>

          {tableMenuOpen && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 min-w-[150px] z-30 space-y-1">
              <button
                type="button"
                onClick={() => insertTable(3, 3)}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
              >
                3 × 3 Grid
              </button>
              <button
                type="button"
                onClick={() => insertTable(4, 4)}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
              >
                4 × 4 Grid
              </button>
              <button
                type="button"
                onClick={() => insertTable(5, 5)}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
              >
                5 × 5 Matrix
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenLinkModal}
          className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${
            editor.isActive('link') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : ''
          }`}
          title="Insert Hyperlink (Ctrl+K)"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>

        {/* Code Block with Language Dropdown */}
        <select
          onChange={e => insertCodeBlock(e.target.value)}
          aria-label="Insert Code Block"
          className="h-7 px-1.5 text-xs font-mono rounded border border-slate-250 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
          title="Insert Code Block"
        >
          <option value="">+ Code</option>
          {CODE_LANGUAGES.map(l => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
          title="Clear Formatting (Remove marks)"
        >
          <RemoveFormatting className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 10. View & Layout Controls */}
      <div className="flex items-center gap-1 ml-auto pl-2">
        <button
          type="button"
          onClick={onTogglePageView}
          className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
            isPageView
              ? 'bg-slate-250 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
              : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
          title="Toggle Word Page Layout vs Continuous View"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">{isPageView ? 'Page View' : 'Full Width'}</span>
        </button>

        <button
          type="button"
          onClick={onTogglePreviewMode}
          className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
            isPreviewMode
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
          title="Reader Preview Mode"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Preview</span>
        </button>

        <button
          type="button"
          onClick={onToggleZenMode}
          className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
            isZenMode
              ? 'bg-emerald-600 text-white font-semibold'
              : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
          title="Distraction-Free Fullscreen Mode"
        >
          {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span className="hidden xl:inline">{isZenMode ? 'Exit' : 'Zen'}</span>
        </button>
      </div>
    </div>
  );
};
