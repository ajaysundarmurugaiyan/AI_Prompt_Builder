export type PromptInputState = {
  useCase: string;
  problemDescription: string;
  challenges: string;
};

export type QuestionType = "single" | "multi";

export type QuestionOption = {
  id: string;
  label: string;
};

export type GeneratedQuestion = {
  id: string;
  category: string;
  prompt: string;
  helper?: string;
  type: QuestionType;
  options: QuestionOption[];
};

export type AnswersState = Record<string, string | string[]>;
