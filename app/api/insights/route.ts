import { NextResponse } from "next/server";

const MOCK_INSIGHTS = [
  {
    type: "positive",
    title: "Strong MRR Momentum",
    insight: "MRR grew 54% over 7 months from $312K to $482K, indicating healthy product-market fit.",
  },
  {
    type: "opportunity",
    title: "Expand Enterprise Tier",
    insight: "Enterprise accounts drive 52% of revenue — upsell campaigns could accelerate ARR past $7M.",
  },
  {
    type: "warning",
    title: "Initech At Risk",
    insight: "Initech ($18.9K MRR, 280 seats) is flagged at-risk and should receive an immediate CSM touchpoint.",
  },
  {
    type: "critical",
    title: "Hooli Churning",
    insight: "Hooli ($12.3K MRR) is actively churning — intervention needed this week to prevent revenue loss.",
  },
];

export async function GET() {
  // Simulate a brief loading delay for realism
  await new Promise((r) => setTimeout(r, 800));
  return NextResponse.json({ insights: MOCK_INSIGHTS });
}
