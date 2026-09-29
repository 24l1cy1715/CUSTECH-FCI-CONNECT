import apiClient from './client';
import { UserGithubProfile, GithubRepo } from '@/types/github';

export const githubApi = {
  connectGithub: async (data: string | { githubUsername: string; personalAccessToken?: string }) => {
    const payload = typeof data === 'string' ? { githubUsername: data } : data;
    const res = await apiClient.post<{ success: boolean; message: string; data: UserGithubProfile }>('/github/connect', payload);
    return res.data;
  },

  getProfile: async (usernameOrUserId: string = 'me') => {
    const res = await apiClient.get<{ success: boolean; data: UserGithubProfile | null }>(`/github/${usernameOrUserId}`);
    return res.data.data;
  },

  getMyGithubProfile: async () => {
    const res = await apiClient.get<{ success: boolean; data: UserGithubProfile | null }>('/github/me');
    return res.data;
  },

  getMyGithubRepos: async () => {
    const profile = await githubApi.getProfile('me');
    const repos = profile?.cachedRepos || [];
    return { success: true, data: repos };
  },

  syncGithub: async (username?: string) => {
    if (username) {
      return githubApi.connectGithub(username);
    }
    const profile = await githubApi.getProfile('me');
    if (!profile?.githubUsername) {
      throw new Error('No connected GitHub username found to sync');
    }
    return githubApi.connectGithub(profile.githubUsername);
  },

  updatePrivacy: async (settings: {
    showOnProfile?: boolean;
    showRepositories?: boolean;
    showRepos?: boolean;
    showActivity?: boolean;
    showContributions?: boolean;
  }) => {
    const payload = {
      showOnProfile: settings.showOnProfile,
      showRepositories: settings.showRepositories !== undefined ? settings.showRepositories : settings.showRepos,
      showActivity: settings.showActivity !== undefined ? settings.showActivity : settings.showContributions,
    };
    const res = await apiClient.patch<{ success: boolean; data: UserGithubProfile }>('/github/privacy', payload);
    return res.data.data;
  },

  disconnectGithub: async () => {
    const res = await apiClient.delete<{ success: boolean; message: string }>('/github/disconnect');
    return res.data;
  },
};
