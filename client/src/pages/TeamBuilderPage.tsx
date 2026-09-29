import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Users,
  Search,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FolderKanban,
  Star,
  ExternalLink,
  Bot,
  Filter,
  UserCheck,
  GraduationCap,
  Layers,
  Inbox,
  AlertCircle,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import {
  useAnalyzeProject,
  useFindMatches,
} from '@/api/teamBuilderApi';
import {
  FindMatchesRequest,
  TeamCandidate,
  ExtractedRequirement,
  SkillPriority,
  CandidateStudent,
} from '@/types/teamBuilder';
import { SkillProficiency, PROFICIENCY_LABELS } from '@/types/skills';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { InviteModal } from '@/components/teamBuilder/InviteModal';
import { InvitationsTray } from '@/components/teamBuilder/InvitationsTray';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const DEFAULT_ROLES = [
  'Backend Developer',
  'Frontend Developer',
  'Full Stack Developer',
  'UI/UX Designer',
  'AI / ML Engineer',
  'Data Scientist',
  'Cybersecurity Specialist',
  'Mobile Developer',
  'Cloud / DevOps Engineer',
  'Project Manager',
  'Researcher',
];

interface SkillRequirementItem {
  skillName: string;
  priority: SkillPriority;
  minProficiency?: SkillProficiency;
}

