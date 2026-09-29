import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export type AnalyticsEventName =
  | 'page_view'
  | 'sign_up'
  | 'login'
  | 'logout'
  | 'profile_completed'
  | 'project_created'
  | 'project_published'
  | 'opportunity_saved'
  | 'opportunity_application_started'
  | 'event_registered'
  | 'community_joined'
  | 'mentorship_requested'
  | 'learning_resource_saved'
  | 'achievement_earned'
  | 'digital_id_verified'
  | 'project_lab_created'
  | 'research_project_created'
  | 'SIWES_application_created'
  | 'marketplace_listing_created'
  | 'student_voice_submission'
  | 'button_click'
  | 'form_submit'
  | 'search'
  | 'resource_view'
  | 'assessment_start'
  | 'assessment_complete'
  | 'digital_id_view';

export interface AnalyticsPayload {
  [key: string]: unknown;
}

// ── In-Memory Circular Buffer for Observability (capped at 100 entries) ────────
const BUFFER_CAP = 100;
const analyticsLog: Array<{ event: AnalyticsEventName; data: AnalyticsPayload; ts: number }> = [];

/**
 * Privacy sanitizer: ensures no passwords, tokens, session secrets, or full private PII
 * ever leak to any analytics provider or log.
 */
function sanitizePayload(data: AnalyticsPayload): AnalyticsPayload {
  const sanitized: AnalyticsPayload = {};
  const blockedKeyPatterns = /pass|token|secret|auth|bearer|cookie|credential|cvv|hash/i;

  for (const [key, value] of Object.entries(data)) {
    if (blockedKeyPatterns.test(key)) {
      continue; // drop sensitive fields entirely
    }
    // Mask raw email addresses if passed by accident
    if (typeof value === 'string' && value.includes('@') && value.includes('.')) {
      sanitized[key] = value.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Centralized, privacy-conscious analytics interface.
 */
export const analytics = {
  track: (event: AnalyticsEventName, data: AnalyticsPayload = {}): void => {
    const cleanData = sanitizePayload(data);
    const entry = { event, data: cleanData, ts: Date.now() };

    if (analyticsLog.length >= BUFFER_CAP) {
      analyticsLog.shift();
    }
    analyticsLog.push(entry);

    if (import.meta.env.DEV) {
      console.debug('[FCI Analytics]', event, cleanData);
    }

    // Configurable vendor dispatches (plausible, posthog, or custom)
    const provider = import.meta.env.VITE_ANALYTICS_PROVIDER?.toLowerCase();

    if (typeof window !== 'undefined') {
      if (provider === 'plausible' && (window as any).plausible) {
        (window as any).plausible(event, { props: cleanData });
      } else if (provider === 'posthog' && (window as any).posthog) {
        (window as any).posthog.capture(event, cleanData);
      }
    }
  },

  page: (path: string, title?: string): void => {
    analytics.track('page_view', {
      path,
      title: title || (typeof document !== 'undefined' ? document.title : ''),
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    });
  },

  getBuffer: () => [...analyticsLog],
};

/**
 * Exported standalone helper for backward compatibility
 */
export const trackEvent = analytics.track;
export const getAnalyticsBuffer = analytics.getBuffer;

/**
 * React hook: automatically tracks page views on route changes with strict deduplication.
 */
export function usePageViewTracker(): void {
  const location = useLocation();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    const path = location.pathname + location.search;

    if (path === prevPath.current) return;
    prevPath.current = path;

    analytics.page(path);
  }, [location.pathname, location.search]);
}
