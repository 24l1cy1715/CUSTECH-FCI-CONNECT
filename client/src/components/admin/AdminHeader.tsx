import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  ExternalLink,
  RefreshCw,
  Power,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSystemStore } from '@/store/systemStore';
import toast from 'react-hot-toast';

export const AdminHeader: React.FC = () => {
  const { user: authUser, hasAnyRole } = useAuthStore();
  const { isLocked, lockdownMessage, toggleLockdown, checkLockdownStatus } = useSystemStore();
  const [time, setTime] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLockdownConfirm, setShowLockdownConfirm] = useState(false);
  const [noticeInput, setNoticeInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSuperAdmin = hasAnyRole(['SUPER_ADMIN']);

  useEffect(() => {
    checkLockdownStatus();
  }, [checkLockdownStatus]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFlushCache = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('FCI Edge Cache & In-Memory buffers successfully re-indexed!');
    }, 800);
  };

  const openLockdownModal = () => {
    if (!isSuperAdmin) {
      toast.error('Privilege restricted: Only Super Administrators can alter Global Lockdown state.');
      return;
    }
    setNoticeInput(lockdownMessage || '');
    setShowLockdownConfirm(true);
  };

  const handleLockdownAction = async () => {
    setIsSubmitting(true);
    const nextState = !isLocked;
    try {
      await toggleLockdown(
        nextState,
        nextState ? (noticeInput.trim() || undefined) : undefined
      );
      setShowLockdownConfirm(false);
      if (nextState) {
        toast.error('GLOBAL APPLICATION LOCKDOWN ENGAGED: Student portal locked across all sessions.', {
          style: { background: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B', fontWeight: 'bold' },
        });
      } else {
        toast.success('Campus platform restored to nominal operational state.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update lockdown status';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-7 bg-white dark:bg-slate-900 overflow-hidden"
    >
      {/* Subtle top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-3xl ${
        isLocked
          ? 'bg-rose-500'
          : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600'
      }`} />

      {/* Emergency Lockdown Alert Bar */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden"
          >
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                </span>
                <span className="font-mono tracking-wide font-bold">
                  GLOBAL LOCKDOWN ACTIVE: All student portal endpoints are locked server-side (HTTP 423).
                </span>
              </div>
              {isSuperAdmin && (
                <button
                  onClick={openLockdownModal}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-extrabold transition-all shadow-sm"
                >
                  Disengage Lockdown
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
        {/* Left: Branding */}
        <div className="flex items-start sm:items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 p-2.5 shadow-md border border-blue-200 dark:border-blue-800 shrink-0 flex items-center justify-center"
          >
            <img src="/custech-logo.png" alt="CUSTECH Logo" className="w-full h-full object-contain relative z-10" />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </span>
          </motion.div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                EXECUTIVE HUD · LEVEL 5
              </span>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                OSARA CAMPUS NODE 01
              </span>
              {isLocked && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 uppercase tracking-wider animate-pulse">
                  PORTAL LOCKED
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2.5">
              <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 dark:text-white tracking-tight leading-tight">
                CUSTECH <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">FCI</span> Command Center
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hidden sm:inline">
                v2.4.0-ent
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl font-medium">
              Faculty of Computing & Informatics · Systems Governance, Project Moderation & Campus Telemetry
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-start lg:self-center">
          {/* Live Clock */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-200">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-bold tracking-wider">{time || '12:00:00'}</span>
            <span className="text-[10px] text-slate-400 font-sans font-semibold">WAT</span>
          </div>

          {/* Cache Flush */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleFlushCache}
            disabled={isRefreshing}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-all text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            title="Re-index Cache"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
            <span className="hidden sm:inline">Re-index</span>
          </motion.button>

          {/* Lockdown Toggle */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={openLockdownModal}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              isLocked
                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-rose-300 hover:text-rose-600'
            }`}
            title={isSuperAdmin ? 'Toggle global student portal lockdown' : 'Super Admin privilege required'}
          >
            <Power className={`w-3.5 h-3.5 ${isLocked ? 'text-rose-500 animate-pulse' : ''}`} />
            <span className="hidden sm:inline">{isLocked ? 'Lockdown Active' : 'Lockdown'}</span>
          </motion.button>

          {/* Student View */}
          <Link
            to="/dashboard?preview=student"
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-all text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <span className="hidden sm:inline">Student View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Admin Profile Pill */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-700">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-md">
                SA
              </div>
              <Sparkles className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 drop-shadow" />
            </div>
            <div className="hidden xl:flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                {authUser?.profile?.fullName || 'Super Admin'}
              </span>
              <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-extrabold tracking-wider">
                {authUser?.roles?.[0] || 'SUPER_ADMIN'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lockdown Confirmation Modal */}
      <AnimatePresence>
        {showLockdownConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800">
                <ShieldAlert className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                  {isLocked ? 'Disengage Application Lockdown?' : 'Engage Global Student Portal Lockdown?'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isLocked
                    ? 'This will immediately restore full portal access for all students. Student API requests will succeed without restriction.'
                    : 'This action is enforced server-side. All student sessions and incoming student API calls will be immediately rejected with HTTP 423 (Locked) and redirected to the maintenance notice. Administrator and Super Admin access will remain fully functional.'}
                </p>
              </div>

              {!isLocked && (
                <div className="space-y-1.5 text-left">
                  <label htmlFor="lockdown-notice" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Public Student Advisory Message (Optional)
                  </label>
                  <textarea
                    id="lockdown-notice"
                    value={noticeInput}
                    onChange={(e) => setNoticeInput(e.target.value)}
                    rows={3}
                    placeholder="The FCI Connect student portal is temporarily unavailable for scheduled maintenance or administrative activity. Please check back shortly."
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white p-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                  <p className="text-[11px] text-slate-400">
                    This message will be shown to students on the lockdown screen.
                  </p>
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLockdownConfirm(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLockdownAction}
                  disabled={isSubmitting}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-1.5 ${
                    isLocked
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-rose-600 text-white hover:bg-rose-700'
                  } disabled:opacity-50`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : isLocked ? (
                    'Restore Student Access'
                  ) : (
                    'Engage Global Lockdown'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
