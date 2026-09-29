import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Briefcase,
  Building,
  MapPin,
  Globe,
  Clock,
  Calendar,
  Bookmark,
  BookmarkCheck,
  Share2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Zap,
  Info,
} from 'lucide-react';
import { fetchOpportunityBySlug, saveOpportunity, unsaveOpportunity } from '@/api/opportunities';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ReportOpportunityModal } from '@/components/opportunities/ReportOpportunityModal';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export const OpportunityDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const [reportModalOpen, setReportModalOpen] = useState(false);

  const {
    data: opportunity,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['opportunity', slug],
    queryFn: () => fetchOpportunityBySlug(slug!),
    enabled: Boolean(slug),
  });

  // Dynamic SEO
  useEffect(() => {
    if (opportunity) {
      document.title = `${opportunity.title} — ${opportunity.organization} | FCI Opportunity Hub`;

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute(
        'content',
        `${opportunity.title} at ${opportunity.organization}. Category: ${opportunity.category}. Discover and apply on CUSTECH FCI Connect.`
      );
    }
  }, [opportunity]);

  const saveMutation = useMutation({
    mutationFn: async ({ id, isSaved }: { id: string; isSaved: boolean }) => {
      if (isSaved) {
        return unsaveOpportunity(id);
      } else {
        return saveOpportunity(id);
      }
    },
    onSuccess: (_, variables) => {
      toast.success(variables.isSaved ? 'Removed from saved opportunities' : 'Saved to your profile!');
      queryClient.invalidateQueries({ queryKey: ['opportunity', slug] });
      queryClient.invalidateQueries({ queryKey: ['saved-opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });

  const handleToggleSave = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save opportunities');
      return;
    }
    if (opportunity) {
      saveMutation.mutate({ id: opportunity.id, isSaved: Boolean(opportunity.isSaved) });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${opportunity?.title} — ${opportunity?.organization}`,
          text: `Check out this opportunity on CUSTECH FCI Connect:`,
          url,
        });
        toast.success('Shared successfully!');
      } catch {
        // Fallback
        navigator.clipboard.writeText(url);
        toast.success('Opportunity link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Opportunity link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 animate-pulse">
        <div className="h-6 w-32 rounded bg-surface" />
        <div className="h-64 rounded-3xl bg-surface border border-border" />
        <div className="h-40 rounded-2xl bg-surface border border-border" />
      </div>
    );
  }

  if (isError || !opportunity) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-primary dark:text-white">Opportunity Not Found</h2>
        <p className="text-sm text-text-secondary">
          The requested opportunity may have expired or been removed.
        </p>
        <Link to="/opportunities">
          <Button variant="primary">Browse Opportunities</Button>
        </Link>
      </div>
    );
  }

  const isClosed = opportunity.deadlineState?.status === 'CLOSED';
  const isClosingSoon = opportunity.deadlineState?.status === 'CLOSING_SOON';

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back link */}
      <div>
        <Link
          to="/opportunities"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all opportunities
        </Link>
      </div>

      {/* ── Main Header Card ── */}
      <div className="p-6 sm:p-8 rounded-3xl border border-border bg-surface shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="accent" size="sm">
              {opportunity.category.replace(/_/g, ' ')}
            </Badge>
            {opportunity.isFeatured && (
              <Badge variant="primary" size="sm">
                Featured
              </Badge>
            )}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${
                isClosed
                  ? 'bg-gray-500/10 border-gray-500/30 text-text-muted'
                  : isClosingSoon
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
              }`}
            >
              <Clock className="w-3 h-3" />
              {opportunity.deadlineState?.label || 'Rolling'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={opportunity.isSaved ? 'primary' : 'outline'}
              size="sm"
              onClick={handleToggleSave}
              className="flex items-center gap-1.5 text-xs"
            >
              {opportunity.isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 fill-white" />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  Save
                </>
              )}
            </Button>

            <Button variant="ghost" size="sm" onClick={handleShare} className="text-xs">
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-primary dark:text-white leading-tight">
            {opportunity.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-accent">
            <span className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-text-muted" />
              {opportunity.organization}
            </span>
            <span className="flex items-center gap-1.5 text-text-secondary text-xs">
              {opportunity.isRemote ? (
                <>
                  <Globe className="w-3.5 h-3.5 text-emerald-500" />
                  Remote / Online
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  {opportunity.location || 'Osara / Campus'}
                </>
              )}
            </span>
            {opportunity.deadline && (
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <Calendar className="w-3.5 h-3.5" />
                Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Primary Call to Action */}
        <div className="p-4 rounded-2xl bg-surface-raised border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-text flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Verified Official Opportunity
            </div>
            <div className="text-[11px] text-text-muted">
              Applications are submitted directly on the organization's official website.
            </div>
          </div>

          <a
            href={opportunity.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button
              variant="primary"
              disabled={isClosed}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm shadow-lg font-semibold"
            >
              {isClosed ? 'Applications Closed' : 'Apply on Official Site'}
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </div>

      {/* ── Skill Relevance Breakdown (Phase 1 Skill Graph Integration) ── */}
      {opportunity.skillRelevance && (
        <Card className="p-6 space-y-4 border-accent/20 bg-accent/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center text-accent">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-text">Skill Match Analysis</h3>
                <div className="text-[11px] text-text-muted">
                  Matched against your CUSTECH Skill Graph profile
                </div>
              </div>
            </div>

            <span
              className={`font-mono font-bold text-lg ${
                opportunity.skillRelevance.percentage >= 75
                  ? 'text-emerald-500'
                  : opportunity.skillRelevance.percentage >= 40
                  ? 'text-accent'
                  : 'text-text-muted'
              }`}
            >
              {opportunity.skillRelevance.percentage}% match
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Matched skills */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Skills You Have ({opportunity.skillRelevance.matchedSkills.length})
              </div>
              {opportunity.skillRelevance.matchedSkills.length === 0 ? (
                <div className="text-xs text-text-muted italic">None yet</div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {opportunity.skillRelevance.matchedSkills.map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Missing skills */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-text-muted flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                Skills Requested ({opportunity.skillRelevance.missingSkills.length})
              </div>
              {opportunity.skillRelevance.missingSkills.length === 0 ? (
                <div className="text-xs text-emerald-500 italic">You have all required skills!</div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {opportunity.skillRelevance.missingSkills.map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 rounded text-xs bg-surface-raised border border-border text-text-secondary font-mono"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Important transparent disclaimer */}
          <div className="pt-2 border-t border-accent/10 text-[11px] text-text-muted flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-accent" />
            <span>
              <strong>Note on Eligibility:</strong> Skill relevance is an algorithmic guide based on technical skills listed in your profile. It is not a guarantee of selection or formal eligibility. Please review the official eligibility criteria below.
            </span>
          </div>
        </Card>
      )}

      {/* ── Eligibility & Details ── */}
      {opportunity.eligibility && (
        <Card className="p-6 space-y-2">
          <h3 className="font-bold text-base text-primary dark:text-white">
            Eligibility &amp; Target Candidates
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
            {opportunity.eligibility}
          </p>
        </Card>
      )}

      {/* ── Opportunity Description ── */}
      <Card className="p-6 sm:p-8 space-y-4">
        <h3 className="font-bold text-lg text-primary dark:text-white">
          About the Role / Program
        </h3>
        <div className="prose dark:prose-invert max-w-none text-text text-sm sm:text-base leading-relaxed whitespace-pre-line">
          {opportunity.description}
        </div>
      </Card>

      {/* ── Application Process ── */}
      {opportunity.applicationProcess && (
        <Card className="p-6 space-y-2">
          <h3 className="font-bold text-base text-primary dark:text-white">
            Application Instructions
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
            {opportunity.applicationProcess}
          </p>
        </Card>
      )}

      {/* ── External Link Redirect Advisory ── */}
      <div className="p-5 rounded-2xl bg-surface border border-border space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-text">
          <ShieldCheck className="w-4 h-4 text-accent" />
          Security Notice &amp; External Application
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          You will be redirected to <span className="font-mono text-accent">{opportunity.applicationUrl}</span>. CUSTECH FCI Connect never charges application fees and does not collect third-party account credentials.
        </p>
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setReportModalOpen(true)}
            className="text-[11px] text-red-400 hover:underline flex items-center gap-1"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Report this listing if broken or suspicious
          </button>

          <a
            href={opportunity.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
          >
            Open Official Site <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Report Modal */}
      <ReportOpportunityModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        opportunityId={opportunity.id}
        opportunityTitle={opportunity.title}
      />
    </article>
  );
};
