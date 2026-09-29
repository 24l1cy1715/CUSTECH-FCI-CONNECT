import React from 'react';
import { Navigate, useLocation, Outlet, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSystemStore } from '@/store/systemStore';
import { Button } from '@/components/common/Button';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading, isHydrated, hasAnyRole } = useAuthStore();
  const { isLocked } = useSystemStore();
  const isAdmin = hasAnyRole(['ADMIN', 'SUPER_ADMIN']);

  // 1. AUTH_LOADING: Wait for session hydration
  if (isLoading || !isHydrated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-10 h-10 rounded-full border-3 border-accent/20 border-t-accent animate-spin" />
        <p className="text-xs text-text-secondary font-medium tracking-wide">
          Verifying secure session credentials...
        </p>
      </div>
    );
  }

  // 2. UNAUTHENTICATED: Only redirect to /login when definitely confirmed unauthenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2b. GLOBAL LOCKDOWN GUARD: If portal is locked and caller is not an Admin/Super Admin
  if (isLocked && !isAdmin) {
    return <Navigate to="/lockdown" replace />;
  }

  // 3. ROLE / RBAC CHECK: If authenticated but lacks clearance, show Access Denied (NEVER redirect to login)
  if (requiredRoles && requiredRoles.length > 0) {
    const hasClearance = hasAnyRole(requiredRoles);
    if (!hasClearance) {
      return (
        <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-md w-full rounded-2xl bg-surface border border-border p-6 sm:p-8 text-center space-y-5 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-rose-500 uppercase px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
                Access Restricted
              </span>
              <h1 className="font-extrabold text-xl sm:text-2xl text-text">
                Insufficient Clearance
              </h1>
              <p className="text-xs text-text-secondary leading-relaxed">
                This executive area requires elevated administrative authorization ({requiredRoles.join(', ')}). Your active profile ({user.email}) does not possess the requisite role.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} className="w-full">
                  Return to Dashboard
                </Button>
              </Link>
              <Link to="/" className="w-full sm:w-auto">
                <Button variant="primary" size="sm" leftIcon={<Home className="w-4 h-4" />} className="w-full">
                  Platform Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  // 4. AUTHENTICATED: Render protected view
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
