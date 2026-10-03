import { prisma } from '../config/prisma';
import { ActivityType, ActivityVisibility, Prisma } from '@prisma/client';

export interface CreateActivityInput {
  actorId: string;
  type: ActivityType;
  entityType: string;
  entityId?: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  imageUrl?: string;
  visibility?: ActivityVisibility;
}

// ── Create a new activity event ───────────────────────────────────────────────
export async function createActivity(input: CreateActivityInput) {
  return prisma.activityFeed.create({
    data: {
      actorId: input.actorId,
      type: input.type,
      entityType: input.entityType,
      entityId: input.entityId,
      title: input.title,
      description: input.description,
      metadata: input.metadata
        ? typeof input.metadata === 'string'
          ? input.metadata
          : JSON.stringify(input.metadata)
        : null,
      imageUrl: input.imageUrl,
      visibility: input.visibility ?? ActivityVisibility.PUBLIC,
    },
  });
}

// ── Fetch public activity feed (paginated) ────────────────────────────────────
export async function getActivityFeed(params: {
  type?: ActivityType;
  page?: number;
  limit?: number;
  viewerUserId?: string;
  department?: string;
}) {
  const { type, page = 1, limit = 20, viewerUserId } = params;

  const where: Prisma.ActivityFeedWhereInput = {
    visibility: viewerUserId ? undefined : ActivityVisibility.PUBLIC,
    ...(type ? { type } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.activityFeed.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        actor: {
          select: {
            id: true,
            profile: {
              select: {
                username: true,
                fullName: true,
                avatarUrl: true,
                department: true,
              },
            },
          },
        },
      },
    }),
    prisma.activityFeed.count({ where }),
  ]);

  return {
    items: items.map((item) => ({
      id: item.id,
      type: item.type,
      entityType: item.entityType,
      entityId: item.entityId,
      title: item.title,
      description: item.description,
      metadata: item.metadata,
      imageUrl: item.imageUrl,
      visibility: item.visibility,
      createdAt: item.createdAt,
      actor: {
        id: item.actor.id,
        username: item.actor.profile?.username,
        fullName: item.actor.profile?.fullName,
        avatarUrl: item.actor.profile?.avatarUrl,
        department: item.actor.profile?.department,
      },
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
  };
}

export async function getActivityById(id: string, viewerUserId?: string) {
  const visibilityFilter: ActivityVisibility[] = viewerUserId
    ? [ActivityVisibility.PUBLIC, ActivityVisibility.FCI_ONLY]
    : [ActivityVisibility.PUBLIC];

  const item = await prisma.activityFeed.findFirst({
    where: { id, visibility: { in: visibilityFilter } },
    include: {
      actor: {
        select: {
          id: true,
          profile: {
            select: {
              username: true,
              fullName: true,
              avatarUrl: true,
              department: true,
            },
          },
        },
      },
    },
  });

  return item;
}

// ── Convenience trigger functions ─────────────────────────────────────────────
// Called from other controllers after specific events

export async function onProjectPublished(actorId: string, projectId: string, projectTitle: string, imageUrl?: string) {
  return createActivity({
    actorId,
    type: ActivityType.PROJECT_PUBLISHED,
    entityType: 'project',
    entityId: projectId,
    title: `Published a new project: ${projectTitle}`,
    description: 'Check out this exciting new computing project from the FCI community.',
    imageUrl,
    visibility: ActivityVisibility.PUBLIC,
  });
}

export async function onAchievementEarned(actorId: string, achievementId: string, achievementName: string) {
  return createActivity({
    actorId,
    type: ActivityType.ACHIEVEMENT_EARNED,
    entityType: 'achievement',
    entityId: achievementId,
    title: `Earned the achievement: ${achievementName}`,
    description: 'A verified academic or technical achievement was earned on FCI Connect.',
    visibility: ActivityVisibility.PUBLIC,
  });
}

export async function onOpportunityPosted(actorId: string, opportunityId: string, title: string) {
  return createActivity({
    actorId,
    type: ActivityType.OPPORTUNITY_POSTED,
    entityType: 'opportunity',
    entityId: opportunityId,
    title: `New opportunity posted: ${title}`,
    description: 'A new career or academic opportunity is now available on FCI Connect.',
    visibility: ActivityVisibility.PUBLIC,
  });
}

export async function onEventCreated(actorId: string, eventId: string, eventTitle: string) {
  return createActivity({
    actorId,
    type: ActivityType.EVENT_CREATED,
    entityType: 'event',
    entityId: eventId,
    title: `New event: ${eventTitle}`,
    description: 'A new event has been created for the FCI community.',
    visibility: ActivityVisibility.PUBLIC,
  });
}

export async function onNewsPublished(actorId: string, articleId: string, articleTitle: string, imageUrl?: string) {
  return createActivity({
    actorId,
    type: ActivityType.NEWS_PUBLISHED,
    entityType: 'news',
    entityId: articleId,
    title: `FCI News: ${articleTitle}`,
    imageUrl,
    visibility: ActivityVisibility.PUBLIC,
  });
}

export async function onCommunityCreated(actorId: string, communityId: string, communityName: string, logo?: string) {
  return createActivity({
    actorId,
    type: ActivityType.COMMUNITY_CREATED,
    entityType: 'community',
    entityId: communityId,
    title: `New student community established: ${communityName}`,
    description: 'Join this new club on FCI Connect to collaborate, share projects, and learn together.',
    imageUrl: logo,
    visibility: ActivityVisibility.PUBLIC,
  });
}

export async function seedActivityFeed() {
  const count = await prisma.activityFeed.count();
  if (count > 0) return;

  // Find or create an admin/system user to attribute seed activities to
  let user = await prisma.user.findFirst({
    include: { profile: true },
  });

  if (!user) {
    const adminRole = await prisma.role.findFirst({ where: { name: 'ADMIN' } });
    user = await prisma.user.create({
      data: {
        email: 'admin@custech.edu.ng',
        passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890',
        emailVerified: true,
        userRoles: adminRole ? {
          create: [{ roleId: adminRole.id }]
        } : undefined,
        profile: {
          create: {
            username: 'fci_admin',
            fullName: 'Prof. S. O. Jimoh',
            department: 'CYBER_SECURITY',
            level: 'LEVEL_500',
            communityPoints: 5000,
          },
        },
      },
      include: { profile: true },
    });
  }

  if (!user) return;
  const userId = user.id;

  const seedActivities: CreateActivityInput[] = [
    {
      actorId: userId,
      type: ActivityType.NEWS_PUBLISHED,
      entityType: 'news',
      title: 'FCI Announces 2026 Annual Hackathon & Innovation Challenge',
      description: 'The Faculty of Computing & Informatics announces the annual hackathon with over ₦1,500,000 in grand tech grants and mentorship opportunities.',
      visibility: ActivityVisibility.PUBLIC,
    },
    {
      actorId: userId,
      type: ActivityType.PROJECT_PUBLISHED,
      entityType: 'project',
      title: 'Published a new project: CampusSmart IoT Energy Monitor',
      description: 'An automated IoT sensor array built by CUSTECH Computer Engineering & CS students to track and conserve faculty power consumption in real-time.',
      visibility: ActivityVisibility.PUBLIC,
    },
    {
      actorId: userId,
      type: ActivityType.ACHIEVEMENT_EARNED,
      entityType: 'achievement',
      title: 'Earned the achievement: Dean’s Merit Scholar (4.8+ CGPA)',
      description: 'Recognized for highest tier academic excellence across the Faculty of Computing and Informatics.',
      visibility: ActivityVisibility.PUBLIC,
    },
    {
      actorId: userId,
      type: ActivityType.OPPORTUNITY_POSTED,
      entityType: 'opportunity',
      title: 'New opportunity posted: Graduate Cyber Defense Fellowship (Remote/Lagos)',
      description: 'Tier-1 paid internship and training pathway sponsored by NITDA & CUSTECH Cyber Security laboratory.',
      visibility: ActivityVisibility.PUBLIC,
    },
    {
      actorId: userId,
      type: ActivityType.EVENT_CREATED,
      entityType: 'event',
      title: 'New event: FCI Tech Summit 2026: The Future of AI in Africa',
      description: 'Keynote lectures, live coding workshops, student project showcases, and networking with alumni leaders.',
      visibility: ActivityVisibility.PUBLIC,
    },
  ];

  for (const act of seedActivities) {
    await createActivity(act);
  }
  console.log('✅ Seeded initial FCI community activity feed items');
}

export const ActivityService = {
  createActivity,
  getActivityFeed,
  getActivityById,
  onProjectPublished,
  onAchievementEarned,
  onOpportunityPosted,
  onEventCreated,
  onNewsPublished,
  onCommunityCreated,
  seedActivityFeed,
};
