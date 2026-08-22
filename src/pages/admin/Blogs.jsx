import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Loader2, Plus, Edit2, Trash2, Search, Filter, 
  List, Grid, RefreshCw, Download, ExternalLink, Eye, EyeOff
} from 'lucide-react';
import Modal from '../../components/admin/Modal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import ImageUpload from '../../components/admin/ui/ImageUpload';
import toast from 'react-hot-toast';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Latest Published');
  const [viewMode, setViewMode] = useState('list');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [saving, setSaving] = useState(false);

  // Deletion Confirm Modal State
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, title: '' });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    tags: '',
    read_time: '3 min read',
    author_name: 'Arun Pandian',
    cover_image: '',
    published: false,
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
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: blog.title || '',
        slug: blog.slug || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : (blog.tags || ''),
        read_time: blog.read_time || '3 min read',
        author_name: blog.author_name || 'Arun Pandian',
        cover_image: blog.cover_image || '',
        published: blog.published,
        featured: blog.featured,
        sort_order: blog.sort_order || 0
      });
    } else {
      setEditingBlog(null);
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        tags: '',
        read_time: '3 min read',
        author_name: 'Arun Pandian',
        cover_image: '',
        published: false,
        featured: false,
        sort_order: blogs.length > 0 ? Math.max(...blogs.map(b => b.sort_order)) + 1 : 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Tags are edited as a comma-separated string; store as an array
    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    try {
      if (editingBlog) {
        // Update
        const { error } = await supabase
          .from('blogs')
          .update(payload)
          .eq('id', editingBlog.id);
        if (error) throw error;
        toast.success('Blog post updated successfully');
      } else {
        // Insert
        const { error } = await supabase
          .from('blogs')
          .insert([payload]);
        if (error) throw error;
        toast.success('Blog post created successfully');
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
        <Loader2 className="animate-spin text-teal-600" size={24} />
      </div>
    );
  }

  return (
    <div className="font-sans text-slate-800">
      {/* Top Action Bar exactly matching Carpediem Tech screenshot */}
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
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-shadow"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select 
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 outline-none focus:border-teal-500 cursor-pointer"
          >
            <option>Latest Published</option>
            <option>Alphabetical</option>
          </select>
          
          <button onClick={() => toast('Advanced filters coming soon!', { icon: 'ℹ️' })} className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter size={16} />
            <span className="hidden sm:inline">Filters</span>
          </button>

          <div className="flex items-center p-1 rounded-xl border border-slate-200 bg-white">
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-800'}`}
            >
              <List size={16} />
            </button>
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-800'}`}
            >
              <Grid size={16} />
            </button>
          </div>

          <button onClick={fetchBlogs} className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 transition-colors">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button onClick={() => toast('Export functionality coming soon!', { icon: 'ℹ️' })} className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00a884] text-white text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm ml-auto xl:ml-0"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Blog
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="rounded-[1.25rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr>
                  <th className="px-6 py-4 w-12 border-b border-slate-100">
                    <input type="checkbox" className="rounded border-slate-300 text-teal-600 focus:ring-teal-600 cursor-pointer" />
                  </th>
                  <th className="px-6 py-4 font-bold text-xs text-slate-500 tracking-wider uppercase border-b border-slate-100">Title / Slug</th>
                  <th className="px-6 py-4 font-bold text-xs text-slate-500 tracking-wider uppercase border-b border-slate-100">Author</th>
                  <th className="px-6 py-4 font-bold text-xs text-slate-500 tracking-wider uppercase border-b border-slate-100">Status</th>
                  <th className="px-6 py-4 font-bold text-xs text-slate-500 tracking-wider uppercase border-b border-slate-100">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBlogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">No blog posts found.</td>
                  </tr>
                ) : (
                  filteredBlogs.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded border-slate-300 text-teal-600 focus:ring-teal-600 cursor-pointer" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {b.cover_image && (
                            <img src={b.cover_image} alt={b.title} className="h-9 w-9 rounded-md object-cover shrink-0 border border-slate-200" />
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">{b.title}</span>
                            <span className="text-xs text-slate-400 font-mono mt-0.5">/{b.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {b.author_name}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${b.published ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          {b.published && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                          {b.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleTogglePublish(b)}
                          className={`p-1.5 rounded-lg transition-colors ${b.published ? 'text-teal-600 hover:bg-teal-50' : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50'}`}
                          aria-label={b.published ? "Hide" : "Publish"}
                        >
                          {b.published ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <a 
                          href={`/blog/${b.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors inline-flex" 
                          aria-label="View Live"
                        >
                          <Eye size={16} />
                        </a>
                        <button 
                          onClick={() => openModal(b)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" 
                          aria-label="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(b)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" 
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
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
              <div key={b.id} className="bg-white p-6 rounded-[1.25rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex flex-col w-full">
                    {b.cover_image && (
                      <img src={b.cover_image} alt={b.title} className="w-full h-32 object-cover rounded-xl border border-slate-100 mb-4" />
                    )}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider mb-3 w-fit ${b.published ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {b.published && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                      {b.published ? 'Published' : 'Draft'}
                    </span>
                    <h3 className="font-bold text-slate-800 text-lg mb-1 line-clamp-2">{b.title}</h3>
                    <span className="text-xs text-slate-400 font-mono">/{b.slug}</span>
                  </div>
                </div>
                
                <p className="text-sm text-slate-500 mb-6 line-clamp-3 flex-1">
                  {b.excerpt || 'No excerpt available.'}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[10px]">
                      {b.author_name ? b.author_name.substring(0, 1).toUpperCase() : 'A'}
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{b.author_name}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                    <button onClick={() => handleTogglePublish(b)} className={`p-2 rounded-xl transition-colors ${b.published ? 'text-teal-600 hover:bg-teal-50' : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50'}`}>
                      {b.published ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <a href={`/blog/${b.slug}`} target="_blank" rel="noreferrer" className="p-2 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors flex items-center justify-center">
                      <ExternalLink size={16} />
                    </a>
                    <button onClick={() => openModal(b)} className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDeleteClick(b)} className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CRUD Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingBlog ? "Edit Blog Post" : "Add New Blog Post"}
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Post Title</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={e => {
                  // Auto-generate slug if it's empty
                  const newTitle = e.target.value;
                  const newSlug = formData.slug === '' ? newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : formData.slug;
                  setFormData({...formData, title: newTitle, slug: newSlug});
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                placeholder="e.g. My Data Journey"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">URL Slug</label>
              <input
                required
                type="text"
                value={formData.slug}
                onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '')})}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-mono text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                placeholder="e.g. my-data-journey"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={e => setFormData({...formData, excerpt: e.target.value})}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none min-h-[80px]"
                placeholder="Brief summary of the post..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Content (Markdown supported)</label>
              <textarea
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-mono focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none min-h-[180px]"
                placeholder={"### Heading\nWrite the full post here..."}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Tags (Comma separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                placeholder="Excel, Dashboards"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Read Time</label>
              <input
                type="text"
                value={formData.read_time}
                onChange={e => setFormData({...formData, read_time: e.target.value})}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                placeholder="4 min read"
              />
            </div>

            <div className="md:col-span-2">
              <ImageUpload
                label="Cover Image"
                folder="blogs"
                url={formData.cover_image}
                onUpload={(url) => setFormData({ ...formData, cover_image: url })}
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 mt-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={e => setFormData({...formData, published: e.target.checked})}
                className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600 cursor-pointer"
              />
              <label htmlFor="published" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                Publish this blog publicly
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00a884] text-white text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {editingBlog ? 'Save Changes' : 'Create Blog Post'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Blog Post"
        message={`Are you sure you want to delete the post "${deleteConfirm.title}"? This action cannot be undone.`}
        confirmLabel="Delete Post"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null, title: '' })}
      />
    </div>
  );
}
