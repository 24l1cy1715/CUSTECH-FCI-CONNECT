import apiClient from './client';
import { SkillAssessment, AssessmentResult, AssessmentAttemptHistory } from '@/types/assessment';

export const assessmentApi = {
  listAssessments: async (params?: { category?: string; difficulty?: string; search?: string }) => {
    const res = await apiClient.get<{ success: boolean; data: SkillAssessment[] }>('/assessments', { params });
    return res.data.data;
  },

  getAssessments: async (params?: { category?: string; difficulty?: string; search?: string }) => {
    const res = await apiClient.get<{ success: boolean; data: SkillAssessment[] }>('/assessments', { params });
    return res.data.data;
  },

  getAssessment: async (slugOrId: string) => {
    const res = await apiClient.get<{ success: boolean; data: SkillAssessment }>(`/assessments/${slugOrId}`);
    return res.data.data;
  },

  getAssessmentBySlug: async (slugOrId: string) => {
    const res = await apiClient.get<{ success: boolean; data: SkillAssessment }>(`/assessments/${slugOrId}`);
    return res.data.data;
  },

  submitAttempt: async (id: string, data: { timeSpentSeconds: number; answers: Record<string, number> }) => {
    const res = await apiClient.post<{ success: boolean; data: AssessmentResult }>(`/assessments/${id}/submit`, data);
    return res.data.data;
  },

  submitAssessment: async (id: string, data: { timeSpentSeconds: number; answers: Record<string, number> }) => {
    const res = await apiClient.post<{ success: boolean; data: AssessmentResult }>(`/assessments/${id}/submit`, data);
    return res.data.data;
  },

  getMyAttempts: async () => {
    const res = await apiClient.get<{ success: boolean; data: AssessmentAttemptHistory[] }>('/assessments/my-attempts');
    return res.data.data;
  },
};
