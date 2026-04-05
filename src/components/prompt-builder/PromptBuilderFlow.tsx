"use client";

import { usePromptPack } from "@/context/prompt-pack-context";
import { useCallback, useState } from "react";
import { DynamicQuestionnaire } from "./DynamicQuestionnaire";
import { PromptInputForm } from "./PromptInputForm";
import type { GeneratedQuestion, PromptInputState } from "./types";

type Phase = "input" | "questions";

export function PromptBuilderFlow() {
  const { clearPromptPack } = usePromptPack();
  const [phase, setPhase] = useState<Phase>("input");
  const [analyzing, setAnalyzing] = useState(false);
  const [inputVisitId, setInputVisitId] = useState(0);
  const [savedInput, setSavedInput] = useState<PromptInputState | null>(null);
  const [analysisSummary, setAnalysisSummary] = useState("");
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleValidSubmit = useCallback(async (values: PromptInputState) => {
    setAnalyzing(true);
    setAnalysisSummary("");
    setError(null);

    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: values }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        
        if (res.status === 429) {
          throw new Error(
            errorData.error || 
            "Your Groq API key has reached its rate limit. Please wait a few minutes or update your API key in Account Settings."
          );
        }
        
        if (res.status === 503 && errorData.code === "MISSING_API_KEY") {
          throw new Error(
            "Groq API key is not configured. Please add your API key in Account Settings to continue."
          );
        }
        
        throw new Error(errorData.error || "Failed to generate questions. Please try again.");
      }
      
      const data = await res.json();
      setQuestions(data.questions);
      setAnalysisSummary(data.summary || "Here are your tailored questions:");
      setSavedInput(values);
      setPhase("questions");
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Error generating questions. Please try again.";
      setError(errorMessage);
      setSavedInput(values); // Save input so the user doesn't lose their work
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const handleBackToInput = useCallback(() => {
    clearPromptPack();
    setPhase("input");
    setInputVisitId((n) => n + 1);
  }, [clearPromptPack]);

  return (
    <div className="flex w-full flex-col items-center">
      {phase === "input" ? (
        analyzing ? (
          <div
            className="flex w-full max-w-7xl flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white px-8 py-20 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <div
              className="size-10 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100"
              aria-hidden
            />
            <p className="mt-6 text-sm font-medium text-foreground">
              Analyzing your brief…
            </p>
            <p className="mt-2 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
              Preparing follow-up questions tailored to your brief.
            </p>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900/50 shadow-sm animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}
            <PromptInputForm
              key={inputVisitId}
              initialValues={savedInput ?? undefined}
              onValidSubmit={handleValidSubmit}
            />
          </div>
        )
      ) : savedInput ? (
        <DynamicQuestionnaire
          userInput={savedInput}
          questions={questions}
          analysisSummary={analysisSummary}
          onBack={handleBackToInput}
        />
      ) : null}
    </div>
  );
}
