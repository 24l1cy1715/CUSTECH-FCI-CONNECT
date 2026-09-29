import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Briefcase,
  FlaskConical,
  Award,
  Github,
  ShoppingBag,
  Bell,
  CheckCircle2,
  FolderGit2,
  Layers,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { intelligenceApi } from '../api/intelligenceApi';
import { MyFciDashboardData, SmartNextAction, IntelligenceRecommendation } from '../types/intelligence';
import { useAuthStore } from '../store/authStore';

export const MyFciDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['myFciDashboard'],
    queryFn: () => intelligenceApi.getMyFciDashboard(),
    enabled: isAuthenticated,
  });

  const dashboard: MyFciDashboardData | null = dashboardData?.data || null;

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <BrainCircuit className="w-10 h-10 text-amber-400 animate-pulse mx-auto" />
          <p className="text-sm text-slate-400">Loading your My FCI command center...</p>
        </div>
      </div>
    );
  }

  const profile = dashboard?.profile;
  const nextActions = dashboard?.nextActions || [];
  const recommendations = dashboard?.recommendations || [];
  const siwes = dashboard?.siwes;
  const research = dashboard?.research || [];
  const projectLab = dashboard?.projectLab || [];
  const assessments = dashboard?.skillAssessments || [];
  const marketplace = dashboard?.marketplace || [];
  const announcements = dashboard?.announcements || [];
  const github = dashboard?.github;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-[#0b132b] via-slate-900 to-[#0b132b] border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5">
                  <BrainCircuit className="w-3.5 h-3.5" /> FCI Connect Command Center
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {getTimeGreeting()},{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
                  {profile?.fullName || user?.email?.split('@')[0] || 'Scholar'}
                </span>
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">
                  {profile?.department || 'Faculty of Computing & Informatics'}
                </span>
                {profile?.level && (
                  <>
                    <span>•</span>
                    <span className="text-amber-400">{profile.level} Level</span>
                  </>
                )}
                {profile?.matricNumber && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-slate-500">{profile.matricNumber}</span>
                  </>
                )}
              </div>
            </div>

            {/* Profile Completion Bar */}
            <div className="w-full md:w-64 bg-slate-950/60 border border-slate-800 rounded-2xl p-4 shrink-0 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Profile Readiness</span>
                <span className="font-bold text-amber-400">{profile?.completionPercentage || 85}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
                  style={{ width: `${profile?.completionPercentage || 85}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 text-right">
                {dashboard?.stats?.skillsCount || 0} skills declared
              </p>
            </div>
          </div>
        </div>

        {/* Phase 12 Intelligence: Smart "Next Action" Bar */}
        {nextActions.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Recommended Next Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nextActions.map((action: SmartNextAction, idx: number) => (
                <div
                  key={idx}
                  className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between transition group shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                        {action.category.replace('_', ' ')}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(action.priority)}`}>
                        {action.priority}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition leading-snug">
                      {action.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {action.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-800/80 flex justify-end">
                    <button
                      onClick={() => navigate(action.actionUrl)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold text-xs transition flex items-center gap-1"
                    >
                      {action.actionLabel}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phase 12 Intelligence: Transparent AI Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-amber-400" />
                Interconnected Platform Recommendations (Explainable AI)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec: IntelligenceRecommendation, i: number) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-5 backdrop-blur-sm space-y-3 transition group"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                        {rec.type.replace('_', ' ')}
                      </span>
                      <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition">
                        {rec.title}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold shrink-0">
                      {rec.matchScore}% Match
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{rec.description}</p>

                  {/* Transparent Match Reasons */}
                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Match Reasons
                    </span>
                    <ul className="space-y-0.5">
                      {rec.reasons.map((reason: string, rIdx: number) => (
                        <li key={rIdx} className="text-xs text-slate-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => navigate(rec.url)}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                    >
                      Explore Item <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dashboard Grid Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: SIWES & Skill Assessments */}
          <div className="space-y-6">
            {/* SIWES Placement Widget */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  SIWES & Internship
                </h3>
                <button
                  onClick={() => navigate('/siwes')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                >
                  Manage
                </button>
              </div>

              {siwes ? (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Status:</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      {siwes.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Company:</span>
                    <p className="text-sm font-bold text-white mt-0.5">{siwes.companyName}</p>
                    <p className="text-slate-400">{siwes.roleTitle}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Logbook Entries</span>
                      <span className="font-mono text-white">{siwes.completedWeeks} / {siwes.totalWeeks} wks</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full"
                        style={{ width: `${Math.min(100, (siwes.completedWeeks / Math.max(1, siwes.totalWeeks)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 space-y-2">
                  <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs">No active SIWES attachment registered</p>
                  <button
                    onClick={() => navigate('/siwes')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-semibold"
                  >
                    Register Attachment
                  </button>
                </div>
              )}
            </div>

            {/* Skill Assessments Widget */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  Skill Verification
                </h3>
                <button
                  onClick={() => navigate('/assessments')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                >
                  Take Exam
                </button>
              </div>

              {assessments.length === 0 ? (
                <div className="text-center py-6 text-slate-400 space-y-2">
                  <Award className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs">No verified skills yet</p>
                  <p className="text-[11px] text-slate-500">Take an assessment to display verified badges.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {assessments.map((att: any) => (
                    <div
                      key={att.id}
                      className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">{att.assessment?.title || 'Technical Exam'}</span>
                        <p className="text-slate-400 text-[11px]">{att.assessment?.skillName}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {att.score}%
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Verified</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Research & Project Lab */}
          <div className="space-y-6">
            {/* Research Projects Widget */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-amber-400" />
                  Research & Innovation
                </h3>
                <button
                  onClick={() => navigate('/research')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                >
                  Hub
                </button>
              </div>

              {research.length === 0 ? (
                <div className="text-center py-6 text-slate-400 space-y-2">
                  <FlaskConical className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs">No research projects joined yet</p>
                  <button
                    onClick={() => navigate('/research')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-semibold"
                  >
                    Explore Research Ideas
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {research.map((proj: any) => (
                    <div
                      key={proj.id}
                      onClick={() => navigate(`/research/${proj.slug}`)}
                      className="p-3 bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-xl cursor-pointer text-xs space-y-1 transition"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white truncate max-w-[200px]">{proj.title}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono text-[10px]">
                          {proj.researchStatus}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] line-clamp-1">{proj.category}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Project Lab Tasks Widget */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-amber-400" />
                  Project Lab Workspaces
                </h3>
                <button
                  onClick={() => navigate('/project-lab')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                >
                  View Lab
                </button>
              </div>

              {projectLab.length === 0 ? (
                <div className="text-center py-6 text-slate-400 space-y-2">
                  <FolderGit2 className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs">No active project lab workspaces</p>
                  <button
                    onClick={() => navigate('/project-lab')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-semibold"
                  >
                    Open Project Lab
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {projectLab.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl text-xs space-y-1"
                    >
                      <span className="font-bold text-white">{item.title}</span>
                      <p className="text-slate-400 text-[11px]">{item.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Column 3: GitHub & Announcements */}
          <div className="space-y-6">
            {/* GitHub Integration Widget */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Github className="w-4 h-4 text-slate-200" />
                  GitHub Integration
                </h3>
                <button
                  onClick={() => navigate('/github')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                >
                  {github?.username ? 'Manage' : 'Connect'}
                </button>
              </div>

              {github?.username ? (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={github.avatarUrl || 'https://github.com/identicons/user.png'}
                      alt={github.username}
                      className="w-10 h-10 rounded-full border border-amber-400/40"
                    />
                    <div>
                      <h4 className="font-bold text-white">{github.username}</h4>
                      <p className="text-slate-400 font-mono text-[11px]">{github.publicRepos} public repos</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800/80">
                    <span>Followers: <strong className="text-white">{github.followers}</strong></span>
                    <span>Status: <strong className="text-emerald-400">Connected</strong></span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 space-y-2">
                  <Github className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs">GitHub not linked</p>
                  <button
                    onClick={() => navigate('/github')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-semibold"
                  >
                    Connect GitHub
                  </button>
                </div>
              )}
            </div>

            {/* Official Announcements Widget */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  Official Bulletins
                </h3>
                <button
                  onClick={() => navigate('/announcements')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                >
                  View All
                </button>
              </div>

              {announcements.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No urgent announcements</p>
              ) : (
                <div className="space-y-2">
                  {announcements.map((item: any) => (
                    <div
                      key={item.id}
                      onClick={() => navigate('/announcements')}
                      className={`p-3 rounded-xl border text-xs cursor-pointer space-y-1 transition ${
                        item.priority === 'URGENT'
                          ? 'border-rose-500/30 bg-rose-500/5'
                          : 'border-slate-800 bg-slate-900'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white truncate max-w-[200px]">{item.title}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            item.priority === 'URGENT' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] line-clamp-1">{item.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