export const TeamBuilderPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'MATCH' | 'INVITATIONS'>('MATCH');

  // Form State
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([
    'Backend Developer',
    'Frontend Developer',
  ]);
  const [skillsList, setSkillsList] = useState<SkillRequirementItem[]>([
    { skillName: 'React', priority: 'REQUIRED' },
    { skillName: 'Node.js', priority: 'REQUIRED' },
  ]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newSkillPriority, setNewSkillPriority] = useState<SkillPriority>('REQUIRED');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Match Results & Modals
  const [matchedCandidates, setMatchedCandidates] = useState<TeamCandidate[] | null>(null);
  const [inviteModalCandidate, setInviteModalCandidate] = useState<CandidateStudent | null>(null);
  const [inviteModalRole, setInviteModalRole] = useState<string>('Collaborator');

  // API Mutations
  const analyzeMutation = useAnalyzeProject();
  const findMatchesMutation = useFindMatches();

  // Natural Language AI Analyzer
  const handleAnalyzeWithAI = async () => {
    if (!projectDescription.trim()) {
      toast.error('Please enter a project description to analyze.');
      return;
    }

    try {
      const res = await analyzeMutation.mutateAsync({
        title: projectTitle || undefined,
        description: projectDescription,
      });

      if (res.title && !projectTitle) {
        setProjectTitle(res.title);
      }

      // Merge extracted skills
      const newSkills: SkillRequirementItem[] = res.requiredSkills.map((req) => ({
        skillName: req.name,
        priority: req.priority,
      }));

      // Avoid duplicates
      const existingNames = new Set(skillsList.map((s) => s.skillName.toLowerCase()));
      const filteredNew = newSkills.filter((s) => !existingNames.has(s.skillName.toLowerCase()));
      setSkillsList([...skillsList, ...filteredNew]);

      // Merge suggested roles
      if (res.suggestedRoles && res.suggestedRoles.length > 0) {
        const roleSet = new Set([...selectedRoles, ...res.suggestedRoles]);
        setSelectedRoles(Array.from(roleSet));
      }

      toast.success(`Extracted ${filteredNew.length} skills & ${res.suggestedRoles.length} roles from project description!`);
    } catch (err: any) {
      toast.error('Failed to analyze project description.');
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;

    if (skillsList.some((s) => s.skillName.toLowerCase() === newSkillInput.trim().toLowerCase())) {
      toast.error('Skill is already added to requirements.');
      return;
    }

    setSkillsList([
      ...skillsList,
      { skillName: newSkillInput.trim(), priority: newSkillPriority },
    ]);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (index: number) => {
    setSkillsList(skillsList.filter((_, i) => i !== index));
  };

  const handleToggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  // Find Matches Trigger
  const handleFindMatches = async () => {
    if (!projectTitle.trim()) {
      toast.error('Please provide a project title.');
      return;
    }

    if (skillsList.length === 0) {
      toast.error('Please specify at least one required or preferred skill.');
      return;
    }

    try {
      const payload: FindMatchesRequest = {
        projectTitle: projectTitle.trim(),
        title: projectTitle.trim(),
        description: projectDescription.trim() || undefined,
        targetRoles: selectedRoles.length > 0 ? selectedRoles : undefined,
        skills: skillsList.map((s) => ({
          skillName: s.skillName,
          priority: s.priority,
          minProficiency: s.minProficiency,
        })),
        department: selectedDepartment !== 'ALL' ? selectedDepartment : undefined,
        limit: 25,
      };

      const res = await findMatchesMutation.mutateAsync(payload);
      setMatchedCandidates(res.candidates);
      toast.success(`Found ${res.candidates.length} matching collaborators!`);
    } catch (err: any) {
      toast.error('Failed to run matching engine. Please try again.');
    }
  };

  // Filtered Candidates by Role
  const displayedCandidates = (matchedCandidates || []).filter((c) => {
    if (roleFilter === 'ALL') return true;
    return (c.bestFitRole || '').toLowerCase() === roleFilter.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-3"
      >
        <div className="inline-flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-wider">
          <Bot className="w-4 h-4 animate-pulse" />
          Intelligent Project Matchmaking
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-primary dark:text-white">
          AI Team Builder
        </h1>
        <p className="text-text-secondary text-sm sm:text-base max-w-3xl leading-relaxed">
          Define your project requirements, extract domain competencies, and let the deterministic scoring engine match you with the best collaborators across CUSTECH FCI.
        </p>
      </motion.div>

      {/* ── Main Tab Navigation ──────────────────────────────────────── */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('MATCH')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'MATCH'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <Users className="w-4 h-4" />
          Find Collaborators
        </button>
        <button
          onClick={() => setActiveTab('INVITATIONS')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'INVITATIONS'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Invitations &amp; Requests
        </button>
      </div>

      {activeTab === 'INVITATIONS' ? (
        <InvitationsTray />
      ) : (
        <div className="space-y-8">
          {/* ── Project Requirements Form Card ─────────────────────────── */}
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text">Project Specifications</h2>
                  <p className="text-xs text-text-secondary">
                    Outline your initiative to generate customized candidate rankings.
                  </p>
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI-Powered Campus Security System, Student Housing Finder..."
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Project Description &amp; Objectives
                  </label>
                  <button
                    type="button"
                    onClick={handleAnalyzeWithAI}
                    disabled={analyzeMutation.isPending || !projectDescription.trim()}
                    className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {analyzeMutation.isPending ? 'Analyzing...' : 'Auto-Extract Skills & Roles'}
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="Describe what you plan to build, the problems you aim to solve, and the technologies needed..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent resize-none"
                />
              </div>
            </div>

            {/* Target Roles Multi-Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Target Team Roles Needed
              </label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_ROLES.map((role) => {
                  const isSelected = selectedRoles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleToggleRole(role)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-accent text-white shadow-xs font-semibold'
                          : 'bg-surface-raised border border-border text-text hover:border-accent/50'
                      }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Required Skills Management */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center justify-between">
                <span>Required &amp; Preferred Skills</span>
                <span className="text-[11px] text-text-secondary font-normal">
                  {skillsList.length} criteria defined
                </span>
              </label>

              {/* Add Skill Row */}
              <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Add skill (e.g. Python, Docker, UI/UX, Flutter)..."
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl border border-border bg-bg text-text text-xs focus:outline-none focus:border-accent"
                />
                <select
                  value={newSkillPriority}
                  onChange={(e) => setNewSkillPriority(e.target.value as SkillPriority)}
                  aria-label="Select skill priority"
                  className="px-3 py-2 rounded-xl border border-border bg-bg text-text text-xs font-medium focus:outline-none focus:border-accent"
                >
                  <option value="REQUIRED">Required (Heavy Weight)</option>
                  <option value="PREFERRED">Preferred (Bonus)</option>
                </select>
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Criterion
                </Button>
              </form>

              {/* Skill Chips List */}
              <div className="flex flex-wrap gap-2 pt-1">
                {skillsList.length === 0 ? (
                  <p className="text-xs text-text-muted italic">
                    No skills specified yet. Add skills or click &quot;Auto-Extract Skills&quot; above.
                  </p>
                ) : (
                  skillsList.map((sk, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                        sk.priority === 'REQUIRED'
                          ? 'bg-accent/15 border-accent/30 text-accent font-semibold'
                          : 'bg-surface-raised border-border text-text'
                      }`}
                    >
                      <span>{sk.skillName}</span>
                      <span className="text-[10px] opacity-75 font-mono">
                        ({sk.priority === 'REQUIRED' ? 'Req' : 'Pref'})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(idx)}
                        aria-label={`Remove skill requirement ${sk.skillName}`}
                        className="p-0.5 hover:text-red-400 transition-colors ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-text-muted">
                Deterministic matching computes exact compatibility using verified student competencies.
              </p>
              <Button
                variant="accent"
                size="md"
                onClick={handleFindMatches}
                isLoading={findMatchesMutation.isPending}
                leftIcon={<Search className="w-4 h-4" />}
              >
                Find Matching Collaborators
              </Button>
            </div>
          </Card>

          {/* ── Match Results Section ─────────────────────────────────── */}
          {matchedCandidates !== null && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="font-display font-extrabold text-2xl text-primary dark:text-white flex items-center gap-2">
                    <UserCheck className="w-6 h-6 text-accent" />
                    Recommended Collaborators ({matchedCandidates.length})
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Ranked by technical competency alignment, project history, and availability.
                  </p>
                </div>

                {/* Role Group Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-text-muted" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    aria-label="Filter matches by role"
                    className="text-xs py-2 px-3 rounded-xl bg-surface border border-border text-text font-medium focus:outline-none focus:border-accent"
                  >
                    <option value="ALL">All Roles ({matchedCandidates.length})</option>
                    {Array.from(new Set(matchedCandidates.map((c) => c.bestFitRole))).map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Candidates Grid */}
              {displayedCandidates.length === 0 ? (
                <div className="p-12 text-center bg-surface border border-dashed border-border rounded-2xl space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent mx-auto flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-text">No suitable collaborators found yet</h4>
                  <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
                    Try adding different skills or broadening your project requirements to match more students in the faculty.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {displayedCandidates.map((candidate) => (
                    <CandidateMatchCard
                      key={candidate.studentId}
                      candidate={candidate}
                      onInvite={(c, role) => {
                        setInviteModalCandidate(c);
                        setInviteModalRole(role);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Invite Modal ────────────────────────────────────────────── */}
      <InviteModal
        candidate={inviteModalCandidate}
        suggestedRole={inviteModalRole}
        projectTitle={projectTitle}
        isOpen={Boolean(inviteModalCandidate)}
        onClose={() => setInviteModalCandidate(null)}
      />
    </div>
  );
};

// ── Candidate Match Card with Transparent Breakdown ─────────────────────────

const CandidateMatchCard: React.FC<{
  candidate: TeamCandidate;
  onInvite: (student: CandidateStudent, role: string) => void;
}> = ({ candidate, onInvite }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const {
    studentId,
    fullName,
    avatarUrl,
    department,
    level,
    communityPoints,
    matchPercentage,
    bestFitRole,
    matchedRequired = [],
    matchedPreferred = [],
    missingRequired = [],
    explanationPoints = [],
    allSkills = [],
  } = candidate;

  // Score color gradient
  const scoreColor =
    matchPercentage >= 80
      ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
      : matchPercentage >= 60
      ? 'text-accent bg-accent/15 border-accent/30'
      : 'text-amber-400 bg-amber-500/15 border-amber-500/30';

  const candidateStudent: CandidateStudent = {
    id: studentId,
    fullName,
    department,
    level,
    avatarUrl: avatarUrl || undefined,
  };

  return (
    <Card className="p-5 sm:p-6 space-y-5 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header: Student Info + Match Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src={
                avatarUrl ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${fullName}`
              }
              alt={fullName}
              className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-border shadow-xs"
            />
            <div className="min-w-0">
              <Link to={`/profile?userId=${studentId}`}>
                <h4 className="font-bold text-base text-text hover:text-accent transition-colors truncate">
                  {fullName}
                </h4>
              </Link>
              <p className="text-xs text-text-muted truncate">
                {department} {level ? `• ${level}` : ''}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent/15 text-accent border border-accent/25 uppercase">
                  Best Suited: {bestFitRole}
                </span>
                {communityPoints !== undefined && (
                  <span className="text-[10px] text-text-muted font-mono">
                    {communityPoints} pts
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Transparent Match Score Pill */}
          <div
            className={`px-3 py-1.5 rounded-xl border flex flex-col items-center shrink-0 ${scoreColor}`}
          >
            <span className="text-lg font-extrabold font-display leading-none">
              {matchPercentage}%
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider opacity-80 mt-0.5">
              Match
            </span>
          </div>
        </div>

        {/* Explainability Breakdown (Prompt Part 2 section 3) */}
        <div className="p-3.5 rounded-xl bg-surface-raised/50 border border-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-text-secondary uppercase tracking-wider text-[10px] flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-accent" />
              Why this match?
            </span>
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-[10px] text-accent hover:underline font-semibold"
            >
              {showBreakdown ? 'Hide details' : 'Show details'}
            </button>
          </div>

          <div className="space-y-1">
            {explanationPoints.map((pt, i) => (
              <div key={i} className="text-xs text-text flex items-center gap-1.5">
                <span>{pt}</span>
              </div>
            ))}
          </div>

          {/* Matched Skills Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {matchedRequired.map((sk, idx) => {
              const prof = PROFICIENCY_LABELS[sk.proficiency];
              return (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                >
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>{sk.name}</span>
                  {prof && <span className="text-[9px] opacity-75 font-mono">({prof.label})</span>}
                </span>
              );
            })}

            {matchedPreferred.map((sk, idx) => {
              const prof = PROFICIENCY_LABELS[sk.proficiency];
              return (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-accent/10 text-accent border border-accent/20"
                >
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>{sk.name} (Pref)</span>
                  {prof && <span className="text-[9px] opacity-75 font-mono">({prof.label})</span>}
                </span>
              );
            })}

            {missingRequired.map((miss, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-surface text-text-muted border border-border"
              >
                <XCircle className="w-3 h-3 text-text-muted shrink-0" />
                <span className="line-through opacity-75">{miss}</span>
              </span>
            ))}
          </div>
        </div>

        {/* All Skills Drawer */}
        {showBreakdown && allSkills.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-border/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              All Verified Student Skills ({allSkills.length})
            </span>
            <div className="flex flex-wrap gap-1">
              {allSkills.map((sk, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[10px] bg-surface-raised border border-border text-text-muted"
                >
                  {sk.name} ({PROFICIENCY_LABELS[sk.proficiency]?.label || sk.proficiency})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
        <Link
          to={`/profile?userId=${studentId}`}
          className="text-xs text-text-secondary hover:text-accent font-semibold transition-colors flex items-center gap-1"
        >
          View Profile <ExternalLink className="w-3 h-3" />
        </Link>

        <Button
          size="sm"
          variant="accent"
          onClick={() => onInvite(candidateStudent, bestFitRole)}
          leftIcon={<Send className="w-3.5 h-3.5" />}
        >
          Invite to Project
        </Button>
      </div>
    </Card>
  );
};
