import { PromptBuilderFlow } from "@/components/prompt-builder";

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-12 py-8 sm:gap-14 sm:py-12">
      <header className="text-center">
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          AI Prompt Builder
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-pretty text-base text-muted sm:text-lg">
          Turn your idea into structured AI prompts
        </p>
      </header>

      <PromptBuilderFlow />
    </div>
  );
}
