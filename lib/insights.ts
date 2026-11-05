import { sharedBudget } from "@/lib/budget";
import { createClient, MODEL, NOTICES, type Engine } from "@/lib/claude";
import { demoInsights } from "@/lib/fallback";
import { summaryForAI } from "@/lib/mockData";

const INSIGHT_TYPES = ["positive", "opportunity", "warning", "critical"] as const;

export type Insight = {
  type: (typeof INSIGHT_TYPES)[number];
  title: string;
  insight: string;
};

export type InsightsResult = { insights: Insight[]; engine: Engine; notice: string | null };

// Module-scope cache so warm function instances don't spend credits on repeat page loads. The
// data is static, so an hour is safe. Only Claude's answers are cached, so a blip doesn't stick.
const TTL_MS = 60 * 60 * 1000;
let cached: { at: number; insights: Insight[] } | null = null;

const SYSTEM_PROMPT = `You are a SaaS analytics assistant. Given the business data below, produce exactly 4 short, specific insights that a VP of Sales or Customer Success would act on.

Each insight has:
- type: one of "positive", "opportunity", "warning", "critical"
- title: 2-4 word headline
- insight: one or two sentences citing specific numbers or account names

Respond with ONLY a JSON object of the shape {"insights": [...]}. No prose, no markdown fences.

Data:
${JSON.stringify(summaryForAI, null, 2)}`;

/** Parses the model's reply. Anything the UI couldn't render safely is rejected here. */
export function parseInsights(text: string): Insight[] {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  const parsed = JSON.parse(cleaned) as { insights?: unknown };
  if (!Array.isArray(parsed.insights) || parsed.insights.length === 0) {
    throw new Error("missing insights array");
  }
  return parsed.insights.map((item: Partial<Insight> | null) => {
    if (
      !item ||
      !INSIGHT_TYPES.includes(item.type as Insight["type"]) ||
      typeof item.title !== "string" ||
      typeof item.insight !== "string"
    ) {
      throw new Error("malformed insight");
    }
    return { type: item.type as Insight["type"], title: item.title, insight: item.insight };
  });
}

function demo(notice: string): InsightsResult {
  return { insights: demoInsights(), engine: "demo", notice };
}

export async function getInsights(now: number = Date.now()): Promise<InsightsResult> {
  if (cached && now - cached.at < TTL_MS) {
    return { insights: cached.insights, engine: "claude", notice: null };
  }

  const client = createClient();
  if (!client) return demo(NOTICES.noKey);
  if (!sharedBudget().tryAcquire()) return demo(NOTICES.overBudget);

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: "Generate 4 dashboard insights." }],
    });
    const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n").trim();
    const insights = parseInsights(text);
    cached = { at: now, insights };
    return { insights, engine: "claude", notice: null };
  } catch (err) {
    console.error("Falling back from Claude insights:", err);
    return demo(NOTICES.unavailable);
  }
}

/** Empties the cache. Only tests need this. */
export function resetInsightsCache(): void {
  cached = null;
}
