import { createI18n } from 'vue-i18n';
import it from './locales/it.json';
import en from './locales/en.json';

// Carica la lingua salvata nel localStorage o usa l'italiano come default
const savedLocale = localStorage.getItem('locale') || 'it';

const i18n = createI18n({
  legacy: false, // Usa la Composition API
  locale: savedLocale,
  fallbackLocale: 'en', // Usa l'inglese come fallback se manca una traduzione
  messages: {
    it,
    en
  }
});

export default i18n;

// Funzione di utilità per cambiare lingua
export function setLocale(locale) {
  i18n.global.locale.value = locale;
  localStorage.setItem('locale', locale);
  document.querySelector('html').setAttribute('lang', locale);
}