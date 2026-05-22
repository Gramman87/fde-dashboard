"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { userGrowthData } from "@/lib/mockData";

const fmt = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${v}`);

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "#16161e",
  fontSize: 12,
  color: "#f0f0f5",
};

export default function UserGrowthChart() {
  return (
    <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-5">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">DAU / MAU</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={userGrowthData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2a" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={36} />
          <Tooltip formatter={(v) => [fmt(Number(v))]} contentStyle={tooltipStyle} labelStyle={{ color: "#a1a1aa" }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} />
          <Bar dataKey="mau" fill="#7c3aed" radius={[4, 4, 0, 0]} name="MAU" />
          <Bar dataKey="dau" fill="#c4b5fd" radius={[4, 4, 0, 0]} name="DAU" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
