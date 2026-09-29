import apiClient from './client';

export type CampusLocationCategory =
  | 'FACULTY'
  | 'DEPARTMENT'
  | 'LECTURE_HALL'
  | 'LABORATORY'
  | 'ICT'
  | 'ADMINISTRATION'
  | 'LIBRARY'
  | 'STUDENT_SERVICE'
  | 'EVENT_LOCATION'
  | 'CAFETERIA'
  | 'SPORTS'
  | 'HOSTEL'
  | 'MEDICAL'
  | 'SECURITY'
  | 'OTHER';

export interface OpeningHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
  [key: string]: string | undefined;
}

export interface CampusLocation {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category: CampusLocationCategory;
  building?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  floor?: string | null;
  room?: string | null;
  phone?: string | null;
  email?: string | null;
  openingHours?: OpeningHours | null;
  imageUrl?: string | null;
  isActive: boolean;
  needsCoords: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryOption {
  value: CampusLocationCategory;
  label: string;
}

export interface LocationListResponse {
  locations: CampusLocation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const CATEGORY_ICONS: Record<CampusLocationCategory, string> = {
  FACULTY: 'landmark',
  DEPARTMENT: 'compass',
  LECTURE_HALL: 'graduation-cap',
  LABORATORY: 'flask',
  ICT: 'cpu',
  ADMINISTRATION: 'building',
  LIBRARY: 'book-open',
  STUDENT_SERVICE: 'users',
  EVENT_LOCATION: 'calendar',
  CAFETERIA: 'utensils',
  SPORTS: 'trophy',
  HOSTEL: 'home',
  MEDICAL: 'heart-pulse',
  SECURITY: 'shield',
  OTHER: 'map-pin',
};

export const CATEGORY_COLORS: Record<CampusLocationCategory, string> = {
  FACULTY: 'from-[#F59E0B] to-[#D97706]',
  DEPARTMENT: 'from-[#3B82F6] to-[#2563EB]',
  LECTURE_HALL: 'from-[#8B5CF6] to-[#7C3AED]',
  LABORATORY: 'from-[#10B981] to-[#059669]',
  ICT: 'from-[#06B6D4] to-[#0891B2]',
  ADMINISTRATION: 'from-[#6B7280] to-[#4B5563]',
  LIBRARY: 'from-[#EF4444] to-[#DC2626]',
  STUDENT_SERVICE: 'from-[#F97316] to-[#EA580C]',
  EVENT_LOCATION: 'from-[#EC4899] to-[#DB2777]',
  CAFETERIA: 'from-[#84CC16] to-[#65A30D]',
  SPORTS: 'from-[#14B8A6] to-[#0D9488]',
  HOSTEL: 'from-[#A78BFA] to-[#8B5CF6]',
  MEDICAL: 'from-[#F43F5E] to-[#E11D48]',
  SECURITY: 'from-[#1E293B] to-[#0F172A]',
  OTHER: 'from-[#94A3B8] to-[#64748B]',
};

export interface CreateLocationInput {
  name: string;
  description?: string;
  category: CampusLocationCategory;
  building?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  floor?: string;
  room?: string;
  phone?: string;
  email?: string;
  openingHours?: OpeningHours;
  imageUrl?: string;
}

export const campusApi = {
  getLocations: (params?: { category?: string; search?: string; page?: number; limit?: number }) =>
    apiClient
      .get<{ success: boolean; data: LocationListResponse }>('/campus/locations', { params })
      .then((r) => r.data.data),

  getLocationBySlug: (slug: string) =>
    apiClient
      .get<{ success: boolean; data: CampusLocation }>(`/campus/locations/${slug}`)
      .then((r) => r.data.data),

  getCategories: () =>
    apiClient
      .get<{ success: boolean; data: CategoryOption[] }>('/campus/categories')
      .then((r) => r.data.data),

  // Admin
  adminGetLocations: (params?: { category?: string; search?: string; page?: number; limit?: number }) =>
    apiClient
      .get<{ success: boolean; data: LocationListResponse }>('/campus/admin/locations', { params })
      .then((r) => r.data.data),

  adminCreateLocation: (data: CreateLocationInput) =>
    apiClient
      .post<{ success: boolean; data: CampusLocation }>('/campus/admin/locations', data)
      .then((r) => r.data.data),

  adminUpdateLocation: (id: string, data: Partial<CreateLocationInput> & { isActive?: boolean }) =>
    apiClient
      .patch<{ success: boolean; data: CampusLocation }>(`/campus/admin/locations/${id}`, data)
      .then((r) => r.data.data),

  adminDeleteLocation: (id: string) =>
    apiClient
      .delete<{ success: boolean; message: string }>(`/campus/admin/locations/${id}`)
      .then((r) => r.data),
};
