'use client';

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme";
import { PromptPackProvider } from "@/context/prompt-pack-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <PromptPackProvider>
          {children}
        </PromptPackProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
