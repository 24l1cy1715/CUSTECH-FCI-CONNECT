import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MessageSquare,
  FolderGit2,
  Calendar,
  BookOpen,
  Shield,
  Plus,
  Heart,
  ExternalLink,
  Lock,
  Globe,
  Trash2,
  Flag,
  Megaphone,
  ChevronRight,
  Send,
} from 'lucide-react';
import {
  fetchCommunityBySlug,
  joinCommunity,
  leaveCommunity,
  fetchCommunityPosts,
  createCommunityPost,
  deleteCommunityPost,
  togglePostLike,
  fetchPostComments,
  createPostComment,
  deletePostComment,
  fetchCommunityResources,
  createCommunityResource,
  deleteCommunityResource,
  fetchCommunityProjects,
  associateProjectWithCommunity,
  fetchCommunityEvents,
  associateEventWithCommunity,
  fetchCommunityMembers,
  updateCommunityMember,
  reportCommunityOrPost,
} from '@/api/communityApi';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  CommunityResourceType,
  CreateCommunityPostPayload,
  CreateCommunityResourcePayload,
} from '@/types/community';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export const CommunityDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'discussions' | 'projects' | 'events' | 'resources' | 'members'>('discussions');

  // Modals
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [linkProjectModalOpen, setLinkProjectModalOpen] = useState(false);
  const [linkEventModalOpen, setLinkEventModalOpen] = useState(false);

  // Expanded post comments state
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<{ [postId: string]: string }>({});

  // Post form state
  const [postForm, setPostForm] = useState<CreateCommunityPostPayload>({
    title: '',
    content: '',
    isAnnouncement: false,
    isPinned: false,
  });

  // Resource form state
  const [resourceForm, setResourceForm] = useState<CreateCommunityResourcePayload>({
    title: '',
    description: '',
    url: '',
    type: 'ARTICLE',
  });

  // Report form state
  const [reportForm, setReportForm] = useState<{ reason: string; description: string; postId?: string }>({
    reason: 'INAPPROPRIATE_CONTENT',
    description: '',
  });

  const [targetProjectId, setTargetProjectId] = useState('');
  const [targetEventId, setTargetEventId] = useState('');

  // 1. Fetch Community details
  const {
    data: community,
    isLoading: isCommunityLoading,
    isError: isCommunityError,
  } = useQuery({
    queryKey: ['community', slug],
    queryFn: () => fetchCommunityBySlug(slug!),
    enabled: Boolean(slug),
  });

  // 2. Fetch Posts
  const { data: postsData, isLoading: isPostsLoading } = useQuery({
    queryKey: ['community-posts', community?.id],
    queryFn: () => fetchCommunityPosts(community!.id),
    enabled: Boolean(community?.id && activeTab === 'discussions'),
  });

  // 3. Fetch Resources
  const { data: resources, isLoading: isResourcesLoading } = useQuery({
    queryKey: ['community-resources', community?.id],
    queryFn: () => fetchCommunityResources(community!.id),
    enabled: Boolean(community?.id && activeTab === 'resources'),
  });

  // 4. Fetch Projects
  const { data: projects, isLoading: isProjectsLoading } = useQuery({
    queryKey: ['community-projects', community?.id],
    queryFn: () => fetchCommunityProjects(community!.id),
    enabled: Boolean(community?.id && activeTab === 'projects'),
  });

  // 5. Fetch Events
  const { data: events, isLoading: isEventsLoading } = useQuery({
    queryKey: ['community-events', community?.id],
    queryFn: () => fetchCommunityEvents(community!.id),
    enabled: Boolean(community?.id && activeTab === 'events'),
  });

  // 6. Fetch Members
  const { data: membersData } = useQuery({
    queryKey: ['community-members', community?.id],
    queryFn: () => fetchCommunityMembers(community!.id),
    enabled: Boolean(community?.id && activeTab === 'members'),
  });

  // 7. Fetch Comments for expanded post
  const { data: postComments } = useQuery({
    queryKey: ['community-comments', expandedCommentsPostId],
    queryFn: () => fetchPostComments(community!.id, expandedCommentsPostId!),
    enabled: Boolean(community?.id && expandedCommentsPostId),
  });

  // Normalized resilient lists
  const postsList: any[] = Array.isArray(postsData)
    ? postsData
    : Array.isArray((postsData as any)?.posts)
    ? (postsData as any).posts
    : [];

  const resourcesList: any[] = Array.isArray(resources)
    ? resources
    : Array.isArray((resources as any)?.resources)
    ? (resources as any).resources
    : [];

  const projectsList: any[] = Array.isArray(projects)
    ? projects
    : Array.isArray((projects as any)?.projects)
    ? (projects as any).projects
    : [];

  const eventsList: any[] = Array.isArray(events)
    ? events
    : Array.isArray((events as any)?.events)
    ? (events as any).events
    : [];

  const membersList: any[] = Array.isArray(membersData)
    ? membersData
    : Array.isArray((membersData as any)?.members)
    ? (membersData as any).members
    : [];

  // Mutations
  const joinMut = useMutation({
    mutationFn: () => joinCommunity(community!.id),
    onSuccess: () => {
      toast.success('Joined community!');
      queryClient.invalidateQueries({ queryKey: ['community', slug] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to join'),
  });

  const leaveMut = useMutation({
    mutationFn: () => leaveCommunity(community!.id),
    onSuccess: () => {
      toast.success('Left community');
      queryClient.invalidateQueries({ queryKey: ['community', slug] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to leave'),
  });

  const createPostMut = useMutation({
    mutationFn: () => createCommunityPost(community!.id, postForm),
    onSuccess: () => {
      toast.success(postForm.isAnnouncement ? 'Announcement posted!' : 'Discussion posted!');
      setPostModalOpen(false);
      setPostForm({ title: '', content: '', isAnnouncement: false, isPinned: false });
      queryClient.invalidateQueries({ queryKey: ['community-posts', community?.id] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create post'),
  });

  const deletePostMut = useMutation({
    mutationFn: (postId: string) => deleteCommunityPost(community!.id, postId),
    onSuccess: () => {
      toast.success('Post removed');
      queryClient.invalidateQueries({ queryKey: ['community-posts', community?.id] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete post'),
  });

  const toggleLikeMut = useMutation({
    mutationFn: (postId: string) => togglePostLike(community!.id, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts', community?.id] });
    },
  });

  const createCommentMut = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      createPostComment(community!.id, postId, content),
    onSuccess: (_, variables) => {
      setNewCommentText((prev) => ({ ...prev, [variables.postId]: '' }));
      queryClient.invalidateQueries({ queryKey: ['community-comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['community-posts', community?.id] });
    },
  });

  const deleteCommentMut = useMutation({
    mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) =>
      deletePostComment(community!.id, postId, commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['community-comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['community-posts', community?.id] });
    },
  });

  const createResourceMut = useMutation({
    mutationFn: () => createCommunityResource(community!.id, resourceForm),
    onSuccess: () => {
      toast.success('Resource added to library');
      setResourceModalOpen(false);
      setResourceForm({ title: '', description: '', url: '', type: 'ARTICLE' });
      queryClient.invalidateQueries({ queryKey: ['community-resources', community?.id] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add resource'),
  });

  const deleteResourceMut = useMutation({
    mutationFn: (resourceId: string) => deleteCommunityResource(community!.id, resourceId),
    onSuccess: () => {
      toast.success('Resource deleted');
      queryClient.invalidateQueries({ queryKey: ['community-resources', community?.id] });
    },
  });

  const linkProjectMut = useMutation({
    mutationFn: () => associateProjectWithCommunity(community!.id, targetProjectId),
    onSuccess: () => {
      toast.success('Project linked to community!');
      setLinkProjectModalOpen(false);
      setTargetProjectId('');
      queryClient.invalidateQueries({ queryKey: ['community-projects', community?.id] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to link project'),
  });

  const linkEventMut = useMutation({
    mutationFn: () => associateEventWithCommunity(community!.id, targetEventId),
    onSuccess: () => {
      toast.success('Event associated with community!');
      setLinkEventModalOpen(false);
      setTargetEventId('');
      queryClient.invalidateQueries({ queryKey: ['community-events', community?.id] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to link event'),
  });

  const updateMemberMut = useMutation({
    mutationFn: ({ userId, role, status }: { userId: string; role?: string; status?: string }) =>
      updateCommunityMember(community!.id, userId, { role, status }),
    onSuccess: () => {
      toast.success('Member status updated');
      queryClient.invalidateQueries({ queryKey: ['community-members', community?.id] });
      queryClient.invalidateQueries({ queryKey: ['community', slug] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update member'),
  });

  const reportMut = useMutation({
    mutationFn: () => reportCommunityOrPost(community!.id, reportForm),
    onSuccess: () => {
      toast.success('Report submitted for administrative review');
      setReportModalOpen(false);
      setReportForm({ reason: 'INAPPROPRIATE_CONTENT', description: '' });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to file report'),
  });

  if (isCommunityLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-56 bg-surface-raised rounded-3xl" />
        <div className="h-8 w-1/3 bg-surface-raised rounded" />
        <div className="h-4 w-1/2 bg-surface-raised rounded" />
      </div>
    );
  }

  if (isCommunityError || !community) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-text">Community not found</h2>
        <p className="text-text-secondary text-sm mt-2 mb-6">
          This community may be private, suspended, or does not exist.
        </p>
        <Link to="/communities">
          <Button variant="accent">Explore All Communities</Button>
        </Link>
      </div>
    );
  }

  const isMember = community.userMembership?.isMember;
  const isManager = community.userMembership?.isManager;
  const isOwner = community.userMembership?.role === 'OWNER';

  return (
    <div className="min-h-screen pb-20">
      {/* ── Banner & Header ───────────────────────────────────────────────────── */}
      <div className="relative">
        <div className="h-60 sm:h-72 w-full bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 relative overflow-hidden">
          {community.coverImage ? (
            <img
              src={community.coverImage}
              alt={community.name}
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
            <div className="flex items-end gap-5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-surface border-4 border-surface shadow-xl flex items-center justify-center overflow-hidden shrink-0">
                {community.logo ? (
                  <img
                    src={community.logo}
                    alt={community.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 text-primary font-black text-3xl flex items-center justify-center">
                    {community.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <Badge variant="accent" size="sm">
                    {community.category.replace(/_/g, ' ')}
                  </Badge>
                  <Badge variant={community.visibility === 'PUBLIC' ? 'success' : 'neutral'} size="sm">
                    {community.visibility === 'PUBLIC' && <Globe className="w-3 h-3" />}
                    {community.visibility === 'PRIVATE' && <Lock className="w-3 h-3" />}
                    {community.visibility}
                  </Badge>
                  {isManager && (
                    <Badge variant="primary" size="sm">
                      <Shield className="w-3 h-3" />
                      {community.userMembership?.role}
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text tracking-tight">
                  {community.name}
                </h1>
                <p className="text-xs sm:text-sm text-text-secondary mt-1">
                  Established by <span className="font-medium text-text">{community.owner.profile?.fullName || 'FCI Student'}</span> • {community.memberCount} members
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setReportForm({ reason: 'INAPPROPRIATE_CONTENT', description: '' });
                  setReportModalOpen(true);
                }}
                title="Report Community"
              >
                <Flag className="w-4 h-4 text-text-muted hover:text-rose-500" />
              </Button>

              {isAuthenticated && (
                <>
                  {isMember ? (
                    <Button
                      variant="outline"
                      size="md"
                      isLoading={leaveMut.isPending}
                      onClick={() => leaveMut.mutate()}
                    >
                      Leave Community
                    </Button>
                  ) : (
                    <Button
                      variant="accent"
                      size="md"
                      isLoading={joinMut.isPending}
                      onClick={() => joinMut.mutate()}
                      className="shadow-lg shadow-accent/20"
                    >
                      Join Community
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs Navigation ───────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-px scrollbar-none">
          {[
            { id: 'discussions', label: 'Discussions', count: community.postCount, icon: MessageSquare },
            { id: 'projects', label: 'Showcase Projects', count: community.projectCount, icon: FolderGit2 },
            { id: 'events', label: 'Events', count: community.eventCount, icon: Calendar },
            { id: 'resources', label: 'Learning Resources', count: community.resourceCount, icon: BookOpen },
            { id: 'members', label: 'Members', count: community.memberCount, icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 font-semibold text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-secondary hover:text-text'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-accent/20 text-accent font-bold' : 'bg-surface-raised text-text-muted'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ───────────────────────────────────────────────────────── */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. DISCUSSIONS TAB */}
            {activeTab === 'discussions' && (
              <div className="space-y-6">
                {/* Create post trigger */}
                {isMember && (
                  <Card className="flex items-center justify-between p-4 bg-surface border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center">
                        {user?.profile?.fullName?.slice(0, 1) || 'U'}
                      </div>
                      <span className="text-sm text-text-muted">
                        Share an update, technical question, or resource...
                      </span>
                    </div>
                    <Button
                      variant="accent"
                      size="sm"
                      leftIcon={<Plus className="w-4 h-4" />}
                      onClick={() => setPostModalOpen(true)}
                    >
                      New Post
                    </Button>
                  </Card>
                )}

                {isPostsLoading && (
                  <div className="space-y-4">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="bg-surface p-6 rounded-2xl border border-border animate-pulse space-y-3">
                        <div className="h-4 w-1/4 bg-surface-raised rounded" />
                        <div className="h-5 w-3/4 bg-surface-raised rounded" />
                        <div className="h-16 w-full bg-surface-raised rounded" />
                      </div>
                    ))}
                  </div>
                )}

                {!isPostsLoading && postsList.length === 0 && (
                  <div className="text-center py-16 bg-surface rounded-2xl border border-border p-8">
                    <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-3" />
                    <h3 className="font-bold text-text">No discussions yet</h3>
                    <p className="text-xs text-text-secondary mt-1">
                      Start the conversation and connect with other members.
                    </p>
                  </div>
                )}

                {!isPostsLoading &&
                  postsList.map((post) => {
                    const isCommentsOpen = expandedCommentsPostId === post.id;
                    const canDelete =
                      user?.id === post.authorId || isManager || user?.roles?.includes('ADMIN');

                    return (
                      <Card key={post.id} className="p-6 border border-border space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center font-bold text-primary">
                              {post.author.profile?.avatarUrl ? (
                                <img
                                  src={post.author.profile.avatarUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                post.author.profile?.fullName?.slice(0, 1) || 'A'
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-text">
                                  {post.author.profile?.fullName || 'FCI Member'}
                                </span>
                                {post.isAnnouncement && (
                                  <Badge variant="accent" size="sm">
                                    <Megaphone className="w-3 h-3" />
                                    Announcement
                                  </Badge>
                                )}
                              </div>
                              <span className="text-[11px] text-text-muted">
                                {new Date(post.createdAt).toLocaleDateString()} • {post.author.profile?.department || 'FCI'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setReportForm({
                                  reason: 'INAPPROPRIATE_CONTENT',
                                  description: '',
                                  postId: post.id,
                                });
                                setReportModalOpen(true);
                              }}
                              className="text-text-muted hover:text-rose-500 p-1 rounded"
                              title="Report post"
                            >
                              <Flag className="w-3.5 h-3.5" />
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => deletePostMut.mutate(post.id)}
                                className="text-text-muted hover:text-rose-500 p-1 rounded"
                                title="Delete post"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div>
                          <h3 className="font-bold text-base text-text mb-2">{post.title}</h3>
                          <p className="text-sm text-text-secondary whitespace-pre-line">
                            {post.content}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                          <button
                            onClick={() => toggleLikeMut.mutate(post.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                              (post.isLiked ?? (post as any).hasLiked)
                                ? 'text-rose-500 bg-rose-500/10'
                                : 'text-text-muted hover:text-text hover:bg-surface-raised'
                            }`}
                          >
                            <Heart
                              className={`w-4 h-4 ${(post.isLiked ?? (post as any).hasLiked) ? 'fill-rose-500' : ''}`}
                            />
                            <span>{post.likesCount ?? post._count?.likes ?? 0}</span>
                          </button>

                          <button
                            onClick={() =>
                              setExpandedCommentsPostId(isCommentsOpen ? null : post.id)
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-raised transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.commentsCount ?? post._count?.comments ?? 0} comments</span>
                          </button>
                        </div>

                        {/* Comments Drawer */}
                        {isCommentsOpen && (
                          <div className="pt-3 border-t border-border space-y-3">
                            {isMember && (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Write a comment..."
                                  value={newCommentText[post.id] || ''}
                                  onChange={(e) =>
                                    setNewCommentText((prev) => ({
                                      ...prev,
                                      [post.id]: e.target.value,
                                    }))
                                  }
                                  className="flex-1 px-3 py-1.5 text-xs bg-surface-raised rounded-xl border border-border text-text focus:outline-none focus:border-accent"
                                />
                                <Button
                                  variant="accent"
                                  size="sm"
                                  onClick={() => {
                                    if (!newCommentText[post.id]?.trim()) return;
                                    createCommentMut.mutate({
                                      postId: post.id,
                                      content: newCommentText[post.id],
                                    });
                                  }}
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            )}

                            <div className="space-y-2 mt-2">
                              {postComments?.map((comment) => (
                                <div
                                  key={comment.id}
                                  className="p-3 bg-surface-raised/60 rounded-xl text-xs flex justify-between gap-3"
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-text">
                                        {comment.author.profile?.fullName || 'Student'}
                                      </span>
                                      <span className="text-[10px] text-text-muted">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-text-secondary mt-1">{comment.content}</p>
                                  </div>

                                  {(user?.id === comment.authorId || isManager) && (
                                    <button
                                      onClick={() =>
                                        deleteCommentMut.mutate({
                                          postId: post.id,
                                          commentId: comment.id,
                                        })
                                      }
                                      className="text-text-muted hover:text-rose-500"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
              </div>
            )}

            {/* 2. PROJECTS TAB */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-text">Associated Showcase Projects</h3>
                  {isMember && (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Plus className="w-4 h-4" />}
                      onClick={() => setLinkProjectModalOpen(true)}
                    >
                      Link My Project
                    </Button>
                  )}
                </div>

                {isProjectsLoading && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                    {[1, 2].map((n) => (
                      <div key={n} className="h-32 bg-surface rounded-xl border border-border" />
                    ))}
                  </div>
                )}

                {!isProjectsLoading && projects?.length === 0 && (
                  <div className="text-center py-16 bg-surface rounded-2xl border border-border p-8">
                    <FolderGit2 className="w-12 h-12 text-text-muted mx-auto mb-3" />
                    <h3 className="font-bold text-text">No projects linked yet</h3>
                    <p className="text-xs text-text-secondary mt-1">
                      Members can link approved showcase projects here.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects?.map((proj) => (
                    <Card key={proj.id} hoverable className="p-4 border border-border flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="accent" size="sm">
                            {proj.category}
                          </Badge>
                          <Link
                            to={`/projects/${proj.slug}`}
                            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                          >
                            Details <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                        <h4 className="font-bold text-text text-sm mb-1">{proj.title}</h4>
                        <p className="text-xs text-text-secondary line-clamp-2">{proj.description}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
                        <span>By {proj.author.profile?.fullName}</span>
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-text hover:text-accent"
                          >
                            GitHub
                          </a>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 3. EVENTS TAB */}
            {activeTab === 'events' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-text">Community Events</h3>
                  {isManager && (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Plus className="w-4 h-4" />}
                      onClick={() => setLinkEventModalOpen(true)}
                    >
                      Associate Event
                    </Button>
                  )}
                </div>

                {!isEventsLoading && events?.length === 0 && (
                  <div className="text-center py-16 bg-surface rounded-2xl border border-border p-8">
                    <Calendar className="w-12 h-12 text-text-muted mx-auto mb-3" />
                    <h3 className="font-bold text-text">No events scheduled</h3>
                    <p className="text-xs text-text-secondary mt-1">
                      Upcoming meetups, webinars, and study jams will appear here.
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {events?.map((ev) => (
                    <Card key={ev.id} className="p-4 border border-border flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/15 text-accent flex flex-col items-center justify-center font-bold">
                          <span className="text-xs uppercase">
                            {new Date(ev.date).toLocaleString('default', { month: 'short' })}
                          </span>
                          <span className="text-sm">{new Date(ev.date).getDate()}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-text">{ev.title}</h4>
                          <span className="text-xs text-text-muted">
                            {ev.location || 'Online'} • {ev._count?.registrations || 0} registered
                          </span>
                        </div>
                      </div>
                      <Link to="/events">
                        <Button variant="outline" size="sm">
                          View in Events
                        </Button>
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 4. RESOURCES TAB */}
            {activeTab === 'resources' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-text">Curated Resource Library</h3>
                  {isManager && (
                    <Button
                      variant="accent"
                      size="sm"
                      leftIcon={<Plus className="w-4 h-4" />}
                      onClick={() => setResourceModalOpen(true)}
                    >
                      Add Resource
                    </Button>
                  )}
                </div>

                {!isResourcesLoading && resources?.length === 0 && (
                  <div className="text-center py-16 bg-surface rounded-2xl border border-border p-8">
                    <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-3" />
                    <h3 className="font-bold text-text">No resources added yet</h3>
                    <p className="text-xs text-text-secondary mt-1">
                      Community managers can share books, repos, articles, and roadmaps.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources?.map((res) => (
                    <Card key={res.id} hoverable className="p-4 border border-border flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="primary" size="sm">
                            {res.type}
                          </Badge>
                          {isManager && (
                            <button
                              onClick={() => deleteResourceMut.mutate(res.id)}
                              className="text-text-muted hover:text-rose-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-text mb-1">{res.title}</h4>
                        {res.description && (
                          <p className="text-xs text-text-secondary mb-3">{res.description}</p>
                        )}
                      </div>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline pt-2 border-t border-border"
                      >
                        Open Resource <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 5. MEMBERS TAB */}
            {activeTab === 'members' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-text">Active Members</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {membersList.map((m) => (
                    <Card key={m.id} className="p-4 border border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/15 text-accent font-bold flex items-center justify-center">
                          {m.user.profile?.fullName?.slice(0, 1) || 'M'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-text">
                              {m.user.profile?.fullName || 'Student'}
                            </span>
                            <Badge
                              variant={m.role === 'OWNER' || m.role === 'ADMIN' ? 'accent' : 'neutral'}
                              size="sm"
                            >
                              {m.role}
                            </Badge>
                          </div>
                          <span className="text-[11px] text-text-muted">
                            {m.user.profile?.department || 'FCI'} • Joined {new Date(m.joinedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Management Controls for OWNER/ADMIN */}
                      {isOwner && m.role !== 'OWNER' && (
                        <div className="flex items-center gap-2">
                          <select
                            value={m.role}
                            onChange={(e) =>
                              updateMemberMut.mutate({ userId: m.userId, role: e.target.value })
                            }
                            className="text-xs bg-surface-raised border border-border rounded-lg px-2 py-1 text-text"
                          >
                            <option value="MEMBER">Member</option>
                            <option value="MODERATOR">Moderator</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                          <button
                            onClick={() =>
                              updateMemberMut.mutate({ userId: m.userId, status: 'BANNED' })
                            }
                            className="text-text-muted hover:text-rose-500 p-1"
                            title="Remove member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* About Card */}
            <Card className="p-5 border border-border space-y-4">
              <h3 className="font-bold text-base text-text">About Community</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                {community.description}
              </p>

              <div className="pt-3 border-t border-border space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-text-secondary">
                  <span>Category</span>
                  <span className="font-semibold text-text">{community.category}</span>
                </div>
                <div className="flex items-center justify-between text-text-secondary">
                  <span>Visibility</span>
                  <span className="font-semibold text-text">{community.visibility}</span>
                </div>
                <div className="flex items-center justify-between text-text-secondary">
                  <span>Created</span>
                  <span className="font-semibold text-text">
                    {new Date(community.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>

            {/* Leadership Roster */}
            <Card className="p-5 border border-border space-y-3">
              <h3 className="font-bold text-base text-text flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                Community Leadership
              </h3>

              <div className="space-y-3 pt-2">
                {community.leadership.map((lead) => (
                  <div key={lead.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                      {lead.fullName?.slice(0, 1) || 'L'}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-text">{lead.fullName || 'Leader'}</p>
                      <span className="text-[10px] text-accent font-medium">{lead.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ── New Post Modal ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {postModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface w-full max-w-lg rounded-2xl border border-border p-6 shadow-2xl relative"
            >
              <h3 className="font-bold text-lg text-text mb-4">Create Discussion Post</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!postForm.title.trim() || !postForm.content.trim()) return;
                  createPostMut.mutate();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Post Title *</label>
                  <input
                    type="text"
                    required
                    value={postForm.title}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                    placeholder="Topic or question title..."
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Content *</label>
                  <textarea
                    rows={4}
                    required
                    value={postForm.content}
                    onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                    placeholder="Share knowledge, question, or updates..."
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent resize-none"
                  />
                </div>

                {isManager && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="announcement"
                      checked={postForm.isAnnouncement}
                      onChange={(e) =>
                        setPostForm({ ...postForm, isAnnouncement: e.target.checked })
                      }
                      className="rounded border-border text-accent focus:ring-accent"
                    />
                    <label htmlFor="announcement" className="text-xs font-semibold text-text">
                      Mark as Official Announcement
                    </label>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setPostModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="accent" isLoading={createPostMut.isPending}>
                    Publish Post
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Add Resource Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {resourceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl relative"
            >
              <h3 className="font-bold text-lg text-text mb-4">Add Curated Resource</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!resourceForm.title.trim() || !resourceForm.url.trim()) return;
                  createResourceMut.mutate();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={resourceForm.title}
                    onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                    placeholder="e.g. FreeCodeCamp Python Course"
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Resource URL *</label>
                  <input
                    type="url"
                    required
                    value={resourceForm.url}
                    onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Resource Type *</label>
                  <select
                    value={resourceForm.type}
                    onChange={(e) =>
                      setResourceForm({
                        ...resourceForm,
                        type: e.target.value as CommunityResourceType,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent"
                  >
                    <option value="ARTICLE">Article</option>
                    <option value="VIDEO">Video / Tutorial</option>
                    <option value="COURSE">Course / MOOC</option>
                    <option value="DOCUMENTATION">Official Documentation</option>
                    <option value="PROJECT">Project / Reference Code</option>
                    <option value="BOOK">E-Book</option>
                    <option value="CODE_REPOSITORY">Code Repository</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={resourceForm.description || ''}
                    onChange={(e) =>
                      setResourceForm({ ...resourceForm, description: e.target.value })
                    }
                    placeholder="Brief description of what students will learn..."
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setResourceModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="accent" isLoading={createResourceMut.isPending}>
                    Save Resource
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Link Project Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {linkProjectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl relative"
            >
              <h3 className="font-bold text-lg text-text mb-4">Link Project to Community</h3>
              <p className="text-xs text-text-secondary mb-4">
                Enter your Project ID to affiliate your project with this community showcase.
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Project ID..."
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent"
                />
                <div className="flex items-center justify-end gap-3">
                  <Button variant="outline" onClick={() => setLinkProjectModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="accent"
                    isLoading={linkProjectMut.isPending}
                    onClick={() => linkProjectMut.mutate()}
                  >
                    Link Project
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Link Event Modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {linkEventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl relative"
            >
              <h3 className="font-bold text-lg text-text mb-4">Associate Event</h3>
              <p className="text-xs text-text-secondary mb-4">
                Enter an existing Event ID organized by you to link with this community.
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Event ID..."
                  value={targetEventId}
                  onChange={(e) => setTargetEventId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent"
                />
                <div className="flex items-center justify-end gap-3">
                  <Button variant="outline" onClick={() => setLinkEventModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="accent"
                    isLoading={linkEventMut.isPending}
                    onClick={() => linkEventMut.mutate()}
                  >
                    Associate Event
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Report Modal ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {reportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl relative"
            >
              <h3 className="font-bold text-lg text-text mb-3">File a Report</h3>
              <p className="text-xs text-text-secondary mb-4">
                Reports are audited by CUSTECH FCI administrative moderators.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  reportMut.mutate();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Reason *</label>
                  <select
                    value={reportForm.reason}
                    onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent"
                  >
                    <option value="SPAM">Spam or Advertisement</option>
                    <option value="HARASSMENT">Harassment or Abuse</option>
                    <option value="INAPPROPRIATE_CONTENT">Inappropriate or Vulgar Content</option>
                    <option value="IMPERSONATION">Impersonation / Fake Entity</option>
                    <option value="OTHER">Other Reason</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Details</label>
                  <textarea
                    rows={3}
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                    placeholder="Provide additional context for moderators..."
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setReportModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="danger" isLoading={reportMut.isPending}>
                    Submit Report
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
export default CommunityDetailPage;
