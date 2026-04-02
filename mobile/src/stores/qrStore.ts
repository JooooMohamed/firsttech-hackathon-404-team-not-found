import {create} from 'zustand';
import {QrSession} from '../types';
import {qrApi} from '../services/api';

interface QrState {
  activeSession: QrSession | null;
  isLoading: boolean;

  createSession: (
    type?: 'earn' | 'redeem' | 'general',
    merchantId?: string,
    amount?: number,
  ) => Promise<QrSession>;
  lookupSession: (token: string) => Promise<QrSession>;
  completeSession: (token: string) => Promise<QrSession>;
  clearSession: () => void;
}

export const useQrStore = create<QrState>(set => ({
  activeSession: null,
  isLoading: false,

  createSession: async (type, merchantId, amount) => {
    set({isLoading: true});
    try {
      const session = await qrApi.create({type, merchantId, amount});
      set({activeSession: session});
      return session;
    } finally {
      set({isLoading: false});
    }
  },

  lookupSession: async token => {
    set({isLoading: true});
    try {
      const session = await qrApi.lookup(token);
      set({activeSession: session});
      return session;
    } finally {
      set({isLoading: false});
    }
  },

  completeSession: async token => {
    const session = await qrApi.complete(token);
    set({activeSession: session});
    return session;
  },

  clearSession: () => set({activeSession: null}),
}));
