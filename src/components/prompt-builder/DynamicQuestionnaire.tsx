"use client";

import {
  DEFAULT_PALETTE_ID,
  getPaletteById,
} from "@/lib/color-palettes";
import { generatePromptsRequestSchema } from "@/lib/api/schemas/generate-prompts";
import { usePromptPack } from "@/context/prompt-pack-context";
import { requestGeneratePromptsValidated } from "@/lib/api/requestGeneratePrompts";
import { buildPromptPack } from "@/lib/prompt-generation";
import { STACK_QUESTION_ID, resolveTechStack } from "@/lib/tech-stack";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ColorPalettePicker } from "./ColorPalettePicker";
import { GeneratedPromptsPanel } from "./GeneratedPromptsPanel";
import { TechStackSummary } from "./TechStackSummary";
import { celebrateGeneration } from "@/lib/utils/celebrate";
import type {
  AnswersState,
  GeneratedQuestion,
  PromptInputState,
} from "./types";

export type QuestionViewMode = "step" | "list";

type Props = {
  userInput: PromptInputState;
  questions: GeneratedQuestion[];
  analysisSummary: string;
  onBack: () => void;
};

function emptyAnswer(q: GeneratedQuestion): string | string[] {
  return q.type === "single" ? "" : [];
}

function isAbortError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "name" in e &&
    (e as { name: string }).name === "AbortError"
  );
}

function isAnswered(q: GeneratedQuestion, answers: AnswersState): boolean {
  const v = answers[q.id];
  if (q.type === "single") {
    return typeof v === "string" && v.length > 0;
  }
  return Array.isArray(v) && v.length > 0;
}

