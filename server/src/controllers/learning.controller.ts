import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';
import {
  LearningResourceType,
  LearningResourceCategory,
  LearningProgressStatus,
  LearningPathDifficulty,
  ResourceSubmissionStatus,
  Department,
  Level,
  SavedEntityType,
  NotificationType,
} from '@prisma/client';

export const formatResource = (r: any, userProgressMap?: Record<string, any>, savedResourceIds?: Set<string>) => {
  if (!r) return null;
  const authorProfile = r.author?.profile;
  const fullName = authorProfile?.fullName || r.author?.fullName || 'FCI Faculty / Peer';
  const avatarUrl = authorProfile?.avatarUrl || r.author?.avatarUrl || null;
  const role = r.author?.userRoles?.[0]?.role?.name || r.author?.role || 'STUDENT';
  const email = r.author?.email || '';

  return {
    ...r,
    viewCount: r.viewsCount ?? r.viewCount ?? 0,
    downloadCount: r.downloadsCount ?? r.downloadCount ?? 0,
    submissionStatus: r.status || r.submissionStatus || 'APPROVED',
    author: {
      id: r.author?.id || r.authorId || '',
      fullName,
      email,
      avatarUrl,
      role,
      profile: authorProfile || null,
    },
    skills: r.skills || [],
    userProgress: userProgressMap ? (userProgressMap[r.id] || null) : (r.userProgress || null),
    isSaved: savedResourceIds ? savedResourceIds.has(r.id) : Boolean(r.isSaved),
  };
};

export const formatLearningPath = (p: any, userEnrollmentsMap?: Record<string, any>) => {
  if (!p) return null;
  return {
    ...p,
    itemCount: p._count?.items ?? p.items?.length ?? 0,
    enrollmentCount: p._count?.enrollments ?? p.enrollments?.length ?? 0,
    userEnrollment: userEnrollmentsMap ? (userEnrollmentsMap[p.id] || null) : (p.userEnrollment || null),
    items: p.items
      ? p.items.map((item: any) => ({
          ...item,
          resource: item.resource ? formatResource(item.resource) : null,
        }))
      : [],
  };
};

