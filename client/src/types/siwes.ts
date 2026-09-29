export type SiwesStatus =
  | 'NOT_STARTED'
  | 'SEARCHING'
  | 'APPLIED'
  | 'INTERVIEW'
  | 'OFFER_RECEIVED'
  | 'PLACED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';

export type SiwesLogStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED';

export type SiwesDocType =
  | 'ACCEPTANCE_LETTER'
  | 'PLACEMENT_LETTER'
  | 'CV'
  | 'LOGBOOK'
  | 'REPORT'
  | 'EVALUATION'
  | 'OTHER';

export interface SiwesWeeklyLog {
  id: string;
  placementId: string;
  weekNumber: number;
  startDate?: string | null;
  endDate?: string | null;
  activities: string;
  skillsLearned?: string | null;
  challenges?: string | null;
  supervisorComments?: string | null;
  documentUrl?: string | null;
  status: SiwesLogStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SiwesDocument {
  id: string;
  placementId: string;
  title: string;
  docType: SiwesDocType;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string | null;
  createdAt: string;
}

export interface SiwesPlacement {
  id: string;
  studentId: string;
  companyName: string;
  companyAddress?: string | null;
  roleTitle?: string | null;
  industrySupervisorName?: string | null;
  industrySupervisorEmail?: string | null;
  industrySupervisorPhone?: string | null;
  academicSupervisorId?: string | null;
  status: SiwesStatus;
  startDate?: string | null;
  endDate?: string | null;
  department?: string | null;
  createdAt: string;
  updatedAt: string;
  academicSupervisor?: {
    id: string;
    email: string;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
      department?: string | null;
    } | null;
  } | null;
  weeklyLogs: SiwesWeeklyLog[];
  documents: SiwesDocument[];
}
