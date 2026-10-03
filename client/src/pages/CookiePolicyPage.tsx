import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ShieldCheck, Settings2, Lock, ArrowLeft, ExternalLink, HelpCircle } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useConsentStore } from '@/store/consentStore';

export const CookiePolicyPage: React.FC = () => {
  const { openPreferencesModal, consentRecord } = useConsentStore();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to FCI Connect
        </Link>
        <span className="text-xs text-text-muted font-mono">
          Last Updated: October 2026 • Version 1.0.0
        </span>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
          <Cookie className="w-3.5 h-3.5" />
          Platform Transparency
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-primary dark:text-white tracking-tight">
          Cookie Policy
        </h1>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-3xl">
          This Cookie Policy explains how CUSTECH FCI Connect uses cookies, HTTP headers, and browser storage mechanisms to authenticate students, safeguard campus accounts, and remember your interface choices.
        </p>
      </div>

      {/* Interactive Trigger Card */}
      <Card className="p-6 sm:p-8 space-y-4 bg-accent/5 border-accent/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display font-bold text-lg text-primary dark:text-white flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-accent" />
              Manage Your Cookie Preferences
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              Current status: Essential (Active), Analytics ({consentRecord?.analytics ? 'Accepted' : 'Disabled'}), Marketing ({consentRecord?.marketing ? 'Accepted' : 'Disabled'}).
            </p>
          </div>
          <Button
            type="button"
            variant="accent"
            size="sm"
            onClick={openPreferencesModal}
            className="shrink-0 self-start sm:self-auto"
          >
            Change Preferences
          </Button>
        </div>
      </Card>

      <div className="space-y-6">
        {/* Section 1: What are Cookies? */}
        <Card className="p-6 sm:p-8 space-y-4">
          <h2 className="font-display font-bold text-lg text-text flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-accent" />
            What Are Cookies &amp; Local Storage?
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Cookies are small text data packets stored on your device by your web browser when visiting web applications. Similar browser storage technologies like <code className="text-xs bg-surface px-1 py-0.5 rounded border border-border">localStorage</code> store configuration data locally on your computer or mobile device.
          </p>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            FCI Connect uses cookies and local storage primarily for security, session persistence, and remembering user interface preferences (such as your Nigerian language selection or light/dark theme).
          </p>
        </Card>

        {/* Section 2: Detailed Cookie Inventory */}
        <Card className="p-6 sm:p-8 space-y-4">
          <h2 className="font-display font-bold text-lg text-text flex items-center gap-2">
            <Lock className="w-5 h-5 text-accent" />
            Cookie &amp; Storage Inventory
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Below is the comprehensive, transparent inventory of cookies and local storage items utilized by FCI Connect:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-border rounded-xl overflow-hidden">
              <thead className="bg-surface-raised/70 border-b border-border text-text font-semibold">
                <tr>
                  <th className="p-3">Identifier</th>
                  <th className="p-3">Type &amp; Security</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Lifespan</th>
                  <th className="p-3">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-text-secondary">
                <tr className="bg-surface">
                  <td className="p-3 font-mono font-bold text-text">access_token</td>
                  <td className="p-3">Cookie (HttpOnly, Secure, SameSite=Lax)</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                      Essential
                    </span>
                  </td>
                  <td className="p-3">15 minutes</td>
                  <td className="p-3">Cryptographically signed JWT authorizing API requests for active user session.</td>
                </tr>
                <tr className="bg-surface-raised/20">
                  <td className="p-3 font-mono font-bold text-text">refresh_token</td>
                  <td className="p-3">Cookie (HttpOnly, Secure, SameSite=Lax)</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                      Essential
                    </span>
                  </td>
                  <td className="p-3">7 days</td>
                  <td className="p-3">Enables seamless background token renewal without forcing repeated logins.</td>
                </tr>
                <tr className="bg-surface">
                  <td className="p-3 font-mono font-bold text-text">oauth_state</td>
                  <td className="p-3">Cookie (HttpOnly, Secure, SameSite=Lax)</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                      Essential
                    </span>
                  </td>
                  <td className="p-3">10 minutes</td>
                  <td className="p-3">Cryptographic state token preventing Cross-Site Request Forgery (CSRF) during Google OAuth.</td>
                </tr>
                <tr className="bg-surface-raised/20">
                  <td className="p-3 font-mono font-bold text-text">custech-ui</td>
                  <td className="p-3">Browser localStorage</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                      Essential
                    </span>
                  </td>
                  <td className="p-3">Persistent</td>
                  <td className="p-3">Saves theme selection (Light/Dark/System) and language preference (EN, Pidgin, Yoruba, Hausa, Igbo).</td>
                </tr>
                <tr className="bg-surface">
                  <td className="p-3 font-mono font-bold text-text">custech-cookie-consent</td>
                  <td className="p-3">Browser localStorage</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                      Essential
                    </span>
                  </td>
                  <td className="p-3">Persistent (Version 1.0.0)</td>
                  <td className="p-3">Records your consent choices and timestamp to prevent repetitive banners on subsequent visits.</td>
                </tr>
                <tr className="bg-surface-raised/20">
                  <td className="p-3 font-mono font-bold text-text">analytics_buffer</td>
                  <td className="p-3">In-Memory Application Buffer</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-accent/10 text-accent font-semibold text-[11px]">
                      Analytics (Optional)
                    </span>
                  </td>
                  <td className="p-3">Session Only</td>
                  <td className="p-3">Stores sanitized, in-memory pageview counts. Only active when Analytics consent is granted.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Section 3: Browser Controls */}
        <Card className="p-6 sm:p-8 space-y-4">
          <h2 className="font-display font-bold text-lg text-text flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" />
            Managing Cookies at the Browser Level
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            In addition to using the FCI Connect Preferences modal, most modern web browsers allow you to control cookie settings through their preferences:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-text-secondary list-disc pl-5">
            <li>
              <strong>Google Chrome:</strong> Settings → Privacy and security → Cookies and other site data.
            </li>
            <li>
              <strong>Mozilla Firefox:</strong> Settings → Privacy &amp; Security → Cookies and Site Data.
            </li>
            <li>
              <strong>Microsoft Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies.
            </li>
            <li>
              <strong>Apple Safari:</strong> Preferences → Privacy → Block all cookies / Manage Website Data.
            </li>
          </ul>
          <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 leading-relaxed">
            <strong>Important note:</strong> If you completely block essential cookies in your browser settings, you will be unable to log in to FCI Connect or authenticate via Google OAuth, because your session token cannot be established.
          </p>
        </Card>

        {/* Section 4: Contact & Faculty Governance */}
        <Card className="p-6 sm:p-8 space-y-4">
          <h2 className="font-display font-bold text-lg text-text flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-accent" />
            Questions &amp; Contact Information
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            For questions regarding this Cookie Policy or technical cookie implementation, please contact:
          </p>
          <div className="p-4 rounded-xl bg-surface-raised/40 border border-border space-y-1 text-xs sm:text-sm text-text">
            <p className="font-semibold text-primary dark:text-white">
              [Faculty of Computing &amp; Informatics Web Infrastructure Team]
            </p>
            <p className="text-text-secondary">
              Contact:{' '}
              <a href="mailto:fci@custech.edu.ng" className="text-accent underline font-medium">
                [fci@custech.edu.ng / ICT Directorate Helpdesk]
              </a>
            </p>
            <p className="text-text-secondary">
              Faculty Office: KM 19 Lokoja-Okene Expressway, Osara, Kogi State, Nigeria
            </p>
          </div>
        </Card>
      </div>

      {/* Footer Nav */}
      <div className="pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-text-muted">
        <div className="flex items-center gap-4">
          <Link to="/privacy" className="hover:text-accent underline">
            Read Privacy Policy
          </Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-accent underline">
            Terms of Service (Draft)
          </Link>
        </div>
        <span>© {new Date().getFullYear()} CUSTECH FCI Connect</span>
      </div>
    </div>
  );
};
