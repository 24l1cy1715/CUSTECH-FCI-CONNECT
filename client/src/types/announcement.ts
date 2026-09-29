export type AnnouncementPriority = 'NORMAL' | 'IMPORTANT' | 'URGENT';
export type AnnouncementCategory =
  | 'ACADEMIC'
  | 'FACULTY'
  | 'EXAMINATION'
  | 'REGISTRATION'
  | 'EVENT'
  | 'INTERNSHIP'
  | 'COMPETITION'
  | 'SYSTEM'
  | 'EMERGENCY'
  | 'GENERAL';

export type AnnouncementAudience = 'ALL' | 'FCI_ONLY' | 'DEPARTMENT' | 'LEVEL' | 'ROLE' | 'CUSTOM';
export type AnnouncementStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface AnnouncementItem {
  id: string;
  title: string;
  slug?: string | null;
  content: string;
  priority: AnnouncementPriority;
  category: AnnouncementCategory;
  audience: AnnouncementAudience;
  targetDepartment?: string | null;
  targetLevel?: string | null;
  isPinned: boolean;
  isActive: boolean;
  status: AnnouncementStatus;
  publishAt?: string | null;
  expiresAt?: string | null;
  viewsCount: number;
  isRead?: boolean;
  createdAt: string;
  author?: {
    id: string;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
    } | null;
  };
  creator?: {
    id: string;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
    } | null;
  };
}

export type Announcement = AnnouncementItem;
