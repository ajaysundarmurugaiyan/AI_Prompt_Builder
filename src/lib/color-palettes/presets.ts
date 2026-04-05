import type { ColorPalette } from "./types";

const slateEditorial: ColorPalette = {
  id: "slate-editorial",
  name: "Slate editorial",
  description: "Crisp neutrals for docs and dashboards",
  colors: {
    primary: "#0F172A",
    secondary: "#64748B",
    background: "#F8FAFC",
    text: "#1E293B",
  },
};

/**
 * Curated palettes for product / prompt theming previews.
 * Add entries here to extend without touching UI logic.
 */
export const PALETTES: ColorPalette[] = [
  slateEditorial,
  {
    id: "noir-indigo",
    name: "Noir indigo",
    description: "Deep contrast with electric accents",
    colors: {
      primary: "#4F46E5",
      secondary: "#818CF8",
      background: "#0F172A",
      text: "#E2E8F0",
    },
  },
  {
    id: "warm-clay",
    name: "Warm clay",
    description: "Earthy tones for friendly SaaS",
    colors: {
      primary: "#C2410C",
      secondary: "#FB923C",
      background: "#FFF7ED",
      text: "#431407",
    },
  },
  {
    id: "forest-canopy",
    name: "Forest canopy",
    description: "Calm greens for wellness & data",
    colors: {
      primary: "#047857",
      secondary: "#6EE7B7",
      background: "#ECFDF5",
      text: "#064E3B",
    },
  },
  {
    id: "dusk-rose",
    name: "Dusk rose",
    description: "Soft contrast for creative tools",
    colors: {
      primary: "#BE185D",
      secondary: "#F472B6",
      background: "#FFF1F2",
      text: "#831843",
    },
  },
  {
    id: "midnight-neon",
    name: "Midnight neon",
    description: "Cyberpunk aesthetic for high-tech builders",
    colors: {
      primary: "#06B6D4",
      secondary: "#8B5CF6",
      background: "#020617",
      text: "#F8FAFC",
    },
  },
  {
    id: "ocean-depths",
    name: "Ocean depths",
    description: "Professional blues for corporate tools",
    colors: {
      primary: "#1E40AF",
      secondary: "#60A5FA",
      background: "#EFF6FF",
      text: "#1E3A8A",
    },
  },
  {
    id: "sunset-horizon",
    name: "Sunset horizon",
    description: "Warm gradients for social & lifestyle",
    colors: {
      primary: "#EA580C",
      secondary: "#F472B6",
      background: "#FFF7ED",
      text: "#7C2D12",
    },
  },
  {
    id: "emerald-city",
    name: "Emerald city",
    description: "Premium greens for finance & growth",
    colors: {
      primary: "#059669",
      secondary: "#10B981",
      background: "#F0FDF4",
      text: "#064E3B",
    },
  },
  {
    id: "soft-lavender",
    name: "Soft lavender",
    description: "Elegant purples for design & fashion",
    colors: {
      primary: "#7C3AED",
      secondary: "#A78BFA",
      background: "#F5F3FF",
      text: "#4C1D95",
    },
  },
  {
    id: "minimalist-gold",
    name: "Minimalist gold",
    description: "Luxury feel with clean accents",
    colors: {
      primary: "#D4AF37",
      secondary: "#B8860B",
      background: "#FAFAFA",
      text: "#27272A",
    },
  },
];

export const DEFAULT_PALETTE_ID = slateEditorial.id;

export function getPaletteById(id: string): ColorPalette | undefined {
  return PALETTES.find((p) => p.id === id);
}
