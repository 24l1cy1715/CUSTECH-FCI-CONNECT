import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  Calendar,
  MapPin,
  Globe,
  Sparkles,
  Clock,
  ArrowRight,
  Plus,
  Zap,
  CheckCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import {
  fetchOpportunities,
  fetchSavedOpportunities,
  saveOpportunity,
  unsaveOpportunity,
} from '@/api/opportunities';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { SubmitOpportunityModal } from '@/components/opportunities/SubmitOpportunityModal';
import { OpportunityItem, OpportunityCategory } from '@/types/opportunity';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export const OpportunitiesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isRemoteOnly, setIsRemoteOnly] = useState(false);
  const [deadlineFilter, setDeadlineFilter] = useState<'ALL' | 'OPEN' | 'CLOSING_SOON'>('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | 'MATCHES' | 'SAVED'>('ALL');
  const [submitModalOpen, setSubmitModalOpen] = useState(false);

  const categories = [
    { id: 'ALL', label: 'All Opportunities' },
    { id: 'INTERNSHIP', label: 'Internships' },
    { id: 'HACKATHON', label: 'Hackathons' },
    { id: 'SCHOLARSHIP', label: 'Scholarships' },
    { id: 'JOB', label: 'Jobs / Fulltime' },
    { id: 'FELLOWSHIP', label: 'Fellowships' },
    { id: 'CERTIFICATION', label: 'Certifications' },
    { id: 'WORKSHOP', label: 'Workshops' },
  ];

  // Fetch all opportunities
  const {
    data: opportunitiesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['opportunities', search, selectedCategory, isRemoteOnly, deadlineFilter],
    queryFn: () =>
      fetchOpportunities({
        search: search || undefined,
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
        isRemote: isRemoteOnly ? true : undefined,
        deadlineStatus: deadlineFilter === 'ALL' ? undefined : deadlineFilter,
        limit: 30,
      }),
  });

  // Fetch saved opportunities
  const { data: savedData } = useQuery({
    queryKey: ['saved-opportunities'],
    queryFn: fetchSavedOpportunities,
    enabled: isAuthenticated && activeTab === 'SAVED',
  });

  // Toggle Save Mutation
  const saveMutation = useMutation({
    mutationFn: async ({ id, isSaved }: { id: string; isSaved: boolean }) => {
      if (isSaved) {
        return unsaveOpportunity(id);
      } else {
        return saveOpportunity(id);
      }
    },
    onSuccess: (_, variables) => {
      toast.success(variables.isSaved ? 'Opportunity removed from bookmarks' : 'Opportunity saved to profile!');
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['saved-opportunities'] });
    },
    onError: () => {
      toast.error('Failed to update saved status');
    },
  });

  const handleToggleSave = (e: React.MouseEvent, item: OpportunityItem) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please sign in to save opportunities');
      return;
    }
    saveMutation.mutate({ id: item.id, isSaved: Boolean(item.isSaved) });
  };

  // Filter items based on activeTab
  const rawItems = opportunitiesData?.items || [];
  let displayedItems = rawItems;

  if (activeTab === 'MATCHES') {
    displayedItems = rawItems.filter(
      (item) => (item.skillRelevance?.percentage ?? 0) >= 50
    );
  } else if (activeTab === 'SAVED') {
    displayedItems = (savedData as any) || [];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
            <Briefcase className="w-3.5 h-3.5" />
            FCI Career &amp; Growth Hub
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-primary dark:text-white">
            Discover Opportunities
          </h1>
          <p className="text-text-secondary text-sm sm:text-base max-w-2xl">
            Explore verified internships, hackathons, scholarships, and fellowships specifically curated for CUSTECH computing students.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/opportunities/tracker"
            className="flex items-center gap-1.5 text-xs sm:text-sm py-2.5 px-4 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-colors"
          >
            <Briefcase className="w-4 h-4" />
            <span>My Tracker & Deadlines</span>
          </Link>
          <Button
            variant="primary"
            onClick={() => {
              if (!isAuthenticated) {
                toast.error('Please sign in to post an opportunity');
                return;
              }
              setSubmitModalOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs sm:text-sm py-2.5 px-4 shadow-md"
          >
            <Plus className="w-4 h-4" />
            Post Opportunity
          </Button>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by role, company (e.g. Google, SecureTech), technology, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-surface text-text text-sm focus:outline-none focus:border-accent shadow-sm"
          />
        </div>

        {/* View Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-1 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-primary text-white dark:bg-accent dark:text-black shadow-sm'
                  : 'text-text-secondary hover:text-text hover:bg-surface-raised'
              }`}
            >
              All Opportunities
            </button>

            {isAuthenticated && (
              <button
                onClick={() => setActiveTab('MATCHES')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'MATCHES'
                    ? 'bg-primary text-white dark:bg-accent dark:text-black shadow-sm'
                    : 'text-text-secondary hover:text-text hover:bg-surface-raised'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Matches My Skills
              </button>
            )}

            {isAuthenticated && (
              <button
                onClick={() => setActiveTab('SAVED')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'SAVED'
                    ? 'bg-primary text-white dark:bg-accent dark:text-black shadow-sm'
                    : 'text-text-secondary hover:text-text hover:bg-surface-raised'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                Saved ({savedData?.length ?? 0})
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 text-text cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isRemoteOnly}
                onChange={(e) => setIsRemoteOnly(e.target.checked)}
                className="rounded text-accent"
              />
              <span>Remote Only</span>
            </label>

            <select
              value={deadlineFilter}
              onChange={(e) => setDeadlineFilter(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg border border-border bg-surface text-text text-xs focus:outline-none focus:border-accent"
            >
              <option value="ALL">All Deadlines</option>
              <option value="OPEN">Open Only</option>
              <option value="CLOSING_SOON">Closing Soon (&lt; 7 days)</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-accent/15 border border-accent text-accent font-semibold'
                  : 'bg-surface border border-border text-text hover:bg-surface-raised'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Opportunity Listings Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-surface border border-border" />
          ))}
        </div>
      ) : displayedItems.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-3xl border border-border p-8 space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-surface-raised border border-border flex items-center justify-center mx-auto text-text-muted">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-primary dark:text-white">
            {activeTab === 'SAVED'
              ? "You haven't saved any opportunities yet"
              : activeTab === 'MATCHES'
              ? 'No matching opportunities found for your current skills'
              : 'No opportunities found'}
          </h3>
          <p className="text-xs text-text-secondary">
            {activeTab === 'SAVED'
              ? 'Bookmark interesting internships or hackathons using the bookmark button on any opportunity card.'
              : activeTab === 'MATCHES'
              ? 'Add more skills to your Skill Graph on your profile to unlock personalized recommendations.'
              : 'Try clearing your search query or selecting a different category filter.'}
          </p>
          {activeTab === 'MATCHES' && (
            <Link to="/profile">
              <Button variant="outline" size="sm">
                Update My Skills
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedItems.map((item) => {
            const isClosingSoon = item.deadlineState?.status === 'CLOSING_SOON';
            const isToday = item.deadlineState?.status === 'DEADLINE_TODAY';
            const isClosed = item.deadlineState?.status === 'CLOSED';

            return (
              <Card
                key={item.id}
                glow
                className="flex flex-col justify-between p-6 space-y-5 rounded-3xl border-border transition-all duration-200 group"
              >
                <div className="space-y-4">
                  {/* Category & Save Button */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="accent" size="sm">
                        {item.category.replace(/_/g, ' ')}
                      </Badge>
                      {item.isFeatured && (
                        <Badge variant="primary" size="sm">
                          Featured
                        </Badge>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleToggleSave(e, item)}
                      className={`p-2 rounded-full border transition-colors ${
                        item.isSaved
                          ? 'bg-accent/15 border-accent text-accent'
                          : 'bg-surface border-border text-text-muted hover:text-text hover:bg-surface-raised'
                      }`}
                      title={item.isSaved ? 'Saved to profile' : 'Save opportunity'}
                    >
                      {item.isSaved ? (
                        <BookmarkCheck className="w-4 h-4 fill-accent" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Title & Organization */}
                  <div className="space-y-1">
                    <Link to={`/opportunities/${item.slug}`}>
                      <h3 className="font-display font-bold text-lg text-primary dark:text-white group-hover:text-accent transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                    </Link>
                    <div className="text-xs font-semibold text-text-secondary flex items-center gap-1">
                      {item.organization}
                    </div>
                  </div>

                  {/* Location & Deadline Badges */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-raised border border-border text-text-secondary">
                      {item.isRemote ? (
                        <>
                          <Globe className="w-3 h-3 text-emerald-500" />
                          Remote
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3 h-3 text-accent" />
                          {item.location || 'Osara / Campus'}
                        </>
                      )}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-mono text-[11px] ${
                        isToday
                          ? 'bg-red-500/10 border-red-500/30 text-red-500 font-bold'
                          : isClosingSoon
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 font-semibold'
                          : isClosed
                          ? 'bg-gray-500/10 border-gray-500/30 text-text-muted'
                          : 'bg-surface-raised border-border text-text-secondary'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {item.deadlineState?.label || 'Rolling'}
                    </span>
                  </div>

                  {/* Description excerpt */}
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Skill Relevance Indicator */}
                  {item.skillRelevance && (
                    <div className="p-2.5 rounded-xl bg-accent/5 border border-accent/20 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-text flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          Skill Relevance
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            item.skillRelevance.percentage >= 75
                              ? 'text-emerald-500'
                              : item.skillRelevance.percentage >= 40
                              ? 'text-accent'
                              : 'text-text-muted'
                          }`}
                        >
                          {item.skillRelevance.percentage}% match
                        </span>
                      </div>
                      {item.skillRelevance.matchedSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.skillRelevance.matchedSkills.slice(0, 3).map((sk) => (
                            <span
                              key={sk}
                              className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-mono"
                            >
                              <CheckCircle className="w-2.5 h-2.5" />
                              <span>{sk}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div className="text-[11px] text-text-muted">
                    {item.requiredSkills?.length || 0} skills required
                  </div>
                  <Link
                    to={`/opportunities/${item.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline group-hover:gap-1.5 transition-all"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Post Opportunity Modal */}
      <SubmitOpportunityModal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['opportunities'] });
        }}
      />
    </div>
  );
};
