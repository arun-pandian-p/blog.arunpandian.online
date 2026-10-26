import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Loader2, ArrowLeft, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { api } from '../../services/apiClient';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.auth.login(email.trim(), password);
      toast.success('Signed in successfully');

      const role = res?.user?.role;
      if (role === 'ROLE_ADMIN' || role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.warn('Login error:', err);
      const msg = err?.message || 'Invalid email or password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@arunpandian.online');
    setPassword('Admin@12345');
    setError('');
    toast('Demo admin credentials filled', { icon: '🔑' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF9F5] p-6 selection:bg-[#B83A26]/10 selection:text-[#B83A26]">
      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E7E0D3] bg-white text-xs font-mono font-medium text-[#7A7265] hover:text-[#1C1A17] hover:bg-[#F2ECE1] transition-all shadow-xs"
      >
        <ArrowLeft size={14} />
        Back to articles
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl border border-[#E7E0D3] p-8 sm:p-10 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1C1A17] text-white flex items-center justify-center font-serif font-bold text-sm shadow-xs">
              AP
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-[#1C1A17]">Sign In</h1>
              <p className="text-xs font-mono text-[#8C8479]">blog.arunpandian.online</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-mono font-medium text-emerald-800">
            <ShieldCheck size={12} className="text-emerald-600" />
            Supabase Auth
          </div>
        </div>

        <p className="text-xs text-[#5C5549] mb-5 leading-relaxed">
          Sign in to access your publishing workspace, manage reading list bookmarks, and publish articles.
        </p>

        {/* Quick Demo Fill Helper */}
        <div className="mb-5 p-3 rounded-2xl bg-[#FAF8F5] border border-[#EFE9DF] flex items-center justify-between">
          <div className="text-[11px] font-mono text-[#7A7265]">
            <span className="font-semibold text-[#1C1A17]">Demo Admin:</span> admin@arunpandian.online
          </div>
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E2DAD0] text-[11px] font-mono font-bold text-[#B83A26] hover:bg-[#B83A26] hover:text-white transition-all shadow-2xs cursor-pointer"
          >
            <KeyRound size={11} />
            Fill Admin
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-[#4A453E] mb-1">
              Email or Username
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              placeholder="you@example.com or @username"
              className="w-full rounded-xl border border-[#E2DAD0] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#1C1A17] placeholder:text-[#A8A095] focus:border-[#B83A26] focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-mono font-medium text-[#4A453E]">
                Password
              </label>
              <Link
                to="/reset-password"
                className="text-[11px] font-mono text-[#7A7265] hover:text-[#B83A26] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#E2DAD0] bg-[#FAF8F5] px-4 py-2.5 pr-10 text-sm text-[#1C1A17] placeholder:text-[#A8A095] focus:border-[#B83A26] focus:bg-white focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-[#A8A095] hover:text-[#1C1A17] transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 leading-relaxed font-sans"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#1C1A17] hover:bg-[#B83A26] text-white py-3 text-xs font-mono font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <LogIn size={15} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#EFE9DF] text-center text-xs text-[#7A7265]">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-[#1C1A17] hover:text-[#B83A26] transition-colors">
            Create an account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
