"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { churnData } from "@/lib/mockData";

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "#16161e",
  fontSize: 12,
  color: "#f0f0f5",
};

export default function ChurnChart() {
  return (
    <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-5">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Churn vs Expansion (%)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={churnData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2a" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={36} />
          <Tooltip formatter={(v) => [`${v}%`]} contentStyle={tooltipStyle} labelStyle={{ color: "#a1a1aa" }} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} />
          <Line type="monotone" dataKey="churnRate" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} name="Churn Rate" />
          <Line type="monotone" dataKey="expansion" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Expansion" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
