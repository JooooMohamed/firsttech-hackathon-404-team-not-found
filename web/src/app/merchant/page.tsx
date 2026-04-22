"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { merchantsApi, transactionsApi } from "@/services/api";
import { StatCard } from "@/components/StatCard";
import { DailyChart } from "@/components/DailyChart";
import { TransactionTable } from "@/components/TransactionTable";
import Link from "next/link";
import type { Merchant, MerchantStats, DailyStat, Transaction } from "@/types";
import {
  TrendingUp,
  ArrowLeftRight,
  Store,
  Users,
  Settings,
  UserPlus,
} from "lucide-react";

export default function MerchantDashboard() {
  const { user } = useAuthStore();
  const merchantId = user?.merchantId;

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [daily, setDaily] = useState<DailyStat[]>([]);
  const [recent, setRecent] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!merchantId) return;
    merchantsApi.getById(merchantId).then(setMerchant);
    transactionsApi.getMerchantStats(merchantId).then(setStats);
    transactionsApi.getDailyStats(merchantId).then(setDaily);
    transactionsApi
      .getMerchantTransactions(merchantId)
      .then((res) => setRecent((res.items || []).slice(0, 5)));
  }, [merchantId]);

  if (!merchantId) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-md mx-auto">
          <Store size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Merchant Profile</h3>
          <p className="text-gray-500 text-sm mb-4">
            Contact an admin to assign you a merchant.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {merchant?.logo} {merchant?.name || "My Merchant"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{merchant?.category}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/merchant/staff"
            className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg"
          >
            <UserPlus size={16} /> Manage Staff
          </Link>
          <Link
            href="/merchant/settings"
            className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg"
          >
            <Settings size={16} /> Settings
          </Link>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Points Issued"
            value={stats.totalPointsIssued}
            icon={<TrendingUp size={20} />}
          />
          <StatCard
            label="Points Redeemed"
            value={stats.totalPointsRedeemed}
            icon={<ArrowLeftRight size={20} />}
          />
          <StatCard
            label="Transactions"
            value={stats.totalTransactions}
            icon={<Store size={20} />}
          />
          <StatCard
            label="Active Members"
            value={stats.activeMembers}
            icon={<Users size={20} />}
          />
        </div>
      )}

      {daily.length > 0 && <DailyChart data={daily} />}

      <div>
        <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
        <TransactionTable transactions={recent} showCustomer />
      </div>
    </div>
  );
}
