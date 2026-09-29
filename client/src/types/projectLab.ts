export type LabProjectVisibility = 'PUBLIC' | 'FCI_ONLY' | 'PRIVATE';
export type LabProjectStatus = 'IDEA' | 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
export type LabTeamRole =
  | 'PROJECT_LEAD'
  | 'DEVELOPER'
  | 'DESIGNER'
  | 'CYBERSECURITY'
  | 'RESEARCHER'
  | 'DATA_SCIENTIST'
  | 'DOCUMENTATION'
  | 'QA_TESTER'
  | 'OTHER';
export type LabMemberStatus = 'INVITED' | 'ACTIVE' | 'DECLINED';
export type LabTaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type LabTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type LabMilestoneStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';

export interface LabProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: LabTeamRole;
  status: LabMemberStatus;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
      department?: string | null;
      level?: string | null;
    } | null;
  };
}

export interface LabProjectTask {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  status: LabTaskStatus;
  priority: LabTaskPriority;
  dueDate?: string | null;
  position: number;
  creatorId: string;
  assigneeId?: string | null;
  creator: {
    id: string;
    profile?: { fullName: string; avatarUrl?: string | null } | null;
  };
  assignee?: {
    id: string;
    profile?: { fullName: string; avatarUrl?: string | null } | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface LabProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  status: LabMilestoneStatus;
  position: number;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LabProjectDiscussion {
  id: string;
  projectId: string;
  userId?: string;
  parentId?: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    profile?: { fullName: string; avatarUrl?: string | null; department?: string | null } | null;
  };
  author?: {
    id: string;
    profile?: { fullName: string; avatarUrl?: string | null; department?: string | null } | null;
  };
  replies?: LabProjectDiscussion[];
}

export interface LabProjectResource {
  id: string;
  projectId: string;
  title: string;
  url: string;
  type: string;
  description?: string | null;
  learningResourceId?: string | null;
  createdAt: string;
}

export interface LabProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  problemStatement?: string | null;
  objectives?: string | null;
  department?: string | null;
  visibility: LabProjectVisibility;
  status: LabProjectStatus;
  progress?: number;
  startDate?: string | null;
  targetDate?: string | null;
  completedAt?: string | null;
  githubUrl?: string | null;
  liveDemoUrl?: string | null;
  documentationUrl?: string | null;
  coverImage?: string | null;
  createdById: string;
  mentorId?: string | null;
  opportunityId?: string | null;
  showcaseProjectId?: string | null;
  showcaseProject?: {
    id: string;
    slug: string;
    title: string;
    status: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
      department?: string | null;
    } | null;
  };
  mentor?: {
    id: string;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
    } | null;
  } | null;
  opportunity?: {
    id: string;
    title: string;
    organization: string;
    category: string;
    type?: string;
  } | null;
  members?: LabProjectMember[];
  tasks?: LabProjectTask[];
  milestones?: LabProjectMilestone[];
  discussions?: LabProjectDiscussion[];
  resources?: LabProjectResource[];
  _count?: {
    members: number;
    tasks: number;
    milestones: number;
    discussions: number;
    resources: number;
  };
}
