import apiClient from './client';
import {
  LabProject,
  LabProjectMember,
  LabProjectTask,
  LabProjectMilestone,
  LabProjectDiscussion,
  LabProjectResource,
  LabTeamRole,
  LabTaskStatus,
  LabTaskPriority,
} from '@/types/projectLab';

export interface ProjectListResponse {
  projects: Array<LabProject & { progressPercentage: number }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreateLabProjectPayload {
  title: string;
  description: string;
  category: string;
  problemStatement?: string;
  objectives?: string;
  department?: string;
  visibility?: 'PUBLIC' | 'FCI_ONLY' | 'PRIVATE';
  startDate?: string;
  targetDate?: string;
  githubUrl?: string;
  liveDemoUrl?: string;
  documentationUrl?: string;
  coverImage?: string;
  opportunityId?: string;
  mentorId?: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: LabTaskStatus;
  priority?: LabTaskPriority;
  assigneeId?: string;
  milestoneId?: string;
  dueDate?: string;
  position?: number;
}

export interface CreateMilestonePayload {
  title: string;
  description?: string;
  dueDate?: string;
  position?: number;
}

export const projectLabApi = {
  // List projects (explore or user's projects)
  getProjects: async (params?: {
    view?: 'my' | 'explore';
    category?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ProjectListResponse> => {
    const { data } = await apiClient.get('/project-lab', { params });
    return data.data;
  },

  // Project workspace detail
  getProject: async (idOrSlug: string): Promise<LabProject & { progressPercentage: number; userMembership: LabProjectMember | null }> => {
    const { data } = await apiClient.get(`/project-lab/${idOrSlug}`);
    return data.data;
  },

  // Create project
  createProject: async (payload: CreateLabProjectPayload): Promise<LabProject> => {
    const { data } = await apiClient.post('/project-lab', payload);
    return data.data;
  },

  // Update project
  updateProject: async (id: string, payload: Partial<CreateLabProjectPayload> & { status?: string }): Promise<LabProject> => {
    const { data } = await apiClient.patch(`/project-lab/${id}`, payload);
    return data.data;
  },

  // Member Management
  inviteMember: async (id: string, userId: string, role: LabTeamRole): Promise<LabProjectMember> => {
    const { data } = await apiClient.post(`/project-lab/${id}/members`, { userId, role });
    return data.data;
  },

  respondInvitation: async (id: string, action: 'ACCEPT' | 'DECLINE'): Promise<LabProjectMember> => {
    const { data } = await apiClient.patch(`/project-lab/${id}/members/respond`, { action });
    return data.data;
  },

  removeMember: async (id: string, memberId: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/project-lab/${id}/members/${memberId}`);
    return data.data;
  },

  // Task Management
  createTask: async (id: string, payload: CreateTaskPayload): Promise<LabProjectTask> => {
    const { data } = await apiClient.post(`/project-lab/${id}/tasks`, payload);
    return data.data;
  },

  updateTask: async (id: string, taskId: string, payload: Partial<CreateTaskPayload>): Promise<LabProjectTask> => {
    const { data } = await apiClient.patch(`/project-lab/${id}/tasks/${taskId}`, payload);
    return data.data;
  },

  deleteTask: async (id: string, taskId: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/project-lab/${id}/tasks/${taskId}`);
    return data.data;
  },

  // Milestone Management
  createMilestone: async (id: string, payload: CreateMilestonePayload): Promise<LabProjectMilestone> => {
    const { data } = await apiClient.post(`/project-lab/${id}/milestones`, payload);
    return data.data;
  },

  updateMilestone: async (id: string, milestoneId: string, payload: Partial<CreateMilestonePayload> & { status?: string }): Promise<LabProjectMilestone> => {
    const { data } = await apiClient.patch(`/project-lab/${id}/milestones/${milestoneId}`, payload);
    return data.data;
  },

  // Discussions
  getDiscussions: async (id: string): Promise<LabProjectDiscussion[]> => {
    const { data } = await apiClient.get(`/project-lab/${id}/discussions`);
    return data.data;
  },

  createDiscussion: async (id: string, content: string, parentId?: string): Promise<LabProjectDiscussion> => {
    const { data } = await apiClient.post(`/project-lab/${id}/discussions`, { content, parentId });
    return data.data;
  },

  // Resources
  addResource: async (id: string, payload: { title: string; url: string; type?: string; learningResourceId?: string }): Promise<LabProjectResource> => {
    const { data } = await apiClient.post(`/project-lab/${id}/resources`, payload);
    return data.data;
  },

  // Submit to Showcase
  submitToShowcase: async (id: string, payload: {
    title?: string;
    description?: string;
    category?: string;
    githubUrl?: string;
    demoUrl?: string;
    imageUrls?: string[];
  }): Promise<any> => {
    const { data } = await apiClient.post(`/project-lab/${id}/showcase-submit`, payload);
    return data.data;
  },
};
