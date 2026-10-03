import React, { useState } from 'react';

interface GoogleSignInButtonProps {
  text?: string;
  className?: string;
  disabled?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  text = 'Continue with Google',
  className = '',
  disabled = false,
}) => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleGoogleClick = () => {
    if (disabled || isRedirecting) return;
    setIsRedirecting(true);

    // Direct browser navigation initiates Google OAuth 2.0 authorization code flow
    // Vite development server proxies /api/v1 to http://localhost:5000
    window.location.href = '/api/v1/auth/google';
  };

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      disabled={disabled || isRedirecting}
      aria-label={text}
      className={`w-full relative flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-border/80 bg-surface hover:bg-surface-hover hover:border-text-secondary/40 active:scale-[0.99] transition-all shadow-sm font-medium text-text text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-60 disabled:cursor-not-allowed group ${className}`}
    >
      {isRedirecting ? (
        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin flex-shrink-0" />
      ) : (
        <svg
          className="w-5 h-5 flex-shrink-0"
          viewBox="0 0 24 24"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.02h3.87c2.26-2.09 3.67-5.17 3.67-9.12z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.02c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.12C3.26 21.36 7.36 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.61H1.27C.46 8.23 0 10.06 0 12s.46 3.77 1.27 5.39l4-3.12z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.27 6.61l4 3.12c.95-2.85 3.6-4.98 6.73-4.98z"
          />
        </svg>
      )}
      <span className="truncate">
        {isRedirecting ? 'Connecting to Google...' : text}
      </span>
    </button>
  );
};
