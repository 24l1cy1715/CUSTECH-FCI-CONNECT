import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Code2,
  Briefcase,
  Sparkles,
  Server,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Database,
  Wifi,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useAdminStore } from '@/store/adminStore';
import toast from 'react-hot-toast';

export const AdminCommandOverview: React.FC = () => {
  const {
    stats,
    projects,
    businesses,
    auditLogs,
    setActiveTab,
    approveProject,
    rejectProject,
  } = useAdminStore();

  const pendingProjects = projects.filter((p) => p.status === 'PENDING');
  const pendingBusinesses = businesses.filter((b) => b.status === 'PENDING');

  const handleQuickApprove = (projectId: string, title: string) => {
    approveProject(projectId, 100);
    toast.success(`Project "${title}" approved! +100 points awarded to student.`);
  };

  const handleQuickReject = (projectId: string, title: string) => {
    rejectProject(projectId, 'Does not meet minimum faculty technical review criteria.');
    toast.error(`Project "${title}" rejected.`);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Executive Governance Quick Actions ── */}
      <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Governance Actions:</span>
        <button
          onClick={() => setActiveTab('users')}
          className="btn-glow-subtle inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 text-xs font-semibold group cursor-pointer transition-all"
        >
          <span>Manage Student Registry</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className="btn-glow-subtle inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 text-xs font-semibold group cursor-pointer transition-all"
        >
          <span>Review Projects</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className="btn-glow-subtle inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 text-xs font-semibold group cursor-pointer transition-all"
        >
          <span>Manage Announcements</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
        <button
          onClick={() => setActiveTab('digital-id')}
          className="btn-glow-subtle inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 text-xs font-semibold group cursor-pointer transition-all"
        >
          <span>Digital ID Governance</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>

      {/* ── 4 Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Students */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="relative rounded-2xl bg-white p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrolled Students</span>
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center border border-blue-200 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
              {stats.totalStudents.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <TrendingUp className="w-3 h-3" /> +14%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across 8 Computing Departments</p>
          <button
            onClick={() => setActiveTab('users')}
            className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 group cursor-pointer"
          >
            <span>Manage Student Registry</span>
            <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </motion.div>

        {/* Pending Projects */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="relative rounded-2xl bg-white p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Projects Queue</span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center border border-amber-200 group-hover:scale-110 transition-transform">
              <Code2 className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
              {projects.length}
            </span>
            {pendingProjects.length > 0 ? (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                {pendingProjects.length} Review
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Queue Clear
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">AI, Cyber, Systems & Mobile Apps</p>
          <button
            onClick={() => setActiveTab('projects')}
            className="mt-3 text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 group cursor-pointer"
          >
            <span>Review Queue</span>
            <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </motion.div>

        {/* Tech Businesses */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="relative rounded-2xl bg-white p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Startups</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center border border-emerald-200 group-hover:scale-110 transition-transform">
              <Briefcase className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
              {businesses.length}
            </span>
            {pendingBusinesses.length > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                {pendingBusinesses.length} Pending
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Incubated Campus Tech Ventures</p>
          <button
            onClick={() => setActiveTab('businesses')}
            className="mt-3 text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 group cursor-pointer"
          >
            <span>Verify Startups</span>
            <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </motion.div>

        {/* Community Points */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="relative rounded-2xl bg-white p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">FCI Points Economy</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center border border-indigo-200 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
              {stats.totalPointsCirculating.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-indigo-500">PTS</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Peer reviews, hackathons & mentors</p>
          <button
            onClick={() => setActiveTab('users')}
            className="mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 group cursor-pointer"
          >
            <span>Award Points</span>
            <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>

      {/* ── Moderation Tray + Telemetry ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Urgent Moderation */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Faculty Moderation Approvals
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-100 text-amber-700 border border-amber-200">
                {pendingProjects.length + pendingBusinesses.length} pending
              </span>
            </div>
            <button
              onClick={() => setActiveTab('projects')}
              className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              Open Full Queue →
            </button>
          </div>

          {pendingProjects.length === 0 && pendingBusinesses.length === 0 ? (
            <div className="p-8 text-center space-y-2 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <div className="font-bold text-sm text-slate-800">Moderation Queue Clear!</div>
              <p className="text-xs text-slate-400">
                All capstone student projects and business registrations are up to date.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingProjects.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-2xl bg-white p-4 border border-slate-200 border-l-4 border-l-amber-400 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-700 border border-amber-200">
                        {p.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{p.authorMatric}</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-800 leading-snug">{p.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{p.description}</p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>By <strong className="text-slate-700">{p.authorName}</strong></span>
                      <span>·</span>
                      <span>{p.authorDepartment}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <Button
                      size="sm"
                      variant="primary"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      onClick={() => handleQuickApprove(p.id, p.title)}
                    >
                      Approve (+100)
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-500 hover:bg-rose-50 border border-rose-200"
                      leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      onClick={() => handleQuickReject(p.id, p.title)}
                    >
                      Reject
                    </Button>
                  </div>
                </motion.div>
              ))}

              {pendingBusinesses.map((b) => (
                <motion.div
                  key={b.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-2xl bg-white p-4 border border-slate-200 border-l-4 border-l-emerald-500 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        STARTUP VERIFICATION
                      </span>
                      <span className="text-[11px] text-slate-400">{b.category}</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-800 leading-snug">{b.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{b.description}</p>
                    <div className="text-[11px] text-slate-400">
                      Founder: <strong className="text-slate-700">{b.ownerName}</strong> ({b.ownerEmail})
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <button
                      onClick={() => setActiveTab('businesses')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm transition-all cursor-pointer"
                    >
                      Review & Verify
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: System Telemetry */}
        <div className="space-y-4">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            Live Cluster Telemetry
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <div>
                  <div className="text-xs font-bold text-emerald-700">All Nodes Nominal</div>
                  <div className="text-[10px] text-emerald-600/70">FCI Edge API Gateway (TLS 1.3)</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 px-2 py-0.5 rounded-lg bg-emerald-100 border border-emerald-200">
                {stats.systemHealth.apiUptime}
              </span>
            </div>

            {/* Circular Gauges */}
            <div className="grid grid-cols-3 gap-2 py-2 text-center border-y border-slate-100">
              {[
                { label: 'CPU Load', value: '78%', offset: 18, color: '#10B981' },
                { label: 'RAM Usage', value: '52%', offset: 42, color: '#6366F1' },
                { label: 'DB Ping', value: '18ms', offset: 70, color: '#F59E0B' },
              ].map(({ label, value, offset, color }) => (
                <div key={label} className="space-y-1">
                  <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke={color} strokeWidth="3"
                        strokeDasharray="88" strokeDashoffset={offset} strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-[10px] font-mono font-bold text-slate-700">{value}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold">{label}</div>
                </div>
              ))}
            </div>

            {/* Metrics List */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-500" /> MySQL Pool Latency
                </span>
                <span className="font-mono font-bold text-slate-700">{stats.systemHealth.dbLatencyMs}ms (Optimal)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '24%' }}
                  className="bg-emerald-500 h-1.5 rounded-full" />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-cyan-500" /> Active Student Sessions
                </span>
                <span className="font-mono font-bold text-slate-700">{stats.systemHealth.activeSessions} online</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '65%' }}
                  className="bg-cyan-500 h-1.5 rounded-full" />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-amber-500" /> Cloudflare CDN Cache
                </span>
                <span className="font-mono text-[11px] text-emerald-600 font-bold">HIT (98.4%)</span>
              </div>
            </div>

            {/* Department Distribution */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Faculty Distribution</span>
                <span className="font-mono text-[10px] text-blue-600">FCI Portal</span>
              </div>
              {[
                { name: 'Software Engineering', count: '38%', color: 'bg-blue-500' },
                { name: 'Cyber Security', count: '28%', color: 'bg-indigo-500' },
                { name: 'Computer Science', count: '18%', color: 'bg-emerald-500' },
                { name: 'Data Science / IT', count: '16%', color: 'bg-purple-500' },
              ].map((dept) => (
                <div key={dept.name} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600">{dept.name}</span>
                    <span className="font-mono font-bold text-slate-700">{dept.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className={`${dept.color} h-1.5 rounded-full`} style={{ width: dept.count }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Audit Event Stream ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            Live Security & Audit Event Stream
          </h2>
          <button
            onClick={() => setActiveTab('audit')}
            className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
          >
            View Full Audit Trail →
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {auditLogs.slice(0, 4).map((log) => (
            <div key={log.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    log.severity === 'CRITICAL'
                      ? 'bg-rose-500 animate-ping'
                      : log.severity === 'WARN'
                      ? 'bg-amber-400'
                      : 'bg-emerald-500'
                  }`}
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800">{log.action}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-slate-500">
                      {log.actorName}
                    </span>
                  </div>
                  <p className="text-slate-400 line-clamp-1">{log.details}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono text-[11px] text-slate-600">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className="font-mono text-[10px] text-slate-400">{log.ipAddress}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
