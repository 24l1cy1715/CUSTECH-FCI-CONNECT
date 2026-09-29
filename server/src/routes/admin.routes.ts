import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { digitalIdController } from '../controllers/digitalId.controller';
import { authenticate } from '../middleware/authenticate';
import { requireAnyRole, requireRole } from '../middleware/authorize';

export const adminRouter = Router();

// Protect all admin endpoints with JWT authentication and Super Admin / Admin role check
adminRouter.use(authenticate);
adminRouter.use(requireAnyRole(['ADMIN', 'SUPER_ADMIN']));

// ── Overview & Metrics ──
adminRouter.get('/stats', AdminController.getStats);

// ── User & Role Governance (Restricted strictly to SUPER_ADMIN) ──
adminRouter.get('/users', AdminController.getUsers);
adminRouter.patch('/users/:id/role', requireRole('SUPER_ADMIN'), AdminController.updateUserRole);
adminRouter.patch('/users/:id/points', AdminController.adjustPoints);

// ── Project Moderation ──
adminRouter.get('/projects/pending', AdminController.getPendingProjects);
adminRouter.patch('/projects/:id/status', AdminController.updateProjectStatus);

// ── Business Verification ──
adminRouter.get('/businesses/pending', AdminController.getPendingBusinesses);
adminRouter.patch('/businesses/:id/status', AdminController.updateBusinessStatus);

// ── Announcements ──
adminRouter.get('/announcements', AdminController.getAnnouncements);
adminRouter.post('/announcements', AdminController.createAnnouncement);
adminRouter.patch('/announcements/:id/toggle', AdminController.toggleAnnouncement);

// ── Audit Logs (Restricted strictly to SUPER_ADMIN) ──
adminRouter.get('/audit-logs', requireRole('SUPER_ADMIN'), AdminController.getAuditLogs);

// ── Digital ID Governance Alias ──
adminRouter.get('/digital-id', digitalIdController.adminListIdentities);
adminRouter.post('/digital-id/:userId/verify', digitalIdController.adminVerify);
adminRouter.post('/digital-id/:userId/suspend', digitalIdController.adminSuspend);
adminRouter.post('/digital-id/:userId/revoke', digitalIdController.adminRevoke);
adminRouter.post('/digital-id/:userId/regenerate', digitalIdController.adminRegenerate);
