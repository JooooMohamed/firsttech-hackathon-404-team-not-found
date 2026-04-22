import { create } from "zustand";
import type { Merchant, MerchantStats } from "@/types";
import { merchantsApi, transactionsApi } from "@/services/api";

interface MerchantState {
  merchants: Merchant[];
  selectedMerchant: Merchant | null;
  isLoading: boolean;
  fetchMerchants: () => Promise<void>;
  selectMerchant: (merchant: Merchant) => void;
  clearSelection: () => void;
  createMerchant: (data: Partial<Merchant>) => Promise<Merchant>;
  updateMerchant: (id: string, data: Partial<Merchant>) => Promise<Merchant>;
  getMerchantStats: (id: string) => Promise<MerchantStats>;
}

export const useMerchantStore = create<MerchantState>((set, get) => ({
  merchants: [],
  selectedMerchant: null,
  isLoading: false,

  fetchMerchants: async () => {
    set({ isLoading: true });
    try {
      const merchants = await merchantsApi.getAll();
      set({ merchants });
    } finally {
      set({ isLoading: false });
    }
  },

  selectMerchant: (merchant) => set({ selectedMerchant: merchant }),
  clearSelection: () => set({ selectedMerchant: null }),

  createMerchant: async (data) => {
    const merchant = await merchantsApi.create(data);
    set((state) => ({ merchants: [...state.merchants, merchant] }));
    return merchant;
  },

  updateMerchant: async (id, data) => {
    const merchant = await merchantsApi.update(id, data);
    set((state) => ({
      merchants: state.merchants.map((m) => (m._id === id ? merchant : m)),
      selectedMerchant:
        state.selectedMerchant?._id === id ? merchant : state.selectedMerchant,
    }));
    return merchant;
  },

  getMerchantStats: async (id) => {
    return transactionsApi.getMerchantStats(id);
  },
}));
