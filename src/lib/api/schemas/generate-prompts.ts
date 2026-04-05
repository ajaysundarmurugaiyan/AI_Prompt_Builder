import { z } from "zod";

const MAX_TEXT = 16_000;
const MAX_QUESTIONS = 24;
const MAX_OPTION_LABEL = 200;

export const PROMPT_IDS = [
  "product_understanding",
  "system_architecture",
  "frontend_ui",
  "backend_api",
  "ai_ide_execution",
] as const;

export type PromptId = (typeof PROMPT_IDS)[number];

export const promptKindSchema = z.enum(PROMPT_IDS);

export const questionOptionSchema = z.object({
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(MAX_OPTION_LABEL),
});

export const generatedQuestionSchema = z.object({
  id: z.string().min(1).max(64),
  category: z.string().min(1).max(200),
  prompt: z.string().min(1).max(2000),
  type: z.enum(["single", "multi"]),
  options: z.array(questionOptionSchema).min(2).max(24),
});

export const userInputSchema = z.object({
  useCase: z.string().max(MAX_TEXT),
  problemDescription: z.string().max(MAX_TEXT),
  challenges: z.string().max(MAX_TEXT),
});

export const techStackSchema = z.object({
  frontend: z.string().min(1).max(500),
  backend: z.string().min(1).max(500),
  database: z.string().min(1).max(500),
  source: z.enum(["user_selection", "default_recommendation"]),
  selectionSummary: z.array(z.string().max(200)).max(32),
});

export const paletteColorsSchema = z.object({
  primary: z.string().min(1).max(32),
  secondary: z.string().min(1).max(32),
  background: z.string().min(1).max(32),
  text: z.string().min(1).max(32),
});

export const colorPaletteSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  colors: paletteColorsSchema,
});

const answerValueSchema = z.union([
  z.string().max(200),
  z.array(z.string().max(200)).max(32),
]);

export const generatePromptsRequestSchema = z
  .object({
    userInput: userInputSchema,
    questions: z.array(generatedQuestionSchema).min(1).max(MAX_QUESTIONS),
    answers: z.record(z.string(), answerValueSchema),
    techStack: techStackSchema,
    colorPalette: colorPaletteSchema,
  })
  .superRefine((data, ctx) => {
    const u = data.userInput;
    if (!u.useCase.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "useCase is required",
        path: ["userInput", "useCase"],
      });
    }
    if (!u.problemDescription.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "problemDescription is required",
        path: ["userInput", "problemDescription"],
      });
    }

    for (const q of data.questions) {
      const a = data.answers[q.id];
      if (a === undefined) {
        ctx.addIssue({
          code: "custom",
          message: `Missing answer for question "${q.id}"`,
          path: ["answers", q.id],
        });
        continue;
      }
      if (q.type === "single") {
        if (typeof a !== "string" || !a.trim()) {
          ctx.addIssue({
            code: "custom",
            message: `Invalid single-select answer for "${q.id}"`,
            path: ["answers", q.id],
          });
        }
      } else if (!Array.isArray(a) || a.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: `Invalid multi-select answer for "${q.id}"`,
          path: ["answers", q.id],
        });
      }
    }

    const qIds = new Set(data.questions.map((q) => q.id));
    for (const key of Object.keys(data.answers)) {
      if (!qIds.has(key)) {
        ctx.addIssue({
          code: "custom",
          message: `Unexpected answer key "${key}"`,
          path: ["answers", key],
        });
      }
    }
  });

export type GeneratePromptsRequest = z.infer<typeof generatePromptsRequestSchema>;

export const aiPromptItemSchema = z.object({
  id: promptKindSchema,
  title: z.string().min(1).max(300),
  body: z.string().min(80).max(120_000),
});

export const groqJsonResponseSchema = z.object({
  prompts: z.array(aiPromptItemSchema).length(5),
});

export type GroqJsonResponse = z.infer<typeof groqJsonResponseSchema>;
