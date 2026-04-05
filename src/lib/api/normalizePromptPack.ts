import type { PromptPack } from "@/lib/prompt-generation";
import type { GroqJsonResponse } from "./schemas/generate-prompts";
import { PROMPT_IDS } from "./schemas/generate-prompts";

const ORDER = PROMPT_IDS;

export function normalizePromptPackFromGroq(
  parsed: GroqJsonResponse,
  generatedAtIso: string,
): PromptPack | null {
  const byId = new Map(parsed.prompts.map((p) => [p.id, p]));
  const ordered = ORDER.map((id) => byId.get(id));
  if (ordered.some((p) => !p)) {
    return null;
  }
  return {
    generatedAtIso,
    prompts: ordered as PromptPack["prompts"],
  };
}

/**
 * Attempt to recover JSON from models that wrap output in markdown fences.
 */
export function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(trimmed);
  const inner = (fence ? fence[1]?.trim() : trimmed) ?? trimmed;
  try {
    return JSON.parse(inner);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("Could not parse JSON from model output");
  }
}
