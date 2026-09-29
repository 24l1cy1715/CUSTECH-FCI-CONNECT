import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';
import {
  SiwesStatus,
  SiwesLogStatus,
  SiwesDocType,
  ActivityType,
  ActivityVisibility,
} from '@prisma/client';
import { createActivity } from '../services/activity.service';

export const siwesController = {
  // ── 1. Get or Initialize Student Placement ──────────────────────────────────
  getMyPlacement: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      let placement = await prisma.siwesPlacement.findFirst({
        where: { studentId: userId },
        include: {
          academicSupervisor: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true, avatarUrl: true, department: true } },
            },
          },
          weeklyLogs: {
            orderBy: { weekNumber: 'desc' },
          },
          documents: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!placement) {
        // Fetch user profile department to auto-fill
        const profile = await prisma.profile.findUnique({ where: { userId } });
        placement = await prisma.siwesPlacement.create({
          data: {
            studentId: userId,
            companyName: 'Not Assigned',
            status: SiwesStatus.NOT_STARTED,
            department: profile?.department || null,
          },
          include: {
            academicSupervisor: {
              select: {
                id: true,
                email: true,
                profile: { select: { fullName: true, avatarUrl: true, department: true } },
              },
            },
            weeklyLogs: true,
            documents: true,
          },
        });
      }

      res.json({ success: true, data: placement });
    } catch (error) {
      next(error);
    }
  },

  // ── 2. Update Placement ─────────────────────────────────────────────────────
  updatePlacement: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const placement = await prisma.siwesPlacement.findFirst({
        where: { studentId: userId },
      });
      if (!placement) throw ApiError.notFound('Placement record not found');

      const {
        companyName,
        companyAddress,
        companyCity,
        companyState,
        industrySector,
        industrySupervisorName,
        industrySupervisorEmail,
        industrySupervisorPhone,
        startDate,
        endDate,
      } = req.body;

      // Students can update their placement details. They cannot assign supervisors or self-award completion.
      const safeData: any = {};
      if (companyName !== undefined) safeData.companyName = companyName;
      if (companyAddress !== undefined) safeData.companyAddress = companyAddress;
      if (companyCity !== undefined) safeData.companyCity = companyCity;
      if (companyState !== undefined) safeData.companyState = companyState;
      if (industrySector !== undefined) safeData.industrySector = industrySector;
      if (industrySupervisorName !== undefined) safeData.industrySupervisorName = industrySupervisorName;
      if (industrySupervisorEmail !== undefined) safeData.industrySupervisorEmail = industrySupervisorEmail;
      if (industrySupervisorPhone !== undefined) safeData.industrySupervisorPhone = industrySupervisorPhone;
      if (startDate) safeData.startDate = new Date(startDate);
      if (endDate) safeData.endDate = new Date(endDate);

      // Auto-advance from NOT_STARTED to ACTIVE if companyName provided
      if (placement.status === SiwesStatus.NOT_STARTED && companyName && companyName !== 'Not Assigned') {
        safeData.status = SiwesStatus.ACTIVE;
      }

      const updated = await prisma.siwesPlacement.update({
        where: { id: placement.id },
        data: safeData,
        include: {
          academicSupervisor: {
            select: {
              id: true,
              profile: { select: { fullName: true, avatarUrl: true } },
            },
          },
          weeklyLogs: true,
          documents: true,
        },
      });

      res.json({ success: true, message: 'Placement details updated', data: updated });
    } catch (error) {
      next(error);
    }
  },

  // ── 3. Weekly Logs ──────────────────────────────────────────────────────────
  createWeeklyLog: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const placement = await prisma.siwesPlacement.findFirst({
        where: { studentId: userId },
      });
      if (!placement) throw ApiError.notFound('Placement record not found');

      const {
        weekNumber,
        startDate,
        endDate,
        activities,
        skillsLearned,
        challenges,
        supervisorComments,
        documentUrl,
        status = 'DRAFT',
      } = req.body;

      const log = await prisma.siwesWeeklyLog.upsert({
        where: {
          placementId_weekNumber: {
            placementId: placement.id,
            weekNumber,
          },
        },
        update: {
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          activities,
          skillsLearned,
          challenges,
          supervisorComments,
          documentUrl,
          status: status as SiwesLogStatus,
        },
        create: {
          placementId: placement.id,
          weekNumber,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          activities,
          skillsLearned: skillsLearned || null,
          challenges: challenges || null,
          supervisorComments: supervisorComments || null,
          documentUrl: documentUrl || null,
          status: status as SiwesLogStatus,
        },
      });

      res.status(201).json({ success: true, message: `Week ${weekNumber} log saved`, data: log });
    } catch (error) {
      next(error);
    }
  },

  updateWeeklyLog: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const logId = req.params.logId as string;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const log = await prisma.siwesWeeklyLog.findUnique({
        where: { id: logId },
        include: { placement: true },
      }) as any;
      if (!log) throw ApiError.notFound('Weekly log not found');
      if (log.placement.studentId !== userId) {
        throw ApiError.forbidden('You do not have permission to edit this log');
      }

      const data = req.body;
      const updated = await prisma.siwesWeeklyLog.update({
        where: { id: logId },
        data: {
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
        },
      });

      res.json({ success: true, message: 'Weekly log updated', data: updated });
    } catch (error) {
      next(error);
    }
  },

  // ── 4. Documents ────────────────────────────────────────────────────────────
  addDocument: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const placement = await prisma.siwesPlacement.findFirst({
        where: { studentId: userId },
      });
      if (!placement) throw ApiError.notFound('Placement record not found');

      const { title, docType, fileUrl, fileSize, mimeType } = req.body;

      const doc = await prisma.siwesDocument.create({
        data: {
          placementId: placement.id,
          title,
          docType: docType as SiwesDocType,
          fileUrl,
          fileSize: fileSize || null,
          mimeType: mimeType || null,
        },
      });

      res.status(201).json({ success: true, message: 'Document added to SIWES record', data: doc });
    } catch (error) {
      next(error);
    }
  },

  deleteDocument: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const docId = req.params.docId as string;
      if (!userId) throw ApiError.unauthorized('Authentication required');

      const doc = await prisma.siwesDocument.findUnique({
        where: { id: docId },
        include: { placement: true },
      }) as any;
      if (!doc) throw ApiError.notFound('Document not found');
      if (doc.placement.studentId !== userId) {
        throw ApiError.forbidden('Unauthorized to delete this document');
      }

      await prisma.siwesDocument.delete({ where: { id: docId } });
      res.json({ success: true, message: 'Document removed' });
    } catch (error) {
      next(error);
    }
  },
};
