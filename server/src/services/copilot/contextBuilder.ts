import { prisma } from '../../config/prisma';
import { AchievementVerificationStatus, OpportunityStatus, ProjectStatus } from '@prisma/client';

export interface StudentCopilotContext {
  student: {
    fullName: string;
    username: string;
    department: string;
    level: string;
    bio?: string | null;
    communityPoints: number;
    skills: { name: string; proficiency: string; isPrimary: boolean }[];
    interests: string[];
    projects: { title: string; category: string; description?: string | null }[];
    achievements: { name: string; category: string; points: number }[];
    savedOpportunityCount: number;
    upcomingEventCount: number;
  };
  publicPlatformContent: {
    featuredOpportunities: { title: string; organization: string; category: string; deadline?: Date | null; isRemote: boolean }[];
    upcomingEvents: { title: string; eventType: string; date: Date; location?: string | null }[];
    topCommunitySkills: string[];
  };
  contextSummary: string;
}

export class ContextBuilder {
  /**
   * Safely builds sanitized, authorized context for an authenticated student
   */
  static async buildStudentContext(userId: string): Promise<StudentCopilotContext> {
    // 1. Fetch authenticated student profile & skills
    const [user, studentSkills, projects, userAchievements, savedOpportunitiesCount, eventRegistrationsCount, trackedApplications, userLabProjects] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          include: { profile: true },
        }),
        prisma.studentSkill.findMany({
          where: { userId },
          include: { skill: true },
          take: 20,
        }),
        prisma.project.findMany({
          where: { authorId: userId, status: ProjectStatus.APPROVED },
          select: { title: true, category: true, description: true },
          take: 5,
        }),
        prisma.userAchievement.findMany({
          where: { userId, status: AchievementVerificationStatus.VERIFIED },
          include: { achievement: true },
          take: 10,
        }),
        prisma.savedOpportunity.count({ where: { userId } }),
        prisma.eventRegistration.count({ where: { userId } }),
        prisma.opportunityApplication.findMany({
          where: { userId },
          include: {
            opportunity: {
              select: {
                title: true,
                organization: true,
                category: true,
                deadline: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        }),
        prisma.labProject.findMany({
          where: {
            OR: [
              { createdById: userId },
              { members: { some: { userId, status: 'ACTIVE' } } },
            ],
            status: { not: 'ARCHIVED' },
          },
          select: {
            title: true,
            slug: true,
            status: true,
            category: true,
          },
          take: 5,
        }),
      ]);

    const profile = user?.profile;
    const skills = studentSkills.map((ss) => ({
      name: ss.skill.name,
      proficiency: ss.proficiency,
      isPrimary: ss.isPrimary,
    }));

    // Interests
    let interests: string[] = [];
    if (profile?.interests && Array.isArray(profile.interests)) {
      interests = (profile.interests as string[]).map((i) => String(i).slice(0, 50));
    }

    // 2. Fetch public platform content (filtered, safe, approved)
    const [activeOpportunities, upcomingEvents, popularSkills, activeCommunities, availableMentors, activeResources, activePaths] = await Promise.all([
      prisma.opportunity.findMany({
        where: { status: OpportunityStatus.APPROVED },
        select: {
          title: true,
          organization: true,
          category: true,
          deadline: true,
          isRemote: true,
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        take: 6,
      }),
      prisma.event.findMany({
        where: { date: { gte: new Date() } },
        select: {
          title: true,
          eventType: true,
          date: true,
          location: true,
        },
        orderBy: { date: 'asc' },
        take: 4,
      }),
      prisma.skill.findMany({
        select: { name: true },
        take: 15,
      }),
      prisma.community.findMany({
        where: {
          status: 'ACTIVE',
          visibility: { in: ['PUBLIC', 'FCI_ONLY'] },
        },
        select: {
          name: true,
          slug: true,
          category: true,
          description: true,
        },
        take: 8,
      }),
      prisma.mentorProfile.findMany({
        where: { isAvailable: true },
        select: {
          headline: true,
          areas: true,
          sessionFormat: true,
          user: {
            select: {
              profile: {
                select: {
                  fullName: true,
                  department: true,
                },
              },
            },
          },
        },
        take: 8,
      }),
      prisma.learningResource.findMany({
        where: { isPublished: true, status: 'APPROVED' },
        select: {
          title: true,
          slug: true,
          category: true,
          resourceType: true,
          courseCode: true,
        },
        take: 8,
      }),
      prisma.learningPath.findMany({
        where: { isPublished: true },
        select: {
          title: true,
          slug: true,
          category: true,
          difficulty: true,
        },
        take: 5,
      }),
    ]);

    const studentInfo = {
      fullName: profile?.fullName || 'FCI Student',
      username: profile?.username || 'student',
      department: profile?.department || 'Computing & Informatics',
      level: profile?.level || '300',
      bio: profile?.bio ? profile.bio.slice(0, 300) : null,
      communityPoints: profile?.communityPoints || 0,
      skills,
      interests,
      projects: projects.map((p) => ({
        title: p.title,
        category: p.category,
        description: p.description ? p.description.slice(0, 150) : null,
      })),
      achievements: userAchievements.map((ua) => ({
        name: ua.achievement.name,
        category: ua.achievement.category,
        points: ua.achievement.points,
      })),
      savedOpportunityCount: savedOpportunitiesCount,
      upcomingEventCount: eventRegistrationsCount,
    };

    const publicContent = {
      featuredOpportunities: activeOpportunities,
      upcomingEvents,
      topCommunitySkills: popularSkills.map((s) => s.name),
      communities: activeCommunities,
      mentors: availableMentors,
    };

    // Build context summary for system prompt
    const skillList = skills.length > 0 ? skills.map((s) => `${s.name} (${s.proficiency})`).join(', ') : 'None added yet';
    const projectList = projects.length > 0 ? projects.map((p) => p.title).join(', ') : 'No published projects yet';
    const oppList = activeOpportunities.map((o) => `"${o.title}" at ${o.organization} (${o.category})`).join('; ');
    const eventList = upcomingEvents.map((e) => `"${e.title}" (${e.eventType}) on ${e.date.toLocaleDateString()}`).join('; ');
    const communityList = (publicContent as any).communities?.map((c: any) => `${c.name} (${c.category})`).join(', ') || '';
    const mentorList = (publicContent as any).mentors?.map((m: any) => `${m.user.profile?.fullName || 'Mentor'} (${Array.isArray(m.areas) ? m.areas.join(', ') : ''})`).join('; ') || '';
    const resourceList = activeResources.map((r) => `"${r.title}" (${r.resourceType} in ${r.category}${r.courseCode ? ` - ${r.courseCode}` : ''})`).join('; ');
    const pathList = activePaths.map((p) => `"${p.title}" (${p.difficulty} - ${p.category})`).join('; ');
    const trackedList = trackedApplications.map((t) => `"${t.opportunity.title}" at ${t.opportunity.organization} [Status: ${t.status}${t.opportunity.deadline ? `, Deadline: ${t.opportunity.deadline.toISOString().split('T')[0]}` : ''}]`).join('; ');
    const labList = userLabProjects.map((p) => `"${p.title}" (${p.category}, Status: ${p.status})`).join('; ');

    const contextSummary = `
Student Academic Profile:
- Name: ${studentInfo.fullName}
- Department: ${studentInfo.department}
- Level: ${studentInfo.level}
- Community Reputation Points: ${studentInfo.communityPoints}
- Verified Skills: ${skillList}
- Interests: ${interests.join(', ') || 'Tech, Software, AI'}
- Published Projects: ${projectList}
- Active Project Lab Workspaces: ${labList || 'None active currently (/project-lab)'}
- Privately Tracked Opportunities & Applications: ${trackedList || 'None currently being tracked (/opportunities/tracker)'}
- Earned Achievements: ${studentInfo.achievements.map((a) => a.name).join(', ') || 'None yet'}

FCI Connect Phase 8-12 Ecosystem Systems:
- Research & Innovation Hub: /research (Ideas, Projects, Collaborators, Publications)
- SIWES & Internship Manager: /siwes (Weekly logbook, Placements, Evaluation)
- GitHub Developer Integration: /github (Synced repositories, stars, languages)
- FCI Skill Assessment Center: /assessments (Verified skill exams)
- Student Freelance Marketplace: /marketplace (Tech & creative services, client inquiries)
- FCI Student Voice: /student-voice (Community polls, faculty suggestions)
- Important Announcements: /announcements (Academic notices, urgent deadlines)
- My FCI Dashboard: /my-fci (Central personal command center)

Current FCI Connect Platform Highlights:
- Smart Study & Learning Hub Resources: ${resourceList || 'Explore academic and tech resources at /learning'}
- Structured Learning Paths: ${pathList || 'Explore paths at /learning'}
- Active Student Communities: ${communityList || 'Explore Student Clubs & Communities at /communities'}
- Available Peer Mentors: ${mentorList || 'Explore Mentorship Hub at /mentorship/mentors'}
- Active Opportunities in Hub: ${oppList || 'Explore the Opportunities Hub'}
- Upcoming Faculty Events: ${eventList || 'Check the Events calendar'}
`.trim();

    return {
      student: studentInfo,
      publicPlatformContent: publicContent,
      contextSummary,
    };
  }
}
