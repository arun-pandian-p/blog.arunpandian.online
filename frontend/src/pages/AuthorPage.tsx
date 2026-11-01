import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  GlobeIcon,
  PencilEdit02Icon,
  Book02Icon,
  FavouriteIcon,
  Tick01Icon,
  Cancel01Icon,
  File01Icon,
  Github01Icon,
  NewTwitterIcon,
} from '@hugeicons/core-free-icons';
import { User, Blog } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StoryCard } from '../components/story/StoryCard';

interface AuthorPageProps {
  username: string;
}

export const AuthorPage: React.FC<AuthorPageProps> = ({ username }) => {
  const { user: currentUser, updateUser } = useAuth();
  const [author, setAuthor] = useState<User | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published');
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  // Edit profile form state
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [github, setGithub] = useState('');
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const isMe = currentUser && currentUser.username.toLowerCase() === username.toLowerCase();

  useEffect(() => {
    loadAuthorData();
  }, [username]);

  const loadAuthorData = async () => {
    setLoading(true);
    try {
      // Fetch author stories
      const stories = await api.getBlogsByAuthor(username, Boolean(isMe));
      setBlogs(stories);

      // Derive author info from stories or currentUser
      if (isMe && currentUser) {
        setAuthor(currentUser);
        setFullName(currentUser.full_name);
        setBio(currentUser.bio || '');
        setAvatarUrl(currentUser.avatar_url || '');
        setGithub(currentUser.github || '');
        setTwitter(currentUser.twitter || '');
        setWebsite(currentUser.website || '');
      } else if (stories.length > 0) {
        const first = stories[0];
        setAuthor({
          id: first.author_id || 'unknown',
          username: first.author_username || username,
          full_name: first.author_name || username,
          bio: first.author_bio || 'Engineering contributor on Apstories.',
          avatar_url: first.author_avatar,
          role: 'ROLE_USER',
          email: '',
          created_at: first.created_at,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await api.updateProfile({
        full_name: fullName.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl.trim() || undefined,
        github: github.trim() || undefined,
        twitter: twitter.trim() || undefined,
        website: website.trim() || undefined,
      });
      setAuthor(updated);
      updateUser(updated);
      setEditProfileOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const publishedStories = blogs.filter(b => b.published && b.status === 'PUBLISHED');
  const draftStories = blogs.filter(b => !b.published || b.status === 'DRAFT');
  const totalClaps = blogs.reduce((sum, b) => sum + (b.claps_count || 0), 0);

  const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-200">
      {/* Author Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={author?.avatar_url || defaultAvatar}
            alt={author?.full_name || username}
            className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800 bg-slate-100 shadow-md"
          />

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 mb-2">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {author?.full_name || username}
                </h1>
                <p className="text-xs text-slate-400 font-mono">@{username}</p>
              </div>

              {isMe && (
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <HugeiconsIcon icon={PencilEdit02Icon} size={14} className="text-slate-400" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 max-w-2xl">
              {author?.bio || 'Documenting system design, technical discoveries, and engineering learnings.'}
            </p>

            {/* Social Links & Metrics */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                <HugeiconsIcon icon={Book02Icon} size={14} className="text-emerald-500" />
                <span>{publishedStories.length} Articles</span>
              </div>

              <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                <HugeiconsIcon icon={FavouriteIcon} size={14} className="text-red-500" />
                <span>{totalClaps} Claps Received</span>
              </div>

              {author?.github && (
                <a
                  href={author.github.startsWith('http') ? author.github : `https://github.com/${author.github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-emerald-500 transition-colors"
                >
                  <HugeiconsIcon icon={Github01Icon} size={14} />
                  <span>GitHub</span>
                </a>
              )}

              {author?.twitter && (
                <a
                  href={author.twitter.startsWith('http') ? author.twitter : `https://twitter.com/${author.twitter}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-emerald-500 transition-colors"
                >
                  <HugeiconsIcon icon={NewTwitterIcon} size={14} />
                  <span>Twitter</span>
                </a>
              )}

              {author?.website && (
                <a
                  href={author.website.startsWith('http') ? author.website : `https://${author.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-emerald-500 transition-colors"
                >
                  <HugeiconsIcon icon={GlobeIcon} size={14} />
                  <span>Portfolio</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Published Stories vs Drafts */}
      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 mb-8 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('published')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'published'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <HugeiconsIcon icon={Book02Icon} size={16} />
          <span>Published Stories ({publishedStories.length})</span>
        </button>

        {isMe && (
          <button
            type="button"
            onClick={() => setActiveTab('drafts')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'drafts'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <HugeiconsIcon icon={File01Icon} size={16} />
            <span>My Drafts ({draftStories.length})</span>
          </button>
        )}
      </div>

      {/* Stories Stream */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          Loading stories by author...
        </div>
      ) : activeTab === 'published' ? (
        publishedStories.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
            No published articles yet.
          </div>
        ) : (
          <div className="space-y-4">
            {publishedStories.map(blog => (
              <StoryCard key={blog.id} blog={blog} />
            ))}
          </div>
        )
      ) : (
        draftStories.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
            No draft stories currently in progress.
          </div>
        ) : (
          <div className="space-y-4">
            {draftStories.map(blog => (
              <StoryCard key={blog.id} blog={blog} />
            ))}
          </div>
        )
      )}

      {/* Edit Profile Modal */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Edit Engineering Profile
              </h3>
              <button
                onClick={() => setEditProfileOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Software engineer specializing in distributed systems, Java 21, and React..."
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    GitHub Username
                  </label>
                  <input
                    type="text"
                    value={github}
                    onChange={e => setGithub(e.target.value)}
                    placeholder="octocat"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Twitter Handle
                  </label>
                  <input
                    type="text"
                    value={twitter}
                    onChange={e => setTwitter(e.target.value)}
                    placeholder="twitter_handle"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Website / Portfolio URL
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://myengineeringjournal.dev"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm disabled:opacity-50"
                >
                  <HugeiconsIcon icon={Tick01Icon} size={16} />
                  <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
