import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  Calendar,
  Clock,
  CheckCircle2,
  Bookmark,
  FileText,
  AlertTriangle,
  FolderKanban,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Plus,
  Trash2,
  Edit3,
  Filter,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { opportunityTrackerApi, TrackOpportunityPayload } from '@/api/opportunityTrackerApi';
import {
  OpportunityTrackStatus,
  OpportunityApplication,
} from '@/types/opportunityTracker';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const STATUS_COLUMNS: Array<{ id: OpportunityTrackStatus; label: string; color: string }> = [
  { id: 'SAVED', label: 'Saved', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  { id: 'INTERESTED', label: 'Interested', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  { id: 'APPLYING', label: 'In Progress / Preparing', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  { id: 'APPLIED', label: 'Applied / Submitted', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' },
  { id: 'SHORTLISTED', label: 'Shortlisted / Interview', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' },
  { id: 'ACCEPTED', label: 'Accepted / Won', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
];

export const OpportunityTrackerPage: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('ALL');
  const [selectedAppForNotes, setSelectedAppForNotes] = useState<OpportunityApplication | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  // 1. Fetch user's tracked opportunities
  const {
    data: tracked = [],
    isLoading: trackedLoading,
  } = useQuery({
    queryKey: ['opportunity-tracker', activeStatusFilter],
    queryFn: () => opportunityTrackerApi.getMyTracked(activeStatusFilter),
  });

  // 2. Fetch upcoming urgent deadlines
  const {
    data: upcoming = [],
    isLoading: upcomingLoading,
  } = useQuery({
    queryKey: ['opportunity-tracker-upcoming'],
    queryFn: opportunityTrackerApi.getUpcomingDeadlines,
  });

  // 3. Fetch Skill Graph Recommendations
  const {
    data: recommendations = [],
    isLoading: recommendationsLoading,
  } = useQuery({
    queryKey: ['opportunity-tracker-recommendations'],
    queryFn: opportunityTrackerApi.getRecommendations,
  });

  // Status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ oppId, status }: { oppId: string; status: OpportunityTrackStatus }) =>
      opportunityTrackerApi.updateTracking(oppId, { status }),
    onSuccess: () => {
      toast.success('Application status updated');
      queryClient.invalidateQueries({ queryKey: ['opportunity-tracker'] });
      queryClient.invalidateQueries({ queryKey: ['opportunity-tracker-upcoming'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  // Notes & Documents mutation
  const updateNotesMutation = useMutation({
    mutationFn: ({ oppId, notes, documentTypes }: { oppId: string; notes: string; documentTypes: string[] }) =>
      opportunityTrackerApi.updateTracking(oppId, { notes, documentTypes }),
    onSuccess: () => {
      toast.success('Private notes saved!');
      setSelectedAppForNotes(null);
      queryClient.invalidateQueries({ queryKey: ['opportunity-tracker'] });
    },
  });

  // Untrack mutation
  const untrackMutation = useMutation({
    mutationFn: (oppId: string) => opportunityTrackerApi.untrackOpportunity(oppId),
    onSuccess: () => {
      toast.success('Removed from tracker');
      queryClient.invalidateQueries({ queryKey: ['opportunity-tracker'] });
      queryClient.invalidateQueries({ queryKey: ['opportunity-tracker-upcoming'] });
    },
  });

  // Track recommendation mutation
  const trackRecommendationMutation = useMutation({
    mutationFn: (oppId: string) =>
      opportunityTrackerApi.trackOpportunity(oppId, { status: 'SAVED' }),
    onSuccess: () => {
      toast.success('Added to your personal tracker!');
      queryClient.invalidateQueries({ queryKey: ['opportunity-tracker'] });
      queryClient.invalidateQueries({ queryKey: ['opportunity-tracker-recommendations'] });
    },
  });

  const openNotesModal = (app: OpportunityApplication) => {
    setSelectedAppForNotes(app);
    setNoteContent(app.notes || '');
    setSelectedDocs(Array.isArray(app.documentTypes) ? app.documentTypes : []);
  };

  const toggleDoc = (docName: string) => {
    if (selectedDocs.includes(docName)) {
      setSelectedDocs(selectedDocs.filter((d) => d !== docName));
    } else {
      setSelectedDocs([...selectedDocs, docName]);
    }
  };

  const getUrgencyBadge = (days: number | null, status: string) => {
    if (days === null) return null;
    if (status === 'URGENT') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
          <Clock className="w-3 h-3" />
          <span>{days} {days === 1 ? 'day' : 'days'} left (Urgent)</span>
        </span>
      );
    }
    if (status === 'APPROACHING') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
          <Clock className="w-3 h-3" />
          <span>{days} days remaining</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-slate-500">
        <Calendar className="w-3 h-3" />
        <span>{days} days remaining</span>
      </span>
    );
  };

  // Stats calculation
  const totalTracked = tracked.length;
  const inProgressCount = tracked.filter((t) => t.status === 'APPLYING' || t.status === 'INTERESTED').length;
  const appliedCount = tracked.filter((t) => t.status === 'APPLIED').length;
  const acceptedCount = tracked.filter((t) => t.status === 'ACCEPTED' || t.status === 'SHORTLISTED').length;

  return (
    <div className="min-h-screen bg-background text-text py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner - Balanced Light & Dark Theme */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface via-surface to-primary-50/50 dark:from-slate-950 dark:via-blue-950/80 dark:to-indigo-950/80 border border-border shadow-md dark:shadow-2xl p-6 sm:p-8 lg:p-10 transition-colors duration-200">
          {/* Subtle background ambient glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 dark:bg-accent/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-primary/5 dark:bg-primary/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 dark:bg-accent/15 text-primary dark:text-accent text-xs font-bold border border-primary/20 dark:border-accent/30 tracking-wide">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Career Command Center</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-text dark:text-white leading-tight">
                Opportunity & Competition Tracker
              </h1>
              <p className="text-text-secondary dark:text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                Your private dashboard for hackathons, internships, scholarships, and competitions. Track deadlines with configurable reminders, manage application documents, and link team hackathons directly to Project Lab workspaces.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/opportunities"
                className="btn-glow-subtle inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border hover:border-accent text-text dark:bg-white/10 dark:border-white/15 dark:text-white dark:hover:bg-white/20 font-semibold text-xs sm:text-sm shadow-sm transition-all group"
              >
                <span>Browse All Opportunities</span>
                <ExternalLink className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                to="/project-lab"
                className="btn-glow inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-slate-950 font-bold text-xs sm:text-sm border border-transparent shadow-md shadow-accent/20 transition-all group"
              >
                <FolderKanban className="w-4 h-4" />
                <span>Open Project Lab</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Urgent Deadlines Alert Bar */}
        {upcoming.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/25 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Approaching Application Deadlines ({upcoming.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcoming.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-surface border border-border shadow-sm text-text"
                >
                  <div className="space-y-0.5 max-w-[70%]">
                    <h4 className="text-xs font-bold line-clamp-1 text-text">{item.opportunity.title}</h4>
                    <p className="text-[11px] text-text-muted">{item.opportunity.organization}</p>
                  </div>
                  {getUrgencyBadge(item.deadlineMeta?.daysRemaining ?? null, item.deadlineMeta?.status ?? '')}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm space-y-1">
            <span className="text-xs text-text-muted font-medium">Tracked Opportunities</span>
            <p className="text-2xl font-black text-text">{totalTracked}</p>
          </div>
          <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm space-y-1">
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">In Preparation</span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{inProgressCount}</p>
          </div>
          <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm space-y-1">
            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Applications Submitted</span>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{appliedCount}</p>
          </div>
          <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm space-y-1">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Shortlisted / Won</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{acceptedCount}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeStatusFilter === 'ALL'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface border border-border text-text-secondary hover:text-text hover:bg-surface-raised'
            }`}
          >
            All Tracked ({tracked.length})
          </button>
          {STATUS_COLUMNS.map((col) => (
            <button
              key={col.id}
              onClick={() => setActiveStatusFilter(col.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeStatusFilter === col.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface border border-border text-text-secondary hover:text-text hover:bg-surface-raised'
              }`}
            >
              {col.label}
            </button>
          ))}
        </div>

        {/* Main Tracked Grid */}
        {trackedLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-48 rounded-2xl bg-surface border border-border animate-pulse p-5 space-y-3" />
            ))}
          </div>
        ) : tracked.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tracked.map((app) => (
              <div
                key={app.id}
                className="card-interactive flex flex-col justify-between rounded-2xl bg-surface border border-border shadow-sm p-5 sm:p-6 space-y-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                      {app.opportunity.category}
                    </span>
                    {getUrgencyBadge(app.deadlineMeta?.daysRemaining ?? null, app.deadlineMeta?.status || '')}
                  </div>

                  <Link
                    to={`/opportunities/${app.opportunity.slug}`}
                    className="block font-bold text-base text-text hover:text-accent transition-colors line-clamp-1"
                  >
                    {app.opportunity.title}
                  </Link>
                  <p className="text-xs text-text-muted font-medium">
                    {app.opportunity.organization}
                  </p>

                  {/* Private notes snippet if present */}
                  {app.notes && (
                    <div className="p-2.5 rounded-xl bg-surface-raised border border-border text-xs text-text-secondary italic line-clamp-2">
                      "{app.notes}"
                    </div>
                  )}

                  {/* Documents tracked chips */}
                  {app.documentTypes && app.documentTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {app.documentTypes.map((doc: string) => (
                        <span
                          key={doc}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-surface-raised border border-border text-text-secondary"
                        >
                          {doc}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Linked Project Lab Project */}
                  {app.linkedLabProject && (
                    <Link
                      to={`/project-lab/${app.linkedLabProject.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline pt-1 font-semibold"
                    >
                      <FolderKanban className="w-3.5 h-3.5" />
                      <span>Workspace: {app.linkedLabProject.title}</span>
                    </Link>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  {/* Status Dropdown */}
                  <select
                    value={app.status}
                    onChange={(e) =>
                      updateStatusMutation.mutate({
                        oppId: app.opportunityId,
                        status: e.target.value as OpportunityTrackStatus,
                      })
                    }
                    className="text-xs py-1.5 px-2.5 rounded-xl bg-surface-raised border border-border text-text font-semibold focus:outline-none focus:border-accent"
                  >
                    <option value="SAVED">Saved</option>
                    <option value="INTERESTED">Interested</option>
                    <option value="APPLYING">Preparing / Applying</option>
                    <option value="APPLIED">Applied</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="ACCEPTED">Accepted / Won</option>
                    <option value="NOT_SELECTED">Not Selected</option>
                    <option value="WITHDRAWN">Withdrawn</option>
                  </select>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openNotesModal(app)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-surface-raised transition-colors cursor-pointer"
                      title="Manage Private Notes & Documents"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => untrackMutation.mutate(app.opportunityId)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-surface-raised transition-colors cursor-pointer"
                      title="Remove from tracker"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-3xl bg-surface border border-dashed border-border">
            <Briefcase className="w-12 h-12 mx-auto text-text-muted mb-3" />
            <h3 className="text-lg font-bold text-text">No tracked opportunities in this category</h3>
            <p className="text-sm text-text-muted max-w-sm mx-auto mt-1 mb-6">
              Track hackathons, scholarships, and internships from the Opportunity Hub to keep up with deadlines and documents.
            </p>
            <Link
              to="/opportunities"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-slate-950 font-bold text-sm shadow-md transition-all"
            >
              <span>Explore Opportunity Hub</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ── SKILL GRAPH RECOMMENDATIONS SECTION ───────────────────────── */}
        <div className="space-y-4 pt-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <div>
                <h3 className="text-lg font-bold text-text">Recommended Based on Your Skill Graph</h3>
                <p className="text-xs text-text-muted">
                  Matches your verified student skills, department, and career trajectory.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendations.map((rec) => (
              <div
                key={rec.opportunity.id}
                className="card-interactive flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-surface border border-border shadow-sm space-y-3.5 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-accent uppercase text-[10px]">
                      {rec.opportunity.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent/15 text-accent border border-accent/25">
                      Match Score: {rec.score}
                    </span>
                  </div>

                  <Link
                    to={`/opportunities/${rec.opportunity.slug}`}
                    className="block font-bold text-base text-text hover:text-accent transition-colors line-clamp-1"
                  >
                    {rec.opportunity.title}
                  </Link>
                  <p className="text-xs text-text-muted font-medium">{rec.opportunity.organization}</p>

                  <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-xs text-text-secondary">
                    {rec.reason}
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-text-muted font-mono">
                    {rec.opportunity.deadline
                      ? `Deadline: ${new Date(rec.opportunity.deadline).toLocaleDateString()}`
                      : 'Rolling application'}
                  </span>
                  <button
                    onClick={() => trackRecommendationMutation.mutate(rec.opportunity.id)}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Track</span>
                  </button>
                </div>
              </div>
            ))}

            {recommendations.length === 0 && !recommendationsLoading && (
              <div className="col-span-full p-8 text-center rounded-2xl bg-surface border border-dashed border-border text-text-muted text-xs">
                Add verified skills to your academic profile to unlock personalized opportunity recommendations!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Private Notes & Documents Modal */}
      {selectedAppForNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-surface rounded-3xl shadow-2xl p-6 sm:p-7 border border-border space-y-4 text-text">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-accent">
                <FileText className="w-4 h-4" />
                <span>Private Career Notes</span>
              </div>
              <h3 className="text-lg font-bold text-text mt-1">{selectedAppForNotes.opportunity.title}</h3>
              <p className="text-xs text-text-muted">
                These notes and document checklists are completely private to your account.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  Private Application Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Need to request recommendation letter from Prof. Adeyemi; update portfolio with Phase 6 project."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-surface-raised border border-border text-text focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">
                  Documents Attached / Required
                </label>
                <div className="flex flex-wrap gap-2">
                  {['CV / Resume', 'Portfolio', 'Cover Letter', 'Academic Transcript', 'Recommendation Letter', 'Certificate'].map(
                    (doc) => {
                      const isSelected = selectedDocs.includes(doc);
                      return (
                        <button
                          key={doc}
                          type="button"
                          onClick={() => toggleDoc(doc)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-accent text-slate-950 border-accent font-bold shadow-sm'
                              : 'bg-surface-raised text-text-secondary border-border hover:border-accent/40'
                          }`}
                        >
                          {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          <span>{doc}</span>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedAppForNotes(null)}
                className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  updateNotesMutation.mutate({
                    oppId: selectedAppForNotes.opportunityId,
                    notes: noteContent,
                    documentTypes: selectedDocs,
                  })
                }
                disabled={updateNotesMutation.isPending}
                className="px-4 py-2 rounded-xl bg-accent hover:bg-accent/90 text-slate-950 font-bold text-xs shadow-md shadow-accent/20 cursor-pointer"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
