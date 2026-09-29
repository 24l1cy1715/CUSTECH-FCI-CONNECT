import apiClient from './client';
import {
  MentorProfileItem,
  MentorshipRelationshipItem,
  MentorshipDashboardData,
  MentorshipGoalItem,
  MentorshipSessionItem,
  MentorshipResourceItem,
  SaveMentorProfilePayload,
  RequestMentorshipPayload,
  CreateMentorshipGoalPayload,
  UpdateMentorshipGoalPayload,
  CreateMentorshipSessionPayload,
  CreateMentorshipResourcePayload,
} from '@/types/mentorship';

export interface MentorQueryParams {
  search?: string;
  skill?: string;
  category?: string;
  format?: string;
  language?: string;
  availableOnly?: boolean;
  page?: number;
  limit?: number;
}

export async function fetchMentors(
  params?: MentorQueryParams
): Promise<{ mentors: MentorProfileItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const { data } = await apiClient.get('/mentorship/mentors', { params });
  return data.data;
}

export async function fetchMentorById(id: string): Promise<MentorProfileItem> {
  const { data } = await apiClient.get(`/mentorship/mentors/${id}`);
  return data.data;
}

export async function saveMentorProfile(
  payload: SaveMentorProfilePayload
): Promise<MentorProfileItem> {
  const { data } = await apiClient.post('/mentorship/profile', payload);
  return data.data;
}

export async function fetchMyMentorProfile(): Promise<MentorProfileItem | null> {
  const { data } = await apiClient.get('/mentorship/profile/me');
  return data.data;
}

export async function requestMentorship(
  payload: RequestMentorshipPayload
): Promise<MentorshipRelationshipItem> {
  const { data } = await apiClient.post('/mentorship/requests', payload);
  return data.data;
}

export async function fetchMentorshipRequests(params?: {
  role?: 'mentor' | 'mentee';
  status?: string;
}): Promise<MentorshipRelationshipItem[]> {
  const { data } = await apiClient.get('/mentorship/requests', { params });
  return data.data;
}

export async function respondToMentorshipRequest(
  requestId: string,
  status: 'ACCEPTED' | 'DECLINED' | 'CANCELLED'
): Promise<MentorshipRelationshipItem> {
  const { data } = await apiClient.patch(`/mentorship/requests/${requestId}`, { status });
  return data.data;
}

export async function fetchMentorshipDashboard(): Promise<MentorshipDashboardData> {
  const { data } = await apiClient.get('/mentorship/dashboard');
  return data.data;
}

export async function fetchMentorshipRelationship(
  id: string
): Promise<MentorshipRelationshipItem> {
  const { data } = await apiClient.get(`/mentorship/relationships/${id}`);
  return data.data;
}

export async function endMentorship(id: string): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.delete(`/mentorship/relationships/${id}`);
  return data;
}

export async function createMentorshipGoal(
  relationshipId: string,
  payload: CreateMentorshipGoalPayload
): Promise<MentorshipGoalItem> {
  const { data } = await apiClient.post(`/mentorship/relationships/${relationshipId}/goals`, payload);
  return data.data;
}

export async function updateMentorshipGoal(
  goalId: string,
  payload: UpdateMentorshipGoalPayload
): Promise<MentorshipGoalItem> {
  const { data } = await apiClient.patch(`/mentorship/goals/${goalId}`, payload);
  return data.data;
}

export async function deleteMentorshipGoal(
  goalId: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.delete(`/mentorship/goals/${goalId}`);
  return data;
}

export async function createMentorshipSession(
  relationshipId: string,
  payload: CreateMentorshipSessionPayload
): Promise<MentorshipSessionItem> {
  const { data } = await apiClient.post(
    `/mentorship/relationships/${relationshipId}/sessions`,
    payload
  );
  return data.data;
}

export async function updateMentorshipSessionStatus(
  sessionId: string,
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
): Promise<MentorshipSessionItem> {
  const { data } = await apiClient.patch(`/mentorship/sessions/${sessionId}/status`, { status });
  return data.data;
}

export async function createMentorshipResource(
  relationshipId: string,
  payload: CreateMentorshipResourcePayload
): Promise<MentorshipResourceItem> {
  const { data } = await apiClient.post(
    `/mentorship/relationships/${relationshipId}/resources`,
    payload
  );
  return data.data;
}

export async function deleteMentorshipResource(
  resourceId: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.delete(`/mentorship/resources/${resourceId}`);
  return data;
}

export async function reportMentorship(payload: {
  targetUserId: string;
  reason: string;
  description?: string;
  mentorshipId?: string;
}): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.post('/mentorship/reports', payload);
  return data;
}
