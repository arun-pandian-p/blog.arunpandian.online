import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (supabase) {
        const { error: supaErr } = await supabase.auth.updateUser({ password });
        if (supaErr) throw supaErr;
      }
      setSuccess(true);
      toast.success('Password updated successfully!');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF9F5] p-6 selection:bg-[#B83A26]/10 selection:text-[#B83A26]">
      <Link
        to="/login"
        className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E7E0D3] bg-white text-xs font-mono font-medium text-[#7A7265] hover:text-[#1C1A17] hover:bg-[#F2ECE1] transition-all"
      >
        <ArrowLeft size={14} />
        Back to sign in
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
            <h1 className="font-serif text-xl font-bold text-[#1C1A17]">Reset Password</h1>
            <p className="text-xs font-mono text-[#8C8479]">blog.arunpandian.online</p>
          </div>
        </div>

        {success ? (
          <div className="text-center py-6">
            <CheckCircle2 size={40} className="text-emerald-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#1C1A17] mb-1">Password Changed</h3>
            <p className="text-xs text-[#7A7265] mb-4">
              Your password has been successfully updated. Redirecting to sign in...
            </p>
            <Link
              to="/login"
              className="inline-block px-5 py-2 rounded-xl bg-[#1C1A17] text-white text-xs font-mono font-bold"
            >
              Sign In Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-xs text-[#5C5549] mb-4">
              Enter a new secure password for your publication account.
            </p>

            <div>
              <label className="block text-xs font-mono font-medium text-[#4A453E] mb-1">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-[#E2DAD0] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#1C1A17] placeholder:text-[#A8A095] focus:border-[#B83A26] focus:bg-white focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-[#4A453E] mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Repeat new password"
                className="w-full rounded-xl border border-[#E2DAD0] bg-[#FAF8F5] px-4 py-2.5 text-sm text-[#1C1A17] placeholder:text-[#A8A095] focus:border-[#B83A26] focus:bg-white focus:outline-none transition-all"
              />
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
                  <span>Updating password...</span>
                </>
              ) : (
                <>
                  <KeyRound size={15} />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
