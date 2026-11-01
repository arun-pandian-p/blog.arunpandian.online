import React from 'react';
import { Editor } from '@tiptap/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  TableIcon,
  TableRowsSplitIcon,
  TableColumnsSplitIcon,
  TableCellsMergeIcon,
  TableCellsSplitIcon,
  CheckListIcon,
  Delete02Icon,
} from '@hugeicons/core-free-icons';

interface TableMenuProps {
  editor: Editor;
}

export const TableMenu: React.FC<TableMenuProps> = ({ editor }) => {
  if (!editor.isActive('table')) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-1.5 bg-slate-900 text-white rounded-lg shadow-xl border border-slate-700 text-xs my-2 animate-in fade-in duration-150">
      <div className="flex items-center gap-1 px-2 py-0.5 text-emerald-400 font-semibold border-r border-slate-700">
        <HugeiconsIcon icon={TableIcon} size={14} />
        <span>Table Controls</span>
      </div>

      {/* Row Controls */}
      <div className="flex items-center gap-0.5 px-1 border-r border-slate-700">
        <button
          type="button"
          onClick={() => editor.chain().focus().addRowBefore().run()}
          className="p-1 hover:bg-slate-800 rounded flex items-center gap-1"
          title="Add Row Above"
        >
          <HugeiconsIcon icon={TableRowsSplitIcon} size={14} className="text-slate-400" />
          <span>+ Above</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().addRowAfter().run()}
          className="p-1 hover:bg-slate-800 rounded flex items-center gap-1"
          title="Add Row Below"
        >
          <HugeiconsIcon icon={TableRowsSplitIcon} size={14} className="text-slate-400" />
          <span>+ Below</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().deleteRow().run()}
          className="p-1 hover:bg-red-900/50 hover:text-red-300 rounded text-red-400"
          title="Delete Row"
        >
          <HugeiconsIcon icon={Delete02Icon} size={14} />
        </button>
      </div>

      {/* Column Controls */}
      <div className="flex items-center gap-0.5 px-1 border-r border-slate-700">
        <button
          type="button"
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          className="p-1 hover:bg-slate-800 rounded flex items-center gap-1"
          title="Add Column Before"
        >
          <HugeiconsIcon icon={TableColumnsSplitIcon} size={14} className="text-slate-400" />
          <span>+ Before</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          className="p-1 hover:bg-slate-800 rounded flex items-center gap-1"
          title="Add Column After"
        >
          <HugeiconsIcon icon={TableColumnsSplitIcon} size={14} className="text-slate-400" />
          <span>+ After</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().deleteColumn().run()}
          className="p-1 hover:bg-red-900/50 hover:text-red-300 rounded text-red-400"
          title="Delete Column"
        >
          <HugeiconsIcon icon={Delete02Icon} size={14} />
        </button>
      </div>

      {/* Cell Merging */}
      <div className="flex items-center gap-0.5 px-1 border-r border-slate-700">
        <button
          type="button"
          onClick={() => editor.chain().focus().mergeCells().run()}
          className="p-1 hover:bg-slate-800 rounded flex items-center gap-1"
          title="Merge Selected Cells"
        >
          <HugeiconsIcon icon={TableCellsMergeIcon} size={14} className="text-slate-400" />
          <span>Merge</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().splitCell().run()}
          className="p-1 hover:bg-slate-800 rounded flex items-center gap-1"
          title="Split Merged Cell"
        >
          <HugeiconsIcon icon={TableCellsSplitIcon} size={14} className="text-slate-400" />
          <span>Split</span>
        </button>
      </div>

      {/* Headers */}
      <div className="flex items-center gap-0.5 px-1 border-r border-slate-700">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeaderRow().run()}
          className="p-1 hover:bg-slate-800 rounded flex items-center gap-1"
          title="Toggle Header Row"
        >
          <HugeiconsIcon icon={CheckListIcon} size={14} className="text-slate-400" />
          <span>H-Row</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
          className="p-1 hover:bg-slate-800 rounded flex items-center gap-1"
          title="Toggle Header Column"
        >
          <HugeiconsIcon icon={CheckListIcon} size={14} className="text-slate-400" />
          <span>H-Col</span>
        </button>
      </div>

      {/* Delete Table */}
      <button
        type="button"
        onClick={() => editor.chain().focus().deleteTable().run()}
        className="p-1 px-2 hover:bg-red-900/60 rounded text-red-400 flex items-center gap-1 font-medium"
        title="Delete Table"
      >
        <HugeiconsIcon icon={Delete02Icon} size={14} />
        <span>Delete Table</span>
      </button>
    </div>
  );
};
