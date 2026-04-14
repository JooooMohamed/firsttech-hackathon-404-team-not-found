import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {I18nManager} from 'react-native';
import * as RNLocalize from 'react-native-localize';
import en from './en.json';
import ar from './ar.json';

const locales = RNLocalize.getLocales();
const defaultLang = locales?.[0]?.languageCode || 'en';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources: {
    en: {translation: en},
    ar: {translation: ar},
  },
  lng: defaultLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export const changeLanguage = (lang: 'en' | 'ar') => {
  i18n.changeLanguage(lang);
  const isRTL = lang === 'ar';
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
    I18nManager.allowRTL(isRTL);
    // App restart required for RTL to take full effect
  }
};

export default i18n;
