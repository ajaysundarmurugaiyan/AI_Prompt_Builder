"use client";

import { useTheme, type Theme } from "./theme-context";

const options: { value: Theme; label: string; short: string }[] = [
  { value: "light", label: "Light mode", short: "Light" },
  { value: "dark", label: "Dark mode", short: "Dark" },
  { value: "system", label: "Use system theme", short: "System" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="inline-flex rounded-xl border border-border bg-card-muted/80 p-1 shadow-sm backdrop-blur-sm transition-colors duration-200"
      role="group"
      aria-label="Theme"
    >
      {options.map(({ value, label, short }) => {
        const selected = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            title={label}
            aria-label={label}
            aria-pressed={selected}
            className={`relative min-w-[4.25rem] rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              selected
                ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                : "text-muted hover:text-foreground"
            }`}
          >
            {short}
          </button>
        );
      })}
    </div>
  );
}
