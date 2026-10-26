import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Loader2, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/apiClient';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      // If user pasted an email or typed @handle, extract the clean handle
      let cleanHandle = value.startsWith('@') ? value.slice(1) : value;
      if (cleanHandle.includes('@')) {
        cleanHandle = cleanHandle.split('@')[0];
      }
      // Keep only allowed characters: letters, numbers, hyphens, underscores
      cleanHandle = cleanHandle.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      setFormData({ ...formData, username: cleanHandle });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.auth.register({
        fullName: formData.fullName.trim(),
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      toast.success('Account created! Welcome to blog.arunpandian.online');
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF9F5] p-6 selection:bg-[#B83A26]/10 selection:text-[#B83A26]">
      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E7E0D3] bg-white text-xs font-mono font-medium text-[#7A7265] hover:text-[#1C1A17] hover:bg-[#F2ECE1] transition-all"
      >
        <ArrowLeft size={14} />
        Back to articles
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl border border-[#E7E0D3] p-8 sm:p-10 shadow-xs"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#1C1A17] text-white flex items-center justify-center font-serif font-bold text-sm">
            AP
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-[#1C1A17]">Join the Publication</h1>
            <p className="text-xs font-mono text-[#8C8479]">blog.arunpandian.online</p>
          </div>
        </div>

        <p className="text-xs text-[#5C5549] mb-6 leading-relaxed">
          Create an author or reader account to bookmark articles, join the conversation, and publish your work.
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-[#4A453E] mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="e.g. Jane Doe"
              className="w-full rounded-xl border border-[#E2DAD0] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#1C1A17] placeholder:text-[#A8A095] focus:border-[#B83A26] focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-[#4A453E] mb-1">
              Username
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs text-[#A8A095] font-mono">@</span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                pattern="[a-zA-Z0-9_\-]{3,30}"
                title="Username must be 3-30 letters, numbers, underscores, or hyphens"
                placeholder="janedoe"
                className="w-full rounded-xl border border-[#E2DAD0] bg-[#FAF8F5] pl-8 pr-4 py-2.5 text-sm text-[#1C1A17] placeholder:text-[#A8A095] focus:border-[#B83A26] focus:bg-white focus:outline-none transition-all font-mono"
              />
            </div>
            <p className="text-[11px] font-mono text-[#8C8479] mt-1">
              Your profile handle: @{formData.username || 'username'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-[#4A453E] mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[#E2DAD0] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#1C1A17] placeholder:text-[#A8A095] focus:border-[#B83A26] focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-[#4A453E] mb-1">
              Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="At least 6 characters"
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
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#1C1A17] hover:bg-[#B83A26] text-white py-3 text-xs font-mono font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <UserPlus size={15} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#EFE9DF] text-center text-xs text-[#7A7265]">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#1C1A17] hover:text-[#B83A26] transition-colors">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
