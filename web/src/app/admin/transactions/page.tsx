"use client";

import { useEffect, useState } from "react";
import { useMerchantStore } from "@/stores/merchantStore";
import { transactionsApi } from "@/services/api";
import { TransactionTable } from "@/components/TransactionTable";
import { downloadCsv } from "@/lib/utils";
import type { Transaction } from "@/types";
import { Download } from "lucide-react";

export default function AdminTransactionsPage() {
  const { merchants, fetchMerchants } = useMerchantStore();
  const [selectedId, setSelectedId] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (merchants.length === 0) fetchMerchants();
  }, [merchants.length, fetchMerchants]);

  useEffect(() => {
    if (merchants.length > 0 && !selectedId) {
      setSelectedId(merchants[0]._id);
    }
  }, [merchants, selectedId]);

  useEffect(() => {
    if (selectedId) {
      setLoading(true);
      transactionsApi
        .getMerchantTransactions(selectedId)
        .then((res) => setTransactions(res.items || []))
        .finally(() => setLoading(false));
    }
  }, [selectedId]);

  const handleExport = async () => {
    if (!selectedId) return;
    const csv = await transactionsApi.exportMerchantCsv(selectedId);
    const name =
      merchants.find((m) => m._id === selectedId)?.name || "merchant";
    downloadCsv(csv, `${name}-transactions.csv`);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Transactions</h2>
        <div className="flex items-center gap-3">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2"
          >
            {merchants.map((m) => (
              <option key={m._id} value={m._id}>
                {m.logo} {m.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
          >
            <Download size={16} /> CSV
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-8">Loading…</p>
      ) : (
        <TransactionTable transactions={transactions} showCustomer />
      )}
    </div>
  );
}
