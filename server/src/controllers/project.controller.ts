import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';
import { ProjectCategory, ProjectStatus } from '@prisma/client';

function mapToProjectCategory(cat: string): ProjectCategory {
  const upper = (cat || '').toUpperCase().trim();
  switch (upper) {
    case 'WEB':
    case 'WEB_DEVELOPMENT':
      return ProjectCategory.WEB_DEVELOPMENT;
    case 'MOBILE':
    case 'MOBILE_DEVELOPMENT':
      return ProjectCategory.MOBILE_DEVELOPMENT;
    case 'CYBERSECURITY':
    case 'CYBER_SECURITY':
      return ProjectCategory.CYBERSECURITY;
    case 'AI':
    case 'ARTIFICIAL_INTELLIGENCE':
      return ProjectCategory.ARTIFICIAL_INTELLIGENCE;
    case 'ML':
    case 'MACHINE_LEARNING':
      return ProjectCategory.MACHINE_LEARNING;
    case 'DATA_SCIENCE':
      return ProjectCategory.DATA_SCIENCE;
    case 'NETWORKING':
      return ProjectCategory.NETWORKING;
    case 'CLOUD':
    case 'CLOUD_COMPUTING':
      return ProjectCategory.CLOUD_COMPUTING;
    case 'UI_UX':
      return ProjectCategory.UI_UX;
    case 'SOFTWARE_ENGINEERING':
      return ProjectCategory.SOFTWARE_ENGINEERING;
    case 'HARDWARE':
      return ProjectCategory.HARDWARE;
    case 'IOT':
      return ProjectCategory.IOT;
    default:
      return ProjectCategory.OTHER;
  }
}

