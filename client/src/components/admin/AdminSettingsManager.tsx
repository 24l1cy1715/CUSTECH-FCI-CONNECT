import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Database,
  Server,
  Shield,
  ShieldCheck,
  Cpu,
  HardDrive,
  Activity,
  Zap,
  Download,
  CheckCircle2,
  Lock,
  Wifi,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Flame,
  Radio,
  FileCode,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useAdminStore } from '@/store/adminStore';
import toast from 'react-hot-toast';

export const AdminSettingsManager: React.FC = () => {
  const {
    userRegistrationOpen,
    toggleUserRegistration,
    stats,
  } = useAdminStore();

  const [enforce2FA, setEnforce2FA] = useState(true);
  const [aiScreening, setAiScreening] = useState(true);
  const [autoApproveVerified, setAutoApproveVerified] = useState(false);
  const [pointsCap, setPointsCap] = useState(250000);
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  const handleTestPing = () => {
    setIsTestingPing(true);
    setTimeout(() => {
      setIsTestingPing(false);
      const ping = Math.floor(Math.random() * 6) + 10;
      toast.success(
        <div className="flex items-center gap-2 text-xs">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>MySQL Cluster Ping: {ping}ms · Response: 200 OK (Nominal)</span>
        </div>,
        {
          style: {
            background: '#0F1C36',
            color: '#FFFFFF',
            border: '1px solid rgba(16, 185, 129, 0.4)',
          },
        }
      );
    }, 700);
  };

  const handleGenerateBackup = () => {
    setIsBackingUp(true);
    setBackupProgress(10);
    const interval = setInterval(() => {
      setBackupProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          toast.success('Encrypted campus database snapshot (AES-256) generated successfully!');
          return 100;
        }
        return p + 25;
      });
    }, 250);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 sm:space-y-8"
    >
      {/* ── Top Platform Controls & Server Deck ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left Deck: Campus Platform Governance Controls ── */}
        <Card className="p-5 sm:p-7 space-y-6 border border-white/10 dark:border-white/[0.08] shadow-2xl relative overflow-hidden backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-border/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center border border-accent/30 shadow-sm">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-base sm:text-lg text-primary dark:text-white">
                  Campus Platform Controls
                </h2>
                <p className="text-[11px] text-text-muted">Security rules, authentication and point economy governance</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent/10 text-accent border border-accent/20">
              CONFIG V2
            </span>
          </div>

          <div className="space-y-3.5">
            {/* Open Student Registration */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-raised/70 dark:bg-black/30 border border-border/70 hover:border-accent/30 transition-all flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-xs sm:text-sm text-text flex items-center gap-2">
                  <span>Open Student Registration</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      userRegistrationOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Allow university students with <code className="text-accent font-mono text-[10px]">@custech.edu.ng</code> emails to self-register
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  toggleUserRegistration();
                  toast.success(
                    `Student Registration is now ${!userRegistrationOpen ? 'OPEN' : 'LOCKED (Invite Only)'}`
                  );
                }}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  userRegistrationOpen ? 'bg-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-surface-raised border border-border'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    userRegistrationOpen ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Two-Factor Authentication (2FA) Policy */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-raised/70 dark:bg-black/30 border border-border/70 hover:border-accent/30 transition-all flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-xs sm:text-sm text-text flex items-center gap-2">
                  <span>Mandatory 2FA Policy</span>
                  <Badge variant="accent" size="sm">
                    ENFORCED
                  </Badge>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Require hardware key or TOTP authenticator for staff, editors &amp; administrative clearances
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEnforce2FA(!enforce2FA);
                  toast.success(`2FA Policy ${!enforce2FA ? 'Enforced' : 'Relaxed'}`);
                }}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enforce2FA ? 'bg-accent shadow-md shadow-accent/20' : 'bg-surface-raised border border-border'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                    enforce2FA ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* AI Screening on Project Submissions */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-raised/70 dark:bg-black/30 border border-border/70 hover:border-accent/30 transition-all flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-xs sm:text-sm text-text flex items-center gap-2">
                  <span>Autonomous AI Project Screening</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-400">
                    AST ANALYZER
                  </span>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Automatically verify GitHub repos for security leaks and malicious dependencies prior to queue triage
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAiScreening(!aiScreening);
                  toast.success(`AI AST Pre-screening ${!aiScreening ? 'Activated' : 'Disabled'}`);
                }}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  aiScreening ? 'bg-purple-500 shadow-md shadow-purple-500/20' : 'bg-surface-raised border border-border'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    aiScreening ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Community Points Inflation Cap */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-raised/70 dark:bg-black/30 border border-border/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm text-text">Community Points Monthly Issuance Cap</span>
                <span className="font-mono font-extrabold text-accent text-xs">
                  {pointsCap.toLocaleString()} PTS
                </span>
              </div>
              <input
                type="range"
                min="50000"
                max="500000"
                step="25000"
                value={pointsCap}
                onChange={(e) => setPointsCap(Number(e.target.value))}
                className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <div className="flex justify-between text-[10px] text-text-muted font-mono">
                <span>50,000 MIN</span>
                <span>Current Circulating: {stats.totalPointsCirculating.toLocaleString()} PTS</span>
                <span>500,000 MAX</span>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Right Deck: Database & Infrastructure Telemetry ── */}
        <Card className="p-5 sm:p-7 space-y-6 border border-white/10 dark:border-white/[0.08] shadow-2xl relative overflow-hidden backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-border/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-sm">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-base sm:text-lg text-primary dark:text-white">
                  Database &amp; Storage Health
                </h2>
                <p className="text-[11px] text-text-muted">MySQL 8.0 cluster nodes, Cloudflare CDN &amp; disk telemetry</p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              leftIcon={<Activity className={`w-3.5 h-3.5 ${isTestingPing ? 'animate-spin text-accent' : 'text-emerald-400'}`} />}
              onClick={handleTestPing}
              isLoading={isTestingPing}
              className="text-xs"
            >
              Test Ping
            </Button>
          </div>

          {/* Infrastructure Health Cards */}
          <div className="space-y-3.5 text-xs">
            {/* Database Engine Node */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-raised/70 dark:bg-black/30 border border-border/70 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-[11px] text-text-muted uppercase font-bold tracking-wider">Primary Database Engine</div>
                <div className="font-mono font-extrabold text-sm text-text flex items-center gap-2">
                  <Database className="w-4 h-4 text-accent" />
                  MySQL 8.0.35 InnoDB (Cluster Osara-Node-1)
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                12ms PING
              </span>
            </div>

            {/* Storage Quota Progress */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-raised/70 dark:bg-black/30 border border-border/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-text-muted uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-sky-400" />
                  NVMe Media &amp; Cloudflare Tunnel Storage
                </span>
                <span className="font-mono font-extrabold text-text">4.2 GB / 50 GB (8.4%)</span>
              </div>
              <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-border/40">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '8.4%' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-accent to-amber-500 h-2 rounded-full"
                />
              </div>
              <p className="text-[10px] text-text-muted">Direct high-speed delivery backed by Cloudflare Global Edge cache.</p>
            </div>

            {/* Security Audit Status & Snapshot Trigger */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-raised/70 dark:bg-black/30 border border-border/70 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-text-muted uppercase font-bold tracking-wider">Automated Audit &amp; Snapshot</div>
                  <div className="font-mono text-emerald-400 font-extrabold text-xs flex items-center gap-1.5 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                    Passed · 0 Critical Vulnerabilities · TLS 1.3
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  className="text-xs font-bold"
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  onClick={handleGenerateBackup}
                  isLoading={isBackingUp}
                >
                  Create Snapshot
                </Button>
              </div>

              {isBackingUp && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-mono text-text-muted">
                    <span>Compressing &amp; Encrypting Schema...</span>
                    <span>{backupProgress}%</span>
                  </div>
                  <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-accent h-1.5 rounded-full transition-all duration-200"
                      style={{ width: `${backupProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Simulated Live Blade Cluster Rack Visualizer ── */}
      <Card className="p-5 sm:p-6 border border-white/10 dark:border-white/[0.08] shadow-2xl relative overflow-hidden backdrop-blur-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-border/80">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-accent" />
            <h3 className="font-display font-extrabold text-base text-text">
              Live Faculty Node Cluster Telemetry
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            ALL 4 BLADES ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
          {[
            {
              id: 'node-mysql-01',
              label: 'MySQL Primary Node',
              role: 'osara-db-master',
              ping: '12ms',
              load: '28%',
              status: 'NOMINAL',
              color: 'emerald',
            },
            {
              id: 'node-edge-01',
              label: 'Cloudflare Pages Edge',
              role: 'cdn-router-dist',
              ping: '8ms',
              load: '14%',
              status: 'NOMINAL',
              color: 'sky',
            },
            {
              id: 'node-cache-01',
              label: 'Redis Query Cache',
              role: 'fci-mem-kv',
              ping: '2ms',
              load: '39%',
              status: 'NOMINAL',
              color: 'accent',
            },
            {
              id: 'node-sec-01',
              label: 'Security Sentinel WAF',
              role: 'auth-firewall-01',
              ping: '4ms',
              load: '19%',
              status: 'NOMINAL',
              color: 'purple',
            },
          ].map((blade) => (
            <div
              key={blade.id}
              className="p-3.5 rounded-2xl bg-surface-raised/70 dark:bg-black/40 border border-border/80 hover:border-accent/40 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-text">{blade.label}</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>
              <div className="font-mono text-[10px] text-text-muted">{blade.role}</div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/50">
                <span className="text-text-muted">Ping: {blade.ping}</span>
                <span className="font-mono font-bold text-accent">Load: {blade.load}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};
