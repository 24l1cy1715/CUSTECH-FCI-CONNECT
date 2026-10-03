import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const CURRENT_CONSENT_VERSION = '1.0.0';

export interface CookiePreferences {
  essential: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
}

export interface ConsentRecord {
  version: string;
  essential: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

interface ConsentState {
  hasInteracted: boolean;
  consentRecord: ConsentRecord | null;
  isPreferencesModalOpen: boolean;

  // Actions
  acceptAll: () => void;
  rejectNonEssential: () => void;
  savePreferences: (prefs: { analytics: boolean; marketing: boolean }) => void;
  openPreferencesModal: () => void;
  closePreferencesModal: () => void;
  resetConsent: () => void;
}

export const useConsentStore = create<ConsentState>()(
  persist(
    (set, get) => ({
      hasInteracted: false,
      consentRecord: null,
      isPreferencesModalOpen: false,

      acceptAll: () => {
        const record: ConsentRecord = {
          version: CURRENT_CONSENT_VERSION,
          essential: true,
          analytics: true,
          marketing: false, // FCI Connect does not run marketing ads; kept false or user-toggled
          timestamp: Date.now(),
        };
        set({
          hasInteracted: true,
          consentRecord: record,
          isPreferencesModalOpen: false,
        });
      },

      rejectNonEssential: () => {
        const record: ConsentRecord = {
          version: CURRENT_CONSENT_VERSION,
          essential: true,
          analytics: false,
          marketing: false,
          timestamp: Date.now(),
        };
        set({
          hasInteracted: true,
          consentRecord: record,
          isPreferencesModalOpen: false,
        });
      },

      savePreferences: ({ analytics, marketing }) => {
        const record: ConsentRecord = {
          version: CURRENT_CONSENT_VERSION,
          essential: true,
          analytics: Boolean(analytics),
          marketing: Boolean(marketing),
          timestamp: Date.now(),
        };
        set({
          hasInteracted: true,
          consentRecord: record,
          isPreferencesModalOpen: false,
        });
      },

      openPreferencesModal: () => set({ isPreferencesModalOpen: true }),
      closePreferencesModal: () => set({ isPreferencesModalOpen: false }),

      resetConsent: () => {
        set({
          hasInteracted: false,
          consentRecord: null,
          isPreferencesModalOpen: false,
        });
      },
    }),
    {
      name: 'custech-cookie-consent',
      partialize: (state) => ({
        hasInteracted: state.hasInteracted,
        consentRecord: state.consentRecord,
      }),
      // Validate consent version on hydration: if version changed, prompt user again
      onRehydrateStorage: () => (state) => {
        if (state && state.consentRecord) {
          if (state.consentRecord.version !== CURRENT_CONSENT_VERSION) {
            state.hasInteracted = false;
            state.consentRecord = null;
          }
        }
      },
    }
  )
);

/**
 * Pure helper function to check if analytics has been granted by user.
 * Safe to call outside React component tree.
 */
export function hasAnalyticsConsent(): boolean {
  try {
    const raw = localStorage.getItem('custech-cookie-consent');
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    const state = parsed?.state;
    if (!state?.hasInteracted || !state?.consentRecord) return false;
    if (state.consentRecord.version !== CURRENT_CONSENT_VERSION) return false;
    return Boolean(state.consentRecord.analytics);
  } catch {
    return false;
  }
}
