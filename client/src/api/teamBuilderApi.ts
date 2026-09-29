import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import {
  AnalyzeProjectRequest,
  AnalyzeProjectResponse,
  FindMatchesRequest,
  FindMatchesResponse,
  SendInvitationRequest,
  RespondInvitationRequest,
  InvitationsResponse,
  TeamInvitation,
} from '@/types/teamBuilder';

export const teamBuilderApi = {
  analyzeProject: async (payload: AnalyzeProjectRequest): Promise<AnalyzeProjectResponse> => {
    const res = await apiClient.post('/team-builder/analyze', payload);
    return res.data.data;
  },

  findMatches: async (payload: FindMatchesRequest): Promise<FindMatchesResponse> => {
    const res = await apiClient.post('/team-builder/matches', payload);
    return res.data.data;
  },

  sendInvitation: async (payload: SendInvitationRequest): Promise<TeamInvitation> => {
    const res = await apiClient.post('/team-builder/invitations', payload);
    return res.data.data;
  },

  getInvitations: async (): Promise<InvitationsResponse> => {
    const res = await apiClient.get('/team-builder/invitations');
    return res.data.data;
  },

  respondToInvitation: async (
    invitationId: string,
    payload: RespondInvitationRequest,
  ): Promise<TeamInvitation> => {
    const res = await apiClient.patch(`/team-builder/invitations/${invitationId}`, payload);
    return res.data.data;
  },
};

export const TEAM_BUILDER_KEYS = {
  all: ['team-builder'] as const,
  invitations: () => [...TEAM_BUILDER_KEYS.all, 'invitations'] as const,
};

export function useAnalyzeProject() {
  return useMutation({
    mutationFn: (payload: AnalyzeProjectRequest) => teamBuilderApi.analyzeProject(payload),
  });
}

export function useFindMatches() {
  return useMutation({
    mutationFn: (payload: FindMatchesRequest) => teamBuilderApi.findMatches(payload),
  });
}

export function useSendInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendInvitationRequest) => teamBuilderApi.sendInvitation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_BUILDER_KEYS.invitations() });
    },
  });
}

export function useInvitations() {
  return useQuery({
    queryKey: TEAM_BUILDER_KEYS.invitations(),
    queryFn: () => teamBuilderApi.getInvitations(),
    staleTime: 30 * 1000,
  });
}

export function useRespondInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RespondInvitationRequest }) =>
      teamBuilderApi.respondToInvitation(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_BUILDER_KEYS.invitations() });
    },
  });
}
