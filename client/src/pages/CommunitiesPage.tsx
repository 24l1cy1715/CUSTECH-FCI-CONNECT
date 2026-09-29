import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Sparkles,
  Plus,
  ArrowRight,
  Globe,
  Lock,
  FolderGit2,
  MessageSquare,
  Shield,
  Laptop,
  Bot,
  BarChart3,
  Palette,
  Cpu,
  Rocket,
  LockOpen,
  GraduationCap,
  Lightbulb,
  X,
} from 'lucide-react';
import { fetchCommunities, joinCommunity, leaveCommunity, createCommunity } from '@/api/communityApi';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { CommunityCategory, CreateCommunityPayload } from '@/types/community';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const CATEGORIES: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'ALL', label: 'All Communities', icon: Sparkles },
  { id: 'CYBERSECURITY', label: 'Cybersecurity', icon: Shield },
  { id: 'SOFTWARE_ENGINEERING', label: 'Software Eng.', icon: Laptop },
  { id: 'AI_ML', label: 'AI & Machine Learning', icon: Bot },
  { id: 'DATA_SCIENCE', label: 'Data Science', icon: BarChart3 },
  { id: 'NETWORKING', label: 'Networking & Cloud', icon: Globe },
  { id: 'UI_UX', label: 'UI/UX Design', icon: Palette },
  { id: 'GRAPHICS', label: 'Graphics & Creative', icon: Sparkles },
  { id: 'ROBOTICS', label: 'Robotics & IoT', icon: Cpu },
  { id: 'ENTREPRENEURSHIP', label: 'Tech Ventures', icon: Rocket },
  { id: 'OPEN_SOURCE', label: 'Open Source', icon: LockOpen },
  { id: 'ACADEMIC', label: 'Academic & Research', icon: GraduationCap },
  { id: 'OTHER', label: 'General Interest', icon: Lightbulb },
];

