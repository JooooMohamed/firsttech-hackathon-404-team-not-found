import {create} from 'zustand';
import {Wallet, LinkedProgram} from '../types';
import {walletsApi, programsApi} from '../services/api';

interface WalletState {
  easyPointsBalance: number;
  merchantWallets: Wallet[];
  linkedPrograms: LinkedProgram[];
  epAedRate: number;
  epBrandColor: string;
  isLoading: boolean;

  fetchWallets: () => Promise<void>;
  fetchLinkedPrograms: () => Promise<void>;
  fetchEpConfig: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

export const useWalletStore = create<WalletState>(set => ({
  easyPointsBalance: 0,
  merchantWallets: [],
  linkedPrograms: [],
  epAedRate: 0.1,
  epBrandColor: '#6C63FF',
  isLoading: false,

  fetchWallets: async () => {
    set({isLoading: true});
    try {
      const wallets = await walletsApi.getMyWallets();
      const globalWallet = wallets.find(w => w.merchantId === null);
      const merchantWallets = wallets.filter(w => w.merchantId !== null);
      set({
        easyPointsBalance: globalWallet?.balance || 0,
        merchantWallets,
      });
    } finally {
      set({isLoading: false});
    }
  },

  fetchLinkedPrograms: async () => {
    try {
      const programs = await programsApi.getMyPrograms();
      set({linkedPrograms: programs});
    } catch (_) {
      // Silently fail — UI remains with stale data
    }
  },

  fetchEpConfig: async () => {
    try {
      const config = await programsApi.getEasyPointsConfig();
      set({epAedRate: config.aedRate, epBrandColor: config.brandColor});
    } catch (_) {}
  },

  refreshAll: async () => {
    set({isLoading: true});
    try {
      const [wallets, programs, epConfig] = await Promise.all([
        walletsApi.getMyWallets(),
        programsApi.getMyPrograms(),
        programsApi.getEasyPointsConfig(),
      ]);
      const globalWallet = wallets.find(w => w.merchantId === null);
      const merchantWallets = wallets.filter(w => w.merchantId !== null);
      set({
        easyPointsBalance: globalWallet?.balance || 0,
        merchantWallets,
        linkedPrograms: programs,
        epAedRate: epConfig.aedRate,
        epBrandColor: epConfig.brandColor,
      });
    } finally {
      set({isLoading: false});
    }
  },
}));
