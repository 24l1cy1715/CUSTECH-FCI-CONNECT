import apiClient from './client';
import { AnnouncementItem } from '@/types/announcement';

export const announcementApi = {
  listAnnouncements: async (params?: { priority?: string; category?: string; search?: string; page?: number }) => {
    const res = await apiClient.get<{ success: boolean; data: { announcements: AnnouncementItem[]; pagination: any } }>('/announcements', { params });
    return res.data.data; // { announcements: [...], pagination: {} }
  },

  /** Returns { success, data: { announcements, pagination } }
   *  AnnouncementsPage accesses: announcementsData?.data?.announcements
   *  to get the array (see page line: const announcements = announcementsData?.data || [])
   *  ——we normalise here so announcementsData?.data is the Announcement[] */
  getAnnouncements: async (params?: { priority?: string; category?: string; search?: string; page?: number }) => {
    const res = await apiClient.get<{ success: boolean; data: { announcements: AnnouncementItem[]; pagination: any } }>('/announcements', { params });
    // Return shaped so that `announcementsData?.data` = Announcement[]
    return { success: res.data.success, data: res.data.data?.announcements ?? [] };
  },

  getAnnouncement: async (slugOrId: string) => {
    const res = await apiClient.get<{ success: boolean; data: AnnouncementItem }>(`/announcements/${slugOrId}`);
    return res.data.data;
  },

  createAnnouncement: async (data: any) => {
    const res = await apiClient.post<{ success: boolean; data: AnnouncementItem }>('/announcements', data);
    return res.data.data;
  },

  updateAnnouncement: async (id: string, data: any) => {
    const res = await apiClient.patch<{ success: boolean; data: AnnouncementItem }>(`/announcements/${id}`, data);
    return res.data.data;
  },

  markAsRead: async (id: string) => {
    const res = await apiClient.post<{ success: boolean; message: string }>(`/announcements/${id}/read`);
    return res.data;
  },
};
