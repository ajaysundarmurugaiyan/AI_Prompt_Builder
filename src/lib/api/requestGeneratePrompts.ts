import {
  generatePromptsRequestSchema,
  type GeneratePromptsRequest,
} from "@/lib/api/schemas/generate-prompts";
import type { PromptPack } from "@/lib/prompt-generation";

export type ApiErrorJson = {
  error: string;
  code?: string;
  details?: unknown;
};

async function parsePromptPackResponse(
  res: Response,
  text: string,
): Promise<PromptPack> {
  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!res.ok) {
    const err = json as ApiErrorJson;
    const error = new Error(err.error || `Request failed (${res.status})`);
    (error as any).code = err.code;
    
    // Special handling for rate limit errors
    if (res.status === 429 || err.code === "LIMIT_REACHED") {
      (error as any).code = "LIMIT_REACHED";
      error.message = err.error || "Your Groq API key has reached its rate limit. Please update your API key in Account Settings or wait a few minutes.";
    }
    
    // Special handling for missing API key
    if (res.status === 503 && err.code === "MISSING_API_KEY") {
      error.message = "Groq API key is not configured. Please add your API key in Account Settings.";
    }
    
    throw error;
  }

  const data = json as { pack?: PromptPack };
  if (
    !data.pack ||
    !Array.isArray(data.pack.prompts) ||
    data.pack.prompts.length !== 5
  ) {
    throw new Error("The server response was missing prompt data.");
  }

  return data.pack;
}

/** Validates then calls the API (e.g. from forms). */
export async function requestGeneratePrompts(
  payload: unknown,
  signal?: AbortSignal,
): Promise<PromptPack> {
  const checked = generatePromptsRequestSchema.safeParse(payload);
  if (!checked.success) {
    const first = checked.error.issues[0];
    throw new Error(first?.message ?? "Invalid input for prompt generation.");
  }

  const res = await fetch("/api/generate-prompts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(checked.data),
    signal,
  });

  const text = await res.text();
  return parsePromptPackResponse(res, text);
}

/** Skips re-validation when the payload was already checked with Zod. */
export async function requestGeneratePromptsValidated(
  data: GeneratePromptsRequest,
  signal?: AbortSignal,
): Promise<PromptPack> {
  const res = await fetch("/api/generate-prompts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    signal,
  });

  const text = await res.text();
  return parsePromptPackResponse(res, text);
}
