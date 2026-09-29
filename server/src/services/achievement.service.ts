import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';
import { AchievementCategory, AchievementVerificationStatus } from '@prisma/client';

export interface LevelInfo {
  currentLevel: string;
  badgeIcon: string;
  description: string;
  points: number;
  nextLevel: string | null;
  pointsForNextLevel: number | null;
  progressPercentage: number;
}

export const DEFAULT_ACHIEVEMENTS = [
  // ── ACADEMIC ──────────────────────────────────────────────────────────
  {
    name: 'Profile Completed',
    slug: 'profile-completed',
    category: AchievementCategory.ACADEMIC,
    description: 'Filled out student bio, department, level, avatar, and matric number completely.',
    badgeIcon: 'UserCheck',
    points: 50,
    criteria: 'Reach 100% profile completeness by providing all academic and bio credentials.',
  },
  {
    name: 'Research Contributor',
    slug: 'research-contributor',
    category: AchievementCategory.ACADEMIC,
    description: 'Contributed to departmental academic papers, technical research, or faculty journals.',
    badgeIcon: 'BookOpen',
    points: 150,
    criteria: 'Author or co-author an academic computing or informatics paper or departmental case study.',
  },
  {
    name: 'Technical Presentation',
    slug: 'technical-presentation',
    category: AchievementCategory.ACADEMIC,
    description: 'Delivered an oral presentation, defense, or technical seminar to peers or faculty.',
    badgeIcon: 'Presentation',
    points: 100,
    criteria: 'Present a technical topic at a departmental symposium or student tech workshop.',
  },
  {
    name: 'Certification Earned',
    slug: 'certification-earned',
    category: AchievementCategory.ACADEMIC,
    description: 'Earned a recognized industry certification in Cloud, Cybersecurity, AI, or Software.',
    badgeIcon: 'Award',
    points: 120,
    criteria: 'Attain an accredited professional certification (e.g. AWS, CompTIA, Cisco, Oracle, Azure).',
  },

  // ── TECHNICAL ─────────────────────────────────────────────────────────
  {
    name: 'First Project Published',
    slug: 'first-project',
    category: AchievementCategory.TECHNICAL,
    description: 'Published your first computing project showcase on CUSTECH FCI Connect.',
    badgeIcon: 'Rocket',
    points: 100,
    criteria: 'Publish at least one verified software, hardware, or research project showcase.',
  },
  {
    name: 'Project Contributor',
    slug: 'project-contributor',
    category: AchievementCategory.TECHNICAL,
    description: 'Collaborated and actively contributed code or assets to another student project team.',
    badgeIcon: 'GitPullRequest',
    points: 80,
    criteria: 'Be an approved member of a project team and deliver project features.',
  },
  {
    name: 'GitHub Contributor',
    slug: 'github-contributor',
    category: AchievementCategory.TECHNICAL,
    description: 'Connected a verified public GitHub profile with active commit history.',
    badgeIcon: 'Github',
    points: 90,
    criteria: 'Link your active GitHub profile demonstrating regular version-controlled code.',
  },
  {
    name: 'Open Source Contributor',
    slug: 'open-source-contributor',
    category: AchievementCategory.TECHNICAL,
    description: 'Contributed code, bug fixes, or documentation to public open-source software.',
    badgeIcon: 'Share2',
    points: 150,
    criteria: 'Have a pull request merged into a recognized open-source repository.',
  },
  {
    name: 'Hackathon Participant',
    slug: 'hackathon-participant',
    category: AchievementCategory.TECHNICAL,
    description: 'Participated in a CUSTECH or national hackathon competition.',
    badgeIcon: 'Cpu',
    points: 100,
    criteria: 'Register and compete in an approved FCI hackathon or coding sprint.',
  },
  {
    name: 'Hackathon Finalist',
    slug: 'hackathon-finalist',
    category: AchievementCategory.TECHNICAL,
    description: 'Placed as a top finalist or winner in an official tech hackathon.',
    badgeIcon: 'Trophy',
    points: 250,
    criteria: 'Qualify as a finalist or podium finisher in an accredited tech hackathon.',
  },

  // ── COMMUNITY ─────────────────────────────────────────────────────────
  {
    name: 'Event Volunteer',
    slug: 'event-volunteer',
    category: AchievementCategory.COMMUNITY,
    description: 'Volunteered time and effort to organize or support a CUSTECH FCI event.',
    badgeIcon: 'HeartHandshake',
    points: 75,
    criteria: 'Serve as an official student volunteer coordinator for a faculty conference or seminar.',
  },
  {
    name: 'Community Contributor',
    slug: 'community-contributor',
    category: AchievementCategory.COMMUNITY,
    description: 'Provided exemplary support, peer reviews, or assistance to fellow students.',
    badgeIcon: 'Users',
    points: 100,
    criteria: 'Receive positive peer recommendations or assist 5+ peers in academic computing labs.',
  },
  {
    name: 'Peer Mentor',
    slug: 'peer-mentor',
    category: AchievementCategory.COMMUNITY,
    description: 'Mentored 100L or 200L junior students in programming, computing, or coursework.',
    badgeIcon: 'GraduationCap',
    points: 120,
    criteria: 'Officially guide junior computing students across a full academic semester.',
  },

  // ── CAREER ────────────────────────────────────────────────────────────
  {
    name: 'Internship Completed',
    slug: 'internship-completed',
    category: AchievementCategory.CAREER,
    description: 'Successfully completed SIWES, SWEP, or a verified industry internship in tech.',
    badgeIcon: 'Briefcase',
    points: 200,
    criteria: 'Submit completion letter or supervisor sign-off from an IT or engineering organization.',
  },
  {
    name: 'Opportunity Completed',
    slug: 'opportunity-completed',
    category: AchievementCategory.CAREER,
    description: 'Completed a verified opportunity discovered via the FCI Opportunity Hub.',
    badgeIcon: 'CheckCircle2',
    points: 150,
    criteria: 'Apply, participate, and graduate from an opportunity listed in the Opportunity Hub.',
  },

  // ── FCI_CONNECT ───────────────────────────────────────────────────────
  {
    name: 'FCI Connect Pioneer',
    slug: 'fci-pioneer',
    category: AchievementCategory.FCI_CONNECT,
    description: 'Early adopter and founding student member of the CUSTECH FCI Connect digital platform.',
    badgeIcon: 'Sparkles',
    points: 50,
    criteria: 'Join and maintain an active verified profile during the foundation academic sessions.',
  },
  {
    name: 'Skill Graph Master',
    slug: 'skill-graph-master',
    category: AchievementCategory.FCI_CONNECT,
    description: 'Added 5 or more verified technical skills with proficiency ratings on the Skill Graph.',
    badgeIcon: 'Network',
    points: 100,
    criteria: 'Populate your interactive Skill Graph with at least 5 tech proficiencies.',
  },
  {
    name: 'Active Networker',
    slug: 'active-networker',
    category: AchievementCategory.FCI_CONNECT,
    description: 'Connected with 10+ students across different departments in the Faculty of Computing.',
    badgeIcon: 'UserPlus',
    points: 60,
    criteria: 'Form 10 verified student connections across Computer Science, Cyber, Software, etc.',
  },
];

