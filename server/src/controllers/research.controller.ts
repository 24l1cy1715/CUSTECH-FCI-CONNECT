import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';
import {
  ResearchStatus,
  ResearchVisibility,
  ResearchMemberRole,
  NotificationType,
  ActivityType,
  ActivityVisibility,
} from '@prisma/client';
import { createActivity } from '../services/activity.service';

const generateSlug = (title: string): string => {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `${base}-${Date.now().toString(36)}`;
};

export const researchController = {
  // ── 1. List Research Projects ───────────────────────────────────────────────
  listProjects: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const { view = 'explore', category, department, status, search, page = '1', limit = '12' } = req.query;

      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
      const skip = (pageNum - 1) * limitNum;

      const whereClause: any = {};

      if (view === 'my' && userId) {
        whereClause.OR = [
          { ownerId: userId },
          { mentorId: userId },
          { members: { some: { userId } } },
        ];
      } else {
        whereClause.visibility = { in: [ResearchVisibility.PUBLIC, ResearchVisibility.FCI_ONLY] };
      }

      if (category) whereClause.category = category as string;
      if (department) whereClause.department = department as any;
      if (status) whereClause.researchStatus = status as any;
      if (search) {
        whereClause.OR = [
          { title: { contains: search as string } },
          { description: { contains: search as string } },
          { abstract: { contains: search as string } },
        ];
      }

      const [projects, total] = await Promise.all([
        prisma.researchProject.findMany({
          where: whereClause,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
          include: {
            owner: {
              select: {
                id: true,
                profile: {
                  select: { fullName: true, avatarUrl: true, department: true },
                },
              },
            },
            mentor: {
              select: {
                id: true,
                profile: { select: { fullName: true, avatarUrl: true } },
              },
            },
            members: {
              select: {
                id: true,
                role: true,
                user: {
                  select: {
                    id: true,
                    profile: { select: { fullName: true, avatarUrl: true } },
                  },
                },
              },
            },
            _count: {
              select: { members: true, publications: true },
            },
          },
        }),
        prisma.researchProject.count({ where: whereClause }),
      ]);

      res.json({
        success: true,
        data: {
          projects,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 2. Create Research Project ──────────────────────────────────────────────
  createProject: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const data = req.body;
      const slug = generateSlug(data.title);

      const project = await prisma.researchProject.create({
        data: {
          title: data.title,
          slug,
          description: data.description,
          abstract: data.abstract || null,
          problemStatement: data.problemStatement || null,
          objectives: data.objectives || null,
          methodology: data.methodology || null,
          category: data.category,
          department: data.department || null,
          researchStatus: data.researchStatus as ResearchStatus || ResearchStatus.IDEA,
          visibility: data.visibility as ResearchVisibility || ResearchVisibility.PUBLIC,
          ownerId: userId,
          mentorId: data.mentorId || null,
          startDate: data.startDate ? new Date(data.startDate) : null,
          targetDate: data.targetDate ? new Date(data.targetDate) : null,
          githubUrl: data.githubUrl || null,
          paperUrl: data.paperUrl || null,
          datasetUrl: data.datasetUrl || null,
          publicationUrl: data.publicationUrl || null,
          coverImage: data.coverImage || null,
          members: {
            create: {
              userId,
              role: ResearchMemberRole.LEAD,
              status: 'ACTIVE',
            },
          },
        },
        include: {
          owner: {
            select: {
              id: true,
              profile: { select: { fullName: true, avatarUrl: true } },
            },
          },
          members: true,
        },
      });

      // Post activity feed event if public
      if (project.visibility === ResearchVisibility.PUBLIC) {
        await createActivity({
          actorId: userId,
          type: ActivityType.LAB_PROJECT_CREATED,
          entityType: 'RESEARCH',
          title: `Started research on "${project.title}"`,
          description: project.description.substring(0, 150),
          entityId: project.id,
          visibility: ActivityVisibility.PUBLIC,
        }).catch(() => null);
      }

      res.status(201).json({
        success: true,
        message: 'Research project created successfully',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 3. Get Project Detail ───────────────────────────────────────────────────
  getProject: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idOrSlug = req.params.idOrSlug as string;
      const userId = req.user?.userId;

      const project = await prisma.researchProject.findFirst({
        where: {
          OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        },
        include: {
          owner: {
            select: {
              id: true,
              profile: {
                select: { fullName: true, avatarUrl: true, department: true },
              },
            },
          },
          mentor: {
            select: {
              id: true,
              profile: { select: { fullName: true, avatarUrl: true } },
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  profile: {
                    select: { fullName: true, avatarUrl: true, department: true },
                  },
                },
              },
            },
          },
          publications: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!project) throw ApiError.notFound('Research project not found');

      // Privacy check
      if (project.visibility === ResearchVisibility.PRIVATE) {
        const isMember = project.members.some((m) => m.userId === userId);
        const isOwner = project.ownerId === userId;
        const isMentor = project.mentorId === userId;
        if (!isMember && !isOwner && !isMentor) {
          throw ApiError.forbidden('You do not have access to this private research project');
        }
      }

      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  },

  // ── 4. Update Project ───────────────────────────────────────────────────────
  updateProject: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const existing = await prisma.researchProject.findUnique({ where: { id } });
      if (!existing) throw ApiError.notFound('Research project not found');

      if (existing.ownerId !== userId) {
        throw ApiError.forbidden('Only the research lead can update project details');
      }

      const {
        title,
        description,
        abstract,
        problemStatement,
        objectives,
        methodology,
        category,
        department,
        researchStatus,
        visibility,
        mentorId,
        startDate,
        targetDate,
        githubUrl,
        paperUrl,
        datasetUrl,
        publicationUrl,
        coverImage,
      } = req.body;

      const safeData: any = {};
      if (title !== undefined) safeData.title = title;
      if (description !== undefined) safeData.description = description;
      if (abstract !== undefined) safeData.abstract = abstract;
      if (problemStatement !== undefined) safeData.problemStatement = problemStatement;
      if (objectives !== undefined) safeData.objectives = objectives;
      if (methodology !== undefined) safeData.methodology = methodology;
      if (category !== undefined) safeData.category = category;
      if (department !== undefined) safeData.department = department;
      if (researchStatus !== undefined) safeData.researchStatus = researchStatus;
      if (visibility !== undefined) safeData.visibility = visibility;
      if (mentorId !== undefined) safeData.mentorId = mentorId || null;
      if (startDate !== undefined) safeData.startDate = startDate ? new Date(startDate) : null;
      if (targetDate !== undefined) safeData.targetDate = targetDate ? new Date(targetDate) : null;
      if (githubUrl !== undefined) safeData.githubUrl = githubUrl || null;
      if (paperUrl !== undefined) safeData.paperUrl = paperUrl || null;
      if (datasetUrl !== undefined) safeData.datasetUrl = datasetUrl || null;
      if (publicationUrl !== undefined) safeData.publicationUrl = publicationUrl || null;
      if (coverImage !== undefined) safeData.coverImage = coverImage || null;

      const updated = await prisma.researchProject.update({
        where: { id },
        data: safeData,
      });

      res.json({ success: true, message: 'Research project updated', data: updated });
    } catch (error) {
      next(error);
    }
  },

  // ── 5. Add/Invite Team Member ───────────────────────────────────────────────
  addMember: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const currentUserId = req.user?.userId;
      const { userId, role } = req.body;

      const project = await prisma.researchProject.findUnique({ where: { id } });
      if (!project) throw ApiError.notFound('Research project not found');
      if (project.ownerId !== currentUserId) {
        throw ApiError.forbidden('Only the research lead can invite members');
      }

      const existingMember = await prisma.researchMember.findUnique({
        where: {
          researchProjectId_userId: { researchProjectId: id, userId },
        },
      });

      if (existingMember) {
        throw ApiError.conflict('User is already a member of this research team');
      }

      const member = await prisma.researchMember.create({
        data: {
          researchProjectId: id,
          userId,
          role: role || ResearchMemberRole.RESEARCHER,
          status: 'ACTIVE',
        },
        include: {
          user: {
            select: {
              id: true,
              profile: { select: { fullName: true, avatarUrl: true } },
            },
          },
        },
      });

      // Send notification
      await prisma.notification.create({
        data: {
          userId,
          type: NotificationType.RESEARCH_INVITATION,
          title: 'Research Team Invitation',
          message: `You were added to the research team for "${project.title}" as a ${role}.`,
          entityType: 'RESEARCH',
          entityId: project.id,
        },
      }).catch(() => null);

      res.status(201).json({ success: true, message: 'Member added', data: member });
    } catch (error) {
      next(error);
    }
  },

  // ── 6. Remove Team Member ───────────────────────────────────────────────────
  removeMember: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const memberId = req.params.memberId as string;
      const currentUserId = req.user?.userId;

      const project = await prisma.researchProject.findUnique({ where: { id } });
      if (!project) throw ApiError.notFound('Project not found');

      const member = await prisma.researchMember.findUnique({ where: { id: memberId } });
      if (!member) throw ApiError.notFound('Member not found');

      if (project.ownerId !== currentUserId && member.userId !== currentUserId) {
        throw ApiError.forbidden('Unauthorized to remove this member');
      }

      await prisma.researchMember.delete({ where: { id: memberId } });
      res.json({ success: true, message: 'Member removed from team' });
    } catch (error) {
      next(error);
    }
  },

  // ── 7. Research Idea Board ──────────────────────────────────────────────────
  listIdeas: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, search, page = '1', limit = '20' } = req.query;
      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
      const skip = (pageNum - 1) * limitNum;

      const whereClause: any = {};
      if (category) whereClause.category = category as string;
      if (search) {
        whereClause.OR = [
          { title: { contains: search as string } },
          { description: { contains: search as string } },
        ];
      }

      const [ideas, total] = await Promise.all([
        prisma.researchIdea.findMany({
          where: whereClause,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                profile: { select: { fullName: true, avatarUrl: true, department: true } },
              },
            },
            likes: { select: { userId: true } },
            _count: { select: { comments: true, likes: true } },
          },
        }),
        prisma.researchIdea.count({ where: whereClause }),
      ]);

      res.json({
        success: true,
        data: {
          ideas,
          pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  createIdea: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const { title, description, category } = req.body;

      const idea = await prisma.researchIdea.create({
        data: {
          title,
          description,
          category,
          authorId: userId,
        },
        include: {
          author: {
            select: {
              id: true,
              profile: { select: { fullName: true, avatarUrl: true } },
            },
          },
        },
      });

      res.status(201).json({ success: true, message: 'Research idea posted', data: idea });
    } catch (error) {
      next(error);
    }
  },

  likeIdea: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ideaId = req.params.ideaId as string;
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const existing = await prisma.researchIdeaLike.findUnique({
        where: { ideaId_userId: { ideaId, userId } },
      });

      if (existing) {
        await prisma.researchIdeaLike.delete({ where: { id: existing.id } });
        await prisma.researchIdea.update({
          where: { id: ideaId },
          data: { likesCount: { decrement: 1 } },
        });
        return res.json({ success: true, message: 'Unliked idea', isLiked: false });
      } else {
        await prisma.researchIdeaLike.create({ data: { ideaId, userId } });
        await prisma.researchIdea.update({
          where: { id: ideaId },
          data: { likesCount: { increment: 1 } },
        });
        return res.json({ success: true, message: 'Liked idea', isLiked: true });
      }
    } catch (error) {
      next(error);
    }
  },

  commentIdea: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ideaId = req.params.ideaId as string;
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const { content } = req.body;
      const comment = await prisma.researchIdeaComment.create({
        data: { ideaId, authorId: userId, content },
        include: {
          author: {
            select: {
              id: true,
              profile: { select: { fullName: true, avatarUrl: true } },
            },
          },
        },
      });

      res.status(201).json({ success: true, message: 'Comment added', data: comment });
    } catch (error) {
      next(error);
    }
  },

  // ── 8. Add Publication ──────────────────────────────────────────────────────
  addPublication: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const project = await prisma.researchProject.findUnique({ where: { id } });
      if (!project) throw ApiError.notFound('Project not found');
      if (project.ownerId !== userId) {
        throw ApiError.forbidden('Only the project lead can register publications');
      }

      const pubData = req.body;
      const publication = await prisma.researchPublication.create({
        data: {
          researchProjectId: id,
          title: pubData.title,
          authors: pubData.authors,
          abstract: pubData.abstract || null,
          publicationDate: pubData.publicationDate ? new Date(pubData.publicationDate) : null,
          journalOrConference: pubData.journalOrConference || null,
          doi: pubData.doi || null,
          paperUrl: pubData.paperUrl || null,
          repositoryUrl: pubData.repositoryUrl || null,
        },
      });

      // Update project status to PUBLISHED
      await prisma.researchProject.update({
        where: { id },
        data: { researchStatus: ResearchStatus.PUBLISHED },
      });

      // Activity feed
      await createActivity({
        actorId: userId,
        type: ActivityType.RESEARCH_PUBLISHED,
        entityType: 'RESEARCH',
        title: `Published Research Paper: "${publication.title}"`,
        description: `Authors: ${publication.authors}. ${publication.journalOrConference || ''}`,
        entityId: id,
        visibility: ActivityVisibility.PUBLIC,
      }).catch(() => null);

      res.status(201).json({ success: true, message: 'Publication registered', data: publication });
    } catch (error) {
      next(error);
    }
  },
};
