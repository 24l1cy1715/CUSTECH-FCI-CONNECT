import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle2,
  ExternalLink,
  Award,
  Sparkles,
  Lock,
  ArrowRight,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import { digitalIdApi } from '@/api/digitalIdApi';
import { Button } from '@/components/common/Button';

export const PublicVerificationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  const {
    data: result,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['public-verify', token],
    queryFn: () => digitalIdApi.verifyPublicToken(token!),
    enabled: !!token,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full p-8 rounded-3xl bg-surface border border-border text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-accent/20 text-accent flex items-center justify-center mx-auto animate-pulse">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-text">Verifying FCI Record...</h2>
          <p className="text-xs text-text-muted">
            Checking cryptographic token against official CUSTECH registry.
          </p>
        </div>
      </div>
    );
  }

  if (isError || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full p-8 rounded-3xl bg-surface border border-rose-500/30 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
            <ShieldX className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-rose-500">Invalid or Expired QR Token</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            The scanned verification token could not be found or has been revoked by the holder. Please ask the student to provide an updated QR pass.
          </p>
          <div className="pt-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                Return to FCI Connect Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isVerified = result.verified && result.status === 'VERIFIED';
  const student = result.student;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-between bg-gradient-to-b from-primary-900/20 via-background to-background">
      <div className="max-w-xl mx-auto w-full space-y-6">
        {/* Verification Certificate Container */}
        <div className="rounded-3xl bg-surface border border-border shadow-2xl overflow-hidden">
          {/* Top Status Header */}
          <div
            className={`p-6 sm:p-8 text-center text-white ${
              isVerified
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
                : result.status === 'PENDING'
                ? 'bg-gradient-to-r from-amber-600 to-orange-700'
                : 'bg-gradient-to-r from-rose-600 to-red-800'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 border border-white/30 shadow-lg">
              {isVerified ? (
                <ShieldCheck className="w-9 h-9 text-white" />
              ) : result.status === 'PENDING' ? (
                <ShieldAlert className="w-9 h-9 text-white" />
              ) : (
                <ShieldX className="w-9 h-9 text-white" />
              )}
            </div>

            <div className="text-xs font-mono tracking-widest uppercase opacity-90 mb-1">
              FCI CONNECT VERIFICATION
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {result.statusMessage}
            </h1>
            <p className="text-xs opacity-80 mt-1">
              Verified through FCI Connect Platform
            </p>
          </div>

          {/* Student Identity Information */}
          {student && (
            <div className="p-6 sm:p-8 space-y-6">
              {/* Profile Card snippet */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-raised border border-border">
                <div className="w-14 h-14 rounded-2xl bg-accent text-black flex items-center justify-center font-bold text-lg overflow-hidden border border-border shrink-0 shadow-sm">
                  {student.avatarUrl ? (
                    <img
                      src={student.avatarUrl}
                      alt={student.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (student.fullName || 'S').charAt(0)
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono text-accent uppercase font-bold tracking-wider">
                    STUDENT RECORD
                  </span>
                  <h3 className="font-extrabold text-lg text-text truncate">
                    {student.fullName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-text-muted mt-0.5">
                    <span>ID:</span>
                    <span className="font-bold text-accent bg-accent/10 px-2 py-0.2 rounded border border-accent/20">
                      {student.fciId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Academic Details Table */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-text-muted">Faculty</span>
                  <span className="font-semibold text-text">Faculty of Computing & Informatics</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-text-muted">Department</span>
                  <span className="font-semibold text-text">{student.department || 'Computing Sciences'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-text-muted">Academic Level</span>
                  <span className="font-semibold text-text">
                    {student.level ? `${student.level} Level` : 'Undergraduate'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-text-muted">Verification Status</span>
                  <span
                    className={`font-bold uppercase font-mono ${
                      isVerified ? 'text-emerald-500' : 'text-amber-500'
                    }`}
                  >
                    {result.status}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-text-muted">Verification Timestamp</span>
                  <span className="font-mono text-text-muted text-[11px]">
                    {new Date(result.verificationTimestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Public Skills (if permitted by student) */}
              {student.skills && student.skills.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    Verified Skills
                  </h4>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {student.skills.map((s) => (
                      <span
                        key={s.id}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-raised border border-border text-text"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Public Achievements (if permitted by student) */}
              {student.achievements && student.achievements.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-accent" />
                    Honors & Achievements
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    {student.achievements.map((a) => (
                      <span
                        key={a.id}
                        className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center gap-1.5"
                      >
                        <Award className="w-3.5 h-3.5" />
                        {a.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio Link (if permitted by student) */}
              {student.portfolioUrl && (
                <div className="pt-4 border-t border-border">
                  <a
                    href={student.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-accent text-black hover:bg-accent/90 transition-all shadow-md shadow-accent/20"
                  >
                    <span>View Public Student Portfolio</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Privacy Guarantee Footer */}
          <div className="p-4 bg-surface-raised/60 border-t border-border text-center text-[11px] text-text-muted flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5 text-accent" />
            <span>
              CUSTECH Privacy Standard: Private contact, matriculation, and academic records are securely safeguarded.
            </span>
          </div>
        </div>

        {/* Institution Brand */}
        <div className="text-center text-xs text-text-muted space-y-1">
          <p className="font-semibold text-text">{result.institution}</p>
          <p className="text-[10px] text-text-muted">
            Official Companion Verification Node • FCI Connect 2026
          </p>
        </div>
      </div>
    </div>
  );
};
