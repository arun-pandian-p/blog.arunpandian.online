import React, { useState } from 'react';
import { 
  Share2, X, Check, Copy, ExternalLink, Globe, Sparkles 
} from 'lucide-react';
import { 
  FaLinkedin, 
  FaXTwitter, 
  FaWhatsapp, 
  FaRedditAlien, 
  FaFacebookF, 
  FaEnvelope 
} from 'react-icons/fa6';
import toast from 'react-hot-toast';

export default function ShareModal({
  isOpen,
  onClose,
  title = 'Data Analytics Case Study',
  description = '',
  url = '',
  image = '',
  tags = [],
  type = 'Investigation'
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const cleanTitle = title || 'Data Analytics Case Study';
  const cleanDesc = description ? description.replace(/<[^>]*>/g, '').slice(0, 140) + '...' : '';
  const hashTagsStr = Array.isArray(tags) && tags.length > 0
    ? tags.map(t => t.replace(/[^a-zA-Z0-9]/g, '')).filter(Boolean).slice(0, 4).join(',')
    : 'DataAnalytics,SQL,PowerBI,Python';

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
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${cleanTitle} | Analytics by @arunpandian`)}&url=${encodeURIComponent(currentUrl)}&hashtags=${hashTagsStr}`,
        '_blank',
        'width=600,height=450'
      );
    } else if (platform === 'reddit') {
      window.open(
        `https://reddit.com/submit?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(cleanTitle)}`,
        '_blank',
        'width=650,height=550'
      );
    } else if (platform === 'whatsapp') {
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this data analytics study: "${cleanTitle}" — ${currentUrl}`)}`,
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
      setCopied(true);
      toast.success('Direct link copied to clipboard!', { icon: '🔗' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Share2 size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 leading-tight">
                Share {type}
              </h3>
              <p className="text-[11px] font-mono text-slate-500">
                Direct share with image preview &amp; metadata
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

        {/* Live Preview Card with image and text */}
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

        {/* Direct Social Buttons Grid */}
        <div>
          <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-2">
            Share directly to platforms
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleShare('linkedin')}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-[#0077B5]/10 border border-slate-200 text-slate-700 hover:text-[#0077B5] text-xs font-semibold gap-1.5 transition-all group cursor-pointer"
            >
              <FaLinkedin size={20} className="text-[#0077B5] group-hover:scale-110 transition-transform" />
              <span>LinkedIn</span>
            </button>

            <button
              onClick={() => handleShare('twitter')}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-950 text-xs font-semibold gap-1.5 transition-all group cursor-pointer"
            >
              <FaXTwitter size={19} className="group-hover:scale-110 transition-transform" />
              <span>X (Twitter)</span>
            </button>

            <button
              onClick={() => handleShare('reddit')}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-[#FF4500]/10 border border-slate-200 text-slate-700 hover:text-[#FF4500] text-xs font-semibold gap-1.5 transition-all group cursor-pointer"
            >
              <FaRedditAlien size={20} className="text-[#FF4500] group-hover:scale-110 transition-transform" />
              <span>Reddit</span>
            </button>

            <button
              onClick={() => handleShare('whatsapp')}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-[#25D366]/10 border border-slate-200 text-slate-700 hover:text-[#25D366] text-xs font-semibold gap-1.5 transition-all group cursor-pointer"
            >
              <FaWhatsapp size={20} className="text-[#25D366] group-hover:scale-110 transition-transform" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => handleShare('facebook')}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-[#1877F2]/10 border border-slate-200 text-slate-700 hover:text-[#1877F2] text-xs font-semibold gap-1.5 transition-all group cursor-pointer"
            >
              <FaFacebookF size={19} className="text-[#1877F2] group-hover:scale-110 transition-transform" />
              <span>Facebook</span>
            </button>

            <button
              onClick={() => handleShare('email')}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold gap-1.5 transition-all group cursor-pointer"
            >
              <FaEnvelope size={19} className="text-slate-600 group-hover:scale-110 transition-transform" />
              <span>Email</span>
            </button>
          </div>
        </div>

        {/* 1-Click Copy Link Input Box */}
        <div className="pt-1">
          <label className="block text-[11px] font-mono uppercase font-bold text-slate-500 mb-1.5">
            Direct Share Link
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
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
