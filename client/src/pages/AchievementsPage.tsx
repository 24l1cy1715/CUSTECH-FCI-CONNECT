import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Award,
  Medal,
  CheckCircle2,
  Clock,
  Lock,
  ChevronRight,
  ExternalLink,
  Sparkles,
  UserCheck,
  BookOpen,
  Presentation,
  Rocket,
  GitPullRequest,
  Github,
  Share2,
  Cpu,
  HeartHandshake,
  Users,
  GraduationCap,
  Briefcase,
  Network,
  UserPlus,
  Upload,
  Info,
  X,
  Compass,
  Hammer,
  Lightbulb,
  Crown,
} from 'lucide-react';
import {
  achievementsApi,
  AchievementItem,
  AchievementCategory,
  MyAchievementsResponse,
  LeaderboardResponse,
} from '@/api/achievementsApi';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import toast from 'react-hot-toast';

// Icon mapper helper
const getBadgeIcon = (name: string) => {
  switch (name) {
    case 'UserCheck': return UserCheck;
    case 'BookOpen': return BookOpen;
    case 'Presentation': return Presentation;
    case 'Award': return Award;
    case 'Rocket': return Rocket;
    case 'GitPullRequest': return GitPullRequest;
    case 'Github': return Github;
    case 'Share2': return Share2;
    case 'Cpu': return Cpu;
    case 'Trophy': return Trophy;
    case 'HeartHandshake': return HeartHandshake;
    case 'Users': return Users;
    case 'GraduationCap': return GraduationCap;
    case 'Briefcase': return Briefcase;
    case 'CheckCircle2': return CheckCircle2;
    case 'Network': return Network;
    case 'UserPlus': return UserPlus;
    case 'Compass': return Compass;
    case 'Hammer': return Hammer;
    case 'Lightbulb': return Lightbulb;
    case 'Crown': return Crown;
    default: return Medal;
  }
};

const CATEGORIES: { label: string; value: AchievementCategory | 'ALL' }[] = [
  { label: 'All Categories', value: 'ALL' },
  { label: 'Academic', value: 'ACADEMIC' },
  { label: 'Technical', value: 'TECHNICAL' },
  { label: 'Community', value: 'COMMUNITY' },
  { label: 'Career', value: 'CAREER' },
  { label: 'FCI Connect', value: 'FCI_CONNECT' },
];

