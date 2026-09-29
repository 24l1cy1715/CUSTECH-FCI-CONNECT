import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Search,
  RefreshCw,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
} from 'lucide-react';
import { digitalIdApi } from '@/api/digitalIdApi';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import toast from 'react-hot-toast';

export const AdminDigitalIdManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-digital-id', search, statusFilter],
    queryFn: () =>
      digitalIdApi.adminList({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        limit: 30,
      }),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      digitalIdApi.adminVerify(userId, reason),
    onSuccess: () => {
      toast.success('Digital identity verified successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-digital-id'] });
    },
    onError: () => toast.error('Failed to verify identity'),
  });

  const suspendMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      digitalIdApi.adminSuspend(userId, reason),
    onSuccess: () => {
      toast.success('Digital identity suspended.');
      queryClient.invalidateQueries({ queryKey: ['admin-digital-id'] });
    },
    onError: () => toast.error('Failed to suspend identity'),
  });

  const revokeMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      digitalIdApi.adminRevoke(userId, reason),
    onSuccess: () => {
      toast.success('Digital identity revoked.');
      queryClient.invalidateQueries({ queryKey: ['admin-digital-id'] });
    },
    onError: () => toast.error('Failed to revoke identity'),
  });

  const regenerateMutation = useMutation({
    mutationFn: (userId: string) => digitalIdApi.adminRegenerate(userId),
    onSuccess: () => {
      toast.success('New cryptographic verification token generated!');
      queryClient.invalidateQueries({ queryKey: ['admin-digital-id'] });
    },
    onError: () => toast.error('Failed to regenerate token'),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" />
            Digital ID & QR Verification Governance
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Supervise student digital identities, manage official verification clearances, and inspect security audit records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or FCI ID..."
            className="px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="REVOKED">Revoked</option>
          </select>
        </div>
      </div>

      {isError ? (
        <div className="p-8 text-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-sm font-semibold">Unable to load student digital identities</p>
          <p className="text-xs text-slate-400">Verify administrator clearance or database connectivity.</p>
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry Loading
            </Button>
          </div>
        </div>
      ) : isLoading ? (
        <div className="h-64 rounded-2xl bg-white/[0.02] border border-white/10 animate-pulse" />
      ) : data?.identities && data.identities.length > 0 ? (
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/[0.05] text-slate-400 uppercase font-mono text-[10px] border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">FCI Connect ID</th>
                <th className="px-4 py-3">Academic Standing</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Scans</th>
                <th className="px-4 py-3 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {data.identities.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-white">{item.user?.fullName || (item.user as any)?.profile?.fullName || 'FCI Student'}</p>
                    <p className="text-[11px] text-slate-400">{item.user?.email || 'N/A'}</p>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-accent">
                    {item.fciId}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    <p>{item.user?.department || (item.user as any)?.profile?.department || 'Computing Sciences'}</p>
                    <p className="text-[10px] text-slate-400">
                      {item.user?.level || (item.user as any)?.profile?.level ? `${item.user?.level || (item.user as any)?.profile?.level} Level` : 'Undergraduate'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'VERIFIED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : item.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {item.status}
                    </span>
                    {item.statusReason && (
                      <p className="text-[10px] text-slate-400 mt-1 max-w-[150px] truncate" title={item.statusReason}>
                        {item.statusReason}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400">
                    {item._count?.verificationLogs || 0} scans
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status !== 'VERIFIED' && (
                        <button
                          onClick={() => {
                            const reason = window.prompt('Verification notes (optional):');
                            verifyMutation.mutate({ userId: item.user.id, reason: reason || undefined });
                          }}
                          disabled={verifyMutation.isPending}
                          title="Grant Verification"
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                        >
                          Verify
                        </button>
                      )}
                      {item.status !== 'SUSPENDED' && (
                        <button
                          onClick={() => {
                            const reason = window.prompt('Reason for suspension:');
                            if (reason) {
                              suspendMutation.mutate({ userId: item.user.id, reason });
                            }
                          }}
                          disabled={suspendMutation.isPending}
                          title="Suspend"
                          className="px-2 py-1 rounded-lg text-xs font-medium bg-amber-500/15 text-amber-400 hover:bg-amber-500/30 transition-colors"
                        >
                          Suspend
                        </button>
                      )}
                      {item.status !== 'REVOKED' && (
                        <button
                          onClick={() => {
                            const reason = window.prompt('Reason for revocation:');
                            if (reason) {
                              revokeMutation.mutate({ userId: item.user.id, reason });
                            }
                          }}
                          disabled={revokeMutation.isPending}
                          title="Revoke"
                          className="px-2 py-1 rounded-lg text-xs font-medium bg-rose-500/15 text-rose-400 hover:bg-rose-500/30 transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm('Force token regeneration for this student?')) {
                            regenerateMutation.mutate(item.user.id);
                          }
                        }}
                        disabled={regenerateMutation.isPending}
                        title="Rotate QR Token"
                        className="p-1 rounded-lg bg-white/[0.05] text-slate-400 hover:text-white transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-slate-400">
          No student digital identities matching criteria.
        </div>
      )}
    </div>
  );
};
