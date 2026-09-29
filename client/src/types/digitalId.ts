export type DigitalIdStatus = 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REVOKED';

export interface DigitalIdentityCard {
  id: string;
  fciId: string;
  verificationToken: string;
  verificationUrl: string;
  status: DigitalIdStatus;
  issuedAt?: string | null;
  expiresAt?: string | null;
  suspendedAt?: string | null;
  revokedAt?: string | null;
  statusReason?: string | null;
  showSkills: boolean;
  showAchievements: boolean;
  showPortfolioLink: boolean;
  user: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string | null;
    role: string;
    department?: string | null;
    level?: number | null;
    bio?: string | null;
  };
  skills: Array<{
    id: string;
    name: string;
    category?: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    badgeIcon?: string | null;
    category: string;
  }>;
}

export interface PublicVerificationResponse {
  verified: boolean;
  status: DigitalIdStatus;
  statusMessage: string;
  student: {
    fullName: string;
    fciId: string;
    department?: string | null;
    level?: number | null;
    avatarUrl?: string | null;
    issuedAt?: string | null;
    portfolioUrl?: string | null;
    skills?: Array<{ id: string; name: string }>;
    achievements?: Array<{ id: string; title: string; badgeIcon?: string | null }>;
  } | null;
  verificationTimestamp: string;
  institution: string;
}

export interface DigitalIdAdminListItem {
  id: string;
  fciId: string;
  status: DigitalIdStatus;
  issuedAt?: string | null;
  suspendedAt?: string | null;
  revokedAt?: string | null;
  statusReason?: string | null;
  user: {
    id: string;
    fullName: string;
    email: string;
    username: string;
    role: string;
    department?: string | null;
    level?: number | null;
    avatarUrl?: string | null;
  };
  _count?: {
    verificationLogs: number;
  };
}
