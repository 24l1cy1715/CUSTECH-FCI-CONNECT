import apiClient from './client';
import { MarketplaceService, MarketplaceInquiry } from '@/types/marketplace';

export const marketplaceApi = {
  listServices: async (params?: { category?: string; pricingType?: string; search?: string; page?: number }) => {
    const res = await apiClient.get<{ success: boolean; data: { services: MarketplaceService[]; pagination: any } }>('/marketplace', { params });
    return res.data.data;
  },

  getServices: async (params?: { category?: string; pricingType?: string; search?: string; page?: number }) => {
    const res = await apiClient.get<{ success: boolean; data: { services: MarketplaceService[]; pagination: any } }>('/marketplace', { params });
    return res.data.data;
  },

  createService: async (data: any) => {
    const res = await apiClient.post<{ success: boolean; data: MarketplaceService }>('/marketplace', data);
    return res.data.data;
  },

  getService: async (slugOrId: string) => {
    const res = await apiClient.get<{ success: boolean; data: MarketplaceService }>(`/marketplace/${slugOrId}`);
    return res.data.data;
  },

  getServiceBySlug: async (slugOrId: string) => {
    const res = await apiClient.get<{ success: boolean; data: MarketplaceService }>(`/marketplace/${slugOrId}`);
    return res.data.data;
  },

  updateService: async (id: string, data: any) => {
    const res = await apiClient.patch<{ success: boolean; data: MarketplaceService }>(`/marketplace/${id}`, data);
    return res.data.data;
  },

  sendInquiry: async (serviceId: string, data: { message: string; requirements?: string; budget?: number }) => {
    const res = await apiClient.post<{ success: boolean; data: MarketplaceInquiry }>(`/marketplace/${serviceId}/inquire`, data);
    return res.data.data;
  },

  submitInquiry: async (serviceId: string, data: { message: string; requirements?: string; budget?: number }) => {
    const res = await apiClient.post<{ success: boolean; data: MarketplaceInquiry }>(`/marketplace/${serviceId}/inquire`, data);
    return res.data.data;
  },

  listMyInquiries: async (role: 'seller' | 'buyer' = 'seller') => {
    const res = await apiClient.get<{ success: boolean; data: MarketplaceInquiry[] }>('/marketplace/inquiries/my', { params: { role } });
    return res.data.data;
  },

  getMyInquiries: async (role: 'seller' | 'buyer' = 'seller') => {
    const res = await apiClient.get<{ success: boolean; data: MarketplaceInquiry[] }>('/marketplace/inquiries/my', { params: { role } });
    return res.data.data;
  },

  updateInquiryStatus: async (inquiryId: string, status: string) => {
    const res = await apiClient.patch<{ success: boolean; data: MarketplaceInquiry }>(`/marketplace/inquiries/${inquiryId}/status`, { status });
    return res.data.data;
  },
};
