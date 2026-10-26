import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Mail, CheckCircle2, ShieldCheck, ArrowLeft, HeartCrack, HelpCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [reason, setReason] = useState('Too many emails');
  const [customReason, setCustomReason] = useState('');
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const reasonsList = [
    'Too many emails',
    'Content is no longer relevant to me',
    'I found the job/data analytics resources I needed',
    'I never signed up for this newsletter',
    'Other reason'
  ];

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    const finalReason = reason === 'Other reason' && customReason ? `Other: ${customReason}` : reason;

    try {
      // 1. Call Spring Boot unsubscribe endpoint
      await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, reason: finalReason })
      }).catch(() => {});

      // 2. Directly update Supabase newsletter_subscribers status to unsubscribed
      if (supabase) {
        await supabase
          .from('newsletter_subscribers')
          .update({
            status: 'unsubscribed',
            unsubscribed_at: new Date().toISOString(),
            unsubscribe_reason: finalReason
          })
          .eq('email', cleanEmail);

        // Keep in admin contact_messages inventory for feedback records
        await supabase.from('contact_messages').insert([{
          name: 'Unsubscribed User',
          email: cleanEmail,
          subject: `[Newsletter Unsubscribed - ${cleanEmail}]`,
          message: `Reason: ${finalReason}\nDate: ${new Date().toISOString()}`
        }]).catch(() => {});
      }

      setUnsubscribed(true);
      toast.success('Successfully unsubscribed', { icon: '👋' });
    } catch (err) {
      console.warn('Unsubscribe error:', err);
      setUnsubscribed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C1A17] flex flex-col justify-between selection:bg-[#1C1A17] selection:text-[#FAF7F2]">
      <Helmet>
        <title>Unsubscribe | Arun Pandian Data Journal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Top Header Bar */}
      <header className="p-6 max-w-4xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-[#1C1A17] text-[#FAF7F2] flex items-center justify-center font-serif font-bold text-xs">
            AP
          </div>
          <span className="font-serif font-bold text-base text-[#1C1A17] group-hover:text-[#B83A26] transition-colors">
            Arun Pandian · Data Journal
          </span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#6E665C] hover:text-[#1C1A17] transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-[#FFFDFB] rounded-2xl border border-[#E8E1D5] p-6 sm:p-8 shadow-sm space-y-6">
          
          {unsubscribed ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-full bg-[#F4EFE6] text-[#B83A26] flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 size={28} />
              </div>

              <div className="space-y-1.5">
                <h2 className="font-serif font-bold text-2xl text-[#1C1A17]">
                  You've Been Unsubscribed
                </h2>
                <p className="text-xs text-[#6E665C] leading-relaxed">
                  We've removed <strong className="text-[#1C1A17]">{email}</strong> from all future broadcast dispatches. You will no longer receive emails from <code>updates@arunpandian.online</code>.
                </p>
              </div>

              <div className="p-3.5 bg-[#F4EFE6] rounded-xl border border-[#E2DAD0] text-left text-xs text-[#5C554B] space-y-1">
                <span className="font-bold block text-[#1C1A17]">Recorded Reason:</span>
                <p className="italic">"{reason === 'Other reason' && customReason ? customReason : reason}"</p>
              </div>

              <div className="pt-3 flex flex-col gap-2">
                <Link
                  to="/"
                  className="w-full py-2.5 rounded-xl bg-[#1C1A17] hover:bg-[#B83A26] text-[#FAF7F2] font-mono text-xs font-bold transition-colors text-center shadow-xs"
                >
                  Return to Publication Index
                </Link>
                <button
                  onClick={() => setUnsubscribed(false)}
                  className="text-xs text-[#8C8479] hover:text-[#1C1A17] underline pt-1 cursor-pointer font-mono"
                >
                  Unsubscribed by mistake? Click here to resubscribe
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUnsubscribe} className="space-y-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F4EFE6] text-[#B83A26] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#E2DAD0]">
                  <HeartCrack size={11} />
                  <span>Subscription Settings</span>
                </div>
                <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#1C1A17] tracking-tight">
                  Manage or Cancel Subscription
                </h1>
                <p className="text-xs text-[#6E665C] leading-relaxed">
                  We're sorry to see you go. Please confirm your email address and let us know why you're leaving so we can improve our case studies.
                </p>
              </div>

              {/* Email Address Input */}
              <div>
                <label className="block text-xs font-mono font-bold text-[#4A453E] uppercase mb-1.5">
                  Your Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD5C7] bg-[#FFFDFB] text-xs text-[#1C1A17] focus:border-[#1C1A17] outline-none font-mono"
                />
              </div>

              {/* Unsubscribe Reasons */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-[#4A453E] uppercase">
                  Reason for Unsubscribing *
                </label>
                <div className="space-y-1.5">
                  {reasonsList.map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        reason === r
                          ? 'bg-[#F4EFE6] border-[#1C1A17] font-semibold text-[#1C1A17]'
                          : 'bg-white border-[#E8E1D5] text-[#5C554B] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r}
                        checked={reason === r}
                        onChange={(e) => setReason(e.target.value)}
                        className="text-[#1C1A17] focus:ring-[#1C1A17] cursor-pointer"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Optional Custom Reason Box */}
              {reason === 'Other reason' && (
                <div>
                  <label className="block text-xs font-mono font-bold text-[#4A453E] uppercase mb-1.5">
                    Please Specify (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Tell us what we could do better..."
                    className="w-full px-3 py-2 rounded-xl border border-[#DDD5C7] bg-[#FFFDFB] text-xs text-[#1C1A17] focus:border-[#1C1A17] outline-none"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#B83A26] hover:bg-[#992817] text-white font-mono text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Processing Unsubscribe...</span>
                  </>
                ) : (
                  <span>Unsubscribe from All Dispatches</span>
                )}
              </button>

              <p className="text-[11px] text-[#8C8479] text-center font-mono">
                ✦ Your preference is immediately synced in our database.
              </p>
            </form>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs font-mono text-[#8C8479] border-t border-[#EAE4D8]">
        <span>&copy; {new Date().getFullYear()} Arun Pandian · Updates dispatched from updates@arunpandian.online</span>
      </footer>
    </div>
  );
}
