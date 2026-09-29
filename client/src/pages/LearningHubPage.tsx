import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Search,
  Sparkles,
  Compass,
  Bookmark,
  TrendingUp,
  PlusCircle,
  ChevronRight,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { learningApi } from '@/api/learningApi';
import { ResourceCard } from '@/components/learning/ResourceCard';
import { LearningPathCard } from '@/components/learning/LearningPathCard';
import { ResourceSubmissionModal } from '@/components/learning/ResourceSubmissionModal';
import { Button } from '@/components/common/Button';
import toast from 'react-hot-toast';

const CATEGORY_TABS = [
  { id: 'ALL', label: 'All Resources' },
  { id: 'CYBERSECURITY', label: 'Cybersecurity' },
  { id: 'SOFTWARE_ENGINEERING', label: 'Software Engineering' },
  { id: 'ARTIFICIAL_INTELLIGENCE', label: 'AI & ML' },
  { id: 'DATA_SCIENCE', label: 'Data Science' },
  { id: 'NETWORKING', label: 'Networking' },
  { id: 'DATABASE_SYSTEMS', label: 'Database Systems' },
  { id: 'WEB_DEVELOPMENT', label: 'Web Development' },
  { id: 'MOBILE_DEVELOPMENT', label: 'Mobile' },
  { id: 'ACADEMIC', label: 'Academic & Past Qs' },
];

