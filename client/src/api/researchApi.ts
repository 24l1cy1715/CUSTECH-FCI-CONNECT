import apiClient from './client';
import { ResearchProject, ResearchIdea } from '@/types/research';

export interface ResearchListParams {
  view?: 'explore' | 'my';
  category?: string;
  department?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const researchApi = {
  listProjects: async (params?: ResearchListParams) => {
    const res = await apiClient.get<{ success: boolean; data: { projects: ResearchProject[]; pagination: any } }>('/research', { params });
    return res.data.data;
  },

  createProject: async (data: any) => {
    const res = await apiClient.post<{ success: boolean; data: ResearchProject }>('/research', data);
    return res.data.data;
  },

  getProject: async (idOrSlug: string) => {
    const res = await apiClient.get<{ success: boolean; data: ResearchProject }>(`/research/${idOrSlug}`);
    return res.data.data;
  },

  updateProject: async (id: string, data: any) => {
    const res = await apiClient.patch<{ success: boolean; data: ResearchProject }>(`/research/${id}`, data);
    return res.data.data;
  },

  addMember: async (id: string, data: { userId: string; role?: string }) => {
    const res = await apiClient.post<{ success: boolean; data: any }>(`/research/${id}/members`, data);
    return res.data.data;
  },

  removeMember: async (id: string, memberId: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/research/${id}/members/${memberId}`);
    return res.data;
  },

  addPublication: async (id: string, data: any) => {
    const res = await apiClient.post<{ success: boolean; data: any }>(`/research/${id}/publications`, data);
    return res.data.data;
  },

  listIdeas: async (params?: { category?: string; search?: string; page?: number }) => {
    const res = await apiClient.get<{ success: boolean; data: { ideas: ResearchIdea[]; pagination: any } }>('/research/ideas/board', { params });
    return res.data.data;
  },

  createIdea: async (data: { title: string; description: string; category: string }) => {
    const res = await apiClient.post<{ success: boolean; data: ResearchIdea }>('/research/ideas', data);
    return res.data.data;
  },

  likeIdea: async (ideaId: string) => {
    const res = await apiClient.post<{ success: boolean; isLiked: boolean }>(`/research/ideas/${ideaId}/like`);
    return res.data;
  },

  commentIdea: async (ideaId: string, content: string) => {
    const res = await apiClient.post<{ success: boolean; data: any }>(`/research/ideas/${ideaId}/comments`, { content });
    return res.data.data;
  },
};
