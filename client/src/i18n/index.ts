import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/translation.json';
import pcm from './locales/pcm/translation.json';
import yo from './locales/yo/translation.json';
import ha from './locales/ha/translation.json';
import ig from './locales/ig/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en:  { translation: en },
      pcm: { translation: pcm },
      yo:  { translation: yo },
      ha:  { translation: ha },
      ig:  { translation: ig },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'custech-lang',
    },
  });

export default i18n;