export const learningController = {
  // ── 0. Learning Hub Aggregated Overview ──────────────────────────────────────
  getHubOverview: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUserId = req.user?.userId;

      // 1. Featured Resources
      let featuredRaw = await prisma.learningResource.findMany({
        where: {
          isPublished: true,
          status: ResourceSubmissionStatus.APPROVED,
          isFeatured: true,
        },
        take: 6,
        orderBy: [{ viewsCount: 'desc' }, { createdAt: 'desc' }],
        include: {
          author: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  fullName: true,
                  username: true,
                  avatarUrl: true,
                  department: true,
                },
              },
            },
          },
          skills: {
            include: {
              skill: true,
            },
          },
        },
      });

      // If fewer than 3 featured, supplement with top approved resources
      if (featuredRaw.length < 3) {
        const featuredIds = featuredRaw.map((f) => f.id);
        const additional = await prisma.learningResource.findMany({
          where: {
            isPublished: true,
            status: ResourceSubmissionStatus.APPROVED,
            id: { notIn: featuredIds },
          },
          take: 6 - featuredRaw.length,
          orderBy: [{ viewsCount: 'desc' }, { createdAt: 'desc' }],
          include: {
            author: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    fullName: true,
                    username: true,
                    avatarUrl: true,
                    department: true,
                  },
                },
              },
            },
            skills: {
              include: {
                skill: true,
              },
            },
          },
        });
        featuredRaw = [...featuredRaw, ...additional];
      }

      // 2. Learning Paths
      const pathsRaw = await prisma.learningPath.findMany({
        where: { isPublished: true },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        take: 4,
        include: {
          _count: {
            select: {
              items: true,
              enrollments: true,
            },
          },
          items: {
            take: 4,
            orderBy: { position: 'asc' },
            include: {
              resource: {
                include: {
                  author: {
                    select: {
                      id: true,
                      profile: {
                        select: {
                          fullName: true,
                          avatarUrl: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      // 3. Recent Resources
      const recentRaw = await prisma.learningResource.findMany({
        where: {
          isPublished: true,
          status: ResourceSubmissionStatus.APPROVED,
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  fullName: true,
                  username: true,
                  avatarUrl: true,
                  department: true,
                },
              },
            },
          },
          skills: {
            include: {
              skill: true,
            },
          },
        },
      });

      // 4. User context tracking
      let userProgressMap: Record<string, { status: LearningProgressStatus; progressPercentage: number }> = {};
      let savedResourceIds = new Set<string>();
      let userEnrollmentsMap: Record<string, { progressPercentage: number; isCompleted: boolean }> = {};
      let continueLearningResources: any[] = [];
      let userSavedResources: any[] = [];

      if (currentUserId) {
        const allQueriedResourceIds = Array.from(
          new Set([...featuredRaw.map((r) => r.id), ...recentRaw.map((r) => r.id)])
        );

        const [progressRecords, savedRecords, enrollments, inProgressRecords, userSavedItems] = await Promise.all([
          prisma.learningResourceProgress.findMany({
            where: {
              userId: currentUserId,
              resourceId: { in: allQueriedResourceIds },
            },
          }),
          prisma.savedItem.findMany({
            where: {
              userId: currentUserId,
              entityType: SavedEntityType.LEARNING_RESOURCE,
              entityId: { in: allQueriedResourceIds },
            },
          }),
          prisma.learningPathEnrollment.findMany({
            where: { userId: currentUserId },
          }),
          prisma.learningResourceProgress.findMany({
            where: {
              userId: currentUserId,
              status: LearningProgressStatus.IN_PROGRESS,
              progressPercentage: { gt: 0, lt: 100 },
            },
            orderBy: { updatedAt: 'desc' },
            take: 6,
            include: {
              resource: {
                include: {
                  author: {
                    select: {
                      id: true,
                      email: true,
                      profile: {
                        select: {
                          fullName: true,
                          username: true,
                          avatarUrl: true,
                          department: true,
                        },
                      },
                    },
                  },
                  skills: {
                    include: { skill: true },
                  },
                },
              },
            },
          }),
          prisma.savedItem.findMany({
            where: {
              userId: currentUserId,
              entityType: SavedEntityType.LEARNING_RESOURCE,
            },
            orderBy: { createdAt: 'desc' },
            take: 12,
          }),
        ]);

        progressRecords.forEach((p) => {
          userProgressMap[p.resourceId] = {
            status: p.status,
            progressPercentage: p.progressPercentage,
          };
        });

        savedRecords.forEach((s) => savedResourceIds.add(s.entityId));

        enrollments.forEach((e) => {
          userEnrollmentsMap[e.learningPathId] = {
            progressPercentage: e.progressPercentage,
            isCompleted: e.isCompleted,
          };
        });

        continueLearningResources = inProgressRecords
          .filter((ip) => ip.resource && ip.resource.isPublished)
          .map((ip) => {
            const formatted = formatResource(ip.resource);
            formatted.userProgress = {
              id: ip.id,
              status: ip.status,
              progressPercentage: ip.progressPercentage,
              completedAt: ip.completedAt?.toISOString() || null,
              updatedAt: ip.updatedAt.toISOString(),
            };
            return formatted;
          });

        if (userSavedItems.length > 0) {
          const savedIds = userSavedItems.map((s) => s.entityId);
          const rawSaved = await prisma.learningResource.findMany({
            where: {
              id: { in: savedIds },
              isPublished: true,
            },
            include: {
              author: {
                select: {
                  id: true,
                  email: true,
                  profile: {
                    select: {
                      fullName: true,
                      username: true,
                      avatarUrl: true,
                      department: true,
                    },
                  },
                },
              },
              skills: {
                include: { skill: true },
              },
            },
          });
          userSavedResources = rawSaved.map((r) => formatResource(r, userProgressMap, new Set(savedIds)));
        }
      }

      // 5. Recommendations
      let recommendedResources: { resource: any; reason: string }[] = [];

      if (currentUserId) {
        const [studentSkills, user] = await Promise.all([
          prisma.studentSkill.findMany({
            where: { userId: currentUserId },
            include: { skill: true },
          }),
          prisma.user.findUnique({
            where: { id: currentUserId },
            include: { profile: true },
          }),
        ]);

        const skillNames = studentSkills.map((s) => s.skill.name.toLowerCase());
        const department = user?.profile?.department;
        let interests: string[] = [];
        if (user?.profile?.interests && Array.isArray(user.profile.interests)) {
          interests = (user.profile.interests as string[]).map((i) => String(i).toLowerCase());
        }

        const candidatePool = await prisma.learningResource.findMany({
          where: {
            isPublished: true,
            status: ResourceSubmissionStatus.APPROVED,
          },
          take: 30,
          include: {
            author: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    fullName: true,
                    username: true,
                    avatarUrl: true,
                    department: true,
                  },
                },
              },
            },
            skills: {
              include: { skill: true },
            },
            progress: {
              where: { userId: currentUserId },
            },
          },
          orderBy: [{ isFeatured: 'desc' }, { viewsCount: 'desc' }],
        });

        const scored: { resource: any; reason: string; score: number }[] = [];

        for (const item of candidatePool) {
          if (item.progress.length > 0 && item.progress[0].progressPercentage === 100) {
            continue;
          }

          let score = 0;
          const reasons: string[] = [];

          for (const s of item.skills) {
            if (skillNames.includes(s.skill.name.toLowerCase())) {
              score += 40;
              reasons.push(`Builds upon your ${s.skill.name} skill`);
              break;
            }
          }

          if (department && item.department === department) {
            score += 25;
            reasons.push(`Directly tailored for ${department.replace(/_/g, ' ')} curriculum`);
          }

          for (const interest of interests) {
            if (
              item.title.toLowerCase().includes(interest) ||
              item.category.toLowerCase().includes(interest.replace(/[^a-z]/g, ''))
            ) {
              score += 20;
              reasons.push(`Matches your recorded interest in ${interest}`);
              break;
            }
          }

          if (score === 0) {
            score = 10;
            reasons.push('Popular core reference in FCI study programs');
          }

          scored.push({
            resource: formatResource(item, userProgressMap, savedResourceIds),
            reason: reasons.join(' • '),
            score,
          });
        }

        scored.sort((a, b) => b.score - a.score);
        recommendedResources = scored.slice(0, 6).map(({ resource, reason }) => ({ resource, reason }));
      }

      if (recommendedResources.length === 0) {
        const topTrending = await prisma.learningResource.findMany({
          where: {
            isPublished: true,
            status: ResourceSubmissionStatus.APPROVED,
          },
          take: 6,
          orderBy: [{ viewsCount: 'desc' }, { createdAt: 'desc' }],
          include: {
            author: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    fullName: true,
                    username: true,
                    avatarUrl: true,
                    department: true,
                  },
                },
              },
            },
            skills: {
              include: { skill: true },
            },
          },
        });

        recommendedResources = topTrending.map((r) => ({
          resource: formatResource(r, userProgressMap, savedResourceIds),
          reason: 'Trending foundational resource in FCI Faculty',
        }));
      }

      const featuredResources = featuredRaw.map((r) => formatResource(r, userProgressMap, savedResourceIds));
      const recentResources = recentRaw.map((r) => formatResource(r, userProgressMap, savedResourceIds));
      const learningPaths = pathsRaw.map((p) => formatLearningPath(p, userEnrollmentsMap));

      res.json({
        success: true,
        data: {
          featuredResources,
          continueLearning: continueLearningResources,
          recommendedResources,
          learningPaths,
          recentResources,
          userSavedResources,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 1. List Learning Resources ───────────────────────────────────────────────
  listResources: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
      const search = (req.query.search as string)?.trim();
      const category = req.query.category as LearningResourceCategory | undefined;
      const resourceType = req.query.resourceType as LearningResourceType | undefined;
      const department = req.query.department as Department | undefined;
      const level = req.query.level as Level | undefined;
      const courseCode = (req.query.courseCode as string)?.trim();
      const subject = (req.query.subject as string)?.trim();
      const isFeatured = req.query.featured === 'true' ? true : undefined;
      const skill = (req.query.skill as string)?.trim();
      const sortBy = (req.query.sortBy as string) || 'recent'; // recent, popular, title
      const currentUserId = req.user?.userId;

      const where: any = {
        isPublished: true,
        status: ResourceSubmissionStatus.APPROVED,
      };

      if (category && Object.values(LearningResourceCategory).includes(category)) {
        where.category = category;
      }
      if (resourceType && Object.values(LearningResourceType).includes(resourceType)) {
        where.resourceType = resourceType;
      }
      if (department && Object.values(Department).includes(department)) {
        where.department = department;
      }
      if (level && Object.values(Level).includes(level)) {
        where.level = level;
      }
      if (courseCode) {
        where.courseCode = { contains: courseCode };
      }
      if (subject) {
        where.subject = { contains: subject };
      }
      if (isFeatured !== undefined) {
        where.isFeatured = isFeatured;
      }
      if (skill) {
        where.skills = {
          some: {
            skill: {
              OR: [
                { name: { contains: skill } },
                { slug: { contains: skill.toLowerCase() } },
              ],
            },
          },
        };
      }
      if (search) {
        where.OR = [
          { title: { contains: search } },
          { description: { contains: search } },
          { subject: { contains: search } },
          { courseCode: { contains: search } },
        ];
      }

      let orderBy: any = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
      if (sortBy === 'popular') {
        orderBy = [{ viewsCount: 'desc' }, { downloadsCount: 'desc' }];
      } else if (sortBy === 'title') {
        orderBy = { title: 'asc' };
      }

      const [total, resources] = await Promise.all([
        prisma.learningResource.count({ where }),
        prisma.learningResource.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy,
          include: {
            author: {
              select: {
                id: true,
                profile: {
                  select: {
                    fullName: true,
                    username: true,
                    avatarUrl: true,
                    department: true,
                  },
                },
              },
            },
            skills: {
              include: {
                skill: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    category: true,
                  },
                },
              },
            },
            _count: {
              select: {
                progress: true,
              },
            },
          },
        }),
      ]);

      // If user is authenticated, attach their progress and saved status
      let userProgressMap: Record<string, { status: LearningProgressStatus; progressPercentage: number }> = {};
      let savedResourceIds = new Set<string>();

      if (currentUserId && resources.length > 0) {
        const resourceIds = resources.map((r) => r.id);
        const [progressRecords, savedRecords] = await Promise.all([
          prisma.learningResourceProgress.findMany({
            where: {
              userId: currentUserId,
              resourceId: { in: resourceIds },
            },
          }),
          prisma.savedItem.findMany({
            where: {
              userId: currentUserId,
              entityType: SavedEntityType.LEARNING_RESOURCE,
              entityId: { in: resourceIds },
            },
          }),
        ]);

        progressRecords.forEach((p) => {
          userProgressMap[p.resourceId] = {
            status: p.status,
            progressPercentage: p.progressPercentage,
          };
        });

        savedRecords.forEach((s) => savedResourceIds.add(s.entityId));
      }

      const enrichedResources = resources.map((r) => formatResource(r, userProgressMap, savedResourceIds));

      res.json({
        success: true,
        data: {
          resources: enrichedResources,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 2. Get Single Resource by Slug or ID ──────────────────────────────────────
  getBySlug: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = req.params.slug as string;
      const currentUserId = req.user?.userId;

      const resource = await prisma.learningResource.findFirst({
        where: {
          OR: [{ slug }, { id: slug }],
          isPublished: true,
          status: ResourceSubmissionStatus.APPROVED,
        },
        include: {
          author: {
            select: {
              id: true,
              profile: {
                select: {
                  fullName: true,
                  username: true,
                  avatarUrl: true,
                  department: true,
                  level: true,
                },
              },
            },
          },
          skills: {
            include: {
              skill: true,
            },
          },
        },
      });

      if (!resource) {
        throw ApiError.notFound('Learning resource not found');
      }

      // Increment views count asynchronously
      prisma.learningResource
        .update({
          where: { id: resource.id },
          data: { viewsCount: { increment: 1 } },
        })
        .catch(() => {});

      // User progress and saved status
      let userProgress = null;
      let isSaved = false;

      if (currentUserId) {
        const [progress, saved] = await Promise.all([
          prisma.learningResourceProgress.findUnique({
            where: {
              userId_resourceId: {
                userId: currentUserId,
                resourceId: resource.id,
              },
            },
          }),
          prisma.savedItem.findUnique({
            where: {
              userId_entityType_entityId: {
                userId: currentUserId,
                entityType: SavedEntityType.LEARNING_RESOURCE,
                entityId: resource.id,
              },
            },
          }),
        ]);

        userProgress = progress;
        isSaved = Boolean(saved);
      }

      // Related resources
      const related = await prisma.learningResource.findMany({
        where: {
          id: { not: resource.id },
          category: resource.category,
          isPublished: true,
          status: ResourceSubmissionStatus.APPROVED,
        },
        take: 4,
        select: {
          id: true,
          title: true,
          slug: true,
          resourceType: true,
          category: true,
          subject: true,
          thumbnail: true,
        },
      });

      const formatted = formatResource(resource);
      res.json({
        success: true,
        data: {
          ...formatted,
          userProgress,
          isSaved,
          related,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 3. Submit Student Resource ────────────────────────────────────────────────
  submitResource: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const userRoles = req.user?.roles || [];
      const isPrivileged =
        userRoles.includes('ADMIN') ||
        userRoles.includes('SUPER_ADMIN') ||
        userRoles.includes('EDITOR') ||
        userRoles.includes('MODERATOR');

      const {
        title,
        description,
        resourceType,
        category,
        subject,
        courseCode,
        department,
        level,
        semester,
        url,
        fileUrl,
        thumbnail,
        skillIds,
      } = req.body;

      // Base slug from title
      let baseSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      if (!baseSlug) baseSlug = `resource-${Date.now()}`;
      let finalSlug = baseSlug;

      const existingSlug = await prisma.learningResource.findUnique({ where: { slug: finalSlug } });
      if (existingSlug) {
        finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
      }

      // Privileged roles get auto-approved, normal students submit as PENDING
      const status = isPrivileged
        ? ResourceSubmissionStatus.APPROVED
        : ResourceSubmissionStatus.PENDING;

      const resource = await prisma.learningResource.create({
        data: {
          title,
          slug: finalSlug,
          description: description || null,
          resourceType,
          category,
          subject: subject || null,
          courseCode: courseCode || null,
          department: department || null,
          level: level || null,
          semester: semester || null,
          url: url || null,
          fileUrl: fileUrl || null,
          thumbnail: thumbnail || null,
          authorId: userId,
          status,
          isPublished: isPrivileged,
          skills: skillIds && Array.isArray(skillIds) && skillIds.length > 0
            ? {
                create: skillIds.map((skillId: string) => ({
                  skillId,
                })),
              }
            : undefined,
        },
      });

      res.status(201).json({
        success: true,
        message: isPrivileged
          ? 'Resource published successfully'
          : 'Resource submitted successfully and queued for administrative review',
        data: resource,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 4. Update Learning Progress ───────────────────────────────────────────────
  updateProgress: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;
      const { progressPercentage, status } = req.body;

      // Validate 0-100
      const pct = Math.max(0, Math.min(100, Math.floor(progressPercentage)));
      let progressStatus = status as LearningProgressStatus;
      if (!progressStatus) {
        if (pct === 0) progressStatus = LearningProgressStatus.NOT_STARTED;
        else if (pct === 100) progressStatus = LearningProgressStatus.COMPLETED;
        else progressStatus = LearningProgressStatus.IN_PROGRESS;
      }

      const completedAt = pct === 100 ? new Date() : null;

      const record = await prisma.learningResourceProgress.upsert({
        where: {
          userId_resourceId: {
            userId,
            resourceId: id,
          },
        },
        create: {
          userId,
          resourceId: id,
          progressPercentage: pct,
          status: progressStatus,
          completedAt,
        },
        update: {
          progressPercentage: pct,
          status: progressStatus,
          completedAt: completedAt || undefined,
        },
      });

      // Update enrolled learning paths progress asynchronously
      prisma.learningPathItem
        .findMany({
          where: { resourceId: id },
          select: { learningPathId: true },
        })
        .then(async (pathItems) => {
          for (const item of pathItems) {
            const enrollment = await prisma.learningPathEnrollment.findUnique({
              where: {
                userId_learningPathId: {
                  userId,
                  learningPathId: item.learningPathId,
                },
              },
            });

            if (enrollment) {
              const allPathItems = await prisma.learningPathItem.findMany({
                where: { learningPathId: item.learningPathId },
                select: { resourceId: true },
              });

              if (allPathItems.length > 0) {
                const itemIds = allPathItems.map((p) => p.resourceId);
                const completedCount = await prisma.learningResourceProgress.count({
                  where: {
                    userId,
                    resourceId: { in: itemIds },
                    progressPercentage: 100,
                  },
                });

                const pathPct = Math.round((completedCount / allPathItems.length) * 100);
                const isPathComplete = pathPct === 100;

                await prisma.learningPathEnrollment.update({
                  where: { id: enrollment.id },
                  data: {
                    progressPercentage: pathPct,
                    isCompleted: isPathComplete,
                    completedAt: isPathComplete && !enrollment.isCompleted ? new Date() : undefined,
                  },
                });

                // Award notification if path completed for the first time
                if (isPathComplete && !enrollment.isCompleted) {
                  const path = await prisma.learningPath.findUnique({
                    where: { id: item.learningPathId },
                  });
                  await prisma.notification.create({
                    data: {
                      userId,
                      type: NotificationType.LEARNING_PATH_COMPLETED,
                      title: 'Learning Path Completed!',
                      message: `Congratulations! You have completed all milestones in "${path?.title || 'the Learning Path'}".`,
                    },
                  });
                }
              }
            }
          }
        })
        .catch(() => {});

      res.json({
        success: true,
        message: 'Learning progress updated',
        data: record,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 5. Toggle Bookmark / Save Resource ───────────────────────────────────────
  toggleSaveResource: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;

      const existing = await prisma.savedItem.findUnique({
        where: {
          userId_entityType_entityId: {
            userId,
            entityType: SavedEntityType.LEARNING_RESOURCE,
            entityId: id,
          },
        },
      });

      if (existing) {
        await prisma.savedItem.delete({ where: { id: existing.id } });
        res.json({
          success: true,
          message: 'Resource removed from saved bookmarks',
          isSaved: false,
        });
      } else {
        await prisma.savedItem.create({
          data: {
            userId,
            entityType: SavedEntityType.LEARNING_RESOURCE,
            entityId: id,
          },
        });
        res.json({
          success: true,
          message: 'Resource saved to bookmarks',
          isSaved: true,
        });
      }
    } catch (error) {
      next(error);
    }
  },

  // ── 6. Get Saved Resources ───────────────────────────────────────────────────
  getSavedResources: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      const savedItems = await prisma.savedItem.findMany({
        where: {
          userId,
          entityType: SavedEntityType.LEARNING_RESOURCE,
        },
        orderBy: { createdAt: 'desc' },
      });

      const resourceIds = savedItems.map((s) => s.entityId);

      const resources = await prisma.learningResource.findMany({
        where: {
          id: { in: resourceIds },
          isPublished: true,
        },
        include: {
          author: {
            select: {
              profile: {
                select: {
                  fullName: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
          skills: {
            include: {
              skill: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: resources.map((r) => formatResource(r, undefined, new Set(resourceIds))),
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 7. List Learning Paths ───────────────────────────────────────────────────
  listPaths: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUserId = req.user?.userId;

      const paths = await prisma.learningPath.findMany({
        where: { isPublished: true },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        include: {
          _count: {
            select: {
              items: true,
              enrollments: true,
            },
          },
        },
      });

      let userEnrollmentsMap: Record<string, { progressPercentage: number; isCompleted: boolean }> = {};
      if (currentUserId) {
        const enrollments = await prisma.learningPathEnrollment.findMany({
          where: { userId: currentUserId },
        });
        enrollments.forEach((e) => {
          userEnrollmentsMap[e.learningPathId] = {
            progressPercentage: e.progressPercentage,
            isCompleted: e.isCompleted,
          };
        });
      }

      const formatted = paths.map((p) => ({
        ...p,
        itemCount: p._count.items,
        enrollmentCount: p._count.enrollments,
        userEnrollment: userEnrollmentsMap[p.id] || null,
      }));

      res.json({
        success: true,
        data: formatted,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 8. Get Single Learning Path with Ordered Items ───────────────────────────
  getPathBySlug: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = req.params.slug as string;
      const currentUserId = req.user?.userId;

      const path = await prisma.learningPath.findFirst({
        where: {
          OR: [{ slug }, { id: slug }],
          isPublished: true,
        },
        include: {
          items: {
            orderBy: { position: 'asc' },
            include: {
              resource: {
                include: {
                  author: {
                    select: {
                      profile: {
                        select: {
                          fullName: true,
                          avatarUrl: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      });

      if (!path) {
        throw ApiError.notFound('Learning path not found');
      }

      let userEnrollment = null;
      let userProgressMap: Record<string, { progressPercentage: number; status: LearningProgressStatus }> = {};

      if (currentUserId) {
        const resourceIds = path.items.map((i) => i.resourceId);
        const [enrollment, progresses] = await Promise.all([
          prisma.learningPathEnrollment.findUnique({
            where: {
              userId_learningPathId: {
                userId: currentUserId,
                learningPathId: path.id,
              },
            },
          }),
          prisma.learningResourceProgress.findMany({
            where: {
              userId: currentUserId,
              resourceId: { in: resourceIds },
            },
          }),
        ]);

        userEnrollment = enrollment;
        progresses.forEach((p) => {
          userProgressMap[p.resourceId] = {
            progressPercentage: p.progressPercentage,
            status: p.status,
          };
        });
      }

      const enrichedItems = path.items.map((item) => ({
        ...item,
        userProgress: userProgressMap[item.resourceId] || null,
      }));

      res.json({
        success: true,
        data: {
          ...path,
          items: enrichedItems,
          enrollmentCount: path._count.enrollments,
          userEnrollment,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 9. Enroll in Learning Path ───────────────────────────────────────────────
  enrollPath: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pathId = req.params.id as string;
      const userId = req.user!.userId;

      const path = await prisma.learningPath.findUnique({
        where: { id: pathId },
        include: { items: true },
      });

      if (!path) {
        throw ApiError.notFound('Learning path not found');
      }

      // Calculate initial progress based on existing resource progresses
      const resourceIds = path.items.map((i) => i.resourceId);
      const completedCount = await prisma.learningResourceProgress.count({
        where: {
          userId,
          resourceId: { in: resourceIds },
          progressPercentage: 100,
        },
      });

      const initialPct = path.items.length > 0
        ? Math.round((completedCount / path.items.length) * 100)
        : 0;

      const enrollment = await prisma.learningPathEnrollment.upsert({
        where: {
          userId_learningPathId: {
            userId,
            learningPathId: pathId,
          },
        },
        create: {
          userId,
          learningPathId: pathId,
          progressPercentage: initialPct,
          isCompleted: initialPct === 100,
          completedAt: initialPct === 100 ? new Date() : null,
        },
        update: {
          progressPercentage: initialPct,
          isCompleted: initialPct === 100,
        },
      });

      res.json({
        success: true,
        message: 'Enrolled in learning path successfully',
        data: enrollment,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 10. Personalized Recommendations ─────────────────────────────────────────
  getPersonalizedRecommendations: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        // Return top featured resources if guest
        const fallback = await prisma.learningResource.findMany({
          where: { isPublished: true, status: ResourceSubmissionStatus.APPROVED },
          orderBy: [{ isFeatured: 'desc' }, { viewsCount: 'desc' }],
          take: 6,
        });
        return res.json({
          success: true,
          data: fallback.map((r) => ({
            resource: r,
            reason: 'Trending resource in FCI faculty',
          })),
        });
      }

      // Fetch student skills, profile interests, and department
      const [studentSkills, user] = await Promise.all([
        prisma.studentSkill.findMany({
          where: { userId },
          include: { skill: true },
        }),
        prisma.user.findUnique({
          where: { id: userId },
          include: { profile: true },
        }),
      ]);

      const skillNames = studentSkills.map((s) => s.skill.name.toLowerCase());
      const department = user?.profile?.department;
      let interests: string[] = [];
      if (user?.profile?.interests && Array.isArray(user.profile.interests)) {
        interests = (user.profile.interests as string[]).map((i) => String(i).toLowerCase());
      }

      // Fetch published resources
      const allResources = await prisma.learningResource.findMany({
        where: { isPublished: true, status: ResourceSubmissionStatus.APPROVED },
        take: 30,
        include: {
          skills: { include: { skill: true } },
          progress: { where: { userId } },
        },
        orderBy: [{ isFeatured: 'desc' }, { viewsCount: 'desc' }],
      });

      // Filter out completed ones and calculate score + transparent reason
      const recommendations: { resource: any; reason: string; score: number }[] = [];

      for (const resItem of allResources) {
        if (resItem.progress.length > 0 && resItem.progress[0].progressPercentage === 100) {
          continue; // Already mastered
        }

        let score = 0;
        const reasons: string[] = [];

        // Check matching skills
        for (const rs of resItem.skills) {
          if (skillNames.includes(rs.skill.name.toLowerCase())) {
            score += 40;
            reasons.push(`Builds upon your ${rs.skill.name} skill`);
            break;
          }
        }

        // Check department match
        if (department && resItem.department === department) {
          score += 25;
          reasons.push(`Directly tailored for ${department.replace(/_/g, ' ')} curriculum`);
        }

        // Check interest match
        for (const interest of interests) {
          if (
            resItem.title.toLowerCase().includes(interest) ||
            resItem.category.toLowerCase().includes(interest.replace(/[^a-z]/g, ''))
          ) {
            score += 20;
            reasons.push(`Matches your recorded interest in ${interest}`);
            break;
          }
        }

        if (score === 0) {
          score = 10;
          reasons.push('Popular core reference in FCI study programs');
        }

        recommendations.push({
          resource: resItem,
          reason: reasons.join(' • '),
          score,
        });
      }

      recommendations.sort((a, b) => b.score - a.score);

      res.json({
        success: true,
        data: recommendations.slice(0, 8),
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 11. Categories & Taxonomy Helper ─────────────────────────────────────────
  getCategoriesAndTaxonomy: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Find distinct course codes and subjects currently in database
      const [distinctCourses, distinctSubjects] = await Promise.all([
        prisma.learningResource.findMany({
          where: { courseCode: { not: null }, isPublished: true },
          select: { courseCode: true },
          distinct: ['courseCode'],
          take: 30,
        }),
        prisma.learningResource.findMany({
          where: { subject: { not: null }, isPublished: true },
          select: { subject: true },
          distinct: ['subject'],
          take: 30,
        }),
      ]);

      res.json({
        success: true,
        data: {
          categories: Object.values(LearningResourceCategory),
          resourceTypes: Object.values(LearningResourceType),
          departments: Object.values(Department),
          levels: Object.values(Level),
          courseCodes: distinctCourses.map((c) => c.courseCode).filter(Boolean),
          subjects: distinctSubjects.map((s) => s.subject).filter(Boolean),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 12. Active In-Progress Resources ("Continue Learning") ───────────────────
  getContinueLearning: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      const progressRecords = await prisma.learningResourceProgress.findMany({
        where: {
          userId,
          status: LearningProgressStatus.IN_PROGRESS,
          progressPercentage: { gt: 0, lt: 100 },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          resource: {
            include: {
              author: {
                select: {
                  profile: {
                    select: { fullName: true, username: true },
                  },
                },
              },
            },
          },
        },
      });

      res.json({
        success: true,
        data: progressRecords.map((p) => ({
          progress: p.progressPercentage,
          status: p.status,
          updatedAt: p.updatedAt,
          resource: p.resource,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 13. Admin Management Endpoints ───────────────────────────────────────────
  adminListSubmissions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = req.query.status as ResourceSubmissionStatus | undefined;
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

      const where: any = {};
      if (status && Object.values(ResourceSubmissionStatus).includes(status)) {
        where.status = status;
      }

      const [total, submissions] = await Promise.all([
        prisma.learningResource.count({ where }),
        prisma.learningResource.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: { fullName: true, username: true },
                },
              },
            },
          },
        }),
      ]);

      res.json({
        success: true,
        data: {
          submissions,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  adminReviewSubmission: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { status, rejectionReason } = req.body;

      const resource = await prisma.learningResource.findUnique({
        where: { id },
      });

      if (!resource) {
        throw ApiError.notFound('Resource not found');
      }

      const updated = await prisma.learningResource.update({
        where: { id },
        data: {
          status: status as ResourceSubmissionStatus,
          rejectionReason: status === 'REJECTED' ? rejectionReason : null,
          isPublished: status === 'APPROVED',
        },
      });

      // Send notification to author if author exists
      if (resource.authorId) {
        await prisma.notification.create({
          data: {
            userId: resource.authorId,
            type:
              status === 'APPROVED'
                ? NotificationType.RESOURCE_APPROVED
                : NotificationType.RESOURCE_REJECTED,
            title:
              status === 'APPROVED'
                ? 'Learning Resource Approved!'
                : 'Learning Resource Submission Update',
            message:
              status === 'APPROVED'
                ? `Your submitted resource "${resource.title}" has been approved and published to the FCI Learning Hub.`
                : `Your resource submission "${resource.title}" was not approved: ${rejectionReason || 'Does not meet curriculum guidelines.'}`,
          },
        });
      }

      res.json({
        success: true,
        message: `Resource has been ${status.toLowerCase()}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  adminCreateResource: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const data = req.body;

      let baseSlug = (data.slug || data.title)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      if (!baseSlug) baseSlug = `resource-${Date.now()}`;
      let finalSlug = baseSlug;

      const existingSlug = await prisma.learningResource.findUnique({ where: { slug: finalSlug } });
      if (existingSlug) {
        finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
      }

      const resource = await prisma.learningResource.create({
        data: {
          title: data.title,
          slug: finalSlug,
          description: data.description || null,
          resourceType: data.resourceType,
          category: data.category,
          subject: data.subject || null,
          courseCode: data.courseCode || null,
          department: data.department || null,
          level: data.level || null,
          semester: data.semester || null,
          url: data.url || null,
          fileUrl: data.fileUrl || null,
          thumbnail: data.thumbnail || null,
          authorId: userId,
          status: ResourceSubmissionStatus.APPROVED,
          isPublished: data.isPublished !== undefined ? data.isPublished : true,
          isFeatured: data.isFeatured !== undefined ? data.isFeatured : false,
          skills: data.skillIds && Array.isArray(data.skillIds)
            ? {
                create: data.skillIds.map((skillId: string) => ({ skillId })),
              }
            : undefined,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Resource created successfully',
        data: resource,
      });
    } catch (error) {
      next(error);
    }
  },

  adminUpdateResource: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const data = req.body;

      const resource = await prisma.learningResource.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          resourceType: data.resourceType,
          category: data.category,
          subject: data.subject,
          courseCode: data.courseCode,
          department: data.department,
          level: data.level,
          semester: data.semester,
          url: data.url,
          fileUrl: data.fileUrl,
          thumbnail: data.thumbnail,
          isPublished: data.isPublished,
          isFeatured: data.isFeatured,
          status: data.status,
          rejectionReason: data.rejectionReason,
        },
      });

      res.json({
        success: true,
        message: 'Resource updated',
        data: resource,
      });
    } catch (error) {
      next(error);
    }
  },

  adminDeleteResource: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      await prisma.learningResource.delete({ where: { id } });
      res.json({
        success: true,
        message: 'Resource deleted',
      });
    } catch (error) {
      next(error);
    }
  },

  adminCreatePath: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, slug, description, category, difficulty, estimatedDuration, thumbnail, isFeatured, items } = req.body;

      let baseSlug = (slug || title)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      if (!baseSlug) baseSlug = `path-${Date.now()}`;
      let finalSlug = baseSlug;

      const existing = await prisma.learningPath.findUnique({ where: { slug: finalSlug } });
      if (existing) {
        finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
      }

      const path = await prisma.learningPath.create({
        data: {
          title,
          slug: finalSlug,
          description,
          category,
          difficulty: difficulty || LearningPathDifficulty.BEGINNER,
          estimatedDuration: estimatedDuration || null,
          thumbnail: thumbnail || null,
          isFeatured: isFeatured || false,
          isPublished: true,
          items: items && Array.isArray(items)
            ? {
                create: items.map((it: any, index: number) => ({
                  resourceId: it.resourceId,
                  position: it.position !== undefined ? it.position : index,
                  isRequired: it.isRequired !== undefined ? it.isRequired : true,
                })),
              }
            : undefined,
        },
        include: {
          items: true,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Learning path created',
        data: path,
      });
    } catch (error) {
      next(error);
    }
  },

  adminUpdatePath: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { title, description, category, difficulty, estimatedDuration, thumbnail, isPublished, isFeatured, items } = req.body;

      const updated = await prisma.learningPath.update({
        where: { id },
        data: {
          title,
          description,
          category,
          difficulty,
          estimatedDuration,
          thumbnail,
          isPublished,
          isFeatured,
        },
      });

      // If items provided, re-sync path items
      if (items && Array.isArray(items)) {
        await prisma.learningPathItem.deleteMany({ where: { learningPathId: id } });
        await prisma.learningPathItem.createMany({
          data: items.map((it: any, index: number) => ({
            learningPathId: id,
            resourceId: it.resourceId,
            position: it.position !== undefined ? it.position : index,
            isRequired: it.isRequired !== undefined ? it.isRequired : true,
          })),
        });
      }

      res.json({
        success: true,
        message: 'Learning path updated',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  adminDeletePath: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      await prisma.learningPath.delete({ where: { id } });
      res.json({
        success: true,
        message: 'Learning path deleted',
      });
    } catch (error) {
      next(error);
    }
  },
};
