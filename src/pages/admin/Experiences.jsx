import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Loader2, Plus, Edit2, Trash2, Search, Filter, 
  List, Grid, RefreshCw, Download, Eye, EyeOff,
  ChevronUp, ChevronDown
} from 'lucide-react';
import ImageUpload from '../../components/admin/ui/ImageUpload';
import Modal from '../../components/admin/Modal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import toast from 'react-hot-toast';

export default function Experiences() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Custom Order');
  const [viewMode, setViewMode] = useState('list');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [saving, setSaving] = useState(false);

  // Deletion Confirm Modal State
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, title: '' });

  // Form state
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    period: '',
    type: 'Full-time',
    impact: '',
    published: true,
    sort_order: 0,
    media_url: '',
    company_website: ''
  });

  useEffect(() => {
    fetchExperiences();

    const channel = supabase
      .channel('experiences-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'experiences' },
        () => {
          fetchExperiences();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchExperiences = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (!error && data) setExperiences(data);
    setLoading(false);
  };

  const handleDeleteClick = (exp) => {
    setDeleteConfirm({ isOpen: true, id: exp.id, title: `${exp.role} at ${exp.company}` });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      const { error } = await supabase.from('experiences').delete().eq('id', deleteConfirm.id);
      if (error) throw error;
      toast.success('Experience deleted successfully');
    } catch (err) {
      toast.error('Error deleting experience: ' + err.message);
    } finally {
      setDeleteConfirm({ isOpen: false, id: null, title: '' });
      fetchExperiences();
    }
  };

  const handleTogglePublish = async (exp) => {
    try {
      const { error } = await supabase
        .from('experiences')
        .update({ published: !exp.published })
        .eq('id', exp.id);
      
      if (error) throw error;
      toast.success(`Experience ${exp.published ? 'hidden' : 'published'} successfully`);
      fetchExperiences();
    } catch (err) {
      toast.error('Error updating status: ' + err.message);
    }
  };

  const openModal = (exp = null) => {
    if (exp) {
      setEditingExperience(exp);
      setFormData({
        role: exp.role || '',
        company: exp.company || '',
        period: exp.period || '',
        type: exp.type || 'Full-time',
        impact: exp.impact || '',
        published: exp.published,
        sort_order: exp.sort_order || 0,
        media_url: exp.media_url || '',
        company_website: exp.company_website || ''
      });
    } else {
      setEditingExperience(null);
      setFormData({
        role: '',
        company: '',
        period: '',
        type: 'Full-time',
        impact: '',
        published: true,
        sort_order: experiences.length > 0 ? Math.max(...experiences.map(e => e.sort_order)) + 1 : 0,
        media_url: '',
        company_website: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleMoveUp = async (exp) => {
    const sorted = [...experiences].sort((a,b) => a.sort_order - b.sort_order);
    const index = sorted.findIndex(e => e.id === exp.id);
    if (index > 0) {
      const prevExp = sorted[index - 1];
      const tempOrder = exp.sort_order;
      try {
        await Promise.all([
          supabase.from('experiences').update({ sort_order: prevExp.sort_order }).eq('id', exp.id),
          supabase.from('experiences').update({ sort_order: tempOrder }).eq('id', prevExp.id)
        ]);
        fetchExperiences();
      } catch (err) {
        toast.error('Error reordering: ' + err.message);
      }
    }
  };

  const handleMoveDown = async (exp) => {
    const sorted = [...experiences].sort((a,b) => a.sort_order - b.sort_order);
    const index = sorted.findIndex(e => e.id === exp.id);
    if (index < sorted.length - 1) {
      const nextExp = sorted[index + 1];
      const tempOrder = exp.sort_order;
      try {
        await Promise.all([
          supabase.from('experiences').update({ sort_order: nextExp.sort_order }).eq('id', exp.id),
          supabase.from('experiences').update({ sort_order: tempOrder }).eq('id', nextExp.id)
        ]);
        fetchExperiences();
      } catch (err) {
        toast.error('Error reordering: ' + err.message);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (editingExperience) {
        // Update
        const { error } = await supabase
          .from('experiences')
          .update(formData)
          .eq('id', editingExperience.id);
        if (error) throw error;
        toast.success('Experience updated successfully');
      } else {
        // Insert
        const { error } = await supabase
          .from('experiences')
          .insert([formData]);
        if (error) throw error;
        toast.success('Experience added successfully');
      }
      setIsModalOpen(false);
      fetchExperiences();
    } catch (err) {
      toast.error('Error saving experience: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredExperiences = experiences
    .filter(e => e.company.toLowerCase().includes(searchQuery.toLowerCase()) || e.role.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortOption === 'Alphabetical') {
        return a.company.localeCompare(b.company);
      }
      if (sortOption === 'Latest Roles') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      // Custom Order
      return a.sort_order - b.sort_order;
    });

  if (loading && experiences.length === 0) {
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
            placeholder="Search experiences..."
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
            <option>Custom Order</option>
            <option>Latest Roles</option>
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

          <button onClick={fetchExperiences} className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 transition-colors">
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
            Add Experience
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
                  <th className="px-6 py-4 font-bold text-xs text-slate-500 tracking-wider uppercase border-b border-slate-100">Role / Company</th>
                  <th className="px-6 py-4 font-bold text-xs text-slate-500 tracking-wider uppercase border-b border-slate-100">Period</th>
                  <th className="px-6 py-4 font-bold text-xs text-slate-500 tracking-wider uppercase border-b border-slate-100">Status</th>
                  <th className="px-6 py-4 font-bold text-xs text-slate-500 tracking-wider uppercase border-b border-slate-100">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExperiences.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">No experiences found.</td>
                  </tr>
                ) : (
                  filteredExperiences.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded border-slate-300 text-teal-600 focus:ring-teal-600 cursor-pointer" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs shrink-0">
                            {exp.company.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">{exp.role}</span>
                            <span className="text-xs text-slate-400 mt-0.5">{exp.company}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {exp.period}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${exp.published ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          {exp.published && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                          {exp.published ? 'Published' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleMoveUp(exp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors" 
                          aria-label="Move Up"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button 
                          onClick={() => handleMoveDown(exp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors" 
                          aria-label="Move Down"
                        >
                          <ChevronDown size={16} />
                        </button>
                        <button 
                          onClick={() => handleTogglePublish(exp)}
                          className={`p-1.5 rounded-lg transition-colors ${exp.published ? 'text-teal-600 hover:bg-teal-50' : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50'}`}
                          aria-label={exp.published ? "Hide" : "Publish"}
                        >
                          {exp.published ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button 
                          onClick={() => openModal(exp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" 
                          aria-label="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(exp)}
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
          {filteredExperiences.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-[1.25rem] border border-slate-100 shadow-sm">
              No experiences found.
            </div>
          ) : (
            filteredExperiences.map((exp) => (
              <div key={exp.id} className="bg-white p-6 rounded-[1.25rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-5">
                  <div className="h-12 w-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg shrink-0">
                    {exp.company.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleMoveUp(exp)} className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors">
                      <ChevronUp size={16} />
                    </button>
                    <button onClick={() => handleMoveDown(exp)} className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors">
                      <ChevronDown size={16} />
                    </button>
                    <button onClick={() => handleTogglePublish(exp)} className={`p-2 rounded-xl transition-colors ${exp.published ? 'text-teal-600 hover:bg-teal-50' : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50'}`}>
                      {exp.published ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button onClick={() => openModal(exp)} className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDeleteClick(exp)} className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-bold text-slate-800 text-lg mb-1 line-clamp-1">{exp.role}</h3>
                <p className="text-sm font-medium text-slate-500 mb-2">{exp.company}</p>
                <p className="text-xs text-slate-400 mb-4">{exp.period}</p>
                
                {exp.media_url && (
                  <div 
                    className="mb-4 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 relative aspect-video flex-shrink-0 cursor-pointer group hover:border-slate-300 transition-colors"
                    onClick={() => window.open(exp.media_url, '_blank')}
                    title="Click to view full certificate"
                  >
                    <img src={exp.media_url} alt="Certificate" className="w-full h-full object-contain p-2" />
                  </div>
                )}
                
                <div className="flex-1"></div>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                  <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">{exp.type}</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider ${exp.published ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {exp.published && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                    {exp.published ? 'Published' : 'Hidden'}
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
        title={editingExperience ? "Edit Experience" : "Add New Experience"}
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Role/Title</label>
              <input
                required
                type="text"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                placeholder="e.g. Data Analyst Intern"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Company</label>
              <input
                required
                type="text"
                value={formData.company}
                onChange={e => setFormData({...formData, company: e.target.value})}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                placeholder="e.g. Tech Corp"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Period</label>
              <input
                required
                type="text"
                value={formData.period}
                onChange={e => setFormData({...formData, period: e.target.value})}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                placeholder="e.g. Jun 2023 - Aug 2023"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              >
                <option value="Internship">Internship</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Company Website (Optional)</label>
              <input
                type="url"
                value={formData.company_website}
                onChange={e => setFormData({...formData, company_website: e.target.value})}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <ImageUpload
                label="Media / Certificate (Optional PDF, Image, etc.)"
                url={formData.media_url}
                onUpload={(url) => setFormData({ ...formData, media_url: url })}
                folder="experiences"
                accept="*"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Impact / Description</label>
              <textarea
                value={formData.impact}
                onChange={e => setFormData({...formData, impact: e.target.value})}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none min-h-[100px]"
                placeholder="What did you build or improve in this role?"
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
                Show this on the timeline
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
              {editingExperience ? 'Save Changes' : 'Add Experience'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Experience"
        message={`Are you sure you want to delete the role "${deleteConfirm.title}"? This action cannot be undone.`}
        confirmLabel="Delete Experience"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null, title: '' })}
      />
    </div>
  );
}
