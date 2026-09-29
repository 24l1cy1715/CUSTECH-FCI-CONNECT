import apiClient from './client';
import {
  OpportunityApplication,
  OpportunityRecommendation,
  OpportunityTrackStatus,
} from '@/types/opportunityTracker';

export interface TrackOpportunityPayload {
  status?: OpportunityTrackStatus;
  appliedAt?: string | null;
  followUpDate?: string | null;
  notes?: string | null;
  applicationUrl?: string | null;
  result?: string | null;
  documentTypes?: string[];
  remindDaysBefore?: number;
  linkedLabProjectId?: string | null;
}

export const opportunityTrackerApi = {
  // Get all user's tracked opportunities
  getMyTracked: async (status?: string): Promise<OpportunityApplication[]> => {
    const { data } = await apiClient.get('/opportunities/tracker', {
      params: { status: status || 'ALL' },
    });
    return data.data;
  },

  // Get upcoming deadlines
  getUpcomingDeadlines: async (): Promise<OpportunityApplication[]> => {
    const { data } = await apiClient.get('/opportunities/tracker/upcoming');
    return data.data;
  },

  // Get Skill Graph recommendations
  getRecommendations: async (): Promise<OpportunityRecommendation[]> => {
    const { data } = await apiClient.get('/opportunities/tracker/recommendations');
    return data.data;
  },

  // Track or upsert an opportunity
  trackOpportunity: async (opportunityId: string, payload: TrackOpportunityPayload): Promise<OpportunityApplication> => {
    const { data } = await apiClient.post(`/opportunities/${opportunityId}/track`, payload);
    return data.data;
  },

  // Update existing tracking record
  updateTracking: async (opportunityId: string, payload: Partial<TrackOpportunityPayload>): Promise<OpportunityApplication> => {
    const { data } = await apiClient.patch(`/opportunities/${opportunityId}/track`, payload);
    return data.data;
  },

  // Untrack opportunity
  untrackOpportunity: async (opportunityId: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/opportunities/${opportunityId}/track`);
    return data.data;
  },
};
