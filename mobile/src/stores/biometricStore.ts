import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BiometricState {
  biometricEnabled: boolean;
  setBiometricEnabled: (val: boolean) => void;
}

export const useBiometricStore = create<BiometricState>()(
  persist(
    set => ({
      biometricEnabled: false,
      setBiometricEnabled: (val: boolean) => set({biometricEnabled: val}),
    }),
    {
      name: 'easypoints-biometric',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
