import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Search,
  Sparkles,
  Clock,
  Users,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import {
  fetchMentors,
  requestMentorship,
  saveMentorProfile,
  fetchMyMentorProfile,
} from '@/api/mentorshipApi';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  MentorProfileItem,
  MentorshipSessionFormat,
  SaveMentorProfilePayload,
} from '@/types/mentorship';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const MENTOR_AREAS = [
  'Cybersecurity',
  'Ethical Hacking',
  'Python',
  'Web Development',
  'Mobile Development',
  'UI/UX',
  'Graphic Design',
  'Networking',
  'AI/ML',
  'Data Science',
  'Career Development',
  'Public Speaking',
  'Entrepreneurship',
  'Open Source',
  'Academic Support',
  'Other',
];

export const MentorDiscoveryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL');
  const [availableOnly, setAvailableOnly] = useState<boolean>(true);

  // Modals
  const [requestModalMentor, setRequestModalMentor] = useState<MentorProfileItem | null>(null);
  const [mentorshipGoal, setMentorshipGoal] = useState('');
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Mentor profile form
  const [profileForm, setProfileForm] = useState<SaveMentorProfilePayload>({
    headline: '',
    bio: '',
    areas: ['Cybersecurity'],
    availability: 'Weekends & Evenings (2-4 hrs/wk)',
    languages: ['English'],
    maxMentees: 3,
    sessionFormat: 'MIXED',
    isAvailable: true,
  });

  // Fetch mentors list
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['mentors', search, selectedArea, selectedFormat, availableOnly],
    queryFn: () =>
      fetchMentors({
        search: search || undefined,
        skill: selectedArea === 'ALL' ? undefined : selectedArea,
        format: selectedFormat === 'ALL' ? undefined : selectedFormat,
        availableOnly,
        limit: 30,
      }),
  });

  // Fetch current user mentor profile if authenticated
  const { data: myProfile } = useQuery({
    queryKey: ['my-mentor-profile'],
    queryFn: fetchMyMentorProfile,
    enabled: isAuthenticated,
  });

  // Request mentorship mutation
  const requestMutation = useMutation({
    mutationFn: () =>
      requestMentorship({
        mentorId: requestModalMentor!.userId,
        goal: mentorshipGoal,
      }),
    onSuccess: () => {
      toast.success('Mentorship request sent! The mentor has been notified.');
      setRequestModalMentor(null);
      setMentorshipGoal('');
      queryClient.invalidateQueries({ queryKey: ['mentorship-dashboard'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit mentorship request');
    },
  });

  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: () => saveMentorProfile(profileForm),
    onSuccess: () => {
      toast.success('Mentor profile updated successfully!');
      setProfileModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['my-mentor-profile'] });
      queryClient.invalidateQueries({ queryKey: ['mentors'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save mentor profile');
    },
  });

  const mentors = data?.mentors || [];

  const openProfileModal = () => {
    if (myProfile) {
      setProfileForm({
        headline: myProfile.headline,
        bio: myProfile.bio,
        areas: myProfile.areas,
        availability: myProfile.availability,
        languages: myProfile.languages || ['English'],
        maxMentees: myProfile.maxMentees,
        sessionFormat: myProfile.sessionFormat,
        isAvailable: myProfile.isAvailable,
      });
    }
    setProfileModalOpen(true);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* ── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background pt-12 pb-14 border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent-700 dark:text-accent font-semibold text-xs mb-4 border border-accent/20">
                <Sparkles className="w-3.5 h-3.5" />
                Peer-to-Peer Academic & Career Excellence
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text tracking-tight">
                Find Your <span className="text-accent underline decoration-accent/40">FCI Mentor</span>
              </h1>
              <p className="mt-3 text-base sm:text-lg text-text-secondary">
                Learn directly from senior students and peer experts who excel in programming,
                cybersecurity, system administration, and project research.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/mentorship">
                <Button variant="outline" size="md">
                  My Mentorship Hub
                </Button>
              </Link>
              {isAuthenticated && (
                <Button
                  variant="accent"
                  size="md"
                  onClick={openProfileModal}
                  className="shadow-lg shadow-accent/20"
                >
                  {myProfile ? 'Edit Mentor Profile' : 'Become a Mentor'}
                </Button>
              )}
            </div>
          </div>

          {/* ── Search & Filter Bar ────────────────────────────────────────────── */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-12 gap-3 bg-surface p-3 rounded-2xl border border-border shadow-sm">
            <div className="relative sm:col-span-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search mentors by name, keyword, or skills..."
                className="w-full pl-10 pr-4 py-2 bg-transparent text-text placeholder:text-text-muted focus:outline-none text-sm"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full px-3 py-2 bg-surface-raised border border-border rounded-xl text-xs text-text focus:outline-none focus:border-accent"
              >
                <option value="ALL">All Session Formats</option>
                <option value="CHAT">Chat Only</option>
                <option value="VIDEO">Video Call</option>
                <option value="IN_PERSON">In-Person Campus</option>
                <option value="MIXED">Flexible / Mixed</option>
              </select>
            </div>

            <div className="sm:col-span-3 flex items-center justify-between px-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-text">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="rounded border-border text-accent focus:ring-accent"
                />
                <span>Available Capacity</span>
              </label>

              {(search || selectedArea !== 'ALL' || selectedFormat !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedArea('ALL');
                    setSelectedFormat('ALL');
                  }}
                  className="text-xs text-accent hover:underline font-semibold"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* ── Area Filter Chips ──────────────────────────────────────────────── */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedArea('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedArea === 'ALL'
                  ? 'bg-primary text-white shadow-sm dark:bg-primary-500'
                  : 'bg-surface-raised text-text-secondary hover:text-text border border-border'
              }`}
            >
              All Focus Areas
            </button>
            {MENTOR_AREAS.map((area) => {
              const isActive = selectedArea === area;
              return (
                <button
                  key={area}
                  onClick={() => setSelectedArea(area)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-sm dark:bg-primary-500'
                      : 'bg-surface-raised text-text-secondary hover:text-text border border-border'
                  }`}
                >
                  {area}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Mentors Listing ───────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-surface rounded-2xl border border-border p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-surface-raised" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/2 bg-surface-raised rounded" />
                    <div className="h-3 w-3/4 bg-surface-raised rounded" />
                  </div>
                </div>
                <div className="h-12 bg-surface-raised rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-16 bg-surface rounded-2xl border border-border p-8">
            <p className="text-rose-500 font-semibold mb-2">Failed to load mentors</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && mentors.length === 0 && (
          <div className="text-center py-20 bg-surface rounded-2xl border border-border p-8">
            <div className="w-16 h-16 rounded-2xl bg-accent/15 text-accent flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-text">No mentors matched your filters</h3>
            <p className="text-text-secondary text-sm mt-1 max-w-md mx-auto">
              Try adjusting your focus area or availability toggle to see more peer mentors.
            </p>
          </div>
        )}

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => {
            const isSelf = user?.id === mentor.userId;
            const explanation = mentor.matchExplanation;

            return (
              <Card
                key={mentor.id}
                glow
                className="flex flex-col justify-between p-6 border border-border"
              >
                <div>
                  {/* Top Profile Header */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 overflow-hidden flex items-center justify-center font-bold text-primary text-xl shrink-0">
                      {mentor.user.profile?.avatarUrl ? (
                        <img
                          src={mentor.user.profile.avatarUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        mentor.user.profile?.fullName?.slice(0, 1) || 'M'
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-bold text-base text-text truncate">
                          {mentor.user.profile?.fullName || 'FCI Student'}
                        </h3>
                        <Badge
                          variant={mentor.availableCapacity > 0 ? 'success' : 'neutral'}
                          size="sm"
                        >
                          {mentor.availableCapacity > 0
                            ? `${mentor.availableCapacity} spots`
                            : 'Full'}
                        </Badge>
                      </div>
                      <p className="text-xs text-accent font-medium truncate">{mentor.headline}</p>
                      <p className="text-[11px] text-text-muted">
                        {mentor.user.profile?.department || 'Computing & Informatics'} • {mentor.user.profile?.level || '400L'}
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-text-secondary mt-3 line-clamp-2 leading-relaxed">
                    {mentor.bio}
                  </p>

                  {/* Focus Areas Chips */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {mentor.areas.slice(0, 4).map((area) => (
                      <span
                        key={area}
                        className="px-2 py-0.5 rounded-lg bg-surface-raised border border-border text-[11px] font-medium text-text-secondary"
                      >
                        {area}
                      </span>
                    ))}
                    {mentor.areas.length > 4 && (
                      <span className="px-2 py-0.5 rounded-lg bg-surface-raised text-[11px] font-medium text-text-muted">
                        +{mentor.areas.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Transparent Match Reason Card */}
                  {explanation && explanation.reasons.length > 0 && (
                    <div className="mt-3.5 p-2.5 rounded-xl bg-accent/10 border border-accent/20 text-[11px]">
                      <div className="flex items-center gap-1.5 font-bold text-accent mb-1">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Why this mentor?</span>
                      </div>
                      <ul className="space-y-0.5 text-text-secondary">
                        {explanation.reasons.slice(0, 2).map((reason, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-accent" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Meta Details */}
                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-text-muted" />
                      {mentor.availability}
                    </span>
                    <Badge variant="outline" size="sm">
                      {mentor.sessionFormat}
                    </Badge>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-text-muted">
                    {mentor.activeMenteeCount} active mentees
                  </span>

                  {isAuthenticated && !isSelf && (
                    <Button
                      variant={mentor.availableCapacity > 0 ? 'accent' : 'outline'}
                      size="sm"
                      glow={mentor.availableCapacity > 0}
                      rightIcon={mentor.availableCapacity > 0 ? <ArrowRight className="w-3.5 h-3.5" /> : undefined}
                      disabled={mentor.availableCapacity <= 0}
                      onClick={() => setRequestModalMentor(mentor)}
                    >
                      Request Mentorship
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── Request Mentorship Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {requestModalMentor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface w-full max-w-lg rounded-2xl border border-border p-6 shadow-2xl relative"
            >
              <h3 className="font-bold text-lg text-text mb-1">Request Mentorship</h3>
              <p className="text-xs text-text-secondary mb-4">
                Sending request to <span className="font-semibold text-text">{requestModalMentor.user.profile?.fullName}</span>
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!mentorshipGoal.trim()) {
                    toast.error('Please specify your learning goal');
                    return;
                  }
                  requestMutation.mutate();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Your Learning Goal or Target *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={mentorshipGoal}
                    onChange={(e) => setMentorshipGoal(e.target.value)}
                    placeholder="e.g. Master Python automation for network packet analysis and build a functional port scanner."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent resize-none"
                  />
                  <p className="text-[11px] text-text-muted mt-1">
                    A specific, clear goal helps your mentor review and plan your learning path effectively.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setRequestModalMentor(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="accent"
                    isLoading={requestMutation.isPending}
                  >
                    Send Request
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Mentor Profile Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {profileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface w-full max-w-lg rounded-2xl border border-border p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <h3 className="font-bold text-lg text-text mb-4">
                {myProfile ? 'Edit Mentor Profile' : 'Opt In as FCI Peer Mentor'}
              </h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!profileForm.headline.trim() || !profileForm.bio.trim()) {
                    toast.error('Please fill in your headline and bio');
                    return;
                  }
                  saveProfileMutation.mutate();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.headline}
                    onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                    placeholder="e.g. Senior Cybersecurity Researcher & Python Dev"
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Bio *</label>
                  <textarea
                    rows={3}
                    required
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Describe your background, achievements, and mentoring style..."
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Mentoring Focus Areas (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-surface-raised rounded-xl border border-border">
                    {MENTOR_AREAS.map((area) => {
                      const isSelected = profileForm.areas.includes(area);
                      return (
                        <label
                          key={area}
                          className="flex items-center gap-2 text-xs text-text cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setProfileForm({
                                  ...profileForm,
                                  areas: [...profileForm.areas, area],
                                });
                              } else {
                                setProfileForm({
                                  ...profileForm,
                                  areas: profileForm.areas.filter((a) => a !== area),
                                });
                              }
                            }}
                            className="rounded border-border text-accent focus:ring-accent"
                          />
                          <span>{area}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">
                      Availability *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.availability}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, availability: e.target.value })
                      }
                      placeholder="e.g. Saturdays 4-6 PM"
                      className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">
                      Max Mentees
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={profileForm.maxMentees}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          maxMentees: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Preferred Session Format
                  </label>
                  <select
                    value={profileForm.sessionFormat}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        sessionFormat: e.target.value as MentorshipSessionFormat,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-sm text-text focus:outline-none focus:border-accent"
                  >
                    <option value="MIXED">MIXED — Online Chat, Video, and In-Person</option>
                    <option value="CHAT">CHAT — Async text chat & code reviews</option>
                    <option value="VIDEO">VIDEO — Scheduled video sessions</option>
                    <option value="IN_PERSON">IN_PERSON — On-campus physical meetups</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={profileForm.isAvailable}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, isAvailable: e.target.checked })
                    }
                    className="rounded border-border text-accent focus:ring-accent"
                  />
                  <label htmlFor="isAvailable" className="text-xs font-semibold text-text">
                    I am currently accepting new mentees
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setProfileModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="accent"
                    isLoading={saveProfileMutation.isPending}
                  >
                    Save Profile
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
export default MentorDiscoveryPage;
