import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, AlertTriangle, ArrowLeft, ShieldCheck, Scale, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/common/Card';

export const TermsOfServicePage: React.FC = () => {
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
          Status: Provisional Institutional Draft • Version 1.0.0
        </span>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
          <Scale className="w-3.5 h-3.5" />
          Student &amp; Faculty Code of Conduct
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-primary dark:text-white tracking-tight">
          Terms of Service (Institutional Draft)
        </h1>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-3xl">
          Guidelines and conditions governing user accounts, academic showcase portfolios, project collaboration, and community conduct on the CUSTECH FCI Connect platform.
        </p>
      </div>

      {/* Draft Disclaimer Notice */}
      <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">PROVISIONAL INSTITUTIONAL DRAFT — PENDING LEGAL &amp; SENATE RATIFICATION</p>
          <p className="leading-relaxed opacity-95">
            This document represents a provisional operational draft. It reflects CUSTECH academic ethics and standard digital platform usage. It does NOT constitute a final ratified legal contract until formally endorsed by the CUSTECH University Senate, the Dean of Computing &amp; Informatics, and University Legal Counsel. Placeholders indicate clauses requiring institutional confirmation.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Acceptance of Terms */}
        <Card className="p-6 sm:p-8 space-y-4">
          <h2 className="font-display font-bold text-lg text-text flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold">1</span>
            Acceptance &amp; Eligibility
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            By registering, logging in, or accessing CUSTECH FCI Connect via email credentials or institutional Google authentication, you agree to comply with these terms, the Student Handbook, and the University ICT Policy.
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-text-secondary list-disc pl-5">
            <li>
              <strong>Eligible Users:</strong> Bona fide students, faculty lecturers, staff, alumni, and vetted industry partners affiliated with Confluence University of Science and Technology.
            </li>
            <li>
              <strong>Matriculation Verification:</strong> Registration requires authentic student credentials. Impersonation of students, staff, or faculty officials constitutes academic misconduct under university disciplinary statutes.
            </li>
          </ul>
        </Card>

        {/* Section 2: Account Security & Responsibilities */}
        <Card className="p-6 sm:p-8 space-y-4">
          <h2 className="font-display font-bold text-lg text-text flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold">2</span>
            Account Security &amp; Credentials
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Users are solely responsible for maintaining the confidentiality of their login credentials:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-text-secondary list-disc pl-5">
            <li>Do not share passwords, session tokens, or QR verification credentials with third parties.</li>
            <li>Notify the faculty ICT support team immediately if you suspect unauthorized access to your account.</li>
            <li>Role elevation (e.g. Super Admin, Dean, HOD) is restricted to designated university staff. Attempting privilege escalation is strictly prohibited.</li>
          </ul>
        </Card>

        {/* Section 3: Academic Integrity & Intellectual Property */}
        <Card className="p-6 sm:p-8 space-y-4">
          <h2 className="font-display font-bold text-lg text-text flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold">3</span>
            Academic Integrity &amp; Intellectual Property
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            FCI Connect is built to celebrate student innovation, open-source engineering, and academic excellence:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-text-secondary list-disc pl-5">
            <li>
              <strong>Ownership:</strong> Students retain copyright in their original software projects, research papers, and portfolio assets.
            </li>
            <li>
              <strong>Plagiarism &amp; Misattribution:</strong> Falsely claiming ownership of code, third-party repositories, or peers' work is prohibited and subject to departmental academic review.
            </li>
            <li>
              <strong>Institutional License:</strong> You grant CUSTECH a non-exclusive license to display your public projects and accomplishments on university showcase media and accreditation materials.
            </li>
          </ul>
        </Card>

        {/* Section 4: Prohibited Conduct */}
        <Card className="p-6 sm:p-8 space-y-4">
          <h2 className="font-display font-bold text-lg text-text flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold">4</span>
            Prohibited Activities
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            The following behaviors are strictly forbidden on CUSTECH FCI Connect:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-text-secondary">
            <div className="p-3 rounded-lg border border-border bg-surface space-y-1">
              <strong className="text-text">Security Breaches</strong>
              <p>Probing, scraping, brute-forcing, SQL injection, or unauthorized API stress testing without prior written consent.</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-surface space-y-1">
              <strong className="text-text">Harassment &amp; Defamation</strong>
              <p>Bullying, hate speech, abusive language, or harassment across communities, roommate listings, or voice channels.</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-surface space-y-1">
              <strong className="text-text">Fraudulent Postings</strong>
              <p>Posting fake tech job opportunities, scam roommate listings, fraudulent freelance bids, or deceptive marketplace items.</p>
            </div>
            <div className="p-3 rounded-lg border border-border bg-surface space-y-1">
              <strong className="text-text">Malicious Code</strong>
              <p>Distributing malware, viruses, pirated academic materials, or harmful automation scripts through project labs.</p>
            </div>
          </div>
        </Card>

        {/* Section 5: Enforcement & Termination */}
        <Card className="p-6 sm:p-8 space-y-4">
          <h2 className="font-display font-bold text-lg text-text flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold">5</span>
            Account Suspension &amp; University Disciplinary Process
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            The Faculty of Computing and Informatics reserves the authority to:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-text-secondary list-disc pl-5">
            <li>Temporarily suspend or permanently terminate access for violations of platform rules.</li>
            <li>Activate global student portal lockdown during examination periods or system maintenance.</li>
            <li>Refer severe violations (e.g. cyber extortion, academic falsification) to the University Student Disciplinary Committee (SDC).</li>
          </ul>
        </Card>

        {/* Section 6: Disclaimers & Governing Law */}
        <Card className="p-6 sm:p-8 space-y-4">
          <h2 className="font-display font-bold text-lg text-text flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold">6</span>
            Disclaimers &amp; Governing Jurisdiction
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            The platform is provided on an <span className="font-mono text-text">"as is"</span> and <span className="font-mono text-text">"as available"</span> academic basis. While the faculty implements industry-standard defenses, CUSTECH does not warrant uninterrupted availability during university network downtime.
          </p>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            <strong>Jurisdiction:</strong> These terms are governed by the laws of the Federal Republic of Nigeria and the internal statutes of Confluence University of Science and Technology, Osara, Kogi State.
          </p>
          <div className="p-4 rounded-xl bg-surface-raised/40 border border-border text-xs text-text-secondary">
            Formal inquiries regarding these draft terms may be addressed to:{' '}
            <a href="mailto:fci@custech.edu.ng" className="text-accent underline font-medium">
              [fci@custech.edu.ng / Office of the Dean, Faculty of Computing &amp; Informatics]
            </a>.
          </div>
        </Card>
      </div>

      {/* Footer Nav */}
      <div className="pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-text-muted">
        <div className="flex items-center gap-4">
          <Link to="/privacy" className="hover:text-accent underline">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link to="/cookie-policy" className="hover:text-accent underline">
            Cookie Policy
          </Link>
        </div>
        <span>© {new Date().getFullYear()} CUSTECH FCI Connect</span>
      </div>
    </div>
  );
};
