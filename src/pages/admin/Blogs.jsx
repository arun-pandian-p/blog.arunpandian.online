import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
  Loader2, Plus, Edit2, Trash2, Search, Filter, 
  List, Grid, RefreshCw, Download, ExternalLink, Eye, EyeOff,
  FileText, Image as ImageIcon, Video, Code, Table, Link as LinkIcon,
  Sparkles, Globe, Share2, Tag, Calendar, Clock, User, Check,
  BookOpen, AlignLeft, Info, Lightbulb, AlertTriangle, Play
} from 'lucide-react';
import Modal from '../../components/admin/Modal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import ImageUpload from '../../components/admin/ui/ImageUpload';
import { parseArticleMetadata, serializeBlogContent } from '../../utils/blogParser';
import toast from 'react-hot-toast';

export default function Blogs() {
  const [searchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Latest Published');
  const [viewMode, setViewMode] = useState('grid');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('core');
  const [contentViewMode, setContentViewMode] = useState('edit');

  // Deletion Confirm Modal State
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, title: '' });

  // Extended Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Data Analytics',
    tags: '',
    read_time: '5 min read',
    author_name: 'Arun Pandian',
    author_avatar: '',
    published_at: new Date().toISOString().split('T')[0],
    cover_image: '',
    image_caption: '',
    video_url: '',
    powerbi_url: '',
    github_link: 'https://github.com/shadow-byte-warrior',
    live_link: '',
    seo_title: '',
    seo_description: '',
    social_image: '',
    published: true,
    featured: false,
    sort_order: 0
  });

  useEffect(() => {
    fetchBlogs();

    const channel = supabase
      .channel('blogs-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blogs' },
        () => {
          fetchBlogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle ?edit= URL query parameter (e.g. from public blog page "Edit in Admin" button)
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && blogs.length > 0) {
      const target = blogs.find(
        (b) => String(b.id) === String(editId) || String(b.slug) === String(editId)
      );
      if (target) {
        openModal(target);
      }
    }
  }, [searchParams, blogs]);

  const fetchBlogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setBlogs(data);
    setLoading(false);
  };

  const handleDeleteClick = (blog) => {
    setDeleteConfirm({ isOpen: true, id: blog.id, title: blog.title });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      const { error } = await supabase.from('blogs').delete().eq('id', deleteConfirm.id);
      if (error) throw error;
      toast.success('Blog post deleted successfully');
    } catch (err) {
      toast.error('Error deleting blog post: ' + err.message);
    } finally {
      setDeleteConfirm({ isOpen: false, id: null, title: '' });
      fetchBlogs();
    }
  };

  const handleTogglePublish = async (blog) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .update({ published: !blog.published })
        .eq('id', blog.id);
      
      if (error) throw error;
      toast.success(`Post ${blog.published ? 'hidden' : 'published'} successfully`);
      fetchBlogs();
    } catch (err) {
      toast.error('Error updating status: ' + err.message);
    }
  };

  const openModal = (blog = null) => {
    setActiveModalTab('core');
    setContentViewMode('edit');

    if (blog) {
      setEditingBlog(blog);
      const { cleanContent, meta } = parseArticleMetadata(blog);

      setFormData({
        title: blog.title || '',
        slug: blog.slug || '',
        excerpt: blog.excerpt || '',
        content: cleanContent || '',
        category: meta.category || (Array.isArray(blog.tags) && blog.tags[0]) || 'Data Analytics',
        tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : (blog.tags || ''),
        read_time: blog.read_time || '5 min read',
        author_name: blog.author_name || 'Arun Pandian',
        author_avatar: blog.author_avatar || '',
        published_at: blog.published_at ? blog.published_at.split('T')[0] : new Date().toISOString().split('T')[0],
        cover_image: blog.cover_image || '',
        image_caption: meta.imageCaption || '',
        video_url: meta.videoUrl || '',
        powerbi_url: meta.powerbiUrl || '',
        github_link: meta.githubLink || 'https://github.com/shadow-byte-warrior',
        live_link: meta.liveLink || '',
        seo_title: meta.seoTitle || blog.title || '',
        seo_description: meta.seoDescription || blog.excerpt || '',
        social_image: meta.socialImage || blog.cover_image || '',
        published: Boolean(blog.published),
        featured: Boolean(blog.featured),
        sort_order: blog.sort_order || 0
      });
    } else {
      setEditingBlog(null);
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '## 1. Executive Summary & Objective\n\nStart your data analysis article here...\n\n## 2. Dataset Architecture & Normalization\n\nExplain the dataset schema, data cleaning, and ETL transformation pipeline.\n\n```sql\n-- Sample SQL query\nSELECT category, COUNT(*) AS total_orders\nFROM sales_data\nGROUP BY category;\n```\n\n## 3. Key Findings & Business Impact\n\n> [!NOTE]\n> Automated anomaly detection identified 18% variance in peak hours.',
        category: 'Data Analytics',
        tags: 'Power BI, SQL, Data Analytics, Python',
        read_time: '5 min read',
        author_name: 'Arun Pandian',
        author_avatar: 'https://secxgzharggytkevlvmx.supabase.co/storage/v1/object/public/assets/about/lpb0j8p0xp7_1784136525170.png',
        published_at: new Date().toISOString().split('T')[0],
        cover_image: '',
        image_caption: '',
        video_url: '',
        powerbi_url: '',
        github_link: 'https://github.com/shadow-byte-warrior',
        live_link: '',
        seo_title: '',
        seo_description: '',
        social_image: '',
        published: true,
        featured: false,
        sort_order: blogs.length > 0 ? Math.max(...blogs.map(b => b.sort_order || 0)) + 1 : 1
      });
    }
    setIsModalOpen(true);
  };

  // Helper to insert markdown templates into editor textarea
  const insertMarkdownSnippet = (snippet) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content ? `${prev.content}\n\n${snippet}` : snippet
    }));
    toast.success('Snippet inserted!', { icon: '✍️' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const extraMeta = {
      category: formData.category || 'Data Analytics',
      imageCaption: formData.image_caption || '',
      videoUrl: formData.video_url || '',
      powerbiUrl: formData.powerbi_url || '',
      githubLink: formData.github_link || 'https://github.com/shadow-byte-warrior',
      liveLink: formData.live_link || '',
      seoTitle: formData.seo_title || formData.title,
      seoDescription: formData.seo_description || formData.excerpt,
      socialImage: formData.social_image || formData.cover_image,
    };

    // Serialize extra metadata into content safely
    const serializedContent = serializeBlogContent(formData.content, extraMeta);

    // Auto-calculate reading time if not explicitly set
    const wordCount = formData.content.trim().split(/\s+/).length;
    const calculatedReadTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

    // Database payload
    const payload = {
      title: formData.title || '',
      slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      excerpt: formData.excerpt || '',
      content: serializedContent,
      tags: typeof formData.tags === 'string'
        ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        : Array.isArray(formData.tags) ? formData.tags : [],
      read_time: formData.read_time || calculatedReadTime,
      author_name: formData.author_name || 'Arun Pandian',
      cover_image: formData.cover_image || '',
      published: Boolean(formData.published),
      featured: Boolean(formData.featured),
      sort_order: Number(formData.sort_order) || 0
    };

    try {
      if (editingBlog) {
        // Update
        const { error } = await supabase
          .from('blogs')
          .update(payload)
          .eq('id', editingBlog.id);
        if (error) throw error;
        toast.success('Blog post updated successfully!');
      } else {
        // Insert
        const { error } = await supabase
          .from('blogs')
          .insert([payload]);
        if (error) throw error;
        toast.success('Blog post published successfully!');
      }
      setIsModalOpen(false);
      fetchBlogs();
    } catch (err) {
      toast.error('Error saving blog: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredBlogs = blogs
    .filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.slug.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortOption === 'Alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  if (loading && blogs.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={24} />
      </div>
    );
  }

  return (
    <div className="font-sans text-slate-800">
      {/* Top Action Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select 
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
          >
            <option>Latest Published</option>
            <option>Alphabetical</option>
          </select>
          
          <div className="flex items-center p-1 rounded-xl border border-slate-200 bg-white">
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-1.5 rounded-lg cursor-pointer ${viewMode === 'grid' ? 'bg-slate-100 text-slate-800 font-bold' : 'text-slate-400 hover:text-slate-800'}`}
            >
              <Grid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-1.5 rounded-lg cursor-pointer ${viewMode === 'list' ? 'bg-slate-100 text-slate-800 font-bold' : 'text-slate-400 hover:text-slate-800'}`}
            >
              <List size={16} />
            </button>
          </div>

          <button 
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
          >
            <Plus size={16} />
            <span>Write New Article</span>
          </button>
        </div>
      </div>

      {/* Grid or List View */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-[1.25rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Article Title</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredBlogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                      No blog posts found.
                    </td>
                  </tr>
                ) : (
                  filteredBlogs.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {b.cover_image && (
                            <img src={b.cover_image} alt={b.title} className="h-10 w-10 rounded-lg object-cover shrink-0 border border-slate-200 bg-slate-900" />
                          )}
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{b.title}</span>
                            <span className="text-xs text-slate-400 font-mono mt-0.5">/{b.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {b.author_name || 'Arun Pandian'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${b.published ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                          {b.published && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                          {b.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => handleTogglePublish(b)}
                            title={b.published ? 'Hide Post' : 'Publish Post'}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              b.published
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700'
                            }`}
                          >
                            {b.published ? <Eye size={15} /> : <EyeOff size={15} />}
                          </button>
                          <a 
                            href={`/blog/${b.slug || b.id}`}
                            target="_blank"
                            rel="noreferrer"
                            title="View Live Blog"
                            className="p-1.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors inline-flex cursor-pointer" 
                          >
                            <ExternalLink size={15} />
                          </a>
                          <button 
                            onClick={() => openModal(b)}
                            title="Edit Blog"
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer" 
                          >
                            <Edit2 size={15} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(b)}
                            title="Delete Blog"
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer" 
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBlogs.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-[1.25rem] border border-slate-100 shadow-sm">
              No blog posts found.
            </div>
          ) : (
            filteredBlogs.map((b) => (
              <div key={b.id} className="bg-white p-6 rounded-[1.25rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex flex-col w-full">
                    {b.cover_image && (
                      <img src={b.cover_image} alt={b.title} className="w-full h-36 object-cover rounded-xl border border-slate-100 mb-4 bg-slate-900" />
                    )}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider mb-3 w-fit ${b.published ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                      {b.published && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                      {b.published ? 'Published' : 'Draft'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-lg mb-1 line-clamp-2 leading-snug">{b.title}</h3>
                    <span className="text-xs text-slate-400 font-mono">/{b.slug}</span>
                  </div>
                </div>
                
                <p className="text-sm text-slate-500 mb-6 line-clamp-3 flex-1 leading-relaxed">
                  {b.excerpt || 'No excerpt available.'}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                      {b.author_name ? b.author_name.substring(0, 1).toUpperCase() : 'A'}
                    </div>
                    <span className="text-xs font-semibold text-slate-600">{b.author_name || 'Arun Pandian'}</span>
                  </div>
                  
                  {/* Clean, Always-Visible Action Bar */}
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handleTogglePublish(b)} 
                      title={b.published ? 'Hide Post' : 'Publish Post'}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        b.published 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' 
                          : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700'
                      }`}
                    >
                      {b.published ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <a 
                      href={`/blog/${b.slug || b.id}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      title="View Live Blog"
                      className="p-1.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center justify-center cursor-pointer"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button 
                      onClick={() => openModal(b)} 
                      title="Edit Post"
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(b)} 
                      title="Delete Post"
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Multi-Tabbed Comprehensive Article Editor Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingBlog ? "Edit Technical Publication" : "Create Technical Publication"}
      >
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Modal Tab Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            {[
              { id: 'core', label: '📝 Core Details' },
              { id: 'content', label: '✍️ Article Content' },
              { id: 'media', label: '🖼️ Media & Embeds' },
              { id: 'seo', label: '🔍 SEO & Social' },
            ].map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveModalTab(tab.id)}
                className={`flex-1 py-2 px-3 rounded-lg transition-all cursor-pointer ${
                  activeModalTab === tab.id
                    ? 'bg-white text-blue-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: CORE DETAILS */}
          {activeModalTab === 'core' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Article Title *
                </label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    const autoSlug = !editingBlog || !formData.slug
                      ? newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                      : formData.slug;
                    setFormData({ ...formData, title: newTitle, slug: autoSlug });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Analyzing Delivery Performance with Power BI & DAX"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    URL Slug *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '') })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:border-blue-500 outline-none"
                    placeholder="e.g. delivery-performance-power-bi"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:border-blue-500 outline-none"
                    placeholder="e.g. Data Analytics, Power BI, SQL"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Executive Excerpt / Subtitle *
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:border-blue-500 outline-none leading-relaxed"
                  placeholder="A concise 1-2 sentence executive summary of the investigation..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Reading Time
                  </label>
                  <input
                    type="text"
                    value={formData.read_time}
                    onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                    placeholder="e.g. 6 min read"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                  placeholder="Power BI, SQL, Statistics, DAX"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Published to live site</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Featured Showcase</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: ARTICLE CONTENT & FORMATTING TOOLBAR */}
          {activeModalTab === 'content' && (
            <div className="space-y-3">
              {/* Quick Snippet Insert Bar */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase mr-1">Insert:</span>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet('## Section Title\n\nSection narrative...')}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet('### Subheading Title\n\nSubheading content...')}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet('```sql\nSELECT column1, COUNT(*)\nFROM dataset\nGROUP BY column1;\n```')}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-200 border border-slate-200 text-blue-700 font-mono text-[11px] cursor-pointer"
                >
                  SQL Code
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet('```python\nimport pandas as pd\n\ndf = pd.read_csv("data.csv")\nprint(df.describe())\n```')}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-200 border border-slate-200 text-emerald-700 font-mono text-[11px] cursor-pointer"
                >
                  Python
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet('> [!NOTE]\n> Key finding or metric observation here.')}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-200 border border-slate-200 text-indigo-700 text-[11px] cursor-pointer"
                >
                  Callout Box
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet('| Metric | Benchmark | Variance |\n|---|---|---|\n| Avg Lead Time | 24 hrs | -12% |\n| Defect Rate | 0.4% | -40% |')}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] cursor-pointer"
                >
                  Table
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet('- Key bullet point 1\n- Key bullet point 2\n- Key bullet point 3')}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] cursor-pointer"
                >
                  Bullet List
                </button>
              </div>

              {/* Editor Textarea */}
              <div className="relative">
                <textarea
                  rows={14}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-4 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:border-blue-500 outline-none leading-relaxed"
                  placeholder="Write your article in Markdown..."
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
                <span>
                  Words: {formData.content.trim().split(/\s+/).filter(Boolean).length} | Estimated: {Math.max(1, Math.ceil(formData.content.trim().split(/\s+/).filter(Boolean).length / 200))} min read
                </span>
                <span>Supports H2/H3, SQL, Python, Tables, Callouts</span>
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA & EMBEDS */}
          {activeModalTab === 'media' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Hero Cover Image
                </label>
                <ImageUpload
                  value={formData.cover_image}
                  onChange={(url) => setFormData({ ...formData, cover_image: url })}
                  folder="blogs"
                  placeholder="Upload article cover banner or paste URL"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Image Caption
                </label>
                <input
                  type="text"
                  value={formData.image_caption}
                  onChange={(e) => setFormData({ ...formData, image_caption: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                  placeholder="e.g. Figure 1.1 — Interactive Power BI Dashboard for Fleet Delivery Metrics"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    YouTube / Video Embed URL
                  </label>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Power BI / App Embed URL
                  </label>
                  <input
                    type="url"
                    value={formData.powerbi_url}
                    onChange={(e) => setFormData({ ...formData, powerbi_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                    placeholder="https://app.powerbi.com/view?r=..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    GitHub Repository Link
                  </label>
                  <input
                    type="url"
                    value={formData.github_link}
                    onChange={(e) => setFormData({ ...formData, github_link: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                    placeholder="https://github.com/shadow-byte-warrior/..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Live Demo / Dashboard URL
                  </label>
                  <input
                    type="url"
                    value={formData.live_link}
                    onChange={(e) => setFormData({ ...formData, live_link: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SEO & SOCIAL */}
          {activeModalTab === 'seo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  SEO Meta Title
                </label>
                <input
                  type="text"
                  value={formData.seo_title}
                  onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                  placeholder={formData.title || 'SEO Title Tag'}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  SEO Meta Description
                </label>
                <textarea
                  rows={3}
                  value={formData.seo_description}
                  onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                  placeholder={formData.excerpt || 'Google search snippet description...'}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Social Preview Image URL
                </label>
                <input
                  type="url"
                  value={formData.social_image}
                  onChange={(e) => setFormData({ ...formData, social_image: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                  placeholder={formData.cover_image || 'https://...'}
                />
              </div>

              {/* Google Snippet Live Preview */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                  Google Search Snippet Preview:
                </span>
                <div className="text-xs text-blue-800 font-mono truncate">
                  https://arunpandian.me/blog/{formData.slug || 'slug'}
                </div>
                <div className="text-sm font-semibold text-blue-700 hover:underline cursor-pointer truncate">
                  {formData.seo_title || formData.title || 'Article Title'}
                </div>
                <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {formData.seo_description || formData.excerpt || 'Meta description preview...'}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              <span>{saving ? 'Saving...' : editingBlog ? 'Save Changes' : 'Publish Article'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null, title: '' })}
        onConfirm={handleConfirmDelete}
        title="Delete Blog Post"
        message={`Are you sure you want to permanently delete "${deleteConfirm.title}"? This action cannot be undone.`}
        confirmText="Delete Post"
        confirmVariant="danger"
      />
    </div>
  );
}
