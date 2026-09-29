import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Plus,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { achievementsApi, AdminSubmission, AchievementCategory } from '@/api/achievementsApi';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import toast from 'react-hot-toast';

export const AdminAchievementsManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] = useState<AdminSubmission | null>(null);
  const [reviewAction, setReviewAction] = useState<'VERIFY' | 'REJECT'>('VERIFY');
  const [reviewNotes, setReviewNotes] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New achievement form state
  const [newAchievement, setNewAchievement] = useState({
    name: '',
    description: '',
    category: 'TECHNICAL' as AchievementCategory,
    badgeIcon: 'Award',
    points: 100,
    criteria: '',
  });

  // 1. Fetch pending submissions
  const { data: subData, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['admin-achievement-submissions'],
    queryFn: () => achievementsApi.getAdminSubmissions({ status: 'PENDING' }),
  });

  // 2. Fetch catalog
  const { data: catalog = [], isLoading: isLoadingCatalog } = useQuery({
    queryKey: ['admin-achievement-catalog'],
    queryFn: () => achievementsApi.getCatalog(),
  });

  // Review mutation
  const reviewMutation = useMutation({
    mutationFn: ({ id, action, notes }: { id: string; action: 'VERIFY' | 'REJECT'; notes?: string }) =>
      achievementsApi.reviewSubmission(id, { action, notes }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-achievement-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['my-achievements'] });
      toast.success(vars.action === 'VERIFY' ? 'Achievement verified and reputation points awarded!' : 'Submission rejected with feedback notes.');
      setSelectedSubmission(null);
      setReviewNotes('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to review submission');
    },
  });

  // Create achievement mutation
  const createMutation = useMutation({
    mutationFn: (data: typeof newAchievement) => achievementsApi.createAchievement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-achievement-catalog'] });
      toast.success('Custom achievement created successfully!');
      setCreateModalOpen(false);
      setNewAchievement({
        name: '',
        description: '',
        category: 'TECHNICAL',
        badgeIcon: 'Award',
        points: 100,
        criteria: '',
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to create achievement');
    },
  });

  return (
    <div className="space-y-8">
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-accent" />
            Achievements &amp; Reputation Governance
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Review submitted student credentials, verify proof for reputation awards, and configure platform achievements.
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() => setCreateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-bold shrink-0"
        >
          Create Achievement
        </Button>
      </div>

      {/* ── Submissions Review Queue ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <span>Pending Evidence Submissions</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono">
              {subData?.submissions?.length || 0}
            </span>
          </h3>
        </div>

        {isLoadingSubmissions ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading pending submissions...</div>
        ) : !subData || subData.submissions.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-sm font-bold text-white">Review Queue Clear</div>
            <p className="text-xs text-slate-400">All student achievement evidence has been reviewed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subData.submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-5 rounded-2xl bg-[#0E172A] border border-white/10 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                        {sub.achievement.category}
                      </span>
                      <h4 className="font-extrabold text-sm sm:text-base text-white">
                        {sub.achievement.name}
                      </h4>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                      +{sub.achievement.points} pts
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-300 space-y-1">
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>{sub.user?.profile?.fullName || sub.user.email}</span>
                      <span className="text-[10px] text-slate-400 font-mono">@{sub.user?.profile?.username}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {sub.user?.profile?.department?.replace('_', ' ')} · Level {sub.user?.profile?.level?.replace('LEVEL_', '')}
                    </div>
                  </div>

                  {sub.evidenceUrl && (
                    <div className="text-xs">
                      <span className="text-[11px] text-slate-400 block mb-0.5">Proof Link:</span>
                      <a
                        href={sub.evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent underline flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{sub.evidenceUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  )}

                  {sub.evidenceNotes && (
                    <div className="text-xs text-slate-300 bg-white/[0.02] p-2 rounded-lg">
                      <span className="text-[10px] font-bold text-slate-400 block">Student Note:</span>
                      <p>{sub.evidenceNotes}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <Button
                    variant="accent"
                    size="sm"
                    className="flex-1 font-bold bg-emerald-500 hover:bg-emerald-600 text-black border-none"
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={() => {
                      setSelectedSubmission(sub);
                      setReviewAction('VERIFY');
                    }}
                  >
                    Verify &amp; Award
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 font-bold border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
                    leftIcon={<XCircle className="w-4 h-4" />}
                    onClick={() => {
                      setSelectedSubmission(sub);
                      setReviewAction('REJECT');
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Catalog Overview ── */}
      <div className="space-y-4 pt-6 border-t border-white/10">
        <h3 className="font-bold text-sm text-white uppercase tracking-wider">
          Platform Achievement Catalog ({catalog.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {catalog.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-[#0E172A] border border-white/10 flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-accent uppercase">{item.category}</span>
                <div className="font-bold text-white text-xs">{item.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">+{item.points} pts</div>
              </div>

              <Badge variant="accent" size="sm">
                Active
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* ── Verification Review Modal ── */}
      <AnimatePresence>
        {selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0E172A] border border-white/15 max-w-md w-full rounded-2xl p-6 text-white space-y-4 shadow-2xl"
            >
              <h3 className="font-bold text-base">
                {reviewAction === 'VERIFY' ? 'Confirm Verification' : 'Reject Submission'}
              </h3>

              <p className="text-xs text-slate-300">
                {reviewAction === 'VERIFY'
                  ? `Are you sure you want to verify "${selectedSubmission.achievement.name}" for ${
                      selectedSubmission.user?.profile?.fullName || selectedSubmission.user.email
                    }? This will credit +${selectedSubmission.achievement.points} reputation points immediately.`
                  : `Please provide a constructive reason or request for further evidence:`}
              </p>

              {reviewAction === 'REJECT' && (
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Please provide a repository with public commits or valid verification URL..."
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                />
              )}

              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant={reviewAction === 'VERIFY' ? 'accent' : 'outline'}
                  size="sm"
                  className="flex-1 font-bold"
                  onClick={() =>
                    reviewMutation.mutate({
                      id: selectedSubmission.id,
                      action: reviewAction,
                      notes: reviewNotes,
                    })
                  }
                  disabled={reviewMutation.isPending}
                >
                  {reviewMutation.isPending
                    ? 'Processing...'
                    : reviewAction === 'VERIFY'
                    ? 'Confirm & Award'
                    : 'Confirm Rejection'}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSubmission(null)}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Create Custom Achievement Modal ── */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0E172A] border border-white/15 max-w-lg w-full rounded-2xl p-6 text-white space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="font-extrabold text-lg text-white">Create Platform Achievement</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Achievement Name:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AI Innovation Sprint"
                    value={newAchievement.name}
                    onChange={(e) => setNewAchievement({ ...newAchievement, name: e.target.value })}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Category:
                    </label>
                    <select
                      value={newAchievement.category}
                      onChange={(e) =>
                        setNewAchievement({ ...newAchievement, category: e.target.value as any })
                      }
                      className="w-full bg-[#14213D] border border-white/10 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="ACADEMIC">Academic</option>
                      <option value="TECHNICAL">Technical</option>
                      <option value="COMMUNITY">Community</option>
                      <option value="CAREER">Career</option>
                      <option value="FCI_CONNECT">FCI Connect</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Points Reward:
                    </label>
                    <input
                      type="number"
                      value={newAchievement.points}
                      onChange={(e) =>
                        setNewAchievement({ ...newAchievement, points: Number(e.target.value) })
                      }
                      className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Description:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the achievement..."
                    value={newAchievement.description}
                    onChange={(e) =>
                      setNewAchievement({ ...newAchievement, description: e.target.value })
                    }
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-white resize-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Verification Criteria:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Detailed conditions required for moderator verification..."
                    value={newAchievement.criteria}
                    onChange={(e) =>
                      setNewAchievement({ ...newAchievement, criteria: e.target.value })
                    }
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-white resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="accent"
                    size="sm"
                    className="flex-1 font-bold"
                    onClick={() => createMutation.mutate(newAchievement)}
                    disabled={!newAchievement.name || !newAchievement.description || createMutation.isPending}
                  >
                    {createMutation.isPending ? 'Creating...' : 'Create Achievement'}
                  </Button>

                  <Button variant="ghost" size="sm" onClick={() => setCreateModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
