import type { ColorPalette } from "@/lib/color-palettes";
import type { ResolvedTechStack } from "@/lib/tech-stack";
import type { AnswersState, GeneratedQuestion, PromptInputState } from "@/components/prompt-builder/types";

function answerLabel(
  q: GeneratedQuestion,
  value: string | string[] | undefined,
): string {
  if (value === undefined || value === "") {
    return "(not answered)";
  }
  if (q.type === "single") {
    const id = typeof value === "string" ? value : "";
    return q.options.find((o) => o.id === id)?.label ?? id;
  }
  const ids = Array.isArray(value) ? value : [];
  if (ids.length === 0) return "(not answered)";
  return ids
    .map((id) => q.options.find((o) => o.id === id)?.label ?? id)
    .join(", ");
}

export function formatUserBrief(input: PromptInputState): string {
  const parts = [
    `## Use case\n${input.useCase.trim() || "(empty)"}`,
    `## Problem description\n${input.problemDescription.trim() || "(empty)"}`,
  ];
  if (input.challenges.trim()) {
    parts.push(`## Challenges / constraints\n${input.challenges.trim()}`);
  }
  return parts.join("\n\n");
}

export function formatQASection(
  questions: GeneratedQuestion[],
  answers: AnswersState,
): string {
  return questions
    .map((q) => {
      const a = answerLabel(q, answers[q.id]);
      return `### ${q.category}\n- **Question:** ${q.prompt}\n- **Answer:** ${a}`;
    })
    .join("\n\n");
}

export function formatTechStack(stack: ResolvedTechStack): string {
  return [
    `- **Frontend:** ${stack.frontend}`,
    `- **Backend:** ${stack.backend}`,
    `- **Database:** ${stack.database}`,
    `- **Resolution:** ${stack.source === "default_recommendation" ? "Default recommendation (user did not specify concrete stack choices)" : "Derived from user selections"}`,
    `- **Stack selections noted:** ${stack.selectionSummary.length ? stack.selectionSummary.join("; ") : "(none)"}`,
  ].join("\n");
}

export function formatColorPalette(palette: ColorPalette): string {
  const c = palette.colors;
  return [
    `- **Palette name:** ${palette.name} (${palette.id})`,
    `- **Intent:** ${palette.description}`,
    `- **Primary:** \`${c.primary}\``,
    `- **Secondary:** \`${c.secondary}\``,
    `- **Background:** \`${c.background}\``,
    `- **Text:** \`${c.text}\``,
  ].join("\n");
}
