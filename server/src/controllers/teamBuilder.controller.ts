import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';

// ── Role Inference Keyword Rules ─────────────────────────────────────────────
const ROLE_PATTERNS: Record<string, string[]> = {
  'Backend Developer': ['python', 'nodejs', 'express', 'go', 'java', 'rust', 'mysql', 'postgresql', 'mongodb', 'redis', 'database', 'api', 'backend'],
  'Frontend Developer': ['react', 'nextjs', 'typescript', 'javascript', 'tailwind', 'vue', 'angular', 'html', 'css', 'frontend', 'web'],
  'AI / ML Engineer': ['machine-learning', 'deep-learning', 'pytorch', 'tensorflow', 'nlp', 'python', 'ai', 'model', 'computer-vision', 'pandas'],
  'Cybersecurity Specialist': ['penetration-testing', 'ethical-hacking', 'wireshark', 'burp-suite', 'cryptography', 'security', 'linux', 'networks'],
  'UI/UX Designer': ['figma', 'ui-ux-design', 'graphic-design', 'prototyping', 'wireframing', 'design', 'user-experience'],
  'Mobile App Developer': ['flutter', 'react-native', 'kotlin', 'swift', 'android', 'ios', 'mobile'],
  'DevOps / Cloud Engineer': ['docker', 'kubernetes', 'aws', 'linux', 'ci/cd', 'cloud', 'devops'],
};

const PROFICIENCY_MULTIPLIERS: Record<string, number> = {
  EXPERT: 1.0,
  ADVANCED: 0.85,
  INTERMEDIATE: 0.7,
  BEGINNER: 0.5,
};

/**
 * POST /api/v1/team-builder/analyze
 * Natural Language / Keyword Analysis of Project Description
 */
