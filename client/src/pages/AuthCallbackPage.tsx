import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import apiClient from '@/api/client';
import toast from 'react-hot-toast';

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const hasExecuted = useRef(false);

  useEffect(() => {
    if (hasExecuted.current) return;
    hasExecuted.current = true;

    const errorParam = searchParams.get('error');
    if (errorParam) {
      setStatus('error');
      setErrorMessage(decodeURIComponent(errorParam));
      toast.error(decodeURIComponent(errorParam));
      return;
    }

    async function completeAuthentication() {
      try {
        // Fetch authoritative authenticated user profile and roles from session
        const res = await apiClient.get('/auth/me');
        if (res.data?.success && res.data?.data?.user) {
          const apiUser = res.data.data.user;
          const serverRoles: string[] = apiUser.roles || ['STUDENT'];
          const isSuperAdmin = serverRoles.includes('SUPER_ADMIN');

          setUser({
            id: apiUser.id || apiUser.userId,
            email: apiUser.email,
            profile: apiUser.profile,
            roles: serverRoles,
          });

          queryClient.clear();
          setStatus('success');

          const displayName = apiUser.profile?.fullName || apiUser.email;
          toast.success(`Welcome to CUSTECH FCI Connect, ${displayName}!`);

          // Super Admin users land in /admin; normal students land in /dashboard
          const destination = isSuperAdmin ? '/admin' : '/dashboard';

          // Brief smooth delay for user feedback
          setTimeout(() => {
            navigate(destination, { replace: true });
          }, 800);
        } else {
          throw new Error('Failed to retrieve user session');
        }
      } catch (err: any) {
        setStatus('error');
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error?.message ||
          'Authentication failed or session expired. Please sign in again.';
        setErrorMessage(msg);
        toast.error(msg);
      }
    }

    completeAuthentication();
  }, [searchParams, navigate, setUser, queryClient]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl mx-auto overflow-hidden flex items-center justify-center drop-shadow-md">
          <img
            src="/custech-logo.png"
            alt="CUSTECH Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {status === 'verifying' && (
          <div className="space-y-4">
            <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <h2 className="text-xl font-display font-bold text-primary dark:text-white">
                Verifying Google Identity
              </h2>
              <p className="text-sm text-text-secondary">
                Securing your session with CUSTECH FCI Connect...
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-display font-bold text-primary dark:text-white">
                Authentication Successful
              </h2>
              <p className="text-sm text-text-secondary">
                Redirecting to your portal...
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-5">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-display font-bold text-primary dark:text-white">
                Sign-In Failed
              </h2>
              <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                {errorMessage}
              </p>
            </div>
            <div className="pt-2">
              <Link to="/login" replace>
                <Button variant="accent" className="w-full justify-center">
                  Return to Sign In
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