export const DEFAULT_LEVELS = [
  { levelName: 'Explorer', minPoints: 0, badgeIcon: 'Compass', description: 'Beginning the computing journey at CUSTECH.', orderIndex: 1 },
  { levelName: 'Contributor', minPoints: 150, badgeIcon: 'Sparkles', description: 'Active contributor to faculty discussions and projects.', orderIndex: 2 },
  { levelName: 'Builder', minPoints: 400, badgeIcon: 'Hammer', description: 'Proactive builder of software, projects, and teams.', orderIndex: 3 },
  { levelName: 'Innovator', minPoints: 800, badgeIcon: 'Lightbulb', description: 'Innovative leader delivering impact and technical excellence.', orderIndex: 4 },
  { levelName: 'FCI Leader', minPoints: 1500, badgeIcon: 'Crown', description: 'Faculty vanguard, mentor, and pinnacle of student achievement.', orderIndex: 5 },
];

export class AchievementService {
  /**
   * Automatically seed default achievements and levels if not already created
   */
  static async seedDefaultsIfNeeded(): Promise<void> {
    try {
      const achievementCount = await prisma.achievement.count();
      if (achievementCount === 0) {
        for (const item of DEFAULT_ACHIEVEMENTS) {
          await prisma.achievement.create({
            data: {
              name: item.name,
              slug: item.slug,
              category: item.category,
              description: item.description,
              badgeIcon: item.badgeIcon,
              points: item.points,
              criteria: item.criteria,
              isActive: true,
            },
          });
        }
      }

      const levelCount = await prisma.reputationLevelConfig.count();
      if (levelCount === 0) {
        for (const lvl of DEFAULT_LEVELS) {
          await prisma.reputationLevelConfig.create({
            data: {
              levelName: lvl.levelName,
              minPoints: lvl.minPoints,
              badgeIcon: lvl.badgeIcon,
              description: lvl.description,
              orderIndex: lvl.orderIndex,
            },
          });
        }
      }
    } catch (error) {
      console.warn('Achievement default seeding skipped or table busy:', error);
    }
  }

