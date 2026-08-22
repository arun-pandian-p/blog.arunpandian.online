import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Loader2, Plus, Edit2, Trash2, Search, Filter, 
  List, Grid, RefreshCw, Download, Eye, EyeOff 
} from 'lucide-react';
import Modal from '../../components/admin/Modal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import ImageUpload from '../../components/admin/ui/ImageUpload';
import toast from 'react-hot-toast';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Latest Created');
  const [viewMode, setViewMode] = useState('list');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [saving, setSaving] = useState(false);

  // Deletion Confirm Modal State
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, title: '' });

  // Form state
  const emptyProject = {
    title: '',
    problem: '',
    data: '',
    process: '',
    insight: '',
    tags: '',
    live_link: '',
    github_link: '',
    image_url: '',
    sort_order: 0,
    published: true
  };
  const [formData, setFormData] = useState(emptyProject);

  useEffect(() => {
    fetchProjects();

    const channel = supabase
      .channel('projects-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (!error && data) setProjects(data);
    setLoading(false);
  };

  const handleDeleteClick = (project) => {
    setDeleteConfirm({ isOpen: true, id: project.id, title: project.title });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', deleteConfirm.id);
      if (error) throw error;
      toast.success('Project deleted successfully');
    } catch (err) {
      toast.error('Error deleting project: ' + err.message);
    } finally {
      setDeleteConfirm({ isOpen: false, id: null, title: '' });
      fetchProjects();
    }
  };

  const handleTogglePublish = async (project) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ published: !project.published })
        .eq('id', project.id);
      
      if (error) throw error;
      toast.success(`Project ${project.published ? 'hidden' : 'published'} successfully`);
      fetchProjects();
    } catch (err) {
      toast.error('Error updating status: ' + err.message);
    }
  };

  const openModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title || '',
        problem: project.problem || '',
        data: project.data || '',
        process: project.process || '',
        insight: project.insight || '',
        tags: Array.isArray(project.tags) ? project.tags.join(', ') : (project.tags || ''),
        live_link: project.live_link || '',
        github_link: project.github_link || '',
        image_url: project.image_url || '',
        sort_order: project.sort_order || 0,
        published: project.published
      });
    } else {
      setEditingProject(null);
      setFormData({
        ...emptyProject,
        sort_order: projects.length > 0 ? Math.max(...projects.map(p => p.sort_order)) + 1 : 0,
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
      if (editingProject) {
        // Update
        const { error } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', editingProject.id);
        if (error) throw error;
        toast.success('Project updated successfully');
      } else {
        // Insert
        const { error } = await supabase
          .from('projects')
          .insert([payload]);
        if (error) throw error;
        toast.success('Project created successfully');
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      toast.error('Error saving project: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredProjects = projects
    .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortOption === 'Alphabetical') {
        return a.title.localeCompare(b.title);
      }
      // Latest Created (using created_at or fallback to id for now)
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  if (loading && projects.length === 0) {
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
            placeholder="Search by title..."
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
            <option>Latest Created</option>
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

          <button onClick={fetchProjects} className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 transition-colors">
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
            Add Project
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
                  <th className="px-6 py-4 font-bold text-xs text-slate-500 tracking-wider uppercase border-b border-slate-100">Project Title</th>
                  <th className="px-6 py-4 font-bold text-xs text-slate-500 tracking-wider uppercase border-b border-slate-100">Order</th>
                  <th className="px-6 py-4 font-bold text-xs text-slate-500 tracking-wider uppercase border-b border-slate-100">Status</th>
                  <th className="px-6 py-4 font-bold text-xs text-slate-500 tracking-wider uppercase border-b border-slate-100">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">No projects found.</td>
                  </tr>
                ) : (
                  filteredProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded border-slate-300 text-teal-600 focus:ring-teal-600 cursor-pointer" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.title} className="h-9 w-9 rounded-full object-cover shrink-0 border border-slate-200" />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                              {p.title.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span className="font-semibold text-slate-800">{p.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {p.sort_order}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${p.published ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          {p.published && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                          {p.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleTogglePublish(p)}
                          className={`p-1.5 rounded-lg transition-colors ${p.published ? 'text-teal-600 hover:bg-teal-50' : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50'}`}
                          aria-label={p.published ? "Hide" : "Publish"}
                        >
                          {p.published ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button 
                          onClick={() => openModal(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" 
                          aria-label="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(p)}
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
          {filteredProjects.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-[1.25rem] border border-slate-100 shadow-sm">
              No projects found.
            </div>
          ) : (
            filteredProjects.map((p) => (
              <div key={p.id} className="bg-white p-6 rounded-[1.25rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-5">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.title} className="h-12 w-12 rounded-2xl object-cover border border-slate-200 shrink-0" />
                  ) : (
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0">
                      {p.title.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleTogglePublish(p)} className={`p-2 rounded-xl transition-colors ${p.published ? 'text-teal-600 hover:bg-teal-50' : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50'}`}>
                      {p.published ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button onClick={() => openModal(p)} className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDeleteClick(p)} className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-1">{p.title}</h3>
                <p className="text-sm text-slate-500 mb-6 line-clamp-2 flex-1">
                  {p.problem || 'No description available for this project.'}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                  <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg">Order: {p.sort_order}</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider ${p.published ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {p.published && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                    {p.published ? 'Published' : 'Draft'}
                  </span>
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
        title={editingProject ? "Edit Project" : "Add New Project"}
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Project Title</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                placeholder="e.g. Data Science Job Market Analysis"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Problem Statement</label>
              <textarea
                value={formData.problem}
                onChange={e => setFormData({...formData, problem: e.target.value})}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none min-h-[80px]"
                placeholder="Describe the problem this project solves..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Data Used</label>
              <textarea
                value={formData.data}
                onChange={e => setFormData({...formData, data: e.target.value})}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none min-h-[60px]"
                placeholder="What dataset or data sources did this project use?"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Process</label>
              <textarea
                value={formData.process}
                onChange={e => setFormData({...formData, process: e.target.value})}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none min-h-[80px]"
                placeholder="How did you approach and build it?"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Insight / Result</label>
              <textarea
                value={formData.insight}
                onChange={e => setFormData({...formData, insight: e.target.value})}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none min-h-[60px]"
                placeholder="The key finding or outcome..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Tags (Comma separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                placeholder="Excel, Power Query, DAX"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Live Link URL</label>
              <input
                type="url"
                value={formData.live_link}
                onChange={e => setFormData({...formData, live_link: e.target.value})}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">GitHub URL</label>
              <input
                type="url"
                value={formData.github_link}
                onChange={e => setFormData({...formData, github_link: e.target.value})}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                placeholder="https://github.com/..."
              />
            </div>

            <div className="md:col-span-2">
              <ImageUpload
                label="Project Image / Cover"
                folder="projects"
                accept="image/*,video/*"
                url={formData.image_url}
                onUpload={(url) => setFormData({ ...formData, image_url: url })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Sort Order</label>
              <input
                required
                type="number"
                value={formData.sort_order}
                onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
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
                Publish this project publicly
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
              {editingProject ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`}
        confirmLabel="Delete Project"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null, title: '' })}
      />
    </div>
  );
}
