import apiClient from './client';
import { SiwesPlacement, SiwesWeeklyLog, SiwesDocument } from '@/types/siwes';

export const siwesApi = {
  getMyPlacement: async () => {
    const res = await apiClient.get<{ success: boolean; data: SiwesPlacement }>('/siwes/my-placement');
    return res.data.data;
  },

  updatePlacement: async (data: any) => {
    const res = await apiClient.patch<{ success: boolean; data: SiwesPlacement }>('/siwes/my-placement', data);
    return res.data.data;
  },

  createOrUpdatePlacement: async (data: any) => {
    const res = await apiClient.patch<{ success: boolean; data: SiwesPlacement }>('/siwes/my-placement', data);
    return res.data.data;
  },

  saveWeeklyLog: async (data: any) => {
    const res = await apiClient.post<{ success: boolean; data: SiwesWeeklyLog }>('/siwes/logs', data);
    return res.data.data;
  },

  createWeeklyLog: async (data: any) => {
    const res = await apiClient.post<{ success: boolean; data: SiwesWeeklyLog }>('/siwes/logs', data);
    return res.data.data;
  },

  updateWeeklyLog: async (logId: string, data: any) => {
    const res = await apiClient.patch<{ success: boolean; data: SiwesWeeklyLog }>(`/siwes/logs/${logId}`, data);
    return res.data.data;
  },

  getMyLogs: async () => {
    const res = await apiClient.get<{ success: boolean; data: SiwesPlacement }>('/siwes/my-placement');
    return res.data.data?.weeklyLogs || [];
  },

  addDocument: async (data: any) => {
    const res = await apiClient.post<{ success: boolean; data: SiwesDocument }>('/siwes/documents', data);
    return res.data.data;
  },

  uploadDocument: async (data: any) => {
    const res = await apiClient.post<{ success: boolean; data: SiwesDocument }>('/siwes/documents', data);
    return res.data.data;
  },

  getMyDocuments: async () => {
    const res = await apiClient.get<{ success: boolean; data: SiwesPlacement }>('/siwes/my-placement');
    return res.data.data?.documents || [];
  },

  deleteDocument: async (docId: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/siwes/documents/${docId}`);
    return res.data;
  },
};
