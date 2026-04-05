import { DEFAULT_TECH_STACK, type StackOptionId } from "./constants";
import type { ResolvedTechStack } from "./types";

type Layer = "frontend" | "backend";

type OptionContribution = {
  layer: Layer;
  label: string;
};

/**
 * Registry: map questionnaire option ids → layer + display label.
 * Add new options here without changing resolution flow.
 */
const STACK_OPTION_REGISTRY: Record<
  StackOptionId,
  OptionContribution | "skip" | "undecided"
> = {
  react: { layer: "frontend", label: "React" },
  next: { layer: "frontend", label: "Next.js" },
  vue: { layer: "frontend", label: "Vue" },
  node: { layer: "backend", label: "Node.js" },
  python: { layer: "backend", label: "Python" },
  dotnet: { layer: "backend", label: ".NET" },
  other: "skip",
  unknown: "undecided",
};

/** When the user names some layers but not others, fill gaps (tune in one place). */
const LAYER_FALLBACKS: Record<Layer, string> = {
  frontend: DEFAULT_TECH_STACK.frontend,
  backend: DEFAULT_TECH_STACK.backend,
};

function isStackOptionId(id: string): id is StackOptionId {
  return id in STACK_OPTION_REGISTRY;
}

function partitionSelections(ids: string[]): {
  undecidedOnly: boolean;
  concrete: StackOptionId[];
  labelsPicked: string[];
} {
  const unique = [...new Set(ids.filter(Boolean))];
  const concrete: StackOptionId[] = [];
  const labelsPicked: string[] = [];
  let hasUndecided = false;
  let hasOtherOnlySignal = false;

  for (const id of unique) {
    if (!isStackOptionId(id)) {
      continue;
    }
    const entry = STACK_OPTION_REGISTRY[id];
    if (entry === "undecided") {
      hasUndecided = true;
      labelsPicked.push("I don't know");
      continue;
    }
    if (entry === "skip") {
      hasOtherOnlySignal = true;
      labelsPicked.push("Other stack");
      continue;
    }
    concrete.push(id);
    labelsPicked.push(entry.label);
  }

  const onlyNonConcrete =
    concrete.length === 0 &&
    unique.every((id) => {
      if (!isStackOptionId(id)) return true;
      const e = STACK_OPTION_REGISTRY[id];
      return e === "undecided" || e === "skip";
    });

  const undecidedOnly =
    onlyNonConcrete && (hasUndecided || hasOtherOnlySignal);

  return { undecidedOnly, concrete, labelsPicked };
}

function buildLayersFromConcrete(
  concrete: StackOptionId[],
): Pick<ResolvedTechStack, "frontend" | "backend"> {
  const front: string[] = [];
  const back: string[] = [];

  for (const id of concrete) {
    const entry = STACK_OPTION_REGISTRY[id];
    if (entry === "skip" || entry === "undecided") continue;
    if (entry.layer === "frontend") {
      front.push(entry.label);
    } else {
      back.push(entry.label);
    }
  }

  const dedupe = (xs: string[]) => [...new Set(xs)];

  return {
    frontend:
      dedupe(front).join(" · ") || LAYER_FALLBACKS.frontend,
    backend: dedupe(back).join(" · ") || LAYER_FALLBACKS.backend,
  };
}

/**
 * Resolves questionnaire multi-select ids into a stable frontend / backend / database triple.
 *
 * Rules:
 * - Empty selection → full default stack (Next.js / serverless / managed DB).
 * - Only “I don’t know”, only “Other stack”, or both (no concrete tech) → same defaults.
 * - No recognizable ids → defaults.
 * - Otherwise → map ids to layers; missing layer uses {@link LAYER_FALLBACKS}.
 */
export function resolveTechStack(selectedIds: string[]): ResolvedTechStack {
  const cleaned = [...new Set(selectedIds.filter(Boolean))];

  if (cleaned.length === 0) {
    return {
      frontend: DEFAULT_TECH_STACK.frontend,
      backend: DEFAULT_TECH_STACK.backend,
      database: DEFAULT_TECH_STACK.database,
      source: "default_recommendation",
      selectionSummary: ["I don't know"],
    };
  }

  const { undecidedOnly, concrete, labelsPicked } =
    partitionSelections(cleaned);

  const useDefaults = undecidedOnly || concrete.length === 0;

  if (useDefaults) {
    return {
      frontend: DEFAULT_TECH_STACK.frontend,
      backend: DEFAULT_TECH_STACK.backend,
      database: DEFAULT_TECH_STACK.database,
      source: "default_recommendation",
      selectionSummary: labelsPicked.length
        ? [...new Set(labelsPicked)]
        : ["I don't know"],
    };
  }

  const layers = buildLayersFromConcrete(concrete);

  return {
    frontend: layers.frontend,
    backend: layers.backend,
    database: DEFAULT_TECH_STACK.database,
    source: "user_selection",
    selectionSummary: [...new Set(labelsPicked)],
  };
}
