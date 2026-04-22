"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { merchantsApi, transactionsApi } from "@/services/api";
import { StatCard } from "@/components/StatCard";
import { TransactionTable } from "@/components/TransactionTable";
import { downloadCsv } from "@/lib/utils";
import Link from "next/link";
import type { Merchant, MerchantStats, Transaction } from "@/types";
import {
  ArrowLeftRight,
  Download,
  Users,
  TrendingUp,
  Store,
} from "lucide-react";

export default function StaffHome() {
  const { user } = useAuthStore();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [recent, setRecent] = useState<Transaction[]>([]);

  const merchantId = user?.merchantId;

  useEffect(() => {
    if (!merchantId) return;
    merchantsApi.getById(merchantId).then(setMerchant);
    transactionsApi.getMerchantStats(merchantId).then(setStats);
    transactionsApi
      .getMerchantTransactions(merchantId)
      .then((res) => setRecent((res.items || []).slice(0, 5)));
  }, [merchantId]);

  const handleExport = async () => {
    if (!merchantId) return;
    const csv = await transactionsApi.exportMerchantCsv(merchantId);
    downloadCsv(csv, `${merchant?.name || "merchant"}-transactions.csv`);
  };

  if (!merchantId) {
    return (
      <div className="p-8">
        <p className="text-gray-500">
          No merchant assigned. Contact your admin.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {merchant?.logo} {merchant?.name || "Staff Dashboard"}
          </h2>
          <p className="text-gray-500 text-sm mt-1">Welcome, {user?.name}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg"
          >
            <Download size={16} /> Export CSV
          </button>
          <Link
            href="/staff/transaction"
            className="bg-primary hover:bg-primary-dark text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            New Transaction
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

      <div>
        <h3 className="text-lg font-semibold mb-3">Recent Transactions</h3>
        <TransactionTable transactions={recent} showCustomer />
      </div>
    </div>
  );
}
