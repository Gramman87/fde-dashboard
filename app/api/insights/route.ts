import Anthropic from "@anthropic-ai/sdk";
import { summaryForAI } from "@/lib/mockData";

type Insight = { type: "positive" | "opportunity" | "warning" | "critical"; title: string; insight: string };

// Module-scope cache so warm function instances don't burn tokens on repeat
// page loads. Underlying data is static, so a 1-hour TTL is more than safe.
let cached: { at: number; insights: Insight[] } | null = null;
const TTL_MS = 60 * 60 * 1000;

const SYSTEM_PROMPT = `You are a SaaS analytics assistant. Given the business data below, produce exactly 4 short, actionable dashboard insights covering momentum, opportunities, and risks.

Each insight has:
- type: one of "positive", "opportunity", "warning", "critical"
- title: 2-4 word headline
- insight: one or two sentences citing specific numbers or account names

Respond with ONLY a JSON object of the shape {"insights": [...]}. No prose, no markdown fences.

Data:
${JSON.stringify(summaryForAI, null, 2)}`;

export async function GET() {
  if (cached && Date.now() - cached.at < TTL_MS) {
    return Response.json({ insights: cached.insights });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: "Generate 4 dashboard insights." }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  try {
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    const parsed = JSON.parse(cleaned) as { insights?: Insight[] };
    if (!Array.isArray(parsed.insights)) throw new Error("missing insights array");
    cached = { at: Date.now(), insights: parsed.insights };
    return Response.json({ insights: parsed.insights });
  } catch (err) {
    console.error("Failed to parse insights JSON:", err, text);
    return Response.json({ error: "Failed to parse insights" }, { status: 500 });
  }
}
