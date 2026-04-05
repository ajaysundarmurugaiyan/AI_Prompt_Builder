import type { ColorPalette } from "@/lib/color-palettes";
import type { ResolvedTechStack } from "@/lib/tech-stack";
import type { AnswersState, GeneratedQuestion, PromptInputState } from "@/components/prompt-builder/types";
import {
  formatColorPalette,
  formatQASection,
  formatTechStack,
  formatUserBrief,
} from "./formatContext";
import type { GeneratedPrompt, PromptKind, PromptPack } from "./types";

export type PromptGenerationContext = {
  userInput: PromptInputState;
  questions: GeneratedQuestion[];
  answers: AnswersState;
  techStack: ResolvedTechStack;
  colorPalette: ColorPalette;
};

function platformHint(questions: GeneratedQuestion[], answers: AnswersState): string {
  const q = questions.find((x) => x.id === "platform");
  if (!q) return "Web-first (confirm with stakeholder).";
  const v = answers[q.id];
  const id = typeof v === "string" ? v : "";
  const label = q.options.find((o) => o.id === id)?.label ?? id;
  switch (id) {
    case "web":
      return "Primary surface: **Web** (responsive browser experience).";
    case "mobile":
      return "Primary surface: **Mobile** (native or hybrid—specify in output).";
    case "both":
      return "Surfaces: **Web + Mobile**—treat shared design system + platform-specific patterns.";
    default:
      return `Platform stance: **${label || "Unspecified"}**—propose a default and list open decisions.`;
  }
}

function buildProductUnderstanding(ctx: PromptGenerationContext): string {
  const brief = formatUserBrief(ctx.userInput);
  const qa = formatQASection(ctx.questions, ctx.answers);
  return `# Role
You are a **senior product strategist** partnering with an engineering team. You produce crisp, testable product clarity—no fluff.

# Source material (from the builder)

### Original brief
${brief}

### Scoped Q&A
${qa}

# Your task
Produce a **Product Understanding** document the whole team can align on before architecture or UI work starts.

## Required sections (use these headings)
1. **Problem statement** — One tight paragraph + bullet list of pain points tied to the brief.
2. **Target users & personas** — 2–4 personas with goals, frustrations, and success criteria.
3. **Jobs-to-be-done** — When / I want / so I can… format (minimum 5 jobs).
4. **Scope (in / out / later)** — Explicit boundaries to prevent scope creep.
5. **Success metrics** — Lagging + leading indicators; include how you would measure in MVP vs v1.
6. **Assumptions & risks** — Table: assumption | validation method | risk if wrong.
7. **Glossary** — Domain terms that engineers and designers must use consistently.

## Output constraints
- Be **specific**; reference phrases from the brief where helpful.
- Flag **open questions** that block build decisions.
- End with a **Definition of Ready** checklist (≤10 bullets) for moving to architecture.

# Output format
Use **Markdown** with clear \`##\` / \`###\` headings. No preamble—start directly with section 1.`;
}

function buildSystemArchitecture(ctx: PromptGenerationContext): string {
  const brief = formatUserBrief(ctx.userInput);
  const qa = formatQASection(ctx.questions, ctx.answers);
  const stack = formatTechStack(ctx.techStack);
  return `# Role
You are a **principal software architect**. You design pragmatic, secure systems that match the stated product and constraints.

# Source material

### Original brief
${brief}

### Scoped Q&A
${qa}

### Resolved technology baseline
${stack}

# Your task
Draft a **System Architecture** description suitable for an engineering kickoff and AI-assisted implementation.

## Required sections
1. **Architecture goals** — Performance, reliability, security, cost, operability (prioritize for this product).
2. **Logical view** — Major subsystems (frontend, BFF/API, services, data, integrations) and responsibilities.
3. **Runtime / deployment view** — How components map to environments (dev/stage/prod); note serverless vs long-running where relevant.
4. **Data architecture** — Entities at a high level, consistency model, backup/restore posture, PII handling hooks.
5. **Integration map** — External systems, protocols, failure modes, idempotency expectations.
6. **Security architecture** — AuthN/Z boundaries, secrets, threat notes aligned with the Q&A (auth model, compliance hints).
7. **Observability** — Logging, metrics, traces; SLO ideas.
8. **ADRs (Architecture Decision Records)** — 3–5 ADRs in “Context / Decision / Consequences” form.

## Constraints
- Stay aligned with **frontend:** ${ctx.techStack.frontend}, **backend:** ${ctx.techStack.backend}, **database:** ${ctx.techStack.database}.
- Call out **trade-offs** explicitly where the brief is ambiguous.

# Output format
Markdown with diagrams described in **Mermaid** where helpful (\`\`\`mermaid blocks).`;
}

