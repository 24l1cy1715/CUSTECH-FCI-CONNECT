import React, { useState } from 'react';
import {
  Code2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Github,
  Sparkles,
  Eye,
  MessageSquare,
  Search,
  X,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useAdminStore } from '@/store/adminStore';
import { ProjectStatus } from '@/types/admin';
import toast from 'react-hot-toast';

export const AdminProjectsModeration: React.FC = () => {
  const { projects, approveProject, rejectProject, featureProjectToggle } = useAdminStore();
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [search, setSearch] = useState<string>('');

  // Reject modal state
  const [rejectingProject, setRejectingProject] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState<string>(
    'Incomplete documentation or non-functional demo URL. Please update project repository.'
  );

  const filteredProjects = projects.filter((p) => {
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.authorName.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      (p.authorMatric && p.authorMatric.toLowerCase().includes(search.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const handleApprove = (id: string, title: string) => {
    approveProject(id, 100);
    toast.success(`Project "${title}" approved and featured in public directory!`);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingProject) return;
    rejectProject(rejectingProject.id, rejectReason);
    toast.error(`Project "${rejectingProject.title}" rejected with feedback.`);
    setRejectingProject(null);
  };

  const pendingCount = projects.filter((p) => p.status === 'PENDING').length;
  const approvedCount = projects.filter((p) => p.status === 'APPROVED').length;
  const rejectedCount = projects.filter((p) => p.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      {/* ── Top Tabs & Search ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-border">
          {[
            { id: 'PENDING', label: 'Pending Review', count: pendingCount, color: 'text-accent' },
            { id: 'APPROVED', label: 'Approved Showcase', count: approvedCount, color: 'text-emerald-500' },
            { id: 'REJECTED', label: 'Rejected', count: rejectedCount, color: 'text-rose-500' },
            { id: 'ALL', label: 'All Submissions', count: projects.length, color: 'text-text-muted' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                filterStatus === tab.id
                  ? 'bg-surface-raised shadow-sm text-text border border-border'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-bg ${tab.color}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-surface text-text text-xs focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* ── Projects Cards Grid ── */}
      {filteredProjects.length === 0 ? (
        <Card className="p-12 text-center space-y-2 border-dashed border-2">
          <Code2 className="w-10 h-10 text-text-muted mx-auto" />
          <div className="font-bold text-sm text-text">No projects found in this queue</div>
          <p className="text-xs text-text-muted">
            Try adjusting your search query or selecting a different status filter above.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className={`p-5 space-y-4 border-l-4 transition-all hover:shadow-md ${
                project.status === 'PENDING'
                  ? 'border-l-accent'
                  : project.status === 'APPROVED'
                  ? 'border-l-emerald-500'
                  : 'border-l-rose-500'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="accent" size="sm">
                      {project.category}
                    </Badge>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        project.status === 'PENDING'
                          ? 'bg-accent/15 text-accent animate-pulse'
                          : project.status === 'APPROVED'
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : 'bg-rose-500/15 text-rose-500'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-text leading-snug">{project.title}</h3>
                </div>

                {project.images && project.images[0] && (
                  <img
                    src={project.images[0]}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border"
                  />
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                {project.description}
              </p>

              {/* Author & Academic Info */}
              <div className="p-2.5 rounded-xl bg-surface-raised border border-border flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-text-muted">Author: </span>
                  <span className="font-bold text-text">{project.authorName}</span>
                  <span className="text-text-muted font-mono ml-1">({project.authorMatric || project.authorDepartment})</span>
                </div>
                <div className="text-text-muted font-mono">
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Rejection Reason if any */}
              {project.rejectionReason && (
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
                  <span className="font-bold">Rejection Note: </span>
                  {project.rejectionReason}
                </div>
              )}

              {/* Links & Administrative Review Actions */}
              <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg border border-border bg-surface hover:text-accent transition-colors flex items-center gap-1 text-xs"
                      title="Inspect GitHub Repository"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-mono">Code</span>
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg border border-border bg-surface hover:text-accent transition-colors flex items-center gap-1 text-xs"
                      title="Inspect Live Demo Deployment"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-mono">Demo</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {project.status !== 'APPROVED' && (
                    <Button
                      size="sm"
                      variant="primary"
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      onClick={() => handleApprove(project.id, project.title)}
                    >
                      Approve (+100 PTS)
                    </Button>
                  )}

                  {project.status !== 'REJECTED' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-500 hover:bg-rose-500/10"
                      leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      onClick={() => setRejectingProject(project)}
                    >
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Rejection Feedback Modal ── */}
      {rejectingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2 text-rose-500">
                <XCircle className="w-5 h-5" />
                <h3 className="font-bold text-base text-text">Reject Project Submission</h3>
              </div>
              <button
                onClick={() => setRejectingProject(null)}
                className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface-raised transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-text-muted">Target Submission:</span>
              <div className="font-bold text-sm text-text">{rejectingProject.title}</div>
              <div className="text-text-secondary">Author: {rejectingProject.authorName} ({rejectingProject.authorEmail})</div>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-text">Academic / Technical Feedback Note</label>
                <textarea
                  required
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-bg text-text text-xs focus:outline-none focus:border-rose-500 resize-none"
                  placeholder="Explain why this project submission needs revisions..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setRejectingProject(null)}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" type="submit">
                  Confirm Rejection
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
