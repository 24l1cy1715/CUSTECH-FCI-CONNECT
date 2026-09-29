import apiClient from './client';
import {
  LearningResource,
  LearningPath,
  LearningHubOverview,
  ResourceListResponse,
  CreateResourcePayload,
} from '@/types/learning';

export const learningApi = {
  // Hub overview
  getOverview: async (): Promise<LearningHubOverview> => {
    const { data } = await apiClient.get('/learning/overview');
    return data.data;
  },

  // Resource list
  getResources: async (params?: {
    search?: string;
    category?: string;
    resourceType?: string;
    subject?: string;
    courseCode?: string;
    department?: string;
    level?: number;
    authorId?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<ResourceListResponse> => {
    const { data } = await apiClient.get('/learning/resources', { params });
    return data.data;
  },

  // Resource detail by slug
  getResourceBySlug: async (slug: string): Promise<LearningResource> => {
    const { data } = await apiClient.get(`/learning/resources/${slug}`);
    return data.data;
  },

  // Taxonomies
  getTaxonomies: async (): Promise<{
    resourceTypes: string[];
    categories: string[];
  }> => {
    const { data } = await apiClient.get('/learning/taxonomies');
    return data.data;
  },

  // Submit resource
  submitResource: async (payload: CreateResourcePayload): Promise<LearningResource> => {
    const { data } = await apiClient.post('/learning/resources/submissions', payload);
    return data.data;
  },

  // Save / Bookmark
  saveResource: async (id: string): Promise<{ saved: boolean }> => {
    const { data } = await apiClient.post(`/learning/resources/${id}/save`);
    return data.data;
  },

  unsaveResource: async (id: string): Promise<{ saved: boolean }> => {
    const { data } = await apiClient.delete(`/learning/resources/${id}/save`);
    return data.data;
  },

  // Progress
  updateProgress: async (
    id: string,
    payload: { status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'; progressPercentage?: number },
  ) => {
    const { data } = await apiClient.post(`/learning/resources/${id}/progress`, payload);
    return data.data;
  },

  // Learning Paths
  getLearningPaths: async (params?: {
    category?: string;
    difficulty?: string;
  }): Promise<LearningPath[]> => {
    const { data } = await apiClient.get('/learning/paths', { params });
    return data.data;
  },

  getLearningPathBySlug: async (slug: string): Promise<LearningPath> => {
    const { data } = await apiClient.get(`/learning/paths/${slug}`);
    return data.data;
  },

  enrollLearningPath: async (id: string) => {
    const { data } = await apiClient.post(`/learning/paths/${id}/enroll`);
    return data.data;
  },

  // Admin moderation
  approveResource: async (id: string) => {
    const { data } = await apiClient.post(`/admin/learning/resources/${id}/approve`);
    return data.data;
  },

  rejectResource: async (id: string, reason?: string) => {
    const { data } = await apiClient.post(`/admin/learning/resources/${id}/reject`, { reason });
    return data.data;
  },

  toggleFeatureResource: async (id: string) => {
    const { data } = await apiClient.post(`/admin/learning/resources/${id}/toggle-feature`);
    return data.data;
  },

  deleteResource: async (id: string) => {
    const { data } = await apiClient.delete(`/admin/learning/resources/${id}`);
    return data.data;
  },
};
