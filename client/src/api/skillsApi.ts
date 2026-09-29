import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import {
  Skill,
  SkillDetail,
  UserSkillsResponse,
  AddStudentSkillPayload,
  UpdateStudentSkillPayload,
  SkillCategory,
  SkillProficiency,
} from '@/types/skills';

export interface SkillsQueryParams {
  search?: string;
  category?: SkillCategory | string;
  page?: number;
  limit?: number;
}

export interface SkillsListResponse {
  skills: Skill[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Raw API Methods ──────────────────────────────────────────────────────────

export const skillsApi = {
  getSkills: async (params?: SkillsQueryParams): Promise<SkillsListResponse> => {
    const res = await apiClient.get('/skills', { params });
    return {
      skills: res.data.data || [],
      pagination: res.data.pagination || { page: 1, limit: 50, total: res.data.data?.length || 0, totalPages: 1 },
    };
  },

  getSkillById: async (id: string): Promise<SkillDetail> => {
    const res = await apiClient.get(`/skills/${id}`);
    return res.data.data;
  },

  createSkill: async (payload: { name: string; category: SkillCategory; description?: string }): Promise<Skill> => {
    const res = await apiClient.post('/skills', payload);
    return res.data.data;
  },

  getUserSkills: async (userId: string): Promise<UserSkillsResponse> => {
    const res = await apiClient.get(`/users/${userId}/skills`);
    return res.data.data;
  },

  addUserSkill: async (userId: string, payload: AddStudentSkillPayload) => {
    const res = await apiClient.post(`/users/${userId}/skills`, payload);
    return res.data;
  },

  updateUserSkill: async (userId: string, skillId: string, payload: UpdateStudentSkillPayload) => {
    const res = await apiClient.patch(`/users/${userId}/skills/${skillId}`, payload);
    return res.data;
  },

  deleteUserSkill: async (userId: string, skillId: string) => {
    const res = await apiClient.delete(`/users/${userId}/skills/${skillId}`);
    return res.data;
  },
};

// ── TanStack Query Hooks ─────────────────────────────────────────────────────

export const SKILLS_KEYS = {
  all: ['skills'] as const,
  lists: () => [...SKILLS_KEYS.all, 'list'] as const,
  list: (params?: SkillsQueryParams) => [...SKILLS_KEYS.lists(), params] as const,
  detail: (id: string) => [...SKILLS_KEYS.all, 'detail', id] as const,
  userSkills: (userId: string) => [...SKILLS_KEYS.all, 'user', userId] as const,
};

export function useSkills(params?: SkillsQueryParams) {
  return useQuery({
    queryKey: SKILLS_KEYS.list(params),
    queryFn: () => skillsApi.getSkills(params),
    staleTime: 60 * 1000,
  });
}

export function useSkillDetail(id: string | null) {
  return useQuery({
    queryKey: SKILLS_KEYS.detail(id || ''),
    queryFn: () => skillsApi.getSkillById(id!),
    enabled: Boolean(id),
  });
}

export function useUserSkills(userId?: string) {
  return useQuery({
    queryKey: SKILLS_KEYS.userSkills(userId || ''),
    queryFn: () => skillsApi.getUserSkills(userId!),
    enabled: Boolean(userId),
    staleTime: 30 * 1000,
  });
}

export function useAddUserSkill(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddStudentSkillPayload) => skillsApi.addUserSkill(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILLS_KEYS.userSkills(userId) });
      queryClient.invalidateQueries({ queryKey: SKILLS_KEYS.lists() });
    },
  });
}

export function useUpdateUserSkill(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, payload }: { skillId: string; payload: UpdateStudentSkillPayload }) =>
      skillsApi.updateUserSkill(userId, skillId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILLS_KEYS.userSkills(userId) });
    },
  });
}

export function useDeleteUserSkill(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (skillId: string) => skillsApi.deleteUserSkill(userId, skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILLS_KEYS.userSkills(userId) });
      queryClient.invalidateQueries({ queryKey: SKILLS_KEYS.lists() });
    },
  });
}
