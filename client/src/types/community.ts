export type CommunityCategory =
  | 'CYBERSECURITY'
  | 'SOFTWARE_ENGINEERING'
  | 'AI_ML'
  | 'DATA_SCIENCE'
  | 'NETWORKING'
  | 'UI_UX'
  | 'GRAPHICS'
  | 'ROBOTICS'
  | 'ENTREPRENEURSHIP'
  | 'OPEN_SOURCE'
  | 'ACADEMIC'
  | 'OTHER';

export type CommunityVisibility = 'PUBLIC' | 'FCI_ONLY' | 'PRIVATE';
export type CommunityStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

export type CommunityMemberRole = 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
export type CommunityMembershipStatus = 'ACTIVE' | 'PENDING' | 'BANNED' | 'LEFT';

export type CommunityResourceType =
  | 'ARTICLE'
  | 'VIDEO'
  | 'COURSE'
  | 'DOCUMENTATION'
  | 'PROJECT'
  | 'BOOK'
  | 'CODE_REPOSITORY'
  | 'OTHER';

export interface CommunityLeadership {
  id: string;
  userId: string;
  role: CommunityMemberRole;
  fullName?: string;
  username?: string;
  avatarUrl?: string | null;
  department?: string;
}

export interface UserCommunityMembership {
  id: string;
  role: CommunityMemberRole;
  status: CommunityMembershipStatus;
  joinedAt: string;
  isMember: boolean;
  isManager: boolean;
}

export interface CommunityItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: CommunityCategory;
  logo: string | null;
  coverImage: string | null;
  visibility: CommunityVisibility;
  status: CommunityStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    profile?: {
      fullName: string;
      username: string;
      avatarUrl?: string | null;
      department?: string;
    } | null;
  };
  _count: {
    members: number;
    posts: number;
    projects: number;
    events: number;
    resources: number;
  };
  isMember?: boolean;
  memberRole?: CommunityMemberRole | null;
}

export interface CommunityDetail extends CommunityItem {
  leadership: CommunityLeadership[];
  memberCount: number;
  postCount: number;
  projectCount: number;
  eventCount: number;
  resourceCount: number;
  userMembership: UserCommunityMembership | null;
}

export interface CommunityMemberItem {
  id: string;
  userId: string;
  role: CommunityMemberRole;
  status: CommunityMembershipStatus;
  joinedAt: string;
  user: {
    id: string;
    profile?: {
      fullName: string;
      username: string;
      avatarUrl?: string | null;
      department?: string;
      level?: string;
    } | null;
  };
}

export interface CommunityPostCommentItem {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    profile?: {
      fullName: string;
      username: string;
      avatarUrl?: string | null;
      department?: string;
    } | null;
  };
}

export interface CommunityPostItem {
  id: string;
  communityId: string;
  authorId: string;
  title: string;
  content: string;
  isAnnouncement: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    profile?: {
      fullName: string;
      username: string;
      avatarUrl?: string | null;
      department?: string;
    } | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
  isLiked?: boolean;
}

export interface CommunityResourceItem {
  id: string;
  communityId: string;
  title: string;
  description?: string | null;
  url: string;
  type: CommunityResourceType;
  createdAt: string;
  creator: {
    id: string;
    profile?: {
      fullName: string;
      username: string;
      avatarUrl?: string | null;
    } | null;
  };
}

export interface CommunityProjectItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  githubUrl?: string | null;
  liveUrl?: string | null;
  author: {
    id: string;
    profile?: {
      fullName: string;
      username: string;
      avatarUrl?: string | null;
    } | null;
  };
  collaborators: {
    user: {
      id: string;
      profile?: {
        fullName: string;
        username: string;
        avatarUrl?: string | null;
      } | null;
    };
  }[];
}

export interface CommunityEventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  eventType: string;
  date: string;
  location?: string | null;
  organizer: {
    id: string;
    profile?: {
      fullName: string;
      username: string;
      avatarUrl?: string | null;
    } | null;
  };
  _count: {
    registrations: number;
  };
}

export interface CreateCommunityPayload {
  name: string;
  slug?: string;
  description: string;
  category: CommunityCategory;
  logo?: string;
  coverImage?: string;
  visibility?: CommunityVisibility;
}

export interface UpdateCommunityPayload {
  name?: string;
  description?: string;
  category?: CommunityCategory;
  logo?: string;
  coverImage?: string;
  visibility?: CommunityVisibility;
  status?: CommunityStatus;
}

export interface CreateCommunityPostPayload {
  title: string;
  content: string;
  isAnnouncement?: boolean;
  isPinned?: boolean;
}

export interface CreateCommunityResourcePayload {
  title: string;
  description?: string;
  url: string;
  type: CommunityResourceType;
}
