import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useSystemStore } from '@/store/systemStore';

const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30_000,
});

// Mutex promise to deduplicate concurrent refresh requests
let refreshPromise: Promise<void> | null = null;

// ── Response Interceptor: handle 401 & token refresh gracefully ─────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean });

    // Only attempt refresh for 401s that are not auth endpoints themselves
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post('/api/v1/auth/refresh-token', {}, { withCredentials: true })
            .then(() => {})
            .finally(() => {
              refreshPromise = null;
            });
        }

        await refreshPromise;
        return apiClient(originalRequest);
      } catch {
        // Refresh token is expired or invalid — transition auth store cleanly to unauthenticated
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }
    }

    // ── Student Portal Lockdown Interceptor (HTTP 423) ───────────────────────
    if (error.response?.status === 423 || error.response?.data?.code === 'STUDENT_PORTAL_LOCKED') {
      const user = useAuthStore.getState().user;
      const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN');

      if (!isAdmin) {
        useSystemStore.getState().setLockedFromResponse(
          error.response?.data?.message,
          error.response?.data?.updatedAt
        );

        if (typeof window !== 'undefined' && window.location.pathname !== '/lockdown') {
          window.location.href = '/lockdown';
        }
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
