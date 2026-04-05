'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { celebratePasswordUpdate } from '@/lib/utils/celebrate';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

      if (res.ok) {
        setSubmitted(true);
        celebratePasswordUpdate();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to send reset link');
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
        {!submitted && (
          <p className="mt-3 text-sm text-muted-foreground">
            Enter your email and we'll send you recovery instructions.
          </p>
        )}
      </div>

      <div className="bg-card p-8 rounded-3xl shadow-2xl border border-border backdrop-blur-sm">
        {!submitted ? (
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
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-16 h-16 bg-[#f43f5e]/10 rounded-full flex items-center justify-center mb-6 border border-[#f43f5e]/20">
              <svg className="w-8 h-8 text-[#f43f5e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Check your inbox</h3>
            <p className="text-sm text-muted-foreground">
              Instructions have been sent to <span className="text-foreground font-medium">{email}</span>.
            </p>
            <p className="mt-4 text-[10px] text-muted-foreground italic">
              Note: This is a secure system. If the email exists, a link was sent.
            </p>
          </div>
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
