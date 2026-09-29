import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Video,
  BookOpen,
  Code,
  Bookmark,
  BookmarkCheck,
  Eye,
  ExternalLink,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { LearningResource, LearningResourceType } from '@/types/learning';
import { Badge } from '@/components/common/Badge';

interface ResourceCardProps {
  resource: LearningResource;
  onToggleSave?: (id: string, currentlySaved: boolean) => void;
  saving?: boolean;
}

export const getResourceTypeIcon = (type: LearningResourceType) => {
  switch (type) {
    case 'VIDEO':
      return <Video className="w-4 h-4 text-rose-500" />;
    case 'PDF':
    case 'LECTURE_NOTE':
    case 'PAST_QUESTION':
      return <FileText className="w-4 h-4 text-blue-500" />;
    case 'CODE_REPOSITORY':
    case 'PROJECT':
      return <Code className="w-4 h-4 text-emerald-500" />;
    case 'COURSE':
    case 'BOOK':
      return <BookOpen className="w-4 h-4 text-amber-500" />;
    default:
      return <FileText className="w-4 h-4 text-accent" />;
  }
};

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onToggleSave,
  saving,
}) => {
  const isSaved = resource.isSaved;
  const userProgress = resource.userProgress;

  return (
    <div className="card-interactive group relative rounded-2xl bg-surface border border-border shadow-sm flex flex-col justify-between overflow-hidden">
      {/* Top Banner / Category strip */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-accent/10 text-accent border border-accent/20">
              {getResourceTypeIcon(resource.resourceType)}
              <span>{resource.resourceType.replace(/_/g, ' ')}</span>
            </span>

            {resource.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                <Sparkles className="w-3 h-3" />
                Featured
              </span>
            )}
          </div>

          {onToggleSave && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSave(resource.id, !!isSaved);
              }}
              disabled={saving}
              title={isSaved ? 'Remove from Saved' : 'Save Resource'}
              className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-surface-raised transition-colors cursor-pointer"
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 text-accent fill-accent" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Title */}
        <Link to={`/learning/resources/${resource.slug}`} className="block group-hover:text-accent transition-colors">
          <h3 className="font-bold text-base text-text line-clamp-2 leading-snug">
            {resource.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="mt-2 text-xs text-text-muted line-clamp-2 leading-relaxed">
          {resource.description}
        </p>

        {/* Academic Details (Subject / Course code / Level) */}
        {(resource.courseCode || resource.subject || resource.level) && (
          <div className="mt-3 flex items-center gap-2 text-[11px] text-text-secondary flex-wrap">
            {resource.courseCode && (
              <span className="font-mono font-bold text-accent px-1.5 py-0.5 rounded bg-surface-raised border border-border">
                {resource.courseCode}
              </span>
            )}
            {resource.subject && (
              <span className="truncate max-w-[150px] font-medium">
                {resource.subject}
              </span>
            )}
            {resource.level && (
              <span className="text-text-muted flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                {resource.level}L
              </span>
            )}
          </div>
        )}

        {/* Skills Taglist */}
        {resource.skills && resource.skills.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            {resource.skills.slice(0, 3).map((s) => (
              <span
                key={s.id}
                className="text-[10px] px-2 py-0.5 rounded-md bg-surface-raised text-text-secondary border border-border"
              >
                {s.skill.name}
              </span>
            ))}
            {resource.skills.length > 3 && (
              <span className="text-[10px] text-text-muted">
                +{resource.skills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar (if in progress) */}
      {userProgress && userProgress.progressPercentage > 0 && (
        <div className="px-4 sm:px-5 py-1">
          <div className="flex items-center justify-between text-[10px] text-text-muted mb-1 font-mono">
            <span>Progress</span>
            <span className="font-bold text-accent">{userProgress.progressPercentage}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-raised overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                userProgress.progressPercentage === 100
                  ? 'bg-emerald-500'
                  : 'bg-accent'
              }`}
              style={{ width: `${userProgress.progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 sm:p-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-text-muted bg-surface/40">
        <div className="flex items-center gap-2 truncate">
          <div className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-[10px] shrink-0">
            {(resource.author?.fullName || 'FCI').charAt(0).toUpperCase()}
          </div>
          <span className="truncate max-w-[120px] text-[11px]">
            {resource.author?.fullName || 'FCI Faculty / Peer'}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-[11px]">
          <span className="flex items-center gap-1" title="Views">
            <Eye className="w-3.5 h-3.5" />
            {resource.viewCount ?? (resource as any).viewsCount ?? 0}
          </span>
          <Link
            to={`/learning/resources/${resource.slug}`}
            className="flex items-center gap-1 font-bold text-accent hover:underline group-hover:gap-1.5 transition-all"
          >
            <span>Study</span>
            <ExternalLink className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
