import apiClient from './client';
import {
  OpportunitiesResponse,
  OpportunityItem,
  CreateOpportunityPayload,
  ReportOpportunityPayload,
} from '@/types/opportunity';

export interface OpportunityQueryParams {
  search?: string;
  category?: string;
  isRemote?: boolean;
  deadlineStatus?: string;
  featured?: boolean;
  skills?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function fetchOpportunities(
  params?: OpportunityQueryParams
): Promise<OpportunitiesResponse> {
  const { data } = await apiClient.get<{ success: boolean; data: OpportunitiesResponse }>(
    '/opportunities',
    { params }
  );
  return data.data;
}

export async function fetchOpportunityBySlug(slug: string): Promise<OpportunityItem> {
  const { data } = await apiClient.get<{ success: boolean; data: OpportunityItem }>(
    `/opportunities/${encodeURIComponent(slug)}`
  );
  return data.data;
}

export async function fetchSavedOpportunities(): Promise<OpportunityItem[]> {
  const { data } = await apiClient.get<{ success: boolean; data: OpportunityItem[] }>(
    '/opportunities/saved'
  );
  return data.data;
}

export async function saveOpportunity(id: string): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(
    `/opportunities/${id}/save`
  );
  return data;
}

export async function unsaveOpportunity(id: string): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.delete<{ success: boolean; message: string }>(
    `/opportunities/${id}/save`
  );
  return data;
}

export async function createOpportunity(
  payload: CreateOpportunityPayload
): Promise<{ success: boolean; message: string; data: OpportunityItem }> {
  const { data } = await apiClient.post<{ success: boolean; message: string; data: OpportunityItem }>(
    '/opportunities',
    payload
  );
  return data;
}

export async function reportOpportunity(
  id: string,
  payload: ReportOpportunityPayload
): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(
    `/opportunities/${id}/report`,
    payload
  );
  return data;
}

export async function moderateOpportunity(
  id: string,
  payload: { status?: string; isFeatured?: boolean; moderationNote?: string }
): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.patch<{ success: boolean; message: string }>(
    `/opportunities/${id}/moderate`,
    payload
  );
  return data;
}
