import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, RefreshCw, ArrowLeft, ExternalLink } from 'lucide-react';
import { useSystemStore } from '@/store/systemStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';

export const LockdownPage: React.FC = () => {
  const navigate = useNavigate();
  const { lockdownMessage, checkLockdownStatus, isLocked, updatedAt } = useSystemStore();
  const { user, hasAnyRole } = useAuthStore();
  const [checking, setChecking] = useState(false);

  const isAdmin = hasAnyRole(['ADMIN', 'SUPER_ADMIN']);

  const handleRefresh = async () => {
    setChecking(true);
    try {
      const stillLocked = await checkLockdownStatus();
      if (!stillLocked) {
        navigate('/dashboard', { replace: true });
      }
    } finally {
      setTimeout(() => setChecking(false), 600);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl w-full rounded-2xl sm:rounded-3xl bg-surface border border-border p-6 sm:p-10 shadow-2xl text-center space-y-6">
        {/* Shield Icon Container */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20 shadow-inner">
          <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10" aria-hidden="true" />
        </div>

        {/* Title & Organization Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            System Notice
          </div>
          <h1 className="font-extrabold text-2xl sm:text-3xl text-text tracking-tight">
            Student Portal Temporarily Locked
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
            {lockdownMessage ||
              'The student portal is temporarily unavailable while system maintenance or administrative activity is being performed. Please check back later.'}
          </p>
        </div>

        {/* Timestamp metadata if present */}
        {updatedAt && (
          <div className="text-[11px] font-mono text-text-muted">
            Last updated:{' '}
            {new Date(updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleRefresh}
            isLoading={checking}
            leftIcon={<RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />}
            className="w-full sm:w-auto font-semibold"
          >
            Refresh Status
          </Button>

          {isAdmin ? (
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/admin', { replace: true })}
              leftIcon={<ExternalLink className="w-4 h-4" />}
              className="w-full sm:w-auto font-semibold"
            >
              Access Admin Console
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="md"
              onClick={() => navigate('/', { replace: true })}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="w-full sm:w-auto text-text-secondary hover:text-text"
            >
              Platform Overview
            </Button>
          )}
        </div>

        {/* Non-technical user advisory */}
        <div className="border-t border-border/60 pt-4 text-xs text-text-muted">
          Faculty of Computing &amp; Informatics &mdash; Confluence University of Science and Technology
        </div>
      </div>
    </div>
  );
};

export default LockdownPage;
