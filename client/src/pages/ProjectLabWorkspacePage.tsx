import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FolderKanban,
  Kanban,
  CheckCircle2,
  Clock,
  Layers,
  Users,
  MessageSquare,
  Link2,
  Github,
  Globe,
  Plus,
  ArrowRight,
  Shield,
  Trash2,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Send,
  Award,
  AlertCircle,
} from 'lucide-react';
import { projectLabApi, CreateTaskPayload, CreateMilestonePayload } from '@/api/projectLabApi';
import {
  LabTaskStatus,
  LabTaskPriority,
  LabTeamRole,
  LabMemberStatus,
} from '@/types/projectLab';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export const ProjectLabWorkspacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'board' | 'milestones' | 'team' | 'discussions' | 'resources' | 'overview'>('board');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isShowcaseModalOpen, setIsShowcaseModalOpen] = useState(false);

  // Form states
  const [taskForm, setTaskForm] = useState<CreateTaskPayload>({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
  });

  const [milestoneForm, setMilestoneForm] = useState<CreateMilestonePayload>({
    title: '',
    description: '',
    dueDate: '',
  });

  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteRole, setInviteRole] = useState<LabTeamRole>('DEVELOPER');

  const [resourceForm, setResourceForm] = useState({
    title: '',
    url: '',
    type: 'DOCUMENTATION',
  });

  const [showcaseForm, setShowcaseForm] = useState({
    title: '',
    description: '',
    category: '',
    githubUrl: '',
    demoUrl: '',
  });

  const [discussionContent, setDiscussionContent] = useState('');

  // Fetch project details
  const {
    data: project,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['lab-project', slug],
    queryFn: () => projectLabApi.getProject(slug!),
    enabled: Boolean(slug),
  });

  // Discussions query
  const { data: discussions = [] } = useQuery({
    queryKey: ['lab-discussions', project?.id],
    queryFn: () => projectLabApi.getDiscussions(project!.id),
    enabled: Boolean(project?.id && activeTab === 'discussions'),
  });

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: (payload: CreateTaskPayload) => projectLabApi.createTask(project!.id, payload),
    onSuccess: () => {
      toast.success('Task created!');
      setIsTaskModalOpen(false);
      setTaskForm({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '' });
      queryClient.invalidateQueries({ queryKey: ['lab-project', slug] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create task'),
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: LabTaskStatus }) =>
      projectLabApi.updateTask(project!.id, taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-project', slug] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update task'),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => projectLabApi.deleteTask(project!.id, taskId),
    onSuccess: () => {
      toast.success('Task removed');
      queryClient.invalidateQueries({ queryKey: ['lab-project', slug] });
    },
  });

  const createMilestoneMutation = useMutation({
    mutationFn: (payload: CreateMilestonePayload) => projectLabApi.createMilestone(project!.id, payload),
    onSuccess: () => {
      toast.success('Milestone added!');
      setIsMilestoneModalOpen(false);
      setMilestoneForm({ title: '', description: '', dueDate: '' });
      queryClient.invalidateQueries({ queryKey: ['lab-project', slug] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create milestone'),
  });

  const toggleMilestoneMutation = useMutation({
    mutationFn: ({ milestoneId, status }: { milestoneId: string; status: string }) =>
      projectLabApi.updateMilestone(project!.id, milestoneId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-project', slug] });
    },
  });

  const inviteMemberMutation = useMutation({
    mutationFn: () => projectLabApi.inviteMember(project!.id, inviteUserId, inviteRole),
    onSuccess: () => {
      toast.success('Invitation sent to student!');
      setIsInviteModalOpen(false);
      setInviteUserId('');
      queryClient.invalidateQueries({ queryKey: ['lab-project', slug] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to invite member'),
  });

  const respondInvitationMutation = useMutation({
    mutationFn: (action: 'ACCEPT' | 'DECLINE') => projectLabApi.respondInvitation(project!.id, action),
    onSuccess: (_, action) => {
      toast.success(action === 'ACCEPT' ? 'Welcome to the team!' : 'Invitation declined');
      queryClient.invalidateQueries({ queryKey: ['lab-project', slug] });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => projectLabApi.removeMember(project!.id, memberId),
    onSuccess: () => {
      toast.success('Member removed');
      queryClient.invalidateQueries({ queryKey: ['lab-project', slug] });
    },
  });

  const addResourceMutation = useMutation({
    mutationFn: () => projectLabApi.addResource(project!.id, resourceForm),
    onSuccess: () => {
      toast.success('Resource linked to project!');
      setIsResourceModalOpen(false);
      setResourceForm({ title: '', url: '', type: 'DOCUMENTATION' });
      queryClient.invalidateQueries({ queryKey: ['lab-project', slug] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add resource'),
  });

  const postDiscussionMutation = useMutation({
    mutationFn: () => projectLabApi.createDiscussion(project!.id, discussionContent),
    onSuccess: () => {
      setDiscussionContent('');
      queryClient.invalidateQueries({ queryKey: ['lab-discussions', project?.id] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to post message'),
  });

  const submitShowcaseMutation = useMutation({
    mutationFn: () => projectLabApi.submitToShowcase(project!.id, showcaseForm),
    onSuccess: () => {
      toast.success('Submitted to FCI Project Showcase for faculty review!');
      setIsShowcaseModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['lab-project', slug] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to submit to Showcase'),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
        <FolderKanban className="w-16 h-16 text-slate-400 mb-4" />
        <h2 className="text-xl font-bold">Project Lab Workspace Not Found</h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">
          This project may be private or does not exist.
        </p>
        <Link to="/project-lab" className="text-blue-600 font-semibold hover:underline">
          Return to Project Lab
        </Link>
      </div>
    );
  }

  const isCreator = user?.id === project.createdById;
  const isMember = project.userMembership?.status === 'ACTIVE';
  const hasPendingInvite = project.userMembership?.status === 'INVITED';

  // Kanban task columns
  const kanbanColumns: Array<{ id: LabTaskStatus; label: string; bg: string }> = [
    { id: 'TODO', label: 'To Do', bg: 'border-slate-300 dark:border-slate-800' },
    { id: 'IN_PROGRESS', label: 'In Progress', bg: 'border-blue-400 dark:border-blue-800' },
    { id: 'REVIEW', label: 'Review', bg: 'border-amber-400 dark:border-amber-800' },
    { id: 'DONE', label: 'Done', bg: 'border-green-400 dark:border-green-800' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070d19] text-[#0f172a] dark:text-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/project-lab" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Project Lab
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-[#0f172a] dark:text-slate-200">{project.title}</span>
        </div>

        {/* Pending Invitation Banner */}
        {hasPendingInvite && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                You have been invited to join this project team as <strong>{project.userMembership?.role}</strong>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => respondInvitationMutation.mutate('ACCEPT')}
                className="px-4 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold text-xs transition-colors"
              >
                Accept Invitation
              </button>
              <button
                onClick={() => respondInvitationMutation.mutate('DECLINE')}
                className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {/* Workspace Header */}
        <div className="rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60">
                  {project.category.replace(/_/g, ' ')}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                  {project.status.replace(/_/g, ' ')}
                </span>
                {project.visibility === 'PRIVATE' && (
                  <span className="px-2 py-0.5 rounded text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 font-medium">
                    Private
                  </span>
                )}
                {project.showcaseProject && (
                  <Link
                    to={`/projects/${project.showcaseProject.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Graduated to Showcase ({project.showcaseProject.status})</span>
                  </Link>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-[#f8fafc]">{project.title}</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                {project.description}
              </p>

              {/* GitHub / Demo Links */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    <span>Repository</span>
                  </a>
                )}
                {project.liveDemoUrl && (
                  <a
                    href={project.liveDemoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>
            </div>

            {/* Calculated Legitimate Progress & Graduation CTA */}
            <div className="flex flex-col sm:items-end justify-between gap-4 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 pt-4 lg:pt-0 lg:pl-6 min-w-[240px]">
              <div className="w-full space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Calculated Completion</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                    {project.progressPercentage}%
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      project.progressPercentage === 100
                        ? 'bg-green-500'
                        : project.progressPercentage > 50
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.max(project.progressPercentage, 4)}%` }}
                  />
                </div>
              </div>

              {isCreator && !project.showcaseProject && (
                <button
                  onClick={() => {
                    setShowcaseForm({
                      title: project.title,
                      description: project.description,
                      category: project.category,
                      githubUrl: project.githubUrl || '',
                      demoUrl: project.liveDemoUrl || '',
                    });
                    setIsShowcaseModalOpen(true);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
                >
                  <Award className="w-4 h-4" />
                  <span>Graduate to Showcase</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 border-t border-slate-200 dark:border-slate-800 mt-6 pt-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab('board')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'board'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Kanban Board</span>
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'milestones'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Milestones ({project.milestones?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'team'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Team & AI Builder</span>
            </button>
            <button
              onClick={() => setActiveTab('discussions')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'discussions'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Discussions</span>
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'resources'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>Resources ({project.resources?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Overview</span>
            </button>
          </div>
        </div>

        {/* ── TAB 1: KANBAN BOARD ────────────────────────────────────────── */}
        {activeTab === 'board' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2 text-[#0f172a] dark:text-[#f8fafc]">
                <Kanban className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Task Board</span>
              </h2>
              {(isMember || isCreator) && (
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kanbanColumns.map((col) => {
                const colTasks = project.tasks?.filter((t) => t.status === col.id) || [];
                return (
                  <div
                    key={col.id}
                    className={`flex flex-col rounded-xl bg-slate-100/80 dark:bg-[#0c1322] border ${col.bg} p-4 min-h-[400px]`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        {col.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm">
                        {colTasks.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {colTasks.map((task) => (
                        <div
                          key={task.id}
                          className="rounded-lg bg-white dark:bg-[#131d33] border border-slate-200 dark:border-slate-700/60 p-3.5 shadow-sm space-y-2 hover:border-blue-400 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                task.priority === 'URGENT'
                                  ? 'bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                  : task.priority === 'HIGH'
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {task.priority}
                            </span>
                            {(isMember || isCreator) && (
                              <button
                                onClick={() => deleteTaskMutation.mutate(task.id)}
                                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                title="Delete task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-[#0f172a] dark:text-slate-100 leading-snug">
                            {task.title}
                          </h4>

                          {task.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          {/* Task footer: Assignee & status selector */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50 text-[11px] text-slate-600 dark:text-slate-400">
                            <span>{task.assignee?.profile?.fullName || 'Unassigned'}</span>

                            {/* Status changer select */}
                            {(isMember || isCreator) && (
                              <select
                                value={task.status}
                                onChange={(e) =>
                                  updateTaskStatusMutation.mutate({
                                    taskId: task.id,
                                    status: e.target.value as LabTaskStatus,
                                  })
                                }
                                className="text-[11px] py-0.5 px-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 focus:outline-none"
                              >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="REVIEW">Review</option>
                                <option value="DONE">Done</option>
                              </select>
                            )}
                          </div>
                        </div>
                      ))}

                      {colTasks.length === 0 && (
                        <div className="h-28 flex items-center justify-center text-xs text-slate-400 italic">
                          No tasks in {col.label.toLowerCase()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 2: MILESTONES ROADMAP ─────────────────────────────────── */}
        {activeTab === 'milestones' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Project Milestones</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Legitimate roadmap progress. Each completed milestone contributes to your project completion percentage.
                </p>
              </div>
              {(isMember || isCreator) && (
                <button
                  onClick={() => setIsMilestoneModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Milestone</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {project.milestones && project.milestones.length > 0 ? (
                project.milestones.map((milestone, idx) => (
                  <div
                    key={milestone.id}
                    className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() =>
                          toggleMilestoneMutation.mutate({
                            milestoneId: milestone.id,
                            status: milestone.status === 'COMPLETED' ? 'PLANNED' : 'COMPLETED',
                          })
                        }
                        disabled={!isMember && !isCreator}
                        className={`mt-0.5 rounded-full p-1 transition-colors ${
                          milestone.status === 'COMPLETED'
                            ? 'text-green-600 bg-green-50 dark:bg-green-950/40'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                          <h4
                            className={`text-sm font-bold ${
                              milestone.status === 'COMPLETED'
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {milestone.title}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              milestone.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : milestone.status === 'IN_PROGRESS'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {milestone.status}
                          </span>
                        </div>
                        {milestone.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {milestone.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {milestone.dueDate && (
                      <span className="text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(milestone.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-slate-500">
                  No milestones added yet. Add milestones to track deliverable progress!
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 3: TEAM & AI BUILDER ──────────────────────────────────── */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            {/* AI Team Builder Callout */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/30 border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Team Builder Integration</span>
                </div>
                <h3 className="text-lg font-bold text-white">Need peer talent for this project?</h3>
                <p className="text-xs text-slate-300">
                  Use FCI Connect's Skill Graph to find students with matching cybersecurity, frontend, or backend expertise.
                </p>
              </div>
              <Link
                to={`/team-builder?projectId=${project.id}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
              >
                <span>Find Teammates via AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Team Members List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold">Active Team Members</h3>
                {isCreator && (
                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Invite Student</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.members?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                        {member.user.profile?.fullName?.charAt(0) || member.user.email.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">{member.user.profile?.fullName || member.user.email}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {member.role.replace(/_/g, ' ')}
                          </span>
                          <span>•</span>
                          <span>{member.status}</span>
                        </div>
                      </div>
                    </div>

                    {isCreator && member.userId !== project.createdById && (
                      <button
                        onClick={() => removeMemberMutation.mutate(member.id)}
                        className="text-slate-400 hover:text-red-500 p-1 text-xs"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: DISCUSSIONS ────────────────────────────────────────── */}
        {activeTab === 'discussions' && (
          <div className="space-y-6">
            {(isMember || isCreator) && (
              <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <textarea
                  rows={3}
                  placeholder="Share updates, architecture questions, or meeting notes with your project team..."
                  value={discussionContent}
                  onChange={(e) => setDiscussionContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => postDiscussionMutation.mutate()}
                    disabled={!discussionContent.trim() || postDiscussionMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Message</span>
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {discussions.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {msg.author?.profile?.fullName || 'Project Member'}
                    </span>
                    <span className="text-slate-400">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{msg.content}</p>
                </div>
              ))}

              {discussions.length === 0 && (
                <div className="p-8 text-center rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                  No discussions yet. Post a message to coordinate with your teammates!
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 5: RESOURCES ─────────────────────────────────────────── */}
        {activeTab === 'resources' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Attached Project Resources</h2>
              {(isMember || isCreator) && (
                <button
                  onClick={() => setIsResourceModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach Resource</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.resources?.map((res) => (
                <a
                  key={res.id}
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors shadow-sm"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-blue-600 uppercase">
                      {res.type}
                    </span>
                    <h4 className="text-sm font-bold">{res.title}</h4>
                    <span className="text-xs text-slate-400 truncate block max-w-xs">{res.url}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>
              ))}

              {(!project.resources || project.resources.length === 0) && (
                <div className="col-span-full p-8 text-center rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-slate-500">
                  No resources attached yet. Link documentation, datasets, and design files!
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 6: OVERVIEW ─────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="p-6 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-base font-bold">Problem Statement</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {project.problemStatement || 'No specific problem statement provided.'}
                </p>

                <h3 className="text-base font-bold pt-4 border-t border-slate-100 dark:border-slate-800">
                  Objectives & Deliverables
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {project.objectives || 'No specific objectives entered yet.'}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Project Details</h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400">Department:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {project.department || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Team Lead:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {project.createdBy?.profile?.fullName || 'Project Lead'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Start Date:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Target Completion:</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {project.targetDate ? new Date(project.targetDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold">Add Task to Board</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createTaskMutation.mutate(taskForm);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={taskForm.description || ''}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as LabTaskPriority })}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status Column
                  </label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as LabTaskStatus })}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTaskMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Milestone Modal */}
      {isMilestoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold">Add Project Milestone</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMilestoneMutation.mutate(milestoneForm);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Core API Authentication Complete"
                  value={milestoneForm.title}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={milestoneForm.description || ''}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMilestoneModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMilestoneMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold">Invite Teammate</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Student User ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Paste student UUID"
                  value={inviteUserId}
                  onChange={(e) => setInviteUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Or use the <Link to={`/team-builder?projectId=${project.id}`} className="text-blue-500 hover:underline">AI Team Builder</Link> to search by verified skills.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Team Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as LabTeamRole)}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DEVELOPER">Developer</option>
                  <option value="DESIGNER">Designer</option>
                  <option value="CYBERSECURITY">Cybersecurity</option>
                  <option value="RESEARCHER">Researcher</option>
                  <option value="DATA_SCIENTIST">Data Scientist</option>
                  <option value="DOCUMENTATION">Documentation</option>
                  <option value="QA_TESTER">QA Tester</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => inviteMemberMutation.mutate()}
                  disabled={!inviteUserId.trim() || inviteMemberMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
                >
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Showcase Submission Modal */}
      {isShowcaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-500" />
              <div>
                <h3 className="text-lg font-bold">Graduate to FCI Project Showcase</h3>
                <p className="text-xs text-slate-500">
                  Submits this completed Lab project into the platform-wide Showcase for faculty moderation.
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitShowcaseMutation.mutate();
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Public Title
                </label>
                <input
                  type="text"
                  required
                  value={showcaseForm.title}
                  onChange={(e) => setShowcaseForm({ ...showcaseForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Showcase Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={showcaseForm.description}
                  onChange={(e) => setShowcaseForm({ ...showcaseForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsShowcaseModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitShowcaseMutation.isPending}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow"
                >
                  {submitShowcaseMutation.isPending ? 'Submitting...' : 'Submit to Showcase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
