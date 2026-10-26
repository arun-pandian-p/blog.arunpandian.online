import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  User as UserIcon,
  Globe,
  Calendar,
  Clock,
  ArrowLeft,
  BookOpen,
  Bookmark,
  Share2,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { FaGithub, FaXTwitter } from 'react-icons/fa6';
import BlogNavbar from '../components/BlogNavbar';
import MobileBottomNav from '../components/MobileBottomNav';
import ArticleImage from '../components/common/ArticleImage';
import { api } from '../services/apiClient';
import toast from 'react-hot-toast';

export default function AuthorProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.users.getPublicProfile(username);
        if (isMounted) setProfile(data);
      } catch (err) {
        console.error('Error fetching author profile:', err);
        if (isMounted) setError(err.message || 'Author not found');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => { isMounted = false; };
  }, [username]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Author profile link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C1A17] font-sans antialiased selection:bg-[#B83A26]/10 selection:text-[#B83A26]">
      <Helmet>
        <title>{profile ? `${profile.fullName} (@${profile.username}) — blog.arunpandian.online` : 'Author Profile'}</title>
        <meta name="description" content={profile?.bio || `Read articles written by ${profile?.fullName || username} on blog.arunpandian.online.`} />
        <meta property="og:title" content={profile ? `${profile.fullName} (@${profile.username})` : 'Author Profile'} />
        <meta property="og:description" content={profile?.bio || ''} />
        <link rel="canonical" href={`https://blog.arunpandian.online/author/${username}`} />
      </Helmet>

      <BlogNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-24">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#7A7265] hover:text-[#B83A26] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to All Articles</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-[#7A7265]">
            <Loader2 size={32} className="animate-spin text-[#B83A26]" />
            <p className="font-mono text-xs uppercase tracking-widest">Loading author profile...</p>
          </div>
        ) : error || !profile ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-[#EBE4D8] p-8 shadow-xs">
            <UserIcon size={48} className="mx-auto text-[#B83A26] mb-3 opacity-60" />
            <h2 className="font-serif text-2xl font-bold text-[#1C1A17] mb-2">Author Not Found</h2>
            <p className="text-sm text-[#7A7265] max-w-md mx-auto mb-6">
              The author profile for "@{username}" does not exist or has not published articles yet.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C1A17] text-[#FAF7F2] text-xs font-mono font-bold hover:bg-[#B83A26] transition-colors"
            >
              Explore All Articles
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Author Header Card */}
            <header className="bg-white rounded-3xl border border-[#E7E0D3] p-8 sm:p-10 shadow-xs relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-start sm:items-center gap-5">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.fullName}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#E7E0D3] shadow-xs"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#1C1A17] text-white flex items-center justify-center font-serif text-2xl font-bold shadow-xs">
                      {profile.fullName?.charAt(0) || 'U'}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h1 className="font-serif text-2xl sm:text-3xl font-black text-[#1C1A17] leading-tight">
                        {profile.fullName}
                      </h1>
                    </div>
                    <p className="font-mono text-xs text-[#8C8479] font-medium">@{profile.username}</p>
                    <div className="flex items-center gap-2 pt-1 text-xs text-[#5C5549]">
                      <BookOpen size={13} className="text-[#B83A26]" />
                      <span>{profile.articlesCount || 0} published {profile.articlesCount === 1 ? 'article' : 'articles'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleShare}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-[#DED7CB] hover:bg-[#F2ECE1] text-xs font-mono font-semibold transition-all"
                  >
                    <Share2 size={13} />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="mt-6 text-sm text-[#3E3A33] leading-relaxed max-w-2xl border-t border-[#F2ECE1] pt-5">
                  {profile.bio}
                </p>
              )}

              {/* Social / Links */}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-[#5C5549]">
                {profile.website && (
                  <a
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-[#B83A26] transition-colors"
                  >
                    <Globe size={13} />
                    <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink size={10} />
                  </a>
                )}
                {profile.github && (
                  <a
                    href={`https://github.com/${profile.github.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-[#B83A26] transition-colors"
                  >
                    <FaGithub size={13} />
                    <span>{profile.github}</span>
                  </a>
                )}
                {profile.twitter && (
                  <a
                    href={`https://twitter.com/${profile.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-[#B83A26] transition-colors"
                  >
                    <FaXTwitter size={13} />
                    <span>{profile.twitter}</span>
                  </a>
                )}
              </div>
            </header>

            {/* Author's Articles Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#E7E0D3] pb-3">
                <h2 className="font-serif text-xl font-bold text-[#1C1A17]">
                  Articles by {profile.fullName}
                </h2>
                <span className="font-mono text-xs text-[#8C8479]">
                  {profile.articlesCount || 0} Total
                </span>
              </div>

              {profile.recentArticles && profile.recentArticles.length > 0 ? (
                <div className="divide-y divide-[#EBE4D8] bg-white rounded-3xl border border-[#E7E0D3] overflow-hidden shadow-xs">
                  {profile.recentArticles.map((article) => (
                    <article key={article.id} className="p-6 sm:p-8 hover:bg-[#FBF9F5]/80 transition-colors group">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                        <div className="flex-1 space-y-2.5">
                          {article.category && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#F2ECE1] text-[10px] font-mono font-bold uppercase tracking-wider text-[#7A7265]">
                              {article.category}
                            </span>
                          )}

                          <h3 className="font-serif text-xl font-bold text-[#1C1A17] group-hover:text-[#B83A26] transition-colors">
                            <Link to={`/posts/${article.slug}`}>
                              {article.title}
                            </Link>
                          </h3>

                          {article.excerpt && (
                            <p className="text-xs sm:text-sm text-[#5C5549] line-clamp-2 leading-relaxed">
                              {article.excerpt}
                            </p>
                          )}

                          <div className="flex items-center gap-3 pt-2 text-[11px] font-mono text-[#8C8479]">
                            {article.publishedAt && (
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(article.publishedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            )}
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {article.readTime || '4 min read'}
                            </span>
                          </div>
                        </div>

                        <Link to={`/posts/${article.slug}`} className="sm:w-44 w-full h-32 shrink-0">
                          <ArticleImage
                            src={article.coverImage}
                            alt={article.title}
                            category={article.category}
                            aspectRatio="video"
                            containerClassName="w-full h-full rounded-2xl"
                          />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-[#E7E0D3] p-6 text-sm text-[#7A7265]">
                  No published articles yet.
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
}
