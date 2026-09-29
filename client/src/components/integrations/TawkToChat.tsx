import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const TAWK_SCRIPT_ID = 'tawk-to-script';

// Routes where the chat widget should be hidden (e.g. sensitive admin workflows)
const EXCLUDED_ROUTE_PATTERNS = [/^\/admin(\/.*)?$/];

export const TawkToChat: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const scriptInjectedRef = useRef<boolean>(false);

  const propertyId = import.meta.env.VITE_TAWK_PROPERTY_ID?.trim();
  const widgetId = import.meta.env.VITE_TAWK_WIDGET_ID?.trim() || 'default';

  // ── 1. Singleton Script Injection ──────────────────────────────────────────
  useEffect(() => {
    // If credentials are not configured, log a gentle notice in dev and gracefully exit
    if (!propertyId) {
      if (import.meta.env.DEV && !scriptInjectedRef.current) {
        scriptInjectedRef.current = true;
        console.info(
          '%c[Tawk.to]%c VITE_TAWK_PROPERTY_ID is not configured. Live support widget is idle. Set VITE_TAWK_PROPERTY_ID in client/.env to activate.',
          'color: #FCA311; font-weight: bold;',
          'color: inherit;'
        );
      }
      return;
    }

    const injectScript = () => {
      // Check if already injected or mounted
      if (document.getElementById(TAWK_SCRIPT_ID)) return;

      // Initialize global API container
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();

      const script = document.createElement('script');
      script.id = TAWK_SCRIPT_ID;
      script.async = true;
      script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');

      script.onerror = () => {
        console.warn('[Tawk.to] Failed to load chat widget script. Application continues normally.');
      };

      document.head.appendChild(script);
    };

    // Defer script loading so it never blocks initial paint or critical bundles
    let idleHandle: number | null = null;
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleHandle = (window as any).requestIdleCallback(injectScript, { timeout: 2500 });
    } else {
      timeoutHandle = setTimeout(injectScript, 1500);
    }

    return () => {
      if (idleHandle && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
    };
  }, [propertyId, widgetId]);

  // ── 2. Visibility Handling by Route ────────────────────────────────────────
  useEffect(() => {
    if (!propertyId || typeof window === 'undefined' || !window.Tawk_API) {
      return;
    }

    const isExcluded = EXCLUDED_ROUTE_PATTERNS.some((pattern) =>
      pattern.test(location.pathname)
    );

    try {
      if (isExcluded) {
        window.Tawk_API.hideWidget?.();
      } else {
        window.Tawk_API.showWidget?.();
      }
    } catch {
      // Silently ignore if widget is not yet fully initialized
    }
  }, [location.pathname, propertyId]);

  // ── 3. Safe Authenticated User Context Sync ────────────────────────────────
  useEffect(() => {
    if (!propertyId || typeof window === 'undefined' || !window.Tawk_API) {
      return;
    }

    const applyUserContext = () => {
      if (!window.Tawk_API?.setAttributes) {
        return;
      }

      if (isAuthenticated && user) {
        // Send ONLY non-sensitive display data. Never send passwords, tokens, or private secrets.
        const displayName =
          user.profile?.fullName?.trim() ||
          user.profile?.username?.trim() ||
          user.email.split('@')[0];

        window.Tawk_API.setAttributes(
          {
            name: displayName,
            email: user.email,
            department: user.profile?.department || 'Unspecified',
            level: user.profile?.level || 'Unspecified',
          },
          (error) => {
            if (error && import.meta.env.DEV) {
              console.debug('[Tawk.to] SetAttributes notification:', error);
            }
          }
        );
      }
    };

    // If widget is already loaded, apply attributes immediately
    applyUserContext();

    // Also register on onLoad callback if widget is still bootstrapping
    const previousOnLoad = window.Tawk_API.onLoad;
    window.Tawk_API.onLoad = () => {
      if (typeof previousOnLoad === 'function') {
        previousOnLoad();
      }
      applyUserContext();
    };
  }, [isAuthenticated, user, propertyId]);

  // Component operates strictly via script and DOM; renders no visual elements directly
  return null;
};