export function DynamicQuestionnaire({
  userInput,
  questions,
  analysisSummary,
  onBack,
}: Props) {
  const { pack: promptPack, setPromptPack } = usePromptPack();

  const [viewMode, setViewMode] = useState<QuestionViewMode>("step");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersState>(() => {
    const initial: AnswersState = {};
    for (const q of questions) {
      initial[q.id] = emptyAnswer(q);
    }
    return initial;
  });

  const [selectedPaletteId, setSelectedPaletteId] =
    useState<string>(DEFAULT_PALETTE_ID);

  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [generateError, setGenerateError] = useState<{ message: string; code?: string } | null>(null);
  const generateAbortRef = useRef<AbortController | null>(null);

  const stackQuestion = useMemo(
    () => questions.find((q) => q.id === STACK_QUESTION_ID),
    [questions],
  );

  const resolvedTechStack = useMemo(() => {
    if (!stackQuestion) return null;
    const raw = answers[stackQuestion.id];
    const ids = Array.isArray(raw) ? raw : [];
    return resolveTechStack(ids);
  }, [answers, stackQuestion]);

  const techStackForBuild = useMemo(
    () => resolvedTechStack ?? resolveTechStack([]),
    [resolvedTechStack],
  );

  const colorPaletteForBuild = useMemo(
    () =>
      getPaletteById(selectedPaletteId) ??
      getPaletteById(DEFAULT_PALETTE_ID)!,
    [selectedPaletteId],
  );

  const answeredCount = useMemo(
    () => questions.filter((q) => isAnswered(q, answers)).length,
    [questions, answers],
  );

  const allQuestionsAnswered = answeredCount === questions.length;

  const buildGenerationPayload = useCallback(
    () => ({
      userInput: {
        useCase: userInput.useCase.trim(),
        problemDescription: userInput.problemDescription.trim(),
        challenges: userInput.challenges.trim(),
      },
      questions,
      answers,
      techStack: techStackForBuild,
      colorPalette: colorPaletteForBuild,
    }),
    [
      answers,
      colorPaletteForBuild,
      questions,
      techStackForBuild,
      userInput.challenges,
      userInput.problemDescription,
      userInput.useCase,
    ],
  );

  const handleGeneratePrompts = useCallback(async () => {
    if (!allQuestionsAnswered || isGeneratingPrompts) return;
    const payload = buildGenerationPayload();
    const pre = generatePromptsRequestSchema.safeParse(payload);
    if (!pre.success) {
      setGenerateError({
        message: pre.error.issues[0]?.message ??
          "Some answers are invalid. Please review the questionnaire.",
      });
      return;
    }

    generateAbortRef.current?.abort();
    const ac = new AbortController();
    generateAbortRef.current = ac;
    setIsGeneratingPrompts(true);
    setGenerateError(null);

    try {
      const pack = await requestGeneratePromptsValidated(pre.data, ac.signal);
      setPromptPack(pack);
      celebrateGeneration();
    } catch (e) {
      if (isAbortError(e)) {
        return;
      }
      const msg =
        e instanceof Error ? e.message : "Prompt generation failed unexpectedly.";
      setGenerateError({ message: msg, code: (e as any).code });
    } finally {
      setIsGeneratingPrompts(false);
    }
  }, [
    allQuestionsAnswered,
    buildGenerationPayload,
    isGeneratingPrompts,
    setPromptPack,
  ]);

  const handleTemplateFallback = useCallback(() => {
    if (!allQuestionsAnswered) return;
    setGenerateError(null);
    setPromptPack(
      buildPromptPack({
        userInput,
        questions,
        answers,
        techStack: techStackForBuild,
        colorPalette: colorPaletteForBuild,
      }),
    );
  }, [
    allQuestionsAnswered,
    answers,
    colorPaletteForBuild,
    questions,
    setPromptPack,
    techStackForBuild,
    userInput,
  ]);

  useEffect(() => {
    return () => generateAbortRef.current?.abort();
  }, []);

  useEffect(() => {
    setGenerateError(null);
  }, [answers]);

  const current = questions[stepIndex];
  const currentAnswered = current ? isAnswered(current, answers) : true;
  const isLastStep = stepIndex === questions.length - 1;

  const setSingle = useCallback((questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }, []);

  const toggleMulti = useCallback((questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const raw = prev[questionId];
      const currentList = Array.isArray(raw) ? [...raw] : [];
      const idx = currentList.indexOf(optionId);
      if (idx >= 0) {
        currentList.splice(idx, 1);
      } else {
        currentList.push(optionId);
      }
      return { ...prev, [questionId]: currentList };
    });
  }, []);

  const goNext = () => {
    if (stepIndex < questions.length - 1) {
      setStepIndex((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
    }
  };

  const jumpToStep = (index: number) => {
    setStepIndex(Math.max(0, Math.min(index, questions.length - 1)));
    setViewMode("step");
  };

  const renderQuestionBody = (q: GeneratedQuestion) => (
    <fieldset className="min-w-0 border-0 p-0">
      <legend className="sr-only">{q.prompt}</legend>
      {q.type === "single" ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {q.options.map((opt) => {
            const selected = answers[q.id] === opt.id;
            return (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-zinc-400 has-[:focus-visible]:ring-offset-2 dark:has-[:focus-visible]:ring-zinc-500 dark:has-[:focus-visible]:ring-offset-zinc-950 ${
                  selected
                    ? "border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-800"
                    : "border-zinc-200 bg-zinc-50/80 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900/40 dark:hover:border-zinc-600"
                }`}
              >
                <input
                  type="radio"
                  name={q.id}
                  value={opt.id}
                  checked={selected}
                  onChange={() => setSingle(q.id, opt.id)}
                  className="size-4 shrink-0 border-zinc-300 text-zinc-900 focus:ring-zinc-400 dark:border-zinc-600 dark:text-zinc-100 dark:focus:ring-zinc-500"
                />
                <span className="text-foreground">{opt.label}</span>
              </label>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {q.options.map((opt) => {
            const list = Array.isArray(answers[q.id]) ? answers[q.id] : [];
            const selected = list.includes(opt.id);
            return (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-zinc-400 has-[:focus-visible]:ring-offset-2 dark:has-[:focus-visible]:ring-zinc-500 dark:has-[:focus-visible]:ring-offset-zinc-950 ${
                  selected
                    ? "border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-800"
                    : "border-zinc-200 bg-zinc-50/80 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900/40 dark:hover:border-zinc-600"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleMulti(q.id, opt.id)}
                  className="size-4 shrink-0 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400 dark:border-zinc-600 dark:text-zinc-100 dark:focus:ring-zinc-500"
                />
                <span className="text-foreground">{opt.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </fieldset>
  );

  return (
    <div className="w-full max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Scoping questions
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            Refine your build
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {analysisSummary}
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Edit inputs
        </button>
      </div>

      <div
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 sm:p-8"
        role="region"
        aria-label="Questionnaire"
      >
        <div className="flex flex-col gap-4 border-b border-zinc-100 pb-6 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {answeredCount}/{questions.length} answered
            </span>
          </div>
          <div
            className="inline-flex rounded-xl border border-zinc-200 p-1 dark:border-zinc-700"
            role="group"
            aria-label="Display mode"
          >
            <button
              type="button"
              onClick={() => setViewMode("step")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "step"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:text-foreground dark:text-zinc-400"
              }`}
            >
              One at a time
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:text-foreground dark:text-zinc-400"
              }`}
            >
              All questions
            </button>
          </div>
        </div>

        {viewMode === "step" && current ? (
          <div className="pt-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
                role="progressbar"
                aria-valuenow={stepIndex + 1}
                aria-valuemin={1}
                aria-valuemax={questions.length}
                aria-label="Question progress"
              >
                <div
                  className="h-full rounded-full bg-zinc-900 transition-[width] duration-300 dark:bg-zinc-100"
                  style={{
                    width: `${((stepIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
              <span className="shrink-0 text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
                {stepIndex + 1} / {questions.length}
              </span>
            </div>

            <article>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {current.category}
                {current.type === "multi" ? (
                  <span className="ml-2 font-normal normal-case text-zinc-400 dark:text-zinc-500">
                    (multi-select)
                  </span>
                ) : null}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-foreground">
                {current.prompt}
              </h3>
              {current.helper ? (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {current.helper}
                </p>
              ) : null}
              {renderQuestionBody(current)}
            </article>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={goPrev}
                disabled={stepIndex === 0}
                className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors enabled:hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:enabled:hover:bg-zinc-900"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isLastStep) {
                    setViewMode("list");
                  } else {
                    goNext();
                  }
                }}
                disabled={!currentAnswered}
                className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {isLastStep ? "Review all" : "Next"}
              </button>
            </div>
          </div>
        ) : null}

        {viewMode === "list" ? (
          <ul className="mt-6 space-y-10">
            {questions.map((q, index) => (
              <li key={q.id}>
                <article className="rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex flex-col gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        {q.category}
                        {q.type === "multi" ? (
                          <span className="ml-2 font-normal normal-case text-zinc-400 dark:text-zinc-500">
                            (multi-select)
                          </span>
                        ) : null}
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-foreground">
                        {q.prompt}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => jumpToStep(index)}
                      className="shrink-0 self-start text-xs font-medium text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
                    >
                      Focus in step mode
                    </button>
                  </div>
                  <div className="px-4 pb-4 pt-2">{renderQuestionBody(q)}</div>
                </article>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {resolvedTechStack && stackQuestion ? (
        <TechStackSummary stack={resolvedTechStack} />
      ) : null}

      <ColorPalettePicker
        selectedId={selectedPaletteId}
        onSelect={setSelectedPaletteId}
      />

      <GeneratedPromptsPanel
        pack={promptPack}
        canGenerate={allQuestionsAnswered}
        isGenerating={isGeneratingPrompts}
        error={generateError}
        onDismissError={() => setGenerateError(null)}
        onGenerate={handleGeneratePrompts}
        onUseTemplateFallback={handleTemplateFallback}
      />
    </div>
  );
}
