import React from 'react';
import { motion } from 'framer-motion';
import {
  Inbox,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { useInvitations, useRespondInvitation } from '@/api/teamBuilderApi';
import { TeamInvitation } from '@/types/teamBuilder';
import { Button } from '@/components/common/Button';
import toast from 'react-hot-toast';

export const InvitationsTray: React.FC = () => {
  const { data, isLoading, refetch } = useInvitations();
  const respondMutation = useRespondInvitation();

  const handleRespond = async (id: string, status: 'ACCEPTED' | 'DECLINED') => {
    try {
      await respondMutation.mutateAsync({ id, payload: { status } });
      toast.success(status === 'ACCEPTED' ? 'Invitation accepted! Welcome to the team.' : 'Invitation declined.');
      refetch();
    } catch (err: any) {
      toast.error('Failed to update invitation status.');
    }
  };

  const received = data?.received || [];
  const sent = data?.sent || [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-surface-raised rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Received Invitations ──────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
          <Inbox className="w-4 h-4 text-accent" />
          Received Project Invitations ({received.length})
        </h3>

        {received.length === 0 ? (
          <div className="p-6 text-center bg-surface-raised/30 rounded-2xl border border-dashed border-border text-xs text-text-muted">
            No received invitations at the moment. Keep your skills up to date to get invited by project leads!
          </div>
        ) : (
          <div className="space-y-3">
            {received.map((inv) => (
              <div
                key={inv.id}
                className="p-4 sm:p-5 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <img
                    src={
                      inv.sender.avatarUrl ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${inv.sender.fullName}`
                    }
                    alt={inv.sender.fullName}
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-border"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-text">
                        {inv.sender.fullName}
                      </span>
                      <span className="text-xs text-text-muted">
                        invited you as <strong className="text-accent font-semibold">{inv.role}</strong>
                      </span>
                    </div>

                    {inv.project && (
                      <p className="text-xs font-medium text-text-secondary">
                        Project: <span className="text-text">{inv.project.title}</span>
                      </p>
                    )}

                    {inv.message && (
                      <p className="text-xs text-text-muted bg-surface-raised/50 p-2 rounded-lg border border-border/50 italic line-clamp-2">
                        &quot;{inv.message}&quot;
                      </p>
                    )}

                    <div className="text-[10px] text-text-muted font-mono">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Status or Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {inv.status === 'PENDING' ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRespond(inv.id, 'DECLINED')}
                        isLoading={respondMutation.isPending}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        variant="accent"
                        onClick={() => handleRespond(inv.id, 'ACCEPTED')}
                        isLoading={respondMutation.isPending}
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      >
                        Accept
                      </Button>
                    </>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                        inv.status === 'ACCEPTED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}
                    >
                      {inv.status === 'ACCEPTED' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Declined
                        </>
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Sent Invitations ──────────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
          <Send className="w-4 h-4 text-accent" />
          Sent Invitations ({sent.length})
        </h3>

        {sent.length === 0 ? (
          <div className="p-6 text-center bg-surface-raised/30 rounded-2xl border border-dashed border-border text-xs text-text-muted">
            You haven&apos;t invited anyone to a project yet. Use the Team Matcher above to discover ideal candidates!
          </div>
        ) : (
          <div className="space-y-3">
            {sent.map((inv) => {
              const targetUser = inv.recipient || inv.receiver || { fullName: 'Student', avatarUrl: '' };
              return (
                <div
                  key={inv.id}
                  className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        targetUser.avatarUrl ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${targetUser.fullName}`
                      }
                      alt={targetUser.fullName}
                      className="w-9 h-9 rounded-full object-cover shrink-0 border border-border"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text truncate">
                        Invited {targetUser.fullName} as{' '}
                        <span className="text-accent">{inv.role}</span>
                      </p>
                      <p className="text-[11px] text-text-muted">
                        Sent on {new Date(inv.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 border ${
                    inv.status === 'ACCEPTED'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : inv.status === 'DECLINED'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {inv.status === 'PENDING' && <Clock className="w-3 h-3" />}
                  {inv.status}
                </span>
              </div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
};
