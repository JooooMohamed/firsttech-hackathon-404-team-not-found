import {create} from 'zustand';
import {nfcService} from '../services/nfc';

interface NfcState {
  isSupported: boolean;
  isEnabled: boolean;
  isReading: boolean;
  lastPayload: string | null;
  checkSupport: () => Promise<void>;
  readTag: () => Promise<string | null>;
  cancel: () => void;
}

export const useNfcStore = create<NfcState>((set) => ({
  isSupported: false,
  isEnabled: false,
  isReading: false,
  lastPayload: null,

  checkSupport: async () => {
    const supported = await nfcService.isSupported();
    const enabled = supported ? await nfcService.isEnabled() : false;
    if (supported) {
      await nfcService.init();
    }
    set({isSupported: supported, isEnabled: enabled});
  },

  readTag: async () => {
    set({isReading: true});
    try {
      const payload = await nfcService.readPayload();
      set({lastPayload: payload, isReading: false});
      return payload;
    } catch {
      set({isReading: false});
      return null;
    }
  },

  cancel: () => {
    nfcService.cancel();
    set({isReading: false});
  },
}));
