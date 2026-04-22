import { create } from "zustand";
import type { Transaction } from "@/types";
import { transactionsApi } from "@/services/api";

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  fetchMerchantTransactions: (
    merchantId: string,
    params?: { startDate?: string; endDate?: string },
  ) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  isLoading: false,

  fetchMerchantTransactions: async (merchantId, params) => {
    set({ isLoading: true });
    try {
      const result = await transactionsApi.getMerchantTransactions(
        merchantId,
        params,
      );
      set({ transactions: result.items || [] });
    } finally {
      set({ isLoading: false });
    }
  },
}));
