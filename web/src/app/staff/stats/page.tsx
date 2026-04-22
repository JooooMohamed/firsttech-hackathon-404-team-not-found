"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { transactionsApi } from "@/services/api";
import { StatCard } from "@/components/StatCard";
import { DailyChart } from "@/components/DailyChart";
import { TransactionTable } from "@/components/TransactionTable";
import type { MerchantStats, DailyStat, Transaction } from "@/types";
import { TrendingUp, ArrowLeftRight, Store, Users } from "lucide-react";

export default function StaffStatsPage() {
  const { user } = useAuthStore();
  const merchantId = user?.merchantId;

  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [daily, setDaily] = useState<DailyStat[]>([]);
  const [recent, setRecent] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!merchantId) return;
    transactionsApi.getMerchantStats(merchantId).then(setStats);
    transactionsApi.getDailyStats(merchantId).then(setDaily);
    transactionsApi
      .getMerchantTransactions(merchantId)
      .then((res) => setRecent((res.items || []).slice(0, 10)));
  }, [merchantId]);

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold">Stats</h2>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Issued"
            value={stats.totalPointsIssued}
            icon={<TrendingUp size={20} />}
          />
          <StatCard
            label="Redeemed"
            value={stats.totalPointsRedeemed}
            icon={<ArrowLeftRight size={20} />}
          />
          <StatCard
            label="Outstanding"
            value={stats.totalPointsIssued - stats.totalPointsRedeemed}
            icon={<Store size={20} />}
          />
          <StatCard
            label="Members"
            value={stats.activeMembers}
            icon={<Users size={20} />}
          />
        </div>
      )}

      {daily.length > 0 && <DailyChart data={daily} />}

      <div>
        <h3 className="text-lg font-semibold mb-3">Recent Transactions</h3>
        <TransactionTable transactions={recent} showCustomer />
      </div>
    </div>
  );
}
