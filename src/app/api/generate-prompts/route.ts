import {
  extractJsonObject,
  normalizePromptPackFromGroq,
} from "@/lib/api/normalizePromptPack";
import {
  generatePromptsRequestSchema,
  groqJsonResponseSchema,
} from "@/lib/api/schemas/generate-prompts";
import {
  buildAiUserMessage,
  GROQ_SYSTEM_PROMPT,
} from "@/lib/prompt-generation/buildAiUserMessage";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/db/supabase";

export const maxDuration = 120;

type GroqErrorResponse = {
  error?: { message?: string };
};

type GroqChatResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
};

export async function POST(req: Request) {
  try {
    const session = await auth();
    let apiKey: string | undefined;
    let userId: string | null = null;

    // First, try to get user's personal API key
    if (session?.user?.email) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id, groq_api_key')
        .eq('email', session.user.email)
        .single();
      
      if (user?.groq_api_key) {
        apiKey = user.groq_api_key;
      }
      userId = user?.id || null;
    }

    // Fallback to environment variable if no user key
    if (!apiKey) {
      apiKey = process.env.GROQ_PROMPT_API_KEY || process.env.GROQ_API_KEY;
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

    const validated = generatePromptsRequestSchema.safeParse(body);
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

    const payload = {
      ...validated.data,
      userInput: {
        useCase: validated.data.userInput.useCase.trim(),
        problemDescription:
          validated.data.userInput.problemDescription.trim(),
        challenges: validated.data.userInput.challenges.trim(),
      },
    };

    const model =
      process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile";
    const userMessage = buildAiUserMessage(payload);
    const useJsonMode =
      (process.env.GROQ_JSON_MODE ?? "true").toLowerCase() !== "false";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 110_000);

    const completionBody: Record<string, unknown> = {
      model,
      messages: [
        { role: "system", content: GROQ_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.55,
      max_tokens: 8000,
    };
    if (useJsonMode) {
      completionBody.response_format = { type: "json_object" };
    }

    let groqRes: Response;
    try {
      groqRes = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(completionBody),
          signal: controller.signal,
        },
      );
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
          { 
            error: "Your Groq API key has reached its limit. Please update your key in Account Settings.", 
            code: "LIMIT_REACHED" 
          },
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

    const promptsParsed = groqJsonResponseSchema.safeParse(parsedJson);
    if (!promptsParsed.success) {
      return NextResponse.json(
        {
          error: "Model output did not match the expected schema.",
          code: "MODEL_SCHEMA_MISMATCH",
          details: promptsParsed.error.flatten(),
        },
        { status: 502 },
      );
    }

    const generatedAtIso = new Date().toISOString();
    const pack = normalizePromptPackFromGroq(
      promptsParsed.data,
      generatedAtIso,
    );

    if (!pack) {
      return NextResponse.json(
        {
          error: "Model omitted required prompt ids.",
          code: "MODEL_ORDER_MISMATCH",
        },
        { status: 502 },
      );
    }

    // SAVE TO HISTORY IF AUTHENTICATED
    if (userId) {
      const { error: historyError } = await supabaseAdmin.from('prompt_history').insert({
        user_id: userId,
        use_case: payload.userInput.useCase,
        problem_description: payload.userInput.problemDescription,
        challenges: payload.userInput.challenges,
        generated_pack: pack,
      });

      if (historyError) {
        console.error('Failed to save to history:', historyError);
      } else {
        console.log('✅ Saved to history for user:', userId);
      }
    }

    return NextResponse.json({ pack });
  } catch (e) {
    console.error("[generate-prompts]", e);
    return NextResponse.json(
      { error: "Unexpected server error.", code: "INTERNAL" },
      { status: 500 },
    );
  }
}
