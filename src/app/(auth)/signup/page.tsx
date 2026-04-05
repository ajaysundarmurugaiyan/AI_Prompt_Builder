'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { celebrateSignup } from '@/lib/utils/celebrate';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    groqApiKey: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          groqApiKey: formData.groqApiKey,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        celebrateSignup();
      } else {
        setError(data.message || 'Signup failed');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto py-10 animate-in fade-in zoom-in duration-300">
        <div className="bg-card p-8 rounded-3xl shadow-2xl border border-border backdrop-blur-md text-center">
          <div className="mx-auto w-16 h-16 bg-[#f43f5e]/10 rounded-full flex items-center justify-center mb-6 border border-[#f43f5e]/20">
            <svg
              className="w-8 h-8 text-[#f43f5e]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Account Created!</h2>
          <p className="text-muted-foreground text-sm mb-8">
            Your technical workspace is ready. Log in to start building advanced prompts.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full h-12 flex justify-center items-center px-4 rounded-xl shadow-lg shadow-[#f43f5e]/20 text-sm font-bold text-white bg-[#f43f5e] hover:bg-[#e11d48] transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6 py-2 sm:py-4">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Get <span className="text-[#f43f5e]">Started</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your account and power your prompts with Groq
        </p>
      </div>

      <div className="bg-card p-8 rounded-3xl shadow-2xl border border-border backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#f43f5e] mb-1.5 ml-1">
              Full Name
            </label>
            <input
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="block w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#f43f5e] transition-all"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#f43f5e] mb-1.5 ml-1">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="block w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#f43f5e] transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#f43f5e] mb-1.5 ml-1">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#f43f5e] transition-all"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#f43f5e] mb-1.5 ml-1">
                Confirm
              </label>
              <input
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="block w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#f43f5e] transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5 ml-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#f43f5e]">
                Groq API Key
              </label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-muted-foreground hover:text-[#f43f5e] transition-colors"
              >
                Get Keys →
              </a>
            </div>
            <input
              name="groqApiKey"
              type="password"
              required
              value={formData.groqApiKey}
              onChange={handleChange}
              className="block w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#f43f5e] transition-all"
              placeholder="gsk_..."
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
            {loading ? 'Creating...' : 'Sign Up'}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-[#f43f5e] font-bold hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
