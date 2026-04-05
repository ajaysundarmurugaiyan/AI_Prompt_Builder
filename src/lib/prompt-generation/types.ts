export type PromptKind =
  | "product_understanding"
  | "system_architecture"
  | "frontend_ui"
  | "backend_api"
  | "ai_ide_execution";

export type GeneratedPrompt = {
  id: PromptKind;
  title: string;
  body: string;
};

/** Exactly five prompts in product order. */
export type PromptPack = {
  generatedAtIso: string;
  prompts: [GeneratedPrompt, GeneratedPrompt, GeneratedPrompt, GeneratedPrompt, GeneratedPrompt];
};
