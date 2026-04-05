"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePromptPack } from "@/context/prompt-pack-context";
import { useSession, signOut } from "next-auth/react";

export function HeaderNav({ onAction }: { onAction?: () => void }) {
  const pathname = usePathname();
  const { pack } = usePromptPack();
  const { data: session } = useSession();

  const linkClass = (href: string) => {
    const active =
      pathname === href ||
      (href === "/prompts" && pathname?.startsWith("/prompts"));
    return `text-sm font-medium transition-colors ${active ? "text-[#f43f5e]" : "text-muted hover:text-foreground"
      }`;
  };

  return (
    <nav className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6" aria-label="Main">
      {/* Only show "All prompts" if user is authenticated AND pack exists */}
      {session && pack ? (
        <Link 
          href="/prompts" 
          className={linkClass("/prompts")}
          onClick={onAction}
        >
          All prompts
        </Link>
      ) : null}
      
      {session && (
        <>
          <Link 
            href="/history" 
            className={linkClass("/history")}
            onClick={onAction}
          >
            History
          </Link>
          <Link 
            href="/account" 
            className={linkClass("/account")}
            onClick={onAction}
          >
            Account
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-4 lg:ml-2 lg:pl-4 lg:border-l lg:border-border">
            <span className="text-xs text-muted">
              {session.user?.name || session.user?.email}
            </span>
            <button
              onClick={() => {
                if (onAction) onAction();
                signOut({ callbackUrl: '/login' });
              }}
              className="w-fit text-xs font-bold text-[#f43f5e] hover:text-[#e11d48] transition-colors"
            >
              Logout
            </button>
          </div>
        </>
      )}
    </nav>
  );
}
