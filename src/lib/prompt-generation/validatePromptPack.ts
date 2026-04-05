import { PROMPT_IDS } from "@/lib/api/schemas/generate-prompts";
import type { PromptPack } from "./types";

export type PromptPackValidation = {
  ok: boolean;
  checks: Array<{ id: string; pass: boolean; detail: string }>;
};

/**
 * Heuristic checks that the pack is structurally sound and content looks usable.
 */
export function validatePromptPack(pack: PromptPack): PromptPackValidation {
  const checks: PromptPackValidation["checks"] = [];

  const ids = new Set(pack.prompts.map((p) => p.id));
  for (const expected of PROMPT_IDS) {
    const pass = ids.has(expected);
    checks.push({
      id: `id:${expected}`,
      pass,
      detail: pass
        ? `Prompt "${expected}" is present.`
        : `Missing prompt id "${expected}".`,
    });
  }

  for (const p of pack.prompts) {
    const len = p.body.trim().length;
    const pass = len >= 200;
    checks.push({
      id: `body-length:${p.id}`,
      pass,
      detail: pass
        ? `"${p.title}" body length OK (${len.toLocaleString()} chars).`
        : `"${p.title}" body looks short (${len} chars)—may need regeneration.`,
    });

    const titleOk = p.title.trim().length >= 3;
    checks.push({
      id: `title:${p.id}`,
      pass: titleOk,
      detail: titleOk
        ? `Title present for ${p.id}.`
        : `Title missing or too short for ${p.id}.`,
    });
  }

  const frontend = pack.prompts.find((p) => p.id === "frontend_ui");
  if (frontend) {
    const b = frontend.body.toLowerCase();
    const hasDark = /\bdark\b|dark mode|theme/i.test(b);
    const hasLight = /\blight\b|light mode/i.test(b);
    const hasScreen = /screen|page inventory|wireframe|view/i.test(b);
    checks.push({
      id: "frontend:dark-light",
      pass: hasDark && hasLight,
      detail:
        hasDark && hasLight
          ? "Frontend prompt mentions light and dark theming."
          : "Frontend prompt should explicitly cover light and dark modes.",
    });
    checks.push({
      id: "frontend:screens",
      pass: hasScreen,
      detail: hasScreen
        ? "Frontend prompt references screens or UI surfaces."
        : "Consider ensuring screens / page inventory are described.",
    });
  }

  const ok = checks.every((c) => c.pass);

  return { ok, checks };
}
