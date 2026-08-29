import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Loader2, Trash2, MailOpen, Mail, Users, Send, Search, Plus, 
  CheckCircle2, Clock, MessageSquare, Sparkles, AlertCircle, 
  ExternalLink, Check, UserCheck, UserX, RefreshCw
} from 'lucide-react';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { sendSubscriberBroadcast } from '../../services/newsletterService';
import toast from 'react-hot-toast';

export default function Inbox() {
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'followers' | 'broadcast'
  const [loading, setLoading] = useState(true);

  // Inquiries / Contact Messages State
  const [messages, setMessages] = useState([]);
  const [messageSearch, setMessageSearch] = useState('');

  // Followers / Newsletter Subscribers State
  const [subscribers, setSubscribers] = useState([]);
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [newEmailInput, setNewEmailInput] = useState('');
  const [addingSubscriber, setAddingSubscriber] = useState(false);

  // Broadcast / Follow-up Composer State
  const [selectedSubscribers, setSelectedSubscribers] = useState(new Set());
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastHeadline, setBroadcastHeadline] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastCtaText, setBroadcastCtaText] = useState('Explore Interactive Insights ➔');
  const [broadcastUrl, setBroadcastUrl] = useState('https://blog.arunpandian.online');
  const [broadcastImage, setBroadcastImage] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Delete Confirm Modal
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, type: '', id: null, title: '' });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Contact Messages
      if (supabase) {
        const { data: msgs } = await supabase
          .from('contact_messages')
          .select('*')
          .order('created_at', { ascending: false });
        if (msgs) setMessages(msgs);

        // 2. Fetch Newsletter Subscribers
        const { data: subs } = await supabase
          .from('newsletter_subscribers')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (subs) {
          setSubscribers(subs);
          const activeEmails = subs.filter((s) => s.status !== 'unsubscribed').map((s) => s.email);
          setSelectedSubscribers(new Set(activeEmails));
        }
      }
    } catch (err) {
      console.warn('Error fetching inbox/followers:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Contact Messages Handlers ──
  const handleToggleRead = async (id, currentStatus) => {
    try {
      const { error } = await supabase.from('contact_messages').update({ read: !currentStatus }).eq('id', id);
      if (error) throw error;
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: !currentStatus } : m));
      toast.success(currentStatus ? 'Marked as unread' : 'Marked as read');
    } catch (err) {
      toast.error('Error updating message: ' + err.message);
    }
  };

  // ── Subscribers / Followers Handlers ──
  const handleAddSubscriber = async (e) => {
    e.preventDefault();
    const clean = newEmailInput.trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setAddingSubscriber(true);
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('newsletter_subscribers')
          .upsert([{
            email: clean,
            source: 'admin_manual_add',
            status: 'active',
            updated_at: new Date().toISOString()
          }], { onConflict: 'email' })
          .select();

        if (error) throw error;
        toast.success(`Follower ${clean} added successfully!`, { icon: '✨' });
        setNewEmailInput('');
        fetchAllData();
      }
    } catch (err) {
      toast.error(err.message || 'Error adding subscriber');
    } finally {
      setAddingSubscriber(false);
    }
  };

  const handleToggleSubscriberStatus = async (sub) => {
    const nextStatus = sub.status === 'active' ? 'unsubscribed' : 'active';
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({
          status: nextStatus,
          updated_at: new Date().toISOString(),
          unsubscribe_reason: nextStatus === 'unsubscribed' ? 'Admin toggled inactive' : null
        })
        .eq('id', sub.id);

      if (error) throw error;
      toast.success(`Subscriber marked as ${nextStatus}`);
      fetchAllData();
    } catch (err) {
      toast.error(err.message || 'Error updating status');
    }
  };

  const handleDeleteSubscriber = (sub) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'subscriber',
      id: sub.id,
      title: sub.email
    });
  };

  const handleDeleteMessage = (msg) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'message',
      id: msg.id,
      title: `${msg.name} (${msg.email})`
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      if (deleteConfirm.type === 'message') {
        const { error } = await supabase.from('contact_messages').delete().eq('id', deleteConfirm.id);
        if (error) throw error;
        toast.success('Message deleted successfully');
        setMessages((prev) => prev.filter((m) => m.id !== deleteConfirm.id));
      } else if (deleteConfirm.type === 'subscriber') {
        const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', deleteConfirm.id);
        if (error) throw error;
        toast.success('Follower removed successfully');
        setSubscribers((prev) => prev.filter((s) => s.id !== deleteConfirm.id));
      }
    } catch (err) {
      toast.error(err.message || 'Error deleting item');
    } finally {
      setDeleteConfirm({ isOpen: false, type: '', id: null, title: '' });
    }
  };

  const startDirectFollowup = (email) => {
    setSelectedSubscribers(new Set([email]));
    setBroadcastSubject(`Personal follow-up from Arun Pandian`);
    setBroadcastHeadline(`A quick note on your data analytics inquiry`);
    setActiveTab('broadcast');
    toast(`Follow-up composer opened for ${email}`, { icon: '✉️' });
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (selectedSubscribers.size === 0) {
      toast.error('Please select at least 1 recipient');
      return;
    }
    if (!broadcastSubject) {
      toast.error('Please enter an email subject');
      return;
    }

    setSendingBroadcast(true);
    try {
      const res = await sendSubscriberBroadcast({
        title: broadcastHeadline || broadcastSubject,
        subject: broadcastSubject,
        headline: broadcastHeadline || broadcastSubject,
        customMessage: broadcastMessage || undefined,
        ctaText: broadcastCtaText || 'Explore Case Study ➔',
        url: broadcastUrl || 'https://blog.arunpandian.online',
        imageUrl: broadcastImage || undefined,
        targetEmails: Array.from(selectedSubscribers)
      });

      if (res?.success) {
        toast.success(`⚡ Successfully dispatched email to ${selectedSubscribers.size} follower${selectedSubscribers.size > 1 ? 's' : ''}!`, { icon: '📬', duration: 5000 });
        setBroadcastSubject('');
        setBroadcastMessage('');
      } else {
        toast.error(res?.message || 'Failed to dispatch emails');
      }
    } catch (err) {
      toast.error(err.message || 'Error sending email broadcast');
    } finally {
      setSendingBroadcast(false);
    }
  };

  const unreadMessagesCount = messages.filter((m) => !m.read).length;
  const activeSubscribersCount = subscribers.filter((s) => s.status === 'active').length;

  if (loading && messages.length === 0 && subscribers.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Mails &amp; Follow-ups Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-sans mt-0.5">
            Manage incoming contact form messages, newsletter subscribers, and custom email follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllData}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={15} />
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#b83a26] hover:bg-[#992817] text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer"
          >
            <Send size={13} />
            <span>Compose Broadcast</span>
          </button>
        </div>
      </div>

      {/* ── MULTI-SECTION TABS / SIDEBAR BAR ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* LEFT NAV SIDEBAR (md:col-span-3) */}
        <aside className="md:col-span-3 space-y-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'inbox'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Mail size={15} />
              <span>Inbox &amp; Inquiries</span>
            </div>
            {unreadMessagesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-mono font-bold">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('followers')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'followers'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users size={15} />
              <span>Followers &amp; Subscribers</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
              {activeSubscribersCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'broadcast'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Send size={15} />
              <span>Send Mail &amp; Follow-up</span>
            </div>
            <span className="text-[10px] text-amber-500 font-bold">⚡ Active</span>
          </button>
        </aside>

        {/* RIGHT CONTENT PANEL (md:col-span-9) */}
        <main className="md:col-span-9 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
          
          {/* ═══════════════════════════════════════════════════════════════
              1. INBOX & INQUIRIES TAB
              ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'inbox' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="font-serif font-bold text-lg text-slate-900">
                    Contact Form Inquiries ({messages.length})
                  </h2>
                  <p className="text-xs text-slate-500">Messages sent directly from your website contact section.</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={messageSearch}
                    onChange={(e) => setMessageSearch(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-slate-900"
                  />
                  <Search size={13} className="absolute left-2.5 top-2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {messages.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <MailOpen size={36} className="mx-auto text-slate-300" />
                  <p className="font-serif font-bold text-base text-slate-700">No contact messages received yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages
                    .filter((m) => 
                      m.name?.toLowerCase().includes(messageSearch.toLowerCase()) || 
                      m.email?.toLowerCase().includes(messageSearch.toLowerCase()) ||
                      m.message?.toLowerCase().includes(messageSearch.toLowerCase()) ||
                      m.subject?.toLowerCase().includes(messageSearch.toLowerCase())
                    )
                    .map((m) => (
                      <div
                        key={m.id}
                        className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                          m.read
                            ? 'bg-white border-slate-200/80 text-slate-600'
                            : 'bg-blue-50/40 border-blue-200 text-slate-900 shadow-2xs'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase">
                              {m.name ? m.name.charAt(0) : 'U'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <strong className="text-sm font-bold text-slate-900">{m.name || 'Anonymous Visitor'}</strong>
                                {!m.read && (
                                  <span className="px-2 py-0.2 rounded-full bg-blue-600 text-white text-[9px] font-mono font-bold">
                                    NEW
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-500 font-mono">{m.email}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400 font-mono text-[11px]">
                              {m.created_at ? new Date(m.created_at).toLocaleDateString() : ''}
                            </span>
                            
                            <button
                              onClick={() => startDirectFollowup(m.email)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Send follow-up email"
                            >
                              ✉️ Reply / Follow-up
                            </button>

                            <button
                              onClick={() => handleToggleRead(m.id, m.read)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                              title={m.read ? "Mark as unread" : "Mark as read"}
                            >
                              {m.read ? <Mail size={14} /> : <MailOpen size={14} />}
                            </button>

                            <button
                              onClick={() => handleDeleteMessage(m)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete message"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {m.subject && (
                          <div className="font-semibold text-xs text-slate-800 font-mono">
                            Subject: {m.subject}
                          </div>
                        )}

                        <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {m.message}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              2. FOLLOWERS & SUBSCRIBERS TAB
              ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'followers' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="font-serif font-bold text-lg text-slate-900">
                    Followers &amp; Subscribers Inventory ({subscribers.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Verified subscribers receiving publications and broadcast updates from <code>updates@arunpandian.online</code>.
                  </p>
                </div>

                {/* Search Box */}
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search follower email..."
                    value={subscriberSearch}
                    onChange={(e) => setSubscriberSearch(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-slate-900"
                  />
                  <Search size={13} className="absolute left-2.5 top-2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Quick Add Subscriber Form */}
              <form onSubmit={handleAddSubscriber} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-slate-700 uppercase whitespace-nowrap">
                  + Add New Follower:
                </span>
                <input
                  type="email"
                  required
                  placeholder="subscriber@domain.com"
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  className="flex-1 w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 outline-none font-mono focus:border-slate-900"
                />
                <button
                  type="submit"
                  disabled={addingSubscriber}
                  className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {addingSubscriber ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  <span>Add Subscriber</span>
                </button>
              </form>

              {/* Subscribers Table / List */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[11px] uppercase text-slate-500 font-bold">
                    <tr>
                      <th className="p-3">Subscriber Email</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Source</th>
                      <th className="p-3">Subscribed Date</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subscribers
                      .filter((s) => s.email.toLowerCase().includes(subscriberSearch.toLowerCase()))
                      .map((sub) => {
                        const cleanName = sub.email.split('@')[0].replace(/\d+$/, '').split(/[._\-+]/)[0];
                        const capName = cleanName ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase() : 'Friend';
                        const isActive = sub.status !== 'unsubscribed';

                        return (
                          <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3">
                              <div className="font-mono font-bold text-slate-900">{sub.email}</div>
                              <span className="text-[10px] text-emerald-700 font-mono">Salutation: Hey {capName},</span>
                              {sub.unsubscribe_reason && (
                                <div className="text-[10px] text-slate-400 italic">
                                  Exit Reason: {sub.unsubscribe_reason}
                                </div>
                              )}
                            </td>

                            <td className="p-3">
                              {isActive ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold text-[10px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 font-mono font-bold text-[10px]">
                                  Unsubscribed
                                </span>
                              )}
                            </td>

                            <td className="p-3">
                              <span className="font-mono text-slate-500 text-[11px]">
                                {sub.source || 'Newsletter'}
                              </span>
                            </td>

                            <td className="p-3 font-mono text-slate-400 text-[11px]">
                              {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : '—'}
                            </td>

                            <td className="p-3 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => startDirectFollowup(sub.email)}
                                  className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-mono text-[10px] font-bold transition-colors cursor-pointer"
                                  title="Send custom email follow-up"
                                >
                                  ✉️ Follow-up
                                </button>

                                <button
                                  onClick={() => handleToggleSubscriberStatus(sub)}
                                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                                  title={isActive ? "Mark as Unsubscribed" : "Re-activate"}
                                >
                                  {isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                                </button>

                                <button
                                  onClick={() => handleDeleteSubscriber(sub)}
                                  className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                  title="Delete subscriber permanently"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              3. BROADCAST & FOLLOW-UP COMPOSER TAB
              ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'broadcast' && (
            <form onSubmit={handleSendBroadcast} className="space-y-6">
              <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="font-serif font-bold text-lg text-slate-900">
                    Send Custom Email &amp; Follow-up
                  </h2>
                  <p className="text-xs text-slate-500 font-sans">
                    Compose a direct email message to all or selected followers with personal <code>Hey &#123;Name&#125;,</code> greetings.
                  </p>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <span>Targeting:</span>
                  <strong className="text-slate-900 font-bold">{selectedSubscribers.size} Followers</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* ── LEFT: RECIPIENT SELECTOR (lg:col-span-4) ── */}
                <div className="lg:col-span-4 space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="text-xs font-mono font-bold text-slate-800 uppercase">
                      Recipients ({selectedSubscribers.size})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedSubscribers.size === subscribers.length) {
                          setSelectedSubscribers(new Set());
                        } else {
                          setSelectedSubscribers(new Set(subscribers.map((s) => s.email)));
                        }
                      }}
                      className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
                    >
                      {selectedSubscribers.size === subscribers.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-100 text-xs">
                    {subscribers.map((sub) => {
                      const isChecked = selectedSubscribers.has(sub.email);
                      const cleanName = sub.email.split('@')[0].replace(/\d+$/, '').split(/[._\-+]/)[0];
                      const capName = cleanName ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase() : 'Friend';

                      return (
                        <label
                          key={sub.email}
                          className={`flex items-start gap-2 p-1.5 rounded-lg cursor-pointer transition-colors ${
                            isChecked ? 'bg-blue-50 text-blue-950 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const next = new Set(selectedSubscribers);
                              if (next.has(sub.email)) next.delete(sub.email);
                              else next.add(sub.email);
                              setSelectedSubscribers(next);
                            }}
                            className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="block truncate font-mono text-[11px]">{sub.email}</span>
                            <span className="text-[10px] text-emerald-700 font-mono font-normal">Hey {capName},</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* ── RIGHT: EMAIL STORY COMPOSER (lg:col-span-8) ── */}
                <div className="lg:col-span-8 space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                      Email Subject Line *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 70% optimization achieved on new Power BI pipeline 🚀"
                      value={broadcastSubject}
                      onChange={(e) => setBroadcastSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-slate-900 outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                      Headline Inside Email (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. A quick case study walkthrough"
                      value={broadcastHeadline}
                      onChange={(e) => setBroadcastHeadline(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                      Custom Message / Personal Story (Supports Multi-Paragraphs)
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Hey! Just wanted to share a quick update on my latest data analytics project. Here is how we resolved high-latency queries..."
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-slate-900 outline-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                        CTA Button Text
                      </label>
                      <input
                        type="text"
                        value={broadcastCtaText}
                        onChange={(e) => setBroadcastCtaText(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-slate-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                        CTA Destination URL
                      </label>
                      <input
                        type="url"
                        value={broadcastUrl}
                        onChange={(e) => setBroadcastUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-slate-900 outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      disabled={sendingBroadcast || selectedSubscribers.size === 0}
                      className="px-6 py-2.5 rounded-xl bg-[#b83a26] hover:bg-[#992817] text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
                    >
                      {sendingBroadcast ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Dispatching Broadcast...</span>
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>Send Broadcast to {selectedSubscribers.size} Follower{selectedSubscribers.size > 1 ? 's' : ''}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </form>
          )}

        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.type === 'subscriber' ? 'Remove Follower' : 'Delete Message'}
        message={`Are you sure you want to permanently remove "${deleteConfirm.title}"?`}
        confirmLabel="Confirm Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, type: '', id: null, title: '' })}
      />
    </div>
  );
}
