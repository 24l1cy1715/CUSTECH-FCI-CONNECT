import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cookie, Settings2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useConsentStore } from '@/store/consentStore';

export const CookieConsentBanner: React.FC = () => {
  const { hasInteracted, acceptAll, rejectNonEssential, openPreferencesModal } = useConsentStore();

  // If user has already made their choice, do not render banner
  if (hasInteracted) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:bottom-6 sm:max-w-xl z-[9990] animate-slideUp"
    >
      <div className="bg-surface/95 dark:bg-surface-raised/95 backdrop-blur-md border border-border/90 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 ring-1 ring-black/5 dark:ring-white/5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0 mt-0.5">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-display font-bold text-primary dark:text-white flex items-center gap-1.5">
              <span>Privacy &amp; Cookie Notice</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500 inline" />
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              CUSTECH FCI Connect uses essential cookies and local storage to guarantee secure authentication, validate Google OAuth, and save your theme and language settings. We also offer optional anonymous analytics to help improve faculty features.
            </p>
          </div>
        </div>

        {/* Links to Policies */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-text-muted border-t border-border/60 pt-3">
          <span>Learn more:</span>
          <Link to="/privacy" className="text-text hover:text-accent underline font-medium">
            Privacy Policy
          </Link>
          <span className="text-border">•</span>
          <Link to="/cookie-policy" className="text-text hover:text-accent underline font-medium">
            Cookie Policy
          </Link>
          <span className="text-border">•</span>
          <Link to="/terms" className="text-text hover:text-accent underline font-medium">
            Terms of Service
          </Link>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={openPreferencesModal}
            className="text-xs text-text-secondary hover:text-text justify-center"
            leftIcon={<Settings2 className="w-3.5 h-3.5 text-accent" />}
          >
            Manage Preferences
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={rejectNonEssential}
              className="flex-1 sm:flex-none text-xs justify-center"
            >
              Reject Non-Essential
            </Button>
            <Button
              type="button"
              variant="accent"
              size="sm"
              onClick={acceptAll}
              className="flex-1 sm:flex-none text-xs justify-center shadow-sm"
            >
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
