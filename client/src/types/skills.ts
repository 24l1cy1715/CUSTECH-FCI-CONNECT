// ── Skill Graph & Discovery Domain Types ─────────────────────────────────────

export type SkillCategory =
  | 'PROGRAMMING'
  | 'WEB_DEVELOPMENT'
  | 'MOBILE_DEVELOPMENT'
  | 'CYBERSECURITY'
  | 'NETWORKING'
  | 'CLOUD'
  | 'AI_MACHINE_LEARNING'
  | 'DATA_SCIENCE'
  | 'DATABASE'
  | 'UI_UX'
  | 'GRAPHIC_DESIGN'
  | 'DEVOPS'
  | 'HARDWARE'
  | 'LEADERSHIP'
  | 'COMMUNICATION'
  | 'ENTREPRENEURSHIP'
  | 'OTHER';

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  PROGRAMMING: 'Programming',
  WEB_DEVELOPMENT: 'Web Development',
  MOBILE_DEVELOPMENT: 'Mobile Development',
  CYBERSECURITY: 'Cybersecurity',
  NETWORKING: 'Networking',
  CLOUD: 'Cloud & Infrastructure',
  AI_MACHINE_LEARNING: 'AI & Machine Learning',
  DATA_SCIENCE: 'Data Science & Analytics',
  DATABASE: 'Databases',
  UI_UX: 'UI/UX Design',
  GRAPHIC_DESIGN: 'Graphic Design',
  DEVOPS: 'DevOps & CI/CD',
  HARDWARE: 'Hardware & IoT',
  LEADERSHIP: 'Leadership & Management',
  COMMUNICATION: 'Communication',
  ENTREPRENEURSHIP: 'Entrepreneurship',
  OTHER: 'Other Specialization',
};

export type SkillProficiency = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export const PROFICIENCY_LABELS: Record<SkillProficiency, { label: string; level: number; color: string }> = {
  BEGINNER: { label: 'Beginner', level: 1, color: 'text-sky-400 bg-sky-500/15 border-sky-500/30' },
  INTERMEDIATE: { label: 'Intermediate', level: 2, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
  ADVANCED: { label: 'Advanced', level: 3, color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
  EXPERT: { label: 'Expert', level: 4, color: 'text-purple-400 bg-purple-500/15 border-purple-500/30' },
};

export interface Skill {
  id: string;
  name: string;
  slug: string;
  category: SkillCategory;
  description?: string;
  studentCount?: number;
  projectCount?: number;
  createdAt?: string;
}

export interface StudentSkill {
  id: string;
  skillId: string;
  skill: {
    id: string;
    name: string;
    slug: string;
    category: SkillCategory;
    description?: string;
  };
  proficiency: SkillProficiency;
  yearsOfExperience?: number | null;
  isPrimary: boolean;
  createdAt?: string;
}

export interface SkillGraphNode {
  id: string;
  label: string;
  type: 'STUDENT' | 'SKILL' | 'PROJECT';
  category?: SkillCategory;
  proficiency?: SkillProficiency;
  isPrimary?: boolean;
}

export interface SkillGraphLink {
  source: string;
  target: string;
  type: string;
}

export interface SkillGraphData {
  nodes: SkillGraphNode[];
  links: SkillGraphLink[];
}

export interface UserSkillsResponse {
  userId: string;
  skills: StudentSkill[];
  graph: SkillGraphData;
}

export interface SkillDetail {
  id: string;
  name: string;
  slug: string;
  category: SkillCategory;
  description?: string;
  studentCount: number;
  projectCount: number;
  students: Array<{
    proficiency: SkillProficiency;
    yearsOfExperience?: number | null;
    isPrimary: boolean;
    user: {
      id: string;
      fullName: string;
      matricNumber?: string;
      department?: string;
      level?: number;
      avatarUrl?: string;
    };
  }>;
  projects: Array<{
    id: string;
    title: string;
    slug: string;
    description?: string;
    category?: string;
  }>;
  relatedSkills: Array<{
    id: string;
    name: string;
    slug: string;
    category: SkillCategory;
  }>;
}

export interface AddStudentSkillPayload {
  skillId?: string;
  skillName?: string;
  category?: SkillCategory;
  proficiency?: SkillProficiency;
  yearsOfExperience?: number;
  isPrimary?: boolean;
}

export interface UpdateStudentSkillPayload {
  proficiency?: SkillProficiency;
  yearsOfExperience?: number;
  isPrimary?: boolean;
}
