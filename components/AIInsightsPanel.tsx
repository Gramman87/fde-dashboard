"use client";

import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, AlertTriangle, AlertCircle, Lightbulb } from "lucide-react";

interface Insight {
  type: "positive" | "warning" | "critical" | "opportunity";
  title: string;
  insight: string;
}

const typeConfig = {
  positive: { icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  critical: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
  opportunity: { icon: Lightbulb, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
};

export default function AIInsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/insights");
      const data = await res.json();
      setInsights(data.insights);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInsights(); }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-gray-700">AI Insights</h3>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Claude</span>
        </div>
        <button
          onClick={fetchInsights}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">Failed to load insights. Check your API key.</p>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {insights.map((item, i) => {
            const cfg = typeConfig[item.type];
            const Icon = cfg.icon;
            return (
              <div key={i} className={`flex gap-3 p-3 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.color}`} />
                <div>
                  <p className={`text-xs font-semibold ${cfg.color}`}>{item.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{item.insight}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
