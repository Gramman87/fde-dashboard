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
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Icon className="w-5 h-5 text-indigo-600" />
        </div>
      </div>
      {delta && (
        <div className="mt-3 flex items-center gap-1">
          <span
            className={`text-xs font-semibold ${
              deltaPositive ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {deltaPositive ? "▲" : "▼"} {delta}
          </span>
          <span className="text-xs text-gray-400">vs last month</span>
        </div>
      )}
    </div>
  );
}
