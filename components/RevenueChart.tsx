"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { revenueData } from "@/lib/mockData";

const fmt = (v: number) =>
  v >= 1000000
    ? `$${(v / 1000000).toFixed(1)}M`
    : `$${(v / 1000).toFixed(0)}K`;

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "#16161e",
  fontSize: 12,
  color: "#f0f0f5",
};

export default function RevenueChart() {
  return (
    <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-5">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">MRR Growth</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={revenueData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2a" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={52} />
          <Tooltip formatter={(v) => [fmt(Number(v)), "MRR"]} contentStyle={tooltipStyle} labelStyle={{ color: "#a1a1aa" }} />
          <Area type="monotone" dataKey="mrr" stroke="#8b5cf6" strokeWidth={2} fill="url(#mrrGrad)" dot={{ r: 3, fill: "#8b5cf6" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
