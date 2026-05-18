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

export default function ChurnChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Churn vs Expansion (%)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={churnData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={36} />
          <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="churnRate" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} name="Churn Rate" />
          <Line type="monotone" dataKey="expansion" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Expansion" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
