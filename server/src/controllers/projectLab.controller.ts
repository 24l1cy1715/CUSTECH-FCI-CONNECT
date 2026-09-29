import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';
import {
  LabProjectVisibility,
  LabProjectStatus,
  LabTeamRole,
  LabMemberStatus,
  LabTaskStatus,
  NotificationType,
  ActivityType,
  ActivityVisibility,
} from '@prisma/client';
import { createActivity } from '../services/activity.service';

// Helper: Calculate legitimate completion percentage from tasks & milestones
export const calculateProjectProgress = (tasks: Array<{ status: LabTaskStatus }>, milestones: Array<{ status: string }>): number => {
  const totalItems = tasks.length + milestones.length;
  if (totalItems === 0) return 0;

  const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
  const completedMilestones = milestones.filter((m) => m.status === 'COMPLETED').length;

  return Math.round(((completedTasks + completedMilestones) / totalItems) * 100);
};

export const projectLabController = {
  // ── 1. List Projects ───────────────────────────────────────────────────────
  listProjects: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const { view = 'my', category, status, search, page = '1', limit = '12' } = req.query;

      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
      const skip = (pageNum - 1) * limitNum;

      const whereClause: any = {};

      if (view === 'my' && userId) {
        whereClause.OR = [
          { createdById: userId },
          { mentorId: userId },
          { members: { some: { userId, status: LabMemberStatus.ACTIVE } } },
        ];
      } else {
        // Explore view: only public or FCI_ONLY projects
        whereClause.visibility = { in: [LabProjectVisibility.PUBLIC, LabProjectVisibility.FCI_ONLY] };
      }

      if (category) whereClause.category = category;
      if (status) whereClause.status = status;
      if (search) {
        whereClause.OR = [
          { title: { contains: search as string } },
          { description: { contains: search as string } },
          { problemStatement: { contains: search as string } },
        ];
      }

      const [projects, total] = await Promise.all([
        prisma.labProject.findMany({
          where: whereClause,
          skip,
          take: limitNum,
          orderBy: { updatedAt: 'desc' },
          include: {
            createdBy: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    fullName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
            mentor: {
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
            members: {
              where: { status: LabMemberStatus.ACTIVE },
              select: {
                id: true,
                role: true,
                user: {
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
            tasks: {
              select: { status: true },
            },
            milestones: {
              select: { status: true },
            },
            _count: {
              select: {
                tasks: true,
                milestones: true,
                discussions: true,
                resources: true,
              },
            },
          },
        }),
        prisma.labProject.count({ where: whereClause }),
      ]);

      // Calculate legitimate progress for each project
      const mappedProjects = projects.map((p) => {
        const progressPercentage = calculateProjectProgress(p.tasks, p.milestones);
        const { tasks, milestones, ...rest } = p;
        return {
          ...rest,
          progressPercentage,
        };
      });

      res.json({
        success: true,
        data: {
          projects: mappedProjects,
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

  // ── 2. Get Project Detail ──────────────────────────────────────────────────
  getProjectDetail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user?.userId;

      const project = await prisma.labProject.findFirst({
        where: {
          OR: [{ id }, { slug: id }],
        },
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  fullName: true,
                  avatarUrl: true,
                  department: true,
                },
              },
            },
          },
          mentor: {
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
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  profile: {
                    select: {
                      fullName: true,
                      avatarUrl: true,
                      department: true,
                      level: true,
                    },
                  },
                },
              },
            },
          },
          tasks: {
            orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
            include: {
              assignee: {
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
              creator: {
                select: {
                  id: true,
                  profile: {
                    select: {
                      fullName: true,
                    },
                  },
                },
              },
            },
          },
          milestones: {
            orderBy: { position: 'asc' },
          },
          resources: {
            orderBy: { createdAt: 'desc' },
            include: {
              addedBy: {
                select: {
                  id: true,
                  profile: {
                    select: {
                      fullName: true,
                    },
                  },
                },
              },
              learningResource: {
                select: { id: true, title: true, slug: true, resourceType: true },
              },
            },
          },
          showcaseProject: {
            select: { id: true, slug: true, title: true, status: true },
          },
          opportunity: {
            select: { id: true, slug: true, title: true, organization: true },
          },
          _count: {
            select: {
              discussions: true,
              tasks: true,
              milestones: true,
            },
          },
        },
      });

      if (!project) {
        throw ApiError.notFound('Lab project');
      }

      // Privacy Check: if PRIVATE, only members, creator, or mentor can view
      const isMember = project.members.some((m) => m.userId === userId && m.status === LabMemberStatus.ACTIVE);
      const isCreator = project.createdById === userId;
      const isMentor = project.mentorId === userId;
      const isAdmin = req.user?.roles?.includes('ADMIN') || req.user?.roles?.includes('SUPER_ADMIN');

      if (project.visibility === LabProjectVisibility.PRIVATE && !isMember && !isCreator && !isMentor && !isAdmin) {
        throw ApiError.forbidden('You do not have access to this private project workspace');
      }

      const progressPercentage = calculateProjectProgress(project.tasks, project.milestones);

      res.json({
        success: true,
        data: {
          ...project,
          progressPercentage,
          userMembership: project.members.find((m) => m.userId === userId) || null,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 3. Create Project ──────────────────────────────────────────────────────
  createProject: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const {
        title,
        description,
        category,
        problemStatement,
        objectives,
        department,
        visibility = LabProjectVisibility.FCI_ONLY,
        startDate,
        targetDate,
        githubUrl,
        liveDemoUrl,
        documentationUrl,
        coverImage,
        opportunityId,
        mentorId,
      } = req.body;

      // Unique slug generation
      let baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      if (!baseSlug) baseSlug = 'lab-project';
      let slug = baseSlug;
      let counter = 1;

      while (await prisma.labProject.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const project = await prisma.labProject.create({
        data: {
          title,
          slug,
          description,
          category,
          problemStatement,
          objectives,
          department,
          visibility,
          status: LabProjectStatus.PLANNING,
          startDate: startDate ? new Date(startDate) : new Date(),
          targetDate: targetDate ? new Date(targetDate) : undefined,
          githubUrl: githubUrl || undefined,
          liveDemoUrl: liveDemoUrl || undefined,
          documentationUrl: documentationUrl || undefined,
          coverImage: coverImage || undefined,
          opportunityId: opportunityId || undefined,
          mentorId: mentorId || undefined,
          createdById: userId,
          members: {
            create: {
              userId,
              role: LabTeamRole.PROJECT_LEAD,
              status: LabMemberStatus.ACTIVE,
              joinedAt: new Date(),
            },
          },
        },
        include: {
          members: true,
        },
      });

      // Public Activity Feed entry if project is public
      if (visibility === LabProjectVisibility.PUBLIC) {
        await createActivity({
          actorId: userId,
          type: ActivityType.LAB_PROJECT_CREATED,
          entityType: 'LAB_PROJECT',
          entityId: project.id,
          title: `Started Project Lab Project: ${title}`,
          description: description.substring(0, 200),
          visibility: ActivityVisibility.PUBLIC,
        });
      }

      res.status(201).json({
        success: true,
        data: project,
        message: 'Lab project workspace created successfully!',
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 4. Update Project ──────────────────────────────────────────────────────
  updateProject: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;

      const existing = await prisma.labProject.findUnique({
        where: { id },
        include: { members: true },
      });

      if (!existing) throw ApiError.notFound('Project');

      const isLead =
        existing.createdById === userId ||
        existing.members.some(
          (m) => m.userId === userId && m.role === LabTeamRole.PROJECT_LEAD && m.status === LabMemberStatus.ACTIVE,
        );
      const isAdmin = req.user?.roles?.includes('ADMIN') || req.user?.roles?.includes('SUPER_ADMIN');

      if (!isLead && !isAdmin) {
        throw ApiError.forbidden('Only the Project Lead or Administrator can edit project settings');
      }

      const {
        title,
        description,
        category,
        problemStatement,
        objectives,
        department,
        visibility,
        status,
        startDate,
        targetDate,
        githubUrl,
        liveDemoUrl,
        documentationUrl,
        coverImage,
        mentorId,
      } = req.body;

      const safeData: any = {};
      if (title !== undefined) safeData.title = title;
      if (description !== undefined) safeData.description = description;
      if (category !== undefined) safeData.category = category;
      if (problemStatement !== undefined) safeData.problemStatement = problemStatement;
      if (objectives !== undefined) safeData.objectives = objectives;
      if (department !== undefined) safeData.department = department;
      if (visibility !== undefined) safeData.visibility = visibility;
      if (status !== undefined) safeData.status = status;
      if (startDate !== undefined) safeData.startDate = startDate ? new Date(startDate) : null;
      if (targetDate !== undefined) safeData.targetDate = targetDate ? new Date(targetDate) : null;
      if (githubUrl !== undefined) safeData.githubUrl = githubUrl || null;
      if (liveDemoUrl !== undefined) safeData.liveDemoUrl = liveDemoUrl || null;
      if (documentationUrl !== undefined) safeData.documentationUrl = documentationUrl || null;
      if (coverImage !== undefined) safeData.coverImage = coverImage || null;
      if (mentorId !== undefined) safeData.mentorId = mentorId || null;

      const updated = await prisma.labProject.update({
        where: { id },
        data: safeData,
      });

      res.json({
        success: true,
        data: updated,
        message: 'Project updated successfully!',
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 5. Member Management: Invite ───────────────────────────────────────────
  inviteMember: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const currentUserId = req.user!.userId;
      const { userId, role = LabTeamRole.DEVELOPER } = req.body;

      const project = await prisma.labProject.findUnique({
        where: { id },
        include: { members: true },
      });

      if (!project) throw ApiError.notFound('Project');

      // Verify permission to invite
      const isLead =
        project.createdById === currentUserId ||
        project.members.some(
          (m) => m.userId === currentUserId && m.role === LabTeamRole.PROJECT_LEAD && m.status === LabMemberStatus.ACTIVE,
        );

      if (!isLead) throw ApiError.forbidden('Only the Project Lead can invite new team members');

      // Prevent duplicate membership
      const existingMember = await prisma.labProjectMember.findUnique({
        where: { projectId_userId: { projectId: id, userId } },
      });

      if (existingMember) {
        if (existingMember.status === LabMemberStatus.ACTIVE) {
          throw ApiError.badRequest('Student is already an active member of this project');
        }
        if (existingMember.status === LabMemberStatus.INVITED) {
          throw ApiError.badRequest('An invitation has already been sent to this student');
        }
      }

      const member = await prisma.labProjectMember.upsert({
        where: { projectId_userId: { projectId: id, userId } },
        update: {
          role,
          status: LabMemberStatus.INVITED,
        },
        create: {
          projectId: id,
          userId,
          role,
          status: LabMemberStatus.INVITED,
        },
        include: {
          user: {
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
      });

      // Send in-platform notification
      await prisma.notification.create({
        data: {
          userId,
          type: NotificationType.PROJECT_LAB_INVITATION,
          title: 'Project Lab Invitation',
          message: `You were invited to join "${project.title}" as ${role}.`,
          entityType: 'LAB_PROJECT',
          entityId: project.id,
        },
      });

      res.status(201).json({
        success: true,
        data: member,
        message: 'Invitation sent to student!',
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 6. Member Management: Respond (Accept/Decline) ─────────────────────────
  respondInvitation: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const currentUserId = req.user!.userId;
      const { action } = req.body; // 'ACCEPT' | 'DECLINE'

      const member = await prisma.labProjectMember.findUnique({
        where: { projectId_userId: { projectId: id, userId: currentUserId } },
      });

      if (!member || member.status !== LabMemberStatus.INVITED) {
        throw ApiError.notFound('Pending invitation');
      }

      if (action === 'ACCEPT') {
        const updated = await prisma.labProjectMember.update({
          where: { id: member.id },
          data: {
            status: LabMemberStatus.ACTIVE,
            joinedAt: new Date(),
          },
        });

        res.json({
          success: true,
          data: updated,
          message: 'Welcome to the project team!',
        });
      } else {
        await prisma.labProjectMember.update({
          where: { id: member.id },
          data: { status: LabMemberStatus.DECLINED },
        });

        res.json({
          success: true,
          message: 'Invitation declined.',
        });
      }
    } catch (error) {
      next(error);
    }
  },

  // ── 7. Member Management: Remove / Leave ───────────────────────────────────
  removeMember: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const memberId = req.params.memberId as string;
      const currentUserId = req.user!.userId;

      const project = await prisma.labProject.findUnique({
        where: { id },
        include: { members: true },
      });

      if (!project) throw ApiError.notFound('Project');

      const targetMember = project.members.find((m) => m.id === memberId);
      if (!targetMember) throw ApiError.notFound('Team member');

      const isLead =
        project.createdById === currentUserId ||
        project.members.some(
          (m) => m.userId === currentUserId && m.role === LabTeamRole.PROJECT_LEAD && m.status === LabMemberStatus.ACTIVE,
        );
      const isSelf = targetMember.userId === currentUserId;

      if (!isLead && !isSelf) {
        throw ApiError.forbidden('You do not have permission to remove this member');
      }

      // Creator cannot be removed
      if (targetMember.userId === project.createdById) {
        throw ApiError.badRequest('Project creator cannot be removed from the team');
      }

      await prisma.labProjectMember.delete({ where: { id: memberId } });

      res.json({
        success: true,
        message: 'Member removed from team.',
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 8. Task Management: Create Task ────────────────────────────────────────
  createTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const currentUserId = req.user!.userId;
      const {
        title,
        description,
        status = LabTaskStatus.TODO,
        priority = 'MEDIUM',
        assigneeId,
        milestoneId,
        dueDate,
        position = 0,
      } = req.body;

      const project = await prisma.labProject.findUnique({
        where: { id },
        include: { members: true },
      });

      if (!project) throw ApiError.notFound('Project');

      const isMember =
        project.createdById === currentUserId ||
        project.members.some((m) => m.userId === currentUserId && m.status === LabMemberStatus.ACTIVE);

      if (!isMember) throw ApiError.forbidden('Only project members can create tasks');

      const task = await prisma.labProjectTask.create({
        data: {
          projectId: id,
          creatorId: currentUserId,
          title,
          description,
          status,
          priority,
          assigneeId: assigneeId || undefined,
          milestoneId: milestoneId || undefined,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          position,
        },
        include: {
          assignee: {
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
      });

      // If assigned to someone else, send notification
      if (assigneeId && assigneeId !== currentUserId) {
        await prisma.notification.create({
          data: {
            userId: assigneeId,
            type: NotificationType.PROJECT_LAB_TASK_ASSIGNED,
            title: 'New Task Assigned',
            message: `You were assigned "${title}" on project "${project.title}".`,
            entityType: 'LAB_PROJECT',
            entityId: project.id,
          },
        });
      }

      res.status(201).json({
        success: true,
        data: task,
        message: 'Task added to board!',
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 9. Task Management: Update Task ────────────────────────────────────────
  updateTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const taskId = req.params.taskId as string;
      const currentUserId = req.user!.userId;

      const task = await prisma.labProjectTask.findUnique({
        where: { id: taskId },
        include: { project: { include: { members: true } } },
      });

      if (!task || task.projectId !== id) throw ApiError.notFound('Task');

      const isMember =
        task.project.createdById === currentUserId ||
        task.project.members.some((m) => m.userId === currentUserId && m.status === LabMemberStatus.ACTIVE);

      if (!isMember) throw ApiError.forbidden('Only project members can update tasks');

      const updated = await prisma.labProjectTask.update({
        where: { id: taskId },
        data: {
          ...req.body,
          dueDate: req.body.dueDate !== undefined ? (req.body.dueDate ? new Date(req.body.dueDate) : null) : undefined,
        },
        include: {
          assignee: {
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
      });

      res.json({
        success: true,
        data: updated,
        message: 'Task updated!',
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 10. Task Management: Delete Task ───────────────────────────────────────
  deleteTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const taskId = req.params.taskId as string;
      const currentUserId = req.user!.userId;

      const task = await prisma.labProjectTask.findUnique({
        where: { id: taskId },
        include: { project: true },
      });

      if (!task || task.projectId !== id) throw ApiError.notFound('Task');

      const isLead = task.project.createdById === currentUserId || task.creatorId === currentUserId;
      if (!isLead) throw ApiError.forbidden('Only the task creator or project lead can delete tasks');

      await prisma.labProjectTask.delete({ where: { id: taskId } });

      res.json({
        success: true,
        message: 'Task deleted.',
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 11. Milestone Management ───────────────────────────────────────────────
  createMilestone: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const currentUserId = req.user!.userId;
      const { title, description, dueDate, position = 0 } = req.body;

      const project = await prisma.labProject.findUnique({
        where: { id },
        include: { members: true },
      });

      if (!project) throw ApiError.notFound('Project');

      const isMember =
        project.createdById === currentUserId ||
        project.members.some((m) => m.userId === currentUserId && m.status === LabMemberStatus.ACTIVE);

      if (!isMember) throw ApiError.forbidden('Permission denied');

      const milestone = await prisma.labProjectMilestone.create({
        data: {
          projectId: id,
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          position,
        },
      });

      res.status(201).json({
        success: true,
        data: milestone,
        message: 'Milestone created!',
      });
    } catch (error) {
      next(error);
    }
  },

  updateMilestone: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const milestoneId = req.params.milestoneId as string;
      const currentUserId = req.user!.userId;

      const milestone = await prisma.labProjectMilestone.findUnique({
        where: { id: milestoneId },
        include: { project: { include: { members: true } } },
      });

      if (!milestone || milestone.projectId !== id) throw ApiError.notFound('Milestone');

      const isMember =
        milestone.project.createdById === currentUserId ||
        milestone.project.members.some((m) => m.userId === currentUserId && m.status === LabMemberStatus.ACTIVE);

      if (!isMember) throw ApiError.forbidden('Permission denied');

      const dataToUpdate: any = { ...req.body };
      if (req.body.status === 'COMPLETED' && milestone.status !== 'COMPLETED') {
        dataToUpdate.completedAt = new Date();
      } else if (req.body.status && req.body.status !== 'COMPLETED') {
        dataToUpdate.completedAt = null;
      }
      if (req.body.dueDate !== undefined) {
        dataToUpdate.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
      }

      const updated = await prisma.labProjectMilestone.update({
        where: { id: milestoneId },
        data: dataToUpdate,
      });

      res.json({
        success: true,
        data: updated,
        message: 'Milestone updated!',
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 12. Discussions ────────────────────────────────────────────────────────
  getDiscussions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const discussions = await prisma.labProjectDiscussion.findMany({
        where: { projectId: id, parentId: null },
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              profile: {
                select: {
                  fullName: true,
                  avatarUrl: true,
                  department: true,
                },
              },
            },
          },
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              author: {
                select: {
                  id: true,
                  profile: {
                    select: {
                      fullName: true,
                      avatarUrl: true,
                      department: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      res.json({
        success: true,
        data: discussions,
      });
    } catch (error) {
      next(error);
    }
  },

  createDiscussion: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const authorId = req.user!.userId;
      const { content, parentId } = req.body;

      const project = await prisma.labProject.findUnique({
        where: { id },
        include: { members: true },
      });

      if (!project) throw ApiError.notFound('Project');

      const isMember =
        project.createdById === authorId ||
        project.members.some((m) => m.userId === authorId && m.status === LabMemberStatus.ACTIVE);

      if (!isMember) throw ApiError.forbidden('Only project team members can participate in discussions');

      const discussion = await prisma.labProjectDiscussion.create({
        data: {
          projectId: id,
          authorId,
          content,
          parentId: parentId || undefined,
        },
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
      });

      res.status(201).json({
        success: true,
        data: discussion,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 13. Project Resources ──────────────────────────────────────────────────
  addResource: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const addedById = req.user!.userId;
      const { title, url, type = 'DOCUMENTATION', learningResourceId } = req.body;

      const resource = await prisma.labProjectResource.create({
        data: {
          projectId: id,
          addedById,
          title,
          url,
          type,
          learningResourceId: learningResourceId || undefined,
        },
        include: {
          addedBy: {
            select: {
              id: true,
              profile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          learningResource: { select: { id: true, title: true, slug: true } },
        },
      });

      res.status(201).json({
        success: true,
        data: resource,
        message: 'Resource attached to project!',
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 14. Submit Completed Project to Project Showcase ───────────────────────
  submitToShowcase: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;
      const { title, description, category, githubUrl, demoUrl, imageUrls = [] } = req.body;

      const labProject = await prisma.labProject.findUnique({
        where: { id },
        include: { showcaseProject: true },
      });

      if (!labProject) throw ApiError.notFound('Project');
      if (labProject.createdById !== userId) {
        throw ApiError.forbidden('Only the project creator can submit this project to the public Showcase');
      }

      if (labProject.showcaseProjectId) {
        throw ApiError.badRequest('This project has already been submitted to the Project Showcase');
      }

      // Generate unique showcase slug
      let baseSlug = (title || labProject.title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      let showcaseSlug = baseSlug;
      let counter = 1;
      while (await prisma.project.findUnique({ where: { slug: showcaseSlug } })) {
        showcaseSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Create Showcase Project in projects table (reuses existing Showcase architecture!)
      const showcaseProject = await prisma.project.create({
        data: {
          title: title || labProject.title,
          slug: showcaseSlug,
          description: description || labProject.description,
          category: category || labProject.category,
          githubUrl: githubUrl || labProject.githubUrl || undefined,
          demoUrl: demoUrl || labProject.liveDemoUrl || undefined,
          authorId: userId,
          status: 'PENDING', // Submits to existing moderation workflow
          images: {
            create: imageUrls.map((url: string, index: number) => ({
              url,
              orderIndex: index,
            })),
          },
        },
      });

      // Link showcase project back to Lab Project and update status to COMPLETED
      await prisma.labProject.update({
        where: { id },
        data: {
          showcaseProjectId: showcaseProject.id,
          status: LabProjectStatus.COMPLETED,
        },
      });

      // Post activity feed
      await createActivity({
        actorId: userId,
        type: ActivityType.LAB_PROJECT_COMPLETED,
        entityType: 'LAB_PROJECT',
        entityId: labProject.id,
        title: `Completed Project Lab Project: ${labProject.title}`,
        description: `Submitted to the FCI Project Showcase for faculty review.`,
        visibility: ActivityVisibility.PUBLIC,
      });

      res.status(201).json({
        success: true,
        data: showcaseProject,
        message: 'Project successfully submitted to the FCI Project Showcase! Under moderation review.',
      });
    } catch (error) {
      next(error);
    }
  },
};
