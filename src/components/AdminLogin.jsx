import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, Loader2, Shield, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const ease = [0.16, 1, 0.3, 1];

export default function AdminLogin({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    if (!supabase) {
      setCheckingAuth(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCheckingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
    } else {
      setEmail('');
      setPassword('');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/70 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.4, ease }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl border border-line bg-bg shadow-[0_40px_100px_-30px_rgba(9,9,11,0.6)] overflow-hidden"
          >
            {/* Header gradient bar */}
            <div className="h-1.5 bg-gradient-to-r from-accent via-indigo-500 to-accent" />

            <div className="p-8">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-1.5 rounded-full text-ink-soft hover:text-ink hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {/* Icon */}
              <div className="mx-auto w-14 h-14 grid place-items-center rounded-2xl bg-gradient-to-br from-accent to-indigo-600 text-white shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)] mb-6">
                <Shield size={24} />
              </div>

              {checkingAuth ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Loader2 size={24} className="animate-spin text-accent" />
                  <p className="text-sm text-ink-soft">Checking session…</p>
                </div>
              ) : session ? (
                /* ── Logged in state ── */
                <div className="text-center">
                  <h2 className="font-display font-extrabold text-2xl text-ink tracking-tight">Admin Access</h2>
                  <p className="mt-2 text-sm text-ink-soft">
                    Signed in as <span className="font-semibold text-ink">{session.user.email}</span>
                  </p>

                  <div className="mt-6 p-4 rounded-2xl border border-line bg-surface">
                    <p className="text-sm text-ink-soft leading-relaxed">
                      You're authenticated. The admin dashboard is coming soon — for now you can manage content directly in your{' '}
                      <a
                        href="https://supabase.com/dashboard/project/secxgzharggytkevlvmx/editor"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent font-semibold hover:underline"
                      >
                        Supabase Table Editor
                      </a>.
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-6 py-2.5 text-sm font-semibold text-ink hover:border-danger hover:text-danger transition-colors"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              ) : (
                /* ── Login form ── */
                <>
                  <h2 className="font-display font-extrabold text-2xl text-ink tracking-tight text-center">Admin Login</h2>
                  <p className="mt-1 text-sm text-ink-soft text-center">Sign in to manage your portfolio content.</p>

                  <form onSubmit={handleLogin} className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="admin-email" className="block text-sm font-medium text-ink mb-1.5">Email</label>
                      <input
                        id="admin-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="admin@email.com"
                        className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-accent focus:ring-2 focus:ring-accent/15 focus:outline-none transition"
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
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-accent focus:ring-2 focus:ring-accent/15 focus:outline-none transition"
                      />
                    </div>

                    {error && (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-ink text-white py-3.5 text-sm font-semibold hover:bg-accent disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Signing in…
                        </>
                      ) : (
                        <>
                          <LogIn size={16} />
                          Sign in
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
