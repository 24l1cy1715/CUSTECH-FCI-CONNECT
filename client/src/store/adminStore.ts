import { create } from 'zustand';
import {
  AdminUserRecord,
  AdminProjectRecord,
  AdminBusinessRecord,
  AdminAnnouncementRecord,
  AdminAuditLogRecord,
  AdminDashboardStats,
  UserRoleType,
  AccountStatus,
} from '@/types/admin';
import {
  INITIAL_ADMIN_USERS,
  INITIAL_ADMIN_PROJECTS,
  INITIAL_ADMIN_BUSINESSES,
  INITIAL_ADMIN_ANNOUNCEMENTS,
  INITIAL_ADMIN_AUDIT_LOGS,
  INITIAL_DASHBOARD_STATS,
} from '@/data/adminMockData';

export type AdminTab =
  | 'overview'
  | 'users'
  | 'projects'
  | 'businesses'
  | 'announcements'
  | 'achievements'
  | 'campus'
  | 'learning'
  | 'digital-id'
  | 'audit'
  | 'settings';

interface AdminStoreState {
  activeTab: AdminTab;
  stats: AdminDashboardStats;
  users: AdminUserRecord[];
  projects: AdminProjectRecord[];
  businesses: AdminBusinessRecord[];
  announcements: AdminAnnouncementRecord[];
  auditLogs: AdminAuditLogRecord[];
  maintenanceMode: boolean;
  userRegistrationOpen: boolean;

  // Actions
  setActiveTab: (tab: AdminTab) => void;
  setUserRole: (userId: string, role: UserRoleType, isAdding: boolean) => void;
  setUserStatus: (userId: string, status: AccountStatus) => void;
  adjustUserPoints: (userId: string, delta: number, reason: string) => void;
  approveProject: (projectId: string, points?: number) => void;
  rejectProject: (projectId: string, reason: string) => void;
  featureProjectToggle: (projectId: string) => void;
  approveBusiness: (businessId: string) => void;
  rejectBusiness: (businessId: string) => void;
  toggleBusinessVerification: (businessId: string) => void;
  createAnnouncement: (title: string, content: string, priority: 'NORMAL' | 'URGENT' | 'CRITICAL', category: any) => void;
  toggleAnnouncement: (id: string) => void;
  deleteAnnouncement: (id: string) => void;
  toggleMaintenanceMode: () => void;
  toggleUserRegistration: () => void;
  addAuditLog: (action: string, entityType: string, entityId: string, details: string, severity?: 'INFO' | 'WARN' | 'CRITICAL') => void;
}

