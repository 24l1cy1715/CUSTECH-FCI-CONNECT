import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';
import { AchievementService } from '../services/achievement.service';

// Helper to slugify string
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * GET /api/v1/skills
 * List, search, and filter skills by category
 */
export async function getSkills(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, category, page = 1, limit = 50 } = req.query as {
      search?: string;
      category?: any;
      page?: number;
      limit?: number;
    };

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const [skills, total] = await Promise.all([
      (prisma as any).skill.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              studentSkills: true,
              projectSkills: true,
            },
          },
        },
      }),
      (prisma as any).skill.count({ where }),
    ]);

    const formatted = skills.map((s: any) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      category: s.category,
      description: s.description,
      studentCount: s._count?.studentSkills ?? 0,
      projectCount: s._count?.projectSkills ?? 0,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    res.json({
      success: true,
      data: formatted,
      pagination: {
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
      meta: {
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/skills/:id
 * Get single skill detail with students and related projects
 */
export async function getSkillById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);

    const skill = await (prisma as any).skill.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        studentSkills: {
          include: {
            user: {
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
                    communityPoints: true,
                  },
                },
              },
            },
          },
        },
        projectSkills: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                category: true,
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
          },
        },
      },
    });

    if (!skill) {
      throw ApiError.notFound(`Skill with ID or slug "${id}" not found`);
    }

    // Get sibling skills in the same category
    const relatedSkills = await (prisma as any).skill.findMany({
      where: {
        category: skill.category,
        id: { not: skill.id },
      },
      take: 6,
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
      },
    });

    const students = (skill.studentSkills || [])
      .filter((ss: any) => ss.user?.profile)
      .map((ss: any) => ({
        id: ss.user.id,
        fullName: ss.user.profile?.fullName,
        username: ss.user.profile?.username,
        avatarUrl: ss.user.profile?.avatarUrl,
        department: ss.user.profile?.department,
        level: ss.user.profile?.level,
        communityPoints: ss.user.profile?.communityPoints,
        proficiency: ss.proficiency,
        yearsOfExperience: ss.yearsOfExperience,
        isPrimary: ss.isPrimary,
      }));

    const projects = (skill.projectSkills || []).map((ps: any) => ({
      id: ps.project?.id,
      title: ps.project?.title,
      slug: ps.project?.slug,
      description: ps.project?.description,
      category: ps.project?.category,
      authorName: ps.project?.author?.profile?.fullName,
      authorAvatar: ps.project?.author?.profile?.avatarUrl,
    }));

    res.json({
      success: true,
      data: {
        id: skill.id,
        name: skill.name,
        slug: skill.slug,
        category: skill.category,
        description: skill.description,
        students,
        projects,
        relatedSkills,
        studentsCount: students.length,
        projectsCount: projects.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/skills
 * Create a new skill
 */
export async function createSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, category, description } = req.body;
    const slug = slugify(name);

    const existing = await (prisma as any).skill.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    });

    if (existing) {
      throw ApiError.conflict(`Skill "${name}" already exists`);
    }

    const skill = await (prisma as any).skill.create({
      data: {
        name,
        slug,
        category,
        description,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: skill,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/users/:userId/skills
 * Get student skills and interactive Skill Graph data
 */
export async function getUserSkills(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let userId = String(req.params.userId);

    if (userId === 'me') {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      userId = req.user.userId;
    }

    const user = await (prisma as any).user.findFirst({
      where: {
        OR: [
          { id: userId },
          { profile: { username: userId } },
        ],
      },
      include: {
        profile: true,
        studentSkills: {
          include: {
            skill: true,
          },
          orderBy: [
            { isPrimary: 'desc' },
            { proficiency: 'desc' },
          ],
        },
        projects: {
          where: { status: 'APPROVED' },
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.profile) {
      throw ApiError.notFound('Student profile not found');
    }

    const studentSkills = user.studentSkills || [];
    const projects = user.projects || [];

    const skills = studentSkills.map((ss: any) => ({
      id: ss.id,
      skillId: ss.skill.id,
      name: ss.skill.name,
      slug: ss.skill.slug,
      category: ss.skill.category,
      description: ss.skill.description,
      proficiency: ss.proficiency,
      yearsOfExperience: ss.yearsOfExperience,
      isPrimary: ss.isPrimary,
      createdAt: ss.createdAt,
    }));

    // ── Build Skill Graph Data Structure ─────────────────────────
    const graphNodes: Array<{
      id: string;
      label: string;
      type: 'student' | 'skill' | 'category' | 'project';
      category?: string;
      proficiency?: string;
      isPrimary?: boolean;
    }> = [
      {
        id: `student-${user.id}`,
        label: user.profile.fullName,
        type: 'student',
      },
    ];

    const graphLinks: Array<{
      source: string;
      target: string;
      type: 'has_skill' | 'belongs_to' | 'used_in';
    }> = [];

    const categoriesPresent = new Set<string>();

    for (const ss of studentSkills) {
      const skillNodeId = `skill-${ss.skill.id}`;
      graphNodes.push({
        id: skillNodeId,
        label: ss.skill.name,
        type: 'skill',
        category: ss.skill.category,
        proficiency: ss.proficiency,
        isPrimary: ss.isPrimary,
      });

      // Link: Student -> Skill
      graphLinks.push({
        source: `student-${user.id}`,
        target: skillNodeId,
        type: 'has_skill',
      });

      categoriesPresent.add(ss.skill.category);
    }

    // Projects nodes & links to skills
    for (const proj of projects) {
      const projNodeId = `project-${proj.id}`;
      graphNodes.push({
        id: projNodeId,
        label: proj.title,
        type: 'project',
      });

      for (const ps of proj.skills || []) {
        const skillNodeId = `skill-${ps.skill?.id}`;
        if (graphNodes.some((n) => n.id === skillNodeId)) {
          graphLinks.push({
            source: skillNodeId,
            target: projNodeId,
            type: 'used_in',
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        userId: user.id,
        student: {
          id: user.id,
          fullName: user.profile.fullName,
          username: user.profile.username,
          avatarUrl: user.profile.avatarUrl,
          department: user.profile.department,
          level: user.profile.level,
        },
        skills,
        graph: {
          nodes: graphNodes,
          links: graphLinks,
          totalSkills: skills.length,
          categories: Array.from(categoriesPresent),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/users/:userId/skills
 * Add skill to student profile
 */
export async function addUserSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let userId = String(req.params.userId);
    if (userId === 'me') {
      userId = req.user!.userId;
    }

    // IDOR Authorization Check
    const isOwner = req.user?.userId === userId;
    const isAdmin = req.user?.roles.includes('ADMIN') || req.user?.roles.includes('SUPER_ADMIN');

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('You are only authorized to manage your own skills');
    }

    const { skillId, proficiency = 'INTERMEDIATE', yearsOfExperience, isPrimary = false } = req.body;

    // Verify skill exists
    const skill = await (prisma as any).skill.findUnique({
      where: { id: String(skillId) },
    });

    if (!skill) {
      throw ApiError.notFound('Skill not found');
    }

    // Check for duplicate
    const existing = await (prisma as any).studentSkill.findUnique({
      where: {
        userId_skillId: {
          userId,
          skillId: String(skillId),
        },
      },
    });

    if (existing) {
      throw ApiError.conflict(`Skill "${skill.name}" is already in your profile`);
    }

    // If marked primary, unset other primaries if needed
    if (isPrimary) {
      const primaryCount = await (prisma as any).studentSkill.count({
        where: { userId, isPrimary: true },
      });
      if (primaryCount >= 3) {
        const oldestPrimary = await (prisma as any).studentSkill.findFirst({
          where: { userId, isPrimary: true },
          orderBy: { createdAt: 'asc' },
        });
        if (oldestPrimary) {
          await (prisma as any).studentSkill.update({
            where: { id: oldestPrimary.id },
            data: { isPrimary: false },
          });
        }
      }
    }

    const studentSkill = await (prisma as any).studentSkill.create({
      data: {
        userId,
        skillId: String(skillId),
        proficiency,
        yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : null,
        isPrimary,
      },
      include: {
        skill: true,
      },
    });

    // Award community points for expanding tech profile (+20 pts)
    await (prisma as any).profile.update({
      where: { userId },
      data: {
        communityPoints: { increment: 20 },
      },
    });

    // Check if student reached 5+ skills to unlock Skill Graph Master achievement
    const totalSkillsCount = await prisma.studentSkill.count({ where: { userId } });
    if (totalSkillsCount >= 5) {
      await AchievementService.awardAutomaticAchievement(userId, 'skill-graph-master', {
        type: 'SKILL',
        id: studentSkill.id,
        description: 'Unlocked Skill Graph Master badge for adding 5+ technical proficiencies',
      });
    }

    res.status(201).json({
      success: true,
      message: `Skill "${skill.name}" added to profile (+20 points awarded)`,
      data: {
        id: studentSkill.id,
        skillId: studentSkill.skill.id,
        name: studentSkill.skill.name,
        category: studentSkill.skill.category,
        proficiency: studentSkill.proficiency,
        yearsOfExperience: studentSkill.yearsOfExperience,
        isPrimary: studentSkill.isPrimary,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/users/:userId/skills/:skillId
 * Update skill proficiency, experience or primary status
 */
export async function updateUserSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let userId = String(req.params.userId);
    const skillId = String(req.params.skillId);
    if (userId === 'me') {
      userId = req.user!.userId;
    }

    const isOwner = req.user?.userId === userId;
    const isAdmin = req.user?.roles.includes('ADMIN') || req.user?.roles.includes('SUPER_ADMIN');

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('You are only authorized to modify your own skills');
    }

    const studentSkill = await (prisma as any).studentSkill.findFirst({
      where: {
        userId,
        OR: [{ id: skillId }, { skillId }],
      },
      include: { skill: true },
    });

    if (!studentSkill) {
      throw ApiError.notFound('Student skill relationship not found');
    }

    const { proficiency, yearsOfExperience, isPrimary } = req.body;

    const updated = await (prisma as any).studentSkill.update({
      where: { id: studentSkill.id },
      data: {
        ...(proficiency ? { proficiency } : {}),
        ...(yearsOfExperience !== undefined ? { yearsOfExperience: Number(yearsOfExperience) } : {}),
        ...(isPrimary !== undefined ? { isPrimary } : {}),
      },
      include: { skill: true },
    });

    res.json({
      success: true,
      message: `Updated "${updated.skill.name}" proficiency`,
      data: {
        id: updated.id,
        skillId: updated.skill.id,
        name: updated.skill.name,
        proficiency: updated.proficiency,
        yearsOfExperience: updated.yearsOfExperience,
        isPrimary: updated.isPrimary,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/users/:userId/skills/:skillId
 * Remove skill from student profile
 */
export async function deleteUserSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let userId = String(req.params.userId);
    const skillId = String(req.params.skillId);
    if (userId === 'me') {
      userId = req.user!.userId;
    }

    const isOwner = req.user?.userId === userId;
    const isAdmin = req.user?.roles.includes('ADMIN') || req.user?.roles.includes('SUPER_ADMIN');

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('You are only authorized to remove your own skills');
    }

    const studentSkill = await (prisma as any).studentSkill.findFirst({
      where: {
        userId,
        OR: [{ id: skillId }, { skillId }],
      },
      include: { skill: true },
    });

    if (!studentSkill) {
      throw ApiError.notFound('Student skill relationship not found');
    }

    await (prisma as any).studentSkill.delete({
      where: { id: studentSkill.id },
    });

    res.json({
      success: true,
      message: `Skill "${studentSkill.skill.name}" removed from profile`,
    });
  } catch (error) {
    next(error);
  }
}
