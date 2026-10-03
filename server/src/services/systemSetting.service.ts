import { prisma } from '../config/prisma';

export interface LockdownState {
  enabled: boolean;
  message?: string;
  updatedAt?: string;
  updatedBy?: string;
}

const DEFAULT_LOCKDOWN_MESSAGE =
  'The FCI Connect student portal is temporarily unavailable for scheduled maintenance or administrative activity. Please check back shortly.';

export class SystemSettingService {
  private static readonly LOCKDOWN_KEY = 'STUDENT_PORTAL_LOCKDOWN';
  private static cachedLockdown: LockdownState | null = null;
  private static lastCacheTime = 0;
  private static readonly CACHE_TTL_MS = 3000; // 3 seconds TTL for high responsiveness across instances

  /**
   * Retrieves the authoritative student portal lockdown status from the database.
   */
  static async getLockdownStatus(): Promise<LockdownState> {
    const now = Date.now();
    if (this.cachedLockdown && now - this.lastCacheTime < this.CACHE_TTL_MS) {
      return this.cachedLockdown;
    }

    try {
      const record = await prisma.systemSetting.findUnique({
        where: { key: this.LOCKDOWN_KEY },
      });

      if (!record || !record.value) {
        this.cachedLockdown = { enabled: false };
        this.lastCacheTime = now;
        return this.cachedLockdown;
      }

      const parsed = JSON.parse(record.value) as LockdownState;
      this.cachedLockdown = {
        enabled: !!parsed.enabled,
        message: parsed.message || DEFAULT_LOCKDOWN_MESSAGE,
        updatedAt: record.updatedAt.toISOString(),
        updatedBy: record.updatedBy || undefined,
      };
      this.lastCacheTime = now;
      return this.cachedLockdown;
    } catch (error) {
      console.error('[SystemSettingService] Failed to query lockdown status:', error);
      return { enabled: false };
    }
  }

  /**
   * Super Admin action: Updates the authoritative student portal lockdown status.
   * Records audit logs and persists state to MySQL.
   */
  static async setLockdownStatus(
    enabled: boolean,
    message?: string,
    adminUserId?: string,
    ipAddress?: string
  ): Promise<LockdownState> {
    const previous = await this.getLockdownStatus();
    const resolvedMessage = (message && message.trim()) || DEFAULT_LOCKDOWN_MESSAGE;

    const payload: LockdownState = {
      enabled,
      message: resolvedMessage,
      updatedAt: new Date().toISOString(),
      updatedBy: adminUserId,
    };

    // Upsert the system setting in MySQL
    const updatedRecord = await prisma.systemSetting.upsert({
      where: { key: this.LOCKDOWN_KEY },
      create: {
        key: this.LOCKDOWN_KEY,
        value: JSON.stringify(payload),
        updatedBy: adminUserId,
      },
      update: {
        value: JSON.stringify(payload),
        updatedBy: adminUserId,
      },
    });

    // Invalidate local in-memory cache
    this.cachedLockdown = {
      enabled,
      message: resolvedMessage,
      updatedAt: updatedRecord.updatedAt.toISOString(),
      updatedBy: adminUserId,
    };
    this.lastCacheTime = Date.now();

    // Create Audit Log entry for non-repudiation
    try {
      await prisma.auditLog.create({
        data: {
          action: enabled ? 'STUDENT_PORTAL_LOCKDOWN_ENABLED' : 'STUDENT_PORTAL_LOCKDOWN_DISABLED',
          actorId: adminUserId || 'SYSTEM',
          entityType: 'SYSTEM_SETTING',
          entityId: this.LOCKDOWN_KEY,
          ipAddress: ipAddress || '127.0.0.1',
          metadata: JSON.stringify({
            details: enabled
              ? `Super Admin enabled Global Student Portal Lockdown. Notice: "${resolvedMessage}"`
              : 'Super Admin disabled Global Student Portal Lockdown. Student access restored.',
            severity: enabled ? 'CRITICAL' : 'INFO',
            notice: resolvedMessage,
          }),
        },
      });
    } catch (auditError) {
      console.error('[SystemSettingService] Failed to record lockdown audit log:', auditError);
    }

    return this.cachedLockdown;
  }
}