export const projectController = {
  listProjects: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUserId = req.user?.userId;
      const { category, search, page = '1', limit = '30' } = req.query;

      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      if (category && category !== 'ALL') {
        where.category = mapToProjectCategory(category as string);
      }

      if (search) {
        const query = String(search).trim();
        where.OR = [
          { title: { contains: query } },
          { description: { contains: query } },
          {
            projectTechnologies: {
              some: {
                technology: {
                  name: { contains: query },
                },
              },
            },
          },
        ];
      }

      const [total, projects] = await Promise.all([
        prisma.project.count({ where }),
        prisma.project.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
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
                    level: true,
                  },
                },
              },
            },
            images: {
              orderBy: { orderIndex: 'asc' },
              select: { url: true },
            },
            projectTechnologies: {
              include: {
                technology: { select: { name: true } },
              },
            },
            likes: currentUserId
              ? {
                  where: { userId: currentUserId },
                  select: { id: true },
                }
              : false,
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        }),
      ]);

      const formatted = projects.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description || '',
        category: p.category,
        githubUrl: p.githubUrl || undefined,
        demoUrl: p.demoUrl || undefined,
        authorId: p.authorId,
        author: {
          id: p.author.id,
          fullName: p.author.profile?.fullName || 'FCI Innovator',
          username: p.author.profile?.username || 'innovator',
          avatarUrl: p.author.profile?.avatarUrl || undefined,
          department: p.author.profile?.department || 'COMPUTER_SCIENCE',
          level: (p.author.profile?.level as any) || '100',
        },
        technologies: p.projectTechnologies.map((pt) => pt.technology.name),
        images: p.images.map((img) => img.url),
        likesCount: p._count.likes,
        commentsCount: p._count.comments,
        viewsCount: p.views,
        isLiked: currentUserId ? p.likes && p.likes.length > 0 : false,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
      }));

      res.json({
        success: true,
        data: formatted,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  getProjectBySlug: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUserId = req.user?.userId;
      const { slug } = req.params;

      const project = (await prisma.project.findFirst({
        where: {
          OR: [{ slug }, { id: slug }],
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
          images: {
            orderBy: { orderIndex: 'asc' },
            select: { url: true },
          },
          projectTechnologies: {
            include: {
              technology: { select: { name: true } },
            },
          },
          comments: {
            where: { isHidden: false },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
              author: {
                select: {
                  id: true,
                  profile: {
                    select: {
                      fullName: true,
                      username: true,
                      avatarUrl: true,
                    },
                  },
                },
              },
            },
          },
          likes: currentUserId
            ? {
                where: { userId: currentUserId },
                select: { id: true },
              }
            : false,
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      })) as any;

      if (!project) {
        throw ApiError.notFound('Project not found');
      }

      // Increment view count asynchronously
      prisma.project
        .update({
          where: { id: project.id },
          data: { views: { increment: 1 } },
        })
        .catch(() => null);

      const formatted = {
        id: project.id,
        slug: project.slug,
        title: project.title,
        description: project.description || '',
        category: project.category,
        githubUrl: project.githubUrl || undefined,
        demoUrl: project.demoUrl || undefined,
        authorId: project.authorId,
        author: {
          id: project.author.id,
          fullName: project.author.profile?.fullName || 'FCI Innovator',
          username: project.author.profile?.username || 'innovator',
          avatarUrl: project.author.profile?.avatarUrl || undefined,
          department: project.author.profile?.department || 'COMPUTER_SCIENCE',
          level: (project.author.profile?.level as any) || '100',
        },
        technologies: project.projectTechnologies.map((pt) => pt.technology.name),
        images: project.images.map((img) => img.url),
        likesCount: project._count.likes,
        commentsCount: project._count.comments,
        viewsCount: project.views + 1,
        isLiked: currentUserId ? project.likes && project.likes.length > 0 : false,
        status: project.status,
        createdAt: project.createdAt.toISOString(),
        comments: project.comments.map((c) => ({
          id: c.id,
          author: c.author.profile?.fullName || 'FCI Student',
          avatar: c.author.profile?.avatarUrl || undefined,
          content: c.content,
          createdAt: c.createdAt.toISOString(),
        })),
      };

      res.json({ success: true, data: formatted });
    } catch (error) {
      next(error);
    }
  },

  createProject: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required to upload a project');

      const { title, description, category, githubUrl, demoUrl, technologies = [], images = [] } = req.body;

      const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const uniqueSuffix = Math.random().toString(36).substring(2, 8);
      const slug = `${baseSlug}-${uniqueSuffix}`;

      const mappedCategory = mapToProjectCategory(category);

      // Create or find technologies
      const techRecords = await Promise.all(
        technologies.map(async (techName: string) => {
          const trimmed = techName.trim();
          if (!trimmed) return null;
          return prisma.technology.upsert({
            where: { name: trimmed },
            create: { name: trimmed },
            update: {},
          });
        })
      );
      const validTechs = techRecords.filter(Boolean);

      const project = await prisma.project.create({
        data: {
          title,
          slug,
          description: description || null,
          category: mappedCategory,
          githubUrl: githubUrl || null,
          demoUrl: demoUrl || null,
          authorId: userId,
          status: ProjectStatus.APPROVED, // Approved so it immediately displays on the showcase
          images: {
            create: images.map((url: string, index: number) => ({
              url,
              orderIndex: index,
            })),
          },
          projectTechnologies: {
            create: validTechs.map((t) => ({
              technologyId: t!.id,
            })),
          },
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
          images: true,
          projectTechnologies: {
            include: { technology: true },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: 'Project showcase published successfully',
        data: {
          id: project.id,
          slug: project.slug,
          title: project.title,
          description: project.description,
          category: project.category,
          githubUrl: project.githubUrl,
          demoUrl: project.demoUrl,
          authorId: project.authorId,
          technologies: project.projectTechnologies.map((pt) => pt.technology.name),
          images: project.images.map((img) => img.url),
          likesCount: 0,
          viewsCount: 0,
          status: project.status,
          createdAt: project.createdAt.toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  likeProject: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const projectIdOrSlug = String(req.params.id);

      const project = await prisma.project.findFirst({
        where: { OR: [{ id: projectIdOrSlug }, { slug: projectIdOrSlug }] },
      });
      if (!project) throw ApiError.notFound('Project not found');

      const existingLike = await prisma.projectLike.findUnique({
        where: {
          projectId_userId: { projectId: project.id, userId },
        },
      });

      if (existingLike) {
        await prisma.projectLike.delete({
          where: { id: existingLike.id },
        });
        const count = await prisma.projectLike.count({ where: { projectId: project.id } });
        return res.json({ success: true, message: 'Unliked project', isLiked: false, likesCount: count });
      } else {
        await prisma.projectLike.create({
          data: { projectId: project.id, userId },
        });
        const count = await prisma.projectLike.count({ where: { projectId: project.id } });
        return res.json({ success: true, message: 'Liked project', isLiked: true, likesCount: count });
      }
    } catch (error) {
      next(error);
    }
  },
};
