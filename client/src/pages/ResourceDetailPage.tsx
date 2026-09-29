import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Calendar,
  Eye,
  FileDown,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
  Share2,
  ShieldAlert,
  GraduationCap,
  PlayCircle,
  Code,
  FileText,
  User as UserIcon,
} from 'lucide-react';
import { learningApi } from '@/api/learningApi';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ResourceCard, getResourceTypeIcon } from '@/components/learning/ResourceCard';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export const ResourceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [sliderVal, setSliderVal] = useState<number | null>(null);

  // Fetch resource detail
  const {
    data: resource,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['learning-resource', slug],
    queryFn: () => learningApi.getResourceBySlug(slug!),
    enabled: !!slug,
  });

  // Fetch related resources in same category
  const { data: relatedData } = useQuery({
    queryKey: ['learning-related', resource?.category],
    queryFn: () =>
      learningApi.getResources({
        category: resource?.category,
        limit: 3,
      }),
    enabled: !!resource?.category,
  });

  // Save/Unsave mutation
  const saveMutation = useMutation({
    mutationFn: async (currentlySaved: boolean) => {
      if (!resource) return;
      if (currentlySaved) {
        return learningApi.unsaveResource(resource.id);
      } else {
        return learningApi.saveResource(resource.id);
      }
    },
    onSuccess: (_, currentlySaved) => {
      toast.success(currentlySaved ? 'Bookmark removed' : 'Saved to your bookmarks!');
      queryClient.invalidateQueries({ queryKey: ['learning-resource', slug] });
      queryClient.invalidateQueries({ queryKey: ['learning-overview'] });
    },
    onError: () => toast.error('Failed to update bookmark'),
  });

  // Progress update mutation
  const progressMutation = useMutation({
    mutationFn: async (payload: {
      status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
      progressPercentage?: number;
    }) => {
      if (!resource) return;
      return learningApi.updateProgress(resource.id, payload);
    },
    onSuccess: (data) => {
      toast.success(
        data.status === 'COMPLETED'
          ? 'Resource completed! Great work!'
          : 'Study progress saved!',
      );
      queryClient.invalidateQueries({ queryKey: ['learning-resource', slug] });
      queryClient.invalidateQueries({ queryKey: ['learning-overview'] });
    },
    onError: () => toast.error('Failed to update progress'),
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="h-8 w-48 bg-surface-raised rounded animate-pulse mb-6" />
        <div className="h-64 bg-surface rounded-3xl border border-border animate-pulse" />
      </div>
    );
  }

  if (isError || !resource) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <BookOpen className="w-16 h-16 text-text-muted mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-text">Resource Not Found</h2>
        <p className="text-sm text-text-muted mt-2 mb-6">
          The requested learning resource could not be found or may have been archived.
        </p>
        <Button variant="accent" onClick={() => navigate('/learning')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Learning Hub
        </Button>
      </div>
    );
  }

  const currentPercentage =
    sliderVal !== null ? sliderVal : resource.userProgress?.progressPercentage ?? 0;
  const currentStatus = resource.userProgress?.status ?? 'NOT_STARTED';

  // Embeddable video URL check
  const isYouTube = resource.url?.includes('youtube.com') || resource.url?.includes('youtu.be');
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      const urlObj = new URL(url);
      const v = urlObj.searchParams.get('v');
      return v ? `https://www.youtube.com/embed/${v}` : null;
    } catch {
      return null;
    }
  };

  const embedUrl = isYouTube && resource.url ? getYouTubeEmbedUrl(resource.url) : null;

  return (
    <div className="min-h-screen pb-20">
      {/* Top back nav */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link
            to="/learning"
            className="flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Learning Hub
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
              }}
              className="p-2 rounded-xl border border-border text-text-muted hover:text-text hover:bg-surface-raised transition-colors cursor-pointer"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => saveMutation.mutate(!!resource.isSaved)}
              disabled={saveMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-bold text-text hover:bg-surface-raised transition-colors cursor-pointer"
            >
              {resource.isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-accent fill-accent" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-text-muted" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content col */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-sm space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-accent/15 text-accent border border-accent/25">
                  {getResourceTypeIcon(resource.resourceType)}
                  {resource.resourceType.replace(/_/g, ' ')}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface-raised text-text-secondary border border-border">
                  {resource.category.replace(/_/g, ' ')}
                </span>
                {resource.courseCode && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-primary text-white">
                    {resource.courseCode}
                  </span>
                )}
                {resource.level && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-raised text-text-muted border border-border flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {resource.level} Level
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-text leading-tight">
                {resource.title}
              </h1>

              {/* Author & date metadata */}
              <div className="flex items-center gap-4 text-xs text-text-muted flex-wrap pt-2 border-t border-border/60">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xs">
                    {resource.author.fullName.charAt(0)}
                  </div>
                  <span className="font-medium text-text">{resource.author.fullName}</span>
                </div>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(resource.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {resource.viewCount} Views
                </span>
              </div>
            </div>

            {/* In-page Video or Doc Preview */}
            {embedUrl ? (
              <div className="rounded-3xl overflow-hidden border border-border bg-black aspect-video shadow-xl">
                <iframe
                  src={embedUrl}
                  title={resource.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            ) : null}

            {/* Description & Overview */}
            <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Resource Description & Study Notes
              </h2>
              <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                {resource.description}
              </div>

              {/* Associated Skills from Skill Graph */}
              {resource.skills && resource.skills.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    Target Skills & Topics (Skill Graph)
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {resource.skills.map((s) => (
                      <span
                        key={s.id}
                        className="px-3 py-1 rounded-xl text-xs font-semibold bg-accent/10 text-accent border border-accent/20"
                      >
                        {s.skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions: Open URL or Download */}
            <div className="p-6 rounded-3xl bg-surface border border-border flex items-center justify-between flex-wrap gap-4 shadow-sm">
              <div>
                <h3 className="font-bold text-sm text-text">Access Material</h3>
                <p className="text-xs text-text-muted">
                  Open official documentation, GitHub repo, or download handouts
                </p>
              </div>

              <div className="flex items-center gap-3">
                {resource.fileUrl && (
                  <a
                    href={resource.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-surface-raised border border-border text-text hover:border-accent transition-colors"
                  >
                    <FileDown className="w-4 h-4 text-accent" />
                    Download File
                  </a>
                )}
                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-accent text-black hover:bg-accent/90 transition-all shadow-md shadow-accent/20"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Learning Resource
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar col */}
          <div className="space-y-6">
            {/* Interactive Progress Tracking Widget */}
            <div className="p-6 rounded-3xl bg-surface border border-accent/30 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-text flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  Your Study Progress
                </h3>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    currentStatus === 'COMPLETED'
                      ? 'bg-emerald-500/15 text-emerald-500'
                      : currentStatus === 'IN_PROGRESS'
                      ? 'bg-accent/15 text-accent'
                      : 'bg-surface-raised text-text-muted'
                  }`}
                >
                  {currentStatus.replace('_', ' ')}
                </span>
              </div>

              {/* Progress Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-text-muted">Completion</span>
                  <span className="font-bold text-accent text-sm">{currentPercentage}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={currentPercentage}
                  onChange={(e) => setSliderVal(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={progressMutation.isPending}
                  onClick={() => {
                    setSliderVal(100);
                    progressMutation.mutate({
                      status: 'COMPLETED',
                      progressPercentage: 100,
                    });
                  }}
                >
                  Mark Completed
                </Button>

                <Button
                  variant="accent"
                  size="sm"
                  disabled={progressMutation.isPending || sliderVal === null}
                  onClick={() => {
                    if (sliderVal !== null) {
                      progressMutation.mutate({
                        progressPercentage: sliderVal,
                        status: sliderVal === 100 ? 'COMPLETED' : sliderVal > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
                      });
                    }
                  }}
                >
                  Save Progress
                </Button>
              </div>
            </div>

            {/* Academic Information Card */}
            <div className="p-6 rounded-3xl bg-surface border border-border shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-text uppercase tracking-wider text-[11px] text-text-muted">
                Academic Context
              </h3>
              <div className="space-y-2 text-text-secondary">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">Department</span>
                  <span className="font-medium text-text">{resource.department || 'Faculty of Computing & Informatics'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">Course Code</span>
                  <span className="font-mono font-bold text-accent">{resource.courseCode || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-text-muted">Level</span>
                  <span className="font-medium text-text">{resource.level ? `${resource.level} Level` : 'All Levels'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-text-muted">Status</span>
                  <span className="font-semibold text-emerald-500">Verified by Faculty</span>
                </div>
              </div>
            </div>

            {/* Related Resources */}
            {relatedData?.resources && relatedData.resources.length > 1 && (
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-text">Related Study Materials</h3>
                <div className="space-y-3">
                  {relatedData.resources
                    .filter((r) => r.id !== resource.id)
                    .slice(0, 2)
                    .map((r) => (
                      <Link
                        key={r.id}
                        to={`/learning/resources/${r.slug}`}
                        className="block p-3.5 rounded-2xl bg-surface border border-border hover:border-accent transition-all group"
                      >
                        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                          {r.resourceType.replace(/_/g, ' ')}
                        </span>
                        <h4 className="text-xs font-bold text-text group-hover:text-accent transition-colors line-clamp-1 mt-0.5">
                          {r.title}
                        </h4>
                        <p className="text-[11px] text-text-muted line-clamp-1 mt-1">
                          {r.description}
                        </p>
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
