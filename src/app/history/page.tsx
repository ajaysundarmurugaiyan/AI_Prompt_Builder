'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface HistoryItem {
  id: string;
  use_case: string;
  problem_description: string;
  challenges: string;
  generated_pack: any;
  created_at: string;
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchHistory();
    }
  }, [status, router]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPromptCount = (pack: any) => {
    if (!pack || !pack.prompts) return 0;
    return pack.prompts.length;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-zinc-500 text-xl animate-pulse font-medium tracking-tight">Accessing archives...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 py-6 sm:py-10">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-8">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Generation <span className="text-[#f43f5e]">History</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg">
            Your past AI-engineered prompt packs. Click any item to view all prompts.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-muted/20 rounded-xl border border-border">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{history.length}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Records Found</span>
        </div>
      </header>

      {history.length === 0 ? (
        <div className="bg-card p-16 rounded-3xl border border-dashed border-border text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mx-auto w-20 h-20 bg-muted/10 rounded-2xl flex items-center justify-center mb-6 border border-border shadow-inner">
            <span className="text-4xl">📜</span>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">Vault is Empty</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8">
            Start a new engineering flow to populate your history with advanced prompt packs.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="px-8 h-12 bg-[#f43f5e] hover:bg-[#e11d48] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#f43f5e]/20 transition-all inline-flex items-center"
          >
            Launch Builder Flow
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-500">
          {history.map((item, idx) => (
            <Link
              key={item.id}
              href={`/history/${item.id}`}
              className="bg-card group hover:border-[#f43f5e]/40 transition-all p-8 rounded-3xl border border-border shadow-xl overflow-hidden backdrop-blur-sm relative block"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-[#f43f5e]/0 group-hover:bg-[#f43f5e]/40 transition-all" />
              
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                <div className="flex-1 space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-[#f43f5e]/10 text-[#f43f5e] px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border border-[#f43f5e]/10">
                      {item.use_case}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {new Date(item.created_at).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border border-emerald-500/10">
                      {getPromptCount(item.generated_pack)} Prompts
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-[#f43f5e] transition-colors tracking-tight">
                      {item.problem_description}
                    </h3>
                    <div className="flex gap-2">
                      <span className="text-[#f43f5e] text-lg font-serif">"</span>
                      <p className="text-sm text-muted-foreground leading-relaxed italic max-w-2xl">
                        {item.challenges}
                      </p>
                      <span className="text-[#f43f5e] text-lg font-serif self-end">"</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-4 lg:py-0 border-t lg:border-t-0 lg:border-l border-border">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="text-3xl font-bold text-[#f43f5e]">
                      {getPromptCount(item.generated_pack)}
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">
                      Prompts<br/>Available
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Click to view all prompts →</span>
                <div className="flex gap-2">
                  {item.generated_pack?.prompts?.slice(0, 3).map((p: any, i: number) => (
                    <span key={i} className="px-2 py-1 bg-muted/20 rounded text-[10px] font-medium text-muted-foreground uppercase">
                      {p.id}
                    </span>
                  ))}
                  {getPromptCount(item.generated_pack) > 3 && (
                    <span className="px-2 py-1 bg-muted/20 rounded text-[10px] font-medium text-muted-foreground">
                      +{getPromptCount(item.generated_pack) - 3} more
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
