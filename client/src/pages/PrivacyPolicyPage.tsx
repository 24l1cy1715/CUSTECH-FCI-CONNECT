import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileText, CheckCircle2, AlertTriangle, ArrowLeft, Mail, ExternalLink } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useConsentStore } from '@/store/consentStore';

export const PrivacyPolicyPage: React.FC = () => {
  const { openPreferencesModal } = useConsentStore();

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
          <Shield className="w-3.5 h-3.5" />
          Data Protection &amp; Privacy Statement
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-primary dark:text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-3xl">
          This Privacy Policy explains how the Faculty of Computing and Informatics (FCI) at Confluence University of Science and Technology (CUSTECH), Osara, collects, uses, protects, and manages your personal and academic information on the FCI Connect platform.
        </p>
      </div>

      {/* Administrative Review Notice */}
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Notice Regarding Institutional Legal Governance</p>
          <p className="leading-relaxed opacity-90">
            This document outlines operational data protection principles aligned with the Nigeria Data Protection Act (NDPA 2023) and university academic guidelines. Specific placeholders marked with brackets (<span className="font-mono font-bold">[ ... ]</span>) indicate administrative parameters subject to final confirmation by the CUSTECH Directorate of ICT, University Registry, and Legal Counsel.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Data Controller */}
        <Card className="p-6 sm:p-8 space-y-4">
          <h2 className="font-display font-bold text-lg text-text flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold">1</span>
            Data Controller &amp; Faculty Authority
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            The data controller responsible for the processing of your personal data on this platform is:
          </p>
          <div className="p-4 rounded-xl bg-surface-raised/40 border border-border space-y-1.5 text-xs sm:text-sm text-text">
            <p className="font-semibold text-primary dark:text-white">
              [Faculty of Computing and Informatics, Confluence University of Science and Technology (CUSTECH)]
            </p>
            <p className="text-text-secondary">Osara Campus, KM 19 Lokoja-Okene Expressway, Kogi State, Nigeria</p>
            <p className="text-text-secondary">
              Official Institutional Inquiries:{' '}
              <a href="mailto:fci@custech.edu.ng" className="text-accent underline font-medium">
                [fci@custech.edu.ng / ICT Directorate: ict@custech.edu.ng]
              </a>
            </p>
            <p className="text-text-secondary">
              Data Protection Liaison:{' '}
              <span className="font-mono text-text-muted">[Designated Faculty ICT Privacy Officer]</span>
            </p>
          </div>
        </Card>

        {/* Section 2: Legal Basis for Processing */}
        <Card className="p-6 sm:p-8 space-y-4">
          <h2 className="font-display font-bold text-lg text-text flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold">2</span>
            Legal Basis for Processing
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            We process student, lecturer, alumni, and partner personal information under the following legal frameworks:
          </p>
          <ul className="space-y-2.5 text-xs sm:text-sm text-text-secondary list-disc pl-5">
            <li>
              <strong className="text-text">Academic &amp; Institutional Mandate:</strong> To administer student identity verification, academic skill records, departmental activities, SIWES internship placements, and university communication.
            </li>
            <li>
              <strong className="text-text">Performance of Educational Contract:</strong> Providing student profile management, digital FCI portfolio sharing, peer team collaboration, and achievement recognition.
            </li>
            <li>
              <strong className="text-text">Legitimate Institutional Interests:</strong> Safeguarding campus software infrastructure, preventing academic fraud, enforcing access control, and mitigating cybersecurity threats.
            </li>
            <li>
              <strong className="text-text">Explicit Consent:</strong> Applied to optional anonymous analytics, non-essential storage, and elective public portfolio showcases.
            </li>
          </ul>
        </Card>

        {/* Section 3: Data We Collect */}
        <Card className="p-6 sm:p-8 space-y-4">
          <h2 className="font-display font-bold text-lg text-text flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold">3</span>
            Categories of Data Collected
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl border border-border bg-surface-raised/30 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent">Student &amp; User Profile</h3>
              <ul className="space-y-1.5 text-xs text-text-secondary list-disc pl-4">
                <li>Full Name &amp; Institutional/Personal Email</li>
                <li>Matriculation Number (verified against university registry)</li>
                <li>Department &amp; Academic Level (e.g. Computer Science, 300L)</li>
                <li>Biographical summary, technical skills, and GitHub username</li>
                <li>Profile avatar and showcase project media</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl border border-border bg-surface-raised/30 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent">Security &amp; Technical Logs</h3>
              <ul className="space-y-1.5 text-xs text-text-secondary list-disc pl-4">
                <li>Cryptographic password hashes (bcrypt, salted)</li>
                <li>Google OAuth ID and email verification confirmation</li>
                <li>Audit logs: login timestamps, role elevations, security alerts</li>
                <li>IP address and user-agent for brute-force rate-limiting</li>
                <li>Session tokens stored in secure, HttpOnly cookies</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Section 4: Third-Party Sub-Processors */}
        <Card className="p-6 sm:p-8 space-y-4">
          <h2 className="font-display font-bold text-lg text-text flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold">4</span>
            Third-Party Sub-Processors &amp; Infrastructure
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            FCI Connect strictly utilizes certified infrastructure providers to facilitate platform functionality. We never sell, lease, or monetize your personal information:
          </p>
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-border bg-surface flex items-start justify-between gap-3 text-xs">
              <div>
                <strong className="text-text">Google OAuth (Google Identity Services)</strong>
                <p className="text-text-secondary">Used for single sign-on authentication and verified email confirmation.</p>
              </div>
              <span className="text-[11px] font-mono text-text-muted shrink-0">Authentication</span>
            </div>
            <div className="p-3 rounded-lg border border-border bg-surface flex items-start justify-between gap-3 text-xs">
              <div>
                <strong className="text-text">Brevo SMTP Relay</strong>
                <p className="text-text-secondary">Delivers password reset OTPs, verification emails, and academic security alerts.</p>
              </div>
              <span className="text-[11px] font-mono text-text-muted shrink-0">Transactional Email</span>
            </div>
            <div className="p-3 rounded-lg border border-border bg-surface flex items-start justify-between gap-3 text-xs">
              <div>
                <strong className="text-text">Tawk.to Live Support Widget</strong>
                <p className="text-text-secondary">Enables real-time student support and administrative inquiry communication.</p>
              </div>
              <span className="text-[11px] font-mono text-text-muted shrink-0">Student Support</span>
            </div>
            <div className="p-3 rounded-lg border border-border bg-surface flex items-start justify-between gap-3 text-xs">
              <div>
                <strong className="text-text">Hosting &amp; Database Infrastructure</strong>
                <p className="text-text-secondary">[Designated University ICT Datacenter / Cloud Infrastructure Provider - Subject to Institutional Service Agreement]</p>
              </div>
              <span className="text-[11px] font-mono text-text-muted shrink-0">Hosting</span>
            </div>
          </div>
        </Card>

        {/* Section 5: Data Retention & Deletion */}
        <Card className="p-6 sm:p-8 space-y-4">
          <h2 className="font-display font-bold text-lg text-text flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold">5</span>
            Data Retention Periods &amp; Deletion
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Personal data is retained in accordance with university academic archive regulations:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-text-secondary list-disc pl-5">
            <li>
              <strong className="text-text">Active Student Records:</strong> Maintained throughout the duration of academic enrollment and degree completion.
            </li>
            <li>
              <strong className="text-text">Alumni Records:</strong> Retained in graduated status for verification and credential authentication unless explicit account removal is requested.
            </li>
            <li>
              <strong className="text-text">Security Logs:</strong> Retained for <span className="font-mono font-semibold text-text">[180 days to 1 year - subject to ICT Security Policy]</span> for threat detection.
            </li>
            <li>
              <strong className="text-text">Account Deletion Procedure:</strong> Students may request account closure or data rectification through the Faculty Secretariat or via written notice to <span className="font-mono text-accent">[fci@custech.edu.ng]</span>, subject to statutory academic record requirements.
            </li>
          </ul>
        </Card>

        {/* Section 6: Your Rights */}
        <Card className="p-6 sm:p-8 space-y-4">
          <h2 className="font-display font-bold text-lg text-text flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold">6</span>
            Your Rights Under the Nigeria Data Protection Act
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-text-secondary">
            <div className="p-3 rounded-lg border border-border bg-surface space-y-1">
              <strong className="text-text flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                Right of Access &amp; Portability
              </strong>
              <p>You can view and export your profile and digital portfolio data at any time.</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-surface space-y-1">
              <strong className="text-text flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                Right to Rectification
              </strong>
              <p>Correct inaccurate biographical, contact, or skill information directly in Settings.</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-surface space-y-1">
              <strong className="text-text flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                Right to Withdraw Consent
              </strong>
              <p>Revoke optional analytics or marketing consent anytime via Cookie Preferences.</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-surface space-y-1">
              <strong className="text-text flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                Right to Lodge Inquiries
              </strong>
              <p>Contact the faculty data protection liaison regarding any privacy concerns.</p>
            </div>
          </div>
        </Card>

        {/* Cookie Preferences Trigger Card */}
        <Card className="p-6 sm:p-8 space-y-4 bg-accent/5 border-accent/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="font-display font-bold text-lg text-primary dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-accent" />
                Manage Your Cookie Consent Preferences
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary">
                Review which cookies and storage mechanisms are currently active on your browser.
              </p>
            </div>
            <Button
              type="button"
              variant="accent"
              size="sm"
              onClick={openPreferencesModal}
              className="shrink-0 self-start sm:self-auto"
            >
              Open Cookie Preferences
            </Button>
          </div>
        </Card>
      </div>

      {/* Footer Nav */}
      <div className="pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-text-muted">
        <div className="flex items-center gap-4">
          <Link to="/cookie-policy" className="hover:text-accent underline">
            Read Cookie Policy
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
