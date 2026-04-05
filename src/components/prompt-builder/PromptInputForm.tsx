"use client";

import { useCallback, useState } from "react";
import type { PromptInputState } from "./types";

export type { PromptInputState };

const initialState: PromptInputState = {
  useCase: "",
  problemDescription: "",
  challenges: "",
};

type FieldErrors = Partial<
  Record<"useCase" | "problemDescription" | "challenges", string>
>;

/** Aligned with API Zod limits. */
const MAX_FIELD_LEN = 16_000;

function trimOrEmpty(value: string) {
  return value.trim();
}

function mergeInitial(
  override?: Partial<PromptInputState>,
): PromptInputState {
  return { ...initialState, ...override };
}

type PromptInputFormProps = {
  initialValues?: Partial<PromptInputState>;
  onValidSubmit?: (values: PromptInputState) => void;
};

export function PromptInputForm({
  initialValues,
  onValidSubmit,
}: PromptInputFormProps) {
  const [values, setValues] = useState<PromptInputState>(() =>
    mergeInitial(initialValues),
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const update =
    (field: keyof PromptInputState) =>
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValues((prev) => ({ ...prev, [field]: e.target.value }));
        setSubmitSuccess(false);
        if (field === "useCase" || field === "problemDescription" || field === "challenges") {
          setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
      };

  const validate = useCallback((): boolean => {
    const next: FieldErrors = {};
    if (!trimOrEmpty(values.useCase)) {
      next.useCase = "Describe your use case.";
    } else if (values.useCase.length > MAX_FIELD_LEN) {
      next.useCase = `Keep this under ${MAX_FIELD_LEN.toLocaleString()} characters.`;
    }
    if (!trimOrEmpty(values.problemDescription)) {
      next.problemDescription = "Describe the problem you are solving.";
    } else if (values.problemDescription.length > MAX_FIELD_LEN) {
      next.problemDescription = `Keep this under ${MAX_FIELD_LEN.toLocaleString()} characters.`;
    }
    if (values.challenges.length > MAX_FIELD_LEN) {
      next.challenges = `Keep this under ${MAX_FIELD_LEN.toLocaleString()} characters.`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [values.useCase, values.problemDescription, values.challenges]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) {
      setSubmitSuccess(false);
      return;
    }
    if (onValidSubmit) {
      onValidSubmit(values);
      return;
    }
    setSubmitSuccess(true);
  };

  return (
    <div className="w-full max-w-7xl">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 sm:p-8"
        noValidate
      >
        <div className="space-y-6">
          <div>
            <label
              htmlFor="use-case"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Use case
              <span className="ml-1 text-red-600 dark:text-red-400" aria-hidden>
                *
              </span>
            </label>
            <textarea
              id="use-case"
              name="useCase"
              value={values.useCase}
              onChange={update("useCase")}
              rows={7}
              maxLength={MAX_FIELD_LEN}
              placeholder="What are you trying to accomplish with AI?"
              aria-invalid={Boolean(errors.useCase)}
              aria-describedby={errors.useCase ? "use-case-error" : undefined}
              className={`block w-full resize-y rounded-xl border bg-zinc-50/80 px-4 py-3 text-base text-foreground placeholder:text-zinc-400 transition-[box-shadow,border-color] focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400/30 dark:bg-zinc-900/50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/25 ${errors.useCase
                  ? "border-red-500 dark:border-red-500"
                  : "border-zinc-200 dark:border-zinc-700"
                }`}
            />
            {errors.useCase ? (
              <p
                id="use-case-error"
                className="mt-1.5 text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {errors.useCase}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="problem-description"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Problem description
              <span className="ml-1 text-red-600 dark:text-red-400" aria-hidden>
                *
              </span>
            </label>
            <textarea
              id="problem-description"
              name="problemDescription"
              value={values.problemDescription}
              onChange={update("problemDescription")}
              rows={7}
              maxLength={MAX_FIELD_LEN}
              placeholder="What problem or need does this address?"
              aria-invalid={Boolean(errors.problemDescription)}
              aria-describedby={
                errors.problemDescription ? "problem-description-error" : undefined
              }
              className={`block w-full resize-y rounded-xl border bg-zinc-50/80 px-4 py-3 text-base text-foreground placeholder:text-zinc-400 transition-[box-shadow,border-color] focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400/30 dark:bg-zinc-900/50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/25 ${errors.problemDescription
                  ? "border-red-500 dark:border-red-500"
                  : "border-zinc-200 dark:border-zinc-700"
                }`}
            />
            {errors.problemDescription ? (
              <p
                id="problem-description-error"
                className="mt-1.5 text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {errors.problemDescription}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="challenges"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Challenges
              <span className="ml-1 font-normal text-zinc-500 dark:text-zinc-400">
                (optional)
              </span>
            </label>
            <textarea
              id="challenges"
              name="challenges"
              value={values.challenges}
              onChange={update("challenges")}
              rows={5}
              maxLength={MAX_FIELD_LEN}
              placeholder="Constraints, risks, or blockers worth mentioning…"
              aria-invalid={Boolean(errors.challenges)}
              aria-describedby={
                errors.challenges ? "challenges-error" : undefined
              }
              className={`block w-full resize-y rounded-xl border bg-zinc-50/80 px-4 py-3 text-base text-foreground placeholder:text-zinc-400 transition-[box-shadow,border-color] focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400/30 dark:bg-zinc-900/50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/25 ${errors.challenges
                  ? "border-red-500 dark:border-red-500"
                  : "border-zinc-200 dark:border-zinc-700"
                }`}
            />
            {errors.challenges ? (
              <p
                id="challenges-error"
                className="mt-1.5 text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {errors.challenges}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {!onValidSubmit && submitSuccess ? (
            <p
              className="text-sm text-emerald-700 dark:text-emerald-400"
              role="status"
              aria-live="polite"
            >
              Input saved — ready for the next step.
            </p>
          ) : (
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              <span className="text-red-600 dark:text-red-400">*</span> Required
              fields
            </span>
          )}
          <button
            type="submit"
            className="w-full rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-950 sm:w-auto"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
