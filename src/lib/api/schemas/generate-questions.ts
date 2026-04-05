import { z } from "zod";
import { generatedQuestionSchema, userInputSchema } from "./generate-prompts";

export const generateQuestionsRequestSchema = z.object({
  userInput: userInputSchema,
});

export type GenerateQuestionsRequest = z.infer<typeof generateQuestionsRequestSchema>;

export const generateQuestionsResponseSchema = z.object({
  questions: z.array(generatedQuestionSchema).min(1).max(10),
  summary: z.string().optional(),
});

export type GenerateQuestionsResponse = z.infer<typeof generateQuestionsResponseSchema>;
