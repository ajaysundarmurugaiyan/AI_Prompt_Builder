/** Matches `GeneratedQuestion.id` for the tech-stack multi-select in the questionnaire. */
export const STACK_QUESTION_ID = "stack";

export const DEFAULT_TECH_STACK = {
  frontend: "Next.js",
  backend: "Serverless (Firebase or Supabase)",
  database: "Managed DB",
} as const;

export type StackOptionId =
  | "react"
  | "next"
  | "vue"
  | "node"
  | "python"
  | "dotnet"
  | "other"
  | "unknown";
