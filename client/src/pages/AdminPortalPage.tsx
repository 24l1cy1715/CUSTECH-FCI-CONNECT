import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Code2,
  Briefcase,
  Megaphone,
  ShieldAlert,
  ShieldCheck,
  Settings,
  Lock,
  ArrowRight,
  Database,
  RefreshCw,
  LogOut,
  Flame,
  Sparkles,
  Trophy,
  MapPin,
  BookOpen,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAdminStore, AdminTab } from '@/store/adminStore';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminCommandOverview } from '@/components/admin/AdminCommandOverview';
import { AdminUsersManager } from '@/components/admin/AdminUsersManager';
import { AdminProjectsModeration } from '@/components/admin/AdminProjectsModeration';
import { AdminBusinessesManager } from '@/components/admin/AdminBusinessesManager';
import { AdminAnnouncementsManager } from '@/components/admin/AdminAnnouncementsManager';
import { AdminAchievementsManager } from '@/components/admin/AdminAchievementsManager';
import { AdminCampusManager } from '@/components/admin/AdminCampusManager';
import { AdminLearningHubManager } from '@/components/admin/AdminLearningHubManager';
import { AdminDigitalIdManager } from '@/components/admin/AdminDigitalIdManager';
import { AdminAuditLogsView } from '@/components/admin/AdminAuditLogsView';
import { AdminSettingsManager } from '@/components/admin/AdminSettingsManager';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import toast from 'react-hot-toast';

export const AdminPortalPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, setUser, hasAnyRole } = useAuthStore();
  const {
    activeTab,
    setActiveTab,
    projects,
    businesses,
  } = useAdminStore();

  React.useEffect(() => {
    const rawPath = location.pathname.toLowerCase();
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab')?.toLowerCase();

    const candidate = tabParam || rawPath.split('/admin/')[1] || rawPath.split('/super-admin/')[1];

    if (!candidate) return;

    if (candidate.includes('digital-id') || candidate.includes('governance')) {
      setActiveTab('digital-id');
    } else if (candidate.includes('users') || candidate.includes('student')) {
      setActiveTab('users');
    } else if (candidate.includes('projects') || candidate.includes('queue')) {
      setActiveTab('projects');
    } else if (candidate.includes('business') || candidate.includes('startup') || candidate.includes('marketplace')) {
      setActiveTab('businesses');
    } else if (candidate.includes('announcement')) {
      setActiveTab('announcements');
    } else if (candidate.includes('achievement')) {
      setActiveTab('achievements');
    } else if (candidate.includes('campus') || candidate.includes('map')) {
      setActiveTab('campus');
    } else if (candidate.includes('learning') || candidate.includes('curricula') || candidate.includes('assessment')) {
      setActiveTab('learning');
    } else if (candidate.includes('audit') || candidate.includes('log')) {
      setActiveTab('audit');
    } else if (candidate.includes('setting')) {
      setActiveTab('settings');
    } else if (candidate.includes('overview') || candidate.includes('command') || candidate.includes('dashboard')) {
      setActiveTab('overview');
    }
  }, [location.pathname, location.search, setActiveTab]);

  const isSuperAdmin = Boolean(user?.roles?.includes('SUPER_ADMIN'));

  // ── Access Denied / Clearance Check Screen ──
  if (!isAuthenticated || !isSuperAdmin) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
        <Card className="max-w-md w-full p-6 sm:p-8 text-center space-y-5 border border-slate-200 shadow-xl bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-600 to-amber-600 rounded-t-2xl" />
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-200">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-rose-600 uppercase px-3 py-1 rounded-full bg-rose-50 border border-rose-200">
              Clearance Level 5 Required
            </span>
            <h1 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">
              CUSTECH FCI Command Center
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Restricted executive interface strictly for verified Faculty of Computing and Informatics Super Administrators.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-left space-y-1.5 font-mono">
            <div className="text-slate-400 flex items-center justify-between">
              <span>Active Session:</span>
              <span className="text-[10px] text-rose-500 font-bold uppercase">Restricted</span>
            </div>
            <div className="text-slate-800 font-bold truncate">{user?.email || 'Unauthenticated'}</div>
            <div className="text-[11px] text-slate-400">Assigned Roles: {user?.roles?.join(', ') || 'NONE'}</div>
          </div>

          <div className="space-y-2 pt-2">
            <Link to="/dashboard" className="block w-full">
              <Button variant="accent" className="w-full">
                Return to Student Dashboard
              </Button>
            </Link>
            <Link to="/" className="block w-full">
              <Button variant="ghost" className="w-full text-xs text-slate-500 hover:bg-slate-50">
                Return to Platform Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }


  const pendingProjectsCount = projects.filter((p) => p.status === 'PENDING').length;
  const pendingBusinessesCount = businesses.filter((b) => b.status === 'PENDING').length;

  const tabs: { id: AdminTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
    { id: 'users', label: 'User Governance', icon: Users },
    {
      id: 'projects',
      label: 'Projects Queue',
      icon: Code2,
      badge: pendingProjectsCount > 0 ? pendingProjectsCount : undefined,
    },
    {
      id: 'businesses',
      label: 'Tech Startups',
      icon: Briefcase,
      badge: pendingBusinessesCount > 0 ? pendingBusinessesCount : undefined,
    },
    { id: 'announcements', label: 'Campus Broadcast', icon: Megaphone },
    { id: 'learning', label: 'Learning Hub Curricula', icon: BookOpen },
    { id: 'digital-id', label: 'Digital ID Governance', icon: ShieldCheck },
    { id: 'achievements', label: 'Achievements & Verification', icon: Trophy },
    { id: 'campus', label: 'Campus Map & Facilities', icon: MapPin },
    { id: 'audit', label: 'Security & Audit Logs', icon: ShieldAlert },
    { id: 'settings', label: 'System Configuration', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8">
        {/* ── Executive Top Header ── */}
        <AdminHeader />

        {/* ── Navigation Tabs ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    navigate(`/admin/${tab.id}`, { replace: true });
                  }}
                  className={`relative px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeAdminTabIndicator"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-200"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                          isActive
                            ? 'bg-white/25 text-white'
                            : 'bg-blue-100 text-blue-700 border border-blue-200 animate-pulse'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Active Tab Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {activeTab === 'overview' && <AdminCommandOverview />}
            {activeTab === 'users' && <AdminUsersManager />}
            {activeTab === 'projects' && <AdminProjectsModeration />}
            {activeTab === 'businesses' && <AdminBusinessesManager />}
            {activeTab === 'announcements' && <AdminAnnouncementsManager />}
            {activeTab === 'learning' && <AdminLearningHubManager />}
            {activeTab === 'digital-id' && <AdminDigitalIdManager />}
            {activeTab === 'achievements' && <AdminAchievementsManager />}
            {activeTab === 'campus' && <AdminCampusManager />}
            {activeTab === 'audit' && <AdminAuditLogsView />}
            {activeTab === 'settings' && <AdminSettingsManager />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

