import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  User,
  GraduationCap,
  Sparkles,
  Github,
  Linkedin,
  Globe,
  Edit,
  Code2,
  Trophy,
  Rocket,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useAuthStore } from '@/store/authStore';
import { MOCK_STUDENTS, MOCK_PROJECTS } from '@/data/mockData';
import { DEPARTMENT_LABELS } from '@/types';
import { SkillsSection } from '@/components/skills/SkillsSection';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const requestedUserId = searchParams.get('userId');

  // If viewing another user via query param or logged in user
  const isOwner = !requestedUserId || (user && user.id === requestedUserId);
  const targetUserId = requestedUserId || user?.id || 'user-seeded-aisha';

  const student = MOCK_STUDENTS[1]; // Fallback template for bio & avatar
  const displayName = user && isOwner ? user.profile?.fullName || student.fullName : student.fullName;
  const username = user && isOwner ? user.profile?.username || student.username : student.username;
  const department = (user?.profile?.department as any) || student.department;
  const level = user?.profile?.level || student.level;
  const points = user?.profile?.communityPoints ?? student.communityPoints;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-primary shrink-0 border-2 border-accent shadow-md">
            <img
              src={user?.profile?.avatarUrl || student.avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-primary dark:text-white">
                  {displayName}
                </h1>
                <p className="text-xs sm:text-sm text-text-muted font-mono">@{username}</p>
              </div>

              {isOwner && (
                <Link to="/settings">
                  <Button variant="outline" size="sm" leftIcon={<Edit className="w-4 h-4" />}>
                    Edit Profile
                  </Button>
                </Link>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-text-secondary pt-1">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4 text-accent" />
                {level} Level • {DEPARTMENT_LABELS[department as keyof typeof DEPARTMENT_LABELS] || department}
              </span>
              <span>•</span>
              <Badge variant="accent" size="sm">
                <Sparkles className="w-3 h-3" />
                {points} Community Points
              </Badge>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed pt-2">
              {student.bio}
            </p>
          </div>
        </div>
      </Card>

      {/* ── Skills & Expertise (Live Database-Backed Skill Graph) ──── */}
      <Card className="p-6 sm:p-8">
        <SkillsSection
          userId={targetUserId}
          isOwner={Boolean(isOwner && user)}
          studentName={displayName}
        />
      </Card>

      {/* ── Verified Achievements & Honors ── */}
      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Trophy className="w-4 h-4" />
            </div>
            <h2 className="font-display font-bold text-xl text-primary dark:text-white">
              Verified Achievements &amp; Reputation
            </h2>
          </div>
          <Link
            to={isOwner ? "/achievements" : `/profile/${username}/achievements`}
            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
          >
            <span>View All &amp; Submit Proof</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-surface-raised border border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-text">Profile Completed</div>
              <div className="text-[10px] text-accent font-mono">+100 pts · Verified</div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-surface-raised border border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-text">First Project</div>
              <div className="text-[10px] text-accent font-mono">+150 pts · Verified</div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-surface-raised border border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-text">Skill Graph Master</div>
              <div className="text-[10px] text-accent font-mono">+150 pts · Verified</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Projects by user */}
      <div className="space-y-4">
        <h2 className="font-display font-bold text-xl text-primary dark:text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-accent" />
          Projects by {displayName.split(' ')[0]}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_PROJECTS.slice(1, 3).map((proj) => (
            <Card key={proj.id} hoverable className="p-5 space-y-3">
              <Badge variant="accent" size="sm">
                {proj.category}
              </Badge>
              <Link to={`/projects/${proj.slug}`}>
                <h3 className="font-bold text-base text-text hover:text-accent transition-colors">
                  {proj.title}
                </h3>
              </Link>
              <p className="text-xs text-text-secondary line-clamp-2">{proj.description}</p>
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <span>{proj.likesCount} likes</span>
                <span className="font-mono text-accent">View project →</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
