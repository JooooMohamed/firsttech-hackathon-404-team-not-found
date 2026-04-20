import {create} from 'zustand';
import {Transaction} from '../types';
import {transactionsApi} from '../services/api';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;

  fetchMyTransactions: (params?: {
    startDate?: string;
    endDate?: string;
  }) => Promise<void>;
  fetchMerchantTransactions: (merchantId: string) => Promise<Transaction[]>;
}

export const useTransactionStore = create<TransactionState>(set => ({
  transactions: [],
  isLoading: false,

  fetchMyTransactions: async params => {
    set({isLoading: true});
    try {
      const result = await transactionsApi.getMyTransactions(params);
      set({transactions: Array.isArray(result) ? result : []});
    } finally {
      set({isLoading: false});
    }
  },

  fetchMerchantTransactions: async merchantId => {
    const transactions = await transactionsApi.getMerchantTransactions(
      merchantId,
    );
    return transactions;
  },
}));
