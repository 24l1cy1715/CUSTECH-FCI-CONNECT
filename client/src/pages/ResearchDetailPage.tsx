import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FlaskConical,
  Users,
  BookOpen,
  Github,
  FileText,
  Database,
  ExternalLink,
  Plus,
  ArrowLeft,
  Sparkles,
  Award,
} from 'lucide-react';
import { researchApi } from '@/api/researchApi';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export const ResearchDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isPubModalOpen, setIsPubModalOpen] = useState(false);

  // New Publication Form
  const [pubData, setPubData] = useState({
    title: '',
    authors: '',
    abstract: '',
    journalOrConference: '',
    doi: '',
    paperUrl: '',
    repositoryUrl: '',
  });

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['research-project', slug],
    queryFn: () => researchApi.getProject(slug!),
    enabled: Boolean(slug),
  });

  const addPubMutation = useMutation({
    mutationFn: (data: any) => researchApi.addPublication(project!.id, data),
    onSuccess: () => {
      toast.success('Research publication registered!');
      setIsPubModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['research-project', slug] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add publication');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 px-4 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-surface-raised rounded-xl" />
        <div className="h-64 bg-surface-raised rounded-3xl" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-text">Research Project Not Found</h2>
        <Link to="/research">
          <Button variant="accent">Return to Research Hub</Button>
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === project.ownerId;

  return (
    <div className="min-h-screen bg-background text-text py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Back navigation */}
        <Link to="/research" className="inline-flex items-center text-sm font-semibold text-text-muted hover:text-accent transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Research Hub
        </Link>

        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-surface border border-border p-6 sm:p-10 shadow-lg space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-accent/15 border-accent/30 text-accent">
                {project.category}
              </Badge>
              {project.department && (
                <Badge variant="outline" className="text-xs bg-primary/10 border-primary/20 text-text-secondary">
                  {project.department.replace(/_/g, ' ')}
                </Badge>
              )}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-surface-raised border border-border">
              {project.researchStatus.replace(/_/g, ' ')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-text tracking-tight">
            {project.title}
          </h1>

          <p className="text-base text-text-secondary leading-relaxed">
            {project.description}
          </p>

          {/* External Links */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {project.paperUrl && (
              <a href={project.paperUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="text-xs">
                  <FileText className="w-3.5 h-3.5 mr-1.5 text-accent" /> Read Full Paper
                </Button>
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="text-xs">
                  <Github className="w-3.5 h-3.5 mr-1.5" /> Code Repository
                </Button>
              </a>
            )}
            {project.datasetUrl && (
              <a href={project.datasetUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="text-xs">
                  <Database className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> Research Dataset
                </Button>
              </a>
            )}
            {isOwner && (
              <Button variant="accent" size="sm" onClick={() => setIsPubModalOpen(true)}>
                <Award className="w-3.5 h-3.5 mr-1.5" /> Register Publication
              </Button>
            )}
          </div>
        </div>

        {/* Content Tabs / Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Abstract, Problem, Methodology) */}
          <div className="lg:col-span-2 space-y-6">
            {project.abstract && (
              <Card className="p-6 space-y-3">
                <h3 className="text-base font-bold text-text flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent" /> Abstract
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">{project.abstract}</p>
              </Card>
            )}

            {project.problemStatement && (
              <Card className="p-6 space-y-3">
                <h3 className="text-base font-bold text-text flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-amber-500" /> Problem Statement
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">{project.problemStatement}</p>
              </Card>
            )}

            {project.objectives && (
              <Card className="p-6 space-y-3">
                <h3 className="text-base font-bold text-text">Objectives & Scope</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{project.objectives}</p>
              </Card>
            )}

            {/* Formal Publications Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-text flex items-center gap-2">
                <Award className="w-5 h-5 text-accent" /> Publications & Peer Reviews
              </h3>

              {project.publications && project.publications.length > 0 ? (
                <div className="space-y-3">
                  {project.publications.map((pub) => (
                    <Card key={pub.id} className="p-5 space-y-2 border-accent/20">
                      <h4 className="text-base font-bold text-text">{pub.title}</h4>
                      <p className="text-xs font-semibold text-accent">Authors: {pub.authors}</p>
                      {pub.journalOrConference && (
                        <p className="text-xs text-text-muted">Published in: {pub.journalOrConference}</p>
                      )}
                      {pub.doi && <p className="text-xs font-mono text-text-muted">DOI: {pub.doi}</p>}
                      {pub.paperUrl && (
                        <div className="pt-2">
                          <a href={pub.paperUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="text-xs p-0 text-accent">
                              View Publication Link <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          </a>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-6 text-center text-sm text-text-muted">
                  No peer-reviewed publications registered yet.
                </Card>
              )}
            </div>
          </div>

          {/* Right Sidebar: Research Team & Mentorship */}
          <div className="space-y-6">
            {/* Principal Investigator / Lead */}
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Research Lead</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 text-accent flex items-center justify-center font-bold text-base overflow-hidden">
                  {project.owner?.profile?.avatarUrl ? (
                    <img src={project.owner.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    project.owner?.profile?.fullName?.charAt(0) || 'R'
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text">{project.owner?.profile?.fullName}</h4>
                  <p className="text-xs text-text-muted">{project.owner?.profile?.department?.replace(/_/g, ' ') || 'FCI Student'}</p>
                </div>
              </div>
            </Card>

            {/* Research Collaborators */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Team ({project.members?.length || 0})
                </h3>
                <Link to="/team-builder">
                  <Button variant="ghost" size="sm" className="text-xs text-accent">
                    <Sparkles className="w-3.5 h-3.5 mr-1" /> AI Match
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {project.members?.map((member) => (
                  <div key={member.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border/40 last:border-none">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-surface-raised flex items-center justify-center text-xs font-bold">
                        {member.user.profile?.fullName?.charAt(0) || 'M'}
                      </div>
                      <span className="text-xs font-medium text-text">{member.user.profile?.fullName || 'Collaborator'}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Publication Modal */}
      {isPubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-surface border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-text">Register Formal Publication</h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Paper Title</label>
                <input
                  type="text"
                  value={pubData.title}
                  onChange={(e) => setPubData({ ...pubData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Authors (Comma separated)</label>
                <input
                  type="text"
                  value={pubData.authors}
                  onChange={(e) => setPubData({ ...pubData, authors: e.target.value })}
                  placeholder="e.g. John Doe, Prof. A. B. Smith"
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Journal / Conference Name</label>
                <input
                  type="text"
                  value={pubData.journalOrConference}
                  onChange={(e) => setPubData({ ...pubData, journalOrConference: e.target.value })}
                  placeholder="e.g. IEEE African Transactions on Computing"
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Paper URL / DOI Link</label>
                <input
                  type="url"
                  value={pubData.paperUrl}
                  onChange={(e) => setPubData({ ...pubData, paperUrl: e.target.value })}
                  placeholder="https://doi.org/..."
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button variant="ghost" onClick={() => setIsPubModalOpen(false)}>Cancel</Button>
              <Button
                variant="accent"
                disabled={!pubData.title || !pubData.authors || addPubMutation.isPending}
                onClick={() => addPubMutation.mutate(pubData)}
              >
                {addPubMutation.isPending ? 'Registering...' : 'Register Publication'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
