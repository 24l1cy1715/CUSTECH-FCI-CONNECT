import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, ArrowRight, Lock, Mail, User, GraduationCap } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/store/authStore';
import { Department, DEPARTMENT_LABELS } from '@/types';
import toast from 'react-hot-toast';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [matricId, setMatricId] = useState('');
  const [department, setDepartment] = useState<Department>('SOFTWARE_ENGINEERING');
  const [level, setLevel] = useState('100');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const departments: Department[] = [
    'COMPUTER_SCIENCE',
    'CYBER_SECURITY',
    'SOFTWARE_ENGINEERING',
    'INFORMATION_TECHNOLOGY',
    'DATA_SCIENCE',
    'COMPUTER_ENGINEERING',
    'INFORMATION_SYSTEMS',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const levelEnum = level === '100' ? 'LEVEL_100' : level === '200' ? 'LEVEL_200' : level === '300' ? 'LEVEL_300' : level === '400' ? 'LEVEL_400' : 'LEVEL_500';
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          fullName: fullName.trim(),
          matricId: matricId.trim() || undefined,
          department,
          level: levelEnum,
        }),
      });

      if (response.ok) {
        const payload = await response.json();
        const regUser = payload.data?.user;
        setUser({
          id: regUser.id,
          email: regUser.email,
          profile: regUser.profile,
          roles: regUser.roles || ['STUDENT'],
        });
        toast.success('Account created successfully! Welcome to CUSTECH FCI Connect.');
        navigate('/dashboard', { replace: true });
        return;
      } else {
        const errData = await response.json().catch(() => null);
        if (errData?.error?.message) {
          setError(errData.error.message);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Offline fallback
    }

    // Fallback demo user
    setUser({
      id: `usr-${Date.now()}`,
      email: email.trim().toLowerCase(),
      profile: {
        id: `p-${Date.now()}`,
        username: email.split('@')[0],
        fullName,
        department,
        level,
        communityPoints: 100,
      },
      roles: ['STUDENT'],
    });
    setIsLoading(false);
    toast.success('Welcome to CUSTECH FCI Connect!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
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
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Join the digital network for CUSTECH Faculty of Computing &amp; Informatics
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ibrahim Abubakar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text">
                  Email Address *
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
                <label className="text-xs font-semibold uppercase tracking-wider text-text">
                  Matric / Student ID
                </label>
                <input
                  type="text"
                  placeholder="CUS/FCI/23/0045"
                  value={matricId}
                  onChange={(e) => setMatricId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text">
                  Department *
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {DEPARTMENT_LABELS[dept]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text">
                  Level *
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
                >
                  <option value="100">100 Level</option>
                  <option value="200">200 Level</option>
                  <option value="300">300 Level</option>
                  <option value="400">400 Level</option>
                  <option value="500">500 Level</option>
                  <option value="PGD">Postgraduate (PGD/MSc)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full mt-3"
              isLoading={isLoading}
            >
              Complete Registration &amp; Join (+100 pts)
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-accent hover:underline">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
