import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, Trash2, MailOpen, Mail } from 'lucide-react';
import ConfirmModal from '../../components/admin/ConfirmModal';
import toast from 'react-hot-toast';

export default function Inbox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Deletion Confirm Modal State
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, title: '' });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setMessages(data);
    setLoading(false);
  };

  const handleToggleRead = async (id, currentStatus) => {
    try {
      const { error } = await supabase.from('contact_messages').update({ read: !currentStatus }).eq('id', id);
      if (error) throw error;
      toast.success(currentStatus ? 'Marked as unread' : 'Marked as read');
    } catch (err) {
      toast.error('Error updating message: ' + err.message);
    } finally {
      fetchMessages();
    }
  };

  const handleDeleteClick = (msg) => {
    setDeleteConfirm({ isOpen: true, id: msg.id, title: msg.name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      const { error } = await supabase.from('contact_messages').delete().eq('id', deleteConfirm.id);
      if (error) throw error;
      toast.success('Message deleted successfully');
    } catch (err) {
      toast.error('Error deleting message: ' + err.message);
    } finally {
      setDeleteConfirm({ isOpen: false, id: null, title: '' });
      fetchMessages();
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl text-slate-800">Inbox</h1>
        <p className="text-slate-500 mt-1 text-sm">Messages from your public contact form.</p>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="rounded-[1.25rem] border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            No messages yet.
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`rounded-[1.25rem] border ${m.read ? 'border-slate-200 bg-white' : 'border-blue-200 bg-blue-50'} p-6 transition-colors shadow-sm`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold text-lg text-slate-800`}>{m.name}</h3>
                    {!m.read && <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
                  </div>
                  <a href={`mailto:${m.email}`} className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                    {m.email}
                  </a>
                  <p className="text-xs text-slate-400 font-mono mt-2">
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 sm:self-start">
                  <button 
                    onClick={() => handleToggleRead(m.id, m.read)}
                    className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors bg-white border border-slate-100 shadow-sm"
                    title={m.read ? 'Mark unread' : 'Mark read'}
                  >
                    {m.read ? <Mail size={16} /> : <MailOpen size={16} />}
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(m)}
                    className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors bg-white border border-slate-100 shadow-sm"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-slate-100">
                {m.subject && <h4 className="text-sm font-semibold text-slate-800 mb-2">Subject: {m.subject}</h4>}
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{m.message}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Message"
        message={`Are you sure you want to delete the message from "${deleteConfirm.title}"? This action cannot be undone.`}
        confirmLabel="Delete Message"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null, title: '' })}
      />
    </div>
  );
}
