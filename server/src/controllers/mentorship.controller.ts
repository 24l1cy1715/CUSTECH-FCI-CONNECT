import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';
import {
  MentorshipStatus,
  MentorshipGoalStatus,
  MentorshipSessionStatus,
  MentorshipSessionFormat,
  NotificationType,
  ReportEntityType,
  ReportReason,
} from '@prisma/client';

export const mentorshipController = {
  // ── 1. List Mentors (Discovery with transparent Skill Graph match) ───────────
  listMentors: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
      const search = (req.query.search as string)?.trim();
      const area = (req.query.area as string)?.trim();
      const skill = (req.query.skill as string)?.trim();
      const sessionFormat = req.query.sessionFormat as MentorshipSessionFormat | undefined;
      const language = (req.query.language as string)?.trim();
      const currentUserId = req.user?.userId;

      // Base query: mentors who opted in and are available
      const where: any = {
        isAvailable: true,
      };

      if (sessionFormat && Object.values(MentorshipSessionFormat).includes(sessionFormat)) {
        where.sessionFormat = sessionFormat;
      }

      if (search) {
        where.OR = [
          { headline: { contains: search } },
          { bio: { contains: search } },
          {
            user: {
              profile: {
                OR: [
                  { fullName: { contains: search } },
                  { username: { contains: search } },
                ],
              },
            },
          },
        ];
      }

      // Fetch user's skills for transparent matching if logged in
      let viewerSkills: Array<{ name: string; proficiency: string }> = [];
      let viewerInterests: string[] = [];
      let viewerDepartment: string | null = null;

      if (currentUserId) {
        const viewer = await prisma.user.findUnique({
          where: { id: currentUserId },
          include: {
            profile: true,
            studentSkills: { include: { skill: true } },
          },
        });
        if (viewer) {
          viewerDepartment = viewer.profile?.department || null;
          viewerSkills = viewer.studentSkills.map((s) => ({
            name: s.skill.name.toLowerCase(),
            proficiency: s.proficiency,
          }));
          if (Array.isArray(viewer.profile?.interests)) {
            viewerInterests = (viewer.profile.interests as string[]).map((i) => i.toLowerCase());
          }
        }
      }

      const [total, mentors] = await Promise.all([
        prisma.mentorProfile.count({ where }),
        prisma.mentorProfile.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
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
                studentSkills: {
                  include: { skill: true },
                  orderBy: { proficiency: 'desc' },
                },
                mentorMentorships: {
                  where: { status: MentorshipStatus.ACCEPTED },
                  select: { id: true },
                },
              },
            },
          },
        }),
      ]);

      // Calculate transparent match score and explanations
      const items = mentors.map((m) => {
        const areas = Array.isArray(m.areas) ? (m.areas as string[]) : [];
        const languages = Array.isArray(m.languages) ? (m.languages as string[]) : ['English'];
        const activeMenteesCount = m.user.mentorMentorships.length;
        const availableSlots = Math.max(0, m.maxMentees - activeMenteesCount);

        const mentorSkills = m.user.studentSkills.map((s) => ({
          name: s.skill.name,
          proficiency: s.proficiency,
        }));

        const matchReasons: string[] = [];
        let matchScore = 50; // base score

        if (currentUserId && m.userId !== currentUserId) {
          // Compare mentor areas and viewer interests/skills
          areas.forEach((a) => {
            const lowerArea = a.toLowerCase();
            const skillMatch = viewerSkills.find((vs) => vs.name.includes(lowerArea) || lowerArea.includes(vs.name));
            if (skillMatch) {
              matchReasons.push(`Shares focus in ${a} with your skill profile.`);
              matchScore += 15;
            }
            if (viewerInterests.some((vi) => vi.includes(lowerArea) || lowerArea.includes(vi))) {
              matchReasons.push(`Mentors in ${a}, which matches your declared interests.`);
              matchScore += 10;
            }
          });

          // Check if mentor has advanced proficiency in skills viewer is building
          mentorSkills.forEach((ms) => {
            if (['ADVANCED', 'EXPERT'].includes(ms.proficiency)) {
              const matchesViewer = viewerSkills.some((vs) => vs.name === ms.name.toLowerCase());
              if (matchesViewer) {
                matchReasons.push(`Has ${ms.proficiency.toLowerCase()} proficiency in ${ms.name}.`);
                matchScore += 15;
              }
            }
          });

          // Department overlap
          if (viewerDepartment && m.user.profile?.department === viewerDepartment) {
            matchReasons.push(`From your department (${m.user.profile.department.replace(/_/g, ' ')}).`);
            matchScore += 10;
          }

          if (availableSlots > 0) {
            matchReasons.push(`Has available capacity for new mentees.`);
            matchScore += 5;
          }
        } else {
          matchReasons.push(`Available for ${m.sessionFormat.toLowerCase()} mentoring.`);
          if (availableSlots > 0) {
            matchReasons.push(`${availableSlots} of ${m.maxMentees} mentee slots open.`);
          }
        }

        return {
          id: m.id,
          userId: m.userId,
          headline: m.headline,
          bio: m.bio,
          areas,
          availability: m.availability,
          languages,
          maxMentees: m.maxMentees,
          activeMenteesCount,
          availableSlots,
          sessionFormat: m.sessionFormat,
          isAvailable: m.isAvailable && availableSlots > 0,
          user: {
            id: m.user.id,
            fullName: m.user.profile?.fullName,
            username: m.user.profile?.username,
            avatarUrl: m.user.profile?.avatarUrl,
            department: m.user.profile?.department,
            level: m.user.profile?.level,
          },
          skills: mentorSkills,
          matchScore: Math.min(100, matchScore),
          matchReasons: matchReasons.slice(0, 4),
        };
      });

      // Filter by area or skill if requested
      let filteredItems = items;
      if (area) {
        filteredItems = filteredItems.filter((i) =>
          i.areas.some((a) => a.toLowerCase().includes(area.toLowerCase()))
        );
      }
      if (skill) {
        filteredItems = filteredItems.filter((i) =>
          i.skills.some((s) => s.name.toLowerCase().includes(skill.toLowerCase()))
        );
      }
      if (language) {
        filteredItems = filteredItems.filter((i) =>
          i.languages.some((l) => l.toLowerCase().includes(language.toLowerCase()))
        );
      }

      // If user logged in, sort by matchScore
      if (currentUserId) {
        filteredItems.sort((a, b) => b.matchScore - a.matchScore);
      }

      res.json({
        success: true,
        data: filteredItems,
        pagination: {
          page,
          limit,
          total: filteredItems.length,
          totalPages: Math.ceil(filteredItems.length / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 2. Get Single Mentor Profile ─────────────────────────────────────────────
  getMentorById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const currentUserId = req.user?.userId;

      const mentor = await prisma.mentorProfile.findFirst({
        where: {
          OR: [{ id }, { userId: id }],
        },
        include: {
          user: {
            select: {
              id: true,
              profile: {
                select: {
                  fullName: true,
                  username: true,
                  avatarUrl: true,
                  department: true,
                  level: true,
                  bio: true,
                },
              },
              studentSkills: {
                include: { skill: true },
                orderBy: { proficiency: 'desc' },
              },
              mentorMentorships: {
                where: { status: MentorshipStatus.ACCEPTED },
                select: { id: true },
              },
            },
          },
        },
      });

      if (!mentor) {
        throw ApiError.notFound('Mentor profile not found');
      }

      // Check current relationship if logged in
      let existingRelationship = null;
      if (currentUserId && currentUserId !== mentor.userId) {
        existingRelationship = await prisma.mentorship.findFirst({
          where: {
            mentorId: mentor.userId,
            menteeId: currentUserId,
            status: { in: [MentorshipStatus.PENDING, MentorshipStatus.ACCEPTED] },
          },
        });
      }

      const activeMenteesCount = mentor.user.mentorMentorships.length;
      const availableSlots = Math.max(0, mentor.maxMentees - activeMenteesCount);

      res.json({
        success: true,
        data: {
          id: mentor.id,
          userId: mentor.userId,
          headline: mentor.headline,
          bio: mentor.bio,
          areas: mentor.areas,
          availability: mentor.availability,
          languages: mentor.languages,
          maxMentees: mentor.maxMentees,
          activeMenteesCount,
          availableSlots,
          sessionFormat: mentor.sessionFormat,
          isAvailable: mentor.isAvailable && availableSlots > 0,
          createdAt: mentor.createdAt,
          user: {
            id: mentor.user.id,
            fullName: mentor.user.profile?.fullName,
            username: mentor.user.profile?.username,
            avatarUrl: mentor.user.profile?.avatarUrl,
            department: mentor.user.profile?.department,
            level: mentor.user.profile?.level,
          },
          skills: mentor.user.studentSkills.map((s: any) => ({
            id: s.skill.id,
            name: s.skill.name,
            proficiency: s.proficiency,
            category: s.skill.category,
          })),
          activeRelationship: existingRelationship
            ? {
                id: existingRelationship.id,
                status: existingRelationship.status,
                goal: existingRelationship.goal,
                startedAt: existingRelationship.startedAt,
              }
            : null,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 3. Get Current User's Mentor Profile ─────────────────────────────────────
  getMyProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      const profile = await prisma.mentorProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              studentSkills: { include: { skill: true } },
              mentorMentorships: {
                where: { status: MentorshipStatus.ACCEPTED },
                select: { id: true },
              },
            },
          },
        },
      });

      if (!profile) {
        return res.json({
          success: true,
          data: null,
          isMentor: false,
        });
      }

      const activeMenteesCount = profile.user.mentorMentorships.length;

      res.json({
        success: true,
        data: {
          ...profile,
          activeMenteesCount,
          availableSlots: Math.max(0, profile.maxMentees - activeMenteesCount),
        },
        isMentor: true,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 4. Upsert Mentor Profile ─────────────────────────────────────────────────
  upsertProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { headline, bio, areas, availability, languages, maxMentees, sessionFormat, isAvailable } =
        req.body;

      const profile = await prisma.mentorProfile.upsert({
        where: { userId },
        update: {
          headline,
          bio: bio || null,
          areas,
          availability,
          languages: languages || ['English'],
          maxMentees: maxMentees || 3,
          sessionFormat: sessionFormat || MentorshipSessionFormat.CHAT,
          isAvailable: isAvailable !== undefined ? isAvailable : true,
        },
        create: {
          userId,
          headline,
          bio: bio || null,
          areas,
          availability,
          languages: languages || ['English'],
          maxMentees: maxMentees || 3,
          sessionFormat: sessionFormat || MentorshipSessionFormat.CHAT,
          isAvailable: isAvailable !== undefined ? isAvailable : true,
        },
      });

      res.json({
        success: true,
        message: 'Mentor profile saved successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 5. Toggle Availability ───────────────────────────────────────────────────
  toggleAvailability: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { isAvailable } = req.body;

      const profile = await prisma.mentorProfile.findUnique({ where: { userId } });
      if (!profile) {
        throw ApiError.notFound('Mentor profile not found. Please create one first.');
      }

      const updated = await prisma.mentorProfile.update({
        where: { userId },
        data: { isAvailable },
      });

      res.json({
        success: true,
        message: `Mentorship availability set to ${isAvailable ? 'available' : 'unavailable'}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 6. Request Mentorship ────────────────────────────────────────────────────
  requestMentorship: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const menteeId = req.user!.userId;
      const { mentorId, goal } = req.body;

      if (mentorId === menteeId) {
        throw ApiError.badRequest('You cannot request mentorship from yourself');
      }

      // Verify mentor profile
      const mentorProfile = await prisma.mentorProfile.findUnique({
        where: { userId: mentorId },
        include: {
          user: {
            include: {
              profile: true,
              mentorMentorships: { where: { status: MentorshipStatus.ACCEPTED } },
            },
          },
        },
      });

      if (!mentorProfile || !mentorProfile.isAvailable) {
        throw ApiError.badRequest('This mentor is not currently accepting new mentees');
      }

      if (mentorProfile.user.mentorMentorships.length >= mentorProfile.maxMentees) {
        throw ApiError.badRequest('This mentor has reached maximum active mentee capacity');
      }

      // Check duplicate active requests
      const existing = await prisma.mentorship.findFirst({
        where: {
          mentorId,
          menteeId,
          status: { in: [MentorshipStatus.PENDING, MentorshipStatus.ACCEPTED] },
        },
      });

      if (existing) {
        if (existing.status === MentorshipStatus.PENDING) {
          throw ApiError.badRequest('You already have a pending mentorship request with this mentor');
        }
        if (existing.status === MentorshipStatus.ACCEPTED) {
          throw ApiError.badRequest('You already have an active mentorship with this mentor');
        }
      }

      const mentorship = await prisma.mentorship.create({
        data: {
          mentorId,
          menteeId,
          goal,
          status: MentorshipStatus.PENDING,
        },
        include: {
          mentee: {
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

      // Send in-app notification to mentor
      await prisma.notification.create({
        data: {
          userId: mentorId,
          type: NotificationType.MENTORSHIP_REQUEST_RECEIVED,
          title: 'New mentorship request received',
          message: `${mentorship.mentee.profile?.fullName || 'A student'} requested mentorship: "${goal.slice(0, 100)}"`,
          entityType: 'mentorship',
          entityId: mentorship.id,
        },
      }).catch(() => {});

      res.status(201).json({
        success: true,
        message: 'Mentorship request submitted to mentor',
        data: mentorship,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 7. Get Requests ──────────────────────────────────────────────────────────
  getRequests: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const role = (req.query.role as string) || 'all'; // 'mentor', 'mentee', 'all'
      const status = req.query.status as MentorshipStatus | undefined;

      const where: any = {};
      if (role === 'mentor') {
        where.mentorId = userId;
      } else if (role === 'mentee') {
        where.menteeId = userId;
      } else {
        where.OR = [{ mentorId: userId }, { menteeId: userId }];
      }

      if (status && Object.values(MentorshipStatus).includes(status)) {
        where.status = status;
      }

      const requests = await prisma.mentorship.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          mentor: {
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
              mentorProfile: {
                select: { headline: true, sessionFormat: true, areas: true },
              },
            },
          },
          mentee: {
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
              studentSkills: { include: { skill: true }, take: 5 },
            },
          },
        },
      });

      res.json({
        success: true,
        data: requests.map((r) => ({
          id: r.id,
          mentorId: r.mentorId,
          menteeId: r.menteeId,
          goal: r.goal,
          status: r.status,
          rejectionReason: r.rejectionReason,
          startedAt: r.startedAt,
          endedAt: r.endedAt,
          createdAt: r.createdAt,
          isMentor: r.mentorId === userId,
          mentor: {
            id: r.mentor.id,
            fullName: r.mentor.profile?.fullName,
            username: r.mentor.profile?.username,
            avatarUrl: r.mentor.profile?.avatarUrl,
            department: r.mentor.profile?.department,
            headline: r.mentor.mentorProfile?.headline,
            sessionFormat: r.mentor.mentorProfile?.sessionFormat,
            areas: r.mentor.mentorProfile?.areas,
          },
          mentee: {
            id: r.mentee.id,
            fullName: r.mentee.profile?.fullName,
            username: r.mentee.profile?.username,
            avatarUrl: r.mentee.profile?.avatarUrl,
            department: r.mentee.profile?.department,
            level: r.mentee.profile?.level,
            skills: r.mentee.studentSkills.map((s) => s.skill.name),
          },
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 8. Respond to Request ────────────────────────────────────────────────────
  respondToRequest: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;
      const { status, rejectionReason } = req.body;

      const mentorship = await prisma.mentorship.findUnique({
        where: { id },
        include: {
          mentor: { select: { id: true, profile: { select: { fullName: true } } } },
          mentee: { select: { id: true, profile: { select: { fullName: true } } } },
        },
      });

      if (!mentorship) {
        throw ApiError.notFound('Mentorship request not found');
      }

      if (mentorship.status !== MentorshipStatus.PENDING) {
        throw ApiError.badRequest(`This request has already been ${mentorship.status.toLowerCase()}`);
      }

      // If mentor is responding:
      if (mentorship.mentorId === userId) {
        if (!['ACCEPTED', 'DECLINED'].includes(status)) {
          throw ApiError.badRequest('Mentor can only accept or decline requests');
        }

        if (status === 'ACCEPTED') {
          // Check mentor capacity
          const profile = await prisma.mentorProfile.findUnique({
            where: { userId },
            include: {
              user: {
                include: { mentorMentorships: { where: { status: MentorshipStatus.ACCEPTED } } },
              },
            },
          });
          if (profile && profile.user.mentorMentorships.length >= profile.maxMentees) {
            throw ApiError.badRequest('You have already reached your maximum mentee capacity');
          }
        }

        const updated = await prisma.mentorship.update({
          where: { id },
          data: {
            status,
            rejectionReason: status === 'DECLINED' ? rejectionReason || null : null,
            startedAt: status === 'ACCEPTED' ? new Date() : null,
          },
        });

        // Notify mentee
        await prisma.notification.create({
          data: {
            userId: mentorship.menteeId,
            type:
              status === 'ACCEPTED'
                ? NotificationType.MENTORSHIP_ACCEPTED
                : NotificationType.MENTORSHIP_DECLINED,
            title:
              status === 'ACCEPTED'
                ? 'Mentorship request accepted!'
                : 'Mentorship request declined',
            message:
              status === 'ACCEPTED'
                ? `${mentorship.mentor.profile?.fullName || 'Your mentor'} accepted your mentorship request.`
                : `${mentorship.mentor.profile?.fullName || 'The mentor'} declined your request.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
            entityType: 'mentorship',
            entityId: mentorship.id,
          },
        }).catch(() => {});

        return res.json({
          success: true,
          message: `Mentorship request ${status.toLowerCase()}`,
          data: updated,
        });
      }

      // If mentee is cancelling:
      if (mentorship.menteeId === userId) {
        if (status !== 'CANCELLED') {
          throw ApiError.badRequest('Mentee can only cancel pending requests');
        }
        const updated = await prisma.mentorship.update({
          where: { id },
          data: { status: MentorshipStatus.CANCELLED },
        });
        return res.json({
          success: true,
          message: 'Mentorship request cancelled',
          data: updated,
        });
      }

      throw ApiError.forbidden('You are not authorized to respond to this request');
    } catch (error) {
      next(error);
    }
  },

  // ── 9. Mentorship Dashboard ──────────────────────────────────────────────────
  getDashboard: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      const [mentorProfile, activeAsMentee, activeAsMentor, pendingRequestsReceived, pendingRequestsSent] =
        await Promise.all([
          // 1. Current user's mentor profile
          prisma.mentorProfile.findUnique({
            where: { userId },
          }),

          // 2. Active mentorships where current user is mentee
          prisma.mentorship.findMany({
            where: { menteeId: userId, status: MentorshipStatus.ACCEPTED },
            include: {
              mentor: {
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
                  mentorProfile: {
                    select: { headline: true, sessionFormat: true, availability: true },
                  },
                },
              },
              goals: { orderBy: { createdAt: 'desc' } },
              sessions: {
                where: { status: MentorshipSessionStatus.SCHEDULED },
                orderBy: { scheduledAt: 'asc' },
                take: 5,
              },
              resources: { orderBy: { createdAt: 'desc' }, take: 5 },
            },
          }),

          // 3. Active mentorships where current user is mentor
          prisma.mentorship.findMany({
            where: { mentorId: userId, status: MentorshipStatus.ACCEPTED },
            include: {
              mentee: {
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
              goals: { orderBy: { createdAt: 'desc' } },
              sessions: {
                where: { status: MentorshipSessionStatus.SCHEDULED },
                orderBy: { scheduledAt: 'asc' },
                take: 5,
              },
              resources: { orderBy: { createdAt: 'desc' }, take: 5 },
            },
          }),

          // 4. Pending requests received by user (as mentor)
          prisma.mentorship.findMany({
            where: { mentorId: userId, status: MentorshipStatus.PENDING },
            include: {
              mentee: {
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
                  studentSkills: { include: { skill: true }, take: 5 },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          }),

          // 5. Pending requests sent by user (as mentee)
          prisma.mentorship.findMany({
            where: { menteeId: userId, status: MentorshipStatus.PENDING },
            include: {
              mentor: {
                select: {
                  id: true,
                  profile: {
                    select: {
                      fullName: true,
                      username: true,
                      avatarUrl: true,
                    },
                  },
                  mentorProfile: { select: { headline: true, sessionFormat: true } },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          }),
        ]);

      res.json({
        success: true,
        data: {
          isMentor: !!mentorProfile,
          mentorProfile: mentorProfile
            ? {
                ...mentorProfile,
                activeCount: activeAsMentor.length,
                availableSlots: Math.max(0, mentorProfile.maxMentees - activeAsMentor.length),
              }
            : null,
          asMentee: activeAsMentee.map((m) => ({
            id: m.id,
            goal: m.goal,
            startedAt: m.startedAt,
            mentor: {
              id: m.mentor.id,
              fullName: m.mentor.profile?.fullName,
              username: m.mentor.profile?.username,
              avatarUrl: m.mentor.profile?.avatarUrl,
              department: m.mentor.profile?.department,
              headline: m.mentor.mentorProfile?.headline,
              sessionFormat: m.mentor.mentorProfile?.sessionFormat,
              availability: m.mentor.mentorProfile?.availability,
            },
            goals: m.goals,
            sessions: m.sessions,
            resources: m.resources,
          })),
          asMentor: activeAsMentor.map((m) => ({
            id: m.id,
            goal: m.goal,
            startedAt: m.startedAt,
            mentee: {
              id: m.mentee.id,
              fullName: m.mentee.profile?.fullName,
              username: m.mentee.profile?.username,
              avatarUrl: m.mentee.profile?.avatarUrl,
              department: m.mentee.profile?.department,
              level: m.mentee.profile?.level,
            },
            goals: m.goals,
            sessions: m.sessions,
            resources: m.resources,
          })),
          pendingRequestsReceived: pendingRequestsReceived.map((r) => ({
            id: r.id,
            goal: r.goal,
            createdAt: r.createdAt,
            mentee: {
              id: r.mentee.id,
              fullName: r.mentee.profile?.fullName,
              username: r.mentee.profile?.username,
              avatarUrl: r.mentee.profile?.avatarUrl,
              department: r.mentee.profile?.department,
              level: r.mentee.profile?.level,
              skills: r.mentee.studentSkills.map((s) => s.skill.name),
            },
          })),
          pendingRequestsSent: pendingRequestsSent.map((r) => ({
            id: r.id,
            goal: r.goal,
            createdAt: r.createdAt,
            mentor: {
              id: r.mentor.id,
              fullName: r.mentor.profile?.fullName,
              username: r.mentor.profile?.username,
              avatarUrl: r.mentor.profile?.avatarUrl,
              headline: r.mentor.mentorProfile?.headline,
              sessionFormat: r.mentor.mentorProfile?.sessionFormat,
            },
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 10. Single Mentorship Details ───────────────────────────────────────────
  getRelationship: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;
      const isPlatformAdmin =
        req.user?.roles?.includes('ADMIN') || req.user?.roles?.includes('SUPER_ADMIN');

      const mentorship = await prisma.mentorship.findUnique({
        where: { id },
        include: {
          mentor: {
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
              mentorProfile: { select: { headline: true, sessionFormat: true, availability: true } },
            },
          },
          mentee: {
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
          goals: { orderBy: { createdAt: 'desc' } },
          sessions: { orderBy: { scheduledAt: 'desc' } },
          resources: {
            orderBy: { createdAt: 'desc' },
            include: {
              sharedBy: {
                select: {
                  id: true,
                  profile: { select: { fullName: true, username: true } },
                },
              },
            },
          },
        },
      });

      if (!mentorship) {
        throw ApiError.notFound('Mentorship relationship not found');
      }

      if (!isPlatformAdmin && mentorship.mentorId !== userId && mentorship.menteeId !== userId) {
        throw ApiError.forbidden('You do not have access to this mentorship relationship');
      }

      res.json({
        success: true,
        data: {
          ...mentorship,
          isMentor: mentorship.mentorId === userId,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 11. End Relationship ─────────────────────────────────────────────────────
  endRelationship: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;
      const isPlatformAdmin =
        req.user?.roles?.includes('ADMIN') || req.user?.roles?.includes('SUPER_ADMIN');

      const mentorship = await prisma.mentorship.findUnique({ where: { id } });
      if (!mentorship) throw ApiError.notFound('Mentorship not found');

      if (!isPlatformAdmin && mentorship.mentorId !== userId && mentorship.menteeId !== userId) {
        throw ApiError.forbidden('Only participants can end this mentorship');
      }

      const updated = await prisma.mentorship.update({
        where: { id },
        data: {
          status: MentorshipStatus.ENDED,
          endedAt: new Date(),
        },
      });

      res.json({
        success: true,
        message: 'Mentorship ended',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 12. Learning Goals ───────────────────────────────────────────────────────
  createGoal: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;
      const { title, target, progress, status } = req.body;

      const mentorship = await prisma.mentorship.findUnique({ where: { id } });
      if (!mentorship) throw ApiError.notFound('Mentorship not found');

      if (mentorship.mentorId !== userId && mentorship.menteeId !== userId) {
        throw ApiError.forbidden('Unauthorized');
      }

      const goal = await prisma.mentorshipGoal.create({
        data: {
          mentorshipId: id,
          title,
          target: target || null,
          progress: progress || 0,
          status: status || MentorshipGoalStatus.NOT_STARTED,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Goal created',
        data: goal,
      });
    } catch (error) {
      next(error);
    }
  },

  updateGoal: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const goalId = req.params.goalId as string;
      const userId = req.user!.userId;
      const { title, target, progress, status } = req.body;

      const goal = await prisma.mentorshipGoal.findUnique({
        where: { id: goalId },
        include: { mentorship: true },
      });

      if (!goal || goal.mentorshipId !== id) {
        throw ApiError.notFound('Goal not found');
      }

      if (goal.mentorship.mentorId !== userId && goal.mentorship.menteeId !== userId) {
        throw ApiError.forbidden('Unauthorized');
      }

      const data: any = {};
      if (title !== undefined) data.title = title;
      if (target !== undefined) data.target = target;
      if (progress !== undefined) {
        data.progress = Math.min(100, Math.max(0, progress));
        if (data.progress === 100) {
          data.status = MentorshipGoalStatus.COMPLETED;
        } else if (data.progress > 0 && goal.status === MentorshipGoalStatus.NOT_STARTED) {
          data.status = MentorshipGoalStatus.IN_PROGRESS;
        }
      }
      if (status !== undefined) data.status = status;

      const updated = await prisma.mentorshipGoal.update({
        where: { id: goalId },
        data,
      });

      res.json({
        success: true,
        message: 'Goal updated',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteGoal: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const goalId = req.params.goalId as string;
      const userId = req.user!.userId;

      const goal = await prisma.mentorshipGoal.findUnique({
        where: { id: goalId },
        include: { mentorship: true },
      });

      if (!goal || goal.mentorshipId !== id) {
        throw ApiError.notFound('Goal not found');
      }

      if (goal.mentorship.mentorId !== userId && goal.mentorship.menteeId !== userId) {
        throw ApiError.forbidden('Unauthorized');
      }

      await prisma.mentorshipGoal.delete({ where: { id: goalId } });

      res.json({
        success: true,
        message: 'Goal deleted',
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 13. Sessions ─────────────────────────────────────────────────────────────
  createSession: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;
      const { title, description, scheduledAt, duration, meetingUrl } = req.body;

      const mentorship = await prisma.mentorship.findUnique({ where: { id } });
      if (!mentorship) throw ApiError.notFound('Mentorship not found');

      if (mentorship.mentorId !== userId && mentorship.menteeId !== userId) {
        throw ApiError.forbidden('Unauthorized');
      }

      const session = await prisma.mentorshipSession.create({
        data: {
          mentorshipId: id,
          title,
          description: description || null,
          scheduledAt: new Date(scheduledAt),
          duration: duration || 60,
          meetingUrl: meetingUrl || null,
          status: MentorshipSessionStatus.SCHEDULED,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Session scheduled',
        data: session,
      });
    } catch (error) {
      next(error);
    }
  },

  updateSession: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const sessionId = req.params.sessionId as string;
      const userId = req.user!.userId;
      const { status, title, description, scheduledAt, duration, meetingUrl } = req.body;

      const session = await prisma.mentorshipSession.findUnique({
        where: { id: sessionId },
        include: { mentorship: true },
      });

      if (!session || session.mentorshipId !== id) {
        throw ApiError.notFound('Session not found');
      }

      if (session.mentorship.mentorId !== userId && session.mentorship.menteeId !== userId) {
        throw ApiError.forbidden('Unauthorized');
      }

      const data: any = {};
      if (status !== undefined) data.status = status;
      if (title !== undefined) data.title = title;
      if (description !== undefined) data.description = description;
      if (scheduledAt !== undefined) data.scheduledAt = new Date(scheduledAt);
      if (duration !== undefined) data.duration = duration;
      if (meetingUrl !== undefined) data.meetingUrl = meetingUrl || null;

      const updated = await prisma.mentorshipSession.update({
        where: { id: sessionId },
        data,
      });

      res.json({
        success: true,
        message: 'Session updated',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 14. Shared Resources ─────────────────────────────────────────────────────
  createResource: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;
      const { title, description, url, type } = req.body;

      const mentorship = await prisma.mentorship.findUnique({ where: { id } });
      if (!mentorship) throw ApiError.notFound('Mentorship not found');

      if (mentorship.mentorId !== userId && mentorship.menteeId !== userId) {
        throw ApiError.forbidden('Unauthorized');
      }

      const resource = await prisma.mentorshipResource.create({
        data: {
          mentorshipId: id,
          title,
          description: description || null,
          url,
          type: type || 'ARTICLE',
          sharedById: userId,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Resource shared',
        data: resource,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteResource: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const resourceId = req.params.resourceId as string;
      const userId = req.user!.userId;

      const resource = await prisma.mentorshipResource.findUnique({
        where: { id: resourceId },
        include: { mentorship: true },
      });

      if (!resource || resource.mentorshipId !== id) {
        throw ApiError.notFound('Resource not found');
      }

      if (resource.sharedById !== userId && resource.mentorship.mentorId !== userId) {
        throw ApiError.forbidden('Unauthorized');
      }

      await prisma.mentorshipResource.delete({ where: { id: resourceId } });

      res.json({
        success: true,
        message: 'Resource removed',
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 15. Report & Safety ──────────────────────────────────────────────────────
  reportUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const reporterId = req.user!.userId;
      const { reason, description } = req.body;

      const mentorship = await prisma.mentorship.findUnique({ where: { id } });
      if (!mentorship) throw ApiError.notFound('Mentorship relationship not found');

      const reportedUserId = mentorship.mentorId === reporterId ? mentorship.menteeId : mentorship.mentorId;

      const report = await prisma.report.create({
        data: {
          reporterId,
          entityType: ReportEntityType.MENTORSHIP,
          entityId: id,
          reason: reason || ReportReason.OTHER,
          description: `Report filed regarding user ${reportedUserId} in mentorship ${id}: ${description || ''}`,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Safety report submitted to platform moderators',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  },
};
