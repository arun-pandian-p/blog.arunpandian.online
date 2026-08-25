import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
  Loader2, Plus, Edit2, Trash2, Search, Filter, 
  List, Grid, RefreshCw, Download, Eye, EyeOff, ExternalLink 
} from 'lucide-react';
import Modal from '../../components/admin/Modal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import ImageUpload from '../../components/admin/ui/ImageUpload';
import toast from 'react-hot-toast';

export default function Projects() {
  const [searchParams] = useSearchParams();
  const editParam = searchParams.get('edit');

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Latest Created');
  const [viewMode, setViewMode] = useState('list');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('core');
  const [editingProject, setEditingProject] = useState(null);
  const [saving, setSaving] = useState(false);

  // Deletion Confirm Modal State
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, title: '' });

  // Form state
  const emptyProject = {
    title: '',
    subtitle: '',
    problem: '',
    data: '',
    dataset_url: '',
    records_count: '',
    process: '',
    insight: '',
    result: '',
    tags: '',
    live_link: '',
    github_link: '',
    image_url: '',
    visual_2: '',
    visual_3: '',
    visual_4: '',
    visual_5: '',
    dax_code: '',
    model_notes: '',
    file_url: '',
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

  // Auto-open edit modal if ?edit=id or ?edit=name is in URL
  useEffect(() => {
    if (editParam && projects.length > 0) {
      const match = projects.find(
        (p) => p.id === editParam || p.title?.toLowerCase().includes(editParam.toLowerCase())
      );
      if (match) {
        openModal(match);
      }
    }
  }, [editParam, projects]);

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
    setModalTab('core');
    if (project) {
      setEditingProject(project);
      const visuals = (project.image_url || '').split('|||');
      setFormData({
        title: project.title || '',
        subtitle: project.subtitle || '',
        problem: project.problem || '',
        data: project.data || '',
        dataset_url: project.dataset_url || '',
        records_count: project.records_count || '',
        process: project.process || '',
        insight: project.insight || '',
        result: project.result || '',
        tags: Array.isArray(project.tags) ? project.tags.join(', ') : (project.tags || ''),
        live_link: project.live_link || '',
        github_link: project.github_link || '',
        image_url: visuals[0] || '',
        visual_2: visuals[1] || '',
        visual_3: visuals[2] || '',
        visual_4: visuals[3] || '',
        visual_5: visuals[4] || '',
        dax_code: project.dax_code || '',
        model_notes: project.model_notes || '',
        file_url: project.file_url || '',
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

    const allVisuals = [
      formData.image_url,
      formData.visual_2,
      formData.visual_3,
      formData.visual_4,
      formData.visual_5
    ].map(v => (v || '').trim()).filter(Boolean).join('|||');

    // Clean payload matching PostgreSQL projects schema
    const payload = {
      title: formData.title || '',
      problem: formData.problem || '',
      data: formData.data || '',
      process: formData.process || '',
      insight: formData.insight || '',
      tags: typeof formData.tags === 'string'
        ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        : Array.isArray(formData.tags) ? formData.tags : [],
      github_link: formData.github_link || '',
      live_link: formData.live_link || '',
      image_url: allVisuals || '',
      sort_order: Number(formData.sort_order) || 0,
      published: Boolean(formData.published)
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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleTogglePublish(p)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${p.published ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                            title={p.published ? "Click to Hide" : "Click to Publish"}
                            aria-label={p.published ? "Hide" : "Publish"}
                          >
                            {p.published ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                          <a
                            href={`/project/${p.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors inline-flex cursor-pointer"
                            title="View Public Project Details"
                            aria-label="View Live Project"
                          >
                            <ExternalLink size={16} />
                          </a>
                          <button 
                            onClick={() => openModal(p)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer font-medium inline-flex items-center gap-1" 
                            title="Edit Project"
                            aria-label="Edit Project"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer" 
                            title="Delete Project"
                            aria-label="Delete"
                          >
                            <Trash2 size={16} />
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

      {/* CRUD Modal with Structured Tabs */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? `Edit Project: ${formData.title || 'Project'}` : "Add New Analytics Project"}
      >
        {/* Modal Internal Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mb-6 border border-slate-200 overflow-x-auto">
          {[
            { id: 'core', label: '📝 Core Details' },
            { id: 'scope', label: '🎯 Scope & Insights' },
            { id: 'code', label: '🧮 DAX / SQL Code' },
            { id: 'media', label: '🖼️ Media & Embeds' },
            { id: 'files', label: '📥 Download Files' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setModalTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                modalTab === tab.id
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* TAB 1: CORE DETAILS */}
          {modalTab === 'core' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Project Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                  placeholder="e.g. Amazon Delivery Performance & Prediction Dashboard"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Subtitle / Executive Summary</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={e => setFormData({...formData, subtitle: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                  placeholder="Brief 1-2 sentence executive summary of the case study..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tools & Stack (Comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={e => setFormData({...formData, tags: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                  placeholder="Power BI, SQL, Python, DAX, KPI, Excel"
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

              <div className="md:col-span-2 flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={e => setFormData({...formData, published: e.target.checked})}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600 cursor-pointer"
                />
                <label htmlFor="published" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                  Publish this project publicly on portfolio and publication index
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: ANALYTICAL SCOPE & INSIGHTS */}
          {modalTab === 'scope' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Business Problem Statement ("The Question")</label>
                <textarea
                  value={formData.problem}
                  onChange={e => setFormData({...formData, problem: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none min-h-[90px]"
                  placeholder="What business question or operational bottleneck does this project solve?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Dataset Scope & Description</label>
                  <input
                    type="text"
                    value={formData.data}
                    onChange={e => setFormData({...formData, data: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                    placeholder="e.g. Amazon Delivery Dataset containing routing, weather, and driver logs"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Dataset URL (Source / Kaggle link)</label>
                  <input
                    type="url"
                    value={formData.dataset_url}
                    onChange={e => setFormData({...formData, dataset_url: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                    placeholder="https://kaggle.com/... or https://github.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Analytical Process & Methodology</label>
                <textarea
                  value={formData.process}
                  onChange={e => setFormData({...formData, process: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none min-h-[80px]"
                  placeholder="e.g. Data Cleaning → ETL Normalization → Star-Schema Modeling → DAX Engineering → Dashboard UI"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Key Findings & Statistical Insights</label>
                  <textarea
                    value={formData.insight}
                    onChange={e => setFormData({...formData, insight: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none min-h-[80px]"
                    placeholder="Key discoveries from the data..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Quantified Result / Business Impact</label>
                  <textarea
                    value={formData.result}
                    onChange={e => setFormData({...formData, result: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none min-h-[80px]"
                    placeholder="e.g. Identified +48 min delay trigger saving 14% turnaround variance."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DAX / SQL CODE */}
          {modalTab === 'code' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Engineered DAX / SQL Measure Snippet</label>
                <p className="text-xs text-slate-500 mb-2">Display interactive DAX formulas or SQL queries on the case study page.</p>
                <textarea
                  value={formData.dax_code || `SLA_Variance_Delta = \nDIVIDE(\n    [Avg_Actual_Delivery_Time] - [Avg_Predicted_Delivery_Time],\n    [Avg_Predicted_Delivery_Time],\n    0\n)`}
                  onChange={e => setFormData({...formData, dax_code: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-900 text-blue-300 font-mono text-xs focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none min-h-[140px]"
                  placeholder="Enter DAX or SQL calculations..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Data Model Architecture Notes</label>
                <input
                  type="text"
                  value={formData.model_notes || 'Star-Schema with 1-to-many single-directional propagation'}
                  onChange={e => setFormData({...formData, model_notes: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                  placeholder="e.g. Star-Schema with Fact deliveries & Dimensions"
                />
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA & EMBEDS */}
          {modalTab === 'media' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Power BI / Interactive Embed URL</label>
                  <input
                    type="url"
                    value={formData.live_link}
                    onChange={e => setFormData({...formData, live_link: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                    placeholder="https://app.powerbi.com/view?r=... or https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">GitHub Repository URL</label>
                  <input
                    type="url"
                    value={formData.github_link}
                    onChange={e => setFormData({...formData, github_link: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                    placeholder="https://github.com/shadow-byte-warrior/..."
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Visuals, Animated GIFs & Video Showcase</h4>
                    <p className="text-xs text-slate-500">Upload up to 5 multi-format visuals (PNG, JPG, WEBP, GIF, WebM, MP4) with multi-slide gallery support.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-mono font-bold">
                    {[formData.image_url, formData.visual_2, formData.visual_3, formData.visual_4, formData.visual_5].filter(Boolean).length} / 5 Uploaded
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Visual 1 */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 font-mono">Visual 01 · Main Dashboard Cover (PNG, JPG, GIF, WebM, MP4)</span>
                      <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Primary</span>
                    </div>
                    <ImageUpload
                      label="Visual 01 (Primary Overview)"
                      folder="projects"
                      accept="image/*,video/*"
                      url={formData.image_url}
                      onUpload={(url) => setFormData({ ...formData, image_url: url })}
                    />
                  </div>

                  {/* Visual 2 */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 font-mono">Visual 02 · Chart Drilldown / Animated GIF</span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Slide 2</span>
                    </div>
                    <ImageUpload
                      label="Visual 02 (Drilldown / GIF)"
                      folder="projects"
                      accept="image/*,video/*"
                      url={formData.visual_2}
                      onUpload={(url) => setFormData({ ...formData, visual_2: url })}
                    />
                  </div>

                  {/* Visual 3 */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 font-mono">Visual 03 · Architecture / Star-Schema Model</span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Slide 3</span>
                    </div>
                    <ImageUpload
                      label="Visual 03 (Data Model / Schema)"
                      folder="projects"
                      accept="image/*,video/*"
                      url={formData.visual_3}
                      onUpload={(url) => setFormData({ ...formData, visual_3: url })}
                    />
                  </div>

                  {/* Visual 4 */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 font-mono">Visual 04 · Deep-Dive Heatmap / Correlation Plot</span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Slide 4</span>
                    </div>
                    <ImageUpload
                      label="Visual 04 (Heatmap / Analysis)"
                      folder="projects"
                      accept="image/*,video/*"
                      url={formData.visual_4}
                      onUpload={(url) => setFormData({ ...formData, visual_4: url })}
                    />
                  </div>

                  {/* Visual 5 */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 font-mono">Visual 05 · Video Walkthrough / Executive Summary</span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Slide 5</span>
                    </div>
                    <ImageUpload
                      label="Visual 05 (Video / Summary)"
                      folder="projects"
                      accept="image/*,video/*"
                      url={formData.visual_5}
                      onUpload={(url) => setFormData({ ...formData, visual_5: url })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DOWNLOAD FILES */}
          {modalTab === 'files' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed">
                Upload or link your verified deliverables (.PBIX Power BI models, .CSV datasets, .XLSX spreadsheets, .PDF executive reports, .DOCX).
              </div>

              <div>
                <ImageUpload
                  label="Upload Project File (PBIX, PDF, CSV, XLSX, DOCX)"
                  folder="projects/files"
                  accept="*"
                  url={formData.file_url || ''}
                  onUpload={(url) => setFormData({ ...formData, file_url: url })}
                />
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Section:</span>
              <span className="font-semibold text-slate-600 uppercase font-mono">{modalTab}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00a884] text-white text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editingProject ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
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
