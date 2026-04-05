export type TechStackSource = "user_selection" | "default_recommendation";

/**
 * Canonical resolved shape for downstream prompts / specs.
 * Extend with fields like `hosting`, `authProvider` as the product grows.
 */
export type ResolvedTechStack = {
  frontend: string;
  backend: string;
  database: string;
  source: TechStackSource;
  /** Human-readable selections from the stack question (for audit UI). */
  selectionSummary: string[];
};
