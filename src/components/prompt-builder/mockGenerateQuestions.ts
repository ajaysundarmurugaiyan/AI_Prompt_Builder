import type { GeneratedQuestion, PromptInputState } from "./types";

export type MockAnalysis = {
  summary: string;
  wordCount: number;
  signals: string[];
};

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const QUESTION_POOL: GeneratedQuestion[] = [
  {
    id: "platform",
    category: "Platform",
    prompt: "Where should this product primarily live?",
    helper: "Helps narrow integration and UX constraints.",
    type: "single",
    options: [
      { id: "web", label: "Web" },
      { id: "mobile", label: "Mobile" },
      { id: "both", label: "Both" },
      { id: "unsure", label: "Not sure yet" },
    ],
  },
  {
    id: "auth",
    category: "Authentication",
    prompt: "What authentication model fits best?",
    type: "single",
    options: [
      { id: "none", label: "No auth / public" },
      { id: "email", label: "Email & password" },
      { id: "oauth", label: "OAuth / SSO" },
      { id: "magic", label: "Magic link / OTP" },
      { id: "api", label: "API keys / tokens" },
    ],
  },
  {
    id: "realtime",
    category: "Real-time",
    prompt: "How important are real-time or live updates?",
    type: "single",
    options: [
      { id: "none", label: "Not needed" },
      { id: "occasional", label: "Occasional refresh" },
      { id: "live", label: "Live data / notifications" },
      { id: "streaming", label: "Streaming (chat, feeds, collaboration)" },
    ],
  },
  {
    id: "skill",
    category: "Audience skill level",
    prompt: "Who is the primary user, technically?",
    type: "single",
    options: [
      { id: "beginner", label: "Beginner / non-technical" },
      { id: "intermediate", label: "Intermediate" },
      { id: "advanced", label: "Advanced / engineers" },
      { id: "mixed", label: "Mixed audience" },
    ],
  },
  {
    id: "stack",
    category: "Tech stack",
    prompt: "Which stacks are in play? (select all that apply)",
    type: "multi",
    options: [
      { id: "react", label: "React" },
      { id: "next", label: "Next.js" },
      { id: "vue", label: "Vue" },
      { id: "node", label: "Node.js" },
      { id: "python", label: "Python" },
      { id: "dotnet", label: ".NET" },
      { id: "unknown", label: "I don't know" },
      { id: "other", label: "Other stack" },
    ],
  },
  {
    id: "deployment",
    category: "Deployment",
    prompt: "Where do you expect to run this?",
    type: "single",
    options: [
      { id: "cloud", label: "Public cloud (SaaS-style)" },
      { id: "private", label: "Private cloud / VPC" },
      { id: "onprem", label: "On-premises" },
      { id: "hybrid", label: "Hybrid" },
    ],
  },
  {
    id: "compliance",
    category: "Compliance & privacy",
    prompt: "Any compliance themes to respect? (select all that apply)",
    type: "multi",
    options: [
      { id: "gdpr", label: "GDPR / data residency" },
      { id: "hipaa", label: "HIPAA" },
      { id: "soc2", label: "SOC 2" },
      { id: "none", label: "None identified yet" },
    ],
  },
];

function detectSignals(blob: string): string[] {
  const s = blob.toLowerCase();
  const signals: string[] = [];
  if (/\b(mobile|ios|android|app store|react native|flutter)\b/.test(s)) {
    signals.push("mobile");
  }
  if (/\b(web|browser|spa|next\.?js|website)\b/.test(s)) {
    signals.push("web");
  }
  if (/\b(auth|login|sso|oauth|sign in|identity)\b/.test(s)) {
    signals.push("auth");
  }
  if (/\b(real-?time|live|websocket|streaming|collab|chat)\b/.test(s)) {
    signals.push("realtime");
  }
  if (/\b(compliance|gdpr|hipaa|soc\s*2|regulated)\b/.test(s)) {
    signals.push("compliance");
  }
  if (/\b(api|microservice|backend|integration)\b/.test(s)) {
    signals.push("backend");
  }
  return signals;
}

function scoreQuestion(q: GeneratedQuestion, signals: string[], hash: number): number {
  let score = hash % 7;
  if (q.id === "platform") {
    if (signals.includes("mobile")) score += 40;
    if (signals.includes("web")) score += 25;
  }
  if (q.id === "auth" && signals.includes("auth")) score += 35;
  if (q.id === "realtime" && signals.includes("realtime")) score += 35;
  if (q.id === "compliance" && signals.includes("compliance")) score += 40;
  if (q.id === "stack" && signals.includes("backend")) score += 15;
  if (q.id === "skill") score += 10;
  if (q.id === "deployment") score += 8;
  return score;
}

/**
 * Simulates analyzing free-form input and assembling 5–7 contextual questions.
 */
export function mockAnalyzeInput(input: PromptInputState): MockAnalysis {
  const blob = [input.useCase, input.problemDescription, input.challenges]
    .map((t) => t.trim())
    .filter(Boolean)
    .join("\n\n");

  const wc = wordCount(blob);
  const signals = detectSignals(blob);

  const signalPhrase =
    signals.length > 0
      ? `Detected themes: ${signals.slice(0, 4).join(", ")}.`
      : "General product scoping.";

  const summary = `Reviewed ${wc} word${wc === 1 ? "" : "s"} across your brief. ${signalPhrase}`;

  return { summary, wordCount: wc, signals };
}

export function mockGenerateQuestions(input: PromptInputState): GeneratedQuestion[] {
  const blob = [input.useCase, input.problemDescription, input.challenges]
    .map((t) => t.trim())
    .filter(Boolean)
    .join("\n");

  const hash = simpleHash(blob);
  const signals = detectSignals(blob);

  const targetCount = 5 + (hash % 3);

  const scored = QUESTION_POOL.map((q) => ({
    q,
    score: scoreQuestion(q, signals, hash),
  })).sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const ordered: GeneratedQuestion[] = [];

  for (const { q } of scored) {
    if (ordered.length >= targetCount) break;
    if (!seen.has(q.id)) {
      seen.add(q.id);
      ordered.push(q);
    }
  }

  for (const q of QUESTION_POOL) {
    if (ordered.length >= targetCount) break;
    if (!seen.has(q.id)) {
      seen.add(q.id);
      ordered.push(q);
    }
  }

  return ordered.slice(0, targetCount);
}
