import { Router } from 'express';
import { authRouter } from './auth.routes';
import { adminRouter } from './admin.routes';
import { skillsRouter } from './skills.routes';
import { usersRouter } from './users.routes';
import { teamBuilderRouter } from './teamBuilder.routes';
import { portfolioRouter } from './portfolio.routes';
import { opportunityRouter } from './opportunity.routes';
import { copilotRouter } from './copilot.routes';
import { achievementRouter } from './achievement.routes';
import { campusRouter } from './campus.routes';
import { activityRouter } from './activity.routes';
import { communityRouter } from './community.routes';
import { mentorshipRouter } from './mentorship.routes';
import { learningRouter } from './learning.routes';
import { digitalIdRouter, publicVerifyRouter } from './digitalId.routes';
import projectLabRouter from './projectLab.routes';
import opportunityTrackerRouter from './opportunityTracker.routes';
import researchRouter from './research.routes';
import siwesRouter from './siwes.routes';
import githubRouter from './github.routes';
import assessmentRouter from './assessment.routes';
import marketplaceRouter from './marketplace.routes';
import voiceRouter from './voice.routes';
import announcementRouter from './announcement.routes';
import intelligenceRouter from './intelligence.routes';
import { systemRouter } from './system.routes';
import { profileRouter } from './profile.routes';

export const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
  res.json({ success: true, message: 'CUSTECH FCI Connect API v1', version: '1.0.0' });
});

// System & Global Governance routes
apiRouter.use('/system', systemRouter);

// Auth & Admin routes
apiRouter.use('/auth', authRouter);
apiRouter.use('/admin', adminRouter);

// Profile & Account Management
apiRouter.use('/profile', profileRouter);

// Skill Graph & User Skills routes (Part 1)
apiRouter.use('/skills', skillsRouter);
apiRouter.use('/users', usersRouter);

// AI Team Builder routes (Part 2)
apiRouter.use('/team-builder', teamBuilderRouter);

// Phase 2: QR Digital Portfolio & FCI Opportunity Hub
apiRouter.use('/portfolio', portfolioRouter);
apiRouter.use('/opportunities', opportunityRouter);

// Phase 3: FCI AI Personal Copilot & Achievement & Reputation System
apiRouter.use('/copilot', copilotRouter);
apiRouter.use('/achievements', achievementRouter);

// Phase 4: Smart Campus Map & Live Activity Feed
apiRouter.use('/campus', campusRouter);
apiRouter.use('/activity', activityRouter);

// Phase 5: Student Clubs & Communities & Mentorship Hub
apiRouter.use('/communities', communityRouter);
apiRouter.use('/mentorship', mentorshipRouter);

// Phase 6: Smart Study & Learning Hub & Digital FCI ID
apiRouter.use('/learning', learningRouter);
apiRouter.use('/digital-id', digitalIdRouter);
apiRouter.use('/verify', publicVerifyRouter);

// Phase 7: FCI Project Lab & Advanced Opportunity Tracker
apiRouter.use('/project-lab', projectLabRouter);
apiRouter.use('/opportunities', opportunityTrackerRouter);

// Phase 8: Research & Innovation Hub & SIWES / Internships
apiRouter.use('/research', researchRouter);
apiRouter.use('/siwes', siwesRouter);
apiRouter.use('/internships', siwesRouter);

// Phase 9: GitHub Integration & Skill Assessment Center
apiRouter.use('/github', githubRouter);
apiRouter.use('/assessments', assessmentRouter);

// Phase 10: Student Freelance Marketplace & Student Voice
apiRouter.use('/marketplace', marketplaceRouter);
apiRouter.use('/student-voice', voiceRouter);

// Phase 11: Important Announcements & My FCI Dashboard
apiRouter.use('/announcements', announcementRouter);
apiRouter.use('/intelligence', intelligenceRouter);
apiRouter.use('/my-fci', intelligenceRouter);




