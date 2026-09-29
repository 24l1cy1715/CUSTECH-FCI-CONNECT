import React, { Component, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /** If true, shows a minimal inline error rather than full-page */
  inline?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  eventId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, eventId: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, eventId: null };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const eventId = `err_${Date.now().toString(36)}`;
    this.setState({ eventId });

    // Production telemetry hook — extend with Sentry / Datadog here
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught:', error, info.componentStack);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, eventId: null });
  };

  render() {
    const { hasError, error, eventId } = this.state;
    const { children, fallback, inline } = this.props;

    if (!hasError) return children;

    if (fallback) return fallback;

    if (inline) {
      return (
        <div
          role="alert"
          className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300"
        >
          <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Something went wrong</p>
            {import.meta.env.DEV && error?.message && (
              <p className="text-xs opacity-70 truncate mt-0.5">{error.message}</p>
            )}
          </div>
          <button
            onClick={this.handleReset}
            className="shrink-0 text-xs font-semibold underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
            aria-label="Try again"
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <div
        role="alert"
        className="min-h-[70vh] flex items-center justify-center p-6"
        aria-live="assertive"
      >
        <div className="max-w-md w-full rounded-2xl bg-surface border border-border p-6 sm:p-8 text-center space-y-5 shadow-xl">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
            <AlertTriangle className="w-7 h-7" aria-hidden="true" />
          </div>

          {/* Copy */}
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-rose-500 uppercase px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
              Component Error
            </span>
            <h1 className="font-extrabold text-xl sm:text-2xl text-text">
              Something went wrong
            </h1>
            <p className="text-xs text-text-secondary leading-relaxed">
              This part of the page encountered an unexpected error. The rest of the
              platform is still working normally.
            </p>
            {import.meta.env.DEV && error?.message && (
              <pre className="mt-2 text-[10px] text-left font-mono bg-surface-raised border border-border rounded-lg p-3 overflow-auto max-h-28 text-rose-600 dark:text-rose-400 whitespace-pre-wrap break-all">
                {error.message}
              </pre>
            )}
            {eventId && (
              <p className="text-[10px] text-text-muted font-mono">
                Error ID: {eventId}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="btn-glow-subtle w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border hover:border-accent text-text font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Try again
            </button>
            <a
              href="/"
              className="btn-glow w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-primary font-bold text-sm shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              Go home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
