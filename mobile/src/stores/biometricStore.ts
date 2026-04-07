import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BiometricState {
  biometricEnabled: boolean;
  savedEmail: string | null;
  savedPassword: string | null;
  setBiometricEnabled: (val: boolean) => void;
  saveCredentials: (email: string, password: string) => void;
  clearCredentials: () => void;
}

export const useBiometricStore = create<BiometricState>()(
  persist(
    set => ({
      biometricEnabled: false,
      savedEmail: null,
      savedPassword: null,
      setBiometricEnabled: (val: boolean) => {
        if (!val) {
          set({biometricEnabled: false, savedEmail: null, savedPassword: null});
        } else {
          set({biometricEnabled: true});
        }
      },
      saveCredentials: (email: string, password: string) =>
        set({savedEmail: email, savedPassword: password}),
      clearCredentials: () => set({savedEmail: null, savedPassword: null}),
    }),
    {
      name: 'easypoints-biometric',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
