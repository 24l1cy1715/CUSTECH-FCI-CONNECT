export interface GithubRepo {
  id: number;
  name: string;
  fullName: string;
  description?: string | null;
  language?: string | null;
  stars: number;
  forks: number;
  url: string;
  htmlUrl?: string;
  updatedAt: string;
}

export type GithubRepository = GithubRepo;

export interface UserGithubProfile {
  id: string;
  userId: string;
  githubUsername: string;
  avatarUrl?: string | null;
  bio?: string | null;
  publicReposCount: number;
  followersCount: number;
  followingCount?: number;
  profileUrl?: string | null;
  htmlUrl?: string | null;
  isConnected: boolean;
  showOnProfile: boolean;
  showRepositories: boolean;
  showRepos?: boolean;
  showActivity: boolean;
  showContributions?: boolean;
  cachedRepos?: GithubRepo[] | null;
  lastSyncedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    profile?: {
      username: string;
      fullName: string;
      avatarUrl?: string | null;
      department?: string | null;
    } | null;
  };
}
