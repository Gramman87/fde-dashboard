"use client";

import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  icon: LucideIcon;
  subtitle?: string;
}

export default function MetricCard({
  title,
  value,
  delta,
  deltaPositive,
  icon: Icon,
  subtitle,
}: MetricCardProps) {
  return (
    <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-5 hover:bg-white/[0.05] transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>}
        </div>
        <div className="p-2 bg-violet-500/15 border border-violet-500/20 rounded-lg">
          <Icon className="w-5 h-5 text-violet-400" />
        </div>
      </div>
      {delta && (
        <div className="mt-3 flex items-center gap-1">
          <span
            className={`text-xs font-semibold ${
              deltaPositive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {deltaPositive ? "▲" : "▼"} {delta}
          </span>
          <span className="text-xs text-gray-600">vs last month</span>
        </div>
      )}
    </div>
  );
}
