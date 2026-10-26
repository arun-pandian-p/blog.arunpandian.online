import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  User,
  Lock,
  FileText,
  LogOut,
  Save,
  Loader2,
  ArrowLeft,
  Edit2,
  Trash2,
  Plus,
  Clock,
  Calendar,
  Globe,
  ExternalLink
} from 'lucide-react';
import { FaGithub, FaXTwitter } from 'react-icons/fa6';
import BlogNavbar from '../components/BlogNavbar';
import MobileBottomNav from '../components/MobileBottomNav';
import { api } from '../services/apiClient';
import toast from 'react-hot-toast';

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password' | 'articles'
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: '',
    bio: '',
    avatarUrl: '',
    website: '',
    github: '',
    twitter: '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Articles state
  const [myArticles, setMyArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);

  useEffect(() => {
    if (!api.auth.isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }

    const loadUser = async () => {
      try {
        const u = await api.auth.me();
        setCurrentUser(u);
        setProfileData({
          fullName: u.fullName || '',
          bio: u.bio || '',
          avatarUrl: u.avatarUrl || '',
          website: u.website || '',
          github: u.github || '',
          twitter: u.twitter || '',
        });
      } catch (err) {
        console.error('Failed to load current user:', err);
      }
    };

    loadUser();
  }, [navigate]);

  const loadMyArticles = async () => {
    setLoadingArticles(true);
    try {
      const res = await api.blogs.getMyArticles(0, 50);
      setMyArticles(res?.content || []);
    } catch (err) {
      console.error('Failed to load user articles:', err);
    } finally {
      setLoadingArticles(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'articles') {
      loadMyArticles();
    }
  }, [activeTab]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await api.users.updateProfile(profileData);
      setCurrentUser(updated);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.users.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.blogs.deleteBlog(id);
      setMyArticles((prev) => prev.filter((a) => a.id !== id));
      toast.success('Article deleted');
    } catch (err) {
      toast.error('Failed to delete article');
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    toast.success('Signed out');
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C1A17] font-sans antialiased selection:bg-[#B83A26]/10 selection:text-[#B83A26]">
      <Helmet>
        <title>Account Settings — blog.arunpandian.online</title>
      </Helmet>

      <BlogNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-24">
        {/* Navigation back */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#7A7265] hover:text-[#B83A26] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Articles</span>
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#DED7CB] hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-xs font-mono font-medium text-[#7A7265] transition-all cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Header */}
        <div className="bg-white rounded-3xl border border-[#E7E0D3] p-6 sm:p-8 mb-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-16 h-16 rounded-2xl object-cover border border-[#E7E0D3]" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#1C1A17] text-white flex items-center justify-center font-serif text-xl font-bold">
                {currentUser?.fullName?.charAt(0) || 'U'}
              </div>
            )}
            <div>
              <h1 className="font-serif text-2xl font-black text-[#1C1A17]">{currentUser?.fullName || 'User'}</h1>
              <p className="text-xs font-mono text-[#8C8479]">@{currentUser?.username || 'user'} • {currentUser?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/write"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C1A17] text-white text-xs font-mono font-bold hover:bg-[#B83A26] transition-colors"
            >
              <Plus size={14} />
              <span>Write Article</span>
            </Link>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-[#E7E0D3] mb-8 pb-3 text-xs font-mono font-semibold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#1C1A17] text-white'
                : 'text-[#7A7265] hover:text-[#1C1A17] hover:bg-[#F2ECE1]'
            }`}
          >
            <User size={13} className="inline mr-1.5" />
            Profile & Bio
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'password'
                ? 'bg-[#1C1A17] text-white'
                : 'text-[#7A7265] hover:text-[#1C1A17] hover:bg-[#F2ECE1]'
            }`}
          >
            <Lock size={13} className="inline mr-1.5" />
            Password
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'articles'
                ? 'bg-[#1C1A17] text-white'
                : 'text-[#7A7265] hover:text-[#1C1A17] hover:bg-[#F2ECE1]'
            }`}
          >
            <FileText size={13} className="inline mr-1.5" />
            My Articles
          </button>
        </div>

        {/* Tab 1: Profile */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="bg-white rounded-3xl border border-[#E7E0D3] p-8 shadow-xs space-y-5">
            <div>
              <label className="block text-xs font-mono font-medium text-[#4A453E] mb-1">Full Name</label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                required
                className="w-full rounded-xl border border-[#E2DAD0] bg-[#FAF8F5] px-4 py-2.5 text-sm focus:border-[#B83A26] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-[#4A453E] mb-1">Author Bio</label>
              <textarea
                rows={3}
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder="A short description of yourself, what you write about, and what drives you..."
                className="w-full rounded-xl border border-[#E2DAD0] bg-[#FAF8F5] px-4 py-2.5 text-sm focus:border-[#B83A26] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-[#4A453E] mb-1">Avatar Image URL</label>
              <input
                type="url"
                value={profileData.avatarUrl}
                onChange={(e) => setProfileData({ ...profileData, avatarUrl: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-xl border border-[#E2DAD0] bg-[#FAF8F5] px-4 py-2.5 text-sm focus:border-[#B83A26] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-mono font-medium text-[#4A453E] mb-1">Website URL</label>
                <input
                  type="text"
                  value={profileData.website}
                  onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                  placeholder="https://mysite.com"
                  className="w-full rounded-xl border border-[#E2DAD0] bg-[#FAF8F5] px-4 py-2.5 text-sm focus:border-[#B83A26] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#4A453E] mb-1">GitHub Username</label>
                <input
                  type="text"
                  value={profileData.github}
                  onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                  placeholder="username"
                  className="w-full rounded-xl border border-[#E2DAD0] bg-[#FAF8F5] px-4 py-2.5 text-sm focus:border-[#B83A26] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#4A453E] mb-1">Twitter / X Username</label>
                <input
                  type="text"
                  value={profileData.twitter}
                  onChange={(e) => setProfileData({ ...profileData, twitter: e.target.value })}
                  placeholder="username"
                  className="w-full rounded-xl border border-[#E2DAD0] bg-[#FAF8F5] px-4 py-2.5 text-sm focus:border-[#B83A26] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#EFE9DF] flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1C1A17] hover:bg-[#B83A26] text-white text-xs font-mono font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Password */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="bg-white rounded-3xl border border-[#E7E0D3] p-8 shadow-xs space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-mono font-medium text-[#4A453E] mb-1">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
                className="w-full rounded-xl border border-[#E2DAD0] bg-[#FAF8F5] px-4 py-2.5 text-sm focus:border-[#B83A26] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-[#4A453E] mb-1">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                minLength={6}
                className="w-full rounded-xl border border-[#E2DAD0] bg-[#FAF8F5] px-4 py-2.5 text-sm focus:border-[#B83A26] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-[#4A453E] mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
                minLength={6}
                className="w-full rounded-xl border border-[#E2DAD0] bg-[#FAF8F5] px-4 py-2.5 text-sm focus:border-[#B83A26] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="pt-4 border-t border-[#EFE9DF] flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1C1A17] hover:bg-[#B83A26] text-white text-xs font-mono font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                <span>Update Password</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: My Articles */}
        {activeTab === 'articles' && (
          <div className="space-y-4">
            {loadingArticles ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-[#7A7265]">
                <Loader2 size={28} className="animate-spin text-[#B83A26]" />
                <p className="font-mono text-xs uppercase tracking-widest">Loading articles...</p>
              </div>
            ) : myArticles.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-[#E7E0D3] p-8">
                <FileText size={40} className="mx-auto text-[#8C8479] mb-3 opacity-50" />
                <h3 className="font-serif text-lg font-bold text-[#1C1A17] mb-2">No articles created yet</h3>
                <p className="text-xs text-[#7A7265] max-w-sm mx-auto mb-5">
                  Share your knowledge, tutorials, or engineering breakdowns with the community.
                </p>
                <Link
                  to="/write"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C1A17] text-white text-xs font-mono font-bold hover:bg-[#B83A26] transition-colors"
                >
                  <Plus size={14} />
                  <span>Write Your First Article</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#EBE4D8] bg-white rounded-3xl border border-[#E7E0D3] overflow-hidden shadow-xs">
                {myArticles.map((art) => (
                  <div key={art.id} className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FBF9F5]/70 transition-colors">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                          art.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          art.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {art.status}
                        </span>
                        {art.category && <span className="text-xs text-[#8C8479] font-mono">• {art.category}</span>}
                      </div>

                      <h3 className="font-serif text-base sm:text-lg font-bold text-[#1C1A17]">
                        <Link to={`/posts/${art.slug}`} className="hover:text-[#B83A26] transition-colors">
                          {art.title}
                        </Link>
                      </h3>

                      <div className="flex items-center gap-3 text-[11px] font-mono text-[#8C8479]">
                        <span>Views: {art.viewsCount || 0}</span>
                        <span>•</span>
                        <span>Claps: {art.clapsCount || 0}</span>
                        {art.publishedAt && (
                          <>
                            <span>•</span>
                            <span>Published: {new Date(art.publishedAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/admin/blogs`}
                        className="p-2 text-[#7A7265] hover:text-[#1C1A17] hover:bg-[#F2ECE1] rounded-lg transition-colors cursor-pointer"
                        title="Edit in publishing workspace"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button
                        onClick={() => handleDeleteArticle(art.id, art.title)}
                        className="p-2 text-[#7A7265] hover:text-[#B83A26] hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete article"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
}
