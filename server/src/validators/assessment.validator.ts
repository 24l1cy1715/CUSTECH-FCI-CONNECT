import { z } from 'zod';

export const createAssessmentSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10),
  skillId: z.string().uuid().optional(),
  category: z.string().min(2),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).default('INTERMEDIATE'),
  timeLimitMinutes: z.number().int().min(1).max(180).default(15),
  passingScorePercentage: z.number().int().min(1).max(100).default(70),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
  questions: z
    .array(
      z.object({
        questionText: z.string().min(5),
        questionType: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'CODE_OUTPUT', 'SCENARIO']).default('MULTIPLE_CHOICE'),
        options: z.array(z.string().min(1)).min(2),
        correctOptionIndex: z.number().int().min(0),
        explanation: z.string().optional(),
        points: z.number().int().min(1).default(10),
        position: z.number().int().default(0),
      })
    )
    .optional(),
});

export const submitAttemptSchema = z.object({
  timeSpentSeconds: z.number().int().min(1),
  answers: z.record(z.string(), z.number().int()), // { [questionId]: selectedOptionIndex }
});
