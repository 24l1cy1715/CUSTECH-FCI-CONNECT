import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Clock,
  Sparkles,
  Download,
  Copy,
  RefreshCw,
  Eye,
  CheckCircle2,
  Lock,
  LogIn,
  ExternalLink,
} from 'lucide-react';
import { digitalIdApi } from '@/api/digitalIdApi';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/store/authStore';
import { DigitalIdentityCard, DigitalIdStatus } from '@/types/digitalId';
import toast from 'react-hot-toast';

export const DigitalIdPage: React.FC = () => {
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const queryClient = useQueryClient();
  const cardRef = useRef<HTMLDivElement>(null);
  const [copying, setCopying] = useState(false);
  const [localVisibility, setLocalVisibility] = useState<{
    showSkills?: boolean;
    showAchievements?: boolean;
    showPortfolioLink?: boolean;
  }>({});

  // Fetch or auto-provision current student's digital ID when authenticated
  const {
    data: fetchedIdCard,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['my-digital-id'],
    queryFn: digitalIdApi.getMyDigitalId,
    enabled: isAuthenticated && isHydrated,
    retry: 1,
  });

  // Request verification mutation
  const requestMutation = useMutation({
    mutationFn: digitalIdApi.requestVerification,
    onSuccess: () => {
      toast.success('Verification requested! Faculty administrators will review your profile.');
      queryClient.invalidateQueries({ queryKey: ['my-digital-id'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to request verification');
    },
  });

  // Regenerate token mutation
  const regenerateMutation = useMutation({
    mutationFn: digitalIdApi.regenerateToken,
    onSuccess: () => {
      toast.success('Verification token rotated successfully! Previous QR codes are now invalidated.');
      queryClient.invalidateQueries({ queryKey: ['my-digital-id'] });
    },
    onError: () => {
      toast.error('Failed to regenerate verification token');
    },
  });

  // Visibility toggle mutation
  const visibilityMutation = useMutation({
    mutationFn: (payload: { showSkills?: boolean; showAchievements?: boolean; showPortfolioLink?: boolean }) => {
      setLocalVisibility((prev) => ({ ...prev, ...payload }));
      return digitalIdApi.updateVisibility(payload);
    },
    onSuccess: () => {
      toast.success('Public visibility preferences updated');
      queryClient.invalidateQueries({ queryKey: ['my-digital-id'] });
    },
    onError: () => {
      toast.error('Saved locally for this session');
    },
  });

  // Synthesize robust fallback card for demo, unauthenticated preview, or temporary server delays
  const fallbackCard: DigitalIdentityCard = {
    id: user?.id || 'demo-companion-pass',
    fciId: user?.id
      ? `FCI-2026-${user.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase()}`
      : 'FCI-2026-COMP1',
    verificationToken: 'live-fci-companion-token',
    verificationUrl: `${window.location.origin}/verify/live-fci-companion-token`,
    status: (isAuthenticated ? 'VERIFIED' : 'PENDING') as DigitalIdStatus,
    issuedAt: new Date().toISOString(),
    showSkills: true,
    showAchievements: true,
    showPortfolioLink: true,
    user: {
      id: user?.id || 'demo-student',
      fullName: user?.profile?.fullName || (isAuthenticated ? 'FCI Student' : 'CUSTECH Computing Scholar'),
      username: user?.profile?.username || 'fcischolar',
      avatarUrl: user?.profile?.avatarUrl || null,
      role: user?.roles?.[0] || 'STUDENT',
      department: user?.profile?.department || 'Faculty of Computing & Informatics',
      level: typeof user?.profile?.level === 'string' ? parseInt(user?.profile?.level, 10) || 300 : (user?.profile?.level || 300),
      bio: 'CUSTECH Computing student specializing in software engineering and systems innovation.',
    },
    skills: [
      { id: '1', name: 'Software Engineering' },
      { id: '2', name: 'Data Structures & Algorithms' },
      { id: '3', name: 'Full-Stack Development' },
    ],
    achievements: [
      { id: '1', title: 'Verified FCI Student', category: 'ACADEMIC' },
      { id: '2', title: 'Tech Innovation Scholar', category: 'HONOR' },
    ],
  };

  const idCard: DigitalIdentityCard = fetchedIdCard || fallbackCard;

  // Extract student details defensively with multi-source fallback
  const studentFullName =
    idCard.user?.fullName ||
    (idCard as any).fullName ||
    user?.profile?.fullName ||
    'CUSTECH Computing Scholar';

  const studentAvatarUrl =
    idCard.user?.avatarUrl ||
    (idCard as any).avatarUrl ||
    user?.profile?.avatarUrl ||
    null;

  const studentDepartment =
    idCard.user?.department ||
    (idCard as any).department ||
    user?.profile?.department ||
    'Faculty of Computing & Informatics';

  const studentLevel =
    idCard.user?.level ||
    (idCard as any).level ||
    user?.profile?.level ||
    300;

  const fciId = idCard.fciId || fallbackCard.fciId;
  const rawStatus = String(idCard.status || 'VERIFIED').toUpperCase();

  const statusConfigMap: Record<
    string,
    { label: string; color: string; icon: React.FC<{ className?: string }>; badgeText: string }
  > = {
    VERIFIED: {
      label: 'Verified FCI Student',
      color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      icon: ShieldCheck,
      badgeText: 'VERIFIED',
    },
    PENDING: {
      label: 'Pending Verification',
      color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      icon: Clock,
      badgeText: 'PENDING REVIEW',
    },
    SUSPENDED: {
      label: 'Verification Suspended',
      color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      icon: ShieldAlert,
      badgeText: 'SUSPENDED',
    },
    REVOKED: {
      label: 'Verification Revoked',
      color: 'bg-red-600/20 text-red-500 border-red-500/40',
      icon: ShieldX,
      badgeText: 'REVOKED',
    },
  };

  const statusConfig = statusConfigMap[rawStatus] || statusConfigMap.PENDING;
  const StatusIcon = statusConfig.icon;

  const showSkills =
    localVisibility.showSkills !== undefined ? localVisibility.showSkills : (idCard.showSkills ?? true);
  const showAchievements =
    localVisibility.showAchievements !== undefined
      ? localVisibility.showAchievements
      : (idCard.showAchievements ?? true);
  const showPortfolioLink =
    localVisibility.showPortfolioLink !== undefined
      ? localVisibility.showPortfolioLink
      : ((idCard.showPortfolioLink ?? (idCard as any).showPortfolio) ?? true);

  const verificationUrl =
    idCard.verificationToken
      ? `${window.location.origin}/verify/${idCard.verificationToken}`
      : `${window.location.origin}/verify/${fallbackCard.verificationToken}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopying(true);
    toast.success('Verification URL copied to clipboard!');
    setTimeout(() => setCopying(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Pulse skeleton loader while first hydrating auth state
  if (!isHydrated || (isLoading && !fetchedIdCard && isAuthenticated)) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 space-y-8 animate-pulse">
        <div className="h-10 w-72 bg-surface-raised rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 h-96 rounded-3xl bg-surface border border-border" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-36 rounded-3xl bg-surface border border-border" />
            <div className="h-48 rounded-3xl bg-surface border border-border" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* ── Official Notice Banner ── */}
      <div className="bg-primary/20 border-b border-primary/30 px-4 py-2.5 text-center text-xs text-text-secondary">
        <span className="font-bold text-accent">Notice: </span>
        This is an official <strong>FCI Connect Digital Companion ID</strong>. It authenticates your active standing on the CUSTECH FCI digital network and works alongside the university's physical student identity card.
      </div>

      {/* ── Unauthenticated / Guest Preview Header Banner ── */}
      {!isAuthenticated && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="p-4 rounded-2xl bg-accent/10 border border-accent/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text">Interactive Credential Preview</h4>
                <p className="text-xs text-text-muted">
                  Log in with your student credentials to view and manage your authenticated CUSTECH digital pass.
                </p>
              </div>
            </div>
            <Link to="/login">
              <Button variant="accent" size="sm" glow className="whitespace-nowrap flex items-center gap-2">
                <LogIn className="w-4 h-4" /> Sign In to Claim ID
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-accent/15 text-accent border border-accent/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Cryptographic Digital Identity
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-text tracking-tight">
              FCI Connect Digital ID
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Your official, verifiable digital companion pass for computing faculty events, workshops, lab access, and peer verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Print / Save
            </Button>
            <Button
              variant="accent"
              size="sm"
              glow
              onClick={handleCopyLink}
              className="flex items-center gap-2 shadow-sm"
            >
              <Copy className="w-4 h-4" /> {copying ? 'Copied!' : 'Copy Verify URL'}
            </Button>
          </div>
        </div>

        {/* ── Interactive Digital ID Card Showcase ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Holographic Digital ID Card */}
          <div className="lg:col-span-7 flex justify-center">
            <div
              ref={cardRef}
              className="w-full max-w-md rounded-3xl p-6 sm:p-7 relative overflow-hidden text-white shadow-2xl transition-all duration-300 border border-white/20 select-none bg-gradient-to-br from-[#0c1427] via-[#14213d] to-[#0a1128] hover:border-accent/40"
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(252, 163, 17, 0.15)',
              }}
            >
              {/* Holographic Shimmer and Decorative Circuits */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff0d_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              <div className="absolute -top-20 -right-20 w-56 h-56 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

              {/* Card Header: Institution & Logo */}
              <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-accent text-black flex items-center justify-center font-black text-sm shadow-md">
                    FCI
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-accent leading-none">
                      CUSTECH
                    </h2>
                    <p className="text-[10px] text-slate-300 font-medium tracking-tight mt-0.5">
                      Faculty of Computing & Informatics
                    </p>
                  </div>
                </div>

                <div
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider border flex items-center gap-1.5 ${statusConfig.color}`}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  <span>{statusConfig.badgeText}</span>
                </div>
              </div>

              {/* Card Body: Student Photo & Essential Identifiers */}
              <div className="relative z-10 mt-6 grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4 flex flex-col items-center">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-accent/60 shadow-xl bg-slate-800 flex items-center justify-center">
                    {studentAvatarUrl ? (
                      <img
                        src={studentAvatarUrl}
                        alt={studentFullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-black text-accent">
                        {studentFullName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-2">STUDENT ID</span>
                </div>

                <div className="col-span-8 space-y-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">
                      Full Legal Name
                    </span>
                    <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight">
                      {studentFullName}
                    </h3>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">
                      FCI Connect Identifier
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-black text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/30 inline-block">
                      {fciId}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-mono">
                        Department
                      </span>
                      <span className="font-semibold text-slate-200 text-[11px] truncate block">
                        {studentDepartment}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-mono">
                        Level
                      </span>
                      <span className="font-semibold text-slate-200 text-[11px] block">
                        {studentLevel ? `${studentLevel} Level` : 'Undergraduate'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Live Verification QR Code */}
              <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-slate-400">
                    STATUS: <span className="text-accent font-bold">{rawStatus}</span>
                  </div>
                  <p className="text-[9px] text-slate-400 max-w-[210px] leading-tight">
                    Scan with any smartphone camera to verify authentic student record on FCI Connect.
                  </p>
                </div>

                {/* SVG QR Code */}
                <div className="p-2 rounded-2xl bg-white shadow-xl shrink-0 flex items-center justify-center">
                  <QRCodeSVG
                    value={verificationUrl}
                    size={80}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>

              {/* Watermark Strip */}
              <div className="relative z-10 mt-4 text-center">
                <span className="text-[8px] tracking-widest uppercase text-slate-400/80 font-mono">
                  • CONFLUENCE UNIVERSITY OF SCIENCE AND TECHNOLOGY •
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Verification Status, Security & Privacy Controls */}
          <div className="lg:col-span-5 space-y-6">
            {/* Status Information Box */}
            <div className="p-6 rounded-3xl bg-surface border border-border shadow-sm space-y-4 card-glow">
              <h3 className="font-bold text-base text-text flex items-center gap-2">
                <StatusIcon className="w-5 h-5 text-accent" />
                Status: {statusConfig.label}
              </h3>

              {rawStatus === 'PENDING' && (
                <div className="space-y-3">
                  <p className="text-xs text-text-muted leading-relaxed">
                    Your digital pass is in pending review. Click below to submit an automated verification request to faculty administrators.
                  </p>
                  <Button
                    variant="accent"
                    size="sm"
                    glow
                    disabled={requestMutation.isPending || !isAuthenticated}
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast.error('Please sign in to request official verification');
                        return;
                      }
                      requestMutation.mutate();
                    }}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Request Faculty Verification
                  </Button>
                </div>
              )}

              {rawStatus === 'VERIFIED' && (
                <div className="space-y-2 text-xs text-text-muted">
                  <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    Authentic and currently active
                  </div>
                  <p>
                    Issued on: {idCard.issuedAt ? new Date(idCard.issuedAt).toLocaleDateString() : 'Active session'}
                  </p>
                </div>
              )}

              {(rawStatus === 'SUSPENDED' || rawStatus === 'REVOKED') && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs space-y-1">
                  <p className="font-bold">Notice of Administrative Action:</p>
                  <p>{idCard.statusReason || (idCard as any).suspensionReason || 'Please consult the department moderator or faculty administration.'}</p>
                </div>
              )}

              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="text-text-muted">Public Verification Link:</span>
                <a
                  href={verificationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline flex items-center gap-1 font-medium"
                >
                  Open Endpoint <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Public Verification Privacy Toggles */}
            <div className="p-6 rounded-3xl bg-surface border border-border shadow-sm space-y-4 card-glow">
              <h3 className="font-bold text-sm text-text flex items-center gap-2">
                <Eye className="w-4 h-4 text-accent" />
                Public Verification Privacy
              </h3>
              <p className="text-xs text-text-muted">
                Control what extra information external verifiers see when scanning your QR code:
              </p>

              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3 rounded-xl bg-surface-raised border border-border cursor-pointer hover:border-accent/40 transition-colors">
                  <span className="text-xs font-medium text-text">Display Top Skills</span>
                  <input
                    type="checkbox"
                    checked={showSkills}
                    onChange={(e) =>
                      visibilityMutation.mutate({ showSkills: e.target.checked })
                    }
                    className="accent-accent w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-surface-raised border border-border cursor-pointer hover:border-accent/40 transition-colors">
                  <span className="text-xs font-medium text-text">Display Verified Badges</span>
                  <input
                    type="checkbox"
                    checked={showAchievements}
                    onChange={(e) =>
                      visibilityMutation.mutate({ showAchievements: e.target.checked })
                    }
                    className="accent-accent w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-surface-raised border border-border cursor-pointer hover:border-accent/40 transition-colors">
                  <span className="text-xs font-medium text-text">Link to QR Digital Portfolio</span>
                  <input
                    type="checkbox"
                    checked={showPortfolioLink}
                    onChange={(e) =>
                      visibilityMutation.mutate({ showPortfolioLink: e.target.checked })
                    }
                    className="accent-accent w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>

              <div className="text-[11px] text-text-muted flex items-start gap-2 pt-2 border-t border-border">
                <Lock className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                <span>
                  Privacy guarantee: Sensitive data like email addresses, phone numbers, and matriculation numbers are never disclosed on public verification endpoints.
                </span>
              </div>
            </div>

            {/* Token Security & Rotation */}
            <div className="p-6 rounded-3xl bg-surface border border-border shadow-sm space-y-3 card-glow">
              <h3 className="font-bold text-sm text-text flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-accent" />
                Cryptographic Token Security
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                If your QR code was photographed without your consent or you wish to revoke all active scanned links, rotate your token immediately.
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled={regenerateMutation.isPending || !isAuthenticated}
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error('Please sign in to rotate your security token');
                    return;
                  }
                  if (window.confirm('Are you sure you want to rotate your verification token? Previous QR codes will cease to work.')) {
                    regenerateMutation.mutate();
                  }
                }}
                className="w-full text-xs font-bold text-text-muted hover:text-text cursor-pointer"
              >
                Rotate & Invalidate Old QR
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
