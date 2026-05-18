"use client";

import { topAccounts } from "@/lib/mockData";

const healthConfig = {
  healthy: { label: "Healthy", color: "text-emerald-700", bg: "bg-emerald-50" },
  "at-risk": { label: "At Risk", color: "text-amber-700", bg: "bg-amber-50" },
  churning: { label: "Churning", color: "text-red-700", bg: "bg-red-50" },
};

export default function TopAccountsTable() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Accounts</h3>
      <table className="w-full">
        <thead>
          <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
            <th className="text-left pb-2 font-medium">Account</th>
            <th className="text-right pb-2 font-medium">MRR</th>
            <th className="text-right pb-2 font-medium">Seats</th>
            <th className="text-right pb-2 font-medium">Health</th>
          </tr>
        </thead>
        <tbody>
          {topAccounts.map((a) => {
            const h = healthConfig[a.health as keyof typeof healthConfig];
            return (
              <tr key={a.name} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 text-sm font-medium text-gray-800">{a.name}</td>
                <td className="py-2.5 text-sm text-right text-gray-600">
                  ${a.mrr.toLocaleString()}
                </td>
                <td className="py-2.5 text-sm text-right text-gray-600">{a.seats}</td>
                <td className="py-2.5 text-right">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${h.color} ${h.bg}`}>
                    {h.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
