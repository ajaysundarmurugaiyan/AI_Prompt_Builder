import type { ResolvedTechStack } from "@/lib/tech-stack";

type Props = {
  stack: ResolvedTechStack;
};

const rows: { key: keyof Pick<ResolvedTechStack, "frontend" | "backend" | "database">; label: string }[] = [
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend" },
  { key: "database", label: "Database" },
];

export function TechStackSummary({ stack }: Props) {
  return (
    <aside
      className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6 dark:border-zinc-800 dark:bg-zinc-900/40 sm:p-7"
      aria-labelledby="tech-stack-heading"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2
          id="tech-stack-heading"
          className="text-base font-semibold tracking-tight text-foreground"
        >
          Resolved tech stack
        </h2>
        {stack.source === "default_recommendation" ? (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950/80 dark:text-amber-200">
            Default assignment
          </span>
        ) : (
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200">
            From your selections
          </span>
        )}
      </div>

      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Based on your stack answers
        {stack.selectionSummary.length > 0
          ? `: ${stack.selectionSummary.join(", ")}`
          : "."}
      </p>

      <dl className="mt-5 space-y-4">
        {rows.map(({ key, label }) => (
          <div
            key={key}
            className="flex flex-col gap-0.5 border-b border-zinc-200/80 pb-4 last:border-0 last:pb-0 dark:border-zinc-700/80"
          >
            <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {label}
            </dt>
            <dd className="text-sm font-medium text-foreground">{stack[key]}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
