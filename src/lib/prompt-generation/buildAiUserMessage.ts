import type { GeneratePromptsRequest } from "../api/schemas/generate-prompts";
import {
  formatColorPalette,
  formatQASection,
  formatTechStack,
  formatUserBrief,
} from "./formatContext";

export function buildAiUserMessage(input: GeneratePromptsRequest): string {
  const brief = formatUserBrief(input.userInput);
  const qa = formatQASection(input.questions, input.answers);
  const stack = formatTechStack(input.techStack);
  const palette = formatColorPalette(input.colorPalette);

  return `You are given structured inputs from an "AI Prompt Builder" web application. You MUST use ALL provided inputs.

You MUST NOT invent product facts that contradict the original brief. Where the brief is incomplete, you MAY propose reasonable and practical engineering defaults, but you MUST clearly base them on the given context.

# Original brief
${brief}

# Scoping questionnaire (Q&A)
${qa}

# Resolved technology stack
${stack}

# Selected color palette
${palette}

---

# Your task
Produce EXACTLY FIVE (5) expert-level prompts for AI IDEs (Cursor, Windsurf, Copilot Chat, etc.).

---

# CRITICAL GLOBAL INSTRUCTIONS: DUAL-PURPOSE RESPONSE

Each of the 5 prompts you generate MUST follow this EXACT internal structure in the \`body\` field:

**PART 1 — PROJECT CLARITY & USER GUIDE**
Begin with \`## PROJECT CLARITY & USER GUIDE\` and write 3-5 sentences explaining:
- What the AI understands from the brief for this specific prompt
- The key decisions / rationale behind the approach
- What the user should expect from this section

**PART 2 — TECHNICAL IMPLEMENTATION**
Begin with \`## TECHNICAL IMPLEMENTATION\` and write the detailed expert-level instructions / persona / code-level tasks the AI IDE will execute.

---

# ADDITIONAL GLOBAL RULES

1. Each prompt MUST begin with a clear persona assignment sentence in the Technical Implementation section.
   Example:
   "Act as a Senior Frontend Engineer specializing in scalable UI systems..."

2. Do NOT repeat content across prompts unnecessarily.
   Each prompt must focus on its responsibility.

3. All outputs must align strictly with:
   - the provided brief
   - the Q&A answers
   - the selected tech stack
   - the selected color palette

4. Avoid placeholders like "decide later", "TBD", or "optional".
   You MUST make concrete decisions.

5. Keep each body between 800-2000 words to stay within token budget.

6. CRITICAL: Escape all special characters properly for JSON. Do NOT include raw backticks or newlines that would break JSON.
   Use \`\\n\` for newlines inside JSON strings. Use markdown headings with \`##\` and \`###\`.

---

# PROMPT DEFINITIONS

## Prompt 1 — Product Understanding
- id: \`product_understanding\`
- title: **Product Understanding Prompt**

Requirements:
- **PROJECT CLARITY section**: Explain the product vision, primary problem, and how the requirements will be met.
- **TECHNICAL IMPLEMENTATION section**:
  - Define problem statement clearly
  - Identify user personas and their goals
  - Define Jobs-To-Be-Done (JTBD)
  - Clearly define scope (In-scope / Out-of-scope)
  - Define success metrics, assumptions, and risks
  - Provide a "Definition of Ready" for development

---

## Prompt 2 — System Architecture
- id: \`system_architecture\`
- title: **System Architecture Prompt**

Requirements:
- **PROJECT CLARITY section**: Explain the chosen architecture pattern and how it supports the scale and tech stack.
- **TECHNICAL IMPLEMENTATION section**:
  - Define full system architecture aligned with provided tech stack
  - Include frontend, backend, and database layers
  - Describe data flow and deployment/runtime model
  - Define authentication strategy and security considerations
  - Provide architectural decisions (ADRs) with reasoning

---

## Prompt 3 — Frontend / UI
- id: \`frontend_ui\`
- title: **Frontend / UI Prompt**

MANDATORY REQUIREMENTS:
- **PROJECT CLARITY section**: Explain the UI/UX philosophy, the screen flow, and how the color palette is applied.
- **TECHNICAL IMPLEMENTATION section**:
  - Implement BOTH Light Mode and Dark Mode
  - Define color tokens using provided palette and contrast targets
  - Provide a Screen Inventory (minimum 8 screens)
  - For EACH screen, include: layout, components, state management, interactions, and navigation flow
  - Define design system basics (spacing, typography, responsive behavior)

---

## Prompt 4 — Backend / API
- id: \`backend_api\`
- title: **Backend / API Prompt**

Requirements:
- **PROJECT CLARITY section**: Explain the API structure, choice of REST/GraphQL, and the data security model.
- **TECHNICAL IMPLEMENTATION section**:
  - Define backend architecture and service boundaries
  - Define resources, endpoints (OpenAPI-style), and data schema
  - Define auth model (sessions/JWT/RBAC) and error handling
  - Specify environment variables and security best practices

---

## Prompt 5 — AI IDE Execution
- id: \`ai_ide_execution\`
- title: **AI IDE Execution Prompt**

CRITICAL EXECUTION INSTRUCTION:
- **PROJECT CLARITY section**: Explain the step-by-step implementation plan and what the user should expect during the build.
- **TECHNICAL IMPLEMENTATION section**:
  - Act as a FINAL COMMAND for AI IDEs (Cursor/Windsurf)
  - Instruct the AI IDE to analyze all previous artifacts as the source of truth
  - Explicitly command: "Proceed to implement the COMPLETE application end-to-end immediately."
  - Provide repo structure, file creation order, and step-by-step execution plan
  - End with: "Begin full implementation now without interruption."

---

# OUTPUT FORMAT (STRICT)

Return ONLY a valid JSON object. NO markdown fences. NO extra text before or after the JSON.

Structure MUST be:

{
  "prompts": [
    { "id": "product_understanding", "title": "Product Understanding Prompt", "body": "..." },
    { "id": "system_architecture", "title": "System Architecture Prompt", "body": "..." },
    { "id": "frontend_ui", "title": "Frontend / UI Prompt", "body": "..." },
    { "id": "backend_api", "title": "Backend / API Prompt", "body": "..." },
    { "id": "ai_ide_execution", "title": "AI IDE Execution Prompt", "body": "..." }
  ]
}

RULES:
- Array length MUST be exactly 5
- IDs MUST match exactly and in order
- Each body MUST start with "## PROJECT CLARITY & USER GUIDE" then "## TECHNICAL IMPLEMENTATION"
- Each body must be between 800–2000 words
- All newlines in body strings must be encoded as \\n

`;
}

export const GROQ_SYSTEM_PROMPT = `
You are a senior staff prompt engineer generating structured, expert-level prompts for AI IDEs.

You MUST:
- Output ONLY valid JSON (no prose around it, no markdown fences, no extra keys)
- Follow the exact schema provided in the user message
- Each prompt body MUST contain TWO clearly labelled sections:
  1. "## PROJECT CLARITY & USER GUIDE" — a friendly explanation of the project context and goals for this prompt
  2. "## TECHNICAL IMPLEMENTATION" — the detailed, expert-level task instructions for the AI IDE

The body content itself is rich Markdown. Only the top-level container is JSON.

If the output is not valid JSON, it is considered a failure.
`;