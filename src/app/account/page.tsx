'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [groqApiKey, setGroqApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-zinc-500 text-xl animate-pulse font-medium tracking-tight">Syncing workspace...</div>
      </div>
    );
  }

  const handleUpdateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/auth/update-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groqApiKey }),
      });

      if (res.ok) {
        setMessage('Groq API Key updated successfully!');
        setGroqApiKey('');
      } else {
        const data = await res.json();
        setError(data.message || 'Update failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-10 py-6 sm:py-10">
      <header className="text-center sm:text-left border-b border-border pb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Account <span className="text-[#f43f5e]">Settings</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-lg">
          Configure your personal engineering workspace and API credentials.
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-5">
          <div className="bg-card p-8 rounded-3xl border border-border shadow-xl h-full backdrop-blur-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#f43f5e] mb-6 flex items-center">
              Profile Information
            </h2>
            <div className="space-y-6">
              <div className="group">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                  System Name
                </label>
                <div className="text-lg font-semibold text-foreground tracking-tight">{session?.user?.name || 'Authorized Engineer'}</div>
              </div>
              <div className="group">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                  Access Email
                </label>
                <div className="text-lg font-semibold text-foreground tracking-tight">{session?.user?.email || 'N/A'}</div>
              </div>
              <div className="pt-4 border-t border-border">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f43f5e]/10 rounded-full border border-[#f43f5e]/20">
                  <div className="size-1.5 rounded-full bg-[#f43f5e] animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-[#f43f5e]">Session Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Card */}
        <div className="lg:col-span-7">
          <div className="bg-card p-8 rounded-3xl border border-border shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#f43f5e]">
                API Management
              </h2>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-muted-foreground hover:text-[#f43f5e] transition-colors"
              >
                Get Keys →
              </a>
            </div>
            
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              Updates to your Groq Key apply immediately. Your key is encrypted at rest and used only for your requests.
            </p>
            
            <form onSubmit={handleUpdateKey} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#f43f5e] mb-2 ml-1">
                  New Secret Key
                </label>
                <input
                  type="password"
                  required
                  value={groqApiKey}
                  onChange={(e) => setGroqApiKey(e.target.value)}
                  className="block w-full px-5 py-4 bg-background border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#f43f5e] transition-all font-mono text-sm"
                  placeholder="gsk_..."
                />
              </div>

              {message && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-xs font-bold text-center">
                  {message}
                </div>
              )}
              {error && (
                <div className="bg-[#f43f5e]/10 border border-[#f43f5e]/20 text-[#f43f5e] px-4 py-2 rounded-xl text-xs font-bold text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 flex justify-center items-center px-4 rounded-2xl shadow-xl shadow-[#f43f5e]/20 text-sm font-bold text-white bg-[#f43f5e] hover:bg-[#e11d48] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block size-5 animate-spin rounded-full border-2 border-white/30 border-t-white mr-3" />
                ) : null}
                {loading ? 'Committing...' : 'Synchronize API Key'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
