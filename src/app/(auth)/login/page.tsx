'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password');
        setLoading(false);
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Welcome <span className="text-[#f43f5e]">Back</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sign in to access your AI engineering workspace
        </p>
      </div>

      <div className="bg-card p-8 rounded-3xl shadow-2xl border border-border backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#f43f5e] mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#f43f5e] focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-[#f43f5e]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[10px] uppercase font-bold tracking-tighter text-muted-foreground hover:text-[#f43f5e] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#f43f5e] focus:border-transparent transition-all"
              placeholder="••••••••"
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
            {loading ? 'Entering...' : 'Sign In'}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#f43f5e] font-bold hover:underline">
              Create one now
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
