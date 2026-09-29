import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';

export const githubController = {
  // ── 1. Connect or Sync GitHub ───────────────────────────────────────────────
  connectGithub: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const { githubUsername } = req.body;

      // Fetch user profile and public repos from GitHub API
      let ghUser: any = null;
      let ghRepos: any[] = [];

      try {
        const [userRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${githubUsername}`, {
            headers: { 'User-Agent': 'CUSTECH-FCI-Connect' },
          }),
          fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=12`, {
            headers: { 'User-Agent': 'CUSTECH-FCI-Connect' },
          }),
        ]);

        if (userRes.status === 404) {
          throw ApiError.badRequest(`GitHub user '${githubUsername}' not found`);
        }

        if (userRes.ok) {
          ghUser = await userRes.json();
        }
        if (reposRes.ok) {
          const rawRepos: any = await reposRes.json();
          ghRepos = (Array.isArray(rawRepos) ? rawRepos : []).map((repo: any) => ({
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            url: repo.html_url,
            updatedAt: repo.updated_at,
          }));
        }
      } catch (err: any) {
        if (err.statusCode || err.status) throw err;
        // Fallback if rate limited or network failure
        ghUser = {
          login: githubUsername,
          avatar_url: `https://avatars.githubusercontent.com/${githubUsername}`,
          bio: 'FCI Student Developer',
          public_repos: 0,
          followers: 0,
          html_url: `https://github.com/${githubUsername}`,
        };
      }

      if (!ghUser) {
        ghUser = {
          login: githubUsername,
          avatar_url: `https://avatars.githubusercontent.com/${githubUsername}`,
          bio: 'FCI Student Developer',
          public_repos: 0,
          followers: 0,
          html_url: `https://github.com/${githubUsername}`,
        };
      }

      const profile = await prisma.userGithubProfile.upsert({
        where: { userId },
        update: {
          githubUsername: ghUser.login,
          avatarUrl: ghUser.avatar_url,
          bio: ghUser.bio || null,
          publicReposCount: ghUser.public_repos || 0,
          followersCount: ghUser.followers || 0,
          profileUrl: ghUser.html_url,
          isConnected: true,
          cachedRepos: ghRepos,
          lastSyncedAt: new Date(),
        },
        create: {
          userId,
          githubUsername: ghUser.login,
          avatarUrl: ghUser.avatar_url,
          bio: ghUser.bio || null,
          publicReposCount: ghUser.public_repos || 0,
          followersCount: ghUser.followers || 0,
          profileUrl: ghUser.html_url,
          isConnected: true,
          cachedRepos: ghRepos,
          lastSyncedAt: new Date(),
        },
      });

      // Also sync githubUrl on the user profile if empty
      await prisma.profile.updateMany({
        where: { userId, githubUrl: null },
        data: { githubUrl: ghUser.html_url },
      });

      res.json({
        success: true,
        message: `GitHub account @${ghUser.login} connected successfully`,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 2. Get GitHub Profile ───────────────────────────────────────────────────
  getGithubProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      let usernameOrUserId = req.params.usernameOrUserId as string;
      if (usernameOrUserId === 'me') {
        const authUserId = req.user?.userId;
        if (!authUserId) return res.json({ success: true, data: null });
        usernameOrUserId = authUserId;
      }

      // Can lookup by userId or username
      let profile = await prisma.userGithubProfile.findFirst({
        where: {
          OR: [
            { userId: usernameOrUserId },
            { user: { profile: { username: usernameOrUserId } } },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              profile: {
                select: { username: true, fullName: true, avatarUrl: true, department: true },
              },
            },
          },
        },
      });

      if (!profile) {
        return res.json({ success: true, data: null });
      }

      res.json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  },

  // ── 3. Update Privacy ───────────────────────────────────────────────────────
  updatePrivacy: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const { showOnProfile, showRepositories, showActivity } = req.body;

      const profile = await prisma.userGithubProfile.update({
        where: { userId },
        data: {
          showOnProfile: showOnProfile !== undefined ? showOnProfile : undefined,
          showRepositories: showRepositories !== undefined ? showRepositories : undefined,
          showActivity: showActivity !== undefined ? showActivity : undefined,
        },
      });

      res.json({ success: true, message: 'GitHub privacy preferences updated', data: profile });
    } catch (error) {
      next(error);
    }
  },

  // ── 4. Disconnect GitHub ────────────────────────────────────────────────────
  disconnectGithub: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      await prisma.userGithubProfile.deleteMany({ where: { userId } });
      res.json({ success: true, message: 'GitHub disconnected' });
    } catch (error) {
      next(error);
    }
  },
};