export async function analyzeProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectTitle = 'Project Initiative', description } = req.body;
    const combinedText = `${projectTitle} ${description}`.toLowerCase();

    // Fetch all skills in the database
    const allSkills = await (prisma as any).skill.findMany({
      select: { id: true, name: true, slug: true, category: true },
    });

    const detectedSkills: any[] = [];
    for (const s of allSkills) {
      const nameMatch = combinedText.includes(s.name.toLowerCase());
      const slugMatch = combinedText.includes(s.slug.replace(/-/g, ' '));
      if (nameMatch || slugMatch) {
        detectedSkills.push(s);
      }
    }

    // Infer suggested team roles based on detected skills and keywords
    const suggestedRoles: string[] = [];
    for (const [role, keywords] of Object.entries(ROLE_PATTERNS)) {
      const hasMatch = keywords.some((kw) => combinedText.includes(kw));
      if (hasMatch) {
        suggestedRoles.push(role);
      }
    }

    if (suggestedRoles.length === 0) {
      suggestedRoles.push('Fullstack Developer', 'UI/UX Designer');
    }

    res.json({
      success: true,
      data: {
        title: projectTitle,
        projectTitle,
        summary: description ? description.slice(0, 200) : '',
        detectedSkills: detectedSkills.map((s: any) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          category: s.category,
        })),
        requiredSkills: detectedSkills.map((s: any) => ({
          name: s.name,
          category: s.category,
          priority: 'REQUIRED',
          reason: `Extracted based on keyword match for ${s.name}`,
        })),
        suggestedRoles,
        recommendedTeamSize: Math.min(Math.max(suggestedRoles.length, 2), 5),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/team-builder/matches
 * Deterministic, Transparent Collaborator Matching Engine
 */
export async function findMatches(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      projectTitle,
      description = '',
      requiredSkills = [],
      preferredSkills = [],
      skills,
      targetRoles = [],
      preferredDepartment,
      department,
      preferredLevel,
      limit = 20,
    } = req.body;

    const currentUserId = req.user?.userId;

    let reqSkills: string[] = Array.isArray(requiredSkills) ? [...requiredSkills] : [];
    let prefSkills: string[] = Array.isArray(preferredSkills) ? [...preferredSkills] : [];

    if (skills && Array.isArray(skills)) {
      for (const s of skills) {
        if (s.priority === 'PREFERRED') {
          prefSkills.push(s.skillName);
        } else {
          reqSkills.push(s.skillName);
        }
      }
    }

    const deptFilter = preferredDepartment || department;
    const requiredSkillsLower = reqSkills.map((s) => s.toLowerCase().trim());
    const preferredSkillsLower = prefSkills.map((s) => s.toLowerCase().trim());

    // Fetch all student users with profiles and skills
    const candidates = await (prisma as any).user.findMany({
      where: {
        id: currentUserId ? { not: currentUserId } : undefined,
        isActive: true,
        isSuspended: false,
        profile: { isNot: null },
      },
      include: {
        profile: true,
        studentSkills: {
          include: {
            skill: true,
          },
        },
        projects: {
          where: { status: 'APPROVED' },
          select: {
            id: true,
            title: true,
            category: true,
            skills: {
              include: { skill: true },
            },
          },
        },
      },
    });

    // Score each candidate transparently
    const scoredCandidates = candidates
      .map((student: any) => {
        const studentSkillMap = new Map<string, { proficiency: string; isPrimary: boolean; skillName: string }>();
        for (const ss of student.studentSkills || []) {
          studentSkillMap.set(ss.skill.name.toLowerCase(), {
            proficiency: ss.proficiency,
            isPrimary: ss.isPrimary,
            skillName: ss.skill.name,
          });
          studentSkillMap.set(ss.skill.slug.toLowerCase(), {
            proficiency: ss.proficiency,
            isPrimary: ss.isPrimary,
            skillName: ss.skill.name,
          });
        }

        const matchedRequired: Array<{ name: string; proficiency: string; isPrimary: boolean }> = [];
        const missingRequired: string[] = [];

        let requiredSkillScore = 0;
        for (const reqSkill of requiredSkillsLower) {
          if (studentSkillMap.has(reqSkill)) {
            const data = studentSkillMap.get(reqSkill)!;
            const mult = PROFICIENCY_MULTIPLIERS[data.proficiency] ?? 0.7;
            requiredSkillScore += mult;
            matchedRequired.push({
              name: data.skillName,
              proficiency: data.proficiency,
              isPrimary: data.isPrimary,
            });
          } else {
            missingRequired.push(reqSkill);
          }
        }

        // Percentage of required skills met (weighted at 55%)
        const reqScoreNormalized =
          requiredSkillsLower.length > 0 ? (requiredSkillScore / requiredSkillsLower.length) * 55 : 0;

        // Preferred skills met (weighted at 20%)
        let preferredSkillScore = 0;
        const matchedPreferred: Array<{ name: string; proficiency: string }> = [];
        if (preferredSkillsLower.length > 0) {
          for (const prefSkill of preferredSkillsLower) {
            if (studentSkillMap.has(prefSkill)) {
              const data = studentSkillMap.get(prefSkill)!;
              const mult = PROFICIENCY_MULTIPLIERS[data.proficiency] ?? 0.7;
              preferredSkillScore += mult;
              matchedPreferred.push({ name: data.skillName, proficiency: data.proficiency });
            }
          }
          preferredSkillScore = (preferredSkillScore / preferredSkillsLower.length) * 20;
        }

        // Project history relevance (weighted at 15%)
        let projectBonus = 0;
        const studentProjects = student.projects || [];
        const relevantProjects = studentProjects.filter((p: any) => {
          return (p.skills || []).some((ps: any) =>
            requiredSkillsLower.includes(ps.skill?.name?.toLowerCase()) ||
            requiredSkillsLower.includes(ps.skill?.slug?.toLowerCase())
          );
        });
        if (relevantProjects.length >= 2) projectBonus = 15;
        else if (relevantProjects.length === 1) projectBonus = 10;
        else if (studentProjects.length > 0) projectBonus = 5;

        // Department & Level alignment bonus (up to 10%)
        let deptBonus = 0;
        if (deptFilter && student.profile?.department === deptFilter) {
          deptBonus += 6;
        } else if (student.profile?.department) {
          deptBonus += 3;
        }

        if (preferredLevel && student.profile?.level === preferredLevel) {
          deptBonus += 4;
        } else {
          deptBonus += 2;
        }

        const totalRaw = reqScoreNormalized + preferredSkillScore + projectBonus + deptBonus;
        const matchPercentage = Math.min(Math.max(Math.round(totalRaw), matchedRequired.length > 0 ? 35 : 10), 98);

        // Determine best-fit role
        let bestFitRole = 'Fullstack Developer';
        let maxFitPoints = 0;
        for (const [role, keywords] of Object.entries(ROLE_PATTERNS)) {
          let roleScore = 0;
          for (const kw of keywords) {
            if (studentSkillMap.has(kw)) roleScore += 2;
          }
          if (roleScore > maxFitPoints) {
            maxFitPoints = roleScore;
            bestFitRole = role;
          }
        }

        const explanationPoints: string[] = [];
        for (const m of matchedRequired) {
          explanationPoints.push(`✓ ${m.name} (${m.proficiency.toLowerCase()})`);
        }
        for (const m of matchedPreferred) {
          explanationPoints.push(`✓ Preferred: ${m.name}`);
        }
        if (relevantProjects.length > 0) {
          explanationPoints.push(`✓ ${relevantProjects.length} relevant project(s) completed`);
        }
        if (student.profile?.communityPoints && student.profile.communityPoints > 500) {
          explanationPoints.push(`✓ Active campus contributor (${student.profile.communityPoints} pts)`);
        }
        for (const miss of missingRequired.slice(0, 3)) {
          explanationPoints.push(`○ Missing ${miss}`);
        }

        return {
          studentId: student.id,
          fullName: student.profile?.fullName ?? 'Student',
          username: student.profile?.username ?? 'user',
          avatarUrl: student.profile?.avatarUrl,
          department: student.profile?.department,
          level: student.profile?.level,
          communityPoints: student.profile?.communityPoints ?? 0,
          githubUrl: student.profile?.githubUrl,
          matchPercentage,
          bestFitRole,
          matchedRequired,
          matchedPreferred,
          missingRequired,
          explanationPoints,
          projectsCount: studentProjects.length,
          allSkills: (student.studentSkills || []).map((ss: any) => ({
            name: ss.skill.name,
            proficiency: ss.proficiency,
            category: ss.skill.category,
            isPrimary: ss.isPrimary,
          })),
        };
      })
      .filter((s: any) => s.matchPercentage >= 20)
      .sort((a: any, b: any) => b.matchPercentage - a.matchPercentage)
      .slice(0, Number(limit));

    // Group recommendations by Target Roles
    const roleRecommendations: Record<string, any[]> = {};
    if (targetRoles.length > 0) {
      for (const role of targetRoles as string[]) {
        roleRecommendations[role] = scoredCandidates
          .filter((c: any) => c.bestFitRole.toLowerCase() === role.toLowerCase() || c.matchPercentage > 60)
          .slice(0, 4);
      }
    }

    res.json({
      success: true,
      data: {
        projectTitle,
        totalCandidatesMatched: scoredCandidates.length,
        candidates: scoredCandidates,
        roleRecommendations,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/team-builder/invitations
 * Dispatch project team invitation to a student & create Notification
 */
export async function sendInvitation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const senderId = req.user!.userId;
    const receiverId = req.body.receiverId || req.body.recipientId;
    const { projectId, teamId, role, message } = req.body;
    const projectTitle = req.body.projectTitle || 'Collaborative Project';

    if (senderId === receiverId) {
      throw ApiError.badRequest('You cannot send a team invitation to yourself');
    }

    const receiver = await (prisma as any).user.findUnique({
      where: { id: receiverId },
      include: { profile: true },
    });

    if (!receiver) {
      throw ApiError.notFound('Target student not found');
    }

    // Check for existing pending invitation
    const existing = await (prisma as any).teamInvitation.findFirst({
      where: {
        senderId,
        receiverId,
        projectTitle,
        status: 'PENDING',
      },
    });

    if (existing) {
      throw ApiError.conflict('A pending invitation for this project has already been sent to this student');
    }

    const invitation = await (prisma as any).teamInvitation.create({
      data: {
        senderId,
        receiverId,
        projectId,
        teamId,
        projectTitle,
        role,
        message,
        status: 'PENDING',
      },
      include: {
        sender: {
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
      },
    });

    // Create real Notification for recipient
    const senderName = invitation.sender?.profile?.fullName ?? 'A student';
    await (prisma as any).notification.create({
      data: {
        userId: receiverId,
        type: 'TEAM_INVITATION',
        title: 'Project Collaboration Invitation',
        message: `${senderName} invited you to join "${projectTitle}" as a ${role}.`,
        entityType: 'TEAM_INVITATION',
        entityId: invitation.id,
      },
    });

    res.status(201).json({
      success: true,
      message: `Invitation successfully sent to ${receiver.profile?.fullName || 'student'}!`,
      data: invitation,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/team-builder/invitations
 * Fetch received and sent team invitations for logged in user
 */
export async function getInvitations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;

    const [received, sent] = await Promise.all([
      (prisma as any).teamInvitation.findMany({
        where: { receiverId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
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
        },
      }),
      (prisma as any).teamInvitation.findMany({
        where: { senderId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          receiver: {
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
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        received,
        sent,
        pendingCount: received.filter((inv: any) => inv.status === 'PENDING').length,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/team-builder/invitations/:id
 * Accept or decline project team invitation
 */
export async function respondToInvitation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const id = String(req.params.id);
    const { status } = req.body;

    const invitation = await (prisma as any).teamInvitation.findUnique({
      where: { id },
      include: {
        receiver: {
          select: {
            profile: { select: { fullName: true } },
          },
        },
      },
    });

    if (!invitation) {
      throw ApiError.notFound('Invitation not found');
    }

    if (invitation.receiverId !== userId) {
      throw ApiError.forbidden('You are not authorized to respond to this invitation');
    }

    if (invitation.status !== 'PENDING') {
      throw ApiError.badRequest(`This invitation has already been ${invitation.status.toLowerCase()}`);
    }

    const updated = await (prisma as any).teamInvitation.update({
      where: { id },
      data: { status },
      include: {
        receiver: {
          select: {
            profile: { select: { fullName: true } },
          },
        },
      },
    });

    // Notify the sender about the response
    const receiverName = updated.receiver?.profile?.fullName || 'Collaborator';
    const notifType = status === 'ACCEPTED' ? 'TEAM_INVITATION_ACCEPTED' : 'TEAM_INVITATION_DECLINED';

    await (prisma as any).notification.create({
      data: {
        userId: invitation.senderId,
        type: notifType,
        title: `Team Invitation ${status === 'ACCEPTED' ? 'Accepted' : 'Declined'}`,
        message: `${receiverName} has ${status.toLowerCase()} your invitation for project "${invitation.projectTitle}".`,
        entityType: 'TEAM_INVITATION',
        entityId: invitation.id,
      },
    });

    // If accepted and team exists, add as team member
    if (status === 'ACCEPTED' && invitation.teamId) {
      await (prisma as any).projectTeamMember.upsert({
        where: {
          teamId_userId: {
            teamId: invitation.teamId,
            userId,
          },
        },
        update: {},
        create: {
          teamId: invitation.teamId,
          userId,
          role: invitation.role,
        },
      });
    }

    res.json({
      success: true,
      message: `Invitation ${status.toLowerCase()} successfully`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}
