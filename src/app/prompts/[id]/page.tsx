"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { usePromptPack } from "@/context/prompt-pack-context";
import { promptKindSchema } from "@/lib/api/schemas/generate-prompts";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function PromptDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : "";

  const parsed = promptKindSchema.safeParse(id);
  const { pack } = usePromptPack();
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(() => {
    if (!parsed.success || !pack) return null;
    return pack.prompts.find((p) => p.id === id) ?? null;
  }, [parsed.success, pack, id]);

  const handleCopy = useCallback(async () => {
    if (!prompt) return;
    const ok = await copyText(prompt.body);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }, [prompt]);

  if (!parsed.success) {
    notFound();
  }

  if (!pack) {
    return (
      <div className="mx-auto w-full max-w-lg py-16 text-center">
        <h1 className="text-2xl font-semibold text-foreground">No prompts yet</h1>
        <p className="mt-2 text-muted">
          Generate prompts from the builder first.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
        >
          Go to builder
        </Link>
      </div>
    );
  }

  if (!prompt) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl py-8 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/prompts"
          className="text-sm font-medium text-muted underline-offset-2 hover:text-foreground hover:underline"
        >
          ← All prompts
        </Link>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-card-muted"
        >
          {copied ? "Copied" : "Copy full prompt"}
        </button>
      </div>

      <article className="mt-8">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          {prompt.id}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          {prompt.title}
        </h1>
        <div className="prompt-scroll mt-8 max-h-[min(70vh,48rem)] overflow-auto rounded-2xl border border-border bg-card p-6">
          <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-foreground/95">
            {prompt.body}
          </pre>
        </div>
      </article>
    </div>
  );
}
