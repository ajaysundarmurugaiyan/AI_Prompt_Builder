'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);

  const token = searchParams?.get('token');
  const email = searchParams?.get('email');

  useEffect(() => {
    // Check if we have the required parameters
    if (!token || !email) {
      setError('Invalid or missing reset link. Please request a new password reset.');
    }
    setValidating(false);
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="w-full max-w-md mx-auto space-y-8 py-10">
        <div className="text-center">
          <div className="inline-block size-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
          <p className="mt-4 text-sm text-muted-foreground">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (error && !password) {
    return (
      <div className="w-full max-w-md mx-auto space-y-8 py-10">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Invalid <span className="text-[#f43f5e]">Link</span>
          </h1>
        </div>
        <div className="bg-card p-8 rounded-3xl shadow-2xl border border-border backdrop-blur-sm">
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-6">
              {error}
            </p>
            <Link
              href="/forgot-password"
              className="inline-flex items-center justify-center h-12 px-6 rounded-xl shadow-lg shadow-[#f43f5e]/20 text-sm font-bold text-white bg-[#f43f5e] hover:bg-[#e11d48] transition-all"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Reset <span className="text-[#f43f5e]">Password</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Enter your new password below
        </p>
      </div>

      <div className="bg-card p-8 rounded-3xl shadow-2xl border border-border backdrop-blur-sm">
        {success ? (
          <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Password Reset Successful</h3>
            <p className="text-sm text-muted-foreground">
              Redirecting you to login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#f43f5e] mb-2">
                New Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#f43f5e] focus:border-transparent transition-all"
                placeholder="••••••••"
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#f43f5e] mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#f43f5e] focus:border-transparent transition-all"
                placeholder="••••••••"
                minLength={8}
              />
            </div>

            {error && (
              <div className="bg-[#f43f5e]/10 border border-[#f43f5e]/20 text-[#f43f5e] px-4 py-2 rounded-lg text-xs font-medium text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 flex justify-center items-center px-4 rounded-xl shadow-lg shadow-[#f43f5e]/20 text-sm font-bold text-white bg-[#f43f5e] hover:bg-[#e11d48] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-block size-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2" />
              ) : null}
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="text-center mt-8">
          <Link href="/login" className="text-xs text-muted-foreground hover:text-[#f43f5e] font-bold transition-colors">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md mx-auto space-y-8 py-10">
        <div className="text-center">
          <div className="inline-block size-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
