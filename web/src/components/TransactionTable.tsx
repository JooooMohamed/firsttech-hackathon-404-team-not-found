"use client";

import { cn } from "@/lib/utils";
import { formatDate, formatPoints } from "@/lib/utils";
import type { Transaction, User, Merchant } from "@/types";

interface Props {
  transactions: Transaction[];
  showCustomer?: boolean;
}

export function TransactionTable({ transactions, showCustomer }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wider">
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Type</th>
            {showCustomer && <th className="px-4 py-3">Customer</th>}
            {!showCustomer && <th className="px-4 py-3">Merchant</th>}
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3 text-right">Points</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {transactions.map((tx) => {
            const customer =
              typeof tx.userId === "object" ? (tx.userId as User) : null;
            const merchant =
              typeof tx.merchantId === "object"
                ? (tx.merchantId as Merchant)
                : null;

            return (
              <tr key={tx._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(tx.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                      tx.type === "earn"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700",
                    )}
                  >
                    {tx.type === "earn" ? "Earned" : "Redeemed"}
                  </span>
                </td>
                {showCustomer && (
                  <td className="px-4 py-3 text-gray-700">
                    {customer?.name || "—"}
                  </td>
                )}
                {!showCustomer && (
                  <td className="px-4 py-3 text-gray-700">
                    {merchant?.name || "—"}
                  </td>
                )}
                <td className="px-4 py-3 text-right text-gray-600">
                  {tx.amountAed != null ? `${tx.amountAed} AED` : "—"}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-right font-medium",
                    tx.type === "earn" ? "text-green-600" : "text-orange-600",
                  )}
                >
                  {tx.type === "earn" ? "+" : "-"}
                  {formatPoints(tx.points)}
                </td>
              </tr>
            );
          })}
          {transactions.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                No transactions yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
