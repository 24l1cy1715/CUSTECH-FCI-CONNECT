import apiClient from './client';

export type ActivityType =
  | 'PROJECT_PUBLISHED'
  | 'ACHIEVEMENT_EARNED'
  | 'OPPORTUNITY_POSTED'
  | 'EVENT_CREATED'
  | 'EVENT_REGISTERED'
  | 'NEWS_PUBLISHED'
  | 'ANNOUNCEMENT_CREATED'
  | 'PROFILE_MILESTONE'
  | 'BUSINESS_DIRECTORY_UPDATE'
  | 'COMMUNITY_POST';

export type ActivityVisibility = 'PUBLIC' | 'FCI_ONLY' | 'PRIVATE';

export interface ActivityActor {
  id: string;
  username?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  department?: string | null;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  entityType: string;
  entityId?: string | null;
  title: string;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  imageUrl?: string | null;
  visibility: ActivityVisibility;
  createdAt: string;
  actor: ActivityActor;
}

export interface ActivityFeedResponse {
  items: ActivityItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
}

export const ACTIVITY_ICONS: Record<ActivityType, string> = {
  PROJECT_PUBLISHED: 'folder',
  ACHIEVEMENT_EARNED: 'award',
  OPPORTUNITY_POSTED: 'briefcase',
  EVENT_CREATED: 'calendar',
  EVENT_REGISTERED: 'check-circle',
  NEWS_PUBLISHED: 'newspaper',
  ANNOUNCEMENT_CREATED: 'megaphone',
  PROFILE_MILESTONE: 'star',
  BUSINESS_DIRECTORY_UPDATE: 'store',
  COMMUNITY_POST: 'message-square',
};

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  PROJECT_PUBLISHED: 'Projects',
  ACHIEVEMENT_EARNED: 'Achievements',
  OPPORTUNITY_POSTED: 'Opportunities',
  EVENT_CREATED: 'Events',
  EVENT_REGISTERED: 'Events',
  NEWS_PUBLISHED: 'News',
  ANNOUNCEMENT_CREATED: 'Announcements',
  PROFILE_MILESTONE: 'Milestones',
  BUSINESS_DIRECTORY_UPDATE: 'Businesses',
  COMMUNITY_POST: 'Community',
};

export const ACTIVITY_FILTER_OPTIONS = [
  { label: 'All Activity', value: '' },
  { label: 'Projects', value: 'PROJECT_PUBLISHED' },
  { label: 'Achievements', value: 'ACHIEVEMENT_EARNED' },
  { label: 'Opportunities', value: 'OPPORTUNITY_POSTED' },
  { label: 'Events', value: 'EVENT_CREATED' },
  { label: 'News', value: 'NEWS_PUBLISHED' },
  { label: 'Community', value: 'COMMUNITY_POST' },
] as const;

export const activityApi = {
  getFeed: (params?: { type?: ActivityType; page?: number; limit?: number }) =>
    apiClient
      .get<{ success: boolean; data: ActivityFeedResponse }>('/activity', { params })
      .then((r) => r.data.data),

  getItem: (id: string) =>
    apiClient
      .get<{ success: boolean; data: ActivityItem }>(`/activity/${id}`)
      .then((r) => r.data.data),
};
