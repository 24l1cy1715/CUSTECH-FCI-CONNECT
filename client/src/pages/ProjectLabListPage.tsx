import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FolderKanban,
  Search,
  Plus,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Shield,
  Code2,
  Lock,
  Globe,
  Sparkles,
  ExternalLink,
  X,
} from 'lucide-react';
import { projectLabApi, CreateLabProjectPayload } from '@/api/projectLabApi';
import { LabProjectVisibility, LabProjectStatus } from '@/types/projectLab';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const PROJECT_CATEGORIES = [
  'ALL',
  'ARTIFICIAL_INTELLIGENCE',
  'CYBERSECURITY',
  'SOFTWARE_ENGINEERING',
  'DATA_SCIENCE',
  'WEB_DEVELOPMENT',
  'MOBILE_DEVELOPMENT',
  'NETWORKING',
  'IOT_EMBEDDED',
  'CLOUD_COMPUTING',
  'BLOCKCHAIN',
  'OTHER',
];

export const ProjectLabListPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'my' | 'explore'>('my');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form state for creating project
  const [formData, setFormData] = useState<CreateLabProjectPayload>({
    title: '',
    description: '',
    category: 'SOFTWARE_ENGINEERING',
    problemStatement: '',
    objectives: '',
    department: 'COMPUTER_SCIENCE',
    visibility: 'FCI_ONLY',
    githubUrl: '',
    liveDemoUrl: '',
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['lab-projects', activeTab, category, status, search],
    queryFn: () =>
      projectLabApi.getProjects({
        view: activeTab,
        category: category !== 'ALL' ? category : undefined,
        status: status !== 'ALL' ? status : undefined,
        search: search.trim() || undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateLabProjectPayload) => projectLabApi.createProject(payload),
    onSuccess: (newProject) => {
      toast.success('Project Lab Workspace created!');
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['lab-projects'] });
      navigate(`/project-lab/${newProject.slug}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create workspace');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required.');
      return;
    }
    createMutation.mutate(formData);
  };

  const getStatusBadge = (projStatus: LabProjectStatus) => {
    switch (projStatus) {
      case 'IDEA':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50">Idea</span>;
      case 'PLANNING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50">Planning</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50">In Progress</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50">Completed</span>;
      case 'ON_HOLD':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">On Hold</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070d19] text-[#0f172a] dark:text-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-8 shadow-xl text-white border border-blue-900/50">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold backdrop-blur-sm border border-blue-400/20">
                <FolderKanban className="w-3.5 h-3.5" />
                <span>Phase 7 Workspace</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                FCI Project Lab
              </h1>
              <p className="text-slate-300 text-base leading-relaxed">
                The centralized build environment for CUSTECH computing students. Plan milestones, assign Kanban tasks, assemble peer teams with AI, and graduate completed projects directly into the faculty Showcase.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/team-builder"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm backdrop-blur transition-colors border border-white/10"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>AI Team Builder</span>
              </Link>
              {user && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn-glow inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-400 text-slate-950 font-bold text-sm border border-transparent transition-all group cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start New Lab Project</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* View Selection Tabs & Search Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('my')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'my'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800'
              }`}
            >
              My Lab Projects
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'explore'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800'
              }`}
            >
              Explore Faculty Projects
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="py-2 px-3 rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PROJECT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace(/_/g, ' ')}
                </option>
              ))}
            </select>

            {/* Status Dropdown */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="py-2 px-3 rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="IDEA">Idea</option>
              <option value="PLANNING">Planning</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Project Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-64 rounded-xl bg-slate-200 dark:bg-slate-800/50 animate-pulse border border-slate-300 dark:border-slate-700/50"
              />
            ))}
          </div>
        ) : data?.projects && data.projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.projects.map((project) => (
              <div
                key={project.id}
                className="card-interactive group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 tracking-wide uppercase">
                      {project.category.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      {project.visibility === 'PRIVATE' ? (
                        <span title="Private Workspace"><Lock className="w-3.5 h-3.5 text-slate-400" /></span>
                      ) : (
                        <span title="Faculty Accessible"><Globe className="w-3.5 h-3.5 text-slate-400" /></span>
                      )}
                      {getStatusBadge(project.status)}
                    </div>
                  </div>

                  <Link
                    to={`/project-lab/${project.slug}`}
                    className="block text-[#0f172a] dark:text-slate-100 group-hover:text-accent transition-colors"
                  >
                    <h2 className="text-lg font-bold line-clamp-1">{project.title}</h2>
                  </Link>

                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {project.description}
                  </p>
                </div>

                {/* Progress bar based on legitimate calculated completion */}
                <div className="mt-5 space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Legitimate Progress</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {project.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
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

                  {/* Team & Workspace Stats */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {project.members?.length || 1}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {project._count?.tasks || 0} tasks
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        {project._count?.milestones || 0} milestones
                      </span>
                    </div>

                    <Link
                      to={`/project-lab/${project.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline group-hover:gap-1.5 transition-all"
                    >
                      <span>Open Lab</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <FolderKanban className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-bold">No Project Lab workspaces found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6">
              {activeTab === 'my'
                ? "You haven't created or joined any project workspaces yet. Start one now to build with peers!"
                : "No faculty projects match your active search filters."}
            </p>
            {user && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Lab Project</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Lab Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
              <div>
                <h2 className="text-xl font-bold">Create Project Lab Workspace</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Plan, build, and organize tasks before graduating to the Showcase.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Smart Campus Assistant"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PROJECT_CATEGORIES.filter((c) => c !== 'ALL').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Visibility
                  </label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value as LabProjectVisibility })}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="FCI_ONLY">FCI Community Only</option>
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private (Team Members Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Summary of what your team will build and achieve..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Problem Statement
                  </label>
                  <textarea
                    rows={2}
                    placeholder="What specific campus or computing problem does this address?"
                    value={formData.problemStatement || ''}
                    onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Objectives
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Target deliverables, architecture goals, or research findings..."
                    value={formData.objectives || ''}
                    onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    GitHub Repository URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={formData.githubUrl || ''}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Live Demo / Staging URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.liveDemoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, liveDemoUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating Workspace...' : 'Launch Lab Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
