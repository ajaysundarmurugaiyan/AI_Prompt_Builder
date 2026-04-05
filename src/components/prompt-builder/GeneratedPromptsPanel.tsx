"use client";

import type { PromptPack } from "@/lib/prompt-generation";
import Link from "next/link";
import { useCallback, useId, useState } from "react";

type Props = {
  pack: PromptPack | null;
  canGenerate: boolean;
  isGenerating: boolean;
  error: { message: string; code?: string } | null;
  onDismissError: () => void;
  onGenerate: () => void;
  /** Offline resilience when Groq is unavailable or misconfigured. */
  onUseTemplateFallback: () => void;
};

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={`inline-block size-4 animate-spin rounded-full border-2 border-muted border-t-foreground ${className ?? ""}`}
      aria-hidden
    />
  );
}

export function GeneratedPromptsPanel({
  pack,
  canGenerate,
  isGenerating,
  error,
  onDismissError,
  onGenerate,
  onUseTemplateFallback,
}: Props) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const errId = useId();

  const flashCopied = useCallback((key: string) => {
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  const handleCopyOne = async (id: string, body: string) => {
    const ok = await copyText(body);
    if (ok) flashCopied(id);
  };

  const handleCopyAll = async () => {
    if (!pack) return;
    const text = pack.prompts
      .map((p) => `# ${p.title}\n\n${p.body}`)
      .join("\n\n---\n\n");
    const ok = await copyText(text);
    if (ok) flashCopied("all");
  };

  const showEmptyCta = !pack && canGenerate && !isGenerating;
  const isLimitReached = error?.code === "LIMIT_REACHED";

  return (
    <section
      className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors duration-200 sm:p-8"
      aria-labelledby="generated-prompts-heading"
      aria-busy={isGenerating}
    >
      {/* Toolbar */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Output
          </p>
          <h2
            id="generated-prompts-heading"
            className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
          >
            IDE-ready prompts
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Five structured prompts from your brief, scoping answers, stack, and
            palette—generated with Groq and ready for Cursor, Windsurf, or similar
            tools. Use offline templates if the API is unavailable.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:flex-col lg:items-stretch xl:flex-row xl:items-center">
          <button
            type="button"
            onClick={() => void onGenerate()}
            disabled={!canGenerate || isGenerating}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-all duration-200 hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
          >
            {isGenerating ? (
              <>
                <Spinner />
                Generating…
              </>
            ) : pack ? (
              "Regenerate"
            ) : (
              "Generate with AI"
            )}
          </button>
          {pack && !isGenerating ? (
            <>
              <Link
                href="/prompts"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-200 hover:border-muted hover:bg-card-muted"
              >
                Full list &amp; checks
              </Link>
              <button
                type="button"
                onClick={() => void handleCopyAll()}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-card-muted px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-200 hover:border-muted hover:bg-card"
              >
                {copiedKey === "all" ? "Copied all five" : "Copy all"}
              </button>
            </>
          ) : null}
        </div>
      </div>
      
      {error ? (
        <div
          className={`mt-6 rounded-xl border ${
            isLimitReached ? "border-[#f43f5e]/30 bg-[#f43f5e]/10" : "border-red-500/30 bg-red-500/10"
          } px-4 py-3 text-sm ${
            isLimitReached ? "text-[#f43f5e] dark:text-rose-200" : "text-red-950 dark:text-red-100"
          }`}
          role="alert"
          id={errId}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1 leading-relaxed">
              <p className="font-bold mb-1">{isLimitReached ? "Rate Limit Reached" : "Error"}</p>
              <p>{error.message}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {isLimitReached ? (
                <Link
                  href="/account"
                  className="rounded-lg bg-[#f43f5e] px-4 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
                >
                  Update API Key
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => void onGenerate()}
                    disabled={!canGenerate || isGenerating}
                    className="rounded-lg border border-red-800/20 bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-card-muted disabled:opacity-40 dark:border-red-200/20"
                  >
                    Retry
                  </button>
                  <button
                    type="button"
                    onClick={onUseTemplateFallback}
                    disabled={!canGenerate || isGenerating}
                    className="rounded-lg border border-red-800/20 bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-card-muted disabled:opacity-40 dark:border-red-200/20"
                  >
                    Use offline templates
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={onDismissError}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-muted underline-offset-2 hover:text-foreground hover:underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {pack && !isGenerating ? (
        <p className="mt-6 text-xs text-muted">
          Last generated:{" "}
          <time
            className="font-medium text-foreground"
            dateTime={pack.generatedAtIso}
          >
            {new Date(pack.generatedAtIso).toLocaleString()}
          </time>
        </p>
      ) : null}

      {!canGenerate ? (
        <p className="mt-6 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
          Answer every scoping question to enable generation.
        </p>
      ) : null}

      {isGenerating ? (
        <div
          className="mt-8 flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card-muted/60 px-6 py-16 text-center"
          role="status"
          aria-live="polite"
          aria-describedby="generate-status"
        >
          <Spinner className="size-10 border-2" />
          <div id="generate-status">
            <p className="text-sm font-medium text-foreground">
              Calling Groq to draft your five prompts…
            </p>
            <p className="mt-1 max-w-md text-xs text-muted">
              This can take up to a minute. You can leave this page open.
            </p>
          </div>
        </div>
      ) : null}

      {showEmptyCta ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card-muted/50 px-6 py-14 text-center transition-colors duration-200">
          <p className="text-sm text-muted">
            When you are ready, tap{" "}
            <span className="font-semibold text-foreground">
              Generate with AI
            </span>{" "}
            to call Groq and create all five cards below.
          </p>
        </div>
      ) : null}

      {pack && !isGenerating ? (
        <div className="mt-10 grid grid-cols-1 gap-6 lg:gap-8">
          {pack.prompts.map((p, index) => (
            <article
              key={p.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card-muted/40 shadow-sm ring-1 ring-black/[0.02] transition-all duration-200 dark:ring-white/[0.04]"
            >
              <div className="flex flex-col gap-4 border-b border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-xs font-bold text-accent-foreground"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold leading-snug text-foreground sm:text-lg">
                      {p.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted sm:text-sm">
                      Prompt {index + 1} of 5
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopyOne(p.id, p.body)}
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition-all duration-200 hover:border-muted hover:bg-card-muted"
                >
                  {copiedKey === p.id ? "Copied" : "Copy"}
                </button>
              </div>

              <div
                className="prompt-scroll max-h-[min(28rem,65vh)] min-h-[12rem] overflow-y-auto overflow-x-hidden border-t border-border/60 bg-card"
                tabIndex={0}
                role="region"
                aria-label={`Content for ${p.title}`}
              >
                <pre className="whitespace-pre-wrap break-words p-5 font-mono text-[13px] leading-relaxed text-foreground/95 sm:p-6 sm:text-sm sm:leading-7">
                  {p.body}
                </pre>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