export const useAdminStore = create<AdminStoreState>((set, get) => ({
  activeTab: 'overview',
  stats: INITIAL_DASHBOARD_STATS,
  users: INITIAL_ADMIN_USERS,
  projects: INITIAL_ADMIN_PROJECTS,
  businesses: INITIAL_ADMIN_BUSINESSES,
  announcements: INITIAL_ADMIN_ANNOUNCEMENTS,
  auditLogs: INITIAL_ADMIN_AUDIT_LOGS,
  maintenanceMode: false,
  userRegistrationOpen: true,

  setActiveTab: (tab) => set({ activeTab: tab }),

  setUserRole: (userId, role, isAdding) => {
    set((state) => {
      const updatedUsers = state.users.map((u) => {
        if (u.id !== userId) return u;
        const currentRoles = u.roles || [];
        let newRoles: UserRoleType[];
        if (isAdding) {
          newRoles = currentRoles.includes(role) ? currentRoles : [...currentRoles, role];
        } else {
          newRoles = currentRoles.filter((r) => r !== role);
        }
        return { ...u, roles: newRoles };
      });

      const targetUser = state.users.find((u) => u.id === userId);
      const actionDesc = `${isAdding ? 'Assigned' : 'Removed'} role [${role}] for user ${targetUser?.fullName || userId}`;

      const newLog: AdminAuditLogRecord = {
        id: `log-${Date.now()}`,
        actorName: 'Prof. S. O. Jimoh',
        actorEmail: 'admin@custech.edu.ng',
        action: isAdding ? 'ROLE_GRANTED' : 'ROLE_REVOKED',
        entityType: 'USER',
        entityId: userId,
        details: actionDesc,
        ipAddress: '102.89.44.12',
        timestamp: new Date().toISOString(),
        severity: 'INFO',
      };

      return {
        users: updatedUsers,
        auditLogs: [newLog, ...state.auditLogs],
      };
    });
  },

  setUserStatus: (userId, status) => {
    set((state) => {
      const updated = state.users.map((u) => (u.id === userId ? { ...u, status } : u));
      const targetUser = state.users.find((u) => u.id === userId);

      const newLog: AdminAuditLogRecord = {
        id: `log-${Date.now()}`,
        actorName: 'Prof. S. O. Jimoh',
        actorEmail: 'admin@custech.edu.ng',
        action: `ACCOUNT_${status}`,
        entityType: 'USER',
        entityId: userId,
        details: `Updated account status of ${targetUser?.fullName || userId} to [${status}]`,
        ipAddress: '102.89.44.12',
        timestamp: new Date().toISOString(),
        severity: status === 'SUSPENDED' ? 'WARN' : 'INFO',
      };

      return {
        users: updated,
        auditLogs: [newLog, ...state.auditLogs],
      };
    });
  },

  adjustUserPoints: (userId, delta, reason) => {
    set((state) => {
      let targetName = userId;
      const updatedUsers = state.users.map((u) => {
        if (u.id !== userId) return u;
        targetName = u.fullName;
        const newPoints = Math.max(0, (u.communityPoints || 0) + delta);
        return { ...u, communityPoints: newPoints };
      });

      const newLog: AdminAuditLogRecord = {
        id: `log-${Date.now()}`,
        actorName: 'Prof. S. O. Jimoh',
        actorEmail: 'admin@custech.edu.ng',
        action: 'POINTS_ADJUSTMENT',
        entityType: 'USER',
        entityId: userId,
        details: `${delta >= 0 ? '+' : ''}${delta} community points adjusted for ${targetName}. Reason: ${reason}`,
        ipAddress: '102.89.44.12',
        timestamp: new Date().toISOString(),
        severity: 'INFO',
      };

      return {
        users: updatedUsers,
        stats: {
          ...state.stats,
          totalPointsCirculating: state.stats.totalPointsCirculating + delta,
        },
        auditLogs: [newLog, ...state.auditLogs],
      };
    });
  },

  approveProject: (projectId, points = 100) => {
    set((state) => {
      let projTitle = projectId;
      let authorEmail = '';

      const updatedProjects = state.projects.map((p) => {
        if (p.id !== projectId) return p;
        projTitle = p.title;
        authorEmail = p.authorEmail;
        return { ...p, status: 'APPROVED' as const };
      });

      // Credit author with community points
      const updatedUsers = state.users.map((u) => {
        if (u.email === authorEmail || u.fullName.toLowerCase() === authorEmail.toLowerCase()) {
          return { ...u, communityPoints: u.communityPoints + points, projectsCount: u.projectsCount + 1 };
        }
        return u;
      });

      const pendingCount = updatedProjects.filter((p) => p.status === 'PENDING').length;
      const approvedCount = updatedProjects.filter((p) => p.status === 'APPROVED').length;

      const newLog: AdminAuditLogRecord = {
        id: `log-${Date.now()}`,
        actorName: 'Prof. S. O. Jimoh',
        actorEmail: 'admin@custech.edu.ng',
        action: 'PROJECT_APPROVED',
        entityType: 'PROJECT',
        entityId: projectId,
        details: `Approved project "${projTitle}" and awarded +${points} community points to author`,
        ipAddress: '102.89.44.12',
        timestamp: new Date().toISOString(),
        severity: 'INFO',
      };

      return {
        projects: updatedProjects,
        users: updatedUsers,
        stats: {
          ...state.stats,
          pendingProjects: pendingCount,
          approvedProjects: approvedCount,
          totalPointsCirculating: state.stats.totalPointsCirculating + points,
        },
        auditLogs: [newLog, ...state.auditLogs],
      };
    });
  },

  rejectProject: (projectId, reason) => {
    set((state) => {
      let projTitle = projectId;
      const updatedProjects = state.projects.map((p) => {
        if (p.id !== projectId) return p;
        projTitle = p.title;
        return { ...p, status: 'REJECTED' as const, rejectionReason: reason };
      });

      const pendingCount = updatedProjects.filter((p) => p.status === 'PENDING').length;

      const newLog: AdminAuditLogRecord = {
        id: `log-${Date.now()}`,
        actorName: 'Prof. S. O. Jimoh',
        actorEmail: 'admin@custech.edu.ng',
        action: 'PROJECT_REJECTED',
        entityType: 'PROJECT',
        entityId: projectId,
        details: `Rejected project "${projTitle}". Feedback: ${reason}`,
        ipAddress: '102.89.44.12',
        timestamp: new Date().toISOString(),
        severity: 'WARN',
      };

      return {
        projects: updatedProjects,
        stats: {
          ...state.stats,
          pendingProjects: pendingCount,
        },
        auditLogs: [newLog, ...state.auditLogs],
      };
    });
  },

  featureProjectToggle: (projectId) => {
    set((state) => {
      const target = state.projects.find((p) => p.id === projectId);
      const newLog: AdminAuditLogRecord = {
        id: `log-${Date.now()}`,
        actorName: 'Prof. S. O. Jimoh',
        actorEmail: 'admin@custech.edu.ng',
        action: 'PROJECT_FEATURED_TOGGLE',
        entityType: 'PROJECT',
        entityId: projectId,
        details: `Toggled spotlight spotlight featured status for "${target?.title || projectId}"`,
        ipAddress: '102.89.44.12',
        timestamp: new Date().toISOString(),
        severity: 'INFO',
      };
      return { auditLogs: [newLog, ...state.auditLogs] };
    });
  },

  approveBusiness: (businessId) => {
    set((state) => {
      let bizName = businessId;
      const updated = state.businesses.map((b) => {
        if (b.id !== businessId) return b;
        bizName = b.name;
        return { ...b, status: 'APPROVED' as const, isVerified: true };
      });

      const pendingCount = updated.filter((b) => b.status === 'PENDING').length;

      const newLog: AdminAuditLogRecord = {
        id: `log-${Date.now()}`,
        actorName: 'Prof. S. O. Jimoh',
        actorEmail: 'admin@custech.edu.ng',
        action: 'BUSINESS_VERIFIED',
        entityType: 'BUSINESS',
        entityId: businessId,
        details: `Verified tech venture "${bizName}" with official campus certification checkmark`,
        ipAddress: '102.89.44.12',
        timestamp: new Date().toISOString(),
        severity: 'INFO',
      };

      return {
        businesses: updated,
        stats: { ...state.stats, pendingBusinesses: pendingCount },
        auditLogs: [newLog, ...state.auditLogs],
      };
    });
  },

  rejectBusiness: (businessId) => {
    set((state) => {
      const updated = state.businesses.map((b) =>
        b.id === businessId ? { ...b, status: 'REJECTED' as const } : b,
      );
      const pendingCount = updated.filter((b) => b.status === 'PENDING').length;
      return {
        businesses: updated,
        stats: { ...state.stats, pendingBusinesses: pendingCount },
      };
    });
  },

  toggleBusinessVerification: (businessId) => {
    set((state) => {
      const updated = state.businesses.map((b) =>
        b.id === businessId ? { ...b, isVerified: !b.isVerified } : b,
      );
      return { businesses: updated };
    });
  },

  createAnnouncement: (title, content, priority, category) => {
    set((state) => {
      const newAnnouncement: AdminAnnouncementRecord = {
        id: `anc-${Date.now()}`,
        title,
        content,
        priority,
        category,
        isActive: true,
        createdBy: 'Prof. S. O. Jimoh (Super Admin)',
        createdAt: new Date().toISOString(),
      };

      const newLog: AdminAuditLogRecord = {
        id: `log-${Date.now()}`,
        actorName: 'Prof. S. O. Jimoh',
        actorEmail: 'admin@custech.edu.ng',
        action: 'BROADCAST_PUBLISHED',
        entityType: 'ANNOUNCEMENT',
        entityId: newAnnouncement.id,
        details: `Dispatched [${priority}] announcement "${title}" to faculty`,
        ipAddress: '102.89.44.12',
        timestamp: new Date().toISOString(),
        severity: priority === 'CRITICAL' ? 'WARN' : 'INFO',
      };

      return {
        announcements: [newAnnouncement, ...state.announcements],
        stats: {
          ...state.stats,
          activeAnnouncements: state.stats.activeAnnouncements + 1,
        },
        auditLogs: [newLog, ...state.auditLogs],
      };
    });
  },

  toggleAnnouncement: (id) => {
    set((state) => {
      const updated = state.announcements.map((a) =>
        a.id === id ? { ...a, isActive: !a.isActive } : a,
      );
      const activeCount = updated.filter((a) => a.isActive).length;
      return {
        announcements: updated,
        stats: { ...state.stats, activeAnnouncements: activeCount },
      };
    });
  },

  deleteAnnouncement: (id) => {
    set((state) => {
      const updated = state.announcements.filter((a) => a.id !== id);
      const activeCount = updated.filter((a) => a.isActive).length;
      return {
        announcements: updated,
        stats: { ...state.stats, activeAnnouncements: activeCount },
      };
    });
  },

  toggleMaintenanceMode: () => {
    set((state) => {
      const nextState = !state.maintenanceMode;
      const newLog: AdminAuditLogRecord = {
        id: `log-${Date.now()}`,
        actorName: 'Prof. S. O. Jimoh',
        actorEmail: 'admin@custech.edu.ng',
        action: nextState ? 'MAINTENANCE_MODE_ENABLED' : 'MAINTENANCE_MODE_DISABLED',
        entityType: 'SYSTEM',
        entityId: 'sys-env',
        details: nextState
          ? 'Emergency maintenance mode engaged by Super Admin. Read-only lockout simulated.'
          : 'Emergency maintenance mode disengaged. All campus services nominal.',
        ipAddress: '102.89.44.12',
        timestamp: new Date().toISOString(),
        severity: nextState ? 'CRITICAL' : 'INFO',
      };

      return {
        maintenanceMode: nextState,
        stats: {
          ...state.stats,
          systemHealth: {
            ...state.stats.systemHealth,
            status: nextState ? 'MAINTENANCE' : 'OPTIMAL',
          },
        },
        auditLogs: [newLog, ...state.auditLogs],
      };
    });
  },

  toggleUserRegistration: () => {
    set((state) => ({ userRegistrationOpen: !state.userRegistrationOpen }));
  },

  addAuditLog: (action, entityType, entityId, details, severity = 'INFO') => {
    set((state) => {
      const newLog: AdminAuditLogRecord = {
        id: `log-${Date.now()}`,
        actorName: 'Prof. S. O. Jimoh',
        actorEmail: 'admin@custech.edu.ng',
        action,
        entityType,
        entityId,
        details,
        ipAddress: '102.89.44.12',
        timestamp: new Date().toISOString(),
        severity,
      };
      return { auditLogs: [newLog, ...state.auditLogs] };
    });
  },
}));
