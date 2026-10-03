import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Code2, ArrowRight, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Surface errors from OAuth redirect if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const err = searchParams.get('error');
    if (err) {
      setError(decodeURIComponent(err));
      toast.error(decodeURIComponent(err));
    }
  }, [location.search]);

  const performLogin = async (loginEmail: string, loginPassword?: string) => {
    setIsLoading(true);
    setError('');

    const normalizedEmail = loginEmail.trim().toLowerCase();
    const fromPath = (location.state as any)?.from?.pathname;

    try {
      // Authenticate with server to establish secure HttpOnly JWT session
      const pwd = loginPassword || '';
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: normalizedEmail, password: pwd }),
      });

      const payload = await response.json().catch(() => null);

      if (response.ok && payload?.success && payload?.data?.user) {
        const loggedUser = payload.data.user;
        const serverRoles: string[] = loggedUser.roles || ['STUDENT'];
        const isSuperAdmin = serverRoles.includes('SUPER_ADMIN');

        setUser({
          id: loggedUser.id,
          email: loggedUser.email,
          profile: loggedUser.profile,
          roles: serverRoles,
        });

        queryClient.clear();
        toast.success(`Welcome back, ${loggedUser.profile?.fullName || loggedUser.email}!`);

        // If the user is not a Super Admin, never route them into admin areas
        const target = isSuperAdmin
          ? (fromPath && fromPath.startsWith('/admin') ? fromPath : '/admin')
          : '/dashboard';

        navigate(target, { replace: true });
        return;
      } else {
        const errorMessage =
          payload?.error?.message || payload?.message || 'Invalid email or password';
        setError(errorMessage);
        setIsLoading(false);
        return;
      }
    } catch {
      setError('Unable to connect to authentication service. Please check your connection.');
      setIsLoading(false);
      return;
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }
    await performLogin(email, password);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center drop-shadow-md group-hover:scale-105 transition-transform">
              <img
                src="/custech-logo.png"
                alt="CUSTECH Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-display font-extrabold text-xl text-primary dark:text-white">
              CUSTECH FCI CONNECT
            </span>
          </Link>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-primary dark:text-white pt-2">
            Welcome back
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Sign in to access your student dashboard, projects, and connections
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* ── Google Authentication ── */}
          <div className="space-y-4">
            <GoogleSignInButton text="Continue with Google" />

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface px-2.5 text-text-muted text-[11px] font-medium tracking-wider">
                  or sign in with email
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  required
                  placeholder="student@custech.edu.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-text">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-accent hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In to FCI Connect
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-text-secondary">
            Don&apos;t have an account yet?{' '}
            <Link to="/register" className="font-semibold text-accent hover:underline">
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
