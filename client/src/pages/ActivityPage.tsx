import React, { useState, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Zap,
  RefreshCw,
  Filter,
  Clock,
  ExternalLink,
  AlertTriangle,
  Inbox,
  User,
  FolderKanban,
  Trophy,
  Briefcase,
  Calendar,
  CheckCircle,
  Newspaper,
  Megaphone,
  Award,
  Store,
  MessageSquare,
} from 'lucide-react';
import {
  activityApi,
  ActivityItem,
  ActivityType,
  ACTIVITY_FILTER_OPTIONS,
} from '@/api/activityApi';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

function getActivityIcon(type: ActivityType): React.ComponentType<{ className?: string }> {
  switch (type) {
    case 'PROJECT_PUBLISHED': return FolderKanban;
    case 'ACHIEVEMENT_EARNED': return Trophy;
    case 'OPPORTUNITY_POSTED': return Briefcase;
    case 'EVENT_CREATED':
    case 'EVENT_REGISTERED': return Calendar;
    case 'NEWS_PUBLISHED': return Newspaper;
    case 'ANNOUNCEMENT_CREATED': return Megaphone;
    case 'PROFILE_MILESTONE': return Award;
    case 'BUSINESS_DIRECTORY_UPDATE': return Store;
    case 'COMMUNITY_POST': return MessageSquare;
    default: return Zap;
  }
}

// ── Time formatter ────────────────────────────────────────────────────────────
function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Entity link builder ───────────────────────────────────────────────────────
function buildEntityLink(item: ActivityItem): string | null {
  const id = item.entityId;
  if (!id) return null;
  switch (item.entityType) {
    case 'project': return `/projects/${id}`;
    case 'achievement': return `/achievements`;
    case 'opportunity': return `/opportunities/${id}`;
    case 'event': return `/events`;
    case 'news': return `/news/${id}`;
    default: return null;
  }
}

function buildEntityLabel(item: ActivityItem): string {
  switch (item.entityType) {
    case 'project': return 'View Project';
    case 'achievement': return 'View Achievements';
    case 'opportunity': return 'View Opportunity';
    case 'event': return 'View Events';
    case 'news': return 'Read Article';
    default: return 'View';
  }
}

// ── Type color mapping ────────────────────────────────────────────────────────
const TYPE_COLORS: Record<ActivityType, string> = {
  PROJECT_PUBLISHED: 'text-blue-400 bg-blue-400/10',
  ACHIEVEMENT_EARNED: 'text-amber-400 bg-amber-400/10',
  OPPORTUNITY_POSTED: 'text-green-400 bg-green-400/10',
  EVENT_CREATED: 'text-purple-400 bg-purple-400/10',
  EVENT_REGISTERED: 'text-indigo-400 bg-indigo-400/10',
  NEWS_PUBLISHED: 'text-orange-400 bg-orange-400/10',
  ANNOUNCEMENT_CREATED: 'text-red-400 bg-red-400/10',
  PROFILE_MILESTONE: 'text-yellow-400 bg-yellow-400/10',
  BUSINESS_DIRECTORY_UPDATE: 'text-teal-400 bg-teal-400/10',
  COMMUNITY_POST: 'text-pink-400 bg-pink-400/10',
};

// ── Skeleton card ─────────────────────────────────────────────────────────────
const ActivitySkeleton: React.FC = () => (
  <div className="animate-pulse flex gap-4 p-5 border border-border rounded-2xl bg-surface-card">
    <div className="w-10 h-10 rounded-full bg-surface-raised shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 bg-surface-raised rounded w-2/3" />
      <div className="h-3 bg-surface-raised rounded w-full" />
      <div className="h-3 bg-surface-raised rounded w-1/2" />
    </div>
  </div>
);

