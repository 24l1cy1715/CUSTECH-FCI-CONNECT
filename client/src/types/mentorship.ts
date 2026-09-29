export type MentorshipSessionFormat = 'CHAT' | 'VIDEO' | 'IN_PERSON' | 'MIXED';

export type MentorshipStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'ENDED';

export type MentorshipGoalStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export type MentorshipSessionStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export type MentorshipResourceType =
  | 'ARTICLE'
  | 'VIDEO'
  | 'COURSE'
  | 'DOCUMENTATION'
  | 'PROJECT'
  | 'BOOK'
  | 'OTHER';

export interface MentorMatchExplanation {
  matchedSkills: string[];
  matchedInterests: string[];
  reasons: string[];
}

export interface MentorProfileItem {
  id: string;
  userId: string;
  headline: string;
  bio: string;
  areas: string[];
  availability: string;
  languages: string[];
  maxMentees: number;
  sessionFormat: MentorshipSessionFormat;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    profile?: {
      fullName: string;
      username: string;
      avatarUrl?: string | null;
      department?: string;
      level?: string;
      bio?: string | null;
      skills?: { skill: { name: string; category?: string }; proficiency: string }[];
    } | null;
  };
  skills?: { name: string; proficiency: string; category?: string }[];
  activeMenteeCount: number;
  availableCapacity: number;
  matchScore?: number;
  matchExplanation?: MentorMatchExplanation;
}

export interface MentorshipRelationshipItem {
  id: string;
  mentorId: string;
  menteeId: string;
  goal: string;
  status: MentorshipStatus;
  startedAt?: string | null;
  endedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  mentor: {
    id: string;
    profile?: {
      fullName: string;
      username: string;
      avatarUrl?: string | null;
      department?: string;
      level?: string;
    } | null;
    mentorProfile?: {
      headline: string;
      sessionFormat: MentorshipSessionFormat;
      availability: string;
    } | null;
  };
  mentee: {
    id: string;
    profile?: {
      fullName: string;
      username: string;
      avatarUrl?: string | null;
      department?: string;
      level?: string;
    } | null;
  };
  goals: MentorshipGoalItem[];
  sessions: MentorshipSessionItem[];
  resources: MentorshipResourceItem[];
}

export interface MentorshipGoalItem {
  id: string;
  mentorshipId: string;
  title: string;
  target?: string | null;
  progress: number;
  status: MentorshipGoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MentorshipSessionItem {
  id: string;
  mentorshipId: string;
  title: string;
  description?: string | null;
  scheduledAt: string;
  duration: number;
  meetingUrl?: string | null;
  status: MentorshipSessionStatus;
  createdAt: string;
}

export interface MentorshipResourceItem {
  id: string;
  mentorshipId: string;
  title: string;
  description?: string | null;
  url: string;
  type: MentorshipResourceType;
  createdBy: string;
  createdAt: string;
}

export interface MentorshipDashboardData {
  asMentee: MentorshipRelationshipItem[];
  asMentor: MentorshipRelationshipItem[];
  pendingRequestsReceived: MentorshipRelationshipItem[];
  pendingRequestsSent: MentorshipRelationshipItem[];
  mentorProfile: MentorProfileItem | null;
  stats: {
    activeMenteesCount: number;
    activeMentorsCount: number;
    completedGoalsCount: number;
    totalGoalsCount: number;
  };
}

export interface SaveMentorProfilePayload {
  headline: string;
  bio: string;
  areas: string[];
  availability: string;
  languages?: string[];
  maxMentees?: number;
  sessionFormat?: MentorshipSessionFormat;
  isAvailable?: boolean;
}

export interface RequestMentorshipPayload {
  mentorId: string;
  goal: string;
}

export interface CreateMentorshipGoalPayload {
  title: string;
  target?: string;
  progress?: number;
  status?: MentorshipGoalStatus;
}

export interface UpdateMentorshipGoalPayload {
  title?: string;
  target?: string;
  progress?: number;
  status?: MentorshipGoalStatus;
}

export interface CreateMentorshipSessionPayload {
  title: string;
  description?: string;
  scheduledAt: string;
  duration?: number;
  meetingUrl?: string;
}

export interface CreateMentorshipResourcePayload {
  title: string;
  description?: string;
  url: string;
  type: MentorshipResourceType;
}
