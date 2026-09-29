export type LearningResourceType =
  | 'LECTURE_NOTE'
  | 'PDF'
  | 'PAST_QUESTION'
  | 'VIDEO'
  | 'ARTICLE'
  | 'TUTORIAL'
  | 'COURSE'
  | 'BOOK'
  | 'DOCUMENTATION'
  | 'CODE_REPOSITORY'
  | 'PROJECT'
  | 'SLIDE'
  | 'CHEATSHEET'
  | 'OTHER';

export type LearningResourceCategory =
  | 'CYBERSECURITY'
  | 'SOFTWARE_ENGINEERING'
  | 'ARTIFICIAL_INTELLIGENCE'
  | 'DATA_SCIENCE'
  | 'NETWORKING'
  | 'DATABASE_SYSTEMS'
  | 'WEB_DEVELOPMENT'
  | 'MOBILE_DEVELOPMENT'
  | 'UI_UX'
  | 'GRAPHIC_DESIGN'
  | 'PROGRAMMING'
  | 'COMPUTER_SCIENCE'
  | 'ACADEMIC'
  | 'CAREER'
  | 'OTHER';

export type ResourceSubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type LearningProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type LearningPathDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';

export interface LearningResourceSkillItem {
  id: string;
  skillId: string;
  skill: {
    id: string;
    name: string;
    category?: string;
  };
}

export interface LearningResourceProgressItem {
  id: string;
  status: LearningProgressStatus;
  progressPercentage: number;
  completedAt?: string | null;
  updatedAt: string;
}

export interface LearningResource {
  id: string;
  title: string;
  slug: string;
  description: string;
  resourceType: LearningResourceType;
  category: LearningResourceCategory;
  subject?: string | null;
  courseCode?: string | null;
  courseTitle?: string | null;
  department?: string | null;
  level?: number | null;
  semester?: number | null;
  url?: string | null;
  fileUrl?: string | null;
  thumbnail?: string | null;
  authorId: string;
  author: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string | null;
    role: string;
  };
  submissionStatus: ResourceSubmissionStatus;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  downloadCount: number;
  skills?: LearningResourceSkillItem[];
  progress?: LearningResourceProgressItem[];
  isSaved?: boolean;
  userProgress?: LearningResourceProgressItem | null;
  createdAt: string;
  updatedAt: string;
}

export interface LearningPathItem {
  id: string;
  learningPathId: string;
  resourceId: string;
  position: number;
  isRequired: boolean;
  notes?: string | null;
  resource: LearningResource;
}

export interface LearningPathEnrollment {
  id: string;
  learningPathId: string;
  userId: string;
  progressPercentage: number;
  isCompleted: boolean;
  completedAt?: string | null;
  enrolledAt: string;
}

export interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: LearningResourceCategory;
  difficulty: LearningPathDifficulty;
  estimatedDuration: string;
  thumbnail?: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  authorId?: string | null;
  items?: LearningPathItem[];
  enrollments?: LearningPathEnrollment[];
  userEnrollment?: LearningPathEnrollment | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecommendedResource {
  resource: LearningResource;
  reason: string;
}

export interface LearningHubOverview {
  featuredResources: LearningResource[];
  continueLearning: LearningResource[];
  recommendedResources: RecommendedResource[];
  learningPaths: LearningPath[];
  recentResources: LearningResource[];
  userSavedResources: LearningResource[];
}

export interface ResourceListResponse {
  resources: LearningResource[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreateResourcePayload {
  title: string;
  description: string;
  resourceType: LearningResourceType;
  category: LearningResourceCategory;
  subject?: string;
  courseCode?: string;
  courseTitle?: string;
  department?: string;
  level?: number;
  semester?: number;
  url?: string;
  fileUrl?: string;
  thumbnail?: string;
  skillIds?: string[];
}
