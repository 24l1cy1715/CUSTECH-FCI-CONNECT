import apiClient from './client';
import {
  DigitalIdentityCard,
  PublicVerificationResponse,
  DigitalIdAdminListItem,
} from '@/types/digitalId';

export const digitalIdApi = {
  // Get current user's digital ID (auto-provisions if student and none exists)
  getMyDigitalId: async (): Promise<DigitalIdentityCard> => {
    const { data } = await apiClient.get('/digital-id');
    return data.data;
  },

  // Request/apply for formal verification
  requestVerification: async () => {
    const { data } = await apiClient.post('/digital-id/request');
    return data.data;
  },

  // Update public visibility toggles
  updateVisibility: async (payload: {
    showSkills?: boolean;
    showAchievements?: boolean;
    showPortfolioLink?: boolean;
  }): Promise<DigitalIdentityCard> => {
    const { data } = await apiClient.patch('/digital-id/visibility', payload);
    return data.data;
  },

  // Rotate/regenerate verification token
  regenerateToken: async (): Promise<{
    verificationToken: string;
    verificationUrl: string;
    message: string;
  }> => {
    const { data } = await apiClient.post('/digital-id/regenerate');
    return data.data;
  },

  // Public verification endpoint
  verifyPublicToken: async (token: string): Promise<PublicVerificationResponse> => {
    const { data } = await apiClient.get(`/verify/${token}`);
    return data.data;
  },

  // Admin: list all digital identities
  adminList: async (params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    identities: DigitalIdAdminListItem[];
    pagination: { total: number; page: number; limit: number; pages: number };
  }> => {
    const { data } = await apiClient.get('/digital-id/admin', { params });
    return data.data;
  },

  // Admin: update status
  adminVerify: async (userId: string, reason?: string) => {
    const { data } = await apiClient.post(`/digital-id/admin/${userId}/verify`, { reason });
    return data.data;
  },

  adminSuspend: async (userId: string, reason?: string) => {
    const { data } = await apiClient.post(`/digital-id/admin/${userId}/suspend`, { reason });
    return data.data;
  },

  adminRevoke: async (userId: string, reason?: string) => {
    const { data } = await apiClient.post(`/digital-id/admin/${userId}/revoke`, { reason });
    return data.data;
  },

  adminRegenerate: async (userId: string) => {
    const { data } = await apiClient.post(`/digital-id/admin/${userId}/regenerate`);
    return data.data;
  },
};