export const CommunitiesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New community form state
  const [formData, setFormData] = useState<CreateCommunityPayload>({
    name: '',
    slug: '',
    description: '',
    category: 'SOFTWARE_ENGINEERING',
    visibility: 'PUBLIC',
    logo: '',
    coverImage: '',
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['communities', search, selectedCategory],
    queryFn: () =>
      fetchCommunities({
        search: search || undefined,
        category: selectedCategory === 'ALL' ? undefined : (selectedCategory as CommunityCategory),
        limit: 30,
      }),
  });

  const communities = data?.communities || [];

  // Join mutation
  const joinMutation = useMutation({
    mutationFn: (communityId: string) => joinCommunity(communityId),
    onSuccess: (_, communityId) => {
      toast.success('Successfully joined the community!');
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['community', communityId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to join community');
    },
  });

  // Leave mutation
  const leaveMutation = useMutation({
    mutationFn: (communityId: string) => leaveCommunity(communityId),
    onSuccess: (_, communityId) => {
      toast.success('You have left the community.');
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['community', communityId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to leave community');
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateCommunityPayload) => createCommunity(payload),
    onSuccess: (newCommunity) => {
      toast.success(`Community "${newCommunity.name}" created successfully!`);
      setCreateModalOpen(false);
      setFormData({
        name: '',
        slug: '',
        description: '',
        category: 'SOFTWARE_ENGINEERING',
        visibility: 'PUBLIC',
        logo: '',
        coverImage: '',
      });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create community');
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: generatedSlug,
    }));
  };

  return (
    <div className="min-h-screen pb-20">
      {/* ── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background pt-12 pb-14 border-b border-border/60">
        <div className="absolute inset-0 -z-10 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent-700 dark:text-accent font-semibold text-xs mb-4 border border-accent/20">
                <Sparkles className="w-3.5 h-3.5" />
                CUSTECH Faculty of Computing & Informatics
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text tracking-tight">
                Student Clubs & <span className="text-accent underline decoration-accent/40">Communities</span>
              </h1>
              <p className="mt-3 text-base sm:text-lg text-text-secondary">
                Connect with departmental tech societies, special interest groups, and open-source guilds.
                Collaborate on real projects, participate in hackathons, and grow together.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <Button
                  variant="accent"
                  size="lg"
                  leftIcon={<Plus className="w-5 h-5" />}
                  onClick={() => setCreateModalOpen(true)}
                  className="shadow-lg shadow-accent/20"
                >
                  Start Community
                </Button>
              )}
            </div>
          </div>

          {/* ── Search & Filter Bar ────────────────────────────────────────────── */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 bg-surface p-2.5 rounded-2xl border border-border shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search communities by name, topic, or description..."
                className="w-full pl-11 pr-4 py-2.5 bg-transparent text-text placeholder:text-text-muted focus:outline-none text-sm"
              />
            </div>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-xs text-text-muted hover:text-text font-medium px-2"
              >
                Clear
              </button>
            )}
          </div>

          {/* ── Category Chips ────────────────────────────────────────────────── */}
          <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-sm dark:bg-primary-500'
                      : 'bg-surface-raised text-text-secondary hover:text-text hover:bg-border/60 border border-border'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Main Content Area ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-surface rounded-2xl border border-border p-6 animate-pulse space-y-4"
              >
                <div className="h-32 bg-surface-raised rounded-xl" />
                <div className="h-5 w-2/3 bg-surface-raised rounded" />
                <div className="h-4 w-full bg-surface-raised rounded" />
                <div className="h-4 w-4/5 bg-surface-raised rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-16 bg-surface rounded-2xl border border-rose-500/20 p-8">
            <p className="text-rose-500 font-semibold mb-2">Failed to load communities</p>
            <p className="text-text-secondary text-sm mb-4">Please check your connection and try again.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && communities.length === 0 && (
          <div className="text-center py-20 bg-surface rounded-2xl border border-border p-8">
            <div className="w-16 h-16 rounded-2xl bg-accent/15 text-accent flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-text">No communities found</h3>
            <p className="text-text-secondary text-sm mt-1 max-w-md mx-auto">
              {search || selectedCategory !== 'ALL'
                ? 'Try adjusting your filters or search keywords to discover more clubs.'
                : 'Be the pioneer! Create the very first community for your department or interest.'}
            </p>
            {isAuthenticated && (
              <div className="mt-5">
                <Button
                  variant="accent"
                  size="md"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setCreateModalOpen(true)}
                >
                  Create Community
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Communities Grid */}
        {!isLoading && !isError && communities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => {
              const isJoined = community.isMember;
              return (
                <Card
                  key={community.id}
                  glow
                  className="flex flex-col justify-between overflow-hidden p-0 border border-border group"
                >
                  <div>
                    {/* Cover Banner */}
                    <div className="relative h-32 w-full bg-gradient-to-r from-primary-900 via-primary-800 to-primary-950 overflow-hidden">
                      {community.coverImage ? (
                        <img
                          src={community.coverImage}
                          alt={community.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                      )}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <Badge
                          variant={community.visibility === 'PUBLIC' ? 'success' : 'neutral'}
                          size="sm"
                          className="backdrop-blur-md bg-surface/80"
                        >
                          {community.visibility === 'PUBLIC' && <Globe className="w-3 h-3" />}
                          {community.visibility === 'PRIVATE' && <Lock className="w-3 h-3" />}
                          {community.visibility}
                        </Badge>
                      </div>
                    </div>

                    {/* Logo & Content */}
                    <div className="px-5 pt-0 pb-4 relative">
                      <div className="relative -mt-9 mb-3 flex items-end justify-between">
                        <div className="w-16 h-16 rounded-2xl bg-surface border-4 border-surface shadow-md flex items-center justify-center overflow-hidden shrink-0">
                          {community.logo ? (
                            <img
                              src={community.logo}
                              alt={community.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xl">
                              {community.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <Badge variant="accent" size="sm">
                          {community.category.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      <Link
                        to={`/communities/${community.slug}`}
                        className="block font-bold text-lg text-text hover:text-accent transition-colors line-clamp-1"
                      >
                        {community.name}
                      </Link>

                      <p className="mt-2 text-xs text-text-secondary line-clamp-2 min-h-[2rem]">
                        {community.description}
                      </p>

                      {/* Stats Row */}
                      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-text-secondary">
                        <div className="flex items-center gap-1" title="Members">
                          <Users className="w-3.5 h-3.5 text-accent" />
                          <span className="font-semibold text-text">{community._count?.members || 0}</span>
                          <span>members</span>
                        </div>
                        <div className="flex items-center gap-1" title="Discussions">
                          <MessageSquare className="w-3.5 h-3.5 text-primary-400" />
                          <span className="font-semibold text-text">{community._count?.posts || 0}</span>
                          <span>posts</span>
                        </div>
                        <div className="flex items-center gap-1" title="Projects">
                          <FolderGit2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="font-semibold text-text">{community._count?.projects || 0}</span>
                          <span>projects</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Card Actions */}
                  <div className="px-5 py-3.5 bg-surface-raised/40 border-t border-border flex items-center justify-between gap-3">
                    <Link
                      to={`/communities/${community.slug}`}
                      className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 group-hover:gap-1.5 transition-all"
                    >
                      <span>View Hub</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>

                    {isAuthenticated && (
                      <div>
                        {isJoined ? (
                          <Button
                            variant="outline"
                            size="sm"
                            isLoading={leaveMutation.isPending}
                            onClick={() => leaveMutation.mutate(community.id)}
                            className="text-xs"
                          >
                            Leave
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            isLoading={joinMutation.isPending}
                            onClick={() => joinMutation.mutate(community.id)}
                            className="text-xs"
                          >
                            Join Club
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Create Community Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface w-full max-w-lg rounded-2xl border border-border p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-lg text-text">Create a Community</h3>
                </div>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="text-text-muted hover:text-text p-1 rounded-lg"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!formData.name.trim() || !formData.description.trim()) {
                    toast.error('Please enter name and description');
                    return;
                  }
                  createMutation.mutate(formData);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Community Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g. CUSTECH Cybersecurity Club"
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Slug / URL Identifier
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="custech-cybersecurity-club"
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent font-mono text-xs"
                  />
                  <p className="text-[11px] text-text-muted mt-1">
                    Direct URL: /communities/{formData.slug || 'your-slug'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as CommunityCategory })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent"
                  >
                    {CATEGORIES.filter((c) => c.id !== 'ALL').map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What is this community about? What activities, projects, and sessions are organized?"
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">
                      Logo URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">
                      Cover Banner URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Visibility *
                  </label>
                  <select
                    value={formData.visibility}
                    onChange={(e) =>
                      setFormData({ ...formData, visibility: e.target.value as any })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent"
                  >
                    <option value="PUBLIC">PUBLIC — Open to all CUSTECH students</option>
                    <option value="FCI_ONLY">FCI_ONLY — Restricted to Computing & Informatics students</option>
                    <option value="PRIVATE">PRIVATE — Requires moderator approval</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="accent"
                    isLoading={createMutation.isPending}
                  >
                    Create Club
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default CommunitiesPage;
