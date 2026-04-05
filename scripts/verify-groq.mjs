/**
 * Verifies GROQ_API_KEY from .env.local by calling Groq's models endpoint.
 * Does not print the key. Exit 0 on success.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envLocal = path.join(root, ".env.local");

if (!fs.existsSync(envLocal)) {
  console.error("Missing .env.local — add GROQ_API_KEY=...");
  process.exit(1);
}

const text = fs.readFileSync(envLocal, "utf8");
const line = text.split("\n").find((l) => l.startsWith("GROQ_API_KEY="));
if (!line) {
  console.error("GROQ_API_KEY not found in .env.local");
  process.exit(1);
}

const key = line.split("=", 2)[1]?.trim();
if (!key) {
  console.error("GROQ_API_KEY is empty");
  process.exit(1);
}

const res = await fetch("https://api.groq.com/openai/v1/models", {
  headers: { Authorization: `Bearer ${key}` },
});

console.log("Groq /models HTTP status:", res.status, res.ok ? "(ok)" : "(failed)");

if (!res.ok) {
  const t = await res.text();
  console.error("Response:", t.slice(0, 200));
  process.exit(1);
}

const data = await res.json();
const n = data?.data?.length ?? 0;
console.log("Models available:", n);
process.exit(0);
