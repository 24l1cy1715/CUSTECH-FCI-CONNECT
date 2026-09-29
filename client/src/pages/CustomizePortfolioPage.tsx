import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Eye, Sparkles } from 'lucide-react';
import { fetchMyPortfolioSettings } from '@/api/portfolio';
import { PortfolioEditorModal } from '@/components/portfolio/PortfolioEditorModal';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useAuthStore } from '@/store/authStore';

export const CustomizePortfolioPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const { data: mySettings, isLoading, refetch } = useQuery({
    queryKey: ['portfolio-settings'],
    queryFn: fetchMyPortfolioSettings,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-primary dark:text-white">Authentication Required</h2>
        <p className="text-sm text-text-secondary">Please sign in to customize your digital student portfolio.</p>
        <Link to="/login">
          <Button variant="primary">Sign In</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-surface rounded" />
        <div className="h-96 rounded-3xl bg-surface border border-border" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          to={`/u/${mySettings?.username || user?.profile?.username || ''}`}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          View My Public Portfolio
        </Link>
      </div>

      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Student Identity
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-primary dark:text-white">
          Customize Your Digital Portfolio
        </h1>
        <p className="text-text-secondary text-sm">
          Set up your shareable portfolio URL, headline, verified social links, and privacy settings.
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-raised border border-border">
          <div>
            <div className="text-xs text-text-muted uppercase tracking-wider">Your Public Link</div>
            <div className="font-mono text-sm font-semibold text-accent">
              /u/{mySettings?.username}
            </div>
          </div>
          <Link to={`/u/${mySettings?.username}`}>
            <Button size="sm" variant="outline" className="flex items-center gap-1 text-xs">
              <Eye className="w-3.5 h-3.5" />
              Preview Live
            </Button>
          </Link>
        </div>

        <PortfolioEditorModal
          isOpen={true}
          onClose={() => navigate(`/u/${mySettings?.username}`)}
          initialData={mySettings}
          onSuccess={() => refetch()}
        />
      </Card>
    </div>
  );
};
