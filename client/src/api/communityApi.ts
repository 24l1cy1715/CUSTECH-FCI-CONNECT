import apiClient from './client';
import {
  CommunityCategory,
  CommunityItem,
  CommunityDetail,
  CommunityMemberItem,
  CommunityPostItem,
  CommunityPostCommentItem,
  CommunityResourceItem,
  CommunityProjectItem,
  CommunityEventItem,
  CreateCommunityPayload,
  UpdateCommunityPayload,
  CreateCommunityPostPayload,
  CreateCommunityResourcePayload,
} from '@/types/community';

export interface CommunityQueryParams {
  search?: string;
  category?: CommunityCategory;
  visibility?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export async function fetchCommunities(
  params?: CommunityQueryParams
): Promise<{ communities: CommunityItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const { data } = await apiClient.get('/communities', { params });
  if (Array.isArray(data.data)) {
    return {
      communities: data.data,
      pagination: data.pagination || { page: 1, limit: 30, total: data.data.length, totalPages: 1 },
    };
  }
  return data.data;
}

export async function fetchCommunityBySlug(slug: string): Promise<CommunityDetail> {
  const { data } = await apiClient.get(`/communities/${encodeURIComponent(slug)}`);
  return data.data;
}

export async function createCommunity(payload: CreateCommunityPayload): Promise<CommunityItem> {
  const { data } = await apiClient.post('/communities', payload);
  return data.data;
}

export async function updateCommunity(id: string, payload: UpdateCommunityPayload): Promise<CommunityItem> {
  const { data } = await apiClient.patch(`/communities/${id}`, payload);
  return data.data;
}

export async function joinCommunity(id: string): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.post(`/communities/${id}/join`);
  return data;
}

export async function leaveCommunity(id: string): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.delete(`/communities/${id}/membership`);
  return data;
}

export async function fetchCommunityMembers(
  id: string,
  params?: { search?: string; role?: string; page?: number; limit?: number }
): Promise<{ members: CommunityMemberItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const { data } = await apiClient.get(`/communities/${id}/members`, { params });
  return data.data;
}

export async function updateCommunityMember(
  id: string,
  userId: string,
  payload: { role?: string; status?: string }
): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.patch(`/communities/${id}/members/${userId}`, payload);
  return data;
}

export async function fetchCommunityPosts(
  id: string,
  params?: { isAnnouncement?: boolean; page?: number; limit?: number }
): Promise<{ posts: CommunityPostItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const { data } = await apiClient.get(`/communities/${id}/posts`, { params });
  if (Array.isArray(data.data)) {
    return {
      posts: data.data,
      pagination: data.pagination || { page: 1, limit: 15, total: data.data.length, totalPages: 1 },
    };
  }
  return data.data;
}

export async function createCommunityPost(
  id: string,
  payload: CreateCommunityPostPayload
): Promise<CommunityPostItem> {
  const { data } = await apiClient.post(`/communities/${id}/posts`, payload);
  return data.data;
}

export async function deleteCommunityPost(
  id: string,
  postId: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.delete(`/communities/${id}/posts/${postId}`);
  return data;
}

export async function togglePostLike(
  id: string,
  postId: string
): Promise<{ liked: boolean; likeCount: number }> {
  const { data } = await apiClient.post(`/communities/${id}/posts/${postId}/like`);
  return data.data;
}

export async function fetchPostComments(
  id: string,
  postId: string
): Promise<CommunityPostCommentItem[]> {
  const { data } = await apiClient.get(`/communities/${id}/posts/${postId}/comments`);
  return data.data;
}

export async function createPostComment(
  id: string,
  postId: string,
  content: string
): Promise<CommunityPostCommentItem> {
  const { data } = await apiClient.post(`/communities/${id}/posts/${postId}/comments`, { content });
  return data.data;
}

export async function deletePostComment(
  id: string,
  postId: string,
  commentId: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.delete(
    `/communities/${id}/posts/${postId}/comments/${commentId}`
  );
  return data;
}

export async function fetchCommunityResources(id: string): Promise<CommunityResourceItem[]> {
  const { data } = await apiClient.get(`/communities/${id}/resources`);
  return data.data;
}

export async function createCommunityResource(
  id: string,
  payload: CreateCommunityResourcePayload
): Promise<CommunityResourceItem> {
  const { data } = await apiClient.post(`/communities/${id}/resources`, payload);
  return data.data;
}

export async function deleteCommunityResource(
  id: string,
  resourceId: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.delete(`/communities/${id}/resources/${resourceId}`);
  return data;
}

export async function fetchCommunityProjects(id: string): Promise<CommunityProjectItem[]> {
  const { data } = await apiClient.get(`/communities/${id}/projects`);
  return data.data;
}

export async function associateProjectWithCommunity(
  id: string,
  projectId: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.post(`/communities/${id}/projects`, { projectId });
  return data;
}

export async function fetchCommunityEvents(id: string): Promise<CommunityEventItem[]> {
  const { data } = await apiClient.get(`/communities/${id}/events`);
  return data.data;
}

export async function associateEventWithCommunity(
  id: string,
  eventId: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.post(`/communities/${id}/events`, { eventId });
  return data;
}

export async function reportCommunityOrPost(
  id: string,
  payload: { reason: string; description?: string; postId?: string }
): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.post(`/communities/${id}/reports`, payload);
  return data;
}
