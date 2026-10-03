import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useUIStore } from '@/store/uiStore';
import '@/i18n';
import { usePageViewTracker } from '@/utils/analytics';

// Integrations
import { TawkToChat } from '@/components/integrations/TawkToChat';

// Layouts
import { MainLayout } from '@/components/layout/MainLayout';

import { RouteLoadingFallback } from '@/components/common/RouteLoadingFallback';

// Core entry pages (eager)
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Lazy-loaded route components for high-performance code splitting
const DiscoverPage = React.lazy(() => import('@/pages/DiscoverPage').then(m => ({ default: m.DiscoverPage })));
const ProjectsPage = React.lazy(() => import('@/pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const ProjectDetailPage = React.lazy(() => import('@/pages/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })));
const CreateProjectPage = React.lazy(() => import('@/pages/CreateProjectPage').then(m => ({ default: m.CreateProjectPage })));
const NewsPage = React.lazy(() => import('@/pages/NewsPage').then(m => ({ default: m.NewsPage })));
const NewsDetailPage = React.lazy(() => import('@/pages/NewsDetailPage').then(m => ({ default: m.NewsDetailPage })));
const RoommatesPage = React.lazy(() => import('@/pages/RoommatesPage').then(m => ({ default: m.RoommatesPage })));
const CreateRoommatePage = React.lazy(() => import('@/pages/CreateRoommatePage').then(m => ({ default: m.CreateRoommatePage })));
const BusinessesPage = React.lazy(() => import('@/pages/BusinessesPage').then(m => ({ default: m.BusinessesPage })));
const RegisterBusinessPage = React.lazy(() => import('@/pages/RegisterBusinessPage').then(m => ({ default: m.RegisterBusinessPage })));
const EventsPage = React.lazy(() => import('@/pages/EventsPage').then(m => ({ default: m.EventsPage })));
const LeaderboardPage = React.lazy(() => import('@/pages/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })));
const LoginPage = React.lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('@/pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const AuthCallbackPage = React.lazy(() => import('@/pages/AuthCallbackPage').then(m => ({ default: m.AuthCallbackPage })));
const ForgotPasswordPage = React.lazy(() => import('@/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AdminPortalPage = React.lazy(() => import('@/pages/AdminPortalPage').then(m => ({ default: m.AdminPortalPage })));
const ProfilePage = React.lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const TeamBuilderPage = React.lazy(() => import('@/pages/TeamBuilderPage').then(m => ({ default: m.TeamBuilderPage })));
const PublicPortfolioPage = React.lazy(() => import('@/pages/PublicPortfolioPage').then(m => ({ default: m.PublicPortfolioPage })));
const CustomizePortfolioPage = React.lazy(() => import('@/pages/CustomizePortfolioPage').then(m => ({ default: m.CustomizePortfolioPage })));
const OpportunitiesPage = React.lazy(() => import('@/pages/OpportunitiesPage').then(m => ({ default: m.OpportunitiesPage })));
const OpportunityDetailPage = React.lazy(() => import('@/pages/OpportunityDetailPage').then(m => ({ default: m.OpportunityDetailPage })));
const CopilotPage = React.lazy(() => import('@/pages/CopilotPage').then(m => ({ default: m.CopilotPage })));
const AchievementsPage = React.lazy(() => import('@/pages/AchievementsPage').then(m => ({ default: m.AchievementsPage })));
const CampusPage = React.lazy(() => import('@/pages/CampusPage').then(m => ({ default: m.CampusPage })));
const ActivityPage = React.lazy(() => import('@/pages/ActivityPage').then(m => ({ default: m.ActivityPage })));
const CommunitiesPage = React.lazy(() => import('@/pages/CommunitiesPage').then(m => ({ default: m.CommunitiesPage })));
const CommunityDetailPage = React.lazy(() => import('@/pages/CommunityDetailPage').then(m => ({ default: m.CommunityDetailPage })));
const MentorshipDashboardPage = React.lazy(() => import('@/pages/MentorshipDashboardPage').then(m => ({ default: m.MentorshipDashboardPage })));
const MentorDiscoveryPage = React.lazy(() => import('@/pages/MentorDiscoveryPage').then(m => ({ default: m.MentorDiscoveryPage })));
const LearningHubPage = React.lazy(() => import('@/pages/LearningHubPage').then(m => ({ default: m.LearningHubPage })));
const ResourceDetailPage = React.lazy(() => import('@/pages/ResourceDetailPage').then(m => ({ default: m.ResourceDetailPage })));
const LearningPathDetailPage = React.lazy(() => import('@/pages/LearningPathDetailPage').then(m => ({ default: m.LearningPathDetailPage })));
const DigitalIdPage = React.lazy(() => import('@/pages/DigitalIdPage').then(m => ({ default: m.DigitalIdPage })));
const PublicVerificationPage = React.lazy(() => import('@/pages/PublicVerificationPage').then(m => ({ default: m.PublicVerificationPage })));
const ProjectLabListPage = React.lazy(() => import('@/pages/ProjectLabListPage').then(m => ({ default: m.ProjectLabListPage })));
const ProjectLabWorkspacePage = React.lazy(() => import('@/pages/ProjectLabWorkspacePage').then(m => ({ default: m.ProjectLabWorkspacePage })));
const OpportunityTrackerPage = React.lazy(() => import('@/pages/OpportunityTrackerPage').then(m => ({ default: m.OpportunityTrackerPage })));
const ResearchHubPage = React.lazy(() => import('@/pages/ResearchHubPage').then(m => ({ default: m.ResearchHubPage })));
const ResearchDetailPage = React.lazy(() => import('@/pages/ResearchDetailPage').then(m => ({ default: m.ResearchDetailPage })));
const SiwesDashboardPage = React.lazy(() => import('@/pages/SiwesDashboardPage').then(m => ({ default: m.SiwesDashboardPage })));
const GitHubPortfolioPage = React.lazy(() => import('@/pages/GitHubPortfolioPage').then(m => ({ default: m.GitHubPortfolioPage })));
const SkillAssessmentCenterPage = React.lazy(() => import('@/pages/SkillAssessmentCenterPage').then(m => ({ default: m.SkillAssessmentCenterPage })));
const AssessmentTakePage = React.lazy(() => import('@/pages/AssessmentTakePage').then(m => ({ default: m.AssessmentTakePage })));
const MarketplacePage = React.lazy(() => import('@/pages/MarketplacePage').then(m => ({ default: m.MarketplacePage })));
const MarketplaceDetailPage = React.lazy(() => import('@/pages/MarketplaceDetailPage').then(m => ({ default: m.MarketplaceDetailPage })));
const StudentVoicePage = React.lazy(() => import('@/pages/StudentVoicePage').then(m => ({ default: m.StudentVoicePage })));
const MyFciDashboardPage = React.lazy(() => import('@/pages/MyFciDashboardPage').then(m => ({ default: m.MyFciDashboardPage })));
const AnnouncementsPage = React.lazy(() => import('@/pages/AnnouncementsPage').then(m => ({ default: m.AnnouncementsPage })));
const LockdownPage = React.lazy(() => import('@/pages/LockdownPage').then(m => ({ default: m.LockdownPage })));

// Privacy & Legal Policy Pages (public, lazy-loaded)
const PrivacyPolicyPage = React.lazy(() => import('@/pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const CookiePolicyPage = React.lazy(() => import('@/pages/CookiePolicyPage').then(m => ({ default: m.CookiePolicyPage })));
const TermsOfServicePage = React.lazy(() => import('@/pages/TermsOfServicePage').then(m => ({ default: m.TermsOfServicePage })));

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { useSystemStore } from '@/store/systemStore';
import apiClient from '@/api/client';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      staleTime: 30 * 1000, // 30s fresh time ensures navigation sees updated data
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error: any) => {
        // Do not retry client 401/403/404 errors
        const status = error?.response?.status;
        if (status === 401 || status === 403 || status === 404) return false;
        return failureCount < 2;
      },
    },
  },
});


/** Render-null component that lives inside BrowserRouter to activate analytics */
const AnalyticsLayer: React.FC = () => {
  usePageViewTracker();
  return null;
};

// Cookie Consent UI (lazy-loaded, non-blocking)
const CookieConsentBannerLazy = React.lazy(() =>
  import('@/components/common/CookieConsentBanner').then(m => ({ default: m.CookieConsentBanner }))
);
const CookiePreferencesModalLazy = React.lazy(() =>
  import('@/components/common/CookiePreferencesModal').then(m => ({ default: m.CookiePreferencesModal }))
);

export const App: React.FC = () => {

  const { theme, resolvedTheme } = useUIStore();
  const { setUser, user, isHydrated, setHydrated, logout, setLoading } = useAuthStore();
  const { checkLockdownStatus } = useSystemStore();

  // Periodic check of global application lockdown status (every 15s)
  useEffect(() => {
    checkLockdownStatus();
    const interval = setInterval(() => {
      checkLockdownStatus();
    }, 15000);
    return () => clearInterval(interval);
  }, [checkLockdownStatus]);

  // Apply theme class on mount and change
  useEffect(() => {
    const isDark = resolvedTheme() === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, resolvedTheme]);

  // Session verification & hydration on startup
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const res = await apiClient.get('/auth/me');
        if (isMounted && res.data?.data?.user) {
          const apiUser = res.data.data.user;
          setUser({
            id: apiUser.id || apiUser.userId,
            email: apiUser.email,
            roles: apiUser.roles || [],
            profile: apiUser.profile || user?.profile,
          });
        }
      } catch (err: any) {
        if (isMounted) {
          if (err?.response?.status === 401) {
            logout();
          } else {
            setLoading(false);
          }
        }
      } finally {
        if (isMounted) {
          setHydrated(true);
          setLoading(false);
        }
      }
    }

    checkSession();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* ── Accessibility: Skip to main content ────────────────── */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-accent focus:text-primary focus:font-bold focus:text-sm focus:shadow-lg"
        >
          Skip to main content
        </a>
        <AnalyticsLayer />
        <TawkToChat />
        <React.Suspense fallback={null}>
          <CookieConsentBannerLazy />
          <CookiePreferencesModalLazy />
        </React.Suspense>
        <React.Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            {/* Main Layout routes */}
            <Route element={<MainLayout />}>
              {/* ── Public Routes ── */}
              <Route path="/" element={<HomePage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/communities" element={<CommunitiesPage />} />
              <Route path="/communities/:slug" element={<CommunityDetailPage />} />
              <Route path="/mentorship/mentors" element={<MentorDiscoveryPage />} />
              <Route path="/learning" element={<LearningHubPage />} />
              <Route path="/learning-hub" element={<Navigate to="/learning" replace />} />
              <Route path="/learning/resources/:slug" element={<ResourceDetailPage />} />
              <Route path="/learning/paths/:slug" element={<LearningPathDetailPage />} />
              <Route path="/verify/:token" element={<PublicVerificationPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:slug" element={<ProjectDetailPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:slug" element={<NewsDetailPage />} />
              <Route path="/roommates" element={<RoommatesPage />} />
              <Route path="/businesses" element={<BusinessesPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/u/:username" element={<PublicPortfolioPage />} />
              <Route path="/portfolio/:username" element={<PublicPortfolioPage />} />
              <Route path="/opportunities" element={<OpportunitiesPage />} />
              <Route path="/opportunities/:slug" element={<OpportunityDetailPage />} />
              <Route path="/research" element={<ResearchHubPage />} />
              <Route path="/research/:slug" element={<ResearchDetailPage />} />
              <Route path="/assessments" element={<SkillAssessmentCenterPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/marketplace/:slug" element={<MarketplaceDetailPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/campus" element={<CampusPage />} />
              <Route path="/campus/:slug" element={<CampusPage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/profile/:username/achievements" element={<AchievementsPage />} />
              <Route path="/lockdown" element={<LockdownPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/cookie-policy" element={<CookiePolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />

              {/* ── Authenticated Student & User Routes ── */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/my-fci" element={<MyFciDashboardPage />} />
                <Route path="/mentorship" element={<MentorshipDashboardPage />} />
                <Route path="/digital-id" element={<DigitalIdPage />} />
                <Route path="/projects/new" element={<CreateProjectPage />} />
                <Route path="/roommates/new" element={<CreateRoommatePage />} />
                <Route path="/businesses/new" element={<RegisterBusinessPage />} />
                <Route path="/team-builder" element={<TeamBuilderPage />} />
                <Route path="/portfolio/customize" element={<CustomizePortfolioPage />} />
                <Route path="/opportunities/tracker" element={<OpportunityTrackerPage />} />
                <Route path="/project-lab" element={<ProjectLabListPage />} />
                <Route path="/project-lab/:slug" element={<ProjectLabWorkspacePage />} />
                <Route path="/siwes" element={<SiwesDashboardPage />} />
                <Route path="/internships" element={<SiwesDashboardPage />} />
                <Route path="/github" element={<GitHubPortfolioPage />} />
                <Route path="/assessments/:slug" element={<AssessmentTakePage />} />
                <Route path="/student-voice" element={<StudentVoicePage />} />
                <Route path="/copilot" element={<CopilotPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* ── Elevated Super Administrator Routes (Strictly SUPER_ADMIN) ── */}
              <Route element={<ProtectedRoute requiredRoles={['SUPER_ADMIN']} />}>
                <Route path="/admin" element={<AdminPortalPage />} />
                <Route path="/admin/:tab" element={<AdminPortalPage />} />
                <Route path="/super-admin" element={<AdminPortalPage />} />
                <Route path="/super-admin/:tab" element={<AdminPortalPage />} />
              </Route>


              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Standalone Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-otp" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ForgotPasswordPage />} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  );
};

export default App;
