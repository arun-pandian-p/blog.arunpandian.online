import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Shield01Icon,
  File01Icon,
  Alert02Icon,
  UserGroupIcon,
  ViewIcon,
  FavouriteIcon,
  Comment01Icon,
  Tick01Icon,
  Cancel01Icon,
  Delete02Icon,
  LockPasswordIcon,
  ArrowLeft01Icon,
} from '@hugeicons/core-free-icons';
import { Stats, AbuseReport, User, Blog } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [reports, setReports] = useState<AbuseReport[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [blogsList, setBlogsList] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'stories' | 'reports' | 'users'>('overview');

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [s, r, u, b] = await Promise.all([
        api.getAdminStats(),
        api.getAdminReports(),
        api.getAdminUsers(),
        api.getBlogs({ limit: 50 }),
      ]);
      setStats(s);
      setReports(r);
      setUsersList(u);
      setBlogsList(b);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId: string, newStatus: string) => {
    try {
      await api.updateReportStatus(reportId, newStatus);
      setReports(prev =>
        prev.map(r => (r.id === reportId ? { ...r, status: newStatus as any } : r))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update report');
    }
  };

  const handleToggleStoryPublish = async (blog: Blog) => {
    try {
      const updated = await api.updateBlog(blog.id, {
        published: !blog.published,
        status: !blog.published ? 'PUBLISHED' : 'DRAFT',
      });
      setBlogsList(prev => prev.map(b => (b.id === blog.id ? updated : b)));
    } catch (err: any) {
      alert(err.message || 'Failed to change publish status');
    }
  };

  const handleDeleteStory = async (blogId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this story as moderator?')) return;
    try {
      await api.deleteBlog(blogId);
      setBlogsList(prev => prev.filter(b => b.id !== blogId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete story');
    }
  };

  const handleRoleToggle = async (targetUser: User) => {
    const newRole = targetUser.role === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
    if (!window.confirm(`Change role of @${targetUser.username} to ${newRole}?`)) return;
    try {
      const updated = await api.updateUserRole(targetUser.id, newRole);
      setUsersList(prev => prev.map(u => (u.id === targetUser.id ? updated : u)));
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <HugeiconsIcon icon={LockPasswordIcon} size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-500 mb-6">
          You must be an authenticated administrator (`ROLE_ADMIN`) to access the moderation dashboard.
        </p>
        <a
          href="/"
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white"
        >
          Return to Feed
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <HugeiconsIcon icon={Shield01Icon} size={28} className="text-emerald-600 dark:text-emerald-400" />
            <span>Engineering Moderation &amp; Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Platform governance, review reports, user roles, and story management.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAdminData}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
        >
          Refresh Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 mb-8 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Metrics Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('stories')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'stories'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Stories Moderation ({blogsList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <span>Abuse Reports</span>
          {reports.filter(r => r.status === 'PENDING').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-bold">
              {reports.filter(r => r.status === 'PENDING').length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Users &amp; Roles ({usersList.length})
        </button>
      </div>

      {/* Overview Tab: Metrics Cards */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Total Stories
            </span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats.totalStories}
            </span>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.publishedStories} published · {stats.draftStories} drafts
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Total Users
            </span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats.totalUsers}
            </span>
            <div className="text-[11px] text-slate-400 mt-1">Registered engineers</div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Total Interactions
            </span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats.totalClaps}
            </span>
            <div className="text-[11px] text-slate-400 mt-1">
              {stats.totalComments} comments · {stats.totalViews} views
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Pending Reports
            </span>
            <span className={`text-2xl font-extrabold ${stats.pendingReports > 0 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
              {stats.pendingReports}
            </span>
            <div className="text-[11px] text-slate-400 mt-1">Flagged by community</div>
          </div>
        </div>
      )}

      {/* Stories Moderation Tab */}
      {activeTab === 'stories' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Title &amp; Slug</th>
                <th className="p-4">Author</th>
                <th className="p-4">Category</th>
                <th className="p-4">Views / Claps</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {blogsList.map(blog => (
                <tr key={blog.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-4 max-w-xs">
                    <a
                      href={`/story/${blog.slug}`}
                      className="font-bold text-slate-900 dark:text-white hover:text-emerald-500 truncate block"
                    >
                      {blog.title}
                    </a>
                    <span className="text-slate-400 font-mono text-[11px]">/story/{blog.slug}</span>
                  </td>
                  <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                    {blog.author_name || 'Anonymous'}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {blog.category || 'General'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">
                    {blog.views_count} views · {blog.claps_count} claps
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold ${
                        blog.published
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {blog.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStoryPublish(blog)}
                      className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-medium"
                    >
                      {blog.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStory(blog.id)}
                      className="px-2.5 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Abuse Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
              No abuse reports currently submitted.
            </div>
          ) : (
            reports.map(report => (
              <div
                key={report.id}
                className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {report.reason}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        report.status === 'PENDING'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                    Target: <strong>{report.target_type}</strong> (ID: {report.target_id})
                  </p>
                  {report.details && (
                    <p className="text-xs italic text-slate-500">"{report.details}"</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {report.status === 'PENDING' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleResolveReport(report.id, 'RESOLVED')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Resolve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResolveReport(report.id, 'DISMISSED')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      >
                        Dismiss
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Users & Roles Tab */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Current Role</th>
                <th className="p-4 text-right">Role Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {usersList.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <img
                      src={u.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                      alt={u.username}
                      className="w-6 h-6 rounded-full bg-slate-100"
                    />
                    <span>{u.full_name || u.username}</span>
                    <span className="text-slate-400 font-mono font-normal">(@{u.username})</span>
                  </td>
                  <td className="p-4 text-slate-500">{u.email}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        u.role === 'ROLE_ADMIN'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleRoleToggle(u)}
                      className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      {u.role === 'ROLE_ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