export const LearningHubPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<'all' | 'saved' | 'paths'>('all');

  // Overview query (featured, continue learning, recommendations, paths)
  const {
    data: overview,
    isLoading: overviewLoading,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ['learning-overview'],
    queryFn: learningApi.getOverview,
  });

  // Resource list query (paginated with search & filters)
  const {
    data: resourceData,
    isLoading: resourcesLoading,
    isError: resourcesError,
    refetch: refetchResources,
  } = useQuery({
    queryKey: [
      'learning-resources',
      search,
      selectedCategory,
      selectedType,
      selectedLevel,
      page,
    ],
    queryFn: () =>
      learningApi.getResources({
        search: search.trim() || undefined,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        resourceType: selectedType !== 'ALL' ? selectedType : undefined,
        level: selectedLevel,
        page,
        limit: 12,
      }),
  });

  // Save/Unsave mutation
  const saveMutation = useMutation({
    mutationFn: async ({ id, isSaved }: { id: string; isSaved: boolean }) => {
      if (isSaved) {
        return learningApi.unsaveResource(id);
      } else {
        return learningApi.saveResource(id);
      }
    },
    onSuccess: (_, { isSaved }) => {
      toast.success(isSaved ? 'Removed from saved resources' : 'Resource saved to your bookmarks!');
      queryClient.invalidateQueries({ queryKey: ['learning-resources'] });
      queryClient.invalidateQueries({ queryKey: ['learning-overview'] });
    },
    onError: () => {
      toast.error('Failed to update bookmark');
    },
  });

  const handleToggleSave = (id: string, currentlySaved: boolean) => {
    saveMutation.mutate({ id, isSaved: currentlySaved });
  };

  return (
    <div className="min-h-screen pb-20">
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary-900/60 via-surface to-background border-b border-border/80 pt-10 pb-12 sm:pt-14 sm:pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(#fcba03_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-accent/15 text-accent border border-accent/30 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                FCI Smart Study & Learning Hub
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text tracking-tight">
                FCI Learning Hub
              </h1>
              <p className="mt-2 text-base sm:text-lg text-accent font-semibold tracking-wide">
                "Learn. Build. Grow."
              </p>
              <p className="mt-2 text-xs sm:text-sm text-text-muted max-w-2xl leading-relaxed">
                Empowering CUSTECH Faculty of Computing & Informatics students with curated lecture notes, technical guides, past questions, and structured career pathways.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="accent"
                size="md"
                onClick={() => setIsSubmitModalOpen(true)}
                className="flex items-center gap-2 shadow-lg shadow-accent/20 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Contribute Resource</span>
              </Button>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="mt-8 max-w-3xl">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search resources by title, subject, course code (e.g. CSC 301, CYB 305), author or topic..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-surface/90 border border-border text-sm text-text placeholder-text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 shadow-xl backdrop-blur-md transition-all"
              />
              <Search className="w-5 h-5 text-accent absolute left-4 top-4" />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-4 text-xs text-text-muted hover:text-text"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-12">
        {/* ── Loading Skeleton for Overview ── */}
        {overviewLoading && (
          <div className="space-y-8 animate-pulse">
            <div>
              <div className="h-6 w-48 bg-surface-raised rounded mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-44 rounded-2xl bg-surface border border-border p-5 space-y-3">
                    <div className="h-4 w-20 bg-surface-raised rounded" />
                    <div className="h-5 w-3/4 bg-surface-raised rounded" />
                    <div className="h-10 w-full bg-surface-raised rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Continue Learning (In Progress) ── */}
        {overview?.continueLearning && overview.continueLearning.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-text">Continue Learning</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overview.continueLearning.map((res) => (
                <div
                  key={res.id}
                  className="p-5 rounded-2xl bg-surface border border-accent/30 shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-text-muted mb-2">
                      <span className="font-mono text-accent font-semibold">{res.courseCode || res.category}</span>
                      <span className="font-bold text-accent">
                        {res.userProgress?.progressPercentage || 0}% Completed
                      </span>
                    </div>
                    <Link
                      to={`/learning/resources/${res.slug}`}
                      className="font-bold text-base text-text hover:text-accent transition-colors line-clamp-1"
                    >
                      {res.title}
                    </Link>
                    <p className="text-xs text-text-muted line-clamp-2 mt-1">
                      {res.description}
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="w-full h-2 rounded-full bg-surface-raised overflow-hidden mb-3">
                      <div
                        className="h-full bg-accent rounded-full transition-all"
                        style={{ width: `${res.userProgress?.progressPercentage || 0}%` }}
                      />
                    </div>
                    <Link
                      to={`/learning/resources/${res.slug}`}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-accent text-black hover:bg-accent/90 transition-all"
                    >
                      Continue <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Recommended For You (Skill Graph Powered) ── */}
        {overview?.recommendedResources && overview.recommendedResources.length > 0 && (
          <section className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-accent/5 via-surface to-surface border border-accent/25 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-bold text-text">Recommended For You</h2>
              <span className="text-[11px] font-mono text-text-muted bg-surface-raised px-2 py-0.5 rounded border border-border">
                Skill Graph Driven
              </span>
            </div>
            <p className="text-xs text-text-muted mb-6">
              Curated based on your verified skills, current department, and academic interests.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {overview.recommendedResources.map(({ resource, reason }) => (
                <div key={resource.id} className="flex flex-col">
                  {/* Transparent Skill Graph reason */}
                  <div className="text-[11px] text-accent/90 bg-accent/10 px-3 py-1.5 rounded-t-xl border border-b-0 border-accent/25 font-medium flex items-center gap-1.5 truncate">
                    <Sparkles className="w-3 h-3 shrink-0" />
                    <span className="truncate">{reason}</span>
                  </div>
                  <div className="flex-1">
                    <ResourceCard
                      resource={resource}
                      onToggleSave={handleToggleSave}
                      saving={saveMutation.isPending}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Learning Paths (FCI Connect Learning Paths) ── */}
        {overview?.learningPaths && overview.learningPaths.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-accent" />
                  <h2 className="text-xl font-bold text-text">Curated Learning Paths</h2>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Structured career roadmaps designed by faculty mentors and student leaders.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {overview.learningPaths.map((path) => (
                <LearningPathCard key={path.id} path={path} />
              ))}
            </div>
          </section>
        )}

        {/* ── Main Resources Library Browser ── */}
        <section className="space-y-6 pt-4 border-t border-border">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-text">Explore Resources</h2>
              <p className="text-xs text-text-muted mt-0.5">
                Browse academic handouts, tutorials, past questions, and developer tools
              </p>
            </div>

            {/* View Switchers: All / Saved / Paths */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveViewTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeViewTab === 'all'
                    ? 'bg-accent text-black'
                    : 'bg-surface border border-border text-text hover:bg-surface-raised'
                }`}
              >
                All Resources
              </button>
              <button
                onClick={() => setActiveViewTab('saved')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeViewTab === 'saved'
                    ? 'bg-accent text-black'
                    : 'bg-surface border border-border text-text hover:bg-surface-raised'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                Saved Bookmarks
                {overview?.userSavedResources && overview.userSavedResources.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-current">
                    {overview.userSavedResources.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* If Saved Bookmarks tab is selected */}
          {activeViewTab === 'saved' ? (
            <div>
              {!overview?.userSavedResources || overview.userSavedResources.length === 0 ? (
                <div className="py-16 text-center rounded-2xl bg-surface border border-dashed border-border p-8">
                  <Bookmark className="w-10 h-10 text-text-muted mx-auto mb-3" />
                  <h3 className="font-bold text-text text-base">No saved resources yet</h3>
                  <p className="text-xs text-text-muted max-w-md mx-auto mt-1 mb-4">
                    Click the bookmark icon on any tutorial, past question, or note to save it for offline review.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setActiveViewTab('all')}>
                    Browse All Resources
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {overview.userSavedResources.map((res) => (
                    <ResourceCard
                      key={res.id}
                      resource={res}
                      onToggleSave={handleToggleSave}
                      saving={saveMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Category Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {CATEGORY_TABS.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-white border border-primary shadow-sm'
                        : 'bg-surface border border-border text-text-secondary hover:text-text hover:bg-surface-raised'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Resource Type & Level secondary filters */}
              <div className="flex items-center justify-between flex-wrap gap-3 p-3 rounded-2xl bg-surface border border-border text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-text-muted font-medium flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-accent" /> Filter:
                  </span>
                  <select
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      setPage(1);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-raised border border-border text-xs text-text focus:outline-none"
                  >
                    <option value="ALL">All Types</option>
                    <option value="LECTURE_NOTE">Lecture Notes</option>
                    <option value="PDF">PDFs</option>
                    <option value="PAST_QUESTION">Past Questions</option>
                    <option value="VIDEO">Video Tutorials</option>
                    <option value="CODE_REPOSITORY">Code Repos</option>
                    <option value="CHEATSHEET">Cheatsheets</option>
                  </select>

                  <select
                    value={selectedLevel !== undefined ? selectedLevel : ''}
                    onChange={(e) => {
                      setSelectedLevel(e.target.value ? Number(e.target.value) : undefined);
                      setPage(1);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-raised border border-border text-xs text-text focus:outline-none"
                  >
                    <option value="">All Academic Levels</option>
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                    <option value="500">500 Level</option>
                  </select>
                </div>

                <div className="text-xs text-text-muted font-mono">
                  {resourceData?.pagination?.total || 0} resources available
                </div>
              </div>

              {/* Resources Grid */}
              {resourcesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-64 rounded-2xl bg-surface/50 border border-border animate-pulse p-5 space-y-4"
                    >
                      <div className="w-24 h-4 bg-surface-raised rounded" />
                      <div className="w-3/4 h-5 bg-surface-raised rounded" />
                      <div className="w-full h-12 bg-surface-raised rounded" />
                      <div className="w-1/2 h-4 bg-surface-raised rounded" />
                    </div>
                  ))}
                </div>
              ) : resourcesError ? (
                <div className="py-16 text-center rounded-2xl bg-surface border border-rose-500/20 p-8">
                  <p className="text-sm font-semibold text-rose-500 mb-2">
                    Failed to load resources
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetchResources()}>
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry
                  </Button>
                </div>
              ) : resourceData?.resources && resourceData.resources.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {resourceData.resources.map((res) => (
                      <ResourceCard
                        key={res.id}
                        resource={res}
                        onToggleSave={handleToggleSave}
                        saving={saveMutation.isPending}
                      />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {resourceData.pagination.pages > 1 && (
                    <div className="pt-6 flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        Previous
                      </Button>
                      <span className="text-xs text-text-muted font-mono px-3">
                        Page {resourceData.pagination.page} of {resourceData.pagination.pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= resourceData.pagination.pages}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-16 text-center rounded-2xl bg-surface border border-dashed border-border p-8">
                  <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-3" />
                  <h3 className="font-bold text-text text-base">No resources found</h3>
                  <p className="text-xs text-text-muted max-w-sm mx-auto mt-1 mb-4">
                    Try adjusting your search keywords, clearing filters, or submit a new study resource!
                  </p>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => {
                      setSearch('');
                      setSelectedCategory('ALL');
                      setSelectedType('ALL');
                      setSelectedLevel(undefined);
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* Resource Submission Modal */}
      <ResourceSubmissionModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={() => {
          refetchResources();
          refetchOverview();
        }}
      />
    </div>
  );
};
