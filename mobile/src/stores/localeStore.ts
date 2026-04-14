import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {changeLanguage} from '../i18n';

interface LocaleState {
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (lang: 'en' | 'ar') => {
        changeLanguage(lang);
        set({language: lang});
      },
    }),
    {
      name: 'easypoints-locale',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
