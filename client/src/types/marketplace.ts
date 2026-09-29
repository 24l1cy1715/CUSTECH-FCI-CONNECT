export type ServicePricingType = 'FIXED' | 'HOURLY' | 'NEGOTIABLE' | 'CONTACT_FOR_PRICE';
export type ServiceStatus = 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'ARCHIVED';
export type InquiryStatus = 'NEW' | 'IN_DISCUSSION' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED';

export interface MarketplaceService {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  skills?: string[] | string | null;
  ownerId: string;
  pricingType: ServicePricingType;
  startingPrice?: number | null;
  deliveryDays?: number | null;
  deliveryTimeDays?: number | null;
  status: ServiceStatus;
  coverImage?: string | null;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    email?: string;
    profile?: {
      username: string;
      fullName: string;
      avatarUrl?: string | null;
      department?: string | null;
      bio?: string | null;
      githubUrl?: string | null;
      portfolioUrl?: string | null;
    } | null;
  };
  _count?: {
    inquiries: number;
  };
}

export interface MarketplaceInquiry {
  id: string;
  serviceId: string;
  clientId: string;
  message: string;
  requirements?: string | null;
  budget?: number | null;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    email?: string;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
    } | null;
  };
  service?: {
    id: string;
    title: string;
    slug: string;
    owner?: {
      profile?: {
        fullName: string;
        avatarUrl?: string | null;
      } | null;
    };
  };
  client?: {
    id: string;
    email: string;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
    } | null;
  };
}