  /**
   * Calculate student reputation, level, and next milestone from verified ledger
   */
  static async calculateReputation(userId: string): Promise<LevelInfo> {
    // 1. Get sum of points from reputation ledger
    const pointsAgg = await prisma.reputationEvent.aggregate({
      where: { userId },
      _sum: { points: true },
    });

    const totalPoints = pointsAgg._sum.points || 0;

    // 2. Fetch all configured levels sorted by minPoints ascending
    let levels = await prisma.reputationLevelConfig.findMany({
      orderBy: { minPoints: 'asc' },
    });

    if (!levels.length) {
      levels = DEFAULT_LEVELS as any;
    }

    // 3. Determine current level and next level
    let currentLevel = levels[0];
    let nextLevel: (typeof levels)[0] | null = null;

    for (let i = 0; i < levels.length; i++) {
      if (totalPoints >= levels[i].minPoints) {
        currentLevel = levels[i];
        nextLevel = levels[i + 1] || null;
      } else {
        if (!nextLevel) nextLevel = levels[i];
        break;
      }
    }

    let progressPercentage = 100;
    let pointsForNextLevel: number | null = null;

    if (nextLevel) {
      const prevThreshold = currentLevel.minPoints;
      const nextThreshold = nextLevel.minPoints;
      const range = nextThreshold - prevThreshold;
      const progress = totalPoints - prevThreshold;
      progressPercentage = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
      pointsForNextLevel = nextThreshold - totalPoints;
    }

    return {
      currentLevel: currentLevel.levelName,
      badgeIcon: currentLevel.badgeIcon || 'Award',
      description: currentLevel.description || '',
      points: totalPoints,
      nextLevel: nextLevel ? nextLevel.levelName : null,
      pointsForNextLevel,
      progressPercentage,
    };
  }

