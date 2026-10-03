import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  Search,
  Plus,
  BookOpen,
  Users,
  Lightbulb,
  Heart,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { researchApi } from '@/api/researchApi';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export const ResearchHubPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'projects' | 'ideas'>('projects');
  const [category, setCategory] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);

  // New Project Form
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    category: 'Cybersecurity',
    problemStatement: '',
    objectives: '',
    visibility: 'PUBLIC',
  });

  // New Idea Form
  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    category: 'Artificial Intelligence',
  });

  // Fetch Projects
  const { data: projectData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['research-projects', category, search],
    queryFn: () => researchApi.listProjects({ category, search }),
  });

  // Fetch Ideas
  const { data: ideaData, isLoading: isLoadingIdeas } = useQuery({
    queryKey: ['research-ideas', category, search],
    queryFn: () => researchApi.listIdeas({ category, search }),
    enabled: activeTab === 'ideas',
  });

  // Create Project Mutation
  const createProjectMutation = useMutation({
    mutationFn: researchApi.createProject,
    onSuccess: () => {
      toast.success('Research project initialized!');
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['research-projects'] });
      setNewProject({
        title: '',
        description: '',
        category: 'Cybersecurity',
        problemStatement: '',
        objectives: '',
        visibility: 'PUBLIC',
      });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'Failed to create project';
      toast.error(msg);
    },
  });

  // Create Idea Mutation
  const createIdeaMutation = useMutation({
    mutationFn: researchApi.createIdea,
    onSuccess: () => {
      toast.success('Research idea posted to Idea Board!');
      setIsIdeaModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['research-ideas'] });
      setNewIdea({ title: '', description: '', category: 'Artificial Intelligence' });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'Failed to post idea';
      toast.error(msg);
    },
  });

  // Like Idea Mutation
  const likeIdeaMutation = useMutation({
    mutationFn: (ideaId: string) => researchApi.likeIdea(ideaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['research-ideas'] });
    },
  });

  const categories = [
    'All',
    'Cybersecurity',
    'Artificial Intelligence',
    'Software Engineering',
    'Data Science',
    'Networking',
    'Cloud Computing',
    'Robotics & IoT',
    'Human Computer Interaction',
  ];

  return (
    <div className="min-h-screen bg-background text-text py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-primary/95 to-accent/20 border border-border/40 p-8 sm:p-12 shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold">
              <FlaskConical className="w-4 h-4" />
              <span>FCI Research & Innovation Ecosystem</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Pioneering Tomorrow's Tech at CUSTECH
            </h1>
            <p className="text-sm sm:text-base text-gray-300">
              Discover active student publications, join faculty research initiatives, and pitch groundbreaking technological hypotheses on the FCI Idea Board.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {isAuthenticated ? (
                <>
                  <Button variant="accent" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Start Research Project
                  </Button>
                  <Button variant="outline" onClick={() => setIsIdeaModalOpen(true)} className="bg-surface/30 text-white border-white/20">
                    <Lightbulb className="w-4 h-4 mr-2 text-accent" /> Share Research Idea
                  </Button>
                </>
              ) : (
                <Link to="/login">
                  <Button variant="accent">Sign in to Collaborate</Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs & Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'projects'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-text-muted hover:text-text hover:bg-surface-raised'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Research Projects
            </button>
            <button
              onClick={() => setActiveTab('ideas')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'ideas'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-text-muted hover:text-text hover:bg-surface-raised'
              }`}
            >
              <Lightbulb className="w-4 h-4" /> Idea Board
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search papers, hypotheses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <SlidersHorizontal className="w-4 h-4 text-text-muted shrink-0 mr-1" />
          {categories.map((cat) => {
            const isSelected = (cat === 'All' && !category) || category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat === 'All' ? '' : cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-surface border border-border text-text-muted hover:border-text-secondary'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Research Projects Grid */}
        {activeTab === 'projects' && (
          <div>
            {isLoadingProjects ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-64 rounded-2xl bg-surface-raised animate-pulse border border-border" />
                ))}
              </div>
            ) : projectData?.projects && projectData.projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectData.projects.map((project) => (
                  <Card key={project.id} glow className="flex flex-col justify-between p-6 group">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-xs bg-accent/10 border-accent/30 text-accent">
                          {project.category}
                        </Badge>
                        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                          {project.researchStatus.replace('_', ' ')}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-text group-hover:text-accent transition-colors line-clamp-2">
                        {project.title}
                      </h3>

                      <p className="text-sm text-text-secondary line-clamp-3">
                        {project.abstract || project.description}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-border mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/20 text-accent flex items-center justify-center font-bold text-xs">
                          {project.owner?.profile?.avatarUrl ? (
                            <img src={project.owner.profile.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            project.owner?.profile?.fullName?.charAt(0) || 'F'
                          )}
                        </div>
                        <span className="text-xs font-medium text-text-muted truncate max-w-[120px]">
                          {project.owner?.profile?.fullName || 'FCI Researcher'}
                        </span>
                      </div>

                      <Link to={`/research/${project.slug}`}>
                        <Button variant="ghost" size="sm" className="text-xs font-semibold group-hover:text-accent" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                          View Paper
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-surface rounded-2xl border border-dashed border-border space-y-3">
                <FlaskConical className="w-12 h-12 text-text-muted mx-auto" />
                <h3 className="text-base font-bold text-text">No research projects found</h3>
                <p className="text-sm text-text-secondary max-w-sm mx-auto">
                  Be the first student to publish a research paper or initialize a collaborative lab initiative.
                </p>
                {isAuthenticated && (
                  <Button variant="accent" size="sm" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Start Research Project
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Idea Board */}
        {activeTab === 'ideas' && (
          <div>
            {isLoadingIdeas ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-44 rounded-2xl bg-surface-raised animate-pulse border border-border" />
                ))}
              </div>
            ) : ideaData?.ideas && ideaData.ideas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ideaData.ideas.map((idea) => {
                  const isLiked = idea.likes && idea.likes.length > 0;
                  return (
                    <Card key={idea.id} className="p-6 space-y-4 hover:border-accent/30 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Badge variant="outline" className="text-[11px] mb-2 bg-primary/10 border-primary/20 text-primary dark:text-white">
                            {idea.category}
                          </Badge>
                          <h4 className="text-base font-bold text-text">{idea.title}</h4>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                          <Lightbulb className="w-4 h-4 text-accent" />
                        </div>
                      </div>

                      <p className="text-sm text-text-secondary">{idea.description}</p>

                      <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-text-muted">
                        <span>Pitched by {idea.author.profile?.fullName || 'FCI Student'}</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => likeIdeaMutation.mutate(idea.id)}
                            className="flex items-center gap-1 text-xs hover:text-rose-500 transition-colors"
                          >
                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                            <span>{idea.likesCount || 0}</span>
                          </button>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{idea._count?.comments || 0}</span>
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-surface rounded-2xl border border-dashed border-border space-y-3">
                <Lightbulb className="w-12 h-12 text-text-muted mx-auto" />
                <h3 className="text-base font-bold text-text">No research hypotheses pitched yet</h3>
                <p className="text-sm text-text-secondary">Have an innovation concept? Pitch it to find collaborators.</p>
                {isAuthenticated && (
                  <Button variant="accent" size="sm" onClick={() => setIsIdeaModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Share Research Idea
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Start Project Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-surface border border-border rounded-2xl p-6 shadow-2xl space-y-5 my-8"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-lg font-bold text-text flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-accent" /> Start Research Project
                </h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface-raised transition-colors" aria-label="Close modal">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    placeholder="e.g. Distributed Quantum Cryptography in Campus Networks"
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Category</label>
                  <select
                    value={newProject.category}
                    onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:ring-2 focus:ring-accent outline-none"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Abstract / Executive Summary</label>
                  <textarea
                    rows={3}
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Describe the research objective, methodology, and expected technical outcome..."
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Problem Statement</label>
                  <textarea
                    rows={2}
                    value={newProject.problemStatement}
                    onChange={(e) => setNewProject({ ...newProject, problemStatement: e.target.value })}
                    placeholder="What specific problem is this research solving?"
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                <Button
                  variant="accent"
                  disabled={!newProject.title || !newProject.description || createProjectMutation.isPending}
                  onClick={() => createProjectMutation.mutate(newProject)}
                >
                  {createProjectMutation.isPending ? 'Initializing...' : 'Create Project'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pitch Idea Modal */}
      <AnimatePresence>
        {isIdeaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-lg font-bold text-text flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-accent" /> Share Research Idea
                </h3>
                <button onClick={() => setIsIdeaModalOpen(false)} className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface-raised transition-colors" aria-label="Close modal">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Concept Title</label>
                  <input
                    type="text"
                    required
                    value={newIdea.title}
                    onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                    placeholder="e.g. AI-driven campus energy optimization model"
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Domain</label>
                  <select
                    value={newIdea.category}
                    onChange={(e) => setNewIdea({ ...newIdea, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:ring-2 focus:ring-accent outline-none"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Hypothesis & Challenge</label>
                  <textarea
                    rows={4}
                    value={newIdea.description}
                    onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                    placeholder="Explain what technical hypothesis you want tested and how students can collaborate..."
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button variant="ghost" onClick={() => setIsIdeaModalOpen(false)}>Cancel</Button>
                <Button
                  variant="accent"
                  disabled={!newIdea.title || !newIdea.description || createIdeaMutation.isPending}
                  onClick={() => createIdeaMutation.mutate(newIdea)}
                >
                  {createIdeaMutation.isPending ? 'Posting...' : 'Pitch Idea'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