export const AchievementsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'catalog' | 'leaderboard'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING' | 'LOCKED'>('ALL');
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementItem | null>(null);
  const [_submitModalOpen, setSubmitModalOpen] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [issuer, setIssuer] = useState('');

  // Leaderboard filters
  const [lbDepartment, setLbDepartment] = useState<string>('');
  const [lbLevel, setLbLevel] = useState<string>('');

  // 1. Fetch user achievements & stats
  const { data: myData, isLoading: isLoadingAchievements } = useQuery<MyAchievementsResponse>({
    queryKey: ['my-achievements'],
    queryFn: achievementsApi.getMyAchievements,
    enabled: isAuthenticated,
  });

  // 2. Fetch leaderboard
  const { data: lbData, isLoading: isLoadingLeaderboard } = useQuery<LeaderboardResponse>({
    queryKey: ['achievements-leaderboard', lbDepartment, lbLevel],
    queryFn: () =>
      achievementsApi.getLeaderboard({
        department: lbDepartment || undefined,
        level: lbLevel || undefined,
      }),
  });

  // Evidence submission mutation
  const submitEvidenceMutation = useMutation({
    mutationFn: ({ achievementId, data }: { achievementId: string; data: any }) =>
      achievementsApi.submitEvidence(achievementId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-achievements'] });
      toast.success('Evidence submitted! A faculty moderator will review your verification.');
      setSubmitModalOpen(false);
      setEvidenceUrl('');
      setEvidenceNotes('');
      setIssuer('');
      setSelectedAchievement(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to submit evidence');
    },
  });

  const rep = myData?.reputation || {
    currentLevel: 'Explorer',
    badgeIcon: 'Compass',
    description: 'Beginning the computing journey at CUSTECH.',
    points: user?.profile?.communityPoints || 0,
    nextLevel: 'Contributor',
    pointsForNextLevel: 150,
    progressPercentage: 20,
  };

  const levelIconName = rep.badgeIcon;
  const LevelIconComponent = getBadgeIcon(levelIconName);

  // Filtered achievements list
  const filteredAchievements = (myData?.achievements || []).filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (statusFilter === 'VERIFIED' && item.status !== 'VERIFIED') return false;
    if (statusFilter === 'PENDING' && item.status !== 'PENDING') return false;
    if (statusFilter === 'LOCKED' && item.isEarned) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8">
      {/* ── Level & Reputation Header Card ── */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0D1B2A] via-[#14213D] to-[#1F2C46] text-white p-6 sm:p-8 shadow-xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-primary/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Level Info */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-accent to-amber-500 text-black flex items-center justify-center font-bold text-2xl shadow-lg shadow-accent/20 shrink-0">
              <LevelIconComponent className="w-9 h-9 sm:w-11 sm:h-11" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-accent uppercase">
                  Faculty Reputation Tier
                </span>
                <Badge variant="accent" size="sm">
                  Tier {rep.currentLevel}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {rep.currentLevel}
              </h1>

              <p className="text-xs sm:text-sm text-white/70 max-w-xl">
                {rep.description}
              </p>
            </div>
          </div>

          {/* Points & Progress Meter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white/[0.06] border border-white/10 rounded-2xl p-4 sm:p-5 shrink-0">
            <div className="text-center sm:text-left pr-0 sm:pr-4 sm:border-r border-white/10">
              <div className="text-[10px] text-white/60 font-bold uppercase tracking-wider">
                Reputation Points
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-extrabold text-accent">
                {rep.points.toLocaleString()}
              </div>
              <div className="text-[11px] text-white/50">Verified Ledger</div>
            </div>

            <div className="space-y-2 min-w-[200px]">
              <div className="flex justify-between text-xs font-medium text-white/80">
                <span>Next: {rep.nextLevel || 'Max Rank'}</span>
                <span>{rep.progressPercentage}%</span>
              </div>

              <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rep.progressPercentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-accent to-amber-400 rounded-full"
                />
              </div>

              <div className="text-[10px] text-white/60 text-right">
                {rep.pointsForNextLevel
                  ? `${rep.pointsForNextLevel} pts to ${rep.nextLevel}`
                  : 'Highest rank attained!'}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        {myData && (
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                {myData.stats.totalEarned}
              </div>
              <div className="text-[11px] text-white/60 uppercase font-semibold">Total Earned</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
                {myData.stats.verifiedCount}
              </div>
              <div className="text-[11px] text-white/60 uppercase font-semibold">Verified Badges</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400">
                {myData.stats.pendingCount}
              </div>
              <div className="text-[11px] text-white/60 uppercase font-semibold">Pending Review</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-accent">
                {myData.stats.totalCatalog}
              </div>
              <div className="text-[11px] text-white/60 uppercase font-semibold">Platform Catalog</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Main Navigation Tabs ── */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'catalog' ? 'accent' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('catalog')}
            leftIcon={<Trophy className="w-4 h-4" />}
            className="font-bold"
          >
            Achievements Catalog
          </Button>

          <Button
            variant={activeTab === 'leaderboard' ? 'accent' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('leaderboard')}
            leftIcon={<Crown className="w-4 h-4" />}
            className="font-bold"
          >
            Faculty Leaderboard
          </Button>
        </div>
      </div>

      {/* ── Tab 1: Achievements Catalog View ── */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Category & Status Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-3 sm:p-4 rounded-2xl border border-border">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setSelectedCategory(c.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === c.value
                      ? 'bg-primary text-white dark:bg-accent dark:text-black font-bold'
                      : 'text-text-muted hover:bg-surface-raised hover:text-text'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs text-text-muted hidden sm:inline">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-surface-raised border border-border text-xs rounded-xl px-2.5 py-1.5 text-text focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="ALL">All Badges</option>
                <option value="VERIFIED">Verified Only</option>
                <option value="PENDING">Pending Review</option>
                <option value="LOCKED">Unearned / Locked</option>
              </select>
            </div>
          </div>

          {/* Achievement Grid */}
          {isLoadingAchievements ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-44 bg-surface rounded-2xl border border-border animate-pulse" />
              ))}
            </div>
          ) : filteredAchievements.length === 0 ? (
            <Card className="text-center py-12 space-y-3">
              <Trophy className="w-10 h-10 text-text-muted mx-auto" />
              <h3 className="font-bold text-base text-text">No achievements found</h3>
              <p className="text-xs text-text-secondary">Try switching the category or status filter.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((item) => {
                const IconComponent = getBadgeIcon(item.badgeIcon);
                const isVerified = item.status === 'VERIFIED';
                const isPending = item.status === 'PENDING';

                return (
                  <Card
                    key={item.id}
                    hoverable
                    onClick={() => setSelectedAchievement(item)}
                    className={`p-5 rounded-2xl cursor-pointer transition-all border-2 relative overflow-hidden flex flex-col justify-between space-y-4 ${
                      isVerified
                        ? 'border-emerald-500/30 bg-surface dark:bg-[#0c1926]'
                        : isPending
                        ? 'border-amber-500/30 bg-surface dark:bg-[#1a1710]'
                        : 'border-border bg-surface opacity-85 hover:opacity-100'
                    }`}
                  >
                    <div>
                      {/* Top badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            isVerified
                              ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                              : isPending
                              ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                              : 'bg-surface-raised text-text-muted border border-border'
                          }`}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className="font-mono text-xs font-extrabold text-accent">
                            +{item.points} pts
                          </span>

                          {isVerified ? (
                            <Badge variant="success" size="sm" className="gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </Badge>
                          ) : isPending ? (
                            <Badge variant="warning" size="sm" className="gap-1">
                              <Clock className="w-3 h-3" /> In Review
                            </Badge>
                          ) : (
                            <Badge variant="neutral" size="sm" className="gap-1">
                              <Lock className="w-3 h-3" /> Locked
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Title & Category */}
                      <div className="mt-3 space-y-1">
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                          {item.category.replace('_', ' ')}
                        </div>
                        <h3 className="font-bold text-sm sm:text-base text-text">
                          {item.name}
                        </h3>
                        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                      {isVerified ? (
                        <span className="text-[11px] text-emerald-500 font-semibold">
                          Earned badge
                        </span>
                      ) : isPending ? (
                        <span className="text-[11px] text-amber-500 font-semibold">
                          Awaiting moderator verification
                        </span>
                      ) : (
                        <span className="text-[11px] text-accent font-semibold flex items-center gap-1">
                          <span>Submit proof</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      )}

                      <span className="text-[11px] text-text-muted">Details</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Leaderboard View ── */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          {/* Department & Level Filter */}
          <div className="flex flex-col sm:flex-row gap-3 bg-surface p-4 rounded-2xl border border-border">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">
                Filter Department
              </label>
              <select
                value={lbDepartment}
                onChange={(e) => setLbDepartment(e.target.value)}
                className="w-full bg-surface-raised border border-border text-xs rounded-xl px-3 py-2 text-text"
              >
                <option value="">All FCI Departments</option>
                <option value="COMPUTER_SCIENCE">Computer Science</option>
                <option value="CYBER_SECURITY">Cyber Security</option>
                <option value="SOFTWARE_ENGINEERING">Software Engineering</option>
                <option value="DATA_SCIENCE">Data Science</option>
                <option value="INFORMATION_TECHNOLOGY">Information Technology</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">
                Filter Level
              </label>
              <select
                value={lbLevel}
                onChange={(e) => setLbLevel(e.target.value)}
                className="w-full bg-surface-raised border border-border text-xs rounded-xl px-3 py-2 text-text"
              >
                <option value="">All Academic Levels</option>
                <option value="LEVEL_100">100 Level</option>
                <option value="LEVEL_200">200 Level</option>
                <option value="LEVEL_300">300 Level</option>
                <option value="LEVEL_400">400 Level</option>
                <option value="LEVEL_500">500 Level</option>
              </select>
            </div>
          </div>

          {/* Leaderboard Table / Cards */}
          <Card className="p-0 overflow-hidden divide-y divide-border">
            {isLoadingLeaderboard ? (
              <div className="p-8 text-center text-xs text-text-muted">Loading leaderboard...</div>
            ) : !lbData || lbData.entries.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-muted">No student entries matching filters.</div>
            ) : (
              lbData.entries.map((entry) => {
                return (
                  <div
                    key={entry.userId}
                    className={`flex items-center justify-between p-4 transition-colors ${
                      entry.userId === user?.id
                        ? 'bg-accent/10 border-l-4 border-l-accent'
                        : 'hover:bg-surface-raised'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Rank Number */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                          entry.rank === 1
                            ? 'bg-amber-400 text-black shadow-sm'
                            : entry.rank === 2
                            ? 'bg-slate-300 text-black'
                            : entry.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-surface-raised text-text-muted'
                        }`}
                      >
                        #{entry.rank}
                      </div>

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                        {entry.avatarUrl ? (
                          <img src={entry.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          entry.fullName.charAt(0)
                        )}
                      </div>

                      {/* Name & Academic info */}
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-text flex items-center gap-2">
                          <span>{entry.fullName}</span>
                          {entry.userId === user?.id && (
                            <Badge variant="accent" size="sm">You</Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-text-muted">
                          @{entry.username} · {entry.department?.replace('_', ' ')} · Level {entry.level?.replace('LEVEL_', '')}
                        </div>
                      </div>
                    </div>

                    {/* Tier badge & Points */}
                    <div className="text-right">
                      <div className="font-mono font-extrabold text-sm sm:text-base text-accent">
                        {entry.points.toLocaleString()} pts
                      </div>
                      <Badge variant="neutral" size="sm">
                        {entry.levelName}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </Card>
        </div>
      )}

      {/* ── Detail / Evidence Submission Modal ── */}
      <AnimatePresence>
        {selectedAchievement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface max-w-lg w-full rounded-3xl p-6 border border-border shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => {
                  setSelectedAchievement(null);
                  setSubmitModalOpen(false);
                }}
                className="absolute top-5 right-5 text-text-muted hover:text-text p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-accent/20 text-accent flex items-center justify-center shrink-0 border border-accent/30">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-text">
                    {selectedAchievement.name}
                  </h3>
                  <span className="text-xs font-mono text-accent font-bold">
                    +{selectedAchievement.points} Reputation Points
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-text-secondary">
                <div>
                  <span className="font-bold text-text block mb-0.5">Description:</span>
                  <p>{selectedAchievement.description}</p>
                </div>

                {selectedAchievement.criteria && (
                  <div className="p-3 bg-surface-raised rounded-xl border border-border">
                    <span className="font-bold text-text block mb-0.5 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-accent" />
                      Verification Criteria:
                    </span>
                    <p>{selectedAchievement.criteria}</p>
                  </div>
                )}

                {/* Status info if already submitted */}
                {selectedAchievement.status === 'VERIFIED' && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-500 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Verified &amp; Credited
                    </span>
                    <p className="text-[11px] text-text-secondary">
                      This achievement was officially approved. Points are permanently recorded in your ledger.
                    </p>
                  </div>
                )}

                {selectedAchievement.status === 'PENDING' && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> Pending Faculty Verification
                    </span>
                    <p className="text-[11px] text-text-secondary">
                      Your submission is currently in the review queue.
                    </p>
                    {selectedAchievement.evidenceUrl && (
                      <p className="text-[11px] truncate">
                        Link: <a href={selectedAchievement.evidenceUrl} target="_blank" rel="noreferrer" className="underline">{selectedAchievement.evidenceUrl}</a>
                      </p>
                    )}
                  </div>
                )}

                {selectedAchievement.rejectionReason && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 space-y-1">
                    <span className="font-bold">Feedback / Additional Proof Needed:</span>
                    <p className="text-[11px] text-text-secondary">{selectedAchievement.rejectionReason}</p>
                  </div>
                )}
              </div>

              {/* Submission Form for unearned/rejected achievements */}
              {(!selectedAchievement.isEarned || selectedAchievement.status === 'REJECTED') && (
                <div className="pt-3 border-t border-border space-y-3">
                  <h4 className="font-bold text-xs text-text flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-accent" />
                    Submit Evidence for Verification
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-text-muted block mb-1">
                        Proof URL (GitHub Repo, Certificate URL, Live Demo):
                      </label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={evidenceUrl}
                        onChange={(e) => setEvidenceUrl(e.target.value)}
                        className="w-full bg-surface-raised border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-text-muted block mb-1">
                        Issuer / Organization (Optional):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AWS, Cisco, CUSTECH Tech Club"
                        value={issuer}
                        onChange={(e) => setIssuer(e.target.value)}
                        className="w-full bg-surface-raised border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-text-muted block mb-1">
                        Additional Notes / Explanation:
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Describe your role, repository contributions, or certification details..."
                        value={evidenceNotes}
                        onChange={(e) => setEvidenceNotes(e.target.value)}
                        className="w-full bg-surface-raised border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                      />
                    </div>

                    <Button
                      variant="accent"
                      size="sm"
                      className="w-full font-bold shadow-sm"
                      onClick={() =>
                        submitEvidenceMutation.mutate({
                          achievementId: selectedAchievement.id,
                          data: { evidenceUrl, evidenceNotes, issuer },
                        })
                      }
                      disabled={submitEvidenceMutation.isPending}
                    >
                      {submitEvidenceMutation.isPending ? 'Submitting...' : 'Submit Evidence for Review'}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
