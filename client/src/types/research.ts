export type ResearchStatus =
  | 'IDEA'
  | 'PROPOSAL'
  | 'PLANNING'
  | 'IN_PROGRESS'
  | 'UNDER_REVIEW'
  | 'COMPLETED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export type ResearchVisibility = 'PUBLIC' | 'FCI_ONLY' | 'PRIVATE';

export type ResearchMemberRole =
  | 'LEAD'
  | 'RESEARCHER'
  | 'DEVELOPER'
  | 'DATA_ANALYST'
  | 'WRITER'
  | 'DESIGNER'
  | 'ASSISTANT'
  | 'OTHER';

export interface ResearchMember {
  id: string;
  researchProjectId: string;
  userId: string;
  role: ResearchMemberRole;
  status: string;
  joinedAt: string;
  user: {
    id: string;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
      department?: string | null;
    } | null;
  };
}

export interface ResearchPublication {
  id: string;
  researchProjectId: string;
  title: string;
  authors: string;
  abstract?: string | null;
  publicationDate?: string | null;
  journalOrConference?: string | null;
  doi?: string | null;
  paperUrl?: string | null;
  repositoryUrl?: string | null;
  createdAt: string;
}

export interface ResearchProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  abstract?: string | null;
  problemStatement?: string | null;
  objectives?: string | null;
  methodology?: string | null;
  category: string;
  department?: string | null;
  researchStatus: ResearchStatus;
  visibility: ResearchVisibility;
  ownerId: string;
  mentorId?: string | null;
  startDate?: string | null;
  targetDate?: string | null;
  githubUrl?: string | null;
  paperUrl?: string | null;
  datasetUrl?: string | null;
  publicationUrl?: string | null;
  coverImage?: string | null;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
      department?: string | null;
      matricId?: string | null;
    } | null;
  };
  mentor?: {
    id: string;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
    } | null;
  } | null;
  members?: ResearchMember[];
  publications?: ResearchPublication[];
  _count?: {
    members: number;
    publications: number;
  };
}

export interface ResearchIdea {
  id: string;
  authorId: string;
  title: string;
  description: string;
  category: string;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
      department?: string | null;
    } | null;
  };
  likes?: { userId: string }[];
  _count?: {
    comments: number;
    likes: number;
  };
}
