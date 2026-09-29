// ── AI Team Builder Domain Types ──────────────────────────────────────────

import { SkillProficiency, SkillCategory } from './skills';

export type SkillPriority = 'REQUIRED' | 'PREFERRED';

export type TeamInvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';

export interface ProjectRequirementInput {
  skillId?: string;
  skillName: string;
  category?: SkillCategory;
  priority: SkillPriority;
  minProficiency?: SkillProficiency;
}

export interface AnalyzeProjectRequest {
  title?: string;
  projectTitle?: string;
  description: string;
}

export interface ExtractedRequirement {
  name: string;
  category?: SkillCategory;
  priority: SkillPriority;
  reason?: string;
}

export interface AnalyzeProjectResponse {
  title?: string;
  projectTitle?: string;
  summary?: string;
  requiredSkills: ExtractedRequirement[];
  detectedSkills?: Array<{
    id: string;
    name: string;
    slug: string;
    category: SkillCategory;
  }>;
  suggestedRoles: string[];
  recommendedTeamSize?: number;
}

export interface FindMatchesRequest {
  projectTitle: string;
  title?: string;
  description?: string;
  targetRoles?: string[];
  skills?: Array<{
    skillId?: string;
    skillName: string;
    priority: SkillPriority;
    minProficiency?: SkillProficiency;
  }>;
  requiredSkills?: string[];
  preferredSkills?: string[];
  department?: string;
  preferredDepartment?: string;
  minMatchScore?: number;
  limit?: number;
}

export interface CandidateStudent {
  id: string;
  fullName: string;
  matricNumber?: string;
  department?: string;
  level?: string | number;
  avatarUrl?: string;
  bio?: string;
  isAvailable?: boolean;
}

export interface MatchedSkillInfo {
  name: string;
  proficiency: SkillProficiency;
  isPrimary?: boolean;
}

export interface TeamCandidate {
  studentId: string;
  fullName: string;
  username: string;
  avatarUrl?: string | null;
  department?: string;
  level?: string | number;
  communityPoints?: number;
  githubUrl?: string;
  matchPercentage: number;
  bestFitRole: string;
  matchedRequired: MatchedSkillInfo[];
  matchedPreferred: MatchedSkillInfo[];
  missingRequired: string[];
  explanationPoints: string[];
  projectsCount?: number;
  allSkills?: Array<{
    name: string;
    proficiency: SkillProficiency;
    category?: SkillCategory;
    isPrimary?: boolean;
  }>;
}

export interface FindMatchesResponse {
  totalEvaluated: number;
  candidates: TeamCandidate[];
}

export interface TeamInvitation {
  id: string;
  projectId?: string;
  project?: {
    id: string;
    title: string;
    description?: string;
  };
  senderId: string;
  sender: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    department?: string;
  };
  receiverId?: string;
  recipientId?: string;
  receiver?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    department?: string;
  };
  recipient?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    department?: string;
  };
  role: string;
  message?: string;
  status: TeamInvitationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InvitationsResponse {
  received: TeamInvitation[];
  sent: TeamInvitation[];
}

export interface SendInvitationRequest {
  receiverId?: string;
  recipientId?: string;
  role: string;
  message?: string;
  projectTitle?: string;
  projectId?: string;
}

export interface RespondInvitationRequest {
  status: 'ACCEPTED' | 'DECLINED';
}
