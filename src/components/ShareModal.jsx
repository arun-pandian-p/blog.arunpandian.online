import React, { useState, useEffect, useRef } from 'react';
import { 
  Share2, X, Check, Copy, ExternalLink, Globe, Download, 
  Sparkles, RefreshCw, Smartphone, Edit3
} from 'lucide-react';
import { 
  FaLinkedin, 
  FaXTwitter, 
  FaInstagram, 
  FaWhatsapp, 
  FaTelegram, 
  FaRedditAlien, 
  FaFacebookF, 
  FaEnvelope 
} from 'react-icons/fa6';
import toast from 'react-hot-toast';
import ArticleImage from './common/ArticleImage';

export default function ShareModal({
  isOpen,
  onClose,
  title = 'Article',
  description = '',
  url = '',
  image = '',
  tags = [],
  category = 'Engineering',
  type = 'Article',
  publishedAt = null,
  author = null,
  stats = null
}) {
  const [activeTab, setActiveTab] = useState('linkedin'); // 'linkedin' | 'xpost' | 'instagram' | 'direct'
  const [isEditing, setIsEditing] = useState(false);
  
  // Copy feedback states
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedLinkedInText, setCopiedLinkedInText] = useState(false);
  const [copiedXText, setCopiedXText] = useState(false);
  const [copiedInstaCaption, setCopiedInstaCaption] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);

  // Editable copy texts
  const [editableLinkedInText, setEditableLinkedInText] = useState('');
  const [editableXText, setEditableXText] = useState('');
  const [editableInstaCaption, setEditableInstaCaption] = useState('');

  // 1. Resolve Canonical URL (Never localhost for production sharing)
  const canonicalUrl = React.useMemo(() => {
    if (url && typeof url === 'string') {
      if (url.includes('localhost') || url.includes('127.0.0.1')) {
        try {
          const parsed = new URL(url);
          return `https://blog.arunpandian.online${parsed.pathname}`;
        } catch {
          return 'https://blog.arunpandian.online';
        }
      }
      if (url.startsWith('/')) {
        return `https://blog.arunpandian.online${url}`;
      }
      return url;
    }
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path && path !== '/') {
        return `https://blog.arunpandian.online${path}`;
      }
    }
    return 'https://blog.arunpandian.online';
  }, [url]);

  // 2. Clean content
  const cleanTitle = title || 'Untitled Article';
  const cleanDesc = description 
    ? description.replace(/<[^>]*>/g, '').trim().slice(0, 220)
    : 'Read the full story and insights on blog.arunpandian.online.';

  // 3. Resolve Author Info
  const resolvedAuthor = React.useMemo(() => {
    const name = author?.name || 'Arun Pandian';
    const username = author?.username || name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const avatar = author?.avatar || '/assets/arun-profile.jpg';
    const headline = author?.headline || (category ? `Writer in ${category}` : 'Writer & Software Engineer');
    return { name, username, avatar, headline };
  }, [author, category]);

  // 4. Resolve Tags and Hashtags (Neutral, content-driven, deduplicated)
  const formattedHashtags = React.useMemo(() => {
    let tagList = [];
    if (Array.isArray(tags)) {
      tagList = tags;
    } else if (typeof tags === 'string' && tags.trim()) {
      tagList = tags.split(',').map(t => t.trim());
    }
    if (category && !tagList.some(t => t.toLowerCase() === category.toLowerCase())) {
      tagList = [category, ...tagList];
    }
    
    // Normalize into valid alphanumeric hashtags
    const cleaned = tagList
      .map(t => {
        if (!t) return '';
        const clean = t.replace(/[^a-zA-Z0-9]/g, '');
        return clean ? `#${clean}` : '';
      })
      .filter(Boolean);

    // Deduplicate and limit to 4
    const unique = Array.from(new Set(cleaned)).slice(0, 4);
    return unique.length > 0 ? unique.join(' ') : '#Engineering #Technology #Software';
  }, [tags, category]);

  // 5. Formatted Date
  const formattedDate = React.useMemo(() => {
    if (!publishedAt) return 'Recently published';
    try {
      const d = new Date(publishedAt);
      if (isNaN(d.getTime())) return 'Recently published';
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently published';
    }
  }, [publishedAt]);

  // 6. Initialize default post texts
  useEffect(() => {
    const liDefault = `Excited to share my latest article: "${cleanTitle}"\n\n${cleanDesc}\n\nRead the full article:\n👉 ${canonicalUrl}\n\n${formattedHashtags}`;
    setEditableLinkedInText(liDefault);

    const xDefault = `Excited to share my latest article: "${cleanTitle}"\n\n${cleanDesc.slice(0, 120)}...\n\n${formattedHashtags}`;
    setEditableXText(xDefault);

    const igDefault = `${cleanTitle.toUpperCase()}\n\n${cleanDesc}\n\n🔗 Read the full story at the link in bio (${canonicalUrl})\n\n.\n.\n.\n${formattedHashtags}`;
    setEditableInstaCaption(igDefault);
  }, [cleanTitle, cleanDesc, canonicalUrl, formattedHashtags]);

  // 7. Keyboard ESC listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 8. Sharing Actions
  const handleShare = (platform) => {
    if (platform === 'native' && typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: cleanTitle,
        text: `${cleanTitle} by ${resolvedAuthor.name}`,
        url: canonicalUrl,
      }).catch(() => {});
      return;
    }

    if (platform === 'linkedin') {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`,
        '_blank',
        'width=650,height=650,noopener,noreferrer'
      );
    } else if (platform === 'twitter') {
      const tweetTextWithUrl = `${editableXText}\n${canonicalUrl}`;
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(editableXText)}&url=${encodeURIComponent(canonicalUrl)}`,
        '_blank',
        'width=600,height=480,noopener,noreferrer'
      );
    } else if (platform === 'whatsapp') {
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out "${cleanTitle}": ${canonicalUrl}`)}`,
        '_blank',
        'noopener,noreferrer'
      );
    } else if (platform === 'telegram') {
      window.open(
        `https://t.me/share/url?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(cleanTitle)}`,
        '_blank',
        'noopener,noreferrer'
      );
    } else if (platform === 'reddit') {
      window.open(
        `https://reddit.com/submit?url=${encodeURIComponent(canonicalUrl)}&title=${encodeURIComponent(cleanTitle)}`,
        '_blank',
        'width=650,height=550,noopener,noreferrer'
      );
    } else if (platform === 'facebook') {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`,
        '_blank',
        'width=600,height=500,noopener,noreferrer'
      );
    } else if (platform === 'email') {
      window.location.href = `mailto:?subject=${encodeURIComponent(cleanTitle)}&body=${encodeURIComponent(`Hi,\n\nI thought you might enjoy reading this article:\n\n"${cleanTitle}"\n\n${cleanDesc}\n\nRead the full piece here:\n${canonicalUrl}\n\nBest regards,`)}`;
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(canonicalUrl);
      setCopiedLink(true);
      toast.success('Canonical article link copied!', { icon: '🔗' });
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyLinkedIn = () => {
    navigator.clipboard.writeText(editableLinkedInText);
    setCopiedLinkedInText(true);
    toast.success('LinkedIn post commentary copied!', { icon: '💼' });
    setTimeout(() => setCopiedLinkedInText(false), 2000);
  };

  const handleCopyX = () => {
    navigator.clipboard.writeText(editableXText);
    setCopiedXText(true);
    toast.success('𝕏 Tweet text copied!', { icon: '📋' });
    setTimeout(() => setCopiedXText(false), 2000);
  };

  const handleCopyInsta = () => {
    navigator.clipboard.writeText(editableInstaCaption);
    setCopiedInstaCaption(true);
    toast.success('Instagram caption copied to clipboard!', { icon: '📸' });
    setTimeout(() => setCopiedInstaCaption(false), 2000);
  };

  // 9. Client-Side High-Res Instagram / Social Share Card Generator
  const handleDownloadShareCard = () => {
    setIsDownloadingImage(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1200;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        toast.error('Unable to create image canvas.');
        setIsDownloadingImage(false);
        return;
      }

      // Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 1200, 1200);
      grad.addColorStop(0, '#0F172A');
      grad.addColorStop(0.5, '#1E293B');
      grad.addColorStop(1, '#0B0F19');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 1200);

      // Accent border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 60, 1080, 1080);

      // Publication Brand Pill Header
      ctx.fillStyle = '#B83A26';
      ctx.beginPath();
      ctx.roundRect(100, 100, 320, 48, 24);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BLOG.ARUNPANDIAN.ONLINE', 260, 132);

      // Category & Date Byline
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '500 24px monospace';
      ctx.fillText(`${category.toUpperCase()} · ${formattedDate.toUpperCase()}`, 100, 220);

      // Article Title (Word wrapped)
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 54px Newsreader, Georgia, serif';
      const words = cleanTitle.split(' ');
      let line = '';
      let y = 300;
      const maxWidth = 1000;
      const lineHeight = 68;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, 100, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 100, y);

      // Excerpt (Word wrapped)
      y += 50;
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '400 28px Inter, sans-serif';
      const excerptWords = cleanDesc.split(' ');
      let excerptLine = '';
      const maxExcerptLines = 3;
      let lineCount = 0;

      for (let n = 0; n < excerptWords.length; n++) {
        const testExcerpt = excerptLine + excerptWords[n] + ' ';
        const metrics = ctx.measureText(testExcerpt);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(excerptLine, 100, y);
          excerptLine = excerptWords[n] + ' ';
          y += 42;
          lineCount++;
          if (lineCount >= maxExcerptLines) {
            excerptLine += '...';
            break;
          }
        } else {
          excerptLine = testExcerpt;
        }
      }
      if (lineCount < maxExcerptLines) {
        ctx.fillText(excerptLine, 100, y);
      }

      // Footer: Author & Call to Action
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(100, 1020, 1000, 1);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '600 24px Inter, sans-serif';
      ctx.fillText(`By ${resolvedAuthor.name} (@${resolvedAuthor.username})`, 100, 1080);

      ctx.fillStyle = '#38BDF8';
      ctx.textAlign = 'right';
      ctx.fillText('Read full story ➔', 1100, 1080);

      // Trigger download
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Could not generate share image.');
          setIsDownloadingImage(false);
          return;
        }
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const fileSlug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
        a.href = downloadUrl;
        a.download = `${fileSlug}-share-card.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
        setIsDownloadingImage(false);
        toast.success('Share card downloaded! Ready for Instagram.', { icon: '🖼️' });
      }, 'image/png');
    } catch (err) {
      console.error('Share card download error:', err);
      setIsDownloadingImage(false);
      toast.error('Failed to create share card.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-dialog-title"
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4 relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
              <Share2 size={18} />
            </div>
            <div>
              <h3 id="share-dialog-title" className="font-display font-bold text-base sm:text-lg text-slate-900 leading-tight">
                Share {type}
              </h3>
              <p className="text-[11px] font-mono text-slate-500">
                LinkedIn, 𝕏, Instagram share card &amp; direct links
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close share dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher: LinkedIn | 𝕏 Post | Instagram | Direct Share */}
        <div className="grid grid-cols-4 p-1 bg-slate-100 rounded-xl gap-1 font-mono text-xs">
          <button
            onClick={() => { setActiveTab('linkedin'); setIsEditing(false); }}
            className={`py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate ${
              activeTab === 'linkedin'
                ? 'bg-white text-[#0077B5] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaLinkedin size={14} className="text-[#0077B5] shrink-0" />
            <span className="truncate">LinkedIn</span>
          </button>
          <button
            onClick={() => { setActiveTab('xpost'); setIsEditing(false); }}
            className={`py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate ${
              activeTab === 'xpost'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaXTwitter size={13} className="shrink-0" />
            <span className="truncate">𝕏 Post</span>
          </button>
          <button
            onClick={() => { setActiveTab('instagram'); setIsEditing(false); }}
            className={`py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate ${
              activeTab === 'instagram'
                ? 'bg-white text-pink-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaInstagram size={14} className="text-pink-600 shrink-0" />
            <span className="truncate">Instagram</span>
          </button>
          <button
            onClick={() => { setActiveTab('direct'); setIsEditing(false); }}
            className={`py-1.5 px-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate ${
              activeTab === 'direct'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share2 size={13} className="shrink-0" />
            <span className="truncate">Direct Link</span>
          </button>
        </div>

        {/* ── TAB 1: LINKEDIN SHARE & PREVIEW ── */}
        {activeTab === 'linkedin' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* LinkedIn Post Card Preview */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 font-sans shadow-xs text-slate-900">
              {/* Profile Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border border-slate-200 shrink-0">
                    <img
                      src={resolvedAuthor.avatar}
                      alt={resolvedAuthor.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-slate-800 text-white font-bold text-xs hidden items-center justify-center">
                      {resolvedAuthor.name.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm text-slate-900">{resolvedAuthor.name}</span>
                      <span className="text-slate-400 text-xs font-mono">• 1st</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {resolvedAuthor.headline}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                      <span>{formattedDate} •</span>
                      <Globe size={10} />
                    </p>
                  </div>
                </div>
                <FaLinkedin size={20} className="text-[#0077B5]" />
              </div>

              {/* Post Content Preview / Editable mode */}
              {isEditing ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                    Edit LinkedIn Post Commentary:
                  </label>
                  <textarea
                    rows={4}
                    value={editableLinkedInText}
                    onChange={(e) => setEditableLinkedInText(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-blue-400 bg-blue-50/20 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                  />
                </div>
              ) : (
                <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                  {editableLinkedInText}
                </div>
              )}

              {/* Toggle Edit Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-[11px] font-mono text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 size={11} />
                  <span>{isEditing ? 'Done Editing' : 'Customize Post Text'}</span>
                </button>
              </div>

              {/* LinkedIn Rich Media Card Preview */}
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <div className="aspect-16/9 w-full bg-slate-900 relative">
                  <ArticleImage
                    src={image}
                    alt={cleanTitle}
                    category={category}
                    aspectRatio="video"
                    containerClassName="w-full h-full"
                  />
                </div>
                <div className="p-3 bg-slate-100 border-t border-slate-200 space-y-0.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                    BLOG.ARUNPANDIAN.ONLINE
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 truncate">
                    {cleanTitle}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {cleanDesc}
                  </p>
                </div>
              </div>

              {/* Real Post Stats (only if available) */}
              {stats && (stats.claps > 0 || stats.comments > 0) && (
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 px-1 border-t border-slate-100">
                  {stats.claps > 0 ? (
                    <span className="font-mono text-slate-600">👏 {stats.claps} readers clapped</span>
                  ) : <span />}
                  {stats.comments > 0 && (
                    <span className="font-mono text-slate-500">{stats.comments} responses</span>
                  )}
                </div>
              )}
            </div>

            {/* LinkedIn Actions */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#0077B5] hover:bg-[#006097] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <FaLinkedin size={16} />
                  <span>Share Canonical Story to LinkedIn</span>
                </button>

                <button
                  onClick={handleCopyLinkedIn}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer font-mono"
                >
                  {copiedLinkedInText ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copiedLinkedInText ? 'Copied Text!' : 'Copy Post Text'}</span>
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
                <Globe size={14} className="text-blue-600 shrink-0 mt-0.5" />
                <p>
                  LinkedIn automatically displays full Open Graph cards from your article's public URL. Click <strong>Share to LinkedIn</strong> and paste your commentary.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: 𝕏 (TWITTER) SHARE & PREVIEW ── */}
        {activeTab === 'xpost' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* 𝕏 Card Box */}
            <div className="p-4 rounded-2xl bg-black text-white border border-neutral-800 space-y-3 font-sans shadow-md">
              {/* Profile Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-800 border border-neutral-700 shrink-0">
                    <img
                      src={resolvedAuthor.avatar}
                      alt={resolvedAuthor.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-neutral-700 text-white font-bold text-xs hidden items-center justify-center">
                      {resolvedAuthor.name.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm text-white">{resolvedAuthor.name}</span>
                      <span className="text-blue-400 text-xs">✓</span>
                    </div>
                    <span className="text-xs text-neutral-400 font-mono">@{resolvedAuthor.username}</span>
                  </div>
                </div>
                <FaXTwitter size={18} className="text-neutral-400" />
              </div>

              {/* Tweet Content Preview / Editable Mode */}
              {isEditing ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase font-bold text-neutral-400 block">
                    Edit 𝕏 Tweet Copy:
                  </label>
                  <textarea
                    rows={3}
                    value={editableXText}
                    onChange={(e) => setEditableXText(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-700 bg-neutral-900 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-400 font-sans"
                  />
                </div>
              ) : (
                <div className="space-y-1 text-xs sm:text-[13px] text-neutral-200 leading-relaxed whitespace-pre-line">
                  {editableXText}
                </div>
              )}

              {/* Character Counter & Edit Toggle */}
              <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-neutral-400">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 size={11} />
                  <span>{isEditing ? 'Done' : 'Edit Tweet'}</span>
                </button>
                <span>
                  {editableXText.length + 24} / 280 chars
                </span>
              </div>

              {/* Embedded Media Card Preview */}
              <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 aspect-16/9 relative">
                <ArticleImage
                  src={image}
                  alt={cleanTitle}
                  category={category}
                  aspectRatio="video"
                  containerClassName="w-full h-full"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-[11px] font-mono text-neutral-300 flex items-center justify-between">
                  <span className="truncate">{cleanTitle}</span>
                  <span className="text-blue-400 font-bold ml-2 shrink-0">blog.arunpandian.online ↗</span>
                </div>
              </div>
            </div>

            {/* Actions for 𝕏 */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleShare('twitter')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-black hover:bg-neutral-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs border border-neutral-700"
              >
                <FaXTwitter size={15} />
                <span>Post directly to 𝕏</span>
              </button>

              <button
                onClick={handleCopyX}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer font-mono"
              >
                {copiedXText ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copiedXText ? 'Copied!' : 'Copy Tweet'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 3: INSTAGRAM SHARE CARD & CAPTION ── */}
        {activeTab === 'instagram' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Visual Instagram Share Card Preview */}
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-4 shadow-xl space-y-3 border border-slate-800">
              {/* Top Banner */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#B83A26] text-white font-mono text-[10px] font-bold">
                    BLOG.ARUNPANDIAN.ONLINE
                  </span>
                  <span className="text-slate-400 text-xs font-mono">· {category}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{formattedDate}</span>
              </div>

              {/* Feature Media Box */}
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-950 border border-white/10 relative flex items-center justify-center">
                <ArticleImage
                  src={image}
                  alt={cleanTitle}
                  category={category}
                  aspectRatio="square"
                  containerClassName="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-4">
                  <span className="text-[11px] font-mono text-amber-300 font-bold uppercase tracking-wider mb-1">
                    {category}
                  </span>
                  <h4 className="font-serif font-bold text-base sm:text-lg text-white line-clamp-3 leading-snug">
                    {cleanTitle}
                  </h4>
                  <p className="text-xs text-slate-300 font-sans line-clamp-2 mt-1">
                    {cleanDesc}
                  </p>
                </div>
              </div>

              {/* Byline */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10 text-slate-400 font-mono">
                <span>By {resolvedAuthor.name}</span>
                <span className="text-blue-400">blog.arunpandian.online ↗</span>
              </div>
            </div>

            {/* Instagram Workflow & Actions */}
            <div className="space-y-2.5">
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadShareCard}
                  disabled={isDownloadingImage}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Download size={15} />
                  <span>{isDownloadingImage ? 'Generating Card...' : 'Download Share Card (PNG)'}</span>
                </button>

                <button
                  onClick={handleCopyInsta}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  {copiedInstaCaption ? <Check size={15} /> : <FaInstagram size={15} />}
                  <span>{copiedInstaCaption ? 'Caption Copied!' : 'Copy Caption & Tags'}</span>
                </button>
              </div>

              {/* Step-by-Step Helper Notice */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Smartphone size={13} className="text-pink-600" />
                  <span>How to post on Instagram:</span>
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-500 leading-relaxed">
                  <li>Click <strong>Download Share Card</strong> to save the visual card to your device.</li>
                  <li>Click <strong>Copy Caption &amp; Tags</strong>.</li>
                  <li>Upload the image to your Instagram Feed or Story and paste the link in your bio or Story sticker.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: DIRECT LINK & ALL PLATFORMS ── */}
        {activeTab === 'direct' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Live Preview Snippet */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex gap-3 items-center">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                <ArticleImage
                  src={image}
                  alt={cleanTitle}
                  category={category}
                  aspectRatio="square"
                  containerClassName="w-full h-full"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono uppercase font-bold text-blue-600 block truncate">
                  {category}
                </span>
                <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug">
                  {cleanTitle}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  By {resolvedAuthor.name} · {formattedDate}
                </p>
              </div>
            </div>

            {/* Canonical Link Copy Input */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono uppercase font-bold text-slate-500">
                Canonical Article URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={canonicalUrl}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 truncate outline-none select-all focus:border-blue-500"
                />
                <button
                  onClick={() => handleShare('copy')}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold font-mono transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Native Device Share API (if supported) */}
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                onClick={() => handleShare('native')}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-blue-200"
              >
                <Smartphone size={15} />
                <span>Share via Device / Native Apps</span>
              </button>
            )}

            {/* Social Grid */}
            <div className="pt-1">
              <span className="block text-[10px] font-mono uppercase font-bold text-slate-400 mb-2">
                One-Click Social Destinations
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-[#0077B5]/10 border border-slate-200 text-slate-700 hover:text-[#0077B5] text-[11px] font-semibold gap-1 transition-all group cursor-pointer"
                >
                  <FaLinkedin size={18} className="text-[#0077B5] group-hover:scale-110 transition-transform" />
                  <span>LinkedIn</span>
                </button>

                <button
                  onClick={() => handleShare('twitter')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-950 text-[11px] font-semibold gap-1 transition-all group cursor-pointer"
                >
                  <FaXTwitter size={17} className="group-hover:scale-110 transition-transform" />
                  <span>𝕏 Post</span>
                </button>

                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-[#25D366]/10 border border-slate-200 text-slate-700 hover:text-[#25D366] text-[11px] font-semibold gap-1 transition-all group cursor-pointer"
                >
                  <FaWhatsapp size={18} className="text-[#25D366] group-hover:scale-110 transition-transform" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => handleShare('telegram')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-[#229ED9]/10 border border-slate-200 text-slate-700 hover:text-[#229ED9] text-[11px] font-semibold gap-1 transition-all group cursor-pointer"
                >
                  <FaTelegram size={17} className="text-[#229ED9] group-hover:scale-110 transition-transform" />
                  <span>Telegram</span>
                </button>

                <button
                  onClick={() => handleShare('reddit')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-[#FF4500]/10 border border-slate-200 text-slate-700 hover:text-[#FF4500] text-[11px] font-semibold gap-1 transition-all group cursor-pointer"
                >
                  <FaRedditAlien size={18} className="text-[#FF4500] group-hover:scale-110 transition-transform" />
                  <span>Reddit</span>
                </button>

                <button
                  onClick={() => handleShare('facebook')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-[#1877F2]/10 border border-slate-200 text-slate-700 hover:text-[#1877F2] text-[11px] font-semibold gap-1 transition-all group cursor-pointer"
                >
                  <FaFacebookF size={17} className="text-[#1877F2] group-hover:scale-110 transition-transform" />
                  <span>Facebook</span>
                </button>

                <button
                  onClick={() => setActiveTab('instagram')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-pink-50 border border-slate-200 text-slate-700 hover:text-pink-600 text-[11px] font-semibold gap-1 transition-all group cursor-pointer"
                >
                  <FaInstagram size={18} className="text-pink-600 group-hover:scale-110 transition-transform" />
                  <span>Instagram</span>
                </button>

                <button
                  onClick={() => handleShare('email')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-[11px] font-semibold gap-1 transition-all group cursor-pointer"
                >
                  <FaEnvelope size={17} className="text-slate-600 group-hover:scale-110 transition-transform" />
                  <span>Email</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
