"use client";

import type { PromptPack } from "@/lib/prompt-generation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

const STORAGE_KEY = "ai-prompt-builder:prompt-pack-v1";
const CHANGE_EVENT = "ai-prompt-builder:prompt-pack-change";

type PromptPackContextValue = {
  pack: PromptPack | null;
  setPromptPack: (pack: PromptPack | null) => void;
  clearPromptPack: () => void;
};

const PromptPackContext = createContext<PromptPackContextValue | null>(null);

function isValidPack(raw: unknown): raw is PromptPack {
  if (!raw || typeof raw !== "object") return false;
  const p = raw as PromptPack;
  return (
    typeof p.generatedAtIso === "string" &&
    Array.isArray(p.prompts) &&
    p.prompts.length === 5
  );
}

let cachedRaw: string | null = null;
let cachedParsed: PromptPack | null = null;

function getSnapshot(): PromptPack | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    if (raw === cachedRaw) return cachedParsed;

    const parsed: unknown = JSON.parse(raw);
    const valid = isValidPack(parsed) ? parsed : null;

    cachedRaw = raw;
    cachedParsed = valid;

    return valid;
  } catch {
    return null;
  }
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(CHANGE_EVENT, handler);
  };
}

export function PromptPackProvider({ children }: { children: React.ReactNode }) {
  const pack = useSyncExternalStore(subscribe, getSnapshot, () => null);

  const setPromptPack = useCallback((next: PromptPack | null) => {
    try {
      if (next) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* quota / private mode */
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const clearPromptPack = useCallback(() => {
    setPromptPack(null);
  }, [setPromptPack]);

  const value = useMemo(
    () => ({ pack, setPromptPack, clearPromptPack }),
    [pack, setPromptPack, clearPromptPack],
  );

  return (
    <PromptPackContext.Provider value={value}>
      {children}
    </PromptPackContext.Provider>
  );
}

export function usePromptPack() {
  const ctx = useContext(PromptPackContext);
  if (!ctx) {
    throw new Error("usePromptPack must be used within PromptPackProvider");
  }
  return ctx;
}
