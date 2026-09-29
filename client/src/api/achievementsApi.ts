import apiClient from './client';

export type AchievementCategory = 'ACADEMIC' | 'TECHNICAL' | 'COMMUNITY' | 'CAREER' | 'FCI_CONNECT';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface AchievementItem {
  id: string;
  name: string;
  slug: string;
  category: AchievementCategory;
  description: string;
  badgeIcon: string;
  points: number;
  criteria?: string;
  isEarned?: boolean;
  status?: VerificationStatus | null;
  earnedAt?: string | null;
  verifiedAt?: string | null;
  evidenceUrl?: string | null;
  evidenceNotes?: string | null;
  issuer?: string | null;
  rejectionReason?: string | null;
  userAchievementId?: string | null;
}

export interface ReputationSummary {
  currentLevel: string;
  badgeIcon: string;
  description: string;
  points: number;
  nextLevel: string | null;
  pointsForNextLevel: number | null;
  progressPercentage: number;
}

export interface MyAchievementsResponse {
  reputation: ReputationSummary;
  stats: {
    totalEarned: number;
    verifiedCount: number;
    pendingCount: number;
    totalCatalog: number;
  };
  achievements: AchievementItem[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  fullName: string;
  avatarUrl?: string | null;
  department?: string | null;
  level?: string | null;
  points: number;
  levelName: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminSubmission {
  id: string;
  userId: string;
  achievementId: string;
  status: VerificationStatus;
  evidenceUrl?: string | null;
  evidenceNotes?: string | null;
  issuer?: string | null;
  earnedAt: string;
  rejectionReason?: string | null;
  achievement: {
    id: string;
    name: string;
    points: number;
    category: AchievementCategory;
    badgeIcon: string;
    criteria?: string;
  };
  user: {
    id: string;
    email: string;
    profile?: {
      fullName: string;
      username: string;
      department?: string;
      level?: string;
      avatarUrl?: string;
    };
  };
}

export const achievementsApi = {
  getMyAchievements: async (): Promise<MyAchievementsResponse> => {
    const res = await apiClient.get('/achievements/mine');
    return res.data.data;
  },

  getPublicAchievements: async (
    userId: string,
  ): Promise<{
    reputation: ReputationSummary;
    achievements: {
      id: string;
      name: string;
      slug: string;
      category: AchievementCategory;
      description: string;
      badgeIcon: string;
      points: number;
      earnedAt: string;
      issuer?: string;
    }[];
  }> => {
    const res = await apiClient.get(`/achievements/public/${userId}`);
    return res.data.data;
  },

  getCatalog: async (category?: AchievementCategory): Promise<AchievementItem[]> => {
    const res = await apiClient.get('/achievements/catalog', {
      params: category ? { category } : undefined,
    });
    return res.data.data;
  },

  submitEvidence: async (
    achievementId: string,
    data: { evidenceUrl?: string; evidenceNotes?: string; issuer?: string },
  ): Promise<any> => {
    const res = await apiClient.post(`/achievements/${achievementId}/submit`, data);
    return res.data.data;
  },

  getLeaderboard: async (params?: {
    department?: string;
    level?: string;
    page?: number;
    limit?: number;
  }): Promise<LeaderboardResponse> => {
    const res = await apiClient.get('/achievements/leaderboard', { params });
    return res.data.data;
  },

  getAdminSubmissions: async (params?: {
    status?: VerificationStatus;
    page?: number;
    limit?: number;
  }): Promise<{ submissions: AdminSubmission[]; total: number; page: number; totalPages: number }> => {
    const res = await apiClient.get('/achievements/admin/submissions', { params });
    return res.data.data;
  },

  reviewSubmission: async (
    id: string,
    data: { action: 'VERIFY' | 'REJECT'; notes?: string },
  ): Promise<any> => {
    const res = await apiClient.post(`/achievements/admin/submissions/${id}/review`, data);
    return res.data.data;
  },

  createAchievement: async (data: {
    name: string;
    slug?: string;
    description: string;
    category: AchievementCategory;
    badgeIcon: string;
    points: number;
    criteria?: string;
  }): Promise<any> => {
    const res = await apiClient.post('/achievements/admin', data);
    return res.data.data;
  },

  updateAchievement: async (
    id: string,
    data: Partial<{
      name: string;
      description: string;
      category: AchievementCategory;
      badgeIcon: string;
      points: number;
      criteria: string;
      isActive: boolean;
    }>,
  ): Promise<any> => {
    const res = await apiClient.patch(`/achievements/admin/${id}`, data);
    return res.data.data;
  },
};
