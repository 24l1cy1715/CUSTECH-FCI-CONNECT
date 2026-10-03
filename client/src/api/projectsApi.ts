import apiClient from './client';
import { Project } from '@/types';

export interface CreateProjectPayload {
  title: string;
  description: string;
  category: string;
  githubUrl?: string;
  demoUrl?: string;
  technologies?: string[];
  images?: string[];
}

export const projectsApi = {
  listProjects: async (params?: { category?: string; search?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get<{ success: boolean; data: Project[]; pagination: any }>('/projects', { params });
    return res.data;
  },

  getProjectBySlug: async (slug: string) => {
    const res = await apiClient.get<{ success: boolean; data: Project }>(`/projects/${slug}`);
    return res.data;
  },

  createProject: async (payload: CreateProjectPayload) => {
    const res = await apiClient.post<{ success: boolean; message: string; data: Project }>('/projects', payload);
    return res.data;
  },

  likeProject: async (id: string) => {
    const res = await apiClient.post<{ success: boolean; isLiked: boolean; likesCount: number }>(`/projects/${id}/like`);
    return res.data;
  },
};
