"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme";
import { HeaderNav } from "./HeaderNav";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex min-h-[4rem] w-full max-w-6xl flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-8">
            <Link
              href="/"
              className="shrink-0 text-sm font-extrabold tracking-tighter text-[#f43f5e] transition-opacity hover:opacity-80 sm:text-base lg:text-lg"
            >
              AI PROMPT <span className="text-foreground">BUILDER</span>
            </Link>
            {/* Desktop Nav */}
            <div className="hidden lg:block">
              <HeaderNav />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            
            {/* Mobile Toggle - Absolute pinned to top-right corner */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="absolute right-4 top-3.5 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-muted lg:hidden"
              aria-label="Toggle menu"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown - Overlays the screen */}
        {isMenuOpen && (
          <>
            {/* Full-screen Backdrop to close menu on outside click */}
            <div 
              className="fixed inset-0 z-40 bg-zinc-950/20 backdrop-blur-[2px] transition-all lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            {/* Fixed menu panel below header */}
            <div className="fixed inset-x-0 top-16 z-50 border-b border-border bg-background px-4 pb-8 pt-4 shadow-2xl lg:hidden animate-in slide-in-from-top-4 duration-300">
              <div className="flex flex-col gap-6">
                <HeaderNav onAction={() => setIsMenuOpen(false)} />
                <div className="flex flex-col items-center gap-3 pt-6 border-t border-border sm:hidden">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#f43f5e]">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
