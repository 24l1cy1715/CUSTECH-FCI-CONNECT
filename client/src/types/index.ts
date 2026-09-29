// ── CUSTECH FCI CONNECT Core Domain Types ─────────────────────────────────────

export type Department =
  | 'COMPUTER_SCIENCE'
  | 'INFORMATION_TECHNOLOGY'
  | 'CYBER_SECURITY'
  | 'SOFTWARE_ENGINEERING'
  | 'DATA_SCIENCE'
  | 'COMPUTER_ENGINEERING'
  | 'INFORMATION_SYSTEMS'
  | 'LIBRARY_INFORMATION_SCIENCE';

export const DEPARTMENT_LABELS: Record<Department, string> = {
  COMPUTER_SCIENCE: 'Computer Science',
  INFORMATION_TECHNOLOGY: 'Information Technology',
  CYBER_SECURITY: 'Cyber Security',
  SOFTWARE_ENGINEERING: 'Software Engineering',
  DATA_SCIENCE: 'Data Science',
  COMPUTER_ENGINEERING: 'Computer Engineering',
  INFORMATION_SYSTEMS: 'Information Systems',
  LIBRARY_INFORMATION_SCIENCE: 'Library & Information Science',
};

export type StudentLevel = '100' | '200' | '300' | '400' | '500' | 'PGD' | 'MSc' | 'PhD';

export type UserRole =
  | 'STUDENT'
  | 'BUSINESS_OWNER'
  | 'EDITOR'
  | 'MODERATOR'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export interface UserProfile {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  matricId?: string;
  department: Department;
  level: StudentLevel;
  avatarUrl?: string;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  skills: string[];
  interests: string[];
  communityPoints: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectCategory =
  | 'WEB'
  | 'MOBILE'
  | 'CYBERSECURITY'
  | 'AI'
  | 'ML'
  | 'DATA_SCIENCE'
  | 'NETWORKING'
  | 'CLOUD'
  | 'UI_UX'
  | 'SOFTWARE_ENGINEERING'
  | 'HARDWARE'
  | 'IOT'
  | 'OTHER';

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ProjectCategory;
  githubUrl?: string;
  demoUrl?: string;
  authorId: string;
  author: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
    department: Department;
    level: StudentLevel;
  };
  technologies: string[];
  images: string[];
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DRAFT';
  createdAt: string;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  author: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    role: string;
  };
  tags: string[];
  isFeatured: boolean;
  readingTimeMinutes: number;
  viewsCount: number;
  commentsCount: number;
  publishedAt: string;
  createdAt: string;
}

export interface RoommateListing {
  id: string;
  title: string;
  description: string;
  location: string;
  landmark?: string;
  rentAmount: number;
  rentFrequency: 'SEMESTER' | 'ANNUAL' | 'MONTHLY';
  roomType: 'SELF_CONTAIN' | 'SINGLE_ROOM' | 'TWO_BEDROOM' | 'FLAT' | 'HOSTEL';
  genderPreference: 'MALE_ONLY' | 'FEMALE_ONLY' | 'ANY';
  departmentPreference?: Department;
  levelPreference?: StudentLevel;
  photos: string[];
  amenities: string[];
  contactPhone: string;
  contactWhatsapp?: string;
  ownerId: string;
  owner: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
    department: Department;
    level: StudentLevel;
  };
  isSaved?: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface TechBusiness {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  logoUrl?: string;
  bannerUrl?: string;
  websiteUrl?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  ownerId: string;
  owner: {
    id: string;
    fullName: string;
    department?: Department;
    level?: StudentLevel;
  };
  services: string[];
  verified: boolean;
  rating: number;
  reviewsCount: number;
  createdAt: string;
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: 'HACKATHON' | 'WORKSHOP' | 'SEMINAR' | 'TECH_TALK' | 'MEETUP' | 'COMPETITION';
  location: string;
  isVirtual: boolean;
  virtualLink?: string;
  startDate: string;
  endDate?: string;
  bannerUrl: string;
  organizer: string;
  registrationLimit?: number;
  registeredCount: number;
  isRegistered?: boolean;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
    department: Department;
    level: StudentLevel;
  };
  communityPoints: number;
  projectsCount: number;
  badge: 'GOLD' | 'SILVER' | 'BRONZE' | 'CONTRIBUTOR';
  achievements: string[];
}
