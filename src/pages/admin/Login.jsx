import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Loader2, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import Logo from '../../components/Logo';
import arunProfile from '../../assets/arun-profile.jpg';

const ease = [0.16, 1, 0.3, 1];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      navigate('/admin', { replace: true });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg">
      {/* ───────── Left: brand panel (LinkedIn-style) ───────── */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-ink text-white p-12">
        {/* Accent glow + quiet grid */}
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_30%_35%,rgba(37,99,235,0.35),transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:56px_56px]" />

        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}
          className="relative flex items-center gap-3"
        >
          <Logo size={34} title="Arun Pandian logo" />
          <span className="font-display font-bold tracking-tight text-lg">Arun Pandian</span>
        </motion.div>

        {/* Center: avatar + welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease }}
          className="relative max-w-md"
        >
          <div className="relative inline-block">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-[5px] rounded-full bg-[conic-gradient(from_0deg,#2563EB,#6366F1,#a5b4fc,#2563EB)]"
            />
            <img
              src={arunProfile}
              alt="Arun Pandian"
              className="relative h-24 w-24 rounded-full object-cover border-[3px] border-ink"
              style={{ objectPosition: '50% 22%' }}
            />
            <span className="absolute bottom-1 right-1 h-4.5 w-4.5 rounded-full bg-emerald-500 border-[3px] border-ink" />
          </div>

          <h1 className="mt-8 font-display font-extrabold text-4xl xl:text-5xl tracking-tight leading-[1.05]">
            Welcome back,<br />
            <span className="text-accent italic font-medium">Arun.</span>
          </h1>
          <p className="mt-4 text-white/60 text-lg leading-relaxed">
            Your portfolio, your data. Sign in to edit every element of the site — changes go live in realtime.
          </p>

          <div className="mt-8 flex items-center gap-6 text-sm text-white/50">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" /> Supabase Auth
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles size={16} className="text-accent" /> Live CMS
            </span>
          </div>
        </motion.div>

        {/* Footer line */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
          className="relative text-xs font-mono tracking-[0.25em] uppercase text-white/30"
        >
          Data · into · decisions
        </motion.p>
      </div>

      {/* ───────── Right: sign-in form ───────── */}
      <div className="relative flex items-center justify-center p-6 sm:p-12">
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-line bg-surface/70 text-sm font-medium text-ink-soft hover:text-ink hover:bg-surface transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to site
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="w-full max-w-sm"
        >
          {/* Mobile-only avatar header (brand panel is hidden below lg) */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="relative">
              <div className="absolute -inset-[4px] rounded-full bg-[conic-gradient(from_0deg,#2563EB,#6366F1,#a5b4fc,#2563EB)]" />
              <img
                src={arunProfile}
                alt="Arun Pandian"
                className="relative h-20 w-20 rounded-full object-cover border-[3px] border-bg"
                style={{ objectPosition: '50% 22%' }}
              />
            </div>
            <p className="mt-3 font-display font-bold text-ink">Arun Pandian</p>
          </div>

          <h2 className="font-display font-extrabold text-3xl text-ink tracking-tight">Sign in</h2>
          <p className="mt-2 text-sm text-ink-soft">Manage your portfolio content — every element, editable.</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-ink mb-1.5">Email address</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@example.com"
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-soft/50 focus:border-accent focus:ring-2 focus:ring-accent/15 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-ink mb-1.5">Password</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-soft/50 focus:border-accent focus:ring-2 focus:ring-accent/15 focus:outline-none transition-all"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 text-sm text-rose-700"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-ink text-white py-3.5 text-sm font-semibold hover:bg-accent disabled:opacity-50 transition-colors cursor-pointer shadow-[0_10px_30px_-10px_rgba(9,9,11,0.5)]"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Authenticating…
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign in
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-ink-soft/60">
            Protected area — authorized access only.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