  /**
   * Safely record a reputation event in the immutable ledger with duplicate protection
   */
  static async recordReputationEvent(
    userId: string,
    eventType: string,
    points: number,
    referenceType?: string,
    referenceId?: string,
    description?: string,
  ): Promise<boolean> {
    if (points <= 0) return false;

    // Check if this reference was already rewarded to prevent spam / duplicate farming
    if (referenceType && referenceId) {
      const existing = await prisma.reputationEvent.findFirst({
        where: {
          userId,
          eventType,
          referenceType,
          referenceId,
        },
      });
      if (existing) {
        return false; // Already credited
      }
    }

    // 1. Create reputation event
    await prisma.reputationEvent.create({
      data: {
        userId,
        eventType,
        points,
        referenceType,
        referenceId,
        description: description || `Points awarded for ${eventType}`,
      },
    });

    // 2. Synchronize user profile community points
    await prisma.profile.updateMany({
      where: { userId },
      data: {
        communityPoints: { increment: points },
      },
    });

    // 3. Create student notification
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: 'ACHIEVEMENT_UNLOCKED',
          title: `+${points} Reputation Points Earned!`,
          message: description || `You received ${points} reputation points for ${eventType}.`,
          entityType: referenceType || 'REPUTATION',
          entityId: referenceId || undefined,
        },
      });
    } catch {
      // Notification is non-blocking
    }

    return true;
  }

  /**
   * Get all active platform achievements
   */
  static async getAllAchievements(category?: AchievementCategory) {
    await this.seedDefaultsIfNeeded();

    const where: any = { isActive: true };
    if (category) {
      where.category = category;
    }

    return prisma.achievement.findMany({
      where,
      orderBy: [{ points: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Get user achievements with verification status and metadata
   */
  static async getUserAchievements(userId: string) {
    await this.seedDefaultsIfNeeded();

    const [userAchievements, allAchievements, reputation] = await Promise.all([
      prisma.userAchievement.findMany({
        where: { userId },
        include: {
          achievement: true,
          verifiedBy: {
            select: {
              id: true,
              profile: {
                select: { fullName: true, username: true },
              },
            },
          },
        },
        orderBy: { earnedAt: 'desc' },
      }),
      prisma.achievement.findMany({
        where: { isActive: true },
        orderBy: { points: 'asc' },
      }),
      this.calculateReputation(userId),
    ]);

    const earnedMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua]));

    const catalogWithStatus = allAchievements.map((achievement) => {
      const earned = earnedMap.get(achievement.id);
      return {
        ...achievement,
        isEarned: !!earned,
        status: earned ? earned.status : null,
        earnedAt: earned ? earned.earnedAt : null,
        verifiedAt: earned ? earned.verifiedAt : null,
        evidenceUrl: earned ? earned.evidenceUrl : null,
        evidenceNotes: earned ? earned.evidenceNotes : null,
        issuer: earned ? earned.issuer : null,
        rejectionReason: earned ? earned.rejectionReason : null,
        userAchievementId: earned ? earned.id : null,
      };
    });

    const verifiedCount = userAchievements.filter(
      (ua) => ua.status === AchievementVerificationStatus.VERIFIED,
    ).length;

    const pendingCount = userAchievements.filter(
      (ua) => ua.status === AchievementVerificationStatus.PENDING,
    ).length;

    return {
      reputation,
      stats: {
        totalEarned: userAchievements.length,
        verifiedCount,
        pendingCount,
        totalCatalog: allAchievements.length,
      },
      achievements: catalogWithStatus,
    };
  }

  /**
   * Get public achievements for a student portfolio / profile
   */
  static async getPublicUserAchievements(userId: string) {
    const verified = await prisma.userAchievement.findMany({
      where: {
        userId,
        status: AchievementVerificationStatus.VERIFIED,
      },
      include: {
        achievement: true,
      },
      orderBy: { earnedAt: 'desc' },
    });

    const reputation = await this.calculateReputation(userId);

    return {
      reputation,
      achievements: verified.map((v) => ({
        id: v.achievement.id,
        name: v.achievement.name,
        slug: v.achievement.slug,
        category: v.achievement.category,
        description: v.achievement.description,
        badgeIcon: v.achievement.badgeIcon,
        points: v.achievement.points,
        earnedAt: v.earnedAt,
        issuer: v.issuer,
      })),
    };
  }

  /**
   * Submit student evidence for an achievement requiring verification
   */
  static async submitEvidence(
    userId: string,
    achievementId: string,
    data: { evidenceUrl?: string; evidenceNotes?: string; issuer?: string },
  ) {
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId },
    });

    if (!achievement) {
      throw ApiError.notFound('Achievement not found');
    }

    // Check if already verified
    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId,
        },
      },
    });

    if (existing && existing.status === AchievementVerificationStatus.VERIFIED) {
      throw ApiError.badRequest('You have already unlocked and verified this achievement');
    }

    const record = await prisma.userAchievement.upsert({
      where: {
        userId_achievementId: {
          userId,
          achievementId,
        },
      },
      create: {
        userId,
        achievementId,
        status: AchievementVerificationStatus.PENDING,
        evidenceUrl: data.evidenceUrl?.trim() || null,
        evidenceNotes: data.evidenceNotes?.trim() || null,
        issuer: data.issuer?.trim() || null,
        earnedAt: new Date(),
      },
      update: {
        status: AchievementVerificationStatus.PENDING,
        evidenceUrl: data.evidenceUrl?.trim() || null,
        evidenceNotes: data.evidenceNotes?.trim() || null,
        issuer: data.issuer?.trim() || null,
        rejectionReason: null,
      },
      include: {
        achievement: true,
      },
    });

    return record;
  }

  /**
   * Admin / Moderator reviews and verifies or rejects achievement submission
   */
  static async reviewSubmission(
    userAchievementId: string,
    adminId: string,
    action: 'VERIFY' | 'REJECT',
    notes?: string,
  ) {
    const userAchievement = await prisma.userAchievement.findUnique({
      where: { id: userAchievementId },
      include: { achievement: true },
    });

    if (!userAchievement) {
      throw ApiError.notFound('Achievement submission not found');
    }

    if (action === 'VERIFY') {
      const updated = await prisma.userAchievement.update({
        where: { id: userAchievementId },
        data: {
          status: AchievementVerificationStatus.VERIFIED,
          verifiedAt: new Date(),
          verifiedById: adminId,
          rejectionReason: null,
        },
      });

      // Award points via reputation event ledger
      await this.recordReputationEvent(
        userAchievement.userId,
        `ACHIEVEMENT_VERIFIED`,
        userAchievement.achievement.points,
        'ACHIEVEMENT',
        userAchievement.achievement.id,
        `Achievement Verified: ${userAchievement.achievement.name}`,
      );

      return updated;
    } else {
      const updated = await prisma.userAchievement.update({
        where: { id: userAchievementId },
        data: {
          status: AchievementVerificationStatus.REJECTED,
          verifiedById: adminId,
          rejectionReason: notes || 'Evidence did not meet the required criteria.',
        },
      });

      try {
        await prisma.notification.create({
          data: {
            userId: userAchievement.userId,
            type: 'REPORT_RESOLVED',
            title: `Achievement Submission Update`,
            message: `Your submission for "${userAchievement.achievement.name}" was reviewed. Reason: ${notes || 'Criteria not met'}`,
            entityType: 'ACHIEVEMENT',
            entityId: userAchievement.achievement.id,
          },
        });
      } catch {
        // non-blocking
      }

      return updated;
    }
  }

  /**
   * Automatic Safe Achievement Engine
   * Awards achievement idempotently when legitimate system events happen
   */
  static async awardAutomaticAchievement(
    userId: string,
    slug: string,
    triggerReference?: { type: string; id: string; description?: string },
  ): Promise<boolean> {
    try {
      await this.seedDefaultsIfNeeded();

      const achievement = await prisma.achievement.findUnique({
        where: { slug },
      });

      if (!achievement || !achievement.isActive) {
        return false;
      }

      // Check if already earned
      const existing = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
      });

      if (existing) {
        return false; // Idempotent: already awarded
      }

      // Record UserAchievement as VERIFIED
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          status: AchievementVerificationStatus.VERIFIED,
          earnedAt: new Date(),
          verifiedAt: new Date(),
          issuer: 'CUSTECH FCI Automated Engine',
        },
      });

      // Record in reputation ledger
      await this.recordReputationEvent(
        userId,
        `AUTOMATIC_ACHIEVEMENT`,
        achievement.points,
        triggerReference?.type || 'ACHIEVEMENT',
        triggerReference?.id || achievement.id,
        triggerReference?.description || `Unlocked Achievement: ${achievement.name}`,
      );

      return true;
    } catch (err) {
      console.error(`Error in automatic achievement [${slug}]:`, err);
      return false;
    }
  }

  /**
   * Leaderboard calculation based on verified reputation points with department & level filters
   */
  static async getLeaderboard(params: {
    department?: string;
    level?: string;
    limit?: number;
    page?: number;
  }) {
    const { department, level, limit = 20, page = 1 } = params;
    const take = Math.min(50, Math.max(1, Number(limit)));
    const skip = (Math.max(1, Number(page)) - 1) * take;

    const profileWhere: any = {};
    if (department) {
      profileWhere.department = department;
    }
    if (level) {
      profileWhere.level = level;
    }

    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where: profileWhere,
        select: {
          id: true,
          userId: true,
          username: true,
          fullName: true,
          avatarUrl: true,
          department: true,
          level: true,
          communityPoints: true,
        },
        orderBy: { communityPoints: 'desc' },
        take,
        skip,
      }),
      prisma.profile.count({ where: profileWhere }),
    ]);

    // Attach level badge info
    const levels = await prisma.reputationLevelConfig.findMany({
      orderBy: { minPoints: 'asc' },
    });

    const entries = profiles.map((p, index) => {
      let currentLevelName = 'Explorer';
      for (const lvl of levels) {
        if (p.communityPoints >= lvl.minPoints) {
          currentLevelName = lvl.levelName;
        }
      }

      return {
        rank: skip + index + 1,
        userId: p.userId,
        username: p.username,
        fullName: p.fullName,
        avatarUrl: p.avatarUrl,
        department: p.department,
        level: p.level,
        points: p.communityPoints,
        levelName: currentLevelName,
      };
    });

    return {
      entries,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / take),
    };
  }

  /**
   * Admin: List pending evidence submissions for review
   */
  static async getAdminSubmissions(params: {
    status?: AchievementVerificationStatus;
    page?: number;
    limit?: number;
  }) {
    const { status = AchievementVerificationStatus.PENDING, page = 1, limit = 20 } = params;
    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const [submissions, total] = await Promise.all([
      prisma.userAchievement.findMany({
        where: { status },
        include: {
          achievement: true,
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  fullName: true,
                  username: true,
                  department: true,
                  level: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: { earnedAt: 'asc' },
        take,
        skip,
      }),
      prisma.userAchievement.count({ where: { status } }),
    ]);

    return {
      submissions,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / take),
    };
  }

  /**
   * Admin: Create or edit an achievement
   */
  static async createAchievement(data: {
    name: string;
    slug?: string;
    description: string;
    category: AchievementCategory;
    badgeIcon: string;
    points: number;
    criteria?: string;
  }) {
    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    return prisma.achievement.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        category: data.category,
        badgeIcon: data.badgeIcon,
        points: Number(data.points),
        criteria: data.criteria,
        isActive: true,
      },
    });
  }

  static async updateAchievement(
    id: string,
    data: {
      name?: string;
      description?: string;
      category?: AchievementCategory;
      badgeIcon?: string;
      points?: number;
      criteria?: string;
      isActive?: boolean;
    },
  ) {
    return prisma.achievement.update({
      where: { id },
      data,
    });
  }
}
