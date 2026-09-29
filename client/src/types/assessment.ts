export type AssessmentDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type AssessmentQuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'CODE_OUTPUT' | 'SCENARIO';

export interface AssessmentQuestion {
  id: string;
  questionText: string;
  question?: string;
  questionType: AssessmentQuestionType;
  options: string[];
  points: number;
  position: number;
}

export interface SkillAssessment {
  id: string;
  title: string;
  slug: string;
  description: string;
  skillId?: string | null;
  skillName?: string;
  category: string;
  difficulty: AssessmentDifficulty;
  timeLimitMinutes: number;
  passingScorePercentage: number;
  passingScore?: number;
  status: string;
  createdAt: string;
  skill?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  questions?: AssessmentQuestion[];
  _count?: {
    questions: number;
    attempts: number;
  };
}

export interface AssessmentReviewItem {
  questionId: string;
  questionText: string;
  selectedOptionIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  explanation?: string | null;
}

export interface AssessmentResult {
  attemptId: string;
  scorePercentage: number;
  isPassed: boolean;
  passingScorePercentage: number;
  timeSpentSeconds: number;
  review: AssessmentReviewItem[];
}

export interface AssessmentAttemptHistory {
  id: string;
  assessmentId: string;
  scorePercentage: number;
  isPassed: boolean;
  timeSpentSeconds: number;
  completedAt: string;
  assessment: {
    id: string;
    title: string;
    slug: string;
    category: string;
    difficulty: AssessmentDifficulty;
  };
}

export type AssessmentAttempt = AssessmentAttemptHistory;
