import apiClient from './client';
import { MyFciSummary, SmartNextAction, RecommendationItem } from '@/types/intelligence';

export const intelligenceApi = {
  /** Returns the full My FCI dashboard payload */
  getMyFciDashboard: async () => {
    const res = await apiClient.get<{ success: boolean; data: MyFciSummary }>('/intelligence/my-fci');
    return res.data; // { success, data }
  },

  getMyFciSummary: async (): Promise<MyFciSummary> => {
    const res = await apiClient.get<{ success: boolean; data: MyFciSummary }>('/intelligence/my-fci');
    return res.data.data;
  },

  getNextActions: async (): Promise<SmartNextAction[]> => {
    const res = await apiClient.get<{ success: boolean; data: SmartNextAction[] }>('/intelligence/next-actions');
    return res.data.data;
  },

  getRecommendations: async (): Promise<RecommendationItem[]> => {
    const res = await apiClient.get<{ success: boolean; data: RecommendationItem[] }>('/intelligence/recommendations');
    return res.data.data;
  },
};
