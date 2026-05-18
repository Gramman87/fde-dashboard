export const kpis = {
  mrr: 482000,
  arr: 5784000,
  mrrGrowth: 8.4,
  churnRate: 2.1,
  churnDelta: -0.3,
  dau: 12840,
  mau: 41200,
  dauMauRatio: 31.2,
  ltv: 18400,
  nps: 62,
  npsDelta: 4,
  activeAccounts: 1340,
};

export const revenueData = [
  { month: "Nov", mrr: 312000, arr: 3744000 },
  { month: "Dec", mrr: 334000, arr: 4008000 },
  { month: "Jan", mrr: 358000, arr: 4296000 },
  { month: "Feb", mrr: 389000, arr: 4668000 },
  { month: "Mar", mrr: 421000, arr: 5052000 },
  { month: "Apr", mrr: 445000, arr: 5340000 },
  { month: "May", mrr: 482000, arr: 5784000 },
];

export const churnData = [
  { month: "Nov", churnRate: 3.1, expansion: 1.2 },
  { month: "Dec", churnRate: 2.9, expansion: 1.4 },
  { month: "Jan", churnRate: 2.7, expansion: 1.6 },
  { month: "Feb", churnRate: 2.5, expansion: 1.8 },
  { month: "Mar", churnRate: 2.4, expansion: 2.0 },
  { month: "Apr", churnRate: 2.3, expansion: 2.1 },
  { month: "May", churnRate: 2.1, expansion: 2.3 },
];

export const userGrowthData = [
  { month: "Nov", dau: 8200, mau: 29400 },
  { month: "Dec", dau: 9100, mau: 31800 },
  { month: "Jan", dau: 9800, mau: 33600 },
  { month: "Feb", dau: 10600, mau: 36200 },
  { month: "Mar", dau: 11400, mau: 38500 },
  { month: "Apr", dau: 12100, mau: 40100 },
  { month: "May", dau: 12840, mau: 41200 },
];

export const segmentData = [
  { name: "Enterprise", value: 52, color: "#6366f1" },
  { name: "Mid-Market", value: 31, color: "#8b5cf6" },
  { name: "SMB", value: 17, color: "#a78bfa" },
];

export const topAccounts = [
  { name: "Acme Corp", mrr: 28400, health: "healthy", seats: 420 },
  { name: "Globex Systems", mrr: 22100, health: "healthy", seats: 310 },
  { name: "Initech", mrr: 18900, health: "at-risk", seats: 280 },
  { name: "Umbrella Inc", mrr: 15600, health: "healthy", seats: 210 },
  { name: "Hooli", mrr: 12300, health: "churning", seats: 180 },
];

export const summaryForAI = {
  kpis,
  revenueData,
  churnData,
  userGrowthData,
  segmentData,
  topAccounts,
};
