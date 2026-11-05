import Anthropic from "@anthropic-ai/sdk";

export type Engine = "claude" | "demo";

export const NOTICES = {
  noKey: "Demo mode: no API key is configured, so rule-based logic answered.",
  overBudget: "Today's live model budget is used up, so rule-based logic answered.",
  unavailable: "The live model is unavailable right now, so rule-based logic answered.",
};

export const MODEL = process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001";

export function createClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  // One retry and a short timeout: there's a fallback, so a visitor shouldn't wait out a long outage.
  return apiKey ? new Anthropic({ apiKey, timeout: 25_000, maxRetries: 1 }) : null;
}