// ── Activity Card ─────────────────────────────────────────────────────────────
const ActivityCard: React.FC<{ item: ActivityItem; index: number }> = ({ item, index }) => {
  const IconComponent = getActivityIcon(item.type);
  const colorClass = TYPE_COLORS[item.type] || 'text-accent bg-accent/10';
  const entityLink = buildEntityLink(item);
  const entityLabel = buildEntityLabel(item);
  const actorName = item.actor.fullName || item.actor.username || 'FCI Member';
  const actorLink = item.actor.username ? `/u/${item.actor.username}` : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="group flex gap-4 p-5 rounded-2xl border border-border bg-surface-card hover:border-accent/30 hover:bg-surface-raised transition-all duration-200"
      aria-label={`Activity: ${item.title}`}
    >
      {/* Actor Avatar / Type Icon */}
      <div className="shrink-0 flex flex-col items-center gap-1">
        <div className="relative">
          {item.actor.avatarUrl ? (
            <img
              src={item.actor.avatarUrl}
              alt={actorName}
              className="w-10 h-10 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/30 to-primary/30 border-2 border-border flex items-center justify-center">
              <User className="w-5 h-5 text-text-muted" />
            </div>
          )}
          {/* Type badge */}
          <span
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface-card ${colorClass}`}
            aria-hidden="true"
          >
            <IconComponent className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex-1 min-w-0">
            {/* Actor name */}
            <span className="text-sm">
              {actorLink ? (
                <Link
                  to={actorLink}
                  className="font-bold text-text-primary hover:text-accent transition-colors"
                >
                  {actorName}
                </Link>
              ) : (
                <span className="font-bold text-text-primary">{actorName}</span>
              )}
            </span>

            {/* Title */}
            <p className="text-sm text-text-secondary leading-snug mt-0.5 line-clamp-2">
              {item.title}
            </p>

            {/* Description */}
            {item.description && (
              <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">
                {item.description}
              </p>
            )}
          </div>

          {/* Timestamp */}
          <span className="text-[10px] text-text-muted flex items-center gap-1 shrink-0 mt-0.5" aria-label={`Posted ${formatTimeAgo(item.createdAt)}`}>
            <Clock className="w-3 h-3" />
            {formatTimeAgo(item.createdAt)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {/* Type badge */}
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${colorClass}`}>
            <IconComponent className="w-3 h-3" />
            <span>{item.type.replace(/_/g, ' ')}</span>
          </span>

          {/* CTA */}
          {entityLink && (
            <Link
              to={entityLink}
              className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 font-semibold transition-colors"
              aria-label={entityLabel}
            >
              {entityLabel}
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
};

// ── Main ActivityPage ─────────────────────────────────────────────────────────
export const ActivityPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<ActivityType | ''>('');

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['activity-feed', activeFilter],
    queryFn: ({ pageParam = 1 }) =>
      activityApi.getFeed({
        type: activeFilter ? (activeFilter as ActivityType) : undefined,
        page: pageParam as number,
        limit: 20,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 30_000, // 30 seconds — "near real-time" polling via refetch
    refetchInterval: 60_000, // Auto-refetch every 60 seconds
  });

  const allItems = data?.pages.flatMap((p) => p.items) ?? [];
  const totalCount = data?.pages[0]?.total ?? 0;

  const handleFilterChange = useCallback((val: ActivityType | '') => {
    setActiveFilter(val);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary flex items-center gap-2.5">
            <span className="relative">
              <Zap className="w-7 h-7 text-accent" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-surface-bg animate-pulse" />
            </span>
            FCI Live
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Real-time public activity from the FCI Connect community — projects, achievements, events, and more.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {totalCount > 0 && (
            <Badge variant="accent" size="sm">{totalCount} activities</Badge>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => refetch()}
            disabled={isRefetching}
            aria-label="Refresh activity feed"
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            {isRefetching ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div
        role="tablist"
        aria-label="Filter activity feed"
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4"
      >
        {ACTIVITY_FILTER_OPTIONS.map((opt) => {
          const isActive = activeFilter === opt.value;
          const FilterIcon = opt.value ? getActivityIcon(opt.value as ActivityType) : Zap;
          return (
            <button
              key={opt.value}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleFilterChange(opt.value as ActivityType | '')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all duration-150 shrink-0 ${
                isActive
                  ? 'bg-accent text-black border-accent shadow-sm'
                  : 'border-border text-text-secondary hover:border-accent/50 hover:text-text-primary'
              }`}
            >
              <FilterIcon className="w-3.5 h-3.5" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Live indicator ── */}
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        Live feed — auto-refreshes every 60 seconds
      </div>

      {/* ── Feed ── */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <ActivitySkeleton key={i} />)
        ) : isError ? (
          <Card className="p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-text-muted text-sm mb-4">Failed to load activity feed</p>
            <Button size="sm" onClick={() => refetch()}>Try again</Button>
          </Card>
        ) : allItems.length === 0 ? (
          <Card className="p-12 text-center">
            <Inbox className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-40" />
            <h2 className="font-semibold text-text-primary mb-1">No activity yet</h2>
            <p className="text-text-muted text-sm">
              {activeFilter
                ? 'No activity matches this filter. Try a different category.'
                : 'Be the first to contribute! Publish a project, earn an achievement, or post an opportunity.'}
            </p>
          </Card>
        ) : (
          <AnimatePresence mode="popLayout">
            {allItems.map((item, idx) => (
              <ActivityCard key={item.id} item={item} index={idx % 20} />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* ── Load More ── */}
      {hasNextPage && (
        <div className="text-center">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="ghost"
            className="min-w-[160px]"
            aria-label="Load more activities"
          >
            {isFetchingNextPage ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" /> Loading…
              </span>
            ) : (
              'Load more activity'
            )}
          </Button>
        </div>
      )}

      {/* ── End of feed ── */}
      {!hasNextPage && allItems.length > 0 && (
        <p className="text-center text-xs text-text-muted py-4 flex items-center justify-center gap-1.5">
          <Filter className="w-3.5 h-3.5" />
          You're all caught up on FCI Connect activity.
        </p>
      )}
    </div>
  );
};
