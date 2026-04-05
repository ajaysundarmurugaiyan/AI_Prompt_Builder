import { extractJsonObject } from "@/lib/api/normalizePromptPack";
import {
  generateQuestionsRequestSchema,
  generateQuestionsResponseSchema,
} from "@/lib/api/schemas/generate-questions";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/db/supabase";

export const maxDuration = 60;

type GroqErrorResponse = {
  error?: { message?: string };
};

type GroqChatResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
};

const SYSTEM_PROMPT = `You are a Senior Product Manager gathering requirements for a new software application.
Given a user's initial project brief, your goal is to generate 4-6 specific, dynamic, and highly-tailored multiple-choice (or single-choice) questions. 
These questions must help clarify the system's architecture, design constraints, technical stack, or product direction based on the provided context.
DO NOT use generic, repeating boilerplate questions for every user. The questions must change based on what the user needs in their application.

Return a JSON payload with exactly this shape:
{
  "summary": "A 1-sentence summary of what you understood from the brief.",
  "questions": [
    {
      "id": "short-unique-id",
      "category": "Broad Category (e.g. LLM Strategy, Mobile Push, Scale, etc.)",
      "prompt": "The specific follow-up question text",
      "type": "single", 
      "options": [
        { "id": "option-1", "label": "Label 1" },
        { "id": "option-2", "label": "Label 2" }
      ]
    }
  ]
}
Note: "type" must be either "single" or "multi". Let the options be specific and actionable.`;

export async function POST(req: Request) {
  try {
    const session = await auth();
    let apiKey: string | undefined;

    // First, try to get user's personal API key
    if (session?.user?.email) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('groq_api_key')
        .eq('email', session.user.email)
        .single();
      
      if (user?.groq_api_key) {
        apiKey = user.groq_api_key;
      }
    }

    // Fallback to environment variable if no user key
    if (!apiKey) {
      apiKey = process.env.GROQ_TEXT_API_KEY || process.env.GROQ_API_KEY;
    }

    if (!apiKey?.trim()) {
      return NextResponse.json(
        {
          error:
            "Groq API is not configured. Please add your API key in Account Settings.",
          code: "MISSING_API_KEY",
        },
        { status: 503 },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Request body must be valid JSON.", code: "INVALID_JSON" },
        { status: 400 },
      );
    }

    const validated = generateQuestionsRequestSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Request validation failed.",
          code: "VALIDATION_ERROR",
          details: validated.error.flatten(),
        },
        { status: 422 },
      );
    }

    const { useCase, problemDescription, challenges } = validated.data.userInput;
    const userMessage = `Use Case: ${useCase}\nProblem Description: ${problemDescription}\nChallenges: ${challenges}`;

    const model = process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile";
    const useJsonMode = (process.env.GROQ_JSON_MODE ?? "true").toLowerCase() !== "false";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 50_000);

    const completionBody: Record<string, unknown> = {
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.65,
      max_tokens: 4000,
    };
    
    if (useJsonMode) {
      completionBody.response_format = { type: "json_object" };
    }

    let groqRes: Response;
    try {
      groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(completionBody),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === "AbortError") {
        return NextResponse.json(
          { error: "Groq request timed out.", code: "TIMEOUT" },
          { status: 504 },
        );
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }

    const rawText = await groqRes.text();

    if (!groqRes.ok) {
      if (groqRes.status === 429) {
        return NextResponse.json(
          { error: "Groq API key limit reached.", code: "LIMIT_REACHED" },
          { status: 429 },
        );
      }

      let message = `Groq request failed (${groqRes.status}).`;
      try {
        const parsed = JSON.parse(rawText) as GroqErrorResponse;
        if (parsed.error?.message) {
          message = parsed.error.message;
        }
      } catch (e) {
        /* ignore */
      }
      return NextResponse.json(
        { error: message, code: "GROQ_HTTP_ERROR", status: groqRes.status },
        { status: 502 },
      );
    }

    let groqJson: GroqChatResponse;
    try {
      groqJson = JSON.parse(rawText) as GroqChatResponse;
    } catch (e) {
      return NextResponse.json(
        { error: "Groq returned non-JSON.", code: "GROQ_BAD_PAYLOAD" },
        { status: 502 },
      );
    }

    const content = groqJson.choices?.[0]?.message?.content;
    if (!content?.trim()) {
      return NextResponse.json(
        { error: "The model returned an empty response.", code: "EMPTY_RESPONSE" },
        { status: 502 },
      );
    }

    let parsedJson: unknown;
    try {
      parsedJson = extractJsonObject(content);
    } catch (e) {
      return NextResponse.json(
        {
          error: "The model response was not valid JSON.",
          code: "MODEL_JSON_PARSE",
        },
        { status: 502 },
      );
    }

    const questionsParsed = generateQuestionsResponseSchema.safeParse(parsedJson);
    if (!questionsParsed.success) {
      return NextResponse.json(
        {
          error: "Model output did not match the expected schema.",
          code: "MODEL_SCHEMA_MISMATCH",
          details: questionsParsed.error.flatten(),
        },
        { status: 502 },
      );
    }

    // Always inject the tech-stack question as the last question
    const STACK_QUESTION = {
      id: "stack",
      category: "Technology Stack",
      prompt: "Which technologies do you want to use for this project?",
      type: "multi" as const,
      options: [
        { id: "next", label: "Next.js (Frontend)" },
        { id: "react", label: "React (Frontend)" },
        { id: "vue", label: "Vue (Frontend)" },
        { id: "node", label: "Node.js (Backend)" },
        { id: "python", label: "Python (Backend)" },
        { id: "dotnet", label: ".NET (Backend)" },
        { id: "other", label: "Other / Custom Stack" },
        { id: "unknown", label: "I don't know yet" },
      ],
    };

    const alreadyHasStack = questionsParsed.data.questions.some(
      (q) => q.id === "stack",
    );
    const questions = alreadyHasStack
      ? questionsParsed.data.questions
      : [...questionsParsed.data.questions, STACK_QUESTION];

    return NextResponse.json({
      questions,
      summary: questionsParsed.data.summary,
    });
  } catch (e) {
    console.error("[generate-questions]", e);
    return NextResponse.json(
      { error: "Unexpected server error.", code: "INTERNAL" },
      { status: 500 },
    );
  }
}
