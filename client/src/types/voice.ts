export type VoicePollStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
export type VoiceSuggestionStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'DECLINED';

export interface PollOption {
  id: string;
  text: string;
}

export interface VoicePoll {
  id: string;
  question: string;
  title?: string;
  description?: string | null;
  options: PollOption[];
  startDate?: string | null;
  endDate?: string | null;
  visibility: string;
  category?: string;
  status: VoicePollStatus;
  createdById: string;
  isAnonymous: boolean;
  totalVotes: number;
  votes?: Array<{ optionIndex: number }>;
  userVoteIndex?: number | null;
  hasVoted?: boolean;
  createdAt: string;
  userVotedOption?: number | null;
  voteBreakdown?: Record<number, number>;
  creator?: {
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
    } | null;
  };
}

export interface VoiceSuggestion {
  id: string;
  authorId: string;
  title: string;
  description: string;
  category: string;
  status: VoiceSuggestionStatus;
  adminResponse?: string | null;
  respondedAt?: string | null;
  isAnonymous: boolean;
  upvotesCount: number;
  isUpvoted?: boolean;
  createdAt: string;
  user?: {
    id: string;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
      department?: string | null;
    } | null;
  };
  author?: {
    id: string;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
      department?: string | null;
    } | null;
  };
}
