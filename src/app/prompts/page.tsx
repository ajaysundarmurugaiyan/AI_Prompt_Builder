"use client";

import Link from "next/link";
import { usePromptPack } from "@/context/prompt-pack-context";
import { validatePromptPack } from "@/lib/prompt-generation/validatePromptPack";
import { PROMPT_IDS } from "@/lib/api/schemas/generate-prompts";

export default function PromptsOverviewPage() {
  const { pack } = usePromptPack();

  if (!pack) {
    return (
      <div className="mx-auto w-full max-w-lg py-16 text-center">
        <h1 className="text-2xl font-semibold text-foreground">No prompts yet</h1>
        <p className="mt-2 text-muted">
          Complete the builder and generate prompts first.
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

  const validation = validatePromptPack(pack);

  return (
    <div className="mx-auto w-full max-w-4xl py-8 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Generated prompts
          </h1>
          <p className="mt-1 text-sm text-muted">
            Generated{" "}
            <time dateTime={pack.generatedAtIso}>
              {new Date(pack.generatedAtIso).toLocaleString()}
            </time>
          </p>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-muted underline-offset-2 hover:text-foreground hover:underline"
        >
          ← Back to builder
        </Link>
      </div>

      <section
        className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm"
        aria-labelledby="quality-heading"
      >
        <h2 id="quality-heading" className="text-lg font-semibold text-foreground">
          Quality checks
        </h2>
        <p className="mt-1 text-sm text-muted">
          Automated checks for structure and common UI prompt requirements (not a
          substitute for human review).
        </p>
        <ul className="mt-4 space-y-2">
          {validation.checks.map((c) => (
            <li
              key={c.id}
              className={`flex gap-2 text-sm ${
                c.pass ? "text-emerald-800 dark:text-emerald-200" : "text-amber-800 dark:text-amber-200"
              }`}
            >
              <span className="shrink-0 font-mono text-xs" aria-hidden>
                {c.pass ? "✓" : "!"}
              </span>
              <span>{c.detail}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted">
          Overall:{" "}
          <strong className={validation.ok ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}>
            {validation.ok ? "All checks passed" : "Some checks need attention"}
          </strong>
        </p>
      </section>

      <ol className="mt-10 space-y-4">
        {pack.prompts.map((p, i) => (
          <li key={p.id}>
            <Link
              href={`/prompts/${p.id}`}
              className="group flex flex-col rounded-2xl border border-border bg-card-muted/50 p-5 transition-colors hover:border-muted hover:bg-card sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <span className="font-mono text-xs text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-1 font-semibold text-foreground group-hover:underline">
                  {p.title}
                </h2>
                <p className="mt-1 line-clamp-2 font-mono text-xs text-muted">
                  {p.body.slice(0, 160)}
                  {p.body.length > 160 ? "…" : ""}
                </p>
              </div>
              <span className="mt-3 shrink-0 text-sm font-medium text-muted group-hover:text-foreground sm:mt-0">
                Open →
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-8 text-center text-xs text-muted">
        Expected ids: {PROMPT_IDS.join(", ")}
      </p>
    </div>
  );
}
