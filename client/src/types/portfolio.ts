export type ProfileVisibility = 'PUBLIC' | 'FCI_ONLY' | 'PRIVATE';

export interface PublicPortfolioProfile {
  id: string;
  username: string;
  fullName: string;
  department: string | null;
  level: string | null;
  avatarUrl: string | null;
  headline: string | null;
  location: string | null;
  bio: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  visibility: ProfileVisibility;
  communityPoints: number;
  portfolioViewsCount: number;
  memberSince: string;
  customSections: {
    showSkills: boolean;
    showProjects: boolean;
    showAchievements: boolean;
    showContact: boolean;
  };
}

export interface PortfolioSkill {
  id: string;
  skillId: string;
  name: string;
  slug: string;
  category: string;
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  yearsOfExperience?: number | null;
  isPrimary: boolean;
}

export interface PortfolioProject {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  githubUrl?: string | null;
  demoUrl?: string | null;
  views: number;
  likesCount: number;
  commentsCount: number;
  thumbnail?: string | null;
  skills: Array<{ id: string; name: string; slug: string; category: string }>;
  createdAt: string;
}

export interface PortfolioAchievement {
  id: string;
  name: string;
  description: string;
  badgeIcon: string;
  points: number;
  earnedAt: string;
}

export interface PublicPortfolioData {
  isOwner: boolean;
  profile: PublicPortfolioProfile;
  skills: PortfolioSkill[];
  projects: PortfolioProject[];
  achievements: PortfolioAchievement[];
}

export interface PortfolioSettingsData {
  username: string;
  fullName: string;
  department: string | null;
  level: string | null;
  avatarUrl: string | null;
  headline: string | null;
  location: string | null;
  portfolioBio: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  visibility: ProfileVisibility;
  portfolioViewsCount: number;
  customSections: {
    showSkills: boolean;
    showProjects: boolean;
    showAchievements: boolean;
    showContact: boolean;
    featuredSkillIds?: string[];
    featuredProjectIds?: string[];
  };
}

export interface UpdatePortfolioPayload {
  headline?: string | null;
  location?: string | null;
  portfolioBio?: string | null;
  visibility?: ProfileVisibility;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  customSections?: {
    showSkills?: boolean;
    showProjects?: boolean;
    showAchievements?: boolean;
    showContact?: boolean;
    featuredSkillIds?: string[];
    featuredProjectIds?: string[];
  };
}

export interface PortfolioConnectPayload {
  senderName: string;
  senderEmail: string;
  message: string;
  subject?: string;
}
