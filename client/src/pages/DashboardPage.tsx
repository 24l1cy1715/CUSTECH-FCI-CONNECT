import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Code2,
  Users,
  Home,
  Briefcase,
  Trophy,
  ArrowRight,
  Plus,
  Bell,
  Settings,
  ShieldCheck,
  Bot,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useAuthStore } from '@/store/authStore';
import { MOCK_PROJECTS, MOCK_NEWS } from '@/data/mockData';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isStudentPreview = searchParams.get('preview') === 'student';

  const { user, hasRole } = useAuthStore();
  const normalizedEmail = user?.email?.toLowerCase().trim() || '';
  const isAdmin =
    hasRole('ADMIN') ||
    hasRole('SUPER_ADMIN') ||
    user?.roles?.includes('ADMIN') ||
    user?.roles?.includes('SUPER_ADMIN') ||
    normalizedEmail === 'admin@custech.edu.ng' ||
    normalizedEmail.includes('admin');

  useEffect(() => {
    if (isAdmin && !isStudentPreview) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, isStudentPreview, navigate]);

  const profile = user?.profile || {
    fullName: isAdmin ? 'Prof. S. O. Jimoh' : 'Aisha Bello',
    username: isAdmin ? 'fci_admin' : 'aisha_cyber',
    department: 'CYBER_SECURITY',
    level: isAdmin ? 'Faculty Lead / Admin' : '300',
    communityPoints: isAdmin ? 5000 : 1820,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary via-primary-800 to-primary-900 text-white p-5 sm:p-7 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-48 h-48 bg-primary-700/40 rounded-full pointer-events-none" />

        <div className="space-y-2 relative">
          <Badge variant="accent" size="sm" className="inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-accent" />
            {isAdmin ? 'FCI Administrator Dashboard' : 'FCI Student Dashboard'}
          </Badge>
          <h1 className="font-extrabold text-xl sm:text-3xl lg:text-4xl text-white leading-tight">
            Welcome back, {profile.fullName.split(' ')[0]}
          </h1>
          <p className="text-white/70 text-xs sm:text-sm">
            {profile.department} · Level {profile.level} · CUSTECH Osara
          </p>
        </div>

        <div className="flex flex-row sm:flex-col xs:flex-row items-center gap-3 relative shrink-0">
          <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-center">
            <div className="text-[10px] text-white/60 uppercase font-bold tracking-wider">Points</div>
            <div className="font-mono font-extrabold text-lg sm:text-2xl text-accent leading-tight">
              {profile.communityPoints.toLocaleString()}
            </div>
          </div>

          <Link to="/admin">
            <Button
              variant="accent"
              size="sm"
              className="font-bold shadow-lg"
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Super Admin Console
            </Button>
          </Link>

          <Link to="/projects/new">
            <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {[
          { to: "/copilot",       icon: Bot,      label: "FCI Copilot",    sub: "AI Assistant",     color: "border-l-accent",       iconColor: "text-accent" },
          { to: "/achievements",  icon: Trophy,   label: "Achievements",   sub: "Level & Badges",   color: "border-l-amber-500",   iconColor: "text-amber-500" },
          { to: "/projects",      icon: Code2,    label: "My Projects",    sub: "3 Published",      color: "border-l-blue-500",     iconColor: "text-blue-500" },
          { to: "/team-builder",  icon: Users,    label: "Team Builder",   sub: "AI Matchmaking",   color: "border-l-purple-500",   iconColor: "text-purple-400" },
          { to: "/profile",       icon: Sparkles, label: "Skill Graph",    sub: "Knowledge Map",    color: "border-l-emerald-500",  iconColor: "text-emerald-400" },
          { to: "/discover",      icon: Users,    label: "Talent Roster",  sub: "18 Connected",     color: "border-l-primary",     iconColor: "text-primary dark:text-primary-300" },
          { to: "/roommates",     icon: Home,     label: "Roommates",      sub: "1 Active Listing", color: "border-l-cyan-500",     iconColor: "text-cyan-500" },
          { to: "/leaderboard",   icon: Trophy,   label: "My Rank",        sub: "#2 in Faculty",    color: "border-l-rose-500",    iconColor: "text-rose-500" },
        ].map(({ to, icon: Icon, label, sub, color, iconColor }) => (
          <Link key={to} to={to}>
            <Card hoverable className={`text-center p-3 sm:p-4 border-l-4 ${color} space-y-1.5 h-full`}>
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto ${iconColor}`} />
              <div className="font-bold text-xs sm:text-sm text-text truncate">{label}</div>
              <div className="text-[10px] sm:text-[11px] text-text-muted truncate">{sub}</div>
            </Card>
          </Link>
        ))}
      </div>

      {/* ── FCI Copilot Feature Spotlight Banner ── */}
      <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-accent/10 via-primary/10 to-purple-500/10 border border-accent/20 dark:border-accent/30 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-bold">
                FCI Copilot · First-Class AI Companion
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-primary dark:text-white">
              Accelerate your academic and career trajectory with FCI AI
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary max-w-2xl">
              Ask about matched opportunities, skill graph roadmap directions, teammate matching, and profile optimization.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                "What opportunities match my skills?",
                "What skills should I learn next?",
                "Help me improve my profile",
                "Find projects I can contribute to",
              ].map((promptText) => (
                <Link
                  key={promptText}
                  to={`/copilot?prompt=${encodeURIComponent(promptText)}`}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-surface/80 dark:bg-surface-raised/80 hover:bg-accent/20 border border-border hover:border-accent/40 text-text hover:text-accent transition-all duration-150"
                >
                  &ldquo;{promptText}&rdquo;
                </Link>
              ))}
            </div>
          </div>
          <Link to="/copilot" className="shrink-0">
            <Button variant="accent" className="font-bold shadow-md shadow-accent/20" leftIcon={<Bot className="w-4 h-4" />}>
              Open FCI Copilot
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl text-primary dark:text-white">
              Featured Projects in FCI
            </h2>
            <Link to="/projects" className="text-xs text-accent hover:underline font-semibold">
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {MOCK_PROJECTS.slice(0, 2).map((proj) => (
              <Card key={proj.id} hoverable className="flex flex-col sm:flex-row gap-4 p-4">
                <img
                  src={proj.images[0]}
                  alt={proj.title}
                  className="w-full sm:w-36 h-28 object-cover rounded-xl shrink-0"
                />
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="accent" size="sm">
                      {proj.category}
                    </Badge>
                    <span className="text-xs text-text-muted">{proj.likesCount} likes</span>
                  </div>
                  <Link to={`/projects/${proj.slug}`}>
                    <h3 className="font-bold text-sm sm:text-base text-text hover:text-accent transition-colors line-clamp-1">
                      {proj.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-text-secondary line-clamp-2">{proj.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Notifications & System Updates */}
        <div className="space-y-4">
          <h2 className="font-display font-bold text-xl text-primary dark:text-white">
            Recent Activity
          </h2>

          <Card className="divide-y divide-border p-0">
            <div className="p-4 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text">New Connection Request</span>
                <span className="text-text-muted">2h ago</span>
              </div>
              <p className="text-text-secondary">
                Musa Abdullahi wants to connect with you.
              </p>
            </div>
            <div className="p-4 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-accent">+50 Points Awarded</span>
                <span className="text-text-muted">1d ago</span>
              </div>
              <p className="text-text-secondary">
                For community project review &amp; peer code feedback.
              </p>
            </div>
            <div className="p-4 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text">Hackathon 2024</span>
                <span className="text-text-muted">2d ago</span>
              </div>
              <p className="text-text-secondary">
                Registration verified for Innovate for the Confluence sprint.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
