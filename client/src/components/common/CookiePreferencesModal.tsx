import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, BarChart3, Megaphone, Check, X, Lock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useConsentStore } from '@/store/consentStore';

export const CookiePreferencesModal: React.FC = () => {
  const {
    isPreferencesModalOpen,
    closePreferencesModal,
    consentRecord,
    savePreferences,
    acceptAll,
    rejectNonEssential,
  } = useConsentStore();

  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(false);
  const [marketingEnabled, setMarketingEnabled] = useState<boolean>(false);

  // Sync state whenever modal opens or consent record updates
  useEffect(() => {
    if (isPreferencesModalOpen) {
      setAnalyticsEnabled(consentRecord?.analytics ?? false);
      setMarketingEnabled(consentRecord?.marketing ?? false);
    }
  }, [isPreferencesModalOpen, consentRecord]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPreferencesModalOpen) {
        closePreferencesModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreferencesModalOpen, closePreferencesModal]);

  if (!isPreferencesModalOpen) return null;

  const handleSave = () => {
    savePreferences({
      analytics: analyticsEnabled,
      marketing: marketingEnabled,
    });
  };

  const handleAcceptAll = () => {
    acceptAll();
  };

  const handleRejectNonEssential = () => {
    rejectNonEssential();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-preferences-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-fadeIn"
    >
      <div
        className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-border bg-surface-raised/40">
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <Shield className="w-4 h-4" />
              </div>
              <h2
                id="cookie-preferences-title"
                className="text-lg sm:text-xl font-display font-bold text-primary dark:text-white"
              >
                Cookie &amp; Privacy Preferences
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary">
              Customize how CUSTECH FCI Connect uses cookies and local storage. You can adjust your preferences at any time.
            </p>
          </div>
          <button
            type="button"
            onClick={closePreferencesModal}
            aria-label="Close preferences modal"
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-raised transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories List */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* 1. Essential Category */}
          <div className="p-4 rounded-xl border border-border bg-surface-raised/20 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text">Essential Cookies &amp; Storage</h3>
                  <span className="text-[11px] text-text-muted">Security, Sessions &amp; Interface</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Check className="w-3 h-3" />
                Always Active
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              These cookies and storage items are strictly necessary for core application functionality. They securely manage user authentication (<code className="text-[11px] bg-surface px-1 py-0.5 rounded border border-border">access_token</code>, <code className="text-[11px] bg-surface px-1 py-0.5 rounded border border-border">refresh_token</code>), CSRF validation during Google OAuth (<code className="text-[11px] bg-surface px-1 py-0.5 rounded border border-border">oauth_state</code>), and interface configurations (theme and Nigerian language choices). Essential cookies cannot be switched off.
            </p>
          </div>

          {/* 2. Analytics Category */}
          <div className="p-4 rounded-xl border border-border bg-surface-raised/20 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-accent/10 text-accent flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text">Analytics &amp; Performance</h3>
                  <span className="text-[11px] text-text-muted">Usage metrics &amp; platform improvements</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  aria-label="Toggle analytics cookies"
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
              </label>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Allows the faculty to aggregate anonymous usage data (such as page views and navigation trends) to improve student resources, digital portfolio discovery, and portal performance. All analytics events are automatically sanitized to ensure no passwords, session tokens, or private personal data are ever captured.
            </p>
          </div>

          {/* 3. Marketing & Tracking Category */}
          <div className="p-4 rounded-xl border border-border bg-surface-raised/20 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Megaphone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text">Marketing &amp; External Social</h3>
                  <span className="text-[11px] text-text-muted">Third-party campaigns &amp; promotion</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingEnabled}
                  onChange={(e) => setMarketingEnabled(e.target.checked)}
                  aria-label="Toggle marketing cookies"
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
              </label>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              CUSTECH FCI Connect is an academic and community platform. We do not sell your personal data or display third-party behavioral advertisements. This category governs any optional external media embeds or social share trackers.
            </p>
          </div>
        </div>

        {/* Policy Links & Metadata */}
        <div className="px-5 sm:px-6 py-3 border-t border-border/70 bg-surface text-xs text-text-muted flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <Link
              to="/privacy"
              onClick={closePreferencesModal}
              className="hover:text-accent underline flex items-center gap-1"
            >
              Privacy Policy
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              to="/cookie-policy"
              onClick={closePreferencesModal}
              className="hover:text-accent underline flex items-center gap-1"
            >
              Cookie Policy
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              to="/terms"
              onClick={closePreferencesModal}
              className="hover:text-accent underline flex items-center gap-1"
            >
              Terms of Service
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          {consentRecord?.timestamp && (
            <span className="text-[11px] text-text-muted">
              Last saved: {new Date(consentRecord.timestamp).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-border bg-surface-raised/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRejectNonEssential}
              className="w-full sm:w-auto text-xs"
            >
              Reject Non-Essential
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAcceptAll}
              className="w-full sm:w-auto text-xs"
            >
              Accept All
            </Button>
          </div>
          <Button
            type="button"
            variant="accent"
            size="sm"
            onClick={handleSave}
            className="w-full sm:w-auto text-xs"
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
};
