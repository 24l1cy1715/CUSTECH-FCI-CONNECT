import apiClient from './client';
import { VoicePoll, VoiceSuggestion } from '@/types/voice';

export const voiceApi = {
  listPolls: async (status?: string) => {
    const res = await apiClient.get<{ success: boolean; data: VoicePoll[] }>('/student-voice/polls', { params: { status } });
    return res.data.data;
  },

  getPolls: async (status?: string) => {
    const res = await apiClient.get<{ success: boolean; data: VoicePoll[] }>('/student-voice/polls', { params: { status } });
    return res.data.data;
  },

  votePoll: async (pollId: string, optionIndex: number) => {
    const res = await apiClient.post<{ success: boolean; message: string; optionIndex: number }>(`/student-voice/polls/${pollId}/vote`, { optionIndex });
    return res.data;
  },

  createPoll: async (data: any) => {
    const res = await apiClient.post<{ success: boolean; data: VoicePoll }>('/student-voice/polls', data);
    return res.data.data;
  },

  listSuggestions: async (params?: { category?: string; status?: string; search?: string; page?: number }) => {
    const res = await apiClient.get<{ success: boolean; data: { suggestions: VoiceSuggestion[]; pagination: any } }>('/student-voice/suggestions', { params });
    return res.data.data;
  },

  getSuggestions: async (params?: { category?: string; status?: string; search?: string; page?: number }) => {
    const res = await apiClient.get<{ success: boolean; data: { suggestions: VoiceSuggestion[]; pagination: any } }>('/student-voice/suggestions', { params });
    return res.data.data;
  },

  createSuggestion: async (data: { title: string; description: string; category?: string; isAnonymous?: boolean }) => {
    const res = await apiClient.post<{ success: boolean; data: VoiceSuggestion }>('/student-voice/suggestions', data);
    return res.data.data;
  },

  upvoteSuggestion: async (suggestionId: string) => {
    const res = await apiClient.post<{ success: boolean; isUpvoted: boolean }>(`/student-voice/suggestions/${suggestionId}/upvote`);
    return res.data;
  },

  respondSuggestion: async (suggestionId: string, data: { status: string; adminResponse: string }) => {
    const res = await apiClient.patch<{ success: boolean; data: VoiceSuggestion }>(`/student-voice/suggestions/${suggestionId}/respond`, data);
    return res.data.data;
  },
};
