'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Prompt {
  id: string;
  title: string;
  body: string;
}

interface HistoryDetail {
  id: string;
  use_case: string;
  problem_description: string;
  challenges: string;
  generated_pack: {
    prompts: Prompt[];
  };
  created_at: string;
}

export default function HistoryDetailPage() {
  const { data: session, status } = useSession();
  const [historyItem, setHistoryItem] = useState<HistoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && id) {
      fetchHistoryDetail();
    }
  }, [status, id, router]);

  const fetchHistoryDetail = async () => {
    try {
      const res = await fetch(`/api/history/${id}`);
      if (res.ok) {
        const data = await res.json();
        setHistoryItem(data);
      } else {
        router.push('/history');
      }
    } catch (err) {
      console.error('Failed to fetch history detail:', err);
      router.push('/history');
    } finally {
      setLoading(false);
    }
  };

  const copyPrompt = async (promptId: string, body: string) => {
    try {
      await navigator.clipboard.writeText(body);
      setCopiedId(promptId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-zinc-500 text-xl animate-pulse font-medium tracking-tight">Loading prompts...</div>
      </div>
    );
  }

  if (!historyItem) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">History not found</h2>
          <Link href="/history" className="text-[#f43f5e] hover:underline">
            ← Back to History
          </Link>
        </div>
      </div>
    );
  }

  const prompts = historyItem.generated_pack?.prompts || [];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 py-6 sm:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/history"
          className="text-sm font-medium text-muted-foreground hover:text-[#f43f5e] transition-colors inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to History
        </Link>

        <div className="bg-card p-8 rounded-3xl border border-border shadow-xl">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-[#f43f5e]/10 text-[#f43f5e] px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border border-[#f43f5e]/10">
              {historyItem.use_case}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {new Date(historyItem.created_at).toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border border-emerald-500/10">
              {prompts.length} Prompts
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-3">
            {historyItem.problem_description}
          </h1>

          <div className="flex gap-2 text-muted-foreground">
            <span className="text-[#f43f5e] text-lg font-serif">"</span>
            <p className="text-sm leading-relaxed italic">
              {historyItem.challenges}
            </p>
            <span className="text-[#f43f5e] text-lg font-serif self-end">"</span>
          </div>
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          All Prompts <span className="text-[#f43f5e]">({prompts.length})</span>
        </h2>

        {prompts.length === 0 ? (
          <div className="bg-card p-12 rounded-3xl border border-dashed border-border text-center">
            <p className="text-muted-foreground">No prompts found in this pack.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {prompts.map((prompt, index) => (
              <div
                key={prompt.id}
                className="bg-card group hover:border-[#f43f5e]/40 transition-all p-6 rounded-2xl border border-border shadow-lg"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-muted/20 text-muted-foreground px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
                        {prompt.id}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Prompt {index + 1} of {prompts.length}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-[#f43f5e] transition-colors">
                      {prompt.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => copyPrompt(prompt.id, prompt.body)}
                    className="flex-shrink-0 px-4 py-2 bg-muted/10 hover:bg-[#f43f5e] hover:text-white text-foreground rounded-lg text-xs font-bold transition-all border border-border"
                  >
                    {copiedId === prompt.id ? '✓ Copied' : 'Copy'}
                  </button>
                </div>

                <div className="bg-background/50 rounded-xl p-4 border border-border max-h-96 overflow-auto">
                  <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-foreground/90">
                    {prompt.body}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 justify-center pt-8 border-t border-border">
        <Link
          href="/history"
          className="px-6 py-3 bg-muted/10 hover:bg-muted/20 text-foreground rounded-xl text-sm font-bold transition-all border border-border"
        >
          ← Back to History
        </Link>
        <Link
          href="/"
          className="px-6 py-3 bg-[#f43f5e] hover:bg-[#e11d48] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#f43f5e]/20 transition-all"
        >
          Create New Pack
        </Link>
      </div>
    </div>
  );
}
