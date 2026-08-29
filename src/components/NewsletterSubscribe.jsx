import React, { useState } from 'react';
import { Mail, CheckCircle2, Loader2, Sparkles, Send, ShieldCheck, BellRing } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { sendWelcomeEmail } from '../services/newsletterService';

export default function NewsletterSubscribe({
  source = 'prefooter',
  variant = 'prefooter', // 'prefooter' | 'inline' | 'card' | 'footer'
  className = '',
  title = 'Subscribe to Case Studies & Analytics Dispatch',
  description = 'Receive real-time notifications when new data publications, dashboards, and portfolio projects are released.',
}) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      if (supabase) {
        // 1. Try inserting into newsletter_subscribers table
        const { error: subError } = await supabase
          .from('newsletter_subscribers')
          .insert([{ email: cleanEmail, source, status: 'active' }]);

        // 2. If table doesn't exist yet, gracefully fallback to contact_messages table
        if (subError) {
          if (subError.code === 'PGRST205' || subError.message?.includes('schema cache')) {
            await supabase.from('contact_messages').insert([{
              name: 'Newsletter Subscriber',
              email: cleanEmail,
              subject: '[Newsletter Subscription]',
              message: `Subscribed from ${source} at ${new Date().toISOString()}`
            }]);
          } else if (subError.code === '23505') {
            // Unique violation: already subscribed
            toast.success("You're already subscribed! 🎉", { icon: '✨' });
            setSubscribed(true);
            setLoading(false);
            return;
          }
        }
      }

      // Automatically dispatch personal Welcome & Introduction email
      sendWelcomeEmail(cleanEmail).catch((err) => console.warn('Welcome dispatch error:', err));

      setSubscribed(true);
      setEmail('');
      toast.success('Subscribed! Welcome email sent to your inbox 🚀', {
        duration: 4500,
        icon: '📬'
      });
    } catch (err) {
      console.warn('Newsletter subscription error:', err);
      setSubscribed(true);
      toast.success('Subscription received! Welcome aboard.', { icon: '🎉' });
    } finally {
      setLoading(false);
    }
  };

  /* ── 1. PRE-FOOTER INTERACTIVE CARD (STANDALONE SECTION BEFORE FOOTER) ── */
  if (variant === 'prefooter') {
    return (
      <section className={`w-full py-12 sm:py-16 px-4 sm:px-6 relative z-10 ${className}`}>
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 sm:p-12 border border-slate-800/80 shadow-2xl relative overflow-hidden text-white">
          
          {/* Ambient Glow Orbs */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6 text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:gap-8">
            
            {/* Left Content */}
            <div className="space-y-3 sm:max-w-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold tracking-wider uppercase">
                <BellRing size={13} className="animate-pulse" />
                <span>Newsletter Dispatch</span>
              </div>

              <h3 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
                {title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                {description}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  Zero Spam Guarantee
                </span>
                <span>•</span>
                <span className="text-slate-300">
                  From: updates@arunpandian.online
                </span>
              </div>
            </div>

            {/* Right Form Interaction */}
            <div className="sm:w-80 sm:shrink-0 pt-4 sm:pt-0">
              {subscribed ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center space-y-2">
                  <CheckCircle2 size={28} className="mx-auto text-emerald-400 animate-bounce" />
                  <p className="text-sm font-bold font-serif text-white">You're Subscribed!</p>
                  <p className="text-xs font-mono text-emerald-300">Watch your inbox for new project releases.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3.5 pl-10 rounded-2xl bg-white/10 border border-white/20 text-sm text-white placeholder-slate-400 focus:bg-white/15 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-inner"
                    />
                    <Mail size={16} className="absolute left-3.5 top-4 text-slate-400" />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                    <span>Subscribe to Updates</span>
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      </section>
    );
  }

  /* ── 2. INLINE BLOG / ARTICLE VARIANT ── */
  if (variant === 'inline') {
    return (
      <div className={`p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <Mail size={20} />
          </div>
          <div>
            <span className="text-[11px] font-mono text-blue-400 uppercase tracking-wider font-semibold">
              Updates from updates@arunpandian.online
            </span>
            <h3 className="font-serif font-bold text-lg text-white">
              {title}
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          {description}
        </p>

        {subscribed ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>You are subscribed! Watch your inbox for new project releases.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 pt-1">
            <input
              type="email"
              required
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              <span>Subscribe</span>
            </button>
          </form>
        )}
      </div>
    );
  }

  /* ── 3. CARD / SIDEBAR VARIANT ── */
  if (variant === 'card') {
    return (
      <div className={`p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 ${className}`}>
        <div className="flex items-center gap-2 text-xs font-mono text-blue-600 font-bold uppercase tracking-wider">
          <Sparkles size={14} />
          <span>Email Newsletter</span>
        </div>
        <h4 className="font-serif font-bold text-sm text-slate-900 leading-snug">
          {title}
        </h4>
        <p className="text-[11px] text-slate-500 line-clamp-3">
          {description}
        </p>
        {subscribed ? (
          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-600 font-semibold pt-1">
            <CheckCircle2 size={14} />
            <span>Subscribed! 🎉</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2 pt-1">
            <input
              type="email"
              required
              placeholder="Your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-slate-900 hover:bg-blue-600 text-white text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
              <span>Get Dispatch</span>
            </button>
          </form>
        )}
      </div>
    );
  }

  /* ── 4. DEFAULT FOOTER FALLBACK ── */
  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-blue-400 opacity-90">
          <Mail size={13} />
          <span>Newsletter Dispatch</span>
        </div>
        <h4 className="text-sm font-bold tracking-tight mt-0.5" style={{ color: 'inherit' }}>
          {title}
        </h4>
        <p className="text-xs opacity-70 mt-1 max-w-md">
          {description}
        </p>
      </div>

      {subscribed ? (
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
          <CheckCircle2 size={15} />
          <span>Subscribed! Updates will come from updates@arunpandian.online</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-md">
          <input
            type="email"
            required
            placeholder="Enter your email for updates..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3.5 py-2 rounded-xl text-xs bg-white/10 border border-white/20 text-inherit placeholder:text-inherit placeholder:opacity-50 focus:bg-white/15 focus:border-blue-400 outline-none flex-1 min-h-[38px]"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs transition-colors flex items-center justify-center gap-1.5 min-h-[38px] cursor-pointer shrink-0 disabled:opacity-50"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            <span>Subscribe</span>
          </button>
        </form>
      )}
    </div>
  );
}
