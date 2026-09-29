import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Theme ─────────────────────────────────────────────────────────────────────
type Theme = 'light' | 'dark' | 'system';

interface UIState {
  theme: Theme;
  language: string;
  sidebarOpen: boolean;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: string) => void;
  setSidebarOpen: (open: boolean) => void;
  resolvedTheme: () => 'light' | 'dark';
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      language: 'en',
      sidebarOpen: false,

      setTheme: (theme) => {
        set({ theme });
        const resolved = theme === 'system' ? getSystemTheme() : theme;
        if (resolved === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      setLanguage: (language) => set({ language }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

      resolvedTheme: () => {
        const { theme } = get();
        return theme === 'system' ? getSystemTheme() : theme;
      },
    }),
    {
      name: 'custech-ui',
      partialize: (state) => ({ theme: state.theme, language: state.language }),
    },
  ),
);
