import { NextRequest, NextResponse } from "next/server";

const RESPONSES: Record<string, string> = {
  default:
    "Based on current metrics, MRR is up 54% over 7 months to $482K with churn declining to 2.1%. Expansion revenue (2.3%) now exceeds churn, meaning the business is in net negative churn territory — a strong signal of product stickiness.",
  churn:
    "Churn dropped from 3.1% to 2.1% over 7 months, saving roughly $48K in monthly recurring revenue. The primary risk is Hooli (actively churning, $12.3K MRR) and Initech (at-risk, $18.9K MRR) — together representing $31.2K in potential monthly churn.",
  segment:
    "Enterprise accounts (52% of revenue) are the core growth driver, followed by Mid-Market at 31%. SMB at 17% likely has the highest churn concentration — consider tiered support to reduce SMB attrition and improve LTV.",
  dau:
    "DAU/MAU ratio sits at 31.2%, up from roughly 27.9% in November. This upward trend indicates improving daily habit formation. Crossing 40% DAU/MAU would place the product in the top tier of SaaS engagement benchmarks.",
  accounts:
    "Acme Corp ($28.4K MRR) and Globex ($22.1K MRR) are healthy and candidates for upsell. Initech needs urgent CSM outreach — at-risk accounts with 280+ seats often churn in clusters. Prioritize Hooli retention this week.",
};

function pickResponse(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("churn") || q.includes("spike") || q.includes("losing")) return RESPONSES.churn;
  if (q.includes("segment") || q.includes("mrr") || q.includes("revenue") || q.includes("drive")) return RESPONSES.segment;
  if (q.includes("dau") || q.includes("mau") || q.includes("engagement") || q.includes("trend")) return RESPONSES.dau;
  if (q.includes("account") || q.includes("attention") || q.includes("risk") || q.includes("customer")) return RESPONSES.accounts;
  return RESPONSES.default;
}

export async function POST(req: NextRequest) {
  const { question } = await req.json();
  const response = pickResponse(question);

  // Stream the response word-by-word for realistic effect
  const encoder = new TextEncoder();
  const words = response.split(" ");

  const readable = new ReadableStream({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encoder.encode(word + " "));
        await new Promise((r) => setTimeout(r, 30));
      }
      controller.close();
    },
  });

  return new NextResponse(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
