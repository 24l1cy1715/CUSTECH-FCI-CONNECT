import { Department, StudentLevel, ProjectCategory } from './index';

export type ProjectStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DRAFT';

export type UserRoleType = 'STUDENT' | 'BUSINESS_OWNER' | 'EDITOR' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'FLAGGED' | 'PENDING_VERIFICATION';

export interface AdminUserRecord {
  id: string;
  email: string;
  username: string;
  fullName: string;
  matricId?: string;
  department: Department;
  level: StudentLevel;
  avatarUrl?: string;
  roles: UserRoleType[];
  communityPoints: number;
  status: AccountStatus;
  projectsCount: number;
  businessesCount: number;
  createdAt: string;
}

export interface AdminProjectRecord {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  authorName: string;
  authorEmail: string;
  authorDepartment: Department;
  authorMatric?: string;
  demoUrl?: string;
  githubUrl?: string;
  images: string[];
  likesCount: number;
  views: number;
  createdAt: string;
  rejectionReason?: string;
}

export interface AdminBusinessRecord {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  ownerName: string;
  ownerEmail: string;
  ownerDepartment: Department;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  isVerified: boolean;
  phone?: string;
  websiteUrl?: string;
  createdAt: string;
}

export interface AdminAnnouncementRecord {
  id: string;
  title: string;
  content: string;
  priority: 'NORMAL' | 'URGENT' | 'CRITICAL';
  category: 'FACULTY' | 'EXAM' | 'SECURITY' | 'HACKATHON' | 'GENERAL';
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface AdminAuditLogRecord {
  id: string;
  actorName: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
}

export interface AdminDashboardStats {
  totalStudents: number;
  totalProjects: number;
  pendingProjects: number;
  approvedProjects: number;
  totalBusinesses: number;
  pendingBusinesses: number;
  activeAnnouncements: number;
  totalPointsCirculating: number;
  systemHealth: {
    status: 'OPTIMAL' | 'DEGRADED' | 'MAINTENANCE';
    apiUptime: string;
    dbLatencyMs: number;
    activeSessions: number;
    lastBackup: string;
  };
}
