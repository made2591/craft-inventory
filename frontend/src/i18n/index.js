import { createI18n } from 'vue-i18n';
import it from './locales/it.json';
import en from './locales/en.json';

// Crea un emettitore di eventi per notificare i cambiamenti di lingua
export const i18nEvents = new EventTarget();

// Carica la lingua salvata nel localStorage o usa l'italiano come default
const savedLocale = localStorage.getItem('locale') || 'it';

const i18n = createI18n({
  legacy: false, // Usa la Composition API
  locale: savedLocale,
  fallbackLocale: 'en', // Usa l'inglese come fallback se manca una traduzione
  messages: {
    it,
    en
  },
  // Assicura che i cambiamenti di locale vengano applicati immediatamente
  sync: true
});

export default i18n;

// Funzione di utilità per cambiare lingua
export function setLocale(locale) {
  // Cambia la lingua nell'istanza i18n
  i18n.global.locale.value = locale;
  
  // Salva la lingua nel localStorage
  localStorage.setItem('locale', locale);
  
  // Imposta l'attributo lang nell'HTML
  document.querySelector('html').setAttribute('lang', locale);
  
  // Emetti un evento personalizzato per notificare i componenti del cambio di lingua
  i18nEvents.dispatchEvent(new CustomEvent('locale-changed', { detail: locale }));
  
  // Forza un aggiornamento della pagina per applicare le traduzioni a tutti i componenti
  // Questo è un approccio più drastico ma garantisce che tutte le traduzioni vengano aggiornate
  window.location.reload();
}