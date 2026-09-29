import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import {
  useForgotPasswordMutation,
  useResendOtpMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
} from '@/api/authApi';
import toast from 'react-hot-toast';

type Step = 'email' | 'otp' | 'reset' | 'success';

const SESSION_EMAIL_KEY = 'fci_pw_reset_email';
const SESSION_TOKEN_KEY = 'fci_pw_reset_token';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Detect initial step from URL path
  const getInitialStep = (): Step => {
    if (location.pathname.includes('/reset-password')) return 'reset';
    if (location.pathname.includes('/verify-otp')) return 'otp';
    return 'email';
  };

  const [step, setStep] = useState<Step>(getInitialStep);
  const [email, setEmail] = useState<string>(() => {
    return sessionStorage.getItem(SESSION_EMAIL_KEY) || (location.state as any)?.email || '';
  });
  const [resetToken, setResetToken] = useState<string>(() => {
    return sessionStorage.getItem(SESSION_TOKEN_KEY) || (location.state as any)?.resetToken || '';
  });

  // OTP inputs (6 individual digits)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Cooldown timer for Resend OTP (60s)
  const [cooldown, setCooldown] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [infoMsg, setInfoMsg] = useState<string>('');

  // Mutations
  const forgotPasswordMutation = useForgotPasswordMutation();
  const resendOtpMutation = useResendOtpMutation();
  const verifyOtpMutation = useVerifyOtpMutation();
  const resetPasswordMutation = useResetPasswordMutation();

  // Synchronize step with browser location if navigating directly
  useEffect(() => {
    if (location.pathname.includes('/reset-password')) {
      if (!resetToken) {
        setStep('email');
      } else {
        setStep('reset');
      }
    } else if (location.pathname.includes('/verify-otp')) {
      if (!email) {
        setStep('email');
      } else {
        setStep('otp');
      }
    }
  }, [location.pathname, resetToken, email]);

  // Handle countdown interval
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus first OTP digit when entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // ── Step 1: Submit Email for OTP ──────────────────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    try {
      const res = await forgotPasswordMutation.mutateAsync({ email: normalizedEmail });
      sessionStorage.setItem(SESSION_EMAIL_KEY, normalizedEmail);
      setEmail(normalizedEmail);
      setCooldown(60);
      setInfoMsg(res.message || 'Check your email for a verification code.');
      toast.success('Verification code sent to your email.');
      setStep('otp');
      navigate('/verify-otp', { state: { email: normalizedEmail }, replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to send verification code. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  // ── Step 2: Handle OTP input UX (6 boxes, paste, backspace, numeric only) ──
  const handleOtpChange = (index: number, value: string) => {
    // Only allow numeric digit
    const cleaned = value.replace(/\D/g, '');

    // Handle paste of multiple characters
    if (cleaned.length > 1) {
      handlePastedOtp(cleaned);
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned.slice(-1);
    setOtpDigits(newDigits);
    setErrorMsg('');

    // Advance focus to next input if digit entered
    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        // Move back to previous input and clear it
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
        otpInputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...otpDigits];
        newDigits[index] = '';
        setOtpDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePastedOtp = (pastedText: string) => {
    const numeric = pastedText.replace(/\D/g, '').slice(0, 6);
    if (!numeric) return;

    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < numeric.length; i++) {
      newDigits[i] = numeric[i];
    }
    setOtpDigits(newDigits);
    setErrorMsg('');

    // Focus either next empty digit or last digit
    const nextIndex = Math.min(numeric.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    handlePastedOtp(pasted);
  };

  // ── Step 2: Submit OTP for Verification ───────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setErrorMsg('Please enter all 6 digits of your verification code.');
      return;
    }

    try {
      const res = await verifyOtpMutation.mutateAsync({
        email,
        otp: fullOtp,
      });

      if (res.resetToken) {
        sessionStorage.setItem(SESSION_TOKEN_KEY, res.resetToken);
        setResetToken(res.resetToken);
        toast.success('Verification successful! Set your new password.');
        setStep('reset');
        navigate('/reset-password', { state: { email, resetToken: res.resetToken }, replace: true });
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Invalid or expired verification code.';
      setErrorMsg(msg);
      toast.error(msg);
      // Clear OTP inputs on failure so user can re-try cleanly
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    }
  };

  // ── Step 2: Resend OTP ────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setErrorMsg('');

    try {
      const res = await resendOtpMutation.mutateAsync({ email });
      setCooldown(60);
      setInfoMsg(res.message || 'A new verification code has been sent.');
      toast.success('New verification code sent.');
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to resend code. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  // ── Step 3: Submit New Password ───────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setErrorMsg('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setErrorMsg('Password must contain at least one number.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        email,
        resetToken,
        newPassword,
        confirmPassword,
      });

      // Clear sensitive session storage credentials immediately
      sessionStorage.removeItem(SESSION_EMAIL_KEY);
      sessionStorage.removeItem(SESSION_TOKEN_KEY);

      toast.success('Password updated successfully!');
      setStep('success');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to reset password. Please start over.';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  // Switch back to email step
  const handleChangeEmail = () => {
    setOtpDigits(['', '', '', '', '', '']);
    setErrorMsg('');
    setInfoMsg('');
    setStep('email');
    navigate('/forgot-password', { replace: true });
  };

  // Password validation indicators
  const isLengthValid = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg transition-colors duration-200">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
            <KeyRound className="w-3.5 h-3.5" />
            <span>FCI Connect Account Recovery</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            {step === 'email' && 'Forgot Your Password?'}
            {step === 'otp' && 'Enter Verification Code'}
            {step === 'reset' && 'Create New Password'}
            {step === 'success' && 'Password Reset Complete'}
          </h1>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            {step === 'email' && "Enter your student or staff email address and we'll send you a secure verification code to reset your password."}
            {step === 'otp' && `We sent a 6-digit verification code to ${email}.`}
            {step === 'reset' && 'Choose a strong new password for your CUSTECH FCI Connect account.'}
            {step === 'success' && 'Your account credentials have been updated securely.'}
          </p>
        </div>

        {/* Main Card */}
        <Card className="p-8 backdrop-blur-xl bg-surface/90 border-border/80 shadow-2xl space-y-6">
          {/* Error Alert */}
          {errorMsg && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Info Banner */}
          {infoMsg && !errorMsg && (
            <div
              className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <div className="flex-1 leading-relaxed">{infoMsg}</div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────── */}
          {/* STEP 1: Email Form                                             */}
          {/* ────────────────────────────────────────────────────────────── */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email-input" className="text-xs font-semibold uppercase tracking-wider text-text">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id="email-input"
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    placeholder="student@custech.edu.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20 transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="accent"
                size="lg"
                className="w-full mt-2"
                isLoading={forgotPasswordMutation.isPending}
              >
                <span>Send Verification Code</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent font-medium transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          )}

          {/* ────────────────────────────────────────────────────────────── */}
          {/* STEP 2: 6-Digit OTP Form                                       */}
          {/* ────────────────────────────────────────────────────────────── */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text">
                    Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={handleChangeEmail}
                    className="text-xs text-accent hover:underline font-medium"
                  >
                    Change Email
                  </button>
                </div>

                {/* 6 Digit Boxes */}
                <div className="flex items-center justify-between gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                      maxLength={1}
                      aria-label={`Digit ${idx + 1}`}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-12 h-14 sm:w-13 sm:h-14 text-center text-xl font-bold font-mono rounded-xl border border-border bg-bg text-text focus:outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20 transition-all select-all"
                    />
                  ))}
                </div>

                <p className="text-[11px] text-text-muted text-center pt-1">
                  Enter the 6-digit code sent to your email. Expires in 10 minutes.
                </p>
              </div>

              <Button
                type="submit"
                variant="accent"
                size="lg"
                className="w-full"
                isLoading={verifyOtpMutation.isPending}
                disabled={otpDigits.some((d) => !d)}
              >
                <span>Verify Code</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              {/* Resend Cooldown Section */}
              <div className="flex flex-col items-center justify-center gap-2 pt-1 border-t border-border/60">
                <div className="text-xs text-text-muted flex items-center gap-1.5">
                  <span>Didn&apos;t receive the email?</span>
                  {cooldown > 0 ? (
                    <span className="font-semibold text-text tabular-nums" aria-live="polite">
                      Resend code in {cooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendOtpMutation.isPending}
                      className="text-accent hover:underline font-semibold flex items-center gap-1 transition-all"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${resendOtpMutation.isPending ? 'animate-spin' : ''}`} />
                      <span>Resend Code</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleChangeEmail}
                  className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text transition-colors mt-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to email address</span>
                </button>
              </div>
            </form>
          )}

          {/* ────────────────────────────────────────────────────────────── */}
          {/* STEP 3: Reset Password Form                                    */}
          {/* ────────────────────────────────────────────────────────────── */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <label htmlFor="new-pw" className="text-xs font-semibold uppercase tracking-wider text-text">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id="new-pw"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="confirm-pw" className="text-xs font-semibold uppercase tracking-wider text-text">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id="confirm-pw"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-bg text-text text-sm focus:outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-3 rounded-xl bg-bg border border-border/70 space-y-1.5 text-[11px]">
                <span className="font-semibold text-text uppercase tracking-wider text-[10px]">
                  Password Requirements:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-text-muted">
                  <div className={`flex items-center gap-1.5 ${isLengthValid ? 'text-emerald-500 font-medium' : ''}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isLengthValid ? 'text-emerald-500' : 'text-text-muted/40'}`} />
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-500 font-medium' : ''}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${hasUppercase ? 'text-emerald-500' : 'text-text-muted/40'}`} />
                    <span>Uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-500 font-medium' : ''}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-500' : 'text-text-muted/40'}`} />
                    <span>At least 1 number</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${isMatch ? 'text-emerald-500 font-medium' : ''}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isMatch ? 'text-emerald-500' : 'text-text-muted/40'}`} />
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="accent"
                size="lg"
                className="w-full mt-3"
                isLoading={resetPasswordMutation.isPending}
                disabled={!isLengthValid || !hasUppercase || !hasNumber || !isMatch}
              >
                <span>Reset Password</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          )}

          {/* ────────────────────────────────────────────────────────────── */}
          {/* STEP 4: Success Card                                           */}
          {/* ────────────────────────────────────────────────────────────── */}
          {step === 'success' && (
            <div className="text-center space-y-5 py-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-text">Your password has been reset successfully.</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Your account is protected. You can now use your new password to access CUSTECH FCI Connect.
                </p>
              </div>

              <Button
                variant="accent"
                size="lg"
                className="w-full mt-4"
                onClick={() => navigate('/login', { replace: true })}
              >
                <span>Continue to Login</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          )}
        </Card>

        {/* Security Notice Footer */}
        <div className="text-center text-[11px] text-text-muted space-y-1">
          <p>Protected by CUSTECH FCI Connect multi-layered security &amp; rate limiting.</p>
          <p>
            Need help? Contact{' '}
            <a href="mailto:support@custech.edu.ng" className="text-accent hover:underline">
              support@custech.edu.ng
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
