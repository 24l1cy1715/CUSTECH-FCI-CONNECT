import { ResearchProject } from './research';
import { MarketplaceService } from './marketplace';

export interface SmartNextAction {
  id: string;
  category: 'PROFILE' | 'ASSESSMENT' | 'SIWES' | 'OPPORTUNITY' | 'PROJECT' | 'LEARNING' | 'ANNOUNCEMENT';
  title: string;
  description: string;
  actionUrl: string;
  actionLabel: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate?: string;
}

export interface RecommendationItem {
  id: string;
  type: 'OPPORTUNITY' | 'LEARNING' | 'RESEARCH' | 'PROJECT_LAB' | 'MENTOR';
  title: string;
  subtitle: string;
  description: string;
  url: string;
  matchScore: number;
  reasons: string[];
}

/** Alias used on the dashboard page */
export type IntelligenceRecommendation = RecommendationItem;

export interface MyFciSummary {
  profile: {
    fullName: string;
    username: string;
    avatarUrl?: string | null;
    department?: string | null;
    level?: string | null;
    matricNumber?: string | null;
    communityPoints: number;
    completionPercentage: number;
  };
  stats: {
    skillsCount: number;
    verifiedSkillsCount: number;
    passedAssessmentsCount: number;
    activeLabProjectsCount: number;
    activeResearchCount: number;
    achievementsCount: number;
    communitiesCount: number;
    siwesStatus: string;
    siwesLogsCount: number;
    pendingInquiriesCount: number;
  };
  github?: {
    username: string;
    avatarUrl?: string | null;
    publicRepos: number;
    followers: number;
    isConnected: boolean;
  } | null;
  recentLabProjects: any[];
  recentResearch: ResearchProject[];
  trackedApplications: any[];
  myServices: MarketplaceService[];
  nextActions: SmartNextAction[];
  recommendations: RecommendationItem[];
  // Extended fields surfaced by the dashboard page
  siwes?: any;
  research?: ResearchProject[];
  projectLab?: any[];
  skillAssessments?: any[];
  marketplace?: MarketplaceService[];
  announcements?: any[];
}

/** Alias kept for backward-compat with MyFciDashboardPage */
export type MyFciDashboardData = MyFciSummary;