function buildFrontendUi(ctx: PromptGenerationContext): string {
  const brief = formatUserBrief(ctx.userInput);
  const qa = formatQASection(ctx.questions, ctx.answers);
  const palette = formatColorPalette(ctx.colorPalette);
  const platform = platformHint(ctx.questions, ctx.answers);

  return `# Role
You are a **staff product designer + frontend architect**. You produce implementation-ready UI guidance for ${ctx.techStack.frontend}.

# Source material

### Original brief
${brief}

### Scoped Q&A
${qa}

### Color palette (must be honored)
${palette}

### Platform hint
${platform}

# Your task
Produce a **Frontend / UI specification** that an AI IDE can implement without guessing tokens or theming.

## Mandatory: light & dark mode
1. **Theme strategy** — Define semantic tokens (e.g. \`--color-bg\`, \`--color-fg\`, \`--color-primary\`, \`--color-muted\`) mapped from the palette for **light** and **dark** themes.
2. **Contrast** — For both themes, state expected contrast targets (WCAG AA intent) for text vs surfaces and for primary actions.
3. **Mode behavior** — Document **system preference**, **manual toggle**, and **persistence** (local storage / account setting) behavior.
4. **Component variants** — Buttons, inputs, cards, navigation: specify default / hover / focus / disabled / error for **each mode**.

## Mandatory: screens
Produce a numbered **Screen inventory** (minimum **8** screens unless the brief clearly implies fewer—then explain why). For **each screen** include:
- **Name & user goal**
- **Primary layout** (regions: nav, header, content, side panels)
- **Key components** and states (loading / empty / error / success)
- **Navigation entry & exit** (routes or flows)
- **Dark vs light notes** (e.g. imagery, elevation, borders)

Suggested starter set (adapt/rename to the product): Landing, Sign-in / session, Core dashboard, Primary workflow (create/edit), Detail view, Settings, Notifications / activity, Help / empty state.

## Also include
- **Design system** — Typography scale, spacing grid, radius, elevation, iconography guidance.
- **Accessibility** — Focus order, keyboard paths, ARIA patterns for main widgets.
- **Responsive breakpoints** — \`xs / sm / md / lg / xl\` behavior for navigation and grids.
- **Motion** — Subtle transitions only; respect \`prefers-reduced-motion\`.

# Output format
Markdown. Start with \`## Theme tokens\` then \`## Screen inventory\` then remaining sections.`;
}

function buildBackendApi(ctx: PromptGenerationContext): string {
  const brief = formatUserBrief(ctx.userInput);
  const qa = formatQASection(ctx.questions, ctx.answers);
  const stack = formatTechStack(ctx.techStack);

  return `# Role
You are a **senior backend engineer** designing APIs and service boundaries for ${ctx.techStack.backend} with ${ctx.techStack.database}.

# Source material

### Original brief
${brief}

### Scoped Q&A
${qa}

### Technology baseline
${stack}

# Your task
Produce a **Backend / API specification** ready for implementation and test generation.

## Required sections
1. **Service boundaries** — Modules, ownership, and dependency direction.
2. **API style** — REST vs GraphQL vs RPC: pick one primary with rationale; include versioning strategy.
3. **Resource model** — Core resources, identifiers, pagination, filtering, sorting conventions.
4. **Authentication & authorization** — Flows aligned with Q&A (sessions, JWT, OAuth, API keys); RBAC/ABAC sketch.
5. **Realtime** — If applicable from Q&A, describe Webhooks / SSE / WebSockets and backpressure.
6. **Data layer** — Tables/collections at high level, indexes, migrations approach, soft delete strategy.
7. **Idempotency & reliability** — Retries, deduplication keys, outbox/inbox if needed.
8. **Error model** — Canonical error codes, problem+json style fields, client handling guidance.
9. **Observability** — Structured logs, correlation IDs, metrics per endpoint.
10. **OpenAPI outline** — Example paths (at least 6) with method, summary, auth requirement, and main request/response shapes (Markdown tables OK).

## Constraints
- Stay consistent with the resolved stack; if something is unspecified, propose a default and mark it **TBD**.
- Include **security checklist** (OWASP API Top 10 awareness) tailored to this product.

# Output format
Markdown with \`##\` headings; include one \`\`\`yaml or \`\`\`json example snippet for a representative endpoint if useful.`;
}

