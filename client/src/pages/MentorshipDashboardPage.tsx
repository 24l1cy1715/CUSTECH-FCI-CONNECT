import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Users,
  Target,
  Calendar,
  BookOpen,
  ExternalLink,
  Trash2,
  Flag,
} from 'lucide-react';
import {
  fetchMentorshipDashboard,
  respondToMentorshipRequest,
  endMentorship,
  createMentorshipGoal,
  updateMentorshipGoal,
  deleteMentorshipGoal,
  createMentorshipSession,
  updateMentorshipSessionStatus,
  createMentorshipResource,
  deleteMentorshipResource,
  reportMentorship,
} from '@/api/mentorshipApi';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  CreateMentorshipGoalPayload,
  CreateMentorshipSessionPayload,
  CreateMentorshipResourcePayload,
} from '@/types/mentorship';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export const MentorshipDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'mentee' | 'mentor' | 'requests'>('mentee');

  // Selected relationship for managing goals/sessions
  const [selectedRelId, setSelectedRelId] = useState<string | null>(null);

  // Modals
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [targetReportUser, setTargetReportUser] = useState<{ id: string; name: string } | null>(null);

  // Form states
  const [goalForm, setGoalForm] = useState<CreateMentorshipGoalPayload>({
    title: '',
    target: '',
    progress: 0,
    status: 'IN_PROGRESS',
  });

  const [sessionForm, setSessionForm] = useState<CreateMentorshipSessionPayload>({
    title: '',
    description: '',
    scheduledAt: '',
    duration: 60,
    meetingUrl: '',
  });

  const [resourceForm, setResourceForm] = useState<CreateMentorshipResourcePayload>({
    title: '',
    description: '',
    url: '',
    type: 'ARTICLE',
  });

  const [reportReason, setReportReason] = useState('UNPROFESSIONAL_BEHAVIOR');
  const [reportDescription, setReportDescription] = useState('');

  // Fetch Dashboard
  const { data: dashboard, isLoading, isError, refetch } = useQuery({
    queryKey: ['mentorship-dashboard'],
    queryFn: fetchMentorshipDashboard,
    enabled: isAuthenticated,
  });

  // Request response mutation (Accept/Decline)
  const respondMut = useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: 'ACCEPTED' | 'DECLINED' }) =>
      respondToMentorshipRequest(requestId, status),
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === 'ACCEPTED'
          ? 'Mentorship request accepted!'
          : 'Mentorship request declined'
      );
      queryClient.invalidateQueries({ queryKey: ['mentorship-dashboard'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Action failed'),
  });

  // End mentorship mutation
  const endMut = useMutation({
    mutationFn: (relationshipId: string) => endMentorship(relationshipId),
    onSuccess: () => {
      toast.success('Mentorship relationship concluded.');
      queryClient.invalidateQueries({ queryKey: ['mentorship-dashboard'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to end mentorship'),
  });

  // Goal mutations
  const createGoalMut = useMutation({
    mutationFn: (relId: string) => createMentorshipGoal(relId, goalForm),
    onSuccess: () => {
      toast.success('Learning goal added!');
      setGoalModalOpen(false);
      setGoalForm({ title: '', target: '', progress: 0, status: 'IN_PROGRESS' });
      queryClient.invalidateQueries({ queryKey: ['mentorship-dashboard'] });
    },
  });

  const updateGoalMut = useMutation({
    mutationFn: ({ goalId, progress, status }: { goalId: string; progress: number; status?: any }) =>
      updateMentorshipGoal(goalId, { progress, status }),
    onSuccess: () => {
      toast.success('Progress updated!');
      queryClient.invalidateQueries({ queryKey: ['mentorship-dashboard'] });
    },
  });

  const deleteGoalMut = useMutation({
    mutationFn: (goalId: string) => deleteMentorshipGoal(goalId),
    onSuccess: () => {
      toast.success('Goal removed');
      queryClient.invalidateQueries({ queryKey: ['mentorship-dashboard'] });
    },
  });

  // Session mutations
  const createSessionMut = useMutation({
    mutationFn: (relId: string) => createMentorshipSession(relId, sessionForm),
    onSuccess: () => {
      toast.success('Session scheduled!');
      setSessionModalOpen(false);
      setSessionForm({ title: '', description: '', scheduledAt: '', duration: 60, meetingUrl: '' });
      queryClient.invalidateQueries({ queryKey: ['mentorship-dashboard'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to schedule session'),
  });

  const updateSessionMut = useMutation({
    mutationFn: ({ sessionId, status }: { sessionId: string; status: any }) =>
      updateMentorshipSessionStatus(sessionId, status),
    onSuccess: () => {
      toast.success('Session status updated');
      queryClient.invalidateQueries({ queryKey: ['mentorship-dashboard'] });
    },
  });

  // Resource mutations
  const createResourceMut = useMutation({
    mutationFn: (relId: string) => createMentorshipResource(relId, resourceForm),
    onSuccess: () => {
      toast.success('Resource recommended!');
      setResourceModalOpen(false);
      setResourceForm({ title: '', description: '', url: '', type: 'ARTICLE' });
      queryClient.invalidateQueries({ queryKey: ['mentorship-dashboard'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to recommend resource'),
  });

  const deleteResourceMut = useMutation({
    mutationFn: (resourceId: string) => deleteMentorshipResource(resourceId),
    onSuccess: () => {
      toast.success('Resource removed');
      queryClient.invalidateQueries({ queryKey: ['mentorship-dashboard'] });
    },
  });

  // Report mutation
  const reportMut = useMutation({
    mutationFn: () =>
      reportMentorship({
        targetUserId: targetReportUser!.id,
        reason: reportReason,
        description: reportDescription,
        mentorshipId: selectedRelId || undefined,
      }),
    onSuccess: () => {
      toast.success('Report submitted for review');
      setReportModalOpen(false);
      setTargetReportUser(null);
      setReportDescription('');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to submit report'),
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <GraduationCap className="w-16 h-16 text-accent mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-text">Sign in to Access Mentorship</h2>
        <p className="text-text-secondary text-sm mt-2 mb-6">
          Connect with experienced peer mentors, set structured learning goals, and schedule 1-on-1 sessions.
        </p>
        <Link to="/login">
          <Button variant="accent">Sign In to FCI Connect</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-10 w-1/3 bg-surface-raised rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-24 bg-surface rounded-2xl border border-border" />
          ))}
        </div>
      </div>
    );
  }

  const asMentee = dashboard?.asMentee || [];
  const asMentor = dashboard?.asMentor || [];
  const pendingReceived = dashboard?.pendingRequestsReceived || [];
  const pendingSent = dashboard?.pendingRequestsSent || [];
  const stats = dashboard?.stats;

  // Active list according to selected tab
  const activeRelationships = activeTab === 'mentee' ? asMentee : asMentor;

  return (
    <div className="min-h-screen pb-20">
      {/* ── Top Header ────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-primary/10 via-background to-background pt-10 pb-8 border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent-700 dark:text-accent font-semibold text-xs mb-3 border border-accent/20">
                <GraduationCap className="w-3.5 h-3.5" />
                Mentorship & Peer Learning Hub
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text tracking-tight">
                My Learning & <span className="text-accent">Mentoring Hub</span>
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                Track personal technical goals, review 1-on-1 sessions, and guide the next generation of FCI tech talent.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/mentorship/mentors">
                <Button variant="accent" size="md" leftIcon={<Users className="w-4 h-4" />}>
                  Explore Mentors
                </Button>
              </Link>
            </div>
          </div>

          {/* ── Metrics Summary Cards ──────────────────────────────────────────── */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 border border-border">
              <span className="text-xs text-text-secondary font-medium">Active Mentors</span>
              <p className="text-2xl font-black text-text mt-1">{stats?.activeMentorsCount || 0}</p>
            </Card>
            <Card className="p-4 border border-border">
              <span className="text-xs text-text-secondary font-medium">Active Mentees</span>
              <p className="text-2xl font-black text-text mt-1">{stats?.activeMenteesCount || 0}</p>
            </Card>
            <Card className="p-4 border border-border">
              <span className="text-xs text-text-secondary font-medium">Goals Completed</span>
              <p className="text-2xl font-black text-emerald-500 mt-1">{stats?.completedGoalsCount || 0}</p>
            </Card>
            <Card className="p-4 border border-border">
              <span className="text-xs text-text-secondary font-medium">Total Goals</span>
              <p className="text-2xl font-black text-accent mt-1">{stats?.totalGoalsCount || 0}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Dashboard Tabs ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <button
            onClick={() => setActiveTab('mentee')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'mentee'
                ? 'bg-primary text-white shadow-sm dark:bg-primary-500'
                : 'bg-surface-raised text-text-secondary hover:text-text'
            }`}
          >
            Menteeship ({asMentee.length})
          </button>

          <button
            onClick={() => setActiveTab('mentor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'mentor'
                ? 'bg-primary text-white shadow-sm dark:bg-primary-500'
                : 'bg-surface-raised text-text-secondary hover:text-text'
            }`}
          >
            As a Mentor ({asMentor.length})
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'requests'
                ? 'bg-primary text-white shadow-sm dark:bg-primary-500'
                : 'bg-surface-raised text-text-secondary hover:text-text'
            }`}
          >
            <span>Requests</span>
            {pendingReceived.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-accent text-primary-950 font-black text-[10px]">
                {pendingReceived.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Requests Tab Content ────────────────────────────────────────────── */}
        {activeTab === 'requests' && (
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="font-bold text-base text-text mb-3">Requests Received (As Mentor)</h3>
              {pendingReceived.length === 0 ? (
                <Card className="p-8 text-center border border-border">
                  <p className="text-xs text-text-secondary">No pending mentorship requests waiting for your review.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {pendingReceived.map((req) => (
                    <Card key={req.id} className="p-4 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-text">
                            {req.mentee.profile?.fullName || 'Student'}
                          </span>
                          <span className="text-xs text-text-muted">
                            ({req.mentee.profile?.department || 'FCI'})
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary mt-1">
                          <span className="font-semibold text-text">Goal:</span> "{req.goal}"
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="accent"
                          size="sm"
                          isLoading={respondMut.isPending}
                          onClick={() => respondMut.mutate({ requestId: req.id, status: 'ACCEPTED' })}
                        >
                          Accept Mentee
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          isLoading={respondMut.isPending}
                          onClick={() => respondMut.mutate({ requestId: req.id, status: 'DECLINED' })}
                        >
                          Decline
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="font-bold text-base text-text mb-3">Requests Sent (Awaiting Mentor)</h3>
              {pendingSent.length === 0 ? (
                <Card className="p-8 text-center border border-border">
                  <p className="text-xs text-text-secondary">You have no pending requests sent to mentors.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {pendingSent.map((req) => (
                    <Card key={req.id} className="p-4 border border-border flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sm text-text">
                          Mentor: {req.mentor.profile?.fullName}
                        </span>
                        <p className="text-xs text-text-secondary mt-1">Goal: "{req.goal}"</p>
                      </div>
                      <Badge variant="warning" size="sm">
                        PENDING REVIEW
                      </Badge>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Active Relationships List (Mentee or Mentor) ──────────────────────── */}
        {activeTab !== 'requests' && (
          <div className="mt-6 space-y-6">
            {activeRelationships.length === 0 && (
              <div className="text-center py-20 bg-surface rounded-2xl border border-border p-8">
                <Target className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <h3 className="font-bold text-text">
                  {activeTab === 'mentee' ? 'No active mentors yet' : 'No active mentees yet'}
                </h3>
                <p className="text-xs text-text-secondary mt-1 max-w-md mx-auto">
                  {activeTab === 'mentee'
                    ? 'Explore senior students and peer experts to receive 1-on-1 technical and academic guidance.'
                    : 'Opt in as a mentor or accept pending requests to start coaching students.'}
                </p>
                {activeTab === 'mentee' && (
                  <div className="mt-4">
                    <Link to="/mentorship/mentors">
                      <Button variant="accent" size="sm">
                        Find a Mentor
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeRelationships.map((rel) => {
              const partner = activeTab === 'mentee' ? rel.mentor : rel.mentee;
              const isPartnerMentor = activeTab === 'mentee';

              return (
                <Card key={rel.id} className="p-6 border border-border space-y-6">
                  {/* Top Relationship Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent font-black text-xl flex items-center justify-center">
                        {partner.profile?.fullName?.slice(0, 1) || 'P'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-text">
                            {partner.profile?.fullName || 'Peer'}
                          </h3>
                          <Badge variant="accent" size="sm">
                            {isPartnerMentor ? 'MENTOR' : 'MENTEE'}
                          </Badge>
                        </div>
                        <p className="text-xs text-text-muted">
                          {partner.profile?.department || 'FCI'} • Started {new Date(rel.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTargetReportUser({ id: partner.id, name: partner.profile?.fullName || 'User' });
                          setSelectedRelId(rel.id);
                          setReportModalOpen(true);
                        }}
                        title="Report User"
                      >
                        <Flag className="w-3.5 h-3.5 text-text-muted hover:text-rose-500" />
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        isLoading={endMut.isPending}
                        onClick={() => {
                          if (confirm('Are you sure you want to end this mentorship relationship?')) {
                            endMut.mutate(rel.id);
                          }
                        }}
                      >
                        End Mentorship
                      </Button>
                    </div>
                  </div>

                  {/* High Level Goal */}
                  <div className="p-3.5 bg-surface-raised/70 rounded-xl border border-border text-xs">
                    <span className="font-bold text-accent">Primary Mentorship Goal:</span>
                    <p className="text-text mt-0.5">{rel.goal}</p>
                  </div>

                  {/* ── Sub-sections: Goals, Sessions, Resources ──────────────── */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Column 1: Learning Goals */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-text flex items-center gap-1.5">
                          <Target className="w-4 h-4 text-accent" />
                          Structured Goals ({rel.goals.length})
                        </h4>
                        <button
                          onClick={() => {
                            setSelectedRelId(rel.id);
                            setGoalModalOpen(true);
                          }}
                          className="text-xs text-accent hover:underline font-semibold"
                        >
                          + Add Goal
                        </button>
                      </div>

                      {rel.goals.length === 0 ? (
                        <p className="text-xs text-text-muted italic">No goals defined yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {rel.goals.map((g) => (
                            <div key={g.id} className="p-3 bg-surface-raised rounded-xl border border-border text-xs space-y-2">
                              <div className="flex items-start justify-between">
                                <span className="font-semibold text-text">{g.title}</span>
                                <button
                                  onClick={() => deleteGoalMut.mutate(g.id)}
                                  className="text-text-muted hover:text-rose-500"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              {g.target && (
                                <p className="text-[11px] text-text-secondary">Target: {g.target}</p>
                              )}

                              <div>
                                <div className="flex items-center justify-between text-[11px] text-text-muted mb-1">
                                  <span>Progress</span>
                                  <span className="font-bold text-text">{g.progress}%</span>
                                </div>
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  value={g.progress}
                                  onChange={(e) =>
                                    updateGoalMut.mutate({
                                      goalId: g.id,
                                      progress: parseInt(e.target.value),
                                      status: parseInt(e.target.value) === 100 ? 'COMPLETED' : 'IN_PROGRESS',
                                    })
                                  }
                                  className="w-full accent-accent h-1.5 bg-border rounded-lg cursor-pointer"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Column 2: Scheduled Sessions */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-text flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-primary-400" />
                          Upcoming Sessions ({rel.sessions.length})
                        </h4>
                        <button
                          onClick={() => {
                            setSelectedRelId(rel.id);
                            setSessionModalOpen(true);
                          }}
                          className="text-xs text-accent hover:underline font-semibold"
                        >
                          + Schedule
                        </button>
                      </div>

                      {rel.sessions.length === 0 ? (
                        <p className="text-xs text-text-muted italic">No scheduled sessions.</p>
                      ) : (
                        <div className="space-y-2">
                          {rel.sessions.map((s) => (
                            <div key={s.id} className="p-3 bg-surface-raised rounded-xl border border-border text-xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-text">{s.title}</span>
                                <Badge variant={s.status === 'COMPLETED' ? 'success' : 'neutral'} size="sm">
                                  {s.status}
                                </Badge>
                              </div>
                              <span className="text-[11px] text-text-muted block">
                                {new Date(s.scheduledAt).toLocaleString()} ({s.duration} mins)
                              </span>
                              {s.meetingUrl && (
                                <a
                                  href={s.meetingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-accent font-semibold hover:underline text-[11px]"
                                >
                                  Join Meeting <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Column 3: Recommended Resources */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-text flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-emerald-500" />
                          Shared Materials ({rel.resources.length})
                        </h4>
                        <button
                          onClick={() => {
                            setSelectedRelId(rel.id);
                            setResourceModalOpen(true);
                          }}
                          className="text-xs text-accent hover:underline font-semibold"
                        >
                          + Add Material
                        </button>
                      </div>

                      {rel.resources.length === 0 ? (
                        <p className="text-xs text-text-muted italic">No materials shared yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {rel.resources.map((res) => (
                            <div key={res.id} className="p-3 bg-surface-raised rounded-xl border border-border text-xs flex justify-between gap-2">
                              <div>
                                <span className="font-semibold text-text block">{res.title}</span>
                                <a
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-accent text-[11px] hover:underline inline-flex items-center gap-1 mt-0.5"
                                >
                                  Open Material <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                              <button
                                onClick={() => deleteResourceMut.mutate(res.id)}
                                className="text-text-muted hover:text-rose-500"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add Goal Modal ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {goalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl relative"
            >
              <h3 className="font-bold text-lg text-text mb-4">Add Learning Goal</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!goalForm.title.trim() || !selectedRelId) return;
                  createGoalMut.mutate(selectedRelId);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Goal Title *</label>
                  <input
                    type="text"
                    required
                    value={goalForm.title}
                    onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                    placeholder="e.g. Master Port Scanning in Python"
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Deliverable / Target</label>
                  <input
                    type="text"
                    value={goalForm.target || ''}
                    onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
                    placeholder="e.g. Build and demo a multithreaded network scanner"
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setGoalModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="accent" isLoading={createGoalMut.isPending}>
                    Save Goal
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Schedule Session Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {sessionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl relative"
            >
              <h3 className="font-bold text-lg text-text mb-4">Schedule Mentorship Session</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!sessionForm.title.trim() || !sessionForm.scheduledAt || !selectedRelId) return;
                  createSessionMut.mutate(selectedRelId);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Session Title *</label>
                  <input
                    type="text"
                    required
                    value={sessionForm.title}
                    onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                    placeholder="e.g. Weekly Code Review & Q&A"
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={sessionForm.scheduledAt}
                    onChange={(e) => setSessionForm({ ...sessionForm, scheduledAt: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={15}
                    max={240}
                    value={sessionForm.duration}
                    onChange={(e) =>
                      setSessionForm({ ...sessionForm, duration: parseInt(e.target.value) || 60 })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Meeting Link (Google Meet / Zoom)</label>
                  <input
                    type="url"
                    value={sessionForm.meetingUrl || ''}
                    onChange={(e) => setSessionForm({ ...sessionForm, meetingUrl: e.target.value })}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setSessionModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="accent" isLoading={createSessionMut.isPending}>
                    Schedule Session
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Add Material Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {resourceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl relative"
            >
              <h3 className="font-bold text-lg text-text mb-4">Share Learning Material</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!resourceForm.title.trim() || !resourceForm.url.trim() || !selectedRelId) return;
                  createResourceMut.mutate(selectedRelId);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={resourceForm.title}
                    onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                    placeholder="e.g. OWASP Top 10 Cheat Sheet"
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">URL *</label>
                  <input
                    type="url"
                    required
                    value={resourceForm.url}
                    onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Type</label>
                  <select
                    value={resourceForm.type}
                    onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent"
                  >
                    <option value="ARTICLE">Article</option>
                    <option value="VIDEO">Video</option>
                    <option value="COURSE">Course</option>
                    <option value="DOCUMENTATION">Documentation</option>
                    <option value="PROJECT">Project Code</option>
                    <option value="BOOK">Book</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setResourceModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="accent" isLoading={createResourceMut.isPending}>
                    Share Material
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Report Safety Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {reportModalOpen && targetReportUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl relative"
            >
              <h3 className="font-bold text-lg text-text mb-2">Report Mentorship Participant</h3>
              <p className="text-xs text-text-secondary mb-4">
                Reporting <span className="font-semibold text-text">{targetReportUser.name}</span> to FCI administration.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  reportMut.mutate();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Reason *</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent"
                  >
                    <option value="UNPROFESSIONAL_BEHAVIOR">Unprofessional Behavior</option>
                    <option value="INACTIVITY_GHOSTING">Prolonged Inactivity / Ghosting</option>
                    <option value="HARASSMENT">Harassment or Abuse</option>
                    <option value="OTHER">Other Reason</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Details</label>
                  <textarea
                    rows={3}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Provide details for administrative review..."
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setReportModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="danger" isLoading={reportMut.isPending}>
                    File Safety Report
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default MentorshipDashboardPage;
