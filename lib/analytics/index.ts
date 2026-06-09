// Barrel da camada de analytics. Importe daqui (`@/lib/analytics`).
export {
  type ConsentValue,
  type ConsentState,
  CONSENT_CHANGE_EVENT,
  CONSENT_OPEN_EVENT,
  readConsent,
  writeConsent,
  clearConsent,
} from "./consent";
export {
  firebaseConfig,
  isAnalyticsConfigured,
  loadAnalytics,
  trackEvent,
} from "./firebase";
