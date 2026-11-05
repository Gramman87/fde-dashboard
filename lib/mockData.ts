// Nimbus Cloud is a fictional B2B SaaS. Everything here is static sample data, and it's kept
// distinct from the MCP demo dataset so the two projects don't share data.

export const revenueData = [
  { month: "Nov", mrr: 367000, arr: 4404000 },
  { month: "Dec", mrr: 394000, arr: 4728000 },
  { month: "Jan", mrr: 421000, arr: 5052000 },
  { month: "Feb", mrr: 458000, arr: 5496000 },
  { month: "Mar", mrr: 489000, arr: 5868000 },
  { month: "Apr", mrr: 520000, arr: 6240000 },
  { month: "May", mrr: 561000, arr: 6732000 },
];

export const churnData = [
  { month: "Nov", churnRate: 4.2, expansion: 1.0 },
  { month: "Dec", churnRate: 3.9, expansion: 1.3 },
  { month: "Jan", churnRate: 3.6, expansion: 1.6 },
  { month: "Feb", churnRate: 3.3, expansion: 1.9 },
  { month: "Mar", churnRate: 3.1, expansion: 2.1 },
  { month: "Apr", churnRate: 2.9, expansion: 2.3 },
  { month: "May", churnRate: 2.8, expansion: 2.5 },
];

export const userGrowthData = [
  { month: "Nov", dau: 10500, mau: 36800 },
  { month: "Dec", dau: 11400, mau: 39200 },
  { month: "Jan", dau: 12300, mau: 41600 },
  { month: "Feb", dau: 13200, mau: 44000 },
  { month: "Mar", dau: 14100, mau: 46200 },
  { month: "Apr", dau: 15200, mau: 48100 },
  { month: "May", dau: 16200, mau: 49800 },
];

// Share of MRR by customer segment, in percent.
export const segmentData = [
  { name: "Enterprise", mrrSharePct: 56 },
  { name: "Mid-Market", mrrSharePct: 28 },
  { name: "SMB", mrrSharePct: 16 },
];

export const topAccounts = [
  { name: "Stellaria Health", mrr: 32200, health: "healthy", seats: 480 },
  { name: "Meridian Logistics", mrr: 25800, health: "healthy", seats: 360 },
  { name: "Forge & Co", mrr: 21400, health: "at-risk", seats: 310 },
  { name: "Atlas Bio", mrr: 17900, health: "healthy", seats: 240 },
  { name: "Solstice AI", mrr: 13600, health: "churning", seats: 200 },
];

const latest = <T,>(series: T[]) => series[series.length - 1];
const previous = <T,>(series: T[]) => series[series.length - 2];
const round1 = (n: number) => Math.round(n * 10) / 10;

// KPIs that exist in a series are derived from it, so a card can't disagree with its chart.
export const kpis = {
  mrr: latest(revenueData).mrr,
  arr: latest(revenueData).arr,
  mrrGrowth: round1((latest(revenueData).mrr / previous(revenueData).mrr - 1) * 100),
  churnRate: latest(churnData).churnRate,
  churnDelta: round1(latest(churnData).churnRate - previous(churnData).churnRate),
  dau: latest(userGrowthData).dau,
  mau: latest(userGrowthData).mau,
  dauMauRatio: round1((latest(userGrowthData).dau / latest(userGrowthData).mau) * 100),
  ltv: 21400,
  nps: 58,
  npsDelta: 5,
  activeAccounts: 1580,
};

export const summaryForAI = {
  company: "Nimbus Cloud",
  kpis,
  revenueData,
  churnData,
  userGrowthData,
  segmentData,
  topAccounts,
};
