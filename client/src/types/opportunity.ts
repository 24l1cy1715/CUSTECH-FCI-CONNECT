export type OpportunityCategory =
  | 'INTERNSHIP'
  | 'JOB'
  | 'HACKATHON'
  | 'COMPETITION'
  | 'SCHOLARSHIP'
  | 'FELLOWSHIP'
  | 'CERTIFICATION'
  | 'WORKSHOP'
  | 'VOLUNTEERING'
  | 'FREELANCE'
  | 'OTHER';

export type OpportunityStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';

export type DeadlineStatus = 'OPEN' | 'CLOSING_SOON' | 'DEADLINE_TODAY' | 'CLOSED' | 'ROLLING';

export interface OpportunitySkillItem {
  skillId: string;
  name: string;
  slug?: string;
  category?: string;
  description?: string | null;
  priority: 'REQUIRED' | 'PREFERRED';
  minLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | null;
}

export interface SkillRelevance {
  percentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  note: string;
}

export interface OpportunityItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  organization: string;
  category: OpportunityCategory;
  location?: string | null;
  isRemote: boolean;
  applicationUrl: string;
  applicationProcess?: string | null;
  deadline?: string | null;
  deadlineState: {
    status: DeadlineStatus;
    daysLeft: number | null;
    label: string;
  };
  startDate?: string | null;
  endDate?: string | null;
  eligibility?: string | null;
  status: OpportunityStatus;
  isFeatured: boolean;
  viewsCount: number;
  createdAt: string;
  updatedAt?: string;
  isSaved?: boolean;
  requiredSkills: OpportunitySkillItem[];
  skillRelevance?: SkillRelevance | null;
  creator?: {
    fullName: string;
    username: string;
    avatarUrl?: string | null;
  } | null;
}

export interface OpportunitiesResponse {
  items: OpportunityItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateOpportunityPayload {
  title: string;
  description: string;
  organization: string;
  category: OpportunityCategory;
  location?: string;
  isRemote: boolean;
  applicationUrl: string;
  applicationProcess?: string;
  deadline?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  eligibility?: string;
  isFeatured?: boolean;
  requiredSkills?: Array<{
    skillId: string;
    priority: 'REQUIRED' | 'PREFERRED';
    minLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  }>;
}

export interface ReportOpportunityPayload {
  reason: 'SPAM' | 'HARASSMENT' | 'FRAUD' | 'INAPPROPRIATE' | 'MISLEADING' | 'OTHER';
  description?: string;
}
