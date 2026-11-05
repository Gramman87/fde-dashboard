import { churnData, kpis, revenueData, segmentData, topAccounts, userGrowthData } from "@/lib/mockData";
import type { Insight } from "@/lib/insights";

const usd = (n: number) => `$${Math.round(n / 1000)}K`;
const first = <T,>(series: T[]) => series[0];
const last = <T,>(series: T[]) => series[series.length - 1];

function atRiskSummary(): string {
  const accounts = topAccounts.filter((a) => a.health !== "healthy");
  const names = accounts.map((a) => `${a.name} (${a.health}, ${usd(a.mrr)} MRR)`).join(" and ");
  const total = accounts.reduce((sum, a) => sum + a.mrr, 0);
  return `${names} need attention, with ${usd(total)} of MRR at stake.`;
}

function revenueSummary(): string {
  const growth = (last(revenueData).mrr / first(revenueData).mrr - 1) * 100;
  return `MRR is ${usd(kpis.mrr)}, up ${kpis.mrrGrowth}% on last month and ${growth.toFixed(1)}% since ${first(revenueData).month}.`;
}

function churnSummary(): string {
  return `Churn is ${last(churnData).churnRate}%, down from ${first(churnData).churnRate}% in ${first(churnData).month}, and it has fallen every month. Expansion is ${last(churnData).expansion}%.`;
}

function usageSummary(): string {
  return `DAU/MAU is ${kpis.dauMauRatio}%, with ${kpis.dau.toLocaleString("en-US")} daily users out of ${kpis.mau.toLocaleString("en-US")} monthly, up from ${first(userGrowthData).dau.toLocaleString("en-US")} daily users in ${first(userGrowthData).month}.`;
}

function segmentSummary(): string {
  return `${segmentData.map((s) => `${s.name} is ${s.mrrSharePct}%`).join(", ")} of MRR.`;
}

export function demoInsights(): Insight[] {
  return [
    { type: "positive", title: "Revenue growing", insight: revenueSummary() },
    { type: "positive", title: "Churn falling", insight: churnSummary() },
    { type: "warning", title: "Accounts at risk", insight: atRiskSummary() },
    { type: "opportunity", title: "Enterprise-led mix", insight: segmentSummary() },
  ];
}

// Earlier rules win, so "Which segment drives the most MRR?" is about segments, not revenue.
const RULES: [RegExp, () => string][] = [
  [/\b(accounts?|customers?|attention|risk|health)\b/i, atRiskSummary],
  [/\b(segments?|enterprise|mid-market|smb)\b/i, segmentSummary],
  [/\b(churn|retention|expansion)\b/i, churnSummary],
  [/\b(dau|mau|engagement|users?|usage)\b/i, usageSummary],
  [/\b(mrr|arr|revenue|growth)\b/i, revenueSummary],
];

export function demoAnswer(question: string): string {
  const rule = RULES.find(([pattern]) => pattern.test(question));
  if (rule) return rule[1]();
  return `I can only look up fixed topics in this mode: revenue, churn, usage, segments, and accounts. Here's the headline: ${revenueSummary()}`;
}
