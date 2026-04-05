"use client";

import {
  DEFAULT_PALETTE_ID,
  getPaletteById,
  PALETTES,
  type ColorPalette,
} from "@/lib/color-palettes";
import { useRef, useState, useEffect } from "react";

type Props = {
  /** Controlled selection; defaults to {@link DEFAULT_PALETTE_ID} in parent if unset. */
  selectedId: string;
  onSelect: (id: string) => void;
};

function SwatchStrip({ palette }: { palette: ColorPalette }) {
  const { primary, secondary, background, text } = palette.colors;
  return (
    <div
      className="flex h-14 w-full overflow-hidden rounded-xl shadow-inner ring-1 ring-black/5 dark:ring-white/10"
      aria-hidden
    >
      <div className="flex-[1.15]" style={{ backgroundColor: primary }} />
      <div className="flex-1" style={{ backgroundColor: secondary }} />
      <div className="flex-1" style={{ backgroundColor: background }} />
      <div className="flex-1" style={{ backgroundColor: text }} />
    </div>
  );
}

export function ColorPalettePicker({ selectedId, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 sm:p-8"
      aria-labelledby="palette-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f43f5e]">
            Visual Identity
          </p>
          <h2
            id="palette-heading"
            className="mt-1 text-xl font-extrabold tracking-tight text-foreground"
          >
            Design <span className="text-[#f43f5e]">Palettes</span>
          </h2>
          <p className="mt-1 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
            Select a curated visual direction for your prompt architectures. 
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="flex size-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition-all hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 shadow-sm"
            aria-label="Previous palettes"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="flex size-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition-all hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 shadow-sm"
            aria-label="Next palettes"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory"
        role="radiogroup"
        aria-label="Choose a color palette"
      >
        {PALETTES.map((palette) => {
          const selected = selectedId === palette.id;
          return (
            <button
              key={palette.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(palette.id)}
              className={`group relative flex min-w-[240px] w-[240px] sm:min-w-[280px] sm:w-[280px] shrink-0 snap-start flex-col rounded-2xl border-2 p-4 sm:p-5 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f43f5e] ${
                selected
                  ? "border-[#f43f5e] bg-[#f43f5e]/5 shadow-xl shadow-[#f43f5e]/5 dark:shadow-none"
                  : "border-zinc-100 bg-zinc-50/30 hover:border-zinc-300 hover:bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30 dark:hover:border-zinc-700"
              }`}
            >
              {selected ? (
                <span className="absolute right-4 top-4 flex size-6 items-center justify-center rounded-full bg-[#f43f5e] text-white shadow-lg shadow-[#f43f5e]/40">
                  <svg
                    className="size-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
              ) : null}

              <SwatchStrip palette={palette} />

              <div className="mt-5">
                <h3 className="font-bold text-foreground tracking-tight">{palette.name}</h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {palette.description}
                </p>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-zinc-100 pt-5 dark:border-zinc-800">
                {(
                  [
                    ["Primary", palette.colors.primary],
                    ["Secondary", palette.colors.secondary],
                    ["Background", palette.colors.background],
                    ["Text", palette.colors.text],
                  ] as const
                ).map(([label, hex]) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <span
                      className="size-3.5 shrink-0 rounded-md ring-1 ring-black/5 dark:ring-white/10"
                      style={{ backgroundColor: hex }}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <dt className="text-[9px] font-bold uppercase tracking-tighter text-zinc-400 dark:text-zinc-500">
                        {label}
                      </dt>
                      <dd className="truncate font-mono text-[10px] font-medium text-zinc-600 dark:text-zinc-300">
                        {hex}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
