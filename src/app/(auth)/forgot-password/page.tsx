'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.exists) {
        // Email exists, redirect to reset password page with token
        router.push(`/reset-password?token=${data.token}&email=${encodeURIComponent(data.email)}`);
      } else {
        // Email doesn't exist
        setError(data.message || 'Email does not exist in our system');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Reset <span className="text-[#f43f5e]">Password</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Enter your email to verify your account and reset your password.
        </p>
      </div>

      <div className="bg-card p-8 rounded-3xl shadow-2xl border border-border backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#f43f5e] mb-1.5 ml-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#f43f5e] transition-all"
              placeholder="you@example.com"
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
            {loading ? 'Checking Email...' : 'Check Email'}
          </button>
        </form>

        <div className="text-center mt-8">
          <Link href="/login" className="text-xs text-muted-foreground hover:text-[#f43f5e] font-bold transition-colors">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