function buildAiIdeExecution(ctx: PromptGenerationContext): string {
  const fullBrief = formatUserBrief(ctx.userInput);
  const briefSnippet =
    fullBrief.length > 900
      ? `${fullBrief.slice(0, 900)}\n\n_(Truncated—full brief is embedded in prompt 1.)_`
      : fullBrief;
  const stack = formatTechStack(ctx.techStack);
  const palette = formatColorPalette(ctx.colorPalette);

  return `# Role
You are an **AI IDE execution lead** (Cursor / Windsurf / Copilot-style workflows). You turn prior prompts into a **repeatable build plan**.

# Prior artifacts (treat as inputs you already have)
Assume these five prompts exist and are approved:
1. Product Understanding Prompt  
2. System Architecture Prompt  
3. Frontend / UI Prompt (includes **dark/light** themes + **screen list**)  
4. Backend / API Prompt  
5. *(This prompt)* AI IDE Execution Prompt  

### Snapshot: brief (trimmed)
${briefSnippet}

### Snapshot: stack
${stack}

### Snapshot: palette
${palette}

# Your task
Produce an **execution playbook** for an AI-assisted IDE.

## Required sections
1. **Repository layout** — Proposed top-level folders and naming for ${ctx.techStack.frontend} + ${ctx.techStack.backend}.
2. **Phase plan** — Phases 0–n: dependencies, checkpoints, “done” criteria per phase.
3. **File creation order** — Ordered list (≥20 items) of files/modules to add with one-line purpose each.
4. **Prompts to run in the IDE** — 6–10 copy-paste sub-prompts the developer can run sequentially; each references which artifact section it implements.
5. **Test strategy** — Unit / integration / e2e: tools, minimum coverage targets, example test cases tied to screens and APIs.
6. **Quality gates** — Lint, typecheck, build, security scan, accessibility checks before merge.
7. **Risk register** — Top risks when AI generates code + mitigations (review steps, human verification).
8. **Commit & PR cadence** — Granular commits, conventional commit examples, PR description template.

## Constraints
- Assume **trunk-based** or **GitHub-flow** unless brief implies otherwise.
- Explicitly require **theme parity**: every UI task must validate **light and dark** modes against tokens \`${ctx.colorPalette.colors.primary}\`, \`${ctx.colorPalette.colors.background}\`, etc.

# Output format
Markdown checklists and numbered steps. No code dumps—focus on process and prompts.`;
}

const ORDER: { id: PromptKind; title: string; build: (ctx: PromptGenerationContext) => string }[] = [
  {
    id: "product_understanding",
    title: "Product Understanding Prompt",
    build: buildProductUnderstanding,
  },
  {
    id: "system_architecture",
    title: "System Architecture Prompt",
    build: buildSystemArchitecture,
  },
  {
    id: "frontend_ui",
    title: "Frontend / UI Prompt",
    build: buildFrontendUi,
  },
  {
    id: "backend_api",
    title: "Backend / API Prompt",
    build: buildBackendApi,
  },
  {
    id: "ai_ide_execution",
    title: "AI IDE Execution Prompt",
    build: buildAiIdeExecution,
  },
];

export function buildPromptPack(ctx: PromptGenerationContext): PromptPack {
  const prompts = ORDER.map(
    (o): GeneratedPrompt => ({
      id: o.id,
      title: o.title,
      body: o.build(ctx),
    }),
  ) as PromptPack["prompts"];

  return {
    generatedAtIso: new Date().toISOString(),
    prompts,
  };
}
