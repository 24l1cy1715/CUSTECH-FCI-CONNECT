import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';
import {
  AssessmentDifficulty,
  AssessmentStatus,
  AssessmentQuestionType,
  ActivityType,
  ActivityVisibility,
  NotificationType,
} from '@prisma/client';
import { createActivity } from '../services/activity.service';

const defaultAssessmentsSeed = [
  {
    title: 'Python Core & Algorithms',
    slug: 'python-core-algorithms',
    description: 'Demonstrate proficiency in Python fundamentals, data structures, and algorithmic reasoning.',
    category: 'PROGRAMMING',
    difficulty: AssessmentDifficulty.INTERMEDIATE,
    timeLimitMinutes: 15,
    passingScorePercentage: 70,
    questions: [
      {
        questionText: 'What is the output of `bool([])` in Python?',
        questionType: AssessmentQuestionType.MULTIPLE_CHOICE,
        options: ['True', 'False', 'None', 'TypeError'],
        correctOptionIndex: 1,
        explanation: 'In Python, empty collections like lists, dicts, and tuples evaluate to False in boolean context.',
        points: 10,
        position: 1,
      },
      {
        questionText: 'Which Python data structure provides O(1) average time complexity for key lookups?',
        questionType: AssessmentQuestionType.MULTIPLE_CHOICE,
        options: ['List', 'Dictionary (dict)', 'Tuple', 'Linked List'],
        correctOptionIndex: 1,
        explanation: 'Python dictionaries are implemented as hash tables offering O(1) average time key lookups.',
        points: 10,
        position: 2,
      },
      {
        questionText: 'True or False: Python tuples are mutable objects.',
        questionType: AssessmentQuestionType.TRUE_FALSE,
        options: ['True', 'False'],
        correctOptionIndex: 1,
        explanation: 'Tuples are immutable sequence types in Python; once created, their elements cannot be changed.',
        points: 10,
        position: 3,
      },
      {
        questionText: 'What will `print([i * 2 for i in range(3)])` output?',
        questionType: AssessmentQuestionType.CODE_OUTPUT,
        options: ['[0, 2, 4]', '[2, 4, 6]', '[0, 1, 2]', '[1, 2, 3]'],
        correctOptionIndex: 0,
        explanation: 'range(3) produces 0, 1, 2. Multiplying each by 2 yields [0, 2, 4].',
        points: 10,
        position: 4,
      },
    ],
  },
  {
    title: 'Cybersecurity & Network Defense',
    slug: 'cybersecurity-network-defense',
    description: 'Assess foundational knowledge in network security, penetration testing concepts, and defense mechanisms.',
    category: 'CYBERSECURITY',
    difficulty: AssessmentDifficulty.INTERMEDIATE,
    timeLimitMinutes: 20,
    passingScorePercentage: 75,
    questions: [
      {
        questionText: 'Which layer of the OSI model does an IP address operate at?',
        questionType: AssessmentQuestionType.MULTIPLE_CHOICE,
        options: ['Layer 2 (Data Link)', 'Layer 3 (Network)', 'Layer 4 (Transport)', 'Layer 7 (Application)'],
        correctOptionIndex: 1,
        explanation: 'Logical addressing and routing using IP operates at Layer 3 (Network).',
        points: 10,
        position: 1,
      },
      {
        questionText: 'Which cryptographic algorithm is classified as asymmetric (public-key)?',
        questionType: AssessmentQuestionType.MULTIPLE_CHOICE,
        options: ['AES-256', 'RSA', 'DES', 'Blowfish'],
        correctOptionIndex: 1,
        explanation: 'RSA is an asymmetric algorithm utilizing public and private key pairs.',
        points: 10,
        position: 2,
      },
      {
        questionText: 'What type of attack involves overwhelming a server with a flood of TCP SYN packets?',
        questionType: AssessmentQuestionType.SCENARIO,
        options: ['SYN Flood DDoS', 'SQL Injection', 'Cross-Site Scripting (XSS)', 'Man-in-the-Middle'],
        correctOptionIndex: 0,
        explanation: 'A SYN flood exploits the TCP 3-way handshake by leaving connections half-open to exhaust resources.',
        points: 10,
        position: 3,
      },
    ],
  },
];

