import React, { useState } from 'react';
import { 
  Share2, X, Check, Copy, ExternalLink, Globe, Sparkles, 
  Download, Image as ImageIcon, Heart, MessageCircle, 
  Repeat2, Send, Bookmark, MoreHorizontal
} from 'lucide-react';
import { 
  FaLinkedin, 
  FaXTwitter, 
  FaWhatsapp, 
  FaRedditAlien, 
  FaFacebookF, 
  FaEnvelope,
  FaInstagram,
  FaTelegram
} from 'react-icons/fa6';
import arunProfile from '../assets/arun-profile.jpg';
import toast from 'react-hot-toast';

export default function ShareModal({
  isOpen,
  onClose,
  title = 'Data Analytics Case Study',
  description = '',
  url = '',
  image = '',
  tags = [],
  type = 'Project'
}) {
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' | 'xpost' | 'instagram'
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedXText, setCopiedXText] = useState(false);
  const [copiedInstaCaption, setCopiedInstaCaption] = useState(false);

  if (!isOpen) return null;

  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const cleanTitle = title || 'Data Analytics Case Study';
  const cleanDesc = description ? description.replace(/<[^>]*>/g, '').slice(0, 160) : 'An end-to-end data analytics investigation turning raw data into executive intelligence.';
  
  const rawTags = Array.isArray(tags) && tags.length > 0
    ? tags
    : ['DataAnalytics', 'PowerBI', 'SQL', 'Python'];
  const hashtagsFormatted = rawTags
    .map(t => `#${t.replace(/[^a-zA-Z0-9]/g, '')}`)
    .filter(Boolean)
    .slice(0, 5)
    .join(' ');

  // 𝕏 Tweet Copy Text
  const xTweetText = `🚀 New Data Analytics Deep Dive: "${cleanTitle}"\n\n💡 Key Insight: ${cleanDesc}\n\n📊 Explore interactive dashboard & schema:\n${currentUrl}\n\n${hashtagsFormatted} #DataScience #BusinessIntelligence`;

  // 📸 Instagram Caption Text
  const instaCaptionText = `📊 ${cleanTitle.toUpperCase()}\n\nSwipe to see the star-schema dimensional model, SQL pipeline, and Power BI interactive dashboard breakdown!\n\n💡 Summary:\n${cleanDesc}\n\n🔗 Full study, reproducible code & dataset live at the link in bio (arunpandian.online)\n\n.\n.\n.\n${hashtagsFormatted} #DataAnalytics #DataVisualisation #PowerBI #SQL #PythonCode #DataAnalyst #TechPortfolio`;

  const handleShare = (platform) => {
    if (platform === 'native' && navigator.share) {
      navigator.share({
        title: cleanTitle,
        text: `${cleanTitle} by Arun Pandian`,
        url: currentUrl,
      }).catch(() => {});
      return;
    }

    if (platform === 'linkedin') {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
        '_blank',
        'width=600,height=600'
      );
    } else if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(xTweetText)}`,
        '_blank',
        'width=600,height=480'
      );
    } else if (platform === 'reddit') {
      window.open(
        `https://reddit.com/submit?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(cleanTitle)}`,
        '_blank',
        'width=650,height=550'
      );
    } else if (platform === 'whatsapp') {
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this data study: "${cleanTitle}" — ${currentUrl}`)}`,
        '_blank'
      );
    } else if (platform === 'telegram') {
      window.open(
        `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(cleanTitle)}`,
        '_blank'
      );
    } else if (platform === 'facebook') {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
        '_blank',
        'width=600,height=500'
      );
    } else if (platform === 'email') {
      window.location.href = `mailto:?subject=${encodeURIComponent(cleanTitle)}&body=${encodeURIComponent(`Hi,\n\nI thought you might find this data study interesting:\n\n${cleanTitle}\n${cleanDesc}\n\nLink: ${currentUrl}\n\nBest,`)}`;
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      toast.success('Direct link copied to clipboard!', { icon: '🔗' });
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyX = () => {
    navigator.clipboard.writeText(xTweetText);
    setCopiedXText(true);
    toast.success('𝕏 Tweet text copied! Ready to paste.', { icon: '📋' });
    setTimeout(() => setCopiedXText(false), 2000);
  };

  const handleCopyInsta = () => {
    navigator.clipboard.writeText(instaCaptionText);
    setCopiedInstaCaption(true);
    toast.success('Instagram caption copied to clipboard!', { icon: '📸' });
    setTimeout(() => setCopiedInstaCaption(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Share2 size={18} />
            </div>
            <div>
              <h3 className="font-display font-black text-base sm:text-lg text-slate-900 leading-tight">
                Share {type}
              </h3>
              <p className="text-[11px] font-mono text-slate-500">
                Direct share, 𝕏 post preview &amp; Instagram formatted card
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher: Direct Share | 𝕏 Post Preview | Instagram Post */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl gap-1 font-mono text-xs">
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'direct'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚡ Direct Share
          </button>
          <button
            onClick={() => setActiveTab('xpost')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'xpost'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaXTwitter size={12} />
            <span>𝕏 Post</span>
          </button>
          <button
            onClick={() => setActiveTab('instagram')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'instagram'
                ? 'bg-white text-pink-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaInstagram size={13} className="text-pink-600" />
            <span>Instagram</span>
          </button>
        </div>

        {/* ── TAB 1: DIRECT SHARE PLATFORMS ── */}
        {activeTab === 'direct' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Live Preview Snippet Card */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex gap-3 items-center">
              {image ? (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                  <img 
                    src={image} 
                    alt={cleanTitle} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                  📊 DATA
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono uppercase font-bold text-blue-600 block truncate">
                  {tags[0] || 'Analytics'}
                </span>
                <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug">
                  {cleanTitle}
                </h4>
                {cleanDesc && (
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {cleanDesc}
                  </p>
                )}
              </div>
            </div>

            {/* Social Grid */}
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
                onClick={() => handleShare('telegram')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-[#229ED9]/10 border border-slate-200 text-slate-700 hover:text-[#229ED9] text-[11px] font-semibold gap-1 transition-all group cursor-pointer"
              >
                <FaTelegram size={17} className="text-[#229ED9] group-hover:scale-110 transition-transform" />
                <span>Telegram</span>
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

            {/* Direct Link Input */}
            <div className="pt-2">
              <label className="block text-[10px] font-mono uppercase font-bold text-slate-500 mb-1">
                Direct Article Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 truncate outline-none select-all focus:border-blue-500"
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
          </div>
        )}

        {/* ── TAB 2: 𝕏 (TWITTER) AUTHENTIC POST MOCKUP ── */}
        {activeTab === 'xpost' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Authentic 𝕏 Post Card Box */}
            <div className="p-4 rounded-2xl bg-black text-white border border-slate-800 space-y-3 font-sans shadow-lg">
              {/* Profile Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={arunProfile}
                    alt="Arun Pandian"
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm text-white">Arun Pandian</span>
                      <span className="text-blue-400 text-xs">✓</span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">@arunpandian · Data Analyst</span>
                  </div>
                </div>
                <FaXTwitter size={18} className="text-slate-400" />
              </div>

              {/* Tweet Content */}
              <div className="space-y-2 text-xs sm:text-[13px] text-slate-200 leading-relaxed">
                <p className="font-semibold text-white">
                  🚀 New Analytics Investigation: <span className="text-blue-400 font-bold">"{cleanTitle}"</span>
                </p>
                <p className="text-slate-300">
                  💡 <strong>Key Finding:</strong> {cleanDesc}
                </p>
                <p className="text-slate-400 font-mono text-[11px]">
                  {hashtagsFormatted}
                </p>
              </div>

              {/* Embedded Media Card */}
              {image && (
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 aspect-16/9 relative">
                  <img
                    src={image}
                    alt={cleanTitle}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-[11px] font-mono text-slate-300 flex items-center justify-between">
                    <span className="truncate">{cleanTitle}</span>
                    <span className="text-blue-400 font-bold ml-2 shrink-0">arunpandian.online ↗</span>
                  </div>
                </div>
              )}

              {/* Fake X Action Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-slate-500 text-xs px-2">
                <span className="flex items-center gap-1.5"><MessageCircle size={14} /> 12</span>
                <span className="flex items-center gap-1.5"><Repeat2 size={14} /> 48</span>
                <span className="flex items-center gap-1.5"><Heart size={14} className="text-rose-500 fill-rose-500" /> 184</span>
                <span className="flex items-center gap-1.5"><Bookmark size={14} /></span>
              </div>
            </div>

            {/* Actions for X */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => handleShare('twitter')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-black hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <FaXTwitter size={15} />
                <span>Post directly to 𝕏 (Twitter)</span>
              </button>

              <button
                onClick={handleCopyX}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer font-mono"
              >
                {copiedXText ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copiedXText ? 'Copied Tweet!' : 'Copy Tweet Text'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 3: INSTAGRAM POST / STORY CARD ── */}
        {activeTab === 'instagram' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Instagram Card Mockup */}
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white p-4 shadow-xl space-y-3">
              {/* Top IG Bar */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-pink-500">
                    <img
                      src={arunProfile}
                      alt="Arun Pandian"
                      className="w-full h-full rounded-full object-cover border border-white"
                    />
                  </div>
                  <span className="font-bold text-xs tracking-tight">arunpandian.online</span>
                </div>
                <MoreHorizontal size={16} className="text-white/70" />
              </div>

              {/* Graphic Feature Box */}
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-950 border border-white/20 relative flex items-center justify-center">
                {image ? (
                  <img
                    src={image}
                    alt={cleanTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="p-6 text-center space-y-2">
                    <span className="text-4xl">📊</span>
                    <h4 className="font-bold text-sm text-white">{cleanTitle}</h4>
                  </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono font-bold">
                  {tags[0] || 'Power BI'}
                </div>
              </div>

              {/* Fake IG Actions */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-3">
                  <Heart size={18} className="fill-rose-500 text-rose-500" />
                  <MessageCircle size={18} />
                  <Send size={18} />
                </div>
                <Bookmark size={18} />
              </div>

              {/* Caption snippet */}
              <div className="text-xs space-y-1">
                <p className="leading-snug">
                  <strong className="mr-1.5">arunpandian.online</strong>
                  {cleanTitle} — {cleanDesc.slice(0, 80)}...
                </p>
                <p className="text-white/60 font-mono text-[10px]">
                  {hashtagsFormatted.slice(0, 45)}...
                </p>
              </div>
            </div>

            {/* Actions for Instagram */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleCopyInsta}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                {copiedInstaCaption ? <Check size={15} /> : <FaInstagram size={16} />}
                <span>{copiedInstaCaption ? 'Caption Copied! Paste in IG' : 'Copy Instagram Caption & Tags'}</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleShare('copy')}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold font-mono flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy size={13} />
                  <span>Copy Link for Bio</span>
                </button>

                {image && (
                  <a
                    href={image}
                    target="_blank"
                    rel="noopener noreferrer"
                    download="project-visual.png"
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold font-mono flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download size={13} />
                    <span>View Image</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
