export type OpportunityTrackStatus =
  | 'SAVED'
  | 'INTERESTED'
  | 'APPLYING'
  | 'APPLIED'
  | 'SHORTLISTED'
  | 'ACCEPTED'
  | 'NOT_SELECTED'
  | 'WITHDRAWN';

export type DeadlineUrgencyStatus = 'CLOSED' | 'URGENT' | 'APPROACHING' | 'UPCOMING' | 'NO_DEADLINE';

export interface DeadlineMeta {
  daysRemaining: number | null;
  status: DeadlineUrgencyStatus;
}

export interface OpportunityApplication {
  id: string;
  userId: string;
  opportunityId: string;
  status: OpportunityTrackStatus;
  appliedAt?: string | null;
  followUpDate?: string | null;
  notes?: string | null;
  applicationUrl?: string | null;
  result?: string | null;
  documentTypes?: string[] | null;
  remindDaysBefore?: number | null;
  linkedLabProjectId?: string | null;
  createdAt: string;
  updatedAt: string;
  opportunity: {
    id: string;
    slug: string;
    title: string;
    organization: string;
    category: string;
    type?: string;
    description?: string;
    location?: string | null;
    isRemote?: boolean;
    deadline?: string | null;
    applicationUrl?: string | null;
    requiredSkills?: Array<{
      skill: {
        id: string;
        name: string;
        category?: string;
      };
    }>;
  };
  linkedLabProject?: {
    id: string;
    slug: string;
    title: string;
    status: string;
  } | null;
  deadlineMeta?: DeadlineMeta;
}

export interface OpportunityRecommendation {
  opportunity: {
    id: string;
    slug: string;
    title: string;
    organization: string;
    category: string;
    type?: string;
    description?: string;
    deadline?: string | null;
    isRemote?: boolean;
    location?: string | null;
    requiredSkills?: Array<{
      skill: {
        id: string;
        name: string;
      };
    }>;
  };
  score: number;
  reason: string;
}