export const assessmentController = {
  // ── 1. List Skill Assessments ───────────────────────────────────────────────
  listAssessments: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, difficulty, search } = req.query;

      // Check if assessments exist, if not, auto-seed default ones
      const count = await prisma.skillAssessment.count();
      if (count === 0) {
        for (const item of defaultAssessmentsSeed) {
          const { questions, ...assessData } = item;
          await prisma.skillAssessment.create({
            data: {
              ...assessData,
              status: AssessmentStatus.PUBLISHED,
              questions: {
                create: questions,
              },
            },
          });
        }
      }

      const whereClause: any = { status: AssessmentStatus.PUBLISHED };
      if (category) whereClause.category = category as string;
      if (difficulty) whereClause.difficulty = difficulty as AssessmentDifficulty;
      if (search) {
        whereClause.OR = [
          { title: { contains: search as string } },
          { description: { contains: search as string } },
        ];
      }

      const assessments = await prisma.skillAssessment.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          skill: { select: { name: true, slug: true } },
          _count: { select: { questions: true, attempts: true } },
        },
      });

      res.json({ success: true, data: assessments });
    } catch (error) {
      next(error);
    }
  },

  // ── 2. Get Assessment Details (WITHOUT exposing correct answers) ─────────────
  getAssessment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slugOrId = req.params.slugOrId as string;

      const assessment = await prisma.skillAssessment.findFirst({
        where: {
          OR: [{ id: slugOrId }, { slug: slugOrId }],
          status: AssessmentStatus.PUBLISHED,
        },
        include: {
          skill: { select: { id: true, name: true, slug: true } },
          questions: {
            orderBy: { position: 'asc' },
            select: {
              id: true,
              questionText: true,
              questionType: true,
              options: true,
              points: true,
              position: true,
              // NOTICE: correctOptionIndex and explanation are deliberately omitted here!
            },
          },
        },
      });

      if (!assessment) throw ApiError.notFound('Assessment not found');

      res.json({ success: true, data: assessment });
    } catch (error) {
      next(error);
    }
  },

  // ── 3. Submit Attempt & Grade Server-Side ───────────────────────────────────
  submitAttempt: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const id = req.params.id as string;
      const { timeSpentSeconds, answers } = req.body; // answers: { [questionId]: selectedOptionIndex }

      const assessment = await prisma.skillAssessment.findUnique({
        where: { id },
        include: { questions: true, skill: true },
      });

      if (!assessment) throw ApiError.notFound('Assessment not found');

      // Grade questions server-side
      let totalEarned = 0;
      let totalPossible = 0;
      const reviewDetails: any[] = [];

      for (const question of assessment.questions) {
        totalPossible += question.points;
        const selected = answers[question.id];
        const isCorrect = selected === question.correctOptionIndex;

        if (isCorrect) {
          totalEarned += question.points;
        }

        reviewDetails.push({
          questionId: question.id,
          questionText: question.questionText,
          selectedOptionIndex: selected,
          correctOptionIndex: question.correctOptionIndex,
          isCorrect,
          explanation: question.explanation,
        });
      }

      const scorePercentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
      const isPassed = scorePercentage >= assessment.passingScorePercentage;

      // Record attempt
      const attempt = await prisma.assessmentAttempt.create({
        data: {
          assessmentId: assessment.id,
          userId,
          scorePercentage,
          isPassed,
          timeSpentSeconds,
          answersSubmitted: reviewDetails,
          completedAt: new Date(),
        },
      });

      // If passed and linked to a skill, update StudentSkill to verified!
      if (isPassed && assessment.skillId) {
        await prisma.studentSkill.upsert({
          where: {
            userId_skillId: { userId, skillId: assessment.skillId },
          },
          update: {
            isVerified: true,
            verifiedScore: scorePercentage,
            verifiedAt: new Date(),
          },
          create: {
            userId,
            skillId: assessment.skillId,
            proficiency: assessment.difficulty as any,
            isVerified: true,
            verifiedScore: scorePercentage,
            verifiedAt: new Date(),
          },
        });

        // Activity feed entry
        await createActivity({
          actorId: userId,
          type: ActivityType.SKILL_ASSESSMENT_PASSED,
          entityType: 'ASSESSMENT',
          title: `Verified skill in ${assessment.title} (${scorePercentage}%)`,
          description: `Passed the FCI assessment with distinction.`,
          entityId: attempt.id,
          visibility: ActivityVisibility.PUBLIC,
        }).catch(() => null);

        // Notify user
        await prisma.notification.create({
          data: {
            userId,
            type: NotificationType.ASSESSMENT_RESULT,
            title: `Assessment Passed: ${assessment.title}`,
            message: `Congratulations! You scored ${scorePercentage}% and earned the verified skill badge.`,
            entityType: 'ASSESSMENT',
            entityId: attempt.id,
          },
        }).catch(() => null);
      }

      res.json({
        success: true,
        data: {
          attemptId: attempt.id,
          scorePercentage,
          isPassed,
          passingScorePercentage: assessment.passingScorePercentage,
          timeSpentSeconds,
          review: reviewDetails,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ── 4. My Attempts History ──────────────────────────────────────────────────
  getMyAttempts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const attempts = await prisma.assessmentAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          assessment: {
            select: { id: true, title: true, slug: true, category: true, difficulty: true },
          },
        },
      });

      res.json({ success: true, data: attempts });
    } catch (error) {
      next(error);
    }
  },
};
