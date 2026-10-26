import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { all, createLowlight } from 'lowlight';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote,
  Code, FileCode, Link as LinkIcon, Image as ImageIcon,
  Minus, Undo, Redo, Eye, Check, Loader2, ArrowLeft,
  Settings, X, Upload, Globe, AlertCircle, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabaseClient';

const lowlight = createLowlight(all);

const CATEGORIES = [
  'Technology', 'Engineering', 'Lifestyle', 'Business',
  'Education', 'Design', 'Tutorials', 'Personal', 'Science'
];

interface TiptapEditorProps {
  initialBlog?: any;
  onSave: (blogData: any, isPublish: boolean) => Promise<any>;
  onBack: () => void;
  currentUser?: any;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  initialBlog,
  onSave,
  onBack,
  currentUser
}) => {
  // Document state
  const [title, setTitle] = useState(initialBlog?.title || '');
  const [excerpt, setExcerpt] = useState(initialBlog?.excerpt || '');
  const [slug, setSlug] = useState(initialBlog?.slug || '');
  const [category, setCategory] = useState(initialBlog?.category || 'Technology');
  const [tags, setTags] = useState<string[]>(
    Array.isArray(initialBlog?.tags)
      ? initialBlog.tags
      : (initialBlog?.tags ? initialBlog.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : ['Technology'])
  );
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState(initialBlog?.cover_image || initialBlog?.coverImage || '');
  const [coverVideoUrl, setCoverVideoUrl] = useState(initialBlog?.cover_video_url || initialBlog?.coverVideoUrl || '');
  const [isPublished, setIsPublished] = useState(initialBlog?.published || false);
  const [scheduledAt, setScheduledAt] = useState(initialBlog?.scheduled_at || '');

  // Editor mode & autosave
  const [isPreview, setIsPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSavingAction, setIsSavingAction] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);
  const lastSavedRef = useRef<string>('');

  // Auto-resize title textarea
  useEffect(() => {
    if (titleTextareaRef.current) {
      titleTextareaRef.current.style.height = 'auto';
      titleTextareaRef.current.style.height = `${titleTextareaRef.current.scrollHeight}px`;
    }
  }, [title]);

  // Generate initial content
  const initialContent = (() => {
    if (initialBlog?.content_json) {
      try {
        return typeof initialBlog.content_json === 'string'
          ? JSON.parse(initialBlog.content_json)
          : initialBlog.content_json;
      } catch {
        return initialBlog.content || '';
      }
    }
    return initialBlog?.content || '';
  })();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800'
        }
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-6 shadow-sm mx-auto'
        }
      }),
      Placeholder.configure({
        placeholder: 'Tell your story...',
      }),
      CharacterCount,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript'
      })
    ],
    content: initialContent,
    onUpdate: () => {
      setSaveStatus('unsaved');
    }
  });

  // Calculate stats
  const wordCount = editor?.storage.characterCount.words() || 0;
  const estimatedReadTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

  // Auto-generate slug from title if empty
  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTitle(val);
    setSaveStatus('unsaved');
    if (!initialBlog?.slug) {
      const generated = val
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  // Add / remove tags
  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (tags.length >= 4) {
        toast.error('Maximum 4 tags allowed per article');
        return;
      }
      if (!tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Upload image to Supabase Storage
  const handleImageUpload = async (file: File, isCover: boolean = false) => {
    try {
      setUploadingImage(true);
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image size must be under 10MB');
      }

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `blog-media/${fileName}`;

      const { data, error } = await supabase.storage
        .from('assets')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      if (isCover) {
        setCoverImage(publicUrl);
        toast.success('Cover image uploaded!');
      } else if (editor) {
        editor.chain().focus().setImage({ src: publicUrl }).run();
        toast.success('Image inserted into story!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
      setImageModalOpen(false);
      setImageUrlInput('');
    }
  };

  // Link Dialog
  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter link URL (https://...):', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    const validUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href: validUrl }).run();
  };

  // Autosave handler (debounced 4s)
  useEffect(() => {
    if (!editor || !title.trim()) return;

    const timer = setTimeout(async () => {
      const jsonContent = editor.getJSON();
      const htmlContent = editor.getHTML();
      const currentSnapshot = JSON.stringify({ title, excerpt, jsonContent, tags, coverImage });

      if (currentSnapshot === lastSavedRef.current || saveStatus === 'saved') return;

      try {
        setSaveStatus('saving');
        await onSave({
          title,
          slug: slug || undefined,
          excerpt,
          content: htmlContent,
          contentJson: JSON.stringify(jsonContent),
          tags: tags.join(','),
          category,
          coverImage,
          coverVideoUrl,
          readTime: estimatedReadTime,
          published: isPublished,
          status: isPublished ? 'PUBLISHED' : 'DRAFT'
        }, false);
        lastSavedRef.current = currentSnapshot;
        setSaveStatus('saved');
      } catch (err) {
        setSaveStatus('unsaved');
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [title, excerpt, slug, category, tags, coverImage, coverVideoUrl, editor, isPublished, saveStatus, onSave, estimatedReadTime]);

  // Explicit Save / Publish
  const handleExplicitSave = async (publishNow: boolean) => {
    if (!title.trim()) {
      toast.error('Please enter an article title');
      return;
    }
    if (!editor || editor.isEmpty) {
      toast.error('Article content cannot be empty');
      return;
    }

    try {
      setIsSavingAction(true);
      const jsonContent = editor.getJSON();
      const htmlContent = editor.getHTML();

      const finalStatus = publishNow ? 'PUBLISHED' : 'DRAFT';

      await onSave({
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim(),
        content: htmlContent,
        contentJson: JSON.stringify(jsonContent),
        tags: tags.join(','),
        category,
        coverImage,
        coverVideoUrl,
        readTime: estimatedReadTime,
        published: publishNow,
        status: finalStatus,
        scheduledAt: scheduledAt || null
      }, publishNow);

      setIsPublished(publishNow);
      setSaveStatus('saved');
      setSettingsModalOpen(false);
      toast.success(publishNow ? 'Article published successfully!' : 'Draft saved to cloud!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save article');
    } finally {
      setIsSavingAction(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-stone-900 flex flex-col font-sans">
      {/* ─── STUDIO HEADER ─── */}
      <header className="sticky top-0 z-30 bg-[#FDFCFB]/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-600 transition"
            title="Back to articles"
          >
            <ArrowLeft size={20} />
          </button>

          <span className="font-semibold text-sm tracking-tight text-stone-800">
            {currentUser?.fullName ? `${currentUser.fullName}'s Draft` : 'Story Studio'}
          </span>

          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
            isPublished ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-600 border border-stone-200'
          }`}>
            {isPublished ? 'Published' : 'Draft'}
          </span>

          {/* Autosave status indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-400 font-mono">
            {saveStatus === 'saving' && (
              <>
                <Loader2 size={12} className="animate-spin text-amber-500" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check size={12} className="text-emerald-500" />
                <span>Saved</span>
              </>
            )}
            {saveStatus === 'unsaved' && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Unsaved changes</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden md:inline text-xs text-stone-400 font-mono">
            {wordCount} words • {estimatedReadTime}
          </span>

          <button
            onClick={() => setIsPreview(!isPreview)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition flex items-center gap-1.5 ${
              isPreview
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Eye size={14} />
            <span>{isPreview ? 'Edit Story' : 'Preview'}</span>
          </button>

          <button
            onClick={() => handleExplicitSave(false)}
            disabled={isSavingAction}
            className="px-3 py-1.5 text-xs font-medium rounded-full border border-stone-300 text-stone-700 hover:bg-stone-100 transition disabled:opacity-50"
          >
            Save Draft
          </button>

          <button
            onClick={() => setSettingsModalOpen(true)}
            className="px-4 py-1.5 text-xs font-medium rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-sm"
          >
            <Settings size={14} />
            <span>Publish...</span>
          </button>
        </div>
      </header>

      {/* ─── TIPTAP TOOLBAR ─── */}
      {!isPreview && editor && (
        <div className="sticky top-[53px] z-20 bg-white/95 backdrop-blur border-b border-stone-200/80 px-4 sm:px-8 py-2 overflow-x-auto hide-scrollbar flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded hover:bg-stone-100 transition ${editor.isActive('bold') ? 'bg-stone-200 text-stone-900 font-bold' : 'text-stone-600'}`}
            title="Bold (Ctrl+B)"
          >
            <Bold size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-stone-100 transition ${editor.isActive('italic') ? 'bg-stone-200 text-stone-900' : 'text-stone-600'}`}
            title="Italic (Ctrl+I)"
          >
            <Italic size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded hover:bg-stone-100 transition ${editor.isActive('underline') ? 'bg-stone-200 text-stone-900' : 'text-stone-600'}`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded hover:bg-stone-100 transition ${editor.isActive('strike') ? 'bg-stone-200 text-stone-900' : 'text-stone-600'}`}
            title="Strikethrough"
          >
            <Strikethrough size={16} />
          </button>

          <div className="h-4 w-px bg-stone-200 mx-1" />

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded hover:bg-stone-100 transition ${editor.isActive('heading', { level: 1 }) ? 'bg-stone-200 text-stone-900 font-bold' : 'text-stone-600'}`}
            title="Heading 1"
          >
            <Heading1 size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded hover:bg-stone-100 transition ${editor.isActive('heading', { level: 2 }) ? 'bg-stone-200 text-stone-900 font-bold' : 'text-stone-600'}`}
            title="Heading 2"
          >
            <Heading2 size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded hover:bg-stone-100 transition ${editor.isActive('heading', { level: 3 }) ? 'bg-stone-200 text-stone-900 font-bold' : 'text-stone-600'}`}
            title="Heading 3"
          >
            <Heading3 size={16} />
          </button>

          <div className="h-4 w-px bg-stone-200 mx-1" />

          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded hover:bg-stone-100 transition ${editor.isActive('bulletList') ? 'bg-stone-200 text-stone-900' : 'text-stone-600'}`}
            title="Bullet List"
          >
            <List size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded hover:bg-stone-100 transition ${editor.isActive('orderedList') ? 'bg-stone-200 text-stone-900' : 'text-stone-600'}`}
            title="Numbered List"
          >
            <ListOrdered size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded hover:bg-stone-100 transition ${editor.isActive('blockquote') ? 'bg-stone-200 text-stone-900' : 'text-stone-600'}`}
            title="Blockquote"
          >
            <Quote size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded hover:bg-stone-100 transition ${editor.isActive('code') ? 'bg-stone-200 text-stone-900' : 'text-stone-600'}`}
            title="Inline Code"
          >
            <Code size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded hover:bg-stone-100 transition ${editor.isActive('codeBlock') ? 'bg-stone-200 text-stone-900' : 'text-stone-600'}`}
            title="Code Block (Syntax Highlighted)"
          >
            <FileCode size={16} />
          </button>

          <div className="h-4 w-px bg-stone-200 mx-1" />

          <button
            onClick={setLink}
            className={`p-1.5 rounded hover:bg-stone-100 transition ${editor.isActive('link') ? 'bg-stone-200 text-blue-600' : 'text-stone-600'}`}
            title="Insert Link"
          >
            <LinkIcon size={16} />
          </button>

          <button
            onClick={() => setImageModalOpen(true)}
            className="p-1.5 rounded hover:bg-stone-100 text-stone-600 transition"
            title="Insert Image"
          >
            <ImageIcon size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 rounded hover:bg-stone-100 text-stone-600 transition"
            title="Divider"
          >
            <Minus size={16} />
          </button>

          <div className="h-4 w-px bg-stone-200 mx-1" />

          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded hover:bg-stone-100 text-stone-500 disabled:opacity-30 transition"
            title="Undo (Ctrl+Z)"
          >
            <Undo size={16} />
          </button>

          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded hover:bg-stone-100 text-stone-500 disabled:opacity-30 transition"
            title="Redo (Ctrl+Y)"
          >
            <Redo size={16} />
          </button>
        </div>
      )}

      {/* ─── DOCUMENT CANVAS (MEDIUM INSPIRED) ─── */}
      <main className="flex-1 max-w-[760px] w-full mx-auto px-6 sm:px-8 py-10">
        {/* Cover Image Section */}
        {coverImage ? (
          <div className="relative group mb-8 rounded-2xl overflow-hidden border border-stone-200 shadow-sm max-h-[380px]">
            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
              <button
                onClick={() => coverInputRef.current?.click()}
                className="px-3 py-1.5 rounded-full bg-white text-stone-900 text-xs font-medium hover:bg-stone-100 transition"
              >
                Change Cover
              </button>
              <button
                onClick={() => setCoverImage('')}
                className="px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          !isPreview && (
            <div className="mb-6">
              <button
                onClick={() => coverInputRef.current?.click()}
                className="text-xs text-stone-400 hover:text-stone-700 flex items-center gap-1.5 transition font-medium"
              >
                <ImageIcon size={14} />
                <span>Add cover image</span>
              </button>
            </div>
          )
        )}
        <input
          type="file"
          ref={coverInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file, true);
          }}
          className="hidden"
          accept="image/*"
        />

        {/* Title & Subtitle */}
        {isPreview ? (
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-stone-950 tracking-tight leading-tight">
              {title || 'Untitled Story'}
            </h1>
            {excerpt && (
              <p className="mt-3 text-xl text-stone-500 font-serif leading-relaxed italic">
                {excerpt}
              </p>
            )}
          </div>
        ) : (
          <div className="mb-6 space-y-2">
            <textarea
              ref={titleTextareaRef}
              rows={1}
              value={title}
              onChange={handleTitleChange}
              placeholder="Title"
              className="w-full resize-none overflow-hidden bg-transparent font-serif text-4xl sm:text-5xl font-bold text-stone-950 placeholder-stone-300 focus:outline-none tracking-tight leading-tight"
            />
            <input
              type="text"
              value={excerpt}
              onChange={(e) => {
                setExcerpt(e.target.value);
                setSaveStatus('unsaved');
              }}
              placeholder="Add a subtitle or summary..."
              className="w-full bg-transparent font-serif text-xl text-stone-600 placeholder-stone-300 focus:outline-none leading-relaxed"
            />
          </div>
        )}

        {/* Tiptap Editor Canvas */}
        <div className={`prose prose-lg max-w-none font-serif text-stone-800 ${isPreview ? 'pointer-events-none' : ''}`}>
          <EditorContent editor={editor} />
        </div>
      </main>

      {/* ─── IMAGE INSERT MODAL ─── */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-900 text-base">Insert Image</h3>
              <button onClick={() => setImageModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                  />
                  <button
                    onClick={() => {
                      if (imageUrlInput && editor) {
                        editor.chain().focus().setImage({ src: imageUrlInput }).run();
                        setImageModalOpen(false);
                        setImageUrlInput('');
                      }
                    }}
                    className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition"
                  >
                    Insert
                  </button>
                </div>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-stone-200"></div>
                <span className="flex-shrink mx-4 text-xs text-stone-400">or upload from device</span>
                <div className="flex-grow border-t border-stone-200"></div>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-stone-500 rounded-xl p-6 text-center cursor-pointer transition bg-stone-50/50"
              >
                {uploadingImage ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={24} className="animate-spin text-stone-600" />
                    <span className="text-xs text-stone-500">Uploading to cloud storage...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-stone-500">
                    <Upload size={24} />
                    <span className="text-xs font-medium">Click to upload JPG, PNG, WEBP</span>
                    <span className="text-[10px] text-stone-400">Up to 10MB</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, false);
                }}
                className="hidden"
                accept="image/*"
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── PUBLICATION SETTINGS MODAL ─── */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-semibold text-stone-900 text-lg">Story Publication Settings</h3>
                <p className="text-xs text-stone-500 mt-0.5">Customize your story's metadata and audience reach.</p>
              </div>
              <button onClick={() => setSettingsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 bg-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Topics / Tags ({tags.length}/4)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-800 border border-stone-200"
                    >
                      #{tag}
                      <button onClick={() => handleRemoveTag(tag)} className="text-stone-400 hover:text-stone-600">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                {tags.length < 4 && (
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type topic and press Enter..."
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                  />
                )}
              </div>

              {/* Custom Slug */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Public URL Slug
                </label>
                <div className="flex items-center text-xs text-stone-500 bg-stone-50 px-3 py-2 border border-stone-300 rounded-lg">
                  <span className="text-stone-400 mr-1 font-mono">blog.arunpandian.online/posts/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^\w-]/g, ''))}
                    className="bg-transparent font-mono flex-1 focus:outline-none text-stone-900 font-semibold"
                  />
                </div>
              </div>

              {/* Cover Video URL (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Cover Video URL (Optional)
                </label>
                <input
                  type="url"
                  value={coverVideoUrl}
                  onChange={(e) => setCoverVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => handleExplicitSave(false)}
                  disabled={isSavingAction}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition"
                >
                  Save as Draft
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSettingsModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleExplicitSave(true)}
                    disabled={isSavingAction}
                    className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSavingAction && <Loader2 size={14} className="animate-spin" />}
                    <span>Publish Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TiptapEditor;
