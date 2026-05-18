"use client";

import {
  DollarSign,
  TrendingDown,
  Users,
  Activity,
  Heart,
} from "lucide-react";
import MetricCard from "@/components/MetricCard";
import RevenueChart from "@/components/RevenueChart";
import ChurnChart from "@/components/ChurnChart";
import UserGrowthChart from "@/components/UserGrowthChart";
import AIInsightsPanel from "@/components/AIInsightsPanel";
import NaturalLanguageQuery from "@/components/NaturalLanguageQuery";
import TopAccountsTable from "@/components/TopAccountsTable";
import { kpis } from "@/lib/mockData";

const fmtMoney = (n: number) =>
  n >= 1000000 ? `$${(n / 1000000).toFixed(2)}M` : `$${(n / 1000).toFixed(0)}K`;

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">SaaS Command Center</h1>
            <p className="text-xs text-gray-400">May 2026 · AI-powered analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500 font-medium">Live</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard
            title="MRR"
            value={fmtMoney(kpis.mrr)}
            delta={`${kpis.mrrGrowth}%`}
            deltaPositive
            icon={DollarSign}
          />
          <MetricCard
            title="ARR"
            value={fmtMoney(kpis.arr)}
            icon={DollarSign}
            subtitle="Annualized"
          />
          <MetricCard
            title="Churn Rate"
            value={`${kpis.churnRate}%`}
            delta={`${Math.abs(kpis.churnDelta)}%`}
            deltaPositive={kpis.churnDelta < 0}
            icon={TrendingDown}
          />
          <MetricCard
            title="DAU / MAU"
            value={`${kpis.dauMauRatio}%`}
            icon={Activity}
            subtitle={`${(kpis.dau / 1000).toFixed(1)}K / ${(kpis.mau / 1000).toFixed(1)}K`}
          />
          <MetricCard
            title="Avg LTV"
            value={fmtMoney(kpis.ltv)}
            icon={Heart}
          />
          <MetricCard
            title="NPS"
            value={`${kpis.nps}`}
            delta={`${kpis.npsDelta} pts`}
            deltaPositive
            icon={Users}
            subtitle={`${kpis.activeAccounts.toLocaleString()} accounts`}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <RevenueChart />
          <ChurnChart />
          <UserGrowthChart />
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <AIInsightsPanel />
          <TopAccountsTable />
          <NaturalLanguageQuery />
        </div>
      </main>
    </div>
  );
}
