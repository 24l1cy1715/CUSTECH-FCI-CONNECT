import { prisma } from '../config/prisma';

export interface SmartNextAction {
  id: string;
  category: 'PROFILE' | 'ASSESSMENT' | 'SIWES' | 'OPPORTUNITY' | 'PROJECT' | 'LEARNING' | 'ANNOUNCEMENT';
  title: string;
  description: string;
  actionUrl: string;
  actionLabel: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate?: string;
}

export interface RecommendationItem {
  id: string;
  type: 'OPPORTUNITY' | 'LEARNING' | 'RESEARCH' | 'PROJECT_LAB' | 'MENTOR';
  title: string;
  subtitle: string;
  description: string;
  url: string;
  matchScore: number; // 0 - 100
  reasons: string[];
}

export class IntelligenceService {
  /**
   * Aggregate complete user ecosystem state and compute prioritized next actions
   */
  static async getSmartNextActions(userId: string): Promise<SmartNextAction[]> {
    const actions: SmartNextAction[] = [];

    const [
      user,
      skills,
      assessments,
      attempts,
      placement,
      trackedApps,
      labTasks,
      urgentAnnouncements,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true, githubProfile: true },
      }),
      prisma.studentSkill.findMany({
        where: { userId },
        include: { skill: true },
      }),
      prisma.skillAssessment.findMany({
        where: { status: 'PUBLISHED' },
        include: { skill: true },
      }),
      prisma.assessmentAttempt.findMany({
        where: { userId },
      }),
      prisma.siwesPlacement.findFirst({
        where: { studentId: userId },
        include: { weeklyLogs: true },
      }),
      prisma.opportunityApplication.findMany({
        where: { userId },
        include: { opportunity: true },
      }),
      prisma.labProjectTask.findMany({
        where: { assigneeId: userId, status: { in: ['TODO', 'IN_PROGRESS'] } },
        include: { project: true },
        take: 5,
      }),
      prisma.announcement.findMany({
        where: { priority: 'URGENT', isActive: true, status: 'PUBLISHED' },
        take: 2,
      }),
    ]);

    // 1. Profile Completion Check
    if (user?.profile) {
      if (!user.profile.avatarUrl || !user.profile.bio) {
        actions.push({
          id: 'act-profile-incomplete',
          category: 'PROFILE',
          title: 'Complete Your FCI Profile',
          description: 'Add a bio and avatar to unlock AI Team Builder matching and digital verification.',
          actionUrl: '/profile',
          actionLabel: 'Update Profile',
          priority: 'MEDIUM',
        });
      }
    }

    // 2. Urgent Announcements
    urgentAnnouncements.forEach((ann) => {
      actions.push({
        id: `act-ann-${ann.id}`,
        category: 'ANNOUNCEMENT',
        title: `URGENT: ${ann.title}`,
        description: ann.content.substring(0, 100),
        actionUrl: `/announcements`,
        actionLabel: 'Read Announcement',
        priority: 'HIGH',
      });
    });

    // 3. Unverified Skill Assessments
    const unverifiedSkills = skills.filter((s) => !s.isVerified);
    for (const uSkill of unverifiedSkills) {
      const matchAssess = assessments.find(
        (a) => a.skillId === uSkill.skillId || a.category.toLowerCase().includes(uSkill.skill.name.toLowerCase())
      );
      if (matchAssess) {
        const hasPassed = attempts.some((att) => att.assessmentId === matchAssess.id && att.isPassed);
        if (!hasPassed) {
          actions.push({
            id: `act-assess-${matchAssess.id}`,
            category: 'ASSESSMENT',
            title: `Take ${matchAssess.title} Assessment`,
            description: `You have ${uSkill.skill.name} on your profile. Verify your skill with this assessment.`,
            actionUrl: `/assessments/${matchAssess.slug}`,
            actionLabel: 'Start Assessment',
            priority: 'HIGH',
          });
          break; // prioritize one at a time
        }
      }
    }

    // 4. SIWES Weekly Log Check
    if (placement && (placement.status === 'ACTIVE' || placement.status === 'PLACED')) {
      const logsCount = placement.weeklyLogs.length;
      const nextWeek = logsCount + 1;
      actions.push({
        id: `act-siwes-log-${nextWeek}`,
        category: 'SIWES',
        title: `Submit Week ${nextWeek} SIWES Log`,
        description: `Record your technical activities and skills learned at ${placement.companyName}.`,
        actionUrl: '/siwes',
        actionLabel: 'Log Activity',
        priority: 'HIGH',
      });
    }

    // 5. Approaching Opportunity Deadlines
    const now = new Date();
    trackedApps.forEach((app) => {
      if (app.opportunity.deadline) {
        const deadlineDate = new Date(app.opportunity.deadline);
        const diffMs = deadlineDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 7 && app.status !== 'APPLIED') {
          actions.push({
            id: `act-opp-deadline-${app.id}`,
            category: 'OPPORTUNITY',
            title: `Deadline Approaching: ${app.opportunity.title}`,
            description: `Only ${diffDays} day(s) left to complete your application for ${app.opportunity.organization}.`,
            actionUrl: '/opportunities/tracker',
            actionLabel: 'View Opportunity',
            priority: 'HIGH',
            dueDate: deadlineDate.toISOString(),
          });
        }
      }
    });

    // 6. Active Project Lab Tasks
    labTasks.forEach((task) => {
      actions.push({
        id: `act-task-${task.id}`,
        category: 'PROJECT',
        title: `Task: ${task.title}`,
        description: `In project "${task.project.title}". Priority: ${task.priority}.`,
        actionUrl: `/project-lab/${task.project.slug}`,
        actionLabel: 'Open Project Lab',
        priority: task.priority === 'URGENT' || task.priority === 'HIGH' ? 'HIGH' : 'MEDIUM',
        dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
      });
    });

    return actions;
  }

  /**
   * Deterministic, explainable recommendation engine
   */
  static async getRecommendations(userId: string): Promise<RecommendationItem[]> {
    const recommendations: RecommendationItem[] = [];

    const [user, studentSkills, opportunities, researchProjects, labProjects] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      }),
      prisma.studentSkill.findMany({
        where: { userId },
        include: { skill: true },
      }),
      prisma.opportunity.findMany({
        where: { status: 'APPROVED' },
        include: { requiredSkills: { include: { skill: true } } },
        take: 20,
      }),
      prisma.researchProject.findMany({
        where: { visibility: 'PUBLIC', researchStatus: { in: ['IDEA', 'PROPOSAL', 'PLANNING', 'IN_PROGRESS'] } },
        take: 10,
      }),
      prisma.labProject.findMany({
        where: { visibility: 'PUBLIC', status: { in: ['IDEA', 'PLANNING', 'IN_PROGRESS'] } },
        take: 10,
      }),
    ]);

    const studentSkillNames = new Set(studentSkills.map((s) => s.skill.name.toLowerCase()));
    const studentDept = user?.profile?.department;

    // 1. Match Opportunities
    for (const opp of opportunities) {
      const reasons: string[] = [];
      let matchPoints = 40; // baseline

      if (opp.requiredSkills && opp.requiredSkills.length > 0) {
        let matchedCount = 0;
        for (const req of opp.requiredSkills) {
          if (studentSkillNames.has(req.skill.name.toLowerCase())) {
            matchedCount++;
            reasons.push(`Matches your skill in ${req.skill.name}`);
          }
        }
        if (matchedCount > 0) {
          matchPoints += Math.min(45, (matchedCount / opp.requiredSkills.length) * 45);
        }
      }

      if (opp.deadline) {
        const diffDays = Math.ceil((new Date(opp.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (diffDays > 0 && diffDays <= 14) {
          reasons.push(`Approaching deadline (${diffDays} days left)`);
          matchPoints += 15;
        }
      }

      if (reasons.length > 0) {
        recommendations.push({
          id: `rec-opp-${opp.id}`,
          type: 'OPPORTUNITY',
          title: opp.title,
          subtitle: opp.organization,
          description: opp.description.substring(0, 140),
          url: `/opportunities/${opp.slug}`,
          matchScore: Math.min(100, Math.round(matchPoints)),
          reasons,
        });
      }
    }

    // 2. Match Research Projects
    for (const rp of researchProjects) {
      const reasons: string[] = [];
      let score = 50;

      if (studentDept && rp.department === studentDept) {
        reasons.push(`Same department (${studentDept.replace(/_/g, ' ')})`);
        score += 25;
      }

      for (const sName of studentSkillNames) {
        if (rp.category.toLowerCase().includes(sName) || rp.title.toLowerCase().includes(sName)) {
          reasons.push(`Aligns with your experience in ${sName}`);
          score += 25;
          break;
        }
      }

      if (reasons.length > 0) {
        recommendations.push({
          id: `rec-rp-${rp.id}`,
          type: 'RESEARCH',
          title: rp.title,
          subtitle: `Category: ${rp.category}`,
          description: rp.description.substring(0, 140),
          url: `/research/${rp.slug}`,
          matchScore: Math.min(100, score),
          reasons,
        });
      }
    }

    // Sort by highest match score
    return recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, 12);
  }

  /**
   * Build complete intelligence context for AI Copilot prompt injection
   */
  static async buildCopilotIntelligenceContext(userId: string): Promise<string> {
    const [nextActions, recommendations] = await Promise.all([
      this.getSmartNextActions(userId),
      this.getRecommendations(userId),
    ]);

    let context = '### FCI CONNECT INTELLIGENCE LAYER STATE:\n';

    if (nextActions.length > 0) {
      context += 'Current Smart Next Actions for Student:\n';
      nextActions.slice(0, 5).forEach((act, idx) => {
        context += `${idx + 1}. [${act.priority}] ${act.title}: ${act.description}\n`;
      });
    }

    if (recommendations.length > 0) {
      context += '\nPersonalized Platform Recommendations:\n';
      recommendations.slice(0, 4).forEach((rec, idx) => {
        context += `${idx + 1}. ${rec.type}: "${rec.title}" (Match: ${rec.matchScore}%). Reasons: ${rec.reasons.join(', ')}\n`;
      });
    }

    return context;
  }
}
