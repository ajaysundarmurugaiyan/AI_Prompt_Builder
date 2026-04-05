"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

export type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolved: "light" | "dark";
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "theme";
const THEME_EVENT = "theme-local";

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* ignore */
  }
  return "system";
}

function subscribeTheme(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onChange);
  window.addEventListener(THEME_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(THEME_EVENT, onChange);
  };
}

function subscribeSystemPreference(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSystemDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyDarkClass(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    readStoredTheme,
    () => "system" as Theme,
  );

  const prefersDark = useSyncExternalStore(
    subscribeSystemPreference,
    getSystemDark,
    () => false,
  );

  const effectiveDark =
    theme === "dark" || (theme === "system" && prefersDark);

  const resolved: "light" | "dark" = effectiveDark ? "dark" : "light";

  useEffect(() => {
    applyDarkClass(effectiveDark);
  }, [effectiveDark]);

  const setTheme = useCallback((t: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(THEME_EVENT));
    const dark =
      t === "dark" ||
      (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    applyDarkClass(dark);
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, resolved }),
    [theme, setTheme, resolved],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
