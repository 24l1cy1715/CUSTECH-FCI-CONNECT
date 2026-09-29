import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Compass,
  Clock,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Share2,
  Sparkles,
} from 'lucide-react';
import { learningApi } from '@/api/learningApi';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { getResourceTypeIcon } from '@/components/learning/ResourceCard';
import toast from 'react-hot-toast';

export const LearningPathDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: path,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['learning-path', slug],
    queryFn: () => learningApi.getLearningPathBySlug(slug!),
    enabled: !!slug,
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      if (!path) return;
      return learningApi.enrollLearningPath(path.id);
    },
    onSuccess: () => {
      toast.success('Enrolled in Learning Path! Track your milestones below.');
      queryClient.invalidateQueries({ queryKey: ['learning-path', slug] });
      queryClient.invalidateQueries({ queryKey: ['learning-overview'] });
    },
    onError: () => toast.error('Failed to enroll in learning path'),
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="h-8 w-40 bg-surface-raised rounded animate-pulse mb-6" />
        <div className="h-64 bg-surface rounded-3xl border border-border animate-pulse" />
      </div>
    );
  }

  if (isError || !path) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Compass className="w-16 h-16 text-text-muted mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-text">Learning Path Not Found</h2>
        <p className="text-sm text-text-muted mt-2 mb-6">
          The requested learning path could not be found or has been moved.
        </p>
        <Button variant="accent" onClick={() => navigate('/learning')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Learning Hub
        </Button>
      </div>
    );
  }

  const enrollment = path.userEnrollment;
  const isEnrolled = !!enrollment;
  const items = path.items || [];

  return (
    <div className="min-h-screen pb-24">
      {/* Top bar */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link
            to="/learning"
            className="flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Learning Hub
          </Link>

          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Learning path link copied!');
            }}
            className="p-2 rounded-xl border border-border text-text-muted hover:text-text hover:bg-surface-raised transition-colors cursor-pointer"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header Hero Card */}
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-surface via-surface to-accent/5 border border-accent/25 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-accent/15 text-accent border border-accent/30">
                <Compass className="w-3.5 h-3.5" />
                FCI Connect Recommended Learning Path
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface-raised text-text-secondary border border-border">
                {path.difficulty.replace(/_/g, ' ')}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono text-text-muted bg-surface-raised border border-border flex items-center gap-1">
                <Clock className="w-3 h-3 text-accent" />
                {path.estimatedDuration}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-text tracking-tight">
              {path.title}
            </h1>

            <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-3xl">
              {path.description}
            </p>

            {/* Note stating this is platform curated, not university degree requirement */}
            <div className="text-[11px] text-text-muted border-l-2 border-accent pl-3 py-1 italic">
              Note: This is an FCI Connect community and mentor-curated pathway designed to accelerate your technical and career competencies alongside your academic curriculum.
            </div>

            {/* Progress & Enrollment Action */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border">
              {isEnrolled ? (
                <div className="flex-1 max-w-md">
                  <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                    <span className="text-text-muted">Your Milestone Progress</span>
                    <span className="font-mono font-bold text-accent">
                      {enrollment.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-surface-raised overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        enrollment.isCompleted ? 'bg-emerald-500' : 'bg-accent'
                      }`}
                      style={{ width: `${enrollment.progressPercentage}%` }}
                    />
                  </div>
                </div>
              ) : (
                <Button
                  variant="accent"
                  size="md"
                  disabled={enrollMutation.isPending}
                  onClick={() => enrollMutation.mutate()}
                  className="shadow-lg shadow-accent/20 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Enroll in this Path
                </Button>
              )}

              {enrollment?.isCompleted && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-xs font-bold">
                  <Award className="w-4 h-4" />
                  Path Completed!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Milestone Steps Timeline */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-text flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              Ordered Milestone Curriculum ({items.length} Steps)
            </h2>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => {
              const res = item.resource;
              const isCompleted = res.userProgress?.status === 'COMPLETED';

              return (
                <div
                  key={item.id}
                  className={`relative p-5 sm:p-6 rounded-2xl bg-surface border transition-all ${
                    isCompleted
                      ? 'border-emerald-500/30 bg-emerald-500/[0.02]'
                      : 'border-border hover:border-accent/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Step Number Circle */}
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-mono font-bold text-sm shrink-0 border ${
                        isCompleted
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-surface-raised text-accent border-accent/30'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                            Step {item.position}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent">
                            {getResourceTypeIcon(res.resourceType)}
                            {res.resourceType.replace(/_/g, ' ')}
                          </span>
                          {item.isRequired && (
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                              Required
                            </span>
                          )}
                        </div>

                        {res.userProgress && (
                          <span className="text-xs font-mono font-semibold text-accent">
                            {res.userProgress.progressPercentage}%
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/learning/resources/${res.slug}`}
                        className="block font-bold text-base sm:text-lg text-text hover:text-accent transition-colors"
                      >
                        {res.title}
                      </Link>

                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        {item.notes || res.description}
                      </p>

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50">
                        <span className="text-[11px] text-text-muted">
                          {res.courseCode ? `Course: ${res.courseCode}` : res.category.replace(/_/g, ' ')}
                        </span>

                        <Link
                          to={`/learning/resources/${res.slug}`}
                          className="flex items-center gap-1 text-xs font-bold text-accent hover:underline"
                        >
                          Study Step <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
