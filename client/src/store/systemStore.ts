import { create } from 'zustand';
import axios from 'axios';

interface SystemState {
  isLocked: boolean;
  lockdownMessage: string;
  updatedAt: string | null;
  isLoading: boolean;
  lastChecked: number;

  checkLockdownStatus: () => Promise<boolean>;
  setLockedFromResponse: (message?: string, updatedAt?: string) => void;
  toggleLockdown: (enabled: boolean, message?: string) => Promise<boolean>;
}

export const useSystemStore = create<SystemState>((set, get) => ({
  isLocked: false,
  lockdownMessage:
    'The FCI Connect student portal is temporarily unavailable for scheduled maintenance or administrative activity. Please check back shortly.',
  updatedAt: null,
  isLoading: false,
  lastChecked: 0,

  checkLockdownStatus: async () => {
    try {
      set({ isLoading: true });
      const res = await axios.get('/api/v1/system/lockdown', { withCredentials: true });
      const data = res.data?.data;
      const isLocked = !!data?.locked;
      const lockdownMessage = data?.message || get().lockdownMessage;
      const updatedAt = data?.updatedAt || null;

      set({
        isLocked,
        lockdownMessage,
        updatedAt,
        isLoading: false,
        lastChecked: Date.now(),
      });

      return isLocked;
    } catch {
      set({ isLoading: false });
      return get().isLocked;
    }
  },

  setLockedFromResponse: (message?: string, updatedAt?: string) => {
    set({
      isLocked: true,
      lockdownMessage: message || get().lockdownMessage,
      updatedAt: updatedAt || get().updatedAt,
      lastChecked: Date.now(),
    });
  },

  toggleLockdown: async (enabled: boolean, message?: string) => {
    try {
      set({ isLoading: true });
      const res = await axios.post(
        '/api/v1/system/lockdown',
        { enabled, message },
        { withCredentials: true }
      );
      const data = res.data?.data;

      set({
        isLocked: !!data?.locked,
        lockdownMessage: data?.message || get().lockdownMessage,
        updatedAt: data?.updatedAt || new Date().toISOString(),
        isLoading: false,
        lastChecked: Date.now(),
      });

      return true;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
