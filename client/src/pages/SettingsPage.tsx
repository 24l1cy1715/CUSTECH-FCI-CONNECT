import React, { useState } from 'react';
import { Sun, Globe, Shield, MessageSquare, CheckCircle2, Cookie, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useUIStore } from '@/store/uiStore';
import { useConsentStore } from '@/store/consentStore';
import { useTranslation } from 'react-i18next';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme, setLanguage } = useUIStore();
  const { t, i18n } = useTranslation();
  const { openPreferencesModal, consentRecord, hasInteracted } = useConsentStore();

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-display font-extrabold text-3xl text-primary dark:text-white">
          Account &amp; System Settings
        </h1>
        <p className="text-sm text-text-secondary">
          Manage your interface preferences, Nigerian locale, security, and notification choices.
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <Card className="p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-text flex items-center gap-2">
            <Sun className="w-5 h-5 text-accent" />
            Appearance &amp; Theme
          </h2>
          <p className="text-xs text-text-secondary">
            Choose your preferred color theme for CUSTECH FCI Connect.
          </p>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTheme(mode)}
                className={`py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl border text-xs font-semibold capitalize transition-all ${
                  theme === mode
                    ? 'border-accent bg-accent/10 text-accent-700 dark:text-accent ring-2 ring-accent/20'
                    : 'border-border bg-surface text-text hover:bg-surface-raised'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </Card>

        {/* Language Settings */}
        <Card className="p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-text flex items-center gap-2">
            <Globe className="w-5 h-5 text-accent" />
            Language &amp; Localization
          </h2>
          <p className="text-xs text-text-secondary">
            Switch between English, Nigerian Pidgin, Yoruba, Hausa, and Igbo.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {[
              { code: 'en', name: 'English' },
              { code: 'pcm', name: 'Pidgin' },
              { code: 'yo', name: 'Yorùbá' },
              { code: 'ha', name: 'Hausa' },
              { code: 'ig', name: 'Igbo' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  setLanguage(lang.code);
                }}
                className={`py-3 px-3 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center gap-1.5 ${
                  i18n.language === lang.code
                    ? 'border-accent bg-accent/10 text-accent-700 dark:text-accent ring-2 ring-accent/20'
                    : 'border-border bg-surface text-text hover:bg-surface-raised'
                }`}
              >
                <span className="w-8 h-6 rounded-md bg-surface-raised border border-border text-[11px] font-mono font-bold flex items-center justify-center text-text-secondary uppercase">
                  {lang.code}
                </span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Security & Notifications */}
        <Card className="p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-text flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            Security &amp; Notifications
          </h2>
          <div className="space-y-3 pt-2 text-xs text-text-secondary">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded accent-accent w-4 h-4" />
              <span>Email notifications for new connection requests</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded accent-accent w-4 h-4" />
              <span>Alert me when new projects are published in my department</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded accent-accent w-4 h-4" />
              <span>Campus roommate availability alerts</span>
            </label>
          </div>
        </Card>

        {/* Privacy & Cookie Preferences */}
        <Card className="p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-text flex items-center gap-2">
            <Cookie className="w-5 h-5 text-accent" />
            Privacy &amp; Cookie Preferences
          </h2>
          <p className="text-xs text-text-secondary">
            Manage how FCI Connect handles cookies and browser storage. Essential cookies for authentication and security are always required.
          </p>

          {hasInteracted && consentRecord && (
            <div className="p-3 rounded-xl bg-surface-raised/40 border border-border text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Essential Cookies</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">Always Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Analytics</span>
                <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${consentRecord.analytics ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                  {consentRecord.analytics ? 'Accepted' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Marketing</span>
                <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${consentRecord.marketing ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                  {consentRecord.marketing ? 'Accepted' : 'Disabled'}
                </span>
              </div>
              <p className="text-[11px] text-text-muted pt-1">
                Last updated: {new Date(consentRecord.timestamp).toLocaleString()}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={openPreferencesModal}
              leftIcon={<Cookie className="w-3.5 h-3.5 text-accent" />}
              className="text-xs"
            >
              {hasInteracted ? 'Change Cookie Preferences' : 'Set Cookie Preferences'}
            </Button>
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <Link to="/privacy" className="hover:text-accent underline flex items-center gap-1">
                Privacy Policy <ExternalLink className="w-3 h-3" />
              </Link>
              <Link to="/cookie-policy" className="hover:text-accent underline flex items-center gap-1">
                Cookie Policy <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </Card>

        {/* Live Support & Help */}
        <Card className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="font-display font-bold text-lg text-text flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-accent" />
                FCI Connect Live Support
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                Have questions about your account, project showcase, campus news, or FCI events? Chat with our AI support assistant or connect with a student administrator.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (window.Tawk_API?.maximize) {
                  window.Tawk_API.maximize();
                } else if (window.Tawk_API?.toggle) {
                  window.Tawk_API.toggle();
                }
              }}
              leftIcon={<MessageSquare className="w-3.5 h-3.5 text-accent" />}
              className="shrink-0 self-start sm:self-auto whitespace-nowrap"
            >
              Open Support Chat
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between pt-4">
          {savedSuccess && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Preferences saved successfully!</span>
            </span>
          )}
          <div className="ml-auto">
            <Button variant="accent" size="md" onClick={handleSave}>
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
