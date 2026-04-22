"use client";

import { useEffect, useState } from "react";
import { useMerchantStore } from "@/stores/merchantStore";
import { transactionsApi } from "@/services/api";
import { StatCard } from "@/components/StatCard";
import { DailyChart } from "@/components/DailyChart";
import Link from "next/link";
import type { MerchantStats, DailyStat } from "@/types";
import { Store, ArrowLeftRight, Users, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const { merchants, fetchMerchants, isLoading } = useMerchantStore();
  const [statsMap, setStatsMap] = useState<Record<string, MerchantStats>>({});
  const [dailyData, setDailyData] = useState<DailyStat[]>([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  useEffect(() => {
    merchants.forEach(async (m) => {
      if (!statsMap[m._id]) {
        const stats = await transactionsApi.getMerchantStats(m._id);
        setStatsMap((prev) => ({ ...prev, [m._id]: stats }));
      }
    });
  }, [merchants, statsMap]);

  useEffect(() => {
    if (selectedMerchantId) {
      transactionsApi.getDailyStats(selectedMerchantId).then(setDailyData);
    } else if (merchants.length > 0) {
      setSelectedMerchantId(merchants[0]._id);
    }
  }, [selectedMerchantId, merchants]);

  const totals = Object.values(statsMap).reduce(
    (acc, s) => ({
      issued: acc.issued + s.totalPointsIssued,
      redeemed: acc.redeemed + s.totalPointsRedeemed,
      txns: acc.txns + s.totalTransactions,
      members: acc.members + s.activeMembers,
    }),
    { issued: 0, redeemed: 0, txns: 0, members: 0 },
  );

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">
          Overview across all merchants
        </p>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Issued"
          value={totals.issued}
          icon={<TrendingUp size={20} />}
        />
        <StatCard
          label="Total Redeemed"
          value={totals.redeemed}
          icon={<ArrowLeftRight size={20} />}
        />
        <StatCard
          label="Transactions"
          value={totals.txns}
          icon={<Store size={20} />}
        />
        <StatCard
          label="Active Members"
          value={totals.members}
          icon={<Users size={20} />}
        />
      </div>

      {/* Daily chart */}
      {dailyData.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-2">
            <label className="text-sm text-gray-500">Merchant:</label>
            <select
              value={selectedMerchantId || ""}
              onChange={(e) => setSelectedMerchantId(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1"
            >
              {merchants.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.logo} {m.name}
                </option>
              ))}
            </select>
          </div>
          <DailyChart data={dailyData} />
        </div>
      )}

      {/* Merchant list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Merchants</h3>
          <Link
            href="/admin/merchants?new=true"
            className="text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            + New Merchant
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {merchants.map((m) => {
            const s = statsMap[m._id];
            return (
              <Link
                key={m._id}
                href={`/admin/merchants?id=${m._id}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{m.logo || "🏪"}</span>
                  <div>
                    <h4 className="font-semibold">{m.name}</h4>
                    <p className="text-xs text-gray-500">{m.category}</p>
                  </div>
                </div>
                {s && (
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <span>Issued: {s.totalPointsIssued.toLocaleString()}</span>
                    <span>
                      Redeemed: {s.totalPointsRedeemed.toLocaleString()}
                    </span>
                    <span>Txns: {s.totalTransactions}</span>
                    <span>Members: {s.activeMembers}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
        {isLoading && (
          <p className="text-center text-gray-400 mt-4">Loading…</p>
        )}
      </div>
    </div>
  );
}
